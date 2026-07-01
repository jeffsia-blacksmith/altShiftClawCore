-- album_queue: 暫存同一 media_group 的所有項目，以抵達時間為 debounce 基準
-- 當最後抵達的 Worker 判斷「quiet period 已過」後，一次性 claim 所有項目並統一處理
CREATE TABLE IF NOT EXISTS album_queue (
  media_group_id TEXT NOT NULL,
  message_id     INTEGER NOT NULL,
  file_id        TEXT NOT NULL,
  original_name  TEXT NOT NULL,
  media_field    TEXT NOT NULL DEFAULT 'photo',
  arrival_ts     INTEGER NOT NULL,
  issue_number   INTEGER NOT NULL,
  issue_owner    TEXT NOT NULL,
  issue_repo     TEXT NOT NULL,
  branch         TEXT NOT NULL,
  caption        TEXT NOT NULL DEFAULT '',
  telegram_meta  TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (media_group_id, message_id)
);
