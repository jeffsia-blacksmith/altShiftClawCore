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
    const method = (init?.method ?? (typeof input === "object" && input?.method) ?? "GET").toUpperCase();
    let body = init?.body;
    if (body && typeof body !== "string") {
      try { body = JSON.stringify(body); } catch { body = String(body); }
    }
    calls.push({ url, method, body });
    const route = routes.find((r) => r.match(url, { method, init }));
    if (!route) {
      return new Response(JSON.stringify({ error: `unmocked fetch: ${method} ${url}` }), {
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
};

export const gh = {
  is: () => (url) => url.startsWith("https://api.github.com/"),
  // GET /repos/{owner}/{repo}/issues?... → {data: [...]} (Octokit sets .data to parsed body)
  issues: (issues) => ({
    match: (url) => /\/repos\/[^/]+\/[^/]+\/issues(\?|$)/.test(url),
    response: () => ({ body: JSON.stringify(issues) }),
  }),
};

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
    } else if (/FROM schedules WHERE status = \?/.test(sql)) {
      // Cp: due rows, bind(status, now, now, limit)
      s.all = async () => {
        const now = Date.parse(s._args[1]);
        const limit = Number.isInteger(s._args[3]) && s._args[3] > 0 ? s._args[3] : 100;
        const results = [...schedules.values()]
          .filter((r) =>
            r.status === s._args[0] &&
            Date.parse(r.next_run_at) <= now &&
            (r.locked_until == null || Date.parse(r.locked_until) < now),
          )
          .sort((a, b) => Date.parse(a.next_run_at) - Date.parse(b.next_run_at))
          .slice(0, limit);
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
    } else if (/FROM schedules WHERE id = \?/.test(sql)) {
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