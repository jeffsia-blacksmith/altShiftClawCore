// telegram/relay.js — Full Telegram relay subsystem
// 行为对齐旧 bundle pu/eE/tE/rE (L19031-19030) + all helper functions (L14712-19030).
//
// Relays GitHub issue comments → Telegram messages.
// Features: per-comment KV tracking, progress-message edit-in-place,
// artifact-path image download (binary upload), MarkdownV2 parse-failure retry,
// inline keyboard (Open GitHub / Skill Docs / Open Workdir), reply threading.
//
// 对齐旧 bundle:
//   pu (L19031) — main relay entry
//   eE (L18835) — prepare: resolve chatId, replyTo, keyboard, relayedMsgId, progressTarget
//   tE (L18875) — build: determine mode, build message, detect photo candidate
//   rE (L18898) — execute: download artifact → sendPhoto/sendMessage/editMessage + parse-fallback
//   Zk (L18804) — skip conditions
//   Zs/eo/Hf/lu/zf/Ni/Qf — message building
//   eg/tg/rg/Xf/Yf/Vf/Jf/Oi — image/artifact helpers
//   Zf/zk/Qk/Vk/Yk/Jk — inline keyboard
//   an/Qt/Xs/du/_f/yf/qf/wf/bf/zl — KV store

import { t, glang } from "../i18n/index.js";
import { logInfo, logWarn, logError, logT } from "../i18n/log.js";
import { parseMetaComment, parseTelegramMeta } from "../github/webhooks/meta.js";
import { escapeMarkdownV2, escapeMdV2Formatted } from "./markdown.js";

// ─── Constants ──────────────────────────────────────────────────────────────

const KV_PREFIX_PROGRESS = "telegram-progress:"; // ff (L14711)
const KV_PREFIX_RELAY = "comment-relay:";         // Hk (L18497)
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;           // Xk (L18742)

// ─── Meta regex patterns (对齐 E_/S_/nm/sm/om/im/am/I_/v_/C_/R_/A_) ──────────

const RE_TELEGRAM_META  = /<!--\s*telegram-meta:\s*(\{[\s\S]*?\})\s*-->/;
const RE_ALBUM_META      = /<!--\s*githubclaw-album-meta:\s*(\{[\s\S]*?\})\s*-->/;
const RE_LINE_META       = /<!--\s*line-meta:\s*(\{[\s\S]*?\})\s*-->/;
const RE_BRAIN_RESULT    = /<!--\s*githubclaw-brain-result:\s*(\{[\s\S]*?\})\s*-->/;
const RE_TOOL_RUN       = /<!--\s*githubclaw-tool-run:\s*(\{[\s\S]*?\})\s*-->/;
const RE_ARTIFACTS      = /<!--\s*githubclaw-artifacts:\s*(\{[\s\S]*?\})\s*-->/;
const RE_MEDIA_META     = /<!--\s*githubclaw-media-meta:\s*(\{[\s\S]*?\})\s*-->/;
// g-flagged versions for replace-all in stripAllMeta
const RE_ALBUM_META_G    = /<!--\s*githubclaw-album-meta:\s*\{[\s\S]*?\}\s*-->/g;
const RE_LINE_META_G     = /<!--\s*line-meta:\s*\{[\s\S]*?\}\s*-->/g;
const RE_BRAIN_RESULT_G  = /<!--\s*githubclaw-brain-result:\s*\{[\s\S]*?\}\s*-->/g;
const RE_TOOL_RUN_G     = /<!--\s*githubclaw-tool-run:\s*\{[\s\S]*?\}\s*-->/g;
const RE_ARTIFACTS_G    = /<!--\s*githubclaw-artifacts:\s*\{[\s\S]*?\}\s*-->/g;
const RE_MEDIA_META_G   = /<!--\s*githubclaw-media-meta:\s*\{[\s\S]*?\}\s*-->/g;
const RE_TELEGRAM_META_G = /<!--\s*telegram-meta:\s*\{[\s\S]*?\}\s*-->/g;
const RE_TOOL_RUN_TAG   = /<useTool\b[^>]*>[\s\S]*?<\/useTool>\s*/g;  // I_
const RE_TOOL_RUN_PREFIX = /^工具\s+`[^`]+`\s+(?:已完成|执行失败)。(?:\r?\n\s*)*/; // v_
const RE_CODE_IMAGE     = /`([^`\r\n]+?\.(?:png|jpe?g|webp|gif))`/gi;  // C_
const RE_PATH_IMAGE     = /(^|[^A-Za-z0-9/_.-])((?:[A-Za-z0-9._-]+\/)+[A-Za-z0-9._-]+\.(?:png|jpe?g|webp|gif))(?=$|[^A-Za-z0-9/_.-])/gim; // R_
const RE_MD_IMAGE       = /!\[[^\]]*\]\((https?:\/\/[^)\s]+\.(?:png|jpe?g|webp|gif)[^)\s]*)\)/gi; // A_

const BRAIN_RESULT_KEY = "githubclaw-brain-result"; // x_
const TOOL_RUN_KEY     = "githubclaw-tool-run";     // P_
const LINE_META_KEY    = "line-meta";               // M_

// ─── Meta helpers ────────────────────────────────────────────────────────────

// vs(e, t) — parse first meta JSON from body (L6490)
function parseMetaRegex(body, regex) {
  if (typeof body !== "string") return null;
  const m = body.match(regex);
  if (!m) return null;
  try {
    const obj = JSON.parse(m[1]);
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return null;
    return obj;
  } catch {
    return null;
  }
}

// ii(e) — normalize telegram-meta object (L6501)
function normalizeTelegramMeta(obj) {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return null;
  const t = obj;
  if (typeof t.chat_id !== "number") return null;
  const r = { chat_id: t.chat_id };
  if (typeof t.msg_id === "number") r.msg_id = t.msg_id;
  if (typeof t.user_id === "number") r.user_id = t.user_id;
  if (typeof t.username === "string") r.username = t.username;
  if (typeof t.chat_type === "string") r.chat_type = t.chat_type;
  if (typeof t.ts === "string") r.ts = t.ts;
  if (typeof t.media_type === "string") r.media_type = t.media_type;
  return r;
}

// O_(e) — normalize line-meta object (L6516)
function normalizeLineMeta(obj) {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return null;
  const t = obj;
  const r = {};
  if (typeof t.source === "string") r.source = t.source;
  if (typeof t.source_type === "string") r.source_type = t.source_type;
  if (typeof t.source_key === "string") r.source_key = t.source_key;
  if (typeof t.user_id === "string") r.user_id = t.user_id;
  if (typeof t.group_id === "string") r.group_id = t.group_id;
  if (typeof t.room_id === "string") r.room_id = t.room_id;
  if (typeof t.msg_id === "string") r.msg_id = t.msg_id;
  if (typeof t.webhook_event_id === "string") r.webhook_event_id = t.webhook_event_id;
  if (typeof t.ts === "string") r.ts = t.ts;
  if (typeof t.bootstrap === "boolean") r.bootstrap = t.bootstrap;
  return Object.keys(r).length > 0 ? r : null;
}

// lm(e) — check if body has line-meta (L6581 → O_(vs(e, nm)))
function hasLineMeta(body) {
  return normalizeLineMeta(parseMetaRegex(body, RE_LINE_META)) !== null;
}

// G_(e) — get telegram-meta source from comment body (L6573)
function getTelegramMetaSource(body) {
  const meta = parseMetaComment(body);
  return typeof meta?.source === "string" && meta.source.trim() ? meta.source.trim() : null;
}

// en(e, ...t) — check if comment body source matches any of t (L6577)
function isSourceOneOf(body, ...sources) {
  const src = getTelegramMetaSource(body);
  return src !== null && sources.includes(src);
}

// Cs(e) — parse brain-result meta (L6584)
function parseBrainResult(body) {
  const raw = parseMetaRegex(body, RE_BRAIN_RESULT);
  if (typeof raw?.source !== "string" || raw.source.trim() === "") return null;
  const requestMeta = normalizeTelegramMeta(raw.requestTelegramMeta);
  return { ...raw, source: raw.source, ...(requestMeta ? { requestTelegramMeta: requestMeta } : {}) };
}

// ll(e) — parse tool-run meta (L6590)
function parseToolRun(body) {
  const raw = parseMetaRegex(body, RE_TOOL_RUN);
  if (typeof raw?.requestId !== "string" || raw.requestId.trim() === "" ||
      typeof raw?.toolName !== "string" || raw.toolName.trim() === "") return null;
  const requestMeta = normalizeTelegramMeta(raw.requestTelegramMeta);
  return { ...raw, requestId: raw.requestId, toolName: raw.toolName,
           ...(requestMeta ? { requestTelegramMeta: requestMeta } : {}) };
}

// ng(e) — get requestTelegramMeta from comment body (L18500 area)
// ll(e)?.requestTelegramMeta ?? Cs(e)?.requestTelegramMeta ?? null
function getRequestTelegramMeta(commentBody) {
  const tr = parseToolRun(commentBody);
  if (tr?.requestTelegramMeta) return tr.requestTelegramMeta;
  const br = parseBrainResult(commentBody);
  if (br?.requestTelegramMeta) return br.requestTelegramMeta;
  return null;
}

// um(e) — parse artifacts-meta → {images, html} (L6607)
function parseArtifactsMeta(body) {
  if (typeof body !== "string") return null;
  const m = body.match(RE_ARTIFACTS);
  if (!m) return null;
  try {
    const raw = JSON.parse(m[1]);
    if (typeof raw !== "object" || raw === null) return null;
    const images = normalizeImages(raw.images);
    const html = normalizeImages(raw.html);
    return images.length === 0 && html.length === 0 ? null : { images, html };
  } catch {
    return null;
  }
}

// tm(e) — normalize image/artifact array (L6534)
function normalizeImages(arr) {
  return Array.isArray(arr)
    ? arr
        .filter((item) => typeof item === "object" && item !== null)
        .map((item) => ({
          branch: typeof item.branch === "string" ? item.branch.trim() : "",
          path: typeof item.path === "string" ? item.path.trim().replace(/^\/+/, "") : "",
        }))
        .filter((item) => item.branch !== "" && item.path !== "")
    : [];
}

// rm(e) — normalize path array (L6546)
function normalizePaths(arr) {
  return Array.isArray(arr)
    ? arr.map((s) => (typeof s === "string" ? s.trim().replace(/^\/+/, "") : "")).filter((s) => s !== "")
    : [];
}

// pm(e) — extract repo file paths from body (L6667)
function extractRepoPaths(body) {
  if (typeof body !== "string") return [];
  const result = [];
  const seen = new Set();
  const add = (s) => {
    const p = String(s ?? "").trim().replace(/^\/+/, "");
    if (!p || seen.has(p)) return;
    if (p.includes("://")) {
      // Extract path from GitHub blob/raw URL
      const m = p.match(/^https?:\/\/github\.com\/[^/]+\/[^/]+\/(?:blob|raw)\/[^/]+\/(.+?)(?:\?.*)?$/);
      if (m) {
        const decoded = decodeURIComponent(m[1]);
        if (!seen.has(decoded)) { seen.add(decoded); result.push(decoded); }
      }
      return;
    }
    seen.add(p);
    result.push(p);
  };
  for (const m of body.matchAll(RE_CODE_IMAGE)) add(m[1]);
  for (const m of body.matchAll(RE_PATH_IMAGE)) add(m[2]);
  for (const m of body.matchAll(RE_MD_IMAGE)) add(m[1]);
  return result;
}

// lr(e, opts) — strip all meta markers from body (L6660)
function stripAllMeta(body, opts = {}) {
  if (typeof body !== "string") return body ?? "";
  let r = body
    .replace(RE_MEDIA_META_G, "").trim()    // ul — strip media-meta
    .replace(RE_ALBUM_META_G, "").trim()     // dl — strip album-meta
    .replace(RE_TELEGRAM_META_G, "").trim()  // cl — strip telegram-meta
    .replace(RE_ARTIFACTS_G, "").trim()      // F_ — strip artifacts
    .replace(RE_BRAIN_RESULT_G, "").trim()   // $_ — strip brain-result
    .replace(RE_TOOL_RUN_G, "").trim();      // L_ — strip tool-run
  if (opts.stripToolRunStatusPrefix) {
    r = r.replace(RE_TOOL_RUN_TAG, "").replace(RE_TOOL_RUN_PREFIX, "").trim(); // D_ + v_
  }
  return r;
}

// il(e) — check if body contains system meta markers (L6654)
function hasSystemMeta(body) {
  return typeof body === "string" && (
    body.includes(BRAIN_RESULT_KEY) || body.includes(TOOL_RUN_KEY) || body.includes(LINE_META_KEY)
  );
}

// Rs(e, stage) — check media-meta stage (ol/N_)
function parseMediaMeta(body) {
  const raw = parseMetaRegex(body, RE_MEDIA_META);
  if (typeof raw !== "object" || raw === null) return null;
  const stage = raw.stage === "finalized" ? "finalized" : raw.stage === "pending" ? "pending" : null;
  const kind = raw.kind === "album" ? "album" : raw.kind === "single" ? "single" : null;
  if (!stage || !kind) return null;
  return { stage, kind, temp_paths: normalizePaths(raw.temp_paths), final_paths: normalizePaths(raw.final_paths) };
}

function isMediaStage(body, stage) {
  const m = parseMediaMeta(body);
  return m?.stage === stage;
}

// As(e, t) — check edited comment transitioned pending → finalized
function isPendingToFinalized(currentBody, previousBody) {
  const cur = parseMediaMeta(currentBody);
  const prev = parseMediaMeta(previousBody);
  return cur?.stage === "finalized" && prev?.stage === "pending";
}

// Rn(e) — branch name from issue number (L5811)
function branchName(issueNumber) {
  return Number.isInteger(issueNumber) && issueNumber > 0 ? `issue-${issueNumber}` : "main";
}

// ─── KV store helpers (对齐 zl/wf/bf/hf/gf/Wf/_f/yf/qf/Xs/an/Qt/du) ───────────

// zl(e) — normalize relay state (L14714)
function normalizeRelayState(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  if (!Number.isInteger(obj.chatId) || !Number.isInteger(obj.progressMessageId)) return null;
  const r = { chatId: obj.chatId, progressMessageId: obj.progressMessageId };
  if (Number.isInteger(obj.requestMessageId)) r.requestMessageId = obj.requestMessageId;
  if (typeof obj.flow === "string" && obj.flow.trim() !== "") r.flow = obj.flow;
  if (typeof obj.status === "string" && obj.status.trim() !== "") r.status = obj.status;
  if (Number.isInteger(obj.issueNumber)) r.issueNumber = obj.issueNumber;
  if (Number.isInteger(obj.issueId)) r.issueId = obj.issueId;
  if (Number.isInteger(obj.commentId)) r.commentId = obj.commentId;
  if (typeof obj.createdAt === "string" && obj.createdAt.trim() !== "") r.createdAt = obj.createdAt;
  if (typeof obj.updatedAt === "string" && obj.updatedAt.trim() !== "") r.updatedAt = obj.updatedAt;
  if (typeof obj.messageKind === "string" && obj.messageKind.trim() !== "") r.messageKind = obj.messageKind;
  if (typeof obj.mediaFileId === "string" && obj.mediaFileId.trim() !== "") r.mediaFileId = obj.mediaFileId;
  return r;
}

// hf(e) — comment KV key (L14739)
function relayCommentKey(commentId) { return `${KV_PREFIX_PROGRESS}comment:${commentId}`; }

// gf(e, t) — request KV key (L14736)
function relayRequestKey(chatId, msgId) { return `${KV_PREFIX_PROGRESS}request:${chatId}:${msgId}`; }

// Wf(e) — relayed message ID key (L18498)
function relayedMsgKey(commentId) { return `${KV_PREFIX_RELAY}${commentId}`; }

// wf(e, t) — get relay state from store (L14742)
async function getRelayState(store, key) {
  const raw = await store.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return null;
  try {
    return normalizeRelayState(JSON.parse(raw));
  } catch {
    return null;
  }
}

// bf(e, t, r) — put relay state to store (L14751)
async function putRelayState(store, key, state) {
  const normalized = normalizeRelayState(state);
  if (normalized) await store.put(key, JSON.stringify(normalized));
}

// _f(e, t) — get relay by commentId (L14778)
async function getRelayByComment(store, commentId) {
  if (!Number.isInteger(commentId) || commentId <= 0) return null;
  return getRelayState(store, relayCommentKey(commentId));
}

// yf(e, t, r) — get relay by request (L14772)
async function getRelayByRequest(store, chatId, msgId) {
  if (!Number.isInteger(chatId) || !Number.isInteger(msgId)) return null;
  return getRelayState(store, relayRequestKey(chatId, msgId));
}

// qf(e, t) — get relayed message ID (L18501)
async function getRelayedMessageId(store, commentId) {
  if (!Number.isInteger(commentId) || commentId <= 0) return null;
  const raw = await store.get(relayedMsgKey(commentId));
  if (raw === null) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Xs(e, t, r) — save relayed message ID (L18508)
async function saveRelayedMessageId(store, commentId, msgId) {
  if (!Number.isInteger(commentId) || commentId <= 0) return;
  if (!Number.isInteger(msgId) || msgId <= 0) return;
  await store.put(relayedMsgKey(commentId), String(msgId));
}

// an(e, t, r) — save relay by comment (L14781)
async function saveRelayByComment(store, commentId, state) {
  if (!Number.isInteger(commentId) || commentId <= 0) return;
  await putRelayState(store, relayCommentKey(commentId), state);
}

// Qt(e, t, r, n) — save relay by request (L14775)
async function saveRelayByRequest(store, chatId, msgId, state) {
  if (!Number.isInteger(chatId) || !Number.isInteger(msgId)) return;
  await putRelayState(store, relayRequestKey(chatId, msgId), state);
}

// du(e, t, r) — save relay state both by comment and by request (L18798)
async function saveRelayState(store, commentId, state) {
  if (!store || !Number.isInteger(commentId) || commentId <= 0 || !state) return;
  const ops = [saveRelayByComment(store, commentId, { ...state, commentId })];
  if (Number.isInteger(state.requestMessageId)) {
    ops.push(saveRelayByRequest(store, state.chatId, state.requestMessageId, state));
  }
  await Promise.all(ops);
}

// Ar(e, t, r) — create new relay state object (L14757 area)
function createRelayState(ctx, messageId, opts = {}) {
  const now = new Date().toISOString();
  return normalizeRelayState({
    chatId: ctx?.chat?.id,
    progressMessageId: messageId,
    requestMessageId: ctx?.message_id,
    flow: opts.flow,
    status: opts.status || "pending",
    issueNumber: opts.issueNumber,
    issueId: opts.issueId,
    commentId: opts.commentId,
    createdAt: opts.createdAt || now,
    updatedAt: opts.updatedAt || now,
    messageKind: opts.messageKind,
    mediaFileId: opts.mediaFileId,
  });
}

// ─── Message building (对齐 Zs/eo/Hf/lu/zf/Ni/Qf) ────────────────────────────

// Zs(e, comment, action, plainOnly) — build full relay text (L18529)
function buildFullRelayText(issue, comment, action, plainOnly = false) {
  const gLang = glang();
  const body = stripAllMeta(comment.body || "", { stripToolRunStatusPrefix: plainOnly }).trim() ||
    t("core.blank", {}, gLang);
  if (plainOnly) return body;
  const header = action === "edited"
    ? t("core.issueCommentUpdated", { number: issue.number, title: issue.title }, gLang)
    : t("core.issueNewComment", { number: issue.number, title: issue.title }, gLang);
  const url = comment.html_url || "";
  return [header, "", body, ...(url ? ["", url] : [])].join("\n").trim();
}

// eo(e, comment, action, plainOnly) — build relay message {text, parseMode} (L18550)
function buildRelayMessageObj(issue, comment, action, plainOnly = false) {
  const text = buildFullRelayText(issue, comment, action, plainOnly);
  return { text: escapeMdV2Formatted(text), parseMode: "MarkdownV2" };
}

// Hf(e, comment, action, plainOnly) — build plain body message (L18577)
function buildPlainBodyMessageObj(issue, comment, action, plainOnly = false) {
  if (!plainOnly) return buildRelayMessageObj(issue, comment, action, false);
  const gLang = glang();
  const body = stripAllMeta(comment.body || "", { stripToolRunStatusPrefix: true }).trim() ||
    t("core.blank", {}, gLang);
  return { text: escapeMdV2Formatted(body), parseMode: "MarkdownV2" };
}

// lu(e, comment, action, plainOnly) — body only (L18620)
function getRelayBodyOnly(issue, comment, action, plainOnly = false) {
  return plainOnly
    ? stripAllMeta(comment.body || "", { stripToolRunStatusPrefix: true }).trim() || t("core.blank", {}, glang())
    : buildFullRelayText(issue, comment, action, false);
}

// zf(e, maxLen, htmlUrl) — truncate with notice (L18560)
function truncateWithNotice(text, maxLen, htmlUrl = "") {
  const trimmed = String(text || "").trim();
  if (!Number.isInteger(maxLen) || maxLen <= 0 || trimmed.length <= maxLen) return trimmed;
  const gLang = glang();
  const parts = [t("core.contentTruncated", {}, gLang)];
  if (htmlUrl) parts.push(htmlUrl);
  const suffix = "\n\n" + parts.join("\n");
  const sliceLen = Math.max(0, maxLen - suffix.length);
  return `${trimmed.slice(0, sliceLen).trimEnd()}${suffix}`.slice(0, maxLen);
}

// Ni(e, comment, action, msg, maxLen, plainOnly) — fit message (L18570)
function fitMessage(issue, comment, action, msg, maxLen, plainOnly = false) {
  const cur = msg && typeof msg.text === "string" ? msg : { text: "" };
  if (cur.text.length <= maxLen) return cur;
  // Try plain text fallback
  const plain = buildRelayMessageObj(issue, comment, action, plainOnly);
  if (plain.text.length <= maxLen) {
    logWarn("log.relay.tooLongPlainText", { issue: issue.number });
    return plain;
  }
  logWarn("log.relay.tooLongTruncate", { issue: issue.number });
  const body = getRelayBodyOnly(issue, comment, action, plainOnly);
  const truncated = truncateWithNotice(body, maxLen, comment.html_url || "");
  const escaped = escapeMdV2Formatted(truncated);
  return escaped.length <= maxLen ? { text: escaped, parseMode: "MarkdownV2" } : { text: truncated };
}

// Qf(comment, msg, maxLen) — fit progress message (L18584)
function fitProgressMessage(comment, msg, maxLen) {
  const cur = msg && typeof msg.text === "string" ? msg : { text: "" };
  if (cur.text.length <= maxLen) return cur;
  logWarn("log.relay.progressTooLongTruncate", {});
  const body = stripAllMeta(comment.body || "", { stripToolRunStatusPrefix: true }).trim() ||
    t("core.blank", {}, glang());
  const truncated = truncateWithNotice(body, maxLen, comment.html_url || "");
  const escaped = escapeMdV2Formatted(truncated);
  return escaped.length <= maxLen ? { text: escaped, parseMode: "MarkdownV2" } : { text: truncated };
}

// Kf(e) — regex escape helper (L18605)
function escapeRegex(str) {
  return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Oi(e, path) — strip image ref from text (L18593)
function stripImageRef(text, path) {
  const gLang = glang();
  const attached = t("core.imageAttached", {}, gLang);
  const attachedShort = t("core.imageAttachedShort", {}, gLang);
  if (typeof text !== "string") return attached;
  const cleanPath = String(path || "").trim().replace(/^\/+/, "");
  const pathRe = cleanPath ? new RegExp(`${escapeRegex(cleanPath)}|${escapeRegex(cleanPath)}`, "g") : null;
  const imgLineRe = /^.*!\[[^\]]*]\([^)]+\).*$\n?/gm;
  return text
    .replace(imgLineRe, "")
    .split(/\r?\n/)
    .map((line) => {
      if (!pathRe) return line;
      if (/(图片|image|photo)\s*[:：]/i.test(line)) return line.replace(pathRe, attachedShort);
      const trimmed = line.trim();
      if (trimmed && pathRe.test(trimmed)) {
        pathRe.lastIndex = 0;
        return line.replace(pathRe, attached);
      }
      pathRe.lastIndex = 0;
      return line;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim() || attached;
}

// ─── Image/artifact helpers (对齐 eg/tg/rg/Xf/Yf/Vf/Jf) ──────────────────────

// eg(issue, comment) — detect photo candidate (L18745)
function detectPhotoCandidate(issue, comment) {
  // 1. Check artifacts-meta images
  const artifacts = parseArtifactsMeta(comment?.body || "");
  if (artifacts?.images?.[0]) {
    return { kind: "artifact", branch: artifacts.images[0].branch, path: artifacts.images[0].path };
  }
  // 2. Check repo file paths
  const paths = extractRepoPaths(comment?.body || "");
  const first = paths[0];
  return first ? { kind: "repo-path", branch: branchName(issue?.number), path: first } : null;
}

// tg(config, path, ref) — download artifact blob from GitHub (L18750)
async function downloadArtifact(config, path, ref) {
  const url = `${config.github.apiBaseUrl}/repos/${config.github.owner}/${config.github.repo}/contents/${path}?ref=${encodeURIComponent(ref)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${config.github.token}`,
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": config.github.userAgent,
    },
  });
  if (!res.ok) throw new Error(t("errors.getFileFailed", { path, status: res.status }, glang()));
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  return { bytes: new Uint8Array(await res.arrayBuffer()), contentType };
}

// rg(e) — is too large (L18763)
function isTooLarge(byteLength) { return byteLength > MAX_IMAGE_BYTES; }

// Xf(config, candidate) — build GitHub blob URL (L18695)
function buildArtifactUrl(config, candidate) {
  if (!candidate?.path || !candidate.branch) return "";
  const repoFullName = config.github.repoFullName;
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) return "";
  const encodedPath = candidate.path
    .split("/").filter(Boolean)
    .map((s) => encodeURIComponent(s)).join("/");
  return encodedPath
    ? ["https://github.com", encodeURIComponent(owner), encodeURIComponent(repo), "blob",
       encodeURIComponent(candidate.branch), encodedPath].join("/")
    : "";
}

// Yf(e) — filename from path (L18648)
function filenameFromPath(path) {
  return String(path || "").trim().split("/").filter(Boolean).at(-1) || "image";
}

// Vf(issue, comment, action, msg, candidate, plainOnly) — strip image from message (L18625)
function stripImageFromMessage(issue, comment, action, msg, candidate, plainOnly = false) {
  if (!candidate || typeof msg?.text !== "string") return msg;
  if (msg.parseMode === "MarkdownV2") {
    const body = getRelayBodyOnly(issue, comment, action, plainOnly);
    return { ...msg, text: escapeMdV2Formatted(stripImageRef(body, candidate.path)) };
  }
  if (!msg.parseMode) {
    const body = getRelayBodyOnly(issue, comment, action, plainOnly);
    return { ...msg, text: stripImageRef(body, candidate.path) };
  }
  return { ...msg, text: stripImageRef(msg.text, candidate.path) };
}

// Jf(issue, comment, action, msg, candidate, url, plainOnly) — build photo-too-large msg (L18637)
function buildPhotoTooLargeMessage(issue, comment, action, msg, candidate, url, plainOnly = false) {
  if (!candidate || !url) return msg;
  const gLang = glang();
  const body = getRelayBodyOnly(issue, comment, action, plainOnly);
  const stripped = stripImageRef(body, candidate.path);
  const clickLabel = t("core.imageClickLinkToOpen", {}, gLang);
  const composed = [stripped, "", clickLabel, `[${t("core.openImage", {}, gLang)}](${url})`].join("\n").trim();
  return msg.parseMode === "MarkdownV2"
    ? { ...msg, text: escapeMdV2Formatted(composed) }
    : { ...msg, text: `${stripped}\n${clickLabel}\n${url}` };
}

// ─── Inline keyboard (对齐 Zf/zk/Qk/Vk/Yk/Jk) ───────────────────────────────

// zk(config, issue, comment) — comment html_url (L18703)
function commentUrl(config, issue, comment) {
  if (typeof comment?.html_url === "string" && comment.html_url.trim() !== "") return comment.html_url.trim();
  const repoFullName = config.github.repoFullName;
  const num = issue?.number;
  const cid = comment?.id;
  if (!repoFullName || !Number.isInteger(num) || !Number.isInteger(cid)) return "";
  return `https://github.com/${repoFullName}/issues/${num}#issuecomment-${cid}`;
}

// Qk(config, issue) — issue html_url (L18713)
function issueUrl(config, issue) {
  const repoFullName = config.github.repoFullName;
  const num = issue?.number;
  if (!repoFullName || !Number.isInteger(num)) return "";
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) return "";
  return `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${num}`;
}

// Vk(config, issue, commentId) — workdir URL (L18723)
function workdirUrl(config, issue, commentId) {
  const repoFullName = config.github.repoFullName;
  const num = issue?.number;
  const branch = branchName(num);
  if (!repoFullName || !Number.isInteger(num) || num <= 0 || !Number.isInteger(commentId)) return "";
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) return "";
  const artifactPath = `artifacts/${commentId}`;
  return ["https://github.com", encodeURIComponent(owner), encodeURIComponent(repo), "tree",
          encodeURIComponent(branch), artifactPath].join("/");
}

// Jk(body) — extract skill name from body (L18716)
function extractSkillName(body) {
  return body?.match(/技能\s+\*\*([^*\r\n]+)\*\*/)?.[1]?.trim() || "";
}

// Yk(comment) — skill docs URL (L18721)
function skillDocsUrl(comment) {
  if (parseMetaComment(comment?.body || "")?.source !== "skill-installer") return "";
  const name = extractSkillName(comment?.body || "");
  return name
    ? `https://github.com/jeffsia-blacksmith/altShiftClawToolkit/blob/main/skills/${encodeURIComponent(name)}/README.md`
    : "";
}

// Zf(config, issue, comment) — build inline keyboard (L18729)
async function buildRelayKeyboard(config, issue, comment) {
  const gLang = glang();
  const url = commentUrl(config, issue, comment) || issueUrl(config, issue);
  const docs = skillDocsUrl(comment);
  const workdir = workdirUrl(config, issue, comment?.id);
  if (!url) return undefined;
  const { InlineKeyboard } = await import("grammy");
  const kb = new InlineKeyboard().url(t("kb.openGithub", {}, gLang), url);
  if (docs) {
    kb.url(t("kb.skillDocs", {}, gLang), docs);
  } else if (workdir) {
    kb.url(t("kb.openWorkdir", {}, gLang), workdir);
  }
  return kb;
}

// ─── Skip conditions (对齐 Zk L18804) ───────────────────────────────────────

// Zk(issue, comment) — relay skip conditions
function shouldSkipRelay(issue, comment) {
  if (!issue || !comment) {
    logWarn("log.relay.payloadMissingFields", {});
    return true;
  }
  // 1. Comment has telegram-meta with chat_id → bot echo, skip
  if (parseTelegramMeta(comment.body)) return true;
  // 2. Comment has line-meta → LINE bot, skip
  if (hasLineMeta(comment.body)) {
    logInfo("log.relay.skipLineSource", { issue: issue.number });
    return true;
  }
  // 3. Comment telegram-meta source=schedule-flow → skip
  if (isSourceOneOf(comment.body, "schedule-flow")) {
    logInfo("log.relay.skipScheduleSetup", { issue: issue.number });
    return true;
  }
  // 4. No meta at all → skip
  const requestMeta = getRequestTelegramMeta(comment.body);
  const hasTgMeta = parseMetaComment(comment.body) !== null;
  const hasBrainOrTool = !!(parseBrainResult(comment.body) || parseToolRun(comment.body));
  if (!hasTgMeta && !requestMeta && !hasBrainOrTool) {
    logInfo("log.relay.skipMissingMeta", { issue: issue.number });
    return true;
  }
  return false;
}

// ─── Main flow (对齐 eE/tE/rE/pu) ────────────────────────────────────────────

// eE(payload, env) — prepare relay (L18835)
async function prepareRelay(payload, env) {
  const { action, issue, comment } = payload;
  const { config, store } = env;
  const requestMeta = getRequestTelegramMeta(comment.body);
  const issueMeta = parseTelegramMeta(issue.body);
  const commentId = Number.isInteger(comment.id) ? comment.id : null;

  // Try to find existing relay state from store
  const progressRelayTarget = commentId !== null
    ? (await getRelayByComment(store, commentId)) ?? null
    : null;
  // Also try by request meta chat_id+msg_id
  const byRequest = (requestMeta?.chat_id != null && requestMeta?.msg_id != null)
    ? await getRelayByRequest(store, requestMeta.chat_id, requestMeta.msg_id)
    : null;
  const relayState = progressRelayTarget ?? byRequest;

  const chatId = relayState?.chatId ?? requestMeta?.chat_id ?? issueMeta?.chat_id;

  logInfo("log.relay.processingNewComment", {
    issue: issue.number,
    issueMeta: JSON.stringify(issueMeta),
    requestMeta: JSON.stringify(requestMeta),
  });

  if (!chatId) {
    logInfo("log.relay.skipNoChatId", { issue: issue.number });
    return null;
  }

  const replyToMessageId =
    typeof requestMeta?.msg_id === "number" ? requestMeta.msg_id :
    Number.isInteger(relayState?.requestMessageId) ? relayState.requestMessageId :
    typeof issueMeta?.msg_id === "number" ? issueMeta.msg_id : undefined;

  const replyMarkup = await buildRelayKeyboard(config, issue, comment);

  // For edited comments, check if we have a previously relayed message to edit in place
  const relayedMessageId = action === "edited" && commentId !== null
    ? await getRelayedMessageId(store, commentId)
    : null;

  return {
    chatId,
    replyToMessageId,
    replyMarkup,
    relayedMessageId,
    progressRelayTarget: relayState,
    shouldEditProgressMessage: !!relayState,
    commentId,
  };
}

// tE(payload, config, prep) — build relay message (L18875)
function buildRelayPayload(payload, config, prep) {
  const { action, issue, comment } = payload;
  const { progressRelayTarget, shouldEditProgressMessage } = prep;
  const relayBodyOnly = true; // l = !0 (always plain-body-only in old code)

  const photoCandidate = detectPhotoCandidate(issue, comment);
  const maxLen = shouldEditProgressMessage &&
    (progressRelayTarget?.messageKind === "photo" || photoCandidate)
    ? Math.min(config.telegram.maxMessageLength, 1024)
    : config.telegram.maxMessageLength;

  let relayMode = "plain-body-only";
  let relayMessage;

  if (shouldEditProgressMessage) {
    relayMode = relayBodyOnly ? "progress-edit-body-only" : "progress-edit";
    relayMessage = fitProgressMessage(comment, buildPlainBodyMessageObj(issue, comment, action, relayBodyOnly), maxLen);
  } else if (relayBodyOnly) {
    relayMode = "plain-body-only";
    relayMessage = fitMessage(issue, comment, action, buildRelayMessageObj(issue, comment, action, true),
                              config.telegram.maxMessageLength, true);
  } else {
    relayMode = "full-relay";
    relayMessage = fitMessage(issue, comment, action, buildRelayMessageObj(issue, comment, action, false),
                              config.telegram.maxMessageLength, false);
  }

  const textRelayMessage = photoCandidate ? { ...relayMessage, text: relayMessage.text } : relayMessage;
  let finalRelayMessage = relayMessage;
  if (photoCandidate) {
    finalRelayMessage = stripImageFromMessage(issue, comment, action, relayMessage, photoCandidate, relayBodyOnly);
  }

  return {
    relayMessage: finalRelayMessage,
    textRelayMessage,
    relayPhotoCandidate: photoCandidate,
    relayMode,
    relayBodyOnly,
  };
}

// rE(bot, payload, env, prep, built) — execute relay (L18898)
async function executeRelay(bot, payload, env, prep, built) {
  const { issue, comment, action } = payload;
  const { config, store } = env;
  const {
    chatId, replyToMessageId, replyMarkup,
    relayedMessageId, progressRelayTarget, shouldEditProgressMessage, commentId,
  } = prep;
  let { relayMessage: S } = built;
  const { textRelayMessage: U, relayPhotoCandidate: K, relayMode: Ce, relayBodyOnly: Re } = built;
  const editTarget = progressRelayTarget?.progressMessageId ?? relayedMessageId;

  try {
    let useTextFallback = false;

    if (K) {
      try {
        const artifact = await downloadArtifact(config, K.path, K.branch);
        if (isTooLarge(artifact.bytes.byteLength)) {
          // Too large → send as text with link
          const url = buildArtifactUrl(config, K);
          S = buildPhotoTooLargeMessage(issue, comment, action, U, K, url, Re);
          useTextFallback = !!editTarget && (!shouldEditProgressMessage || progressRelayTarget?.messageKind === "photo");
        } else {
          // Upload binary to Telegram
          const { InputFile } = await import("grammy");
          const file = new InputFile(artifact.bytes, filenameFromPath(K.path));
          let sentMsgId;
          if (editTarget) {
            // Edit existing media message
            await bot.api.editMessageMedia(chatId, editTarget,
              { type: "photo", media: file, caption: S.text, parse_mode: S.parseMode },
              { reply_markup: replyMarkup });
            sentMsgId = editTarget;
          } else {
            const result = await bot.api.sendPhoto(chatId, file, {
              caption: S.text,
              parse_mode: S.parseMode,
              reply_parameters: replyToMessageId ? { message_id: replyToMessageId } : undefined,
              reply_markup: replyMarkup,
            });
            sentMsgId = result.message_id;
          }
          if (Number.isInteger(sentMsgId) && commentId !== null) {
            await saveRelayedMessageId(store, commentId, sentMsgId);
          }
          if (progressRelayTarget && Number.isInteger(sentMsgId)) {
            await saveRelayState(store, commentId, {
              ...progressRelayTarget,
              progressMessageId: sentMsgId,
              messageKind: "photo",
              updatedAt: new Date().toISOString(),
            });
          }
          return;
        }
      } catch (e) {
        logWarn("log.relay.imageRelayFailedPlainText", {
          issue: issue.number,
          error: e instanceof Error ? e.message : String(e),
        });
        S = U;
        useTextFallback = !!editTarget && !shouldEditProgressMessage;
      }
    }

    // Text message path
    if (editTarget && !useTextFallback) {
      // Edit existing message in place
      if (shouldEditProgressMessage && progressRelayTarget?.messageKind === "photo") {
        await bot.api.editMessageCaption(chatId, editTarget, {
          caption: S.text, parse_mode: S.parseMode, reply_markup: replyMarkup,
        });
      } else {
        await bot.api.editMessageText(chatId, editTarget, S.text,
          { parse_mode: S.parseMode, reply_markup: replyMarkup });
      }
      if (shouldEditProgressMessage) {
        await saveRelayState(store, commentId, progressRelayTarget);
      } else if (commentId !== null) {
        await saveRelayedMessageId(store, commentId, editTarget);
      }
      return;
    }

    // Send new message
    const sent = await bot.api.sendMessage(chatId, S.text, {
      parse_mode: S.parseMode,
      reply_parameters: replyToMessageId ? { message_id: replyToMessageId } : undefined,
      reply_markup: replyMarkup,
    });

    if (progressRelayTarget && commentId !== null) {
      await saveRelayState(store, commentId, {
        ...progressRelayTarget,
        progressMessageId: sent.message_id,
        messageKind: "text",
        updatedAt: new Date().toISOString(),
      });
    } else if (commentId !== null) {
      await saveRelayedMessageId(store, commentId, sent.message_id);
    }
  } catch (e) {
    // Parse-failure retry: "can't parse entities" → resend as plain text
    if (!((S.parseMode === "HTML" || S.parseMode === "MarkdownV2") &&
          e instanceof Error && e.message.includes("can't parse entities"))) {
      throw e;
    }
    logWarn("log.relay.formatParseFailedResend", { issue: issue.number, error: e.message });

    // Rebuild as plain text (no parseMode)
    const plainBody = buildFullRelayText(issue, comment, action, Re);
    S = fitMessage(issue, comment, action, { text: plainBody }, config.telegram.maxMessageLength, Re);

    const fallbackTarget = progressRelayTarget?.progressMessageId ?? relayedMessageId;
    if (fallbackTarget) {
      if (shouldEditProgressMessage && progressRelayTarget?.messageKind === "photo") {
        await bot.api.editMessageCaption(chatId, fallbackTarget, {
          caption: S.text, parse_mode: S.parseMode, reply_markup: replyMarkup,
        });
      } else {
        await bot.api.editMessageText(chatId, fallbackTarget, S.text,
          { parse_mode: S.parseMode, reply_markup: replyMarkup });
      }
      return;
    }

    const sent = await bot.api.sendMessage(chatId, S.text, {
      parse_mode: S.parseMode,
      reply_parameters: replyToMessageId ? { message_id: replyToMessageId } : undefined,
      reply_markup: replyMarkup,
    });
    if (commentId !== null) {
      await saveRelayedMessageId(store, commentId, sent.message_id);
    }
  }
}

// pu(payload, env) — main relay entry (L19031)
export async function relayComment(payload, env) {
  const { issue, comment } = payload;
  if (shouldSkipRelay(issue, comment)) return;

  const prep = await prepareRelay(payload, env);
  if (!prep) return;

  const built = buildRelayPayload(payload, env.config, prep);

  const { Bot } = await import("grammy");
  const bot = new Bot(env.config.telegram.botToken, {
    client: { apiRoot: env.config.telegram.apiBaseUrl ?? "https://api.telegram.org" },
  });

  await executeRelay(bot, payload, env, prep, built);
}

// Export helpers for testing
export {
  shouldSkipRelay, stripAllMeta, parseArtifactsMeta, extractRepoPaths,
  buildFullRelayText, buildRelayMessageObj, truncateWithNotice, fitMessage,
  detectPhotoCandidate, stripImageRef, buildRelayKeyboard,
  branchName, hasSystemMeta, isMediaStage, isPendingToFinalized,
  getRequestTelegramMeta, parseBrainResult, parseToolRun,
  normalizeRelayState, relayCommentKey, relayRequestKey, relayedMsgKey,
  getRelayByComment, getRelayByRequest, getRelayedMessageId,
  saveRelayedMessageId, saveRelayByComment, saveRelayByRequest, saveRelayState,
};