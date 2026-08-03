// worker.js — Worker entry
// 部署契约对齐旧 bundle VP = { fetch: dr.fetch, scheduled: Gg }（L20185）。

import { createApp } from "./http/routes.js";
import { handleScheduled } from "./scheduler/cron.js";
import { _validateLogKeys } from "./i18n/log.js";

_validateLogKeys();

const app = createApp();

export default {
  fetch: app.fetch,
  scheduled: handleScheduled,
};