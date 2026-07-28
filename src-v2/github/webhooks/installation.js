// github/webhooks/installation.js — installation.created
// 行为对齐旧 bundle installation.created handler（L20015-20024）+ ug（L19416-19450）。
// R5 阶段：发送 welcome 消息（system.welcomeReady1+2）到 config telegram chat_id。
// auto-init（kE 创建第一只龙虾）在 R9 接入；R5 仅 welcome。

import { t, glang } from "../../i18n/index.js";
import { setActiveIssue } from "../../db/kv-state.js";

const INIT_DONE_KEY = "init_github_claw_done";

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

// kE — 创建第一只龙虾（对齐 L19372-19404）
// R9 最小：octokit.issues.create + setActiveIssue；orphan 分支 / workflow 写入在 R9b 或留作 /new 流复用
async function createFirstLobster(env, chatId) {
  const { octokit, store, config } = env;
  const { owner, repo } = config.github;
  const title = config.github.repo ?? "Default Lobster";
  const meta = { chat_id: chatId, source: "auto-init" };
  const body = `<!-- telegram-meta: ${JSON.stringify(meta)} -->\n\n\`\`\`json\n{"name":"${title}","description":"${t("system.defaultLobsterDescription", {}, glang())}"}\n\`\`\``;
  const { data } = await octokit.rest.issues.create({ owner, repo, title, body });
  const issueNumber = data.number;
  await setActiveIssue(store, issueNumber, chatId);
  // R9b: orphan 分支 issue-<n> + workflow issue-<n>.yml 写入（复用 /new finalize 逻辑）
  return { number: issueNumber, title };
}

// EE — 标记 init 完成（对齐 L19405-19414）
async function markInitDone(env) {
  await env.store.put(INIT_DONE_KEY, "true");
  // R9b: 设 repo variable INIT_GITHUB_CLAW=false（需 octokit repos.createUpdateOrgVariable
  //   或 actions.createRepoVariable；R9 最小用 store flag 幂等即可）
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

      // R9: auto-init — 创建第一只龙虾
      if (env.config.initGitHubClaw) {
        if ((await env.store.get(INIT_DONE_KEY)) === "true") {
          console.log("[auto-init] already initialized, skip");
          return;
        }
        try {
          const created = await createFirstLobster(env, chatId);
          await markInitDone(env);
          await bot.api.sendMessage(
            chatId,
            t("system.autoInitCreated", { title: created.title, number: created.number }, glang()),
          );
        } catch (e) {
          console.error("[auto-init] create failed:", e);
          await bot.api.sendMessage(chatId, t("system.autoInitFailed", {}, glang()));
        }
      }
    } catch (e) {
      console.error("[webhook] install welcome failed:", e);
    }
  });
}