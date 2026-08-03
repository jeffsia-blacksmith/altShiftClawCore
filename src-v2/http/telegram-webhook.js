// http/telegram-webhook.js — Telegram webhook secret + path 验证
// 行为对齐旧 bundle ou（L17932-17955）。
// 契约：
//   path != TELEGRAM_WEBHOOK_PATH → 落空（next() → Hono 404）
//   x-telegram-bot-api-secret-token != secret → 401 {ok:false, error:"Invalid secret"}
//   valid secret → 200 {ok:true}，update 在 waitUntil 内由 bot.handleUpdate 处理。
//   bot 未注入（防御性）→ 仍消费 body，回 200。

export function createTelegramWebhookHandler({ config, services, bot }) {
  return async (c, next) => {
    const url = new URL(c.req.url);
    if (url.pathname !== config.telegram?.webhookPath) {
      return next();
    }
    if (c.req.header("x-telegram-bot-api-secret-token") !== config.telegram?.webhookSecret) {
      return c.json({ ok: false, error: "Invalid secret" }, 401);
    }
    // R3: bot = createBot({ config, services }); await bot.init(); const update = await c.req.json();
    // c.executionCtx.waitUntil(bot.handleUpdate(update).catch(e => console.error("[Bot Error]", e)));
    if (bot) {
      await bot.init();
      const update = await c.req.json();
      c.executionCtx.waitUntil(
        bot.handleUpdate(update).catch((e) => console.error("[Bot Error]", e)),
      );
    } else {
      // 防御性回退：bot 未注入时仍消费 body，回 200
      await c.req.json();
    }
    return c.json({ ok: true });
  };
}