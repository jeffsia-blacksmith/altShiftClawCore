// telegram/markdown.js — MarkdownV2 escape + helpers
// 行为对齐旧 bundle O()（L4965-4967）+ my 正则（L5043）。
// 注意：my 正则不含 "/"，所以 "/list" 等命令字面量不会被转义。

const ESCAPE_RE = /([_*\[\]()~`>#+=|{}.!\\-])/g;

export function escapeMarkdownV2(str) {
  return String(str).replace(ESCAPE_RE, "\\$1");
}

// 旧 bundle fp 常量（L5315）
export const MARKDOWN_V2_PARSE_MODE = { parse_mode: "MarkdownV2" };

// O(e) — basic escape (L4965)
function basicEscape(str) {
  return String(str).replace(ESCAPE_RE, "\\$1");
}

// dp(e) — inline-code escape (L4968): escape ` and \
function escapeCodeInline(str) {
  return String(str).replace(/([`\\])/g, "\\$1");
}

// Qa(e) — URL escape (L4971): escape ) and \
function escapeUrl(str) {
  return String(str).replace(/([)\\])/g, "\\$1");
}

// Horizontal rule line — Telegram can't render `---`/`***`/`___`, replace with a unicode line.
const RE_HR = /^\s*(?:(?:-\s*){3,}|(?:\*\s*){3,}|(?:\_\s*){3,})$/;
const HR_LINE = "────────────";

// A table row (GitHub Markdown): must contain a pipe.
// Delimiter rows like |---| / |:--:| also match. A bare `---`/`***` (no pipe) is an HR, not a table.
function isTableLine(line) {
  const t = line.trim();
  if (!t) return false;
  if (t.startsWith("|") && t.endsWith("|")) return true;
  return t.includes("|") && /^\|?[\s\-:|]+\|?$/.test(t);
}

// Preprocess Telegram-unsupported Markdown before escaping:
//   - wrap Markdown tables in a fenced code block (```text) so they render as preformatted text
//   - replace horizontal rules (`---`) with a unicode line
// Preserves existing code blocks so their content is not mis-detected as tables.
// Headers/bold/links/lists are left untouched — escapeMdV2Formatted still handles them.
export function preprocessTelegramMarkdown(str) {
  if (typeof str !== "string") return "";

  // 1. Preserve existing fenced code blocks (so `|` inside them isn't treated as a table)
  const codeBlocks = [];
  let r = str.replace(/```(\w*)\n?([\s\S]*?)```/g, (m, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`\`\`\`${lang}\n${code}\`\`\``);
    return `\0PREC${idx}\0`;
  });

  // 2. Replace horizontal rules with a unicode line (BEFORE table detection, so a
  //    bare `---` isn't mistaken for a table delimiter row)
  const lines = r.split("\n").map((l) => (RE_HR.test(l) ? HR_LINE : l));

  // 3. Group contiguous table lines into fenced ```text blocks
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isTableLine(line)) {
      const block = [line.trim()];
      let j = i + 1;
      while (j < lines.length && isTableLine(lines[j])) {
        block.push(lines[j].trim());
        j++;
      }
      out.push(`\`\`\`text\n${block.join("\n")}\n\`\`\``);
      i = j;
    } else {
      out.push(line);
      i++;
    }
  }
  r = out.join("\n");

  // 4. Restore preserved code blocks
  r = r.replace(/\0PREC(\d+)\0/g, (m, idx) => codeBlocks[Number(idx)]);

  return r;
}

// or(e) — sophisticated MarkdownV2 formatter (L4974-5041)
// Preserves code blocks, inline code, links, bold, strikethrough, headings, list markers.
// Everything else is escaped per MarkdownV2 rules.
export function escapeMdV2Formatted(str) {
  if (typeof str !== "string" || !str.trim()) return "";

  // Normalize Telegram-unsupported Markdown (tables → code block, HR → unicode line)
  // before the rest of the formatter runs.
  str = preprocessTelegramMarkdown(str);

  // 1. Extract code blocks (```...```)
  const codeBlocks = [];
  let r = str.replace(/```(\w*)\n?([\s\S]*?)```/g, (m, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`\`\`\`${lang}\n${escapeCodeInline(code)}\`\`\``);
    return `\0C${idx}\0`;
  });

  // 2. Extract inline code (`...`)
  const inlineCodes = [];
  r = r.replace(/`([^`\n]+)`/g, (m, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`\`${escapeCodeInline(code)}\``);
    return `\0I${idx}\0`;
  });

  // 3. Extract links [text](url)
  const links = [];
  r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, url) => {
    const idx = links.length;
    links.push({ text, url });
    return `\0L${idx}\0`;
  });

  // 4. Extract bold **text**
  const bolds = [];
  r = r.replace(/\*\*(.+?)\*\*/g, (m, text) => {
    const idx = bolds.length;
    bolds.push(text);
    return `\0B${idx}\0`;
  });

  // 5. Extract strikethrough ~~text~~
  const strikes = [];
  r = r.replace(/~~(.+?)~~/g, (m, text) => {
    const idx = strikes.length;
    strikes.push(text);
    return `\0S${idx}\0`;
  });

  // 6. Per-line: convert headings → bold placeholders, list markers → bullets
  const headings = [];
  r = r
    .split("\n")
    .map((line) => {
      const h = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/);
      if (h) {
        const idx = headings.length;
        headings.push(h[1]);
        return `\0H${idx}\0`;
      }
      const l = line.match(/^(\s*)[-*+]\s+(.*)$/);
      if (l) {
        const indent = l[1] ?? "";
        const content = l[2] ?? "";
        return `${indent}\u2022 ${content}`;
      }
      return line;
    })
    .join("\n");

  // 7. Escape remaining text
  r = basicEscape(r);

  // 8. Restore placeholders with proper escaping
  r = r.replace(/\0H(\d+)\0/g, (m, idx) => `*${basicEscape(headings[Number(idx)])}*`);
  r = r.replace(/\0S(\d+)\0/g, (m, idx) => `~${basicEscape(strikes[Number(idx)])}~`);
  r = r.replace(/\0B(\d+)\0/g, (m, idx) => `*${basicEscape(bolds[Number(idx)])}*`);
  r = r.replace(/\0L(\d+)\0/g, (m, idx) => {
    const link = links[Number(idx)];
    return `[${basicEscape(link.text)}](${escapeUrl(link.url)})`;
  });
  r = r.replace(/\0I(\d+)\0/g, (m, idx) => inlineCodes[Number(idx)]);
  r = r.replace(/\0C(\d+)\0/g, (m, idx) => codeBlocks[Number(idx)]);

  return r;
}