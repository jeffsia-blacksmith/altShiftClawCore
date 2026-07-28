// github/webhooks/installation.js — installation.created
// 行为对齐旧 bundle installation.created handler（L20015-20024）+ ug（L19416-19450）。
// R5 阶段：发送 welcome 消息（system.welcomeReady1+2）到 config telegram chat_id。
// auto-init（kE 创建第一只龙虾）在 R9 接入；R5 仅 welcome。

import { t, glang } from "../../i18n/index.js";

function isRelatedInstallation(payload, env) {
  const repos = payload.repositories ?? [];
  if (repos.length === 0) return true; // org-wide install
  return repos.some((r) => r.full_name === env.config.github.repoFullName);
}

function resolveChatId(env) {
  return env.config.telegram.defaultChatId ?? env.config.telegram.allowedChatId ?? null;
}

function buildWelcomeText(env) {
  const lang = glang();
  const profileName = env.config.profileName ?? env.config.github.repoFullName;
  const url = `https://github.com/${env.config.github.owner}/${env.config.github.repo}`;
  return `${t("system.welcomeReady1", { profileName }, lang)}\n${t("system.welcomeReady2", { url }, lang)}`;
}

export function registerInstallationHandlers(webhooks, env) {
  webhooks.on("installation.created", async ({ payload }) => {
    try {
      if (!isRelatedInstallation(payload, env)) {
        console.log("[installation.created] skip unrelated installation event");
        return;
      }
      const chatId = resolveChatId(env);
      if (!chatId) {
        console.warn("[installation.created] telegram chat id is missing, skip welcome message");
        return;
      }
      const { Bot } = await import("grammy");
      const bot = new Bot(env.config.telegram.botToken, {
        client: { apiRoot: env.config.telegram.apiBaseUrl ?? "https://api.telegram.org" },
      });
      await bot.api.sendMessage(chatId, buildWelcomeText(env));
      // R9: if (env.config.initGitHubClaw) { create first lobster + mark done }
    } catch (e) {
      console.error("[webhook] install welcome failed:", e);
    }
  });
}