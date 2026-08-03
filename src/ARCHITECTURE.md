# altShiftClawCore 系统架构报告

> **Phase R/S/T 从头重写与深度审计 — 完整逆向工程报告**
> 分支：`phase-r/refactor` | 日期：2026-07-30
> 源码：8,406 行 / 54 文件 | 构建：664KB | 审计：132/132 项修复 | Shadow-Diff：28/28 场景对等验证 | Phase T 深度审计完成

---

## 一、项目概述

altShiftClawCore 是一个部署在 **Cloudflare Workers** 上的 Telegram Bot + GitHub 集成系统。它将 GitHub Issues 作为「龙虾（Lobster）」任务单元，通过 Telegram 统一交互——创建任务、编辑配置、安装技能/模板、排程触发、媒体转送、AI 工作流派工等。

**旧代码**是 20,195 行的 esbuild 混淆 bundle（已归档到 `src-legacy/`），无法维护。**Phase R** 将其从头重写为干净的模块化源码（现为 `src/`），经过 4 轮深度审计（18 个并行 Agent）、Phase S 逐线 Shadow-Diff 行为对等测试、Phase T 活跃路径深度逆向、Phase U 端到端 full-chain 验证、Phase V relay 子系统完整重写、以及 Phase W 实地真凭证 smoke，修复 132 项行为差异，达到功能 100% 对等。2026-08-03 正式 swap 完成。

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
    %% 统一配色与样式规范
    classDef entry fill:#4f46e5,stroke:#3730a3,color:#fff,font-weight:bold,rx:6px
    classDef http fill:#0891b2,stroke:#0e7490,color:#fff,rx:6px
    classDef telegram fill:#0284c7,stroke:#0369a1,color:#fff,rx:6px
    classDef github fill:#334155,stroke:#1e293b,color:#fff,rx:6px
    classDef data fill:#d97706,stroke:#b45309,color:#fff,rx:6px
    classDef cron fill:#7c3aed,stroke:#6d28d9,color:#fff,rx:6px
    classDef i18n fill:#059669,stroke:#047857,color:#fff,rx:6px
    classDef external fill:#e11d48,stroke:#be123c,color:#fff,rx:6px

    subgraph "Cloudflare Worker"
        Worker["worker.js<br/>入口: fetch + scheduled"]:::entry

        subgraph "HTTP 层 (Hono)"
            Routes["routes.js<br/>路由装配"]:::http
            GHWebhook["github-webhook.js<br/>签名验证"]:::http
            TGWebhook["telegram-webhook.js<br/>Secret 验证"]:::http
        end

        subgraph "Telegram Bot (grammY)"
            Bot["bot.js<br/>中间件链"]:::telegram
            AccessGuard["access-guard.js<br/>访问控制"]:::telegram
            Commands["17 个命令"]:::telegram
            Flows["多步状态机流程"]:::telegram
            Media["媒体处理"]:::telegram
        end

        subgraph "GitHub 集成"
            Branches["branches.js<br/>分支/模板/workflow"]:::github
            Secrets["secrets.js<br/>加密写入"]:::github
            Webhooks["7 个 Webhook 事件"]:::github
            Dispatch["dispatch.js<br/>Coding-Agent 派工"]:::github
        end

        subgraph "数据层"
            D1["D1 数据库"]:::data
            KV["KV Store (D1 facade)"]:::data
            Schedules["schedules.js<br/>排程 CRUD"]:::data
            KVState["kv-state.js<br/>流程状态"]:::data
        end

        subgraph "调度器"
            Cron["cron.js<br/>scheduled() 处理"]:::cron
        end

        subgraph "i18n"
            I18n["index.js<br/>t() / glang()"]:::i18n
            Log["log.js<br/>102 个结构化日志 key"]:::i18n
        end
    end

    subgraph "外部服务"
        TG["Telegram API"]:::external
        GHA["GitHub Actions"]:::external
        GHAPI["GitHub API"]:::external
        WAI["Workers AI"]:::external
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
    classDef req fill:#4f46e5,stroke:#3730a3,color:#fff,font-weight:bold,rx:6px
    classDef mw fill:#0891b2,stroke:#0e7490,color:#fff,rx:6px
    classDef route fill:#0284c7,stroke:#0369a1,color:#fff,rx:6px
    classDef gh fill:#334155,stroke:#1e293b,color:#fff,rx:6px
    classDef tg fill:#059669,stroke:#047857,color:#fff,rx:6px

    subgraph 请求入口
        REQ["HTTP 请求"]:::req
    end

    subgraph "中间件链 (顺序执行)"
        M1["① config 中间件<br/>buildConfig(env)"]:::mw
        M2["② 服务中间件<br/>D1 migration + octokit + store + ai"]:::mw
        M3["③ 语言中间件<br/>getLanguage → ctx.language"]:::mw
    end

    subgraph 路由匹配
        R1["GET / → 健康检查"]:::route
        R2["GET /health → 健康检查"]:::route
        R3["POST /github/webhook → GitHub 签名验证"]:::route
        R4["GET /api/active-issue → 查询活跃龙虾"]:::route
        R5["POST * → Telegram Webhook"]:::route
    end

    REQ --> M1 --> M2 --> M3
    M3 --> R1
    M3 --> R2
    M3 --> R3
    M3 --> R4
    M3 --> R5

    R3 -->|验证通过| GHEVENT["GitHub Webhook 事件分发"]:::gh
    R5 -->|Secret 验证 + 路径匹配| BOT["grammY Bot.handleUpdate"]:::tg
```

---

## 五、Telegram Bot 中间件链

```mermaid
flowchart TB
    classDef entry fill:#4f46e5,stroke:#3730a3,color:#fff,font-weight:bold,rx:6px
    classDef guard fill:#e11d48,stroke:#be123c,color:#fff,rx:6px
    classDef svc fill:#0891b2,stroke:#0e7490,color:#fff,rx:6px
    classDef cmd fill:#0284c7,stroke:#0369a1,color:#fff,rx:6px
    classDef flow fill:#d97706,stroke:#b45309,color:#fff,rx:6px
    classDef media fill:#7c3aed,stroke:#6d28d9,color:#fff,rx:6px
    classDef err fill:#be123c,stroke:#881337,color:#fff,rx:6px

    UPDATE["Telegram Update"]:::entry

    subgraph "① 访问控制 (access-guard.js)"
        AG["默认拒绝策略<br/>检查 FROM_ID / CHAT_ID / 消息长度"]:::guard
    end

    subgraph "② 服务注入 (bot.js)"
        SVC["ctx.services = {octokit, store, d1, ai, config}<br/>ctx.language = getLanguage()<br/>ctx.t = i18nT()"]:::svc
    end

    subgraph "③ 命令 + 回调路由 (Composer)"
        CMD["17 个 slash 命令"]:::cmd
        CB["62 个 callbackQuery 回调"]:::cmd
        MENUCB["8 个 command_menu 回调"]:::cmd
    end

    subgraph "④ message:text 续接链"
        T1["handleLlmText<br/>(LLM API Key / Model 输入)"]:::flow
        T2["handleSkillEnvText<br/>(技能环境变量收集)"]:::flow
        T3["handleTemplateEnvText<br/>(模板环境变量收集)"]:::flow
        T4["handleFlowText<br/>(/new 流程)"]:::flow
        T5["handleEditText<br/>(/edit 流程)"]:::flow
        T6["handleScheduleText<br/>(排程流程)"]:::flow
        T7["handleLineText<br/>(LINE Bot 配置)"]:::flow
        T8["handleCommentOnIssue<br/>(默认：转送 issue 评论)"]:::flow
        T9["handleNaturalLanguageCommand<br/>(AI 工作流派工)"]:::flow
    end

    subgraph "⑤ 媒体处理"
        MEDIA["photo (单条+相册)<br/>voice / video / audio / document"]:::media
    end

    subgraph "⑥ 全局错误捕获"
        CATCH["bot.catch<br/>回复 ❌ + core.unknownError"]:::err
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
    classDef entry fill:#4f46e5,stroke:#3730a3,color:#fff,font-weight:bold,rx:6px
    classDef event fill:#334155,stroke:#1e293b,color:#fff,rx:6px
    classDef init fill:#0284c7,stroke:#0369a1,color:#fff,rx:6px
    classDef relay fill:#059669,stroke:#047857,color:#fff,rx:6px
    classDef notify fill:#d97706,stroke:#b45309,color:#fff,rx:6px

    subgraph "GitHub Webhook 入口"
        SIGN["签名验证<br/>(@octokit/webhooks)"]:::entry
    end

    subgraph "7 个事件处理器"
        E1["installation.created<br/>→ 自动初始化"]:::event
        E2["issues.opened<br/>→ 日志记录"]:::event
        E3["issue_comment.created<br/>→ 转送 + 派工"]:::event
        E4["issue_comment.edited<br/>→ 转送 + 派工"]:::event
        E5["workflow_run.requested<br/>→ D1 记录更新"]:::event
        E6["workflow_run.in_progress<br/>→ D1 记录更新"]:::event
        E7["workflow_run.completed<br/>→ Telegram 通知"]:::event
    end

    subgraph "自动初始化 (installation.created)"
        AI1["创建第一个 Issue (龙虾)"]:::init
        AI2["创建 orphan 分支 issue-N"]:::init
        AI3["写入 workflow yml"]:::init
        AI4["D1 记录 issue_metadata"]:::init
        AI5["设置 INIT_GITHUB_CLAW=false<br/>Repo Variable"]:::init
        AI6["发送欢迎消息到 Telegram"]:::init
    end

    subgraph "评论转送 (issue_comment)"
        RC1["跳过条件检查<br/>(bot echo / line / schedule)"]:::relay
        RC2["解析 telegram-meta → chat_id"]:::relay
        RC3["转送到 Telegram<br/>(含图片检测 + MarkdownV2)"]:::relay
        RC4["Coding-Agent 派工<br/>(检查 branch + workflow)"]:::relay
    end

    subgraph "Workflow 完成通知"
        WN1["查询 D1 notification<br/>(by request_id / run_id)"]:::notify
        WN2["匹配 workflow 类型<br/>(autoupdate/skills/templates/lineBot)"]:::notify
        WN3["发送 Telegram 通知<br/>(MarkdownV2 转义)"]:::notify
        WN4["skills 成功 → 建 issue 评论"]:::notify
        WN5["line-bot 成功 → 发送 post-install 键盘"]:::notify
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
    classDef input fill:#4f46e5,stroke:#3730a3,color:#fff,font-weight:bold,rx:6px
    classDef gate fill:#d97706,stroke:#b45309,color:#fff,rx:6px
    classDef exec fill:#0284c7,stroke:#0369a1,color:#fff,rx:6px
    classDef ok fill:#059669,stroke:#047857,color:#fff,rx:6px
    classDef err fill:#e11d48,stroke:#be123c,color:#fff,rx:6px

    COMMENT["GitHub Issue 评论<br/>(人类发送)"]:::input

    subgraph "派工门控 (dispatch.js)"
        G1["isSystemComment?<br/>跳过 brain-result/tool-run/line-meta"]:::gate
        G2["isScheduleFlowRecord?<br/>跳过排程记录"]:::gate
        G3["hasCommentMeta?<br/>需要 telegram-meta 标记"]:::gate
        G4["isMediaPending?<br/>跳过未完成的媒体"]:::gate
        G5["stripToUserMessage<br/>提取纯用户消息"]:::gate
        G6["checkAcceptsDispatch<br/>检查 branch + workflow + enabled"]:::gate
    end

    subgraph "派工执行"
        D1["提取 requestTelegramMeta"]:::exec
        D2["创建 progress comment<br/>(githubclaw-brain-result 标记)"]:::exec
        D3["构建 dispatch inputs<br/>(issue_number, comment_id, event_source...)"]:::exec
        D4["createWorkflowDispatch<br/>→ issue-N.yml"]:::exec
    end

    subgraph "错误处理"
        E1["not found → 删除 progress comment"]:::err
        E2["disabled → 回复 restingMessage"]:::err
        E3["其他 → 回复 dispatchFailed"]:::err
    end

    COMMENT --> G1 -->|否| G2 -->|否| G3 -->|有 meta| G4 -->|否| G5 --> G6
    G6 -->|通过| D1 --> D2 --> D3 --> D4
    D4 -->|成功| OK["✅ 派工完成"]:::ok
    D4 -->|失败| E1 & E2 & E3
```

---

## 八、排程系统 (Schedule)

```mermaid
flowchart TB
    classDef create fill:#0284c7,stroke:#0369a1,color:#fff,rx:6px
    classDef rule fill:#d97706,stroke:#b45309,color:#fff,rx:6px
    classDef cron fill:#7c3aed,stroke:#6d28d9,color:#fff,rx:6px

    subgraph "排程创建流程 (Telegram)"
        S1["/set_schedule 回调<br/>→ awaiting_prompt"]:::create
        S2["用户输入任务描述<br/>→ awaiting_time"]:::create
        S3["AI 时间解析<br/>(Workers AI + fallback)"]:::create
        S4["用户输入 payload<br/>→ createSchedule"]:::create
        S5["onScheduleAction<br/>建 issue comment + 发 config card + status card"]:::create
    end

    subgraph "computeNextRun (10+ 规则类型)"
        NR1["once → 固定时间"]:::rule
        NR2["every_N_minutes → +N 分钟"]:::rule
        NR3["interval → +N 分钟"]:::rule
        NR4["minutely → 对齐分钟"]:::rule
        NR5["daily → 每天指定时刻"]:::rule
        NR6["hourly → 每小时指定分"]:::rule
        NR7["weekly → 指定星期几"]:::rule
        NR8["weekday → 周一到周五"]:::rule
        NR9["weekenday → 周六周日"]:::rule
        NR10["cron → 完整 cron 表达式解析"]:::rule
    end

    subgraph "Cron 定时处理 (scheduled handler)"
        C1["fetchDueSchedules<br/>查询到期排程"]:::cron
        C2["acquireScheduleLock<br/>5 分钟锁"]:::cron
        C3["建 issue 评论<br/>+ 写 user.md artifact"]:::cron
        C4["computeNextRunState<br/>计算下次运行"]:::cron
        C5["persistScheduleRun<br/>更新 D1 + 释放锁"]:::cron
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
    classDef entry fill:#4f46e5,stroke:#3730a3,color:#fff,font-weight:bold,rx:6px
    classDef http fill:#0891b2,stroke:#0e7490,color:#fff,rx:6px
    classDef config fill:#059669,stroke:#047857,color:#fff,rx:6px
    classDef data fill:#d97706,stroke:#b45309,color:#fff,rx:6px
    classDef github fill:#334155,stroke:#1e293b,color:#fff,rx:6px
    classDef telegram fill:#0284c7,stroke:#0369a1,color:#fff,rx:6px
    classDef cmd fill:#0284c7,stroke:#0369a1,color:#fff,rx:6px
    classDef flow fill:#d97706,stroke:#b45309,color:#fff,rx:6px
    classDef media fill:#7c3aed,stroke:#6d28d9,color:#fff,rx:6px
    classDef cron fill:#7c3aed,stroke:#6d28d9,color:#fff,rx:6px

    subgraph "入口层"
        WORKER["worker.js"]:::entry
    end

    subgraph "HTTP 层"
        ROUTES["http/routes.js"]:::http
        GHW["http/github-webhook.js"]:::http
        TGW["http/telegram-webhook.js"]:::http
    end

    subgraph "配置 + i18n"
        CONFIG["config.js"]:::config
        I18N["i18n/index.js"]:::config
        LANG["i18n/language.js"]:::config
        LOG["i18n/log.js"]:::config
    end

    subgraph "数据层"
        D1["db/d1.js"]:::data
        KV["db/kv-state.js"]:::data
        SCHED["db/schedules.js"]:::data
    end

    subgraph "GitHub 层"
        OCTO["github/octokit.js"]:::github
        BRANCH["github/branches.js"]:::github
        SECRET["github/secrets.js"]:::github
        WH_INDEX["github/webhooks/index.js"]:::github
        WH_INST["github/webhooks/installation.js"]:::github
        WH_IC["github/webhooks/issue-comment.js"]:::github
        WH_WR["github/webhooks/workflow-run.js"]:::github
        WH_META["github/webhooks/meta.js"]:::github
    end

    subgraph "Telegram 层"
        BOT["telegram/bot.js"]:::telegram
        GUARD["telegram/access-guard.js"]:::telegram
        STATUS["telegram/status-card.js"]:::telegram
        COMMENT["telegram/comment-on-issue.js"]:::telegram
        AI_INF["telegram/ai-inference.js"]:::telegram
        EDGE["telegram/edge-replies.js"]:::telegram
        MARKDOWN["telegram/markdown.js"]:::telegram
        KEYBOARD["telegram/keyboards.js"]:::telegram
    end

    subgraph "命令层"
        CMD_START["commands/start.js"]:::cmd
        CMD_LIST["commands/list.js"]:::cmd
        CMD_HELP["commands/help.js"]:::cmd
        CMD_OTHER["commands/*.js (14个)"]:::cmd
    end

    subgraph "流程层"
        FLOW_NEW["flows/new-flow.js"]:::flow
        FLOW_EDIT["flows/edit-flow.js"]:::flow
        FLOW_SCHED["flows/schedule-flow.js"]:::flow
        FLOW_LLM["flows/llm/llm.js"]:::flow
        FLOW_SKILLS["flows/skills-callbacks.js"]:::flow
        FLOW_TPL["flows/templates-callbacks.js"]:::flow
        FLOW_LINE["flows/line-bot.js"]:::flow
        FLOW_CB["flows/callbacks.js"]:::flow
        FLOW_STATE["flows/state.js"]:::flow
    end

    subgraph "媒体层"
        RELAY["media/relay.js"]:::media
        ALBUM["media/album.js"]:::media
    end

    subgraph "调度 + 派工"
        CRON["scheduler/cron.js"]:::cron
        DISPATCH["coding-agent/dispatch.js"]:::cron
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
    classDef guard fill:#e11d48,stroke:#be123c,color:#fff,font-weight:bold,rx:6px
    classDef sign fill:#0891b2,stroke:#0e7490,color:#fff,rx:6px
    classDef secret fill:#d97706,stroke:#b45309,color:#fff,rx:6px
    classDef i18n fill:#059669,stroke:#047857,color:#fff,rx:6px

    subgraph "访问控制"
        AG["AccessGuard (默认拒绝)"]:::guard
        AG1["① 检查 FROM_ID"]:::guard
        AG2["② 检查 CHAT_ID"]:::guard
        AG3["③ 检查 chat.type = private"]:::guard
        AG4["④ 检查消息长度"]:::guard
    end

    subgraph "Webhook 签名"
        GS["GitHub: HMAC-SHA256<br/>(@octokit/webhooks)"]:::sign
        TS["Telegram: Secret Token<br/>header 比对"]:::sign
    end

    subgraph "Secret 加密"
        SE1["获取 Repo Public Key"]:::secret
        SE2["libsodium sealedBox 加密"]:::secret
        SE3["写入 encrypted_value + key_id"]:::secret
    end

    subgraph "i18n 安全"
        I18N1["MarkdownV2 转义<br/>所有动态值"]:::i18n
        I18N2["Secret redaction<br/>正则匹配敏感字段名"]:::i18n
    end

    AG --> AG1 --> AG2 --> AG3 --> AG4
    GS --> TS
    SE1 --> SE2 --> SE3
    I18N1 --> I18N2
```

---

## 十二、审计修复统计

```mermaid
%%{init: {'themeVariables': {'pie1': '#4f46e5', 'pie2': '#d97706', 'pie3': '#059669', 'pie4': '#7c3aed'}}}%%
pie title 4 轮审计修复分布 (132 项)
    "Round 1: 结构/缺失功能" : 46
    "Round 2: 致命行为 Bug" : 20
    "Round 3: 组件级行为审计" : 50
    "Round 4: 剩余低/中优先级" : 16
```

```mermaid
%%{init: {'themeVariables': {'pie1': '#e11d48', 'pie2': '#ea580c', 'pie3': '#d97706', 'pie4': '#4f46e5', 'pie5': '#059669', 'pie6': '#0891b2'}}}%%
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

| 验证维度 | 旧 Bundle (src-legacy) | src (新源码) | 对等 |
|---------|-----------|--------|------|
| 源码行数 | 20,195 | 8,406 | 41.6% (干净模块化重写) |
| 构建产物 | 630KB | 664KB | ✅ |
| i18n leaf keys | 813 | 813 | ✅ 零差异 |
| i18n 使用数 | 606 | 668 | ✅ 超集 (real gap=0) |
| Telegram 命令 | 17 | 17 | ✅ |
| 活跃回调 | 62 | 62 | ✅ |
| 死代码回调 | 6 | 0 (有意省略) | 已记录 |
| Webhook 事件 | 7 | 7 | ✅ |
| 媒体处理器 | 5 | 5 | ✅ |
| 护栏 (旧基线) | 14 | 14 | ✅ 0 回归 |
| 护栏 (v2 新) | — | 40 | ✅ 全绿 |
| **总护栏测试** | **14** | **54** | **✅ 全绿** |
| **Shadow-Diff 场景** | — | **28 (25 完全一致 / 3 允许改动)** | **✅ 0 回归** |
| **审计修复** | — | **132/132** | **✅ 完成** |

---

## 十四、已知有意差异

1. **死代码省略**：6 个 `edit_flow_env_*`/`new_flow_env_*` 回调（旧 bundle 中注册但无键盘渲染，不可达）
2. **Config 验证**：必填字段在设置 bot token 前可选（允许 `/health` 在空 env 启动）
3. **LLM 模型验证**：使用 list-then-includes 策略（旧用直接 GET /models/{model}）
4. **D1 迁移**：Worker 内创建 `kv_state`/`workflow_notifications`/`album_queue`；`schedules`/`issue_metadata` 依赖 wrangler 外部迁移（与旧 bundle 一致）
5. **索引名称**：`idx_wn_*` vs 迁移文件 `idx_workflow_notifications_*`（无害重复索引）
6. **v2 已知命令白名单跳过冗余 workflow 拉取**：v2 `bot.js` 注册了已知命令 allowlist，使 RT 路由能够直接解析已知命令（如 `/schedules`、`/llm`），无需对后置 composer 执行冗余的 `GET /actions/workflows`
7. **Webhook 回复依赖 issue body 内 telegram-meta 路由**：取消旧 bundle 的 `comment:<id>` KV 映射表与相册 `Ar` 注册，由 `issue-comment.js` 根据 issue body 的 `telegram-meta` 自动路由 Telegram 回复（架构化重构，无需维护额外 KV 状态）
8. **Auto-init 模板读取使用 REST API (非 GraphQL)**：`readTemplateFiles` 使用 REST `getContent` 递归替代 GraphQL 单次树查询，保持缺失目录抛出 `TEMPLATE_NOT_INSTALLED` 的显式失败行为

---

## 十五、结论

`src/` 是旧 bundle 的**完整功能对等重写**。经过 4 轮深度审计（18 个并行 Agent，132 项修复）、Phase S 侧边对齐测试（Shadow-Diff 32 组场景）、Phase T 活跃路径精细校验、Phase U 端到端 full-chain 验证、Phase V relay 子系统完整重写、以及 Phase W 实地真凭证 smoke（15 命令 + 3 workflows + 完整 Telegram→GitHub→Coding-Agent→relay 链路），所有关键行为路径已验证对等。2026-08-03 正式 swap 完成，旧 bundle 归档到 `src-legacy/`。

- **派工流程**：从 issue 评论到 GitHub Actions workflow dispatch 完整可运行
- **排程系统**：10+ 规则类型、cron 表达式解析、定时触发 + 锁机制
- **技能/模板安装**：多步环境变量收集 + libsodium 加密 + D1 通知追踪
- **LINE Bot**：完整配置流程 + 验证 + 部署 + post-install
- **媒体转送**：单条 + 相册 (`Vs` body 结构化对齐) + git 上传 + jsonl 记录 + 无分支降级
- **状态卡片**：7 路并行数据采集 + MarkdownV2 渲染 + 运行状态检测
- **Auto-Init 自动初始化**：首个 Lobster 创建、orphan 分支 sync、D1 元数据持久化与 `INIT_GITHUB_CLAW` 状态同步

**代码现在可以被拥有、理解和修改。** 旧 bundle 的「改一点坏一片」连锁脆弱性已彻底消除，并通过自动化 guardrails 与 shadow-diff 测试护航。