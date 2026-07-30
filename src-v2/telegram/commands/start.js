// commands/start.js — /start 命令
// 行为对齐旧 bundle za.command("start")（L12055-12102）。
// 与 /list 几乎一致；护栏未直接测 /start，但实现保持行为对齐。

import { t, glang } from "../../i18n/index.js";
import { switchIssueKeyboard } from "../keyboards.js";
import { getActiveIssue, setMenuState } from "../../db/kv-state.js";
import { logError } from "../../i18n/log.js";
import { fetchOpenIssues } from "./list.js";

export function registerStart(composer) {
  composer.command("start", async (ctx) => {
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    try {
      const issues = await fetchOpenIssues(octokit, { owner, repo });
      const active = chatId ? await getActiveIssue(store, chatId) : null;

      if (issues.length === 0) {
        await ctx.reply(t("core.noLobstersYet", {}, lang));
        return;
      }

      const activeLine = active
        ? (issues.find((it) => it.number === active)
            ? t("core.currentActive", {
                number: active,
                title: issues.find((it) => it.number === active).title || t("core.unnamedLobster", {}, lang),
              }, lang)
            : t("core.currentActiveNotFound", { number: active }, lang))
        : null;
      const header = [activeLine, t("core.yourLobsters", {}, lang)].filter(Boolean).join("\n");
      const keyboard = switchIssueKeyboard(issues);
      const sent = await ctx.reply(header, { reply_markup: keyboard });
      if (chatId && sent.message_id) {
        await setMenuState(store, chatId, { mode: "list", messageId: sent.message_id });
      }
    } catch (err) {
      logError("log.command.executionFailed", { command: "start", error: err instanceof Error ? err.message : String(err) });
      await ctx.reply(t("core.startError", {}, lang));
    }
  });
}