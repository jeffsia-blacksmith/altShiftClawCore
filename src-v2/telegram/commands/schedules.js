// commands/schedules.js — /schedules 命令
// 行为对齐旧 bundle Kl.command("schedules")（L14235-14247）+ Dn（L13430-13440）+ Bn（L13491-13499）。
// 列出当前 chat 的活跃排程，附 issue 标题，含 schedule_chat_open:<id> 按钮。

import { t, glang } from "../../i18n/index.js";
import { InlineKeyboard } from "grammy";
import { listSchedulesForChat } from "../../db/schedules.js";
import { logError } from "../../i18n/log.js";

// Bt — locale-formatted timestamp（对齐旧 bundle Bt L5178-5181：仅 timeZone，用 locale 默认格式）
function formatLocalTime(iso, lang) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(lang === "zh-CN" ? "zh-CN" : "en", { timeZone: "Asia/Taipei" });
}

// Ml(r) — issue 标题或 lobsterHash
function scheduleItemLabel(r, issueTitle, lang) {
  return issueTitle
    ? `${issueTitle} (#${r.issueNumber})`
    : t("core.lobsterHash", { issueNumber: r.issueNumber }, lang);
}

// $n(r) — ruleType | prompt 截断
function scheduleRuleSummary(r) {
  const prompt = (r.prompt ?? "").slice(0, 20);
  const ellipsis = (r.prompt ?? "").length > 20 ? "…" : "";
  return `${r.ruleType ?? ""} | ${prompt}${ellipsis}`;
}

// Dn(l) — 列表文本（对齐旧 bundle Dn：空/非空都带 title + 空行）
function buildSchedulesListText(schedules, issueTitles, lang) {
  const lines = [t("schedule.thisChatListTitle", {}, lang), ""];
  if (schedules.length === 0) {
    lines.push(t("schedule.thisChatListEmpty", {}, lang));
    return lines.join("\n");
  }
  schedules.forEach((r, i) => {
    const title = issueTitles.get(r.issueNumber);
    lines.push(`${i + 1}. ${scheduleItemLabel(r, title, lang)}｜${scheduleRuleSummary(r)}`);
    lines.push(`   🆔 ${r.id}`);
    lines.push(`   ⏭️ ${formatLocalTime(r.nextRunAt, lang)}`);
  });
  lines.push("", t("schedule.thisChatListHint", {}, lang));
  return lines.join("\n");
}

// Bn(l) — 列表键盘
const MAX_BUTTON_LABEL = 36;
function truncateButtonLabel(label) {
  return label.length <= MAX_BUTTON_LABEL ? label : `${label.slice(0, MAX_BUTTON_LABEL - 1)}…`;
}
function buildSchedulesKeyboard(schedules, issueTitles, lang) {
  if (schedules.length === 0) return undefined;
  const kb = new InlineKeyboard();
  for (const r of schedules.slice(0, 20)) {
    const label = truncateButtonLabel(`${scheduleItemLabel(r, issueTitles.get(r.issueNumber), lang)}｜${scheduleRuleSummary(r)}`);
    kb.text(label, `schedule_chat_open:${r.id}`).row();
  }
  return kb;
}

export function registerSchedules(composer) {
  composer.command("schedules", async (ctx) => {
    const { octokit, d1, config } = ctx.services;
    const { owner, repo, repoFullName } = config.github;
    const lang = ctx.language ?? glang();
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    try {
      const schedules = await listSchedulesForChat(d1, repoFullName, chatId);
      // 富化 issue 标题
      const issueTitles = new Map();
      const uniqueIssues = [...new Set(schedules.map((s) => s.issueNumber))];
      await Promise.all(
        uniqueIssues.map(async (n) => {
          try {
            const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: n });
            issueTitles.set(n, data.title);
          } catch {
            // 留空
          }
        }),
      );
      const text = buildSchedulesListText(schedules, issueTitles, lang);
      const keyboard = buildSchedulesKeyboard(schedules, issueTitles, lang);
      await ctx.reply(text, keyboard ? { reply_markup: keyboard } : undefined);
    } catch (e) {
      logError("log.command.executionFailed", { command: "schedules", error: e instanceof Error ? e.message : String(e) });
      await ctx.reply(t("schedule.flow.listFetchFailed", {}, lang));
    }
  });
}