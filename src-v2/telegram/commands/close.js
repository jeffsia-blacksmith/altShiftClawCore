// commands/close.js — /close 命令
// 行为对齐旧 bundle rl.command("close")（L12248-12299）。
// 护栏未测 /close；实现 0/1/>=2 三分支 + Ud(issues) close_issue_prompt 键盘。
// 实际 issue 关闭在 callback handler（R4+ close_issue_confirm）。

import { closeIssueKeyboard } from "../keyboards.js";
import { setMenuState, clearMenuState } from "../../db/kv-state.js";
import { fetchOpenIssues } from "./list.js";
import { logError } from "../../i18n/log.js";

export function registerClose(composer) {
  composer.command("close", async (ctx) => {
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    try {
      const issues = await fetchOpenIssues(octokit, { owner, repo });

      if (issues.length === 0) {
        if (chatId) await clearMenuState(store, chatId);
        await ctx.reply(ctx.t("core.closeNoOpenLobsters"));
        return;
      }
      if (issues.length === 1) {
        if (chatId) await clearMenuState(store, chatId);
        await ctx.reply(ctx.t("core.closeOnlyOneLobsterLeft"));
        return;
      }

      const header = [ctx.t("core.closeWhichLobster"), "", ctx.t("core.closeConfirmHint")].join("\n");
      const keyboard = closeIssueKeyboard(issues);
      const sent = await ctx.reply(header, { reply_markup: keyboard });
      if (chatId && sent.message_id) {
        await setMenuState(store, chatId, { mode: "close", messageId: sent.message_id });
      } else if (chatId) {
        await clearMenuState(store, chatId);
      }
    } catch (err) {
      logError("log.command.executionFailed", { command: "close", error: err instanceof Error ? err.message : String(err) });
      await ctx.reply(ctx.t("core.closeError"));
    }
  });
}