CREATE TABLE IF NOT EXISTS workflow_notifications (
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
);

CREATE INDEX IF NOT EXISTS idx_workflow_notifications_repo_workflow_created
  ON workflow_notifications (repo, workflow_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_notifications_status_created
  ON workflow_notifications (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_notifications_run_id
  ON workflow_notifications (workflow_run_id);
