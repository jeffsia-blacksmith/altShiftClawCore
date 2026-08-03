function me(e) {
  if (e == null) return null;
  let t = String(e).trim();
  return t === "" ? null : t;
}
function uw(e) {
  if (e == null || e === "") return null;
  let t = Number.parseInt(String(e), 10);
  return Number.isInteger(t) ? t : null;
}
function _a(e) {
  if (!e) return null;
  let t = me(e.id),
    r = me(e.request_id),
    n = me(e.repo),
    s = me(e.workflow_name),
    o = me(e.channel),
    i = me(e.event_name),
    a = me(e.status),
    l = me(e.created_at),
    c = me(e.updated_at);
  return !t || !r || !n || !s || !o || !i || !a || !l || !c
    ? null
    : {
        id: t,
        requestId: r,
        repo: n,
        workflowName: s,
        workflowPath: me(e.workflow_path),
        title: me(e.title),
        channel: o,
        chatId: me(e.chat_id),
        messageId: me(e.message_id),
        eventName: i,
        status: a,
        conclusion: me(e.conclusion),
        workflowRunId: uw(e.workflow_run_id),
        workflowRef: me(e.workflow_ref),
        headBranch: me(e.head_branch),
        headSha: me(e.head_sha),
        sourceType: me(e.source_type),
        sourceId: me(e.source_id),
        payloadJson: me(e.payload_json),
        errorMessage: me(e.error_message),
        createdAt: l,
        updatedAt: c,
        completedAt: me(e.completed_at),
        notifiedAt: me(e.notified_at),
      };
}

async function initWorkflowNotificationsTable(e) {
  (await e
    .prepare(
      `CREATE TABLE IF NOT EXISTS workflow_notifications (
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
    )`,
    )
    .run(),
    await e
      .prepare(
        `CREATE INDEX IF NOT EXISTS idx_workflow_notifications_repo_workflow_created
      ON workflow_notifications (repo, workflow_name, created_at DESC)`,
      )
      .run(),
    await e
      .prepare(
        `CREATE INDEX IF NOT EXISTS idx_workflow_notifications_status_created
      ON workflow_notifications (status, created_at DESC)`,
      )
      .run(),
    await e
      .prepare(
        `CREATE INDEX IF NOT EXISTS idx_workflow_notifications_run_id
      ON workflow_notifications (workflow_run_id)`,
      )
      .run());
}

async function createWorkflowNotification(e, t) {
  let r = t.id?.trim() || crypto.randomUUID(),
    n = new Date().toISOString();
  await e
    .prepare(
      `INSERT INTO workflow_notifications (
      id, request_id, repo, workflow_name, workflow_path, title, channel, chat_id, message_id,
      event_name, status, workflow_ref, head_branch, head_sha, source_type, source_id, payload_json,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      r,
      t.requestId,
      t.repo,
      t.workflowName,
      me(t.workflowPath),
      me(t.title),
      t.channel,
      me(t.chatId),
      me(t.messageId),
      t.eventName?.trim() || "workflow_dispatch",
      t.status || "pending",
      me(t.workflowRef),
      me(t.headBranch),
      me(t.headSha),
      me(t.sourceType),
      me(t.sourceId),
      me(t.payloadJson),
      n,
      n,
    )
    .run();
  let s = await getWorkflowNotificationByRequestId(e, t.requestId);
  if (!s) throw new Error(`Failed to create workflow notification for request_id=${t.requestId}`);
  return s;
}

async function getWorkflowNotificationByRequestId(e, t) {
  let r = await e
    .prepare("SELECT * FROM workflow_notifications WHERE request_id = ? LIMIT 1")
    .bind(t)
    .first();
  return _a(r);
}

async function getWorkflowNotificationByRunId(e, t) {
  let r = await e
    .prepare("SELECT * FROM workflow_notifications WHERE workflow_run_id = ? LIMIT 1")
    .bind(t)
    .first();
  return _a(r);
}

async function updateWorkflowNotificationByRequestId(e, t, r) {
  await e
    .prepare(
      `UPDATE workflow_notifications
        SET status = COALESCE(?, status),
            conclusion = COALESCE(?, conclusion),
            workflow_run_id = COALESCE(?, workflow_run_id),
            workflow_ref = COALESCE(?, workflow_ref),
            head_branch = COALESCE(?, head_branch),
            head_sha = COALESCE(?, head_sha),
            error_message = COALESCE(?, error_message),
            completed_at = COALESCE(?, completed_at),
            notified_at = COALESCE(?, notified_at),
            updated_at = datetime('now')
      WHERE request_id = ?`,
    )
    .bind(
      me(r.status),
      me(r.conclusion),
      r.workflowRunId ?? null,
      me(r.workflowRef),
      me(r.headBranch),
      me(r.headSha),
      me(r.errorMessage),
      me(r.completedAt),
      me(r.notifiedAt),
      t,
    )
    .run();
}

async function getRecentPendingNotificationByWorkflowPath(e, t) {
  let r = await e
    .prepare(
      `SELECT * FROM workflow_notifications
     WHERE workflow_path = ? AND status = 'pending'
     ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(t)
    .first();
  return _a(r);
}

async function deleteWorkflowNotificationByRequestId(e, t) {
  await e.prepare("DELETE FROM workflow_notifications WHERE request_id = ?").bind(t).run();
}

export {
  initWorkflowNotificationsTable as Ta,
  initWorkflowNotificationsTable,
  createWorkflowNotification as Gt,
  createWorkflowNotification,
  getWorkflowNotificationByRequestId as At,
  getWorkflowNotificationByRequestId,
  getWorkflowNotificationByRunId as Xt,
  getWorkflowNotificationByRunId,
  updateWorkflowNotificationByRequestId as Ne,
  updateWorkflowNotificationByRequestId,
  getRecentPendingNotificationByWorkflowPath as ka,
  getRecentPendingNotificationByWorkflowPath,
  deleteWorkflowNotificationByRequestId as Ea,
  deleteWorkflowNotificationByRequestId,
};