// telegram/access-guard.js — AccessGuard default-deny
// 行为对齐旧 bundle Pd（L12010-12049）。
// 5 个检查按序：notFullyConfigured → privateOnly → unauthorizedUser → unauthorizedChat → messageTooLong。
// 任一不通过 → reply 对应 i18n key + return（不调用 next，阻断下游命令）。
// 全通过 → next()。

import { t, glang } from "../i18n/index.js";

export function accessGuard({ allowedFromId, allowedChatId, maxMessageLength = 4096 }) {
  return async (ctx, next) => {
    const fromId = ctx.from?.id ?? null;
    const chatId = ctx.chat?.id ?? null;
    const chatType = ctx.chat?.type ?? null;
    const text = typeof ctx.message?.text === "string" ? ctx.message.text.trim() : "";
    const lang = ctx.language ?? glang();

    if (allowedFromId == null || allowedChatId == null) {
      console.error("[AccessGuard] TELEGRAM_ALLOWED_FROM_ID and TELEGRAM_ALLOWED_CHAT_ID must both be set; denying all requests.");
      await ctx.reply(t("access.notFullyConfigured", {}, lang));
      return;
    }
    if (chatType !== "private") {
      await ctx.reply(t("access.privateOnly", {}, lang));
      return;
    }
    if (fromId !== allowedFromId) {
      await ctx.reply(t("access.unauthorizedUser", {}, lang));
      return;
    }
    if (chatId !== allowedChatId) {
      await ctx.reply(t("access.unauthorizedChat", {}, lang));
      return;
    }
    if (text.length > 0 && text.length > maxMessageLength) {
      await ctx.reply(t("access.messageTooLong", { max: maxMessageLength }, lang));
      return;
    }
    await next();
  };
}