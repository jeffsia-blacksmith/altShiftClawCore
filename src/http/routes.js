// http/routes.js — Hono app 装配
// 行为对齐旧 bundle dr（L20076-20083）+ oc/Vc 中间件 + Jc onError + 子路由。
// R1 阶段：oc(config) + Vc(store/octokit/d1/ai) + Ao(/ + /health) + bu(github webhook) + ou(telegram webhook)。

import { Hono } from "hono";
import { buildConfig, ConfigError } from "../config.js";
import { createKvStore, ensureMigrated } from "../db/d1.js";
import { languageMiddleware } from "../i18n/language.js";
import { createGithubWebhookHandler } from "./github-webhook.js";
import { createTelegramWebhookHandler } from "./telegram-webhook.js";
import { createBot } from "../telegram/bot.js";
import { buildOctokit as defaultBuildOctokit } from "../github/octokit.js";
import { registerAllWebhookHandlers } from "../github/webhooks/index.js";

export function createApp({ buildOctokit = defaultBuildOctokit } = {}) {
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

  // 探针：Workers AI binding 是否可用（部署后 curl 即可确认排程时间解析能否走 AI 路径）
  app.get("/health/ai", async (c) => {
    const start = Date.now();
    const ai = c.var?.ai ?? null;
    const model = c.var?.config?.scheduleTimeUnderstanding?.model ?? "@cf/openai/gpt-oss-20b";
    if (!ai) {
      return c.json({ ok: false, ai_bound: false, model, error: "AI binding not attached (env.AI is null). Schedule time parsing will use the local fallback.", elapsed_ms: Date.now() - start });
    }
    try {
      const resp = await ai.run(model, {
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
        temperature: 0,
      });
      let sample = "";
      if (typeof resp === "string") sample = resp.slice(0, 40);
      else if (resp?.result?.response) sample = String(resp.result.response).slice(0, 40);
      else if (resp?.response) sample = String(resp.response).slice(0, 40);
      else if (resp?.choices?.[0]?.message?.content) sample = String(resp.choices[0].message.content).slice(0, 40);
      return c.json({ ok: true, ai_bound: true, model, sample, elapsed_ms: Date.now() - start });
    } catch (e) {
      return c.json({ ok: false, ai_bound: true, model, error: e?.message ?? String(e), elapsed_ms: Date.now() - start });
    }
  });

  // bu — POST /github/webhook（L20049-20068）
  app.post("/github/webhook", async (c) => {
    const config = c.var.config;
    const services = {
      octokit: c.var.octokit,
      store: c.var.store,
      d1: c.var.d1,
      ai: c.var.ai,
      config,
    };
    const registerHandlers = (webhooks) => registerAllWebhookHandlers(webhooks, services);
    const handler = createGithubWebhookHandler({
      config,
      services,
      registerHandlers,
    });
    return handler(c);
  });

  // yu — GET /api/active-issue（L20070-20075）
  app.get("/api/active-issue", async (c) => {
    const store = c.var.store;
    const chatId = Number(c.req.query("chat_id") ?? 0);
    if (!chatId) return c.json({ error: "chat_id required" }, 400);
    const active = store ? await store.get(`active-issue:${chatId}`) : null;
    const issueNumber = active ? Number(active) : null;
    if (issueNumber !== null && (!Number.isFinite(issueNumber) || issueNumber <= 0)) return c.json({ issueNumber: null });
    return c.json({ issueNumber });
  });

  // ou — POST * with secret+path gate（L17932-17955）
  app.post("*", async (c, next) => {
    const config = c.var.config;
    const services = {
      octokit: c.var.octokit,
      store: c.var.store,
      d1: c.var.d1,
      ai: c.var.ai,
      config,
    };
    const bot = createBot({ config, services });
    const handler = createTelegramWebhookHandler({
      config,
      services,
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