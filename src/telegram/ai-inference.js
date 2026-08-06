// telegram/ai-inference.js — 自然语言工作流派工（RT 路径，Workers AI 推导 inputs）
// 行为对齐旧 bundle RT（L13284-13368）+ Zp（L12504-12547）+ nl/em（L12552-12574）。
// 当 message:text 以 / 开头但不是已知命令时，RT 尝试匹配工作流别名。

import { t, glang } from "../i18n/index.js";
import { logError, logWarn } from "../i18n/log.js";

// slugify 工作流文件名（对齐旧 bundle Gn L12973-12975: [A-Za-z][A-Za-z0-9_-]* → normalize -/_ to _）
function slugify(name) {
  const base = name.replace(/\.ya?ml$/, "");
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(base)) return base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return base.toLowerCase().replace(/[-_]+/g, "_");
}
function workflowFileSlug(path) {
  const base = path.split("/").pop().replace(/\.ya?ml$/, "");
  return slugify(base);
}
function workflowNameSlug(name) {
  return slugify(name);
}

// nl — 成功回复
function escapeMdV2(s) { return String(s).replace(/([_*\[\]()~`>#+=|{}.!\\-])/g, "\\$1"); }
function buildTriggeredReply(workflowName, inputs, lang) {
  const lines = [t("core.workflowTriggered", { name: workflowName }, lang), ""];
  const nonEmpty = Object.entries(inputs).filter(([, v]) => v !== "" && v != null);
  if (nonEmpty.length === 0) {
    lines.push(t("core.workflowNoInputs", {}, lang));
  } else {
    for (const [k, v] of nonEmpty) {
      const isSecret = /(^|[_-])(secret|token|password|passphrase|api[_-]?key|access[_-]?key|private[_-]?key)([_-]|$)/i.test(k);
      lines.push(`\\- ${escapeMdV2(k)}: ${isSecret ? "[REDACTED]" : escapeMdV2(String(v))}`);
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
  for (const m of missing) lines.push(`\\- ${escapeMdV2(m)}`);
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
  const match = workflows.find((w) => workflowFileSlug(w.path) === slug || workflowNameSlug(w.name) === slug);
  if (!match) return false;

  // 取工作流 inputs（从 yaml 文件解析；R9 完整：用 Workers AI 推导）
  let workflowInputs = [];
  let workflowSource = "";
  try {
    const { data: wfFile } = await octokit.rest.repos.getContent({ owner, repo, path: match.path, ref: defaultBranch });
    if (wfFile.content) workflowSource = Buffer.from(wfFile.content, "base64").toString("utf8");
  } catch {}
  // 从 yaml 解析 workflow_dispatch inputs（indent-aware parser，对齐旧 bundle Um L12977-13038）
  const inputsMatch = workflowSource.match(/workflow_dispatch\s*:\s*\n/);
  if (inputsMatch) {
    const afterDispatch = workflowSource.slice(inputsMatch.index + inputsMatch[0].length);
    // 收集同缩进级别的 inputs: 块
    const lines = afterDispatch.split("\n");
    let inputBlockLines = [];
    let inInputs = false;
    let inputIndent = -1;
    for (const line of lines) {
      if (line.trim() === "") { if (inInputs) break; continue; }
      const indent = line.match(/^(\s*)/)[1].length;
      if (!inInputs) {
        // 寻找 inputs: 行
        if (/^\s*inputs\s*:/.test(line)) {
          inInputs = true;
          inputIndent = indent;
        }
        // 如果遇到同级非 inputs 键，停止
        if (indent === 0 || (indent <= (workflowSource.match(/^(\s*)on/m)?.[1].length ?? 0) && !/^\s*inputs/.test(line) && !/^\s*$/.test(line))) break;
      } else {
        // 在 inputs 块内
        if (indent <= inputIndent && line.trim() !== "") break;
        inputBlockLines.push(line);
      }
    }
    // 解析每个 input key
    let currentInput = null;
    for (const line of inputBlockLines) {
      const inputKeyMatch = line.match(/^(\s+)(\w+)\s*:\s*\n?$/);
      if (inputKeyMatch) {
        if (currentInput) workflowInputs.push(currentInput);
        currentInput = { name: inputKeyMatch[2], description: "", required: false, defaultValue: null, type: "string" };
      } else if (currentInput) {
        const fieldMatch = line.match(/^\s+(\w+)\s*:\s*(.*)$/);
        if (fieldMatch) {
          const [, key, val] = fieldMatch;
          const v = val.trim().replace(/^["']|["']$/g, "");
          if (key === "description") currentInput.description = v;
          else if (key === "required") currentInput.required = v === "true";
          else if (key === "default") currentInput.defaultValue = v || null;
          else if (key === "type") currentInput.type = v;
        }
      }
    }
    if (currentInput) workflowInputs.push(currentInput);
  }

  // AI 推导 inputs（如果 AI binding 可用）
  const ai = ctx.services?.ai;
  let inputs = {};
  if (ai && workflowInputs.length > 0 && argsText?.trim()) {
    try {
      const systemPrompt = t("aiPrompt.parser.systemPrompt", {}, lang);
      const userPrompt = buildUserPrompt(match.name, match.path, workflowInputs, workflowSource, argsText, lang);
      const model = config.workflowInputInference?.model ?? "@cf/openai/gpt-oss-20b";
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
      else if (resp?.text) aiText = resp.text;
      else if (resp?.output_text) aiText = resp.output_text;
      else if (resp?.choices?.[0]?.message?.content) aiText = resp.choices[0].message.content;
      const cleaned = aiText.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      // 提取 JSON 对象（balanced braces）
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");
      const jsonStr = jsonStart >= 0 && jsonEnd > jsonStart ? cleaned.slice(jsonStart, jsonEnd + 1) : cleaned;
      const parsed = JSON.parse(jsonStr);
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
  const requestId = crypto.randomUUID();
  try {
    await octokit.rest.actions.createWorkflowDispatch({
      owner, repo, workflow_id: match.path.split("/").pop(), ref: defaultBranch, inputs: { ...inputs, request_id: requestId },
    });
    const sent = await ctx.reply(buildTriggeredReply(match.name, inputs, lang), { parse_mode: "MarkdownV2" });
    // 记录 workflow notification，让 workflow_run.completed webhook 能把本条消息编辑成完成通知
    try {
      const { createWorkflowNotification } = await import("../github/webhooks/workflow-run.js");
      const { d1 } = ctx.services;
      await createWorkflowNotification(d1, {
        requestId,
        repo: config.github.repoFullName,
        workflowName: match.name,
        workflowPath: match.path,
        title: sent?.text ?? "",
        channel: "telegram",
        chatId: chatId != null ? String(chatId) : null,
        messageId: sent?.message_id != null ? String(sent.message_id) : null,
        sourceId: null,
        sourceType: null,
        payloadJson: JSON.stringify({}),
      });
    } catch (e) { logWarn("log.webhook.handleFailed", { error: e?.message ?? String(e) }); }
  } catch (e) {
    // error 文本不在 inline code 内，须转义 MarkdownV2 特殊字符（对齐旧 bundle Al: O(err)）
    const errMsg = e?.message ?? t("core.unknownError", {}, lang);
    await ctx.reply(t("core.triggerWorkflowFailed", { name: match.name, error: escapeMdV2(errMsg) }, lang), { parse_mode: "MarkdownV2" });
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