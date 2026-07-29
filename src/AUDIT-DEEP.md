# Phase R — Deep Parity Audit (Findings + Action Items)

> Generated: 2026-07-29 (post-i18n-parity, commit `4f9862b`)
> Method: 4 parallel subagents deep-comparing src-v2 against old bundle `src/index.js`
> Purpose: Identify ALL remaining gaps, regressions, and incomplete implementations

---

## Severity Legend

- **P0 Critical** — Broken end-to-end, data loss, or dead code
- **P1 Major** — Behavior regression vs old bundle, wrong UX
- **P2 Minor** — Cosmetic, missing logging, layout differences

---

## P0 — Critical Issues (11)

### P0-1: `current_edit` callback is a stub — /edit flow never initializes
- **File:** `src-v2/telegram/flows/template-reset-callbacks.js:85-95`
- **Old:** `src/index.js:14533-14545` — calls `initEditFlow` which runs full `Rm` (fetch issue, parse profile, set 4-step state machine, render keyboard)
- **src-v2:** Only calls `setActiveIssue` + answers toast + replies `editNamePrompt` text. No `setFlowState`, no issue fetch, no profile parse, no keyboard.
- **Impact:** Subsequent `edit_keep_field`/`edit_workflow_enabled` callbacks find no state → broken end-to-end.

### P0-2: AI inference `handleNaturalLanguageCommand` is dead code
- **File:** `src-v2/telegram/ai-inference.js` (imported at `bot.js:31` but never called)
- **Old:** `src/index.js:13276-13282` — `Fn.on("message:text")` parses `/<command> <args>` and calls `RT` (NL workflow trigger)
- **src-v2:** Only slash commands registered; NL trigger path unreachable.
- **Impact:** Entire natural-language workflow trigger feature dead.

### P0-3: `template_reset_select` uses naive per-file commit instead of orphan-branch pipeline
- **File:** `src-v2/telegram/flows/template-reset-callbacks.js:44-74`
- **Old:** `src/index.js:14489-14519` — `Er` (read template) + `ai` (orphan commit) + `Sr` (sync workflow) + `Vr` (D1 upsert)
- **src-v2:** Loops `createOrUpdateFileContents` per file. Missing: orphan branch creation, workflow yml sync, D1 issue_metadata upsert, personality merge.
- **Impact:** Git history polluted, workflow not updated, D1 stale.

### P0-4: Auto-init creates no branch/workflow/issue_metadata, never sets `INIT_GITHUB_CLAW`
- **File:** `src-v2/github/webhooks/installation.js:30-48`
- **Old:** `src/index.js:19372-19450` — creates orphan branch + template files + workflow yml + D1 issue_metadata + sets `INIT_GITHUB_CLAW=false` repo variable
- **src-v2:** Creates issue only. No branch, no workflow, no D1, no repo variable (only KV).
- **Impact:** First lobster non-functional (no branch/workflow). Repo variable never set → re-install attempts.

### P0-5: `osCreateFinalize` missing entire `edit` mode
- **File:** `src-v2/github/branches.js:173-204`
- **Old:** `src/index.js:7407-7533` — handles both create AND edit. Edit: looks up existing template, fallback chain `[template, K, "default"]`, updates issue, toggles workflow, on `resetTemplate` does full orphan+sync+upsert.
- **src-v2:** Only implements `create`.
- **Impact:** `/edit` finalize path broken (also related to P0-1).

### P0-6: AI YAML parser is naive regex — fails on most real workflows
- **File:** `src-v2/telegram/ai-inference.js:74-82`
- **Old:** `src/index.js:12977-13038` — `Um` is indent-aware YAML parser with quote-stripping, `required`/`default`/`type`/`description` extraction
- **src-v2:** Regex `/workflow_dispatch:\s*\n((?:\s+\w+:.*\n?)+)/` — fails on indented `on:` blocks, quoted values, multi-line descriptions, list-form `on:`.
- **Impact:** AI workflow-input inference broken for most workflows.

### P0-7: Schedule `computeNextRun` only handles 3 of 10+ rule types
- **File:** `src-v2/telegram/flows/schedule-flow.js:29-37` + `src-v2/scheduler/cron.js:20-41`
- **Old:** `src/index.js:13750-13777` — handles `once`, `every_N_minutes`, `interval`, `cron`, `minutely`, `daily`, `hourly`, `weekly`, `weekday`, `weekenday` with timezone math
- **src-v2:** Only `once`, `every_N_minutes`, `interval`. Everything else → `+1h` fallback.
- **Impact:** Daily/hourly/cron/weekly schedules fire hourly instead of intended cadence.

### P0-8: `/schedules` snake_case field reads — listing shows blank data
- **File:** `src-v2/telegram/commands/schedules.js:18,31,33,44`
- **Issue:** Reads `r.issue_number`, `r.next_run_at`, `r.rule_type` (snake_case) but `db/schedules.js` `camelSchedule` returns `issueNumber`, `nextRunAt`, `ruleType` (camelCase).
- **Impact:** Every schedule row renders with blank issue number, blank next-run, blank rule type.

### P0-9: `/skills` installed-list path wrong
- **File:** `src-v2/telegram/commands/skills.js:23`
- **Issue:** Reads `path: \`issue-${issueNumber}\`` but old reads `path: ".agents/skills"` on the issue branch.
- **Impact:** Installed skills never detected → ✅ badges never show.

### P0-10: Status card `rulePayload` not JSON-parsed
- **File:** `src-v2/db/schedules.js:150`
- **Issue:** `camelSchedule` returns `rulePayload: row.rule_payload` as raw string. `scheduleRuleDescription()` expects object (`rp.expression`, `.minutes`, `.hour`).
- **Impact:** Schedule descriptions in `/status` card lose all timing detail.

### P0-11: Relay has no skip conditions — echo-loop risk
- **File:** `src-v2/github/webhooks/issue-comment.js:13-43`
- **Old:** `src/index.js:18804-18833` — skips relay when comment has its own telegram-meta (bot echo), line-meta, schedule-flow source, or no meta.
- **src-v2:** No skip conditions.
- **Impact:** Bot may echo its own comments back to Telegram; LINE/schedule comments relayed incorrectly.

---

## P1 — Major Issues (20)

### P1-1: `comment-on-issue` discards user messages when workflow disabled
- **File:** `src-v2/telegram/comment-on-issue.js:88-104`
- **Old:** `src/index.js:17853` — ALWAYS creates issue comment, then conditionally writes artifacts.
- **src-v2:** Only creates comment if `acceptsDispatch` (branch+workflow+enabled). Otherwise discards message.
- **Impact:** User messages lost when workflow disabled (branch exists but workflow disabled/manually off).

### P1-2: Schedule callbacks use `editMessageText` instead of `reply`
- **Files:** `src-v2/telegram/flows/schedule-flow.js` (manage_schedule, schedule_open, schedule_edit_*, schedule_flow_cancel, schedule_toggle, schedule_delete, schedule_chat_*)
- **Old:** Uses `e.reply(...)` (new message) for most schedule operations.
- **src-v2:** Uses `ctx.editMessageText(...)` (edits inline message).
- **Impact:** Wrong UX; inline message edited instead of new message sent.

### P1-3: Schedule callbacks missing list rendering + keyboards
- **Files:** `schedule-flow.js` (manage_schedule, schedule_delete, schedule_chat_list, schedule_chat_open, schedule_chat_delete)
- **Old:** Renders numbered list with id/nextRun/prompt + inline keyboard with schedule buttons.
- **src-v2:** Shows only title/empty text, no list, no keyboard.
- **Impact:** Users can't see or select schedules from chat-list view.

### P1-4: Schedule callbacks missing closed-issue guards
- **Files:** `schedule-flow.js` (schedule_edit_*, schedule_toggle, schedule_chat_open)
- **Old:** Checks if issue is closed → shows delete-only keyboard + `lobsterClosedDeleteOnly` message.
- **src-v2:** No closed-issue check.
- **Impact:** Users can edit/toggle schedules for closed issues.

### P1-5: Schedule keyboard missing `|chat` suffix for chat-source cards
- **File:** `schedule-flow.js:48-57`
- **Old:** `zd(e.id, e.issueNumber, ...|chat)` appends `|chat` for chat-source cards.
- **src-v2:** Never appends `|chat`.
- **Impact:** Chat-source schedules get issue-source treatment, losing chat context and guards.

### P1-6: `/skills` and `/templates` callback names mismatch old contract
- **Files:** `skills.js:83` (`skill_select:` vs old `skills_pick:`), `templates.js:71` (`template_select:` vs old `templates_pick:`)
- **Impact:** Downstream callback handlers expect `skills_pick:`/`templates_pick:` — clicking a skill/template may not trigger the install flow.

### P1-7: `/skills` and `/templates` missing pagination + cancel buttons
- **Files:** `skills.js:79-86`, `templates.js:68-73`
- **Old:** 8 per page, 2 per row, prev/next page buttons, cancel button.
- **src-v2:** Single column, first 20 only, no pagination, no cancel.
- **Impact:** >20 skills/templates invisible; can't cancel without /cancel command.

### P1-8: Missing D1 workflow-notification records in callback dispatch
- **Files:** `skills-callbacks.js` (skills_confirm, skills_remove_confirm), `templates-callbacks.js` (templates_confirm), `line-bot.js` (linebot_deploy_confirm)
- **Old:** Calls `Gt(d1, {...})` to record dispatch in `workflow_notifications` table.
- **src-v2:** Omits D1 record entirely.
- **Impact:** Workflow status tracking broken — `workflow_run` handler can't match runs to requests.

### P1-9: `/edit` finalize missing branch-rebuild, workflow-sync, issue_metadata persist
- **File:** `src-v2/telegram/flows/edit-flow.js:168-231`
- **Old:** `src/index.js:7424-7486` — always syncs workflow yml + persists issue_metadata + rebuilds branch if missing.
- **src-v2:** Only does these inside `resetTemplate` block. Non-reset edits leave metadata stale, don't sync workflow.
- **Impact:** Editing name/description without reset → workflow yml stale, D1 metadata stale.

### P1-10: `close_issue_confirm` missing schedule cleanup
- **File:** `src-v2/telegram/flows/callbacks.js:139-195`
- **Old:** `src/index.js:14433-14437` — deletes schedules for closed issue, shows `closeClearedSchedules`/`closeNoSchedulesToClear`.
- **src-v2:** Does not delete schedules.
- **Impact:** Closed issue's schedules remain in D1 → cron fires and fails.

### P1-11: Line-bot: `editMessageText` instead of `et` (reply + clear prior + store promptMessageId)
- **File:** `src-v2/telegram/flows/line-bot.js` (all step transitions)
- **Old:** Uses `et()` helper which replies new message, clears prior keyboard, stores `promptMessageId`.
- **src-v2:** Uses `editMessageText` — no promptMessageId stored.
- **Impact:** Multi-step LINE flow continuity broken.

### P1-12: Line-bot allows skipping required `bot_id`/`channel_id`
- **File:** `line-bot.js:72-91`
- **Old:** Required fields get cancel-only keyboard (no skip). Optional fields get skip+cancel.
- **src-v2:** All fields get skip+cancel.
- **Impact:** LINE bot can be deployed without bot_id/channel_id.

### P1-13: Line-bot missing field validation
- **File:** `line-bot.js:197-203`
- **Old:** Validates bot_id (`@[\w.-]+`), channel_id (`\d+`), utc_offset (`+/-HH:MM`).
- **src-v2:** Accepts any trimmed text.
- **Impact:** Invalid LINE bot config accepted.

### P1-14: Line-bot confirm-deploy card missing detail lines
- **File:** `line-bot.js:179-180`
- **Old:** Shows bot id, channel id, reply msg, lobster, timezone.
- **src-v2:** Shows only `confirm_deploy_title`.
- **Impact:** User can't review config before deploy.

### P1-15: Workflow-run line-bot post-install flow broken
- **File:** `src-v2/github/webhooks/workflow-run.js:160-163`
- **Old:** Sends `line.postInstallPrompt` with continue/skip keyboard + persists LINE flow state.
- **src-v2:** Only overrides text — no keyboard, no state.
- **Impact:** LINE bot setup cannot continue after deploy.

### P1-16: `/llm` model validation skipped
- **File:** `src-v2/telegram/flows/llm/llm.js:356-362`
- **Old:** Queries provider API to validate model exists.
- **src-v2:** Explicitly skipped ("R9 minimal").
- **Impact:** Invalid custom model names accepted silently.

### P1-17: `/list` loses 401/403/404-specific error replies
- **File:** `src-v2/telegram/commands/list.js:67-68`
- **Old:** `hy(a)` maps 401/403 → `listErrorUnauthorized`, 404 → `listErrorNotFound`.
- **src-v2:** Always replies `listErrorGeneric`.
- **Impact:** Users get generic error for auth/not-found conditions.

### P1-18: `edit_keep_field` missing step-match guard
- **File:** `src-v2/telegram/flows/edit-flow.js:303`
- **Old:** `src/index.js:7694-7698` — verifies callback's step matches current state's step.
- **src-v2:** Doesn't verify.
- **Impact:** Stale buttons can advance wrong step.

### P1-19: No per-callback error handlers — silent failures
- **Files:** ALL callback files
- **Old:** Each callback group has error wrapper (`Ct`/`_t`/`xr`) that catches and reports `❌ <error>` to user.
- **src-v2:** Only `bot.catch` logs to console. User sees spinner stop with no feedback.
- **Impact:** All callback errors are silent failures.

### P1-20: No MarkdownV2 escaping in callbacks
- **Files:** ALL callback files
- **Old:** Escapes user content via `O()` + passes `parse_mode: "MarkdownV2"`.
- **src-v2:** No escaping, no parse_mode.
- **Impact:** User content with `*_[()~` etc. renders wrong or fails.

---

## P2 — Minor Issues (15)

### P2-1: Systemic logging i18n regression
- 102 `log.*` keys defined in `i18n/log.js` but never called. All logs use hardcoded English.
- **Impact:** Loses structured logging; breaks i18n log contract.

### P2-2: Config: 7 env vars changed from required-throw to optional-null
- `config.js:52-73` — `GITHUB_OWNER`, `GITHUB_REPO`, `TELEGRAM_BOT_TOKEN`, etc. return `null` instead of throwing.
- **Impact:** Downstream null-deref if env not set.

### P2-3: Config: `webhookPath` `/`-normalization missing
- `config.js:64` — doesn't prepend `/` if missing.
- **Impact:** Path `tg-hook` won't match `/tg-hook`.

### P2-4: Config: AI model defaults `null` vs `"@cf/openai/gpt-oss-20b"`
- `config.js:86-87` + `ai-inference.js:91` hardcodes `"meta/llama-4-scout-17b-16e-instruct"`.
- **Impact:** Wrong AI model used.

### P2-5: Status card "File:" uses wrong i18n key
- `status-card.js:157` — uses `core.llmProviderLabel` ("Provider") instead of "File:".
- **Impact:** Wrong label in status card.

### P2-6: Status card no workflow-runs query
- `status-card.js:80` — hardcodes `status = "idle"`. Never queries `listWorkflowRuns`.
- **Impact:** Running workflows show as "idle".

### P2-7: Status card schedule line shows prompt twice + duplicate notify fields
- `status-card.js:143-147` — inlines `prompt` AND shows `cardPrompt` below; shows both `notifyLabel` and `notifyShort`.
- **Impact:** Cluttered schedule card.

### P2-8: `nextRunAt` not locale-formatted
- `status-card.js:146` + `schedules.js` — passes raw ISO string. Old uses `Bt()` with `Asia/Taipei` timezone.
- **Impact:** Raw ISO timestamp shown instead of localized.

### P2-9: `new_template_select` missing template revalidation
- `edit-flow.js:400-407` — trusts button data, doesn't re-check template exists.
- **Impact:** Template uninstalled between listing and click → less helpful error.

### P2-10: Media missing `user.md` artifact (single + album)
- `relay.js` — old writes `artifacts/<commentId>/user.md` for all media. src-v2 doesn't.
- **Impact:** Conversation artifact incomplete.

### P2-11: Media album missing jsonl write
- `relay.js` — old writes `issue.jsonl` for album. src-v2 doesn't.
- **Impact:** Conversation log not updated for album media.

### P2-12: Media no-branch fallback missing telegram-meta header + messageFromSource
- `relay.js:60-69` — uses `🦞 ${label}` only. Old uses full `Vs` header + `Mk` footer.
- **Impact:** No-branch media comments missing structured header.

### P2-13: `/api/active-issue` HTTP route missing
- `routes.js` — old has `GET /api/active-issue` returning `{issueNumber}`. src-v2 doesn't.
- **Impact:** API endpoint unavailable.

### P2-14: Cross-tree import `src-v2/db/d1.js:5` → `src/modules/workflow-notifications.js`
- src-v2 imports from legacy `src/` tree.
- **Impact:** Not self-contained; breaks if `src/` deleted.

### P2-15: Coding-agent dispatch error replies don't distinguish disabled vs not-found
- `dispatch.js:228-239` — both fall to generic `dispatchFailed`. Old distinguishes `restingMessage` (disabled) vs `noTaskMessage` (not found).
- **Impact:** Less specific error feedback.

---

## Action Plan

### Phase 1 — P0 Critical (must fix before swap)

| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| P0-1 | `current_edit` stub → full /edit init | template-reset-callbacks.js | Medium |
| P0-2 | AI inference dead code → wire NL trigger | bot.js, ai-inference.js | Medium |
| P0-3 | `template_reset_select` → orphan pipeline | template-reset-callbacks.js, branches.js | Large |
| P0-4 | Auto-init → add branch+workflow+D1+repo var | installation.js, branches.js | Medium |
| P0-5 | `osCreateFinalize` edit mode | branches.js, edit-flow.js | Large |
| P0-6 | AI YAML parser → proper indent-aware | ai-inference.js | Large |
| P0-7 | `computeNextRun` → all rule types | schedule-flow.js, cron.js | Medium |
| P0-8 | `/schedules` snake_case → camelCase | schedules.js | Trivial |
| P0-9 | `/skills` installed path → `.agents/skills` | skills.js | Trivial |
| P0-10 | `rulePayload` JSON.parse | db/schedules.js | Trivial |
| P0-11 | Relay skip conditions | issue-comment.js | Medium |

### Phase 2 — P1 Major (fix before production)

| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| P1-1 | comment-on-issue always create | comment-on-issue.js | Small |
| P1-2 | Schedule reply vs editMessageText | schedule-flow.js | Medium |
| P1-3 | Schedule list rendering + keyboards | schedule-flow.js | Large |
| P1-4 | Schedule closed-issue guards | schedule-flow.js | Medium |
| P1-5 | Schedule `|chat` suffix | schedule-flow.js | Small |
| P1-6 | Skills/templates callback names | skills.js, templates.js | Trivial |
| P1-7 | Skills/templates pagination | skills.js, templates.js | Medium |
| P1-8 | D1 workflow-notification records | skills-callbacks.js, templates-callbacks.js, line-bot.js | Medium |
| P1-9 | /edit finalize workflow sync + metadata | edit-flow.js | Medium |
| P1-10 | close_issue_confirm schedule cleanup | callbacks.js | Small |
| P1-11 | Line-bot `et` helper | line-bot.js | Medium |
| P1-12 | Line-bot required fields | line-bot.js | Small |
| P1-13 | Line-bot field validation | line-bot.js | Small |
| P1-14 | Line-bot confirm card detail | line-bot.js | Small |
| P1-15 | Workflow-run line-bot post-install | workflow-run.js | Medium |
| P1-16 | /llm model validation | llm.js | Medium |
| P1-17 | /list error mapping | list.js | Trivial |
| P1-18 | edit_keep_field step guard | edit-flow.js | Trivial |
| P1-19 | Per-callback error handlers | all callback files | Medium |
| P1-20 | MarkdownV2 escaping | all callback files | Medium |

### Phase 3 — P2 Minor (fix when convenient)

| # | Issue | Effort |
|---|-------|--------|
| P2-1 | Wire log.* keys into actual console calls | Large |
| P2-2 | Config required-throw | Small |
| P2-3 | Config webhookPath normalization | Trivial |
| P2-4 | Config AI model defaults | Trivial |
| P2-5 | Status card "File:" label | Trivial |
| P2-6 | Status card workflow-runs query | Medium |
| P2-7 | Status card schedule line cleanup | Small |
| P2-8 | nextRunAt locale formatting | Small |
| P2-9 | Template revalidation | Small |
| P2-10 | Media user.md artifact | Small |
| P2-11 | Media album jsonl | Small |
| P2-12 | Media no-branch header | Small |
| P2-13 | /api/active-issue route | Trivial |
| P2-14 | Cross-tree import | Small |
| P2-15 | Dispatch error classification | Small |

---

## Quick Wins (trivial fixes, immediate impact)

1. **P0-8** `/schedules` snake_case → camelCase: change `r.issue_number` → `r.issueNumber` etc.
2. **P0-9** `/skills` path: change `path: \`issue-${n}\`` → `path: ".agents/skills"`
3. **P0-10** `rulePayload` JSON.parse: add `JSON.parse(row.rule_payload) ?? {}` in `camelSchedule`
4. **P1-6** Callback names: `skill_select:` → `skills_pick:`, `template_select:` → `templates_pick:`
5. **P1-17** `/list` error mapping: add 401/403/404 check
6. **P1-18** `edit_keep_field` step guard: add `step === state.step` check
7. **P2-3** `webhookPath` prepend `/`
8. **P2-4** AI model defaults
9. **P2-5** Status card "File:" label fix
10. **P2-13** `/api/active-issue` route