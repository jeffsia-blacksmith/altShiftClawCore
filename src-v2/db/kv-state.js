// db/kv-state.js — 小龙虾流程状态 helpers
// 行为对齐旧 bundle Ge/Sn/Ut（L4857-4863 / L4950-4951 / L4953-4955）。
// active-issue:<chatId>   = 当前活跃 issue number（字符串）
// menu-state:<chatId>     = JSON { mode, messageId }

// Ge(store, chatId) — 读取 active issue number，无效/缺失返回 null
export async function getActiveIssue(store, chatId) {
  if (chatId == null) return null;
  const raw = await store.get(`active-issue:${chatId}`);
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Sn(store, chatId, {mode, messageId}) — 写入 menu-state
export async function setMenuState(store, chatId, { mode, messageId }) {
  if (chatId == null) return;
  await store.put(`menu-state:${chatId}`, JSON.stringify({ mode, messageId }));
}

// Ut(store, chatId) — 删除 menu-state
export async function clearMenuState(store, chatId) {
  if (chatId == null) return;
  await store.delete(`menu-state:${chatId}`);
}