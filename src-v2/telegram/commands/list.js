// commands/list.js — /list 命令
// 行为对齐旧 bundle Va.command("list")（L12171-12218）+ Do(issues)（L4506-4507）。
// 护栏 #5（空 issues）→ reply core.noLobstersYet；护栏 #6（1 issue）→ 键盘含 #7。

import { t } from "../../i18n/index.js";
import { switchIssueKeyboard } from "../keyboards.js";
import { getActiveIssue, setMenuState, clearMenuState } from "../../db/kv-state.js";

// 共用 issue 抓取 + 过滤（对齐 /start /list /close 共用逻辑）
export async function fetchOpenIssues(octokit, { owner, repo }) {
  const { data } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open",
    per_page: 100,
  });
  return data
    .filter((it) => !it.pull_request)
    .filter((it) =>
      !(it.labels ?? [])
        .map((l) => (typeof l === "string" ? l : (l.name ?? "")).toLowerCase())
        .includes("config"),
    )
    .map((it) => ({ number: it.number, title: it.title }));
}

function buildActiveLine(ctx, activeNum, issues) {
  if (!activeNum) return null;
  const found = issues.find((it) => it.number === activeNum);
  if (found) {
    return ctx.t("core.currentActive", {
      number: found.number,
      title: found.title || ctx.t("core.unnamedLobster"),
    });
  }
  return ctx.t("core.currentActiveNotFound", { number: activeNum });
}

export function registerList(composer) {
  composer.command("list", async (ctx) => {
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    try {
      const issues = await fetchOpenIssues(octokit, { owner, repo });
      const active = chatId ? await getActiveIssue(store, chatId) : null;
      const activeLine = buildActiveLine(ctx, active, issues);

      if (issues.length === 0) {
        if (chatId) await clearMenuState(store, chatId);
        const text = activeLine
          ? `${activeLine}\n${ctx.t("core.noLobstersYet")}`
          : ctx.t("core.noLobstersYet");
        await ctx.reply(text);
        return;
      }

      const header = [activeLine, ctx.t("core.yourLobsters")].filter(Boolean).join("\n");
      const keyboard = switchIssueKeyboard(issues);
      const sent = await ctx.reply(header, { reply_markup: keyboard });
      if (chatId && sent.message_id) {
        await setMenuState(store, chatId, { mode: "list", messageId: sent.message_id });
      } else if (chatId) {
        await clearMenuState(store, chatId);
      }
    } catch (err) {
      console.error("[/list]", err);
      await ctx.reply(ctx.t("core.listErrorGeneric"));
    }
  });
}