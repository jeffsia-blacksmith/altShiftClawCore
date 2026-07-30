// github/webhooks/workflow-run.js — workflow_run.requested/in_progress/completed
// 行为对齐旧 bundle pg/vg/yg/xg/mg/Cg/_g/Pg/fg/Rg/Tg/Mg（L19487-19940）+ workflow_notifications CRUD。
// R9 完整版：D1 记录 + Telegram 完成通知。

import { t, glang } from "../../i18n/index.js";
import { InlineKeyboard } from "grammy";
import { logError } from "../../i18n/log.js";
import { escapeMarkdownV2 as escapeMdV2 } from "../../telegram/markdown.js";

const WORKFLOW_PATHS = {
  autoupdate: ".github/workflows/autoupdate.yml",
  templates: ".github/workflows/templates.yml",
  skills: ".github/workflows/skills.yml",
  removeSkill: ".github/workflows/remove-skill.yml",
  lineBot: ".github/workflows/install-line-bot.yml",
};

// workflow_notifications CRUD（对齐 src/modules/workflow-notifications.js Gt L104-140）
export async function createWorkflowNotification(d1, data) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const {
    requestId, repo, workflowName, workflowPath, title, channel = "telegram",
    chatId, messageId, eventName = "workflow_dispatch",
    sourceType, sourceId, issueNumber, payloadJson,
  } = data;
  await d1.prepare(
    `INSERT INTO workflow_notifications (
      id, request_id, repo, workflow_name, workflow_path, title, channel, chat_id, message_id,
      event_name, status, workflow_ref, head_branch, head_sha, source_type, source_id, payload_json,
      created_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?, 'pending', NULL, NULL, NULL, ?, ?, ?, ?, ?)`,
  ).bind(
    id, requestId, repo, workflowName, workflowPath ?? null, title ?? null, channel,
    chatId ?? null, messageId ?? null, eventName, sourceType ?? null, sourceId ?? null,
    payloadJson ?? null, now, now,
  ).run();
  return id;
}
async function getNotificationByRequestId(d1, requestId) {
  const row = await d1.prepare("SELECT * FROM workflow_notifications WHERE request_id = ? LIMIT 1").bind(requestId).first();
  return row;
}
export async function deleteWorkflowNotificationByRequestId(d1, requestId) {
  await d1.prepare("DELETE FROM workflow_notifications WHERE request_id = ?").bind(requestId).run();
}
async function getNotificationByRunId(d1, runId) {
  const row = await d1.prepare("SELECT * FROM workflow_notifications WHERE workflow_run_id = ? LIMIT 1").bind(runId).first();
  return row;
}
async function updateNotification(d1, requestId, fields) {
  const sets = [];
  const params = [];
  for (const col of ["status", "conclusion", "workflow_run_id", "workflow_ref", "head_branch", "head_sha", "error_message", "completed_at", "notified_at"]) {
    const camelCol = col.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const val = fields[camelCol] ?? fields[col];
    if (val === undefined || val === null) continue;
    sets.push(`${col} = ?`);
    params.push(val);
  }
  if (sets.length === 0) return;
  sets.push("updated_at = datetime('now')");
  params.push(requestId);
  await d1.prepare(`UPDATE workflow_notifications SET ${sets.join(", ")} WHERE request_id = ?`).bind(...params).run();
}
async function getRecentPending(d1, path) {
  const row = await d1.prepare("SELECT * FROM workflow_notifications WHERE workflow_path = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1").bind(path).first();
  return row;
}

// 从 display_title 提取 req:<uuid>
function extractRequestId(title) {
  const m = (title ?? "").match(/\|\s*req:([A-Za-z0-9-]+)\s*$/i);
  return m ? m[1] : null;
}

// 发 Telegram 通知
async function sendNotify(ctx, env, requestId, text, lang, replyMarkup = undefined) {
  const notif = await getNotificationByRequestId(env.d1, requestId);
  if (!notif || notif.channel !== "telegram" || !notif.chat_id) return;
  const { Bot } = await import("grammy");
  const bot = new Bot(env.config.telegram.botToken, { client: { apiRoot: env.config.telegram.apiBaseUrl ?? "https://api.telegram.org" } });
  const chatId = Number(notif.chat_id);
  const messageId = notif.message_id != null ? Number(notif.message_id) : null;
  const opts = { parse_mode: "MarkdownV2", ...(replyMarkup ? { reply_markup: replyMarkup } : {}) };
  try {
    if (messageId) {
      try {
        await bot.api.editMessageText(chatId, messageId, text, opts);
      } catch (editErr) {
        logError("log.webhook.handleFailed", { error: editErr?.message ?? String(editErr) });
        await bot.api.sendMessage(chatId, text, opts);
      }
    } else {
      await bot.api.sendMessage(chatId, text, opts);
    }
    await updateNotification(env.d1, requestId, { status: "notified", notifiedAt: new Date().toISOString() });
  } catch (e) {
    logError("log.webhook.handleFailed", { error: e?.message ?? String(e) });
    await updateNotification(env.d1, requestId, { status: "failed_to_notify", errorMessage: e.message });
  }
}

// 各完成通知文本 builder
function autoupdateNotifyText(conclusion, lang) {
  if (conclusion === "success") return t("core.coreUpdateSuccess", {}, lang);
  if (conclusion === "cancelled") return t("core.coreUpdateCancelled", {}, lang);
  if (["failure", "timed_out", "startup_failure", "action_required"].includes(conclusion)) return t("core.coreUpdateFailed", {}, lang);
  return t("core.coreUpdateEnded", { result: escapeMdV2(conclusion) }, lang);
}
function skillsNotifyText(sourceType, conclusion, name, target, lang) {
  const action = sourceType === "skill_remove" ? t("skills.action_remove", {}, lang)
    : sourceType === "skill_update" ? t("skills.action_update", {}, lang)
    : t("skills.action_install", {}, lang);
  const eName = escapeMdV2(name);
  const eTarget = escapeMdV2(target);
  const eAction = escapeMdV2(action);
  if (conclusion === "success" && sourceType === "skill_remove") return t("skills.removed_message", { name: eName, target: eTarget }, lang);
  if (conclusion === "success") return t("skills.installed_message", { name: eName, action: eAction, target: eTarget }, lang);
  if (conclusion === "cancelled") return t("skills.cancelled_message", { name: eName, action: eAction }, lang);
  if (["failure", "timed_out", "startup_failure", "action_required"].includes(conclusion)) return t("skills.failed_message", { name: eName, action: eAction }, lang);
  return t("skills.ended_message", { name: eName, action: eAction, result: escapeMdV2(conclusion) }, lang);
}
function templatesNotifyText(conclusion, name, lang) {
  const eName = escapeMdV2(name);
  if (conclusion === "success") return t("templates.installed_message", { name: eName }, lang);
  if (conclusion === "cancelled") return t("templates.cancelled_message", { name: eName }, lang);
  if (["failure", "timed_out", "startup_failure", "action_required"].includes(conclusion)) return t("templates.failed_message", { name: eName }, lang);
  return t("templates.ended_message", { name: eName, result: escapeMdV2(conclusion) }, lang);
}
function lineBotNotifyText(conclusion, name, channelId, lang) {
  const eName = escapeMdV2(name);
  if (conclusion === "success") return t("line.deployed_message", { name: eName }, lang);
  if (conclusion === "cancelled") return t("line.deploy_cancelled_message_callback", { name: eName }, lang);
  if (["failure", "timed_out", "startup_failure", "action_required"].includes(conclusion)) return t("line.deploy_failed_message_callback", { name: eName }, lang);
  return t("line.deploy_ended_message_callback", { name: eName, result: escapeMdV2(conclusion) }, lang);
}

export function registerWorkflowRunHandlers(webhooks, env) {
  const run = payload => payload.workflow_run;
  const handle = async (payload, event) => {
    try {
      const r = run(payload);
      const lang = glang();
      const runId = String(r.id);
      const displayTitle = r.display_title ?? r.name ?? "";
      const conclusion = r.conclusion;
      const path = r.path;
      const headBranch = r.head_branch;
      const headSha = r.head_sha;

      // 查 notification：completed 优先 runId，fallback title 解析；requested/in_progress 优先 title
      let notif = null;
      if (event === "completed") {
        notif = await getNotificationByRunId(env.d1, runId);
        if (!notif) {
          const rid = extractRequestId(displayTitle);
          if (rid) notif = await getNotificationByRequestId(env.d1, rid);
        }
      } else {
        const rid = extractRequestId(displayTitle);
        if (rid) notif = await getNotificationByRequestId(env.d1, rid);
      }
      // lineBot requested 特殊：用 pending 查询
      if (!notif && event === "requested" && path === WORKFLOW_PATHS.lineBot) {
        notif = await getRecentPending(env.d1, WORKFLOW_PATHS.lineBot);
      }
      if (!notif) return;

      const requestId = notif.request_id;
      await updateNotification(env.d1, requestId, {
        status: event === "requested" ? "requested" : event === "in_progress" ? "in_progress" : "completed",
        conclusion: event === "completed" ? conclusion : null,
        workflowRunId: runId,
        workflowRef: path,
        headBranch,
        headSha,
        completedAt: event === "completed" ? new Date().toISOString() : null,
      });

      if (event !== "completed") return;

      // 完成通知
      const sourceType = notif.source_type;
      const sourceId = notif.source_id ?? "";
      const name = sourceId || "workflow";
      let target = `#${notif.issue_number ?? ""}`.replace("#", "#");
      if (notif.chat_id && notif.issue_number) {
        // 简化 target
        target = `#${notif.issue_number}`;
      }
      let text;
      if (path === WORKFLOW_PATHS.autoupdate) {
        text = autoupdateNotifyText(conclusion, lang);
      } else if (path === WORKFLOW_PATHS.skills || path === WORKFLOW_PATHS.removeSkill) {
        text = skillsNotifyText(sourceType, conclusion, name, target, lang);
      } else if (path === WORKFLOW_PATHS.templates) {
        text = templatesNotifyText(conclusion, name, lang);
        // line-bot 模板安装成功 → 启动 LINE 流
        if (sourceId === "line-bot" && conclusion === "success") {
          text = t("line.postInstallPrompt", { name }, lang);
          // persist LINE flow state + send with continue/skip keyboard
          if (notif.chat_id) {
            try {
              await env.store.put(`linebot-setup:${notif.chat_id}`, JSON.stringify({ step: "POST_INSTALL_PROMPT", issueNumber: notif.issue_number, promptMessageId: null }), { expirationTtl: 900 });
            } catch (e) { logError("log.webhook.handleFailed", { error: e?.message ?? String(e) }); }
          }
        }
      } else if (path === WORKFLOW_PATHS.lineBot) {
        text = lineBotNotifyText(conclusion, name, null, lang);
      } else {
        return;
      }
      let lineBotKeyboard = undefined;
      if (path === WORKFLOW_PATHS.templates && sourceId === "line-bot" && conclusion === "success" && notif.chat_id) {
        const { InlineKeyboard } = await import("grammy");
        lineBotKeyboard = new InlineKeyboard()
          .text(t("kb.continueLineBotSetup", {}, lang), "linebot_setup_continue:current")
          .text(t("kb.triggerLaterManually", {}, lang), "linebot_setup_skip:current");
      }
      await sendNotify({ env }, env, requestId, text, lang, lineBotKeyboard);
      // skills 成功 + 有 issue_number → 建 issue comment
      if ((path === WORKFLOW_PATHS.skills || path === WORKFLOW_PATHS.removeSkill) && conclusion === "success" && notif.issue_number) {
        try {
          const action = sourceType === "skill_remove" ? t("skills.action_remove", {}, lang) : t("skills.action_install", {}, lang);
          await env.octokit.rest.issues.createComment({
            owner: env.config.github.owner, repo: env.config.github.repo, issue_number: notif.issue_number,
            body: t("skills.issue_comment_completed", { name, action }, lang),
          });
        } catch (e) { logError("log.webhook.handleFailed", { error: e?.message ?? String(e) }); }
      }
    } catch (e) {
      logError("log.webhook.workflowRunFailed", { event, error: e?.message ?? String(e) });
    }
  };
  webhooks.on("workflow_run.requested", ({ payload }) => handle(payload, "requested"));
  webhooks.on("workflow_run.in_progress", ({ payload }) => handle(payload, "in_progress"));
  webhooks.on("workflow_run.completed", ({ payload }) => handle(payload, "completed"));
}