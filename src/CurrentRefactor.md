# 重构进度总览（CurrentRefactor）

> 本文件是 `altShiftClawCore` 重构的**唯一状态入口**，整合两条工作线：模组抽离（vendor extraction）+ i18n 完整化。
> 与 `src/MODULE_MAP.md`（模组识别）互为补充：MODULE_MAP 回答「这是什么模组」；本文回答「重构做到哪、还剩什么、踩过什么坑」。
> 最后更新：2026-07-21（Phase 2b 完成；合并原父目录 `CurrentRefactor.md` / `currentWorks*.md`）

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

| 阶段 | 范围 | 状态 | 关键产出/commit |
|---|---|---|---|
| **A0** vendor 抽离 | `kc`(content-type)/`df`(tweetnacl)/`cf` → npm + shim；`Sa`(workflow_notifications) → module | ✅ 完成 | `6252e9e` `b60edf5` `47e0fbc` 等 7 commits |
| **A1** e2e 护栏 v1 | 6 个 HTTP 路由护栏 + Sa CRUD round-trip | ✅ 完成 | `b5f80aa` |
| **A2** CI | `.github/workflows/guardrails.yml` 自动跑 check + guardrails | ✅ 完成 | `f63eba2` |
| **Phase 0** | 合并 PR #1（vendor-extraction → main） | ⏳ 待用户操作（PR `MERGEABLE`） | PR #1 |
| **Phase 1.1** | `test/lib/mock.mjs` mock 基础设施（fetch/D1/AI） | ✅ 完成 | — |
| **Phase 1.2** | +8 护栏（Telegram 命令/cron/AI） | ✅ 完成 | — |
| **Phase 1.3** | 护栏全绿 + check + commit | ✅ 完成 | — |
| **Phase 2a** | Et 尾 + 业务 helper + router 字串 | ✅ 完成 | `c4096b9` `4f58fff` `d6ca852` `8034a73` `1f0d129` `b8f8307` `40478db` `8dee9b1` |
| **Phase 2b** | Hl Telegram 装设/安装流程 | ✅ 完成 | `5715c96` |
| **Phase 2c** | Pc AI/octokit（含 error-code 重构） | 🔄 进行中（2c-i/2c-ii/2c-iii 核心已完成；close-confirm/reset-template 待续） | `3253c2a` `bd1f075` `0b0e309` |
| **Phase 2d** | console 日志 i18n + commit msg 固定英文 | ⬜ 待开始（机械式） | — |
| **Phase 2e** | parity check + rebuild bundle + 收尾文档 | ⬜ 待开始 | — |
| **A 续** | keyboard builders 抽离 / grammY 替换 / Am 抽离 / Pc 拆分 | ⏸️ **暂缓**（大概率不做，见 §5 存档） | — |

**量化（最新）：** `src/index.js` 22,805 → **20,249 行**；bundle 605,818 → **616,696 bytes**（i18n t() 调用 + key 占用）；i18n key 对等 533 → **625**（en = zh）；护栏 6 → **14/14 全绿**；`src/modules/` 4 文件（content-type-shim / tweetnacl-shim / empty / workflow-notifications）。

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
- **留为业务逻辑**：`零一二三` 中文数字 map（parse 用）、解析 regex、`｜`（U+FF5C 全宽分隔符，display）。
- **递延到 2d**：Pc 区 24 条 `console.*` + 1 条 `chore:` commit msg。

### 2d — console 日志 + commit msg（待开始，机械式）
- **CJK console 日志**（~50+ 行，6xxx-8xxx、19xxx-20xxx）→ `t("log.*", {...}, glang())`。注意：非 Telegram 路径（cron、GitHub webhook）中 `globalThis.globalLanguage` 未设 → `glang()` 回传 `"en"`（可接受，需确认这些路径的日志语言）。
- **11 个 `chore:` commit 讯息** → 固定英文（audit trail，不应随请求语言变）。位置：L6164/6184/6993/7325/7344/7434/7471/19506… → 如 `chore: init issue #{n} orphan branch (template: {tpl})`。
- 2b 遗留：ug 两行 console（已写成 decoded CJK 待处理）。

### 2e — 收尾（待开始）
- 用 **raw+escape 双侦测** CJK 扫描器确认业务码零残留（vendor grammY/octokit 的 library 字串不计；唯一合理剩余是解析 regex / 对英数字面值的 `.includes` 与中文数字 map 等业务逻辑）。
- 确认 `zh-CN.json` 与 `en.json` key 集完全一致（recursive flatten parity check）。
- `npm run build` 重建 `GitHubClawCore/index.js`。更新 `MODULE_MAP.md` + 本文件。

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
| 任务 | 成功率 |
|---|---|
| keyboard builders 抽离 | 90% |
| `F` (InlineKeyboard) → npm grammY | 90% |
| `Ge`/`rr` 等 ~5 grammY API | 70% |
| grammY Bot/Composer/Context 核心 | 60% |
| 整体 grammY 替换（需先 Telegram 护栏，✅ 已加） | 75% |
| `Am` 抽离（分段后） | 85% |
| `Pc` 拆分 | 70% |

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
- **i18n 主线（阶段 B）：** Phase 2c（建议下步，最大且高风险，单独 session 起头：先 error-code 重构 2c-i，再 AI prompts 2c-ii，最后回复建构器 2c-iii，可拆 3 commit）；或先做机械式 Phase 2d（快速见效）。
- **模组抽离主线（阶段 A 续）：** §5 Step 1 keyboard builders 抽离（低风险高收益，与 i18n 解耦，可平行推进）。
- **遗留判定为业务逻辑、不 i18n：** L7028/7030/7038/7039 是/否/停 boolean 阵列（用户输入值匹配）、解析 regex（`/(图片|image|photo)/` 等）。
- **记忆待修正：** i18n 残留计数（401/282 vs 680）不确定，2e 时以双侦测扫描器重新精确计数。