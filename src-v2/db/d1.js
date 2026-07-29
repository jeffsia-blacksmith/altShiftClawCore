// db/d1.js — D1 store facade + 幂等 migration
// 行为对齐旧 bundle Kc（L11913-11946）+ Hc/zc（L11947-11975）+ Ta（workflow-notifications）+
// Vc 的 lazy-once migration（L11976-11986，Qc flag）。

// Inlined workflow_notifications table init (was imported from src/modules/)
async function initWorkflowNotificationsTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS workflow_notifications (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL UNIQUE,
    repo TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    workflow_path TEXT,
    title TEXT,
    channel TEXT NOT NULL,
    chat_id TEXT,
    message_id TEXT,
    event_name TEXT NOT NULL DEFAULT 'workflow_dispatch',
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'requested', 'in_progress', 'completed', 'notified', 'failed_to_notify')),
    conclusion TEXT,
    workflow_run_id INTEGER,
    workflow_ref TEXT,
    head_branch TEXT,
    head_sha TEXT,
    source_type TEXT,
    source_id TEXT,
    payload_json TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    notified_at TEXT
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_wn_repo_wf_created ON workflow_notifications (repo, workflow_name, created_at DESC)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_wn_status_created ON workflow_notifications (status, created_at DESC)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_wn_run_id ON workflow_notifications (workflow_run_id)`).run();
}

// KV-store facade over D1 — 对齐 Kc(e) 的 get/put/delete
export function createKvStore(db) {
  return {
    async get(key) {
      const row = await db
        .prepare(
          "SELECT value FROM kv_state WHERE key = ? AND (expires_at IS NULL OR expires_at > datetime('now'))",
        )
        .bind(key)
        .first();
      return row?.value ?? null;
    },
    async put(key, value, options) {
      const ttl = options?.expirationTtl;
      if (ttl) {
        await db
          .prepare(
            "INSERT OR REPLACE INTO kv_state (key, value, expires_at, updated_at) VALUES (?, ?, datetime('now', '+' || ? || ' seconds'), datetime('now'))",
          )
          .bind(key, value, Math.floor(ttl))
          .run();
      } else {
        await db
          .prepare(
            "INSERT OR REPLACE INTO kv_state (key, value, expires_at, updated_at) VALUES (?, ?, NULL, datetime('now'))",
          )
          .bind(key, value)
          .run();
      }
    },
    async delete(key) {
      await db.prepare("DELETE FROM kv_state WHERE key = ?").bind(key).run();
    },
  };
}

// 幂等 migrations — 对齐 Hc / zc / Ta（initWorkflowNotificationsTable）
async function migrateKvState(db) {
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS kv_state (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires_at TEXT, updated_at TEXT NOT NULL DEFAULT (datetime('now')))",
    )
    .run();
}

async function migrateAlbumQueue(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS album_queue (
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
      )`,
    )
    .run();
}

// Module-level lazy-once flag — 对齐 Qc（L11976）
let migrated = false;

export async function ensureMigrated(db) {
  if (migrated) return;
  await migrateKvState(db);
  await initWorkflowNotificationsTable(db);
  await migrateAlbumQueue(db);
  migrated = true;
}

// 测试专用重置（仅 guardrails 用，避免 isolate 间状态泄漏）
export function _resetMigratedForTest() {
  migrated = false;
}