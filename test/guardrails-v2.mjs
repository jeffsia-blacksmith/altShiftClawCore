// guardrails-v2.mjs — src-v2 护栏（Phase R）
// R0 阶段：对齐旧 bundle 现有护栏中 src-v2 已实现的部分。
//   - /health → 200 { ok:true, service:"githubclaw-core" }
//   - /       → 200 { ok:true }
//   - 404 routing
//   - i18n: t() key 解析 + en/zh leaf-key parity（808×2）
// 后续阶段随实现推进逐步补 characterization 护栏（§10.5）。
import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

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
});

const mod = await import(`file://${OUT}`);
const handler = mod.default.fetch;

const MOCK_ENV = {
  // R0 guardrail mock env — 对齐旧 guardrails.mjs MOCK_ENV（健康检查无需完整配置）
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
  if (res.status === 200) throw new Error("should not be 200");
  if (res.status < 400 || res.status >= 500) throw new Error(`expected 4xx, got ${res.status}`);
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

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);