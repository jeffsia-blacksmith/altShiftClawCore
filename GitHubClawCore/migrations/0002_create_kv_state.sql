-- kv_state: D1-backed key-value store for runtime state (replaces KV)
CREATE TABLE IF NOT EXISTS kv_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
