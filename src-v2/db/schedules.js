// db/schedules.js — schedules 表查询 helpers（R9 最小子集）
// 行为对齐旧 bundle Ip（L5614-5630）。

// Ip(db, repoFullName, chatId) — 列出该 chat 的活跃排程
// 对齐 SELECT ... WHERE repo=? AND chat_id=? AND status != 'cancelled' ORDER BY next_run_at ASC
export async function listSchedulesForChat(db, repoFullName, chatId) {
  const { results } = await db
    .prepare(
      `SELECT id, repo, issue_number, chat_id, prompt, rule_type, rule_payload,
              next_run_at, status, locked_until, created_at, updated_at, cancelled_at
       FROM schedules
       WHERE repo = ? AND chat_id = ? AND status != ?
       ORDER BY next_run_at ASC, created_at ASC`,
    )
    .bind(repoFullName, chatId, "cancelled")
    .all();
  return results ?? [];
}