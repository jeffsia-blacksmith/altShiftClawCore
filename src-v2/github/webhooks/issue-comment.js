// github/webhooks/issue-comment.js — issue_comment.created / edited
// 行为对齐旧 bundle issue_comment.created handler（L19963-19988）+ pu relay（L19031）。
// R5 阶段：实现 relay（body-only 发到 issue body telegram-meta 的 chat_id）+ dispatch gate。
// dispatch (fu → actions.createWorkflowDispatch) 在 R5 做最小占位（人类 sender 触发），R7 完善。

import { t, glang } from "../../i18n/index.js";
import { parseTelegramMeta, stripTelegramMeta } from "./meta.js";
import { escapeMarkdownV2 } from "../../telegram/markdown.js";
import { dispatchCodingAgent } from "../../coding-agent/dispatch.js";

// relay：把 comment body（body-only，MarkdownV2 转义）发到 issue body 的 telegram-meta chat_id
async function relayCommentToTelegram(payload, env) {
  const issue = payload.issue;
  const comment = payload.comment;
  if (!issue || !comment) return;
  const meta = parseTelegramMeta(issue.body);
  if (!meta || !meta.chat_id) {
    console.error("[relay] no telegram-meta chat_id in issue body, skip");
    return;
  }
  const bodyOnly = stripTelegramMeta(comment.body || "").trim() || t("core.blank", {}, glang());
  // 旧 bundle pu 用 body-only（relayBodyOnly=true），截断到 maxMessageLength
  const maxLen = env.config.telegram.maxMessageLength ?? 4096;
  const text = escapeMarkdownV2(bodyOnly.slice(0, maxLen));
  // 用 grammY Api 直接发；botToken + apiRoot 来自 config
  const { Bot } = await import("grammy");
  const bot = new Bot(env.config.telegram.botToken, {
    client: { apiRoot: env.config.telegram.apiBaseUrl ?? "https://api.telegram.org" },
  });
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