// github/webhooks/installation.js — installation.created
// 行为对齐旧 bundle installation.created handler（L20015-20024）+ ug（L19416-19450）。
// R5 阶段：发送 welcome 消息（system.welcomeReady1+2）到 config telegram chat_id。
// auto-init（kE 创建第一只龙虾）在 R9 接入；R5 仅 welcome。

import { t, glang } from "../../i18n/index.js";
import { setActiveIssue } from "../../db/kv-state.js";
import { readTemplateFiles, createOrphanBranch, syncWorkflowFile, upsertIssueTemplate } from "../branches.js";

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
async function createFirstLobster(env, chatId) {
  const { octokit, store, d1, config } = env;
  const { owner, repo, repoFullName } = config.github;
  const title = config.github.repo ?? "Default Lobster";
  const profileName = config.profileName ?? title;
  const meta = { chat_id: chatId, source: "auto-init" };
  const body = `<!-- telegram-meta: ${JSON.stringify(meta)} -->\n\n\`\`\`json\n${JSON.stringify({ name: title, description: t("system.defaultLobsterDescription", { name: profileName }, glang()) }, null, 2)}\n\`\`\``;
  const { data } = await octokit.rest.issues.create({ owner, repo, title, body });
  const issueNumber = data.number;
  await setActiveIssue(store, issueNumber, chatId);
  const template = "default";
  const personality = config.personality || "";
  try {
    const files = await readTemplateFiles(octokit, owner, repo, template, personality);
    if (files.length > 0) {
      await createOrphanBranch(octokit, owner, repo, `issue-${issueNumber}`, files, `chore: init issue #${issueNumber} orphan branch (template: ${template})`);
      await syncWorkflowFile(octokit, owner, repo, issueNumber, template);
    }
  } catch (e) {
    console.warn("[auto-init] template branch/workflow setup skipped:", e.message);
  }
  try { await upsertIssueTemplate(d1, repoFullName, issueNumber, template); } catch (e) { console.warn("[auto-init] D1 metadata upsert skipped:", e.message); }
  return { number: issueNumber, title };
}

// EE — 标记 init 完成（对齐 L19405-19414）
async function markInitDone(env) {
  await env.store.put(INIT_DONE_KEY, "true");
  const { octokit } = env;
  const { owner, repo } = env.config.github;
  try {
    await octokit.rest.actions.updateRepoVariable({ owner, repo, name: "INIT_GITHUB_CLAW", value: "false" });
  } catch (e) {
    if (/404|not found/i.test(e.message ?? "")) {
      await octokit.rest.actions.createRepoVariable({ owner, repo, name: "INIT_GITHUB_CLAW", value: "false" });
    } else {
      console.error("[auto-init] set repo variable failed:", e.message);
    }
  }
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