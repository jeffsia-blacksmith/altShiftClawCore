// telegram/flows/schedule-flow.js — 排程流状态机 + 12 回调 + message:text handler
// 行为对齐旧 bundle Tt callbacks（L16181-16482）+ ql（L14117）+ on（L14016）+ Wn（L13750）。
// 注意：AI 时间解析（Ul）需 Workers AI binding；R9 minimal 走 fallback（failedUnderstand）。

import { t, glang } from "../../i18n/index.js";
import { logError } from "../../i18n/log.js";
import { InlineKeyboard } from "grammy";
import {
  createSchedule, getSchedule, listSchedulesForIssue, listSchedulesForChat,
  updateSchedule, deleteSchedule,
} from "../../db/schedules.js";
import { clearFlowState } from "./state.js";
import { scheduleRuleDescription, scheduleCardNotify, scheduleRuleTypeLabel } from "../edge-replies.js";

const PREFIX = "schedule-flow:";

export async function getSchedState(store, chatId) {
  const raw = await store.get(`${PREFIX}${chatId}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
async function setSchedState(store, chatId, state) {
  await store.put(`${PREFIX}${chatId}`, JSON.stringify(state));
}
async function clearSchedState(store, chatId) {
  await store.delete(`${PREFIX}${chatId}`);
}

// Wn — 下次运行时间计算（完整版，对齐旧 bundle Wn L13750-13778 + helpers L13510-13748）
// 时区：Asia/Taipei (UTC+8)
const TZ_OFFSET = 28800000; // 8h in ms

function toLocalParts(date = new Date()) {
  const d = new Date(date.getTime() + TZ_OFFSET);
  return {
    year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(),
    hour: d.getUTCHours(), minute: d.getUTCMinutes(), second: d.getUTCSeconds(),
    weekday: d.getUTCDay(),
  };
}
function fromLocalParts(parts) {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour ?? 0, parts.minute ?? 0, parts.second ?? 0) - TZ_OFFSET);
}
function addDays(parts, n) {
  const d = fromLocalParts(parts);
  return toLocalParts(new Date(d.getTime() + n * 86400000));
}
function addMinutes(date, n) { return new Date(date.getTime() + n * 60000); }
function addHours(date, n) { return new Date(date.getTime() + n * 3600000); }

function parseNum(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string") { const n = parseInt(v.trim(), 10); return isNaN(n) ? null : n; }
  return null;
}
function parseHour(v) { const h = parseNum(v); return (h != null && h >= 0 && h <= 23) ? h : null; }
function parseMinute(v) { if (v == null || v === "") return 0; const m = parseNum(v); return (m != null && m >= 0 && m <= 59) ? m : null; }

// cron field parser
function parseCronField(s, min, max, allow7As0 = false) {
  const str = String(s ?? "").trim();
  if (!str) throw new Error("cron field cannot be empty");
  const set = new Set();
  const addRange = (a, b, step = 1) => { for (let d = a; d <= b; d += step) set.add(d); };
  for (const part of str.split(",")) {
    const p = part.trim();
    if (!p) continue;
    const [rangePart, stepPart] = p.split("/");
    const step = stepPart ? parseInt(stepPart, 10) : 1;
    if (rangePart === "*") { addRange(min, max, step); continue; }
    if (rangePart.includes("-")) {
      const [a, b] = rangePart.split("-");
      let va = parseInt(a, 10), vb = parseInt(b, 10);
      if (allow7As0 && va === 7) va = 0;
      if (allow7As0 && vb === 7) vb = 0;
      addRange(va, vb, step); continue;
    }
    let v = parseInt(rangePart, 10);
    if (allow7As0 && v === 7) v = 0;
    if (stepPart) addRange(v, max, step); else set.add(v);
  }
  return [...set].sort((a, b) => a - b);
}

export function computeNextRun({ ruleType, rulePayload, now = new Date() }) {
  const rp = rulePayload && typeof rulePayload === "object" ? rulePayload : (typeof rulePayload === "string" ? safeJsonParse(rulePayload) : {});
  if (/^every_\d+_minutes$/.test(ruleType)) {
    const m = parseInt(ruleType.match(/^every_(\d+)_minutes$/)?.[1] ?? "1", 10);
    return addMinutes(now, m).toISOString();
  }
  switch (ruleType) {
    case "interval": {
      const m = parseNum(rp.minutes) ?? 1;
      return addMinutes(now, m).toISOString();
    }
    case "minutely": {
      const interval = parseNum(rp.interval_minutes) ?? 1;
      let parts = toLocalParts(now);
      let d = fromLocalParts({ ...parts, second: 0 });
      while (parts.minute % interval !== 0 || d.getTime() <= now.getTime()) {
        d = addMinutes(d, 1);
        parts = toLocalParts(d);
      }
      return d.toISOString();
    }
    case "daily": {
      const h = parseHour(rp.hour) ?? 0;
      const m = parseMinute(rp.minute) ?? 0;
      const parts = toLocalParts(now);
      let d = fromLocalParts({ year: parts.year, month: parts.month, day: parts.day, hour: h, minute: m });
      if (d.getTime() <= now.getTime()) {
        const next = addDays(parts, 1);
        d = fromLocalParts({ year: next.year, month: next.month, day: next.day, hour: h, minute: m });
      }
      return d.toISOString();
    }
    case "hourly": {
      const interval = parseNum(rp.interval_hours) ?? 1;
      const m = parseMinute(rp.minute) ?? 0;
      const parts = toLocalParts(now);
      let h = parts.hour;
      let d = fromLocalParts({ year: parts.year, month: parts.month, day: parts.day, hour: h, minute: m });
      while (h % interval !== 0 || d.getTime() <= now.getTime()) {
        h++; d = addHours(d, 1); const np = toLocalParts(d); h = np.hour;
      }
      return d.toISOString();
    }
    case "weekly": {
      const weekdays = Array.isArray(rp.weekdays) ? rp.weekdays.map(Number).filter(n => n >= 0 && n <= 6)
        : (rp.weekday != null ? [Number(rp.weekday)] : []);
      if (weekdays.length === 0) throw new Error("Invalid weekly schedule");
      const wd = new Set(weekdays);
      const h = parseHour(rp.hour) ?? 0;
      const m = parseMinute(rp.minute) ?? 0;
      const parts = toLocalParts(now);
      for (let i = 0; i < 7; i++) {
        const day = addDays(parts, i);
        if (!wd.has(day.weekday)) continue;
        const d = fromLocalParts({ year: day.year, month: day.month, day: day.day, hour: h, minute: m });
        if (d.getTime() > now.getTime()) return d.toISOString();
      }
      const next = addDays(parts, 7);
      return fromLocalParts({ year: next.year, month: next.month, day: next.day, hour: h, minute: m }).toISOString();
    }
    case "weekday":
      return computeNextRun({ ruleType: "weekly", rulePayload: { weekdays: [1,2,3,4,5], hour: rp.hour, minute: rp.minute }, now });
    case "weekenday":
      return computeNextRun({ ruleType: "weekly", rulePayload: { weekdays: [0,6], hour: rp.hour, minute: rp.minute }, now });
    case "once": {
      if (!rp.run_at) return null;
      const d = new Date(rp.run_at);
      if (isNaN(d.getTime())) return null;
      return d.toISOString();
    }
    case "cron": {
      const expr = typeof rp.expression === "string" ? rp.expression.trim() : "";
      const fields = expr.split(/\s+/);
      if (fields.length !== 5) throw new Error("Invalid cron expression");
      const [fMin, fHour, fDom, fMonth, fDow] = fields;
      const minutes = parseCronField(fMin, 0, 59);
      const hours = parseCronField(fHour, 0, 23);
      const months = parseCronField(fMonth, 1, 12);
      const domSet = new Set(parseCronField(fDom, 1, 31));
      const dowSet = new Set(parseCronField(fDow, 0, 6, true));
      const domWild = fDom === "*";
      const dowWild = fDow === "*";
      const startParts = toLocalParts(new Date(now.getTime() + 60000));
      for (let i = 0; i < 366 * 5; i++) {
        const day = i === 0 ? startParts : addDays(startParts, i);
        if (!months.includes(day.month)) continue;
        const domOk = domWild && dowWild ? true : (!domWild && !dowWild ? domSet.has(day.day) || dowSet.has(day.weekday) : domWild ? dowSet.has(day.weekday) : domSet.has(day.day));
        if (!domOk) continue;
        for (const h of hours) for (const m of minutes) {
          const d = fromLocalParts({ year: day.year, month: day.month, day: day.day, hour: h, minute: m });
          if (d.getTime() > now.getTime()) return d.toISOString();
        }
      }
      throw new Error(`Cannot compute next cron run: ${expr}`);
    }
    default:
      return new Date(now.getTime() + 3600000).toISOString();
  }
}

function safeJsonParse(s) { try { return JSON.parse(s) ?? {}; } catch { return {}; } }

// Bt — locale-formatted timestamp
function formatLocalTime(iso, lang) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(lang === "zh-CN" ? "zh-CN" : "en", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

// 键盘 builders
function cancelKeyboard(lang) {
  return new InlineKeyboard().text(t("kb.cancelSetup", {}, lang), "schedule_flow_cancel:current");
}
function payloadKeyboard(lang) {
  return new InlineKeyboard()
    .text(t("kb.skip", {}, lang), "schedule_payload_skip:current")
    .text(t("kb.cancelSetup", {}, lang), "schedule_flow_cancel:current");
}
function scheduleCardKeyboard(id, issueNumber, active, lang, source = "issue") {
  const suffix = source === "chat" ? "|chat" : "";
  const k = new InlineKeyboard();
  k.text(t("kb.changeTask", {}, lang), `schedule_edit_prompt:${id}${suffix}`);
  k.text(t("kb.changeTime", {}, lang), `schedule_edit_time:${id}${suffix}`).row();
  k.text(t("kb.changePayload", {}, lang), `schedule_edit_payload:${id}${suffix}`);
  k.text(active ? t("kb.pause", {}, lang) : t("kb.enable", {}, lang), `schedule_toggle:${id}${suffix}`).row();
  k.text(t("kb.delete", {}, lang), `schedule_delete:${id}${suffix}`);
  if (source === "chat") {
    k.text(t("kb.backToAllSchedules", {}, lang), "schedule_chat_list:current").row();
  } else {
    k.text(t("kb.backToScheduleList", {}, lang), `manage_schedule:${issueNumber}`);
  }
  return k;
}

// Bs — chat-source standalone card keyboard (delete + back only)
function scheduleChatCardKeyboard(id, lang) {
  return new InlineKeyboard()
    .text(t("kb.delete", {}, lang), `schedule_delete:${id}|chat`)
    .text(t("kb.backToAllSchedules", {}, lang), "schedule_chat_list:current");
}

// Nl — 排程卡片文本（完整版，含 rule description + notify）
function scheduleCardText(title, issueNumber, sched, lang) {
  const L = lang;
  const ruleDesc = (scheduleRuleDescription(sched, L) || sched.ruleType) ?? "";
  const notifyLabel = scheduleCardNotify(sched.shouldNotify, L);
  const lines = [
    t("schedule.card.detailTitle", { name: title, issueNumber }, L),
    t("schedule.card.id", { id: sched.id }, L),
    t("schedule.card.status", { status: sched.status === "paused" ? t("schedule.statusPaused", {}, L) : t("schedule.statusActive", {}, L) }, L),
    t("schedule.card.rule", { rule: `${scheduleRuleTypeLabel(sched.ruleType, L)} (${ruleDesc})` }, L),
    t("schedule.card.nextRun", { nextRun: formatLocalTime(sched.nextRunAt, L) || t("core.notSet", {}, L) }, L),
    t("schedule.card.task", { prompt: sched.prompt ?? "" }, L),
    t("schedule.card.payload", { payload: sched.eventData ?? t("core.notSet", {}, L) }, L),
    notifyLabel,
  ];
  return lines.join("\n");
}

// on — 排程创建/更新后：建 issue comment + 回复 config card
async function onScheduleAction(ctx, sched, action, lang) {
  const { octokit, store, config } = ctx.services;
  const { owner, repo } = config.github;
  const chatId = ctx.chat?.id;
  if (chatId) await clearSchedState(store, chatId);
  const actionLabel = action === "create" ? t("schedule.flow.actionCreate", {}, lang) : t("schedule.flow.actionUpdate", {}, lang);
  const commentBody = `<!-- telegram-meta: {"source":"schedule-flow","schedule_id":"${sched.id}","action":"${action === "create" ? "created" : "updated"}"} -->\n${t("schedule.flow.configCommentLog", { action: actionLabel, id: sched.id, prompt: sched.prompt ?? "", payload: sched.eventData ?? t("core.notSet", {}, lang) }, lang)}`;
  try {
    await octokit.rest.issues.createComment({ owner, repo, issue_number: sched.issueNumber, body: commentBody });
  } catch (e) {
    logError("log.schedule.createCommentFailed", { error: e?.message ?? String(e) });
  }
  const badge = action === "create" ? "(4/4)" : "(2/2)";
  const cardText = [
    t("schedule.flow.configCardTitle", { badge, action: actionLabel }, lang),
    t("schedule.flow.fieldId", { id: sched.id }, lang),
    t("schedule.flow.fieldType", { type: sched.ruleType ?? "" }, lang),
    t("schedule.flow.fieldTime", { time: formatLocalTime(sched.nextRunAt, lang) }, lang),
    t("schedule.flow.fieldNextRun", { nextRun: formatLocalTime(sched.nextRunAt, lang) }, lang),
    t("schedule.flow.fieldPrompt", { prompt: sched.prompt ?? "" }, lang),
    t("schedule.flow.fieldPayload", { payload: sched.eventData ?? t("core.notSet", {}, lang) }, lang),
  ].join("\n");
  await ctx.reply(cardText);
  // 发 issue-status card（对齐旧 bundle Es(e, n, "schedule_configuration")）
  try {
    const { sendStatusCard } = await import("../status-card.js");
    await sendStatusCard(ctx, sched.issueNumber);
  } catch (e) { console.error("[schedule] status card failed:", e.message); }
}

// yi — 解析 callback data "id|chat" 或 "id"
function parseSchedCallbackData(data) {
  const payload = data.split(":").slice(1).join(":");
  const parts = payload.split("|");
  return { scheduleId: parts[0], source: parts.length > 1 ? "chat" : "issue" };
}

// _i — check if issue is closed
async function isIssueClosed(octokit, owner, repo, issueNumber) {
  try {
    const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: issueNumber });
    return data.state === "closed";
  } catch { return false; }
}

// Dn — chat schedule list text（对齐旧 bundle Dn L13430-13440）
function buildChatScheduleListText(schedules, lang) {
  if (schedules.length === 0) return t("schedule.thisChatListEmpty", {}, lang);
  const lines = [t("schedule.thisChatListTitle", {}, lang)];
  schedules.forEach((s, i) => {
    const ruleDesc = (scheduleRuleDescription(s, lang) || s.ruleType) ?? "";
    lines.push(`${i + 1}. ${s.prompt ?? ""}｜${ruleDesc}｜${s.status ?? ""}`);
    lines.push(`   🆔 ${s.id}`);
    lines.push(`   ⏭️ ${formatLocalTime(s.nextRunAt, lang)}`);
  });
  lines.push(t("schedule.thisChatListHint", {}, lang));
  return lines.join("\n");
}

// Bn — chat schedule list keyboard
function buildChatScheduleKeyboard(schedules, lang) {
  if (schedules.length === 0) return undefined;
  const kb = new InlineKeyboard();
  for (const s of schedules.slice(0, 20)) {
    const ruleDesc = (scheduleRuleDescription(s, lang) || s.ruleType) ?? "";
    const label = `${s.prompt ?? ""}｜${ruleDesc}`.slice(0, 36);
    kb.text(label, `schedule_chat_open:${s.id}`).row();
  }
  return kb;
}

// Ol — issue schedule list text（对齐旧 bundle Ol L13392-13403）
function buildIssueScheduleListText(schedules, title, issueNumber, lang) {
  if (schedules.length === 0) return t("schedule.listEmpty", {}, lang);
  const lines = [t("schedule.listTitle", { name: title ?? "", issueNumber }, lang)];
  schedules.forEach((s, i) => {
    const ruleDesc = (scheduleRuleDescription(s, lang) || s.ruleType) ?? "";
    lines.push(`${i + 1}. ${s.prompt ?? ""}｜${ruleDesc}｜${s.status ?? ""}`);
    lines.push(`   🆔 ${s.id}`);
    lines.push(`   ⏭️ ${formatLocalTime(s.nextRunAt, lang)}`);
  });
  lines.push(t("schedule.listManageHint", {}, lang));
  return lines.join("\n");
}

// ja — issue schedule list keyboard（open buttons + new schedule）
function buildIssueScheduleKeyboard(schedules, issueNumber, lang) {
  const kb = new InlineKeyboard();
  for (const s of schedules.slice(0, 20)) {
    const ruleDesc = (scheduleRuleDescription(s, lang) || s.ruleType) ?? "";
    const label = `${s.prompt ?? ""}｜${ruleDesc}`.slice(0, 36);
    kb.text(label, `schedule_open:${s.id}`).row();
  }
  kb.text(t("kb.setSchedule", {}, lang), `set_schedule:${issueNumber}`)
    .text(t("kb.manageSchedule", {}, lang), `manage_schedule:${issueNumber}`);
  return kb;
}

function parseIssueNum(data) {
  const part = data.split(":")[1];
  if (!part) return null;
  const n = parseInt(part, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function registerScheduleCallbacks(composer) {
  // set_schedule:<issueNum>
  composer.callbackQuery(/^set_schedule:/, async (ctx) => {
    const { store, d1, config, octokit } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const n = parseIssueNum(ctx.callbackQuery.data);
    if (!n) { await ctx.answerCallbackQuery(t("core.invalidIssueNumber", {}, lang)); return; }
    // 验证 issue 存在且未关闭
    let issueTitle = "";
    try {
      const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: n });
      if (data.state === "closed") { await ctx.answerCallbackQuery(t("schedule.flow.lobsterClosedDeleteOnly", {}, lang)); return; }
      issueTitle = data.title;
    } catch { await ctx.answerCallbackQuery(t("schedule.flow.issueNotFoundOrClosed", {}, lang)); return; }
    if (chatId) await clearFlowState(store, chatId);
    await setSchedState(store, chatId, { step: "awaiting_prompt", issueNumber: n });
    await ctx.answerCallbackQuery();
    await ctx.reply(t("schedule.setupTaskPrompt", { name: issueTitle, issueNumber: n }, lang), { reply_markup: cancelKeyboard(lang) });
  });

  // manage_schedule:<issueNum>
  composer.callbackQuery(/^manage_schedule:/, async (ctx) => {
    const { d1, config, octokit } = ctx.services;
    const { owner, repo, repoFullName } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const n = parseIssueNum(ctx.callbackQuery.data);
    if (!n) { await ctx.answerCallbackQuery(t("core.invalidIssueNumber", {}, lang)); return; }
    await ctx.answerCallbackQuery();
    const list = await listSchedulesForIssue(d1, repoFullName, n).catch(() => []);
    let title = "";
    try { const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: n }); title = data.title; } catch {}
    const text = buildIssueScheduleListText(list, title, n, lang);
    const kb = buildIssueScheduleKeyboard(list, n, lang);
    await ctx.reply(text, { reply_markup: kb });
  });

  // schedule_open:<id>
  composer.callbackQuery(/^schedule_open:/, async (ctx) => {
    const { d1, octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const id = ctx.callbackQuery.data.slice("schedule_open:".length);
    const sched = await getSchedule(d1, id);
    if (!sched) { await ctx.answerCallbackQuery(t("schedule.flow.scheduleNotFoundShort", {}, lang)); return; }
    let title = "";
    try { const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: sched.issueNumber }); title = data.title; } catch {}
    await ctx.answerCallbackQuery();
    await ctx.reply(scheduleCardText(title, sched.issueNumber, sched, lang), { reply_markup: scheduleCardKeyboard(id, sched.issueNumber, sched.status !== "paused", lang) });
  });

  // schedule_edit_prompt|time|payload:<id>
  composer.callbackQuery(/^(schedule_edit_prompt|schedule_edit_time|schedule_edit_payload):/, async (ctx) => {
    const { store, d1, octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const { scheduleId, source } = parseSchedCallbackData(ctx.callbackQuery.data);
    const sched = await getSchedule(d1, scheduleId);
    if (!sched) { await ctx.answerCallbackQuery(t("schedule.flow.scheduleNotFoundShort", {}, lang)); return; }
    // closed-issue guard
    if (source === "chat") {
      const closed = await isIssueClosed(octokit, owner, repo, sched.issueNumber);
      if (closed) { await ctx.answerCallbackQuery(t("schedule.flow.lobsterClosedDeleteOnly", {}, lang)); return; }
    }
    const which = ctx.callbackQuery.data.match(/schedule_edit_(\w+):/)[1];
    const step = `awaiting_edit_${which}`;
    if (chatId) await clearFlowState(store, chatId);
    await setSchedState(store, chatId, { step, scheduleId, issueNumber: sched.issueNumber, source });
    await ctx.answerCallbackQuery();
    let replyKey, replyParams;
    if (which === "prompt") { replyKey = "schedule.editTaskPrompt"; replyParams = { name: sched.id }; }
    else if (which === "time") { replyKey = "schedule.editTimePrompt"; replyParams = { name: sched.id }; }
    else { replyKey = "schedule.editPayloadPrompt"; replyParams = { name: sched.id, current: sched.eventData ?? t("core.notSet", {}, lang) }; }
    const kb = which === "payload" ? payloadKeyboard(lang) : cancelKeyboard(lang);
    await ctx.reply(t(replyKey, replyParams, lang), { reply_markup: kb });
  });

  // schedule_flow_cancel:current
  composer.callbackQuery(/^schedule_flow_cancel:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    if (chatId) await clearSchedState(store, chatId);
    await ctx.answerCallbackQuery(t("schedule.flow.cancelSetupToast", {}, lang));
    try { await ctx.editMessageText(t("schedule.flow.cancelSetupMessage", {}, lang)); } catch { await ctx.reply(t("schedule.flow.cancelSetupMessage", {}, lang)); }
  });

  // schedule_payload_skip:current
  composer.callbackQuery(/^schedule_payload_skip:/, async (ctx) => {
    const { store, d1, config } = ctx.services;
    const { owner, repo, repoFullName } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const state = await getSchedState(store, chatId);
    if (!state) { await ctx.answerCallbackQuery(t("schedule.flow.setupExpired", {}, lang)); return; }
    if (state.step === "awaiting_payload") {
      const sched = await createSchedule(d1, {
        repo: repoFullName, issueNumber: state.issueNumber, chatId, prompt: state.prompt,
        ruleType: state.ruleType, rulePayload: state.rulePayload, timezone: state.timezone,
        nextRunAt: state.nextRunAt, shouldNotify: true, eventData: null,
      });
      if (!sched) { await clearSchedState(store, chatId); await ctx.answerCallbackQuery(t("schedule.flow.createFailedShort", {}, lang)); return; }
      await ctx.answerCallbackQuery(t("schedule.flow.payloadSkipped", {}, lang));
      await onScheduleAction(ctx, sched, "create", lang);
      return;
    }
    if (state.step === "awaiting_edit_payload") {
      const sched = await updateSchedule(d1, state.scheduleId, { eventData: null });
      if (!sched) { await clearSchedState(store, chatId); await ctx.answerCallbackQuery(t("schedule.flow.scheduleNotFoundShort", {}, lang)); return; }
      await ctx.answerCallbackQuery(t("schedule.flow.payloadSkipped", {}, lang));
      await onScheduleAction(ctx, sched, "update", lang);
      return;
    }
    await ctx.answerCallbackQuery(t("schedule.flow.notInPayloadStep", {}, lang));
  });

  // schedule_toggle:<id>
  composer.callbackQuery(/^schedule_toggle:/, async (ctx) => {
    const { d1, octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const { scheduleId, source } = parseSchedCallbackData(ctx.callbackQuery.data);
    const sched = await getSchedule(d1, scheduleId);
    if (!sched) { await ctx.answerCallbackQuery(t("schedule.flow.scheduleNotFoundShort", {}, lang)); return; }
    // closed-issue guard for chat source
    if (source === "chat") {
      const closed = await isIssueClosed(octokit, owner, repo, sched.issueNumber);
      if (closed) { await ctx.answerCallbackQuery(t("schedule.flow.lobsterClosedDeleteOnly", {}, lang)); return; }
    }
    if (sched.status === "active") {
      await updateSchedule(d1, scheduleId, { status: "paused" });
      await ctx.answerCallbackQuery(t("schedule.flow.pausedToast", {}, lang));
    } else {
      const nextRunAt = computeNextRun({ ruleType: sched.ruleType, rulePayload: sched.rulePayload, now: new Date() });
      const updated = await updateSchedule(d1, scheduleId, { status: "active", nextRunAt, lastError: null });
      if (!updated) { await ctx.answerCallbackQuery(t("schedule.flow.scheduleNotFoundShort", {}, lang)); return; }
      await ctx.answerCallbackQuery(t("schedule.flow.activatedToast", {}, lang));
    }
    const updated = await getSchedule(d1, scheduleId);
    let title = "";
    try { const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: updated.issueNumber }); title = data.title; } catch {}
    await ctx.reply(scheduleCardText(title, updated.issueNumber, updated, lang), { reply_markup: scheduleCardKeyboard(scheduleId, updated.issueNumber, updated.status !== "paused", lang, source) });
  });

  // schedule_delete:<id>
  composer.callbackQuery(/^schedule_delete:/, async (ctx) => {
    const { d1, config, octokit } = ctx.services;
    const { owner, repo, repoFullName } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const { scheduleId, source } = parseSchedCallbackData(ctx.callbackQuery.data);
    const sched = await getSchedule(d1, scheduleId);
    if (!sched) { await ctx.answerCallbackQuery(t("schedule.flow.scheduleNotFoundShort", {}, lang)); return; }
    await deleteSchedule(d1, scheduleId);
    await ctx.answerCallbackQuery(t("schedule.flow.deletedToast", {}, lang));
    if (source === "chat") {
      const list = await listSchedulesForChat(d1, repoFullName, chatId).catch(() => []);
      const text = buildChatScheduleListText(list, lang);
      const kb = buildChatScheduleKeyboard(list, lang);
      await ctx.reply(text, kb ? { reply_markup: kb } : undefined);
    } else {
      const list = await listSchedulesForIssue(d1, repoFullName, sched.issueNumber).catch(() => []);
      let title = "";
      try { const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: sched.issueNumber }); title = data.title; } catch {}
      const text = buildIssueScheduleListText(list, title, sched.issueNumber, lang);
      const kb = buildIssueScheduleKeyboard(list, sched.issueNumber, lang);
      await ctx.reply(text, { reply_markup: kb });
    }
  });

  // schedule_chat_list:current
  composer.callbackQuery(/^schedule_chat_list:/, async (ctx) => {
    const { d1, config } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    if (!chatId) return;
    await ctx.answerCallbackQuery();
    const list = await listSchedulesForChat(d1, config.github.repoFullName, chatId).catch(() => []);
    const text = buildChatScheduleListText(list, lang);
    const kb = buildChatScheduleKeyboard(list, lang);
    await ctx.reply(text, kb ? { reply_markup: kb } : undefined);
  });

  // schedule_chat_open:<id>
  composer.callbackQuery(/^schedule_chat_open:/, async (ctx) => {
    const { d1, octokit, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const id = ctx.callbackQuery.data.slice("schedule_chat_open:".length);
    const sched = await getSchedule(d1, id);
    if (!sched) { await ctx.answerCallbackQuery(t("schedule.flow.scheduleNotFoundShort", {}, lang)); return; }
    let title = "";
    let isClosed = false;
    try { const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: sched.issueNumber }); title = data.title; isClosed = data.state === "closed"; } catch {}
    await ctx.answerCallbackQuery();
    if (isClosed) {
      // closed issue → standalone card with delete-only keyboard
      const text = `${scheduleCardText(title, sched.issueNumber, sched, lang)}\n${t("schedule.flow.lobsterClosedDeleteOnly", {}, lang)}`;
      await ctx.reply(text, { reply_markup: scheduleChatCardKeyboard(id, lang) });
    } else {
      await ctx.reply(scheduleCardText(title, sched.issueNumber, sched, lang), { reply_markup: scheduleCardKeyboard(id, sched.issueNumber, sched.status !== "paused", lang, "chat") });
    }
  });

  // schedule_chat_delete:<id>
  composer.callbackQuery(/^schedule_chat_delete:/, async (ctx) => {
    const { d1, config } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const id = ctx.callbackQuery.data.slice("schedule_chat_delete:".length);
    const sched = await getSchedule(d1, id);
    if (!sched) { await ctx.answerCallbackQuery(t("schedule.flow.scheduleNotFoundShort", {}, lang)); return; }
    await deleteSchedule(d1, id);
    await ctx.answerCallbackQuery(t("schedule.flow.deletedToast", {}, lang));
    const list = await listSchedulesForChat(d1, config.github.repoFullName, chatId).catch(() => []);
    const text = buildChatScheduleListText(list, lang);
    const kb = buildChatScheduleKeyboard(list, lang);
    await ctx.reply(text, kb ? { reply_markup: kb } : undefined);
  });
}

// handleScheduleText — ql 等价，message:text 中排程流续接
export async function handleScheduleText(ctx) {
  const { store, d1, config } = ctx.services;
  const { owner, repo, repoFullName } = config.github;
  const chatId = ctx.chat?.id;
  if (!chatId) return false;
  const text = ctx.message?.text;
  if (!text || text.startsWith("/")) return false;
  const state = await getSchedState(store, chatId);
  if (!state) return false;
  const lang = ctx.language ?? glang();

  if (state.step === "awaiting_prompt") {
    const prompt = text.trim();
    if (!prompt) {
      await ctx.reply(t("schedule.prompt_cannot_be_empty", {}, lang), { reply_markup: cancelKeyboard(lang) });
      return true;
    }
    await setSchedState(store, chatId, { ...state, step: "awaiting_time", prompt });
    await ctx.reply(`${t("schedule.flow.timePromptQuestion", {}, lang)}\n${t("schedule.flow.examplesLine", { examples: t("schedule.flow.timeExamples", {}, lang) }, lang)}`, { reply_markup: cancelKeyboard(lang) });
    return true;
  }

  if (state.step === "awaiting_time") {
    // AI 时间解析：优先 Workers AI binding，fallback 到 parseSimpleTime
    const ai = ctx.services.ai;
    const result = await parseScheduleTime(text, { now: new Date(), ai });
    if (result.status === "resolved") {
      if (result.ruleType === "once" && !result.nextRunAt) {
        await ctx.reply(t("schedule.flow.failedUnderstand", {}, lang));
        return true;
      }
      await setSchedState(store, chatId, { ...state, step: "awaiting_payload", ruleType: result.ruleType, rulePayload: result.rulePayload, timezone: "Asia/Taipei", nextRunAt: result.nextRunAt });
      await ctx.reply(
        `${t("schedule.flow.payloadPromptLine1", {}, lang)}\n${t("schedule.flow.payloadPromptLine2", {}, lang)}\n${t("schedule.flow.payloadPromptLine3", {}, lang)}`,
        { reply_markup: payloadKeyboard(lang) },
      );
    } else if (result.status === "ambiguous") {
      const msg = result.message
        ? t("schedule.flow.ambiguousClarify", { message: result.message }, lang)
        : t("schedule.flow.ambiguousReply", {}, lang);
      await ctx.reply(msg, { reply_markup: cancelKeyboard(lang) });
    } else {
      await ctx.reply(t("schedule.flow.failedReply", {}, lang), { reply_markup: cancelKeyboard(lang) });
    }
    return true;
  }

  if (state.step === "awaiting_payload") {
    // State integrity guard (对齐旧 bundle ql L14158-14164)
    if (!state.prompt || !state.ruleType || !state.rulePayload || !state.timezone || !state.nextRunAt) {
      await clearSchedState(store, chatId);
      await ctx.reply(t("schedule.flow.stateLost", {}, lang));
      return true;
    }
    const eventData = text.trim() || null;
    const sched = await createSchedule(d1, {
      repo: repoFullName, issueNumber: state.issueNumber, chatId, prompt: state.prompt,
      ruleType: state.ruleType, rulePayload: state.rulePayload, timezone: state.timezone,
      nextRunAt: state.nextRunAt, shouldNotify: true, eventData,
    });
    if (!sched) { await clearSchedState(store, chatId); await ctx.reply(t("schedule.flow.createFailed", {}, lang)); return true; }
    await onScheduleAction(ctx, sched, "create", lang);
    return true;
  }

  if (state.step === "awaiting_edit_prompt") {
    if (!state.scheduleId) { await clearSchedState(store, chatId); await ctx.reply(t("schedule.flow.scheduleNotFound", {}, lang)); return true; }
    const prompt = text.trim();
    if (!prompt) { await ctx.reply(t("schedule.prompt_cannot_be_empty", {}, lang), { reply_markup: cancelKeyboard(lang) }); return true; }
    const sched = await updateSchedule(d1, state.scheduleId, { prompt });
    if (!sched) { await clearSchedState(store, chatId); await ctx.reply(t("schedule.flow.scheduleNotFound", {}, lang)); return true; }
    await onScheduleAction(ctx, sched, "update", lang);
    return true;
  }

  if (state.step === "awaiting_edit_payload") {
    if (!state.scheduleId) { await clearSchedState(store, chatId); await ctx.reply(t("schedule.flow.scheduleNotFound", {}, lang)); return true; }
    const eventData = text.trim() || null;
    const sched = await updateSchedule(d1, state.scheduleId, { eventData });
    if (!sched) { await clearSchedState(store, chatId); await ctx.reply(t("schedule.flow.scheduleNotFound", {}, lang)); return true; }
    await onScheduleAction(ctx, sched, "update", lang);
    return true;
  }

  if (state.step === "awaiting_edit_time") {
    if (!state.scheduleId) { await clearSchedState(store, chatId); await ctx.reply(t("schedule.flow.scheduleNotFound", {}, lang)); return true; }
    const ai = ctx.services.ai;
    const result = await parseScheduleTime(text, { now: new Date(), ai });
    if (result.status === "resolved") {
      const sched = await updateSchedule(d1, state.scheduleId, {
        ruleType: result.ruleType, rulePayload: result.rulePayload, nextRunAt: result.nextRunAt,
      });
      if (!sched) { await clearSchedState(store, chatId); await ctx.reply(t("schedule.flow.scheduleNotFound", {}, lang)); return true; }
      await onScheduleAction(ctx, sched, "update", lang);
    } else if (result.status === "ambiguous") {
      const msg = result.message
        ? t("schedule.flow.ambiguousClarify", { message: result.message }, lang)
        : t("schedule.flow.ambiguousReply", {}, lang);
      await ctx.reply(msg, { reply_markup: cancelKeyboard(lang) });
    } else {
      await ctx.reply(t("schedule.flow.failedReply", {}, lang), { reply_markup: cancelKeyboard(lang) });
    }
    return true;
  }

  return false;
}

// AI 时间解析（对齐旧 bundle Ul L13887-13940 + Wn L13750-13778）
// 优先用 Workers AI binding；fallback 到 parseSimpleTime
async function parseScheduleTime(text, { now, ai }) {
  if (ai) {
    try {
      const model = "meta/llama-4-scout-17b-16e-instruct"; // 默认模型
      const systemPrompt = `You are a schedule parser.
Convert the user's natural-language schedule into exactly one JSON object.
Output JSON only. No prose, no markdown.

Allowed resolved rule types (rulePayload shape):
- once -> rulePayload: {"run_at":"ISO8601"}
- interval -> rulePayload: {"minutes":N} for "every N minutes"
- cron -> rulePayload: {"expression":"M H D Mo W"}

Rules:
- Prefer cron for recurring schedules.
- Use timezone "Asia/Taipei" for resolved results.
- If ambiguous, return {"status":"ambiguous","message":"...","candidates":[...]}
- If cannot parse, return {"status":"unknown","message":"..."}

Current time: ${now.toISOString()}`;
      const resp = await ai.run(model, {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
        max_tokens: 512,
        temperature: 0,
      });
      // 提取 AI 返回文本
      let aiText = "";
      if (typeof resp === "string") aiText = resp;
      else if (resp?.result?.response) aiText = resp.result.response;
      else if (resp?.response) aiText = resp.response;
      else if (resp?.choices?.[0]?.message?.content) aiText = resp.choices[0].message.content;
      // 解析 JSON
      const parsed = JSON.parse(aiText.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim());
      if (parsed.status === "resolved" && parsed.ruleType && parsed.rulePayload) {
        const nextRunAt = computeNextRun({ ruleType: parsed.ruleType, rulePayload: parsed.rulePayload, now });
        return { status: "resolved", ruleType: parsed.ruleType, rulePayload: parsed.rulePayload, nextRunAt };
      }
      if (parsed.status === "ambiguous") {
        return { status: "ambiguous", message: parsed.message ?? "", candidates: parsed.candidates ?? [] };
      }
      return { status: "failed" };
    } catch (e) {
      console.error("[schedule AI] parse failed, fallback:", e.message);
    }
  }
  // Fallback: 简单解析
  return parseSimpleTime(text);
}
function parseSimpleTime(text) {
  const t = text.toLowerCase().trim();
  const every = t.match(/every\s+(\d+)\s*(min|minute|minutes)/);
  if (every) {
    const minutes = parseInt(every[1], 10);
    return { status: "resolved", ruleType: "every_N_minutes", rulePayload: { minutes }, nextRunAt: new Date(Date.now() + minutes * 60000).toISOString() };
  }
  if (t === "once" || t.includes("once")) {
    return { status: "resolved", ruleType: "once", rulePayload: null, nextRunAt: new Date(Date.now() + 60000).toISOString() };
  }
  return { status: "failed" };
}