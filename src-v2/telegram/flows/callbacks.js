// telegram/flows/callbacks.js — issue 选择 / 关闭回调
// 行为对齐旧 bundle zt（L14305-14460）：switch_issue、close_issue_prompt/confirm/cancel。
// 含 menu-state 守卫 Hs（L14296）、issue 列表 Ht（L14276）、lobster label Ei（L14290）。

import { t, glang } from "../../i18n/index.js";
import { InlineKeyboard } from "grammy";
import { getMenuState, getActiveIssue, setActiveIssue } from "../../db/kv-state.js";
import { clearFlowState } from "./state.js";

// V(ctx) — 取 callback chat id，无则答 buttonExpired
async function callbackChatId(ctx) {
  const cid = ctx.callbackQuery?.message?.chat?.id;
  if (cid == null) {
    await ctx.answerCallbackQuery(t("core.buttonExpired", {}, glang()));
  }
  return cid ?? null;
}

// Kt(data) — 解析 callback_data 后段为正整数
function parseIssueNumber(data) {
  const part = String(data).split(":")[1];
  if (!part) return null;
  const n = parseInt(part, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Hs(ctx, expectedMode, errKey) — menu-state 守卫：mode + messageId 必须匹配
async function menuGuard(ctx, expectedMode, errKey) {
  const msgId = ctx.callbackQuery?.message?.message_id;
  const chatId = ctx.callbackQuery?.message?.chat?.id;
  if (!msgId || !chatId) return false;
  const state = await getMenuState(ctx.services.store, chatId);
  if (!state || state.mode !== expectedMode || state.messageId !== msgId) {
    await ctx.answerCallbackQuery(t(errKey, {}, ctx.language ?? glang()));
    return false;
  }
  return true;
}

// Ht(octokit, owner, repo) — 列开 issue（过滤 PR），对齐 L14276
// 旧 bundle 用 octokit.issues.listForRepo（bundled alias），src-v2 用 npm octokit 必须 octokit.rest.issues
async function listOpenIssues(octokit, owner, repo) {
  const { data } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open",
    per_page: 100,
    sort: "created",
    direction: "desc",
  });
  return data
    .filter((it) => !it.pull_request)
    .map((it) => ({ number: it.number, title: it.title, body: it.body }));
}

// Ei(number, title) — lobster label
function lobsterLabel(number, title, lang) {
  return title
    ? t("core.lobsterLabelWithTitle", { number, title }, lang)
    : t("core.lobsterLabel", { number }, lang);
}

export function registerFlowCallbacks(composer) {
  // switch_issue:<n> — 切换 active issue
  composer.callbackQuery(/^switch_issue:/, async (ctx) => {
    const lang = ctx.language ?? glang();
    const chatId = await callbackChatId(ctx);
    if (!chatId || !(await menuGuard(ctx, "list", "core.listMenuExpired"))) return;
    const num = parseIssueNumber(ctx.callbackQuery.data);
    if (!num) {
      await ctx.answerCallbackQuery(t("core.invalidIssueNumber", {}, lang));
      return;
    }
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const issues = await listOpenIssues(octokit, owner, repo);
    const found = issues.find((it) => it.number === num);
    if (!found) {
      await ctx.answerCallbackQuery(t("core.lobsterNotOpen", {}, lang));
      return;
    }
    await clearFlowState(store, chatId);
    await setActiveIssue(store, num, chatId);
    await ctx.answerCallbackQuery();
    await ctx.reply(t("core.switchedToLobster", { title: found.title, number: num }, lang));
    // status card (ks) 在 R5+ 接入完整；R4 暂不渲染
  });

  // close_issue_prompt:<n> — 显示确认提示
  composer.callbackQuery(/^close_issue_prompt:/, async (ctx) => {
    const lang = ctx.language ?? glang();
    const chatId = await callbackChatId(ctx);
    if (!chatId || !(await menuGuard(ctx, "close", "core.closeMenuExpired"))) return;
    const num = parseIssueNumber(ctx.callbackQuery.data);
    if (!num) {
      await ctx.answerCallbackQuery(t("core.invalidLobsterNumber", {}, lang));
      return;
    }
    const { octokit, config } = ctx.services;
    const issues = await listOpenIssues(octokit, config.github.owner, config.github.repo);
    if (issues.length <= 1) {
      await ctx.answerCallbackQuery(t("core.lastLobsterMustKeep", {}, lang));
      await ctx.editMessageText(t("core.closeOnlyOneLobsterLeftMessage", {}, lang), {
        reply_markup: { inline_keyboard: [] },
      });
      return;
    }
    const found = issues.find((it) => it.number === num);
    if (!found) {
      await ctx.answerCallbackQuery(t("core.lobsterAlreadyClosed", {}, lang));
      return;
    }
    await ctx.answerCallbackQuery(t("core.closeConfirmAnswer", {}, lang));
    const kb = new InlineKeyboard()
      .text(t("kb.confirmClose", {}, lang), `close_issue_confirm:${num}`)
      .text(t("kb.closeCancel", {}, lang), `close_issue_cancel:${num}`);
    const text = [
      t("core.closeConfirmQuestion", { target: lobsterLabel(num, found.title, lang) }, lang),
      "",
      t("core.closeConfirmDescription", {}, lang),
    ].join("\n");
    await ctx.editMessageText(text, { reply_markup: kb });
  });

  // close_issue_cancel:<n> — 取消关闭
  composer.callbackQuery(/^close_issue_cancel:/, async (ctx) => {
    const lang = ctx.language ?? glang();
    const chatId = await callbackChatId(ctx);
    if (!chatId) return;
    await ctx.answerCallbackQuery(t("core.closeCancelAnswer", {}, lang));
    await ctx.editMessageText(t("core.closeCancelMessage", {}, lang), {
      reply_markup: { inline_keyboard: [] },
    });
  });

  // close_issue_confirm:<n> — 实际关闭 issue
  composer.callbackQuery(/^close_issue_confirm:/, async (ctx) => {
    const lang = ctx.language ?? glang();
    const chatId = await callbackChatId(ctx);
    if (!chatId || !(await menuGuard(ctx, "close", "core.closeMenuExpired"))) return;
    const num = parseIssueNumber(ctx.callbackQuery.data);
    if (!num) {
      await ctx.answerCallbackQuery(t("core.invalidIssueNumber", {}, lang));
      return;
    }
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const issues = await listOpenIssues(octokit, owner, repo);
    if (!issues.find((it) => it.number === num)) {
      await ctx.answerCallbackQuery(t("core.lobsterAlreadyClosed", {}, lang));
      await ctx.editMessageText(t("core.closeAlreadyClosedMessage", {}, lang), {
        reply_markup: { inline_keyboard: [] },
      });
      return;
    }
    if (issues.length <= 1) {
      await ctx.answerCallbackQuery(t("core.lastLobsterMustKeep", {}, lang));
      await ctx.editMessageText(t("core.closeOnlyOneLobsterLeftMessage", {}, lang), {
        reply_markup: { inline_keyboard: [] },
      });
      return;
    }
    const { data: closed } = await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: num,
      state: "closed",
    });
    // active-issue 重分配：若关闭的是当前 active，切到下一个开 issue
    const active = await getActiveIssue(store, chatId);
    let nextLine;
    if (active === num) {
      const next = issues.find((it) => it.number !== num);
      if (next) {
        await setActiveIssue(store, next.number, chatId);
        nextLine = t("core.closeNextActiveIssueSwitched", { number: next.number }, lang);
      } else {
        nextLine = t("core.closeNoMoreActiveIssues", {}, lang);
      }
    } else if (active) {
      nextLine = t("core.closeNextActiveIssueSame", { number: active }, lang);
    } else {
      nextLine = t("core.closeNoMoreActiveIssues", {}, lang);
    }
    await ctx.answerCallbackQuery(t("core.closeAnswer", {}, lang));
    const text = [
      t("core.closeTargetSuccess", { target: lobsterLabel(closed.number, closed.title, lang) }, lang),
      "",
      "",
      nextLine,
    ].join("\n");
    await ctx.editMessageText(text, { reply_markup: { inline_keyboard: [] } });
  });
}