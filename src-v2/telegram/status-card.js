// telegram/status-card.js — 龙虾信息卡（ks/Hp/gp/qd/u_）
// 行为对齐旧 bundle ks（L6464）+ Hp（L6259）+ gp（L5187）+ qd（L4588）+ u_（L6477）。
// 7 路并行 octokit/D1 调用 → MarkdownV2 信息卡 + action keyboard。

import { t, glang } from "../i18n/index.js";
import { InlineKeyboard } from "grammy";
import { listSchedulesForIssue } from "../db/schedules.js";
import { escapeMarkdownV2 as O, MARKDOWN_V2_PARSE_MODE as fp } from "./markdown.js";
import { scheduleRuleTypeLabel, scheduleRuleDescription } from "./edge-replies.js";

// Bt — locale-formatted timestamp (对齐旧 bundle Bt L5178-5181)
function formatLocalTime(iso, lang) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const locale = lang === "zh-CN" ? "zh-CN" : "en";
  return d.toLocaleString(locale, { timeZone: "Asia/Taipei" });
}

// escapeUrl — escape MarkdownV2 link URL (对齐旧 bundle: escape `\` and `)`)
function escapeUrl(url) {
  if (!url) return "";
  return String(url).replace(/\\/g, "\\\\").replace(/\)/g, "\\)");
}

// parseCodexModel — 解析 .codex/config.toml 的 model（对齐旧 bundle: 多行/单引号/bare）
function parseCodexModel(content) {
  if (!content) return null;
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("[")) continue;
    const m = line.match(/^model\s*=\s*(.+)$/);
    if (!m) continue;
    const v = m[1].trim();
    const dq = v.match(/^"([^"]*)"$/);
    if (dq) return dq[1];
    const sq = v.match(/^'([^']*)'$/);
    if (sq) return sq[1];
    return v;
  }
  return null;
}

// Hp — 7 路并行数据采集
async function gatherIssueData(octokit, d1, owner, repo, repoFullName, issueNumber) {
  const branch = `issue-${issueNumber}`;
  const [issueInfo, skills, schedules, templateName, modelSources, workflow, llm] = await Promise.all([
    // 1. issues.get
    (async () => {
      try {
        const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: issueNumber });
        return { number: issueNumber, title: data.title || "", state: data.state || "", branch, exists: true };
      } catch {
        return { number: issueNumber, title: "", state: "", branch, exists: false };
      }
    })(),
    // 2. installed skills
    (async () => {
      try {
        const { data } = await octokit.rest.repos.getContent({ owner, repo, path: ".agents/skills", ref: branch });
        return Array.isArray(data) ? data.filter((d) => d.type === "dir").map((d) => d.name) : [];
      } catch { return []; }
    })(),
    // 3. schedules for issue
    (async () => {
      try { return await listSchedulesForIssue(d1, repoFullName, issueNumber); }
      catch { return []; }
    })(),
    // 4. template name from issue_metadata
    (async () => {
      try {
        const row = await d1.prepare("SELECT template FROM issue_metadata WHERE repo = ? AND issue_number = ? LIMIT 1").bind(repoFullName, issueNumber).first();
        return row?.template ?? null;
      } catch { return null; }
    })(),
    // 5. model sources (copilot/codex configs)
    (async () => {
      const sources = [
        { source: "copilot", label: "GitHub Copilot", path: ".copilot/config.json" },
        { source: "codex", label: "Codex", path: ".codex/config.toml" },
      ];
      const results = [];
      for (const s of sources) {
        try {
          const { data } = await octokit.rest.repos.getContent({ owner, repo, path: s.path, ref: branch });
          if (data.content) {
            const content = Buffer.from(data.content, "base64").toString("utf8");
            let model = null;
            if (s.source === "copilot") { try { model = JSON.parse(content).model ?? null; } catch {} }
            else { model = parseCodexModel(content); }
            results.push({ ...s, exists: true, model });
          } else { results.push({ ...s, exists: false, model: null }); }
        } catch { results.push({ ...s, exists: false, model: null }); }
      }
      return results;
    })(),
    // 6. workflow info
    (async () => {
      let branchExists = false;
      try { await octokit.rest.git.getRef({ owner, repo, ref: `heads/issue-${issueNumber}` }); branchExists = true; } catch {}
      let workflowExists = false, workflowEnabled = false, workflowId = null, workflowState = null, workflowHtmlUrl = null;
      try {
        const { data: wfList } = await octokit.rest.actions.listRepoWorkflows({ owner, repo });
        const wf = wfList.workflows.find((w) => w.path === `.github/workflows/issue-${issueNumber}.yml`);
        if (wf) {
          workflowExists = true; workflowId = wf.id; workflowState = wf.state; workflowHtmlUrl = wf.html_url;
          workflowEnabled = wf.state !== "disabled_manually";
        }
      } catch {}
      let status = "missing";
      let activeRunId = null, activeRunHtmlUrl = null;
      if (!workflowExists) status = "missing";
      else if (!workflowEnabled) status = "disabled";
      else {
        // 查 workflow runs 检测 running 状态（对齐旧 bundle s_ L6367-6386）
        try {
          const { data: runs } = await octokit.rest.actions.listWorkflowRuns({ owner, repo, workflow_id: workflowId, per_page: 10 });
          const activeRun = runs.workflow_runs?.find((r) => r.status !== "completed");
          if (activeRun) {
            status = "running";
            activeRunId = activeRun.id ?? activeRun.run_number ?? null;
            activeRunHtmlUrl = activeRun.html_url ?? null;
            workflowHtmlUrl = activeRun.html_url ?? workflowHtmlUrl;
          } else {
            status = "idle";
          }
        } catch { status = "idle"; }
      }
      return { file: `issue-${issueNumber}.yml`, path: `.github/workflows/issue-${issueNumber}.yml`, url: workflowHtmlUrl, id: workflowId, exists: workflowExists, enabled: workflowEnabled, state: workflowState, branchExists, status, activeRunId, activeRunHtmlUrl };
    })(),
    // 7. LLM settings
    (async () => {
      try {
        const { data } = await octokit.rest.repos.getContent({ owner, repo, path: ".pi/settings.json", ref: branch });
        if (data.content) {
          const settings = JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
          return { provider: settings.defaultProvider ?? null, model: settings.defaultModel ?? null };
        }
      } catch {}
      return { provider: null, model: null };
    })(),
  ]);
  return { issue: issueInfo, templateName, skills, schedules: { count: schedules.length, items: schedules }, models: { sources: modelSources, hasConfiguredModel: modelSources.some((s) => s.model !== null), fallbackLabel: null }, llm, workflow };
}

// gp — MarkdownV2 信息卡文本
function buildStatusCardText(e, lang) {
  const L = lang;
  const lines = [];
  // Title
  lines.push(t("core.infoCardTitle", {}, L));
  // Issue line: #<n> <title>
  const titlePart = e.issue.title ? `\\#${e.issue.number} ${O(e.issue.title)}` : `\\#${e.issue.number}`;
  lines.push(titlePart);
  // Models
  lines.push("", t("core.infoCardModels", {}, L));
  const modelLines = e.models.sources.filter((s) => s.model?.trim());
  if (modelLines.length === 0) {
    lines.push(`\\- ${O(t("schedule.workflow_defined_label", {}, L))}`);
  } else {
    for (const s of modelLines) {
      lines.push(`\\- ${O(s.label)} \\(${O(s.model)}\\)`);
    }
  }
  // LLM
  lines.push("", t("core.infoCardLLM", {}, L));
  lines.push(`\\- ${O(t("core.llmProviderLabel", {}, L))}: ${e.llm.provider ? O(e.llm.provider) : O(t("core.llmNotSet", {}, L))}`);
  lines.push(`\\- ${O(t("core.llmModelLabel", {}, L))}: ${e.llm.model ? O(e.llm.model) : O(t("core.llmNotSet", {}, L))}`);
  // Template
  lines.push("", t("core.infoCardTemplate", {}, L));
  lines.push(O(e.templateName?.trim() || t("core.none", {}, L)));
  // Skills
  lines.push("", t("core.infoCardSkills", {}, L));
  if (e.skills.length > 0) {
    for (const s of e.skills) lines.push(`\\- ${O(s)}`);
  } else {
    lines.push(`\\- ${O(t("schedule.no_skills_installed", {}, L))}`);
  }
  // Schedules
  lines.push("", t("core.infoCardSchedules", {}, L));
  if (e.schedules.items.length === 0) {
    lines.push(`\\- ${O(t("schedule.no_schedules_set", {}, L))}`);
  } else {
    for (const sch of e.schedules.items) {
      const parts = [];
      const statusLabel = sch.status === "active" ? t("schedule.schedule_status_enabled", {}, L)
        : sch.status === "paused" ? t("schedule.schedule_status_paused", {}, L)
        : sch.status === "cancelled" ? t("schedule.schedule_status_cancelled", {}, L)
        : sch.status;
      const notifyLabel = sch.shouldNotify ? t("schedule.notify_open", {}, L) : t("schedule.notify_close", {}, L);
      const desc = scheduleRuleDescription(sch, L);
      parts.push(`${scheduleRuleTypeLabel(sch.ruleType, L)}：${desc}｜${statusLabel}｜${notifyLabel}`);
      if (sch.nextRunAt) parts.push(t("schedule.cardNextRun", { time: formatLocalTime(sch.nextRunAt, L) }, L));
      if (sch.prompt) parts.push(t("schedule.cardPrompt", { prompt: sch.prompt }, L));
      lines.push(`\\- ${O(parts.join("｜"))}`);
    }
  }
  // Task status
  lines.push("", t("core.infoCardTaskStatus", {}, L));
  if (e.workflow.exists) {
    const fileLink = e.workflow.url
      ? `[${O(e.workflow.file)}](${escapeUrl(e.workflow.url)})`
      : O(e.workflow.file);
    lines.push(`\\- File: ${fileLink}`);
    // Simplified: Status line
    let statusText;
    if (!e.workflow.enabled || e.workflow.status === "disabled") {
      statusText = O(t("schedule.workflowState.disabled", {}, L));
    } else if (e.workflow.status === "running") {
      const runId = e.workflow.activeRunId != null ? String(e.workflow.activeRunId) : "";
      const runUrl = e.workflow.activeRunHtmlUrl;
      const runLink = runUrl
        ? `[${O(runId)}](${escapeUrl(runUrl)})`
        : O(runId);
      statusText = t("schedule.workflowState.running", { run: runLink }, L);
    } else {
      statusText = O(t("schedule.workflowState.idle", {}, L));
    }
    lines.push(`\\- ${statusText}`);
  } else {
    lines.push(O("No workflow configured yet. You can run /edit to reset the template and enable the Lobster workflow."));
  }
  return lines.join("\n");
}

// qd — action keyboard
function buildActionKeyboard(issueNumber, lang) {
  return new InlineKeyboard()
    .text(t("kb.setSchedule", {}, lang), `set_schedule:${issueNumber}`)
    .text(t("kb.manageSchedule", {}, lang), `manage_schedule:${issueNumber}`)
    .row()
    .text(t("kb.edit", {}, lang), `current_edit:${issueNumber}`)
    .text(t("kb.resetTemplate", {}, lang), `current_template_reset:${issueNumber}`)
    .row()
    .text(t("kb.skillsManage", {}, lang), "command_menu_skills");
}

// u_ — predicate for showing keyboard
function shouldShowKeyboard(data) {
  return data.issue.exists && (!data.issue.state || data.issue.state === "open");
}

// ks — 主入口：采集数据 + 回复信息卡
export async function sendStatusCard(ctx, issueNumber) {
  const { octokit, d1, config } = ctx.services;
  const { owner, repo, repoFullName } = config.github;
  const lang = ctx.language ?? glang();
  try {
    const data = await gatherIssueData(octokit, d1, owner, repo, repoFullName, issueNumber);
    const text = buildStatusCardText(data, lang);
    const keyboard = shouldShowKeyboard(data) ? buildActionKeyboard(issueNumber, lang) : undefined;
    await ctx.reply(text, { ...fp, ...(keyboard ? { reply_markup: keyboard } : {}) });
  } catch (e) {
    console.error("[status card] failed:", e);
  }
}