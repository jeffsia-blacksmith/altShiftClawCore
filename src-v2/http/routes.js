// http/routes.js — Hono app 装配
// 行为对齐旧 bundle dr（L20076-20083）+ oc/Vc 中间件 + Jc onError + 子路由。
// R1 阶段：oc(config) + Vc(store/octokit/d1/ai) + Ao(/ + /health) + bu(github webhook) + ou(telegram webhook)。

import { Hono } from "hono";
import { buildConfig, ConfigError } from "../config.js";
import { createKvStore, ensureMigrated } from "../db/d1.js";
import { languageMiddleware } from "../i18n/language.js";
import { createGithubWebhookHandler } from "./github-webhook.js";
import { createTelegramWebhookHandler } from "./telegram-webhook.js";

export function createApp({ bot = null, githubEventHandlers = {}, buildOctokit = null } = {}) {
  const app = new Hono();

  // oc 中间件 — 对齐 L9297-9300：buildConfig(env) → c.var.config
  app.use("*", async (c, next) => {
    c.set("config", buildConfig(c.env));
    await next();
  });

  // Vc 中间件 — 对齐 L11976-11986：lazy-once migration + octokit/store/d1/ai
  app.use("*", async (c, next) => {
    const config = c.var.config;
    const db = c.env.SCHEDULES_DB;
    await ensureMigrated(db);
    c.set("d1", db);
    c.set("store", createKvStore(db));
    c.set("ai", c.env.AI ?? null);
    if (buildOctokit) {
      c.set("octokit", buildOctokit(config));
    }
    await next();
  });

  // 语言中间件 — 对齐 Of L17902-17906：ctx.language = getLanguage(services), ctx.t
  app.use("*", languageMiddleware());

  // Ao — GET / + GET /health（L11993-12001）
  app.get("/", (c) => {
    const version = c.var?.config?.version ?? "1.0.0";
    return c.json({ ok: true, service: "githubclaw-core", version });
  });
  app.get("/health", (c) => {
    const version = c.var?.config?.version ?? "1.0.0";
    return c.json({ ok: true, service: "githubclaw-core", version });
  });

  // bu — POST /github/webhook（L20049-20068）
  app.post("/github/webhook", async (c) => {
    const handler = createGithubWebhookHandler({
      config: c.var.config,
      services: { octokit: c.var.octokit, store: c.var.store, d1: c.var.d1, ai: c.var.ai },
      eventHandlers: githubEventHandlers,
    });
    return handler(c);
  });

  // ou — POST * with secret+path gate（L17932-17955）
  app.post("*", async (c, next) => {
    const handler = createTelegramWebhookHandler({
      config: c.var.config,
      services: { octokit: c.var.octokit, store: c.var.store, d1: c.var.d1, ai: c.var.ai },
      bot,
    });
    return handler(c, next);
  });

  // Jc onError — 对齐 L11987-11992
  app.onError((err, c) => {
    if (err instanceof ConfigError) {
      console.error("[ConfigError]", err.message);
      return c.json({ ok: false, error: "Configuration error" }, 500);
    }
    console.error("[UnhandledError]", err.message, err.stack);
    return c.json({ ok: false, error: "Internal server error" }, 500);
  });

  return app;
}