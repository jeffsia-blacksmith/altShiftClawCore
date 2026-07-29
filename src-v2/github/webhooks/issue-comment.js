// github/webhooks/issue-comment.js — issue_comment.created / edited
// 行为对齐旧 bundle issue_comment.created handler（L19963-19988）+ pu relay（L19031）。
// R5 阶段：实现 relay（body-only 发到 issue body telegram-meta 的 chat_id）+ dispatch gate。
// dispatch (fu → actions.createWorkflowDispatch) 在 R5 做最小占位（人类 sender 触发），R7 完善。

import { t, glang } from "../../i18n/index.js";
import { parseTelegramMeta, stripTelegramMeta } from "./meta.js";
import { escapeMarkdownV2 } from "../../telegram/markdown.js";
import { dispatchCodingAgent } from "../../coding-agent/dispatch.js";

// Zk — relay skip conditions（对齐旧 bundle L18804-18833）
function shouldSkipRelay(payload) {
  const body = payload.comment?.body ?? "";
  // 1. comment 有自己的 telegram-meta → bot echo，跳过
  if (/<!--\s*telegram-meta:/.test(body)) return true;
  // 2. comment 有 line-meta source → LINE bot 评论，跳过
  if (/<!--\s*line-meta:/.test(body)) return true;
  // 3. comment 有 schedule-flow source → 排程流评论，跳过
  if (/<!--\s*telegram-meta:.*"source"\s*:\s*"schedule-flow"/.test(body)) return true;
  // 4. issue body 无 telegram-meta → 无法 relay，跳过
  const issueBody = payload.issue?.body ?? "";
  if (!/<!--\s*telegram-meta:/.test(issueBody)) return true;
  return false;
}

// relay：把 comment body（body-only，MarkdownV2 转义）发到 issue body 的 telegram-meta chat_id
// 完整版：检测图片引用 → sendPhoto + caption；否则 sendMessage
async function relayCommentToTelegram(payload, env) {
  const issue = payload.issue;
  const comment = payload.comment;
  if (!issue || !comment) return;
  // skip conditions（对齐 Zk）
  if (shouldSkipRelay(payload)) {
    console.log("[relay] skip: comment has own meta / line / schedule / no issue meta");
    return;
  }
  const meta = parseTelegramMeta(issue.body);
  if (!meta || !meta.chat_id) {
    console.error("[relay] no telegram-meta chat_id in issue body, skip");
    return;
  }
  let bodyOnly = stripTelegramMeta(comment.body || "").trim() || t("core.blank", {}, glang());
  // 检测图片引用（markdown ![alt](url) 或 artifact 图片路径）
  const imageMatch = bodyOnly.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  const maxLen = env.config.telegram.maxMessageLength ?? 4096;
  bodyOnly = bodyOnly.slice(0, maxLen);
  const text = escapeMarkdownV2(bodyOnly);
  const { Bot } = await import("grammy");
  const bot = new Bot(env.config.telegram.botToken, {
    client: { apiRoot: env.config.telegram.apiBaseUrl ?? "https://api.telegram.org" },
  });
  if (imageMatch && imageMatch[2]) {
    // 有图片 → sendPhoto with caption
    try {
      await bot.api.sendPhoto(meta.chat_id, imageMatch[2], { caption: text, parse_mode: "MarkdownV2" });
      return;
    } catch (e) {
      console.error("[relay] sendPhoto failed, fallback to sendMessage:", e.message);
    }
  }
  // 纯文本 → sendMessage
  await bot.api.sendMessage(meta.chat_id, text, { parse_mode: "MarkdownV2" });
}

// isBot: GitHub sender.type === "Bot"
// isScheduledTriggerBot: Bot 且 comment body 含 githubclaw-brain-result meta source=scheduled-trigger（R5 简化：仅查 source 字段）
function isScheduledTriggerBot(payload) {
  if (payload.sender?.type !== "Bot") return false;
  const m = payload.comment?.body?.match(/<!--\s*githubclaw-brain-result:\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) return false;
  try {
    return JSON.parse(m[1]).source === "scheduled-trigger";
  } catch {
    return false;
  }
}

// isMediaPending: comment body 含 githubclaw-media-meta stage=pending
function isMediaPending(payload) {
  const m = payload.comment?.body?.match(/<!--\s*githubclaw-media-meta:\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) return false;
  try {
    return JSON.parse(m[1]).stage === "pending";
  } catch {
    return false;
  }
}

export function registerIssueCommentHandlers(webhooks, env) {
  webhooks.on("issue_comment.created", async ({ payload }) => {
    const isBot = payload.sender?.type === "Bot";
    const isSchedBot = isScheduledTriggerBot(payload);
    const pending = isMediaPending(payload);
    const relayP = relayCommentToTelegram(payload, env).catch((e) => {
      console.error("[webhook] relay to Telegram failed:", e);
      throw e;
    });
    if (pending) {
      await relayP;
      return;
    }
    if (isBot && !isSchedBot) {
      await relayP;
      return;
    }
    // 人类 / scheduled-trigger Bot → relay + dispatch
    const dispatchP = dispatchCodingAgent(payload, env).catch((e) => {
      console.error("[webhook] dispatch to coding agent failed:", e);
    });
    await Promise.allSettled([relayP, dispatchP]);
  });

  webhooks.on("issue_comment.edited", async ({ payload }) => {
    // R5：relay + dispatch gate（ag 等价判断在 dispatchCodingAgent 内部）
    const relayP = relayCommentToTelegram(payload, env).catch((e) => {
      console.error("[webhook] relay edited to Telegram failed:", e);
    });
    const dispatchP = dispatchCodingAgent(payload, env).catch((e) => {
      console.error("[webhook] dispatch edited to coding agent failed:", e);
    });
    await Promise.allSettled([relayP, dispatchP]);
  });
}