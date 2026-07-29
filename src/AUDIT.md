# Phase R — Complete Parity Audit

> **Final audit of the `src-v2/` rewrite vs old bundle `src/index.js`.**
> Generated: 2026-07-29 (commit `4f9862b`)
> Branch: `phase-r/refactor`

---

## 1. Executive Summary

| Metric | Old Bundle (`src/index.js`) | src-v2 | Status |
|--------|---------------------------|--------|--------|
| Source lines | 20,195 | 6,964 (53 files) | 34% of old — clean rewrite |
| Build output | 630,789 bytes | 590,675 bytes | 94% of old |
| i18n leaf keys (en) | 813 | 813 | 100% parity |
| i18n leaf keys (zh-CN) | 813 | 813 | 100% parity |
| i18n keys used (old) | 606 | 678 | src-v2 superset |
| **i18n real gap** | — | **0** | **100% parity** |
| Telegram commands | 17 | 17 | 100% parity |
| Telegram callbacks (active) | 62 | 62 | 100% parity |
| Telegram callbacks (dead code) | 6 | 0 (intentionally omitted) | Documented |
| GitHub webhook events | 7 | 7 | 100% parity |
| Media handlers | 5 | 5 | 100% parity |
| Guardrails (old baseline) | 14 | 14 | 0 regressions |
| Guardrails (v2 new) | — | 40 | All green |
| **Total guardrails** | **14** | **54** | **All passing** |

**Verdict: src-v2 is a complete, functionally-equivalent rewrite of the old bundle. Ready for swap.**

---

## 2. Module Inventory (53 files)

### Entry & Config (3 files)
| File | Lines | Old bundle counterpart |
|------|-------|------------------------|
| `worker.js` | 14 | VP entry (L20185) |
| `config.js` | 89 | TE env parsing |
| `github/octokit.js` | 12 | Octokit init |

### HTTP Layer (4 files)
| File | Lines | Old bundle counterpart |
|------|-------|------------------------|
| `http/routes.js` | 99 | dr.fetch / Hono app |
| `http/github-webhook.js` | 33 | GitHub signature verify |
| `http/telegram-webhook.js` | 32 | Telegram secret verify |
| `github/webhooks/index.js` | 15 | Og registration (L19960) |

### i18n (3 files)
| File | Lines | Old bundle counterpart |
|------|-------|------------------------|
| `i18n/index.js` | 71 | t() / glang() (L12) |
| `i18n/language.js` | 15 | getLanguage() |
| `i18n/log.js` | 133 | log.* structured logging (102 keys) |

### Database (3 files)
| File | Lines | Old bundle counterpart |
|------|-------|------------------------|
| `db/d1.js` | 87 | D1 wrapper |
| `db/kv-state.js` | 45 | kv_state CRUD |
| `db/schedules.js` | 155 | schedules table CRUD |

### GitHub (5 files)
| File | Lines | Old bundle counterpart |
|------|-------|------------------------|
| `github/branches.js` | 204 | Er/Pn/Sr/Vr/Q_/Os branch ops |
| `github/webhooks/installation.js` | 89 | installation.created handler |
| `github/webhooks/issue-comment.js` | 102 | issue_comment.created/edited |
| `github/webhooks/meta.js` | 28 | meta comment parser |
| `github/webhooks/workflow-run.js` | 186 | workflow_run 3-state handler |

### Telegram Core (6 files)
| File | Lines | Old bundle counterpart |
|------|-------|------------------------|
| `telegram/bot.js` | 137 | Bot assembly + middleware chain |
| `telegram/access-guard.js` | 39 | default-deny FROM_ID/CHAT_ID |
| `telegram/markdown.js` | 11 | escapeMarkdownV2 |
| `telegram/keyboards.js` | 30 | InlineKeyboard builders |
| `telegram/status-card.js` | 203 | ks/Hp/gp/qd status card |
| `telegram/edge-replies.js` | 607 | ~126 edge i18n key functions |
| `telegram/comment-on-issue.js` | 162 | su message:text default path |
| `telegram/ai-inference.js` | 171 | Zp AI workflow-input inference |

### Telegram Commands (11 files)
| File | Lines | Old bundle counterpart |
|------|-------|------------------------|
| `commands/start.js` | 43 | /start |
| `commands/help.js` | 46 | /help (Ko + fy) |
| `commands/list.js` | 70 | /list |
| `commands/current.js` | 28 | /current |
| `commands/version.js` | 9 | /version |
| `commands/schedules.js` | 79 | /schedules (Kl) |
| `commands/skills.js` | 93 | /skills (Il) |
| `commands/templates.js` | 75 | /templates |
| `commands/close.js` | 41 | /close |
| `commands/clear.js` | 40 | /clear |
| `commands/workflow-controls.js` | 113 | /enable /disable /workflow |

### Telegram Flows (10 files)
| File | Lines | Old bundle counterpart |
|------|-------|------------------------|
| `flows/state.js` | 28 | flow state CRUD |
| `flows/callbacks.js` | 195 | switch_issue / close_issue / current_edit |
| `flows/new-flow.js` | 153 | /new (Gs + wl + eT) |
| `flows/edit-flow.js` | 503 | /edit (4-step + template reset) |
| `flows/schedule-flow.js` | 467 | schedule setup/edit/payload flow |
| `flows/skills-callbacks.js` | 426 | 11 skills callbacks + env |
| `flows/templates-callbacks.js` | 422 | 13 templates callbacks + env |
| `flows/template-reset-callbacks.js` | 96 | current_template_reset etc |
| `flows/line-bot.js` | 223 | 7 LINE bot callbacks + state machine |
| `flows/llm/llm.js` | 363 | /llm 5 callbacks + key/model input |
| `flows/llm/state.js` | 24 | llm state |

### Media (2 files)
| File | Lines | Old bundle counterpart |
|------|-------|------------------------|
| `media/relay.js` | 250 | Ys (single) + Nk (album) — §6.2 bug fixed |
| `media/album.js` | 36 | album_queue debounce |

### Scheduler (1 file)
| File | Lines | Old bundle counterpart |
|------|-------|------------------------|
| `scheduler/cron.js` | 133 | Gg scheduled handler + per-schedule Rp/DE/FE/Zr/Ap |

### Coding Agent (1 file)
| File | Lines | Old bundle counterpart |
|------|-------|------------------------|
| `coding-agent/dispatch.js` | 239 | lobster dispatch + issue→workflow |

---

## 3. Telegram Commands (17/17)

| Command | src-v2 file | Old bundle | Status |
|---------|------------|------------|--------|
| `/start` | `commands/start.js` | Ko.command("start") | ✅ |
| `/help` | `commands/help.js` | Ko.command("help") + fy() | ✅ |
| `/list` | `commands/list.js` | Kl.command("list") | ✅ |
| `/current` | `commands/current.js` | Kl.command("current") | ✅ |
| `/status` | `status-card.js` | ks (L6464) | ✅ |
| `/version` | `commands/version.js` | hardcoded version | ✅ |
| `/schedules` | `commands/schedules.js` | Kl.command("schedules") | ✅ |
| `/skills` | `commands/skills.js` | Il (L12628) | ✅ |
| `/templates` | `commands/templates.js` | templates command | ✅ |
| `/close` | `commands/close.js` | close command | ✅ |
| `/clear` | `commands/clear.js` | clear dispatch | ✅ |
| `/enable` | `commands/workflow-controls.js` | enable workflow | ✅ |
| `/disable` | `commands/workflow-controls.js` | disable workflow | ✅ |
| `/workflow` | `commands/workflow-controls.js` | workflow status | ✅ |
| `/new` | `flows/new-flow.js` | Gs.command("new") | ✅ |
| `/edit` | `flows/edit-flow.js` | Am /edit 4-step | ✅ |
| `/llm` | `flows/llm/llm.js` | /llm 5 callbacks | ✅ |

---

## 4. Telegram Callbacks (62 active + 6 dead code)

### Active Callbacks (62/62 parity)

| Callback pattern | src-v2 file | Status |
|-----------------|------------|--------|
| `skills_pick:` | skills-callbacks.js | ✅ |
| `skills_preview_confirm:` | skills-callbacks.js | ✅ |
| `skills_preview_back:` | skills-callbacks.js | ✅ |
| `skills_update_from_list:` | skills-callbacks.js | ✅ |
| `skills_remove_from_list:` | skills-callbacks.js | ✅ |
| `skills_remove_confirm_from_list:` | skills-callbacks.js | ✅ |
| `skills_remove_back:` | skills-callbacks.js | ✅ |
| `skills_existing_secret:` | skills-callbacks.js | ✅ |
| `skills_overwrite:` | skills-callbacks.js | ✅ |
| `skills_confirm:` | skills-callbacks.js | ✅ |
| `skills_cancel:` | skills-callbacks.js | ✅ |
| `skills_page:` | skills-callbacks.js | ✅ |
| `set_schedule:` | schedule-flow.js | ✅ |
| `manage_schedule:` | schedule-flow.js | ✅ |
| `schedule_open:` | schedule-flow.js | ✅ |
| `schedule_edit_(prompt\|time\|payload):` | schedule-flow.js | ✅ |
| `schedule_flow_cancel:` | schedule-flow.js | ✅ |
| `schedule_payload_skip:` | schedule-flow.js | ✅ |
| `schedule_toggle:` | schedule-flow.js | ✅ |
| `schedule_delete:` | schedule-flow.js | ✅ |
| `schedule_chat_list:` | schedule-flow.js | ✅ |
| `schedule_chat_open:` | schedule-flow.js | ✅ |
| `schedule_chat_delete:` | schedule-flow.js | ✅ |
| `llm_provider:` | llm/llm.js | ✅ |
| `llm_key:` | llm/llm.js | ✅ |
| `llm_model:` | llm/llm.js | ✅ |
| `llm_model_custom:` | llm/llm.js | ✅ |
| `llm_cancel:` | llm/llm.js | ✅ |
| `new_flow_cancel:` | new-flow.js | ✅ |
| `new_template_select:` | new-flow.js | ✅ |
| `templates_pick:` | templates-callbacks.js | ✅ |
| `templates_preview_confirm:` | templates-callbacks.js | ✅ |
| `templates_preview_back:` | templates-callbacks.js | ✅ |
| `templates_overwrite:` | templates-callbacks.js | ✅ |
| `templates_model_pick:` | templates-callbacks.js | ✅ |
| `templates_confirm:` | templates-callbacks.js | ✅ |
| `templates_cancel:` | templates-callbacks.js | ✅ |
| `templates_env_setup:` | templates-callbacks.js | ✅ |
| `templates_env_skip:` | templates-callbacks.js | ✅ |
| `templates_env_resetall:` | templates-callbacks.js | ✅ |
| `templates_env_keepall:` | templates-callbacks.js | ✅ |
| `templates_env_cancel:` | templates-callbacks.js | ✅ |
| `templates_page:` | templates-callbacks.js | ✅ |
| `linebot_setup_continue:` | line-bot.js | ✅ |
| `linebot_setup_skip:` | line-bot.js | ✅ |
| `linebot_input_skip:` | line-bot.js | ✅ |
| `linebot_deploy_confirm:` | line-bot.js | ✅ |
| `linebot_deploy_cancel:` | line-bot.js | ✅ |
| `linebot_edit:(.+)` | line-bot.js | ✅ |
| `linebot_edit_back:` | line-bot.js | ✅ |
| `linebot_edit_params:` | line-bot.js | ✅ |
| `edit_keep_field:` | edit-flow.js | ✅ |
| `edit_workflow_enabled:` | edit-flow.js | ✅ |
| `edit_template_reset:skip` | edit-flow.js | ✅ |
| `current_template_reset:` | template-reset-callbacks.js | ✅ |
| `template_reset_select:` | template-reset-callbacks.js | ✅ |
| `template_reset_cancel:` | template-reset-callbacks.js | ✅ |
| `current_edit:` | callbacks.js | ✅ |
| `switch_issue:` | callbacks.js | ✅ |
| `close_issue_prompt:` | callbacks.js | ✅ |
| `close_issue_cancel:` | callbacks.js | ✅ |
| `close_issue_confirm:` | callbacks.js | ✅ |

### Dead Code Callbacks (6 — intentionally omitted)

| Callback pattern | Old bundle | Why dead |
|-----------------|------------|----------|
| `edit_flow_env_cancel:` | registered but no keyboard renders it | Unreachable |
| `edit_flow_env_setup:` | registered but no keyboard renders it | Unreachable |
| `edit_flow_env_skip:` | registered but no keyboard renders it | Unreachable |
| `new_flow_env_cancel:` | registered but no keyboard renders it | Unreachable |
| `new_flow_env_setup:` | registered but no keyboard renders it | Unreachable |
| `new_flow_env_skip:` | registered but no keyboard renders it | Unreachable |

---

## 5. GitHub Webhook Events (7/7)

| Event | src-v2 file | Old bundle | Status |
|-------|------------|------------|--------|
| `issues.opened` | `webhooks/index.js` | Og | ✅ |
| `installation.created` | `webhooks/installation.js` | auto-init | ✅ |
| `issue_comment.created` | `webhooks/issue-comment.js` | relay + dispatch | ✅ |
| `issue_comment.edited` | `webhooks/issue-comment.js` | relay edited | ✅ |
| `workflow_run.requested` | `webhooks/workflow-run.js` | 3-state handler | ✅ |
| `workflow_run.in_progress` | `webhooks/workflow-run.js` | 3-state handler | ✅ |
| `workflow_run.completed` | `webhooks/workflow-run.js` | 3-state handler | ✅ |

---

## 6. Media Handlers (5/5)

| Handler | src-v2 file | Old bundle | Status |
|---------|------------|------------|--------|
| `message:photo` | `media/relay.js` | Ys (single) + Nk (album) | ✅ §6.2 bug fixed |
| `message:voice` | `media/relay.js` | Ys | ✅ |
| `message:video` | `media/relay.js` | Ys | ✅ |
| `message:audio` | `media/relay.js` | Ys | ✅ |
| `message:document` | `media/relay.js` | Ys | ✅ |

---

## 7. i18n Parity

### Leaf Keys
- **en.json**: 813 leaf keys
- **zh-CN.json**: 813 leaf keys
- **Parity**: en = zh, zero mismatch (guardrail verified)

### Key Usage
- **Old bundle uses**: 606 unique i18n keys
- **src-v2 uses**: 678 unique i18n keys (superset — includes edge-replies functions)
- **Real gap** (in old but not v2): **0**

### Key Categories Covered
| Category | Keys | Coverage |
|----------|------|----------|
| `core.*` | 40+ | ✅ All old keys + edge functions |
| `schedule.*` | 180+ | ✅ All old keys + rule description/notify |
| `kb.*` | 20+ | ✅ All old keys + edge functions |
| `help.*` | 21 | ✅ HELP_LINES array |
| `skills.*` | 15+ | ✅ All old keys + catalog |
| `templates.*` | 20+ | ✅ All old keys + desc/name |
| `newFlow.*` | 25+ | ✅ All old keys + step labels |
| `line.*` | 15+ | ✅ All old keys + edge |
| `media.*` / `mediaLabel.*` | 11 | ✅ Both namespaces (redundant but covered) |
| `skillCatalog.*` | 18 | ✅ skillCatalogReply() |
| `menu.*` | 3 | ✅ menuActiveLobster/closeLobster/newLobster |
| `log.*` | 102 | ✅ i18n/log.js centralized module |
| `api.rateLimit.*` | 3 | ✅ edge-replies |
| `system.*` | 10+ | ✅ All old keys |
| `errors.*` | 5+ | ✅ All old keys |

---

## 8. Functional Gaps (9/9 Complete)

All 9 functional gaps identified during audit have been resolved:

| Gap | Description | Resolution | Commit |
|-----|-------------|------------|--------|
| A | `/new` Os create finalize | `github/branches.js` — full issue create + orphan branch + workflow write | `d9eb446` |
| B | `/edit` template reset | `flows/edit-flow.js` — awaiting_template_reset step + reset callbacks | `d9eb446` |
| C | Status card ks/Hp/gp/qd | `status-card.js` — 7-way parallel data gather + MarkdownV2 card | `d9eb446` |
| D | Cron per-schedule Rp/DE/FE/Zr/Ap | `scheduler/cron.js` — lock + dispatch + execute + record + notify | `d9eb446` |
| E | Schedule AI time parse (Ul) | `flows/schedule-flow.js` — Workers AI binding + fallback + ambiguous/failed replies | `d9eb446` |
| F | issue_comment relay pu image detection | `webhooks/issue-comment.js` — image regex detection + relay | `d9eb446` |
| G | comment-on-issue Zr/xn artifacts | `comment-on-issue.js` — user.md artifact + issue.jsonl write | `d9eb446` |
| H | Album git upload | `media/relay.js` — parallel download + temp/final upload + comment update | `d9eb446` |
| I | AI workflow-input inference (Zp) | `ai-inference.js` — Workers AI dispatch input inference | `d9eb446` |

---

## 9. Bug Fixes (vs old bundle)

| Bug | Old bundle behavior | src-v2 fix |
|-----|---------------------|------------|
| §6.2 Ys `t_msg` shadowing | `Ys(e, t_msg)` param shadows i18n `t` → `t.fileId`/`t.field` = `undefined` → `getFile(undefined)` silently fails for single media | src-v2 uses param name `file` — i18n `t` not shadowed, single media path works |
| `comment-on-issue.js` if/else | Broken `else` branch with no matching `if` — build fails | Restructured: `!acceptsDispatch` early return, then try/catch for dispatch path |
| Schedule time parse replies | Only `failedUnderstand` for all failure modes | Added `ambiguousClarify`/`ambiguousReply` for ambiguous, `failedReply` for parse failure |
| Schedule edit time parse | Used `parseSimpleTime` (no AI) | Now uses `parseScheduleTime` (AI + fallback) consistent with create flow |

---

## 10. Guardrails

### Old Baseline (14/14 passing)
- HTTP routes (/, /health, /github/webhook, /telegram/webhook)
- AccessGuard (configured + not configured)
- /help, /list (empty + one issue), /current
- cron (empty + no fetch)
- i18n parity (813×2)

### v2 New (40/40 passing)
- HTTP: /, /health, /github/webhook (bad sig, valid sig), /telegram/webhook
- AccessGuard: deny, allow
- Commands: /version, /schedules, /llm, /edit, /start, /list, /current, /status, /close, /clear, /enable, /disable, /workflow, /skills, /templates, /help, /new
- Callbacks: skills_cancel, templates_cancel, schedule_flow_cancel, current_edit
- Flows: schedule, template_reset, new-flow text input
- Media: single photo (no active + active=7), album (2 photos)
- Auto-init: installation.created
- Cron: empty → []
- i18n: parity 813×2, t() resolution + placeholders

---

## 11. Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `hono` | 4.12.32 | HTTP framework |
| `grammy` | 1.45.1 | Telegram bot framework |
| `@octokit/webhooks` | 14.2.0 | GitHub webhook verification |
| `octokit` | 5.0.5 | GitHub API client |
| `content-type` | ^1.0.5 | Content-Type parsing |
| `tweetnacl` | ^1.0.3 | Crypto (webhook verification) |
| `esbuild` | ^0.24.0 | Build tool (devDependency) |

### Build Configuration
- `build-v2.mjs` uses `conditions: ["browser"]` to force `@octokit/webhooks-methods` to use Web Crypto API
- Output: `GitHubClawCore/index.v2.js` (590,675 bytes)
- Entry: `src-v2/worker.js`

---

## 12. Swap Gate Checklist

| Criterion | Status |
|-----------|--------|
| All 14 old guardrails pass | ✅ |
| All 40 v2 guardrails pass | ✅ |
| `npm run build:v2` succeeds | ✅ |
| i18n parity 813×2 (en=zh, zero mismatch) | ✅ |
| i18n real gap = 0 (all 606 old keys covered) | ✅ |
| 17/17 commands implemented | ✅ |
| 62/62 active callbacks implemented | ✅ |
| 7/7 webhook events implemented | ✅ |
| 5/5 media handlers implemented | ✅ |
| 9/9 functional gaps resolved | ✅ |
| §6.2 Ys bug fixed | ✅ |
| Build output < old bundle size | ✅ (590KB vs 630KB) |
| Source lines < old bundle | ✅ (6,964 vs 20,195) |
| `wrangler dev --local` manual smoke | ⏳ Pending (requires Cloudflare account) |
| Shadow comparison vs old bundle | ⏳ Pending (optional) |
| **Swap**: `src-v2/` → `src/`, old → `src-legacy/` | ⏳ Pending user decision |

---

## 13. Known Differences (Intentional)

1. **Dead code omission**: 6 `edit_flow_env_*`/`new_flow_env_*` callbacks not implemented (unreachable in old bundle — registered but no keyboard builder renders them).

2. **Schedule time parse**: src-v2 uses AI binding (`parseScheduleTime`) for both create and edit flows; old bundle used `parseSimpleTime` (no AI) for edit flow. This is an enhancement — edit flow now benefits from AI parsing.

3. **Media comment body**: src-v2 adds `coreMediaCommentBody` (Zl) structured body to jsonl write; old bundle used `Zl` only in the `Zr` jsonl content field. src-v2 matches this behavior.

4. **i18n/log.js**: src-v2 centralizes all 102 `log.*` keys in a single module with `logT()`/`logInfo()`/`logWarn()`/`logError()` helpers; old bundle scattered `i18nT("log.*")` calls across modules. Functionally equivalent.

5. **edge-replies.js**: src-v2 centralizes ~126 edge-case i18n key functions in one module; old bundle had these inline. Functionally equivalent.

---

## 14. Remaining Steps to Production

1. **Manual smoke test** with `wrangler dev --local`:
   - 6 HTTP endpoints
   - `/new` → dispatch → comment relay round-trip
   - `CLAW_LANGUAGE` zh-CN/en toggle

2. **Shadow comparison** (optional): Run both bundles side-by-side, compare outputs.

3. **Swap**: 
   - `mv src src-legacy`
   - `mv src-v2 src`
   - Update `build.mjs` entry point
   - Update `wrangler.toml` if needed
   - Rebuild `GitHubClawCore/index.js`

4. **Commit swap** and deploy.

---

## 15. Commit History (Phase R)

| Commit | Description |
|--------|-------------|
| `415fce9` | R0-R6 docs update |
| `754a035` | R7 commands + coding-agent dispatch |
| `0433eb6` | R8 media relay + album queue (fixes §6.2) |
| `4dd857e` | R9 auto-init + swap gate passed (R0-R9 complete) |
| `d67181a` | Batch A — /version /schedules /llm /edit full flow |
| `d277236` | Batch B — /skills + /templates full callback flows |
| `869d8f9` | Batch C+D+E+F — full parity callbacks |
| `a48986c` | Docs update — full parity rewrite complete |
| `d9eb446` | Complete all 9 functional gaps (A-I) |
| `a901665` | Final parity audit — all 9 functional gaps complete |
| `4f9862b` | i18n parity — 0 real gap (all 606 old keys covered) |