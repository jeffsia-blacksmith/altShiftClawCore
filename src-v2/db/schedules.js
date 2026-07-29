// db/schedules.js — schedules 表 CRUD（完整版）
// 行为对齐旧 bundle Xo/gt/gs/Ip/jt/Xa/Cp/Rp/Ap/Wn（L5542/5580/5595/5614/5633/5661/5686/5706/5727/13750）。

// Xo — 创建 schedule
export async function createSchedule(db, data) {
  const id = data.id ?? `sch_${crypto.randomUUID().replace(/-/g, "")}`;
  const status = data.status ?? "active";
  const shouldNotify = data.shouldNotify ? 1 : 0;
  const rulePayload = typeof data.rulePayload === "string" ? data.rulePayload : JSON.stringify(data.rulePayload ?? null);
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO schedules (id, repo, issue_number, chat_id, prompt, event_data, rule_type, rule_payload, timezone, next_run_at, should_notify, status, last_run_at, last_error, locked_until, cancelled_at, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id, data.repo, data.issueNumber, data.chatId ?? null, data.prompt ?? "", data.eventData ?? null,
      data.ruleType ?? null, rulePayload, data.timezone ?? "Asia/Taipei", data.nextRunAt ?? null,
      shouldNotify, status, data.lastRunAt ?? null, data.lastError ?? null, data.lockedUntil ?? null,
      data.cancelledAt ?? null, now, now,
    )
    .run();
  return await getSchedule(db, id);
}

// gt — 按 id 取
export async function getSchedule(db, id) {
  const row = await db
    .prepare("SELECT * FROM schedules WHERE id = ? LIMIT 1")
    .bind(id)
    .first();
  return row ? camelSchedule(row) : null;
}

// gs — 按 issue 列
export async function listSchedulesForIssue(db, repo, issueNumber, includeInactive = false) {
  let sql = `SELECT * FROM schedules WHERE repo = ? AND issue_number = ?`;
  const params = [repo, issueNumber];
  if (!includeInactive) {
    sql += ` AND status != ?`;
    params.push("cancelled");
  }
  sql += ` ORDER BY next_run_at ASC, created_at ASC`;
  const { results } = await db.prepare(sql).bind(...params).all();
  return (results ?? []).map(camelSchedule);
}

// Ip — 按 chat 列（已在前面定义，这里重申 export）
export async function listSchedulesForChat(db, repo, chatId, includeInactive = false) {
  let sql = `SELECT * FROM schedules WHERE repo = ? AND chat_id = ?`;
  const params = [repo, chatId];
  if (!includeInactive) {
    sql += ` AND status != ?`;
    params.push("cancelled");
  }
  sql += ` ORDER BY next_run_at ASC, created_at ASC`;
  const { results } = await db.prepare(sql).bind(...params).all();
  return (results ?? []).map(camelSchedule);
}

// jt — 更新（部分字段，COALESCE 语义）
export async function updateSchedule(db, id, fields) {
  const sets = [];
  const params = [];
  const fieldMap = {
    issueNumber: "issue_number", ruleType: "rule_type", rulePayload: "rule_payload",
    nextRunAt: "next_run_at", shouldNotify: "should_notify", lastRunAt: "last_run_at",
    lastError: "last_error", lockedUntil: "locked_until", cancelledAt: "cancelled_at",
    status: "status", prompt: "prompt", eventData: "event_data", timezone: "timezone",
    chatId: "chat_id",
  };
  for (const [k, v] of Object.entries(fields)) {
    const col = fieldMap[k];
    if (!col) continue;
    let val = v;
    if (k === "rulePayload" && typeof v !== "string") val = JSON.stringify(v ?? null);
    if (k === "shouldNotify") val = v ? 1 : 0;
    if (val === null || val === undefined) continue; // COALESCE 语义：null 不覆盖
    sets.push(`${col} = ?`);
    params.push(val);
  }
  if (sets.length === 0) return await getSchedule(db, id);
  if (fields.status === "cancelled" && !fields.cancelledAt) {
    sets.push("cancelled_at = ?");
    params.push(new Date().toISOString());
  }
  sets.push("updated_at = datetime('now')");
  params.push(id);
  const { meta } = await db.prepare(`UPDATE schedules SET ${sets.join(", ")} WHERE id = ?`).bind(...params).run();
  if (!meta || meta.changes === 0) return null;
  return await getSchedule(db, id);
}

// Xa — 删除
export async function deleteSchedule(db, id) {
  const { meta } = await db.prepare("DELETE FROM schedules WHERE id = ?").bind(id).run();
  return !!(meta && meta.changes > 0);
}

// vp — 按 repo+issue_number 删
export async function deleteSchedulesByIssue(db, repoFullName, issueNumber) {
  const { meta } = await db
    .prepare("DELETE FROM schedules WHERE repo = ? AND issue_number = ?")
    .bind(repoFullName, issueNumber)
    .run();
  return meta?.changes ?? 0;
}

// Cp — 取到期
export async function fetchDueSchedules(db, now) {
  const iso = now.toISOString();
  const { results } = await db
    .prepare(
      `SELECT * FROM schedules WHERE status = 'active' AND next_run_at <= ? AND (locked_until IS NULL OR locked_until < ?) ORDER BY next_run_at ASC, created_at ASC LIMIT ?`,
    )
    .bind(iso, iso, 100)
    .all();
  return (results ?? []).map(camelSchedule);
}

// Rp — 获取锁
export async function acquireScheduleLock(db, id, expectedNextRunAt, now) {
  const iso = now.toISOString();
  const lockUntil = new Date(now.getTime() + 300000).toISOString();
  const { meta } = await db
    .prepare(
      `UPDATE schedules SET locked_until = ?, updated_at = ? WHERE id = ? AND status = 'active' AND next_run_at = ? AND (locked_until IS NULL OR locked_until < ?)`,
    )
    .bind(lockUntil, iso, id, expectedNextRunAt, iso)
    .run();
  if (!meta || meta.changes === 0) return null;
  return await getSchedule(db, id);
}

// Ap — 运行后持久化
export async function persistScheduleRun(db, id, { lastRunAt, lastError, nextRunAt, status, cancelledAt } = {}) {
  return await updateSchedule(db, id, {
    lockedUntil: null,
    lastRunAt: lastRunAt ?? new Date().toISOString(),
    lastError: lastError ?? null,
    nextRunAt,
    status,
    cancelledAt,
  });
}

function safeParseJSON(s) {
  if (!s || typeof s !== "string") return null;
  try { return JSON.parse(s) ?? {}; } catch { return {}; }
}

function camelSchedule(row) {
  return {
    id: row.id, repo: row.repo, issueNumber: row.issue_number, chatId: row.chat_id,
    prompt: row.prompt, eventData: row.event_data, ruleType: row.rule_type, rulePayload: safeParseJSON(row.rule_payload),
    timezone: row.timezone, nextRunAt: row.next_run_at, shouldNotify: !!row.should_notify,
    status: row.status, lastRunAt: row.last_run_at, lastError: row.last_error,
    lockedUntil: row.locked_until, cancelledAt: row.cancelled_at,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}