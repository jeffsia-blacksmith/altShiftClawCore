// github/webhooks/meta.js — 解析 issue/comment body 内的 HTML 注释 meta
// 行为对齐旧 bundle Tr/kr/cl（L6564-6570 / L6640）+ E_ 正则（L6725）。

const TELEGRAM_META_RE = /<!--\s*telegram-meta:\s*(\{[\s\S]*?\})\s*-->/;

// Tr(e) — 匹配第一个 meta JSON 块，返回解析对象或 null
export function parseMetaComment(body) {
  if (typeof body !== "string") return null;
  const m = body.match(TELEGRAM_META_RE);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

// kr(e) — 取 telegram-meta，校验 chat_id 为数字，返回 {chat_id, msg_id?, ...} 或 null
export function parseTelegramMeta(body) {
  const meta = parseMetaComment(body);
  if (!meta || typeof meta.chat_id !== "number") return null;
  return meta;
}

// cl(e) — 从 body 中移除 telegram-meta 注释
export function stripTelegramMeta(body) {
  if (typeof body !== "string") return body ?? "";
  return body.replace(/<!--\s*telegram-meta:\s*\{[\s\S]*?\}\s*-->\s*/g, "");
}