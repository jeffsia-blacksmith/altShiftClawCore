// commands/help.js — /help 命令
// 行为对齐旧 bundle Ko.command("help")（L12134-12138）+ fy()（L12105-12132）。
// 回复命令清单（MarkdownV2），含 "/list"，长度远超 20 字符（护栏 #4 断言）。

import { t } from "../../i18n/index.js";
import { escapeMarkdownV2, MARKDOWN_V2_PARSE_MODE } from "../markdown.js";

const HELP_LINES = [
  "help.title",
  "",
  "help.welcome",
  "",
  "help.lobster_burger_management",
  "help.list_desc",
  "help.new_desc",
  "help.schedules_desc",
  "help.version_desc",
  "help.autoupdate_desc",
  "help.check_desc",
  "",
  "help.lobster_management",
  "help.current_desc",
  "help.status_desc",
  "help.edit_desc",
  "help.close_desc",
  "help.clear_desc",
  "help.workflow_desc",
  "help.enable_desc",
  "help.disable_desc",
  "help.skills_desc",
  "help.templates_desc",
  "help.llm_desc",
];

const SECTION_HEADERS = new Set([
  "help.title",
  "help.lobster_burger_management",
  "help.lobster_management",
]);

export function buildHelpText(repoFullName, lang) {
  return HELP_LINES.map((line) => {
    if (line === "") return "";
    const val = t(line, { repoFullName }, lang);
    if (SECTION_HEADERS.has(line)) {
      return `*${escapeMarkdownV2(val)}*`;
    }
    // Command lines: "/cmd  description" → "• */cmd* — description"
    const m = val.match(/^(\/\S+)\s+(.*)$/);
    if (m) {
      return `• *${escapeMarkdownV2(m[1])}* \\— ${escapeMarkdownV2(m[2])}`;
    }
    return escapeMarkdownV2(val);
  }).join("\n");
}

export function registerHelp(composer) {
  composer.command("help", async (ctx) => {
    const { config } = ctx.services;
    const text = buildHelpText(config.github.repoFullName, ctx.language);
    await ctx.reply(text, MARKDOWN_V2_PARSE_MODE);
  });
}