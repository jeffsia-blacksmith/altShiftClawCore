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

  // 取工作流 inputs（从 yaml 文件解析；R9 minimal：假设无 inputs）
  // R9 minimal：无 AI 推导，直接用空 inputs
  const workflowInputs = []; // 完整版需解析 yaml workflow_dispatch inputs
  const inputs = {};
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