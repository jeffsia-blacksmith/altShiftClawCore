# Worker Bundle 完整识别（IDENTIFICATION）

> `src/index.js` = `GitHubClawCore/index.js`（esbuild 压缩 bundle）格式化 + 区块标注后的可编辑版。
> 本文是**整体内容的完整识别**：每个模组的行范围、身份（厂商库 vs 业务）、证据。
> 标注已直接写进 `src/index.js`（搜 `[MODULE xx]` 即可跳到）。加注解不影响 build（esbuild 会剥除）。

## 全域规模
- **22,264 行**、~525KB、**823 个命名函式**
- esbuild 封装模组 16 个（11 `__esm`、3 `__commonJS`、2 `__toESM`）
- 入口：`export { <mangled> as default }`，default 物件含 **`fetch`**（HTTP）与 **`scheduled`**（cron，每分钟）

## 重大结论：**~70% 是厂商库，业务逻辑约 8k 行**

| 前缀 | 起始行 | 行数 | 类别 | 身份 | 证据 |
|---|---|---|---|---|---|
| ~~`kc`~~ | ~~33~~ | ~~260~~ | 🔵 vendor | ~~**content-type** 解析~~ → **已抽换为 npm `content-type` + `src/modules/content-type-shim.js`**（保留 `safeParse`/`defaultContentType` 语义） | "invalid media type", "invalid parameter format" |
| `Et` | 293 | 4,736 | 🔵 vendor | **grammY**（Telegram Bot 框架） | "filter query", "Shortcuts in", "milliseconds" |
| `mt` | 5,030 | 480 | 🟢 business | new-flow helpers | "new-flow:" |
| `ms` | 5,510 | 414 | 🟢 business | **D1 database helpers** | "Expected a D1 database binding" |
| `Yr` | 5,924 | 15 | 🟢 business | GitHub API 小工具 | — |
| `Xr` | 5,939 | 424 | 🟢 business | **GitHub REST client** | "User-Agent", "GitHubClawCore", "X-GitHub-Api-Version" |
| `ar` | 6,363 | 218 | 🟢 business | workflow run 状态 | "completed", "running", "disabled" |
| `Ss` | 6,581 | 314 | 🟢 business | state finalization | "finalized" |
| `xs` | 6,895 | 288 | 🟢 business | GraphQL / templates | "POST /graphql", "templates" |
| `Ms` | 7,183 | 31 | 🟢 business | new-flow state（1） | "awaiting_name" |
| `di` | 7,214 | 156 | 🟢 business | new-flow state（2） | "awaiting_description" |
| `Im` | 7,370 | 842 | 🟢 business | templates/default 处理 | "default" |
| `cf` | 8,212 | 1 | 🔵 vendor | crypto PRNG（part） | "no PRNG" |
| `df` | 8,213 | 3,692 | 🔵 vendor | **tweetnacl**（NaCl 加密） | "bad nonce size", "bad public key size", "use Uint8Array" |
| `Pc` | 11,906 | 5,039 | 🟡 混合 | **@octokit** SDK + AI workflow 业务 | "[@octokit/graphql]", "[@octokit/auth-token]", "AI 没有回传 workflow 参数" |
| `Hl` | 16,946 | 3,054 | 🟢 business | **Telegram 安装/设定流程** | "awaiting_env", "confirm_install", "MarkdownV2", "范本…modelVar" |
| （顶层） | ~20,000 | ~2,200 | 🟢 business | **Worker 入口 + 路由** | fetch/scheduled、`/github/webhook` `/active-issue` `/api` |

🔵 vendor = 第三方库，可考虑换回 npm import 缩小维护面
🟢 business = 自维护业务逻辑
🟡 mixed = 库与业务夹杂，拆分时要小心

## 路由（fetch handler 入口）
| 路径 | 用途 |
|---|---|
| `/health` | 健康检查（deploy workflow poll，期望 `{ok:true,service:"githubclaw-core"}`） |
| `/github/webhook` | GitHub App webhook 接收 |
| `/telegram/webhook` | Telegram webhook（binding `TELEGRAM_WEBHOOK_PATH`） |
| `/api`, `/api/graphql`, `/graphql` | 内部 API / GraphQL |
| `/new` `/list` `/close` `/current` `/active-issue` `/schedules` `/workflow` `/help` | Telegram 指令处理 |

## D1 资料模型（migrations 对应）
`schedules`、`kv_state`、`issue_metadata`、`workflow_notifications`、`album_queue`

## 两个「导出名未混淆」的业务模组（最佳下手点）
esbuild `__export`（`Mu`）重新导出、名称可读：
- **workflow_notifications CRUD**（ns `Sa`）：`createWorkflowNotification`、`getWorkflowNotificationByRequestId`、`getWorkflowNotificationByRunId`、`getRecentPendingNotificationByWorkflowPath`、`updateWorkflowNotificationByRequestId`、`deleteWorkflowNotificationByRequestId`、`initWorkflowNotificationsTable`
- **Telegram new/edit flow**（ns `Am`）：`newCommand`、`initEditFlow`、`handleNewFlowTextInput`、`handleNewFlowTemplateSelection`、`handleNewFlowWorkflowStateSelection`、`handleNewFlowEnvSetup`、`handleNewFlowEnvSkip`、`handleNewFlowEnvCancel`、`handleNewFlowKeepField`、`handleNewFlowTemplateReset`、`handleNewFlowCancel`

## 反混淆 / 维护工作流（渐进、按需）
1. 从上表把需求对到模组前缀 → 在 `src/index.js` 搜 `[MODULE xx]` 跳到区块。
2. 厂商库（🔵）不用读懂内部，需要时整块换成 npm 套件 import。
3. 业务模组（🟢）：IDE rename-symbol 整理该块变数，够大就抽成 `src/modules/<name>.js` 再 import。
4. `npm run check`（比大小、不覆写）→ `npm run build`（产生 `GitHubClawCore/index.js`）。
5. 对照 `src/index.orig.bundle.js` 做行为回归（`wrangler dev` 打 `/health`）。

## 现况
- ✅ 整体**已完整识别到模组层级**（身份 + 行范围 + 证据），标注已写入源码。
- ⏳ 变数层级的逐一重命名**尚未做**（按需进行，非阻塞——bundle 本来就可 build/部署）。
