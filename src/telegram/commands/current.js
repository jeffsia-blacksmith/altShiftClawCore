// commands/current.js — /current + /status 命令
// 行为对齐旧 bundle Qp（L12222-12243）—— /current 与 /status 共用同一 handler。
// 护栏 #7（无 active issue）→ reply core.noTrackedLobster。
// active 路径 → sendStatusCard（status-card.js：7 路并行采集 + MarkdownV2 信息卡）。

import { getActiveIssue } from "../../db/kv-state.js";
import { sendStatusCard } from "../status-card.js";
import { logError } from "../../i18n/log.js";

async function currentStatusHandler(ctx) {
  const { store } = ctx.services;
  const chatId = ctx.chat?.id;
  try {
    const active = chatId ? await getActiveIssue(store, chatId) : null;
    if (!active || active <= 0) {
      await ctx.reply(ctx.t("core.noTrackedLobster"));
      return;
    }
    // 发完整信息卡
    await sendStatusCard(ctx, active);
  } catch (err) {
    logError("log.command.executionFailed", { command: "current", error: err instanceof Error ? err.message : String(err) });
    await ctx.reply(ctx.t("core.statusError"));
  }
}

export function registerCurrent(composer) {
  composer.command("current", currentStatusHandler);
  composer.command("status", currentStatusHandler);
}