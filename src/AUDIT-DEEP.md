# Phase R — Deep Parity Audit (Findings + Status)

> Generated: 2026-07-29 (commit `local`)
> Method: 4 parallel subagents deep-comparing src-v2 against old bundle `src/index.js`
> Status: All P0 fixed, most P1 fixed, remaining P2 tracked

---

## Severity Legend

- **P0 Critical** — Broken end-to-end, data loss, or dead code
- **P1 Major** — Behavior regression vs old bundle, wrong UX
- **P2 Minor** — Cosmetic, missing logging, layout differences
- ✅ = Fixed
- ⬜ = Remaining (lower priority)

---

## Summary

| Category | Total | Fixed ✅ | Remaining ⬜ |
|----------|-------|---------|-------------|
| P0 Critical | 11 | 11 | 0 |
| P1 Major | 20 | 16 | 4 |
| P2 Minor | 15 | 9 | 6 |
| **Total** | **46** | **36** | **10** |

---

## P0 — Critical Issues (11/11 Fixed ✅)

All P0 issues resolved in commit `4f186b4`.

### ✅ P0-1: `current_edit` → calls `initEditFlow(ctx)`
### ✅ P0-2: AI inference NL trigger wired into message:text chain
### ✅ P0-3: `template_reset_select` uses orphan pipeline (Er+ai+Sr+Vr+status card)
### ✅ P0-4: Auto-init creates branch+workflow+D1+repo variable
### ✅ P0-5: `osCreateFinalize` edit mode with workflow sync + D1 persist
### ✅ P0-6: AI YAML parser indent-aware
### ✅ P0-7: `computeNextRun` handles all 10+ rule types
### ✅ P0-8: `/schedules` camelCase field reads
### ✅ P0-9: `/skills` installed path → `.agents/skills`
### ✅ P0-10: `rulePayload` JSON.parse
### ✅ P0-11: Relay skip conditions (bot echo/line/schedule/no meta)

---

## P1 — Major Issues (16/20 Fixed ✅)

### ✅ P1-1: comment-on-issue always creates comment (no message loss)
### ✅ P1-2: Schedule callbacks use `reply` instead of `editMessageText`
- **Fix:** All schedule callbacks (manage_schedule, schedule_open, schedule_edit_*, schedule_toggle, schedule_delete, schedule_chat_*) now use `ctx.reply(...)` for new messages. `schedule_flow_cancel` uses editMessageText with reply fallback.

### ✅ P1-3: Schedule list rendering + keyboards
- **Fix:** `manage_schedule`, `schedule_delete`, `schedule_chat_list`, `schedule_chat_delete` now render numbered lists with rule descriptions + inline keyboards (open buttons + new/manage buttons).

### ✅ P1-4: Schedule closed-issue guards
- **Fix:** `set_schedule` validates issue is open. `schedule_edit_*`, `schedule_toggle`, `schedule_chat_open` check closed state — closed issues get delete-only keyboard + `lobsterClosedDeleteOnly` message.

### ✅ P1-5: Schedule `|chat` suffix for chat-source keyboards
- **Fix:** `scheduleCardKeyboard` now accepts `source` param, appends `|chat` to all callback data for chat-source cards. Added `scheduleChatCardKeyboard` for standalone chat cards.

### ✅ P1-6: Callback names `skills_pick:`/`templates_pick:`
### ✅ P1-7: Skills/templates pagination + cancel buttons
- **Fix:** 8 per page, 2 per row, prev/next page buttons, cancel button. Page stored in install state.

### ✅ P1-8: D1 workflow-notification records in callback dispatch
### ✅ P1-9: /edit finalize workflow sync + metadata persist
### ✅ P1-10: close_issue_confirm schedule cleanup
### ✅ P1-11: Line-bot `reply` instead of `editMessageText` + promptMessageId
- **Fix:** All step transitions use `ctx.reply(...)`. `promptMessageId` stored in state.

### ✅ P1-12: Line-bot required fields (no skip for bot_id/channel_id)
- **Fix:** `linebot_input_skip` blocks skip on required fields. `linebot_edit:<field>` uses cancel-only keyboard for required fields.

### ✅ P1-13: Line-bot field validation
- **Fix:** bot_id (`@[\w.-]+`), channel_id (`\d+`), utc_offset (`[+-]\d{2}:\d{2}`) validation in `handleLineText`.

### ✅ P1-14: Line-bot confirm-deploy card detail lines
- **Fix:** Confirm card now shows bot ID, channel ID, reply msg, lobster, timezone.

### ✅ P1-15: Workflow-run line-bot post-install flow
- **Fix:** Post-install now persists LINE flow state + sends with continue/skip keyboard.

### ✅ P1-16: /llm model validation
- **Fix:** Added `validateModel()` querying provider API (OpenAI/Anthropic/Groq/Google/OpenRouter) to validate model exists. Graceful fallback if API unavailable.

### ✅ P1-17: /list 401/403/404 error mapping
### ✅ P1-18: edit_keep_field step-match guard
### ✅ P1-19: Per-callback error handlers
- **Fix:** `bot.catch` now answers callbackQuery with error message + replies `core.unknownError` to user.

### ✅ P1-20: MarkdownV2 escaping in AI inference replies + secret regex fix

---

## P2 — Minor Issues (9/15 Fixed ✅)

### ✅ P2-3: webhookPath `/` normalization
### ✅ P2-4: AI model defaults from config
### ✅ P2-5: Status card "File:" label fix
### ✅ P2-6: Status card workflow-runs query
- **Fix:** Now queries `listWorkflowRuns` to detect running status.

### ✅ P2-13: `/api/active-issue` route
### ✅ P2-15: Dispatch error classification (disabled vs not-found)
- **Fix:** Distinguishes "disabled" (restingMessage1/2/3) from "not found" (delete comment) from generic (dispatchFailed).

### ⬜ P2-1: Systemic logging i18n regression (102 log.* keys not called)
### ⬜ P2-2: Config required-throw (7 env vars optional-null)
### ⬜ P2-7: Status card schedule line cleanup (prompt shown twice)
### ⬜ P2-8: nextRunAt not locale-formatted
### ⬜ P2-9: new_template_select missing template revalidation
### ⬜ P2-10: Media missing user.md artifact
### ⬜ P2-11: Media album missing jsonl write
### ⬜ P2-12: Media no-branch fallback missing structured header
### ⬜ P2-14: Cross-tree import (src-v2 → src/modules/)

---

## Guardrail Status
- 14 old baseline: ✅ all pass
- 40 v2 new: ✅ all pass
- **54 total, 0 failures**

## Build Status
- `npm run build:v2`: ✅ (611,818 bytes)
- i18n parity: ✅ 813×2, 0 real gap
- Source: ~7,100 lines (vs old 20,195)