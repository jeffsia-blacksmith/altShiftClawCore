// commands/templates.js — /templates 命令（入口）
// 行为对齐旧 bundle Cl.command("templates")（L12887-12918）。
// R7 阶段：实现入口（远端目录 fetch + 每个模板已装查询 + 选择键盘）。
// 多步 callback flow（env 收集 + confirm_install + dispatch templates.yml）在后续子批次接入。

import { t, glang } from "../../i18n/index.js";

// template-install:<chatId> KV state（TTL 900s，对齐 oe L12731-12744）
async function setTemplateInstallState(store, chatId, state) {
  if (chatId == null) return;
  await store.put(`template-install:${chatId}`, JSON.stringify(state), { expirationTtl: 900 });
}

// 远端模板目录（On L12765-12785：从 altShiftClawToolkit:main/templates 拉）
async function fetchRemoteTemplateCatalog(config) {
  const url = "https://api.github.com/repos/jeffsia-blacksmith/altShiftClawToolkit/contents/templates?ref=main";
  const resp = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": config.github.apiVersion,
      "User-Agent": config.github.userAgent,
    },
  });
  if (!resp.ok) throw new Error(`template catalog fetch failed: ${resp.status}`);
  const data = await resp.json();
  if (!Array.isArray(data)) return [];
  return data.filter((it) => it.type === "dir").map((it) => ({ name: it.name }));
}

// 已装查询（Nn L12867-12874：octokit.repos.getContent templates/<name>）
async function isTemplateInstalled(octokit, owner, repo, name) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: `templates/${name}`,
      ref: "main",
    });
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}

export function registerTemplates(composer) {
  composer.command("templates", async (ctx) => {
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const lang = ctx.language ?? glang();
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    let catalog;
    try {
      catalog = await fetchRemoteTemplateCatalog(config);
    } catch (e) {
      console.error("[/templates]", e);
      await ctx.reply(t("templates.getFailed", { error: e instanceof Error ? e.message : String(e) }, lang));
      return;
    }
    if (!catalog.length) {
      await ctx.reply(t("templates.noAvailableTemplates", {}, lang));
      return;
    }
    const installedStatus = await Promise.all(
      catalog.map(async (c) => ({ name: c.name, installed: await isTemplateInstalled(octokit, owner, repo, c.name) })),
    );
    await setTemplateInstallState(store, chatId, { templateName: "", step: "selecting" });
    const { InlineKeyboard } = await import("grammy");
    const kb = new InlineKeyboard();
    for (const c of installedStatus.slice(0, 20)) {
      const label = c.installed ? `✅ ${c.name}` : `📦 ${c.name}`;
      kb.text(label, `templates_pick:${c.name}`).row();
    }
    await ctx.reply(t("templates.selectInstallTo", {}, lang), { reply_markup: kb });
  });
}