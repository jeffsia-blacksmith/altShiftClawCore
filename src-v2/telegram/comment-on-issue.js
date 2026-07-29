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

  // 建 issue comment
  const body = buildCommentBody(ctx, text, lang);
  try {
    await octokit.rest.issues.createComment({ owner, repo, issue_number: active, body });
    await ctx.reply(t("system.messageReceived", {}, lang));
  } catch (e) {
    console.error("[comment-on-issue] createComment failed:", e);
    await ctx.reply(t("core.unknownError", {}, lang));
  }
  return true;
}