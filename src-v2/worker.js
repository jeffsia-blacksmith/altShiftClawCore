// worker.js — Worker entry
// 部署契约对齐旧 bundle VP = { fetch: dr.fetch, scheduled: Gg }（L20185）。
// R0 阶段：仅 fetch；scheduled handler 在 R6 接入（暂留占位以保持 export shape）。

import { createApp } from "./http/routes.js";

const app = createApp();

// R0：scheduled 暂为 no-op 占位（R6 cron handler 接入后替换）。
async function scheduled(event, env, ctx) {
  // R6 将接入 cron handler + AI 时间解析 + schedule CRUD。
  void event;
  void env;
  void ctx;
}

export default {
  fetch: app.fetch,
  scheduled,
};