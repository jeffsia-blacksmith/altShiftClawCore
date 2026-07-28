// coding-agent/dispatch.js — coding-agent 派工（fu/ig/mE）
// 行为对齐旧 bundle fu（L19289-19349）+ ig（L19228-19276）+ mE（L19126-19139）。
// 从 issue_comment webhook 触发，向 issue-<n>.yml 工作流派工。

import { t, glang } from "../i18n/index.js";

// ai/meta markers（对齐 il/en markers）
const SYSTEM_MARKERS = [
  /<!--\s*githubclaw-brain-result:/,
  /<!--\s*telegram-meta:/,
  /<!--\s*line-meta:/,
];

function isSystemComment(body) {
  return SYSTEM_MARKERS.some((re) => re.test(body ?? ""));
}

function isScheduleFlowRecord(body) {
  const m = body?.match(/<!--\s*githubclaw-(?:brain-result|comment-meta):\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) return false;
  try {
    return JSON.parse(m[1]).source === "schedule-flow";
  } catch {
    return false;
  }
}

function hasCommentMeta(body) {
  return /<!--\s*githubclaw-comment-meta:\s*\{[\s\S]*?\}\s*-->/.test(body ?? "");
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

// mu：剥离所有 HTML 注释/meta/HTML 标签，留下纯人类文本
function stripToUserMessage(body) {
  if (typeof body !== "string") return "";
  return body
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .trim();
}

// cE：从 comment/issue body 解析 event_source / event_data
function parseEventSource(issueBody, commentBody) {
  for (const body of [commentBody, issueBody]) {
    const m = body?.match(/<!--\s*githubclaw-comment-meta:\s*(\{[\s\S]*?\})\s*-->/);
    if (m) {
      try {
        const meta = JSON.parse(m[1]);
        if (meta.source === "scheduled-trigger") return { eventSource: "cron", eventData: meta.event_data ?? "" };
        return { eventSource: meta.event_source ?? "issue", eventData: meta.event_data ?? "" };
      } catch {}
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

// lE：提取 requestTelegramMeta（从 comment/issue body 的 brain-result/tool-run meta）
function extractRequestTelegramMeta(issueBody, commentBody) {
  for (const body of [commentBody, issueBody]) {
    const m = body?.match(/<!--\s*githubclaw-(?:brain-result|tool-run):\s*(\{[\s\S]*?\})\s*-->/);
    if (m) {
      try {
        const parsed = JSON.parse(m[1]);
        if (parsed.requestTelegramMeta) return parsed.requestTelegramMeta;
      } catch {}
    }
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
    console.log("[fu] payload missing, skip");
    return null;
  }
  const body = comment.body ?? "";
  if (isSystemComment(body)) {
    console.log("[fu] system comment, skip");
    return null;
  }
  if (isScheduleFlowRecord(body)) {
    console.log("[fu] schedule-flow record, skip");
    return null;
  }
  if (!hasCommentMeta(body) && !hasCommentMeta(issue.body ?? "")) {
    console.log("[fu] missing comment-meta, skip");
    return null;
  }
  if (payload.action === "created" && isMediaPending(body)) {
    console.log("[fu] media pending, skip");
    return null;
  }
  if (payload.action === "edited" && !isMediaFinalizedFromPending(body, payload.changes?.body?.from ?? null)) {
    console.log("[fu] edited not finalized, skip");
    return null;
  }
  const userMessage = stripToUserMessage(body);
  if (!userMessage) {
    console.log("[fu] empty user message, skip");
    return null;
  }

  const { octokit, config } = env;
  const { owner, repo } = config.github;
  const check = await checkAcceptsDispatch(octokit, owner, repo, issue.number);
  if (!check.acceptsDispatch) {
    const reason = !check.branchExists || !check.workflowExists
      ? "missing branch or workflow"
      : "workflow disabled";
    console.log(`[fu] skip: ${reason}`);
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
    if (progressCommentId != null && /could not be found|not found/i.test(e?.message ?? "")) {
      await octokit.rest.issues.deleteComment({ owner, repo, comment_id: progressCommentId }).catch(() => {});
    } else if (progressCommentId != null) {
      const errorBody = buildProgressCommentBody(
        `${t("core.dispatchFailed", {}, glang())}\n${t("core.dispatchErrorLine", { error: e?.message ?? t("core.unknownError", {}, glang()) }, glang())}`,
        requestTelegramMeta,
      );
      await octokit.rest.issues.updateComment({ owner, repo, comment_id: progressCommentId, body: errorBody }).catch(() => {});
    }
    throw e;
  }
}