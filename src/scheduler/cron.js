// scheduler/cron.js — Cloudflare scheduled() handler
// 行为对齐旧 bundle Gg（L20134-20184）。
// R6 阶段：实现 empty/no-D1 路径（返回 []）+ 到期 schedule 查询骨架。
// 完整 per-schedule 处理（lock + issue comment + workflow dispatch + persist）在 R6b/R7 完善。

import { buildConfig } from "../config.js";
import { buildOctokit } from "../github/octokit.js";
import { fetchDueSchedules, acquireScheduleLock, persistScheduleRun, updateSchedule } from "../db/schedules.js";
import { computeNextRun } from "../telegram/flows/schedule-flow.js";
import { logError } from "../i18n/log.js";

function parseScheduledTime(event) {
  const t = event?.scheduledTime ?? Date.now();
  const d = typeof t === "number" ? new Date(t) : new Date(t);
  if (Number.isNaN(d.getTime())) {
    throw new TypeError("Expected scheduled execution time to be a valid timestamp.");
  }
  return d;
}

// DE — next-run / cancel compute（对齐 L20113-20120）
function computeNextRunState(sched, now) {
  if (sched.ruleType === "once") {
    return { status: "cancelled", nextRunAt: sched.nextRunAt, cancelledAt: now.toISOString() };
  }
  let nextRunAt = sched.nextRunAt;
  try {
    nextRunAt = computeNextRun({ ruleType: sched.ruleType, rulePayload: sched.rulePayload, now });
  } catch {
    nextRunAt = new Date(now.getTime() + 3600000).toISOString();
  }
  return { status: sched.status, nextRunAt, cancelledAt: null };
}

// FE — scheduled prompt body（对齐 L20087-20094 + cm L6664-6667）
function buildScheduledPrompt(sched) {
  const meta = {
    source: "scheduled-trigger",
    schedule_id: sched.id,
    event_source: "cron",
    ...(sched.eventData ? { event_data: sched.eventData } : {}),
  };
  const prompt = (sched.prompt ?? "").trim();
  return [`<!-- telegram-meta: ${JSON.stringify(meta)} -->`, prompt].filter(Boolean).join("\n");
}

// Zr — write artifacts/<commentId>/user.md to issue-<n> branch
async function writeUserArtifact(octokit, owner, repo, issueNumber, commentId, prompt) {
  const branch = `issue-${issueNumber}`;
  const path = `artifacts/${commentId}/user.md`;
  const content = `${(prompt ?? "").trim() || "(empty)"}\n`;
  let sha;
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path, ref: branch });
    sha = data.sha;
  } catch {}
  await octokit.rest.repos.createOrUpdateFileContents({
    owner, repo, path, message: `chore: update issue #${issueNumber} comment #${commentId} user artifact`,
    content: Buffer.from(content).toString("base64"), branch, ...(sha ? { sha } : {}),
  });
}

// LE — validate comment id
function validateCommentId(id, scheduleId) {
  if (typeof id === "number" && Number.isInteger(id) && id > 0) return id;
  throw new Error(`Scheduled comment for ${scheduleId} did not return a valid GitHub comment id.`);
}

export async function handleScheduled(event, env, ctx) {
  const config = buildConfig(env);
  const db = config.scheduleStorage.database;
  if (!db) {
    console.warn("[Scheduled] Missing SCHEDULES_DB binding, skipping scheduled run.");
    return [];
  }
  const now = parseScheduledTime(event);
  const iso = now.toISOString();
  const due = await fetchDueSchedules(db, now);
  if (due.length === 0) {
    console.log(`[Scheduled] No due schedules at ${iso}`);
    return [];
  }
  console.log(`[Scheduled] Found ${due.length} due schedule(s) at ${iso}`);

  const octokit = buildOctokit(config);
  const results = [];
  for (const sched of due) {
    // 1. 获取锁
    const locked = await acquireScheduleLock(db, sched.id, sched.nextRunAt, now);
    if (!locked) {
      console.log(`[Scheduled] Skip schedule ${sched.id}: lock already acquired or stale state.`);
      continue;
    }
    try {
      // 2. 计算下次运行状态
      const nextState = computeNextRunState(locked, now);
      // 3. 建 issue comment
      const [owner, repo] = locked.repo.split("/");
      const commentBody = buildScheduledPrompt(locked);
      const { data: comment } = await octokit.rest.issues.createComment({
        owner, repo, issue_number: locked.issueNumber, body: commentBody,
      });
      const commentId = validateCommentId(comment.id, locked.id);
      // 4. 写 user.md artifact
      await writeUserArtifact(octokit, owner, repo, locked.issueNumber, commentId, locked.prompt);
      // 5. 持久化完成状态
      const persisted = await persistScheduleRun(db, locked.id, {
        status: nextState.status,
        nextRunAt: nextState.nextRunAt,
        cancelledAt: nextState.cancelledAt,
        lastRunAt: now.toISOString(),
      }, now);
      if (!persisted) throw new Error(`Failed to persist completion for schedule ${locked.id}.`);
      results.push({ id: locked.id, issueNumber: locked.issueNumber, success: true, nextRunAt: persisted.nextRunAt, status: persisted.status });
    } catch (err) {
      // 错误持久化
      const errMsg = err instanceof Error ? err.message : String(err);
      try {
        await updateSchedule(db, locked.id, { lastError: errMsg, lockedUntil: null });
      } catch {}
      logError("log.webhook.handleFailed", { error: `schedule ${locked.id}: ${errMsg}` });
      results.push({ id: locked.id, issueNumber: locked.issueNumber, success: false, error: errMsg });
    }
  }
  return results;
}