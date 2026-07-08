-- album_queue: buffer all items of the same media_group, debounced by arrival timestamp
-- when the last-arriving Worker determines the quiet period has passed, claim all items at once and process them together
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
