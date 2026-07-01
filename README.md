# altShiftClawCore

我方的 GitHubClaw Core 套件（源自同事 `thenghui/th_claw_core` 的自持複製，該複製又源自 [duotify](https://github.com/duotify) 的 GitHubClaw）。
內含**預先打包好的 Cloudflare Worker**、**Terraform** 設定、以及 **D1 migrations**，是「龍蝦堡」部署時實際跑起來的核心。

## 結構

```
altShiftClawCore/
├── src/                      # 【可編輯源碼】反混淆工作區（見下）
│   ├── index.js              # 格式化後的 Worker 源碼（22k 行，可編輯）
│   ├── index.orig.bundle.js  # 原始 bundle 基準（回歸比對用，不打包）
│   └── MODULE_MAP.md         # 混淆名 → 功能 的模組導航圖
├── build.mjs                 # esbuild：src/index.js → GitHubClawCore/index.js
├── package.json              # npm run build / check
├── GitHubClawCore/
│   ├── index.js              # 【build 產物】Cloudflare Worker（壓縮 bundle）← Terraform 讀這個
│   └── migrations/           # D1 database migrations（0001–0005）
├── Terraform/
│   ├── main.tf               # cloudflare_worker + D1 + cron + 全部 bindings
│   ├── variables.tf / outputs.tf / versions.tf
├── .github/workflows/
│   └── publish-package.yml   # 打包 zip + manifest 發佈到 GitHub Pages
└── github-claw-worker-package.json   # 版本 manifest（autoupdate 比對用）
```

## 改 Worker 邏輯（src/ 反混淆工作區）

上游 `GitHubClawCore` 私有 repo 拿不到，`index.js` 是官網 build 出的壓縮 bundle。
我方把它**格式化成 `src/index.js` 當作源碼**，改完用 esbuild 壓回 `GitHubClawCore/index.js`（Terraform 部署的產物）。往返已驗證功能等價。

```bash
npm install          # 裝 esbuild
# 依 src/MODULE_MAP.md 定位要改的模組，編輯 src/index.js
npm run check        # 打包到暫存並比對大小，不覆寫
npm run build        # src/index.js → GitHubClawCore/index.js
```
變數名仍是混淆狀態，可依 `MODULE_MAP.md` 漸進式重命名。詳見 [`_DOCS/altShiftClawAdmin/07_worker-source-reconstruction.md`](../_DOCS/altShiftClawAdmin/07_worker-source-reconstruction.md)。

## 套件發佈

`publish-package.yml` 會把 `GitHubClawCore/` + `Terraform/` 打包成 zip，連同 manifest 發到 GitHub Pages：

- **Package**：`https://jeffsia-blacksmith.github.io/altShiftClawCore/github-claw-worker-package.zip`
- **Manifest**：`https://jeffsia-blacksmith.github.io/altShiftClawCore/github-claw-worker-package.json`

> ⚠️ **域名為暫定占位**（依現有預設帳號填）。日後改網域時，改三處：
> `github-claw-worker-package.json` 的 `package_url`、`publish-package.yml` 的 `PACKAGE_URL`，
> 以及 `altShiftClawToolkit/installer/workflows/{deploy-lobster-burger,autoupdate}.yml` 裡的 URL。

## 被誰使用

instance repo 的 `deploy-lobster-burger.yml` 會下載此 zip → 解出 `Terraform/` 與 Worker code → apply 到使用者的 Cloudflare 帳號。
`autoupdate.yml` 讀 manifest 的 `revision`/`version` 比對是否要重新部署。

## Terraform 輸出（與 deploy workflow 對齊）

`deploy-lobster-burger.yml` 讀取這 4 個 output，已確認全部存在且命名一致：

| output | 用途 |
|---|---|
| `github_claw_worker_script_name` | 部署後回填 `WORKER_NAME` variable |
| `github_claw_worker_url` | 回填 `WORKER_URL`、Telegram webhook、health check |
| `schedules_db_name` | 產生 wrangler migrations config |
| `schedules_db_uuid` | 同上 |

## License

基於 duotify 的 GitHubClaw 平台（見 LICENSE）。
