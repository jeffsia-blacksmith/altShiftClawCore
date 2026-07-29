// github/branches.js — orphan 分支创建 + workflow yml 写入 + template 读取
// 行为对齐旧 bundle Er/Pn/Sr/Vr/Q_/ci/Kp/rT（L6752/6864/6997/5361/6976/7113/6244/7315）。

import { t, glang } from "../i18n/index.js";

// rT — 从 ctx 提取 telegram meta
export function buildTelegramMeta(ctx) {
  return {
    chat_id: ctx?.chat?.id ?? null,
    user_id: ctx?.from?.id ?? null,
    username: ctx?.from?.username ?? null,
    chat_type: ctx?.chat?.type ?? null,
    ts: new Date().toISOString(),
  };
}

// Kp — agentProfile trimmed
function buildAgentProfile(state) {
  return {
    name: (state.name ?? "").trim(),
    description: (state.description ?? "").trim(),
  };
}

// ci — issue body builder
export function buildIssueBody(meta, agentProfile) {
  const json = JSON.stringify({ name: agentProfile.name, description: agentProfile.description }, null, 2);
  return [
    `<!-- telegram-meta: ${JSON.stringify(meta)} -->`,
    "",
    "```json",
    json,
    "```",
  ].join("\n");
}

// Er — 读取 templates/<template>/ 目录下所有非 workflow 文件
export async function readTemplateFiles(octokit, owner, repo, template, personality = "") {
  let entries;
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner, repo, path: `templates/${template}`, ref: "main",
    });
    entries = Array.isArray(data) ? data : [data];
  } catch {
    throw Object.assign(new Error(t("templates.notInstalled", { name: template }, glang())), { code: "TEMPLATE_NOT_INSTALLED" });
  }
  const files = [];
  async function walk(items, prefix) {
    for (const item of items) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.type === "file") {
        // 跳过 .github/workflows/ 下的文件（Sr 单独处理）
        if (/^\.github\/workflows\//i.test(fullPath)) continue;
        try {
          const { data: fileData } = await octokit.rest.repos.getContent({
            owner, repo, path: `templates/${template}/${fullPath}`, ref: "main",
          });
          if (fileData.content) {
            let content = Buffer.from(fileData.content, "base64").toString("utf8");
            if (personality) content = content.replace(/\{\{personality\}\}/g, personality);
            files.push({ path: fullPath, content });
          }
        } catch (e) {
          console.error(`[Er] failed to read ${fullPath}:`, e.message);
        }
      } else if (item.type === "dir") {
        try {
          const { data: subEntries } = await octokit.rest.repos.getContent({
            owner, repo, path: `templates/${template}/${fullPath}`, ref: "main",
          });
          if (Array.isArray(subEntries)) await walk(subEntries, fullPath);
        } catch {}
      }
    }
  }
  await walk(entries, "");
  return files;
}

// Pn — 创建 orphan 分支
export async function createOrphanBranch(octokit, owner, repo, branchName, files, commitMessage) {
  // 1. createTree
  const treeItems = files.map((f) => ({
    path: f.path, mode: "100644", type: "blob", content: f.content,
  }));
  const { data: tree } = await octokit.rest.git.createTree({ owner, repo, tree: treeItems });
  // 2. createCommit (orphan: parents=[])
  const { data: commit } = await octokit.rest.git.createCommit({
    owner, repo, message: commitMessage, tree: tree.sha, parents: [],
  });
  // 3. createRef
  try {
    await octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${branchName}`, sha: commit.sha });
    console.log(`[Pn] orphan branch ${branchName} created at ${commit.sha}`);
  } catch (e) {
    if (/already exists|422/i.test(e.message ?? "")) {
      console.log(`[Pn] branch ${branchName} already exists, skip`);
      return { ok: true, branch: branchName };
    }
    throw e;
  }
  return { ok: true, branch: branchName, commitSha: commit.sha };
}

// Q_ — 替换 workflow yml 中的 name 行
const WORKFLOW_NAME_RE = /^(\s*name:\s*)(['"]?)(?:🦞\s+)?执行小龙虾任务(?:\s+#[\w\d]+)?\2(\s*)$/m;
function rewriteWorkflowName(content, issueNumber) {
  return content.replace(WORKFLOW_NAME_RE, `$1'🦞 Execute Lobster Task #${issueNumber}'$3`);
}

// Sr — 写 .github/workflows/issue-<n>.yml 到 main 分支
export async function syncWorkflowFile(octokit, owner, repo, issueNumber, template = "default") {
  const sourcePath = `templates/${template}/.github/workflows/issue-N.yml`;
  const targetPath = `.github/workflows/issue-${issueNumber}.yml`;
  // 读取模板 workflow 文件
  let sourceContent;
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path: sourcePath, ref: "main" });
    if (data.content) sourceContent = Buffer.from(data.content, "base64").toString("utf8");
  } catch (e) {
    if (/404|not found/i.test(e.message ?? "")) {
      console.log(`Template ${template} does not have ${sourcePath}, skipping workflow sync`);
      return;
    }
    throw e;
  }
  if (!sourceContent) return;
  const newContent = rewriteWorkflowName(sourceContent, issueNumber);
  // 读取已存在的目标文件
  let existingSha;
  try {
    const { data: existing } = await octokit.rest.repos.getContent({ owner, repo, path: targetPath, ref: "main" });
    if (existing.content) {
      const existingContent = Buffer.from(existing.content, "base64").toString("utf8");
      if (existingContent === newContent) {
        console.log(`[Sr] ${targetPath} already in sync`);
        return;
      }
    }
    existingSha = existing.sha;
  } catch {}
  // 写入
  await octokit.rest.repos.createOrUpdateFileContents({
    owner, repo, path: targetPath,
    message: `chore: prepare issue #${issueNumber} workflow`,
    content: Buffer.from(newContent).toString("base64"),
    branch: "main",
    ...(existingSha ? { sha: existingSha } : {}),
  });
  console.log(`[Sr] synced ${targetPath} on main`);
}

// Vr — D1 upsert issue↔template 映射（issue_metadata 表）
export async function upsertIssueTemplate(d1, repo, issueNumber, template) {
  await d1
    .prepare(`
      INSERT INTO issue_metadata (repo, issue_number, template, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(repo, issue_number) DO UPDATE SET
        template = excluded.template, updated_at = datetime('now')
    `)
    .bind(repo, issueNumber, template ?? null)
    .run();
  const row = await d1
    .prepare("SELECT * FROM issue_metadata WHERE repo = ? AND issue_number = ? LIMIT 1")
    .bind(repo, issueNumber)
    .first();
  return row;
}

// Os create finalize — 完整建龙虾流程
export async function osCreateFinalize(ctx, state) {
  const { octokit, store, d1, config } = ctx.services;
  const { owner, repo, repoFullName } = config.github;
  const chatId = ctx.chat?.id;
  const meta = buildTelegramMeta(ctx);
  const agentProfile = buildAgentProfile(state);
  const body = buildIssueBody(meta, agentProfile);

  // 1. issues.create
  const { data: created } = await octokit.rest.issues.create({
    owner, repo, title: state.name ?? "", body,
  });
  const issueNumber = created.number;
  const template = state.template || "default";
  const personality = config.personality || "";

  // 2. 读取模板文件（排除 .github/workflows/）
  const files = await readTemplateFiles(octokit, owner, repo, template, personality);

  // 3. 创建 orphan 分支 issue-<n>
  await createOrphanBranch(octokit, owner, repo, `issue-${issueNumber}`, files, `chore: init issue #${issueNumber} orphan branch (template: ${template})`);

  // 4. 写 workflow yml 到 main
  await syncWorkflowFile(octokit, owner, repo, issueNumber, template);

  // 5. D1: upsert issue↔template 映射
  await upsertIssueTemplate(d1, repoFullName, issueNumber, template);

  // 6. setActiveIssue
  if (chatId) await store.put(`active-issue:${chatId}`, String(issueNumber));

  return { issue: { number: issueNumber, title: created.title }, mode: "create" };
}

// Os edit finalize — 编辑现有龙虾（对齐旧 bundle Os edit L7424-7486）
export async function osEditFinalize(ctx, state) {
  const { octokit, store, d1, config } = ctx.services;
  const { owner, repo, repoFullName } = config.github;
  const chatId = ctx.chat?.id;
  const issueNumber = Number.isInteger(state.issueNumber) ? state.issueNumber : null;
  if (!issueNumber || issueNumber <= 0) throw new Error("edit finalize requires issueNumber");

  const meta = state.originalTelegramMeta ?? buildTelegramMeta(ctx);
  const agentProfile = buildAgentProfile(state);
  const body = buildIssueBody(meta, agentProfile);

  // 查现有 issue_metadata template
  let existingTemplate = null;
  try {
    const row = await d1.prepare("SELECT template FROM issue_metadata WHERE repo = ? AND issue_number = ? LIMIT 1").bind(repoFullName, issueNumber).first();
    existingTemplate = row?.template ?? null;
  } catch {}

  const templateChain = [state.template, existingTemplate, "default"].filter(Boolean);
  const personality = config.personality || "";

  // 同步 workflow yml（对齐 sT — 尝试链中模板）
  for (const tpl of templateChain) {
    try { await syncWorkflowFile(octokit, owner, repo, issueNumber, tpl); break; } catch {}
  }

  // 更新 issue title/body
  const { data: updated } = await octokit.rest.issues.update({ owner, repo, issue_number: issueNumber, title: state.name ?? "", body });
  let result = { number: updated.number, title: updated.title };

  // 切换 workflow enable/disable
  if (typeof state.workflowEnabled === "boolean") {
    try {
      const { data: wfList } = await octokit.rest.actions.listRepoWorkflows({ owner, repo });
      const wf = wfList.workflows.find((w) => w.path === `.github/workflows/issue-${issueNumber}.yml`);
      if (wf) {
        if (state.workflowEnabled) await octokit.rest.actions.enableWorkflow({ owner, repo, workflow_id: wf.id });
        else await octokit.rest.actions.disableWorkflow({ owner, repo, workflow_id: wf.id });
      }
    } catch (e) { console.warn("[Os edit] setWorkflowState failed:", e.message); }
  }

  // 如果 resetTemplate → 重建 orphan 分支
  let finalTemplate = existingTemplate ?? "default";
  if (state.resetTemplate) {
    const tpl = state.template || "default";
    try {
      const files = await readTemplateFiles(octokit, owner, repo, tpl, personality);
      await createOrphanBranch(octokit, owner, repo, `issue-${issueNumber}`, files, `chore: reset issue #${issueNumber} template (template: ${tpl})`);
      await syncWorkflowFile(octokit, owner, repo, issueNumber, tpl);
      finalTemplate = tpl;
    } catch (e) { console.warn("[Os edit] templateReset failed:", e.message); }
  }

  // D1 upsert issue_metadata
  await upsertIssueTemplate(d1, repoFullName, issueNumber, finalTemplate);

  // setActiveIssue
  if (chatId) await store.put(`active-issue:${chatId}`, String(issueNumber));

  return { issue: result, mode: "edit" };
}