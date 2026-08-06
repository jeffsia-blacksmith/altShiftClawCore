// release.mjs — 在 4 处同步版本 + 提交 + 打 tag
//
// 用法：
//   node release.mjs <new-version>
//
// 版本必须是 semver（MAJOR.MINOR.PATCH，可选 -prerelease）。
// 会同步更新 src/config.js、package.json、github-claw-worker-package.json，
// 在 main 上提交一次 "chore(release): vX.Y.Z"，并创建 annotated tag vX.Y.Z。
//
// 注意：github-claw-worker-package.json 的 revision 字段不在此处改动，
// 它由 .github/workflows/publish-package.yml 发布时用 git SHA 覆盖。

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function usage() {
  console.error("Usage: node release.mjs <new-version>");
  console.error("  <new-version> must be semver, e.g. 0.3.1 or 0.4.0-rc.1");
  process.exit(1);
}

const nextVersion = process.argv[2];
if (!nextVersion) usage();
if (!SEMVER.test(nextVersion)) usage();

const tag = `v${nextVersion}`;

// ---- helper: read/write JSON keeping 2-space indent + trailing newline ----
function readJson(rel) {
  return JSON.parse(readFileSync(join(root, rel), "utf8"));
}
function writeJson(rel, obj) {
  writeFileSync(join(root, rel), JSON.stringify(obj, null, 2) + "\n");
}

// ---- ensure we're on main and clean ----
const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: root })
  .toString()
  .trim();
if (branch !== "main") {
  console.error(`❌ Must run release on main (current branch: ${branch})`);
  process.exit(1);
}
const dirty = execSync("git status --porcelain", { cwd: root }).toString().trim();
if (dirty) {
  console.error("❌ Working tree is not clean. Commit or stash changes first.");
  console.error(dirty);
  process.exit(1);
}

// ---- check tag doesn't already exist ----
try {
  execSync(`git rev-parse --verify --quiet refs/tags/${tag}`, { cwd: root });
  console.error(`❌ Tag ${tag} already exists.`);
  process.exit(1);
} catch {}

// ---- bump src/config.js DEFAULT_VERSION ----
const configPath = join(root, "src/config.js");
let config = readFileSync(configPath, "utf8");
const before = config;
config = config.replace(
  /const DEFAULT_VERSION = "[^"]*"/,
  `const DEFAULT_VERSION = "${nextVersion}"`
);
if (config === before) {
  console.error("❌ Could not find DEFAULT_VERSION in src/config.js");
  process.exit(1);
}
writeFileSync(configPath, config);

// ---- bump package.json ----
const pkg = readJson("package.json");
pkg.version = nextVersion;
writeJson("package.json", pkg);

// ---- bump manifest version (NOT revision) ----
const manifest = readJson("github-claw-worker-package.json");
manifest.version = nextVersion;
writeJson("github-claw-worker-package.json", manifest);

// ---- commit + tag ----
execSync("git add src/config.js package.json github-claw-worker-package.json", {
  cwd: root,
  stdio: "inherit",
});
execSync(`git commit -m "chore(release): v${nextVersion}"`, {
  cwd: root,
  stdio: "inherit",
});
execSync(`git tag -a ${tag} -m "Release ${tag}"`, {
  cwd: root,
  stdio: "inherit",
});

console.log(`✅ Bumped to v${nextVersion}`);
console.log(`   tag: ${tag}`);
console.log("   Next: git push origin main --tags");
console.log("   Then: npm run build  (rebuild the worker bundle)");
