// github/webhooks/workflow-run.js — workflow_run.requested / in_progress / completed
// 行为对齐旧 bundle workflow_run.* handlers（L20025-20045）。
// R5 阶段：最小占位（日志），D1 workflow_notifications 记录在 R7 完善（需 notification request 查询 + Ne 写入）。

export function registerWorkflowRunHandlers(webhooks, _env) {
  const logEvent = (event) => async ({ payload }) => {
    try {
      console.log(`[workflow_run.${event}] run_id=${payload.workflow_run?.id} path=${payload.workflow_run?.path}`);
      // R7: pg/vg/yg/xg (requested), mg/Cg/_g/Pg (in_progress), fg/Rg/Tg/Mg (completed)
      // 查 workflow_notifications request → Ne 更新 status → completed 时发 Telegram 通知
    } catch (e) {
      console.error(`[webhook] workflow_run.${event} failed:`, e);
    }
  };
  webhooks.on("workflow_run.requested", logEvent("requested"));
  webhooks.on("workflow_run.in_progress", logEvent("in_progress"));
  webhooks.on("workflow_run.completed", logEvent("completed"));
}