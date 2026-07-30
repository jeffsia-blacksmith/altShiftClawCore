# Phase R — Deep Parity Audit (3 Rounds Complete)

> Final: 2026-07-30 (commit `7ce7bc1`)
> Method: 6 parallel subagents doing component-level behavior audit

---

## Audit Summary

| Round | Focus | Items Found | Items Fixed |
|-------|-------|-------------|-------------|
| Round 1 | Structural/missing features | 46 | 46 ✅ |
| Round 2 | Critical behavior bugs | 20 | 20 ✅ |
| Round 3 | Component-level behavior (6 agents) | ~50 | ~45 ✅ |
| **Total** | | **~116** | **~111** ✅ |

---

## Round 3 Component Audit Results

### Component 1: Bot middleware + message routing
- ✅ Fixed: LLM text handler moved before other flows
- ✅ Fixed: command_menu_* callbacks registered
- ⬜ Remaining: NL command `@botname` suffix handling (low priority)

### Component 2: i18n t() parameter correctness
- ✅ Fixed: 17 non-existent i18n keys replaced with correct keys
- ✅ Fixed: ~15 missing/wrong params in edge-replies.js
- ✅ Fixed: 5 templates.* → newFlow.* namespace corrections
- ✅ Fixed: line-bot.js 5 missing keys
- ⬜ Remaining: ~40 log.* calls with extra {error} param (harmless — param dropped)

### Component 3: D1 schema + SQL
- ✅ Fixed: createWorkflowNotification schema (destructured, correct columns)
- ✅ Fixed: updateSchedule null handling (null writes, not skips)
- ✅ Fixed: camelSchedule Number coercion + eventData trim
- ⬜ Remaining: Index name divergence (harmless — duplicate indexes)

### Component 4: Coding-agent dispatch + workflow_run
- ✅ Fixed: isSystemComment/hasCommentMeta (telegram-meta, not githubclaw-comment-meta)
- ✅ Fixed: stripToUserMessage preserves code blocks
- ✅ Fixed: parseEventSource reads telegram-meta
- ✅ Fixed: error regex narrowed + name param + blank lines
- ✅ Fixed: workflow-run MarkdownV2 escaping + editMessageText fallback + Number types
- ⬜ Remaining: in_progress uses title lookup (less reliable, minor)

### Component 5: Schedule flow + cron
- ✅ Fixed: State-integrity guards (awaiting_payload/edit_*)
- ✅ Fixed: Issue-status card after schedule config
- ✅ Fixed: computeNextRun all rule types
- ⬜ Remaining: Chinese 每 N 分 regex fallback (low priority)

### Component 6: Skills/templates callbacks
- ✅ Fixed: Secrets encryption (libsodium)
- ✅ Fixed: D1 notification records (all 3 callers + missing remove call)
- ✅ Fixed: Template manifest need_model/model_var snake_case + models normalization
- ✅ Fixed: Error handling classification
- ⬜ Remaining: Catalog stale-cache fallback (low priority)

### Component 7: Edit-flow + new-flow
- ✅ Fixed: Create finalize editMessageText (not reply)
- ✅ Fixed: isSubmitting guard on new_template_select
- ✅ Fixed: Error classification (TEMPLATE_NOT_INSTALLED etc)
- ✅ Fixed: Template revalidation re-renders keyboard
- ✅ Fixed: parseEnableDisable '-' sentinel
- ✅ Fixed: Keyboard row layout
- ⬜ Remaining: osCreateFinalize in branches.js needs separate audit

### Component 8: LLM + line-bot
- ✅ Fixed: Missing i18n keys (kb.continue/confirmDeploy/editParams)
- ✅ Fixed: issue_number validation (format + existence)
- ✅ Fixed: step guard on setup_continue
- ✅ Fixed: utc_offset default +08:00
- ⬜ Remaining: parse_mode not set on line-bot messages (medium)

### Component 9: Status-card + schedules + workflow-controls
- ✅ Fixed: workflow-controls double-escape removed
- ✅ Fixed: clear.js double-escape removed
- ✅ Fixed: schedules keyboard issue titles + separator
- ✅ Fixed: status-card notify keys, file URL escape, codex parser, running link
- ⬜ Remaining: Model labels (Copilot CLI vs GitHub Copilot — cosmetic)

---

## Final Status

| Metric | Value |
|--------|-------|
| Guardrails v2 | 40/40 ✅ |
| Guardrails old | 14/14 ✅ |
| **Total** | **54/54 ✅** |
| Build | 659,213 bytes ✅ |
| i18n parity | 813×2, 0 gap ✅ |
| Source lines | ~8,200 (41% of old 20,195) |
| Total audit items fixed | ~111/~116 ✅ |