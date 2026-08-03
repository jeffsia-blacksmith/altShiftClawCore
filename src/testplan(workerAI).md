# Workers AI 测试计划 (src-v2)

> 目标：验证 src-v2 的两条 Workers AI 路径在**已部署的 cloud worker** 上端到端可用。
> 关键前提：smoke repo `jeffsia-blacksmith/testing_on_v2_bot` 已完成 CF 配置（两把 token 分离），
> Telegram webhook 已接到 cloud worker URL。

## 背景：两条 AI 路径

| 路径 | 用途 | 机制 | 鉴权 |
|------|------|------|------|
| **A. in-Worker `AI` binding** | 自然语言 → workflow dispatch、时间解析等同步 AI 调用 | Worker 代码内 `env.AI.run(...)` | Cloudflare 绑定（无需显式 token） |
| **B. /llm Coding Agent** | 长任务：issue 触发 → Coding Agent 跑 → 结果回 Telegram | `issue-1.yml` 选 `cloudflare-workers-ai` provider → Coding Agent 调 Workers AI REST | `CLOUDFLARE_AI_API_TOKEN`（独立 secret） |

## ✅ 已实测通过（本段会话）

1. **路径 B 的 token + REST 本身**：用 `CLOUDFLARE_AI_API_TOKEN` 直接打
   `POST /accounts/{id}/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast`
   → HTTP 200，Llama 3.3 70B 跑出文字。token 权限（Workers AI: Edit）确认 OK。
2. **路径 A 本机版**：之前本机 wrangler smoke 跑过完整端到端
   （Telegram → Pi Coding Agent → Llama 3.3 70B → 结果回 Telegram），用的是本机 AI binding。

## ❌ 待验证（cloud worker 上）

- [ ] **A on cloud**：部署的 worker bindings 列表里已确认有 `AI` binding，
      但还没从 Telegram 经 **cloud worker** 发一条触发 AI 的消息去验证云端 binding。
- [ ] **B 端到端（新 secret）**：`/llm` 选 Cloudflare Workers AI
      → `issue-1.yml` 读**新的** `CLOUDFLARE_AI_API_TOKEN` secret
      → Coding Agent 调 REST → 结果回 Telegram。这条完整链路还没用新 secret 重跑。

## 测试步骤

### 测试 1：路径 A（in-Worker binding）on cloud
1. 在 Telegram 对 smoke bot 发一句自然语言指令（会触发 dispatch / 时间解析），例如：
   `帮我建立一个问题叫"测试 AI binding"，标签 bug`
2. 预期：cloud worker 调 `env.AI.run(...)` 成功 → 创建 issue / 回复确认。
3. 失败信号：worker log 报 `AI binding` / `ai.run` 相关错误，或 Telegram 回复错误。

### 测试 2：路径 B（/llm Coding Agent）端到端
1. 在 Telegram 发 `/llm`，选 **Cloudflare Workers AI** provider。
2. 给一个简单任务，例如 `写一个 hello world js 文件`。
3. 预期：
   - cloud worker 创建 issue → 触发 `issue-1.yml`。
   - `issue-1.yml` 读到新 `CLOUDFLARE_AI_API_TOKEN` secret。
   - Coding Agent 调 Workers AI REST（Llama 3.3 70B）跑出代码。
   - 结果以 comment 回到 issue → relay 回 Telegram。
4. 验证点：
   - issue-1.yml run 成功（`gh run view`）。
   - issue 有结果 comment。
   - Telegram 收到 relay 回的结果。

## 已知前置 / 注意

- smoke repo secrets 已设：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_AI_API_TOKEN`、
  `CLOUDFLARE_ACCOUNT_ID`、`GH_WEBHOOK_SECRET`、`TELEGRAM_WEBHOOK_SECRET`。
- smoke repo workflow 仍是**旧版**（被 deploy 的 `Commit synced workflows` 同步覆盖回 main 旧版），
  → 路径 B 的 `issue-1.yml` 在 smoke repo 可能也是旧版（无 AI token 拆分）。
  建议：等 toolkit `fix/default-catalog-naming` 并进 main + 重建 instance 后再正式测路径 B，
  否则需手动确认 smoke repo 的 `issue-1.yml` 是否已含新 secret 读取。
- Telegram webhook 当前指向 cloud worker URL（`...siayuhengjeff.workers.dev`），
  若本机 wrangler 还在跑，webhook 已被覆盖，需重新设置本机 webhook 才能继续本机 smoke。

## 自动化触发（可选）

可用 `curl` 模拟一条 Telegram `update` 直接打到 cloud worker webhook URL，
绕过 Telegram 客户端，触发一轮 Coding Agent，把路径 B 端到端一次跑完。
需用 `.dev.vars` 里的 `TELEGRAM_BOT_TOKEN` 构造合法 update。