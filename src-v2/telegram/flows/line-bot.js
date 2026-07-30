// telegram/flows/line-bot.js — LINE bot 整合回调
// 行为对齐旧 bundle linebot_* callbacks（L15712-15935）。
// R9 实现：setup_continue/skip、input_skip、deploy_confirm/cancel、edit_params、edit:<field>、edit_back。
// LINE flow 状态键 linebot-setup:<chatId>（TTL 900s）。

import { t, glang } from "../../i18n/index.js";
import { InlineKeyboard } from "grammy";
import { logError } from "../../i18n/log.js";

const PREFIX = "linebot-setup:";

export async function getLineState(store, chatId) {
  const raw = await store.get(`${PREFIX}${chatId}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
async function setLineState(store, chatId, state) {
  await store.put(`${PREFIX}${chatId}`, JSON.stringify(state), { expirationTtl: 900 });
}
async function clearLineState(store, chatId) {
  await store.delete(`${PREFIX}${chatId}`);
}

function continueKeyboard(lang) {
  return new InlineKeyboard()
    .text(t("kb.continue", {}, lang), "linebot_setup_continue:0")
    .text(t("kb.cancel", {}, lang), "linebot_setup_skip:0");
}
function skipKeyboard(lang) {
  return new InlineKeyboard().text(t("kb.skip", {}, lang), "linebot_input_skip:0")
    .text(t("kb.cancel", {}, lang), "linebot_setup_skip:0");
}
function deployConfirmKeyboard(lang) {
  return new InlineKeyboard()
    .text(t("kb.confirmDeploy", {}, lang), "linebot_deploy_confirm:0")
    .text(t("kb.cancel", {}, lang), "linebot_deploy_cancel:0")
    .row()
    .text(t("kb.editParams", {}, lang), "linebot_edit_params:0");
}
function cancelOnlyKeyboard(lang) {
  return new InlineKeyboard().text(t("kb.cancel", {}, lang), "linebot_setup_skip:0");
}
function confirmDetailLines(state, lang) {
  return [
    t("line.confirm_deploy_title", {}, lang),
    `LINE Bot ID: \`${state.lineBotId ?? ""}\``,
    `Channel ID: \`${state.lineChannelId ?? ""}\``,
    t("line.confirm_reply_msg", { value: state.lineDefaultReplyMessage ?? "" }, lang),
    t("line.confirm_lobster", { value: state.issueNumber ?? "" }, lang),
    t("line.confirm_timezone", { value: state.defaultUtcOffset ?? "+8" }, lang),
  ].join("\n");
}

export function registerLineBotCallbacks(composer) {
  // linebot_setup_continue:0 — post_install_prompt → ask_bot_id
  composer.callbackQuery(/^linebot_setup_continue:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getLineState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("line.process_expired", {}, lang)); return; }
    await ctx.answerCallbackQuery();
    await setLineState(store, chatId, { ...state, step: "AWAITING_LINE_BOT_ID", promptMessageId: ctx.callbackQuery?.message?.message_id });
    await ctx.reply(t("line.ask_bot_id", {}, lang), { reply_markup: cancelOnlyKeyboard(lang) });
  });

  // linebot_setup_skip:0 — cancel/skip
  composer.callbackQuery(/^linebot_setup_skip:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    if (chatId) await clearLineState(store, chatId);
    await ctx.answerCallbackQuery(t("line.skipped_alert", {}, lang));
    try { await ctx.editMessageText(t("line.skipped_install_message", {}, lang), { reply_markup: { inline_keyboard: [] } }); } catch {}
  });

  // linebot_input_skip:0 — skip current input field
  composer.callbackQuery(/^linebot_input_skip:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getLineState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("line.process_expired", {}, lang)); return; }
    // P1-12：bot_id / channel_id 为必填，不允许跳过
    if (state.step === "AWAITING_LINE_BOT_ID" || state.step === "AWAITING_LINE_CHANNEL_ID") {
      await ctx.answerCallbackQuery(t("line.missing_required", {}, lang));
      return;
    }
    await ctx.answerCallbackQuery();
    // R9 minimal：根据当前 step 跳到下一个或 confirm
    const stepOrder = ["AWAITING_LINE_BOT_ID", "AWAITING_LINE_CHANNEL_ID", "AWAITING_LINE_REPLY_MSG", "AWAITING_LINE_ISSUE_NUMBER", "AWAITING_LINE_UTC_OFFSET"];
    const idx = stepOrder.indexOf(state.step);
    if (idx < 0) { await ctx.answerCallbackQuery(t("line.process_expired", {}, lang)); return; }
    if (state.editMode) {
      await setLineState(store, chatId, { ...state, step: "POST_INSTALL_CONFIRM" });
      await ctx.reply(confirmDetailLines(state, lang), { reply_markup: deployConfirmKeyboard(lang) });
      return;
    }
    const nextStep = stepOrder[idx + 1];
    if (!nextStep) {
      await setLineState(store, chatId, { ...state, step: "POST_INSTALL_CONFIRM" });
      await ctx.reply(confirmDetailLines(state, lang), { reply_markup: deployConfirmKeyboard(lang) });
      return;
    }
    await setLineState(store, chatId, { ...state, step: nextStep, promptMessageId: ctx.callbackQuery?.message?.message_id });
    const nextIsRequired = nextStep === "AWAITING_LINE_BOT_ID" || nextStep === "AWAITING_LINE_CHANNEL_ID";
    const key = nextStep === "AWAITING_LINE_CHANNEL_ID" ? "line.ask_channel_id"
      : nextStep === "AWAITING_LINE_REPLY_MSG" ? "line.ask_reply_msg"
      : nextStep === "AWAITING_LINE_ISSUE_NUMBER" ? "line.ask_issue_number"
      : "line.ask_utc_offset";
    await ctx.reply(t(key, {}, lang), { reply_markup: nextIsRequired ? cancelOnlyKeyboard(lang) : skipKeyboard(lang) });
  });

  // linebot_deploy_confirm:0
  composer.callbackQuery(/^linebot_deploy_confirm:/, async (ctx) => {
    const { store, octokit, d1, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getLineState(store, chatId);
    if (!state || state.step !== "POST_INSTALL_CONFIRM") { await ctx.answerCallbackQuery(t("line.process_expired", {}, lang)); return; }
    if (!state.lineBotId || !state.lineChannelId) { await ctx.answerCallbackQuery(t("line.missing_required", {}, lang)); return; }
    await ctx.answerCallbackQuery(t("line.deploying_alert", {}, lang));
    const requestId = crypto.randomUUID();
    try {
      await octokit.rest.actions.createWorkflowDispatch({
        owner, repo, workflow_id: "install-line-bot.yml", ref: "main",
        inputs: {
          line_bot_id: state.lineBotId, line_bot_channel_id: state.lineChannelId,
          line_default_reply_message: state.lineDefaultReplyMessage ?? "",
          issue_number: state.issueNumber ? String(state.issueNumber) : "",
          default_utc_offset: state.defaultUtcOffset ?? "+8",
        },
      });
      try {
        const { createWorkflowNotification } = await import("../../github/webhooks/workflow-run.js");
        await createWorkflowNotification(d1, { requestId, repo: config.github.repoFullName, workflowName: "install-line-bot", workflowPath: ".github/workflows/install-line-bot.yml", sourceId: "line-bot", issueNumber: state.issueNumber, chatId });
      } catch (e) { logError("log.webhook.handleFailed", { error: e?.message ?? String(e) }); }
    } catch (e) { logError("log.workflow.dispatchFailed", { error: e?.message ?? String(e) }); }
    if (chatId) await clearLineState(store, chatId);
    try { await ctx.editMessageText(t("line.deploying_message", { id: state.lineBotId }, lang), { reply_markup: { inline_keyboard: [] } }); } catch {}
  });

  // linebot_deploy_cancel:0
  composer.callbackQuery(/^linebot_deploy_cancel:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    if (chatId) await clearLineState(store, chatId);
    await ctx.answerCallbackQuery(t("core.cancelled", {}, lang));
    try { await ctx.editMessageText(t("line.deploy_cancelled_message", {}, lang), { reply_markup: { inline_keyboard: [] } }); } catch {}
  });

  // linebot_edit_params:0
  composer.callbackQuery(/^linebot_edit_params:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getLineState(store, chatId);
    if (!state || state.step !== "POST_INSTALL_CONFIRM") { await ctx.answerCallbackQuery(t("line.process_expired", {}, lang)); return; }
    await ctx.answerCallbackQuery();
    const kb = new InlineKeyboard()
      .text(t("line.edit_ask_bot_id", {}, lang), "linebot_edit:bot_id")
      .text(t("line.edit_ask_channel_id", {}, lang), "linebot_edit:channel_id").row()
      .text(t("line.edit_ask_reply_msg", {}, lang), "linebot_edit:reply_msg")
      .text(t("line.edit_ask_issue_number", {}, lang), "linebot_edit:issue_number").row()
      .text(t("line.edit_ask_utc_offset", {}, lang), "linebot_edit:utc_offset")
      .text(t("kb.back", {}, lang), "linebot_edit_back:0");
    await setLineState(store, chatId, { ...state, promptMessageId: ctx.callbackQuery?.message?.message_id });
    await ctx.reply(t("line.edit_select_field", {}, lang), { reply_markup: kb });
  });

  // linebot_edit:<field>
  composer.callbackQuery(/^linebot_edit:(.+)$/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const field = ctx.callbackQuery.data.match(/^linebot_edit:(.+)$/)[1];
    const state = await getLineState(store, chatId);
    if (!state || state.step !== "POST_INSTALL_CONFIRM") { await ctx.answerCallbackQuery(t("line.process_expired", {}, lang)); return; }
    await ctx.answerCallbackQuery();
    const fieldMap = {
      bot_id: { step: "AWAITING_LINE_BOT_ID", key: "line.edit_ask_bot_id" },
      channel_id: { step: "AWAITING_LINE_CHANNEL_ID", key: "line.edit_ask_channel_id" },
      reply_msg: { step: "AWAITING_LINE_REPLY_MSG", key: "line.edit_ask_reply_msg" },
      issue_number: { step: "AWAITING_LINE_ISSUE_NUMBER", key: "line.edit_ask_issue_number" },
      utc_offset: { step: "AWAITING_LINE_UTC_OFFSET", key: "line.edit_ask_utc_offset" },
    };
    const f = fieldMap[field];
    if (!f) { await ctx.answerCallbackQuery(t("line.process_expired", {}, lang)); return; }
    const isRequired = field === "bot_id" || field === "channel_id";
    await setLineState(store, chatId, { ...state, step: f.step, editMode: true, editField: field, promptMessageId: ctx.callbackQuery?.message?.message_id });
    await ctx.reply(t(f.key, {}, lang), { reply_markup: isRequired ? cancelOnlyKeyboard(lang) : skipKeyboard(lang) });
  });

  // linebot_edit_back:0
  composer.callbackQuery(/^linebot_edit_back:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getLineState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("line.process_expired", {}, lang)); return; }
    await ctx.answerCallbackQuery();
    await setLineState(store, chatId, { ...state, step: "POST_INSTALL_CONFIRM", editMode: false });
    await ctx.reply(confirmDetailLines(state, lang), { reply_markup: deployConfirmKeyboard(lang) });
  });
}

// handleLineText — message:text 中 LINE flow 输入
export async function handleLineText(ctx) {
  const { store } = ctx.services;
  const chatId = ctx.chat?.id;
  if (!chatId) return false;
  const text = ctx.message?.text;
  if (!text || text.startsWith("/")) return false;
  const state = await getLineState(store, chatId);
  if (!state) return false;
  const lang = ctx.language ?? glang();
  const stepOrder = ["AWAITING_LINE_BOT_ID", "AWAITING_LINE_CHANNEL_ID", "AWAITING_LINE_REPLY_MSG", "AWAITING_LINE_ISSUE_NUMBER", "AWAITING_LINE_UTC_OFFSET"];
  const idx = stepOrder.indexOf(state.step);
  if (idx < 0) return false;
  const trimmed = text.trim();
  // P1-13：字段格式校验
  const validationStep = state.editMode ? state.editField && {
    bot_id: "AWAITING_LINE_BOT_ID", channel_id: "AWAITING_LINE_CHANNEL_ID", utc_offset: "AWAITING_LINE_UTC_OFFSET",
  }[state.editField] : state.step;
  if (validationStep === "AWAITING_LINE_BOT_ID" && !/^@[\w.-]+$/.test(trimmed)) {
    await ctx.reply(t("line.error_bot_id_format", {}, lang));
    return true;
  }
  if (validationStep === "AWAITING_LINE_CHANNEL_ID" && !/^\d+$/.test(trimmed)) {
    await ctx.reply(t("line.error_channel_id_format", {}, lang));
    return true;
  }
  if (validationStep === "AWAITING_LINE_UTC_OFFSET" && !/^[+-]\d{2}:\d{2}$/.test(trimmed)) {
    await ctx.reply(t("line.error_timezone_format", {}, lang));
    return true;
  }
  const fieldMap = {
    AWAITING_LINE_BOT_ID: "lineBotId", AWAITING_LINE_CHANNEL_ID: "lineChannelId",
    AWAITING_LINE_REPLY_MSG: "lineDefaultReplyMessage", AWAITING_LINE_ISSUE_NUMBER: "issueNumber",
    AWAITING_LINE_UTC_OFFSET: "defaultUtcOffset",
  };
  const newState = { ...state, [fieldMap[state.step]]: trimmed };
  // 删除用户消息
  try { await ctx.api.deleteMessage(chatId, ctx.message.message_id); } catch {}
  if (state.editMode) {
    await setLineState(store, chatId, { ...newState, step: "POST_INSTALL_CONFIRM" });
    await ctx.reply(confirmDetailLines(newState, lang), { reply_markup: deployConfirmKeyboard(lang) });
    return true;
  }
  const nextStep = stepOrder[idx + 1];
  if (!nextStep) {
    await setLineState(store, chatId, { ...newState, step: "POST_INSTALL_CONFIRM" });
    await ctx.reply(confirmDetailLines(newState, lang), { reply_markup: deployConfirmKeyboard(lang) });
    return true;
  }
  await setLineState(store, chatId, { ...newState, step: nextStep });
  const nextIsRequired = nextStep === "AWAITING_LINE_BOT_ID" || nextStep === "AWAITING_LINE_CHANNEL_ID";
  const key = nextStep === "AWAITING_LINE_CHANNEL_ID" ? "line.ask_channel_id"
    : nextStep === "AWAITING_LINE_REPLY_MSG" ? "line.ask_reply_msg"
    : nextStep === "AWAITING_LINE_ISSUE_NUMBER" ? "line.ask_issue_number"
    : "line.ask_utc_offset";
  await ctx.reply(t(key, {}, lang), { reply_markup: nextIsRequired ? cancelOnlyKeyboard(lang) : skipKeyboard(lang) });
  return true;
}