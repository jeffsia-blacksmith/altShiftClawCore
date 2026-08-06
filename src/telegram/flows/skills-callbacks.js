// telegram/flows/skills-callbacks.js — /skills 多步安装流回调
// 行为对齐旧 bundle skills_* callbacks（L14849-15175）+ Pm env 收集（L12681-12716）。

import { t, glang } from "../../i18n/index.js";
import { InlineKeyboard } from "grammy";
import { logError, logWarn } from "../../i18n/log.js";
import { setRepoSecret } from "../../github/secrets.js";
import { escapeMarkdownV2 } from "../markdown.js";

const PREFIX = "skill-install:";

export async function getSkillState(store, chatId) {
  const raw = await store.get(`${PREFIX}${chatId}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
async function setSkillState(store, chatId, state) {
  await store.put(`${PREFIX}${chatId}`, JSON.stringify(state), { expirationTtl: 900 });
}
async function clearSkillState(store, chatId) {
  await store.delete(`${PREFIX}${chatId}`);
}

// Vt — target 标签（对齐旧 bundle Vt L14787: escape title + \\#）
function targetLabel(state, lang) {
  const L = lang ?? glang();
  return state.issueTitle
    ? `🦞 ${escapeMarkdownV2(state.issueTitle)} \\#${state.issueNumber}`
    : `🦞 \\#${state.issueNumber}`;
}

// 键盘 builders
function kb(ls) { return new InlineKeyboard(); }
function skillsListKeyboard(skills, page, installedSet, lang) {
  const k = new InlineKeyboard();
  const pageSize = 8;
  const start = page * pageSize;
  const slice = skills.slice(start, start + pageSize);
  let col = 0;
  for (const s of slice) {
    const label = installedSet.has(s.name) ? `📦 ${s.name} ✅` : `📦 ${s.name}`;
    k.text(label, `skills_pick:${s.name}`);
    col++;
    if (col >= 2) { k.row(); col = 0; }
  }
  if (col > 0) k.row();
  if (page > 0) k.text(t("kb.prevPage", {}, lang), `skills_page:${page - 1}`);
  if (start + pageSize < skills.length) k.text(t("kb.nextPage", {}, lang), `skills_page:${page + 1}`);
  k.row().text(t("kb.cancel", {}, lang), "skills_cancel:0");
  return k;
}
function previewKeyboard(name, lang) {
  return new InlineKeyboard()
    .text(t("kb.confirmInstall", {}, lang), `skills_preview_confirm:${name}`)
    .text(t("kb.backOneStep", {}, lang), "skills_preview_back:0")
    .row().text(t("kb.cancel", {}, lang), "skills_cancel:0");
}
function installedPreviewKeyboard(name, lang) {
  return new InlineKeyboard()
    .text(t("kb.removeFromList", {}, lang), `skills_remove_from_list:${name}`)
    .text(t("kb.updateFromList", {}, lang), `skills_update_from_list:${name}`)
    .row().text(t("kb.backOneStep", {}, lang), "skills_preview_back:0");
}
function overwriteKeyboard(name, lang) {
  return new InlineKeyboard()
    .text(t("kb.overwriteInstall", {}, lang), `skills_overwrite:${name}`)
    .row().text(t("kb.cancel", {}, lang), "skills_cancel:0");
}
function confirmKeyboard(name, lang) {
  return new InlineKeyboard()
    .text(t("kb.install", {}, lang), `skills_confirm:${name}`)
    .row().text(t("kb.cancel", {}, lang), "skills_cancel:0");
}
function existingSecretKeyboard(lang) {
  return new InlineKeyboard()
    .text(t("kb.reuseExistingValue", {}, lang), "skills_existing_secret:reuse")
    .text(t("kb.reenterValue", {}, lang), "skills_existing_secret:modify")
    .row().text(t("kb.cancel", {}, lang), "skills_cancel:0");
}
function envCancelKeyboard(lang) {
  return new InlineKeyboard().text(t("kb.cancel", {}, lang), "skills_cancel:0");
}
function removeConfirmKeyboard(name, lang) {
  return new InlineKeyboard()
    .text(t("kb.confirmRemove", {}, lang), `skills_remove_confirm_from_list:${name}`)
    .text(t("kb.backOneStep", {}, lang), `skills_remove_back:${name}`);
}

// 远端技能元数据 fetch
async function fetchSkillMeta(config, skillName) {
  const url = `https://api.github.com/repos/jeffsia-blacksmith/altShiftClawToolkit/contents/skills/${skillName}/githubclaw.json?ref=main`;
  const resp = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": config.github.apiVersion, "User-Agent": config.github.userAgent },
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  if (data.content) return JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
  return null;
}
async function fetchSkillsCatalog(config) {
  const url = "https://api.github.com/repos/jeffsia-blacksmith/altShiftClawToolkit/contents/skills?ref=main";
  const resp = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": config.github.apiVersion, "User-Agent": config.github.userAgent },
  });
  if (!resp.ok) return [];
  const data = await resp.json();
  return Array.isArray(data) ? data.filter((d) => d.type === "dir").map((d) => ({ name: d.name })) : [];
}

// 已装技能列表
async function listInstalledSkills(octokit, owner, repo, issueNumber) {
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path: `.agents/skills`, ref: `issue-${issueNumber}` });
    return Array.isArray(data) ? data.filter((d) => d.type === "dir").map((d) => d.name) : [];
  } catch { return []; }
}

// repo secret 列表
async function listRepoSecrets(octokit, owner, repo) {
  try {
    const { data } = await octokit.rest.actions.listRepoSecrets({ owner, repo });
    return new Set(data.secrets.map((s) => s.name.toUpperCase()));
  } catch { return new Set(); }
}

export function registerSkillCallbacks(composer) {
  // skills_pick:<name>
  composer.callbackQuery(/^skills_pick:/, async (ctx) => {
    const { store, config } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getSkillState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("skills.process_expired", {}, lang)); return; }
    const skillName = ctx.callbackQuery.data.slice("skills_pick:".length);
    await ctx.answerCallbackQuery();
    const meta = await fetchSkillMeta(config, skillName).catch(() => null);
    const name = escapeMarkdownV2(meta?.name || skillName);
    const desc = meta?.description ? `\n\n${escapeMarkdownV2(meta.description)}` : "";
    const target = targetLabel(state, lang);
    if ((state.installedSkills ?? []).includes(skillName)) {
      await setSkillState(store, chatId, { ...state, step: "preview_installed", skillName });
      await ctx.editMessageText(t("skills.installed_preview", { skillName: name, description: desc, target }, lang), { parse_mode: "MarkdownV2", reply_markup: installedPreviewKeyboard(skillName, lang) });
    } else {
      await setSkillState(store, chatId, { ...state, step: "preview", skillName });
      await ctx.editMessageText(t("skills.preview", { skillName: name, description: desc, target }, lang), { parse_mode: "MarkdownV2", reply_markup: previewKeyboard(skillName, lang) });
    }
  });

  // skills_preview_confirm:<name>
  composer.callbackQuery(/^skills_preview_confirm:/, async (ctx) => {
    const { store, octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getSkillState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("skills.process_expired", {}, lang)); return; }
    const skillName = ctx.callbackQuery.data.slice("skills_preview_confirm:".length);
    await ctx.answerCallbackQuery();
    // 检查是否已装
    let alreadyInstalled = false;
    try {
      await octokit.rest.repos.getContent({ owner, repo, path: `.agents/skills/${skillName}`, ref: `issue-${state.issueNumber}` });
      alreadyInstalled = true;
    } catch {}
    if (alreadyInstalled) {
      await setSkillState(store, chatId, { ...state, step: "confirm_overwrite", skillName });
      await ctx.editMessageText(t("skills.confirm_overwrite", { skillName: escapeMarkdownV2(skillName), target: targetLabel(state, lang) }, lang), { parse_mode: "MarkdownV2", reply_markup: overwriteKeyboard(skillName, lang) });
      return;
    }
    // env check
    await enterEnvCheck(ctx, skillName, state, lang);
  });

  // skills_preview_back:0
  composer.callbackQuery(/^skills_preview_back:/, async (ctx) => {
    const { store, config } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getSkillState(store, chatId);
    if (!state) return;
    await setSkillState(store, chatId, { ...state, step: "selecting", skillName: "" });
    const skills = await fetchSkillsCatalog(config).catch(() => []);
    await ctx.answerCallbackQuery();
    const installedSet = new Set(state.installedSkills ?? []);
    await ctx.editMessageText(t("skills.select_install", { target: targetLabel(state, lang) }, lang), { parse_mode: "MarkdownV2", reply_markup: skillsListKeyboard(skills, 0, installedSet, lang) });
  });

  // skills_update_from_list:<name>
  composer.callbackQuery(/^skills_update_from_list:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getSkillState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("skills.process_expired", {}, lang)); return; }
    const skillName = ctx.callbackQuery.data.slice("skills_update_from_list:".length);
    await ctx.answerCallbackQuery();
    await enterEnvCheck(ctx, skillName, state, lang);
  });

  // skills_remove_from_list:<name>
  composer.callbackQuery(/^skills_remove_from_list:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getSkillState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("skills.process_expired", {}, lang)); return; }
    const skillName = ctx.callbackQuery.data.slice("skills_remove_from_list:".length);
    await setSkillState(store, chatId, { ...state, step: "remove_confirm_from_list", skillName });
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t("skills.remove_confirm", { target: targetLabel(state, lang), name: escapeMarkdownV2(skillName) }, lang), { parse_mode: "MarkdownV2", reply_markup: removeConfirmKeyboard(skillName, lang) });
  });

  // skills_remove_confirm_from_list:<name>
  composer.callbackQuery(/^skills_remove_confirm_from_list:/, async (ctx) => {
    const { store, octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getSkillState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("skills.process_expired", {}, lang)); return; }
    const skillName = ctx.callbackQuery.data.slice("skills_remove_confirm_from_list:".length);
    const requestId = crypto.randomUUID();
    let dispatchFailed = null;
    try {
      await octokit.rest.actions.createWorkflowDispatch({
        owner, repo, workflow_id: "remove-skill.yml", ref: "main",
        inputs: { skill_name: skillName, issue_number: String(state.issueNumber), request_id: requestId },
      });
      try {
        const { createWorkflowNotification } = await import("../../github/webhooks/workflow-run.js");
        const { d1, config } = ctx.services;
        await createWorkflowNotification(d1, { requestId, repo: config.github.repoFullName, workflowName: "remove-skill", workflowPath: ".github/workflows/remove-skill.yml", title: ctx.callbackQuery?.message?.text ?? "", channel: "telegram", messageId: ctx.callbackQuery?.message?.message_id ?? null, sourceId: skillName, sourceType: "skill_remove", chatId, payloadJson: JSON.stringify({ issue_number: state.issueNumber }) });
      } catch (e) { logWarn("log.webhook.handleFailed", { error: e?.message ?? String(e) }); }
    } catch (e) {
      dispatchFailed = e?.message ?? String(e);
      logError("log.workflow.dispatchFailed", { error: dispatchFailed });
    }
    await clearSkillState(store, chatId);
    await ctx.answerCallbackQuery(t("skills.removing", {}, lang));
    if (dispatchFailed) {
      await ctx.editMessageText(t("skills.remove_dispatch_failed", { name: escapeMarkdownV2(skillName), error: escapeMarkdownV2(dispatchFailed) }, lang), { parse_mode: "MarkdownV2", reply_markup: { inline_keyboard: [] } });
    } else {
      await ctx.editMessageText(t("skills.removing_progress", { name: escapeMarkdownV2(skillName), target: targetLabel(state, lang) }, lang), { parse_mode: "MarkdownV2", reply_markup: { inline_keyboard: [] } });
    }
  });

  // skills_remove_back:<name>
  composer.callbackQuery(/^skills_remove_back:/, async (ctx) => {
    const { store, config } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getSkillState(store, chatId);
    if (!state) return;
    const skillName = ctx.callbackQuery.data.slice("skills_remove_back:".length);
    await setSkillState(store, chatId, { ...state, step: "preview_installed", skillName });
    await ctx.answerCallbackQuery();
    const meta = await fetchSkillMeta(config, skillName).catch(() => null);
    const name = escapeMarkdownV2(meta?.name || skillName);
    const desc = meta?.description ? `\n\n${escapeMarkdownV2(meta.description)}` : "";
    await ctx.editMessageText(t("skills.installed_preview", { skillName: name, description: desc, target: targetLabel(state, lang) }, lang), { parse_mode: "MarkdownV2", reply_markup: installedPreviewKeyboard(skillName, lang) });
  });

  // skills_existing_secret:reuse|modify
  composer.callbackQuery(/^skills_existing_secret:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getSkillState(store, chatId);
    if (!state || state.step !== "confirm_existing_secret") { await ctx.answerCallbackQuery(t("skills.process_expired", {}, lang)); return; }
    const action = ctx.callbackQuery.data.slice("skills_existing_secret:".length);
    await ctx.answerCallbackQuery();
    const existing = state.existingRequiredEnvs ?? [];
    const missing = state.requiredEnvs ?? [];
    if (action === "modify") {
      await startEnvCollection(ctx, [...existing, ...missing], state, lang);
    } else {
      if (missing.length > 0) {
        await startEnvCollection(ctx, missing, state, lang);
      } else {
        await goToConfirmInstall(ctx, state, lang);
      }
    }
  });

  // skills_overwrite:<name>
  composer.callbackQuery(/^skills_overwrite:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getSkillState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("skills.process_expired", {}, lang)); return; }
    const skillName = ctx.callbackQuery.data.slice("skills_overwrite:".length);
    await ctx.answerCallbackQuery();
    await enterEnvCheck(ctx, skillName, state, lang);
  });

  // skills_confirm:<name>
  composer.callbackQuery(/^skills_confirm:/, async (ctx) => {
    const { store, octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getSkillState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("skills.process_expired", {}, lang)); return; }
    const skillName = ctx.callbackQuery.data.slice("skills_confirm:".length);
    // 写入 collected secrets（对齐旧 bundle L15100: 空/缺值 → throw → 安装中止）
    for (const [name, val] of Object.entries(state.collectedEnvs ?? {})) {
      const upperName = name.trim().toUpperCase();
      const trimmedVal = val.trim();
      if (!upperName || !trimmedVal) {
        await ctx.answerCallbackQuery(t("skills.secret_value_required", { name: escapeMarkdownV2(name) }, lang));
        return;
      }
      try { await setRepoSecret(octokit, owner, repo, upperName, trimmedVal); } catch (e) { logWarn("log.webhook.handleFailed", { error: e?.message ?? String(e) }); }
    }
    const requestId = crypto.randomUUID();
    let dispatchFailed = null;
    try {
      await octokit.rest.actions.createWorkflowDispatch({
        owner, repo, workflow_id: "skills.yml", ref: "main",
        inputs: { skill_name: skillName, issue_number: String(state.issueNumber), request_id: requestId },
      });
      // D1 workflow notification record（对齐旧 bundle Gt — 含 title/channel/messageId/payloadJson）
      try {
        const { createWorkflowNotification } = await import("../../github/webhooks/workflow-run.js");
        const { d1, config } = ctx.services;
        const payloadJson = JSON.stringify({ issue_number: state.issueNumber });
        await createWorkflowNotification(d1, {
          requestId, repo: config.github.repoFullName, workflowName: "skills",
          workflowPath: ".github/workflows/skills.yml", title: ctx.callbackQuery?.message?.text ?? "",
          channel: "telegram", chatId, messageId: ctx.callbackQuery?.message?.message_id ?? null,
          sourceId: skillName, sourceType: "skill_install", payloadJson,
        });
      } catch (e) { logError("log.webhook.handleFailed", { error: e?.message ?? String(e) }); }
    } catch (e) { dispatchFailed = e?.message ?? String(e); logError("log.workflow.dispatchFailed", { error: dispatchFailed }); }
    await clearSkillState(store, chatId);
    await ctx.answerCallbackQuery(t("skills.installing", {}, lang));
    if (dispatchFailed) {
      await ctx.editMessageText(t("skills.install_dispatch_failed", { name: escapeMarkdownV2(skillName), error: escapeMarkdownV2(dispatchFailed) }, lang), { parse_mode: "MarkdownV2", reply_markup: { inline_keyboard: [] } });
    } else {
      await ctx.editMessageText(t("skills.installing_progress", { name: escapeMarkdownV2(skillName), target: targetLabel(state, lang) }, lang), { parse_mode: "MarkdownV2", reply_markup: { inline_keyboard: [] } });
    }
  });

  // skills_cancel:0
  composer.callbackQuery(/^skills_cancel:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    if (chatId) await clearSkillState(store, chatId);
    await ctx.answerCallbackQuery(t("core.cancelled", {}, lang));
    try { await ctx.editMessageText(t("skills.install_cancelled", {}, lang), { parse_mode: "MarkdownV2", reply_markup: { inline_keyboard: [] } }); } catch {}
  });

  // skills_page:<n>
  composer.callbackQuery(/^skills_page:/, async (ctx) => {
    const { store, config } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getSkillState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("skills.process_expired", {}, lang)); return; }
    const page = parseInt(ctx.callbackQuery.data.slice("skills_page:".length), 10) || 0;
    const skills = await fetchSkillsCatalog(config).catch(() => []);
    await ctx.answerCallbackQuery();
    const installedSet = new Set(state.installedSkills ?? []);
    await ctx.editMessageText(t("skills.select_install", { target: targetLabel(state, lang) }, lang), { parse_mode: "MarkdownV2", reply_markup: skillsListKeyboard(skills, page, installedSet, lang) });
  });
}

// enterEnvCheck — Vl 等价
async function enterEnvCheck(ctx, skillName, state, lang) {
  const { store, octokit, config } = ctx.services;
  const { owner, repo } = config.github;
  const chatId = ctx.chat?.id;
  // fetch skill meta requireEnv
  const meta = await fetchSkillMeta(config, skillName).catch(() => null);
  const requiredEnvs = meta?.requireEnv ?? [];
  if (requiredEnvs.length === 0) {
    await goToConfirmInstall(ctx, { ...state, skillName, requiredEnvs: [], collectedEnvs: {} }, lang);
    return;
  }
  const existingSecrets = await listRepoSecrets(octokit, owner, repo);
  const existing = requiredEnvs.filter((e) => existingSecrets.has(e.toUpperCase()));
  const missing = requiredEnvs.filter((e) => !existingSecrets.has(e.toUpperCase()));
  if (existing.length > 0) {
    await setSkillState(store, chatId, { ...state, step: "confirm_existing_secret", skillName, requiredEnvs: missing, existingRequiredEnvs: existing, currentEnvIndex: 0, collectedEnvs: {} });
    const list = existing.map((e) => `- *${e}*`).join("\n");
    await ctx.editMessageText(t("skills.secret_exists", { skillName: escapeMarkdownV2(skillName), existingSecrets: list }, lang), { parse_mode: "MarkdownV2", reply_markup: existingSecretKeyboard(lang) });
  } else if (missing.length > 0) {
    await startEnvCollection(ctx, missing, { ...state, skillName }, lang);
  } else {
    await goToConfirmInstall(ctx, { ...state, skillName, requiredEnvs: [], collectedEnvs: {} }, lang);
  }
}

// startEnvCollection — Ql 等价
async function startEnvCollection(ctx, envs, state, lang) {
  const { store } = ctx.services;
  const chatId = ctx.chat?.id;
  await setSkillState(store, chatId, { ...state, step: "awaiting_env", requiredEnvs: envs, currentEnvIndex: 0, collectedEnvs: {}, promptMessageId: ctx.callbackQuery?.message?.message_id });
  await ctx.editMessageText(t("skills.need_envs", { skillName: escapeMarkdownV2(state.skillName), envName: escapeMarkdownV2(envs[0]), currentIndex: 1, totalLength: envs.length }, lang), { parse_mode: "MarkdownV2", reply_markup: envCancelKeyboard(lang) });
}

// goToConfirmInstall — Tf 等价
async function goToConfirmInstall(ctx, state, lang) {
  const { store } = ctx.services;
  const chatId = ctx.chat?.id;
  await setSkillState(store, chatId, { ...state, step: "confirm_install" });
  await ctx.editMessageText(t("skills.confirm_install", { skillName: escapeMarkdownV2(state.skillName), target: targetLabel(state, lang) }, lang), { parse_mode: "MarkdownV2", reply_markup: confirmKeyboard(state.skillName, lang) });
}

// handleSkillEnvText — Pm 等价，message:text 中 awaiting_env 步骤
export async function handleSkillEnvText(ctx) {
  const { store } = ctx.services;
  const chatId = ctx.chat?.id;
  if (!chatId) return false;
  const text = ctx.message?.text;
  if (!text || text.startsWith("/")) return false;
  const state = await getSkillState(store, chatId);
  if (!state || state.step !== "awaiting_env") return false;
  const lang = ctx.language ?? glang();
  const envs = state.requiredEnvs ?? [];
  const idx = state.currentEnvIndex ?? 0;
  const envName = envs[idx];
  const collected = { ...(state.collectedEnvs ?? {}) };
  const trimmed = text.trim();
  if (!trimmed) {
    await ctx.reply(t("skills.pleaseEnterEnvValue", { envName: escapeMarkdownV2(envName) }, lang), { parse_mode: "MarkdownV2", reply_markup: envCancelKeyboard(lang) });
    return true;
  }
  collected[envName] = trimmed;
  const next = idx + 1;
  // 删除用户消息
  try { await ctx.api.deleteMessage(chatId, ctx.message.message_id); } catch {}
  if (next < envs.length) {
    await setSkillState(store, chatId, { ...state, currentEnvIndex: next, collectedEnvs: collected });
    const replyText = t("skills.enterEnvValue", { envName: escapeMarkdownV2(envs[next]), current: next + 1, total: envs.length }, lang);
    if (state.promptMessageId) {
      try { await ctx.api.editMessageText(chatId, state.promptMessageId, replyText, { parse_mode: "MarkdownV2", reply_markup: envCancelKeyboard(lang) }); }
      catch { await ctx.reply(replyText, { parse_mode: "MarkdownV2", reply_markup: envCancelKeyboard(lang) }); }
    } else {
      await ctx.reply(replyText, { parse_mode: "MarkdownV2", reply_markup: envCancelKeyboard(lang) });
    }
  } else {
    // 全部收集完 → confirm_install
    await setSkillState(store, chatId, { ...state, step: "confirm_install", collectedEnvs: collected });
    const replyText = t("skills.confirm_install", { skillName: escapeMarkdownV2(state.skillName), target: targetLabel(state, lang) }, lang);
    if (state.promptMessageId) {
      try { await ctx.api.editMessageText(chatId, state.promptMessageId, replyText, { parse_mode: "MarkdownV2", reply_markup: confirmKeyboard(state.skillName, lang) }); }
      catch { await ctx.reply(replyText, { parse_mode: "MarkdownV2", reply_markup: confirmKeyboard(state.skillName, lang) }); }
    } else {
      await ctx.reply(replyText, { parse_mode: "MarkdownV2", reply_markup: confirmKeyboard(state.skillName, lang) });
    }
  }
  return true;
}