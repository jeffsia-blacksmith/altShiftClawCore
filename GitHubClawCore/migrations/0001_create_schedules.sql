CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  repo TEXT NOT NULL,
  issue_number INTEGER NOT NULL,
  chat_id INTEGER,
  prompt TEXT NOT NULL,
  event_data TEXT,
  rule_type TEXT NOT NULL,
  rule_payload TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Taipei',
  next_run_at TEXT NOT NULL,
  should_notify INTEGER NOT NULL DEFAULT 1 CHECK (should_notify IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  last_run_at TEXT,
  last_error TEXT,
  locked_until TEXT,
  cancelled_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_schedules_due
  ON schedules (status, next_run_at, locked_until, created_at);

CREATE INDEX IF NOT EXISTS idx_schedules_issue
  ON schedules (repo, issue_number, status, next_run_at);
