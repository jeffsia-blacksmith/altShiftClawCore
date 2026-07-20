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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);