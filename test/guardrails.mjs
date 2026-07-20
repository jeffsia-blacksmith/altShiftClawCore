import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const SRC = join(root, "../src/index.js");
const OUT = join(root, ".test-bundle.mjs");

await build({
  entryPoints: [SRC],
  bundle: true,
  format: "esm",
  platform: "neutral",
  minify: false,
  write: true,
  outfile: OUT,
  legalComments: "none",
  alias: { crypto: join(root, "../src/modules/empty.js") },
});

const mod = await import(`file://${OUT}`);
const handler = mod.default.fetch;

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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);