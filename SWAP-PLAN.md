# Swap 计划：src-v2 → src

> **目标**：将 `src-v2/` 干净源码正式替换旧 bundle `src/index.js`，旧代码归档到 `src-legacy/`
> **前提**：Phase R 重写 + 4 轮审计（132 项修复）+ Phase S/T/U/V shadow-diff + Phase W 实地 smoke 全部通过
> **分支**：`phase-r/refactor` → 合并到 `main`

---

## 1. 当前状态

| 项目 | 状态 |
|------|------|
| src-v2 源码 | 8,215 行 / 58 文件 ✅ |
| 旧 bundle src/index.js | 20,333 行（混淆） |
| 构建产物 | `GitHubClawCore/index.js`（旧）/ `GitHubClawCore/index.v2.js`（新） |
| 护栏 | 14 old + 40 v2 = 54 全绿 ✅ |
| i18n | 814×2 对等, real gap=0 ✅ |
| Shadow-diff | 32 场景（27 identical / 5 allowed / 0 regression）✅ |
| 实地 smoke | 15 命令 + 3 workflows + 完整端到端链路 ✅ |
| 分支 | `phase-r/refactor`（领先 `main` 83 文件变更） |

---

## 2. Swap 步骤

### 步骤 1：归档旧 bundle
```
mv src/index.js src-legacy/index.js
mv src/MODULE_MAP.md src-legacy/MODULE_MAP.md
mv src/testplan\(workerAI\).md src-legacy/
```
- 保留 `src/i18n/`（旧 i18n 文件，已被 src-v2/i18n/ 取代但保留作参考）
- `src/modules/` 已存在于 phase-r 分支（content-type-shim / empty.js / tweetnacl-shim / workflow-notifications.js），src-v2 已内联 workflow-notifications，其余 shim 仍被 build 使用

### 步骤 2：src-v2 → src
```
mv src-v2/* src/
mv src-v2/.gitkeep src/ 2>/dev/null; rmdir src-v2
```

### 步骤 3：合并 i18n
- `src/i18n/en.json` 和 `src/i18n/zh-CN.json` 已在 phase-r 分支更新（814 keys）
- `src-v2/i18n/en.json` 和 `src-v2/i18n/zh-CN.json` 是副本（814 keys）
- 移动后 `src/i18n/` 直接使用 src-v2 的版本（已是最新）

### 步骤 4：更新 build.mjs
将 `build.mjs` 入口从 `src/index.js` 改为 `src/worker.js`：
```js
const SRC = join(root, "src/worker.js");
```
- 保留 `build-v2.mjs`（可合并或保留并存）
- 构建产物统一为 `GitHubClawCore/index.js`（不再需要 `.v2.js`）

### 步骤 5：更新 package.json
```json
{
  "scripts": {
    "build": "node build.mjs",
    "build:v2": "node build-v2.mjs",
    "check": "node build.mjs --check",
    "test:guardrails": "node test/guardrails.mjs",
    "test:guardrails-v2": "node test/guardrails-v2.mjs",
    "test:shadow": "node test/shadow-diff.mjs"
  }
}
```
- 旧 guardrails（`test/guardrails.mjs`）保留——测试旧 bundle 行为，swap 后可改为测试 src
- v2 guardrails（`test/guardrails-v2.mjs`）保留——测试新代码
- shadow-diff（`test/shadow-diff.mjs`）保留——swap 后旧 bundle 不再可达，可移除或保留作历史参考

### 步骤 6：更新 wrangler 配置
- `wrangler.toml`（生产）：`main = "GitHubClawCore/index.js"`（不变）
- `wrangler.v2.toml`（smoke）：可移除或合并到 `wrangler.toml`
- 部署契约不变：Terraform 读取 `GitHubClawCore/index.js`

### 步骤 7：清理
- 移除 `GitHubClawCore/index.v2.js`（构建产物，不再需要）
- 移除 `wrangler.v2.toml`（smoke 专用，已验证完毕）
- `src-legacy/` 加入 `.gitignore`（可选——保留在 repo 中作历史参考）

### 步骤 8：合并到 main
```bash
git checkout main
git merge phase-r/refactor
# 或 rebase + fast-forward
git push origin main
```
- Push 到 main 触发 GitHub Pages 自动发布
- 已部署实例通过 `/autoupdate` 自动拉取新版本

---

## 3. 风险评估

| 风险 | 级别 | 缓解 |
|------|------|------|
| 已部署实例兼容性 | 低 | 部署产物格式不变（`GitHubClawCore/index.js`），Terraform 读取方式不变 |
| D1 schema 变更 | 无 | schema 不变，migrations 不变 |
| 旧 bundle 回退需求 | 低 | `src-legacy/` 保留完整旧代码，可随时回退 |
| i18n key 差异 | 无 | 814×2 对等，real gap=0 |
| 依赖变更 | 低 | 新增 hono/grammy/@octokit/* 依赖已在 package.json |

---

## 4. Swap 后清单

- [ ] `npm run build` 使用新 `src/worker.js` 入口成功
- [ ] `npm run test:guardrails-v2` 40/40 通过
- [ ] `npm run test:guardrails` 14/14 通过（旧测试仍读旧 bundle，swap 后可更新）
- [ ] i18n parity 814×2
- [ ] `GitHubClawCore/index.js` 构建产物大小合理
- [ ] `wrangler dev` 本地启动成功
- [ ] Push 到 main → GitHub Pages 自动发布
- [ ] 已部署实例 `/autoupdate` 拉取新版本成功

---

## 5. 回退方案

如果 swap 后发现问题：
```bash
git revert <merge-commit>
git push origin main
```
或手动：
```bash
mv src/worker.js src-v2-worker.js  # 临时移开
mv src-legacy/index.js src/index.js  # 恢复旧 bundle
npm run build  # 重新构建旧产物
git push origin main
```

`src-legacy/` 始终保留在 repo 中，确保快速回退。

---

## 6. 执行命令（一键脚本）

```bash
# 1. 归档旧代码
mkdir -p src-legacy
mv src/index.js src-legacy/
mv src/MODULE_MAP.md src-legacy/
cp src/testplan\(workerAI\).md src-legacy/ 2>/dev/null; rm -f "src/testplan(workerAI).md"

# 2. 移动 src-v2 → src
cp -r src-v2/* src/
rm -rf src-v2

# 3. 更新 build.mjs 入口
sed -i '' 's|src/index.js|src/worker.js|' build.mjs

# 4. 移除 v2 专用文件
rm -f GitHubClawCore/index.v2.js wrangler.v2.toml

# 5. 验证
npm run build
npm run test:guardrails-v2
npm run test:guardrails

# 6. 提交
git add -A
git commit -m "swap: src-v2 → src (Phase R complete)

旧 bundle src/index.js 归档到 src-legacy/
src-v2 干净源码正式成为 src/
build.mjs 入口改为 src/worker.js
54 guardrails 全绿, i18n 814×2, Phase W smoke 通过"

# 7. 合并到 main
git checkout main
git merge phase-r/refactor
git push origin main
```