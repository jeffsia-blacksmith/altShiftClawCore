// commands/skills.js — /skills 命令（入口）
// 行为对齐旧 bundle Il（L12628-12677）。
// R7 阶段：实现入口（active-lobster gate + 技能目录 fetch + 已装列表 + 选择键盘）。
// 多步 callback flow（env 收集 + confirm_install + dispatch）在后续子批次接入。

import { t, glang } from "../../i18n/index.js";
import { getActiveIssue } from "../../db/kv-state.js";
import { skillCatalogReply } from "../edge-replies.js";

// skill-install:<chatId> KV state（TTL 900s，对齐 ht/El L12609-12619）
async function setSkillInstallState(store, chatId, state) {
  if (chatId == null) return;
  await store.put(`skill-install:${chatId}`, JSON.stringify(state), { expirationTtl: 900 });
}

// 已装技能列表（ei L6046：octokit.repos.getContent issue-<n> 分支的 skills 目录）
async function listInstalledSkills(octokit, owner, repo, issueNumber) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: `.agents/skills`,
      ref: `issue-${issueNumber}`,
    });
    if (!Array.isArray(data)) return [];
    return data.filter((it) => it.type === "dir").map((it) => it.name);
  } catch {
    return [];
  }
}

// 远端技能目录（bs L5938：从 altShiftClawToolkit:main/skills 拉）
async function fetchRemoteSkillCatalog(config) {
  const url = "https://api.github.com/repos/jeffsia-blacksmith/altShiftClawToolkit/contents/skills?ref=main";
  const resp = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": config.github.apiVersion,
      "User-Agent": config.github.userAgent,
    },
  });
  if (!resp.ok) throw new Error(`skill catalog fetch failed: ${resp.status}`);
  const data = await resp.json();
  if (!Array.isArray(data)) return [];
  return data.filter((it) => it.type === "dir").map((it) => ({ name: it.name }));
}

export function registerSkills(composer) {
  composer.command("skills", async (ctx) => {
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const lang = ctx.language ?? glang();
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const active = await getActiveIssue(store, chatId);
    if (!active) {
      await ctx.reply(t("core.noActiveLobsterSelected", {}, lang));
      return;
    }
    try {
      const [catalog, installed, issueInfo] = await Promise.all([
        fetchRemoteSkillCatalog(config),
        listInstalledSkills(octokit, owner, repo, active),
        octokit.rest.issues.get({ owner, repo, issue_number: active }).catch(() => null),
      ]);
      if (!catalog || catalog.length === 0) {
        await ctx.reply(t("skills.noAvailableSkills", {}, lang));
        return;
      }
      const issueTitle = issueInfo?.data?.title ?? undefined;
      await setSkillInstallState(store, chatId, {
        skillName: "",
        step: "selecting",
        issueNumber: active,
        issueTitle,
        installedSkills: installed,
        page: 0,
      });
      const { InlineKeyboard } = await import("grammy");
      const kb = new InlineKeyboard();
      const installedSet = new Set(installed);
      const pageSize = 8;
      const page = 0;
      const start = page * pageSize;
      const slice = catalog.slice(start, start + pageSize);
      let col = 0;
      for (const s of slice) {
        const displayName = skillCatalogReply(s.name, lang) ?? s.name;
        const label = installedSet.has(s.name) ? `✅ ${displayName}` : `📦 ${displayName}`;
        kb.text(label, `skills_pick:${s.name}`);
        col++;
        if (col >= 2) { kb.row(); col = 0; }
      }
      if (col > 0) kb.row();
      if (page > 0) kb.text(t("kb.prevPage", {}, lang), `skills_page:${page - 1}`);
      if (start + pageSize < catalog.length) kb.text(t("kb.nextPage", {}, lang), `skills_page:${page + 1}`);
      kb.row().text(t("kb.cancel", {}, lang), "skills_cancel:0");
      const target = issueTitle ? `🦞 ${issueTitle} #${active}` : `🦞 #${active}`;
      await ctx.reply(t("skills.select_install", { target }, lang), { reply_markup: kb });
    } catch (e) {
      console.error("[/skills]", e);
      await ctx.reply(t("skills.getFailed", { error: e instanceof Error ? e.message : String(e) }, lang));
    }
  });
}