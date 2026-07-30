// telegram/flows/templates-callbacks.js — /templates 多步安装流回调
// 行为对齐旧 bundle templates_* callbacks（L15307-15658）+ Mf env 收集（L17248-17360）。
// 注意：Mf 路径使用 templates.enterEnvValue/envValueRequired/setEnvFailed/envsSet/confirmInstallTo
//   这些 key 在 en.json/zh-CN.json 中 MISSING → t() 返回字面 key 字符串（必须保留此行为）。

import { t, glang } from "../../i18n/index.js";
import { InlineKeyboard } from "grammy";
import { logError } from "../../i18n/log.js";

const PREFIX = "template-install:";

export async function getTplState(store, chatId) {
  const raw = await store.get(`${PREFIX}${chatId}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
async function setTplState(store, chatId, state) {
  await store.put(`${PREFIX}${chatId}`, JSON.stringify(state), { expirationTtl: 900 });
}
async function clearTplState(store, chatId) {
  await store.delete(`${PREFIX}${chatId}`);
}

async function fetchTemplatesCatalog(config) {
  const url = "https://api.github.com/repos/jeffsia-blacksmith/altShiftClawToolkit/contents/templates?ref=main";
  const resp = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": config.github.apiVersion, "User-Agent": config.github.userAgent },
  });
  if (!resp.ok) return [];
  const data = await resp.json();
  return Array.isArray(data) ? data.filter((d) => d.type === "dir").map((d) => ({ name: d.name })) : [];
}
async function fetchTemplateManifest(config, name) {
  const url = `https://api.github.com/repos/jeffsia-blacksmith/altShiftClawToolkit/contents/templates/${name}/githubclaw.json?ref=main`;
  const resp = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": config.github.apiVersion, "User-Agent": config.github.userAgent },
  });
  if (!resp.ok) return {};
  const data = await resp.json();
  if (data.content) return JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
  return {};
}
async function isTemplateInstalled(octokit, owner, repo, name) {
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path: `templates/${name}`, ref: "main" });
    return Array.isArray(data) && data.length > 0;
  } catch { return false; }
}
async function listRepoSecrets(octokit, owner, repo) {
  try {
    const { data } = await octokit.rest.actions.listRepoSecrets({ owner, repo });
    return new Set(data.secrets.map((s) => s.name.toUpperCase()));
  } catch { return new Set(); }
}
async function setRepoSecret(octokit, owner, repo, name, value) {
  await octokit.rest.actions.createOrUpdateRepoSecret({ owner, repo, secret_name: name.toUpperCase(), encrypted_value: value });
}

function templatesListKeyboard(list, page, installedSet, lang) {
  const k = new InlineKeyboard();
  const pageSize = 8;
  const start = page * pageSize;
  const slice = list.slice(start, start + pageSize);
  let col = 0;
  for (let i = start; i < start + slice.length; i++) {
    const s = list[i - start];
    const label = installedSet.has(s.name) ? `📦 ${s.name} ✅` : `📦 ${s.name}`;
    k.text(label, `templates_pick:${i}`);
    col++;
    if (col >= 2) { k.row(); col = 0; }
  }
  if (col > 0) k.row();
  if (page > 0) k.text(t("kb.prevPage", {}, lang), `templates_page:${page - 1}`);
  if (start + pageSize < list.length) k.text(t("kb.nextPage", {}, lang), `templates_page:${page + 1}`);
  k.row().text(t("kb.cancel", {}, lang), "templates_cancel:0");
  return k;
}
function previewKeyboard(lang) {
  return new InlineKeyboard()
    .text(t("kb.confirmInstall", {}, lang), "templates_preview_confirm:0")
    .text(t("kb.backOneStep", {}, lang), "templates_preview_back:0")
    .row().text(t("kb.cancel", {}, lang), "templates_cancel:0");
}
function overwriteKeyboard(lang) {
  return new InlineKeyboard()
    .text(t("kb.overwriteInstall", {}, lang), "templates_overwrite:0")
    .row().text(t("kb.cancel", {}, lang), "templates_cancel:0");
}
function confirmKeyboard(lang) {
  return new InlineKeyboard()
    .text(t("kb.install", {}, lang), "templates_confirm:0")
    .row().text(t("kb.cancel", {}, lang), "templates_cancel:0");
}
function envCancelKeyboard(lang) {
  return new InlineKeyboard().text(t("kb.cancelSetup", {}, lang), "templates_env_cancel:0");
}
function secretsMissingKeyboard(lang) {
  return new InlineKeyboard()
    .text(t("kb.setNow", {}, lang), "templates_env_setup:0")
    .row().text(t("kb.cancel", {}, lang), "templates_env_cancel:0");
}
function secretsAllSetKeyboard(lang) {
  return new InlineKeyboard()
    .text(t("kb.resetAll", {}, lang), "templates_env_resetall:0")
    .text(t("kb.keepAllExisting", {}, lang), "templates_env_keepall:0");
}
function secretsMixedKeyboard(lang) {
  return new InlineKeyboard()
    .text(t("kb.setMissing", {}, lang), "templates_env_setup:0")
    .text(t("kb.resetAllEnvVars", {}, lang), "templates_env_resetall:0")
    .row().text(t("kb.cancel", {}, lang), "templates_env_cancel:0");
}
function modelKeyboard(models, lang) {
  const k = new InlineKeyboard();
  let col = 0;
  models.forEach((m, i) => {
    k.text(m.label ?? m.value, `templates_model_pick:${i}`);
    col++;
    if (col >= 2) { k.row(); col = 0; }
  });
  if (col > 0) k.row();
  return k;
}

export function registerTemplateCallbacks(composer) {
  // templates_pick:<index>
  composer.callbackQuery(/^templates_pick:/, async (ctx) => {
    const { store, config } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getTplState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("templates.process_expired", {}, lang)); return; }
    const idx = parseInt(ctx.callbackQuery.data.slice("templates_pick:".length), 10);
    const list = await fetchTemplatesCatalog(config).catch(() => []);
    const name = list[idx]?.name ?? "";
    if (!name) { await ctx.answerCallbackQuery(t("templates.not_found", {}, lang)); return; }
    await setTplState(store, chatId, { ...state, step: "preview", templateName: name });
    await ctx.answerCallbackQuery();
    const manifest = await fetchTemplateManifest(config, name).catch(() => ({}));
    const displayName = manifest.name || name;
    const desc = manifest.description ? `\n\n${manifest.description}` : "";
    await ctx.editMessageText(t("templates.install_prompt", { name: displayName, desc }, lang), { reply_markup: previewKeyboard(lang) });
  });

  // templates_preview_confirm:0
  composer.callbackQuery(/^templates_preview_confirm:/, async (ctx) => {
    const { store, octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getTplState(store, chatId);
    const tplName = state?.templateName?.trim();
    if (!state || !tplName) { await ctx.answerCallbackQuery(t("templates.process_expired", {}, lang)); return; }
    await ctx.answerCallbackQuery();
    if (await isTemplateInstalled(octokit, owner, repo, tplName)) {
      await setTplState(store, chatId, { ...state, step: "confirm_overwrite" });
      await ctx.editMessageText(t("templates.confirm_overwrite", { name: tplName }, lang), { reply_markup: overwriteKeyboard(lang) });
      return;
    }
    const manifest = await fetchTemplateManifest(config, tplName).catch(() => ({}));
    if (manifest.needModel && manifest.modelVar && manifest.models?.length) {
      await setTplState(store, chatId, { ...state, step: "select_model", modelVar: manifest.modelVar });
      await ctx.editMessageText(t("templates.select_model_prompt", { name: tplName }, lang), { reply_markup: modelKeyboard(manifest.models, lang) });
      return;
    }
    await enterTemplateEnvCheck(ctx, tplName, state, lang);
  });

  // templates_preview_back:0
  composer.callbackQuery(/^templates_preview_back:/, async (ctx) => {
    const { store, octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getTplState(store, chatId);
    if (!state) return;
    await setTplState(store, chatId, { ...state, step: "selecting", templateName: "" });
    const list = await fetchTemplatesCatalog(config).catch(() => []);
    const installedSet = new Set();
    await Promise.all(list.map(async (c) => { if (await isTemplateInstalled(octokit, owner, repo, c.name)) installedSet.add(c.name); }));
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t("templates.selectInstallTo", {}, lang), { reply_markup: templatesListKeyboard(list, 0, installedSet, lang) });
  });

  // templates_overwrite:0
  composer.callbackQuery(/^templates_overwrite:/, async (ctx) => {
    const { store, config } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getTplState(store, chatId);
    const tplName = state?.templateName?.trim();
    if (!state || !tplName) { await ctx.answerCallbackQuery(t("templates.process_expired", {}, lang)); return; }
    await ctx.answerCallbackQuery();
    const manifest = await fetchTemplateManifest(config, tplName).catch(() => ({}));
    if (manifest.needModel && manifest.modelVar && manifest.models?.length) {
      await setTplState(store, chatId, { ...state, step: "select_model", modelVar: manifest.modelVar });
      await ctx.editMessageText(t("templates.select_model_prompt", { name: tplName }, lang), { reply_markup: modelKeyboard(manifest.models, lang) });
      return;
    }
    await enterTemplateEnvCheck(ctx, tplName, state, lang);
  });

  // templates_model_pick:<index>
  composer.callbackQuery(/^templates_model_pick:/, async (ctx) => {
    const { store, octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const idx = parseInt(ctx.callbackQuery.data.slice("templates_model_pick:".length), 10);
    if (Number.isNaN(idx)) { await ctx.answerCallbackQuery(t("templates.model_format_error", {}, lang)); return; }
    const state = await getTplState(store, chatId);
    const tplName = state?.templateName?.trim();
    if (!state || state.step !== "select_model" || !tplName) { await ctx.answerCallbackQuery(t("templates.process_expired", {}, lang)); return; }
    const manifest = await fetchTemplateManifest(config, tplName).catch(() => ({}));
    const modelVar = manifest.modelVar || state.modelVar;
    const model = manifest.models?.[idx];
    const value = model?.value?.trim();
    if (!modelVar) { await ctx.answerCallbackQuery(t("templates.process_expired", {}, lang)); return; }
    if (!value) { await ctx.answerCallbackQuery(t("templates.model_not_found", {}, lang)); return; }
    await ctx.answerCallbackQuery(t("templates.saving_model", {}, lang));
    try { await octokit.rest.actions.updateRepoVariable({ owner, repo, name: modelVar, value }); }
    catch { try { await octokit.rest.actions.createRepoVariable({ owner, repo, name: modelVar, value }); } catch {} }
    await enterTemplateEnvCheck(ctx, tplName, { ...state, selectedModel: value, modelVar }, lang);
  });

  // templates_confirm:0
  composer.callbackQuery(/^templates_confirm:/, async (ctx) => {
    const { store, octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getTplState(store, chatId);
    const tplName = state?.templateName?.trim();
    if (!state || !tplName) { await ctx.answerCallbackQuery(t("templates.process_expired", {}, lang)); return; }
    await ctx.answerCallbackQuery(t("templates.installing", {}, lang));
    const requestId = crypto.randomUUID();
    try {
      await octokit.rest.actions.createWorkflowDispatch({
        owner, repo, workflow_id: "templates.yml", ref: "main",
        inputs: { template_name: tplName, request_id: requestId },
      });
      try {
        const { createWorkflowNotification } = await import("../../github/webhooks/workflow-run.js");
        const { d1 } = ctx.services;
        await createWorkflowNotification(d1, { requestId, workflowPath: ".github/workflows/templates.yml", sourceId: tplName, chatId });
      } catch (e) { logError("log.webhook.handleFailed", { error: e?.message ?? String(e) }); }
    } catch (e) { logError("log.workflow.dispatchFailed", { error: e?.message ?? String(e) }); }
    await clearTplState(store, chatId);
    await ctx.editMessageText(t("templates.installing_progress", { name: tplName }, lang), { reply_markup: { inline_keyboard: [] } });
  });

  // templates_cancel:0
  composer.callbackQuery(/^templates_cancel:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    if (chatId) await clearTplState(store, chatId);
    await ctx.answerCallbackQuery(t("core.cancelled", {}, lang));
    try { await ctx.editMessageText(t("templates.install_cancelled", {}, lang), { reply_markup: { inline_keyboard: [] } }); } catch {}
  });

  // templates_env_setup:0
  composer.callbackQuery(/^templates_env_setup:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getTplState(store, chatId);
    if (!state || state.step !== "env_warning") { await ctx.answerCallbackQuery(t("templates.process_expired", {}, lang)); return; }
    const pending = state.pendingEnvs ?? [];
    if (pending.length === 0) { await goToTemplateConfirm(ctx, state, lang); return; }
    await ctx.answerCallbackQuery();
    await setTplState(store, chatId, { ...state, step: "awaiting_env", currentEnvIndex: 0, collectedEnvs: {}, promptMessageId: ctx.callbackQuery?.message?.message_id });
    await ctx.editMessageText(t("templates.enter_env_value", { envName: pending[0], total: pending.length }, lang), { reply_markup: envCancelKeyboard(lang) });
  });

  // templates_env_skip:0 (dead handler, registered for parity)
  composer.callbackQuery(/^templates_env_skip:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getTplState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("templates.process_expired", {}, lang)); return; }
    await ctx.answerCallbackQuery(t("templates.env_skipped", {}, lang));
    await goToTemplateConfirm(ctx, state, lang);
  });

  // templates_env_resetall:0
  composer.callbackQuery(/^templates_env_resetall:/, async (ctx) => {
    const { store, octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getTplState(store, chatId);
    if (!state || state.step !== "env_warning") { await ctx.answerCallbackQuery(t("templates.process_expired", {}, lang)); return; }
    const manifest = await fetchTemplateManifest(config, state.templateName).catch(() => ({}));
    const requiredEnvs = manifest.requireEnv ?? [];
    if (requiredEnvs.length === 0) { await goToTemplateConfirm(ctx, state, lang); return; }
    await ctx.answerCallbackQuery();
    await setTplState(store, chatId, { ...state, step: "awaiting_env", pendingEnvs: requiredEnvs, currentEnvIndex: 0, collectedEnvs: {}, promptMessageId: ctx.callbackQuery?.message?.message_id });
    await ctx.editMessageText(t("templates.enter_env_value", { envName: requiredEnvs[0], total: requiredEnvs.length }, lang), { reply_markup: envCancelKeyboard(lang) });
  });

  // templates_env_keepall:0
  composer.callbackQuery(/^templates_env_keepall:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getTplState(store, chatId);
    if (!state || state.step !== "env_warning") { await ctx.answerCallbackQuery(t("templates.process_expired", {}, lang)); return; }
    await ctx.answerCallbackQuery(t("templates.env_keepall", {}, lang));
    await goToTemplateConfirm(ctx, state, lang);
  });

  // templates_env_cancel:0
  composer.callbackQuery(/^templates_env_cancel:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    if (chatId) await clearTplState(store, chatId);
    await ctx.answerCallbackQuery(t("core.cancelled", {}, lang));
    try { await ctx.editMessageText(t("templates.install_cancelled", {}, lang), { reply_markup: { inline_keyboard: [] } }); } catch {}
  });

  // templates_page:<n>
  composer.callbackQuery(/^templates_page:/, async (ctx) => {
    const { store, octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getTplState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("templates.process_expired", {}, lang)); return; }
    const page = parseInt(ctx.callbackQuery.data.slice("templates_page:".length), 10) || 0;
    const list = await fetchTemplatesCatalog(config).catch(() => []);
    const installedSet = new Set();
    await Promise.all(list.map(async (c) => { if (await isTemplateInstalled(octokit, owner, repo, c.name)) installedSet.add(c.name); }));
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t("templates.selectInstallTo", {}, lang), { reply_markup: templatesListKeyboard(list, page, installedSet, lang) });
  });
}

// enterTemplateEnvCheck — Yl 等价
async function enterTemplateEnvCheck(ctx, tplName, state, lang) {
  const { store, octokit, config } = ctx.services;
  const { owner, repo } = config.github;
  const chatId = ctx.chat?.id;
  const manifest = await fetchTemplateManifest(config, tplName).catch(() => ({}));
  const requiredEnvs = manifest.requireEnv ?? [];
  if (requiredEnvs.length === 0) { await goToTemplateConfirm(ctx, { ...state, templateName: tplName }, lang); return; }
  const existingSecrets = await listRepoSecrets(octokit, owner, repo);
  const existing = requiredEnvs.filter((e) => existingSecrets.has(e.toUpperCase()));
  const missing = requiredEnvs.filter((e) => !existingSecrets.has(e.toUpperCase()));
  if (missing.length === 0) {
    await setTplState(store, chatId, { ...state, step: "env_warning", pendingEnvs: requiredEnvs });
    const list = existing.map((e) => `✅ \`${e}\``).join("\n");
    await ctx.editMessageText(t("templates.secrets_all_set", { name: tplName, list }, lang), { reply_markup: secretsAllSetKeyboard(lang) });
  } else if (existing.length === 0) {
    await setTplState(store, chatId, { ...state, step: "env_warning", pendingEnvs: missing });
    const list = missing.map((e) => `🔵 \`${e}\``).join("\n");
    await ctx.editMessageText(t("templates.secrets_missing", { name: tplName, list }, lang), { reply_markup: secretsMissingKeyboard(lang) });
  } else {
    await setTplState(store, chatId, { ...state, step: "env_warning", pendingEnvs: missing });
    const setList = existing.map((e) => t("templates.env_set", { env: e }, lang));
    const missList = missing.map((e) => t("templates.env_missing", { env: e }, lang));
    const list = [...setList, ...missList].join("\n");
    await ctx.editMessageText(t("templates.secrets_status", { name: tplName, list }, lang), { reply_markup: secretsMixedKeyboard(lang) });
  }
}

// goToTemplateConfirm — Qs 等价
async function goToTemplateConfirm(ctx, state, lang) {
  const { store } = ctx.services;
  const chatId = ctx.chat?.id;
  await setTplState(store, chatId, { ...state, step: "confirm_install" });
  const modelLine = state.selectedModel ? t("templates.model_line", { model: state.selectedModel }, lang) : "";
  await ctx.editMessageText(t("templates.confirm_install", { name: state.templateName, modelLine }, lang), { reply_markup: confirmKeyboard(lang) });
}

// handleTemplateEnvText — Mf 等价，message:text 中 awaiting_env 步骤
// 注意：使用 MISSING key（templates.enterEnvValue 等）→ t() 返回字面 key 字符串（保留旧 bundle 行为）
export async function handleTemplateEnvText(ctx) {
  const { store, octokit, config } = ctx.services;
  const { owner, repo } = config.github;
  const chatId = ctx.chat?.id;
  if (!chatId) return false;
  const text = ctx.message?.text;
  if (!text || text.startsWith("/")) return false;
  const state = await getTplState(store, chatId);
  if (!state || state.step !== "awaiting_env") return false;
  const lang = ctx.language ?? glang();
  const envs = state.pendingEnvs ?? [];
  const idx = state.currentEnvIndex ?? 0;
  const envName = envs[idx];
  const collected = { ...(state.collectedEnvs ?? {}) };
  const trimmed = text.trim();
  if (!trimmed) {
    // MISSING key → 字面 "templates.envValueRequired"
    const replyText = t("templates.envValueRequired", {}, lang);
    if (state.promptMessageId) { try { await ctx.api.editMessageText(chatId, state.promptMessageId, replyText, { reply_markup: envCancelKeyboard(lang) }); } catch { await ctx.reply(replyText, { reply_markup: envCancelKeyboard(lang) }); } }
    else { await ctx.reply(replyText, { reply_markup: envCancelKeyboard(lang) }); }
    return true;
  }
  collected[envName] = trimmed;
  try { await ctx.api.deleteMessage(chatId, ctx.message.message_id); } catch {}
  const next = idx + 1;
  if (next < envs.length) {
    // MISSING key → 字面 "templates.enterEnvValue"
    const replyText = t("templates.enterEnvValue", { name: envs[next], current: next + 1, total: envs.length }, lang);
    await setTplState(store, chatId, { ...state, collectedEnvs: collected, currentEnvIndex: next });
    if (state.promptMessageId) { try { await ctx.api.editMessageText(chatId, state.promptMessageId, replyText, { reply_markup: envCancelKeyboard(lang) }); } catch { await ctx.reply(replyText, { reply_markup: envCancelKeyboard(lang) }); } }
    else { await ctx.reply(replyText, { reply_markup: envCancelKeyboard(lang) }); }
  } else {
    // 全部收集完 → 写 secrets + confirm
    for (const [name, val] of Object.entries(collected)) {
      const upperName = name.trim().toUpperCase();
      const trimmedVal = val.trim();
      if (!upperName || !trimmedVal) continue;
      try { await setRepoSecret(octokit, owner, repo, upperName, trimmedVal); }
      catch (e) { await ctx.reply(t("templates.setEnvFailed", { name, error: e.message }, lang)); }
    }
    await setTplState(store, chatId, { ...state, step: "confirm_install", envCheckDone: true, collectedEnvs: {}, pendingEnvs: [], currentEnvIndex: 0 });
    // MISSING key → 字面 "templates.envsSet" + "templates.confirmInstallTo"
    const envsSetLine = t("templates.envsSet", { count: Object.keys(collected).length }, lang);
    const confirmLine = t("templates.confirmInstallTo", { templateName: state.templateName }, lang);
    const replyText = `${envsSetLine}\n\n${confirmLine}`;
    if (state.promptMessageId) { try { await ctx.api.editMessageText(chatId, state.promptMessageId, replyText, { reply_markup: confirmKeyboard(lang) }); } catch { await ctx.reply(replyText, { reply_markup: confirmKeyboard(lang) }); } }
    else { await ctx.reply(replyText, { reply_markup: confirmKeyboard(lang) }); }
  }
  return true;
}