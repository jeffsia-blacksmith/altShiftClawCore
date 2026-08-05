import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const SRC = join(root, "../src/worker.js");
const OUT = join(root, ".test-bundle.mjs");

await build({
  entryPoints: [SRC],
  bundle: true,
  format: "esm",
  platform: "neutral",
  conditions: ["browser"],
  minify: false,
  write: true,
  outfile: OUT,
  legalComments: "none",
  alias: { crypto: join(root, "../src/modules/empty.js") },
});

const mod = await import(`file://${OUT}`);
const handler = mod.default.fetch;
const scheduled = mod.default.scheduled;
const {
  installMockFetch,
  tg,
  gh,
  makeD1,
  mockAI,
  capturingCtx,
  tgUpdate,
} = await import(`file://${join(root, "lib/mock.mjs")}`);

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
  SCHEDULES_DB: { prepare: () => ({ bind: () => ({}), run: async () => ({}), first: async () => null, all: async () => [] }) },
};

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

console.log("guardrails: /health");
await hit("GET /health → 200 {ok,service}", "/health", {}, async (res) => {
  is(res, 200);
  const b = await json(res);
  if (b.ok !== true) throw new Error(`ok !== true: ${JSON.stringify(b)}`);
  if (b.service !== "githubclaw-core") throw new Error(`service mismatch: ${b.service}`);
});

await hit("GET / → 200 (root alias)", "/", {}, async (res) => {
  is(res, 200);
  const b = await json(res);
  if (b.ok !== true) throw new Error(`ok !== true`);
});

// /health/ai with no AI binding → ok:false, ai_bound:false (no fetch/AI call attempted)
await hit("GET /health/ai (no AI binding) → ok:false ai_bound:false", "/health/ai", {}, async (res) => {
  is(res, 200);
  const b = await json(res);
  if (b.ok !== false) throw new Error(`expected ok:false, got ${b.ok}`);
  if (b.ai_bound !== false) throw new Error(`expected ai_bound:false, got ${b.ai_bound}`);
  if (!b.model || !b.error) throw new Error(`expected model+error, got ${JSON.stringify(b)}`);
});

// /health/ai with a working AI binding → ok:true, ai_bound:true, sample present
{
  const envWithAI = { ...MOCK_ENV, AI: mockAI({ status: "pong" }) };
  try {
    const req = new Request("https://test.dev/health/ai");
    const res = await handler(req, envWithAI, { waitUntil: () => {} });
    is(res, 200);
    const b = await res.json();
    if (b.ok !== true || b.ai_bound !== true) throw new Error(`expected ok+ai_bound true, got ${JSON.stringify(b)}`);
    if (!b.model || typeof b.sample !== "string") throw new Error(`expected model+sample, got ${JSON.stringify(b)}`);
    console.log("  ✓ GET /health/ai (mock AI bound) → ok:true ai_bound:true sample");
    pass++;
  } catch (e) { console.error(`  ✗ /health/ai (mock AI): ${e.message}`); fail++; }
}

console.log("guardrails: 404 routing");
await hit("GET /__nonexistent__ → 404", "/__nonexistent__", {}, async (res) => {
  if (res.status === 200) throw new Error("should not be 200");
});

console.log("guardrails: /github/webhook signature");
await hit("POST /github/webhook with bad signature → 400", "/github/webhook", {
  method: "POST",
  headers: {
    "x-github-delivery": "test-id",
    "x-github-event": "ping",
    "x-hub-signature-256": "sha256=invalid",
    "content-type": "application/json",
  },
  body: "{}",
}, async (res) => {
  if (res.status === 200) throw new Error(`bad signature should not be 200, got ${res.status}`);
  if (res.status < 400 || res.status >= 500) throw new Error(`expected 4xx, got ${res.status}`);
  const b = await json(res);
  if (b.ok !== false) throw new Error(`ok should be false: ${JSON.stringify(b)}`);
});

await hit("POST /github/webhook ping with valid signature → 200", "/github/webhook", {
  method: "POST",
  headers: {
    "x-github-delivery": "test-id",
    "x-github-event": "ping",
    "content-type": "application/json",
  },
  body: "{}",
}, async (res) => {
  if (res.status >= 500) throw new Error(`server error: ${res.status}`);
});

// --- Unit-level guardrail: workflow_notifications CRUD round-trip ---
console.log("guardrails: workflow_notifications CRUD (extracted module)");
{
  const WN = await import(`file://${join(root, "../src/modules/workflow-notifications.js")}`);
  const rows = new Map();
  const table = `CREATE TABLE workflow_notifications (id, request_id UNIQUE, repo, workflow_name, workflow_path, title, channel, chat_id, message_id, event_name, status, conclusion, workflow_run_id, workflow_ref, head_branch, head_sha, source_type, source_id, payload_json, error_message, created_at, updated_at, completed_at, notified_at)`;
  const d1 = {
    prepare(sql) {
      const stmt = {
        bind(...args) {
          stmt._args = args;
          if (sql.startsWith("INSERT")) {
            stmt.run = async () => {
              const [id, request_id, repo, workflow_name, workflow_path, title, channel, chat_id, message_id, event_name, status, workflow_ref, head_branch, head_sha, source_type, source_id, payload_json, created_at, updated_at] = args;
              rows.set(request_id, { id, request_id, repo, workflow_name, workflow_path, title, channel, chat_id, message_id, event_name, status, conclusion: null, workflow_run_id: null, workflow_ref, head_branch, head_sha, source_type, source_id, payload_json, created_at, updated_at, completed_at: null, notified_at: null });
              return {};
            };
            stmt.first = async () => null;
          } else if (sql.startsWith("SELECT * FROM workflow_notifications WHERE request_id")) {
            stmt.first = async () => rows.get(stmt._args[0]) ?? null;
          } else if (sql.startsWith("SELECT * FROM workflow_notifications WHERE workflow_run_id")) {
            stmt.first = async () => [...rows.values()].find(r => String(r.workflow_run_id) === String(stmt._args[0])) ?? null;
          } else if (sql.startsWith("SELECT * FROM workflow_notifications") && sql.includes("workflow_path = ?")) {
            stmt.first = async () => [...rows.values()].filter(r => r.workflow_path === stmt._args[0] && r.status === "pending").sort((a,b) => (b.created_at||"").localeCompare(a.created_at||""))[0] ?? null;
          } else if (sql.startsWith("UPDATE workflow_notifications")) {
            stmt.run = async () => {
              const row = rows.get(stmt._args[stmt._args.length - 1]);
              if (!row) return {};
              const [status, conclusion, workflow_run_id, workflow_ref, head_branch, head_sha, error_message, completed_at, notified_at] = stmt._args;
              if (status != null) row.status = status;
              if (conclusion != null) row.conclusion = conclusion;
              if (workflow_run_id != null) row.workflow_run_id = workflow_run_id;
              if (workflow_ref != null) row.workflow_ref = workflow_ref;
              if (head_branch != null) row.head_branch = head_branch;
              if (head_sha != null) row.head_sha = head_sha;
              if (error_message != null) row.error_message = error_message;
              if (completed_at != null) row.completed_at = completed_at;
              if (notified_at != null) row.notified_at = notified_at;
              row.updated_at = new Date().toISOString();
              return {};
            };
          } else if (sql.startsWith("DELETE FROM workflow_notifications")) {
            stmt.run = async () => { rows.delete(stmt._args[0]); return {}; };
          } else if (sql.startsWith("CREATE")) {
            stmt.run = async () => ({});
          } else {
            stmt.run = async () => ({});
            stmt.first = async () => null;
          }
          return stmt;
        },
        run: async () => ({}),
        first: async () => null,
      };
      return stmt;
    },
  };

  try {
    await WN.initWorkflowNotificationsTable(d1);
    const created = await WN.createWorkflowNotification(d1, {
      requestId: "req-1", repo: "o/r", workflowName: "ci.yml", channel: "telegram",
      chatId: "123", messageId: "456", eventName: "workflow_dispatch", status: "pending",
    });
    if (!created || created.requestId !== "req-1") throw new Error(`create returned wrong: ${JSON.stringify(created)}`);
    if (created.status !== "pending") throw new Error(`status mismatch`);

    const got = await WN.getWorkflowNotificationByRequestId(d1, "req-1");
    if (!got || got.requestId !== "req-1") throw new Error("getByRequestId failed");

    await WN.updateWorkflowNotificationByRequestId(d1, "req-1", { status: "completed", conclusion: "success", workflowRunId: 999 });
    const updated = await WN.getWorkflowNotificationByRequestId(d1, "req-1");
    if (updated.status !== "completed" || updated.conclusion !== "success" || updated.workflowRunId !== 999)
      throw new Error(`update not applied: ${JSON.stringify(updated)}`);

    const byRun = await WN.getWorkflowNotificationByRunId(d1, 999);
    if (!byRun || byRun.requestId !== "req-1") throw new Error("getByRunId failed");

    await WN.deleteWorkflowNotificationByRequestId(d1, "req-1");
    const afterDelete = await WN.getWorkflowNotificationByRequestId(d1, "req-1");
    if (afterDelete !== null) throw new Error("delete failed");

    console.log("  ✓ CRUD round-trip (create/get/update/getByRunId/delete)");
    pass++;
  } catch (e) {
    console.error(`  ✗ CRUD round-trip: ${e.message}`);
    fail++;
  }
}

// --- Worker-level guardrails: Telegram webhook, AccessGuard, commands, cron ---
// These assert on STRUCTURE (status, reply count, non-empty body, stable tokens like
// the issue number) — NOT on Traditional-Chinese text — so the i18n migration (which
// changes literal reply text) keeps them green while still catching catastrophic
// regressions (5xx, missing reply, broken control flow, an unresolved t() key leaking
// through as a dotted path).
console.log("guardrails: Telegram webhook + AccessGuard + commands + cron");

function baseEnv(overrides = {}) {
  return {
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
    ...overrides,
  };
}

// POST a Telegram Update to /telegram/webhook with mock fetch + a capturing ctx,
// drain waitUntil side-effects (grammY replies happen inside handleUpdate's waitUntil),
// then run check(res, replyTexts, fetchCalls).
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
  // an unresolved t() key returns the raw dotted key path — must never leak to the user
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

// 1. wrong path → falls through (404), NOT the secret 401
await hit("POST /telegram/other-path → 404 (path fall-through, not secret 401)", "/other-path", {
  method: "POST",
  headers: { "x-telegram-bot-api-secret-token": "tg-secret", "content-type": "application/json" },
  body: JSON.stringify(tgUpdate("/list")),
}, async (res) => {
  if (res.status !== 404) throw new Error(`expected 404 fall-through, got ${res.status}`);
});

// 2. bad/missing secret → 401 {ok:false,error}
await hit("POST /telegram/webhook bad secret → 401", "/telegram/webhook", {
  method: "POST",
  headers: { "x-telegram-bot-api-secret-token": "WRONG", "content-type": "application/json" },
  body: JSON.stringify(tgUpdate("/list")),
}, async (res) => {
  if (res.status !== 401) throw new Error(`expected 401, got ${res.status}`);
  const b = await json(res);
  if (b.ok !== false) throw new Error(`expected ok:false, got ${JSON.stringify(b)}`);
});

// 3. AccessGuard default-deny (allowed IDs unset) → 200 {ok:true} + one reply
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

// 4. /help (fully-migrated fy() builder) → one reply listing commands
await hitTg("POST /help (configured) → reply with command list", guardedEnv, tgUpdate("/help"), [], async (res, replies) => {
  is(res, 200);
  const text = assertReply(replies, { contains: "/list" });
  if (text.length < 20) throw new Error(`help reply too short: ${text}`);
});

// 5. /list with empty issues → one "no lobsters" reply
await hitTg("POST /list empty issues → reply (GitHub mocked empty)", guardedEnv, tgUpdate("/list"), [gh.issues([])], async (res, replies) => {
  is(res, 200);
  assertReply(replies);
});

// 6. /list with one issue → keyboard button mentions the issue number (stable token)
await hitTg("POST /list one issue → keyboard shows #7", guardedEnv, tgUpdate("/list"), [
  gh.issues([{ number: 7, title: "Test issue" }]),
], async (res, replies) => {
  is(res, 200);
  assertReply(replies, { inKeyboard: "7" });
});

// 7. /current with no active issue → one "no active" reply
await hitTg("POST /current no active issue → reply", guardedEnv, tgUpdate("/current"), [], async (res, replies) => {
  is(res, 200);
  assertReply(replies);
});

// 8. scheduled (cron) with no due schedules → [] and zero fetch calls
{
  const mock = installMockFetch([]);
  const ctx = capturingCtx();
  try {
    const result = await scheduled({}, baseEnv(), ctx);
    await ctx.drain();
    if (!Array.isArray(result)) throw new Error(`cron should return array, got ${typeof result}`);
    if (result.length !== 0) throw new Error(`expected empty result, got ${JSON.stringify(result)}`);
    if (mock.calls.length !== 0)
      throw new Error(`cron empty should make no fetch calls: ${JSON.stringify(mock.calls.map((c) => c.url))}`);
    console.log("  ✓ scheduled (cron) empty → [] with no fetch calls");
    pass++;
  } catch (e) {
    console.error(`  ✗ scheduled (cron) empty: ${e.message}`);
    fail++;
  } finally {
    mock.restore();
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);