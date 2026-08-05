// github/webhooks/installation.js — installation.created
// 行为对齐旧 bundle installation.created handler（L20015-20024）+ ug（L19416-19450）。
// R5 阶段：发送 welcome 消息（system.welcomeReady1+2）到 config telegram chat_id。
// auto-init（kE 创建第一只龙虾）在 R9 接入；R5 仅 welcome。

import { t, glang } from "../../i18n/index.js";
import { logInfo, logWarn, logError } from "../../i18n/log.js";
import { setActiveIssue } from "../../db/kv-state.js";
import { readTemplateFiles, createOrphanBranch, syncWorkflowFile, upsertIssueTemplate, buildIssueBody } from "../branches.js";

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

// kE — 创建第一只龙虾（对齐 L19370-19404）
// 关键差异修复（Phase T）：name/description 用 repo 名（非 profileName）；meta 含 ts + source 在前；
// body 经 buildIssueBody（ci）；Er→Pn→Sr→Vr→rr 全部不包裹 → 缺模板时抛 TEMPLATE_NOT_INSTALLED → ug catch → autoInitFailed；
// setActiveIssue 移到最后（对齐 kE L19394）。
async function createFirstLobster(env, chatId) {
  const { octokit, store, d1, config } = env;
  const { owner, repo, repoFullName } = config.github;
  const template = "default";
  const personality = config.personality || "";
  const lang = glang();
  // 对齐 kE L19374-19375：name/title = repo 名，description 用 repo 名
  const name = repo;
  const description = t("system.defaultLobsterDescription", { name }, lang);
  // 对齐 kE L19376-19379：meta = {source, chat_id, ts}（source 在前，含 ts）
  const meta = { source: "auto-init", chat_id: chatId, ts: new Date().toISOString() };
  const body = buildIssueBody(meta, { name, description });
  const { data } = await octokit.rest.issues.create({ owner, repo, title: name, body });
  const issueNumber = data.number;
  const branch = `issue-${issueNumber}`;
  // 对齐 kE L19381-19394：Er→Pn→Sr→Vr→rr（全部不包裹，任一抛出 → autoInitFailed）
  const files = await readTemplateFiles(octokit, owner, repo, template, personality, config.language);
  const fileItems = files.map((f) => ({ path: f.path, content: f.content }));
  await createOrphanBranch(octokit, owner, repo, branch, fileItems, `chore: init issue #${issueNumber} orphan branch (template: ${template})`);
  await syncWorkflowFile(octokit, owner, repo, issueNumber, template);
  await upsertIssueTemplate(d1, repoFullName, issueNumber, template);
  await setActiveIssue(store, issueNumber, chatId);
  logInfo("log.autoInit.firstLobsterCreated", { issueNumber, title: name });
  return { number: issueNumber, title: data.title };
}

// EE — 标记 init 完成（对齐 L19405-19414）
async function markInitDone(env) {
  await env.store.put(INIT_DONE_KEY, "true");
  const { octokit } = env;
  const { owner, repo } = env.config.github;
  try {
    await octokit.rest.actions.updateRepoVariable({ owner, repo, name: "INIT_GITHUB_CLAW", value: "false" });
    logInfo("log.autoInit.variableSetFalse", {});
  } catch (e) {
    if ((e?.status === 404) || /404|not found/i.test(e?.message ?? "")) {
      await octokit.rest.actions.createRepoVariable({ owner, repo, name: "INIT_GITHUB_CLAW", value: "false" });
      logInfo("log.autoInit.variableSetFalse", {});
    } else {
      logWarn("log.autoInit.variableUpdateFailed", { error: e?.message ?? String(e) });
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
          logInfo("log.autoInit.alreadyInitialized");
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
          logError("log.autoInit.createFailed", { error: e?.message ?? String(e) });
          await bot.api.sendMessage(chatId, t("system.autoInitFailed", {}, glang()));
        }
      }
    } catch (e) {
      logError("log.webhook.installWelcomeFailed", { error: e?.message ?? String(e) });
    }
  });
}