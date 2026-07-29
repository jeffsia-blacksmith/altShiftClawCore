// telegram/flows/new-flow.js — /new 命令 + new-flow 状态机 message:text 续接
// 行为对齐旧 bundle Gs.command("new")（L8112-8124）+ wl awaiting_name（L7558-7572）+ eT 渲染（L7190-7209）。
// R4 阶段：实现 /new step 0（awaiting_name）+ step 1 文本输入（→ awaiting_description）+ cancel。
// 后续子批次：awaiting_description → awaiting_template → 模板选择 → Os finalize（issues.create + orphan 分支 + workflow 写入）。

import { t, glang } from "../../i18n/index.js";
import { InlineKeyboard } from "grammy";
import { getFlowState, setFlowState, clearFlowState } from "./state.js";
import { clearMenuState } from "../../db/kv-state.js";

// eT 渲染（R4 子集：awaiting_name / awaiting_description create 模式）
export function renderFlowPrompt({ step, mode, name }) {
  const lang = glang();
  const kb = new InlineKeyboard().text(t("kb.cancel", {}, lang), "new_flow_cancel:current");

  if (step === "awaiting_name") {
    if (mode === "edit") {
      // edit 模式 R4 暂未完整实现，回退到 create 文案
      const text = [
        t("newFlow.editNamePrompt", { step: "" }, lang),
        t("newFlow.currentName", { name: name ?? "" }, lang),
        "",
        t("newFlow.keepNameHint", {}, lang),
      ].join("\n");
      return { text, reply_markup: kb };
    }
    const text = [
      t("newFlow.enterName", {}, lang),
      "",
      t("newFlow.enterNameExample", {}, lang),
    ].join("\n");
    return { text, reply_markup: kb };
  }

  if (step === "awaiting_description") {
    const text = [
      t("newFlow.enterDescription", { name: name ?? "" }, lang),
      "",
      t("newFlow.enterDescriptionExample", {}, lang),
    ].join("\n");
    return { text, reply_markup: kb };
  }

  // 其他 step（awaiting_template 等）R4 子批次再接
  return { text: t("newFlow.stateInvalid", {}, lang), reply_markup: kb };
}

// /new 命令 — 对齐 Gs.command("new") L8112-8124
export function registerNew(composer) {
  composer.command("new", async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    await clearMenuState(store, chatId);
    await setFlowState(store, chatId, { step: "awaiting_name", mode: "create" });
    const prompt = renderFlowPrompt({ step: "awaiting_name", mode: "create" });
    await ctx.reply(prompt.text, { reply_markup: prompt.reply_markup });
  });
}

// message:text 流程续接 — 对齐 su.on("message:text") 的 Ke 分支 + wl awaiting_name L7558-7572
// 返回 true 表示已被 flow 消费（调用方应跳过默认 comment-on-issue 路径）。
export async function handleFlowText(ctx) {
  const { store } = ctx.services;
  const chatId = ctx.chat?.id;
  if (!chatId) return false;
  const text = ctx.message?.text;
  if (!text || text.startsWith("/")) return false;

  const state = await getFlowState(store, chatId);
  if (!state) return false;

  // R4 子集：仅处理 awaiting_name
  if (state.step === "awaiting_name") {
    const trimmed = text.trim();
    if (!trimmed) {
      await ctx.reply(t("newFlow.enterName", {}, ctx.language ?? glang()));
      return true;
    }
    const newState = { ...state, step: "awaiting_description", name: trimmed };
    await setFlowState(store, chatId, newState);
    const prompt = renderFlowPrompt({ step: "awaiting_description", mode: state.mode, name: trimmed });
    await ctx.reply(prompt.text, { reply_markup: prompt.reply_markup });
    return true;
  }

  // 其他 step 的文本处理在后续子批次接入；这里为避免误吞用户输入，回复引导
  if (state.step === "awaiting_description") {
    // create 模式 → awaiting_template；列已装模板，显示选择键盘
    const trimmed = text.trim();
    const newState = { ...state, step: "awaiting_template", description: trimmed };
    await setFlowState(store, chatId, newState);
    const lang = ctx.language ?? glang();
    // 读取已装模板列表
    let templates = [];
    try {
      const { data } = await ctx.services.octokit.rest.repos.getContent({
        owner: ctx.services.config.github.owner, repo: ctx.services.config.github.repo,
        path: "templates", ref: "main",
      });
      if (Array.isArray(data)) templates = data.filter((d) => d.type === "dir").map((d) => d.name).sort();
    } catch {}
    if (templates.length === 0) {
      await ctx.reply(t("newFlow.noTemplatesInstalled", {}, lang));
      return true;
    }
    const kb = new InlineKeyboard();
    for (const tpl of templates.slice(0, 20)) {
      kb.text(`📦 ${tpl}`, `new_template_select:${tpl}`).row();
    }
    kb.text(t("kb.cancel", {}, lang), "new_flow_cancel:current");
    const promptText = `${t("newFlow.selectTemplate", {}, lang)}\n${t("newFlow.selectTemplateHint", {}, lang)}`;
    await ctx.reply(promptText, { reply_markup: kb });
    return true;
  }

  // awaiting_template 等不接受文本
  const lang = ctx.language ?? glang();
  await ctx.reply(t("newFlow.useButtonsTemplate", {}, lang));
  return true;
}

// new_flow_cancel callback — 对齐 kl（L7920）
export function registerFlowCancel(composer) {
  composer.callbackQuery(/^new_flow_cancel:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id ?? ctx.callbackQuery?.message?.chat?.id;
    const lang = ctx.language ?? glang();
    if (!chatId) {
      await ctx.answerCallbackQuery(t("newFlow.buttonExpiredRetry", {}, lang));
      return;
    }
    const existing = await getFlowState(store, chatId);
    if (!existing) {
      await ctx.answerCallbackQuery(t("newFlow.formExpiredEdit", {}, lang));
      return;
    }
    await clearFlowState(store, chatId);
    await ctx.answerCallbackQuery(t("newFlow.setupCancelled", {}, lang));
    await ctx.editMessageText(t("newFlow.lobsterSetupCancelled", {}, lang), {
      reply_markup: { inline_keyboard: [] },
    });
  });
}