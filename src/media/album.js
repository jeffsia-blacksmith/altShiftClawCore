// media/album.js — album_queue D1 CRUD + 3s debounce 组装
// 行为对齐旧 bundle Nk（L16952-17168）的排队 + flush 机制。
// 关键：flush 是 3s setTimeout debounce + DELETE...RETURNING 抢答，无 cron。
// album_queue 表 schema 见 db/d1.js migrateAlbumQueue（对齐 zc L11955）。

const DEBOUNCE_MS = 3000;

// 排入 album_queue（对齐 Nk INSERT L16990-17011）
export async function enqueueAlbumItem(db, {
  mediaGroupId, messageId, fileId, originalName, mediaField = "photo",
  issueNumber, issueOwner, issueRepo, branch, caption = "", telegramMeta = "{}",
}) {
  await db
    .prepare(
      `INSERT OR REPLACE INTO album_queue
       (media_group_id, message_id, file_id, original_name, media_field, arrival_ts, issue_number, issue_owner, issue_repo, branch, caption, telegram_meta)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      mediaGroupId, messageId, fileId, originalName, mediaField, Date.now(),
      issueNumber, issueOwner, issueRepo, branch, caption, telegramMeta,
    )
    .run();
}

// flush：sleep 3s 后 DELETE...RETURNING 抢答（对齐 Nk L17013-17015）
// 返回该 group 的全部行（按 message_id 升序）；若已被其他 handler 抢答则返回 []
export async function flushAlbum(db, mediaGroupId) {
  await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS));
  const { results } = await db
    .prepare("DELETE FROM album_queue WHERE media_group_id = ? RETURNING *")
    .bind(mediaGroupId)
    .all();
  const rows = results ?? [];
  rows.sort((a, b) => a.message_id - b.message_id);
  return rows;
}