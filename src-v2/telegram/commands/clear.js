// commands/clear.js — /clear 命令
// 行为对齐旧 bundle sl.command("clear")（L12577-12605）。
// 派工 clear-memory.yml 工作流（active_issue 输入）。

import { t, glang } from "../../i18n/index.js";
import { getActiveIssue } from "../../db/kv-state.js";
import { escapeMarkdownV2 as O, MARKDOWN_V2_PARSE_MODE as He } from "../markdown.js";

export function registerClear(composer) {
  composer.command("clear", async (ctx) => {
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const lang = ctx.language ?? glang();
    const chatId = ctx.chat?.id;
    const active = chatId ? await getActiveIssue(store, chatId) : null;
    if (!active) {
      await ctx.reply(O(t("core.noActiveLobsterSelected", {}, lang)), He);
      return;
    }
    try {
      const { data: repoInfo } = await octokit.rest.repos.get({ owner, repo });
      await octokit.rest.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: "clear-memory.yml",
        ref: repoInfo.default_branch,
        inputs: { active_issue: String(active) },
      });
      await ctx.reply(O(t("core.memoryCleared", { number: active }, lang)), He);
    } catch (e) {
      console.error("[/clear]", e);
      await ctx.reply(
        O(t("core.triggerWorkflowFailed", {
          name: O(t("core.clearMemoryWorkflow", {}, lang)),
          error: O(e?.message ?? t("core.unknownError", {}, lang)),
        }, lang)),
        He,
      );
    }
  });
}