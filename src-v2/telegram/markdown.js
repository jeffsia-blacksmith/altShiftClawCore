// telegram/markdown.js — MarkdownV2 escape + helpers
// 行为对齐旧 bundle O()（L4965-4967）+ my 正则（L5043）。
// 注意：my 正则不含 "/"，所以 "/list" 等命令字面量不会被转义。

const ESCAPE_RE = /([_*\[\]()~`>#+=|{}.!\\-])/g;

export function escapeMarkdownV2(str) {
  return String(str).replace(ESCAPE_RE, "\\$1");
}

// 旧 bundle fp 常量（L5315）
export const MARKDOWN_V2_PARSE_MODE = { parse_mode: "MarkdownV2" };