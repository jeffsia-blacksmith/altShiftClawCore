// telegram/flows/llm/state.js — /llm 流程状态
// 行为对齐旧 bundle llm-setup KV（L17396-17405）。键前缀 "llm-setup:"，TTL 900s。

const PREFIX = "llm-setup:";

export async function getLlmState(store, chatId) {
  if (chatId == null) return null;
  const raw = await store.get(`${PREFIX}${chatId}`);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setLlmState(store, chatId, state) {
  if (chatId == null) return;
  await store.put(`${PREFIX}${chatId}`, JSON.stringify(state), { expirationTtl: 900 });
}

export async function clearLlmState(store, chatId) {
  if (chatId == null) return;
  await store.delete(`${PREFIX}${chatId}`);
}