// telegram/keyboards.js — InlineKeyboard builders
// 行为对齐旧 bundle Dd/Do/Ud（L4500-4510）+ $d（L4494-4496）+ Kr/Md 常量（L4844-4845）。

import { InlineKeyboard } from "grammy";

const MAX_BUTTONS = 20;
const MAX_TITLE_LEN = 40;

function truncateTitle(title) {
  if (typeof title !== "string") return "";
  return title.length > MAX_TITLE_LEN ? `${title.slice(0, MAX_TITLE_LEN)}…` : title;
}

// Dd(issues, prefix) — 通用 issue 列表键盘，每行一按钮
export function issueListKeyboard(issues, prefix) {
  const kb = new InlineKeyboard();
  for (const { number, title } of issues.slice(0, MAX_BUTTONS)) {
    kb.text(`#${number} ${truncateTitle(title)}`, `${prefix}:${number}`).row();
  }
  return kb;
}

// Do(issues) — /start /list 用，callback_data = "switch_issue:<n>"
export function switchIssueKeyboard(issues) {
  return issueListKeyboard(issues, "switch_issue");
}

// Ud(issues) — /close 用，callback_data = "close_issue_prompt:<n>"
export function closeIssueKeyboard(issues) {
  return issueListKeyboard(issues, "close_issue_prompt");
}