// commands/workflow-controls.js — /enable /disable /workflow
// 行为对齐旧 bundle Fn.command("enable"/"disable"/"workflow")（L13196-13275）。
// 三命令共用 active-lobster 前置 + actions.listRepoWorkflows 查 issue-<n>.yml。

import { t, glang } from "../../i18n/index.js";
import { getActiveIssue } from "../../db/kv-state.js";
import { escapeMarkdownV2 as O, MARKDOWN_V2_PARSE_MODE as He } from "../markdown.js";
import { logError } from "../../i18n/log.js";

function issueWorkflowFile(issueNumber) {
  return `issue-${issueNumber}.yml`;
}

// bi(n) — escaped "#<n>" for MarkdownV2（对齐旧 bundle bi L13152）
const issueRef = (n) => `\\#${n}`;

async function findIssueWorkflow(octokit, owner, repo, issueNumber) {
  const { data } = await octokit.rest.actions.listRepoWorkflows({ owner, repo });
  const path = `.github/workflows/${issueWorkflowFile(issueNumber)}`;
  return data.workflows.find((w) => w.path === path) ?? null;
}

export function registerWorkflowControls(composer) {
  // /enable — 对齐 L13196-13221
  composer.command("enable", async (ctx) => {
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const lang = ctx.language ?? glang();
    const chatId = ctx.chat?.id;
    const active = chatId ? await getActiveIssue(store, chatId) : null;
    if (!active) {
      await ctx.reply(O(t("core.noActiveLobsterSelected", {}, lang)), He);
      return;
    }
    const wfFile = issueWorkflowFile(active);
    try {
      const wf = await findIssueWorkflow(octokit, owner, repo, active);
      if (!wf) {
        await ctx.reply(t("core.workflowNotFound", { name: `\`${O(wfFile)}\`` }, lang), He);
        return;
      }
      await octokit.rest.actions.enableWorkflow({ owner, repo, workflow_id: wf.id });
      await ctx.reply(
        t("core.workflowEnabledOk", { name: `\`${O(wfFile)}\``, number: issueRef(active) }, lang),
        He,
      );
    } catch (e) {
      logError("log.workflow.enableFailed", { command: "enable", error: e instanceof Error ? e.message : String(e) });
      await ctx.reply(t("core.enableWorkflowFailed", { name: `\`${O(wfFile)}\`` }, lang), He);
    }
  });

  // /disable — 对齐 L13222-13247
  composer.command("disable", async (ctx) => {
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const lang = ctx.language ?? glang();
    const chatId = ctx.chat?.id;
    const active = chatId ? await getActiveIssue(store, chatId) : null;
    if (!active) {
      await ctx.reply(O(t("core.noActiveLobsterSelected", {}, lang)), He);
      return;
    }
    const wfFile = issueWorkflowFile(active);
    try {
      const wf = await findIssueWorkflow(octokit, owner, repo, active);
      if (!wf) {
        await ctx.reply(t("core.workflowNotFound", { name: `\`${O(wfFile)}\`` }, lang), He);
        return;
      }
      await octokit.rest.actions.disableWorkflow({ owner, repo, workflow_id: wf.id });
      await ctx.reply(
        t("core.workflowDisabledOk", { name: `\`${O(wfFile)}\``, number: issueRef(active) }, lang),
        He,
      );
    } catch (e) {
      logError("log.workflow.disableFailed", { command: "disable", error: e instanceof Error ? e.message : String(e) });
      await ctx.reply(t("core.disableWorkflowFailed", { name: `\`${O(wfFile)}\`` }, lang), He);
    }
  });

  // /workflow — 对齐 L13248-13275（只读状态卡）
  composer.command("workflow", async (ctx) => {
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const lang = ctx.language ?? glang();
    const chatId = ctx.chat?.id;
    const active = chatId ? await getActiveIssue(store, chatId) : null;
    if (!active) {
      await ctx.reply(O(t("core.noActiveLobsterSelected", {}, lang)), He);
      return;
    }
    const wfFile = issueWorkflowFile(active);
    try {
      const wf = await findIssueWorkflow(octokit, owner, repo, active);
      if (!wf) {
        await ctx.reply(
          t("core.workflowNotCreatedYet", { number: issueRef(active), name: `\`${O(wfFile)}\`` }, lang),
          He,
        );
        return;
      }
      const stateText =
        wf.state === "active"
          ? t("schedule.workflowStateActive", {}, lang)
          : wf.state === "disabled_manually"
            ? t("schedule.workflowStateDisabledManually", {}, lang)
            : String(wf.state);
      await ctx.reply(
        t("core.workflowStatusCard", { number: issueRef(active), name: `\`${O(wfFile)}\``, status: O(stateText), id: String(wf.id) }, lang),
        He,
      );
    } catch (e) {
      logError("log.workflow.queryFailed", { command: "workflow", error: e instanceof Error ? e.message : String(e) });
      await ctx.reply(t("core.queryWorkflowFailed", {}, lang), He);
    }
  });
}