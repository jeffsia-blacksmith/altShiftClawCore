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

// rr(store, issueNumber, chatId) — 写入 active issue（对齐旧 bundle rr L4864）
export async function setActiveIssue(store, issueNumber, chatId) {
  if (chatId == null) return;
  await store.put(`active-issue:${chatId}`, String(issueNumber));
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

// cp(store, chatId) — 读取 menu-state，对齐旧 bundle cp（L4938）
// 返回 { mode, messageId } 或 null
export async function getMenuState(store, chatId) {
  if (chatId == null) return null;
  const raw = await store.get(`menu-state:${chatId}`);
  if (raw == null) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {}
  return null;
}