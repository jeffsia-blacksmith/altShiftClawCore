// guardrails-v2.mjs — src-v2 护栏（Phase R）
// R0: /health, /, 404 routing, i18n parity
// R1: github webhook bad/valid signature, telegram webhook path fall-through + bad secret
// 后续阶段随实现推进逐步补 characterization 护栏（§10.5）。
import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createHmac } from "node:crypto";
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
    await check(res, replies, mock.calls, env);
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

console.log("guardrails-v2: Telegram flows (/new + switch_issue + close)");
// 7. /new → reply enterName + D1 new-flow state awaiting_name
await hitTg("POST /new → enterName reply + flow state awaiting_name", guardedEnv, tgUpdate("/new"), [], async (res, replies, _calls, env) => {
  is(res, 200);
  const text = assertReply(replies, { contains: "lobster" });
  void text;
  const flow = env.SCHEDULES_DB.getKv("new-flow:111");
  if (!flow) throw new Error("D1 missing new-flow:111");
  const st = JSON.parse(flow);
  if (st.step !== "awaiting_name" || st.mode !== "create")
    throw new Error(`flow state wrong: ${flow}`);
});

// 8. /new then text "Bookkeeping" → reply enterDescription + flow awaiting_description
{
  const env = baseEnv({ TELEGRAM_ALLOWED_FROM_ID: "111", TELEGRAM_ALLOWED_CHAT_ID: "111" });
  const replies = [];
  const mock = installMockFetch([tg.getMe(), tg.sendMessage(replies)]);
  const ctx = capturingCtx();
  try {
    // step 0: /new
    let req = new Request("https://test.dev/telegram/webhook", {
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET, "content-type": "application/json" },
      body: JSON.stringify(tgUpdate("/new")),
    });
    let res = await handler(req, env, ctx);
    await ctx.drain();
    is(res, 200);
    // step 1: send name text
    replies.length = 0;
    req = new Request("https://test.dev/telegram/webhook", {
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET, "content-type": "application/json" },
      body: JSON.stringify(tgUpdate("Bookkeeping Lobster")),
    });
    res = await handler(req, env, ctx);
    await ctx.drain();
    is(res, 200);
    assertReply(replies, { contains: "Bookkeeping" });
    const flow = env.SCHEDULES_DB.getKv("new-flow:111");
    const st = JSON.parse(flow);
    if (st.step !== "awaiting_description" || st.name !== "Bookkeeping Lobster")
      throw new Error(`flow state after name: ${flow}`);
    console.log("  ✓ /new + text name → enterDescription reply + flow awaiting_description");
    pass++;
  } catch (e) {
    console.error(`  ✗ /new + text name flow: ${e.message}`);
    fail++;
  } finally {
    mock.restore();
  }
}

// 9. switch_issue callback — set active-issue + clear new-flow
{
  const env = baseEnv({
    TELEGRAM_ALLOWED_FROM_ID: "111",
    TELEGRAM_ALLOWED_CHAT_ID: "111",
  });
  // 预置 menu-state:list + 一条开 issue
  env.SCHEDULES_DB.putKv("menu-state:111", JSON.stringify({ mode: "list", messageId: 42 }));
  const replies = [];
  const cbAnswers = [];
  const mock = installMockFetch([
    tg.getMe(),
    tg.sendMessage(replies),
    tg.answerCallback(cbAnswers),
    tg.editMessageText(replies),
    gh.issues([{ number: 7, title: "Test issue" }]),
  ]);
  const ctx = capturingCtx();
  try {
    const update = {
      update_id: 2,
      callback_query: {
        id: "cq1",
        from: { id: 111, is_bot: false, first_name: "Test" },
        message: { message_id: 42, chat: { id: 111, type: "private" }, date: 1700000000, text: "list" },
        chat_instance: "x",
        data: "switch_issue:7",
      },
    };
    const req = new Request("https://test.dev/telegram/webhook", {
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET, "content-type": "application/json" },
      body: JSON.stringify(update),
    });
    const res = await handler(req, env, ctx);
    await ctx.drain();
    is(res, 200);
    const active = env.SCHEDULES_DB.getKv("active-issue:111");
    if (active !== "7") throw new Error(`active-issue:111 expected "7", got ${active}`);
    console.log("  ✓ switch_issue:7 → active-issue:111 = 7");
    pass++;
  } catch (e) {
    console.error(`  ✗ switch_issue: ${e.message}`);
    fail++;
  } finally {
    mock.restore();
  }
}

console.log("guardrails-v2: GitHub webhook event dispatch");
// 用真实 HMAC-SHA256 签名验证 issue_comment.created 路由到 Telegram relay
{
  const env = baseEnv();
  // issue body 含 telegram-meta chat_id=111（对齐护栏 guardedEnv 的 chat id）
  const issueBody = `<!-- telegram-meta: {"chat_id":111,"msg_id":50} -->\n\n\`\`\`json\n{"name":"Test","description":"d"}\n\`\`\``;
  const payload = JSON.stringify({
    action: "created",
    issue: { number: 7, title: "Test issue", body: issueBody, html_url: "https://github.com/test-owner/test-repo/issues/7" },
    comment: { id: 99, body: "Hello from GitHub", html_url: "https://github.com/test-owner/test-repo/issues/7#issuecomment-99" },
    sender: { login: "human-user", type: "User" },
  });
  const sig = "sha256=" + createHmac("sha256", env.GITHUB_WEBHOOK_SECRET).update(payload).digest("hex");
  const tgReplies = [];
  const mock = installMockFetch([tg.getMe(), tg.sendMessage(tgReplies)]);
  const ctx = capturingCtx();
  try {
    const req = new Request("https://test.dev/github/webhook", {
      method: "POST",
      headers: {
        "x-github-delivery": "deliv-1",
        "x-github-event": "issue_comment",
        "x-hub-signature-256": sig,
        "content-type": "application/json",
      },
      body: payload,
    });
    const res = await handler(req, env, ctx);
    await ctx.drain();
    is(res, 200);
    const b = await json(res);
    if (b.ok !== true) throw new Error(`expected {ok:true}, got ${JSON.stringify(b)}`);
    // relay 应发 1 条 Telegram 消息（body-only "Hello from GitHub"）
    if (tgReplies.length < 1) throw new Error(`expected >=1 telegram relay, got ${tgReplies.length}`);
    const text = tgReplies[0].text ?? "";
    if (!text.includes("Hello from GitHub"))
      throw new Error(`relay text missing comment body: ${text}`);
    console.log("  ✓ issue_comment.created (valid sig) → 200 + Telegram relay");
    pass++;
  } catch (e) {
    console.error(`  ✗ issue_comment.created dispatch: ${e.message}`);
    fail++;
  } finally {
    mock.restore();
  }
}

// issues.opened → 200，无副作用
{
  const env = baseEnv();
  const payload = JSON.stringify({
    action: "opened",
    issue: { number: 8, title: "New issue", body: "" },
    sender: { login: "human-user", type: "User" },
  });
  const sig = "sha256=" + createHmac("sha256", env.GITHUB_WEBHOOK_SECRET).update(payload).digest("hex");
  const mock = installMockFetch([]);
  const ctx = capturingCtx();
  try {
    const req = new Request("https://test.dev/github/webhook", {
      method: "POST",
      headers: {
        "x-github-delivery": "deliv-2",
        "x-github-event": "issues",
        "x-hub-signature-256": sig,
        "content-type": "application/json",
      },
      body: payload,
    });
    const res = await handler(req, env, ctx);
    await ctx.drain();
    is(res, 200);
    const b = await json(res);
    if (b.ok !== true) throw new Error(`expected {ok:true}, got ${JSON.stringify(b)}`);
    console.log("  ✓ issues.opened (valid sig) → 200 {ok:true}");
    pass++;
  } catch (e) {
    console.error(`  ✗ issues.opened: ${e.message}`);
    fail++;
  } finally {
    mock.restore();
  }
}

console.log("guardrails-v2: Scheduler (cron)");
// 1. no SCHEDULES_DB binding → [] (early bail, no fetch)
{
  const env = { ...baseEnv(), SCHEDULES_DB: undefined };
  const ctx = capturingCtx();
  try {
    const result = await scheduled({}, env, ctx);
    await ctx.drain();
    if (!Array.isArray(result)) throw new Error(`cron should return array, got ${typeof result}`);
    if (result.length !== 0) throw new Error(`expected empty, got ${JSON.stringify(result)}`);
    console.log("  ✓ scheduled (cron) no SCHEDULES_DB → []");
    pass++;
  } catch (e) {
    console.error(`  ✗ scheduled no SCHEDULES_DB: ${e.message}`);
    fail++;
  }
}
// 2. empty schedules → [] with no fetch calls
{
  const env = baseEnv();
  const mock = installMockFetch([]);
  const ctx = capturingCtx();
  try {
    const result = await scheduled({}, env, ctx);
    await ctx.drain();
    if (!Array.isArray(result)) throw new Error(`cron should return array, got ${typeof result}`);
    if (result.length !== 0) throw new Error(`expected empty, got ${JSON.stringify(result)}`);
    if (mock.calls.length !== 0)
      throw new Error(`cron empty should make no fetch calls: ${JSON.stringify(mock.calls.map((c) => c.url))}`);
    console.log("  ✓ scheduled (cron) empty → [] with no fetch calls");
    pass++;
  } catch (e) {
    console.error(`  ✗ scheduled empty: ${e.message}`);
    fail++;
  } finally {
    mock.restore();
  }
}

// gh helpers for workflow commands
function ghWorkflows(workflows) {
  return {
    match: (url) => /\/repos\/[^/]+\/[^/]+\/actions\/workflows(\?|$)/.test(url),
    response: () => ({ body: JSON.stringify({ workflows }) }),
  };
}
function ghWorkflowEnable() {
  return {
    match: (url) => /\/actions\/workflows\/\d+\/enable$/.test(url),
    response: () => ({ body: JSON.stringify({ ok: true }) }),
  };
}
function ghRepo(defaultBranch = "main") {
  return {
    match: (url) => /\/repos\/[^/]+\/[^/]+(\?|$)/.test(url) && !url.includes("/actions/") && !url.includes("/issues") && !url.includes("/contents"),
    response: () => ({ body: JSON.stringify({ default_branch: defaultBranch }) }),
  };
}
function ghDispatch() {
  return {
    match: (url) => /\/actions\/workflows\/[^/]+\/dispatches$/.test(url),
    response: () => ({ body: JSON.stringify({ ok: true }) }),
  };
}

// 7. /clear no active → noActiveLobsterSelected
await hitTg("POST /clear no active issue → noActiveLobsterSelected", guardedEnv, tgUpdate("/clear"), [], async (res, replies) => {
  is(res, 200);
  assertReply(replies, { contains: "lobster" });
});

// 8. /enable no active → noActiveLobsterSelected
await hitTg("POST /enable no active issue → noActiveLobsterSelected", guardedEnv, tgUpdate("/enable"), [], async (res, replies) => {
  is(res, 200);
  assertReply(replies, { contains: "lobster" });
});

// 9. /workflow no active → noActiveLobsterSelected
await hitTg("POST /workflow no active issue → noActiveLobsterSelected", guardedEnv, tgUpdate("/workflow"), [], async (res, replies) => {
  is(res, 200);
  assertReply(replies, { contains: "lobster" });
});

// 10. /enable with active → enableWorkflow called
{
  const env = baseEnv({ TELEGRAM_ALLOWED_FROM_ID: "111", TELEGRAM_ALLOWED_CHAT_ID: "111" });
  env.SCHEDULES_DB.putKv("active-issue:111", "7");
  const mock = installMockFetch([
    tg.getMe(),
    tg.sendMessage([]),
    ghWorkflows([{ id: 42, path: ".github/workflows/issue-7.yml", state: "active" }]),
    ghWorkflowEnable(),
  ]);
  const ctx = capturingCtx();
  try {
    const req = new Request("https://test.dev/telegram/webhook", {
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET, "content-type": "application/json" },
      body: JSON.stringify(tgUpdate("/enable")),
    });
    const res = await handler(req, env, ctx);
    await ctx.drain();
    is(res, 200);
    const enableCall = mock.calls.find((c) => /\/actions\/workflows\/42\/enable$/.test(c.url));
    if (!enableCall) throw new Error("expected enableWorkflow call, not made");
    console.log("  ✓ /enable (active=7) → enableWorkflow dispatched");
    pass++;
  } catch (e) {
    console.error(`  ✗ /enable with active: ${e.message}`);
    fail++;
  } finally {
    mock.restore();
  }
}

// 11. /clear with active → dispatch clear-memory.yml
{
  const env = baseEnv({ TELEGRAM_ALLOWED_FROM_ID: "111", TELEGRAM_ALLOWED_CHAT_ID: "111" });
  env.SCHEDULES_DB.putKv("active-issue:111", "7");
  const mock = installMockFetch([
    tg.getMe(),
    tg.sendMessage([]),
    ghRepo("main"),
    ghDispatch(),
  ]);
  const ctx = capturingCtx();
  try {
    const req = new Request("https://test.dev/telegram/webhook", {
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET, "content-type": "application/json" },
      body: JSON.stringify(tgUpdate("/clear")),
    });
    const res = await handler(req, env, ctx);
    await ctx.drain();
    is(res, 200);
    const dispatchCall = mock.calls.find((c) => /\/actions\/workflows\/[^/]+\/dispatches$/.test(c.url));
    if (!dispatchCall) throw new Error("expected workflow dispatch, not made");
    if (!/\/workflows\/clear-memory\.yml\//.test(dispatchCall.url))
      throw new Error(`wrong workflow in URL: ${dispatchCall.url}`);
    const body = JSON.parse(dispatchCall.body ?? "{}");
    if (body.inputs?.active_issue !== "7") throw new Error(`wrong inputs: ${JSON.stringify(body.inputs)}`);
    console.log("  ✓ /clear (active=7) → clear-memory.yml dispatch with active_issue=7");
    pass++;
  } catch (e) {
    console.error(`  ✗ /clear with active: ${e.message}`);
    fail++;
  } finally {
    mock.restore();
  }
}

console.log("guardrails-v2: Media relay + album queue");
// 12. single photo, no active issue → noActiveIssueWarn reply
{
  const env = baseEnv({ TELEGRAM_ALLOWED_FROM_ID: "111", TELEGRAM_ALLOWED_CHAT_ID: "111" });
  const replies = [];
  const mock = installMockFetch([tg.getMe(), tg.sendMessage(replies)]);
  const ctx = capturingCtx();
  try {
    const update = {
      update_id: 3,
      message: {
        message_id: 20, from: { id: 111 }, chat: { id: 111, type: "private" }, date: 1700000000,
        photo: [{ file_id: "f1", width: 100, height: 100 }],
        caption: "a photo",
      },
    };
    const req = new Request("https://test.dev/telegram/webhook", {
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET, "content-type": "application/json" },
      body: JSON.stringify(update),
    });
    const res = await handler(req, env, ctx);
    await ctx.drain();
    is(res, 200);
    assertReply(replies);
    console.log("  ✓ single photo no active issue → noActiveIssueWarn reply");
    pass++;
  } catch (e) {
    console.error(`  ✗ single photo no active: ${e.message}`);
    fail++;
  } finally {
    mock.restore();
  }
}

// 13. single photo with active issue → createComment
{
  const env = baseEnv({ TELEGRAM_ALLOWED_FROM_ID: "111", TELEGRAM_ALLOWED_CHAT_ID: "111" });
  env.SCHEDULES_DB.putKv("active-issue:111", "7");
  const replies = [];
  const comments = [];
  const mock = installMockFetch([tg.getMe(), tg.sendMessage(replies), gh.createComment(comments)]);
  const ctx = capturingCtx();
  try {
    const update = {
      update_id: 4,
      message: {
        message_id: 21, from: { id: 111 }, chat: { id: 111, type: "private" }, date: 1700000000,
        photo: [{ file_id: "f1", width: 100, height: 100 }, { file_id: "f2", width: 800, height: 600 }],
        caption: "single photo caption",
      },
    };
    const req = new Request("https://test.dev/telegram/webhook", {
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET, "content-type": "application/json" },
      body: JSON.stringify(update),
    });
    const res = await handler(req, env, ctx);
    await ctx.drain();
    is(res, 200);
    if (comments.length !== 1) throw new Error(`expected 1 createComment, got ${comments.length}`);
    if (!comments[0].includes("photo")) throw new Error(`comment body missing label: ${comments[0]}`);
    console.log("  ✓ single photo (active=7) → 1 createComment");
    pass++;
  } catch (e) {
    console.error(`  ✗ single photo with active: ${e.message}`);
    fail++;
  } finally {
    mock.restore();
  }
}

// 14. photo album (media_group_id) → album_queue INSERT then flush + 1 createComment
{
  const env = baseEnv({ TELEGRAM_ALLOWED_FROM_ID: "111", TELEGRAM_ALLOWED_CHAT_ID: "111" });
  env.SCHEDULES_DB.putKv("active-issue:111", "7");
  const replies = [];
  const comments = [];
  const mock = installMockFetch([tg.getMe(), tg.sendMessage(replies), gh.createComment(comments)]);
  const ctx = capturingCtx();
  try {
    // 发两张同 group 的照片，并发处理（不逐个 drain，让 3s debounce 重叠）
    for (let i = 0; i < 2; i++) {
      const update = {
        update_id: 10 + i,
        message: {
          message_id: 30 + i, from: { id: 111 }, chat: { id: 111, type: "private" }, date: 1700000000,
          media_group_id: "group-1",
          photo: [{ file_id: `f${i}`, width: 100, height: 100 }],
          caption: i === 1 ? "album caption" : "",
        },
      };
      const req = new Request("https://test.dev/telegram/webhook", {
        method: "POST",
        headers: { "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET, "content-type": "application/json" },
        body: JSON.stringify(update),
      });
      const res = await handler(req, env, ctx);
      is(res, 200);
      // 不在此 drain，让两个 handler 的 3s setTimeout 并发
    }
    await ctx.drain(); // 等所有 waitUntil（含两个 3s setTimeout）
    // album_queue 应被 flush 清空
    if (env.SCHEDULES_DB.albumQueueSize() !== 0)
      throw new Error(`album_queue not flushed, size=${env.SCHEDULES_DB.albumQueueSize()}`);
    // 应有且仅有 1 条 createComment（抢答的 handler 发的）
    if (comments.length !== 1) throw new Error(`expected 1 createComment, got ${comments.length}`);
    if (!comments[0].includes("×2")) throw new Error(`album comment missing count: ${comments[0]}`);
    console.log("  ✓ photo album (2 photos, media_group_id) → flush + 1 createComment ×2");
    pass++;
  } catch (e) {
    console.error(`  ✗ photo album: ${e.message}`);
    fail++;
  } finally {
    mock.restore();
  }
}

console.log("guardrails-v2: Auto-init (installation.created + initGitHubClaw)");
// 15. installation.created with INIT_GITHUB_CLAW=true → welcome + first lobster + autoInitCreated
{
  const env = baseEnv({
    TELEGRAM_ALLOWED_FROM_ID: "111",
    TELEGRAM_ALLOWED_CHAT_ID: "111",
    TELEGRAM_CHAT_ID: "111",
    INIT_GITHUB_CLAW: "true",
  });
  const tgReplies = [];
  const mock = installMockFetch([
    tg.getMe(),
    tg.sendMessage(tgReplies),
    gh.createIssue(1),
  ]);
  const ctx = capturingCtx();
  try {
    const payload = JSON.stringify({
      action: "created",
      installation: { id: 1, account: { login: "test-owner", type: "Organization" } },
      repositories: [{ full_name: "test-owner/test-repo" }],
      sender: { login: "test-owner", type: "User" },
    });
    const sig = "sha256=" + createHmac("sha256", env.GITHUB_WEBHOOK_SECRET).update(payload).digest("hex");
    const req = new Request("https://test.dev/github/webhook", {
      method: "POST",
      headers: {
        "x-github-delivery": "deliv-init",
        "x-github-event": "installation",
        "x-hub-signature-256": sig,
        "content-type": "application/json",
      },
      body: payload,
    });
    const res = await handler(req, env, ctx);
    await ctx.drain();
    is(res, 200);
    // 2 Telegram messages: welcome + autoInitCreated
    if (tgReplies.length < 2) throw new Error(`expected >=2 tg messages, got ${tgReplies.length}`);
    // active-issue should be set to the created issue number (1)
    const active = env.SCHEDULES_DB.getKv("active-issue:111");
    if (active !== "1") throw new Error(`active-issue:111 expected "1", got ${active}`);
    // init done flag set
    if (env.SCHEDULES_DB.getKv("init_github_claw_done") !== "true")
      throw new Error("init_github_claw_done not set");
    console.log("  ✓ installation.created (initGitHubClaw=true) → welcome + first lobster + autoInitCreated");
    pass++;
  } catch (e) {
    console.error(`  ✗ auto-init: ${e.message}`);
    fail++;
  } finally {
    mock.restore();
  }
}

console.log("guardrails-v2: Batch A — /version /schedules /llm /edit");
// /version → hardcoded "🦞 altShiftClawCore v<version>"
await hitTg("POST /version → hardcoded version string", guardedEnv, tgUpdate("/version"), [], async (res, replies) => {
  is(res, 200);
  if (replies.length !== 1) throw new Error(`expected 1 reply, got ${replies.length}`);
  const text = replies[0].text ?? "";
  if (!text.startsWith("🦞 altShiftClawCore v")) throw new Error(`wrong version text: ${text}`);
  if (!text.includes("0.2.24")) throw new Error(`missing version 0.2.24: ${text}`);
});

// /schedules with no schedules → empty list reply (schedule.thisChatListEmpty = "No schedules currently.")
await hitTg("POST /schedules (no schedules) → empty list reply", guardedEnv, tgUpdate("/schedules"), [], async (res, replies) => {
  is(res, 200);
  assertReply(replies, { contains: "schedules" });
});

// /llm no active issue → hardcoded "⚠️ No Lobster selected"
await hitTg("POST /llm (no active) → hardcoded no-lobster reply", guardedEnv, tgUpdate("/llm"), [], async (res, replies) => {
  is(res, 200);
  if (replies.length !== 1) throw new Error(`expected 1 reply, got ${replies.length}`);
  const text = replies[0].text ?? "";
  if (!text.includes("No Lobster selected")) throw new Error(`missing "No Lobster selected": ${text}`);
});

// /edit no active issue → newFlow.noActiveLobster
await hitTg("POST /edit (no active) → noActiveLobster reply", guardedEnv, tgUpdate("/edit"), [], async (res, replies) => {
  is(res, 200);
  assertReply(replies, { contains: "lobster" });
});

console.log("guardrails-v2: Batch B — skills/templates callbacks");
// skills_cancel:0 → clears state + skills.install_cancelled
{
  const env = baseEnv({ TELEGRAM_ALLOWED_FROM_ID: "111", TELEGRAM_ALLOWED_CHAT_ID: "111" });
  env.SCHEDULES_DB.putKv("skill-install:111", JSON.stringify({ step: "preview", skillName: "foo", issueNumber: 7 }));
  const cbAnswers = [];
  const edits = [];
  const mock = installMockFetch([tg.getMe(), tg.sendMessage([]), tg.answerCallback(cbAnswers), tg.editMessageText(edits)]);
  const ctx = capturingCtx();
  try {
    const update = {
      update_id: 50, callback_query: {
        id: "c1", from: { id: 111 }, message: { message_id: 42, chat: { id: 111, type: "private" }, date: 1, text: "x" },
        chat_instance: "x", data: "skills_cancel:0",
      },
    };
    const req = new Request("https://test.dev/telegram/webhook", {
      method: "POST", headers: { "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET, "content-type": "application/json" },
      body: JSON.stringify(update),
    });
    const res = await handler(req, env, ctx);
    await ctx.drain();
    is(res, 200);
    if (env.SCHEDULES_DB.getKv("skill-install:111") !== null) throw new Error("skill-install state not cleared");
    if (edits.length < 1) throw new Error(`expected editMessageText, got ${edits.length}`);
    console.log("  ✓ skills_cancel:0 → state cleared + install_cancelled");
    pass++;
  } catch (e) { console.error(`  ✗ skills_cancel: ${e.message}`); fail++; }
  finally { mock.restore(); }
}

// templates_cancel:0 → clears state + templates.install_cancelled
{
  const env = baseEnv({ TELEGRAM_ALLOWED_FROM_ID: "111", TELEGRAM_ALLOWED_CHAT_ID: "111" });
  env.SCHEDULES_DB.putKv("template-install:111", JSON.stringify({ step: "preview", templateName: "default" }));
  const cbAnswers = [];
  const edits = [];
  const mock = installMockFetch([tg.getMe(), tg.sendMessage([]), tg.answerCallback(cbAnswers), tg.editMessageText(edits)]);
  const ctx = capturingCtx();
  try {
    const update = {
      update_id: 51, callback_query: {
        id: "c2", from: { id: 111 }, message: { message_id: 43, chat: { id: 111, type: "private" }, date: 1, text: "x" },
        chat_instance: "x", data: "templates_cancel:0",
      },
    };
    const req = new Request("https://test.dev/telegram/webhook", {
      method: "POST", headers: { "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET, "content-type": "application/json" },
      body: JSON.stringify(update),
    });
    const res = await handler(req, env, ctx);
    await ctx.drain();
    is(res, 200);
    if (env.SCHEDULES_DB.getKv("template-install:111") !== null) throw new Error("template-install state not cleared");
    if (edits.length < 1) throw new Error(`expected editMessageText, got ${edits.length}`);
    console.log("  ✓ templates_cancel:0 → state cleared + install_cancelled");
    pass++;
  } catch (e) { console.error(`  ✗ templates_cancel: ${e.message}`); fail++; }
  finally { mock.restore(); }
}

console.log("guardrails-v2: Batch C+D — schedule flow + template_reset + current_edit");
// schedule_flow_cancel:current → clears state + cancelSetupMessage
{
  const env = baseEnv({ TELEGRAM_ALLOWED_FROM_ID: "111", TELEGRAM_ALLOWED_CHAT_ID: "111" });
  env.SCHEDULES_DB.putKv("schedule-flow:111", JSON.stringify({ step: "awaiting_prompt", issueNumber: 7 }));
  const cbAnswers = [], edits = [];
  const mock = installMockFetch([tg.getMe(), tg.sendMessage([]), tg.answerCallback(cbAnswers), tg.editMessageText(edits)]);
  const ctx = capturingCtx();
  try {
    const update = { update_id: 60, callback_query: { id: "c1", from: { id: 111 }, message: { message_id: 50, chat: { id: 111, type: "private" }, date: 1, text: "x" }, chat_instance: "x", data: "schedule_flow_cancel:current" } };
    const req = new Request("https://test.dev/telegram/webhook", { method: "POST", headers: { "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET, "content-type": "application/json" }, body: JSON.stringify(update) });
    const res = await handler(req, env, ctx); await ctx.drain();
    is(res, 200);
    if (env.SCHEDULES_DB.getKv("schedule-flow:111") !== null) throw new Error("schedule-flow state not cleared");
    if (edits.length < 1) throw new Error("expected editMessageText");
    console.log("  ✓ schedule_flow_cancel:current → state cleared + cancelSetupMessage");
    pass++;
  } catch (e) { console.error(`  ✗ schedule_flow_cancel: ${e.message}`); fail++; } finally { mock.restore(); }
}

// current_edit:<issueNum> → sets active issue + enterEditAnswer toast
{
  const env = baseEnv({ TELEGRAM_ALLOWED_FROM_ID: "111", TELEGRAM_ALLOWED_CHAT_ID: "111" });
  const cbAnswers = [];
  const mock = installMockFetch([tg.getMe(), tg.sendMessage([]), tg.answerCallback(cbAnswers)]);
  const ctx = capturingCtx();
  try {
    const update = { update_id: 61, callback_query: { id: "c2", from: { id: 111 }, message: { message_id: 51, chat: { id: 111, type: "private" }, date: 1, text: "x" }, chat_instance: "x", data: "current_edit:7" } };
    const req = new Request("https://test.dev/telegram/webhook", { method: "POST", headers: { "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET, "content-type": "application/json" }, body: JSON.stringify(update) });
    const res = await handler(req, env, ctx); await ctx.drain();
    is(res, 200);
    if (env.SCHEDULES_DB.getKv("active-issue:111") !== "7") throw new Error("active-issue not set to 7");
    console.log("  ✓ current_edit:7 → active-issue set + enterEditAnswer toast");
    pass++;
  } catch (e) { console.error(`  ✗ current_edit: ${e.message}`); fail++; } finally { mock.restore(); }
}

// message:text with no active issue → system.no_active_issue
await hitTg("POST text (no active issue) → no_active_issue reply", baseEnv({ TELEGRAM_ALLOWED_FROM_ID: "111", TELEGRAM_ALLOWED_CHAT_ID: "111" }), tgUpdate("hello there"), [], async (res, replies) => {
  is(res, 200);
  assertReply(replies, { contains: "active" });
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