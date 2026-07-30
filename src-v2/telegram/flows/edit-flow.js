// telegram/flows/edit-flow.js — /edit 命令 + 完整多步状态机 + Os finalize
// 行为对齐旧 bundle Rm（L8029-8090）+ wl edit 分支 + bl/_l/Tl/yl edit 分支 + Os（L7407-7532）+ Ns（L7534-7547）。
// 4 步：awaiting_name → awaiting_description → awaiting_template_reset → awaiting_workflow_enabled → Os finalize。

import { t, glang } from "../../i18n/index.js";
import { logError } from "../../i18n/log.js";
import { InlineKeyboard } from "grammy";
import { getActiveIssue, setActiveIssue, clearMenuState } from "../../db/kv-state.js";
import { getFlowState, setFlowState, clearFlowState } from "./state.js";

const EDIT_STEPS = ["awaiting_name", "awaiting_description", "awaiting_template_reset", "awaiting_workflow_enabled"];

// X_(step, total) → "(n/4)"，加尾空格
function progressLabel(step) {
  const idx = EDIT_STEPS.indexOf(step);
  const n = idx >= 0 ? idx + 1 : 1;
  return `(${n}/${EDIT_STEPS.length}) `;
}

// Mn — MarkdownV2 escape current value，未填显示 core.unfilled
function mn(value, lang) {
  if (typeof value !== "string" || !value.trim()) return t("core.unfilled", {}, lang);
  return value.replace(/\s+/g, " ").trim();
}

// Z_(workflowEnabled) → workflowEnabledOn/Off
function workflowStatusText(workflowEnabled, lang) {
  return workflowEnabled !== false
    ? t("newFlow.workflowEnabledOn", {}, lang)
    : t("newFlow.workflowEnabledOff", {}, lang);
}

// ui — 从 issue body 解析 ```json``` 块得 {name, description}
function parseIssueProfile(body, fallbackName) {
  const fb = fallbackName ? { name: fallbackName, description: "" } : null;
  if (typeof body !== "string") return fb;
  const m = body.match(/```json\s*([\s\S]*?)\s*```/i);
  if (!m) return fb;
  try {
    const o = JSON.parse(m[1]);
    if (!o || typeof o !== "object" || Array.isArray(o)) return null;
    return {
      name: (o.name ?? o.title ?? "").trim() || fallbackName || "",
      description: (o.description ?? "").trim(),
    };
  } catch {
    return fb;
  }
}

// kr — 从 issue body 提取 telegram-meta
function parseTelegramMetaFromIssue(body) {
  const m = body?.match(/<!--\s*telegram-meta:\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) return null;
  try {
    const meta = JSON.parse(m[1]);
    if (typeof meta.chat_id !== "number") return null;
    return meta;
  } catch {
    return null;
  }
}

// ci — 构建 issue body（telegram-meta + json 块）
function buildIssueBody(meta, agentProfile) {
  return [
    `<!-- telegram-meta: ${JSON.stringify(meta)} -->`,
    "",
    "```json",
    JSON.stringify({ name: agentProfile.name?.trim(), description: agentProfile.description?.trim() }, null, 2),
    "```",
  ].join("\n");
}

// tn — 列已装模板
async function listInstalledTemplates(octokit, owner, repo) {
  const { data } = await octokit.rest.repos.getContent({ owner, repo, path: "templates", ref: "main" });
  return Array.isArray(data)
    ? data.filter((d) => d.type === "dir" && d.name?.trim()).map((d) => d.name.trim()).sort()
    : [];
}

// jp — workflow 是否启用
async function isWorkflowEnabled(octokit, owner, repo, issueNumber) {
  try {
    const { data } = await octokit.rest.actions.listRepoWorkflows({ owner, repo });
    const wf = data.workflows.find((w) => w.path === `.github/workflows/issue-${issueNumber}.yml`);
    return !!(wf && wf.state !== "disabled_manually");
  } catch {
    return false;
  }
}

// eT 渲染（edit 模式 4 步）
function renderEditPrompt({ step, name, description, workflowEnabled, lang }) {
  const L = lang ?? glang();
  const p = progressLabel(step);
  let lines;
  if (step === "awaiting_name") {
    lines = [
      t("newFlow.editNamePrompt", { step: p }, L),
      t("newFlow.currentName", { name: mn(name, L) }, L),
      "",
      t("newFlow.keepNameHint", {}, L),
    ];
  } else if (step === "awaiting_description") {
    lines = [
      t("newFlow.editDescriptionPrompt", { step: p, name: mn(name, L) }, L),
      t("newFlow.currentDescription", { description: mn(description, L) }, L),
      "",
      t("newFlow.keepDescriptionHint", {}, L),
    ];
  } else if (step === "awaiting_template_reset") {
    lines = [
      t("newFlow.resetTemplatePrompt", { step: p }, L),
      "",
      t("newFlow.resetTemplateHint1", {}, L),
      t("newFlow.resetTemplateHint2", {}, L),
    ];
  } else if (step === "awaiting_workflow_enabled") {
    lines = [
      t("newFlow.setWorkflowEnabledPrompt", { step: p, name: mn(name, L) }, L),
      "",
      t("newFlow.currentWorkflowStatus", { status: workflowStatusText(workflowEnabled, L) }, L),
      "",
      t("newFlow.workflowEnabledHint", {}, L),
    ];
  }
  return { text: lines.join("\n"), reply_markup: editKeyboard(step, L) };
}

// 键盘
function editKeyboard(step, lang) {
  const kb = new InlineKeyboard();
  if (step === "awaiting_name" || step === "awaiting_description") {
    const fieldKey = step === "awaiting_name" ? "newFlow.stepName" : "newFlow.stepDescription";
    const fieldLabel = t(fieldKey, {}, lang);
    kb.text(t("newFlow.keepFieldButton", { step: fieldLabel }, lang), `edit_keep_field:${step}`);
    kb.text(t("kb.cancel", {}, lang), "new_flow_cancel:current");
  } else if (step === "awaiting_template_reset") {
    // 模板按钮由调用方在 renderEditPrompt 外加（Uo）；这里返回 cancel/skip 基底
    kb.text(t("kb.skip", {}, lang), "edit_template_reset:skip");
    kb.text(t("kb.cancel", {}, lang), "new_flow_cancel:current");
  } else if (step === "awaiting_workflow_enabled") {
    kb.text(t("kb.enableSlash", {}, lang), "edit_workflow_enabled:true");
    kb.text(t("kb.disableSlash", {}, lang), "edit_workflow_enabled:false").row();
    kb.text(t("kb.keepCurrentSettings", {}, lang), "edit_keep_field:awaiting_workflow_enabled");
    kb.text(t("kb.cancel", {}, lang), "new_flow_cancel:current");
  }
  return kb;
}

// ml — 解析 enable/disable 文本
function parseEnableDisable(text) {
  if (typeof text !== "string") return null;
  const v = text.trim().toLowerCase();
  if (["true", "1", "yes", "y", "on", "enable", "enabled", "是", "啟用", "启用"].includes(v)) return true;
  if (["false", "0", "no", "n", "off", "disable", "disabled", "否", "停用"].includes(v)) return false;
  return null;
}

// vm — edit 模式 "-" 保留当前值
function applyKeepSentinel(text, current, mode) {
  if (mode === "edit" && text.trim() === "-") return current;
  return text.trim();
}

// Os — edit finalize（L7424-7486）
async function osEditFinalize(ctx, state) {
  const { octokit, store, d1, config } = ctx.services;
  const { owner, repo } = config.github;
  const lang = ctx.language ?? glang();
  const issueNumber = state.issueNumber;

  // 查现有 issue_metadata template
  let existingTemplate = null;
  try {
    const row = await d1.prepare("SELECT template FROM issue_metadata WHERE repo = ? AND issue_number = ? LIMIT 1").bind(config.github.repoFullName, issueNumber).first();
    existingTemplate = row?.template ?? null;
  } catch {}

  const templateChain = [state.template, existingTemplate, "default"].filter(Boolean);

  // 1. 同步 workflow yml（对齐 sT — 每次 edit 都同步）
  for (const tpl of templateChain) {
    try {
      const { syncWorkflowFile } = await import("../../github/branches.js");
      await syncWorkflowFile(octokit, owner, repo, issueNumber, tpl);
      break;
    } catch {}
  }

  // 2. 更新 issue title + body
  const meta = state.originalTelegramMeta ?? { chat_id: ctx.chat?.id };
  const body = buildIssueBody(meta, { name: state.name, description: state.description });
  const { data: updated } = await octokit.rest.issues.update({
    owner, repo, issue_number: issueNumber, title: state.name, body,
  });

  // 3. workflow enable/disable
  if (typeof state.workflowEnabled === "boolean") {
    try {
      const { data: wfList } = await octokit.rest.actions.listRepoWorkflows({ owner, repo });
      const wf = wfList.workflows.find((w) => w.path === `.github/workflows/issue-${issueNumber}.yml`);
      if (wf) {
        if (state.workflowEnabled) {
          await octokit.rest.actions.enableWorkflow({ owner, repo, workflow_id: wf.id });
        } else {
          await octokit.rest.actions.disableWorkflow({ owner, repo, workflow_id: wf.id });
        }
      }
    } catch (e) {
      logError("log.editNew.setWorkflowStateFailed", { error: e?.message ?? String(e) });
    }
  }

  // 4. resetTemplate — 重建 orphan 分支
  let finalTemplate = existingTemplate ?? "default";
  if (state.resetTemplate && state.template) {
    try {
      const { readTemplateFiles, createOrphanBranch, syncWorkflowFile, upsertIssueTemplate } = await import("../../github/branches.js");
      const files = await readTemplateFiles(octokit, owner, repo, state.template, config.personality || "");
      await createOrphanBranch(octokit, owner, repo, `issue-${issueNumber}`, files, `chore: reset issue #${issueNumber} template (template: ${state.template})`);
      await syncWorkflowFile(octokit, owner, repo, issueNumber, state.template);
      finalTemplate = state.template;
    } catch (e) {
      logError("log.editNew.templateResetFailed", { error: e?.message ?? String(e) });
    }
  }

  // 5. D1 upsert issue_metadata（每次 edit 都持久化，对齐 Vr L7486）
  try {
    const { upsertIssueTemplate } = await import("../../github/branches.js");
    await upsertIssueTemplate(d1, config.github.repoFullName, issueNumber, finalTemplate);
  } catch (e) { logError("log.editNew.issueWriteFailed", { error: e?.message ?? String(e) }); }

  const chatId = ctx.chat?.id;
  if (chatId != null) {
    await setActiveIssue(store, issueNumber, chatId);
    await clearFlowState(store, chatId);
  }
  return { issue: { number: updated.number, title: updated.title }, mode: "edit" };
}

// Ns — finalize 回复（L7534-7547）
async function nsFinalizeReply(ctx, result, mode) {
  const lang = ctx.language ?? glang();
  const text = t("newFlow.updatedLobster", { title: result.issue?.title ?? "", number: result.issue?.number ?? "" }, lang);
  if (mode === "edit") {
    try {
      await ctx.editMessageText(text, { reply_markup: { inline_keyboard: [] } });
    } catch {
      await ctx.reply(text);
    }
  } else {
    await ctx.reply(text);
  }
  // status card
  const { sendStatusCard } = await import("../status-card.js");
  if (result.issue?.number) await sendStatusCard(ctx, result.issue.number);
}

// /edit 命令入口
export function registerEdit(composer) {
  composer.command("edit", async (ctx) => {
    await initEditFlow(ctx);
  });
}

export async function initEditFlow(ctx) {
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const lang = ctx.language ?? glang();
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const active = await getActiveIssue(store, chatId);
    if (!active || active <= 0) {
      await ctx.reply(t("newFlow.noActiveLobster", {}, lang));
      return;
    }
    let issueData;
    try {
      const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: active });
      issueData = { number: data.number, title: data.title, body: data.body ?? null };
    } catch {
      await ctx.reply(t("newFlow.readIssueFailedRetry", {}, lang));
      return;
    }
    const profile = parseIssueProfile(issueData.body, issueData.title);
    if (!profile) {
      await ctx.reply(t("newFlow.notCreatedByNewFlow", {}, lang));
      return;
    }
    const wfEnabled = await isWorkflowEnabled(octokit, owner, repo, active);
    const originalMeta = parseTelegramMetaFromIssue(issueData.body);
    const state = {
      step: "awaiting_name", mode: "edit", issueNumber: issueData.number,
      originalTelegramMeta: originalMeta, name: profile.name, description: profile.description,
      workflowEnabled: wfEnabled,
    };
    await clearMenuState(store, chatId);
    await setFlowState(store, chatId, state);
    const prompt = renderEditPrompt({ step: "awaiting_name", name: state.name, description: state.description, workflowEnabled: state.workflowEnabled, lang });
    await ctx.reply(prompt.text, { reply_markup: prompt.reply_markup });
}

// edit callbacks
export function registerEditCallbacks(composer) {
  // edit_keep_field:<step> — bl
  composer.callbackQuery(/^edit_keep_field:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getFlowState(store, chatId);
    if (!state || state.mode !== "edit") {
      await ctx.answerCallbackQuery(t("newFlow.formExpiredEdit", {}, lang));
      return;
    }
    const step = ctx.callbackQuery.data.slice("edit_keep_field:".length);
    if (state.isSubmitting) return;
    if (step !== state.step) {
      await ctx.answerCallbackQuery(t("newFlow.formExpiredEdit", {}, lang));
      return;
    }
    if (step === "awaiting_name") {
      await setFlowState(store, chatId, { ...state, step: "awaiting_description" });
      await ctx.answerCallbackQuery(t("newFlow.nameKept", {}, lang));
      const prompt = renderEditPrompt({ step: "awaiting_description", name: state.name, description: state.description, workflowEnabled: state.workflowEnabled, lang });
      await ctx.editMessageText(prompt.text, { reply_markup: prompt.reply_markup });
    } else if (step === "awaiting_description") {
      const { octokit, config } = ctx.services;
      const { owner, repo } = config.github;
      const templates = await listInstalledTemplates(octokit, owner, repo).catch(() => []);
      if (templates.length === 0) {
        await ctx.answerCallbackQuery();
        await ctx.reply(t("newFlow.noTemplatesInstalled", {}, lang));
        return;
      }
      await setFlowState(store, chatId, { ...state, step: "awaiting_template_reset" });
      await ctx.answerCallbackQuery(t("newFlow.descriptionKept", {}, lang));
      const prompt = renderEditPrompt({ step: "awaiting_template_reset", name: state.name, description: state.description, workflowEnabled: state.workflowEnabled, lang });
      // Uo keyboard: 模板按钮 + skip + cancel
      const kb = new InlineKeyboard();
      for (const tpl of templates.slice(0, 20)) {
        kb.text(`🔄 ${tpl}`, `new_template_select:${tpl}`).row();
      }
      kb.text(t("kb.skip", {}, lang), "edit_template_reset:skip");
      kb.text(t("kb.cancel", {}, lang), "new_flow_cancel:current");
      await ctx.editMessageText(prompt.text, { reply_markup: kb });
    } else if (step === "awaiting_workflow_enabled") {
      const newState = { ...state, isSubmitting: true };
      await setFlowState(store, chatId, newState);
      await ctx.answerCallbackQuery(t("newFlow.workflowSettingKept", {}, lang));
      try {
        const result = await osEditFinalize(ctx, newState);
        await nsFinalizeReply(ctx, result, "edit");
      } catch (e) {
        logError("log.editNew.finishNewFlowFailed", { command: "edit", error: e?.message ?? String(e) });
        await ctx.editMessageText(t("newFlow.updateErrorGeneric", {}, lang));
      }
    }
  });

  // edit_workflow_enabled:true/false — _l
  composer.callbackQuery(/^edit_workflow_enabled:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getFlowState(store, chatId);
    if (!state || state.mode !== "edit" || state.step !== "awaiting_workflow_enabled") {
      await ctx.answerCallbackQuery(t("newFlow.formExpiredEdit", {}, lang));
      return;
    }
    if (state.isSubmitting) return;
    const val = parseEnableDisable(ctx.callbackQuery.data.slice("edit_workflow_enabled:".length));
    if (val == null) {
      await ctx.answerCallbackQuery(t("newFlow.invalidWorkflowValue", {}, lang));
      return;
    }
    const newState = { ...state, workflowEnabled: val, isSubmitting: true };
    await setFlowState(store, chatId, newState);
    await ctx.answerCallbackQuery(val ? t("newFlow.workflowSetEnabled", {}, lang) : t("newFlow.workflowSetDisabled", {}, lang));
    try {
      const result = await osEditFinalize(ctx, newState);
      await nsFinalizeReply(ctx, result, "edit");
    } catch (e) {
      logError("log.editNew.finishNewFlowFailed", { command: "edit", error: e?.message ?? String(e) });
      await ctx.editMessageText(t("newFlow.updateErrorGeneric", {}, lang));
    }
  });

  // edit_template_reset:skip — Tl
  composer.callbackQuery(/^edit_template_reset:skip/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getFlowState(store, chatId);
    if (!state || state.mode !== "edit" || state.step !== "awaiting_template_reset") {
      await ctx.answerCallbackQuery(t("newFlow.formExpiredEdit", {}, lang));
      return;
    }
    const newState = { ...state, step: "awaiting_workflow_enabled", resetTemplate: false };
    await setFlowState(store, chatId, newState);
    await ctx.answerCallbackQuery(t("newFlow.templateResetSkipped", {}, lang));
    const prompt = renderEditPrompt({ step: "awaiting_workflow_enabled", name: newState.name, description: newState.description, workflowEnabled: newState.workflowEnabled, lang });
    await ctx.editMessageText(prompt.text, { reply_markup: prompt.reply_markup });
  });

  // new_template_select:<t> 在 edit 模式 — yl edit branch
  composer.callbackQuery(/^new_template_select:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getFlowState(store, chatId);
    if (!state) {
      await ctx.answerCallbackQuery(t("newFlow.buttonExpiredRetry", {}, lang));
      return;
    }
    const tpl = ctx.callbackQuery.data.slice("new_template_select:".length);
    if (!tpl) { await ctx.answerCallbackQuery(t("newFlow.invalidTemplateChoice", {}, lang)); return; }
    if (state.mode === "edit" && state.step === "awaiting_template_reset") {
      // Revalidate template still exists（对齐旧 bundle yl L7796）
      const { octokit, config } = ctx.services;
      const { owner, repo } = config.github;
      let templates = [];
      try { templates = await listInstalledTemplates(octokit, owner, repo); } catch {}
      if (!templates.includes(tpl)) {
        await ctx.answerCallbackQuery(t("newFlow.templateNoLongerExists", {}, lang));
        await ctx.reply(t("newFlow.templateNotInLobster", { template: tpl }, lang));
        return;
      }
      const newState = { ...state, step: "awaiting_workflow_enabled", template: tpl, resetTemplate: true };
      await setFlowState(store, chatId, newState);
      await ctx.answerCallbackQuery(t("newFlow.templateWillReset", {}, lang));
      const prompt = renderEditPrompt({ step: "awaiting_workflow_enabled", name: newState.name, description: newState.description, workflowEnabled: newState.workflowEnabled, lang });
      await ctx.editMessageText(prompt.text, { reply_markup: prompt.reply_markup });
      return;
    }
    // create 模式：触发 Os create finalize
    if (state.mode === "create") {
      const newState = { ...state, template: tpl, isSubmitting: true };
      await setFlowState(store, chatId, newState);
      await ctx.answerCallbackQuery(t("newFlow.templateSelected", {}, lang));
      try {
        await ctx.editMessageText(t("newFlow.creatingPleaseWait", {}, lang));
      } catch {}
      try {
        const { osCreateFinalize } = await import("../../github/branches.js");
        const result = await osCreateFinalize(ctx, newState);
        // Ns finalize reply (create mode → reply new message)
        const replyText = t("newFlow.createdLobster", { title: result.issue?.title ?? "", number: result.issue?.number ?? "" }, lang);
        await ctx.reply(replyText);
        // 清除 new-flow 状态
        await clearFlowState(store, chatId);
        // 发 status card
        const { sendStatusCard } = await import("../status-card.js");
        await sendStatusCard(ctx, result.issue.number);
      } catch (e) {
        logError("log.editNew.finishNewFlowFailed", { command: "new", error: e?.message ?? String(e) });
        await ctx.reply(t("newFlow.errorCreateFailed", {}, lang));
        await clearFlowState(store, chatId);
      }
      return;
    }
  });
}

// handleEditText — message:text 续接（edit 模式 awaiting_name/description/template_reset/workflow_enabled）
// 返回 true 表示已被 edit flow 消费
export async function handleEditText(ctx) {
  const { store, octokit, config } = ctx.services;
  const { owner, repo } = config.github;
  const chatId = ctx.chat?.id;
  if (!chatId) return false;
  const text = ctx.message?.text;
  if (!text || text.startsWith("/")) return false;
  const state = await getFlowState(store, chatId);
  if (!state || state.mode !== "edit") return false;
  const lang = ctx.language ?? glang();

  if (state.step === "awaiting_name") {
    const name = applyKeepSentinel(text, state.name, "edit");
    const newState = { ...state, step: "awaiting_description", name };
    await setFlowState(store, chatId, newState);
    const prompt = renderEditPrompt({ step: "awaiting_description", name, description: state.description, workflowEnabled: state.workflowEnabled, lang });
    await ctx.reply(prompt.text, { reply_markup: prompt.reply_markup });
    return true;
  }
  if (state.step === "awaiting_description") {
    const description = applyKeepSentinel(text, state.description, "edit");
    const templates = await listInstalledTemplates(octokit, owner, repo).catch(() => []);
    if (templates.length === 0) {
      await ctx.reply(t("newFlow.noTemplatesInstalled", {}, lang));
      return true;
    }
    const newState = { ...state, step: "awaiting_template_reset", description };
    await setFlowState(store, chatId, newState);
    const prompt = renderEditPrompt({ step: "awaiting_template_reset", name: newState.name, description, workflowEnabled: state.workflowEnabled, lang });
    const kb = new InlineKeyboard();
    for (const tpl of templates.slice(0, 20)) {
      kb.text(`🔄 ${tpl}`, `new_template_select:${tpl}`).row();
    }
    kb.text(t("kb.skip", {}, lang), "edit_template_reset:skip");
    kb.text(t("kb.cancel", {}, lang), "new_flow_cancel:current");
    await ctx.reply(prompt.text, { reply_markup: kb });
    return true;
  }
  if (state.step === "awaiting_template_reset") {
    await ctx.reply(t("newFlow.useButtonsTemplateReset", {}, lang));
    return true;
  }
  if (state.step === "awaiting_workflow_enabled") {
    if (state.isSubmitting) {
      await ctx.reply(t("newFlow.updatingPleaseWait", {}, lang));
      return true;
    }
    const val = parseEnableDisable(text);
    if (val == null) {
      const prompt = renderEditPrompt({ step: "awaiting_workflow_enabled", name: state.name, description: state.description, workflowEnabled: state.workflowEnabled, lang });
      await ctx.reply(t("newFlow.enterEnableDisable", {}, lang), { reply_markup: prompt.reply_markup });
      return true;
    }
    const newState = { ...state, workflowEnabled: val, isSubmitting: true };
    await setFlowState(store, chatId, newState);
    try {
      const result = await osEditFinalize(ctx, newState);
      await nsFinalizeReply(ctx, result, "reply");
    } catch (e) {
      logError("log.editNew.finishNewFlowFailed", { command: "edit", error: e?.message ?? String(e) });
      await ctx.reply(t("newFlow.updateErrorRetryEdit", {}, lang));
    }
    return true;
  }
  return false;
}