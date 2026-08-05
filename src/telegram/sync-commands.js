// telegram/sync-commands.js — 启动时把斜杠命令菜单（☰ / /）同步到 Telegram。
// 命令与描述都从 i18n 的 help.*_desc 键派生，因此会跟随 CLAW_LANGUAGE 自动本地化，
// 新增命令只需在 help 描述里补一行。每次 Worker 实例只同步一次（serverless 每次
// 请求都会重建 bot，用模块级 flag 去重）。
//
// 描述来源（对齐 /help 的 HELP_LINES）：
//   help.list_desc / new_desc / schedules_desc / version_desc / autoupdate_desc /
//   check_desc / current_desc / status_desc / edit_desc / close_desc / clear_desc /
//   workflow_desc / enable_desc / disable_desc / skills_desc / templates_desc / llm_desc
//
// help_desc 格式为 "/cmd   description"，这里解析出 {command, description}。

import { t } from "../i18n/index.js";

const COMMAND_KEYS = [
  "start",
  "list",
  "new",
  "schedules",
  "version",
  "autoupdate",
  "check",
  "current",
  "status",
  "edit",
  "close",
  "clear",
  "workflow",
  "enable",
  "disable",
  "skills",
  "templates",
  "llm",
  "help",
];

// start 与 help 没有 help.*_desc 键，用独立描述键（各 locale 提供）。
const EXTRA_KEYS = {
  start_desc: "system.start_desc",
  help_desc: "system.menu_desc",
};

function parseHelpDesc(key, lang) {
  const val = t(key, {}, lang);
  const m = val.match(/^(\/\S+)\s+(.*)$/);
  if (!m) return null;
  return { command: m[1].slice(1), description: m[2].trim() };
}

function buildCommands(lang) {
  const commands = [];
  for (const cmd of COMMAND_KEYS) {
    if (cmd === "start") {
      const desc = t(EXTRA_KEYS.start_desc, {}, lang);
      commands.push({ command: cmd, description: desc });
      continue;
    }
    if (cmd === "help") {
      const desc = t(EXTRA_KEYS.help_desc, {}, lang);
      commands.push({ command: cmd, description: desc });
      continue;
    }
    const parsed = parseHelpDesc(`help.${cmd}_desc`, lang);
    if (parsed) commands.push(parsed);
  }
  return commands;
}

let synced = false;

export async function syncBotCommands(bot, config) {
  if (synced) return;
  synced = true;
  try {
    const lang = config.language || "en";
    const commands = buildCommands(lang);
    if (!commands.length) return;
    await bot.api.setMyCommands({ commands });
  } catch (err) {
    // 同步失败不阻断 worker 启动
    console.error("[sync-commands] setMyCommands failed:", err?.message ?? String(err));
  }
}
