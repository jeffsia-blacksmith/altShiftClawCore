// github/webhooks/index.js — 装配所有 GitHub webhook event handlers
// 行为对齐旧 bundle Og（L19960-20045）的 .on() 注册集合。

import { registerIssueCommentHandlers } from "./issue-comment.js";
import { registerInstallationHandlers } from "./installation.js";
import { registerWorkflowRunHandlers } from "./workflow-run.js";

export function registerAllWebhookHandlers(webhooks, env) {
  // issues.opened — 对齐 L20012-20014（仅日志）
  webhooks.on("issues.opened", async ({ payload }) => {
    console.log(`Issue #${payload.issue?.number} opened — branch creation is handled by /new flow`);
  });
  registerIssueCommentHandlers(webhooks, env);
  registerInstallationHandlers(webhooks, env);
  registerWorkflowRunHandlers(webhooks, env);
}