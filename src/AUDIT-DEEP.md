# Phase R — Deep Parity Audit (Final Status)

> Generated: 2026-07-29
> Method: 4 parallel subagents deep-comparing src-v2 against old bundle `src/index.js`

---

## Summary

| Category | Total | Fixed ✅ | Remaining ⬜ |
|----------|-------|---------|-------------|
| P0 Critical | 11 | 11 | 0 |
| P1 Major | 20 | 20 | 0 |
| P2 Minor | 15 | 13 | 2 |
| **Total** | **46** | **44** | **2** |

**All P0 + all P1 resolved.** Only 2 P2 items remain (logging i18n wiring + media album user.md — both low priority).

---

## All P0 Fixed (11/11 ✅)

| # | Issue | Fix |
|---|-------|-----|
| P0-1 | current_edit stub | calls `initEditFlow(ctx)` |
| P0-2 | AI inference dead code | wired into message:text chain |
| P0-3 | template_reset naive commit | orphan pipeline (Er+ai+Sr+Vr) |
| P0-4 | auto-init incomplete | branch+workflow+D1+repo variable |
| P0-5 | osCreateFinalize edit mode | workflow sync + D1 persist always |
| P0-6 | AI YAML regex parser | indent-aware parser |
| P0-7 | computeNextRun 3/10 types | all 10+ rule types with tz math |
| P0-8 | /schedules snake_case | camelCase reads |
| P0-9 | /skills installed path | `.agents/skills` |
| P0-10 | rulePayload not parsed | JSON.parse in camelSchedule |
| P0-11 | relay no skip conditions | shouldSkipRelay() |

## All P1 Fixed (20/20 ✅)

| # | Issue | Fix |
|---|-------|-----|
| P1-1 | comment-on-issue message loss | always create comment |
| P1-2 | schedule editMessageText | reply for new messages |
| P1-3 | schedule no list rendering | numbered lists + keyboards |
| P1-4 | schedule no closed-issue guard | closed check + delete-only kb |
| P1-5 | schedule no \|chat suffix | source param + \|chat suffix |
| P1-6 | callback name mismatch | skills_pick:/templates_pick: |
| P1-7 | no pagination | 8/page, 2/row, prev/next, cancel |
| P1-8 | no D1 notification records | createWorkflowNotification() |
| P1-9 | /edit finalize incomplete | workflow sync + D1 always |
| P1-10 | close no schedule cleanup | deleteSchedulesByIssue() |
| P1-11 | line-bot editMessageText | reply + promptMessageId |
| P1-12 | line-bot skip required fields | cancel-only keyboard |
| P1-13 | line-bot no validation | bot_id/channel_id/utc_offset regex |
| P1-14 | line-bot confirm card | detail lines (id/channel/reply/lobster/tz) |
| P1-15 | workflow-run line-bot post-install | state + continue/skip keyboard |
| P1-16 | /llm no model validation | validateModel() (5 providers) |
| P1-17 | /list generic error | 401/403/404 mapping |
| P1-18 | edit_keep_field no step guard | step === state.step check |
| P1-19 | no per-callback error handler | bot.catch answers + replies |
| P1-20 | no MarkdownV2 escaping | escapeMdV2() in AI replies |

## P2 Fixed (13/15 ✅)

| # | Issue | Fix |
|---|-------|-----|
| P2-2 | config optional-null | required-throw when bot token set |
| P2-3 | webhookPath normalization | prepend / |
| P2-4 | AI model defaults | @cf/openai/gpt-oss-20b |
| P2-5 | status card File: label | hardcoded "File:" |
| P2-6 | status card no runs query | listWorkflowRuns running detection |
| P2-7 | schedule card duplicate fields | removed prompt inline + notifyShort |
| P2-8 | nextRunAt raw ISO | formatLocalTime() with Asia/Taipei |
| P2-9 | no template revalidation | revalidate on new_template_select |
| P2-10 | media no user.md | write artifact for single media |
| P2-11 | album no jsonl | write issue.jsonl for album |
| P2-12 | no-branch media no header | telegram-meta + messageFromSource |
| P2-13 | /api/active-issue missing | GET /api/active-issue route |
| P2-14 | cross-tree import | inlined workflow_notifications DDL |
| P2-15 | dispatch error classification | disabled vs not-found vs generic |

## Remaining (2 ⬜)

| # | Issue | Effort | Priority |
|---|-------|--------|----------|
| P2-1 | 102 log.* keys not called in code paths | Large | Low |
| P2-11b | Album user.md artifact (single done, album pending) | Small | Low |

---

## Guardrail Status
- 14 old baseline: ✅ all pass
- 40 v2 new: ✅ all pass
- **54 total, 0 failures**

## Build Status
- Build: ✅ 614,509 bytes
- i18n: ✅ 813×2 parity, 0 real gap
- Source: ~7,200 lines (vs old 20,195)