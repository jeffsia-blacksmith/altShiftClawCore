// i18n/language.js — Hono language middleware
// 行为对齐旧 bundle Of 的语言中间件（L17902-17906）：
//   ctx.language = await getLanguage(services); services = { store, config }
//   ctx.t = (key, params) => i18nT(key, params, ctx.language)
// 在 R3+ Telegram bot 装配时，bot 的 language middleware 会复用同一 getLanguage。

import { getLanguage, i18nT } from "./index.js";

export function languageMiddleware() {
  return async (c, next) => {
    const services = { store: c.var?.store, config: c.var?.config };
    c.set("language", await getLanguage(services));
    c.set("t", (key, params = {}) => i18nT(key, params, c.var?.language ?? "en"));
    await next();
  };
}