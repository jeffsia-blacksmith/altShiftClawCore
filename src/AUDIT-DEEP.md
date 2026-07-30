# Phase R — Deep Parity Audit (Round 2 — Complete)

> Final: 2026-07-30 (commit `0d78b46`)
> Method: 6 parallel subagents doing behavior-level audit of src-v2 vs old bundle

---

## Round 2 Audit Summary

Round 1 (46 items) was mostly structural/missing-feature fixes. Round 2 found **critical behavior bugs** where src-v2 code existed but was functionally broken.

### Round 2 Critical Fixes (all resolved ✅)

| Severity | Issue | Fix |
|----------|-------|-----|
| FATAL | dispatch.js `isSystemComment` rejected telegram-meta → dispatch never fired | Fixed: only rejects brain-result/tool-run/line-meta |
| FATAL | dispatch.js `hasCommentMeta` required non-existent `githubclaw-comment-meta` | Fixed: now checks `telegram-meta` (matching old `al`) |
| FATAL | `createWorkflowNotification` undeclared vars + wrong columns | Fixed: destructured, all NOT NULL columns, correct schema |
| FATAL | `stripToUserMessage` stripped all code blocks | Fixed: preserves code blocks, targeted HTML tag strip |
| FATAL | `parseEventSource` read non-existent marker | Fixed: reads `telegram-meta` (matching old `cE`) |
| CRITICAL | `updateSchedule` skipped null → couldn't clear eventData/lastError | Fixed: null now writes (matching old bundle) |
| CRITICAL | `camelSchedule` no Number coercion, no eventData trim | Fixed: Number(), trimNull(), ?? null |
| CRITICAL | Secrets written as plaintext, not libsodium-encrypted | Fixed: `github/secrets.js` with proper encryption |
| CRITICAL | `command_menu_*` reply-keyboard callbacks missing | Fixed: registered 8 callbacks |
| HIGH | LLM text handler ordering wrong (after other flows) | Fixed: moved before other flows |
| HIGH | Template manifest `need_model`/`model_var` snake_case not read | Fixed: reads both cases |
| HIGH | Template models not normalized (strings→{value,label}) | Fixed: normalized |
| HIGH | `templates_model_pick` wrong error message | Fixed: proper error text |
| HIGH | workflow-run no MarkdownV2 escaping | Fixed: escapeMdV2 on all dynamic values |
| HIGH | workflow-run no editMessageText→sendMessage fallback | Fixed: fallback added |
| HIGH | workflow-run chat_id/message_id as strings not numbers | Fixed: Number() |
| MEDIUM | Schedule no state-integrity guards | Fixed: validates required fields + scheduleId |
| MEDIUM | Schedule no issue-status card after config card | Fixed: sends status card (old `Es` call) |
| MEDIUM | Error regex too broad (spurious comment deletion) | Fixed: requires workflow context |
| MEDIUM | Resting/dispatchFailed missing name param + blank line | Fixed: name from userMessage, blank line |

### Round 2 Additional Fixes

| Issue | Fix |
|-------|-----|
| `skills_remove_confirm` missing D1 notification | Added `createWorkflowNotification` call |
| `extractRequestId` regex diverges from old | Anchored, alphanumeric |
| `isScheduleFlowRecord` parsed wrong marker | Now reads telegram-meta |

---

## Final Status

| Metric | Value |
|--------|-------|
| Guardrails v2 | 40/40 ✅ |
| Guardrails old | 14/14 ✅ |
| **Total** | **54/54 ✅** |
| Build | 657,168 bytes ✅ |
| i18n parity | 813×2, 0 gap ✅ |
| Source lines | ~8,000 (40% of old 20,195) |
| Round 1 audit items | 46/46 ✅ |
| Round 2 critical fixes | 20/20 ✅ |