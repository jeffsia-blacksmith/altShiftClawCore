# altShiftClawCore

我方的 GitHubClaw Core 套件（源自同事 `thenghui/th_claw_core` 的自持复制，该复制又源自 [duotify](https://github.com/duotify) 的 GitHubClaw）。
内含**预先打包好的 Cloudflare Worker**、**Terraform** 设定、以及 **D1 migrations**，是「龙虾堡」部署时实际跑起来的核心。

## 结构

```
altShiftClawCore/
├── src/                      # 【可编辑源码】反混淆工作区（见下）
│   ├── index.js              # 格式化后的 Worker 源码（~20k 行，可编辑）
│   ├── modules/              # 已抽离的独立模块（content-type / tweetnacl shim、workflow-notifications）
│   └── MODULE_MAP.md         # 混淆名 → 功能 的模组导航图
├── build.mjs                 # esbuild：src/index.js → GitHubClawCore/index.js
├── package.json              # npm run build / check / test:guardrails
├── test/guardrails.mjs       # e2e 护栏（/health、/github/webhook、CRUD round-trip）
├── GitHubClawCore/
│   ├── index.js              # 【build 产物】Cloudflare Worker（压缩 bundle）← Terraform 读这个
│   └── migrations/           # D1 database migrations（0001–0005）
├── Terraform/
│   ├── main.tf               # cloudflare_worker + D1 + cron + 全部 bindings
│   ├── variables.tf / outputs.tf / versions.tf
├── .github/workflows/
│   ├── publish-package.yml   # 打包 zip + manifest 发布到 GitHub Pages
│   └── guardrails.yml        # PR/push 自动跑 build check + e2e 护栏
└── github-claw-worker-package.json   # 版本 manifest（autoupdate 比对用）
```

## 改 Worker 逻辑（src/ 反混淆工作区）

上游 `GitHubClawCore` 私有 repo 拿不到，`index.js` 是官网 build 出的压缩 bundle。
我方把它**格式化成 `src/index.js` 当作源码**，改完用 esbuild 压回 `GitHubClawCore/index.js`（Terraform 部署的产物）。往返已验证功能等价。

```bash
npm install          # 装 esbuild
# 依 src/MODULE_MAP.md 定位要改的模组，编辑 src/index.js
npm run check        # 打包到暂存并比对大小，不覆写
npm run build        # src/index.js → GitHubClawCore/index.js
```
变数名仍是混淆状态，可依 `MODULE_MAP.md` 渐进式重命名。详见 [`_DOCS/altShiftClawAdmin/07_worker-source-reconstruction.md`](../_DOCS/altShiftClawAdmin/07_worker-source-reconstruction.md)。

## 套件发布

`publish-package.yml` 会把 `GitHubClawCore/` + `Terraform/` 打包成 zip，连同 manifest 发到 GitHub Pages：

- **Package**：`https://jeffsia-blacksmith.github.io/altShiftClawCore/github-claw-worker-package.zip`
- **Manifest**：`https://jeffsia-blacksmith.github.io/altShiftClawCore/github-claw-worker-package.json`

> ⚠️ **域名为暂定占位**（依现有预设帐号填）。日后改网域时，改三处：
> `github-claw-worker-package.json` 的 `package_url`、`publish-package.yml` 的 `PACKAGE_URL`，
> 以及 `altShiftClawToolkit/installer/workflows/{deploy-lobster-burger,autoupdate}.yml` 里的 URL。

## 被谁使用

instance repo 的 `deploy-lobster-burger.yml` 会下载此 zip → 解出 `Terraform/` 与 Worker code → apply 到使用者的 Cloudflare 帐号。
`autoupdate.yml` 读 manifest 的 `revision`/`version` 比对是否要重新部署。

## Terraform 输出（与 deploy workflow 对齐）

`deploy-lobster-burger.yml` 读取这 4 个 output，已确认全部存在且命名一致：

| output | 用途 |
|---|---|
| `github_claw_worker_script_name` | 部署后回填 `WORKER_NAME` variable |
| `github_claw_worker_url` | 回填 `WORKER_URL`、Telegram webhook、health check |
| `schedules_db_name` | 产生 wrangler migrations config |
| `schedules_db_uuid` | 同上 |

## License

基于 duotify 的 GitHubClaw 平台（见 LICENSE）。
