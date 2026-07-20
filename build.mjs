// build.mjs — 把可编辑的 src/index.js 重新打包压缩成 GitHubClawCore/index.js
// GitHubClawCore/index.js 是 Terraform 部署时 filebase64 读取的产物。
//
// 用法：
//   node build.mjs            # src/index.js → GitHubClawCore/index.js（minified）
//   node build.mjs --check    # 只打包到暂存并比对与 index.js.orig 的差异，不覆盖
//
// 需求：npm i（安装 esbuild）
import { build } from "esbuild";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const SRC = join(root, "src/index.js");
const OUT = join(root, "GitHubClawCore/index.js");
const ORIG = join(root, "src/index.orig.bundle.js");
const checkOnly = process.argv.includes("--check");

const result = await build({
  entryPoints: [SRC],
  bundle: true,
  format: "esm",
  platform: "neutral",
  minify: true,
  write: false,
  legalComments: "none",
  alias: { crypto: join(root, "src/modules/empty.js") },
});
const output = result.outputFiles[0].text;

// 完整性检查：入口必须是 export default 且含 fetch handler
if (!/export\s*\{[^}]*\bas default\b/.test(output)) {
  console.error("❌ 打包结果缺少 default export，中止。");
  process.exit(1);
}
if (!/\bfetch\b/.test(output.slice(-2000))) {
  console.warn("⚠️ 入口尾段找不到 fetch，请人工确认 worker 入口。");
}

if (checkOnly) {
  const orig = existsSync(ORIG) ? readFileSync(ORIG, "utf8") : "";
  console.log(`打包大小: ${output.length} bytes`);
  if (orig) console.log(`原始基准: ${orig.length} bytes（差 ${output.length - orig.length}）`);
  console.log("（--check：未覆写 index.js）");
} else {
  writeFileSync(OUT, output);
  console.log(`✅ 已写入 ${OUT}（${output.length} bytes）`);
}
