# 重构进度总览（CurrentRefactor）

> 本文件追踪 `altShiftClawCore` 的重构进度，与 `src/MODULE_MAP.md`（模组识别）互为补充。
> MODULE_MAP 回答「这是什么模组」；本文回答「重构做到哪、还剩什么、踩过什么坑」。
> 最后更新：2026-07-21（Phase 2b 完成）

---

## 1. 目标与总体策略

**最终目标（两阶段，独立进行）：**

1. **现阶段 — i18n 完整化**：保留当前可运作的 esbuild bundle，把所有剩余的 unicode-traditional-Chinese 字串迁移成 zh-CN / English i18n（含 AI prompt 与 console 日志）。产物 = 完全 i18n 化的稳定基线。
2. **后阶段 — 从头重写**：基于锁定的行为基线，独立地用干净源码重写 worker（与 i18n 化解耦）。

**产品语言目标：简体中文 + 英文**（非繁体）。所有繁体字串须转简体或英文。

**执行顺序原则：先护栏后迁移、最低风险先做、每步可独立交付。**
- Phase 1 先加 Telegram/cron/AI 护栏，把当前行为锁定为黄金基线，i18n 迁移须保持护栏全绿。
- Phase 2 按模组分阶段（2a→2b→2c→2d→2e），每阶段一个 commit，跑 `npm run check` + `test:guardrails` 后才提交。
- **i18n 约定**：调用点 `t("namespace.key", { param: value }, glang())`；helper 函数以 `gLang = glang()` 形式接 lang；两份 JSON（zh-CN / en）并行加 key 保持 leaf-key 对等。

---

## 2. 进度总表

| 阶段 | 范围 | 状态 | 关键 commit |
|---|---|---|---|
| Phase 0 | 合并 PR #1（vendor-extraction → main） | ⏳ 待用户操作（PR `MERGEABLE`） | — |
| Phase 1.1 | `test/lib/mock.mjs` mock 基础设施（fetch/D1/AI） | ✅ 完成 | — |
| Phase 1.2 | +~8 护栏（Telegram/cron/AI） | ✅ 完成 | — |
| Phase 1.3 | 护栏全绿 + check + commit | ✅ 完成 | — |
| Phase 2a | Et 尾 + 业务 helper + router 字串 | ✅ 完成 | `c4096b9` `4f58fff` `d6ca852` `8034a73` `1f0d129` `b8f8307` `40478db` `8dee9b1` |
| Phase 2b | Hl Telegram 装设/安装流程 | ✅ 完成 | `5715c96` |
| Phase 2c | Pc AI/octokit（含 error-code 重构） | ⬜ 待开始（最大、最高风险、多 session） | — |
| Phase 2d | console 日志 i18n + commit msg 固定英文 | ⬜ 待开始（机械式） | — |
| Phase 2e | parity check + rebuild bundle + 收尾文档 | ⬜ 待开始 | — |

**i18n key 对等：** 起步 ~533 → Phase 2 前 556 → 2a 后 572 → 2b 后 **585**（en = zh = 585 leaf keys）。
**bundle 大小：** 2b 后 `npm run check` = 610,511 bytes。
**护栏：** 14/14 全程保持绿色。

---

## 3. Phase 2 明细

### 2a — Et 尾 / 业务 helper / router（已完成，8 commits）
**范围：** router 回复建构器（wE/bE/xE/OE）、issue-comment relay 群（Zf/tg/Oi/lu/Jf/Zs/Hf/zf）、PE LINE post-install prompt、CE/RE skill-callback、kE auto-init desc、su.on("message:text") handler、mt 状态卡 / Xr 来源 / xs 状态、Et 尾 kb 按钮。
**新增 key 命名空间：** `kb.*`、`errors.*`、`core.*`、`line.*`、`skills.targetLobsterFallback`、`system.{defaultLobsterDescription,messageReceived}` 等。
**注意：** 移除了重复的 `core.noTaskMessage2`（L485 保留基线、L519 移除冗余）。

### 2b — Hl Telegram 装设/安装流程（已完成，commit `5715c96`）
**范围（5 处）：**
- **Media handlers**（`ln.on` photo/voice/video/audio/document，L17271-17332）：重命名遮蔽 i18n `t` 的 file-object 局部变数 `t` → `ph`/`vc`/`vd`/`au`/`doc`；标签 照片/語音/影片/音訊/文件 → `t("mediaLabel.*", {}, glang())`（emoji 移入 JSON）。
- **Mf env-var 设定流程**（L17350-17463）：重命名遮蔽的 `t`（flow type 参数）→ `flow`；接线 `envValueRequired` / `enterEnvValue`（已存在）/ `setEnvFailed` / `envsSet` / `confirmInstallTo`。
- **TE welcome + ug auto-init**（L19476-19558）：重命名遮蔽的 `t` → `url` / `env`；接线 `welcomeReady1`+`welcomeReady2`、`autoInitCreated`、`autoInitFailed`。
- **`source: "小龍蝦"`**（Ys L17019、Nk L17242）→ `t("system.source_name", ...)`；已确认无下游 `===`/`.includes` 匹配该字面值。

**新增 key（两份 JSON 并行）：**
- `mediaLabel.{photo,voice,video,audio,document}`
- `templates.{envValueRequired,setEnvFailed,envsSet,confirmInstallTo}`
- `system.{welcomeReady1,welcomeReady2,autoInitCreated,autoInitFailed}`

**递延到 Phase 2d（保留为 CJK）：** ug 的两行 `console.*`（已執行過初始化，跳過 / 自動建立小龍蝦失敗）+ kE/EE 的 console/commit 行 —— 这些是 audit/log 字串、非用户面向显示。

### 2c — Pc AI/octokit（待开始，最大/最高风险）
**范围（~440 行，12xxx-16xxx）：**
- **AI prompts**（用户已决定全 i18n zh-CN+en）：`y_()` system prompt 阵列、`__()` CJK 指令行 → 新 `aiPrompt.parser.*` 命名空间；schedule-parser prompt `BT()` 已是英文 —— 建议保持英文并记录。
- **回复建构器**（`ST()` workflow card、`Nl()` schedule details、`Jm()` schedule setup、close-confirm、reset-template）→ 沿用 `fy()` join 模式；分支情形（L13411 open/close、L13379 paused/active、L12576 trigger-failed）→ 拆成两个 key 在调用点选取。
- **error-code 重构（2 耦合对，必须先做）：** `q_`/`fm`（L6768/6772）与 `K_`/`gm`（L6776/6779）目前 sniff CJK 子字串（`e.message.includes("尚未安裝到龍蝦堡")`、`startsWith("讀取範本 ")`）。**先**给抛出的 error 附 `err.code = "TEMPLATE_NOT_INSTALLED"` / `"TEMPLATE_READ_FAILED"`，改 sniff `e.code`，**再** i18n 讯息 —— 否则 sniffer 会静默失效。
- 7 个 branch-split 案例。

### 2d — console 日志 + commit msg（待开始，机械式）
- **CJK console 日志**（~50+ 行，6xxx-8xxx、19xxx-20xxx）→ `t("log.*", {...}, glang())`。注意：非 Telegram 路径（cron、GitHub webhook）中 `globalThis.globalLanguage` 未设 → `glang()` 回传 `"en"`（可接受，需确认这些路径的日志语言）。
- **11 个 `chore:` commit 讯息** → 固定英文（audit trail，不应随请求语言变）。位置：L6164/6184/6993/7325/7344/7434/7471/19506… → 如 `chore: init issue #{n} orphan branch (template: {tpl})`。
- 2b 遗留：ug 两行 console（已写成 decoded CJK 待处理）。

### 2e — 收尾（待开始）
- 用 **raw+escape 双侦测** CJK 扫描器确认业务码零残留（vendor grammY/octokit 的 library 字串不计；唯一合理剩余是解析 regex / 对英数字面值的 `.includes` 与中文数字 map 等业务逻辑）。
- 确认 `zh-CN.json` 与 `en.json` key 集完全一致（recursive flatten parity check）。
- `npm run build` 重建 `GitHubClawCore/index.js`。
- 更新 `MODULE_MAP.md` 状态 + 本文件。

---

## 4. 关键发现与教训（Lessons）

### 4.1 `t` 遮蔽风险（shadowing hazard）
bundle 大量用 `t` 作普通局部变数（message text、params、conclusion、status、owner、path-prefix、chatId、requestId、issueNum、flow type、config、file object…），**遮蔽模组层 i18n `t`**（L12 `function t(key, params={}, lang="en")`）。**加 `t(...)` 调用前必须先重命名遮蔽的 `t`**，否则调用打到遮蔽物 → TypeError / 行为错误。
- 2b 处理：Mf `t`→`flow`、media handlers `t`→`ph/vc/vd/au/doc`、TE `t`→`url`、ug `t`→`env`。

### 4.2 既有反向工程 artifact：`Ys`/`Nk` 的 `t_msg`/`t_file`
`Ys(e, t_msg)` 与 `Nk(e, t_file, r)` 的参数名为 `t_msg`/`t_file`，但函式主体一律用 `t` —— `t(...)` 是模组 i18n（可运作，见既有的 `t("core.mediaNotAccepted")`），而 `t.field`/`t.fileId` 等读到的是 i18n 函式的属性 = `undefined`。**即 media-upload 经由 Ys/Nk 的 file-object 存取目前是坏的**。此为反向工程格式化（commit `8999065`，早于所有 i18n 工作）遗留，与字串迁移无关，护栏未覆盖 media 路径故未显现。**判定：不在 i18n 迁移中修复，留给从重写阶段处理。**

### 4.3 CJK 扫描器必须 raw + escape 双侦测
- 太窄的 hex regex（`/\\u(4[0-9a-f]{3}|9[0-8][0-9a-f]{2})/`）只匹配 4xxx 与 9xxx-98xx，**漏掉 5xxx-8xxx**（多数常用 CJK 所在：技=6280、能=555F、已=5DF2、附=9644）。
- **只解 `\uXXXX`/`\u{...}` escape 的扫描器会漏掉 decoded CJK** —— body-file+splicer 模式会把递延的 console 字串写成 **decoded CJK**（真实字元）以避开 Write 工具的 `\u` escape 处理歧义。
- 正解（`/tmp/cjk_scan2.js`）：codepoint range 0x4E00-0x9FFF / 0xFF00-0xFFEF / 0x3400-0x4DBF，**同时**扫 raw 字元与解 escape。

### 4.4 braced escape `\u{...}` Edit 匹配问题
- 4-hex `\uXXXX`：Edit 工具会 normalize，decoded-CJK 的 old_string 可匹配。
- braced `\u{1F916}`/`\u{1F4AC}`/`\u{1F99E}`：**不会 normalize**，decoded old_string 匹配失败 → 用 body-file + node splicer 处理含 braced emoji 的区块。
- **解法**：把 emoji/文字移入 JSON value（literal UTF-8），index.js 调用点变 ASCII `t(...)`，完全绕开 braced-escape 匹配问题。

### 4.5 可靠迁移模式：body-file + node splicer
- 用 Write 写 body file（literal 内容、无 escape 问题）。
- node splicer bottom-up（最高行先替换，避免行号位移），验证 start-signature + column-0 end-brace（`/^}$/`，**不可**用 `/^\s*\}\s*$/` —— 会误配 indented 内层 catch-block brace，导致 off-by-one stray `}`）。
- 用于多行 template-literal 函式（Oi/lu/Jf/Zs/Hf/zf/CE/RE/su.on/media/Mf/TE/ug）。
- 含递延行的函式：用 scoped 单行编辑保留那些行 byte-identical，或写成 decoded CJK（功能相同、2d 仍会抓到）。

### 4.6 JSON value 避内嵌换行/引号
- welcomeReady 拆成 `welcomeReady1`+`welcomeReady2` 两个 key，调用点用 `+"\n"+` 串接 —— 避免 JSON value 内嵌 `\n` 的 Write 工具 escape 歧义。
- autoInitCreated 英文版用 `[{title}]`（方括号）替代 `\"{title}\"` —— 避免引号 escape。

---

## 5. 验证流程（每阶段后执行）
1. `npm run check` —— bundle 完整性（default export + fetch handler、size delta 合理、无重复 key 警告）。
2. `npm run test:guardrails` —— 14 既有 + 新增护栏全绿（**迁移安全信号**：结构断言抓 5xx / 缺回复 / 控制流破坏 / 未解析 `t()` key 泄漏成 dotted path）。
3. JSON parity check —— en/zh leaf-key 集完全一致。
4. CJK scan —— raw+escape 双侦测，迁移区块零 CJK（递延项除外）。
5. `npm run build` —— 仅 2e 末步，产出 `GitHubClawCore/index.js`。

---

## 6. 待办与下一步
- **Phase 2c（建议下步）**：最大且高风险，建议单独 session 起头。先做 error-code 重构（2c-i），再 AI prompts（2c-ii），最后回复建构器（2c-iii），可拆 3 个 commit。
- **或先做 Phase 2d**（机械式、快速见效）—— 若想在 dive 进大 phase 前先清掉简单项。
- **Phase 0**：用户合并 PR #1。
- **遗留判定为业务逻辑、不迁移：** L7028/7030/7038/7039 是/否/停 boolean 阵列（用户输入值匹配）、解析 regex（`/(图片|image|photo)/` 等）。
- **记忆待修正：** i18n 残留计数（401/282 vs 680）不确定，2e 时以双侦测扫描器重新精确计数。