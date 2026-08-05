# altShiftClawCore — 重写完成报告

> **✅ Phase R + Swap 完成（2026-08-03）**
> 旧 20K 行混淆 bundle → 干净模块化源码（59 文件 / 9.9K 行）
> 架构图见 `src/ARCHITECTURE.md`，历史审计记录见 `src-legacy/AUDIT-DEEP.md`

---

## 完成项

| 阶段           | 内容                                                           | 状态 |
| -------------- | -------------------------------------------------------------- | ---- |
| Phase 2 (A-E)  | i18n 完整化（814 key × 2 语）                                 | ✅   |
| Phase R        | 从头重写（17 命令 + 62 回调 + 7 webhook + 5 媒体）             | ✅   |
| 4 轮深度审计   | 132 项行为对等修复                                             | ✅   |
| Phase S        | Shadow-diff 32 场景（27 identical / 5 allowed / 0 regression） | ✅   |
| Phase T        | 活跃路径深度审计 + 修复                                        | ✅   |
| Phase U        | 端到端 full-chain 验证                                         | ✅   |
| Phase V        | Relay 子系统完整重写（~520 行）                                | ✅   |
| Phase W        | 实地真凭证 smoke（15 命令 + 3 workflows + 完整链路）           | ✅   |
| **Swap** | `src-v2/` → `src/`，旧 bundle → `src-legacy/`          | ✅   |

## 当前状态

- **源码**：`src/`（59 文件，9.9K 行）— 干净模块化 JS
- **归档**：`src-legacy/`（旧混淆 bundle + 历史审计记录）
- **构建**：`npm run build` → `GitHubClawCore/index.js`（689KB）
- **护栏**：54/54 全绿（14 + 40）
- **i18n**：814×2 对等，real gap = 0
- **技术栈**：Cloudflare Workers + Hono + grammY + Octokit + D1 + Workers AI

## 目录结构

```
altShiftClawCore/
├── src/                    # 干净源码（入口 worker.js）
│   ├── worker.js           # export { fetch, scheduled }
│   ├── config.js
│   ├── http/               # Hono routes + webhook handlers
│   ├── telegram/           # Bot + commands + flows + status card
│   ├── github/             # Branches + secrets + webhook handlers
│   ├── coding-agent/       # Dispatch + relay
│   ├── scheduler/          # Cron handler
│   ├── media/              # Photo/album relay
│   ├── db/                 # D1 + KV + schedules
│   ├── i18n/               # t() / glang() / en.json / zh-CN.json
│   └── modules/            # Shared shims (empty.js, tweetnacl, etc.)
├── src-legacy/             # 旧 bundle 归档
│   ├── index.js            # 20K 行混淆代码
│   ├── MODULE_MAP.md
│   └── AUDIT-DEEP.md       # 历史审计记录（132 项）
├── build.mjs               # esbuild: src/worker.js → GitHubClawCore/index.js
├── GitHubClawCore/         # 构建产物 + D1 migrations
├── test/                   # 护栏 + shadow-diff + mock
└── ARCHITECTURE.md         # 系统架构报告（含 Mermaid 图表）
```

## 验证命令

```bash
npm run build              # 构建
npm run test:guardrails    # 14 护栏
npm run test:guardrails-v2 # 40 护栏
```

## 已知有意差异

1. 6 个 dead-code 回调省略（旧 bundle 不可达）
2. Config 必填字段在 bot token 未设时可选
3. D1 Worker 内迁移仅创建 kv_state/workflow_notifications/album_queue
4. LLM 模型验证用 list-then-includes 策略
