// telegram/flows/schedule-flow.js — 排程流状态机 + 12 回调 + message:text handler
// 行为对齐旧 bundle Tt callbacks（L16181-16482）+ ql（L14117）+ on（L14016）+ Wn（L13750）。
// 注意：AI 时间解析（Ul）需 Workers AI binding；R9 minimal 走 fallback（failedUnderstand）。

import { t, glang } from "../../i18n/index.js";
import { InlineKeyboard } from "grammy";
import {
  createSchedule, getSchedule, listSchedulesForIssue, listSchedulesForChat,
  updateSchedule, deleteSchedule,
} from "../../db/schedules.js";
import { getActiveIssue, setActiveIssue } from "../../db/kv-state.js";
import { getFlowState, clearFlowState } from "./state.js";

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

// 键盘 builders
function cancelKeyboard(lang) {
  return new InlineKeyboard().text(t("kb.cancelSetup", {}, lang), "schedule_flow_cancel:current");
}
function payloadKeyboard(lang) {
  return new InlineKeyboard()
    .text(t("kb.skip", {}, lang), "schedule_payload_skip:current")
    .text(t("kb.cancelSetup", {}, lang), "schedule_flow_cancel:current");
}
function scheduleCardKeyboard(id, issueNumber, active, lang) {
  const k = new InlineKeyboard();
  k.text(t("kb.changeTask", {}, lang), `schedule_edit_prompt:${id}`);
  k.text(t("kb.changeTime", {}, lang), `schedule_edit_time:${id}`).row();
  k.text(t("kb.changePayload", {}, lang), `schedule_edit_payload:${id}`);
  k.text(active ? t("kb.pause", {}, lang) : t("kb.enable", {}, lang), `schedule_toggle:${id}`).row();
  k.text(t("kb.delete", {}, lang), `schedule_delete:${id}`)
    .text(t("kb.backToScheduleList", {}, lang), `manage_schedule:${issueNumber}`);
  return k;
}

// Nl — 排程卡片文本
function scheduleCardText(title, issueNumber, sched, lang) {
  const lines = [
    t("schedule.card.detailTitle", { name: title, issueNumber }, lang),
    t("schedule.card.id", { id: sched.id }, lang),
    t("schedule.card.status", { status: sched.status === "paused" ? t("schedule.statusPaused", {}, lang) : t("schedule.statusActive", {}, lang) }, lang),
    t("schedule.card.rule", { rule: sched.ruleType ?? "" }, lang),
    t("schedule.card.nextRun", { nextRun: sched.nextRunAt ?? t("core.notSet", {}, lang) }, lang),
    t("schedule.card.task", { prompt: sched.prompt ?? "" }, lang),
    t("schedule.card.payload", { payload: sched.eventData ?? t("core.notSet", {}, lang) }, lang),
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
    console.error("[schedule] createComment failed:", e);
  }
  const badge = action === "create" ? "(4/4)" : "(2/2)";
  const cardText = [
    t("schedule.flow.configCardTitle", { badge, action: actionLabel }, lang),
    t("schedule.flow.fieldId", { id: sched.id }, lang),
    t("schedule.flow.fieldType", { type: sched.ruleType ?? "" }, lang),
    t("schedule.flow.fieldTime", { time: sched.nextRunAt ?? "" }, lang),
    t("schedule.flow.fieldNextRun", { nextRun: sched.nextRunAt ?? "" }, lang),
    t("schedule.flow.fieldPrompt", { prompt: sched.prompt ?? "" }, lang),
    t("schedule.flow.fieldPayload", { payload: sched.eventData ?? t("core.notSet", {}, lang) }, lang),
  ].join("\n");
  await ctx.reply(cardText);
}

// yi — 解析 callback data "id|chat" 或 "id"
function parseSchedCallbackData(data) {
  const payload = data.split(":").slice(1).join(":");
  const parts = payload.split("|");
  return { scheduleId: parts[0], source: parts.length > 1 ? "chat" : "issue" };
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
    const { store, d1, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const n = parseIssueNum(ctx.callbackQuery.data);
    if (!n) { await ctx.answerCallbackQuery(t("core.invalidIssueNumber", {}, lang)); return; }
    if (chatId) await clearFlowState(store, chatId);
    await setSchedState(store, chatId, { step: "awaiting_prompt", issueNumber: n });
    await ctx.answerCallbackQuery();
    await ctx.reply(t("schedule.setupTaskPrompt", { name: "", issueNumber: n }, lang), { reply_markup: cancelKeyboard(lang) });
  });

  // manage_schedule:<issueNum>
  composer.callbackQuery(/^manage_schedule:/, async (ctx) => {
    const { d1, config } = ctx.services;
    const { owner, repo, repoFullName } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const n = parseIssueNum(ctx.callbackQuery.data);
    if (!n) { await ctx.answerCallbackQuery(t("core.invalidIssueNumber", {}, lang)); return; }
    const list = await listSchedulesForIssue(d1, repoFullName, n).catch(() => []);
    if (list.length === 0) {
      await ctx.editMessageText(t("schedule.listEmpty", {}, lang));
      return;
    }
    const lines = [t("schedule.listTitle", { name: "", issueNumber: n }, lang)];
    list.forEach((s) => { lines.push(`🆔 ${s.id} ⏭️ ${s.nextRunAt ?? ""}`); });
    lines.push(t("schedule.listManageHint", {}, lang));
    await ctx.editMessageText(lines.join("\n"));
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
    await ctx.editMessageText(scheduleCardText(title, sched.issueNumber, sched, lang), { reply_markup: scheduleCardKeyboard(id, sched.issueNumber, sched.status !== "paused", lang) });
  });

  // schedule_edit_prompt|time|payload:<id>
  composer.callbackQuery(/^(schedule_edit_prompt|schedule_edit_time|schedule_edit_payload):/, async (ctx) => {
    const { store, d1 } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const { scheduleId, source } = parseSchedCallbackData(ctx.callbackQuery.data);
    const sched = await getSchedule(d1, scheduleId);
    if (!sched) { await ctx.answerCallbackQuery(t("schedule.flow.scheduleNotFoundShort", {}, lang)); return; }
    const which = ctx.callbackQuery.data.match(/schedule_edit_(\w+):/)[1];
    const step = `awaiting_edit_${which}`;
    await setSchedState(store, chatId, { step, scheduleId, issueNumber: sched.issueNumber, source });
    await ctx.answerCallbackQuery();
    let replyKey, replyParams;
    if (which === "prompt") { replyKey = "schedule.editTaskPrompt"; replyParams = { name: sched.prompt ?? "" }; }
    else if (which === "time") { replyKey = "schedule.editTimePrompt"; replyParams = { name: sched.prompt ?? "" }; }
    else { replyKey = "schedule.editPayloadPrompt"; replyParams = { name: sched.prompt ?? "", current: sched.eventData ?? t("core.notSet", {}, lang) }; }
    const kb = which === "payload" ? payloadKeyboard(lang) : cancelKeyboard(lang);
    await ctx.editMessageText(t(replyKey, replyParams, lang), { reply_markup: kb });
  });

  // schedule_flow_cancel:current
  composer.callbackQuery(/^schedule_flow_cancel:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    if (chatId) await clearSchedState(store, chatId);
    await ctx.answerCallbackQuery(t("schedule.flow.cancelSetupToast", {}, lang));
    await ctx.editMessageText(t("schedule.flow.cancelSetupMessage", {}, lang));
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
    const { d1, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const { scheduleId } = parseSchedCallbackData(ctx.callbackQuery.data);
    const sched = await getSchedule(d1, scheduleId);
    if (!sched) { await ctx.answerCallbackQuery(t("schedule.flow.scheduleNotFoundShort", {}, lang)); return; }
    if (sched.status === "active") {
      await updateSchedule(d1, scheduleId, { status: "paused" });
      await ctx.answerCallbackQuery(t("schedule.flow.pausedToast", {}, lang));
    } else {
      const nextRunAt = computeNextRun({ ruleType: sched.ruleType, rulePayload: sched.rulePayload, now: new Date() });
      await updateSchedule(d1, scheduleId, { status: "active", nextRunAt, lastError: null });
      await ctx.answerCallbackQuery(t("schedule.flow.activatedToast", {}, lang));
    }
    const updated = await getSchedule(d1, scheduleId);
    let title = "";
    try { const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: updated.issueNumber }); title = data.title; } catch {}
    await ctx.editMessageText(scheduleCardText(title, updated.issueNumber, updated, lang), { reply_markup: scheduleCardKeyboard(scheduleId, updated.issueNumber, updated.status !== "paused", lang) });
  });

  // schedule_delete:<id>
  composer.callbackQuery(/^schedule_delete:/, async (ctx) => {
    const { d1, config } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    const { scheduleId, source } = parseSchedCallbackData(ctx.callbackQuery.data);
    const sched = await getSchedule(d1, scheduleId);
    if (!sched) { await ctx.answerCallbackQuery(t("schedule.flow.scheduleNotFoundShort", {}, lang)); return; }
    await deleteSchedule(d1, scheduleId);
    await ctx.answerCallbackQuery(t("schedule.flow.deletedToast", {}, lang));
    if (source === "chat") {
      const list = await listSchedulesForChat(d1, config.github.repoFullName, chatId).catch(() => []);
      await ctx.editMessageText(list.length === 0 ? t("schedule.thisChatListEmpty", {}, lang) : t("schedule.thisChatListTitle", {}, lang));
    } else {
      await ctx.editMessageText(t("schedule.listEmpty", {}, lang));
    }
  });

  // schedule_chat_list:current
  composer.callbackQuery(/^schedule_chat_list:/, async (ctx) => {
    const { d1, config } = ctx.services;
    const chatId = ctx.chat?.id;
    const lang = ctx.language ?? glang();
    if (!chatId) return;
    const list = await listSchedulesForChat(d1, config.github.repoFullName, chatId).catch(() => []);
    const text = list.length === 0 ? t("schedule.thisChatListEmpty", {}, lang) : t("schedule.thisChatListTitle", {}, lang);
    await ctx.editMessageText(text);
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
    try { const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: sched.issueNumber }); title = data.title; } catch {}
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(scheduleCardText(title, sched.issueNumber, sched, lang), { reply_markup: scheduleCardKeyboard(id, sched.issueNumber, sched.status !== "paused", lang) });
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
    await ctx.editMessageText(list.length === 0 ? t("schedule.thisChatListEmpty", {}, lang) : t("schedule.thisChatListTitle", {}, lang));
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
    const prompt = text.trim();
    if (!prompt) { await ctx.reply(t("schedule.prompt_cannot_be_empty", {}, lang), { reply_markup: cancelKeyboard(lang) }); return true; }
    const sched = await updateSchedule(d1, state.scheduleId, { prompt });
    if (!sched) { await clearSchedState(store, chatId); await ctx.reply(t("schedule.flow.scheduleNotFound", {}, lang)); return true; }
    await onScheduleAction(ctx, sched, "update", lang);
    return true;
  }

  if (state.step === "awaiting_edit_payload") {
    const eventData = text.trim() || null;
    const sched = await updateSchedule(d1, state.scheduleId, { eventData });
    if (!sched) { await clearSchedState(store, chatId); await ctx.reply(t("schedule.flow.scheduleNotFound", {}, lang)); return true; }
    await onScheduleAction(ctx, sched, "update", lang);
    return true;
  }

  if (state.step === "awaiting_edit_time") {
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