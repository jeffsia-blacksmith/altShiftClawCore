// http/github-webhook.js — GitHub webhook 签名验证 + event 分发
// 行为对齐旧 bundle bu（L20049-20068）+ Og（L19960-20045）。
// R1 阶段：仅签名验证 + verifyAndReceive 框架；event handlers 在 R5 接入。
// R0/R1 guardrail 契约：
//   bad signature  → 400 {ok:false, error:"...signature does not match..."}
//   valid sig + ping/unknown event → 200 {ok:true}
//   valid sig + missing x-github-event → 400 {ok:false, error:"Event name not passed"}
//   valid sig + invalid JSON → 400 {ok:false, error:"Invalid JSON"}

import { Webhooks } from "@octokit/webhooks";

export function createGithubWebhookHandler({ config, services, registerHandlers = null }) {
  const webhooks = new Webhooks({ secret: config.github?.webhookSecret ?? "" });

  // R5+ 注册 event handlers（对齐 Og 的 .on() 注册集合）
  if (registerHandlers) {
    registerHandlers(webhooks);
  }

  return async (c) => {
    const id = c.req.header("x-github-delivery") ?? "";
    const name = c.req.header("x-github-event") ?? "";
    const signature = c.req.header("x-hub-signature-256") ?? "";
    const payload = await c.req.text();
    try {
      await webhooks.verifyAndReceive({ id, name, signature, payload });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[GitHub webhook]", msg);
      return c.json({ ok: false, error: msg }, 400);
    }
    return c.json({ ok: true });
  };
}