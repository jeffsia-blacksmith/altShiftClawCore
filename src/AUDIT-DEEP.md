# Phase R — Complete Parity Audit (4 Rounds, 132 Items)

> **Final state: 2026-07-30, commit `61cfdcf`**
> Branch: `phase-r/refactor`
> Method: 18 parallel subagents across 4 rounds doing component-level behavior audit

---

## 1. Executive Summary

| Metric | Old Bundle | src-v2 | Status |
|--------|-----------|--------|--------|
| Source lines | 20,195 | 8,215 (58 files) | 41% of old |
| Build output | 630,789 bytes | 661,765 bytes | |
| i18n leaf keys (en/zh) | 813 | 813 | 100% parity |
| i18n keys used (old) | 606 | 668 (src-v2 superset) | |
| **i18n real gap** | — | **0** | **100% parity** |
| Telegram commands | 17 | 17 | 100% parity |
| Telegram callbacks (active) | 62 | 62 | 100% parity |
| Callbacks (dead code) | 6 | 0 (omitted) | Documented |
| GitHub webhook events | 7 | 7 | 100% parity |
| Media handlers | 5 | 5 | 100% parity |
| Guardrails (old baseline) | 14 | 14 | 0 regressions |
| Guardrails (v2 new) | — | 40 | All green |
| **Total guardrails** | **14** | **54** | **All passing** |
| **Audit items fixed** | — | **132/132** | **Complete** |

---

## 2. Audit Rounds

### Round 1: Structural / Missing Features (46 items)

| # | Issue | Fix |
|---|-------|-----|
| P0-1 | current_edit stub | initEditFlow(ctx) full state machine |
| P0-2 | AI inference dead code | wired into message:text chain |
| P0-3 | template_reset naive commit | orphan pipeline (Er+ai+Sr+Vr) |
| P0-4 | auto-init incomplete | branch+workflow+D1+repo variable |
| P0-5 | osCreateFinalize edit mode | workflow sync + D1 persist always |
| P0-6 | AI YAML regex parser | indent-aware parser |
| P0-7 | computeNextRun 3/10 types | all 10+ rule types + tz math |
| P0-8 | /schedules snake_case | camelCase reads |
| P0-9 | /skills installed path | `.agents/skills` |
| P0-10 | rulePayload not parsed | JSON.parse in camelSchedule |
| P0-11 | relay no skip conditions | shouldSkipRelay() |
| P1-1~20 | (20 P1 items) | See commit history |
| P2-1~15 | (15 P2 items) | See commit history |

### Round 2: Critical Behavior Bugs (20 items)

| # | Issue | Fix |
|---|-------|-----|
| R2-1 | isSystemComment rejects telegram-meta | Only reject brain-result/tool-run/line-meta |
| R2-2 | hasCommentMeta needs non-existent marker | Now checks telegram-meta |
| R2-3 | createWorkflowNotification undeclared vars | Destructured, all NOT NULL columns |
| R2-4 | stripToUserMessage strips code blocks | Preserves code blocks, targeted HTML strip |
| R2-5 | parseEventSource reads wrong marker | Reads telegram-meta |
| R2-6 | updateSchedule skips null | null now writes (clears fields) |
| R2-7 | camelSchedule no Number coercion | Number(), trimNull(), ?? null |
| R2-8 | Secrets plaintext | github/secrets.js libsodium encryption |
| R2-9 | command_menu_* missing | 8 reply-keyboard callbacks registered |
| R2-10 | LLM text handler ordering | Moved before other flows |
| R2-11~20 | (10 more items) | See commit `0d78b46` |

### Round 3: Component-Level Behavior (50 items, 6 agents)

| Component | Key Findings |
|-----------|-------------|
| Bot middleware | LLM ordering fixed, command_menu registered |
| i18n params | 17 non-existent keys, 15 param mismatches fixed |
| D1 schema | createWorkflowNotification, null handling fixed |
| Coding-agent dispatch | dispatch gate fully functional |
| Schedule flow | State guards, status card, computeNextRun |
| Skills/templates | Secrets encryption, D1 notifications, manifest |
| Edit/new flow | editMessageText, isSubmitting, error classification |
| LLM/line-bot | Missing keys, issue_number validation, parse_mode |
| Status-card/commands | Double-escape, keyboard titles, notify keys |

### Round 4: Remaining Low/Medium (16 items)

| # | Issue | Fix |
|---|-------|-----|
| 1 | log.* {error} placeholders | Added to ~30 JSON keys (en+zh) |
| 2 | Chinese 每 N 分 regex | parseSimpleTime fallback |
| 3 | Catalog stale-cache | 5-min cache with stale-on-failure |
| 4 | Model labels | GitHub Copilot / Codex |
| 5 | @botname suffix | Stripped in NL command |
| 6 | /api/active-issue | Number parsing + validation |
| 7 | osEditFinalize error | clearFlowState on failure |
| 8 | sendStatusCard | try/catch wrapper |
| 9 | extractRequestId regex | Anchored + alphanumeric |
| 10 | Workflow runs per_page | 5→10 |
| 11 | formatLocalTime | Default locale format |
| 12 | Template reset keyboard | skip+cancel separate rows |
| 13 | line-bot parse_mode | MarkdownV2 on all messages |
| 14 | D1 notification ordering | Before dispatch + delete on failure |
| 15 | line-bot edit labels | Short kb.* labels |
| 16 | Empty-input errors | Required field messages |

---

## 3. Verification Status

```
Build:          ✅ 661,765 bytes
Guardrails v2:  ✅ 40/40 passed
Guardrails old: ✅ 14/14 passed
i18n parity:    ✅ 813×2, zero mismatch
i18n real gap:  ✅ 0 (606 old keys → 668 v2 keys)
Unused imports: ✅ Clean
CJK in code:   ✅ Only business logic (regex patterns, input tokens)
```

---

## 4. Module Inventory (58 files)

| Area | Files | Lines |
|------|-------|-------|
| Entry + Config | 3 | ~110 |
| HTTP | 4 | ~200 |
| i18n | 3 | ~220 |
| Database | 3 | ~310 |
| GitHub | 6 | ~670 |
| Telegram core | 8 | ~1,400 |
| Telegram commands | 11 | ~700 |
| Telegram flows | 12 | ~3,500 |
| Media | 2 | ~300 |
| Scheduler | 1 | ~135 |
| Coding-agent | 1 | ~265 |
| Secrets | 1 | ~50 |
| **Total** | **58** | **~8,215** |

---

## 5. Command/Callback/Webhook Parity

### Commands (17/17)
start, help, list, current, status, version, schedules, skills, templates, close, clear, enable, disable, workflow, new, edit, llm

### Active Callbacks (62/62)
skills_pick, skills_preview_confirm/back, skills_update/remove_from_list, skills_remove_confirm, skills_existing_secret, skills_overwrite, skills_confirm, skills_cancel, skills_page, set_schedule, manage_schedule, schedule_open, schedule_edit_*, schedule_flow_cancel, schedule_payload_skip, schedule_toggle, schedule_delete, schedule_chat_list/open/delete, llm_provider/key/model/model_custom/cancel, new_flow_cancel, new_template_select, templates_pick/preview_confirm/back/overwrite/model_pick/confirm/cancel/env_*/page, linebot_setup_continue/skip, linebot_input_skip, linebot_deploy_confirm/cancel, linebot_edit/back/params, edit_keep_field, edit_workflow_enabled, edit_template_reset:skip, current_template_reset, template_reset_select/cancel, current_edit, switch_issue, close_issue_prompt/cancel/confirm, command_menu_* (8)

### Dead Code Callbacks (6 — intentionally omitted)
edit_flow_env_cancel/setup/skip, new_flow_env_cancel/setup/skip

### Webhook Events (7/7)
issues.opened, installation.created, issue_comment.created, issue_comment.edited, workflow_run.requested/in_progress/completed

### Media Handlers (5/5)
message:photo (single+album), message:voice, message:video, message:audio, message:document

---

## 6. Known Intentional Differences

1. **Dead code omission**: 6 env callbacks (unreachable in old bundle)
2. **Config validation**: Required fields optional until bot token set (allows /health on empty env)
3. **LLM model validation**: List-then-includes strategy (old uses direct GET /models/{model})
4. **D1 in-Worker migrations**: Creates kv_state, workflow_notifications, album_queue (not schedules/issue_metadata — relies on wrangler migrations, same as old)
5. **Index names**: `idx_wn_*` vs migration `idx_workflow_notifications_*` (harmless duplicates)

---

## 7. Commit History (Phase R)

| Commit | Description |
|--------|-------------|
| `415fce9`–`0433eb6` | R0-R9 bootstrap + HTTP + i18n + Telegram + flows + webhooks + cron + commands + media |
| `d67181a`–`a901665` | Batch A-D: full parity callbacks + 9 functional gaps |
| `4f9862b` | i18n parity — 0 real gap |
| `dbeb10d` | Deep audit — 46 findings documented |
| `4f186b4` | Round 1 fixes — all P0 + key P1 |
| `1e9e638` | P1 schedule UX + line-bot + LLM + error handlers |
| `318bfd9` | P2 batch — 44/46 fixed |
| `e1c31e4` | log.* i18n + album user.md — 46/46 |
| `0d78b46` | Round 2: critical behavior parity (dispatch, D1, secrets, etc.) |
| `7ce7bc1` | Round 3: FATAL i18n keys + HIGH behavior fixes |
| `fcefca5` | Round 4: remaining items — 132/132 complete |
| `61cfdcf` | Final audit documentation |