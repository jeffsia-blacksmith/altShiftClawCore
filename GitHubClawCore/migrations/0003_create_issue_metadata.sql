CREATE TABLE IF NOT EXISTS issue_metadata (
  repo TEXT NOT NULL,
  issue_number INTEGER NOT NULL,
  template TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (repo, issue_number)
);

CREATE INDEX IF NOT EXISTS idx_issue_metadata_repo_issue
  ON issue_metadata (repo, issue_number);
