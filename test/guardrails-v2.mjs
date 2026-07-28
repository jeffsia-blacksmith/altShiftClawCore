// guardrails-v2.mjs — src-v2 护栏（Phase R）
// R0: /health, /, 404 routing, i18n parity
// R1: github webhook bad/valid signature, telegram webhook path fall-through + bad secret
// 后续阶段随实现推进逐步补 characterization 护栏（§10.5）。
import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  makeD1,
  installMockFetch,
  tg,
  gh,
  capturingCtx,
  tgUpdate,
} from "./lib/mock.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const SRC = join(root, "../src-v2/worker.js");
const OUT = join(root, ".test-bundle-v2.mjs");

await build({
  entryPoints: [SRC],
  bundle: true,
  format: "esm",
  platform: "neutral",
  minify: false,
  write: true,
  outfile: OUT,
  legalComments: "none",
  conditions: ["browser"],
});

const mod = await import(`file://${OUT}`);
const handler = mod.default.fetch;
const scheduled = mod.default.scheduled;

const MOCK_ENV = {
  GITHUB_OWNER: "test-owner",
  GITHUB_REPO: "test-repo",
  GITHUB_WEBHOOK_SECRET: "test-secret",
  TELEGRAM_BOT_TOKEN: "000000:fake",
  TELEGRAM_WEBHOOK_SECRET: "tg-secret",
  TELEGRAM_API_BASE_URL: "https://api.telegram.org",
  TELEGRAM_WEBHOOK_PATH: "/telegram/webhook",
  TELEGRAM_MAX_MESSAGE_LENGTH: "4096",
  CLAW_SYS_GITHUB_TOKEN: "ghp_fake",
  SCHEDULES_DB: makeD1(),
};

function baseEnv(overrides = {}) {
  return { ...MOCK_ENV, SCHEDULES_DB: makeD1(), ...overrides };
}

async function hitTg(label, env, update, extraFetchRoutes, check) {
  const replies = [];
  const mock = installMockFetch([tg.getMe(), tg.sendMessage(replies), ...extraFetchRoutes]);
  const ctx = capturingCtx();
  try {
    const req = new Request("https://test.dev/telegram/webhook", {
      method: "POST",
      headers: {
        "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET,
        "content-type": "application/json",
      },
      body: JSON.stringify(update),
    });
    const res = await handler(req, env, ctx);
    await ctx.drain();
    await check(res, replies, mock.calls);
  } catch (e) {
    console.error(`  ✗ ${label}: ${e.message}`);
    fail++;
    mock.restore();
    return;
  }
  console.log(`  ✓ ${label}`);
  pass++;
  mock.restore();
}

function assertReply(replies, { exact = 1, contains, inKeyboard, notKey = true } = {}) {
  if (replies.length !== exact)
    throw new Error(`expected ${exact} reply, got ${replies.length}: ${JSON.stringify(replies)}`);
  const msg = replies[0] ?? { text: "" };
  const text = msg.text ?? "";
  if (text.trim() === "" && !msg.reply_markup)
    throw new Error(`reply was empty (no text and no keyboard)`);
  if (notKey && /^[a-z][a-zA-Z]*\.[a-zA-Z]/.test(text) && !text.includes(" ") && text.length < 60)
    throw new Error(`reply looks like an unresolved i18n key: ${text}`);
  if (contains && !text.includes(contains))
    throw new Error(`reply text missing "${contains}": ${text}`);
  if (inKeyboard) {
    const labels = keyboardLabels(msg.reply_markup);
    if (!labels.some((l) => l.includes(inKeyboard)))
      throw new Error(`reply keyboard missing "${inKeyboard}": ${JSON.stringify(labels)}`);
  }
  return text;
}

function keyboardLabels(replyMarkup) {
  const ik = replyMarkup?.inline_keyboard;
  if (!Array.isArray(ik)) return [];
  return ik.flat().map((b) => b?.text ?? "").filter(Boolean);
}

let pass = 0, fail = 0;
async function hit(label, url, opts, check) {
  try {
    const req = new Request(`https://test.dev${url}`, opts);
    const res = await handler(req, MOCK_ENV, { waitUntil: () => {} });
    await check(res);
    console.log(`  ✓ ${label}`);
    pass++;
  } catch (e) {
    console.error(`  ✗ ${label}: ${e.message}`);
    fail++;
  }
}
function is(res, status) {
  if (res.status !== status) throw new Error(`expected status ${status}, got ${res.status}`);
}
async function json(res) { return res.json(); }

console.log("guardrails-v2: /health");
await hit("GET /health → 200 {ok,service}", "/health", {}, async (res) => {
  is(res, 200);
  const b = await json(res);
  if (b.ok !== true) throw new Error(`ok !== true: ${JSON.stringify(b)}`);
  if (b.service !== "githubclaw-core") throw new Error(`service mismatch: ${b.service}`);
  if (typeof b.version !== "string") throw new Error(`version missing: ${JSON.stringify(b)}`);
});

await hit("GET / → 200 (root alias)", "/", {}, async (res) => {
  is(res, 200);
  const b = await json(res);
  if (b.ok !== true) throw new Error(`ok !== true`);
  if (b.service !== "githubclaw-core") throw new Error(`service mismatch: ${b.service}`);
});

console.log("guardrails-v2: 404 routing");
await hit("GET /__nonexistent__ → 404", "/__nonexistent__", {}, async (res) => {
  if (res.status !== 404) throw new Error(`expected 404, got ${res.status}`);
});

console.log("guardrails-v2: /github/webhook signature");
await hit("POST /github/webhook bad signature → 400 {ok:false}", "/github/webhook", {
  method: "POST",
  headers: {
    "x-github-delivery": "test-id",
    "x-github-event": "ping",
    "x-hub-signature-256": "sha256=invalid",
    "content-type": "application/json",
  },
  body: "{}",
}, async (res) => {
  if (res.status !== 400) throw new Error(`expected 400, got ${res.status}`);
  const b = await json(res);
  if (b.ok !== false) throw new Error(`expected ok:false, got ${JSON.stringify(b)}`);
  if (typeof b.error !== "string" || !b.error) throw new Error(`expected error string, got ${b.error}`);
});

await hit("POST /github/webhook ping (empty sig) → 400 (no 5xx)", "/github/webhook", {
  method: "POST",
  headers: {
    "x-github-delivery": "test-id",
    "x-github-event": "ping",
    "content-type": "application/json",
  },
  body: "{}",
}, async (res) => {
  if (res.status >= 500) throw new Error(`expected < 500, got ${res.status}`);
  if (res.status !== 400) throw new Error(`expected 400 for empty sig with secret set, got ${res.status}`);
  const b = await json(res);
  if (b.ok !== false) throw new Error(`expected ok:false (signature mismatch), got ${JSON.stringify(b)}`);
});

console.log("guardrails-v2: /telegram/webhook path + secret");
await hit("POST /telegram/other-path → 404 (path fall-through)", "/telegram/other-path", {
  method: "POST",
  headers: { "x-telegram-bot-api-secret-token": "tg-secret", "content-type": "application/json" },
  body: JSON.stringify({ update_id: 1 }),
}, async (res) => {
  if (res.status !== 404) throw new Error(`expected 404 fall-through, got ${res.status}`);
});

await hit("POST /telegram/webhook bad secret → 401 {ok:false}", "/telegram/webhook", {
  method: "POST",
  headers: { "x-telegram-bot-api-secret-token": "WRONG", "content-type": "application/json" },
  body: JSON.stringify({ update_id: 1 }),
}, async (res) => {
  if (res.status !== 401) throw new Error(`expected 401, got ${res.status}`);
  const b = await json(res);
  if (b.ok !== false) throw new Error(`expected ok:false, got ${JSON.stringify(b)}`);
  if (b.error !== "Invalid secret") throw new Error(`expected "Invalid secret", got ${b.error}`);
});

// telegram valid-secret: 需要 mock getMe（bot.init 调用）
{
  const mock = installMockFetch([tg.getMe()]);
  await hit("POST /telegram/webhook valid secret → 200 {ok:true}", "/telegram/webhook", {
    method: "POST",
    headers: { "x-telegram-bot-api-secret-token": "tg-secret", "content-type": "application/json" },
    body: JSON.stringify({ update_id: 1, message: { message_id: 1, from: { id: 1 }, chat: { id: 1, type: "private" }, date: 1, text: "/start" } }),
  }, async (res) => {
    is(res, 200);
    const b = await json(res);
    if (b.ok !== true) throw new Error(`expected {ok:true}, got ${JSON.stringify(b)}`);
  });
  mock.restore();
}

console.log("guardrails-v2: Telegram AccessGuard + commands");
// 1. wrong path → 404 fall-through (already covered above, reaffirmed for tg group)

// 2. AccessGuard not configured → 200 + 1 access reply
await hitTg("AccessGuard not configured → 200 + 1 access reply", baseEnv(), tgUpdate("/list"), [], async (res, replies) => {
  is(res, 200);
  const b = await json(res);
  if (b.ok !== true) throw new Error(`expected {ok:true}, got ${JSON.stringify(b)}`);
  assertReply(replies);
});

const guardedEnv = baseEnv({
  TELEGRAM_ALLOWED_FROM_ID: "111",
  TELEGRAM_ALLOWED_CHAT_ID: "111",
});

// 3. /help → reply containing "/list"
await hitTg("POST /help (configured) → reply with command list", guardedEnv, tgUpdate("/help"), [], async (res, replies) => {
  is(res, 200);
  const text = assertReply(replies, { contains: "/list" });
  if (text.length < 20) throw new Error(`help reply too short: ${text}`);
});

// 4. /list empty issues → one "no lobsters" reply
await hitTg("POST /list empty issues → reply (GitHub mocked empty)", guardedEnv, tgUpdate("/list"), [gh.issues([])], async (res, replies) => {
  is(res, 200);
  assertReply(replies);
});

// 5. /list with one issue → keyboard button mentions the issue number
await hitTg("POST /list one issue → keyboard shows #7", guardedEnv, tgUpdate("/list"), [
  gh.issues([{ number: 7, title: "Test issue" }]),
], async (res, replies) => {
  is(res, 200);
  assertReply(replies, { inKeyboard: "7" });
});

// 6. /current with no active issue → one "no tracked" reply
await hitTg("POST /current no active issue → reply", guardedEnv, tgUpdate("/current"), [], async (res, replies) => {
  is(res, 200);
  assertReply(replies);
});

console.log("guardrails-v2: i18n parity (en/zh leaf-key)");
await (async () => {
  try {
    const en = JSON.parse(readFileSync(join(root, "../src-v2/i18n/en.json"), "utf8"));
    const zh = JSON.parse(readFileSync(join(root, "../src-v2/i18n/zh-CN.json"), "utf8"));
    const leaves = (o, p = "") =>
      Object.entries(o).flatMap(([k, v]) =>
        v && typeof v === "object" ? leaves(v, `${p}${k}.`) : [`${p}${k}`]
      );
    const enKeys = leaves(en).sort();
    const zhKeys = leaves(zh).sort();
    if (enKeys.length !== zhKeys.length) {
      throw new Error(`leaf count mismatch: en=${enKeys.length} zh=${zhKeys.length}`);
    }
    const missing = enKeys.filter((k) => !zhKeys.includes(k));
    if (missing.length) throw new Error(`zh missing keys: ${missing.slice(0, 5).join(", ")}`);
    const extra = zhKeys.filter((k) => !enKeys.includes(k));
    if (extra.length) throw new Error(`zh extra keys: ${extra.slice(0, 5).join(", ")}`);
    if (enKeys.length !== 813) throw new Error(`expected 813 leaf keys, got ${enKeys.length}`);
    console.log(`  ✓ i18n parity ${enKeys.length}×2 (en=zh, zero mismatch)`);
    pass++;
  } catch (e) {
    console.error(`  ✗ i18n parity: ${e.message}`);
    fail++;
  }
})();

console.log("guardrails-v2: i18n t() key resolution + placeholders");
await (async () => {
  try {
    const { t } = await import(`file://${join(root, "../src-v2/i18n/index.js")}`);
    // EN key resolution
    const enHealth = t("core.workflowStatusCard", {}, "en");
    if (typeof enHealth !== "string" || enHealth.length === 0)
      throw new Error(`en core.workflowStatusCard empty: ${enHealth}`);
    if (enHealth.startsWith("core."))
      throw new Error(`en key leaked unresolved: ${enHealth}`);
    // ZH key resolution (different value than en)
    const zhHealth = t("core.workflowStatusCard", {}, "zh-CN");
    if (typeof zhHealth !== "string" || zhHealth.length === 0)
      throw new Error(`zh core.workflowStatusCard empty: ${zhHealth}`);
    // Unknown key returns the dotted key path (fallback)
    const unknown = t("core.__nonexistent_key__", {}, "en");
    if (unknown !== "core.__nonexistent_key__")
      throw new Error(`unknown key should return path, got: ${unknown}`);
    // Placeholder interpolation
    const interpolated = t("access.messageTooLong", { max: 12345 }, "en");
    if (!String(interpolated).includes("12345"))
      throw new Error(`placeholder {max} not interpolated: ${interpolated}`);
    // Fallback to en when lang dict missing the key
    const enOnly = t("access.notFullyConfigured", {}, "en");
    const zhFallback = t("access.notFullyConfigured", {}, "zh-CN");
    if (enOnly === "access.notFullyConfigured" || zhFallback === "access.notFullyConfigured")
      throw new Error(`notFullyConfigured unresolved in both: en=${enOnly} zh=${zhFallback}`);
    console.log("  ✓ t() en/zh/unknown/placeholder/fallback");
    pass++;
  } catch (e) {
    console.error(`  ✗ i18n t(): ${e.message}`);
    fail++;
  }
})();

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);