// build-v2.mjs — src-v2/ 重写版打包（side-by-side，§10.3）
// 产物：GitHubClawCore/index.v2.js（shadow 阶段不接流量）
// 用法：
//   node build-v2.mjs            # src-v2/worker.js → GitHubClawCore/index.v2.js（minified）
//   node build-v2.mjs --check    # 只打包到暂存并比对，不覆写
// 与 build.mjs（旧 bundle）并存，互不干扰；swap 时机由 §10.8 验收决定。
import { build } from "esbuild";
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const SRC = join(root, "src-v2/worker.js");
const OUT = join(root, "GitHubClawCore/index.v2.js");
const checkOnly = process.argv.includes("--check");

const result = await build({
  entryPoints: [SRC],
  bundle: true,
  format: "esm",
  platform: "neutral",
  minify: true,
  write: false,
  legalComments: "none",
  // @octokit/webhooks-methods exports node (createHmac) + web (crypto.subtle) 分支；
  // Workers 运行时只有 Web Crypto（crypto.subtle），所以选 browser 分支。
  conditions: ["browser"],
  // src-v2 复用旧 bundle 的 tweetnacl 用于 repo secret 加密（libsodium sealed box）。
  // tweetnacl/nacl-fast.js 含 `require('crypto')` Node fallback；Workers 用全局 `crypto`
  // 走不到该分支，故用 empty.js 占位（同旧 bundle build.mjs）。
  alias: { crypto: join(root, "src/modules/empty.js") },
});
const output = result.outputFiles[0].text;

// 完整性检查（对齐 build.mjs 语义）
if (!/export\s*\{[^}]*\bas default\b/.test(output)) {
  console.error("❌ 打包结果缺少 default export，中止。");
  process.exit(1);
}
if (!/\bfetch\b/.test(output.slice(-2000))) {
  console.warn("⚠️ 入口尾段找不到 fetch，请人工确认 worker 入口。");
}

if (checkOnly) {
  console.log(`[v2] 打包大小: ${output.length} bytes`);
  console.log("（--check：未覆写 index.v2.js）");
} else {
  writeFileSync(OUT, output);
  console.log(`✅ [v2] 已写入 ${OUT}（${output.length} bytes）`);
}