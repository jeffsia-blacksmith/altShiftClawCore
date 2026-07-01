# Worker Bundle 完整識別（IDENTIFICATION）

> `src/index.js` = `GitHubClawCore/index.js`（esbuild 壓縮 bundle）格式化 + 區塊標注後的可編輯版。
> 本文是**整體內容的完整識別**：每個模組的行範圍、身份（廠商庫 vs 業務）、證據。
> 標注已直接寫進 `src/index.js`（搜 `[MODULE xx]` 即可跳到）。加註解不影響 build（esbuild 會剝除）。

## 全域規模
- **22,264 行**、~525KB、**823 個命名函式**
- esbuild 封裝模組 16 個（11 `__esm`、3 `__commonJS`、2 `__toESM`）
- 入口：`export { <mangled> as default }`，default 物件含 **`fetch`**（HTTP）與 **`scheduled`**（cron，每分鐘）

## 重大結論：**~70% 是廠商庫，業務邏輯約 8k 行**

| 前綴 | 起始行 | 行數 | 類別 | 身份 | 證據 |
|---|---|---|---|---|---|
| `kc` | 33 | 260 | 🔵 vendor | **content-type** 解析 | "invalid media type", "invalid parameter format" |
| `Et` | 293 | 4,736 | 🔵 vendor | **grammY**（Telegram Bot 框架） | "filter query", "Shortcuts in", "milliseconds" |
| `mt` | 5,030 | 480 | 🟢 business | new-flow helpers | "new-flow:" |
| `ms` | 5,510 | 414 | 🟢 business | **D1 database helpers** | "Expected a D1 database binding" |
| `Yr` | 5,924 | 15 | 🟢 business | GitHub API 小工具 | — |
| `Xr` | 5,939 | 424 | 🟢 business | **GitHub REST client** | "User-Agent", "GitHubClawCore", "X-GitHub-Api-Version" |
| `ar` | 6,363 | 218 | 🟢 business | workflow run 狀態 | "completed", "running", "disabled" |
| `Ss` | 6,581 | 314 | 🟢 business | state finalization | "finalized" |
| `xs` | 6,895 | 288 | 🟢 business | GraphQL / templates | "POST /graphql", "templates" |
| `Ms` | 7,183 | 31 | 🟢 business | new-flow state（1） | "awaiting_name" |
| `di` | 7,214 | 156 | 🟢 business | new-flow state（2） | "awaiting_description" |
| `Im` | 7,370 | 842 | 🟢 business | templates/default 處理 | "default" |
| `cf` | 8,212 | 1 | 🔵 vendor | crypto PRNG（part） | "no PRNG" |
| `df` | 8,213 | 3,692 | 🔵 vendor | **tweetnacl**（NaCl 加密） | "bad nonce size", "bad public key size", "use Uint8Array" |
| `Pc` | 11,906 | 5,039 | 🟡 混合 | **@octokit** SDK + AI workflow 業務 | "[@octokit/graphql]", "[@octokit/auth-token]", "AI 沒有回傳 workflow 參數" |
| `Hl` | 16,946 | 3,054 | 🟢 business | **Telegram 安裝/設定流程** | "awaiting_env", "confirm_install", "MarkdownV2", "範本…modelVar" |
| （頂層） | ~20,000 | ~2,200 | 🟢 business | **Worker 入口 + 路由** | fetch/scheduled、`/github/webhook` `/active-issue` `/api` |

🔵 vendor = 第三方庫，可考慮換回 npm import 縮小維護面
🟢 business = 自維護業務邏輯
🟡 mixed = 庫與業務夾雜，拆分時要小心

## 路由（fetch handler 入口）
| 路徑 | 用途 |
|---|---|
| `/health` | 健康檢查（deploy workflow poll，期望 `{ok:true,service:"githubclaw-core"}`） |
| `/github/webhook` | GitHub App webhook 接收 |
| `/telegram/webhook` | Telegram webhook（binding `TELEGRAM_WEBHOOK_PATH`） |
| `/api`, `/api/graphql`, `/graphql` | 內部 API / GraphQL |
| `/new` `/list` `/close` `/current` `/active-issue` `/schedules` `/workflow` `/help` | Telegram 指令處理 |

## D1 資料模型（migrations 對應）
`schedules`、`kv_state`、`issue_metadata`、`workflow_notifications`、`album_queue`

## 兩個「導出名未混淆」的業務模組（最佳下手點）
esbuild `__export`（`Mu`）重新導出、名稱可讀：
- **workflow_notifications CRUD**（ns `Sa`）：`createWorkflowNotification`、`getWorkflowNotificationByRequestId`、`getWorkflowNotificationByRunId`、`getRecentPendingNotificationByWorkflowPath`、`updateWorkflowNotificationByRequestId`、`deleteWorkflowNotificationByRequestId`、`initWorkflowNotificationsTable`
- **Telegram new/edit flow**（ns `Am`）：`newCommand`、`initEditFlow`、`handleNewFlowTextInput`、`handleNewFlowTemplateSelection`、`handleNewFlowWorkflowStateSelection`、`handleNewFlowEnvSetup`、`handleNewFlowEnvSkip`、`handleNewFlowEnvCancel`、`handleNewFlowKeepField`、`handleNewFlowTemplateReset`、`handleNewFlowCancel`

## 反混淆 / 維護工作流（漸進、按需）
1. 從上表把需求對到模組前綴 → 在 `src/index.js` 搜 `[MODULE xx]` 跳到區塊。
2. 廠商庫（🔵）不用讀懂內部，需要時整塊換成 npm 套件 import。
3. 業務模組（🟢）：IDE rename-symbol 整理該塊變數，夠大就抽成 `src/modules/<name>.js` 再 import。
4. `npm run check`（比大小、不覆寫）→ `npm run build`（產生 `GitHubClawCore/index.js`）。
5. 對照 `src/index.orig.bundle.js` 做行為回歸（`wrangler dev` 打 `/health`）。

## 現況
- ✅ 整體**已完整識別到模組層級**（身份 + 行範圍 + 證據），標注已寫入源碼。
- ⏳ 變數層級的逐一重命名**尚未做**（按需進行，非阻塞——bundle 本來就可 build/部署）。
