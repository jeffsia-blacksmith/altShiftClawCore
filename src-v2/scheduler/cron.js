// scheduler/cron.js — Cloudflare scheduled() handler
// 行为对齐旧 bundle Gg（L20134-20184）。
// R6 阶段：实现 empty/no-D1 路径（返回 []）+ 到期 schedule 查询骨架。
// 完整 per-schedule 处理（lock + issue comment + workflow dispatch + persist）在 R6b/R7 完善。

import { buildConfig } from "../config.js";
import { buildOctokit } from "../github/octokit.js";

// $E(event) — 对齐 L20095-20101：解析 scheduledTime，校验
function parseScheduledTime(event) {
  const t = event?.scheduledTime ?? Date.now();
  const d = typeof t === "number" ? new Date(t) : new Date(t);
  if (Number.isNaN(d.getTime())) {
    throw new TypeError("Expected scheduled execution time to be a valid timestamp.");
  }
  return d;
}

// Cp(db, {now}) — 查到期 schedules（对齐 L5686-5704）
// R6 简化：直接用 D1 prepare；mock 支持该 SQL 形态
async function fetchDueSchedules(db, now) {
  const iso = now.toISOString();
  const { results } = await db
    .prepare(
      `SELECT id, repo, issue_number, chat_id, prompt, next_run_at, status, locked_until
       FROM schedules
       WHERE status = ?
         AND next_run_at <= ?
         AND (locked_until IS NULL OR locked_until < ?)
       ORDER BY next_run_at ASC, created_at ASC
       LIMIT ?`,
    )
    .bind("active", iso, iso, 100)
    .all();
  return results ?? [];
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

  // R6b: per-schedule lock (Rp) + next-run compute (DE/Wn) + issue comment (FE) + dispatch (Zr) + persist (Ap)
  // 当前 R6 最小：仅返回 due 列表形状，避免运行时未实现的 octokit 调用炸
  const results = [];
  const _octokit = buildOctokit(config);
  void _octokit;
  for (const sched of due) {
    results.push({ id: sched.id, issueNumber: sched.issue_number, success: true, status: "active", nextRunAt: sched.next_run_at });
  }
  return results;
}