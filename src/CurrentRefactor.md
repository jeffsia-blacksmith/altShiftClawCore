# 重构进度总览（CurrentRefactor）

> 本文件是 `altShiftClawCore` 重构的**唯一状态入口**，整合两条工作线：模组抽离（vendor extraction）+ i18n 完整化。
> 与 `src/MODULE_MAP.md`（模组识别）互为补充：MODULE_MAP 回答「这是什么模组」；本文回答「重构做到哪、还剩什么、踩过什么坑」。
> 最后更新：2026-07-22（Phase 2c/2d/2e 全部完成 —— i18n 迁移收尾，稳定基线就绪；**新增 §10 from-scratch 重写计划（Phase R）**；合并原父目录 `CurrentRefactor.md` / `currentWorks*.md`）

---

## 1. 起点与总体策略

### 起点

`altShiftClawCore/src/index.js` 是别人 repo（`thenghui/th_claw_core`，又源自 `duotify/GitHubClaw`）的 esbuild bundle 格式化版，原 ~22,805 行混淆代码。**核心痛点**：改一点坏一片——所有东西在同一个闭包里共享混淆变量名，一个 rename 就连锁崩，且早期无护栏检测回归。

### 总体策略（两条主线，独立进行）

1. **阶段 B — i18n 完整化**（进行中，详见 §3）：保留当前可运作的 bundle，把所有剩余 unicode-traditional-Chinese 字串迁移成 zh-CN / English i18n（含 AI prompt 与 console 日志）；其中 commit 讯息、英文 AI prompt、非 Telegram 路径 console 直接固定/落为英文。产物 = 完全 i18n 化、行为不变的稳定基线。
2. **后阶段 — 从头重写**：基于锁定的行为基线，独立用干净源码重写 worker（与 i18n 化解耦）。

> **阶段 A 续（模组抽离 / vendor 替换）已暂缓**：用户决定大概率不再做（反正要 from-scratch 重写，边际价值低）。已完成的 `kc`/`df`/`Sa` 抽离保留；剩余 keyboard builders / grammY 替换 / `Am`/`Pc` 抽离路线图见 §5 仅作存档参考，不排进度。**现役工作只有 i18n（阶段 B）→ from-scratch（后阶段）两条线。**

**产品语言目标：简体中文 + 英文**（非繁体）。所有繁体字串须转简体或英文。
**执行原则：先护栏后迁移、最低风险先做、每步可独立交付。** i18n 调用约定：`t("namespace.key", { param: value }, glang())`；两份 JSON（zh-CN / en）并行加 key 保持 leaf-key 对等。

---

## 2. 进度总表

| 阶段                     | 范围                                                                                                  | 状态                                                                                                                                                               | 关键产出/commit                                                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **A0** vendor 抽离 | `kc`(content-type)/`df`(tweetnacl)/`cf` → npm + shim；`Sa`(workflow_notifications) → module | ✅ 完成                                                                                                                                                            | `6252e9e` `b60edf5` `47e0fbc` 等 7 commits                                                                                                |
| **A1** e2e 护栏 v1 | 6 个 HTTP 路由护栏 + Sa CRUD round-trip                                                               | ✅ 完成                                                                                                                                                            | `b5f80aa`                                                                                                                                     |
| **A2** CI          | `.github/workflows/guardrails.yml` 自动跑 check + guardrails                                        | ✅ 完成                                                                                                                                                            | `f63eba2`                                                                                                                                     |
| **Phase 0**        | 合并 PR#1（vendor-extraction → main）                                                                | ⏳ 待用户操作（PR`MERGEABLE`）                                                                                                                                   | PR#1                                                                                                                                            |
| **Phase 1.1**      | `test/lib/mock.mjs` mock 基础设施（fetch/D1/AI）                                                    | ✅ 完成                                                                                                                                                            | —                                                                                                                                              |
| **Phase 1.2**      | +8 护栏（Telegram 命令/cron/AI）                                                                      | ✅ 完成                                                                                                                                                            | —                                                                                                                                              |
| **Phase 1.3**      | 护栏全绿 + check + commit                                                                             | ✅ 完成                                                                                                                                                            | —                                                                                                                                              |
| **Phase 2a**       | Et 尾 + 业务 helper + router 字串                                                                     | ✅ 完成                                                                                                                                                            | `c4096b9` `4f58fff` `d6ca852` `8034a73` `1f0d129` `b8f8307` `40478db` `8dee9b1`                                                 |
| **Phase 2b**       | Hl Telegram 装设/安装流程                                                                             | ✅ 完成                                                                                                                                                            | `5715c96`                                                                                                                                     |
| **Phase 2c**       | Pc AI/octokit（含 error-code 重构）                                                                   | ✅ 完成（2c-i/ii/iii + close/reset/switch + schedule-flow + workflow-status builders + 媒体/message-builder + AI throws/scheduler prompt + Qf/fu fallback 全完成） | `3253c2a` `bd1f075` `0b0e309` `a13d456` `6dece0d` `1b66676` `e5a2c47` `ac387d9` `2a8db6d` `97edb81` `dc01d32` `f22794b` |
| **Phase 2d**       | console 日志 i18n + commit msg 固定英文                                                               | ✅ 完成（4 批次 ~108 console 行 + Simplified 输入 token）                                                                                                          | `83dbb30` `40105fa` `210aadd` `8b5084d` `6ca3e84` `60472e6`                                                                         |
| **Phase 2e**       | parity check + rebuild bundle + 收尾文档                                                              | ✅ 完成（808=808 leaf 对等、零 placeholder mismatch、bundle 重建）                                                                                                 | `ebf3a20`                                                                                                                                     |
| **A 续**           | keyboard builders 抽离 / grammY 替换 / Am 抽离 / Pc 拆分                                              | ⏸️**暂缓**（大概率不做，见 §5 存档）                                                                                                                      | —                                                                                                                                              |
| **Phase R**        | from-scratch 重写（基于锁定基线，干净源码重写 worker）                                                | ⬜ 待开始（计划见 §10，先决条件已满足）                                                                                                                           | —                                                                                                                                              |

**量化（最新，2026-07-22 Phase 2e 收尾）：** `src/index.js` 22,805 → **20,333 行**；bundle 605,818 → **629,928 bytes**（i18n t() 调用 + log.* 命名空间占用，net 略增）；**i18n leaf-key 对等 533 → 808（en = zh，零 placeholder mismatch）**；护栏 6 → **14/14 全绿**；`src/modules/` 4 文件。**业务码 CJK 残留 = 40 行，全部为 KEEP 业务逻辑**（内容匹配 regex、输入判别 map、中文数字 parser、zh 标点分隔符、刻意保留的 Simplified AI prompt 范例）。`GitHubClawCore/index.js` 已重建。

> **2c 已全部完成（2026-07-22）**：原估的 7 个子流程 ~185 business CJK 行已逐批迁移（AI throws/scheduler prompt 简化、媒体/message-builder、Qf/fu fallback 等），剩余 CJK 已分类为 KEEP 业务逻辑或归入 2d console 批次。详见下方 2c/2d/2e 明细。

---

## 3. Phase 2 i18n 明细

### 2a — Et 尾 / 业务 helper / router（已完成，8 commits）

**范围：** router 回复建构器（wE/bE/xE/OE）、issue-comment relay 群（Zf/tg/Oi/lu/Jf/Zs/Hf/zf）、PE LINE post-install prompt、CE/RE skill-callback、kE auto-init desc、su.on("message:text") handler、mt 状态卡 / Xr 来源 / xs 状态、Et 尾 kb 按钮。
**新增 key 命名空间：** `kb.*`、`errors.*`、`core.*`、`line.*`、`skills.targetLobsterFallback`、`system.{defaultLobsterDescription,messageReceived}` 等。移除重复的 `core.noTaskMessage2`（L485 保留基线、L519 移除冗余）。

### 2b — Hl Telegram 装设/安装流程（已完成，commit `5715c96`）

**范围（5 处）：**

- **Media handlers**（`ln.on` photo/voice/video/audio/document，L17271-17332）：重命名遮蔽 i18n `t` 的 file-object 局部变数 `t` → `ph`/`vc`/`vd`/`au`/`doc`；标签 照片/語音/影片/音訊/文件 → `t("mediaLabel.*", {}, glang())`（emoji 移入 JSON）。
- **Mf env-var 设定流程**（L17350-17463）：重命名遮蔽的 `t`（flow type 参数）→ `flow`；接线 `envValueRequired` / `enterEnvValue`（已存在）/ `setEnvFailed` / `envsSet` / `confirmInstallTo`。
- **TE welcome + ug auto-init**（L19476-19558）：重命名遮蔽的 `t` → `url` / `env`；接线 `welcomeReady1`+`welcomeReady2`、`autoInitCreated`、`autoInitFailed`。
- **`source: "小龍蝦"`**（Ys L17019、Nk L17242）→ `t("system.source_name", ...)`；已确认无下游 `===`/`.includes` 匹配该字面值。

**新增 key（两份 JSON 并行）：** `mediaLabel.{photo,voice,video,audio,document}`、`templates.{envValueRequired,setEnvFailed,envsSet,confirmInstallTo}`、`system.{welcomeReady1,welcomeReady2,autoInitCreated,autoInitFailed}`。
**递延到 Phase 2d（保留为 CJK）：** ug 两行 `console.*` + kE/EE 的 console/commit 行 —— audit/log 字串、非用户面向显示。

### 2c — Pc AI/octokit（进行中，最大/最高风险，多 session）

**范围（~440 行，12xxx-16xxx）：**

- ✅ **2c-i error-code 重构**（commit `3253c2a`）：`q_`/`fm` 与 `K_`/`gm` 抛出 error 附 `err.code = "TEMPLATE_NOT_INSTALLED"` / `"TEMPLATE_READ_FAILED"`，sniffer 改读 `e.code`；`templates.notInstalled` / `templates.readFailed` 接 i18n。**必须在 i18n 讯息前做**，否则 sniffer 静默失效。
- ✅ **2c-ii AI prompts**（commit `bd1f075`）：`y_()` system prompt 阵列、`__()` key=value rule 行、`T_()` json_schema descriptions → `aiPrompt.parser.*` 命名空间；重命名遮蔽 `t`（`__`→`msg`、`T_`→`props`）。`BT()` schedule-parser 已是英文 —— 保持英文。
- ✅ **2c-iii 核心回复建构器**（commit `0b0e309`）：`ST`(workflow card→`core.workflowStatusCard`)、`IT`/`vT`/`Al`(error builders→`core.query/infer/triggerWorkflowFailed`)、`Vm`/`Ln`/`Ml`(status/notSet/lobsterHash)、`Ol`/`Nl`/`Ds`/`Dn`(schedule list/card builders→`schedule.card.*`/`schedule.list*`/`schedule.thisChatList*`)、`Jm`/`Ym`/`Xm`/`Zm`(setup/edit prompts→`schedule.setup/edit*`)；enable/disable/workflow 命令 handler 接 `core.workflowEnabledOk/DisabledOk`+`schedule.workflowStateActive/DisabledManually`，重命名遮蔽 `t`(octokit→`ok`、file/msg/issueNum/cur/props/lines)。分支情形（paused/active、active/disabled_manually、notify on/off）拆 key 在调用点选取。
- ⬜ **2c-iii 剩余**：close-confirm handlers（~L14380-14470）、reset-template handler（~L14480-14540）、`throw new Error("排程格式不正確")`（L13514）、其余 Pc 内 scattered inline（Pc 区共 ~372 business CJK 行待迁，多为 inline handler 字串含 octokit `t` 遮蔽，需逐 handler 分析）。
- ✅ **2c-iii 续（commit `a13d456`）**：switch/close_issue_prompt/cancel/confirm、current_template_reset、template_reset_select/cancel、current_edit callback handlers 全接既有 `core.*` 键；`Ei()` lobster-label helper 也 i18n（`core.lobsterLabel/lobsterLabelWithTitle`）。重命名遮蔽 `t`（switch/confirm/edit 的 guard）。
- ✅ **2c-iii schedule-flow 模组**（commit 待提）：`Bl` 范例阵列 → `Bl()` 函式返 `schedule.flow.timeExamples`；`JT`/`YT` setup prompts → `schedule.flow.timePromptQuestion`/`examplesLine`/`payloadPromptLine1-3`；`ZT` config card → `schedule.flow.configCardTitle`+`fieldId/Type/Time/NextRun/Prompt/Payload`；`on` issue-comment 记录 → `schedule.flow.configCommentLog`（HTML meta 注解保留字面）；`uf`/`ql` flow handler → `scheduleNotFound`/`stateLost`/`createFailed`/`ambiguousClarify/Reply`/`failedUnderstand/Reply`；`Kl.command("schedules")` → `listFetchFailed`；`V()` 按钮过期 → `core.buttonExpired`。**action 判别子**（"建立"/"更新"）改为中性 "create"/"update"（解耦显示与判别），经 `on`→`ZT` 传导；显示 label 走 `schedule.flow.actionCreate/Update`。重命名遮蔽 `t`：`JT`/`YT`→`total`、`ZT`→`action`、`on`→`sched`/`action`、`uf`→`flow`、`ql`→`st`、`Kl`→`ok`、`V`→`cid`。复用既有 `schedule.prompt_cannot_be_empty`。递延 2d：`on`/`ql`/`Kl` 4 条 console.* + `QT`(`略過` skip token，业务逻辑保留)。
- ✅ **2c-iii workflow status builders**（commit `1b66676`）：`Hm`/`zm`/`Pl`/`Qm`/`TT`/`kT`/`ET` 7 个纯建构器接既有 `core.*` 键（`workflowTriggering`/`coreUpdateSuccess/Cancelled/Failed/Ended`/`noActiveLobsterSelected`/`workflowNotFound`/`enableWorkflowFailed`/`disableWorkflowFailed`/`workflowNotCreatedYet`），无新增键。重命名遮蔽 `t`：`zm(e,t)`→`zm(e,fallback)`、`ET(e,t)`→`ET(e,path)`。
- ⬜ **2c-iii 仍剩**：见上方「2c 剩余真实规模」7 个子流程 ~185 行。下步建议：schedule-setup callbacks（复用已建 `schedule.flow.*` + `on` 判别子，同域低风险）或先做机械式 2d。
- **留为业务逻辑**：`零一二三` 中文数字 map（parse 用）、`QT` 跳过 token set（`略過`/`skip`，匹配用户输入）、解析 regex、`｜`（U+FF5C 全宽分隔符，display）。
- **递延到 2d**：Pc 区 24 条 `console.*` + 1 条 `chore:` commit msg。

### 2d — console 日志 + commit msg（✅ 完成，4 批次 + 1 输入 token 补丁）

- **CJK console 日志（~108 行）→ `i18nT("log.*", {...}, glang())`**，分 4 批 commit：A `83dbb30`（new-flow/workspace/issue-status/branch/sync，19 键）、B `40105fa`（/edit+/new flow，21 键）、C `210aadd`（command/workflow/scheduler/template_reset，23 键）、D `8b5084d`（relay/coding-agent/auto-init/webhook，36 键）+ `6ca3e84`（coding-agent notepad-mode reason 2 键）。新增顶层 `log` 命名空间共 ~101 键，en/zh 对等。
- **关键手法：统一用 `i18nT`（module-scope alias）调用**，避免逐 site 分析 `t` 遮蔽——`i18nT` 在所有 scope 都安全。模板字面量 `` `...${x}...` `` 转成 `i18nT(key, {param: x}, glang())`，参数化 `{command}/{issue}/{event}/{reason}/{error}` 折叠重复。
- **`chore:` commit 讯息全固定英文**（2c 中 `ac387d9` 已完成，9 处；2e 复扫确认 `chore:` 行零 CJK 残留）。
- **Simplified 输入 token 补丁**（`60472e6`）：yes/no 与 skip 输入判别器原只认繁体 `啟用`/`略過`，zh-CN 用户打简体 `启用`/`略过` 会漏判；additive 加入简体变体（无移除、无回归）。
- **非 Telegram 路径**（cron、GitHub webhook）`glang()` 回传 `"en"` —— 可接受，这些日志英文即可。

### 2e — 收尾（✅ 完成，commit `ebf3a20`）

- **raw+escape 双侦测 CJK 扫描**：业务码残留 **40 行，全部 KEEP**（内容匹配 regex `执行小龙虾任务`/`已过|晚于现在`/`每\s*\d+\s*分`/`图片|image|photo`/`技能\s+\*\*`/`来自：|From:`/`技能(?:安装|移除)`/`范本同步|范本安装`；输入判别 map `是/否/啟用/启用/停用`；中文数字 `零一二…十`；skip set `略過/略过/skip`；zh 标点 `、：｜` 分隔符；刻意保留的 Simplified AI prompt 范例 L13787-88）。无遗漏的真实用户面向字串。
- **JSON parity**：recursive flatten 808 = 808 leaf；**placeholder 对等零 mismatch**（修复 1 处 pre-existing bug：en `core.dispatchFailed` 原写 `[name]` 非 `{name}`，英文渲染会留 literal token → 改 `[{name}]`）。
- **`npm run build`** 重建 `GitHubClawCore/index.js`（629,928 bytes）。本文件已更新。
- **结论：i18n 迁移全部完成。** 当前 bundle = 完全 i18n 化、行为不变的稳定基线，可作 from-scratch 重写的行为对照。

---

## 4. 关键技术决策（vendor 抽离手法，阶段 A）

1. **vendor 抽换用 shim 保留语义**：npm 包 API 不完全一致时（content-type 1.x 无 `safeParse`），写 thin shim 弥补，不强行换 bundle 内的实现细节。
2. **业务模组抽离用「命名导出 + 混淆名 alias」**：让所有现有调用点不动（`var Gt = WorkflowNotifications.Gt`），避免改 20+ 处引用。处理 bundle 反混淆代码的关键手法。
3. **esbuild `platform: "neutral"` 不读 `main` field**：直接用相对路径 `import nacl from "tweetnacl/nacl-fast.js"`，并用 `alias: { crypto: empty.js }` 解决 tweetnacl 的 `require('crypto')` Node fallback（Workers 用 `self.crypto`，fallback 走不到）。
4. **护栏用 esbuild test bundle 而非 wrangler**：纯 Node 跑 `dr.fetch(req, mockEnv, ctx)`，不依赖 Cloudflare account，CI 友好。`wrangler dev --local` 作为二次验证。

---

## 5. 模组抽离 / 重写路线图（阶段 A 续 — ⏸️ 暂缓 / 存档，大概率不做）

> 用户决定大概率跳过此线（反正要 from-scratch 重写）。下列内容仅作存档参考，**不排进度、不优先**。如未来改主意可重启。现役主线是 i18n（§3）→ from-scratch。

### 重大修正：`Et` (grammY) 区块的真实构成

之前 MODULE_MAP 把 ~117..4863 整块标为「grammY VENDOR」，实际**标注错误**：

- 真正属于 grammY：`F` (InlineKeyboard class) + `Ge`/`rr`/`Uo` 等 ~5-8 个 API 函数 + `Ie`/`Ve` 两个 `__esm` init 块 + `ot`/`os`/`se`/`is`/`Fo`/`$o` 等几个 class（Bot/Composer/Context/Error）。
- **被错放在 et 标注内的业务代码**：`Lt`/`tr`/`wr`/`hr`/`La`/`ja`/`Bo`/`Uo`/`ip`/`ap`/`sp`/`np`/`tp`/`ep`/`Yd`/`Vd`/`Xd`/`Zd`/`Jd`/`Kd`/`Wd`/`Qd`/`Ud`/`Bd`/`Hd` 等约 **35 个 keyboard builder 函数** —— 纯业务，用 `new F().text(t("kb.xxx"), "callback_data").row()` 组装项目专属回复键盘，与 grammY 内部无关，只依赖 `F`。
- `Am` (Telegram new/edit flow) 依赖被高估：搬走 builders 后真正外部依赖从 ~80 降到 ~20。

### Step 1: 抽离 keyboard builders（低风险高收益，**推荐先做**）

- 新建 `src/modules/telegram-keyboards.js`，搬 ~35 个 builder，只依赖 `F` + `t()` + `glang()`；同步把 `F` 换成 `import { InlineKeyboard as F } from "grammy"`（先 `npm install grammy`）。
- 收益：砍掉 et 区块 ~600-800 行 + 给 Am 抽离扫清一半依赖。风险低（纯函数无状态）。验证：现有护栏 + 1-2 个 keyboard 结构单元测试。

### Step 2: 加 Telegram 命令路由护栏 — ✅ **已完成（Phase 1.2）**

（原为中风险前置条件；现已由 Phase 1 的 8 个 Telegram/cron/AI 护栏覆盖，14/14 全绿。）

### Step 3: grammY 核心 API 替换（`Ge`/`rr`/`Uo` 等）

- 逐个 mapping bundle 内命名 → grammY 哪个导出，查签名一致性；写 `src/modules/grammy-shim.js` 兼容版本差异；保留 `Ie()`/`Ve()` init 钩子或重写 `__esm` init 链。
- 风险：中（版本漂移是主要不确定性，Telegram 护栏能挡回归）。前置调查：查 bundle 内 grammY 版本标记或对比 npm 历史 API 形态。

### Step 4: `Am` (Telegram new/edit flow) 抽离（依赖 Step 1）

- 搬 ~2,300 行 / 63 个函数到 `src/modules/telegram-new-flow.js`，用「命名导出 + 混淆名 alias」（同 Sa）。
- 风险：中（2,300 行一次搬有出错面，可按 state machine 分段，`Ms`/`di` state 子模组先搬）。

### Step 5（可选）: `Pc` 拆分

- @octokit 部分 → npm `@octokit/*`；AI workflow 参数推断 → `src/modules/ai-workflow.js`。工程量中等、收益相对小（octokit API 稳定）。

### 成功率评估

| 任务                                            | 成功率 |
| ----------------------------------------------- | ------ |
| keyboard builders 抽离                          | 90%    |
| `F` (InlineKeyboard) → npm grammY            | 90%    |
| `Ge`/`rr` 等 ~5 grammY API                  | 70%    |
| grammY Bot/Composer/Context 核心                | 60%    |
| 整体 grammY 替换（需先 Telegram 护栏，✅ 已加） | 75%    |
| `Am` 抽离（分段后）                           | 85%    |
| `Pc` 拆分                                     | 70%    |

### 风险清单

1. **grammY 版本漂移**：bundle 内版本未知，npm 最新 1.45.1；若 `composer.on`/`BotError`/`bot.api` 命名有改，运行时才暴露。
2. ~~Telegram 路由零护栏~~ → **已补**（Phase 1.2，14 护栏含 Telegram 命令/cron/AI）。
3. **`Pc` 是 vendor+biz 混合**：@octokit 可换 npm，AI workflow 是业务，夹在同一 `__esm` 块，拆分要小心边界。
4. **bundle 内 `__esm` init 链**：`Ie()`/`Ve()` 被其他业务模块 init 块调用（`var Im = Oe(() => { Ie(); Ve(); km(); Ms(); })`），替换 grammY 时要保留或重写这些 init 钩子，否则惰性加载顺序会崩。

### 关键文件索引（阶段 A 产出）

- `src/modules/content-type-shim.js` — content-type safeParse/defaultContentType 语义补全
- `src/modules/tweetnacl-shim.js` — tweetnacl 默认导出包装
- `src/modules/empty.js` — esbuild `alias: { crypto: empty.js }` 占位
- `src/modules/workflow-notifications.js` — Sa CRUD 模组（命名导出 + 混淆名 alias 双轨）
- `test/guardrails.mjs` + `test/lib/mock.mjs` — 护栏 + mock 基础设施（14 测试）
- `.github/workflows/guardrails.yml` — CI 自动跑护栏
- `build.mjs` — 加了 `alias: { crypto }`

---

## 6. 关键发现与教训（i18n 迁移，Phase 2）

### 6.1 `t` 遮蔽风险（shadowing hazard）

bundle 大量用 `t` 作普通局部变数（message text、params、conclusion、status、owner、path-prefix、chatId、requestId、issueNum、flow type、config、file object…），**遮蔽模组层 i18n `t`**（L12 `function t(key, params={}, lang="en")`）。**加 `t(...)` 调用前必须先重命名遮蔽的 `t`**，否则调用打到遮蔽物 → TypeError / 行为错误。

- 2b 处理：Mf `t`→`flow`、media handlers `t`→`ph/vc/vd/au/doc`、TE `t`→`url`、ug `t`→`env`。
- 历史教训（来自旧 currentWorks.md）：9 个真实生产 bug，6 个是 shadowed `t()` 导致的 crash-causing `TypeError`，build 时不报、运行时才炸。

### 6.2 既有反向工程 artifact：`Ys`/`Nk` 的 `t_msg`/`t_file`

`Ys(e, t_msg)` 与 `Nk(e, t_file, r)` 参数名为 `t_msg`/`t_file`，但函式主体一律用 `t` —— `t(...)` 是模组 i18n（可运作，见既有的 `t("core.mediaNotAccepted")`），而 `t.field`/`t.fileId` 等读到 i18n 函式属性 = `undefined`。**即 media-upload 经由 Ys/Nk 的 file-object 存取目前是坏的**。为反向工程格式化（commit `8999065`）遗留，与字串迁移无关，护栏未覆盖 media 路径故未显现。**判定：不在 i18n 迁移中修复，留给从重写阶段处理。**

### 6.3 CJK 扫描器必须 raw + escape 双侦测

- 太窄的 hex regex（`/\\u(4[0-9a-f]{3}|9[0-8][0-9a-f]{2})/`）只匹配 4xxx 与 9xxx-98xx，**漏掉 5xxx-8xxx**（多数常用 CJK：技=6280、能=555F、已=5DF2、附=9644）。
- **只解 `\uXXXX`/`\u{...}` escape 的扫描器会漏掉 decoded CJK** —— body-file+splicer 模式会把递延的 console 字串写成 decoded CJK（真实字元）以避开 Write 工具的 `\u` escape 处理歧义。
- 正解（`/tmp/cjk_scan2.js`）：codepoint range 0x4E00-0x9FFF / 0xFF00-0xFFEF / 0x3400-0x4DBF，**同时**扫 raw 字元与解 escape。

### 6.4 braced escape `\u{...}` Edit 匹配问题

- 4-hex `\uXXXX`：Edit 工具会 normalize，decoded-CJK 的 old_string 可匹配。
- braced `\u{1F916}`/`\u{1F4AC}`/`\u{1F99E}`：**不会 normalize**，decoded old_string 匹配失败 → 用 body-file + node splicer 处理含 braced emoji 的区块。
- **解法**：把 emoji/文字移入 JSON value（literal UTF-8），index.js 调用点变 ASCII `t(...)`，绕开 braced-escape 匹配问题。

### 6.5 可靠迁移模式：body-file + node splicer

- Write 写 body file（literal 内容、无 escape 问题）。
- node splicer bottom-up（最高行先替换避免行号位移），验证 start-signature + column-0 end-brace（`/^}$/`，**不可**用 `/^\s*\}\s*$/` —— 会误配 indented 内层 catch-block brace，导致 off-by-one stray `}`）。
- 用于多行 template-literal 函式（Oi/lu/Jf/Zs/Hf/zf/CE/RE/su.on/media/Mf/TE/ug）。
- 含递延行的函式：scoped 单行编辑保留 byte-identical，或写成 decoded CJK（功能相同、2d 仍会抓到）。

### 6.6 JSON value 避内嵌换行/引号

- welcomeReady 拆成 `welcomeReady1`+`welcomeReady2` 两个 key，调用点 `+"\n"+` 串接 —— 避免 JSON value 内嵌 `\n` 的 Write 工具 escape 歧义。
- autoInitCreated 英文版用 `[{title}]`（方括号）替代 `\"{title}\"` —— 避免引号 escape。

---

## 7. 验证流程（每阶段后执行）

1. `npm run check` — bundle 完整性（default export + fetch handler、size delta 合理、无重复 key 警告）。
2. `npm run test:guardrails` — 14 护栏全绿（**迁移安全信号**：结构断言抓 5xx / 缺回复 / 控制流破坏 / 未解析 `t()` key 泄漏成 dotted path）。
3. JSON parity check — en/zh leaf-key 集完全一致。
4. CJK scan — raw+escape 双侦测，迁移区块零 CJK（递延项除外）。
5. `npm run build` — 仅 2e 末步，产出 `GitHubClawCore/index.js`。
6. （可选）`wrangler dev --local` 二次验证：6 端点逐字节比对 main 基线；手动 toggle `CLAW_LANGUAGE` zh-CN/en 确认渲染非 raw key path。

---

## 8. 未决问题

1. **duotify license**：README 明说源自 duotify/GitHubClaw。需确认原 license 是否允许二次自持复制 + 公开发布。Core 是 Public repo，有 license 风险需尽早处理（改 Private 或补 attribution / 联系作者）。**5 分钟可查，但一直没做。**
2. **三 repo 是否合并成 monorepo**：改一个功能常要碰两个 repo（Core + Toolkit），长期是心理负担。但是组织决策非技术决策 —— 若要对外开源让各 repo 独立贡献，分 repo 更友好。
3. **Future_Plan.md 的 access control（NextAuth + Supabase + Master Password）是否要做**：SaaS 化方向，目前 AdminPage 单用户 Private 自部署。**建议搁置直到确认要做产品**。
4. **bundle 内 grammY 版本**：需查 bundle 内版本标记或对比 npm grammY 历史版本 API 形态推断。是 §5 Step 3 的前置调查。
5. **PR #1 merge**：阶段 A 的 7 commits 待用户合并进 main，后续工作分支从干净基线起。

---

## 9. 待办与下一步

- **i18n 主线（阶段 B）：✅ 全部完成（Phase 2a-2e）。** 当前 bundle 是完全 i18n 化、行为不变的稳定基线。可作 from-scratch 重写的行为对照基准。
- **后阶段 — from-scratch 重写：** 基于锁定的行为基线，用干净源码重写 worker（与 i18n 化解耦）。先决条件已满足（护栏 + i18n 基线就绪）。**完整计划见 §10（Phase R）**。
- **模组抽离主线（阶段 A 续）：** §5 Step 1 keyboard builders 抽离（低风险高收益，与 i18n 解耦，可平行推进）—— 但用户倾向直接 from-scratch 重写，边际价值低，大概率不做。
- **遗留判定为业务逻辑、不 i18n（40 行 KEEP）：** 输入判别 map（是/否/啟用/启用/停用）、中文数字 parser（零一二…十）、skip set（略過/略过/skip）、内容匹配 regex（`/(图片|image|photo)/`、`/执行小龙虾任务/`、`/已过|晚于现在/`、`/每\s*\d+\s*分/`、`/技能\s+\*\*/`、`/来自：|From:/`、`/技能(?:安装|移除)/`、`/范本同步|范本安装/`）、zh 标点分隔符（、：｜）、刻意保留的 Simplified AI prompt 范例（L13787-88）。
- **计数已核实（2026-07-22）：** 业务码 CJK 残留 40 行（全 KEEP）；i18n leaf-key 808×2 对等；零 placeholder mismatch。

---

## 10. From-scratch 重写计划（Phase R）

### 10.0 定位与原则

- **目标**：用干净源码重写 worker —— 真正拥有代码、i18n 烤进架构、消除混淆 bundle 的「改一点坏一片」连锁脆弱。
- **不是**换技术栈、不是换部署平台。Cloudflare Workers + Hono + grammY + Octokit + D1 + Workers AI 已验证可用，保留。
- **行为契约 = 现有 14 护栏 + 重写前补的 characterization 护栏**。重写后逐条对齐基线，护栏全绿才算该子系统完成。
- **i18n = 冻结的 UI 契约**：808 leaf 键 × 2 语原样复用，不重命名、不改 value（重写中发现需新增才加，两份同步）。
- **参考而非 fork**：`src/index.js`（旧 bundle）作为行为规格读取，**不复制**其代码结构/混淆命名。
- **沿用 Phase 2 执行原则**：先护栏后重写、最低风险先做、每阶段独立交付 + 护栏验收。

### 10.1 目标架构（模块分解）

```
src-v2/
  worker.js              # entry: export { fetch, scheduled }
  config.js              # env/binding 解析（TELEGRAM_* / GITHUB_* / AI / DB）
  http/
    routes.js            # Hono app: /, /health, /github/webhook, /telegram/webhook
    github-webhook.js    # signature 验证 + event 分发
    telegram-webhook.js  # secret 验证 + path 透传
  i18n/                  # 复用现有 en.json / zh-CN.json
    index.js             # t(), glang(), getLanguage()
  telegram/
    bot.js               # grammY Bot 装配 + middleware 链
    access-guard.js      # default-deny FROM_ID / CHAT_ID
    language.js          # ctx.language / ctx.t middleware
    commands/            # /start /list /current /status /close /schedules /skills /templates /enable /disable /workflow /clear
    flows/               # new-flow.js, edit-flow.js（kv_state 状态机）
    keyboards.js         # InlineKeyboard builders（原 ~35 个）
  github/
    octokit.js           # GitHub App auth + token 缓存
    branches.js          # orphan 分支创建/重置、template 同步
    webhooks/            # issue_comment.js, workflow_run.js, installation.js
  coding-agent/
    dispatch.js          # lobster 派工（issue → workflow dispatch）
    relay.js             # issue 留言 ↔ Telegram 转送
  scheduler/
    cron.js              # scheduled() handler
    ai-parser.js         # 自然语言 → cron（Workers AI）
    crud.js              # schedules 表 CRUD
  ai/
    workflow-inputs.js   # Workers AI 推导 workflow_dispatch inputs
    prompts.js           # aiPrompt.parser.* / scheduler prompt
  db/
    d1.js                # D1 wrapper
    kv-state.js          # 流程状态
    schedules.js
    workflow-notifications.js
    album-queue.js
  media/
    relay.js             # 图片/相册转送
    album.js             # album_queue 合并
  auto-init.js           # INIT_GITHUB_CLAW repo variable + 第一只龙虾
```

### 10.2 技术栈决策（推荐）

- **保留**：Cloudflare Workers、、grammY（npm 直接装 + pin 版本）、@octokit/*、D1、Workers AI、esbuild build。
- **JS vs TypeScript**：推荐 **JS 起步**（与现有 i18n/护栏一致、低摩擦），稳定后可选升 TS。→ 待决（§10.9）。
- **部署产物不变**：仍 build 出 `GitHubClawCore/index.js`，部署契约不动。

### 10.3 仓库布局（推荐 side-by-side）

- 新代码放 `src-v2/`；旧 bundle `src/index.js` 保留作行为参考 + 仍是现役部署产物，直到 src-v2 全绿后一次性 swap。
- `build.mjs` 加 `src-v2` 入口（或新建 `build-v2.mjs`），产物先放 `GitHubClawCore/index.v2.js`，shadow 阶段不接流量。
- swap 时机：§10.8 验收全过 + 一次手动 smoke。

### 10.4 阶段分解（每阶段：写 → 护栏绿 → commit）

| Phase                                                   | 范围                                                                                                    | 验收护栏                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **R0** bootstrap                                  | wrangler.toml / build / CI 复用、空 worker`/health`、i18n 复用                                        | /health                                                                      |
| **R1** HTTP skeleton + config + D1 wrapper        | `/`, `/health`, `/github/webhook` 签名, `/telegram/webhook` secret+path                         | 4 个 HTTP 护栏                                                               |
| **R2** i18n + language middleware                 | `t()`/`glang()`、`ctx.t`、`getLanguage`                                                         | 单测：key 解析 + parity                                                      |
| **R3** Telegram skeleton + AccessGuard + 基础命令 | `/start` `/list` `/current` `/status` `/close`                                                | 5 个 Telegram 护栏                                                           |
| **R4** Telegram flows                             | `/new` `/edit` 状态机（kv_state）、keyboards                                                        | +新增 flow 护栏                                                              |
| **R5** GitHub webhooks                            | issue_comment relay + coding-agent dispatch + workflow_run + installation                               | +新增 webhook 护栏                                                           |
| **R6** Scheduler                                  | cron handler + AI 时间解析 + schedule CRUD + issue-comment 记录                                         | 2 个 cron 护栏 + 新增                                                        |
| **R7** AI workflow inputs + 其余命令              | `/clear` dispatch、`/skills` `/templates` `/enable` `/disable` `/workflow`、Workers AI 推导 | AI 护栏 + 新增                                                               |
| **R8** Media relay + album queue                  | 图片/相册转送、album_queue                                                                              | +新增 media 护栏（**顺带修 §6.2 Ys/Nk `t_msg`/`t_file` 旧 bug**） |
| **R9** auto-init + 全量 parity + smoke            | INIT_GITHUB_CLAW、第一只龙虾；全护栏 +`wrangler dev` smoke + `CLAW_LANGUAGE` toggle                 | 全 14+ 全绿                                                                  |

### 10.5 护栏先行（characterization tests — 重写安全性的关键杠杆）

- **重写前先补护栏锁行为**：对即将重写的子系统，先在**旧 bundle** 上加 characterization 护栏（结构断言、不绑死字串），把当前行为钉死，再重写到绿。
- 现有 14 护栏已覆盖：HTTP 路由、Telegram 命令（/list /current）、cron 空态/有 due 行、AI no-AI fallback。
- **优先补的护栏**（现未覆盖）：media 路径、`/new` `/edit` 完整状态机往返、`/skills` `/templates` 装设、workflow_run 三态、installation welcome、auto-init、`/clear` dispatch。
- 护栏覆盖越全，行为漂移风险越低 —— 这一步是 Phase R 安全性的核心，不可跳。

### 10.6 i18n 复用

- `src-v2/i18n/en.json` / `zh-CN.json` = 现有 808 键副本（`git mv` 或 copy），调用约定不变 `t(key, params, lang)` + `glang()`。
- KEEP 业务逻辑随对应模组重写（regex / 中文数字 / 输入 token / skip set），保持 zh-CN+en 输入兼容（沿用已加的简体 `启用`/`略过`）。
- 重写中若需新 key：两份 JSON 同步加，保 leaf 对等（沿用 Phase 2 规范）。

### 10.7 风险与对策

1. **行为漂移**（最大风险）→ 护栏先行 + 每阶段护栏全绿才推进；旧 bundle 保留可随时比对。
2. **护栏未覆盖路径**（media 已知坏、部分命令）→ §10.5 先补 characterization 护栏；重写时顺带修旧 bug，并明确记录「行为变更」而非「对齐」。
3. **grammY 版本漂移**：npm 直接装、pin 版本；用 Telegram 护栏挡 API 漂移。
4. **lobster 语义逐字节保留**：orphan 分支、template、workflow name `🦞 Execute Lobster Task #${n}`、issue↔Telegram meta —— 写成常量 + 护栏断言。
5. **D1 schema 不改**：kv_state / schedules / workflow_notifications / album_queue 保数据兼容。
6. **secret / AccessGuard**：default-deny 语义保留，护栏已覆盖。

### 10.8 验收标准（swap gate）

- 全部 14 + 新增 characterization 护栏绿。
- `npm run check` + `npm run build`（src-v2 入口）绿。
- i18n parity 808×2（或新数）对等、零 placeholder mismatch。
- `wrangler dev --local` 手动 smoke：6 端点 + 一轮 `/new → dispatch → comment relay`；toggle `CLAW_LANGUAGE` zh-CN/en 渲染正确。
- （可选）与旧 bundle 输出逐字节 shadow 比对。
- swap：`src-v2` → `src`，旧 bundle 归档到 `src-legacy/`。

### 10.9 待决问题（开工前定）

1. **JS vs TypeScript**：推荐 JS 起步，TS 作稳定后可选升级。
2. **side-by-side vs in-place**：推荐 side-by-side（`src-v2/`），旧 bundle 作参考 + 现役部署直到 swap。
3. **护栏扩展力度**：是否在 R0 前先做一轮纯 characterization 护栏扩展（不改旧 bundle 逻辑，只加测试）？**推荐是**。
4. **grammY 版本 pin**：开工时查 npm 最新稳定版并 pin。
5. **是否保留 esbuild**：推荐保留（部署产物契约不变）；如换 Vite / npm 直接上 Workers 也可，但增加变量。
