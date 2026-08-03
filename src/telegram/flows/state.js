// telegram/flows/state.js — new-flow 状态机 D1 helpers
// 行为对齐旧 bundle Ke/Be/Dt（L4878 / L4900 / L4909）。
// 键名前缀 "new-flow:"（不是 "flow:"）。

const PREFIX = "new-flow:";

// Ke(store, chatId) — 读取 flow state，无则返回 null
export async function getFlowState(store, chatId) {
  if (chatId == null) return null;
  const raw = await store.get(`${PREFIX}${chatId}`);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Be(store, chatId, state) — 写入 flow state（无 TTL）
export async function setFlowState(store, chatId, state) {
  if (chatId == null) return;
  await store.put(`${PREFIX}${chatId}`, JSON.stringify(state));
}

// Dt(store, chatId) — 删除 flow state
export async function clearFlowState(store, chatId) {
  if (chatId == null) return;
  await store.delete(`${PREFIX}${chatId}`);
}