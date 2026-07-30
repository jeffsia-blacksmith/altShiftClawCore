# altShiftClawCore 系统架构报告

> **Phase R 从头重写 — 完整逆向工程报告**
> 分支：`phase-r/refactor` | 日期：2026-07-30
> 源码：8,215 行 / 54 文件 | 构建：661KB | 审计：132/132 项修复

---

## 一、项目概述

altShiftClawCore 是一个部署在 **Cloudflare Workers** 上的 Telegram Bot + GitHub 集成系统。它将 GitHub Issues 作为「龙虾（Lobster）」任务单元，通过 Telegram 统一交互——创建任务、编辑配置、安装技能/模板、排程触发、媒体转送、AI 工作流派工等。

**旧代码**是 20,195 行的 esbuild 混淆 bundle（`src/index.js`），无法维护。**Phase R** 将其从头重写为干净的模块化源码（`src-v2/`），经过 4 轮深度审计（18 个并行 Agent），132 项行为对等修复，达到功能 100% 对等。

---

## 二、技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| 运行时 | Cloudflare Workers | — |
| HTTP 框架 | Hono | 4.12.32 |
| Telegram Bot | grammY | 1.45.1 |
| GitHub API | Octokit | 5.0.5 |
| GitHub Webhook | @octokit/webhooks | 14.2.0 |
| 数据库 | Cloudflare D1 (SQLite) | — |
| AI | Workers AI binding | — |
| 加密 | tweetnacl (libsodium) | ^1.0.3 |
| 构建 | esbuild | ^0.24.0 |
| i18n | 自建 (en.json / zh-CN.json) | 813 keys × 2 |

---

## 三、系统架构总览

```mermaid
graph TB
    subgraph "Cloudflare Worker"
        Worker["worker.js<br/>入口: fetch + scheduled"]

        subgraph "HTTP 层 (Hono)"
            Routes["routes.js<br/>路由装配"]
            GHWebhook["github-webhook.js<br/>签名验证"]
            TGWebhook["telegram-webhook.js<br/>Secret 验证"]
        end

        subgraph "Telegram Bot (grammY)"
            Bot["bot.js<br/>中间件链"]
            AccessGuard["access-guard.js<br/>访问控制"]
            Commands["17 个命令"]
            Flows["多步状态机流程"]
            Media["媒体处理"]
        end

        subgraph "GitHub 集成"
            Branches["branches.js<br/>分支/模板/workflow"]
            Secrets["secrets.js<br/>加密写入"]
            Webhooks["7 个 Webhook 事件"]
            Dispatch["dispatch.js<br/>Coding-Agent 派工"]
        end

        subgraph "数据层"
            D1["D1 数据库"]
            KV["KV Store (D1 facade)"]
            Schedules["schedules.js<br/>排程 CRUD"]
            KVState["kv-state.js<br/>流程状态"]
        end

        subgraph "调度器"
            Cron["cron.js<br/>scheduled() 处理"]
        end

        subgraph "i18n"
            I18n["index.js<br/>t() / glang()"]
            Log["log.js<br/>102 个结构化日志 key"]
        end
    end

    subgraph "外部服务"
        TG["Telegram API"]
        GHA["GitHub Actions"]
        GHAPI["GitHub API"]
        WAI["Workers AI"]
    end

    Worker --> Routes
    Routes -->|GET / /health| Routes
    Routes -->|POST /github/webhook| GHWebhook
    Routes -->|POST *| TGWebhook
    Routes -->|GET /api/active-issue| KV

    GHWebhook --> Webhooks
    TGWebhook --> Bot

    Bot --> AccessGuard --> Commands --> Flows --> Media
    Commands --> Branches
    Flows --> Branches
    Flows --> Secrets
    Flows --> Schedules
    Flows --> KVState

    Webhooks --> Dispatch
    Webhooks --> Bot
    Dispatch --> GHA

    Cron --> Schedules
    Cron --> Dispatch

    Bot --> TG
    Webhooks --> TG
    Branches --> GHAPI
    Secrets --> GHAPI
    Dispatch --> GHAPI
    Commands --> WAI

    D1 --> KV
    KV --> KVState
    KV --> Schedules
```

---

## 四、HTTP 请求流转

```mermaid
flowchart LR
    subgraph 请求入口
        REQ["HTTP 请求"]
    end

    subgraph "中间件链 (顺序执行)"
        M1["① config 中间件<br/>buildConfig(env)"]
        M2["② 服务中间件<br/>D1 migration + octokit + store + ai"]
        M3["③ 语言中间件<br/>getLanguage → ctx.language"]
    end

    subgraph 路由匹配
        R1["GET / → 健康检查"]
        R2["GET /health → 健康检查"]
        R3["POST /github/webhook → GitHub 签名验证"]
        R4["GET /api/active-issue → 查询活跃龙虾"]
        R5["POST * → Telegram Webhook"]
    end

    REQ --> M1 --> M2 --> M3
    M3 --> R1
    M3 --> R2
    M3 --> R3
    M3 --> R4
    M3 --> R5

    R3 -->|验证通过| GHEVENT["GitHub Webhook 事件分发"]
    R5 -->|Secret 验证 + 路径匹配| BOT["grammY Bot.handleUpdate"]
```

---

## 五、Telegram Bot 中间件链

```mermaid
flowchart TB
    UPDATE["Telegram Update"]

    subgraph "① 访问控制 (access-guard.js)"
        AG["默认拒绝策略<br/>检查 FROM_ID / CHAT_ID / 消息长度"]
    end

    subgraph "② 服务注入 (bot.js)"
        SVC["ctx.services = {octokit, store, d1, ai, config}<br/>ctx.language = getLanguage()<br/>ctx.t = i18nT()"]
    end

    subgraph "③ 命令 + 回调路由 (Composer)"
        CMD["17 个 slash 命令"]
        CB["62 个 callbackQuery 回调"]
        MENUCB["8 个 command_menu 回调"]
    end

    subgraph "④ message:text 续接链"
        T1["handleLlmText<br/>(LLM API Key / Model 输入)"]
        T2["handleSkillEnvText<br/>(技能环境变量收集)"]
        T3["handleTemplateEnvText<br/>(模板环境变量收集)"]
        T4["handleFlowText<br/>(/new 流程)"]
        T5["handleEditText<br/>(/edit 流程)"]
        T6["handleScheduleText<br/>(排程流程)"]
        T7["handleLineText<br/>(LINE Bot 配置)"]
        T8["handleCommentOnIssue<br/>(默认：转送 issue 评论)"]
        T9["handleNaturalLanguageCommand<br/>(AI 工作流派工)"]
    end

    subgraph "⑤ 媒体处理"
        MEDIA["photo (单条+相册)<br/>voice / video / audio / document"]
    end

    subgraph "⑥ 全局错误捕获"
        CATCH["bot.catch<br/>回复 ❌ + core.unknownError"]
    end

    UPDATE --> AG --> SVC --> CMD --> CB --> MENUCB
    CMD -.->|"非命令文本"| T1
    T1 -->|false| T2 -->|false| T3 -->|false| T4 -->|false| T5
    T5 -->|false| T6 -->|false| T7 -->|false| T8 -->|false| T9
    CMD -.->|"媒体消息"| MEDIA
    CATCH -.->|"任何未捕获错误"| CATCH
```

---

## 六、GitHub Webhook 事件流转

```mermaid
flowchart TB
    subgraph "GitHub Webhook 入口"
        SIGN["签名验证<br/>(@octokit/webhooks)"]
    end

    subgraph "7 个事件处理器"
        E1["installation.created<br/>→ 自动初始化"]
        E2["issues.opened<br/>→ 日志记录"]
        E3["issue_comment.created<br/>→ 转送 + 派工"]
        E4["issue_comment.edited<br/>→ 转送 + 派工"]
        E5["workflow_run.requested<br/>→ D1 记录更新"]
        E6["workflow_run.in_progress<br/>→ D1 记录更新"]
        E7["workflow_run.completed<br/>→ Telegram 通知"]
    end

    subgraph "自动初始化 (installation.created)"
        AI1["创建第一个 Issue (龙虾)"]
        AI2["创建 orphan 分支 issue-N"]
        AI3["写入 workflow yml"]
        AI4["D1 记录 issue_metadata"]
        AI5["设置 INIT_GITHUB_CLAW=false<br/>Repo Variable"]
        AI6["发送欢迎消息到 Telegram"]
    end

    subgraph "评论转送 (issue_comment)"
        RC1["跳过条件检查<br/>(bot echo / line / schedule)"]
        RC2["解析 telegram-meta → chat_id"]
        RC3["转送到 Telegram<br/>(含图片检测 + MarkdownV2)"]
        RC4["Coding-Agent 派工<br/>(检查 branch + workflow)"]
    end

    subgraph "Workflow 完成通知"
        WN1["查询 D1 notification<br/>(by request_id / run_id)"]
        WN2["匹配 workflow 类型<br/>(autoupdate/skills/templates/lineBot)"]
        WN3["发送 Telegram 通知<br/>(MarkdownV2 转义)"]
        WN4["skills 成功 → 建 issue 评论"]
        WN5["line-bot 成功 → 发送 post-install 键盘"]
    end

    SIGN --> E1 & E2 & E3 & E4 & E5 & E6 & E7

    E1 --> AI1 --> AI2 --> AI3 --> AI4 --> AI5 --> AI6
    E3 --> RC1 --> RC2 --> RC3
    E3 --> RC4
    E4 --> RC1
    E7 --> WN1 --> WN2 --> WN3
    WN3 --> WN4
    WN3 --> WN5
```

---

## 七、Coding-Agent 派工流程

```mermaid
flowchart TB
    COMMENT["GitHub Issue 评论<br/>(人类发送)"]

    subgraph "派工门控 (dispatch.js)"
        G1["isSystemComment?<br/>跳过 brain-result/tool-run/line-meta"]
        G2["isScheduleFlowRecord?<br/>跳过排程记录"]
        G3["hasCommentMeta?<br/>需要 telegram-meta 标记"]
        G4["isMediaPending?<br/>跳过未完成的媒体"]
        G5["stripToUserMessage<br/>提取纯用户消息"]
        G6["checkAcceptsDispatch<br/>检查 branch + workflow + enabled"]
    end

    subgraph "派工执行"
        D1["提取 requestTelegramMeta"]
        D2["创建 progress comment<br/>(githubclaw-brain-result 标记)"]
        D3["构建 dispatch inputs<br/>(issue_number, comment_id, event_source...)"]
        D4["createWorkflowDispatch<br/>→ issue-N.yml"]
    end

    subgraph "错误处理"
        E1["not found → 删除 progress comment"]
        E2["disabled → 回复 restingMessage"]
        E3["其他 → 回复 dispatchFailed"]
    end

    COMMENT --> G1 -->|否| G2 -->|否| G3 -->|有 meta| G4 -->|否| G5 --> G6
    G6 -->|通过| D1 --> D2 --> D3 --> D4
    D4 -->|成功| OK["✅ 派工完成"]
    D4 -->|失败| E1 & E2 & E3
```

---

## 八、排程系统 (Schedule)

```mermaid
flowchart TB
    subgraph "排程创建流程 (Telegram)"
        S1["/set_schedule 回调<br/>→ awaiting_prompt"]
        S2["用户输入任务描述<br/>→ awaiting_time"]
        S3["AI 时间解析<br/>(Workers AI + fallback)"]
        S4["用户输入 payload<br/>→ createSchedule"]
        S5["onScheduleAction<br/>建 issue comment + 发 config card + status card"]
    end

    subgraph "computeNextRun (10+ 规则类型)"
        NR1["once → 固定时间"]
        NR2["every_N_minutes → +N 分钟"]
        NR3["interval → +N 分钟"]
        NR4["minutely → 对齐分钟"]
        NR5["daily → 每天指定时刻"]
        NR6["hourly → 每小时指定分"]
        NR7["weekly → 指定星期几"]
        NR8["weekday → 周一到周五"]
        NR9["weekenday → 周六周日"]
        NR10["cron → 完整 cron 表达式解析"]
    end

    subgraph "Cron 定时处理 (scheduled handler)"
        C1["fetchDueSchedules<br/>查询到期排程"]
        C2["acquireScheduleLock<br/>5 分钟锁"]
        C3["建 issue 评论<br/>+ 写 user.md artifact"]
        C4["computeNextRunState<br/>计算下次运行"]
        C5["persistScheduleRun<br/>更新 D1 + 释放锁"]
    end

    S1 --> S2 --> S3 --> S4 --> S5

    S3 --> NR1 & NR2 & NR3 & NR4 & NR5 & NR6 & NR7 & NR8 & NR9 & NR10

    C1 --> C2 --> C3 --> C4 --> C5
    C4 --> NR1 & NR2 & NR3 & NR4 & NR5 & NR6 & NR7 & NR8 & NR9 & NR10
```

---

## 九、数据模型

```mermaid
erDiagram
    schedules {
        TEXT id PK
        TEXT repo
        INTEGER issue_number
        INTEGER chat_id
        TEXT prompt
        TEXT event_data
        TEXT rule_type
        TEXT rule_payload
        TEXT timezone
        TEXT next_run_at
        INTEGER should_notify
        TEXT status
        TEXT last_run_at
        TEXT last_error
        TEXT locked_until
        TEXT cancelled_at
        TEXT created_at
        TEXT updated_at
    }

    kv_state {
        TEXT key PK
        TEXT value
        TEXT expires_at
        TEXT updated_at
    }

    issue_metadata {
        TEXT repo
        INTEGER issue_number
        TEXT template
        TEXT created_at
        TEXT updated_at
    }

    workflow_notifications {
        TEXT id PK
        TEXT request_id UK
        TEXT repo
        TEXT workflow_name
        TEXT workflow_path
        TEXT title
        TEXT channel
        TEXT chat_id
        TEXT message_id
        TEXT event_name
        TEXT status
        TEXT conclusion
        INTEGER workflow_run_id
        TEXT source_type
        TEXT source_id
        TEXT payload_json
        TEXT created_at
        TEXT updated_at
    }

    album_queue {
        TEXT media_group_id PK
        INTEGER message_id
        TEXT file_id
        TEXT chat_id
        TEXT caption
        TEXT file_ref
        TEXT created_at
    }

    schedules ||--o{ kv_state : "chat_id 关联"
    workflow_notifications }o--|| schedules : "request_id 关联"
```

---

## 十、模块依赖关系

```mermaid
flowchart TB
    subgraph "入口层"
        WORKER["worker.js"]
    end

    subgraph "HTTP 层"
        ROUTES["http/routes.js"]
        GHW["http/github-webhook.js"]
        TGW["http/telegram-webhook.js"]
    end

    subgraph "配置 + i18n"
        CONFIG["config.js"]
        I18N["i18n/index.js"]
        LANG["i18n/language.js"]
        LOG["i18n/log.js"]
    end

    subgraph "数据层"
        D1["db/d1.js"]
        KV["db/kv-state.js"]
        SCHED["db/schedules.js"]
    end

    subgraph "GitHub 层"
        OCTO["github/octokit.js"]
        BRANCH["github/branches.js"]
        SECRET["github/secrets.js"]
        WH_INDEX["github/webhooks/index.js"]
        WH_INST["github/webhooks/installation.js"]
        WH_IC["github/webhooks/issue-comment.js"]
        WH_WR["github/webhooks/workflow-run.js"]
        WH_META["github/webhooks/meta.js"]
    end

    subgraph "Telegram 层"
        BOT["telegram/bot.js"]
        GUARD["telegram/access-guard.js"]
        STATUS["telegram/status-card.js"]
        COMMENT["telegram/comment-on-issue.js"]
        AI_INF["telegram/ai-inference.js"]
        EDGE["telegram/edge-replies.js"]
        MARKDOWN["telegram/markdown.js"]
        KEYBOARD["telegram/keyboards.js"]
    end

    subgraph "命令层"
        CMD_START["commands/start.js"]
        CMD_LIST["commands/list.js"]
        CMD_HELP["commands/help.js"]
        CMD_OTHER["commands/*.js (14个)"]
    end

    subgraph "流程层"
        FLOW_NEW["flows/new-flow.js"]
        FLOW_EDIT["flows/edit-flow.js"]
        FLOW_SCHED["flows/schedule-flow.js"]
        FLOW_LLM["flows/llm/llm.js"]
        FLOW_SKILLS["flows/skills-callbacks.js"]
        FLOW_TPL["flows/templates-callbacks.js"]
        FLOW_LINE["flows/line-bot.js"]
        FLOW_CB["flows/callbacks.js"]
        FLOW_STATE["flows/state.js"]
    end

    subgraph "媒体层"
        RELAY["media/relay.js"]
        ALBUM["media/album.js"]
    end

    subgraph "调度 + 派工"
        CRON["scheduler/cron.js"]
        DISPATCH["coding-agent/dispatch.js"]
    end

    WORKER --> ROUTES & CRON
    ROUTES --> CONFIG & D1 & I18N & GHW & TGW & BOT
    BOT --> GUARD & CMD_START & CMD_LIST & CMD_HELP & CMD_OTHER
    BOT --> FLOW_NEW & FLOW_EDIT & FLOW_SCHED & FLOW_LLM
    BOT --> FLOW_SKILLS & FLOW_TPL & FLOW_LINE & FLOW_CB
    BOT --> RELAY & COMMENT & AI_INF

    GHW --> WH_INDEX
    WH_INDEX --> WH_INST & WH_IC & WH_WR
    WH_IC --> DISPATCH & WH_META
    WH_WR --> D1

    FLOW_NEW & FLOW_EDIT --> BRANCH
    FLOW_SKILLS & FLOW_TPL --> SECRET
    FLOW_SCHED --> SCHED
    CRON --> SCHED & DISPATCH
    STATUS --> SCHED & EDGE
```

---

## 十一、安全设计

```mermaid
flowchart LR
    subgraph "访问控制"
        AG["AccessGuard (默认拒绝)"]
        AG1["① 检查 FROM_ID"]
        AG2["② 检查 CHAT_ID"]
        AG3["③ 检查 chat.type = private"]
        AG4["④ 检查消息长度"]
    end

    subgraph "Webhook 签名"
        GS["GitHub: HMAC-SHA256<br/>(@octokit/webhooks)"]
        TS["Telegram: Secret Token<br/>header 比对"]
    end

    subgraph "Secret 加密"
        SE1["获取 Repo Public Key"]
        SE2["libsodium sealedBox 加密"]
        SE3["写入 encrypted_value + key_id"]
    end

    subgraph "i18n 安全"
        I18N1["MarkdownV2 转义<br/>所有动态值"]
        I18N2["Secret redaction<br/>正则匹配敏感字段名"]
    end

    AG --> AG1 --> AG2 --> AG3 --> AG4
    GS --> TS
    SE1 --> SE2 --> SE3
    I18N1 --> I18N2
```

---

## 十二、审计修复统计

```mermaid
pie title 4 轮审计修复分布 (132 项)
    "Round 1: 结构/缺失功能" : 46
    "Round 2: 致命行为 Bug" : 20
    "Round 3: 组件级行为审计" : 50
    "Round 4: 剩余低/中优先级" : 16
```

```mermaid
pie title 审计严重性分布
    "P0 Critical" : 11
    "P1 Major" : 20
    "P2 Minor" : 15
    "R2 行为 Bug" : 20
    "R3 组件级" : 50
    "R4 剩余" : 16
```

---

## 十三、对等性验证

| 验证维度 | 旧 Bundle | src-v2 | 对等 |
|---------|-----------|--------|------|
| 源码行数 | 20,195 | 8,215 | 41% (干净重写) |
| 构建产物 | 630KB | 661KB | ✅ |
| i18n leaf keys | 813 | 813 | ✅ 零差异 |
| i18n 使用数 | 606 | 668 | ✅ 超集 (real gap=0) |
| Telegram 命令 | 17 | 17 | ✅ |
| 活跃回调 | 62 | 62 | ✅ |
| 死代码回调 | 6 | 0 (有意省略) | 已记录 |
| Webhook 事件 | 7 | 7 | ✅ |
| 媒体处理器 | 5 | 5 | ✅ |
| 护栏 (旧基线) | 14 | 14 | ✅ 0 回归 |
| 护栏 (v2 新) | — | 40 | ✅ 全绿 |
| **总护栏** | **14** | **54** | **✅ 全绿** |
| **审计修复** | — | **132/132** | **✅ 完成** |

---

## 十四、已知有意差异

1. **死代码省略**：6 个 `edit_flow_env_*`/`new_flow_env_*` 回调（旧 bundle 中注册但无键盘渲染，不可达）
2. **Config 验证**：必填字段在设置 bot token 前可选（允许 `/health` 在空 env 启动）
3. **LLM 模型验证**：使用 list-then-includes 策略（旧用直接 GET /models/{model}）
4. **D1 迁移**：Worker 内创建 kv_state/workflow_notifications/album_queue；schedules/issue_metadata 依赖 wrangler 外部迁移（与旧 bundle 一致）
5. **索引名称**：`idx_wn_*` vs 迁移文件 `idx_workflow_notifications_*`（无害重复索引）

---

## 十五、结论

src-v2 是旧 bundle 的**完整功能对等重写**。经过 4 轮深度审计（18 个并行 Agent，132 项修复），所有关键行为路径已验证对等：

- **派工流程**：从 issue 评论到 GitHub Actions workflow dispatch 完整可运行
- **排程系统**：10+ 规则类型、cron 表达式解析、定时触发 + 锁机制
- **技能/模板安装**：多步环境变量收集 + libsodium 加密 + D1 通知追踪
- **LINE Bot**：完整配置流程 + 验证 + 部署 + post-install
- **媒体转送**：单条 + 相册 + git 上传 + jsonl 记录 + 无分支降级
- **状态卡片**：7 路并行数据采集 + MarkdownV2 渲染 + 运行状态检测

**代码现在可以被拥有、理解和修改。** 旧 bundle 的「改一点坏一片」连锁脆弱性已消除。