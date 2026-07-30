// coding-agent/dispatch.js — coding-agent 派工（fu/ig/mE）
// 行为对齐旧 bundle fu（L19289-19349）+ ig（L19228-19276）+ mE（L19126-19139）。
// 从 issue_comment webhook 触发，向 issue-<n>.yml 工作流派工。

import { t, glang } from "../i18n/index.js";
import { logInfo } from "../i18n/log.js";

// ai/meta markers（对齐 il/en markers — old bundle il L6561-6563）
// Skip: brain-result, tool-run, line-meta — NOT telegram-meta (human comments carry telegram-meta)
const SYSTEM_MARKERS = [
  /<!--\s*githubclaw-brain-result:/,
  /<!--\s*githubclaw-tool-run:/,
  /<!--\s*line-meta:/,
];

function isSystemComment(body) {
  return SYSTEM_MARKERS.some((re) => re.test(body ?? ""));
}

// en/al: telegram-meta marker — old bundle al (L6567-6568) requires this
function parseTelegramMeta(body) {
  if (!body) return null;
  const m = body.match(/<!--\s*telegram-meta:\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) return null;
  try {
    const meta = JSON.parse(m[1]);
    if (typeof meta.chat_id !== "number") return null;
    return meta;
  } catch { return null; }
}

function hasCommentMeta(body) {
  return parseTelegramMeta(body) !== null;
}

function isScheduleFlowRecord(body) {
  const meta = parseTelegramMeta(body);
  return meta?.source === "schedule-flow";
}

function mediaStage(body) {
  const m = body?.match(/<!--\s*githubclaw-media-meta:\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]).stage ?? null;
  } catch {
    return null;
  }
}

function isMediaPending(body) {
  return mediaStage(body) === "pending";
}

function isMediaFinalizedFromPending(newBody, oldBody) {
  if (mediaStage(newBody) !== "finalized") return false;
  if (oldBody == null) return false;
  return mediaStage(oldBody) === "pending";
}

// mu：strip HTML comments + HTML tags but preserve code blocks (对齐旧 bundle mu/oE L19059-19072)
function stripToUserMessage(body) {
  if (typeof body !== "string") return "";
  let s = body;
  // Strip HTML comments (meta markers)
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  // Strip specific HTML tags but preserve content
  s = s.replace(/<a\s[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)");
  s = s.replace(/<\/?(?:b|i|u|s|tg-spoiler|code|pre|blockquote)[^>]*>/gi, "");
  // Strip "来自：" / "From:" lines
  s = s.replace(/^(?:来自：|From:).*$/gm, "");
  // Strip standalone --- separators
  s = s.replace(/^---+$/gm, "");
  return s.trim();
}

// cE：从 telegram-meta 解析 event_source / event_data (对齐旧 bundle cE L19089-19099)
function parseEventSource(issueBody, commentBody) {
  for (const body of [commentBody, issueBody]) {
    const meta = parseTelegramMeta(body);
    if (meta) {
      if (meta.source === "scheduled-trigger") return { eventSource: "cron", eventData: meta.event_data ?? "" };
      if (meta.event_source) return { eventSource: meta.event_source, eventData: meta.event_data ?? "" };
    }
  }
  return { eventSource: "issue", eventData: "" };
}

// pE：解析 event_data JSON → 扁平 key/value
function flattenEventData(eventData) {
  if (typeof eventData !== "string" || !eventData.trim()) return {};
  try {
    const parsed = JSON.parse(eventData);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out = {};
    for (const [k, v] of Object.entries(parsed)) {
      const key = String(k).trim();
      if (!key) continue;
      out[key] = typeof v === "string" ? v : JSON.stringify(v);
    }
    return out;
  } catch {
    return {};
  }
}

// mE：构建 workflow_dispatch inputs
function buildDispatchInputs({ issueNumber, progressCommentId, userCommentId, issueBody, commentBody }) {
  const { eventSource, eventData } = parseEventSource(issueBody, commentBody);
  return {
    issue_number: String(issueNumber),
    comment_id: progressCommentId == null ? "" : String(progressCommentId),
    user_comment_id: typeof userCommentId === "number" && userCommentId > 0 ? String(userCommentId) : "",
    event_source: eventSource,
    event_data: eventData,
    ...flattenEventData(eventData),
  };
}

// pl：progress comment body（含 githubclaw-brain-result footer）
function buildProgressCommentBody(userMessage, requestTelegramMeta = null) {
  const trimmed = typeof userMessage === "string" ? userMessage.trim() : "";
  const meta = { source: "githubclaw-worker-brain" };
  if (requestTelegramMeta) meta.requestTelegramMeta = requestTelegramMeta;
  const footer = `<!-- githubclaw-brain-result: ${JSON.stringify(meta)} -->`;
  return [trimmed, footer].filter(Boolean).join("\n\n");
}

// lE：提取 requestTelegramMeta（从 comment/issue body 的 telegram-meta — 对齐旧 bundle kr/ii L6560-6570）
function extractRequestTelegramMeta(issueBody, commentBody) {
  for (const body of [commentBody, issueBody]) {
    const meta = parseTelegramMeta(body);
    if (meta) return meta;
  }
  return null;
}

// Ts：检查 issue-<n> 分支 + workflow 是否存在且启用
async function checkAcceptsDispatch(octokit, owner, repo, issueNumber) {
  let branchExists = false;
  try {
    await octokit.rest.git.getRef({ owner, repo, ref: `heads/issue-${issueNumber}` });
    branchExists = true;
  } catch {}
  let workflowExists = false;
  let workflowEnabled = false;
  try {
    const { data } = await octokit.rest.actions.listRepoWorkflows({ owner, repo });
    const wf = data.workflows.find((w) => w.path === `.github/workflows/issue-${issueNumber}.yml`);
    if (wf) {
      workflowExists = true;
      workflowEnabled = wf.state !== "disabled_manually";
    }
  } catch {}
  return { branchExists, workflowExists, workflowEnabled, acceptsDispatch: branchExists && workflowExists && workflowEnabled };
}

// fu：coding-agent 派工主入口
export async function dispatchCodingAgent(payload, env) {
  const issue = payload.issue;
  const comment = payload.comment;
  if (!issue || !comment) {
    logInfo("log.codingAgent.payloadMissingSkip");
    return null;
  }
  const body = comment.body ?? "";
  if (isSystemComment(body)) {
    logInfo("log.codingAgent.skipSystemComment", { issue: issue.number });
    return null;
  }
  if (isScheduleFlowRecord(body)) {
    logInfo("log.codingAgent.skipScheduleRecord", { issue: issue.number });
    return null;
  }
  if (!hasCommentMeta(body) && !hasCommentMeta(issue.body ?? "")) {
    logInfo("log.codingAgent.skipMissingMeta", { issue: issue.number });
    return null;
  }
  if (payload.action === "created" && isMediaPending(body)) {
    logInfo("log.codingAgent.skipMediaNotFinalized", { issue: issue.number });
    return null;
  }
  if (payload.action === "edited" && !isMediaFinalizedFromPending(body, payload.changes?.body?.from ?? null)) {
    logInfo("log.codingAgent.skipEditedNotFinalized", { issue: issue.number });
    return null;
  }
  const userMessage = stripToUserMessage(body);
  if (!userMessage) {
    logInfo("log.codingAgent.skipEmptyUserMessage", { issue: issue.number });
    return null;
  }

  const { octokit, config } = env;
  const { owner, repo } = config.github;
  const check = await checkAcceptsDispatch(octokit, owner, repo, issue.number);
  if (!check.acceptsDispatch) {
    const reasonKey = !check.branchExists || !check.workflowExists
      ? "log.codingAgent.reasonMissingBranchOrWorkflow"
      : "log.codingAgent.reasonWorkflowDisabled";
    logInfo("log.codingAgent.skipOther", { issue: issue.number, reason: t(reasonKey, {}, glang()) });
    return null;
  }

  // ig：建 progress comment + dispatch
  const requestTelegramMeta = extractRequestTelegramMeta(issue.body, body);
  const progressBody = buildProgressCommentBody(
    t("core.instructionReceived", { name: userMessage || t("system.source_name", {}, glang()) }, glang()),
    requestTelegramMeta,
  );
  const created = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issue.number,
    body: progressBody,
  });
  const progressCommentId = typeof created.data.id === "number" ? created.data.id : null;

  const inputs = buildDispatchInputs({
    issueNumber: issue.number,
    progressCommentId,
    userCommentId: comment.id,
    issueBody: issue.body,
    commentBody: body,
  });

  try {
    await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: `issue-${issue.number}.yml`,
      ref: "main",
      inputs,
    });
    return { issueNumber: issue.number, progressCommentId };
  } catch (e) {
    const errMsg = e?.message ?? "";
    // og: workflow not found (对齐旧 bundle og L19149-19172)
    const isNotFound = /could not be found|not found/i.test(errMsg) && /workflow/i.test(errMsg);
    // fE: workflow disabled (对齐旧 bundle fE L19140-19148)
    const isDisabled = /cannot trigger a 'workflow_dispatch' on a disabled workflow|workflow_dispatch.*disabled workflow/i.test(errMsg);
    if (progressCommentId != null && isNotFound) {
      await octokit.rest.issues.deleteComment({ owner, repo, comment_id: progressCommentId }).catch(() => {});
    } else if (progressCommentId != null) {
      const lang = glang();
      const name = userMessage || t("system.source_name", {}, lang);
      let errorBody;
      if (isDisabled) {
        errorBody = buildProgressCommentBody(
          `${t("core.restingMessage1", { name }, lang)}\n\n${t("core.restingMessage2", {}, lang)}\n${t("core.restingMessage3", {}, lang)}`,
          requestTelegramMeta,
        );
      } else {
        errorBody = buildProgressCommentBody(
          `${t("core.dispatchFailed", { name }, lang)}\n\n${t("core.dispatchErrorLine", { error: errMsg || t("core.unknownError", {}, lang) }, lang)}`,
          requestTelegramMeta,
        );
      }
      await octokit.rest.issues.updateComment({ owner, repo, comment_id: progressCommentId, body: errorBody }).catch(() => {});
    }
    throw e;
  }
}