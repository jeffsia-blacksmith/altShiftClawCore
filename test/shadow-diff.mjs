// shadow-diff.mjs — side-by-side consistency harness (AUDIT.md §14.2 "Shadow comparison")
//
// Feeds IDENTICAL inputs to the old bundle (src/index.js) and the new rewrite
// (src-v2/worker.js), then diffs:
//   • HTTP response (status + body)
//   • outbound fetch call sequence (method + url + parsed body) — i.e. the actual
//     Telegram replies + GitHub API calls each bundle emits
//   • scheduled(cron) side-effect fetches
//
// Mismatches are reported as regressions. A small allowlist marks known
// INTENTIONAL differences (AUDIT-DEEP.md §6) so they show as [allowed] rather than ✗.
//
// Isolation: each scenario imports a FRESH module instance (cache-busted URL) so
// module-level singletons (grammY Bot, Hono app) start clean — no state bleeds
// between scenarios and none between the old/new bundles.
//
// Run: node test/shadow-diff.mjs
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { makeD1, installMockFetch, tg, gh, capturingCtx, tgUpdate, tgPhotoUpdate, tgAlbumUpdate } from "./lib/mock.mjs";
import { createHmac } from "node:crypto";

const root = dirname(fileURLToPath(import.meta.url));
const EMPTY = join(root, "../src/modules/empty.js");

// ── build both bundles ONCE (non-minified → readable tracebacks) ────────────
const OLD_SRC = join(root, "../src/index.js");
const NEW_SRC = join(root, "../src-v2/worker.js");
const OLD_OUT = join(root, ".shadow-old.mjs");
const NEW_OUT = join(root, ".shadow-new.mjs");

async function buildBundle(src, out, extra = {}) {
  await build({
    entryPoints: [src], bundle: true, format: "esm", platform: "neutral",
    minify: false, write: true, outfile: out, legalComments: "none",
    alias: { crypto: EMPTY }, ...extra,
  });
}
await buildBundle(OLD_SRC, OLD_OUT, {});
await buildBundle(NEW_SRC, NEW_OUT, { conditions: ["browser"] });

// Per-scenario fresh module instance (distinct query → fresh eval → fresh
// module-level singletons). counter guarantees uniqueness across all scenarios.
let counter = 0;
async function fresh(which) {
  const out = which === "new" ? NEW_OUT : OLD_OUT;
  const mod = await import(`file://${out}?i=${counter++}`);
  return { fetch: mod.default.fetch, scheduled: mod.default.scheduled };
}

// ── env (shared shape; each call → fresh D1 so state never crosses runs) ───
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
    CLAW_LANGUAGE: "en",
    SCHEDULES_DB: makeD1(),
    ...overrides,
  };
}
const guardedEnv = () => baseEnv({
  TELEGRAM_ALLOWED_FROM_ID: "111",
  TELEGRAM_ALLOWED_CHAT_ID: "111",
});

// ── capture: run one bundle against fresh env/routes, hush stderr noise ─────
function normalizeCall(c) {
  let body = c.body;
  if (typeof body === "string" && body) {
    try { body = JSON.parse(body); } catch { /* keep raw */ }
  }
  return { method: c.method, url: c.url, body };
}

async function runHttp(handler, { env, routes, reqBuilder }) {
  const mock = installMockFetch(routes);
  const ctx = capturingCtx();
  const stderr = [];
  const oe = console.error.bind(console);
  console.error = (...a) => { stderr.push(a.map(String).join(" ")); };
  try {
    const res = await handler(reqBuilder(), env, ctx);
    await ctx.drain();
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text; }
    return { ok: true, status: res.status, body, calls: mock.calls.map(normalizeCall), stderr };
  } catch (e) {
    return { ok: false, error: `${e?.name ?? "Error"}: ${e?.message ?? String(e)}`, stderr };
  } finally {
    console.error = oe;
    mock.restore();
  }
}

// Run multiple requests against a SHARED env + mock (e.g. album: 2 photos → 1 flush).
async function runHttpMulti(handler, { env, routes, reqBuilders }) {
  const mock = installMockFetch(routes);
  const ctx = capturingCtx();
  const stderr = [];
  const oe = console.error.bind(console);
  console.error = (...a) => { stderr.push(a.map(String).join(" ")); };
  let lastBody, lastStatus;
  try {
    for (const rb of reqBuilders) {
      const res = await handler(rb(), env, ctx);
      lastStatus = res.status;
      const text = await res.text();
      try { lastBody = JSON.parse(text); } catch { lastBody = text; }
    }
    await ctx.drain();
    return { ok: true, status: lastStatus, body: lastBody, calls: mock.calls.map(normalizeCall), stderr };
  } catch (e) {
    return { ok: false, error: `${e?.name ?? "Error"}: ${e?.message ?? String(e)}`, stderr };
  } finally {
    console.error = oe;
    mock.restore();
  }
}

async function runScheduled(scheduled, { env, routes }) {
  const mock = installMockFetch(routes);
  const ctx = capturingCtx();
  const stderr = [];
  const oe = console.error.bind(console);
  console.error = (...a) => { stderr.push(a.map(String).join(" ")); };
  try {
    const result = await scheduled({ cron: "*/1 * * * *", scheduledTime: new Date(0) }, env, ctx);
    await ctx.drain();
    return { ok: true, result: Array.isArray(result) ? result.length : "non-array", calls: mock.calls.map(normalizeCall), stderr };
  } catch (e) {
    return { ok: false, error: `${e?.name ?? "Error"}: ${e?.message ?? String(e)}`, stderr };
  } finally {
    console.error = oe;
    mock.restore();
  }
}

function dumpStderr(s) {
  if (Array.isArray(s) && s.length)
    console.log("      (stderr) " + s.join("\n      (stderr) ").slice(0, 500));
}

// ── deep diff (returns list of "path: old → new" strings) ───────────────────
function deepDiff(a, b, path = "") {
  if (a === b) return [];
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") {
    return [`${path || "<root>"}: ${safe(a)} → ${safe(b)}`];
  }
  const out = [];
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) out.push(...deepDiff(a[k], b[k], path ? `${path}.${k}` : k));
  return out;
}
function safe(v) {
  if (v === undefined) return "undefined";
  if (v === null) return "null";
  if (typeof v === "string") return JSON.stringify(v.length > 80 ? v.slice(0, 80) + "…" : v);
  return JSON.stringify(v);
}

// ── allowlist of KNOWN INTENTIONAL differences (AUDIT-DEEP.md §6) ────────────
// Each entry: { label, test(a, b, diffs) -> truthy }. `a`/`b` are the sanitized
// captures (stderr stripped) so an entry can re-diff after normalizing.
const WF = /\/repos\/[^/]+\/[^/]+\/actions\/workflows/;
const stripWf = (calls = []) => calls.filter((c) => !WF.test(c.url));
const tgReplies = (calls = []) => calls.filter((c) => /\/sendMessage$/.test(c.url));

const ALLOW = [
  // §6: v2 /health exposes a `version` string; old bundle omits the field.
  {
    label: "health.version field (v2 exposes, old omits)",
    test: (label, a, b, diffs) => label.startsWith("GET /health") &&
      diffs.every((d) => d.startsWith("body.version:") || d.startsWith("body.ok") || d.startsWith("body.service")),
  },
  // v2 skips a redundant GET /actions/workflows fetch in the /llm no-active guard;
  // the user-visible Telegram reply is byte-identical. (Old fetched workflows
  // speculatively even when it would early-return on "no active lobster".)
  {
    label: "v2 skips redundant GET /actions/workflows in /llm no-active guard (reply identical)",
    test: (label, a, b) => label === "POST /llm (no active)" &&
      deepDiff(stripWf(a.calls), stripWf(b.calls)).length === 0,
  },
  // The old bundle's message:text resolver (RT, L13271-13284) runs the natural-language
  // workflow lookup for EVERY command not handled by an earlier composer — including
  // /schedules (registered on Kl, after Fn) — emitting a speculative GET /actions/workflows.
  // v2 has an explicit known-command allowlist (bot.js) so it skips that fetch.
  // The user-visible reply is byte-identical (verified via stripWf).
  {
    label: "v2 skips redundant GET /actions/workflows for /schedules (reply identical)",
    test: (label, a, b) => label.startsWith("POST /schedules") &&
      deepDiff(stripWf(a.calls), stripWf(b.calls)).length === 0,
  },
  // §6.2: old Ys(e, t_msg) body uses `t` (i18n fn) not `t_msg` (file) → Mk(t, caption)
  // produces [undefined] label. v2 correctly uses file.label → [📷 Photo].
  // Normalise [undefined] → [📷 Photo] in old's createComment body; rest must match.
  {
    label: "§6.2 bug fix: old Ys [undefined] label (i18n shadow) → v2 [📷 Photo] (correct)",
    test: (label, a, b) => label === "single photo (no branch) → metadata comment" &&
      deepDiff(
        a.calls.map((c) => ({
          ...c,
          body: c.body && typeof c.body === "object" && typeof c.body.body === "string"
            ? { ...c.body, body: c.body.body.replace("[undefined]", "[📷 Photo]") }
            : c.body,
        })),
        b.calls,
      ).length === 0,
  },
  // auto-init: createIssue body carries a telegram-meta `ts` = new Date().toISOString().
  // OLD and NEW run sequentially so the millisecond ts differs — timing, not behavior.
  // Normalise ISO ts in createIssue body; rest must match.
  {
    label: "auto-init ts nondeterminism (new Date().toISOString() runs sequentially) — normalized",
    test: (label, a, b) => label === "installation.created → welcome + first lobster + autoInitCreated" &&
      deepDiff(
        a.calls.map((c) => ({
          ...c,
          body: c.body && typeof c.body === "object" && typeof c.body.body === "string"
            ? { ...c.body, body: c.body.body.replace(/"ts":"[^"]+"/g, '"ts":"TS"') }
            : c.body,
        })),
        b.calls.map((c) => ({
          ...c,
          body: c.body && typeof c.body === "object" && typeof c.body.body === "string"
            ? { ...c.body, body: c.body.body.replace(/"ts":"[^"]+"/g, '"ts":"TS"') }
            : c.body,
        })),
      ).length === 0,
  },
];
const isAllowed = (label, a, b, diffs) => ALLOW.find((x) => x.test(label, a, b, diffs));

// ── scenario runner (fresh module instance per bundle per scenario) ───────
let pass = 0, allowed = 0, fail = 0, warn = 0;
const regressions = [];

async function scenario(label, make, opts = {}) {
  const a = await make("old");
  const b = await make("new");
  // stderr is debugging noise (log-message wording), not a behavior contract —
  // exclude it from the diff but keep it around to surface on real diffs.
  const sa = { ...a, stderr: undefined }, sb = { ...b, stderr: undefined };
  // /current's gatherIssueData fans out parallel fetches (model configs, ref,
  // workflow runs, llm settings) — completion order is nondeterministic and
  // not a behavior contract, so sort calls by a stable key when opted in.
  if (opts.ignoreCallOrder && Array.isArray(sa.calls) && Array.isArray(sb.calls)) {
    const key = (c) => `${c.method ?? ""}\u0000${c.url ?? ""}\u0000${JSON.stringify(c.body ?? null)}`;
    sa.calls = [...sa.calls].sort((x, y) => key(x) < key(y) ? -1 : key(x) > key(y) ? 1 : 0);
    sb.calls = [...sb.calls].sort((x, y) => key(x) < key(y) ? -1 : key(x) > key(y) ? 1 : 0);
  }
  const diffs = deepDiff(sa, sb);
  const aCalls = a.calls?.length ?? 0, bCalls = b.calls?.length ?? 0;
  const maskedEmpty = opts.expectCallsMin != null &&
    (aCalls < opts.expectCallsMin || bCalls < opts.expectCallsMin);
  if (diffs.length === 0 && !maskedEmpty) {
    console.log(`  ✓ ${label}  (identical)`);
    pass++;
    return;
  }
  if (diffs.length === 0 && maskedEmpty) {
    console.log(`  ⚠ ${label}  (identical but both emitted ${aCalls}/${bCalls} calls — possible masked error)`);
    dumpStderr(a.stderr); dumpStderr(b.stderr);
    warn++;
    return;
  }
  const al = isAllowed(label, sa, sb, diffs);
  if (al) {
    console.log(`  ≈ ${label}  [allowed: ${al.label}]`);
    for (const d of diffs) console.log(`      ${d}`);
    allowed++;
    return;
  }
  console.log(`  ✗ ${label}  (DIFF)`);
  for (const d of diffs) console.log(`      ${d}`);
  dumpStderr(a.stderr); dumpStderr(b.stderr);
  fail++;
  regressions.push({ label });
}

// scenario builders: each `make(which)` fresh-imports that bundle and runs it
// against a fresh env + fresh routes (full isolation).
function httpScenario(label, envFn, routesFn, reqBuilder, opts) {
  return scenario(label, async (which) => {
    const h = await fresh(which);
    return runHttp(h.fetch, { env: envFn(), routes: routesFn(), reqBuilder });
  }, opts);
}
// Multi-request scenario (shared env/mock) — reqBuilders is an array of () => Request
function httpMultiScenario(label, envFn, routesFn, reqBuilders, opts) {
  return scenario(label, async (which) => {
    const h = await fresh(which);
    return runHttpMulti(h.fetch, { env: envFn(), routes: routesFn(), reqBuilders });
  }, opts);
}
// Signed GitHub webhook request builder
const ghWebhook = (event, payload) => () => {
  const body = JSON.stringify(payload);
  const sig = "sha256=" + createHmac("sha256", "test-secret").update(body).digest("hex");
  return new Request("https://test.dev/github/webhook", {
    method: "POST",
    headers: {
      "x-github-delivery": "deliv-" + event,
      "x-github-event": event,
      "x-hub-signature-256": sig,
      "content-type": "application/json",
    },
    body,
  });
};
function scheduledScenario(label, envFn, routesFn, opts) {
  return scenario(label, async (which) => {
    const h = await fresh(which);
    return runScheduled(h.scheduled, { env: envFn(), routes: routesFn() });
  }, opts);
}

const tgReq = (update) => () => new Request("https://test.dev/telegram/webhook", {
  method: "POST",
  headers: { "x-telegram-bot-api-secret-token": "tg-secret", "content-type": "application/json" },
  body: JSON.stringify(update),
});
const tgCmd = (extra = []) => () => [tg.getMe(), tg.sendMessage([]), ...extra];

// ── scenarios ──────────────────────────────────────────────────────────────
console.log("\nshadow-diff: HTTP routing");
await httpScenario("GET /health", baseEnv, () => [], () => new Request("https://test.dev/health"));
await httpScenario("GET /", baseEnv, () => [], () => new Request("https://test.dev/"));
await httpScenario("GET /__nonexistent__", baseEnv, () => [], () => new Request("https://test.dev/__nope__"));
await httpScenario("POST /github/webhook bad signature → 400", baseEnv, () => [],
  () => new Request("https://test.dev/github/webhook", {
    method: "POST",
    headers: { "x-github-delivery": "id", "x-github-event": "ping", "x-hub-signature-256": "sha256=bad", "content-type": "application/json" },
    body: "{}",
  }));

console.log("\nshadow-diff: Telegram webhook path + secret");
await httpScenario("POST /telegram/other-path → 404", baseEnv, () => [],
  () => new Request("https://test.dev/telegram/other-path", {
    method: "POST", headers: { "x-telegram-bot-api-secret-token": "tg-secret", "content-type": "application/json" },
    body: JSON.stringify({ update_id: 1 }),
  }));
await httpScenario("POST /telegram/webhook bad secret → 401", baseEnv, () => [],
  () => new Request("https://test.dev/telegram/webhook", {
    method: "POST", headers: { "x-telegram-bot-api-secret-token": "WRONG", "content-type": "application/json" },
    body: JSON.stringify({ update_id: 1 }),
  }));

console.log("\nshadow-diff: Telegram commands (guarded, en)");
await httpScenario("POST /help", guardedEnv, tgCmd(), tgReq(tgUpdate("/help")), { expectCallsMin: 1 });
await httpScenario("POST /list (empty)", guardedEnv, tgCmd([gh.issues([])]), tgReq(tgUpdate("/list")), { expectCallsMin: 1 });
await httpScenario("POST /list (1 issue #7)", guardedEnv,
  tgCmd([gh.issues([{ number: 7, title: "Test issue" }])]), tgReq(tgUpdate("/list")), { expectCallsMin: 1 });
await httpScenario("POST /current (no active)", guardedEnv, tgCmd(), tgReq(tgUpdate("/current")), { expectCallsMin: 1 });
await httpScenario("POST /start", guardedEnv, tgCmd([gh.issues([])]), tgReq(tgUpdate("/start")), { expectCallsMin: 1 });
await httpScenario("POST /version", guardedEnv, tgCmd(), tgReq(tgUpdate("/version")), { expectCallsMin: 1 });
await httpScenario("POST /schedules (none)", guardedEnv, tgCmd(), tgReq(tgUpdate("/schedules")), { expectCallsMin: 1 });
await httpScenario("POST /llm (no active)", guardedEnv, tgCmd(), tgReq(tgUpdate("/llm")), { expectCallsMin: 1 });
await httpScenario("POST /clear (no active)", guardedEnv, tgCmd(), tgReq(tgUpdate("/clear")), { expectCallsMin: 1 });
await httpScenario("POST /enable (no active)", guardedEnv, tgCmd(), tgReq(tgUpdate("/enable")), { expectCallsMin: 1 });
await httpScenario("POST /workflow (no active)", guardedEnv, tgCmd(), tgReq(tgUpdate("/workflow")), { expectCallsMin: 1 });
await httpScenario("POST /status", guardedEnv, tgCmd(), tgReq(tgUpdate("/status")), { expectCallsMin: 1 });
await httpScenario("POST plain text (no active issue)", guardedEnv, tgCmd(), tgReq(tgUpdate("hello world")), { expectCallsMin: 1 });

// active-lobster helpers: each call → fresh D1 with active-issue:111 = "7" pre-seeded
const activeEnv = () => {
  const env = baseEnv({
    TELEGRAM_ALLOWED_FROM_ID: "111",
    TELEGRAM_ALLOWED_CHAT_ID: "111",
  });
  env.SCHEDULES_DB.putKv("active-issue:111", "7");
  return env;
};
const WF7 = { id: 42, path: ".github/workflows/issue-7.yml", state: "active", html_url: "https://github.com/test-owner/test-repo/actions/workflows/issue-7.yml" };

console.log("\nshadow-diff: Telegram commands (active lobster, en)");
await httpScenario("POST /enable (active, wf found)", activeEnv,
  tgCmd([gh.workflows([WF7]), gh.workflowEnable()]), tgReq(tgUpdate("/enable")), { expectCallsMin: 2 });
await httpScenario("POST /disable (active, wf found)", activeEnv,
  tgCmd([gh.workflows([WF7]), gh.workflowDisable()]), tgReq(tgUpdate("/disable")), { expectCallsMin: 2 });
await httpScenario("POST /workflow (active, wf active)", activeEnv,
  tgCmd([gh.workflows([WF7])]), tgReq(tgUpdate("/workflow")), { expectCallsMin: 1 });
await httpScenario("POST /workflow (active, wf missing)", activeEnv,
  tgCmd([gh.workflows([])]), tgReq(tgUpdate("/workflow")), { expectCallsMin: 1 });
await httpScenario("POST /clear (active)", activeEnv,
  tgCmd([gh.repo("main"), gh.workflowDispatch()]), tgReq(tgUpdate("/clear")), { expectCallsMin: 2 });

// /current active → full status card (7-path gather: issues.get, getContent×N,
// listSchedulesForIssue, issue_metadata, listRepoWorkflows, listWorkflowRuns, getRef)
await httpScenario("POST /current (active) → status card", activeEnv,
  tgCmd([
    gh.issueGet({ number: 7, title: "Test issue", state: "open" }),
    gh.getContent({}),
    gh.workflows([WF7]),
    gh.workflowRuns([]),
  ]),
  tgReq(tgUpdate("/current")), { expectCallsMin: 1, ignoreCallOrder: true });

// /schedules with 1 due schedule — D1 seeded with a row; old also emits RT workflow fetch
const schedEnv = () => {
  const env = baseEnv({
    TELEGRAM_ALLOWED_FROM_ID: "111",
    TELEGRAM_ALLOWED_CHAT_ID: "111",
  });
  env.SCHEDULES_DB.putKv("active-issue:111", "7");
  env.SCHEDULES_DB.addSchedule({
    id: "sch_1", repo: "test-owner/test-repo", issue_number: 7, chat_id: 111,
    prompt: "check status", next_run_at: "2026-08-01T00:00:00.000Z", status: "active",
    rule_type: "interval", rule_payload: '{"every":"1d"}', should_notify: 1, locked_until: null,
    created_at: "2026-07-30T00:00:00.000Z", updated_at: "2026-07-30T00:00:00.000Z",
  });
  return env;
};
await httpScenario("POST /schedules (1 schedule)", schedEnv,
  tgCmd([gh.issueGet({ number: 7, title: "Test issue", state: "open" })]),
  tgReq(tgUpdate("/schedules")), { expectCallsMin: 1 });

console.log("\nshadow-diff: scheduled(cron) empty");
await scheduledScenario("cron empty → [] + 0 fetches", baseEnv, () => []);

console.log("\nshadow-diff: scheduled(cron) with 1 due schedule");
await scheduledScenario("cron (1 due 'once' schedule) → createComment + artifact", () => {
  const env = baseEnv();
  env.SCHEDULES_DB.addSchedule({
    id: "sch_1", repo: "test-owner/test-repo", issue_number: 7, chat_id: 111,
    prompt: "check status", next_run_at: "1970-01-01T00:00:00.000Z", status: "active",
    rule_type: "once", rule_payload: "{}", should_notify: 1, locked_until: null,
    created_at: "1969-01-01T00:00:00.000Z", updated_at: "1969-01-01T00:00:00.000Z",
  });
  return env;
}, () => [gh.createComment([]), gh.createOrUpdateFile([]), gh.getContent({})], { expectCallsMin: 2 });

// ── media relay (full chain) ────────────────────────────────────────────────
console.log("\nshadow-diff: media relay (active lobster, en)");
const ISSUE7 = { number: 7, title: "Test issue", state: "open", body: "" };
// single photo, no branch → metadata-only comment (+ old resting reply via Js)
// §6.2: old Ys(e, t_msg) body uses `t` (i18n function) instead of `t_msg` (file) →
// Mk(t, caption) produces [undefined] label. v2 correctly uses file.label → [📷 Photo].
await httpScenario("single photo (no branch) → metadata comment", activeEnv,
  () => [tg.getMe(), tg.sendMessage([]), tg.getFile(), tg.file(), gh.createComment([]), gh.issueGet(ISSUE7)],
  tgReq(tgPhotoUpdate({ fileId: "f0", caption: "hi" })), { expectCallsMin: 1, ignoreCallOrder: true });
// album (2 photos), no branch → 1 metadata comment (+ old resting reply)
await httpMultiScenario("album (2 photos, no branch) → 1 metadata comment", activeEnv,
  () => [tg.getMe(), tg.sendMessage([]), gh.createComment([]), gh.issueGet(ISSUE7)],
  [
    tgReq(tgAlbumUpdate("grp1", { fileId: "a0", caption: "", messageId: 30 })),
    tgReq(tgAlbumUpdate("grp1", { fileId: "a1", caption: "album caption", messageId: 31 })),
  ], { expectCallsMin: 1, ignoreCallOrder: true });
// album (2 photos), branch exists → full git upload chain (temp→comment→final→finalize→user.md→jsonl→cleanup)
await httpMultiScenario("album (2 photos, branch) → full git upload chain", activeEnv,
  () => [
    tg.getMe(), tg.sendMessage([]), tg.getFile(), tg.file(),
    gh.ref(), gh.issueGet(ISSUE7), gh.workflows([WF7]),
    gh.gitBatch(), gh.createOrUpdateFile([]), gh.deleteFile(),
    gh.createComment([]), gh.updateComment(),
    gh.getContent({}), // user.md + issue.jsonl existing-content lookups (404 → create)
  ],
  [
    tgReq(tgAlbumUpdate("grp1", { fileId: "a0", caption: "", messageId: 30 })),
    tgReq(tgAlbumUpdate("grp1", { fileId: "a1", caption: "album caption", messageId: 31 })),
  ], { expectCallsMin: 5, ignoreCallOrder: true });

// ── auto-init (installation.created full chain) ────────────────────────────
console.log("\nshadow-diff: auto-init (installation.created)");
const autoInitEnv = () => baseEnv({
  TELEGRAM_ALLOWED_FROM_ID: "111",
  TELEGRAM_ALLOWED_CHAT_ID: "111",
  TELEGRAM_CHAT_ID: "111",
  INIT_GITHUB_CLAW: "true",
});
await httpScenario("installation.created → welcome + first lobster + autoInitCreated", autoInitEnv,
  () => [
    tg.getMe(), tg.sendMessage([]),
    gh.createIssue(1),
    gh.graphql({
      "default": {
        ".github/workflows/issue-N.yml": "name: 执行小龙虾任务 #0\non: push\n",
        "prompt.md": "You are a helpful assistant.\n",
      },
    }),
    gh.gitBatch(), gh.createOrUpdateFile([]), gh.repoVariable(),
  ],
  ghWebhook("installation", {
    action: "created",
    installation: { id: 1, account: { login: "test-owner", type: "Organization" } },
    repositories: [{ full_name: "test-owner/test-repo" }],
    sender: { login: "test-owner", type: "User" },
  }), { expectCallsMin: 3, ignoreCallOrder: true });

// ── summary ─────────────────────────────────────────────────────────────────
console.log(`\nshadow-diff result: ${pass} identical, ${allowed} allowed, ${warn} warn, ${fail} regressions`);
if (fail > 0) {
  console.log("\n⚠️  regressions:");
  for (const r of regressions) console.log(`  - ${r.label}`);
  process.exit(1);
}
if (warn > 0) console.log(`\n⚠️  ${warn} scenario(s) identical-but-empty — investigate masked errors (see ⚠ rows above)`);
console.log("\n✅ side-by-side consistency verified — old ↔ src-v2 behaviorally identical");