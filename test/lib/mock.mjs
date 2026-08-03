// test/lib/mock.mjs — reusable mock infrastructure for guardrails.
//
// Three pieces:
//   1. installMockFetch(routes) — intercept globalThis.fetch for api.telegram.org / api.github.com
//      (grammY + Octokit both use the global fetch under esbuild `platform: "neutral"`).
//   2. makeD1(initial) — in-memory D1 mock supporting kv_state (get/put/delete) + schedules
//      (SELECT for due rows / UPDATE lock / get-by-id / persist) + generic CREATE/INSERT.
//   3. MOCK_AI / null — Workers AI binding stubs for the workflow-input inference path.
//
// The existing workflow_notifications in-memory D1 (test/guardrails.mjs:111-161) is the pattern
// this generalizes; that test keeps its own purpose-built mock for the extracted-module unit test.

// ─────────────────────────────────────────────────────────────────────────────
// 1. fetch interceptor
// ─────────────────────────────────────────────────────────────────────────────
//
// routes: array of { match(url, {method, init}), response(req) -> {status?, headers?, body} }
// `body` is a string (JSON or plain). Returns { calls, restore }.
// `calls` is an array of { url, method, body } recorded for every intercepted fetch.
// Unmatched URLs return a 404 JSON error so forgotten mocks are visible (not silent real calls).
export function installMockFetch(routes) {
  const calls = [];
  const origFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input?.url ?? String(input);
    const method = (init?.method ?? (typeof input === "object" ? input?.method : undefined) ?? "GET").toUpperCase();
    let body = init?.body;
    if (body && typeof body !== "string") {
      try { body = JSON.stringify(body); } catch { body = String(body); }
    }
    calls.push({ url, method, body });
    const route = routes.find((r) => r.match(url, { method, init }));
    if (!route) {
      // GitHub-style 404 body so old bundle's yr() (checks "Not Found"/"404" in message)
      // correctly recognises missing branches/workflows as 404.
      const isGh = url.includes("api.github.com");
      return new Response(JSON.stringify(isGh ? { message: "Not Found" } : { error: `unmocked fetch: ${method} ${url}` }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }
    const out = await route.response({ url, method, init, body });
    return new Response(out.body ?? "", {
      status: out.status ?? 200,
      headers: out.headers ?? { "content-type": "application/json" },
    });
  };
  return {
    calls,
    restore: () => { globalThis.fetch = origFetch; },
  };
}

// Helpers for building common route matchers.
export const tg = {
  // grammY Bot API: GET /bot<token>/getMe, POST /bot<token>/sendMessage, etc.
  is: (token) => (url) => url.startsWith(`https://api.telegram.org/bot${token}/`),
  getMe: () => ({
    match: (url) => url.endsWith("/getMe"),
    response: () => ({ body: JSON.stringify({ ok: true, result: { id: 1, is_bot: true, first_name: "Test", username: "testbot" } }) }),
  }),
  // sendMessage: records the posted body {text, reply_markup} into `sink` (array)
  // and returns a fake Message. Reply text is in .text; inline-keyboard button labels
  // (where /list puts issue numbers) are in .reply_markup.inline_keyboard.
  sendMessage: (sink) => ({
    match: (url) => url.endsWith("/sendMessage"),
    response: ({ body }) => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch {}
      sink.push({ text: parsed.text ?? "", reply_markup: parsed.reply_markup ?? null });
      return { body: JSON.stringify({ ok: true, result: { message_id: 42, date: 1700000000, chat: { id: 111, type: "private" } } }) };
    },
  }),
  // answerCallbackQuery: grammY calls POST /bot<token>/answerCallbackQuery — capture into sink
  answerCallback: (sink) => ({
    match: (url) => url.endsWith("/answerCallbackQuery"),
    response: ({ body }) => { sink.push(body ?? ""); return { body: JSON.stringify({ ok: true, result: true }) }; },
  }),
  // editMessageText: capture edited message text + reply_markup
  editMessageText: (sink) => ({
    match: (url) => url.endsWith("/editMessageText"),
    response: ({ body }) => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch {}
      sink.push({ text: parsed.text ?? "", reply_markup: parsed.reply_markup ?? null });
      return { body: JSON.stringify({ ok: true, result: { message_id: 42, date: 1700000000, chat: { id: 111, type: "private" } } }) };
    },
  }),
  // getFile: GET /bot<token>/getFile?file_id=... → { file_path }
  getFile: () => ({
    match: (url) => url.endsWith("/getFile") || url.includes("/getFile?"),
    response: ({ url }) => {
      const fid = new URL(url, "https://x/").searchParams.get("file_id") ?? "f0";
      return { body: JSON.stringify({ ok: true, result: { file_id: fid, file_path: `photos/${fid}.jpg` } }) };
    },
  }),
  // file download: GET /file/bot<token>/<path> → fixed fake binary body (both bundles
  // download the same bytes, so base64 parity holds)
  file: () => ({
    match: (url) => /\/file\/bot[^/]+\//.test(url),
    response: () => ({ body: "fake-image-bytes", headers: { "content-type": "image/jpeg" } }),
  }),
};

export const gh = {
  is: () => (url) => url.startsWith("https://api.github.com/"),
  // GET /repos/{owner}/{repo}/issues?... → {data: [...]} (Octokit sets .data to parsed body)
  issues: (issues) => ({
    match: (url) => /\/repos\/[^/]+\/[^/]+\/issues(\?|$)/.test(url),
    response: () => ({ body: JSON.stringify(issues) }),
  }),
  // POST /repos/{owner}/{repo}/issues/<n>/comments — capture comment body
  createComment: (sink) => ({
    match: (url) => /\/repos\/[^/]+\/[^/]+\/issues\/\d+\/comments$/.test(url),
    response: ({ body }) => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch {}
      sink.push(parsed.body ?? "");
      return { body: JSON.stringify({ id: 100, body: parsed.body ?? "", issue_url: "x" }) };
    },
  }),
  // POST /repos/{owner}/{repo}/issues — create issue, return assigned number
  createIssue: (number) => ({
    match: (url) => /\/repos\/[^/]+\/[^/]+\/issues$/.test(url) && !/\/issues\//.test(url.split("?")[0]),
    response: ({ body }) => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch {}
      return { body: JSON.stringify({ number, title: parsed.title ?? "x", body: parsed.body ?? "" }) };
    },
  }),
  // GET /repos/{owner}/{repo}/actions/workflows → { workflows: [...] } (listRepoWorkflows)
  workflows: (workflows) => ({
    match: (url) => /\/repos\/[^/]+\/[^/]+\/actions\/workflows(\?|$)/.test(url),
    response: () => ({ body: JSON.stringify({ workflows }) }),
  }),
  // PUT /repos/{owner}/{repo}/actions/workflows/{id}/enable (enableWorkflow)
  workflowEnable: () => ({
    match: (url) => /\/actions\/workflows\/\d+\/enable$/.test(url),
    response: () => ({ body: JSON.stringify({ ok: true }) }),
  }),
  // DELETE /repos/{owner}/{repo}/actions/workflows/{id}/disable (disableWorkflow)
  workflowDisable: () => ({
    match: (url) => /\/actions\/workflows\/\d+\/disable$/.test(url),
    response: () => ({ body: JSON.stringify({ ok: true }) }),
  }),
  // POST /repos/{owner}/{repo}/actions/workflows/{id}/dispatches (createWorkflowDispatch)
  workflowDispatch: (sink) => ({
    match: (url) => /\/actions\/workflows\/[^/]+\/dispatches$/.test(url),
    response: ({ body }) => {
      if (sink) {
        let parsed = {};
        try { parsed = JSON.parse(body); } catch {}
        sink.push({ url, inputs: parsed });
      }
      return { body: JSON.stringify({ ok: true }) };
    },
  }),
  // GET /repos/{owner}/{repo} → repo info (repos.get; default_branch). Excludes sub-paths.
  repo: (defaultBranch = "main", extra = {}) => ({
    match: (url) => /\/repos\/[^/]+\/[^/]+(\?|$)/.test(url) && !url.includes("/actions/") && !url.includes("/issues") && !url.includes("/contents") && !url.includes("/git/") && !url.includes("/branches/"),
    response: () => ({ body: JSON.stringify({ default_branch: defaultBranch, ...extra }) }),
  }),
  // GET /repos/{owner}/{repo}/git/ref/heads/{ref} (git.getRef) — omit route to simulate missing branch
  ref: () => ({
    match: (url) => /\/repos\/[^/]+\/[^/]+\/git\/ref\/heads\//.test(url),
    response: () => ({ body: JSON.stringify({ ref: "refs/heads/x", object: { sha: "deadbeef" } }) }),
  }),
  // GET /repos/{owner}/{repo}/actions/workflows/{id}/runs (listWorkflowRuns)
  workflowRuns: (runs) => ({
    match: (url) => /\/actions\/workflows\/\d+\/runs/.test(url),
    response: () => ({ body: JSON.stringify({ workflow_runs: runs }) }),
  }),
  // GET /repos/{owner}/{repo}/issues/{n} (issues.get) — single issue
  issueGet: (issue) => ({
    match: (url) => /\/repos\/[^/]+\/[^/]+\/issues\/\d+(\?|$)/.test(url),
    response: () => ({ body: JSON.stringify(issue) }),
  }),
  // GET /repos/{owner}/{repo}/contents/{path}?ref= (repos.getContent) — file or dir listing (GET only)
  getContent: (map) => ({
    match: (url, { method }) => method === "GET" && /\/repos\/[^/]+\/[^/]+\/contents\//.test(url),
    response: ({ url }) => {
      const path = decodeURIComponent(url.split("/contents/")[1].split("?")[0]);
      const entry = map?.[path];
      if (entry == null) return { status: 404, body: JSON.stringify({ message: "Not Found" }) };
      if (Array.isArray(entry)) return { body: JSON.stringify(entry) };
      return { body: JSON.stringify({ content: Buffer.from(entry, "utf8").toString("base64"), encoding: "base64" }) };
    },
  }),
  // PUT /repos/{owner}/{repo}/contents/{path} (repos.createOrUpdateFileContents)
  createOrUpdateFile: (sink) => ({
    match: (url, { method }) => method === "PUT" && /\/repos\/[^/]+\/[^/]+\/contents\//.test(url),
    response: ({ body }) => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch {}
      if (sink) sink.push({ path: parsed.path, message: parsed.message, content: parsed.content, branch: parsed.branch, sha: parsed.sha ?? null });
      return { body: JSON.stringify({ content: { sha: "deadbeef" }, commit: { sha: "cafecafe" } }) };
    },
  }),
  // git createTree / createCommit / createRef (orphan branch: Pn) — POST /git/{trees,commits,refs}
  gitBatch: () => ({
    match: (url, { method }) => method === "POST" && /\/repos\/[^/]+\/[^/]+\/git\/(trees|commits|refs)(\?|$|\/)/.test(url),
    response: ({ url }) => {
      if (/\/git\/trees/.test(url)) return { body: JSON.stringify({ sha: "treesha" }) };
      if (/\/git\/commits/.test(url)) return { body: JSON.stringify({ sha: "commitsha" }) };
      return { body: JSON.stringify({ ref: "refs/heads/issue-1", object: { sha: "commitsha" } }) };
    },
  }),
  // actions repo variables: PUT /actions/variables/{name} (update) + POST /actions/variables (create)
  repoVariable: () => ({
    match: (url, { method }) => method !== "GET" && /\/repos\/[^/]+\/[^/]+\/actions\/variables(\?|$|\/)/.test(url),
    response: () => ({ body: JSON.stringify({ ok: true }) }),
  }),
  // DELETE /repos/{owner}/{repo}/contents/{path} (repos.deleteFile — temp cleanup)
  deleteFile: () => ({
    match: (url, { method }) => method === "DELETE" && /\/repos\/[^/]+\/[^/]+\/contents\//.test(url),
    response: () => ({ body: JSON.stringify({ content: { sha: "deadbeef" }, commit: { sha: "cleanupcaf" } }) }),
  }),
  // PATCH /repos/{owner}/{repo}/issues/comments/{id} (issues.updateComment — album finalize)
  updateComment: () => ({
    match: (url, { method }) => method === "PATCH" && /\/repos\/[^/]+\/[^/]+\/issues\/comments\/\d+/.test(url),
    response: () => ({ body: JSON.stringify({ id: 999, html_url: "https://github.com/test-owner/test-repo/issues/7#issuecomment-999" }) }),
  }),
  // POST /graphql — ReadTemplateTree query (Er/H_). `tree` is a nested object:
  //   { "default": { ".github/workflows/issue-N.yml": "name: ...", "prompt.md": "..." } }
  // Returned as GraphQL Tree with entries (blob/tree) matching the query fragments.
  graphql: (treeMap) => ({
    match: (url) => url.endsWith("/graphql"),
    response: ({ body }) => {
      let parsed = {}, tpl = "default";
      try { parsed = JSON.parse(body); } catch {}
      const expr = parsed.variables?.expression ?? "";
      const m = expr.match(/main:templates\/(.+)$/);
      if (m) tpl = m[1];
      const files = treeMap?.[tpl] ?? {};
      const entries = Object.entries(files).map(([path, content]) => {
        const parts = path.split("/");
        if (parts.length === 1) {
          return { name: parts[0], type: "blob", object: { __typename: "Blob", text: content, isBinary: false } };
        }
        // nested: build tree structure
        return buildTreeEntry(parts, content);
      });
      return { body: JSON.stringify({ data: { repository: { object: { __typename: "Tree", entries } } } }) };
    },
  }),
  // POST /repos/{owner}/{repo}/issues (createIssue — auto-init first lobster)
  createIssue: (number = 1) => ({
    match: (url, { method }) => method === "POST" && /\/repos\/[^/]+\/[^/]+\/issues(\?|$)/.test(url),
    response: ({ body }) => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch {}
      return { body: JSON.stringify({ number, title: parsed.title ?? "test-repo", body: parsed.body ?? "", html_url: `https://github.com/test-owner/test-repo/issues/${number}` }) };
    },
  }),
};
// helper: build nested GraphQL Tree entry from a path like ["a","b","c"] and file content
function buildTreeEntry(parts, content) {
  const name = parts[0];
  if (parts.length === 1) {
    return { name, type: "blob", object: { __typename: "Blob", text: content, isBinary: false } };
  }
  return { name, type: "tree", object: { __typename: "Tree", entries: [buildTreeEntry(parts.slice(1), content)] } };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. in-memory D1
// ─────────────────────────────────────────────────────────────────────────────
//
// Supports the SQL the worker actually issues:
//   kv_state: SELECT value ... WHERE key=? (get), INSERT OR REPLACE (put), DELETE (delete), CREATE
//   schedules: SELECT ... WHERE status=? AND next_run_at<=? ... (Cp due rows),
//              UPDATE ... SET locked_until ... (Rp acquire), SELECT ... WHERE id=? (gt),
//              UPDATE schedules (jt/Ap/xp persist), DELETE, CREATE
//   workflow_notifications / album_queue / generic: CREATE, and a default no-op.
//
// Rows for `schedules` should be in the raw DB (snake_case) shape as the worker's Yo() mapper
// expects; tests injecting schedules should provide {id, repo, issue_number, chat_id, prompt,
// next_run_at, status, locked_until, ...} with ISO timestamp strings.
export function makeD1(initial = {}) {
  const kv = new Map(initial.kv_state ?? []);
  const schedules = new Map(initial.schedules ?? []);
  const albumQueue = new Map(); // key: media_group_id:message_id → row

  function stmt(sql) {
    const s = { _args: [], _sql: sql };
    s.bind = (...args) => { s._args = args; return s; };

    if (/SELECT value FROM kv_state WHERE key = \?/.test(sql)) {
      s.first = async () => { const v = kv.get(s._args[0]); return v == null ? null : { value: v }; };
      s.all = async () => ({ results: [] });
      s.run = async () => ({ meta: { changes: 0 } });
    } else if (/INSERT OR REPLACE INTO kv_state/.test(sql)) {
      s.run = async () => { kv.set(s._args[0], s._args[1]); return { meta: { changes: 1 } }; };
      s.first = async () => null;
      s.all = async () => ({ results: [] });
    } else if (/DELETE FROM kv_state/.test(sql)) {
      s.run = async () => { kv.delete(s._args[0]); return { meta: { changes: 1 } }; };
      s.first = async () => null;
    } else if (/FROM schedules\s+WHERE status = \?/.test(sql) || /FROM schedules\s+WHERE status = 'active'/.test(sql)) {
      // Cp/fetchDueSchedules: due rows.
      // old bundle binds (status, now, now, limit); v2 inlines status='active' and binds (now, now, limit).
      const bindStatus = /status = \?/.test(sql);
      s.all = async () => {
        const nowArg = bindStatus ? s._args[1] : s._args[0];
        const now = Date.parse(nowArg);
        const limitArg = bindStatus ? s._args[3] : s._args[2];
        const limit = Number.isInteger(limitArg) && limitArg > 0 ? limitArg : 100;
        const statusVal = bindStatus ? s._args[0] : "active";
        const results = [...schedules.values()]
          .filter((r) =>
            r.status === statusVal &&
            Date.parse(r.next_run_at) <= now &&
            (r.locked_until == null || Date.parse(r.locked_until) < now),
          )
          .sort((a, b) => Date.parse(a.next_run_at) - Date.parse(b.next_run_at))
          .slice(0, limit);
        return { results };
      };
      s.first = async () => null;
      s.run = async () => ({ meta: { changes: 0 } });
    } else if (/FROM schedules\s+WHERE repo = \?/.test(sql)) {
      // gs/Ip: list by repo (and issue_number or chat_id), optional status != ? filter.
      // bind shapes: (repo, issueNumber[, "cancelled"]) | (repo, chatId[, "cancelled"])
      s.all = async () => {
        const [repo, second, third] = s._args;
        const numSecond = Number(second);
        let results = [...schedules.values()].filter((r) => r.repo === repo);
        if (Number.isInteger(numSecond)) {
          // distinguish issue_number vs chat_id by which column the SQL filters on
          if (/chat_id = \?/.test(sql)) results = results.filter((r) => Number(r.chat_id) === numSecond);
          else results = results.filter((r) => Number(r.issue_number) === numSecond);
        }
        if (third != null) results = results.filter((r) => r.status !== third);
        results = results.sort((a, b) => (Date.parse(a.next_run_at || 0) - Date.parse(b.next_run_at || 0)) || (a.created_at || "").localeCompare(b.created_at || ""));
        return { results };
      };
      s.first = async () => null;
      s.run = async () => ({ meta: { changes: 0 } });
    } else if (/UPDATE schedules\s+SET locked_until/.test(sql)) {
      // Rp: acquire lock, bind(lockUntil, now, id, status, expectedNextRunAt, now)
      s.run = async () => {
        const row = schedules.get(s._args[2]);
        if (!row) return { meta: { changes: 0 } };
        row.locked_until = s._args[0];
        row.updated_at = s._args[1];
        return { meta: { changes: 1 } };
      };
      s.first = async () => null;
    } else if (/FROM schedules\s+WHERE id = \?/.test(sql)) {
      // gt: get by id
      s.first = async () => schedules.get(s._args[0]) ?? null;
      s.run = async () => ({ meta: { changes: 0 } });
    } else if (/UPDATE schedules/.test(sql)) {
      // jt/Ap/xp persist — best-effort: mark updated, return success
      s.run = async () => {
        const row = schedules.get(s._args[s._args.length - 1]);
        if (row) row.updated_at = new Date().toISOString();
        return { meta: { changes: 1 } };
      };
      s.first = async () => null;
    } else if (/DELETE FROM schedules/.test(sql)) {
      s.run = async () => ({ meta: { changes: 1 } });
    } else if (/INSERT OR REPLACE INTO album_queue/.test(sql)) {
      // album_queue INSERT（bind: media_group_id, message_id, file_id, original_name,
      //   media_field, arrival_ts, issue_number, issue_owner, issue_repo, branch, caption, telegram_meta）
      s.run = async () => {
        const row = {
          media_group_id: s._args[0], message_id: s._args[1], file_id: s._args[2],
          original_name: s._args[3], media_field: s._args[4], arrival_ts: s._args[5],
          issue_number: s._args[6], issue_owner: s._args[7], issue_repo: s._args[8],
          branch: s._args[9], caption: s._args[10], telegram_meta: s._args[11],
        };
        albumQueue.set(`${row.media_group_id}:${row.message_id}`, row);
        return { meta: { changes: 1 } };
      };
      s.first = async () => null;
      s.all = async () => ({ results: [] });
    } else if (/DELETE FROM album_queue.*RETURNING/.test(sql)) {
      // flush: DELETE...RETURNING all rows for a media_group_id
      s.all = async () => {
        const groupId = s._args[0];
        const results = [];
        for (const [key, row] of albumQueue.entries()) {
          if (row.media_group_id === groupId) {
            results.push(row);
            albumQueue.delete(key);
          }
        }
        return { results };
      };
      s.run = async () => ({ meta: { changes: results => results.length } });
      s.first = async () => null;
    } else if (/CREATE TABLE/.test(sql)) {
      s.run = async () => ({ meta: { changes: 0 } });
      s.first = async () => null;
      s.all = async () => ({ results: [] });
    } else {
      // default: safe no-op so unexpected SQL doesn't crash
      s.run = async () => ({ meta: { changes: 1 } });
      s.first = async () => null;
      s.all = async () => ({ results: [] });
    }
    return s;
  }

  return {
    prepare: (sql) => stmt(sql),
    // test helpers / inspection
    putKv: (k, v) => kv.set(k, v),
    getKv: (k) => kv.get(k) ?? null,
    albumQueueSize: () => albumQueue.size,
    addSchedule: (row) => schedules.set(row.id, row),
    _kv: kv,
    _schedules: schedules,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Workers AI binding stub
// ─────────────────────────────────────────────────────────────────────────────
//
// Zp (src/index.js:12479) calls `ai.run(model, {messages, response_format, ...})` and expects
// `{ result: { response: <JSON string> } }` (parsed via ni/si at src/index.js:12501-12503).
// `canned` is the object Zp should receive as the parsed workflow inputs result.
export function mockAI(canned = { inputs: {}, missingRequired: [] }) {
  return {
    run: async (_model, _opts) => ({ result: { response: JSON.stringify(canned) } }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ExecutionContext that captures waitUntil promises (so async side-effects
//    like Telegram replies — which happen inside handleUpdate's waitUntil — can
//    be awaited before asserting). The existing tests' `{ waitUntil: () => {} }`
//    discards the promise and would miss the reply.
// ─────────────────────────────────────────────────────────────────────────────
export function capturingCtx() {
  const pending = [];
  return {
    waitUntil: (p) => { pending.push(p?.catch?.(() => {}) ?? p); },
    drain: async () => { await Promise.all(pending.splice(0)); },
  };
}

// Build a Telegram Update payload for a private chat command.
export function tgUpdate(text, { fromId = 111, chatId = 111, bot = "testbot" } = {}) {
  const clean = text.replace(new RegExp(`@${bot}$`), "");
  return {
    update_id: Math.floor(Math.random() * 1e9),
    message: {
      message_id: 10,
      from: { id: fromId, is_bot: false, first_name: "Test" },
      chat: { id: chatId, type: "private" },
      date: 1700000000,
      text: clean,
      entities: [{ type: "bot_command", offset: 0, length: clean.length }],
    },
  };
}

// Build a Telegram Update payload for a single photo message.
export function tgPhotoUpdate({ fileId = "f0", caption = "", fromId = 111, chatId = 111, messageId = 10 } = {}) {
  return {
    update_id: Math.floor(Math.random() * 1e9),
    message: {
      message_id: messageId,
      from: { id: fromId, is_bot: false, first_name: "Test", username: "tester" },
      chat: { id: chatId, type: "private" },
      date: 1700000000,
      photo: [{ file_id: fileId, file_unique_id: fileId, width: 100, height: 100 }],
      caption,
    },
  };
}

// Build a Telegram Update payload for one photo in an album (media_group_id).
export function tgAlbumUpdate(mediaGroupId, { fileId, caption = "", fromId = 111, chatId = 111, messageId } = {}) {
  return {
    update_id: Math.floor(Math.random() * 1e9),
    message: {
      message_id: messageId,
      from: { id: fromId, is_bot: false, first_name: "Test", username: "tester" },
      chat: { id: chatId, type: "private" },
      date: 1700000000,
      media_group_id: mediaGroupId,
      photo: [{ file_id: fileId, file_unique_id: fileId, width: 100, height: 100 }],
      caption,
    },
  };
}