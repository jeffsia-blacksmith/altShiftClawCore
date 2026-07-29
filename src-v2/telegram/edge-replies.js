// telegram/edge-replies.js — 边缘回复函数（vf/Sk/xf/cs/menu 等）
// 补齐旧 bundle 中未实现的 i18n key 调用。

import { t, glang } from "../i18n/index.js";

// vf — resting reply（对齐 L16580-16587）
// 当 workflow !acceptsDispatch 且 branchExists 时回复
export function buildRestingReply(name, lang) {
  const L = lang ?? glang();
  const displayName = (typeof name === "string" && name.trim()) ? name.trim() : t("core.unnamedLobster", {}, L);
  return [
    t("core.restingMessage1", { name: displayName }, L),
    t("core.restingMessage2", {}, L),
    t("core.restingMessage3", {}, L),
  ].join("\n");
}

// Sk — missing-setup reply（对齐 L16589-16593）
// 当 !branchExists 或 !workflowExists 时回复
export function buildMissingSetupReply(lang) {
  const L = lang ?? glang();
  return [
    t("core.noTaskMessage1", {}, L),
    t("core.noTaskMessage2", {}, L),
  ].join("\n");
}

// xf — 媒体标签（对齐 L16744-16758）
// 返回 media.* 或 mediaLabel.* 的 i18n 值
export function mediaLabel(field, lang) {
  const L = lang ?? glang();
  const key = `media.${field}`;
  const val = t(key, {}, L);
  // 如果 media.<field> 不存在（返回 key 本身），fallback 到 mediaLabel.<field>
  if (val === key) return t(`mediaLabel.${field}`, {}, L);
  return val;
}

// xf for album — "📁 Media" when multiple types
export function mediaGroupLabel(lang) {
  return t("media.media", {}, lang ?? glang());
}

// cs — schedule rule-type 标签（对齐 L5081-5097）
export function scheduleRuleTypeLabel(ruleType, lang) {
  const L = lang ?? glang();
  const labels = {
    every_N_minutes: t("schedule.type_interval", {}, L),
    interval: t("schedule.type_interval", {}, L),
    cron: t("schedule.cron_type", {}, L),
    minutely: t("schedule.type_minutely", {}, L),
    daily: t("schedule.type_daily", {}, L),
    hourly: t("schedule.type_hourly", {}, L),
    weekly: t("schedule.type_weekly", {}, L),
    weekday: t("schedule.weekday", {}, L),
    weekenday: t("schedule.weekenday", {}, L),
    once: t("schedule.once", {}, L),
    monthly: t("schedule.type_monthly", {}, L),
  };
  return labels[ruleType] ?? ruleType ?? "";
}

// weekday labels (schedule.weekday_0..6)
export function weekdayLabel(day, lang) {
  return t(`schedule.weekday_${day}`, {}, lang ?? glang());
}

// menu — command menu (对齐 menu.* keys)
export function buildMenuText(lang) {
  const L = lang ?? glang();
  return [
    t("menu.useCommand", {}, L),
    t("menu.new", {}, L),
    t("menu.list", {}, L),
    t("menu.current", {}, L),
    t("menu.close", {}, L),
    t("menu.schedules", {}, L),
    t("menu.workflow", {}, L),
    t("menu.help", {}, L),
  ].join("\n");
}

// system.processing — comment-on-issue 先回复
export function processingReply(lang) {
  return t("system.processing", {}, lang ?? glang());
}

// core.useTextInSchedule — schedule flow guard
export function useTextInScheduleReply(lang) {
  return t("core.useTextInSchedule", {}, lang ?? glang());
}

// core.contentTruncated — relay truncation
export function contentTruncatedReply(url, lang) {
  return t("core.contentTruncated", { url }, lang ?? glang());
}

// core.imageAttached / imageAttachedShort / imageClickLinkToOpen / openImage
export function imageAttachedReply(lang) {
  return t("core.imageAttached", {}, lang ?? glang());
}
export function imageAttachedShortReply(lang) {
  return t("core.imageAttachedShort", {}, lang ?? glang());
}
export function imageClickLinkToOpenReply(lang) {
  return t("core.imageClickLinkToOpen", {}, lang ?? glang());
}
export function openImageReply(lang) {
  return t("core.openImage", {}, lang ?? glang());
}

// core.issueNewComment / issueCommentUpdated — relay header
export function issueNewCommentReply(number, title, lang) {
  return t("core.issueNewComment", { number, title }, lang ?? glang());
}
export function issueCommentUpdatedReply(number, title, lang) {
  return t("core.issueCommentUpdated", { number, title }, lang ?? glang());
}

// core.closeCancelMessageGeneric
export function closeCancelMessageGenericReply(lang) {
  return t("core.closeCancelMessageGeneric", {}, lang ?? glang());
}
// core.closeClearedSchedules
export function closeClearedSchedulesReply(count, lang) {
  return t("core.closeClearedSchedules", { count }, lang ?? glang());
}
// core.closeNoSchedulesToClear
export function closeNoSchedulesToClearReply(lang) {
  return t("core.closeNoSchedulesToClear", {}, lang ?? glang());
}
// core.closeMenuExpired
export function closeMenuExpiredReply(lang) {
  return t("core.closeMenuExpired", {}, lang ?? glang());
}
// core.listMenuExpired
export function listMenuExpiredReply(lang) {
  return t("core.listMenuExpired", {}, lang ?? glang());
}
// core.listErrorNotFound / listErrorUnauthorized
export function listErrorNotFoundReply(lang) {
  return t("core.listErrorNotFound", {}, lang ?? glang());
}
export function listErrorUnauthorizedReply(lang) {
  return t("core.listErrorUnauthorized", {}, lang ?? glang());
}
// core.workflowTriggering
export function workflowTriggeringReply(name, lang) {
  return t("core.workflowTriggering", { name }, lang ?? glang());
}
// core.inferWorkflowFailed
export function inferWorkflowFailedReply(name, lang) {
  return t("core.inferWorkflowFailed", { name }, lang ?? glang());
}

// skills.targetLobsterFallback
export function skillsTargetLobsterFallbackReply(lang) {
  return t("skills.targetLobsterFallback", {}, lang ?? glang());
}

// templates.* edge
export function templatesReadFailedReply(name, lang) {
  return t("templates.readFailed", { name }, lang ?? glang());
}
export function templatesNotInstalledReply(name, lang) {
  return t("templates.notInstalled", { name }, lang ?? glang());
}
export function templatesFileBinaryReply(path, lang) {
  return t("templates.fileBinary", { path }, lang ?? glang());
}
export function templatesNestedTooDeepReply(path, lang) {
  return t("templates.nestedTooDeep", { path }, lang ?? glang());
}

// errors.*
export function errorsNotAFileReply(name, lang) {
  return t("errors.notAFile", { name }, lang ?? glang());
}
export function errorsGetFileFailedReply(name, lang) {
  return t("errors.getFileFailed", { name }, lang ?? glang());
}

// api.rateLimit.*
export function apiRateLimitBareReply(lang) {
  return t("api.rateLimit.bare", {}, lang ?? glang());
}

// newFlow.* edge
export function newFlowCompletionErrorReply(lang) {
  return t("newFlow.completionError", {}, lang ?? glang());
}
export function newFlowErrorTemplateNotInstalledReply(name, lang) {
  return t("newFlow.errorTemplateNotInstalled", { name }, lang ?? glang());
}
export function newFlowErrorTemplateReadFailedReply(name, lang) {
  return t("newFlow.errorTemplateReadFailed", { name }, lang ?? glang());
}
export function newFlowTemplateNoLongerExistsReply(lang) {
  return t("newFlow.templateNoLongerExists", {}, lang ?? glang());
}
export function newFlowTemplateNotInLobsterReply(template, lang) {
  return t("newFlow.templateNotInLobster", { template }, lang ?? glang());
}
export function newFlowTemplateListReadFailedRetryReply(lang) {
  return t("newFlow.templateListReadFailedRetry", {}, lang ?? glang());
}
export function newFlowInvalidTemplateChoiceReply(lang) {
  return t("newFlow.invalidTemplateChoice", {}, lang ?? glang());
}
export function newFlowButtonExpiredShortReply(lang) {
  return t("newFlow.buttonExpiredShort", {}, lang ?? glang());
}
export function newFlowCancelledShortReply(lang) {
  return t("newFlow.cancelledShort", {}, lang ?? glang());
}
export function newFlowFlowCancelledReply(lang) {
  return t("newFlow.flowCancelled", {}, lang ?? glang());
}
export function newFlowFlowExpiredReply(lang) {
  return t("newFlow.flowExpired", {}, lang ?? glang());
}
export function newFlowEnterEnvValueReply(name, current, total, lang) {
  return t("newFlow.enterEnvValue", { name, current, total }, lang ?? glang());
}
export function newFlowEnvSetupSkippedReply(lang) {
  return t("newFlow.envSetupSkipped", {}, lang ?? glang());
}
export function newFlowNoEnvVarsNeededReply(lang) {
  return t("newFlow.noEnvVarsNeeded", {}, lang ?? glang());
}

// schedule.* edge
export function scheduleIssueNotFoundOrClosedReply(lang) {
  return t("schedule.issueNotFoundOrClosed", {}, lang ?? glang());
}
export function scheduleFlowAmbiguousClarifyReply(lang) {
  return t("schedule.flow.ambiguousClarify", {}, lang ?? glang());
}
export function scheduleFlowAmbiguousReplyReply(examples, lang) {
  return t("schedule.flow.ambiguousReply", { examples }, lang ?? glang());
}
export function scheduleFlowFailedReplyReply(examples, lang) {
  return t("schedule.flow.failedReply", { examples }, lang ?? glang());
}
export function scheduleFlowFailedUnderstandReply(lang) {
  return t("schedule.flow.failedUnderstand", {}, lang ?? glang());
}
export function scheduleFlowFallbackIssueTitleReply(lang) {
  return t("schedule.flow.fallbackIssueTitle", {}, lang ?? glang());
}
export function scheduleFlowLobsterClosedDeleteOnlyReply(lang) {
  return t("schedule.flow.lobsterClosedDeleteOnly", {}, lang ?? glang());
}
export function scheduleFlowParseAmbiguousFallbackReply(lang) {
  return t("schedule.flow.parseAmbiguousFallback", {}, lang ?? glang());
}
export function scheduleFlowParseNoBindingReply(lang) {
  return t("schedule.flow.parseNoBinding", {}, lang ?? glang());
}
export function scheduleFlowParseUnknownFallbackReply(lang) {
  return t("schedule.flow.parseUnknownFallback", {}, lang ?? glang());
}
export function scheduleFlowStateLostReply(lang) {
  return t("schedule.flow.stateLost", {}, lang ?? glang());
}
export function scheduleFlowStateLostShortReply(lang) {
  return t("schedule.flow.stateLostShort", {}, lang ?? glang());
}
export function scheduleFlowTimeAlreadyPassedReply(lang) {
  return t("schedule.flow.timeAlreadyPassed", {}, lang ?? glang());
}
export function scheduleCardDeleteHintReply(lang) {
  return t("schedule.card.deleteHint", {}, lang ?? glang());
}
export function scheduleCardStandaloneDetailTitleReply(label, lang) {
  return t("schedule.card.standaloneDetailTitle", { label }, lang ?? glang());
}

// kb.* edge
export function kbBackToAllSchedulesReply(lang) {
  return t("kb.backToAllSchedules", {}, lang ?? glang());
}
export function kbNewScheduleReply(lang) {
  return t("kb.newSchedule", {}, lang ?? glang());
}
export function kbIssueNumberLabelReply(lang) {
  return t("kb.issueNumberLabel", {}, lang ?? glang());
}
export function kbTimezoneReply(lang) {
  return t("kb.timezone", {}, lang ?? glang());
}
export function kbScheduleFallbackNameReply(lang) {
  return t("kb.scheduleFallbackName", {}, lang ?? glang());
}
export function kbOpenGithubReply(lang) {
  return t("kb.openGithub", {}, lang ?? glang());
}
export function kbOpenWorkdirReply(lang) {
  return t("kb.openWorkdir", {}, lang ?? glang());
}
export function kbSkillDocsReply(lang) {
  return t("kb.skillDocs", {}, lang ?? glang());
}
export function kbStartDeployReply(lang) {
  return t("kb.startDeploy", {}, lang ?? glang());
}
export function kbContinueLineBotSetupReply(lang) {
  return t("kb.continueLineBotSetup", {}, lang ?? glang());
}
export function kbTriggerLaterManuallyReply(lang) {
  return t("kb.triggerLaterManually", {}, lang ?? glang());
}
export function kbDefaultReplyReply(lang) {
  return t("kb.defaultReply", {}, lang ?? glang());
}

// line.* edge
export function lineConfirmLobsterReply(lang) {
  return t("line.confirm_lobster", {}, lang ?? glang());
}
export function lineConfirmReplyMsgReply(lang) {
  return t("line.confirm_reply_msg", {}, lang ?? glang());
}
export function lineConfirmTimezoneReply(lang) {
  return t("line.confirm_timezone", {}, lang ?? glang());
}
export function lineAutoCreateLabelReply(lang) {
  return t("line.auto_create_label", {}, lang ?? glang());
}
export function lineNoneLabelReply(lang) {
  return t("line.none_label", {}, lang ?? glang());
}
export function lineEnableWebhookInstructionReply(lang) {
  return t("line.enable_webhook_instruction", {}, lang ?? glang());
}
export function lineErrorBotIdFormatReply(lang) {
  return t("line.error_bot_id_format", {}, lang ?? glang());
}
export function lineErrorBotIdRequiredReply(lang) {
  return t("line.error_bot_id_required", {}, lang ?? glang());
}
export function lineErrorChannelIdFormatReply(lang) {
  return t("line.error_channel_id_format", {}, lang ?? glang());
}
export function lineErrorChannelIdRequiredReply(lang) {
  return t("line.error_channel_id_required", {}, lang ?? glang());
}
export function lineErrorIssueNumberFormatReply(lang) {
  return t("line.error_issue_number_format", {}, lang ?? glang());
}
export function lineErrorLobsterNotFoundReply(lang) {
  return t("line.error_lobster_not_found", {}, lang ?? glang());
}
export function lineErrorTimezoneFormatReply(lang) {
  return t("line.error_timezone_format", {}, lang ?? glang());
}

// templates.* additional
export function templatesDescReply(lang) {
  return t("templates.desc_", {}, lang ?? glang());
}
export function templatesFallbackNameReply(lang) {
  return t("templates.fallback_name", {}, lang ?? glang());
}
export function templatesNameReply(lang) {
  return t("templates.name_", {}, lang ?? glang());
}
export function templatesSyncDescReply(lang) {
  return t("templates.sync_desc", {}, lang ?? glang());
}
export function templatesUnknownGraphqlErrorReply(lang) {
  return t("templates.unknownGraphqlError", {}, lang ?? glang());
}

// br — schedule rule description (对齐旧 bundle br L5045-5079)
export function scheduleRuleDescription(rule, lang) {
  const L = lang ?? glang();
  const rp = rule.rulePayload ?? {};
  if (rule.ruleType === "cron" && typeof rp.expression === "string") return rp.expression;
  if (rule.ruleType === "interval" && typeof rp.minutes === "number")
    return t("schedule.minutely", { minutes: rp.minutes }, L);
  if (rule.ruleType === "once" && typeof rp.run_at === "string") {
    const o = new Date(rp.run_at);
    if (Number.isNaN(o.getTime())) return t("schedule.once", {}, L);
    return t("schedule.run_at_once", { run_at: o.toLocaleString(L === "zh-CN" ? "zh-CN" : "en", { timeZone: "Asia/Taipei" }) }, L);
  }
  const r = typeof rp.hour === "number" ? String(rp.hour).padStart(2, "0") : "??";
  const n = typeof rp.minute === "number" ? String(rp.minute).padStart(2, "0") : "00";
  const s = `${r}:${n}`;
  switch (rule.ruleType) {
    case "daily": return t("schedule.daily", { time: s }, L);
    case "hourly": {
      const o = typeof rp.interval_hours === "number" ? rp.interval_hours : 1;
      return o === 1
        ? t("schedule.hourly", { minute: n }, L)
        : t("schedule.hourlyInterval", { hours: o, minute: n }, L);
    }
    case "minutely":
      return t("schedule.minutely", { minutes: typeof rp.interval_minutes === "number" ? rp.interval_minutes : 1 }, L);
    case "weekly": {
      const weekdays = Array.isArray(rp.weekdays)
        ? rp.weekdays.map((i) => t(`schedule.weekday_${i}`, {}, L))
        : (typeof rp.weekday === "number" ? [t(`schedule.weekday_${rp.weekday}`, {}, L)] : ["?"]);
      return t("schedule.weekly", { weekdays: weekdays.join("、"), time: s }, L);
    }
    case "weekday": return t("schedule.weekday", { time: s }, L);
    case "weekenday": return t("schedule.weekenday", { time: s }, L);
    case "monthly": {
      const day = typeof rp.day === "number" ? rp.day : 1;
      return t("schedule.monthly", { day, time: s }, L);
    }
    default: return rule.ruleType ?? "";
  }
}

// cs — schedule type label (补充 schedule.interval / schedule.daily / schedule.hourly / schedule.weekly 调用)
export function scheduleTypeLabel(ruleType, lang) {
  const L = lang ?? glang();
  if (ruleType === "interval") return t("schedule.interval", {}, L);
  if (ruleType === "once") return t("schedule.once", {}, L);
  const map = {
    daily: t("schedule.daily", {}, L),
    hourly: t("schedule.hourly", {}, L),
    minutely: t("schedule.interval", {}, L),
    weekly: t("schedule.weekly", {}, L),
    weekday: t("schedule.weekday", {}, L),
    weekenday: t("schedule.weekenday", {}, L),
  };
  return map[ruleType] ?? ruleType ?? "";
}

// schedule.card.notify — 排程卡片通知栏
export function scheduleCardNotify(shouldNotify, lang) {
  const L = lang ?? glang();
  const state = shouldNotify ? t("schedule.card.notifyOn", {}, L) : t("schedule.card.notifyOff", {}, L);
  return t("schedule.card.notify", { state }, L);
}

// schedule.notify_open / notify_close — 旧版通知标签（对齐旧 bundle L5262）
export function scheduleNotifyLabel(shouldNotify, lang) {
  const L = lang ?? glang();
  return shouldNotify ? t("schedule.notify_open", {}, L) : t("schedule.notify_close", {}, L);
}

// xf — media.* type label (对齐旧 bundle xf L16744-16758)
export function mediaTypeLabel(field, lang) {
  const L = lang ?? glang();
  switch (field) {
    case "photo": return t("media.photo", {}, L);
    case "video": return t("media.video", {}, L);
    case "audio": return t("media.audio", {}, L);
    case "document": return t("media.document", {}, L);
    case "voice": return t("media.voice", {}, L);
    default: return t("media.media", {}, L);
  }
}

// Zl — media comment structured body (对齐旧 bundle Zl L16624-16635)
export function coreMediaCommentBody(text, attachments, lang) {
  const L = lang ?? glang();
  const r = typeof text === "string" ? text.trim() : "";
  const n = attachments.map((o) => String(o.repoPath || "").trim()).filter((o) => o !== "");
  return [
    t("core.mediaMessageFromTelegram", {}, L),
    "",
    t("core.userTextLabel", {}, L),
    r || t("core.noneLabel", {}, L),
    "",
    t("core.attachmentsLabel", {}, L),
    ...(n.length > 0 ? n.map((o) => `- ${o}`) : [`- ${t("core.noneLabel", {}, L)}`]),
  ].join("\n");
}

// api.rateLimit.minutes / soon
export function apiRateLimitMinutesReply(minutes, lang) {
  return t("api.rateLimit.minutes", { minutes }, lang ?? glang());
}
export function apiRateLimitSoonReply(lang) {
  return t("api.rateLimit.soon", {}, lang ?? glang());
}

// newFlow.stepTemplate
export function newFlowStepTemplateReply(name, lang) {
  return t("newFlow.stepTemplate", { name }, lang ?? glang());
}

// core.workflowDisabledMessage / workflowEnabledMessage
export function coreWorkflowDisabledMessageReply(name, lang) {
  return t("core.workflowDisabledMessage", { name }, lang ?? glang());
}
export function coreWorkflowEnabledMessageReply(name, lang) {
  return t("core.workflowEnabledMessage", { name }, lang ?? glang());
}

// core.workflowInferParamsError / workflowQueryStatusError / workflowTriggerFailed
export function coreWorkflowInferParamsErrorReply(name, lang) {
  return t("core.workflowInferParamsError", { name }, lang ?? glang());
}
export function coreWorkflowQueryStatusErrorReply(name, lang) {
  return t("core.workflowQueryStatusError", { name }, lang ?? glang());
}
export function coreWorkflowTriggerFailedReply(name, lang) {
  return t("core.workflowTriggerFailed", { name }, lang ?? glang());
}

// core.workflow_state_active / workflow_state_disabled_manually
export function coreWorkflowStateActiveReply(lang) {
  return t("core.workflow_state_active", {}, lang ?? glang());
}
export function coreWorkflowStateDisabledManuallyReply(lang) {
  return t("core.workflow_state_disabled_manually", {}, lang ?? glang());
}

// core.pleaseUseCommand
export function corePleaseUseCommandReply(command, lang) {
  return t("core.pleaseUseCommand", { command }, lang ?? glang());
}

// menu.* — command menu labels
export function menuActiveLobsterReply(name, lang) {
  return t("menu.active_lobster", { name }, lang ?? glang());
}
export function menuCloseLobsterReply(lang) {
  return t("menu.close_lobster", {}, lang ?? glang());
}
export function menuNewLobsterReply(lang) {
  return t("menu.new_lobster", {}, lang ?? glang());
}

// kb.lobsterFallbackName
export function kbLobsterFallbackNameReply(lang) {
  return t("kb.lobsterFallbackName", {}, lang ?? glang());
}

// line.cancelled_alert / deploy_workflow_title / setup_failed
export function lineCancelledAlertReply(lang) {
  return t("line.cancelled_alert", {}, lang ?? glang());
}
export function lineDeployWorkflowTitleReply(lang) {
  return t("line.deploy_workflow_title", {}, lang ?? glang());
}
export function lineSetupFailedReply(lang) {
  return t("line.setup_failed", {}, lang ?? glang());
}

// system.error_start
export function systemErrorStartReply(lang) {
  return t("system.error_start", {}, lang ?? glang());
}

// skills.confirmInstallTo / skills.target_lobster_fallback
export function skillsConfirmInstallToReply(name, lang) {
  return t("skills.confirmInstallTo", { name }, lang ?? glang());
}
export function skillsTargetLobsterFallbackReply2(lang) {
  return t("skills.target_lobster_fallback", {}, lang ?? glang());
}

// newFlow.confirmInstallTo / editStepWorkflowEnabled / envValueRequired / envsSet / notInstalled / readFailed / setEnvFailed
export function newFlowConfirmInstallToReply(name, lang) {
  return t("newFlow.confirmInstallTo", { name }, lang ?? glang());
}
export function newFlowEditStepWorkflowEnabledReply(name, lang) {
  return t("newFlow.editStepWorkflowEnabled", { name }, lang ?? glang());
}
export function newFlowEnvValueRequiredReply(name, lang) {
  return t("newFlow.envValueRequired", { name }, lang ?? glang());
}
export function newFlowEnvsSetReply(lang) {
  return t("newFlow.envsSet", {}, lang ?? glang());
}
export function newFlowNotInstalledReply(name, lang) {
  return t("newFlow.notInstalled", { name }, lang ?? glang());
}
export function newFlowReadFailedReply(name, lang) {
  return t("newFlow.readFailed", { name }, lang ?? glang());
}
export function newFlowSetEnvFailedReply(name, lang) {
  return t("newFlow.setEnvFailed", { name }, lang ?? glang());
}

// templates.desc_default / desc_image_generation / desc_summary / name_default / name_image_generation / name_summary / sync_complete_ask_line
export function templatesDescDefaultReply(lang) {
  return t("templates.desc_default", {}, lang ?? glang());
}
export function templatesDescImageGenerationReply(lang) {
  return t("templates.desc_image_generation", {}, lang ?? glang());
}
export function templatesDescSummaryReply(lang) {
  return t("templates.desc_summary", {}, lang ?? glang());
}
export function templatesNameDefaultReply(lang) {
  return t("templates.name_default", {}, lang ?? glang());
}
export function templatesNameImageGenerationReply(lang) {
  return t("templates.name_image_generation", {}, lang ?? glang());
}
export function templatesNameSummaryReply(lang) {
  return t("templates.name_summary", {}, lang ?? glang());
}
export function templatesSyncCompleteAskLineReply(lang) {
  return t("templates.sync_complete_ask_line", {}, lang ?? glang());
}

// skillCatalog.* — skill catalog names/descriptions
export function skillCatalogReply(key, lang) {
  return t(`skillCatalog.${key}`, {}, lang ?? glang());
}