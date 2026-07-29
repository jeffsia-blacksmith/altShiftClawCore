// telegram/flows/template-reset-callbacks.js — current_template_reset / template_reset_select / template_reset_cancel / current_edit
// 行为对齐旧 bundle L14458-14544。

import { t, glang } from "../../i18n/index.js";
import { InlineKeyboard } from "grammy";
import { getActiveIssue, setActiveIssue } from "../../db/kv-state.js";

function parseIssueNum(data) {
  const part = data.split(":")[1];
  if (!part) return null;
  const n = parseInt(part, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function registerTemplateResetCallbacks(composer) {
  // current_template_reset:<issueNum>
  composer.callbackQuery(/^current_template_reset:/, async (ctx) => {
    const { octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const n = parseIssueNum(ctx.callbackQuery.data);
    if (!n) { await ctx.answerCallbackQuery(t("core.invalidIssueNumber", {}, lang)); return; }
    let title = "";
    try { const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: n }); title = data.title; } catch {}
    // 列已装模板
    let templates = [];
    try {
      const { data } = await octokit.rest.repos.getContent({ owner, repo, path: "templates", ref: "main" });
      if (Array.isArray(data)) templates = data.filter((d) => d.type === "dir").map((d) => d.name);
    } catch {}
    await ctx.answerCallbackQuery(t("core.resetTemplateAnswer", {}, lang));
    const target = title ? t("core.lobsterLabelWithTitle", { number: n, title }, lang) : t("core.lobsterLabel", { number: n }, lang);
    const text = `${t("core.resetTemplateSelect", { target }, lang)}\n${t("core.resetTemplateWarning", {}, lang)}`;
    const kb = new InlineKeyboard();
    for (const tpl of templates.slice(0, 20)) {
      kb.text(`🔄 ${tpl}`, `template_reset_select:${n}:${tpl}`).row();
    }
    kb.text(t("kb.cancel", {}, lang), `template_reset_cancel:${n}`);
    await ctx.editMessageText(text, { reply_markup: kb });
  });

  // template_reset_select:<issueNum>:<template>
  composer.callbackQuery(/^template_reset_select:/, async (ctx) => {
    const { octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const parts = ctx.callbackQuery.data.split(":");
    const issueNum = parseInt(parts[1], 10);
    const template = parts.slice(2).join(":");
    if (!issueNum || !template) { await ctx.answerCallbackQuery(t("core.invalidParams", {}, lang)); return; }
    try {
      // 读取模板文件并提交到 issue-<n> 分支
      const { data: tplEntries } = await octokit.rest.repos.getContent({ owner, repo, path: `templates/${template}`, ref: "main" });
      const files = Array.isArray(tplEntries) ? tplEntries : [tplEntries];
      for (const f of files) {
        if (f.type === "file" && f.path) {
          let sha;
          try { const cur = await octokit.rest.repos.getContent({ owner, repo, path: f.path, ref: `issue-${issueNum}` }); sha = cur.data.sha; } catch {}
          const fileResp = await octokit.rest.repos.getContent({ owner, repo, path: f.path, ref: "main" });
          await octokit.rest.repos.createOrUpdateFileContents({
            owner, repo, path: f.path, message: `chore: reset issue #${issueNum} template (template: ${template})`,
            content: fileResp.data.content, branch: `issue-${issueNum}`, sha,
          });
        }
      }
    } catch (e) {
      console.error("[template_reset] failed:", e);
      await ctx.answerCallbackQuery(t("core.resetTemplateFailedAnswer", {}, lang));
      return;
    }
    await ctx.answerCallbackQuery(t("core.resetTemplateSuccessAnswer", {}, lang));
    await ctx.editMessageText(t("core.resetTemplateSuccessMessage", { number: issueNum, template }, lang), { reply_markup: { inline_keyboard: [] } });
  });

  // template_reset_cancel:<issueNum>
  composer.callbackQuery(/^template_reset_cancel:/, async (ctx) => {
    const lang = ctx.language ?? glang();
    await ctx.answerCallbackQuery(t("core.resetTemplateCancelledAnswer", {}, lang));
    try { await ctx.editMessageText(t("core.resetTemplateCancelledMessage", {}, lang), { reply_markup: { inline_keyboard: [] } }); } catch {}
  });

  // current_edit:<issueNum> — 进入 /edit 流
  composer.callbackQuery(/^current_edit:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const n = parseIssueNum(ctx.callbackQuery.data);
    if (!n) { await ctx.answerCallbackQuery(t("core.invalidIssueNumber", {}, lang)); return; }
    if (chatId) await setActiveIssue(store, n, chatId);
    await ctx.answerCallbackQuery(t("core.enterEditAnswer", {}, lang));
    // 进入 /edit 流：复用 edit-flow 的入口逻辑（触发 Rm 等价）
    // R9 minimal：直接回复 editNamePrompt
    await ctx.reply(t("newFlow.editNamePrompt", { step: "(1/4) " }, lang));
  });
}