// telegram/ai-inference.js — 自然语言工作流派工（RT 路径，Workers AI 推导 inputs）
// 行为对齐旧 bundle RT（L13284-13368）+ Zp（L12504-12547）+ nl/em（L12552-12574）。
// 当 message:text 以 / 开头但不是已知命令时，RT 尝试匹配工作流别名。

import { t, glang } from "../i18n/index.js";

// slugify 工作流文件名
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function workflowFileSlug(path) {
  const base = path.split("/").pop().replace(/\.ya?ml$/, "");
  return slugify(base);
}

// nl — 成功回复
function buildTriggeredReply(workflowName, inputs, lang) {
  const lines = [t("core.workflowTriggered", { name: workflowName }, lang), ""];
  const nonEmpty = Object.entries(inputs).filter(([, v]) => v !== "" && v != null);
  if (nonEmpty.length === 0) {
    lines.push(t("core.workflowNoInputs", {}, lang));
  } else {
    for (const [k, v] of nonEmpty) {
      const isSecret = /(^|[_-])(secret|token|password|key|api_key)/i.test(k);
      lines.push(`\\- ${k}: ${isSecret ? "[REDACTED]" : String(v)}`);
    }
  }
  return lines.join("\n");
}

// em — 缺参回复
function buildMissingReply(workflowName, missing, lang) {
  const lines = [
    t("core.workflowCannotTrigger", { name: workflowName }, lang),
    "",
    t("core.workflowMissingRequiredInputs", {}, lang),
  ];
  for (const m of missing) lines.push(`\\- ${m}`);
  lines.push("", t("core.workflowProvideInputsPrompt", {}, lang));
  return lines.join("\n");
}

// handleNaturalLanguageCommand — RT 等价
export async function handleNaturalLanguageCommand(ctx, commandName, argsText) {
  const { octokit, store, config } = ctx.services;
  const { owner, repo } = config.github;
  const chatId = ctx.chat?.id;
  if (!chatId) return false;
  const lang = ctx.language ?? glang();

  // 列工作流 + 找别名
  let workflows = [];
  let defaultBranch = "main";
  try {
    const { data } = await octokit.rest.actions.listRepoWorkflows({ owner, repo });
    workflows = data.workflows ?? [];
    const { data: repoInfo } = await octokit.rest.repos.get({ owner, repo });
    defaultBranch = repoInfo.default_branch ?? "main";
  } catch {
    return false;
  }
  const slug = slugify(commandName);
  const match = workflows.find((w) => workflowFileSlug(w.path) === slug);
  if (!match) return false;

  // 取工作流 inputs（从 yaml 文件解析；R9 完整：用 Workers AI 推导）
  let workflowInputs = [];
  let workflowSource = "";
  try {
    const { data: wfFile } = await octokit.rest.repos.getContent({ owner, repo, path: match.path, ref: defaultBranch });
    if (wfFile.content) workflowSource = Buffer.from(wfFile.content, "base64").toString("utf8");
  } catch {}
  // 从 yaml 解析 workflow_dispatch inputs（简化：正则提取）
  const inputsMatch = workflowSource.match(/workflow_dispatch:\s*\n((?:\s+\w+:.*\n?)+)/);
  if (inputsMatch) {
    const inputBlock = inputsMatch[1];
    const inputRegex = /(\w+):\s*\n\s+description:\s*["']?([^"'\n]+)["']?\s*\n(?:\s+required:\s*(true|false)\s*\n)?(?:\s+default:\s*["']?([^"'\n]+)["']?)?/g;
    let m;
    while ((m = inputRegex.exec(inputBlock)) !== null) {
      workflowInputs.push({ name: m[1], description: m[2] || "", required: m[3] === "true", defaultValue: m[4] ?? null });
    }
  }

  // AI 推导 inputs（如果 AI binding 可用）
  const ai = ctx.services?.ai;
  let inputs = {};
  if (ai && workflowInputs.length > 0 && argsText?.trim()) {
    try {
      const systemPrompt = t("aiPrompt.parser.systemPrompt", {}, lang);
      const userPrompt = buildUserPrompt(match.name, match.path, workflowInputs, workflowSource, argsText, lang);
      const model = "meta/llama-4-scout-17b-16e-instruct";
      const resp = await ai.run(model, {
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        response_format: { type: "json_schema", json_schema: buildInputSchema(workflowInputs) },
        max_tokens: 1024,
        temperature: 0,
      });
      let aiText = "";
      if (typeof resp === "string") aiText = resp;
      else if (resp?.result?.response) aiText = resp.result.response;
      else if (resp?.response) aiText = resp.response;
      else if (resp?.choices?.[0]?.message?.content) aiText = resp.choices[0].message.content;
      const parsed = JSON.parse(aiText.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim());
      if (parsed.inputs && typeof parsed.inputs === "object") inputs = parsed.inputs;
    } catch (e) {
      console.error("[AI inference] failed, using defaults:", e.message);
    }
  }
  // 用 defaults 填充未推导的 inputs
  for (const wi of workflowInputs) {
    if (!(wi.name in inputs) && wi.defaultValue != null) inputs[wi.name] = wi.defaultValue;
  }
  const missingRequired = workflowInputs.filter((i) => i.required && !i.defaultValue).map((i) => i.name);

  if (missingRequired.length > 0) {
    await ctx.reply(buildMissingReply(match.name, missingRequired, lang), { parse_mode: "MarkdownV2" });
    return true;
  }

  // 派工
  try {
    await octokit.rest.actions.createWorkflowDispatch({
      owner, repo, workflow_id: match.path.split("/").pop(), ref: defaultBranch, inputs,
    });
    await ctx.reply(buildTriggeredReply(match.name, inputs, lang), { parse_mode: "MarkdownV2" });
  } catch (e) {
    await ctx.reply(t("core.triggerWorkflowFailed", { name: match.name, error: e.message ?? t("core.unknownError", {}, lang) }, lang), { parse_mode: "MarkdownV2" });
  }
  return true;
}

// buildUserPrompt — 对齐 __（L12432-12461）
function buildUserPrompt(workflowName, workflowPath, inputs, source, msg, lang) {
  const inputLines = inputs.length === 0
    ? t("aiPrompt.parser.noInputs", {}, lang)
    : inputs.map((i) => `- ${i.name}\n  - required: ${i.required}\n  - type: ${i.type || "string"}\n  - default: ${i.defaultValue ?? "(none)"}\n  - description: ${i.description || "(none)"}`).join("\n");
  const yamlTrimmed = (source ?? "").slice(0, 12000);
  return [
    `workflow name: ${workflowName}`,
    `workflow file: ${workflowPath.split("/").pop()}`,
    `workflow path: ${workflowPath}`,
    "",
    "workflow inputs:",
    inputLines,
    "",
    "workflow yaml:",
    yamlTrimmed || "(unavailable)",
    "",
    "key=value rule:",
    `- ${t("aiPrompt.parser.rule1", {}, lang)}`,
    `- ${t("aiPrompt.parser.rule2", {}, lang)}`,
    "",
    "user message:",
    msg || "(empty)",
  ].join("\n");
}

// buildInputSchema — 对齐 T_（L12462-12484）
function buildInputSchema(inputs) {
  const properties = {};
  const inputProps = {};
  for (const i of inputs) {
    inputProps[i.name] = { type: i.type === "boolean" ? "boolean" : "string", description: i.description || t("aiPrompt.parser.paramDescription", { name: i.name }, "en") };
  }
  properties.inputs = { type: "object", properties: inputProps, additionalProperties: false, description: t("aiPrompt.parser.inputsDescription", {}, "en") };
  properties.missingRequired = { type: "array", items: { type: "string", enum: inputs.map((i) => i.name) }, description: t("aiPrompt.parser.missingRequiredDescription", {}, "en") };
  return {
    name: "workflow_inputs",
    schema: { type: "object", properties, required: ["inputs", "missingRequired"], additionalProperties: false },
    strict: true,
  };
}