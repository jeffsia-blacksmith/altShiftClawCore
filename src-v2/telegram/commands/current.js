// commands/current.js — /current + /status 命令
// 行为对齐旧 bundle Qp（L12222-12243）—— /current 与 /status 共用同一 handler。
// 护栏 #7（无 active issue）→ reply core.noTrackedLobster。
// active 路径（Hp/gp/qd 复杂渲染）在 R3 仅做最小占位，R7+ 补全。

import { getActiveIssue } from "../../db/kv-state.js";

async function currentStatusHandler(ctx) {
  const { store } = ctx.services;
  const chatId = ctx.chat?.id;
  try {
    const active = chatId ? await getActiveIssue(store, chatId) : null;
    if (!active || active <= 0) {
      await ctx.reply(ctx.t("core.noTrackedLobster"));
      return;
    }
    // R7+ 接入完整 info card（Hp 7 路 octokit/D1 + gp MarkdownV2 渲染 + qd action keyboard）
    await ctx.reply(ctx.t("core.statusError"));
  } catch (err) {
    console.error("[/current|/status]", err);
    await ctx.reply(ctx.t("core.statusError"));
  }
}

export function registerCurrent(composer) {
  composer.command("current", currentStatusHandler);
  composer.command("status", currentStatusHandler);
}