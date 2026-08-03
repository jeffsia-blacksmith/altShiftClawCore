// github/octokit.js — Octokit 实例构造
// 行为对齐旧 bundle Ro（L11906-11913）。
// R3 阶段：仅 auth + baseUrl + userAgent，够 /list /start /close 调 issues.listForRepo。

import { Octokit } from "octokit";

export function buildOctokit(config) {
  return new Octokit({
    auth: config.github?.token,
    baseUrl: config.github?.apiBaseUrl ?? "https://api.github.com",
    userAgent: config.github?.userAgent ?? "altShiftClawCore/1.0.0",
  });
}