// telegram/bot.js — grammY Bot 装配 + middleware 链
// 行为对齐旧 bundle Of（L17898-17931）。
// 链路：accessGuard → language(services) → 命令路由（/start /help /list /current /status /close）
// 后续阶段接入：/new /edit（R4 flows）、/clear /skills /templates /enable /disable /workflow（R7）、
// /schedules（R6）、media handlers（R8）、llmComposer /message:text catch-all（R7/R8）。

import { Bot, Composer } from "grammy";
import { getLanguage, i18nT } from "../i18n/index.js";
import { accessGuard } from "./access-guard.js";
import { registerStart } from "./commands/start.js";
import { registerHelp } from "./commands/help.js";
import { registerList } from "./commands/list.js";
import { registerCurrent } from "./commands/current.js";
import { registerClose } from "./commands/close.js";
import { registerClear } from "./commands/clear.js";
import { registerWorkflowControls } from "./commands/workflow-controls.js";
import { registerSkills } from "./commands/skills.js";
import { registerTemplates } from "./commands/templates.js";
import { registerNew, registerFlowCancel, handleFlowText } from "./flows/new-flow.js";
import { registerEdit, registerEditCallbacks, handleEditText } from "./flows/edit-flow.js";
import { registerFlowCallbacks } from "./flows/callbacks.js";
import { registerLlm, handleLlmText } from "./flows/llm/llm.js";
import { registerSkillCallbacks, handleSkillEnvText, getSkillState } from "./flows/skills-callbacks.js";
import { registerTemplateCallbacks, handleTemplateEnvText, getTplState } from "./flows/templates-callbacks.js";
import { registerVersion } from "./commands/version.js";
import { registerSchedules } from "./commands/schedules.js";
import { registerScheduleCallbacks, handleScheduleText } from "./flows/schedule-flow.js";
import { registerLineBotCallbacks, handleLineText, getLineState } from "./flows/line-bot.js";
import { registerTemplateResetCallbacks } from "./flows/template-reset-callbacks.js";
import { handleCommentOnIssue } from "./comment-on-issue.js";
import { handleNaturalLanguageCommand } from "./ai-inference.js";
import { handleSingleMedia, handleAlbumMedia, fieldExt } from "../media/relay.js";
import { t, glang } from "../i18n/index.js";

export function createBot({ config, services }) {
  const bot = new Bot(config.telegram.botToken, {
    client: { apiRoot: config.telegram.apiBaseUrl ?? "https://api.telegram.org" },
  });

  // 1. AccessGuard — 对齐 Pd（L12010-12049）
  bot.use(
    accessGuard({
      allowedFromId: config.telegram.allowedFromId,
      allowedChatId: config.telegram.allowedChatId,
      maxMessageLength: config.telegram.maxMessageLength,
    }),
  );

  // 2. services + language + t — 对齐 xd(r) + 语言中间件（L17902-17906）
  bot.use(async (ctx, next) => {
    ctx.services = services;
    ctx.language = await getLanguage(services);
    ctx.t = (key, params = {}) => i18nT(key, params, ctx.language);
    await next();
  });

  // 3. 命令路由 — 用 Composer 分组（对齐 za/Ko/Va/ri/rl/Gs/zt）
  const commands = new Composer();
  registerStart(commands);
  registerHelp(commands);
  registerList(commands);
  registerCurrent(commands);
  registerClose(commands);
  registerClear(commands);
  registerWorkflowControls(commands);
  registerSkills(commands);
  registerTemplates(commands);
  registerVersion(commands);
  registerSchedules(commands);
  registerLlm(commands);
  registerNew(commands);
  registerEdit(commands);
  registerEditCallbacks(commands);
  registerFlowCancel(commands);
  registerFlowCallbacks(commands);
  registerSkillCallbacks(commands);
  registerTemplateCallbacks(commands);
  registerScheduleCallbacks(commands);
  registerLineBotCallbacks(commands);
  registerTemplateResetCallbacks(commands);
  bot.use(commands);

  // 4. message:text 续接 — 对齐 su.on("message:text")（L17810-17897）
  // 优先级：skill-env → template-env → new-flow → edit-flow → llm → schedule → LINE → comment-on-issue → AI natural-lang
  bot.on("message:text", async (ctx, next) => {
    if (await handleSkillEnvText(ctx)) return;
    if (await handleTemplateEnvText(ctx)) return;
    if (await handleFlowText(ctx)) return;
    if (await handleEditText(ctx)) return;
    if (await handleLlmText(ctx)) return;
    if (await handleScheduleText(ctx)) return;
    if (await handleLineText(ctx)) return;
    if (await handleCommentOnIssue(ctx)) return;
    // AI 自然语言工作流派工（对齐旧 bundle RT 路径）
    const text = ctx.message?.text;
    if (text && text.startsWith("/")) {
      const parts = text.slice(1).split(/\s+/);
      const commandName = parts[0];
      const argsText = parts.slice(1).join(" ");
      if (commandName && !["start","help","list","current","status","close","clear","enable","disable","workflow","skills","templates","version","schedules","llm","new","edit","cancel"].includes(commandName)) {
        if (await handleNaturalLanguageCommand(ctx, commandName, argsText)) return;
      }
    }
    await next();
  });

  // 5. 媒体 handlers — 对齐 ln.on("message:photo/voice/video/audio/document") L17169-17230
  const lang0 = () => glang();
  bot.on("message:photo", async (ctx) => {
    const ph = ctx.message.photo;
    const file = {
      field: "photo",
      label: t("mediaLabel.photo", {}, lang0()),
      ext: ".jpg",
      fileId: ph[ph.length - 1].file_id,
      fileName: null,
      mimeType: null,
      duration: null,
      caption: ctx.message.caption ?? "",
    };
    const groupId = ctx.message.media_group_id;
    if (groupId) await handleAlbumMedia(ctx, file, groupId);
    else await handleSingleMedia(ctx, file);
  });
  const singleMediaHandler = (field) => async (ctx) => {
    const fileObj = ctx.message[field];
    const file = {
      field,
      label: t(`mediaLabel.${field}`, {}, lang0()),
      ext: fieldExt(field, fileObj?.file_name),
      fileId: fileObj?.file_id,
      fileName: fileObj?.file_name ?? null,
      mimeType: fileObj?.mime_type ?? null,
      duration: fileObj?.duration ?? null,
      caption: ctx.message.caption ?? "",
    };
    await handleSingleMedia(ctx, file);
  };
  bot.on("message:voice", singleMediaHandler("voice"));
  bot.on("message:video", singleMediaHandler("video"));
  bot.on("message:audio", singleMediaHandler("audio"));
  bot.on("message:document", singleMediaHandler("document"));

  // 6. 全局错误捕获 — 对齐 n.catch（L17928）
  bot.catch((err) => console.error("[Bot Error]", err.error));

  return bot;
}