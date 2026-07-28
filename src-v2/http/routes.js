// http/routes.js — Hono app 装配
// R0 阶段：仅 / + /health + onError + config middleware。
// 行为对齐旧 bundle Ao（L11993-12001）+ Jc onError（L11987-11992）+ oc config 中间件（L9297-9300）。

import { Hono } from "hono";
import { buildConfig, ConfigError } from "../config.js";

export function createApp() {
  const app = new Hono();

  // config middleware — 对齐 oc(e, t)：把 buildConfig(env) 写入 c.var.config
  app.use("*", async (c, next) => {
    c.set("config", buildConfig(c.env));
    await next();
  });

  // GET / — 对齐 Ao.get("/")：{ ok: true, service, version }
  app.get("/", (c) => {
    const version = c.var?.config?.version ?? "1.0.0";
    return c.json({ ok: true, service: "githubclaw-core", version });
  });

  // GET /health — 对齐 Ao.get("/health")
  app.get("/health", (c) => {
    const version = c.var?.config?.version ?? "1.0.0";
    return c.json({ ok: true, service: "githubclaw-core", version });
  });

  // onError — 对齐 Jc(e, t)
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