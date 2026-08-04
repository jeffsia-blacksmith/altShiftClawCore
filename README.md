# altShiftClawCore

我方的 GitHubClaw Core 套件（源自 [duotify](https://github.com/duotify) 的 GitHubClaw，已从头重写）。
内含**预先打包好的 Cloudflare Worker**、**Terraform** 设定、以及 **D1 migrations**，是「龙虾堡」部署时实际跑起来的核心。

## 结构

```
altShiftClawCore/
├── src/                      # 干净模块化源码（59 文件，~10K 行）
│   ├── worker.js             # 入口：export { fetch, scheduled }
│   ├── config.js             # 环境变量 / binding 解析
│   ├── http/                 # Hono HTTP 框架 + webhook 签名验证
│   ├── telegram/             # grammY Bot（17 命令 + 64 回调 + 5 媒体）
│   ├── github/               # 分支/模板/workflow + secrets 加密 + webhook 处理
│   ├── coding-agent/         # 派工 + relay 子系统
│   ├── scheduler/            # cron handler（10+ 排程规则类型）
│   ├── media/                # 图片/相册转送
│   ├── db/                   # D1 facade + KV store + 排程 CRUD
│   ├── i18n/                 # t() / glang() + en.json (814 keys) + zh-CN.json (814 keys)
│   └── modules/              # 共享 shim（empty.js, tweetnacl, content-type）
├── src-legacy/               # 旧混淆 bundle 归档（~20K 行，仅参考）
├── build.mjs                 # esbuild：src/worker.js → GitHubClawCore/index.js
├── package.json              # npm run build / check / test:guardrails / test:guardrails-v2
├── test/                     # e2e 护栏（14 + 40）+ shadow-diff + mock 基础设施
├── GitHubClawCore/
│   ├── index.js              # 【build 产物】Cloudflare Worker（压缩 bundle）← Terraform 读这个
│   └── migrations/           # D1 database migrations（0001–0005）
├── Terraform/                # Cloudflare Worker + D1 IaC 定义
└── .github/workflows/        # publish-package.yml（发布）+ guardrails.yml（CI 护栏）
```

## 构建

```bash
npm install               # 安装依赖
npm run build             # src/worker.js → GitHubClawCore/index.js
npm run test:guardrails   # 14 护栏
npm run test:guardrails-v2 # 40 护栏
```

Push 到 `main` 自动发布到 GitHub Pages，已部署实例通过 `/autoupdate` 自动拉取新版本。

## 架构

详见 `src/ARCHITECTURE.md`（含 Mermaid 图表：系统总览、HTTP 流转、Bot 中间件链、Webhook 事件、派工流程、排程系统、数据模型、模块依赖、安全设计）。