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
import { registerFlowCallbacks } from "./flows/callbacks.js";

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
  registerNew(commands);
  registerFlowCancel(commands);
  registerFlowCallbacks(commands);
  bot.use(commands);

  // 4. message:text 续接 — 对齐 su.on("message:text") 的 Ke 分支（L17831）
  // 若存在 new-flow 状态，文本由 flow 消费；否则留给后续阶段的 comment-on-issue 路径。
  bot.on("message:text", async (ctx, next) => {
    const consumed = await handleFlowText(ctx);
    if (consumed) return;
    await next();
  });

  // 5. 全局错误捕获 — 对齐 n.catch（L17928）
  bot.catch((err) => console.error("[Bot Error]", err.error));

  return bot;
}