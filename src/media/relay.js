// media/relay.js — 媒体转送（单条 + 相册）
// 行为对齐旧 bundle Ys（单条，L16792-16951）+ Nk（相册，L16952-17168）。
// §6.2 旧 bug 修复：旧 bundle Ys(e, t_msg) 参数名 t_msg 但 body 用 t（遮蔽 i18n），
//   导致 t.fileId/t.field = undefined，单条媒体 getFile(undefined) 静默失败。
//   src-v2 用正确参数名 file，i18n t() 不被遮蔽，单条路径可正常工作。

import { t, glang } from "../i18n/index.js";
import { logError, logWarn } from "../i18n/log.js";
import { getActiveIssue } from "../db/kv-state.js";
import { getFlowState } from "../telegram/flows/state.js";
import { enqueueAlbumItem, flushAlbum } from "./album.js";
import { mediaTypeLabel, coreMediaCommentBody, buildRestingReply, buildMissingSetupReply } from "../telegram/edge-replies.js";

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

// ── 相册 helpers（对齐旧 bundle Nk + Vs/Ok/xi/Ak/Pi/Ai/xk/Pk/Rf/Af/eu/tu/ru L16536-16790）──
const TELEGRAM_META_MARKER = "telegram-meta";

// Xl — telegram-meta comment（对齐 L16556-16565）
function telegramMetaComment(meta) {
  const m = {
    chat_id: meta.chat?.id ?? null,
    msg_id: meta.message_id ?? null,
    user_id: meta.from?.id ?? null,
    username: meta.from?.username ?? null,
    chat_type: meta.chat?.type ?? null,
    ts: typeof meta.date === "number" ? new Date(meta.date * 1000).toISOString() : new Date().toISOString(),
  };
  return `<!-- ${TELEGRAM_META_MARKER}: ${JSON.stringify(m)} -->`;
}
// vk/Ck — sender/chat 显示名（对齐 L16647-16653）
function senderName(meta) {
  const f = meta.from;
  if (!f) return t("core.unknownSender", {}, glang());
  const parts = [f.first_name, f.last_name].filter(Boolean);
  const name = parts.length ? parts.join(" ") : (f.username ?? `user-${f.id}`);
  return f.username ? `${name} (@${f.username})` : name;
}
function chatName(meta) {
  const c = meta.chat;
  return c ? (c.title ?? c.username ?? c.type ?? `chat-${c.id}`) : "unknown";
}
// kk — messageFromSource（对齐 L16567-16569）
function messageFromSourceLine(meta) {
  return t("core.messageFromSource", { sender: senderName(meta), chat: chatName(meta) }, glang());
}
// Ek — content or noContentProvided（对齐 L16571-16573）
function noContentOr(content) {
  return (typeof content === "string" ? content.trim() : "") || t("core.noContentProvided", {}, glang());
}
// Ok — 无分支 per-media 列表（对齐 L16784-16790）
function albumListing(rows, caption, lang) {
  const lines = rows.map((r) => [`[${mediaTypeLabel(r.media_field, lang)}]`, r.original_name || ""].filter(Boolean).join(" "));
  if (caption.trim() !== "") lines.push("", caption.trim());
  return lines.join("\n");
}
// Mk — 单条无分支 listing（对齐 L16771-16778）
function singleListing(file, caption) {
  const r = [`[${file.label}]`, file.fileName ? file.fileName : "", file.duration ? `${file.duration}s` : ""].filter(Boolean).join(" ");
  return caption.trim() !== "" ? `${r}\n\n${caption.trim()}` : r;
}
// Vs — 单条无分支 comment body（对齐 Vs+Mk L16570+16771）
function noBranchSingleBody(meta, file, caption, lang) {
  return [telegramMetaComment(meta), "", messageFromSourceLine(meta), "", "---", "", noContentOr(singleListing(file, caption))].join("\n");
}
// Vs — 无分支 comment body（对齐 L16570-16573）
function noBranchCommentBody(meta, rows, caption, lang) {
  return [telegramMetaComment(meta), "", messageFromSourceLine(meta), "", "---", "", noContentOr(albumListing(rows, caption, lang))].join("\n");
}
// Ak — per-file markdown（对齐 L16760-16779 中的 Ak）
function fileMarkdown(f) {
  return f.field === "photo"
    ? `![${f.label}](${f.rawUrl})`
    : `[${f.label}${f.originalName ? ` — ${f.originalName}` : ""}${f.duration ? ` (${f.duration}s)` : ""}](${f.rawUrl})`;
}
// xi — 有分支 comment body（对齐 L16760-16779）
function branchCommentBody(meta, files, caption, mediaMeta, lang) {
  const head = [telegramMetaComment(meta), mediaMeta].filter(Boolean);
  const links = files.map(fileMarkdown);
  const lines = [...head, "", messageFromSourceLine(meta), "", "---", "", ...links];
  if (caption) lines.push("", caption);
  const relPaths = files.map((f) => `\`${f.repoPath}\``).join(", ");
  if (relPaths) lines.push("", t("core.relativeLocation", { path: relPaths }, lang));
  return lines.join("\n");
}
// Pi — media-meta comment（对齐 dm L6678-6680）
function mediaMetaComment(stage, kind, tempPaths, finalPaths) {
  return `<!-- githubclaw-media-meta: ${JSON.stringify({ stage, kind, temp_paths: tempPaths, final_paths: finalPaths })} -->`;
}
// Ai — raw blob URL: github.com/blob/<branch>/path?raw=true（对齐 L16656-16662）
function rawBlobUrl(owner, repo, branch, path) {
  const b = encodeURIComponent(branch);
  const p = path.split("/").map(encodeURIComponent).join("/");
  return `https://github.com/${owner}/${repo}/blob/${b}/${p}?raw=true`;
}
// xk — jsonl content: caption || [label] repoPath, ...（对齐 L16729-16732）
function jsonlContent(files, caption) {
  const r = files.map((f) => `[${f.label}] ${f.repoPath}`);
  return caption.trim() || r.join(", ");
}
// Pk — attachments shape（对齐 L16733-16742）
function attachmentsShape(files) {
  return files.map((f) => ({
    type: f.field, label: f.label, file_name: f.originalName,
    mime_type: f.mimeType ?? null, duration: f.duration ?? null,
    github_repo_path: f.repoPath, github_html_url: f.rawUrl || null,
  }));
}
// ru — 文件名消毒（对齐 L16664-16670）
function sanitizeName(name) {
  return String(name || "").trim().replace(/[^A-Za-z0-9._-]/g, "_").replace(/^_+|_+$/g, "") || "file";
}
// eu — stored name（对齐 L16678-16707）
function storedFileName(originalName, ext) {
  const r = String(originalName || "").trim();
  return r ? (!ext || r.toLowerCase().endsWith(ext.toLowerCase()) || r.includes(".") ? r : `${r}${ext}`) : `file${ext}`;
}
// tu — extension（对齐 L16711-16723）
function extFor(field, fileName) {
  if (fileName && fileName.includes(".")) return fileName.substring(fileName.lastIndexOf("."));
  switch (field) { case "photo": return ".jpg"; case "voice": return ".ogg"; case "video": return ".mp4"; default: return ""; }
}
// Rf / Af — temp / final path（对齐 L16672-16676）
function tempPathOf(msgId, name) { return `assets/telegram/${msgId}_${sanitizeName(name)}`; }
function finalPathOf(commentId, name) { return `artifacts/${commentId}/${sanitizeName(name)}`; }

// Js — 相册 dispatch 检查（对齐 L16604-16635）：返回 branchExists/acceptsDispatch/restingMessage
async function checkAlbumDispatch(octokit, owner, repo, issueNumber, lang) {
  let branchExists = false;
  try { await octokit.rest.git.getRef({ owner, repo, ref: `heads/issue-${issueNumber}` }); branchExists = true; } catch {}
  let workflowExists = false, workflowEnabled = false;
  // 旧 bundle tl 始终调用 listRepoWorkflows（不因 !branchExists 跳过）— 对齐 L6130
  try {
    const { data: wfList } = await octokit.rest.actions.listRepoWorkflows({ owner, repo });
    const wf = wfList.workflows.find((w) => w.path === `.github/workflows/issue-${issueNumber}.yml`);
    if (wf) { workflowExists = true; workflowEnabled = wf.state !== "disabled_manually"; }
  } catch {}
  const acceptsDispatch = branchExists && workflowExists && workflowEnabled;
  let clawName = "";
  try {
    const { data: iss } = await octokit.rest.issues.get({ owner, repo, issue_number: issueNumber });
    clawName = iss.title ?? "";
  } catch {}
  let restingMessage;
  if (acceptsDispatch) restingMessage = buildRestingReply("", lang);
  else if (!branchExists || !workflowExists) restingMessage = buildMissingSetupReply(lang);
  else restingMessage = buildRestingReply(clawName, lang);
  return { branchExists, workflowExists, workflowEnabled, acceptsDispatch, restingMessage };
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

// 单条媒体（对齐 Ys L16792-16951，修复 §6.2 bug：参数名用 file 而非 t_msg）
export async function handleSingleMedia(ctx, file) {
  const guard = await mediaGuard(ctx);
  if (!guard.ok) return;
  const { active, chatId } = guard;
  const { octokit, config } = ctx.services;
  const { owner, repo } = config.github;
  const lang = ctx.language ?? glang();
  const branch = `issue-${active}`;
  const meta = { message_id: ctx.message?.message_id, date: ctx.message?.date, from: ctx.message?.from, chat: ctx.message?.chat };
  const caption = ctx.message?.caption ?? "";

  // Js dispatch 检查（对齐 L16811: getRef + listRepoWorkflows + issues.get）
  const dispatch = await checkAlbumDispatch(octokit, owner, repo, active, lang);
  const noDispatch = !dispatch.acceptsDispatch;

  if (!dispatch.branchExists) {
    // 无分支 → metadata-only comment + resting reply（对齐 L16813-16829: Vs+Mk+restingMessage）
    try {
      const body = noBranchSingleBody(meta, file, caption, lang);
      await octokit.rest.issues.createComment({ owner, repo, issue_number: active, body });
      await ctx.reply(dispatch.restingMessage);
    } catch (e) { logError("log.relay.imageRelayFailedPlainText", { issue: active, error: e?.message ?? String(e) }); await ctx.reply(t("core.unknownError", {}, lang)); }
    return;
  }

  // 有分支 → 完整 git 上传（对齐 L16830-16951）
  try {
    // 1. getFile + 下载（对齐 L16830-16836）
    const fileResp = await ctx.api.getFile(file.fileId);
    const filePath = fileResp.file_path;
    if (!filePath) return;
    const downloadUrl = `${config.telegram.apiBaseUrl ?? "https://api.telegram.org"}/file/bot${config.telegram.botToken}/${filePath}`;
    const dlResp = await fetch(downloadUrl);
    if (!dlResp.ok) return;
    const base64 = Buffer.from(await dlResp.arrayBuffer()).toString("base64");

    // 2. 文件名 + temp path（对齐 L16837-16845: U/K/Ce/Re）
    const U = file.fileName ?? filePath.split("/").pop() ?? "file";
    const K = storedFileName(U, extFor(file.field, U));
    const Ce = Date.now();
    const tempPath = tempPathOf(String(Ce), K);
    await octokit.rest.repos.createOrUpdateFileContents({
      owner, repo, path: tempPath, message: `chore: upload telegram ${file.field} ${U}`,
      content: base64, branch,
    });

    // 3. pending comment（对齐 L16847-16874: xi + Pi pending）
    const item = {
      field: file.field, label: file.label, originalName: K, storedFileName: K,
      mimeType: file.mimeType, duration: file.duration,
      rawUrl: rawBlobUrl(owner, repo, branch, tempPath), repoPath: tempPath,
      messageId: ctx.message?.message_id ?? null,
    };
    const pendingBody = branchCommentBody(meta, [item], caption, mediaMetaComment("pending", "single", [tempPath], []), lang);
    let created;
    try {
      created = await octokit.rest.issues.createComment({ owner, repo, issue_number: active, body: pendingBody });
    } catch (e) {
      await deleteTemp(octokit, owner, repo, tempPath, branch, `chore: cleanup failed pending telegram ${file.field} upload`);
      throw e;
    }

    if (Number.isInteger(created.data.id) && created.data.id > 0) {
      // 4. 上传 final（对齐 L16876-16883: Af + createOrUpdateFileContents）
      const finalPath = finalPathOf(created.data.id, K);
      await octokit.rest.repos.createOrUpdateFileContents({
        owner, repo, path: finalPath, message: `chore: attach telegram ${file.field} to comment #${created.data.id}`,
        content: base64, branch,
      });
      const finalItem = { ...item, rawUrl: rawBlobUrl(owner, repo, branch, finalPath), repoPath: finalPath };

      // 5. user.md artifact（对齐 L16885-16890: Zr with Zl=coreMediaCommentBody）
      try {
        const userArtifactPath = `artifacts/${created.data.id}/user.md`;
        const userArtifactContent = `${coreMediaCommentBody(caption, [finalItem], lang)}\n`;
        let userArtifactSha;
        try {
          const { data: existingUA } = await octokit.rest.repos.getContent({ owner, repo, path: userArtifactPath, ref: branch });
          userArtifactSha = existingUA.sha;
        } catch {}
        await octokit.rest.repos.createOrUpdateFileContents({
          owner, repo, path: userArtifactPath,
          message: `chore: update issue #${active} comment #${created.data.id} user artifact`,
          content: Buffer.from(userArtifactContent).toString("base64"), branch,
          ...(userArtifactSha ? { sha: userArtifactSha } : {}),
        });
      } catch (e) { logWarn("log.webhook.handleFailed", { error: e?.message ?? String(e) }); }

      // 6. finalized comment（对齐 L16892-16899: xi + Pi finalized）
      const finalizedBody = branchCommentBody(meta, [finalItem], caption, mediaMetaComment("finalized", "single", [tempPath], [finalPath]), lang);
      await octokit.rest.issues.updateComment({ owner, repo, comment_id: created.data.id, body: finalizedBody });

      // 7. issue.jsonl（对齐 L16901-16922: xn with content=xk + attachments=Pk）
      try {
        const jsonlPath = "issue.jsonl";
        let jsonlSha, existingJsonl = "";
        try {
          const { data: existing } = await octokit.rest.repos.getContent({ owner, repo, path: jsonlPath, ref: branch });
          if (existing.content) existingJsonl = Buffer.from(existing.content, "base64").toString("utf8");
          jsonlSha = existing.sha;
        } catch {}
        const entry = {
          role: "user", source: t("system.source_name", {}, lang),
          issue_number: active, comment_id: created.data.id,
          github_comment_url: created.data.html_url ?? null,
          telegram: {
            chat_id: chatId, message_id: meta.message_id ?? null,
            user_id: meta.from?.id ?? null, username: meta.from?.username ?? null,
            date: meta.date ?? null,
          },
          content: jsonlContent([finalItem], caption),
          attachments: attachmentsShape([finalItem]),
          created_at: new Date().toISOString(),
        };
        const newLine = JSON.stringify(entry) + "\n";
        const stripped = existingJsonl.replace(/\r?\n*$/g, "");
        const newContent = stripped === "" ? newLine : `${stripped}\n${newLine}`;
        await octokit.rest.repos.createOrUpdateFileContents({
          owner, repo, path: jsonlPath, message: `chore: update issue #${active} conversation log`,
          content: Buffer.from(newContent).toString("base64"), branch,
          ...(jsonlSha ? { sha: jsonlSha } : {}),
        });
      } catch (e) { logWarn("log.webhook.handleFailed", { error: e?.message ?? String(e) }); }

      // 8. 清理 temp（对齐 L16924-16926: Kn）
      await deleteTemp(octokit, owner, repo, tempPath, branch, `chore: cleanup temp telegram ${file.field} upload for comment #${created.data.id}`);
    } else {
      await deleteTemp(octokit, owner, repo, tempPath, branch, `chore: cleanup temp telegram ${file.field} upload without comment id`);
    }

    // 9. !acceptsDispatch → resting reply（对齐 L16928-16940）
    if (noDispatch) await ctx.reply(dispatch.restingMessage);
    // 注：v2 webhook 回路以 issue body telegram-meta 的 chat_id 路由（非 per-comment KV mapping），
    // 故旧 bundle 的 Ar per-comment 注册在 v2 架构下为有意省略（见 AUDIT-DEEP §6.6/§10.3）。
  } catch (e) {
    logError("log.relay.imageRelayFailedPlainText", { issue: active, error: e?.message ?? String(e) });
    await ctx.reply(t("core.unknownError", {}, lang));
  }
}

// 相册（对齐 Nk L16952-17168，含 3s debounce flush + 完整 git 上传）
export async function handleAlbumMedia(ctx, file, mediaGroupId) {
  const guard = await mediaGuard(ctx);
  if (!guard.ok) return;
  const { active, chatId } = guard;
  const { octokit, d1, config } = ctx.services;
  const { owner, repo } = config.github;
  const lang = ctx.language ?? glang();
  const branch = `issue-${active}`;

  // S — 本条 message 的完整 meta（对齐 Nk L16977-16982：存 from/chat）
  const S = { message_id: ctx.message?.message_id, date: ctx.message?.date, from: ctx.message?.from, chat: ctx.message?.chat };
  const captionThis = (ctx.message?.caption ?? "").trim();

  // 排入 album_queue（telegram_meta 存完整 from/chat，对齐 Nk L16998）
  // dispatch 检查（对齐 Nk L16980: Js 在 enqueue 前调用，每条消息都调）
  const dispatch = await checkAlbumDispatch(octokit, owner, repo, active, lang);
  const noDispatch = !dispatch.acceptsDispatch;

  // 文件名（对齐 Nk L16990: K=eu, Ce=ru(K)）
  const ext0 = extFor(file.field, file.fileName);
  const K0 = storedFileName(file.fileName ?? file.fileId, ext0);
  const safeName = sanitizeName(K0);

  await enqueueAlbumItem(d1, {
    mediaGroupId,
    messageId: ctx.message?.message_id ?? 0,
    fileId: file.fileId,
    originalName: safeName,
    mediaField: file.field,
    issueNumber: active,
    issueOwner: owner,
    issueRepo: repo,
    branch,
    caption: captionThis,
    telegramMeta: JSON.stringify({ message_id: S.message_id, date: S.date, from: S.from, chat: S.chat }),
  });

  // 3s debounce flush：抢答 DELETE...RETURNING
  const rows = await flushAlbum(d1, mediaGroupId);
  if (rows.length === 0) return; // 被其他 handler 抢答

  rows.sort((a, b) => a.message_id - b.message_id);

  // caption = 最后一条非空 caption（对齐 Nk L17019-17022：filter(Boolean).at(-1)）
  const caption = rows.map((r) => r.caption).filter(Boolean).at(-1) ?? "";

  if (!dispatch.branchExists) {
    // 无分支 → metadata-only comment（对齐 Nk L17024-17040: Vs + Ok + restingMessage）
    const firstRow = rows[0];
    let X = S;
    try { X = JSON.parse(firstRow.telegram_meta); } catch {}
    try {
      const body = noBranchCommentBody(X, rows, caption, lang);
      await octokit.rest.issues.createComment({ owner, repo, issue_number: active, body });
      await ctx.reply(dispatch.restingMessage);
    } catch (e) { logError("log.relay.imageRelayFailedPlainText", { issue: active, error: e?.message ?? String(e) }); await ctx.reply(t("core.unknownError", {}, lang)); }
    return;
  }

  // 有分支 → 完整 git 上传（对齐 Nk L17043-17167）
  try {
    // 1. 并行下载 + 上传 temp（对齐 Nk L17043-17070）
    const uploads = [];
    for (const row of rows) {
      const fileResp = await ctx.api.getFile(row.file_id).catch(() => null);
      if (!fileResp?.file_path) throw new Error(`getFile failed for ${row.file_id}`);
      const downloadUrl = `${config.telegram.apiBaseUrl ?? "https://api.telegram.org"}/file/bot${config.telegram.botToken}/${fileResp.file_path}`;
      const dlResp = await fetch(downloadUrl);
      if (!dlResp.ok) throw new Error(`download failed: ${downloadUrl}`);
      const base64 = Buffer.from(await dlResp.arrayBuffer()).toString("base64");
      const ext = extFor(row.media_field, row.original_name || null);
      const storedName = storedFileName(row.original_name || row.file_id, ext);
      const tempPath = tempPathOf(String(row.message_id), storedName);
      await octokit.rest.repos.createOrUpdateFileContents({
        owner, repo, path: tempPath, message: `chore: upload telegram album ${row.media_field} ${row.original_name}`,
        content: base64, branch,
      });
      uploads.push({
        row, base64, tempPath, storedName,
        field: row.media_field,
        label: mediaTypeLabel(row.media_field, lang),
        originalName: storedName,
        mimeType: null, duration: null,
        rawUrl: rawBlobUrl(owner, repo, branch, tempPath),
        repoPath: tempPath,
        messageId: row.message_id,
      });
    }
    const tempPaths = uploads.map((u) => u.repoPath);

    // X — 用首行 stored meta（对齐 Nk L17060-17065）
    const firstRow = rows[0];
    let X = S;
    try { X = JSON.parse(firstRow.telegram_meta); } catch {}

    // 2. 建 pending comment（对齐 Nk L17066-17080: xi）
    const pendingBody = branchCommentBody(X, uploads, caption, mediaMetaComment("pending", "album", tempPaths, []), lang);
    const created = await octokit.rest.issues.createComment({ owner, repo, issue_number: active, body: pendingBody });
    if (!Number.isInteger(created.data.id) || created.data.id <= 0) {
      for (const tp of tempPaths) await deleteTemp(octokit, owner, repo, tp, branch, `chore: cleanup temp telegram album upload without comment id ${mediaGroupId}`);
      return;
    }

    // 3. 上传 final + 重算 rawUrl（对齐 Nk L17082-17099: Af + Ai）
    const finals = [];
    for (const u of uploads) {
      const finalPath = finalPathOf(created.data.id, `${u.messageId}_${u.storedName}`);
      await octokit.rest.repos.createOrUpdateFileContents({
        owner, repo, path: finalPath, message: `chore: attach telegram album item to comment #${created.data.id}`,
        content: u.base64, branch,
      });
      finals.push({ ...u, rawUrl: rawBlobUrl(owner, repo, branch, finalPath), repoPath: finalPath });
    }
    const finalPaths = finals.map((f) => f.repoPath);

    // 4. 写 user.md artifact（对齐 Nk L17101-17102: Zr with Zl=coreMediaCommentBody）
    try {
      const userArtifactPath = `artifacts/${created.data.id}/user.md`;
      const userArtifactContent = `${coreMediaCommentBody(caption, finals, lang)}\n`;
      let userArtifactSha;
      try {
        const { data: existingUA } = await octokit.rest.repos.getContent({ owner, repo, path: userArtifactPath, ref: branch });
        userArtifactSha = existingUA.sha;
      } catch {}
      await octokit.rest.repos.createOrUpdateFileContents({
        owner, repo, path: userArtifactPath,
        message: `chore: update issue #${active} comment #${created.data.id} user artifact`,
        content: Buffer.from(userArtifactContent).toString("base64"), branch,
        ...(userArtifactSha ? { sha: userArtifactSha } : {}),
      });
    } catch (e) { logWarn("log.webhook.handleFailed", { error: e?.message ?? String(e) }); }

    // 5. finalized comment（对齐 Nk L17104-17111: xi）
    const finalizedBody = branchCommentBody(X, finals, caption, mediaMetaComment("finalized", "album", tempPaths, finalPaths), lang);
    await octokit.rest.issues.updateComment({ owner, repo, comment_id: created.data.id, body: finalizedBody });

    // 6. 写 issue.jsonl（对齐 Nk L17113-17130: xn with content=xk + attachments=Pk）
    try {
      const jsonlPath = "issue.jsonl";
      let jsonlSha, existingJsonl = "";
      try {
        const { data: existing } = await octokit.rest.repos.getContent({ owner, repo, path: jsonlPath, ref: branch });
        if (existing.content) existingJsonl = Buffer.from(existing.content, "base64").toString("utf8");
        jsonlSha = existing.sha;
      } catch {}
      const entry = {
        role: "user", source: t("system.source_name", {}, lang),
        issue_number: active, comment_id: created.data.id,
        github_comment_url: created.data.html_url ?? null,
        telegram: {
          chat_id: chatId,
          message_id: firstRow.message_id,
          user_id: X.from?.id ?? null,
          username: X.from?.username ?? null,
          date: X.date ?? null,
        },
        content: jsonlContent(finals, caption),
        attachments: attachmentsShape(finals),
        created_at: new Date().toISOString(),
      };
      const newLine = JSON.stringify(entry) + "\n";
      const stripped = existingJsonl.replace(/\r?\n*$/g, "");
      const newContent = stripped === "" ? newLine : `${stripped}\n${newLine}`;
      await octokit.rest.repos.createOrUpdateFileContents({
        owner, repo, path: jsonlPath, message: `chore: update issue #${active} conversation log`,
        content: Buffer.from(newContent).toString("base64"), branch,
        ...(jsonlSha ? { sha: jsonlSha } : {}),
      });
    } catch (e) { logWarn("log.webhook.handleFailed", { error: e?.message ?? String(e) }); }

    // 7. 清理 temp（对齐 Nk L17132: Kn）
    for (const tp of tempPaths) await deleteTemp(octokit, owner, repo, tp, branch, `chore: cleanup temp telegram album upload for comment #${created.data.id}`);

    // 8. !acceptsDispatch → resting reply（对齐 Nk L17160）
    if (noDispatch) await ctx.reply(dispatch.restingMessage);
    // 注：v2 webhook 回路以 issue body telegram-meta 的 chat_id 路由（非 per-comment KV mapping），
    // 故旧 bundle 的 Ar/Qt/an per-comment 注册在 v2 架构下为有意省略（见 AUDIT-DEEP §6.6/§10.3）。
  } catch (e) {
    logError("log.relay.imageRelayFailedPlainText", { issue: active, error: e?.message ?? String(e) });
    await ctx.reply(t("core.unknownError", {}, lang));
  }
}

// deleteTemp — 删除 temp 文件（对齐 Rk/Kn L16745-16767）
async function deleteTemp(octokit, owner, repo, path, branch, message) {
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path, ref: branch });
    if (Array.isArray(data) || data.type !== "file") return;
    await octokit.rest.repos.deleteFile({ owner, repo, path, message, sha: data.sha, branch });
  } catch (e) { logWarn("log.media.deleteTempFailed", { key: path }); }
}