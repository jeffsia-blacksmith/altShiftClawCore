// telegram/comment-on-issue.js — message:text 默认路径（无 flow 时把文本当 issue comment 转送）
// 行为对齐旧 bundle su L17835-17897 + Vs（L16570-16573）+ Xl/kk/Ek。
// R9 完整版：建 issue comment（含 telegram-meta footer）+ 派工 coding-agent 由 GitHub webhook 触发。

import { t, glang } from "../i18n/index.js";
import { getActiveIssue } from "../db/kv-state.js";
import { getFlowState, clearFlowState } from "./flows/state.js";
import { getSchedState } from "./flows/schedule-flow.js";
import { getLlmState } from "./flows/llm/state.js";
import { getSkillState } from "./flows/skills-callbacks.js";
import { getTplState } from "./flows/templates-callbacks.js";
import { getLineState } from "./flows/line-bot.js";

// Xl — telegram-meta header
function buildTelegramMeta(ctx) {
  const meta = {
    chat_id: ctx.chat?.id ?? null,
    msg_id: ctx.message?.message_id ?? null,
    user_id: ctx.from?.id ?? null,
    username: ctx.from?.username ?? null,
    chat_type: ctx.chat?.type ?? null,
    ts: ctx.message?.date ? new Date(ctx.message.date * 1000).toISOString() : new Date().toISOString(),
  };
  return `<!-- telegram-meta: ${JSON.stringify(meta)} -->`;
}

// kk — core.messageFromSource
function senderName(ctx, lang) {
  const first = ctx.from?.first_name ?? "";
  const last = ctx.from?.last_name ?? "";
  const username = ctx.from?.username;
  const name = `${first} ${last}`.trim();
  if (username) return `${name} (@${username})`;
  if (name) return name;
  if (username) return `@${username}`;
  return t("core.unknownSender", {}, lang);
}
function chatName(ctx, lang) {
  return ctx.chat?.title ?? ctx.chat?.username ?? ctx.chat?.type ?? `chat-${ctx.chat?.id ?? ""}`;
}

// Vs — comment body builder
function buildCommentBody(ctx, content, lang) {
  const header = buildTelegramMeta(ctx);
  const fromLine = t("core.messageFromSource", { sender: senderName(ctx, lang), chat: chatName(ctx, lang) }, lang);
  const body = content.trim() || t("core.noContentProvided", {}, lang);
  return [header, "", fromLine, "", "---", "", body].join("\n");
}

// handleCommentOnIssue — 默认 message:text 路径
export async function handleCommentOnIssue(ctx) {
  const { octokit, store, config } = ctx.services;
  const { owner, repo } = config.github;
  const chatId = ctx.chat?.id;
  if (!chatId) return false;
  const text = ctx.message?.text;
  if (!text || text.startsWith("/")) return false;
  const lang = ctx.language ?? glang();

  // 检查所有 flow 状态是否占用此文本
  if (await getFlowState(store, chatId)) return false;
  if (await getSchedState(store, chatId)) return false;
  if (await getLlmState(store, chatId)) return false;
  if (await getSkillState(store, chatId)) return false;
  if (await getTplState(store, chatId)) return false;
  if (await getLineState(store, chatId)) return false;

  const active = await getActiveIssue(store, chatId);
  if (!active) {
    await ctx.reply(t("system.no_active_issue", {}, lang));
    return true;
  }

  // 检查 workflow dispatch 状态
  let branchExists = false, workflowExists = false, workflowEnabled = false;
  try {
    await octokit.rest.git.getRef({ owner, repo, ref: `heads/issue-${active}` });
    branchExists = true;
  } catch {}
  if (branchExists) {
    try {
      const { data: wfList } = await octokit.rest.actions.listRepoWorkflows({ owner, repo });
      const wf = wfList.workflows.find((w) => w.path === `.github/workflows/issue-${active}.yml`);
      if (wf) { workflowExists = true; workflowEnabled = wf.state !== "disabled_manually"; }
    } catch {}
  }
  const acceptsDispatch = branchExists && workflowExists && workflowEnabled;

  // 先回复 processing
  let processingMsg = null;
  if (acceptsDispatch) {
    try { processingMsg = await ctx.reply(t("system.processing", {}, lang)); } catch {}
  }

  // !acceptsDispatch → 仍然建 issue comment（对齐旧 bundle su L17853: ALWAYS create comment）
  // 但不写 artifacts/jsonl；回复 resting/noTaskMessage
  if (!acceptsDispatch) {
    const body = buildCommentBody(ctx, text, lang);
    try {
      await octokit.rest.issues.createComment({ owner, repo, issue_number: active, body });
    } catch (e) { console.error("[comment-on-issue] createComment (no-dispatch) failed:", e); }
    const { buildRestingReply, buildMissingSetupReply } = await import("./edge-replies.js");
    if (!branchExists || !workflowExists) {
      await ctx.reply(buildMissingSetupReply(lang));
    } else {
      await ctx.reply(buildRestingReply("", lang));
    }
    return true;
  }

  // 建 issue comment
  const body = buildCommentBody(ctx, text, lang);
  try {
    const { data: comment } = await octokit.rest.issues.createComment({ owner, repo, issue_number: active, body });
    // 写 user.md artifact（Zr）
    const branch = `issue-${active}`;
    const artifactPath = `artifacts/${comment.id}/user.md`;
    const artifactContent = `${text.trim() || "(empty)"}\n`;
    let artifactSha;
    try {
      const { data: existing } = await octokit.rest.repos.getContent({ owner, repo, path: artifactPath, ref: branch });
      artifactSha = existing.sha;
    } catch {}
    await octokit.rest.repos.createOrUpdateFileContents({
      owner, repo, path: artifactPath,
      message: `chore: update issue #${active} comment #${comment.id} user artifact`,
      content: Buffer.from(artifactContent).toString("base64"), branch,
      ...(artifactSha ? { sha: artifactSha } : {}),
    });
    // 写 issue.jsonl（xn）
    const jsonlPath = "issue.jsonl";
    let jsonlSha, jsonlContent = "";
    try {
      const { data: existing } = await octokit.rest.repos.getContent({ owner, repo, path: jsonlPath, ref: branch });
      if (existing.content) jsonlContent = Buffer.from(existing.content, "base64").toString("utf8");
      jsonlSha = existing.sha;
    } catch {}
    const entry = {
      role: "user",
      source: t("system.source_name", {}, lang),
      issue_number: active,
      comment_id: comment.id,
      github_comment_url: comment.html_url ?? null,
      telegram: {
        chat_id: ctx.chat?.id ?? null,
        message_id: ctx.message?.message_id ?? null,
        user_id: ctx.from?.id ?? null,
        username: ctx.from?.username ?? null,
      },
      content: text,
      created_at: new Date().toISOString(),
    };
    const newLine = JSON.stringify(entry) + "\n";
    const stripped = jsonlContent.replace(/\r?\n*$/g, "");
    const newContent = stripped === "" ? newLine : `${stripped}\n${newLine}`;
    await octokit.rest.repos.createOrUpdateFileContents({
      owner, repo, path: jsonlPath,
      message: `chore: update issue #${active} conversation log`,
      content: Buffer.from(newContent).toString("base64"), branch,
      ...(jsonlSha ? { sha: jsonlSha } : {}),
    });
    await ctx.reply(t("system.messageReceived", {}, lang));
  } catch (e) {
    console.error("[comment-on-issue] createComment/artifact failed:", e);
    await ctx.reply(t("core.unknownError", {}, lang));
  }
  return true;
}