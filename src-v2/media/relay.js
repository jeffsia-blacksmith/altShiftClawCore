// media/relay.js — 媒体转送（单条 + 相册）
// 行为对齐旧 bundle Ys（单条，L16792-16951）+ Nk（相册，L16952-17168）。
// §6.2 旧 bug 修复：旧 bundle Ys(e, t_msg) 参数名 t_msg 但 body 用 t（遮蔽 i18n），
//   导致 t.fileId/t.field = undefined，单条媒体 getFile(undefined) 静默失败。
//   src-v2 用正确参数名 file，i18n t() 不被遮蔽，单条路径可正常工作。

import { t, glang } from "../i18n/index.js";
import { getActiveIssue } from "../db/kv-state.js";
import { getFlowState } from "../telegram/flows/state.js";
import { enqueueAlbumItem, flushAlbum } from "./album.js";

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

  // R8 最小：active issue + branch 存在时走 metadata comment；完整 git 上传在 R8b
  // 旧 bundle 在 branchExists 时走 getFile→download→createOrUpdateFile→createComment→finalize
  // R8 暂只建 metadata comment（无 branch 时旧 bundle 也走此路径 L16816-16833）
  try {
    const label = file.label ?? t(`mediaLabel.${file.field}`, {}, lang);
    const content = file.caption?.trim() || "";
    const body = `🦞 ${label}${content ? `\n\n${content}` : ""}`;
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: active,
      body,
    });
  } catch (e) {
    console.error("[media:single]", e);
    await ctx.reply(t("core.unknownError", {}, lang));
  }
}

// 相册（对齐 Nk L16952-17168，含 3s debounce flush）
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

  // 组装单一 comment（R8 最小：metadata-only，完整 git 上传在 R8b）
  try {
    const caption = rows.slice().reverse().find((r) => r.caption?.trim())?.caption ?? "";
    const body = `🦞 ${t("mediaLabel.photo", {}, lang)} ×${rows.length}${caption ? `\n\n${caption}` : ""}`;
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: active,
      body,
    });
  } catch (e) {
    console.error("[media:album]", e);
    await ctx.reply(t("core.unknownError", {}, lang));
  }
}