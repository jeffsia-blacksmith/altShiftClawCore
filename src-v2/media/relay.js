// media/relay.js — 媒体转送（单条 + 相册）
// 行为对齐旧 bundle Ys（单条，L16792-16951）+ Nk（相册，L16952-17168）。
// §6.2 旧 bug 修复：旧 bundle Ys(e, t_msg) 参数名 t_msg 但 body 用 t（遮蔽 i18n），
//   导致 t.fileId/t.field = undefined，单条媒体 getFile(undefined) 静默失败。
//   src-v2 用正确参数名 file，i18n t() 不被遮蔽，单条路径可正常工作。

import { t, glang } from "../i18n/index.js";
import { getActiveIssue } from "../db/kv-state.js";
import { getFlowState } from "../telegram/flows/state.js";
import { enqueueAlbumItem, flushAlbum } from "./album.js";
import { mediaTypeLabel, coreMediaCommentBody } from "../telegram/edge-replies.js";

// 字段 → 扩展名映射（对齐 tu L16711-16723）
export function fieldExt(field, fileName) {
  if (fileName && /\.[a-zA-Z0-9]+$/.test(fileName)) {
    const m = fileName.match(/\.([a-zA-Z0-9]+)$/);
    return m ? `.${m[1].toLowerCase()}` : "";
  }
  if (field === "photo") return ".jpg";
  if (field === "voice") return ".ogg";
  if (field === "video") return ".mp4";
  return "";
}

// 媒体 guard：active flow 优先（不接受媒体）、active issue 必需
async function mediaGuard(ctx) {
  const { store } = ctx.services;
  const chatId = ctx.chat?.id;
  const lang = ctx.language ?? glang();
  // flow 进行中 → 媒体不接受（对齐 Ke 检查 L16958）
  if (chatId) {
    const flow = await getFlowState(store, chatId);
    if (flow) {
      await ctx.reply(t("core.mediaNotAccepted", {}, lang));
      return { ok: false };
    }
  }
  // 无 active issue → 警告（对齐 Ge 检查 L16964）
  const active = chatId ? await getActiveIssue(store, chatId) : null;
  if (!active) {
    await ctx.reply(t("core.noActiveIssueWarn", {}, lang));
    return { ok: false };
  }
  return { ok: true, active, chatId };
}

// 单条媒体（对齐 Ys，但修复 §6.2 bug：参数名用 file 而非 t_msg）
export async function handleSingleMedia(ctx, file) {
  const guard = await mediaGuard(ctx);
  if (!guard.ok) return;
  const { active, chatId } = guard;
  const { octokit, config } = ctx.services;
  const { owner, repo } = config.github;
  const lang = ctx.language ?? glang();

  // 检查 issue-<n> 分支是否存在
  let branchExists = false;
  try { await octokit.rest.git.getRef({ owner, repo, ref: `heads/issue-${active}` }); branchExists = true; } catch {}

  if (!branchExists) {
    // 无分支 → metadata-only comment
    try {
      const label = file.label ?? mediaTypeLabel(file.field, lang);
      const content = file.caption?.trim() || "";
      const body = `🦞 ${label}${content ? `\n\n${content}` : ""}`;
      await octokit.rest.issues.createComment({ owner, repo, issue_number: active, body });
    } catch (e) { console.error("[media:single]", e); await ctx.reply(t("core.unknownError", {}, lang)); }
    return;
  }

  // 有分支 → 完整 git 上传
  try {
    // 1. getFile（通过 Telegram API）
    const fileResp = await ctx.api.getFile(file.fileId);
    const filePath = fileResp.file_path;
    // 2. 下载
    const downloadUrl = `${config.telegram.apiBaseUrl ?? "https://api.telegram.org"}/file/bot${config.telegram.botToken}/${filePath}`;
    const dlResp = await fetch(downloadUrl);
    const buf = await dlResp.arrayBuffer();
    const base64 = Buffer.from(buf).toString("base64");
    // 3. 文件名
    const storedName = `${Date.now()}_${file.fileId.replace(/[^a-zA-Z0-9.]/g, "_")}${file.ext ?? ""}`;
    const tempPath = `assets/telegram/${storedName}`;
    // 4. 上传 temp
    await octokit.rest.repos.createOrUpdateFileContents({
      owner, repo, path: tempPath, message: `chore: upload telegram ${file.field} ${storedName}`,
      content: base64, branch: `issue-${active}`,
    });
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/issue-${active}/${tempPath}`;
    // 5. 建 pending comment
    const meta = { chat_id: chatId, msg_id: ctx.message?.message_id, user_id: ctx.from?.id, username: ctx.from?.username, chat_type: ctx.chat?.type, ts: new Date().toISOString() };
    const mediaMeta = `<!-- githubclaw-media-meta: {"stage":"pending","kind":"single","temp_paths":["${tempPath}"],"final_paths":[]} -->`;
    const link = file.field === "photo" ? `![${file.label}](${rawUrl})` : `[${file.label} — ${file.fileName ?? file.fileId}](${rawUrl})`;
    const commentBody = `<!-- telegram-meta: ${JSON.stringify(meta)} -->\n${mediaMeta}\n\n${t("core.messageFromSource", { sender: ctx.from?.first_name ?? "Unknown", chat: ctx.chat?.title ?? "private" }, lang)}\n\n---\n\n${link}${file.caption ? `\n\n${file.caption}` : ""}\n\n${t("core.relativeLocation", { path: tempPath }, lang)}`;
    const created = await octokit.rest.issues.createComment({ owner, repo, issue_number: active, body: commentBody });
    // 6. 上传 final + 更新 comment
    const finalPath = `artifacts/${created.data.id}/${storedName}`;
    await octokit.rest.repos.createOrUpdateFileContents({
      owner, repo, path: finalPath, message: `chore: attach telegram ${file.field} to comment #${created.data.id}`,
      content: base64, branch: `issue-${active}`,
    });
    const finalRawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/issue-${active}/${finalPath}`;
    const finalLink = file.field === "photo" ? `![${file.label}](${finalRawUrl})` : `[${file.label} — ${file.fileName ?? file.fileId}](${finalRawUrl})`;
    const finalMediaMeta = `<!-- githubclaw-media-meta: {"stage":"finalized","kind":"single","temp_paths":["${tempPath}"],"final_paths":["${finalPath}"]} -->`;
    const finalizedBody = `<!-- telegram-meta: ${JSON.stringify(meta)} -->\n${finalMediaMeta}\n\n${t("core.messageFromSource", { sender: ctx.from?.first_name ?? "Unknown", chat: ctx.chat?.title ?? "private" }, lang)}\n\n---\n\n${finalLink}${file.caption ? `\n\n${file.caption}` : ""}\n\n${t("core.relativeLocation", { path: finalPath }, lang)}`;
    await octokit.rest.issues.updateComment({ owner, repo, comment_id: created.data.id, body: finalizedBody });
    // 7. 写 issue.jsonl（对齐旧 bundle Zr+xn，content 用 Zl 结构体）
    try {
      const jsonlPath = "issue.jsonl";
      let jsonlSha, jsonlContent = "";
      try {
        const { data: existing } = await octokit.rest.repos.getContent({ owner, repo, path: jsonlPath, ref: `issue-${active}` });
        if (existing.content) jsonlContent = Buffer.from(existing.content, "base64").toString("utf8");
        jsonlSha = existing.sha;
      } catch {}
      const structuredContent = coreMediaCommentBody(file.caption ?? "", [{ repoPath: finalPath }], lang);
      const entry = {
        role: "user",
        source: t("system.source_name", {}, lang),
        issue_number: active,
        comment_id: created.data.id,
        github_comment_url: created.data.html_url ?? null,
        telegram: { chat_id: meta.chat_id, message_id: meta.msg_id, user_id: meta.user_id, username: meta.username },
        content: structuredContent,
        created_at: new Date().toISOString(),
      };
      const newLine = JSON.stringify(entry) + "\n";
      const stripped = jsonlContent.replace(/\r?\n*$/g, "");
      const newContent = stripped === "" ? newLine : `${stripped}\n${newLine}`;
      await octokit.rest.repos.createOrUpdateFileContents({
        owner, repo, path: jsonlPath,
        message: `chore: update issue #${active} conversation log`,
        content: Buffer.from(newContent).toString("base64"), branch: `issue-${active}`,
        ...(jsonlSha ? { sha: jsonlSha } : {}),
      });
    } catch (e) { console.error("[media:single] jsonl write failed:", e); }
    // 8. 清理 temp
    try {
      const tempContent = await octokit.rest.repos.getContent({ owner, repo, path: tempPath, ref: `issue-${active}` });
      await octokit.rest.repos.deleteFile({ owner, repo, path: tempPath, message: `chore: cleanup temp ${file.field}`, sha: tempContent.data.sha, branch: `issue-${active}` });
    } catch (e) { console.error("[media:single] cleanup temp failed:", e); }
  } catch (e) {
    console.error("[media:single git upload]", e);
    await ctx.reply(t("core.unknownError", {}, lang));
  }
}

// 相册（对齐 Nk L16952-17168，含 3s debounce flush + 完整 git 上传）
export async function handleAlbumMedia(ctx, file, mediaGroupId) {
  const guard = await mediaGuard(ctx);
  if (!guard.ok) return;
  const { active, chatId } = guard;
  const { octokit, store, d1, config } = ctx.services;
  const { owner, repo } = config.github;
  const lang = ctx.language ?? glang();
  const branch = `issue-${active}`;

  // 排入 album_queue
  await enqueueAlbumItem(d1, {
    mediaGroupId,
    messageId: ctx.message?.message_id ?? 0,
    fileId: file.fileId,
    originalName: file.fileName ?? file.fileId,
    mediaField: file.field,
    issueNumber: active,
    issueOwner: owner,
    issueRepo: repo,
    branch,
    caption: file.caption ?? "",
    telegramMeta: JSON.stringify({ message_id: ctx.message?.message_id, date: ctx.message?.date }),
  });

  // 3s debounce flush：抢答 DELETE...RETURNING
  const rows = await flushAlbum(d1, mediaGroupId);
  if (rows.length === 0) return; // 被其他 handler 抢答

  // 检查分支是否存在
  let branchExists = false;
  try { await octokit.rest.git.getRef({ owner, repo, ref: `heads/issue-${active}` }); branchExists = true; } catch {}

  if (!branchExists) {
    // 无分支 → metadata-only comment
    try {
      const caption = rows.slice().reverse().find((r) => r.caption?.trim())?.caption ?? "";
      const body = `🦞 ${mediaTypeLabel("photo", lang)} ×${rows.length}${caption ? `\n\n${caption}` : ""}`;
      await octokit.rest.issues.createComment({ owner, repo, issue_number: active, body });
    } catch (e) { console.error("[media:album]", e); await ctx.reply(t("core.unknownError", {}, lang)); }
    return;
  }

  // 有分支 → 完整 git 上传（对齐 Nk branchExists L17038-17167）
  try {
    const meta = { chat_id: chatId, msg_id: ctx.message?.message_id, user_id: ctx.from?.id, username: ctx.from?.username, chat_type: ctx.chat?.type, ts: new Date().toISOString() };
    const tempPaths = [];
    const fileDescriptors = [];
    // 1. 并行下载 + 上传 temp
    for (const row of rows) {
      const fileResp = await ctx.api.getFile(row.file_id).catch(() => null);
      if (!fileResp?.file_path) continue;
      const downloadUrl = `${config.telegram.apiBaseUrl ?? "https://api.telegram.org"}/file/bot${config.telegram.botToken}/${fileResp.file_path}`;
      const dlResp = await fetch(downloadUrl);
      const buf = await dlResp.arrayBuffer();
      const base64 = Buffer.from(buf).toString("base64");
      const storedName = `${row.message_id}_${row.file_id.replace(/[^a-zA-Z0-9.]/g, "_")}.jpg`;
      const tempPath = `assets/telegram/${storedName}`;
      await octokit.rest.repos.createOrUpdateFileContents({
        owner, repo, path: tempPath, message: `chore: upload telegram photo ${storedName}`,
        content: base64, branch,
      });
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${tempPath}`;
      tempPaths.push(tempPath);
      fileDescriptors.push({ label: mediaTypeLabel("photo", lang), rawUrl, tempPath, storedName });
    }
    // 2. 建 pending comment
    const caption = rows.slice().reverse().find((r) => r.caption?.trim())?.caption ?? "";
    const mediaMeta = `<!-- githubclaw-media-meta: {"stage":"pending","kind":"album","temp_paths":${JSON.stringify(tempPaths)},"final_paths":[]} -->`;
    const links = fileDescriptors.map((f) => `![${f.label}](${f.rawUrl})`).join("\n");
    const commentBody = `<!-- telegram-meta: ${JSON.stringify(meta)} -->\n${mediaMeta}\n\n${t("core.messageFromSource", { sender: ctx.from?.first_name ?? "Unknown", chat: ctx.chat?.title ?? "private" }, lang)}\n\n---\n\n${links}${caption ? `\n\n${caption}` : ""}\n\n${t("core.relativeLocation", { path: tempPaths.join("`, `") }, lang)}`;
    const created = await octokit.rest.issues.createComment({ owner, repo, issue_number: active, body: commentBody });
    // 3. 上传 final + 更新 comment
    const finalPaths = [];
    for (const f of fileDescriptors) {
      const finalPath = `artifacts/${created.data.id}/${f.storedName}`;
      // 重新读取 temp 内容（已上传）
      const { data: tempContent } = await octokit.rest.repos.getContent({ owner, repo, path: f.tempPath, ref: branch });
      await octokit.rest.repos.createOrUpdateFileContents({
        owner, repo, path: finalPath, message: `chore: attach telegram photo to comment #${created.data.id}`,
        content: tempContent.content, branch,
      });
      const finalRawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${finalPath}`;
      f.rawUrl = finalRawUrl;
      f.finalPath = finalPath;
      finalPaths.push(finalPath);
    }
    // 4. finalized comment
    const finalLinks = fileDescriptors.map((f) => `![${f.label}](${f.rawUrl})`).join("\n");
    const finalMediaMeta = `<!-- githubclaw-media-meta: {"stage":"finalized","kind":"album","temp_paths":${JSON.stringify(tempPaths)},"final_paths":${JSON.stringify(finalPaths)}} -->`;
    const finalizedBody = `<!-- telegram-meta: ${JSON.stringify(meta)} -->\n${finalMediaMeta}\n\n${t("core.messageFromSource", { sender: ctx.from?.first_name ?? "Unknown", chat: ctx.chat?.title ?? "private" }, lang)}\n\n---\n\n${finalLinks}${caption ? `\n\n${caption}` : ""}\n\n${t("core.relativeLocation", { path: finalPaths.join("`, `") }, lang)}`;
    await octokit.rest.issues.updateComment({ owner, repo, comment_id: created.data.id, body: finalizedBody });
    // 5. 清理 temp
    for (const tp of tempPaths) {
      try {
        const { data: tc } = await octokit.rest.repos.getContent({ owner, repo, path: tp, ref: branch });
        await octokit.rest.repos.deleteFile({ owner, repo, path: tp, message: `chore: cleanup temp photo`, sha: tc.sha, branch });
      } catch (e) { console.error("[media:album] cleanup temp failed:", e); }
    }
  } catch (e) {
    console.error("[media:album git upload]", e);
    await ctx.reply(t("core.unknownError", {}, lang));
  }
}