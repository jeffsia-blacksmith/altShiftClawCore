// github/webhooks/issue_comment.js — issue_comment.created / edited
// relay by telegram/relay.js (per-comment KV, artifact download, parse-fallback, keyboard).
// dispatch (fu -> actions.createWorkflowDispatch) by coding-agent/dispatch.js.

import { logInfo, logWarn, logError } from "../../i18n/log.js";
import { parseMetaComment } from "./meta.js";
import { relayComment, hasSystemMeta, isMediaStage, isPendingToFinalized } from "../../telegram/relay.js";
import { dispatchCodingAgent } from "../../coding-agent/dispatch.js";

// isScheduledTriggerBot: Bot and comment body telegram-meta source=scheduled-trigger
function isScheduledTriggerBot(payload) {
  if (payload.sender?.type !== "Bot") return false;
  const meta = parseMetaComment(payload.comment?.body ?? "");
  if (!meta) return false;
  return meta.source === "scheduled-trigger";
}

// isMediaPending: comment body contains githubclaw-media-meta stage=pending
function isMediaPending(payload) {
  return isMediaStage(payload.comment?.body ?? "", "pending");
}

export function registerIssueCommentHandlers(webhooks, env) {
  webhooks.on("issue_comment.created", async ({ payload }) => {
    const isBot = payload.sender?.type === "Bot";
    const isSchedBot = isScheduledTriggerBot(payload);
    const pending = isMediaPending(payload);

    // Scheduled-trigger comments are prompts FOR the lobster — they should not
    // be relayed to the Telegram chat. Only dispatch the coding agent.
    if (isSchedBot) {
      await dispatchCodingAgent(payload, env).catch((e) => {
        logError("log.webhook.dispatchToCodingAgentFailed", { error: e?.message ?? String(e) });
      });
      return;
    }

    const relayP = relayComment(payload, env).catch((e) => {
      logError("log.webhook.relayToTelegramFailed", { error: e?.message ?? String(e) });
      throw e;
    });
    if (pending) {
      await relayP;
      return;
    }
    if (isBot) {
      await relayP;
      return;
    }
    const dispatchP = dispatchCodingAgent(payload, env).catch((e) => {
      logError("log.webhook.dispatchToCodingAgentFailed", { error: e?.message ?? String(e) });
    });
    await Promise.allSettled([relayP, dispatchP]);
  });

  webhooks.on("issue_comment.edited", async ({ payload }) => {
    const relayP = relayComment(payload, env).catch((e) => {
      logError("log.webhook.relayEditedToTelegramFailed", { error: e?.message ?? String(e) });
    });
    const dispatchP = dispatchCodingAgent(payload, env).catch((e) => {
      logError("log.webhook.dispatchEditedToCodingAgentFailed", { error: e?.message ?? String(e) });
    });
    await Promise.allSettled([relayP, dispatchP]);
  });
}
