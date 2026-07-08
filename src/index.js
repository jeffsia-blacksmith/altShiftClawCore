import zhCNTranslation from "./i18n/zh-CN.json";
import enTranslation from "./i18n/en.json";

const translations = {
  "zh-CN": zhCNTranslation,
  "en": enTranslation
};

function t(key, params = {}, lang = "en") {
  let dict = translations[lang] || translations["en"];
  let parts = key.split(".");
  let val = dict;
  for (let part of parts) {
    if (val && typeof val === "object" && part in val) {
      val = val[part];
    } else {
      val = null;
      break;
    }
  }
  
  if (val === null || val === undefined) {
    let fallbackDict = translations["en"];
    val = fallbackDict;
    for (let part of parts) {
      if (val && typeof val === "object" && part in val) {
        val = val[part];
      } else {
        val = null;
        break;
      }
    }
  }

  if (typeof val !== "string") {
    return key;
  }

  let result = val;
  for (let [k, v] of Object.entries(params)) {
    result = result.replace(new RegExp(`{${k}}`, "g"), String(v ?? ""));
  }
  return result;
}

async function getLanguage(services) {
  let lang = null;
  if (services && services.store) {
    try {
      lang = await services.store.get("CLAW_LANGUAGE");
    } catch (err) {
      console.error("Error reading language from D1:", err);
    }
  }
  if (!lang && services && services.config) {
    lang = services.config.language;
  }
  let resolvedLang = lang || "en";
  if (typeof globalThis !== "undefined") {
    globalThis.globalLanguage = resolvedLang;
  }
  return resolvedLang;
}

function glang() {
  return typeof globalThis !== "undefined" && globalThis.globalLanguage === "zh-CN" ? "zh-CN" : "en";
}

var Wg = Object.create;
var Hi = Object.defineProperty;
var qg = Object.getOwnPropertyDescriptor;
var Kg = Object.getOwnPropertyNames;
var Hg = Object.getPrototypeOf,
  zg = Object.prototype.hasOwnProperty;
var Pu = ((e) =>
  typeof require < "u"
    ? require
    : typeof Proxy < "u"
      ? new Proxy(e, { get: (t, r) => (typeof require < "u" ? require : t)[r] })
      : e)(function (e) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + e + '" is not supported');
});
var Oe = (e, t) => () => (e && (t = e((e = 0))), t);
var zi = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports),
  Mu = (e, t) => {
    for (var r in t) Hi(e, r, { get: t[r], enumerable: !0 });
  },
  Qg = (e, t, r, n) => {
    if ((t && typeof t == "object") || typeof t == "function")
      for (let s of Kg(t))
        !zg.call(e, s) &&
          s !== r &&
          Hi(e, s, { get: () => t[s], enumerable: !(n = qg(t, s)) || n.enumerable });
    return e;
  };
var Ou = (e, t, r) => (
  (r = e != null ? Wg(Hg(e)) : {}),
  Qg(t || !e || !e.__esModule ? Hi(r, "default", { value: e, enumerable: !0 }) : r, e)
);
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE kc] content-type parser  —  VENDOR
// ║ MIME/media type parsing (npm: content-type)
// ╚══════════════════════════════════════════════════════════════════════════════
var kc = zi((T0, ts) => {
  "use strict";
  var Io = function () {};
  Io.prototype = Object.create(null);
  var Eo =
      /; *([!#$%&'*+.^\w`|~-]+)=("(?:[\v\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\v\u0020-\u00ff])*"|[!#$%&'*+.^\w`|~-]+) */gu,
    So = /\\([\v\u0020-\u00ff])/gu,
    yc = /^[!#$%&'*+.^\w|~-]+\/[!#$%&'*+.^\w|~-]+$/u,
    $r = { type: "", parameters: new Io() };
  Object.freeze($r.parameters);
  Object.freeze($r);
  function _c(e) {
    if (typeof e != "string")
      throw new TypeError("argument header is required and must be a string");
    let t = e.indexOf(";"),
      r = t !== -1 ? e.slice(0, t).trim() : e.trim();
    if (yc.test(r) === !1) throw new TypeError("invalid media type");
    let n = { type: r.toLowerCase(), parameters: new Io() };
    if (t === -1) return n;
    let s, o, i;
    for (Eo.lastIndex = t; (o = Eo.exec(e));) {
      if (o.index !== t) throw new TypeError("invalid parameter format");
      ((t += o[0].length),
        (s = o[1].toLowerCase()),
        (i = o[2]),
        i[0] === '"' && ((i = i.slice(1, i.length - 1)), So.test(i) && (i = i.replace(So, "$1"))),
        (n.parameters[s] = i));
    }
    if (t !== e.length) throw new TypeError("invalid parameter format");
    return n;
  }
  function Tc(e) {
    if (typeof e != "string") return $r;
    let t = e.indexOf(";"),
      r = t !== -1 ? e.slice(0, t).trim() : e.trim();
    if (yc.test(r) === !1) return $r;
    let n = { type: r.toLowerCase(), parameters: new Io() };
    if (t === -1) return n;
    let s, o, i;
    for (Eo.lastIndex = t; (o = Eo.exec(e));) {
      if (o.index !== t) return $r;
      ((t += o[0].length),
        (s = o[1].toLowerCase()),
        (i = o[2]),
        i[0] === '"' && ((i = i.slice(1, i.length - 1)), So.test(i) && (i = i.replace(So, "$1"))),
        (n.parameters[s] = i));
    }
    return t !== e.length ? $r : n;
  }
  ts.exports.default = { parse: _c, safeParse: Tc };
  ts.exports.parse = _c;
  ts.exports.safeParse = Tc;
  ts.exports.defaultContentType = $r;
});
var Sa = {};
Mu(Sa, {
  createWorkflowNotification: () => Gt,
  deleteWorkflowNotificationByRequestId: () => Ea,
  getRecentPendingNotificationByWorkflowPath: () => ka,
  getWorkflowNotificationByRequestId: () => At,
  getWorkflowNotificationByRunId: () => Xt,
  initWorkflowNotificationsTable: () => Ta,
  updateWorkflowNotificationByRequestId: () => Ne,
});
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
async function Ta(e) {
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
async function Gt(e, t) {
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
  let s = await At(e, t.requestId);
  if (!s) throw new Error(`Failed to create workflow notification for request_id=${t.requestId}`);
  return s;
}
async function At(e, t) {
  let r = await e
    .prepare("SELECT * FROM workflow_notifications WHERE request_id = ? LIMIT 1")
    .bind(t)
    .first();
  return _a(r);
}
async function Xt(e, t) {
  let r = await e
    .prepare("SELECT * FROM workflow_notifications WHERE workflow_run_id = ? LIMIT 1")
    .bind(t)
    .first();
  return _a(r);
}
async function Ne(e, t, r) {
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
async function ka(e, t) {
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
async function Ea(e, t) {
  await e.prepare("DELETE FROM workflow_notifications WHERE request_id = ?").bind(t).run();
}
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE Et] grammY (Telegram framework)  —  VENDOR
// ║ Telegram Bot framework: filter query, context, middleware (npm: grammy)
// ╚══════════════════════════════════════════════════════════════════════════════
var Et = Oe(() => {
  "use strict";
});
function cw(e) {
  let t = Array.isArray(e) ? e : [e],
    r = t.join(","),
    n =
      Yc.get(r) ??
      (() => {
        let s = fd(t),
          o = dw(s);
        return (Yc.set(r, o), o);
      })();
  return (s) => n(s);
}
function fd(e) {
  return Array.isArray(e) ? e.map((t) => t.split(":")) : [e.split(":")];
}
function dw(e) {
  let t = e.flatMap((s) => pw(s, gd(s))),
    r = fw(t),
    n = gw(r);
  return (s) => !!n(s.update, s);
}
function gd(e) {
  let t = Oo,
    r = [e]
      .flatMap((n) => {
        let [s, o, i] = n;
        if (!(s in od)) return [n];
        if (!s && !o && !i) return [n];
        let l = od[s].map((c) => [c, o, i]);
        return o === void 0 || (o in va && (o || i)) ? l : l.filter(([c]) => !!t[c]?.[o]);
      })
      .flatMap((n) => {
        let [s, o, i] = n;
        if (!(o in va)) return [n];
        if (!o && !i) return [n];
        let l = va[o].map((c) => [s, c, i]);
        return i === void 0 ? l : l.filter(([, c]) => !!t[s]?.[c]?.[i]);
      });
  if (r.length === 0)
    throw new Error(`Shortcuts in '${e.join(":")}' do not expand to any valid filter query`);
  return r;
}
function pw(e, t) {
  if (t.length === 0) throw new Error("Empty filter query given");
  let r = t.map(mw).filter((n) => n !== !0);
  if (r.length === 0) return t;
  throw r.length === 1
    ? new Error(r[0])
    : new Error(
        `Invalid filter query '${e.join(":")}'. There are ${r.length} errors after expanding the contained shortcuts: ${r.join("; ")}`,
      );
}
function mw(e) {
  let [t, r, n, ...s] = e;
  if (t === void 0) return "Empty filter query given";
  if (!(t in Oo)) {
    let a = Object.keys(Oo);
    return `Invalid L1 filter '${t}' given in '${e.join(":")}'. Permitted values are: ${a.map((l) => `'${l}'`).join(", ")}.`;
  }
  if (r === void 0) return !0;
  let o = Oo[t];
  if (!(r in o)) {
    let a = Object.keys(o);
    return `Invalid L2 filter '${r}' given in '${e.join(":")}'. Permitted values are: ${a.map((l) => `'${l}'`).join(", ")}.`;
  }
  if (n === void 0) return !0;
  let i = o[r];
  if (!(n in i)) {
    let a = Object.keys(i);
    return `Invalid L3 filter '${n}' given in '${e.join(":")}'. ${a.length === 0 ? `No further filtering is possible after '${t}:${r}'.` : `Permitted values are: ${a.map((l) => `'${l}'`).join(", ")}.`}`;
  }
  return s.length === 0
    ? !0
    : `Cannot filter further than three levels, ':${s.join(":")}' is invalid!`;
}
function fw(e) {
  let t = {};
  for (let [r, n, s] of e) {
    let o = (t[r] ??= {});
    if (n !== void 0) {
      let i = (o[n] ??= new Set());
      s !== void 0 && i.add(s);
    }
  }
  return t;
}
function Ia(e, t) {
  return (r, n) => e(r, n) || t(r, n);
}
function Xc(e, t) {
  return (r, n) => {
    let s = e(r, n);
    return s && t(s, n);
  };
}
function Zc(e) {
  return (t, r) => e(t, r) != null;
}
function gw(e) {
  let t = Object.entries(e).map(([r, n]) => {
    let s = (i) => i[r],
      o = Object.entries(n).map(([i, a]) => {
        let l = (d) => d[i],
          c = Array.from(a).map((d) =>
            d === "me"
              ? (w, y) => {
                  let _ = y.me.id;
                  return ed(w, (I) => I.id === _);
                }
              : (w) => ed(w, (y) => y[d] || y.type === d),
          );
        return c.length === 0 ? Zc(l) : Xc(l, c.reduce(Ia));
      });
    return o.length === 0 ? Zc(s) : Xc(s, o.reduce(Ia));
  });
  if (t.length === 0) throw new Error("Cannot create filter function for empty query");
  return t.reduce(Ia);
}
function ed(e, t) {
  let r = (n) => n != null && t(n);
  return Array.isArray(e) ? e.some(r) : r(e);
}
function k(e, t) {
  if (e === void 0) throw new Error(`Missing information for API call to ${t}`);
  return e;
}
function Ur(e) {
  return Go(e).map((t) => (typeof t == "string" ? (r) => (r === t ? t : null) : (r) => r.match(t)));
}
function Br(e, t, r) {
  for (let n of r) {
    let s = n(t);
    if (s) return ((e.match = s), !0);
  }
  return !1;
}
function Go(e) {
  return Array.isArray(e) ? e : [e];
}
function kw(e) {
  let t;
  if (e instanceof Error) t = `${e.name} in middleware: ${e.message}`;
  else {
    let r = typeof e;
    switch (((t = `Non-error value of type ${r} thrown in middleware`), r)) {
      case "bigint":
      case "boolean":
      case "number":
      case "symbol":
        t += `: ${e}`;
        break;
      case "string":
        t += `: ${String(e).substring(0, 50)}`;
        break;
      default:
        t += "!";
        break;
    }
  }
  return t;
}
function ns(e) {
  return typeof e == "function" ? e : (t, r) => e.middleware()(t, r);
}
function id(e, t) {
  return async (r, n) => {
    let s = !1;
    await e(r, async () => {
      if (s) throw new Error("`next` already called before!");
      ((s = !0), await t(r, n));
    });
  };
}
function Ca(e, t) {
  return t();
}
async function wd(e, t) {
  await e(t, Ew);
}
function Cw(e) {
  if (((e = String(e)), !(e.length > 100))) {
    var t =
      /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        e,
      );
    if (t) {
      var r = parseFloat(t[1]),
        n = (t[2] || "ms").toLowerCase();
      switch (n) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return r * Iw;
        case "weeks":
        case "week":
        case "w":
          return r * Sw;
        case "days":
        case "day":
        case "d":
          return r * Wr;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return r * _n;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return r * yn;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return r * bn;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return r;
        default:
          return;
      }
    }
  }
}
function Rw(e) {
  var t = Math.abs(e);
  return t >= Wr
    ? Math.round(e / Wr) + "d"
    : t >= _n
      ? Math.round(e / _n) + "h"
      : t >= yn
        ? Math.round(e / yn) + "m"
        : t >= bn
          ? Math.round(e / bn) + "s"
          : e + "ms";
}
function Aw(e) {
  var t = Math.abs(e);
  return t >= Wr
    ? Po(e, t, Wr, "day")
    : t >= _n
      ? Po(e, t, _n, "hour")
      : t >= yn
        ? Po(e, t, yn, "minute")
        : t >= bn
          ? Po(e, t, bn, "second")
          : e + " ms";
}
function Po(e, t, r, n) {
  var s = t >= r * 1.5;
  return Math.round(e / r) + " " + n + (s ? "s" : "");
}
function bd() {
  throw new Error("setTimeout has not been defined");
}
function yd() {
  throw new Error("clearTimeout has not been defined");
}
function _d(e) {
  if (mr === setTimeout) return setTimeout(e, 0);
  if ((mr === bd || !mr) && setTimeout) return ((mr = setTimeout), setTimeout(e, 0));
  try {
    return mr(e, 0);
  } catch {
    try {
      return mr.call(null, e, 0);
    } catch {
      return mr.call(this, e, 0);
    }
  }
}
function xw(e) {
  if (fr === clearTimeout) return clearTimeout(e);
  if ((fr === yd || !fr) && clearTimeout) return ((fr = clearTimeout), clearTimeout(e));
  try {
    return fr(e);
  } catch {
    try {
      return fr.call(null, e);
    } catch {
      return fr.call(this, e);
    }
  }
}
function Pw() {
  !wn || !jr || ((wn = !1), jr.length ? (Zt = jr.concat(Zt)) : (No = -1), Zt.length && Td());
}
function Td() {
  if (!wn) {
    var e = _d(Pw);
    wn = !0;
    for (var t = Zt.length; t;) {
      for (jr = Zt, Zt = []; ++No < t;) jr && jr[No].run();
      ((No = -1), (t = Zt.length));
    }
    ((jr = null), (wn = !1), xw(e));
  }
}
function Mw(e) {
  var t = new Array(arguments.length - 1);
  if (arguments.length > 1) for (var r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
  (Zt.push(new kd(e, t)), Zt.length === 1 && !wn && _d(Td));
}
function kd(e, t) {
  ((this.fun = e), (this.array = t));
}
function qr() {}
function Qw(e) {
  throw new Error("process.binding is not supported");
}
function Vw() {
  return "/";
}
function Jw(e) {
  throw new Error("process.chdir is not supported");
}
function Yw() {
  return 0;
}
function Zw(e) {
  var t = Xw.call(fn) * 0.001,
    r = Math.floor(t),
    n = Math.floor((t % 1) * 1e9);
  return (e && ((r = r - e[0]), (n = n - e[1]), n < 0 && (r--, (n += 1e9))), [r, n]);
}
function tb() {
  var e = new Date(),
    t = e - eb;
  return t / 1e3;
}
function rb(e, t, r) {
  return (
    (r = {
      path: t,
      exports: {},
      require: function (n, s) {
        return nb(n, s ?? r.path);
      },
    }),
    e(r, r.exports),
    r.exports
  );
}
function nb() {
  throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
function sb(e) {
  ((r.debug = r),
    (r.default = r),
    (r.coerce = l),
    (r.disable = i),
    (r.enable = s),
    (r.enabled = a),
    (r.humanize = vw),
    (r.destroy = c),
    Object.keys(e).forEach((d) => {
      r[d] = e[d];
    }),
    (r.names = []),
    (r.skips = []),
    (r.formatters = {}));
  function t(d) {
    let m = 0;
    for (let w = 0; w < d.length; w++) ((m = (m << 5) - m + d.charCodeAt(w)), (m |= 0));
    return r.colors[Math.abs(m) % r.colors.length];
  }
  r.selectColor = t;
  function r(d) {
    let m,
      w = null,
      y,
      _;
    function I(...P) {
      if (!I.enabled) return;
      let S = I,
        U = Number(new Date()),
        K = U - (m || U);
      ((S.diff = K),
        (S.prev = m),
        (S.curr = U),
        (m = U),
        (P[0] = r.coerce(P[0])),
        typeof P[0] != "string" && P.unshift("%O"));
      let Ce = 0;
      ((P[0] = P[0].replace(/%([a-zA-Z%])/g, (Y, he) => {
        if (Y === "%%") return "%";
        Ce++;
        let ve = r.formatters[he];
        if (typeof ve == "function") {
          let ye = P[Ce];
          ((Y = ve.call(S, ye)), P.splice(Ce, 1), Ce--);
        }
        return Y;
      })),
        r.formatArgs.call(S, P),
        (S.log || r.log).apply(S, P));
    }
    return (
      (I.namespace = d),
      (I.useColors = r.useColors()),
      (I.color = r.selectColor(d)),
      (I.extend = n),
      (I.destroy = r.destroy),
      Object.defineProperty(I, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () =>
          w !== null ? w : (y !== r.namespaces && ((y = r.namespaces), (_ = r.enabled(d))), _),
        set: (P) => {
          w = P;
        },
      }),
      typeof r.init == "function" && r.init(I),
      I
    );
  }
  function n(d, m) {
    let w = r(this.namespace + (typeof m > "u" ? ":" : m) + d);
    return ((w.log = this.log), w);
  }
  function s(d) {
    (r.save(d), (r.namespaces = d), (r.names = []), (r.skips = []));
    let m = (typeof d == "string" ? d : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
    for (let w of m) w[0] === "-" ? r.skips.push(w.slice(1)) : r.names.push(w);
  }
  function o(d, m) {
    let w = 0,
      y = 0,
      _ = -1,
      I = 0;
    for (; w < d.length;)
      if (y < m.length && (m[y] === d[w] || m[y] === "*"))
        m[y] === "*" ? ((_ = y), (I = w), y++) : (w++, y++);
      else if (_ !== -1) ((y = _ + 1), I++, (w = I));
      else return !1;
    for (; y < m.length && m[y] === "*";) y++;
    return y === m.length;
  }
  function i() {
    let d = [...r.names, ...r.skips.map((m) => "-" + m)].join(",");
    return (r.enable(""), d);
  }
  function a(d) {
    for (let m of r.skips) if (o(d, m)) return !1;
    for (let m of r.names) if (o(d, m)) return !0;
    return !1;
  }
  function l(d) {
    return d instanceof Error ? d.stack || d.message : d;
  }
  function c() {
    console.warn(
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.",
    );
  }
  return (r.enable(r.load()), r);
}
function lb(e, t, r) {
  switch (e.error_code) {
    case 401:
      ad(
        "Error 401 means that your bot token is wrong, talk to https://t.me/BotFather to check it.",
      );
      break;
    case 409:
      ad(
        "Error 409 means that you are running your bot several times on long polling. Consider revoking the bot token if you believe that no other instance is running.",
      );
      break;
  }
  return new is(`Call to '${t}' failed!`, e, t, r);
}
function ub(e) {
  return typeof e == "object" && e !== null && "status" in e && "statusText" in e;
}
function cb(e, t, r) {
  let n = `Network request for '${e}' failed!`;
  return (
    ub(r) && (n += ` (${r.status}: ${r.statusText})`),
    t && r instanceof Error && (n += ` ${r.message}`),
    new Fo(n, r)
  );
}
function db() {
  let e = globalThis,
    t = e.Deno?.build?.os;
  return typeof t == "string"
    ? t === "windows"
    : (e.navigator?.platform?.startsWith("Win") ?? e.process?.platform?.startsWith("win") ?? !1);
}
function mb(e) {
  if (typeof e != "string")
    throw new TypeError(`Path must be a string, received "${JSON.stringify(e)}"`);
}
function Ed(e, t) {
  if (t.length >= e.length) return e;
  let r = e.length - t.length;
  for (let n = t.length - 1; n >= 0; --n) if (e.charCodeAt(r + n) !== t.charCodeAt(n)) return e;
  return e.slice(0, -t.length);
}
function Sd(e, t, r = 0) {
  let n = !1,
    s = e.length;
  for (let o = e.length - 1; o >= r; --o)
    if (t(e.charCodeAt(o))) {
      if (n) {
        r = o + 1;
        break;
      }
    } else n || ((n = !0), (s = o + 1));
  return e.slice(r, s);
}
function Id(e, t) {
  if ((mb(e), e.length === 0)) return e;
  if (typeof t != "string")
    throw new TypeError(`Suffix must be a string, received "${JSON.stringify(t)}"`);
}
function vd(e) {
  if (((e = e instanceof URL ? e : new URL(e)), e.protocol !== "file:"))
    throw new TypeError(`URL must be a file URL: received "${e.protocol}"`);
  return e;
}
function fb(e) {
  return ((e = vd(e)), decodeURIComponent(e.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25")));
}
function Cd(e, t) {
  if (e.length <= 1) return e;
  let r = e.length;
  for (let n = e.length - 1; n > 0 && t(e.charCodeAt(n)); n--) r = n;
  return e.slice(0, r);
}
function ld(e) {
  return e === 47;
}
function gb(e, t = "") {
  (e instanceof URL && (e = fb(e)), Id(e, t));
  let r = Sd(e, ld),
    n = Cd(r, ld);
  return t ? Ed(n, t) : n;
}
function ud(e) {
  return e === 47 || e === 92;
}
function hb(e) {
  return (e >= 97 && e <= 122) || (e >= 65 && e <= 90);
}
function wb(e) {
  e = vd(e);
  let t = decodeURIComponent(
    e.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25"),
  ).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
  return (e.hostname !== "" && (t = `\\\\${e.hostname}${t}`), t);
}
function bb(e, t = "") {
  (e instanceof URL && (e = wb(e)), Id(e, t));
  let r = 0;
  if (e.length >= 2) {
    let o = e.charCodeAt(0);
    hb(o) && e.charCodeAt(1) === 58 && (r = 2);
  }
  let n = Sd(e, ud, r),
    s = Cd(n, ud);
  return t ? Ed(s, t) : s;
}
function Mo(e, t = "") {
  return pb ? bb(e, t) : gb(e, t);
}
async function* cd(e) {
  let { body: t } = await fetch(e);
  if (t === null) throw new Error(`Download failed, no response body from '${e}'`);
  yield* t;
}
function Pa(e) {
  return (
    e instanceof gr ||
    (typeof e == "object" &&
      e !== null &&
      Object.values(e).some((t) => (Array.isArray(t) ? t.some(Pa) : t instanceof gr || Pa(t))))
  );
}
function Rd(e) {
  return JSON.stringify(e, (t, r) => r ?? void 0);
}
function dd(e) {
  return {
    method: "POST",
    headers: { "content-type": "application/json", connection: "keep-alive" },
    body: Rd(e),
  };
}
async function* yb(e, t) {
  try {
    yield* e;
  } catch (r) {
    t(r);
  }
}
function _b(e, t) {
  let r = Tb(),
    n = kb(e, r),
    s = yb(n, t),
    o = ib(s);
  return {
    method: "POST",
    headers: { "content-type": `multipart/form-data; boundary=${r}`, connection: "keep-alive" },
    body: o,
  };
}
function Tb() {
  return "----------" + Ad(32);
}
function Ad(e = 16) {
  return Array.from(Array(e))
    .map(() => Math.random().toString(36)[2] || 0)
    .join("");
}
async function* kb(e, t) {
  let r = Ma(e);
  yield ss.encode(`--${t}\r
`);
  let n = ss.encode(`\r
--${t}\r
`),
    s = !0;
  for (let [o, i] of Object.entries(e))
    i != null &&
      (s || (yield n),
      yield Eb(o, i instanceof gr ? i.toJSON() : typeof i == "object" ? Rd(i) : i),
      (s = !1));
  for (let { id: o, origin: i, file: a } of r) (s || (yield n), yield* Sb(o, i, a), (s = !1));
  yield ss.encode(`\r
--${t}--\r
`);
}
function Ma(e) {
  return typeof e != "object" || e === null
    ? []
    : Object.entries(e).flatMap(([t, r]) => {
        if (Array.isArray(r)) return r.flatMap((n) => Ma(n));
        if (r instanceof gr) {
          let n = Ad();
          Object.assign(r, { toJSON: () => `attach://${n}` });
          let s = t === "media" && "type" in e && typeof e.type == "string" ? e.type : t;
          return { id: n, origin: s, file: r };
        } else return Ma(r);
      });
}
function Eb(e, t) {
  return ss.encode(`content-disposition:form-data;name="${e}"\r
\r
${t}`);
}
async function* Sb(e, t, r) {
  let n = r.filename || `${t}.${Ib(t)}`;
  if (
    n.includes("\r") ||
    n.includes(`
`)
  )
    throw new Error(`File paths cannot contain carriage-return (\\r) or newline (\\n) characters! Filename for property '${t}' was:
"""
${n}
"""`);
  yield ss.encode(`content-disposition:form-data;name="${e}";filename=${n}\r
content-type:application/octet-stream\r
\r
`);
  let s = await r.toRaw();
  s instanceof Uint8Array ? yield s : yield* s;
}
function Ib(e) {
  switch (e) {
    case "certificate":
      return "pem";
    case "photo":
    case "thumbnail":
      return "jpg";
    case "voice":
      return "ogg";
    case "audio":
      return "mp3";
    case "animation":
    case "video":
    case "video_note":
      return "mp4";
    case "sticker":
      return "webp";
    default:
      return "dat";
  }
}
function Cb(e, t) {
  return (r, n, s) => t(e, r, n, s);
}
function Rb(e, t, r) {
  let n = new Oa(e, t, r),
    s = {
      get(l, c) {
        return c === "toJSON"
          ? "__internal"
          : c === "getMe" ||
              c === "getWebhookInfo" ||
              c === "getForumTopicIconStickers" ||
              c === "getAvailableGifts" ||
              c === "logOut" ||
              c === "close" ||
              c === "getMyStarBalance" ||
              c === "removeMyProfilePhoto"
            ? n.callApi.bind(n, c, {})
            : n.callApi.bind(n, c);
      },
      ...xb,
    },
    o = new Proxy({}, s),
    i = n.installedTransformers,
    a = { raw: o, installedTransformers: i, use: (...l) => (n.use(...l), a) };
  return a;
}
function Pb(e, t, r) {
  let n;
  return {
    promise: new Promise((o, i) => {
      n = setTimeout(() => {
        let a = `Request to '${r}' timed out after ${t} seconds`;
        (i(new Error(a)), e.abort());
      }, 1e3 * t);
    }),
    handle: n,
  };
}
function Mb(e) {
  let t = (n) => {
    throw n;
  };
  return {
    promise: new Promise((n, s) => {
      t = (o) => {
        (s(o), e.abort());
      };
    }),
    catch: t,
  };
}
function Ob(e) {
  let t = new AbortController();
  if (e === void 0) return t;
  let r = e;
  function n() {
    (t.abort(), r.removeEventListener("abort", n));
  }
  return (r.aborted ? n() : r.addEventListener("abort", n), { abort: n, signal: t.signal });
}
function Nb(e, t, r) {
  if (typeof r?.addEventListener == "function") return;
  let n = JSON.stringify(t);
  n.length > 20 && (n = n.substring(0, 16) + " ...");
  let s = JSON.stringify(r);
  throw (
    s.length > 20 && (s = s.substring(0, 16) + " ..."),
    new Error(`Incorrect abort signal instance found! You passed two payloads to '${e}' but you should merge the second one containing '${s}' into the first one containing '${n}'! If you are using context shortcuts, you may want to use a method on 'ctx.api' instead.

If you want to prevent such mistakes in the future, consider using TypeScript. https://www.typescriptlang.org/`)
  );
}
async function pd(e, t) {
  let n = 50;
  async function s(i) {
    let a = !1,
      l = "rethrow";
    if (i instanceof Fo) ((a = !0), (l = "retry"));
    else if (i instanceof is) {
      if (i.error_code >= 500) ((a = !0), (l = "retry"));
      else if (i.error_code === 429) {
        let c = i.parameters.retry_after;
        (typeof c == "number" ? (await Na(c, t), (n = 50)) : (a = !0), (l = "retry"));
      }
    }
    if (a) {
      n !== 50 && (await Na(n, t));
      let c = 1200 * 1e3;
      n = Math.min(c, 2 * n);
    }
    return l;
  }
  let o = { ok: !1 };
  for (; !o.ok;)
    try {
      o = { ok: !0, value: await e() };
    } catch (i) {
      switch ((gn(i), await s(i))) {
        case "retry":
          continue;
        case "rethrow":
          throw i;
      }
    }
  return o.value;
}
async function Na(e, t) {
  let r, n;
  function s() {
    (n?.(new Error("Aborted delay")), r !== void 0 && clearTimeout(r));
  }
  try {
    await new Promise((o, i) => {
      if (((n = i), t?.aborted)) {
        s();
        return;
      }
      (t?.addEventListener("abort", s), (r = setTimeout(o, 1e3 * e)));
    });
  } finally {
    t?.removeEventListener("abort", s);
  }
}
function Fb(e, t = Ga) {
  let r = Array.from(e).filter((n) => !t.includes(n));
  r.length > 0 &&
    Gb(
      `You registered listeners for the following update types, but you did not specify them in \`allowed_updates\` so they may not be received: ${r.map((n) => `'${n}'`).join(", ")}`,
    );
}
function $b() {
  throw new Error(`It looks like you are registering more listeners on your bot from within other listeners! This means that every time your bot handles a message like this one, new listeners will be added. This list grows until your machine crashes, so grammY throws this error to tell you that you should probably do things a bit differently. If you're unsure how to resolve this problem, you can ask in the group chat: https://telegram.me/grammyjs

On the other hand, if you actually know what you're doing and you do need to install further middleware while your bot is running, consider installing a composer instance on your bot, and in turn augment the composer after the fact. This way, you can circumvent this protection against memory leaks.`);
}
function Bb(e) {
  let t = [];
  for (let r = 0; r < e.length; r++) {
    let n = e[r];
    for (let s = 0; s < n.length; s++) {
      let o = n[s];
      (t[s] ??= []).push(o);
    }
  }
  return t;
}
function jb(e, t, { fillLastRow: r = !1 }) {
  let n = t;
  r && (n = e.map((i) => i.length).reduce((i, a) => i + a, 0) % t);
  let s = [];
  for (let o of e)
    for (let i of o) {
      let a = Math.max(0, s.length - 1),
        l = a === 0 ? n : t,
        c = (s[a] ??= []);
      (c.length === l && ((c = []), s.push(c)), c.push(i));
    }
  return s;
}
var Yc,
  td,
  Aa,
  hw,
  ww,
  xa,
  rd,
  hd,
  xo,
  nd,
  bw,
  yw,
  _w,
  Tw,
  sd,
  Oo,
  od,
  va,
  $t,
  ot,
  os,
  Ew,
  se,
  bn,
  yn,
  _n,
  Wr,
  Sw,
  Iw,
  vw,
  mr,
  fr,
  hn,
  Zt,
  wn,
  jr,
  No,
  Ow,
  Nw,
  Gw,
  Fw,
  $w,
  Lw,
  Dw,
  Uw,
  Bw,
  jw,
  Ww,
  qw,
  Kw,
  Hw,
  zw,
  fn,
  Xw,
  eb,
  Ra,
  ob,
  ct,
  ib,
  ab,
  ad,
  is,
  Fo,
  pb,
  gr,
  ss,
  vb,
  Oa,
  Ab,
  xb,
  it,
  Ft,
  Gb,
  gn,
  Ga,
  $o,
  Lb,
  Db,
  Ub,
  F,
  EI,
  Je,
  Lo,
  er,
  Tn,
  kn,
  En,
  Wb,
  qb,
  Kb,
  Hb,
  zb,
  Qb,
  Vb,
  Jb,
  Yb,
  Xb,
  md,
  Zb,
  ey,
  ty,
  ry,
  ny,
  sy,
  oy,
  iy,
  ay,
  ly,
  SI,
  uy,
  II,
  Ie = Oe(() => {
    Yc = new Map();
    ((td = {
      mention: {},
      hashtag: {},
      cashtag: {},
      bot_command: {},
      url: {},
      email: {},
      phone_number: {},
      bold: {},
      italic: {},
      underline: {},
      strikethrough: {},
      spoiler: {},
      blockquote: {},
      expandable_blockquote: {},
      code: {},
      pre: {},
      text_link: {},
      text_mention: {},
      custom_emoji: {},
    }),
      (Aa = { me: {}, is_bot: {}, is_premium: {}, added_to_attachment_menu: {} }),
      (hw = { user: {}, hidden_user: {}, chat: {}, channel: {} }),
      (ww = { is_video: {}, is_animated: {}, premium_animation: {} }),
      (xa = { emoji: {}, custom_emoji: {}, paid: {} }),
      (rd = { can_be_upgraded: {}, is_upgrade_separate: {}, is_private: {} }),
      (hd = {
        forward_origin: hw,
        is_topic_message: {},
        is_automatic_forward: {},
        business_connection_id: {},
        text: {},
        animation: {},
        audio: {},
        document: {},
        paid_media: {},
        photo: {},
        sticker: ww,
        story: {},
        video: {},
        video_note: {},
        voice: {},
        contact: {},
        dice: {},
        game: {},
        poll: {},
        venue: {},
        location: {},
        entities: td,
        caption_entities: td,
        caption: {},
        link_preview_options: {
          url: {},
          prefer_small_media: {},
          prefer_large_media: {},
          show_above_text: {},
        },
        effect_id: {},
        paid_star_count: {},
        has_media_spoiler: {},
        new_chat_title: {},
        new_chat_photo: {},
        delete_chat_photo: {},
        message_auto_delete_timer_changed: {},
        pinned_message: {},
        invoice: {},
        proximity_alert_triggered: {},
        chat_background_set: {},
        giveaway_created: {},
        giveaway: { only_new_members: {}, has_public_winners: {} },
        giveaway_winners: { only_new_members: {}, was_refunded: {} },
        giveaway_completed: {},
        gift: rd,
        gift_upgrade_sent: rd,
        unique_gift: { transfer_star_count: {} },
        paid_message_price_changed: {},
        video_chat_scheduled: {},
        video_chat_started: {},
        video_chat_ended: {},
        video_chat_participants_invited: {},
        web_app_data: {},
      }),
      (xo = {
        ...hd,
        direct_messages_topic: {},
        chat_owner_left: { new_owner: {} },
        chat_owner_changd: {},
        new_chat_members: Aa,
        left_chat_member: Aa,
        group_chat_created: {},
        supergroup_chat_created: {},
        migrate_to_chat_id: {},
        migrate_from_chat_id: {},
        successful_payment: {},
        refunded_payment: {},
        users_shared: {},
        chat_shared: {},
        connected_website: {},
        write_access_allowed: {},
        passport_data: {},
        boost_added: {},
        forum_topic_created: { is_name_implicit: {} },
        forum_topic_edited: { name: {}, icon_custom_emoji_id: {} },
        forum_topic_closed: {},
        forum_topic_reopened: {},
        general_forum_topic_hidden: {},
        general_forum_topic_unhidden: {},
        checklist: { others_can_add_tasks: {}, others_can_mark_tasks_as_done: {} },
        checklist_tasks_done: {},
        checklist_tasks_added: {},
        suggested_post_info: {},
        suggested_post_approved: {},
        suggested_post_approval_failed: {},
        suggested_post_declined: {},
        suggested_post_paid: {},
        suggested_post_refunded: {},
        sender_boost_count: {},
      }),
      (nd = {
        ...hd,
        channel_chat_created: {},
        direct_message_price_changed: {},
        is_paid_post: {},
      }),
      (bw = { can_reply: {}, is_enabled: {} }),
      (yw = { old_reaction: xa, new_reaction: xa }),
      (_w = { reactions: xa }),
      (Tw = { data: {}, game_short_name: {} }),
      (sd = { from: Aa }),
      (Oo = {
        message: xo,
        edited_message: xo,
        channel_post: nd,
        edited_channel_post: nd,
        business_connection: bw,
        business_message: xo,
        edited_business_message: xo,
        deleted_business_messages: {},
        inline_query: {},
        chosen_inline_result: {},
        callback_query: Tw,
        shipping_query: {},
        pre_checkout_query: {},
        poll: {},
        poll_answer: {},
        my_chat_member: sd,
        chat_member: sd,
        chat_join_request: {},
        message_reaction: yw,
        message_reaction_count: _w,
        chat_boost: {},
        removed_chat_boost: {},
        purchased_paid_media: {},
      }),
      (od = {
        "": ["message", "channel_post"],
        msg: ["message", "channel_post"],
        edit: ["edited_message", "edited_channel_post"],
      }),
      (va = {
        "": ["entities", "caption_entities"],
        media: ["photo", "video"],
        file: [
          "photo",
          "animation",
          "audio",
          "document",
          "video",
          "video_note",
          "voice",
          "sticker",
        ],
      }),
      ($t = {
        filterQuery(e) {
          let t = cw(e);
          return (r) => t(r);
        },
        text(e) {
          let t = $t.filterQuery([":text", ":caption"]),
            r = Ur(e);
          return (n) => {
            if (!t(n)) return !1;
            let s = n.message ?? n.channelPost,
              o = s.text ?? s.caption;
            return Br(n, o, r);
          };
        },
        command(e) {
          let t = $t.filterQuery(":entities:bot_command"),
            r = new Set(),
            n = new Set();
          return (
            Go(e).forEach((s) => {
              if (s.startsWith("/"))
                throw new Error(
                  `Do not include '/' when registering command handlers (use '${s.substring(1)}' not '${s}')`,
                );
              (s.includes("@") ? r : n).add(s);
            }),
            (s) => {
              if (!t(s)) return !1;
              let o = s.message ?? s.channelPost,
                i = o.text ?? o.caption;
              return o.entities.some((a) => {
                if (a.type !== "bot_command" || a.offset !== 0) return !1;
                let l = i.substring(1, a.length);
                if (n.has(l) || r.has(l))
                  return ((s.match = i.substring(l.length + 1).trimStart()), !0);
                let c = l.indexOf("@");
                if (c === -1) return !1;
                let d = l.substring(c + 1).toLowerCase(),
                  m = s.me.username.toLowerCase();
                if (d !== m) return !1;
                let w = l.substring(0, c);
                return n.has(w) ? ((s.match = i.substring(l.length + 1).trimStart()), !0) : !1;
              });
            }
          );
        },
        reaction(e) {
          let t = $t.filterQuery("message_reaction"),
            r =
              typeof e == "string"
                ? [{ type: "emoji", emoji: e }]
                : (Array.isArray(e) ? e : [e]).map((i) =>
                    typeof i == "string" ? { type: "emoji", emoji: i } : i,
                  ),
            n = new Set(r.filter((i) => i.type === "emoji").map((i) => i.emoji)),
            s = new Set(r.filter((i) => i.type === "custom_emoji").map((i) => i.custom_emoji_id)),
            o = r.some((i) => i.type === "paid");
          return (i) => {
            if (!t(i)) return !1;
            let { old_reaction: a, new_reaction: l } = i.messageReaction;
            for (let c of l) {
              let d = !1;
              if (c.type === "emoji") {
                for (let m of a)
                  if (m.type === "emoji" && m.emoji === c.emoji) {
                    d = !0;
                    break;
                  }
              } else if (c.type === "custom_emoji") {
                for (let m of a)
                  if (m.type === "custom_emoji" && m.custom_emoji_id === c.custom_emoji_id) {
                    d = !0;
                    break;
                  }
              } else if (c.type === "paid") {
                for (let m of a)
                  if (m.type === "paid") {
                    d = !0;
                    break;
                  }
              }
              if (!d)
                if (c.type === "emoji") {
                  if (n.has(c.emoji)) return !0;
                } else if (c.type === "custom_emoji") {
                  if (s.has(c.custom_emoji_id)) return !0;
                } else if (c.type === "paid") {
                  if (o) return !0;
                } else return !0;
            }
            return !1;
          };
        },
        chatType(e) {
          let t = new Set(Go(e));
          return (r) => r.chat?.type !== void 0 && t.has(r.chat.type);
        },
        callbackQuery(e) {
          let t = $t.filterQuery("callback_query:data"),
            r = Ur(e);
          return (n) => t(n) && Br(n, n.callbackQuery.data, r);
        },
        gameQuery(e) {
          let t = $t.filterQuery("callback_query:game_short_name"),
            r = Ur(e);
          return (n) => t(n) && Br(n, n.callbackQuery.game_short_name, r);
        },
        inlineQuery(e) {
          let t = $t.filterQuery("inline_query"),
            r = Ur(e);
          return (n) => t(n) && Br(n, n.inlineQuery.query, r);
        },
        chosenInlineResult(e) {
          let t = $t.filterQuery("chosen_inline_result"),
            r = Ur(e);
          return (n) => t(n) && Br(n, n.chosenInlineResult.result_id, r);
        },
        preCheckoutQuery(e) {
          let t = $t.filterQuery("pre_checkout_query"),
            r = Ur(e);
          return (n) => t(n) && Br(n, n.preCheckoutQuery.invoice_payload, r);
        },
        shippingQuery(e) {
          let t = $t.filterQuery("shipping_query"),
            r = Ur(e);
          return (n) => t(n) && Br(n, n.shippingQuery.invoice_payload, r);
        },
      }),
      (ot = class e {
        update;
        api;
        me;
        match;
        constructor(t, r, n) {
          ((this.update = t), (this.api = r), (this.me = n));
        }
        get message() {
          return this.update.message;
        }
        get editedMessage() {
          return this.update.edited_message;
        }
        get channelPost() {
          return this.update.channel_post;
        }
        get editedChannelPost() {
          return this.update.edited_channel_post;
        }
        get businessConnection() {
          return this.update.business_connection;
        }
        get businessMessage() {
          return this.update.business_message;
        }
        get editedBusinessMessage() {
          return this.update.edited_business_message;
        }
        get deletedBusinessMessages() {
          return this.update.deleted_business_messages;
        }
        get messageReaction() {
          return this.update.message_reaction;
        }
        get messageReactionCount() {
          return this.update.message_reaction_count;
        }
        get inlineQuery() {
          return this.update.inline_query;
        }
        get chosenInlineResult() {
          return this.update.chosen_inline_result;
        }
        get callbackQuery() {
          return this.update.callback_query;
        }
        get shippingQuery() {
          return this.update.shipping_query;
        }
        get preCheckoutQuery() {
          return this.update.pre_checkout_query;
        }
        get poll() {
          return this.update.poll;
        }
        get pollAnswer() {
          return this.update.poll_answer;
        }
        get myChatMember() {
          return this.update.my_chat_member;
        }
        get chatMember() {
          return this.update.chat_member;
        }
        get chatJoinRequest() {
          return this.update.chat_join_request;
        }
        get chatBoost() {
          return this.update.chat_boost;
        }
        get removedChatBoost() {
          return this.update.removed_chat_boost;
        }
        get purchasedPaidMedia() {
          return this.update.purchased_paid_media;
        }
        get msg() {
          return (
            this.message ??
            this.editedMessage ??
            this.channelPost ??
            this.editedChannelPost ??
            this.businessMessage ??
            this.editedBusinessMessage ??
            this.callbackQuery?.message
          );
        }
        get chat() {
          return (
            this.msg ??
            this.deletedBusinessMessages ??
            this.messageReaction ??
            this.messageReactionCount ??
            this.myChatMember ??
            this.chatMember ??
            this.chatJoinRequest ??
            this.chatBoost ??
            this.removedChatBoost
          )?.chat;
        }
        get senderChat() {
          return this.msg?.sender_chat;
        }
        get from() {
          return (
            (
              this.businessConnection ??
              this.messageReaction ??
              (this.chatBoost?.boost ?? this.removedChatBoost)?.source
            )?.user ??
            (
              this.callbackQuery ??
              this.msg ??
              this.inlineQuery ??
              this.chosenInlineResult ??
              this.shippingQuery ??
              this.preCheckoutQuery ??
              this.myChatMember ??
              this.chatMember ??
              this.chatJoinRequest ??
              this.purchasedPaidMedia
            )?.from
          );
        }
        get msgId() {
          return (
            this.msg?.message_id ??
            this.messageReaction?.message_id ??
            this.messageReactionCount?.message_id
          );
        }
        get chatId() {
          return this.chat?.id ?? this.businessConnection?.user_chat_id;
        }
        get inlineMessageId() {
          return (
            this.callbackQuery?.inline_message_id ?? this.chosenInlineResult?.inline_message_id
          );
        }
        get businessConnectionId() {
          return (
            this.msg?.business_connection_id ??
            this.businessConnection?.id ??
            this.deletedBusinessMessages?.business_connection_id
          );
        }
        entities(t) {
          let r = this.msg;
          if (r === void 0) return [];
          let n = r.text ?? r.caption;
          if (n === void 0) return [];
          let s = r.entities ?? r.caption_entities;
          if (s === void 0) return [];
          if (t !== void 0) {
            let o = new Set(Go(t));
            s = s.filter((i) => o.has(i.type));
          }
          return s.map((o) => ({ ...o, text: n.substring(o.offset, o.offset + o.length) }));
        }
        reactions() {
          let t = [],
            r = [],
            n = [],
            s = [],
            o = [],
            i = [],
            a = [],
            l = [],
            c = !1,
            d = !1,
            m = this.messageReaction;
          if (m !== void 0) {
            let { old_reaction: w, new_reaction: y } = m;
            for (let _ of y)
              _.type === "emoji"
                ? t.push(_.emoji)
                : _.type === "custom_emoji"
                  ? o.push(_.custom_emoji_id)
                  : _.type === "paid" && (c = d = !0);
            for (let _ of w)
              _.type === "emoji"
                ? s.push(_.emoji)
                : _.type === "custom_emoji"
                  ? l.push(_.custom_emoji_id)
                  : _.type === "paid" && (d = !1);
            (r.push(...t), i.push(...o));
            for (let _ = 0; _ < s.length; _++) {
              let I = r.length;
              if (I === 0) break;
              let P = s[_];
              for (let S = 0; S < I; S++)
                if (P === r[S]) {
                  (n.push(P), s.splice(_, 1), r.splice(S, 1), _--);
                  break;
                }
            }
            for (let _ = 0; _ < l.length; _++) {
              let I = i.length;
              if (I === 0) break;
              let P = l[_];
              for (let S = 0; S < I; S++)
                if (P === i[S]) {
                  (a.push(P), l.splice(_, 1), i.splice(S, 1), _--);
                  break;
                }
            }
          }
          return {
            emoji: t,
            emojiAdded: r,
            emojiKept: n,
            emojiRemoved: s,
            customEmoji: o,
            customEmojiAdded: i,
            customEmojiKept: a,
            customEmojiRemoved: l,
            paid: c,
            paidAdded: d,
          };
        }
        static has = $t;
        has(t) {
          return e.has.filterQuery(t)(this);
        }
        hasText(t) {
          return e.has.text(t)(this);
        }
        hasCommand(t) {
          return e.has.command(t)(this);
        }
        hasReaction(t) {
          return e.has.reaction(t)(this);
        }
        hasChatType(t) {
          return e.has.chatType(t)(this);
        }
        hasCallbackQuery(t) {
          return e.has.callbackQuery(t)(this);
        }
        hasGameQuery(t) {
          return e.has.gameQuery(t)(this);
        }
        hasInlineQuery(t) {
          return e.has.inlineQuery(t)(this);
        }
        hasChosenInlineResult(t) {
          return e.has.chosenInlineResult(t)(this);
        }
        hasPreCheckoutQuery(t) {
          return e.has.preCheckoutQuery(t)(this);
        }
        hasShippingQuery(t) {
          return e.has.shippingQuery(t)(this);
        }
        reply(t, r, n) {
          let s = this.msg;
          return this.api.sendMessage(
            k(this.chatId, "sendMessage"),
            t,
            {
              business_connection_id: this.businessConnectionId,
              ...(s?.is_topic_message ? { message_thread_id: s.message_thread_id } : {}),
              direct_messages_topic_id: s?.direct_messages_topic?.topic_id,
              ...r,
            },
            n,
          );
        }
        replyWithDraft(t, r, n) {
          let s = this.msg;
          return this.api.sendMessageDraft(
            k(this.chatId, "sendMessageDraft"),
            this.update.update_id,
            t,
            { ...(s?.is_topic_message ? { message_thread_id: s?.message_thread_id } : {}), ...r },
            n,
          );
        }
        forwardMessage(t, r, n) {
          let s = this.msg;
          return this.api.forwardMessage(
            t,
            k(this.chatId, "forwardMessage"),
            k(this.msgId, "forwardMessage"),
            { direct_messages_topic_id: s?.direct_messages_topic?.topic_id, ...r },
            n,
          );
        }
        forwardMessages(t, r, n, s) {
          let o = this.msg;
          return this.api.forwardMessages(
            t,
            k(this.chatId, "forwardMessages"),
            r,
            { direct_messages_topic_id: o?.direct_messages_topic?.topic_id, ...n },
            s,
          );
        }
        copyMessage(t, r, n) {
          let s = this.msg;
          return this.api.copyMessage(
            t,
            k(this.chatId, "copyMessage"),
            k(this.msgId, "copyMessage"),
            { direct_messages_topic_id: s?.direct_messages_topic?.topic_id, ...r },
            n,
          );
        }
        copyMessages(t, r, n, s) {
          let o = this.msg;
          return this.api.copyMessages(
            t,
            k(this.chatId, "copyMessages"),
            r,
            { direct_messages_topic_id: o?.direct_messages_topic?.topic_id, ...n },
            s,
          );
        }
        replyWithPhoto(t, r, n) {
          let s = this.msg;
          return this.api.sendPhoto(
            k(this.chatId, "sendPhoto"),
            t,
            {
              business_connection_id: this.businessConnectionId,
              ...(s?.is_topic_message ? { message_thread_id: s.message_thread_id } : {}),
              direct_messages_topic_id: s?.direct_messages_topic?.topic_id,
              ...r,
            },
            n,
          );
        }
        replyWithAudio(t, r, n) {
          let s = this.msg;
          return this.api.sendAudio(
            k(this.chatId, "sendAudio"),
            t,
            {
              business_connection_id: this.businessConnectionId,
              ...(s?.is_topic_message ? { message_thread_id: s.message_thread_id } : {}),
              direct_messages_topic_id: s?.direct_messages_topic?.topic_id,
              ...r,
            },
            n,
          );
        }
        replyWithDocument(t, r, n) {
          let s = this.msg;
          return this.api.sendDocument(
            k(this.chatId, "sendDocument"),
            t,
            {
              business_connection_id: this.businessConnectionId,
              ...(s?.is_topic_message ? { message_thread_id: s.message_thread_id } : {}),
              direct_messages_topic_id: s?.direct_messages_topic?.topic_id,
              ...r,
            },
            n,
          );
        }
        replyWithVideo(t, r, n) {
          let s = this.msg;
          return this.api.sendVideo(
            k(this.chatId, "sendVideo"),
            t,
            {
              business_connection_id: this.businessConnectionId,
              ...(s?.is_topic_message ? { message_thread_id: s.message_thread_id } : {}),
              direct_messages_topic_id: s?.direct_messages_topic?.topic_id,
              ...r,
            },
            n,
          );
        }
        replyWithAnimation(t, r, n) {
          let s = this.msg;
          return this.api.sendAnimation(
            k(this.chatId, "sendAnimation"),
            t,
            {
              business_connection_id: this.businessConnectionId,
              ...(s?.is_topic_message ? { message_thread_id: s.message_thread_id } : {}),
              direct_messages_topic_id: s?.direct_messages_topic?.topic_id,
              ...r,
            },
            n,
          );
        }
        replyWithVoice(t, r, n) {
          let s = this.msg;
          return this.api.sendVoice(
            k(this.chatId, "sendVoice"),
            t,
            {
              business_connection_id: this.businessConnectionId,
              ...(s?.is_topic_message ? { message_thread_id: s.message_thread_id } : {}),
              direct_messages_topic_id: s?.direct_messages_topic?.topic_id,
              ...r,
            },
            n,
          );
        }
        replyWithVideoNote(t, r, n) {
          let s = this.msg;
          return this.api.sendVideoNote(
            k(this.chatId, "sendVideoNote"),
            t,
            {
              business_connection_id: this.businessConnectionId,
              ...(s?.is_topic_message ? { message_thread_id: s.message_thread_id } : {}),
              direct_messages_topic_id: s?.direct_messages_topic?.topic_id,
              ...r,
            },
            n,
          );
        }
        replyWithMediaGroup(t, r, n) {
          let s = this.msg;
          return this.api.sendMediaGroup(
            k(this.chatId, "sendMediaGroup"),
            t,
            {
              business_connection_id: this.businessConnectionId,
              ...(s?.is_topic_message ? { message_thread_id: s.message_thread_id } : {}),
              direct_messages_topic_id: s?.direct_messages_topic?.topic_id,
              ...r,
            },
            n,
          );
        }
        replyWithLocation(t, r, n, s) {
          let o = this.msg;
          return this.api.sendLocation(
            k(this.chatId, "sendLocation"),
            t,
            r,
            {
              business_connection_id: this.businessConnectionId,
              ...(o?.is_topic_message ? { message_thread_id: o.message_thread_id } : {}),
              direct_messages_topic_id: o?.direct_messages_topic?.topic_id,
              ...n,
            },
            s,
          );
        }
        editMessageLiveLocation(t, r, n, s) {
          let o = this.inlineMessageId;
          return o !== void 0
            ? this.api.editMessageLiveLocationInline(
                o,
                t,
                r,
                { business_connection_id: this.businessConnectionId, ...n },
                s,
              )
            : this.api.editMessageLiveLocation(
                k(this.chatId, "editMessageLiveLocation"),
                k(this.msgId, "editMessageLiveLocation"),
                t,
                r,
                { business_connection_id: this.businessConnectionId, ...n },
                s,
              );
        }
        stopMessageLiveLocation(t, r) {
          let n = this.inlineMessageId;
          return n !== void 0
            ? this.api.stopMessageLiveLocationInline(
                n,
                { business_connection_id: this.businessConnectionId, ...t },
                r,
              )
            : this.api.stopMessageLiveLocation(
                k(this.chatId, "stopMessageLiveLocation"),
                k(this.msgId, "stopMessageLiveLocation"),
                { business_connection_id: this.businessConnectionId, ...t },
                r,
              );
        }
        sendPaidMedia(t, r, n, s) {
          let o = this.msg;
          return this.api.sendPaidMedia(
            k(this.chatId, "sendPaidMedia"),
            t,
            r,
            {
              business_connection_id: this.businessConnectionId,
              ...(o?.is_topic_message ? { message_thread_id: o.message_thread_id } : {}),
              direct_messages_topic_id: this.msg?.direct_messages_topic?.topic_id,
              ...n,
            },
            s,
          );
        }
        replyWithVenue(t, r, n, s, o, i) {
          let a = this.msg;
          return this.api.sendVenue(
            k(this.chatId, "sendVenue"),
            t,
            r,
            n,
            s,
            {
              business_connection_id: this.businessConnectionId,
              ...(a?.is_topic_message ? { message_thread_id: a.message_thread_id } : {}),
              direct_messages_topic_id: a?.direct_messages_topic?.topic_id,
              ...o,
            },
            i,
          );
        }
        replyWithContact(t, r, n, s) {
          let o = this.msg;
          return this.api.sendContact(
            k(this.chatId, "sendContact"),
            t,
            r,
            {
              business_connection_id: this.businessConnectionId,
              ...(o?.is_topic_message ? { message_thread_id: o.message_thread_id } : {}),
              direct_messages_topic_id: o?.direct_messages_topic?.topic_id,
              ...n,
            },
            s,
          );
        }
        replyWithPoll(t, r, n, s) {
          let o = this.msg;
          return this.api.sendPoll(
            k(this.chatId, "sendPoll"),
            t,
            r,
            {
              business_connection_id: this.businessConnectionId,
              ...(o?.is_topic_message ? { message_thread_id: o.message_thread_id } : {}),
              ...n,
            },
            s,
          );
        }
        replyWithChecklist(t, r, n) {
          return this.api.sendChecklist(
            k(this.businessConnectionId, "sendChecklist"),
            k(this.chatId, "sendChecklist"),
            t,
            r,
            n,
          );
        }
        editMessageChecklist(t, r, n) {
          let s = k(this.msg, "editMessageChecklist"),
            o =
              s.checklist_tasks_done?.checklist_message ??
              s.checklist_tasks_added?.checklist_message ??
              s;
          return this.api.editMessageChecklist(
            k(this.businessConnectionId, "editMessageChecklist"),
            k(o.chat.id, "editMessageChecklist"),
            k(o.message_id, "editMessageChecklist"),
            t,
            r,
            n,
          );
        }
        replyWithDice(t, r, n) {
          let s = this.msg;
          return this.api.sendDice(
            k(this.chatId, "sendDice"),
            t,
            {
              business_connection_id: this.businessConnectionId,
              ...(s?.is_topic_message ? { message_thread_id: s.message_thread_id } : {}),
              direct_messages_topic_id: s?.direct_messages_topic?.topic_id,
              ...r,
            },
            n,
          );
        }
        replyWithChatAction(t, r, n) {
          let s = this.msg;
          return this.api.sendChatAction(
            k(this.chatId, "sendChatAction"),
            t,
            {
              business_connection_id: this.businessConnectionId,
              message_thread_id: s?.message_thread_id,
              ...r,
            },
            n,
          );
        }
        react(t, r, n) {
          return this.api.setMessageReaction(
            k(this.chatId, "setMessageReaction"),
            k(this.msgId, "setMessageReaction"),
            typeof t == "string"
              ? [{ type: "emoji", emoji: t }]
              : (Array.isArray(t) ? t : [t]).map((s) =>
                  typeof s == "string" ? { type: "emoji", emoji: s } : s,
                ),
            r,
            n,
          );
        }
        getUserProfilePhotos(t, r) {
          return this.api.getUserProfilePhotos(k(this.from, "getUserProfilePhotos").id, t, r);
        }
        getUserProfileAudios(t, r) {
          return this.api.getUserProfileAudios(k(this.from, "getUserProfileAudios").id, t, r);
        }
        setUserEmojiStatus(t, r) {
          return this.api.setUserEmojiStatus(k(this.from, "setUserEmojiStatus").id, t, r);
        }
        getUserChatBoosts(t, r) {
          return this.api.getUserChatBoosts(
            t ?? k(this.chatId, "getUserChatBoosts"),
            k(this.from, "getUserChatBoosts").id,
            r,
          );
        }
        getUserGifts(t, r) {
          return this.api.getUserGifts(k(this.from, "getUserGifts").id, t, r);
        }
        getChatGifts(t, r) {
          return this.api.getChatGifts(k(this.chatId, "getChatGifts"), t, r);
        }
        getBusinessConnection(t) {
          return this.api.getBusinessConnection(
            k(this.businessConnectionId, "getBusinessConnection"),
            t,
          );
        }
        getFile(t) {
          let r = k(this.msg, "getFile"),
            n =
              r.photo !== void 0
                ? r.photo[r.photo.length - 1]
                : (r.animation ??
                  r.audio ??
                  r.document ??
                  r.video ??
                  r.video_note ??
                  r.voice ??
                  r.sticker);
          return this.api.getFile(k(n, "getFile").file_id, t);
        }
        kickAuthor(...t) {
          return this.banAuthor(...t);
        }
        banAuthor(t, r) {
          return this.api.banChatMember(
            k(this.chatId, "banAuthor"),
            k(this.from, "banAuthor").id,
            t,
            r,
          );
        }
        kickChatMember(...t) {
          return this.banChatMember(...t);
        }
        banChatMember(t, r, n) {
          return this.api.banChatMember(k(this.chatId, "banChatMember"), t, r, n);
        }
        unbanChatMember(t, r, n) {
          return this.api.unbanChatMember(k(this.chatId, "unbanChatMember"), t, r, n);
        }
        restrictAuthor(t, r, n) {
          return this.api.restrictChatMember(
            k(this.chatId, "restrictAuthor"),
            k(this.from, "restrictAuthor").id,
            t,
            r,
            n,
          );
        }
        restrictChatMember(t, r, n, s) {
          return this.api.restrictChatMember(k(this.chatId, "restrictChatMember"), t, r, n, s);
        }
        promoteAuthor(t, r) {
          return this.api.promoteChatMember(
            k(this.chatId, "promoteAuthor"),
            k(this.from, "promoteAuthor").id,
            t,
            r,
          );
        }
        promoteChatMember(t, r, n) {
          return this.api.promoteChatMember(k(this.chatId, "promoteChatMember"), t, r, n);
        }
        setChatAdministratorAuthorCustomTitle(t, r) {
          return this.api.setChatAdministratorCustomTitle(
            k(this.chatId, "setChatAdministratorAuthorCustomTitle"),
            k(this.from, "setChatAdministratorAuthorCustomTitle").id,
            t,
            r,
          );
        }
        setChatAdministratorCustomTitle(t, r, n) {
          return this.api.setChatAdministratorCustomTitle(
            k(this.chatId, "setChatAdministratorCustomTitle"),
            t,
            r,
            n,
          );
        }
        setAuthorTag(t, r) {
          return this.api.setChatMemberTag(
            k(this.chatId, "setChatMemberTag"),
            k(this.from, "setChatMemberTag").id,
            t,
            r,
          );
        }
        setChatMemberTag(t, r, n) {
          return this.api.setChatMemberTag(k(this.chatId, "setChatMemberTag"), t, r, n);
        }
        banChatSenderChat(t, r) {
          return this.api.banChatSenderChat(k(this.chatId, "banChatSenderChat"), t, r);
        }
        unbanChatSenderChat(t, r) {
          return this.api.unbanChatSenderChat(k(this.chatId, "unbanChatSenderChat"), t, r);
        }
        setChatPermissions(t, r, n) {
          return this.api.setChatPermissions(k(this.chatId, "setChatPermissions"), t, r, n);
        }
        exportChatInviteLink(t) {
          return this.api.exportChatInviteLink(k(this.chatId, "exportChatInviteLink"), t);
        }
        createChatInviteLink(t, r) {
          return this.api.createChatInviteLink(k(this.chatId, "createChatInviteLink"), t, r);
        }
        editChatInviteLink(t, r, n) {
          return this.api.editChatInviteLink(k(this.chatId, "editChatInviteLink"), t, r, n);
        }
        createChatSubscriptionInviteLink(t, r, n, s) {
          return this.api.createChatSubscriptionInviteLink(
            k(this.chatId, "createChatSubscriptionInviteLink"),
            t,
            r,
            n,
            s,
          );
        }
        editChatSubscriptionInviteLink(t, r, n) {
          return this.api.editChatSubscriptionInviteLink(
            k(this.chatId, "editChatSubscriptionInviteLink"),
            t,
            r,
            n,
          );
        }
        revokeChatInviteLink(t, r) {
          return this.api.revokeChatInviteLink(k(this.chatId, "editChatInviteLink"), t, r);
        }
        approveChatJoinRequest(t, r) {
          return this.api.approveChatJoinRequest(k(this.chatId, "approveChatJoinRequest"), t, r);
        }
        declineChatJoinRequest(t, r) {
          return this.api.declineChatJoinRequest(k(this.chatId, "declineChatJoinRequest"), t, r);
        }
        approveSuggestedPost(t, r) {
          return this.api.approveSuggestedPost(
            k(this.chatId, "approveSuggestedPost"),
            k(this.msgId, "approveSuggestedPost"),
            t,
            r,
          );
        }
        declineSuggestedPost(t, r) {
          return this.api.declineSuggestedPost(
            k(this.chatId, "declineSuggestedPost"),
            k(this.msgId, "declineSuggestedPost"),
            t,
            r,
          );
        }
        setChatPhoto(t, r) {
          return this.api.setChatPhoto(k(this.chatId, "setChatPhoto"), t, r);
        }
        deleteChatPhoto(t) {
          return this.api.deleteChatPhoto(k(this.chatId, "deleteChatPhoto"), t);
        }
        setChatTitle(t, r) {
          return this.api.setChatTitle(k(this.chatId, "setChatTitle"), t, r);
        }
        setChatDescription(t, r) {
          return this.api.setChatDescription(k(this.chatId, "setChatDescription"), t, r);
        }
        pinChatMessage(t, r, n) {
          return this.api.pinChatMessage(
            k(this.chatId, "pinChatMessage"),
            t,
            { business_connection_id: this.businessConnectionId, ...r },
            n,
          );
        }
        unpinChatMessage(t, r, n) {
          return this.api.unpinChatMessage(
            k(this.chatId, "unpinChatMessage"),
            t,
            { business_connection_id: this.businessConnectionId, ...r },
            n,
          );
        }
        unpinAllChatMessages(t) {
          return this.api.unpinAllChatMessages(k(this.chatId, "unpinAllChatMessages"), t);
        }
        leaveChat(t) {
          return this.api.leaveChat(k(this.chatId, "leaveChat"), t);
        }
        getChat(t) {
          return this.api.getChat(k(this.chatId, "getChat"), t);
        }
        getChatAdministrators(t) {
          return this.api.getChatAdministrators(k(this.chatId, "getChatAdministrators"), t);
        }
        getChatMembersCount(...t) {
          return this.getChatMemberCount(...t);
        }
        getChatMemberCount(t) {
          return this.api.getChatMemberCount(k(this.chatId, "getChatMemberCount"), t);
        }
        getAuthor(t) {
          return this.api.getChatMember(
            k(this.chatId, "getAuthor"),
            k(this.from, "getAuthor").id,
            t,
          );
        }
        getChatMember(t, r) {
          return this.api.getChatMember(k(this.chatId, "getChatMember"), t, r);
        }
        setChatStickerSet(t, r) {
          return this.api.setChatStickerSet(k(this.chatId, "setChatStickerSet"), t, r);
        }
        deleteChatStickerSet(t) {
          return this.api.deleteChatStickerSet(k(this.chatId, "deleteChatStickerSet"), t);
        }
        createForumTopic(t, r, n) {
          return this.api.createForumTopic(k(this.chatId, "createForumTopic"), t, r, n);
        }
        editForumTopic(t, r) {
          let n = k(this.msg, "editForumTopic"),
            s = k(n.message_thread_id, "editForumTopic");
          return this.api.editForumTopic(n.chat.id, s, t, r);
        }
        closeForumTopic(t) {
          let r = k(this.msg, "closeForumTopic"),
            n = k(r.message_thread_id, "closeForumTopic");
          return this.api.closeForumTopic(r.chat.id, n, t);
        }
        reopenForumTopic(t) {
          let r = k(this.msg, "reopenForumTopic"),
            n = k(r.message_thread_id, "reopenForumTopic");
          return this.api.reopenForumTopic(r.chat.id, n, t);
        }
        deleteForumTopic(t) {
          let r = k(this.msg, "deleteForumTopic"),
            n = k(r.message_thread_id, "deleteForumTopic");
          return this.api.deleteForumTopic(r.chat.id, n, t);
        }
        unpinAllForumTopicMessages(t) {
          let r = k(this.msg, "unpinAllForumTopicMessages"),
            n = k(r.message_thread_id, "unpinAllForumTopicMessages");
          return this.api.unpinAllForumTopicMessages(r.chat.id, n, t);
        }
        editGeneralForumTopic(t, r) {
          return this.api.editGeneralForumTopic(k(this.chatId, "editGeneralForumTopic"), t, r);
        }
        closeGeneralForumTopic(t) {
          return this.api.closeGeneralForumTopic(k(this.chatId, "closeGeneralForumTopic"), t);
        }
        reopenGeneralForumTopic(t) {
          return this.api.reopenGeneralForumTopic(k(this.chatId, "reopenGeneralForumTopic"), t);
        }
        hideGeneralForumTopic(t) {
          return this.api.hideGeneralForumTopic(k(this.chatId, "hideGeneralForumTopic"), t);
        }
        unhideGeneralForumTopic(t) {
          return this.api.unhideGeneralForumTopic(k(this.chatId, "unhideGeneralForumTopic"), t);
        }
        unpinAllGeneralForumTopicMessages(t) {
          return this.api.unpinAllGeneralForumTopicMessages(
            k(this.chatId, "unpinAllGeneralForumTopicMessages"),
            t,
          );
        }
        answerCallbackQuery(t, r) {
          return this.api.answerCallbackQuery(
            k(this.callbackQuery, "answerCallbackQuery").id,
            typeof t == "string" ? { text: t } : t,
            r,
          );
        }
        setChatMenuButton(t, r) {
          return this.api.setChatMenuButton(t, r);
        }
        getChatMenuButton(t, r) {
          return this.api.getChatMenuButton(t, r);
        }
        setMyDefaultAdministratorRights(t, r) {
          return this.api.setMyDefaultAdministratorRights(t, r);
        }
        getMyDefaultAdministratorRights(t, r) {
          return this.api.getMyDefaultAdministratorRights(t, r);
        }
        editMessageText(t, r, n) {
          let s = this.inlineMessageId;
          return s !== void 0
            ? this.api.editMessageTextInline(
                s,
                t,
                { business_connection_id: this.businessConnectionId, ...r },
                n,
              )
            : this.api.editMessageText(
                k(this.chatId, "editMessageText"),
                k(
                  this.msg?.message_id ??
                    this.messageReaction?.message_id ??
                    this.messageReactionCount?.message_id,
                  "editMessageText",
                ),
                t,
                { business_connection_id: this.businessConnectionId, ...r },
                n,
              );
        }
        editMessageCaption(t, r) {
          let n = this.inlineMessageId;
          return n !== void 0
            ? this.api.editMessageCaptionInline(
                n,
                { business_connection_id: this.businessConnectionId, ...t },
                r,
              )
            : this.api.editMessageCaption(
                k(this.chatId, "editMessageCaption"),
                k(
                  this.msg?.message_id ??
                    this.messageReaction?.message_id ??
                    this.messageReactionCount?.message_id,
                  "editMessageCaption",
                ),
                { business_connection_id: this.businessConnectionId, ...t },
                r,
              );
        }
        editMessageMedia(t, r, n) {
          let s = this.inlineMessageId;
          return s !== void 0
            ? this.api.editMessageMediaInline(
                s,
                t,
                { business_connection_id: this.businessConnectionId, ...r },
                n,
              )
            : this.api.editMessageMedia(
                k(this.chatId, "editMessageMedia"),
                k(
                  this.msg?.message_id ??
                    this.messageReaction?.message_id ??
                    this.messageReactionCount?.message_id,
                  "editMessageMedia",
                ),
                t,
                { business_connection_id: this.businessConnectionId, ...r },
                n,
              );
        }
        editMessageReplyMarkup(t, r) {
          let n = this.inlineMessageId;
          return n !== void 0
            ? this.api.editMessageReplyMarkupInline(
                n,
                { business_connection_id: this.businessConnectionId, ...t },
                r,
              )
            : this.api.editMessageReplyMarkup(
                k(this.chatId, "editMessageReplyMarkup"),
                k(
                  this.msg?.message_id ??
                    this.messageReaction?.message_id ??
                    this.messageReactionCount?.message_id,
                  "editMessageReplyMarkup",
                ),
                { business_connection_id: this.businessConnectionId, ...t },
                r,
              );
        }
        stopPoll(t, r) {
          return this.api.stopPoll(
            k(this.chatId, "stopPoll"),
            k(
              this.msg?.message_id ??
                this.messageReaction?.message_id ??
                this.messageReactionCount?.message_id,
              "stopPoll",
            ),
            { business_connection_id: this.businessConnectionId, ...t },
            r,
          );
        }
        deleteMessage(t) {
          return this.api.deleteMessage(
            k(this.chatId, "deleteMessage"),
            k(
              this.msg?.message_id ??
                this.messageReaction?.message_id ??
                this.messageReactionCount?.message_id,
              "deleteMessage",
            ),
            t,
          );
        }
        deleteMessages(t, r) {
          return this.api.deleteMessages(k(this.chatId, "deleteMessages"), t, r);
        }
        deleteBusinessMessages(t, r) {
          return this.api.deleteBusinessMessages(
            k(this.businessConnectionId, "deleteBusinessMessages"),
            t,
            r,
          );
        }
        setBusinessAccountName(t, r, n) {
          return this.api.setBusinessAccountName(
            k(this.businessConnectionId, "setBusinessAccountName"),
            t,
            r,
            n,
          );
        }
        setBusinessAccountUsername(t, r) {
          return this.api.setBusinessAccountUsername(
            k(this.businessConnectionId, "setBusinessAccountUsername"),
            t,
            r,
          );
        }
        setBusinessAccountBio(t, r) {
          return this.api.setBusinessAccountBio(
            k(this.businessConnectionId, "setBusinessAccountBio"),
            t,
            r,
          );
        }
        setBusinessAccountProfilePhoto(t, r, n) {
          return this.api.setBusinessAccountProfilePhoto(
            k(this.businessConnectionId, "setBusinessAccountProfilePhoto"),
            t,
            r,
            n,
          );
        }
        removeBusinessAccountProfilePhoto(t, r) {
          return this.api.removeBusinessAccountProfilePhoto(
            k(this.businessConnectionId, "removeBusinessAccountProfilePhoto"),
            t,
            r,
          );
        }
        setBusinessAccountGiftSettings(t, r, n) {
          return this.api.setBusinessAccountGiftSettings(
            k(this.businessConnectionId, "setBusinessAccountGiftSettings"),
            t,
            r,
            n,
          );
        }
        getBusinessAccountStarBalance(t) {
          return this.api.getBusinessAccountStarBalance(
            k(this.businessConnectionId, "getBusinessAccountStarBalance"),
            t,
          );
        }
        transferBusinessAccountStars(t, r) {
          return this.api.transferBusinessAccountStars(
            k(this.businessConnectionId, "transferBusinessAccountStars"),
            t,
            r,
          );
        }
        getBusinessAccountGifts(t, r) {
          return this.api.getBusinessAccountGifts(
            k(this.businessConnectionId, "getBusinessAccountGifts"),
            t,
            r,
          );
        }
        convertGiftToStars(t, r) {
          return this.api.convertGiftToStars(
            k(this.businessConnectionId, "convertGiftToStars"),
            t,
            r,
          );
        }
        upgradeGift(t, r, n) {
          return this.api.upgradeGift(k(this.businessConnectionId, "upgradeGift"), t, r, n);
        }
        transferGift(t, r, n, s) {
          return this.api.transferGift(k(this.businessConnectionId, "transferGift"), t, r, n, s);
        }
        postStory(t, r, n, s) {
          return this.api.postStory(k(this.businessConnectionId, "postStory"), t, r, n, s);
        }
        repostStory(t, r, n) {
          let s = k(this.msg?.story, "repostStory");
          return this.api.repostStory(
            k(this.businessConnectionId, "repostStory"),
            s.chat.id,
            s.id,
            t,
            r,
            n,
          );
        }
        editStory(t, r, n, s) {
          return this.api.editStory(k(this.businessConnectionId, "editStory"), t, r, n, s);
        }
        deleteStory(t, r) {
          return this.api.deleteStory(k(this.businessConnectionId, "deleteStory"), t, r);
        }
        replyWithSticker(t, r, n) {
          let s = this.msg;
          return this.api.sendSticker(
            k(this.chatId, "sendSticker"),
            t,
            {
              business_connection_id: this.businessConnectionId,
              ...(s?.is_topic_message ? { message_thread_id: s.message_thread_id } : {}),
              direct_messages_topic_id: s?.direct_messages_topic?.topic_id,
              ...r,
            },
            n,
          );
        }
        getCustomEmojiStickers(t) {
          return this.api.getCustomEmojiStickers(
            (this.msg?.entities ?? [])
              .filter((r) => r.type === "custom_emoji")
              .map((r) => r.custom_emoji_id),
            t,
          );
        }
        replyWithGift(t, r, n) {
          return this.api.sendGift(k(this.from, "sendGift").id, t, r, n);
        }
        giftPremiumSubscription(t, r, n, s) {
          return this.api.giftPremiumSubscription(
            k(this.from, "giftPremiumSubscription").id,
            t,
            r,
            n,
            s,
          );
        }
        replyWithGiftToChannel(t, r, n) {
          return this.api.sendGiftToChannel(k(this.chat, "sendGift").id, t, r, n);
        }
        answerInlineQuery(t, r, n) {
          return this.api.answerInlineQuery(k(this.inlineQuery, "answerInlineQuery").id, t, r, n);
        }
        savePreparedInlineMessage(t, r, n) {
          return this.api.savePreparedInlineMessage(
            k(this.from, "savePreparedInlineMessage").id,
            t,
            r,
            n,
          );
        }
        replyWithInvoice(t, r, n, s, o, i, a) {
          let l = this.msg;
          return this.api.sendInvoice(
            k(this.chatId, "sendInvoice"),
            t,
            r,
            n,
            s,
            o,
            {
              ...(l?.is_topic_message ? { message_thread_id: l.message_thread_id } : {}),
              direct_messages_topic_id: l?.direct_messages_topic?.topic_id,
              ...i,
            },
            a,
          );
        }
        answerShippingQuery(t, r, n) {
          return this.api.answerShippingQuery(
            k(this.shippingQuery, "answerShippingQuery").id,
            t,
            r,
            n,
          );
        }
        answerPreCheckoutQuery(t, r, n) {
          return this.api.answerPreCheckoutQuery(
            k(this.preCheckoutQuery, "answerPreCheckoutQuery").id,
            t,
            typeof r == "string" ? { error_message: r } : r,
            n,
          );
        }
        refundStarPayment(t) {
          return this.api.refundStarPayment(
            k(this.from, "refundStarPayment").id,
            k(this.msg?.successful_payment, "refundStarPayment").telegram_payment_charge_id,
            t,
          );
        }
        editUserStarSubscription(t, r, n) {
          return this.api.editUserStarSubscription(
            k(this.from, "editUserStarSubscription").id,
            t,
            r,
            n,
          );
        }
        verifyUser(t, r) {
          return this.api.verifyUser(k(this.from, "verifyUser").id, t, r);
        }
        verifyChat(t, r) {
          return this.api.verifyChat(k(this.chatId, "verifyChat"), t, r);
        }
        removeUserVerification(t) {
          return this.api.removeUserVerification(k(this.from, "removeUserVerification").id, t);
        }
        removeChatVerification(t) {
          return this.api.removeChatVerification(k(this.chatId, "removeChatVerification"), t);
        }
        readBusinessMessage(t) {
          return this.api.readBusinessMessage(
            k(this.businessConnectionId, "readBusinessMessage"),
            k(this.chatId, "readBusinessMessage"),
            k(this.msgId, "readBusinessMessage"),
            t,
          );
        }
        setPassportDataErrors(t, r) {
          return this.api.setPassportDataErrors(k(this.from, "setPassportDataErrors").id, t, r);
        }
        replyWithGame(t, r, n) {
          let s = this.msg;
          return this.api.sendGame(
            k(this.chatId, "sendGame"),
            t,
            {
              business_connection_id: this.businessConnectionId,
              ...(s?.is_topic_message ? { message_thread_id: s.message_thread_id } : {}),
              ...r,
            },
            n,
          );
        }
      }));
    os = class extends Error {
      error;
      ctx;
      constructor(t, r) {
        (super(kw(t)),
          (this.error = t),
          (this.ctx = r),
          (this.name = "BotError"),
          t instanceof Error && (this.stack = t.stack));
      }
    };
    Ew = () => Promise.resolve();
    ((se = class e {
      handler;
      constructor(...t) {
        this.handler = t.length === 0 ? Ca : t.map(ns).reduce(id);
      }
      middleware() {
        return this.handler;
      }
      use(...t) {
        let r = new e(...t);
        return ((this.handler = id(this.handler, ns(r))), r);
      }
      on(t, ...r) {
        return this.filter(ot.has.filterQuery(t), ...r);
      }
      hears(t, ...r) {
        return this.filter(ot.has.text(t), ...r);
      }
      command(t, ...r) {
        return this.filter(ot.has.command(t), ...r);
      }
      reaction(t, ...r) {
        return this.filter(ot.has.reaction(t), ...r);
      }
      chatType(t, ...r) {
        return this.filter(ot.has.chatType(t), ...r);
      }
      callbackQuery(t, ...r) {
        return this.filter(ot.has.callbackQuery(t), ...r);
      }
      gameQuery(t, ...r) {
        return this.filter(ot.has.gameQuery(t), ...r);
      }
      inlineQuery(t, ...r) {
        return this.filter(ot.has.inlineQuery(t), ...r);
      }
      chosenInlineResult(t, ...r) {
        return this.filter(ot.has.chosenInlineResult(t), ...r);
      }
      preCheckoutQuery(t, ...r) {
        return this.filter(ot.has.preCheckoutQuery(t), ...r);
      }
      shippingQuery(t, ...r) {
        return this.filter(ot.has.shippingQuery(t), ...r);
      }
      filter(t, ...r) {
        let n = new e(...r);
        return (this.branch(t, n, Ca), n);
      }
      drop(t, ...r) {
        return this.filter(async (n) => !(await t(n)), ...r);
      }
      fork(...t) {
        let r = new e(...t),
          n = ns(r);
        return (this.use((s, o) => Promise.all([o(), wd(n, s)])), r);
      }
      lazy(t) {
        return this.use(async (r, n) => {
          let s = await t(r),
            o = Array.isArray(s) ? s : [s];
          await ns(new e(...o))(r, n);
        });
      }
      route(t, r, n = Ca) {
        return this.lazy(async (s) => {
          let o = await t(s);
          return (o === void 0 || !r[o] ? n : r[o]) ?? [];
        });
      }
      branch(t, r, n) {
        return this.lazy(async (s) => ((await t(s)) ? r : n));
      }
      errorBoundary(t, ...r) {
        let n = new e(...r),
          s = ns(n);
        return (
          this.use(async (o, i) => {
            let a = !1,
              l = () => ((a = !0), Promise.resolve());
            try {
              await s(o, l);
            } catch (c) {
              ((a = !1), await t(new os(c, o), l));
            }
            a && (await i());
          }),
          n
        );
      }
    }),
      (bn = 1e3),
      (yn = bn * 60),
      (_n = yn * 60),
      (Wr = _n * 24),
      (Sw = Wr * 7),
      (Iw = Wr * 365.25),
      (vw = function (e, t) {
        t = t || {};
        var r = typeof e;
        if (r === "string" && e.length > 0) return Cw(e);
        if (r === "number" && isFinite(e)) return t.long ? Aw(e) : Rw(e);
        throw new Error(
          "val is not a non-empty string or a valid number. val=" + JSON.stringify(e),
        );
      }));
    ((mr = bd), (fr = yd));
    typeof window < "u" ? (hn = window) : typeof self < "u" ? (hn = self) : (hn = {});
    typeof hn.setTimeout == "function" && (mr = setTimeout);
    typeof hn.clearTimeout == "function" && (fr = clearTimeout);
    ((Zt = []), (wn = !1), (No = -1));
    kd.prototype.run = function () {
      this.fun.apply(null, this.array);
    };
    ((Ow = "browser"),
      (Nw = "browser"),
      (Gw = !0),
      (Fw = []),
      ($w = ""),
      (Lw = {}),
      (Dw = {}),
      (Uw = {}));
    ((Bw = qr), (jw = qr), (Ww = qr), (qw = qr), (Kw = qr), (Hw = qr), (zw = qr));
    ((fn = hn.performance || {}),
      (Xw =
        fn.now ||
        fn.mozNow ||
        fn.msNow ||
        fn.oNow ||
        fn.webkitNow ||
        function () {
          return new Date().getTime();
        }));
    eb = new Date();
    Ra = {
      nextTick: Mw,
      title: Ow,
      browser: Gw,
      env: { NODE_ENV: "production" },
      argv: Fw,
      version: $w,
      versions: Lw,
      on: Bw,
      addListener: jw,
      once: Ww,
      off: qw,
      removeListener: Kw,
      removeAllListeners: Hw,
      emit: zw,
      binding: Qw,
      cwd: Vw,
      chdir: Jw,
      umask: Yw,
      hrtime: Zw,
      platform: Nw,
      release: Dw,
      config: Uw,
      uptime: tb,
    };
    ((ob = sb),
      (ct = rb(function (e, t) {
        ((t.formatArgs = n),
          (t.save = s),
          (t.load = o),
          (t.useColors = r),
          (t.storage = i()),
          (t.destroy = (() => {
            let l = !1;
            return () => {
              l ||
                ((l = !0),
                console.warn(
                  "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.",
                ));
            };
          })()),
          (t.colors = [
            "#0000CC",
            "#0000FF",
            "#0033CC",
            "#0033FF",
            "#0066CC",
            "#0066FF",
            "#0099CC",
            "#0099FF",
            "#00CC00",
            "#00CC33",
            "#00CC66",
            "#00CC99",
            "#00CCCC",
            "#00CCFF",
            "#3300CC",
            "#3300FF",
            "#3333CC",
            "#3333FF",
            "#3366CC",
            "#3366FF",
            "#3399CC",
            "#3399FF",
            "#33CC00",
            "#33CC33",
            "#33CC66",
            "#33CC99",
            "#33CCCC",
            "#33CCFF",
            "#6600CC",
            "#6600FF",
            "#6633CC",
            "#6633FF",
            "#66CC00",
            "#66CC33",
            "#9900CC",
            "#9900FF",
            "#9933CC",
            "#9933FF",
            "#99CC00",
            "#99CC33",
            "#CC0000",
            "#CC0033",
            "#CC0066",
            "#CC0099",
            "#CC00CC",
            "#CC00FF",
            "#CC3300",
            "#CC3333",
            "#CC3366",
            "#CC3399",
            "#CC33CC",
            "#CC33FF",
            "#CC6600",
            "#CC6633",
            "#CC9900",
            "#CC9933",
            "#CCCC00",
            "#CCCC33",
            "#FF0000",
            "#FF0033",
            "#FF0066",
            "#FF0099",
            "#FF00CC",
            "#FF00FF",
            "#FF3300",
            "#FF3333",
            "#FF3366",
            "#FF3399",
            "#FF33CC",
            "#FF33FF",
            "#FF6600",
            "#FF6633",
            "#FF9900",
            "#FF9933",
            "#FFCC00",
            "#FFCC33",
          ]));
        function r() {
          if (
            typeof window < "u" &&
            window.process &&
            (window.process.type === "renderer" || window.process.__nwjs)
          )
            return !0;
          if (
            typeof navigator < "u" &&
            navigator.userAgent &&
            navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)
          )
            return !1;
          let l;
          return (
            (typeof document < "u" &&
              document.documentElement &&
              document.documentElement.style &&
              document.documentElement.style.WebkitAppearance) ||
            (typeof window < "u" &&
              window.console &&
              (window.console.firebug || (window.console.exception && window.console.table))) ||
            (typeof navigator < "u" &&
              navigator.userAgent &&
              (l = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) &&
              parseInt(l[1], 10) >= 31) ||
            (typeof navigator < "u" &&
              navigator.userAgent &&
              navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))
          );
        }
        function n(l) {
          if (
            ((l[0] =
              (this.useColors ? "%c" : "") +
              this.namespace +
              (this.useColors ? " %c" : " ") +
              l[0] +
              (this.useColors ? "%c " : " ") +
              "+" +
              e.exports.humanize(this.diff)),
            !this.useColors)
          )
            return;
          let c = "color: " + this.color;
          l.splice(1, 0, c, "color: inherit");
          let d = 0,
            m = 0;
          (l[0].replace(/%[a-zA-Z%]/g, (w) => {
            w !== "%%" && (d++, w === "%c" && (m = d));
          }),
            l.splice(m, 0, c));
        }
        t.log = console.debug || console.log || (() => {});
        function s(l) {
          try {
            l ? t.storage.setItem("debug", l) : t.storage.removeItem("debug");
          } catch {}
        }
        function o() {
          let l;
          try {
            l = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
          } catch {}
          return (!l && typeof Ra < "u" && "env" in Ra && (l = Ra.env.DEBUG), l);
        }
        function i() {
          try {
            return localStorage;
          } catch {}
        }
        e.exports = ob(t);
        let { formatters: a } = e.exports;
        a.j = function (l) {
          try {
            return JSON.stringify(l);
          } catch (c) {
            return "[UnexpectedJSONParseError]: " + c.message;
          }
        };
      })));
    ct.colors;
    ct.destroy;
    ct.formatArgs;
    ct.load;
    ct.log;
    ct.save;
    ct.storage;
    ct.useColors;
    ((ib = (e) => {
      let t = e[Symbol.asyncIterator]();
      return new ReadableStream({
        async pull(r) {
          let n = await t.next();
          n.done ? r.close() : r.enqueue(n.value);
        },
      });
    }),
      (ab = (e) => ({})),
      (ad = ct("grammy:warn")),
      (is = class extends Error {
        method;
        payload;
        ok;
        error_code;
        description;
        parameters;
        constructor(t, r, n, s) {
          (super(`${t} (${r.error_code}: ${r.description})`),
            (this.method = n),
            (this.payload = s),
            (this.ok = !1),
            (this.name = "GrammyError"),
            (this.error_code = r.error_code),
            (this.description = r.description),
            (this.parameters = r.parameters ?? {}));
        }
      }));
    Fo = class extends Error {
      error;
      constructor(t, r) {
        (super(t), (this.error = r), (this.name = "HttpError"));
      }
    };
    pb = db();
    gr = class {
      consumed = !1;
      fileData;
      filename;
      constructor(t, r) {
        ((this.fileData = t), (r ??= this.guessFilename(t)), (this.filename = r));
      }
      guessFilename(t) {
        if (typeof t == "string") return Mo(t);
        if (typeof t == "object") {
          if ("url" in t) return Mo(t.url);
          if (t instanceof URL) return Mo(t.pathname) || Mo(t.hostname);
        }
      }
      toRaw() {
        if (this.consumed) throw new Error("Cannot reuse InputFile data source!");
        let t = this.fileData;
        return t instanceof Blob
          ? t.stream()
          : t instanceof URL
            ? cd(t)
            : "url" in t
              ? cd(t.url)
              : (t instanceof Uint8Array || (this.consumed = !0), t);
      }
      toJSON() {
        throw new Error("InputFile instances must be sent via grammY");
      }
    };
    ss = new TextEncoder();
    vb = ct("grammy:core");
    Oa = class {
      token;
      webhookReplyEnvelope;
      options;
      fetch;
      hasUsedWebhookReply;
      installedTransformers;
      constructor(t, r = {}, n = {}) {
        ((this.token = t),
          (this.webhookReplyEnvelope = n),
          (this.hasUsedWebhookReply = !1),
          (this.installedTransformers = []),
          (this.call = async (l, c, d) => {
            let m = c ?? {};
            (vb(`Calling ${l}`), d !== void 0 && Nb(l, m, d));
            let w = this.options,
              y = Pa(m);
            if (
              this.webhookReplyEnvelope.send !== void 0 &&
              !this.hasUsedWebhookReply &&
              !y &&
              w.canUseWebhookReply(l)
            ) {
              this.hasUsedWebhookReply = !0;
              let he = dd({ ...m, method: l });
              return (await this.webhookReplyEnvelope.send(he.body), { ok: !0, result: !0 });
            }
            let _ = Ob(d),
              I = Pb(_, w.timeoutSeconds, l),
              P = Mb(_),
              S = w.buildUrl(w.apiRoot, this.token, l, w.environment),
              U = y ? _b(m, (he) => P.catch(he)) : dd(m),
              K = _.signal,
              Ce = { ...w.baseFetchConfig, signal: K, ...U },
              Y = [this.fetch(S, Ce).then((he) => he.json()), P.promise, I.promise];
            try {
              return await Promise.race(Y);
            } catch (he) {
              throw cb(l, w.sensitiveLogs, he);
            } finally {
              I.handle !== void 0 && clearTimeout(I.handle);
            }
          }));
        let s = r.apiRoot ?? "https://api.telegram.org",
          o = r.environment ?? "prod",
          { fetch: i } = r,
          a = i ?? fetch;
        if (
          ((this.options = {
            apiRoot: s,
            environment: o,
            buildUrl: r.buildUrl ?? Ab,
            timeoutSeconds: r.timeoutSeconds ?? 500,
            baseFetchConfig: { ...ab(s), ...r.baseFetchConfig },
            canUseWebhookReply: r.canUseWebhookReply ?? (() => !1),
            sensitiveLogs: r.sensitiveLogs ?? !1,
            fetch: (...l) => a(...l),
          }),
          (this.fetch = this.options.fetch),
          this.options.apiRoot.endsWith("/"))
        )
          throw new Error(
            `Remove the trailing '/' from the 'apiRoot' option (use '${this.options.apiRoot.substring(0, this.options.apiRoot.length - 1)}' instead of '${this.options.apiRoot}')`,
          );
      }
      call;
      use(...t) {
        return ((this.call = t.reduce(Cb, this.call)), this.installedTransformers.push(...t), this);
      }
      async callApi(t, r, n) {
        let s = await this.call(t, r, n);
        if (s.ok) return s.result;
        throw lb(s, t, r);
      }
    };
    ((Ab = (e, t, r, n) => `${e}/bot${t}/${n === "test" ? "test/" : ""}${r}`),
      (xb = {
        set() {
          return !1;
        },
        defineProperty() {
          return !1;
        },
        deleteProperty() {
          return !1;
        },
        ownKeys() {
          return [];
        },
      }));
    ((it = class {
      token;
      options;
      raw;
      config;
      constructor(t, r, n) {
        ((this.token = t), (this.options = r));
        let { raw: s, use: o, installedTransformers: i } = Rb(t, r, n);
        ((this.raw = s), (this.config = { use: o, installedTransformers: () => i.slice() }));
      }
      getUpdates(t, r) {
        return this.raw.getUpdates({ ...t }, r);
      }
      setWebhook(t, r, n) {
        return this.raw.setWebhook({ url: t, ...r }, n);
      }
      deleteWebhook(t, r) {
        return this.raw.deleteWebhook({ ...t }, r);
      }
      getWebhookInfo(t) {
        return this.raw.getWebhookInfo(t);
      }
      getMe(t) {
        return this.raw.getMe(t);
      }
      logOut(t) {
        return this.raw.logOut(t);
      }
      close(t) {
        return this.raw.close(t);
      }
      sendMessage(t, r, n, s) {
        return this.raw.sendMessage({ chat_id: t, text: r, ...n }, s);
      }
      sendMessageDraft(t, r, n, s, o) {
        return this.raw.sendMessageDraft({ chat_id: t, draft_id: r, text: n, ...s }, o);
      }
      forwardMessage(t, r, n, s, o) {
        return this.raw.forwardMessage({ chat_id: t, from_chat_id: r, message_id: n, ...s }, o);
      }
      forwardMessages(t, r, n, s, o) {
        return this.raw.forwardMessages({ chat_id: t, from_chat_id: r, message_ids: n, ...s }, o);
      }
      copyMessage(t, r, n, s, o) {
        return this.raw.copyMessage({ chat_id: t, from_chat_id: r, message_id: n, ...s }, o);
      }
      copyMessages(t, r, n, s, o) {
        return this.raw.copyMessages({ chat_id: t, from_chat_id: r, message_ids: n, ...s }, o);
      }
      sendPhoto(t, r, n, s) {
        return this.raw.sendPhoto({ chat_id: t, photo: r, ...n }, s);
      }
      sendAudio(t, r, n, s) {
        return this.raw.sendAudio({ chat_id: t, audio: r, ...n }, s);
      }
      sendDocument(t, r, n, s) {
        return this.raw.sendDocument({ chat_id: t, document: r, ...n }, s);
      }
      sendVideo(t, r, n, s) {
        return this.raw.sendVideo({ chat_id: t, video: r, ...n }, s);
      }
      sendAnimation(t, r, n, s) {
        return this.raw.sendAnimation({ chat_id: t, animation: r, ...n }, s);
      }
      sendVoice(t, r, n, s) {
        return this.raw.sendVoice({ chat_id: t, voice: r, ...n }, s);
      }
      sendVideoNote(t, r, n, s) {
        return this.raw.sendVideoNote({ chat_id: t, video_note: r, ...n }, s);
      }
      sendMediaGroup(t, r, n, s) {
        return this.raw.sendMediaGroup({ chat_id: t, media: r, ...n }, s);
      }
      sendLocation(t, r, n, s, o) {
        return this.raw.sendLocation({ chat_id: t, latitude: r, longitude: n, ...s }, o);
      }
      editMessageLiveLocation(t, r, n, s, o, i) {
        return this.raw.editMessageLiveLocation(
          { chat_id: t, message_id: r, latitude: n, longitude: s, ...o },
          i,
        );
      }
      editMessageLiveLocationInline(t, r, n, s, o) {
        return this.raw.editMessageLiveLocation(
          { inline_message_id: t, latitude: r, longitude: n, ...s },
          o,
        );
      }
      stopMessageLiveLocation(t, r, n, s) {
        return this.raw.stopMessageLiveLocation({ chat_id: t, message_id: r, ...n }, s);
      }
      stopMessageLiveLocationInline(t, r, n) {
        return this.raw.stopMessageLiveLocation({ inline_message_id: t, ...r }, n);
      }
      sendPaidMedia(t, r, n, s, o) {
        return this.raw.sendPaidMedia({ chat_id: t, star_count: r, media: n, ...s }, o);
      }
      sendVenue(t, r, n, s, o, i, a) {
        return this.raw.sendVenue(
          { chat_id: t, latitude: r, longitude: n, title: s, address: o, ...i },
          a,
        );
      }
      sendContact(t, r, n, s, o) {
        return this.raw.sendContact({ chat_id: t, phone_number: r, first_name: n, ...s }, o);
      }
      sendPoll(t, r, n, s, o) {
        let i = n.map((a) => (typeof a == "string" ? { text: a } : a));
        return this.raw.sendPoll({ chat_id: t, question: r, options: i, ...s }, o);
      }
      sendChecklist(t, r, n, s, o) {
        return this.raw.sendChecklist(
          { business_connection_id: t, chat_id: r, checklist: n, ...s },
          o,
        );
      }
      editMessageChecklist(t, r, n, s, o, i) {
        return this.raw.editMessageChecklist(
          { business_connection_id: t, chat_id: r, message_id: n, checklist: s, ...o },
          i,
        );
      }
      sendDice(t, r, n, s) {
        return this.raw.sendDice({ chat_id: t, emoji: r, ...n }, s);
      }
      setMessageReaction(t, r, n, s, o) {
        return this.raw.setMessageReaction({ chat_id: t, message_id: r, reaction: n, ...s }, o);
      }
      sendChatAction(t, r, n, s) {
        return this.raw.sendChatAction({ chat_id: t, action: r, ...n }, s);
      }
      getUserProfilePhotos(t, r, n) {
        return this.raw.getUserProfilePhotos({ user_id: t, ...r }, n);
      }
      getUserProfileAudios(t, r, n) {
        return this.raw.getUserProfileAudios({ user_id: t, ...r }, n);
      }
      setUserEmojiStatus(t, r, n) {
        return this.raw.setUserEmojiStatus({ user_id: t, ...r }, n);
      }
      getUserChatBoosts(t, r, n) {
        return this.raw.getUserChatBoosts({ chat_id: t, user_id: r }, n);
      }
      getUserGifts(t, r, n) {
        return this.raw.getUserGifts({ user_id: t, ...r }, n);
      }
      getChatGifts(t, r, n) {
        return this.raw.getChatGifts({ chat_id: t, ...r }, n);
      }
      getBusinessConnection(t, r) {
        return this.raw.getBusinessConnection({ business_connection_id: t }, r);
      }
      getFile(t, r) {
        return this.raw.getFile({ file_id: t }, r);
      }
      kickChatMember(...t) {
        return this.banChatMember(...t);
      }
      banChatMember(t, r, n, s) {
        return this.raw.banChatMember({ chat_id: t, user_id: r, ...n }, s);
      }
      unbanChatMember(t, r, n, s) {
        return this.raw.unbanChatMember({ chat_id: t, user_id: r, ...n }, s);
      }
      restrictChatMember(t, r, n, s, o) {
        return this.raw.restrictChatMember({ chat_id: t, user_id: r, permissions: n, ...s }, o);
      }
      promoteChatMember(t, r, n, s) {
        return this.raw.promoteChatMember({ chat_id: t, user_id: r, ...n }, s);
      }
      setChatAdministratorCustomTitle(t, r, n, s) {
        return this.raw.setChatAdministratorCustomTitle(
          { chat_id: t, user_id: r, custom_title: n },
          s,
        );
      }
      setChatMemberTag(t, r, n, s) {
        return this.raw.setChatMemberTag({ chat_id: t, user_id: r, tag: n }, s);
      }
      banChatSenderChat(t, r, n) {
        return this.raw.banChatSenderChat({ chat_id: t, sender_chat_id: r }, n);
      }
      unbanChatSenderChat(t, r, n) {
        return this.raw.unbanChatSenderChat({ chat_id: t, sender_chat_id: r }, n);
      }
      setChatPermissions(t, r, n, s) {
        return this.raw.setChatPermissions({ chat_id: t, permissions: r, ...n }, s);
      }
      exportChatInviteLink(t, r) {
        return this.raw.exportChatInviteLink({ chat_id: t }, r);
      }
      createChatInviteLink(t, r, n) {
        return this.raw.createChatInviteLink({ chat_id: t, ...r }, n);
      }
      editChatInviteLink(t, r, n, s) {
        return this.raw.editChatInviteLink({ chat_id: t, invite_link: r, ...n }, s);
      }
      createChatSubscriptionInviteLink(t, r, n, s, o) {
        return this.raw.createChatSubscriptionInviteLink(
          { chat_id: t, subscription_period: r, subscription_price: n, ...s },
          o,
        );
      }
      editChatSubscriptionInviteLink(t, r, n, s) {
        return this.raw.editChatSubscriptionInviteLink({ chat_id: t, invite_link: r, ...n }, s);
      }
      revokeChatInviteLink(t, r, n) {
        return this.raw.revokeChatInviteLink({ chat_id: t, invite_link: r }, n);
      }
      approveChatJoinRequest(t, r, n) {
        return this.raw.approveChatJoinRequest({ chat_id: t, user_id: r }, n);
      }
      declineChatJoinRequest(t, r, n) {
        return this.raw.declineChatJoinRequest({ chat_id: t, user_id: r }, n);
      }
      approveSuggestedPost(t, r, n, s) {
        return this.raw.approveSuggestedPost({ chat_id: t, message_id: r, ...n }, s);
      }
      declineSuggestedPost(t, r, n, s) {
        return this.raw.declineSuggestedPost({ chat_id: t, message_id: r, ...n }, s);
      }
      setChatPhoto(t, r, n) {
        return this.raw.setChatPhoto({ chat_id: t, photo: r }, n);
      }
      deleteChatPhoto(t, r) {
        return this.raw.deleteChatPhoto({ chat_id: t }, r);
      }
      setChatTitle(t, r, n) {
        return this.raw.setChatTitle({ chat_id: t, title: r }, n);
      }
      setChatDescription(t, r, n) {
        return this.raw.setChatDescription({ chat_id: t, description: r }, n);
      }
      pinChatMessage(t, r, n, s) {
        return this.raw.pinChatMessage({ chat_id: t, message_id: r, ...n }, s);
      }
      unpinChatMessage(t, r, n, s) {
        return this.raw.unpinChatMessage({ chat_id: t, message_id: r, ...n }, s);
      }
      unpinAllChatMessages(t, r) {
        return this.raw.unpinAllChatMessages({ chat_id: t }, r);
      }
      leaveChat(t, r) {
        return this.raw.leaveChat({ chat_id: t }, r);
      }
      getChat(t, r) {
        return this.raw.getChat({ chat_id: t }, r);
      }
      getChatAdministrators(t, r) {
        return this.raw.getChatAdministrators({ chat_id: t }, r);
      }
      getChatMembersCount(...t) {
        return this.getChatMemberCount(...t);
      }
      getChatMemberCount(t, r) {
        return this.raw.getChatMemberCount({ chat_id: t }, r);
      }
      getChatMember(t, r, n) {
        return this.raw.getChatMember({ chat_id: t, user_id: r }, n);
      }
      setChatStickerSet(t, r, n) {
        return this.raw.setChatStickerSet({ chat_id: t, sticker_set_name: r }, n);
      }
      deleteChatStickerSet(t, r) {
        return this.raw.deleteChatStickerSet({ chat_id: t }, r);
      }
      getForumTopicIconStickers(t) {
        return this.raw.getForumTopicIconStickers(t);
      }
      createForumTopic(t, r, n, s) {
        return this.raw.createForumTopic({ chat_id: t, name: r, ...n }, s);
      }
      editForumTopic(t, r, n, s) {
        return this.raw.editForumTopic({ chat_id: t, message_thread_id: r, ...n }, s);
      }
      closeForumTopic(t, r, n) {
        return this.raw.closeForumTopic({ chat_id: t, message_thread_id: r }, n);
      }
      reopenForumTopic(t, r, n) {
        return this.raw.reopenForumTopic({ chat_id: t, message_thread_id: r }, n);
      }
      deleteForumTopic(t, r, n) {
        return this.raw.deleteForumTopic({ chat_id: t, message_thread_id: r }, n);
      }
      unpinAllForumTopicMessages(t, r, n) {
        return this.raw.unpinAllForumTopicMessages({ chat_id: t, message_thread_id: r }, n);
      }
      editGeneralForumTopic(t, r, n) {
        return this.raw.editGeneralForumTopic({ chat_id: t, name: r }, n);
      }
      closeGeneralForumTopic(t, r) {
        return this.raw.closeGeneralForumTopic({ chat_id: t }, r);
      }
      reopenGeneralForumTopic(t, r) {
        return this.raw.reopenGeneralForumTopic({ chat_id: t }, r);
      }
      hideGeneralForumTopic(t, r) {
        return this.raw.hideGeneralForumTopic({ chat_id: t }, r);
      }
      unhideGeneralForumTopic(t, r) {
        return this.raw.unhideGeneralForumTopic({ chat_id: t }, r);
      }
      unpinAllGeneralForumTopicMessages(t, r) {
        return this.raw.unpinAllGeneralForumTopicMessages({ chat_id: t }, r);
      }
      answerCallbackQuery(t, r, n) {
        return this.raw.answerCallbackQuery({ callback_query_id: t, ...r }, n);
      }
      setMyName(t, r, n) {
        return this.raw.setMyName({ name: t, ...r }, n);
      }
      getMyName(t, r) {
        return this.raw.getMyName(t ?? {}, r);
      }
      setMyCommands(t, r, n) {
        return this.raw.setMyCommands({ commands: t, ...r }, n);
      }
      deleteMyCommands(t, r) {
        return this.raw.deleteMyCommands({ ...t }, r);
      }
      getMyCommands(t, r) {
        return this.raw.getMyCommands({ ...t }, r);
      }
      setMyDescription(t, r, n) {
        return this.raw.setMyDescription({ description: t, ...r }, n);
      }
      getMyDescription(t, r) {
        return this.raw.getMyDescription({ ...t }, r);
      }
      setMyShortDescription(t, r, n) {
        return this.raw.setMyShortDescription({ short_description: t, ...r }, n);
      }
      getMyShortDescription(t, r) {
        return this.raw.getMyShortDescription({ ...t }, r);
      }
      setMyProfilePhoto(t, r) {
        return this.raw.setMyProfilePhoto({ photo: t }, r);
      }
      removeMyProfilePhoto(t) {
        return this.raw.removeMyProfilePhoto(t);
      }
      setChatMenuButton(t, r) {
        return this.raw.setChatMenuButton({ ...t }, r);
      }
      getChatMenuButton(t, r) {
        return this.raw.getChatMenuButton({ ...t }, r);
      }
      setMyDefaultAdministratorRights(t, r) {
        return this.raw.setMyDefaultAdministratorRights({ ...t }, r);
      }
      getMyDefaultAdministratorRights(t, r) {
        return this.raw.getMyDefaultAdministratorRights({ ...t }, r);
      }
      getMyStarBalance(t) {
        return this.raw.getMyStarBalance(t);
      }
      editMessageText(t, r, n, s, o) {
        return this.raw.editMessageText({ chat_id: t, message_id: r, text: n, ...s }, o);
      }
      editMessageTextInline(t, r, n, s) {
        return this.raw.editMessageText({ inline_message_id: t, text: r, ...n }, s);
      }
      editMessageCaption(t, r, n, s) {
        return this.raw.editMessageCaption({ chat_id: t, message_id: r, ...n }, s);
      }
      editMessageCaptionInline(t, r, n) {
        return this.raw.editMessageCaption({ inline_message_id: t, ...r }, n);
      }
      editMessageMedia(t, r, n, s, o) {
        return this.raw.editMessageMedia({ chat_id: t, message_id: r, media: n, ...s }, o);
      }
      editMessageMediaInline(t, r, n, s) {
        return this.raw.editMessageMedia({ inline_message_id: t, media: r, ...n }, s);
      }
      editMessageReplyMarkup(t, r, n, s) {
        return this.raw.editMessageReplyMarkup({ chat_id: t, message_id: r, ...n }, s);
      }
      editMessageReplyMarkupInline(t, r, n) {
        return this.raw.editMessageReplyMarkup({ inline_message_id: t, ...r }, n);
      }
      stopPoll(t, r, n, s) {
        return this.raw.stopPoll({ chat_id: t, message_id: r, ...n }, s);
      }
      deleteMessage(t, r, n) {
        return this.raw.deleteMessage({ chat_id: t, message_id: r }, n);
      }
      deleteMessages(t, r, n) {
        return this.raw.deleteMessages({ chat_id: t, message_ids: r }, n);
      }
      deleteBusinessMessages(t, r, n) {
        return this.raw.deleteBusinessMessages({ business_connection_id: t, message_ids: r }, n);
      }
      setBusinessAccountName(t, r, n, s) {
        return this.raw.setBusinessAccountName(
          { business_connection_id: t, first_name: r, ...n },
          s,
        );
      }
      setBusinessAccountUsername(t, r, n) {
        return this.raw.setBusinessAccountUsername({ business_connection_id: t, username: r }, n);
      }
      setBusinessAccountBio(t, r, n) {
        return this.raw.setBusinessAccountBio({ business_connection_id: t, bio: r }, n);
      }
      setBusinessAccountProfilePhoto(t, r, n, s) {
        return this.raw.setBusinessAccountProfilePhoto(
          { business_connection_id: t, photo: r, ...n },
          s,
        );
      }
      removeBusinessAccountProfilePhoto(t, r, n) {
        return this.raw.removeBusinessAccountProfilePhoto({ business_connection_id: t, ...r }, n);
      }
      setBusinessAccountGiftSettings(t, r, n, s) {
        return this.raw.setBusinessAccountGiftSettings(
          { business_connection_id: t, show_gift_button: r, accepted_gift_types: n },
          s,
        );
      }
      getBusinessAccountStarBalance(t, r) {
        return this.raw.getBusinessAccountStarBalance({ business_connection_id: t }, r);
      }
      transferBusinessAccountStars(t, r, n) {
        return this.raw.transferBusinessAccountStars(
          { business_connection_id: t, star_count: r },
          n,
        );
      }
      getBusinessAccountGifts(t, r, n) {
        return this.raw.getBusinessAccountGifts({ business_connection_id: t, ...r }, n);
      }
      convertGiftToStars(t, r, n) {
        return this.raw.convertGiftToStars({ business_connection_id: t, owned_gift_id: r }, n);
      }
      upgradeGift(t, r, n, s) {
        return this.raw.upgradeGift({ business_connection_id: t, owned_gift_id: r, ...n }, s);
      }
      transferGift(t, r, n, s, o) {
        return this.raw.transferGift(
          { business_connection_id: t, owned_gift_id: r, new_owner_chat_id: n, star_count: s },
          o,
        );
      }
      postStory(t, r, n, s, o) {
        return this.raw.postStory(
          { business_connection_id: t, content: r, active_period: n, ...s },
          o,
        );
      }
      repostStory(t, r, n, s, o, i) {
        return this.raw.repostStory(
          { business_connection_id: t, from_chat_id: r, from_story_id: n, active_period: s, ...o },
          i,
        );
      }
      editStory(t, r, n, s, o) {
        return this.raw.editStory({ business_connection_id: t, story_id: r, content: n, ...s }, o);
      }
      deleteStory(t, r, n) {
        return this.raw.deleteStory({ business_connection_id: t, story_id: r }, n);
      }
      sendSticker(t, r, n, s) {
        return this.raw.sendSticker({ chat_id: t, sticker: r, ...n }, s);
      }
      getStickerSet(t, r) {
        return this.raw.getStickerSet({ name: t }, r);
      }
      getCustomEmojiStickers(t, r) {
        return this.raw.getCustomEmojiStickers({ custom_emoji_ids: t }, r);
      }
      uploadStickerFile(t, r, n, s) {
        return this.raw.uploadStickerFile({ user_id: t, sticker_format: r, sticker: n }, s);
      }
      createNewStickerSet(t, r, n, s, o, i) {
        return this.raw.createNewStickerSet(
          { user_id: t, name: r, title: n, stickers: s, ...o },
          i,
        );
      }
      addStickerToSet(t, r, n, s) {
        return this.raw.addStickerToSet({ user_id: t, name: r, sticker: n }, s);
      }
      setStickerPositionInSet(t, r, n) {
        return this.raw.setStickerPositionInSet({ sticker: t, position: r }, n);
      }
      deleteStickerFromSet(t, r) {
        return this.raw.deleteStickerFromSet({ sticker: t }, r);
      }
      replaceStickerInSet(t, r, n, s, o) {
        return this.raw.replaceStickerInSet({ user_id: t, name: r, old_sticker: n, sticker: s }, o);
      }
      setStickerEmojiList(t, r, n) {
        return this.raw.setStickerEmojiList({ sticker: t, emoji_list: r }, n);
      }
      setStickerKeywords(t, r, n) {
        return this.raw.setStickerKeywords({ sticker: t, keywords: r }, n);
      }
      setStickerMaskPosition(t, r, n) {
        return this.raw.setStickerMaskPosition({ sticker: t, mask_position: r }, n);
      }
      setStickerSetTitle(t, r, n) {
        return this.raw.setStickerSetTitle({ name: t, title: r }, n);
      }
      deleteStickerSet(t, r) {
        return this.raw.deleteStickerSet({ name: t }, r);
      }
      setStickerSetThumbnail(t, r, n, s, o) {
        return this.raw.setStickerSetThumbnail({ name: t, user_id: r, thumbnail: n, format: s }, o);
      }
      setCustomEmojiStickerSetThumbnail(t, r, n) {
        return this.raw.setCustomEmojiStickerSetThumbnail({ name: t, custom_emoji_id: r }, n);
      }
      getAvailableGifts(t) {
        return this.raw.getAvailableGifts(t);
      }
      sendGift(t, r, n, s) {
        return this.raw.sendGift({ user_id: t, gift_id: r, ...n }, s);
      }
      giftPremiumSubscription(t, r, n, s, o) {
        return this.raw.giftPremiumSubscription(
          { user_id: t, month_count: r, star_count: n, ...s },
          o,
        );
      }
      sendGiftToChannel(t, r, n, s) {
        return this.raw.sendGift({ chat_id: t, gift_id: r, ...n }, s);
      }
      answerInlineQuery(t, r, n, s) {
        return this.raw.answerInlineQuery({ inline_query_id: t, results: r, ...n }, s);
      }
      answerWebAppQuery(t, r, n) {
        return this.raw.answerWebAppQuery({ web_app_query_id: t, result: r }, n);
      }
      savePreparedInlineMessage(t, r, n, s) {
        return this.raw.savePreparedInlineMessage({ user_id: t, result: r, ...n }, s);
      }
      sendInvoice(t, r, n, s, o, i, a, l) {
        return this.raw.sendInvoice(
          { chat_id: t, title: r, description: n, payload: s, currency: o, prices: i, ...a },
          l,
        );
      }
      createInvoiceLink(t, r, n, s, o, i, a, l) {
        return this.raw.createInvoiceLink(
          { title: t, description: r, payload: n, provider_token: s, currency: o, prices: i, ...a },
          l,
        );
      }
      answerShippingQuery(t, r, n, s) {
        return this.raw.answerShippingQuery({ shipping_query_id: t, ok: r, ...n }, s);
      }
      answerPreCheckoutQuery(t, r, n, s) {
        return this.raw.answerPreCheckoutQuery({ pre_checkout_query_id: t, ok: r, ...n }, s);
      }
      getStarTransactions(t, r) {
        return this.raw.getStarTransactions({ ...t }, r);
      }
      refundStarPayment(t, r, n) {
        return this.raw.refundStarPayment({ user_id: t, telegram_payment_charge_id: r }, n);
      }
      editUserStarSubscription(t, r, n, s) {
        return this.raw.editUserStarSubscription(
          { user_id: t, telegram_payment_charge_id: r, is_canceled: n },
          s,
        );
      }
      verifyUser(t, r, n) {
        return this.raw.verifyUser({ user_id: t, ...r }, n);
      }
      verifyChat(t, r, n) {
        return this.raw.verifyChat({ chat_id: t, ...r }, n);
      }
      removeUserVerification(t, r) {
        return this.raw.removeUserVerification({ user_id: t }, r);
      }
      removeChatVerification(t, r) {
        return this.raw.removeChatVerification({ chat_id: t }, r);
      }
      readBusinessMessage(t, r, n, s) {
        return this.raw.readBusinessMessage(
          { business_connection_id: t, chat_id: r, message_id: n },
          s,
        );
      }
      setPassportDataErrors(t, r, n) {
        return this.raw.setPassportDataErrors({ user_id: t, errors: r }, n);
      }
      sendGame(t, r, n, s) {
        return this.raw.sendGame({ chat_id: t, game_short_name: r, ...n }, s);
      }
      setGameScore(t, r, n, s, o, i) {
        return this.raw.setGameScore({ chat_id: t, message_id: r, user_id: n, score: s, ...o }, i);
      }
      setGameScoreInline(t, r, n, s, o) {
        return this.raw.setGameScore({ inline_message_id: t, user_id: r, score: n, ...s }, o);
      }
      getGameHighScores(t, r, n, s) {
        return this.raw.getGameHighScores({ chat_id: t, message_id: r, user_id: n }, s);
      }
      getGameHighScoresInline(t, r, n) {
        return this.raw.getGameHighScores({ inline_message_id: t, user_id: r }, n);
      }
    }),
      (Ft = ct("grammy:bot")),
      (Gb = ct("grammy:warn")),
      (gn = ct("grammy:error")),
      (Ga = [
        "message",
        "edited_message",
        "channel_post",
        "edited_channel_post",
        "business_connection",
        "business_message",
        "edited_business_message",
        "deleted_business_messages",
        "inline_query",
        "chosen_inline_result",
        "callback_query",
        "shipping_query",
        "pre_checkout_query",
        "purchased_paid_media",
        "poll",
        "poll_answer",
        "my_chat_member",
        "chat_join_request",
        "chat_boost",
        "removed_chat_boost",
      ]),
      ($o = class extends se {
        token;
        pollingRunning;
        pollingAbortController;
        lastTriedUpdateId;
        api;
        me;
        mePromise;
        clientConfig;
        ContextConstructor;
        observedUpdateTypes;
        errorHandler;
        constructor(t, r) {
          if (
            (super(),
            (this.token = t),
            (this.pollingRunning = !1),
            (this.lastTriedUpdateId = 0),
            (this.observedUpdateTypes = new Set()),
            (this.errorHandler = async (n) => {
              throw (
                console.error(
                  "Error in middleware while handling update",
                  n.ctx?.update?.update_id,
                  n.error,
                ),
                console.error("No error handler was set!"),
                console.error("Set your own error handler with `bot.catch = ...`"),
                this.pollingRunning && (console.error("Stopping bot"), await this.stop()),
                n
              );
            }),
            !t)
          )
            throw new Error("Empty token!");
          ((this.me = r?.botInfo),
            (this.clientConfig = r?.client),
            (this.ContextConstructor = r?.ContextConstructor ?? ot),
            (this.api = new it(t, this.clientConfig)));
        }
        set botInfo(t) {
          this.me = t;
        }
        get botInfo() {
          if (this.me === void 0)
            throw new Error(
              "Bot information unavailable! Make sure to call `await bot.init()` before accessing `bot.botInfo`!",
            );
          return this.me;
        }
        on(t, ...r) {
          for (let [n] of fd(t).flatMap(gd)) this.observedUpdateTypes.add(n);
          return super.on(t, ...r);
        }
        reaction(t, ...r) {
          return (this.observedUpdateTypes.add("message_reaction"), super.reaction(t, ...r));
        }
        isInited() {
          return this.me !== void 0;
        }
        async init(t) {
          if (!this.isInited()) {
            (Ft("Initializing bot"), (this.mePromise ??= pd(() => this.api.getMe(t), t)));
            let r;
            try {
              r = await this.mePromise;
            } finally {
              this.mePromise = void 0;
            }
            this.me === void 0 ? (this.me = r) : Ft("Bot info was set by now, will not overwrite");
          }
          Ft(`I am ${this.me.username}!`);
        }
        async handleUpdates(t) {
          for (let r of t) {
            this.lastTriedUpdateId = r.update_id;
            try {
              await this.handleUpdate(r);
            } catch (n) {
              if (n instanceof os) await this.errorHandler(n);
              else throw (console.error("FATAL: grammY unable to handle:", n), n);
            }
          }
        }
        async handleUpdate(t, r) {
          if (this.me === void 0)
            throw new Error(
              "Bot not initialized! Either call `await bot.init()`, or directly set the `botInfo` option in the `Bot` constructor to specify a known bot info object.",
            );
          Ft(`Processing update ${t.update_id}`);
          let n = new it(this.token, this.clientConfig, r),
            s = this.api.config.installedTransformers();
          s.length > 0 && n.config.use(...s);
          let o = new this.ContextConstructor(t, n, this.me);
          try {
            await wd(this.middleware(), o);
          } catch (i) {
            throw (gn(`Error in middleware for update ${t.update_id}`), new os(i, o));
          }
        }
        async start(t) {
          let r = [];
          if (
            (this.isInited() || r.push(this.init(this.pollingAbortController?.signal)),
            this.pollingRunning)
          ) {
            (await Promise.all(r), Ft("Simple long polling already running!"));
            return;
          }
          ((this.pollingRunning = !0), (this.pollingAbortController = new AbortController()));
          try {
            (r.push(
              pd(async () => {
                await this.api.deleteWebhook(
                  { drop_pending_updates: t?.drop_pending_updates },
                  this.pollingAbortController?.signal,
                );
              }, this.pollingAbortController?.signal),
            ),
              await Promise.all(r),
              await t?.onStart?.(this.botInfo));
          } catch (n) {
            throw ((this.pollingRunning = !1), (this.pollingAbortController = void 0), n);
          }
          this.pollingRunning &&
            (Fb(this.observedUpdateTypes, t?.allowed_updates),
            (this.use = $b),
            Ft("Starting simple long polling"),
            await this.loop(t),
            Ft("Middleware is done running"));
        }
        async stop() {
          if (this.pollingRunning) {
            (Ft("Stopping bot, saving update offset"),
              (this.pollingRunning = !1),
              this.pollingAbortController?.abort());
            let t = this.lastTriedUpdateId + 1;
            await this.api
              .getUpdates({ offset: t, limit: 1 })
              .finally(() => (this.pollingAbortController = void 0));
          } else Ft("Bot is not running!");
        }
        isRunning() {
          return this.pollingRunning;
        }
        catch(t) {
          this.errorHandler = t;
        }
        async loop(t) {
          let r = t?.limit,
            n = t?.timeout ?? 30,
            s = t?.allowed_updates ?? [];
          try {
            for (; this.pollingRunning;) {
              let o = await this.fetchUpdates({ limit: r, timeout: n, allowed_updates: s });
              if (o === void 0) break;
              (await this.handleUpdates(o), (s = void 0));
            }
          } finally {
            this.pollingRunning = !1;
          }
        }
        async fetchUpdates({ limit: t, timeout: r, allowed_updates: n }) {
          let s = this.lastTriedUpdateId + 1,
            o;
          do
            try {
              o = await this.api.getUpdates(
                { offset: s, limit: t, timeout: r, allowed_updates: n },
                this.pollingAbortController?.signal,
              );
            } catch (i) {
              await this.handlePollingError(i);
            }
          while (o === void 0 && this.pollingRunning);
          return o;
        }
        async handlePollingError(t) {
          if (!this.pollingRunning) {
            Ft("Pending getUpdates request cancelled");
            return;
          }
          let r = 3;
          if (t instanceof is) {
            if ((gn(t.message), t.error_code === 401 || t.error_code === 409)) throw t;
            t.error_code === 429 &&
              (gn("Bot API server is closing."), (r = t.parameters.retry_after ?? r));
          } else gn(t);
          (gn(`Call to getUpdates failed, retrying in ${r} seconds ...`), await Na(r));
        }
      }));
    ((Lb = [...Ga, "chat_member", "message_reaction", "message_reaction_count"]),
      (Db = {
        can_send_messages: !0,
        can_send_audios: !0,
        can_send_documents: !0,
        can_send_photos: !0,
        can_send_videos: !0,
        can_send_video_notes: !0,
        can_send_voice_notes: !0,
        can_send_polls: !0,
        can_send_other_messages: !0,
        can_add_web_page_previews: !0,
        can_change_info: !0,
        can_invite_users: !0,
        can_edit_tag: !0,
        can_pin_messages: !0,
        can_manage_topics: !0,
      }),
      (Ub = { DEFAULT_UPDATE_TYPES: Ga, ALL_UPDATE_TYPES: Lb, ALL_CHAT_PERMISSIONS: Db }));
    Object.freeze(Ub);
    F = class e {
      inline_keyboard;
      constructor(t = [[]]) {
        this.inline_keyboard = t;
      }
      add(...t) {
        return (this.inline_keyboard[this.inline_keyboard.length - 1]?.push(...t), this);
      }
      row(...t) {
        return (this.inline_keyboard.push(t), this);
      }
      url(t, r) {
        return this.add(e.url(t, r));
      }
      static url(t, r) {
        return typeof t == "string" ? { text: t, url: r } : { ...t, url: r };
      }
      text(t, r = typeof t == "string" ? t : t.text) {
        return this.add(e.text(t, r));
      }
      static text(t, r = typeof t == "string" ? t : t.text) {
        return typeof t == "string" ? { text: t, callback_data: r } : { ...t, callback_data: r };
      }
      webApp(t, r) {
        return this.add(e.webApp(t, r));
      }
      static webApp(t, r) {
        let n = typeof r == "string" ? { url: r } : r;
        return typeof t == "string" ? { text: t, web_app: n } : { ...t, web_app: n };
      }
      login(t, r) {
        return this.add(e.login(t, r));
      }
      static login(t, r) {
        let n = typeof r == "string" ? { url: r } : r;
        return typeof t == "string" ? { text: t, login_url: n } : { ...t, login_url: n };
      }
      switchInline(t, r = "") {
        return this.add(e.switchInline(t, r));
      }
      static switchInline(t, r = "") {
        return typeof t == "string"
          ? { text: t, switch_inline_query: r }
          : { ...t, switch_inline_query: r };
      }
      switchInlineCurrent(t, r = "") {
        return this.add(e.switchInlineCurrent(t, r));
      }
      static switchInlineCurrent(t, r = "") {
        return typeof t == "string"
          ? { text: t, switch_inline_query_current_chat: r }
          : { ...t, switch_inline_query_current_chat: r };
      }
      switchInlineChosen(t, r = {}) {
        return this.add(e.switchInlineChosen(t, r));
      }
      static switchInlineChosen(t, r = {}) {
        return typeof t == "string"
          ? { text: t, switch_inline_query_chosen_chat: r }
          : { ...t, switch_inline_query_chosen_chat: r };
      }
      copyText(t, r) {
        return this.add(e.copyText(t, r));
      }
      static copyText(t, r) {
        let n = typeof r == "string" ? { text: r } : r;
        return typeof t == "string" ? { text: t, copy_text: n } : { ...t, copy_text: n };
      }
      game(t) {
        return this.add(e.game(t));
      }
      static game(t) {
        let r = {};
        return typeof t == "string" ? { text: t, callback_game: r } : { ...t, callback_game: r };
      }
      pay(t) {
        return this.add(e.pay(t));
      }
      static pay(t) {
        return typeof t == "string" ? { text: t, pay: !0 } : { ...t, pay: !0 };
      }
      style(t) {
        let r = this.inline_keyboard.length;
        if (r === 0) throw new Error("Need to add a button before applying a style!");
        let n = this.inline_keyboard[r - 1],
          s = n.length;
        if (s === 0) throw new Error("Need to add a button before applying a style!");
        return ((n[s - 1].style = t), this);
      }
      danger() {
        return this.style("danger");
      }
      success() {
        return this.style("success");
      }
      primary() {
        return this.style("primary");
      }
      icon(t) {
        let r = this.inline_keyboard.length;
        if (r === 0) throw new Error("Need to add a button before adding an icon!");
        let n = this.inline_keyboard[r - 1],
          s = n.length;
        if (s === 0) throw new Error("Need to add a button before adding an icon!");
        return ((n[s - 1].icon_custom_emoji_id = t), this);
      }
      toTransposed() {
        let t = this.inline_keyboard,
          r = Bb(t);
        return new e(r);
      }
      toFlowed(t, r = {}) {
        let n = this.inline_keyboard,
          s = jb(n, t, r);
        return new e(s);
      }
      clone() {
        return new e(this.inline_keyboard.map((t) => t.slice()));
      }
      append(...t) {
        for (let r of t) {
          let n = e.from(r);
          this.inline_keyboard.push(...n.inline_keyboard.map((s) => s.slice()));
        }
        return this;
      }
      static from(t) {
        return t instanceof e ? t.clone() : new e(t.map((r) => r.slice()));
      }
    };
    ((EI = ct("grammy:session")),
      (Je = "X-Telegram-Bot-Api-Secret-Token"),
      (Lo = Je.toLowerCase()),
      (er = "secret token is wrong"),
      (Tn = () => new Response(null, { status: 200 })),
      (kn = (e) =>
        new Response(e, { status: 200, headers: { "Content-Type": "application/json" } })),
      (En = () => new Response('"unauthorized"', { status: 401, statusText: er })),
      (Wb = (e, t, r) => ({
        get update() {
          return JSON.parse(e.body ?? "{}");
        },
        header: e.headers[Je],
        end: () => r(null, { statusCode: 200 }),
        respond: (n) =>
          r(null, { statusCode: 200, headers: { "Content-Type": "application/json" }, body: n }),
        unauthorized: () => r(null, { statusCode: 401 }),
      })),
      (qb = (e, t) => {
        let r;
        return {
          get update() {
            return JSON.parse(e.body ?? "{}");
          },
          header: e.headers[Je],
          end: () => r({ statusCode: 200 }),
          respond: (n) =>
            r({ statusCode: 200, headers: { "Content-Type": "application/json" }, body: n }),
          unauthorized: () => r({ statusCode: 401 }),
          handlerReturn: new Promise((n) => (r = n)),
        };
      }),
      (Kb = (e, t) => ({
        get update() {
          return t.body;
        },
        header: e.res?.headers?.[Je],
        end: () => (e.res = { status: 200, body: "" }),
        respond: (r) => {
          (e.res?.set?.("Content-Type", "application/json"), e.res?.send?.(r));
        },
        unauthorized: () => {
          e.res?.send?.(401, er);
        },
      })),
      (Hb = (e) => {
        let t;
        return {
          get update() {
            return e.json();
          },
          header: e.headers.get(Je) || void 0,
          end: () => t({ status: 204 }),
          respond: (r) => t({ jsonBody: r }),
          unauthorized: () => t({ status: 401, body: er }),
          handlerReturn: new Promise((r) => (t = r)),
        };
      }),
      (zb = (e) => {
        let t;
        return {
          get update() {
            return e.json();
          },
          header: e.headers.get(Je) || void 0,
          end: () => {
            t(Tn());
          },
          respond: (r) => {
            t(kn(r));
          },
          unauthorized: () => {
            t(En());
          },
          handlerReturn: new Promise((r) => (t = r)),
        };
      }),
      (Qb = (e) => {
        let t;
        return (
          e.respondWith(
            new Promise((r) => {
              t = r;
            }),
          ),
          {
            get update() {
              return e.request.json();
            },
            header: e.request.headers.get(Je) || void 0,
            end: () => {
              t(Tn());
            },
            respond: (r) => {
              t(kn(r));
            },
            unauthorized: () => {
              t(En());
            },
          }
        );
      }),
      (Vb = (e) => {
        let t;
        return {
          get update() {
            return e.json();
          },
          header: e.headers.get(Je) || void 0,
          end: () => {
            t(Tn());
          },
          respond: (r) => {
            t(kn(r));
          },
          unauthorized: () => {
            t(En());
          },
          handlerReturn: new Promise((r) => (t = r)),
        };
      }),
      (Jb = (e, t) => ({
        get update() {
          return e.body;
        },
        header: e.header(Je),
        end: () => t.end(),
        respond: (r) => {
          (t.set("Content-Type", "application/json"), t.send(r));
        },
        unauthorized: () => {
          t.status(401).send(er);
        },
      })),
      (Yb = (e, t) => ({
        get update() {
          return e.body;
        },
        header: e.headers[Lo],
        end: () => t.send(""),
        respond: (r) => t.headers({ "Content-Type": "application/json" }).send(r),
        unauthorized: () => t.code(401).send(er),
      })),
      (Xb = (e) => {
        let t;
        return {
          get update() {
            return e.req.json();
          },
          header: e.req.header(Je),
          end: () => {
            t(e.body(""));
          },
          respond: (r) => {
            t(e.json(r));
          },
          unauthorized: () => {
            (e.status(401), t(e.body("")));
          },
          handlerReturn: new Promise((r) => (t = r)),
        };
      }),
      (md = (e, t) => {
        let r = e.headers[Lo];
        return {
          get update() {
            return new Promise((n, s) => {
              let o = [];
              e.on("data", (i) => o.push(i))
                .once("end", () => {
                  let i = Buffer.concat(o).toString("utf-8");
                  try {
                    n(JSON.parse(i));
                  } catch (a) {
                    s(a);
                  }
                })
                .once("error", s);
            });
          },
          header: Array.isArray(r) ? r[0] : r,
          end: () => t.end(),
          respond: (n) => t.writeHead(200, { "Content-Type": "application/json" }).end(n),
          unauthorized: () => t.writeHead(401).end(er),
        };
      }),
      (Zb = (e) => ({
        get update() {
          return e.request.body;
        },
        header: e.get(Je) || void 0,
        end: () => {
          e.body = "";
        },
        respond: (t) => {
          (e.set("Content-Type", "application/json"), (e.response.body = t));
        },
        unauthorized: () => {
          e.status = 401;
        },
      })),
      (ey = (e, t) => ({
        get update() {
          return e.body;
        },
        header: e.headers[Lo],
        end: () => t.end(),
        respond: (r) => t.status(200).json(r),
        unauthorized: () => t.status(401).send(er),
      })),
      (ty = (e) => ({
        get update() {
          return e.body;
        },
        header: e.headers.get(Je) || void 0,
        end: () => e.response.sendStatus(200),
        respond: (t) => e.response.status(200).send(t),
        unauthorized: () => e.response.status(401).send(er),
      })),
      (ry = (e) => ({
        get update() {
          return e.request.body.json();
        },
        header: e.request.headers.get(Je) || void 0,
        end: () => {
          e.response.status = 200;
        },
        respond: (t) => {
          ((e.response.type = "json"), (e.response.body = t));
        },
        unauthorized: () => {
          e.response.status = 401;
        },
      })),
      (ny = (e) => ({
        get update() {
          return e.request.json();
        },
        header: e.request.headers.get(Je) || void 0,
        end: () => e.respondWith(Tn()),
        respond: (t) => e.respondWith(kn(t)),
        unauthorized: () => e.respondWith(En()),
      })),
      (sy = (e) => {
        let t;
        return {
          get update() {
            return e.json();
          },
          header: e.headers.get(Je) || void 0,
          end: () => {
            t && t(Tn());
          },
          respond: (r) => {
            t && t(kn(r));
          },
          unauthorized: () => {
            t && t(En());
          },
          handlerReturn: new Promise((r) => (t = r)),
        };
      }),
      (oy = ({ request: e }) => {
        let t;
        return {
          get update() {
            return e.json();
          },
          header: e.headers.get(Je) || void 0,
          end: () => {
            t && t(Tn());
          },
          respond: (r) => {
            t && t(kn(r));
          },
          unauthorized: () => {
            t && t(En());
          },
          handlerReturn: new Promise((r) => (t = r)),
        };
      }),
      (iy = (e, t) => ({
        get update() {
          return e.json();
        },
        header: e.headers.get(Je) ?? void 0,
        end: () => t.end(null),
        respond: (r) => t.send(200, r),
        unauthorized: () => t.send(401, er),
      })),
      (ay = (e) => {
        let t;
        return {
          get update() {
            return e.body;
          },
          header: e.headers[Lo],
          end() {
            t("");
          },
          respond(r) {
            ((e.set.headers["content-type"] = "application/json"), t(r));
          },
          unauthorized() {
            ((e.set.status = 401), t(""));
          },
          handlerReturn: new Promise((r) => (t = r)),
        };
      }),
      (ly = {
        "aws-lambda": Wb,
        "aws-lambda-async": qb,
        azure: Kb,
        "azure-v4": Hb,
        bun: zb,
        cloudflare: Qb,
        "cloudflare-mod": Vb,
        elysia: ay,
        express: Jb,
        fastify: Yb,
        hono: Xb,
        http: md,
        https: md,
        koa: Zb,
        "next-js": ey,
        nhttp: ty,
        oak: ry,
        serveHttp: ny,
        "std/http": sy,
        sveltekit: oy,
        worktop: iy,
      }),
      (SI = ct("grammy:error")),
      (uy = (e, t, r, n = () => t('"unauthorized"')) => ({
        update: Promise.resolve(e),
        respond: t,
        header: r,
        unauthorized: n,
      })),
      (II = { ...ly, callback: uy }));
  });
function cy(e) {
  return Object.hasOwn(Fd, e);
}
function dy(e) {
  return cy(e) ? (Fd[e] ?? "") : "";
}
function $d(e) {
  return e.length <= Md ? e : `${e.slice(0, Md - 1)}\u2026`;
}
function Ld(e) {
  return e.length <= Gd ? e : `${e.slice(0, Gd - 1)}\u2026`;
}
function Dd(e, t) {
  let r = new F(),
    n = e.slice(0, Kr);
  for (let { number: s, title: o } of n) r.text(`#${s} ${$d(o)}`, `${t}:${s}`).row();
  return r;
}
function Do(e) {
  return Dd(e, "switch_issue");
}
function Ud(e) {
  return Dd(e, "close_issue_prompt");
}
function Bd(e) {
  return new F()
    .text(t("kb.confirmClose", {}, glang()), `close_issue_confirm:${e}`)
    .row()
    .text(
      t("kb.closeCancel", {}, glang()),
      `close_issue_cancel:${e}`,
    );
}
function jd(e) {
  let t = dy(e);
  return t
    ? new F()
        .text(`\u2705 \u4FDD\u7559${t}`, `edit_keep_field:${e}`)
        .row()
        .text(t("kb.cancel", {}, glang()), "new_flow_cancel:current")
    : new F();
}
function Wd() {
  return new F()
    .text(t("kb.enableSlash", {}, glang()), "edit_workflow_enabled:true")
    .row()
    .text(t("kb.disableSlash", {}, glang()), "edit_workflow_enabled:false")
    .row()
    .text(
      t("kb.keepCurrentSettings", {}, glang()),
      "edit_keep_field:awaiting_workflow_enabled",
    )
    .row()
    .text(t("kb.cancel", {}, glang()), "new_flow_cancel:current");
}
function La() {
  return new F()
    .text(t("kb.skip", {}, glang()), "edit_template_reset:skip")
    .row()
    .text(t("kb.cancel", {}, glang()), "new_flow_cancel:current");
}
function Uo(e) {
  let t = new F(),
    r = e.slice(0, Kr);
  for (let n of r) t.text(`\u{1F504} ${n}`, `new_template_select:${n}`).row();
  return (
    t.text(t("kb.skip", {}, glang()), "edit_template_reset:skip").row(),
    t.text(t("kb.cancel", {}, glang()), "new_flow_cancel:current"),
    t
  );
}
function Da(e = []) {
  let t = new F(),
    r = e.slice(0, Kr);
  for (let n = 0; n < r.length; n += Od) {
    let s = r.slice(n, n + Od);
    for (let o = 0; o < s.length; o += 1) {
      let i = s[o],
        a = n + o,
        l = typeof i.label == "string" ? i.label.trim() : "";
      l && t.text($d(l), `templates_model_pick:${a}`);
    }
    t.row();
  }
  return t;
}
function Ua(e) {
  let t = new F(),
    r = e.slice(0, Kr);
  for (let n = 0; n < r.length; n += 2)
    (t.text(`\u{1F4E6} ${r[n]}`, `new_template_select:${r[n]}`),
      n + 1 < r.length && t.text(`\u{1F4E6} ${r[n + 1]}`, `new_template_select:${r[n + 1]}`),
      t.row());
  return t;
}
function Ba(e) {
  return new F()
    .text(t("kb.setSchedule", {}, glang()), `set_schedule:${e}`)
    .text(t("kb.manageSchedule", {}, glang()), `manage_schedule:${e}`);
}
function qd(e) {
  return new F()
    .text(t("kb.setSchedule", {}, glang()), `set_schedule:${e}`)
    .text(t("kb.manageSchedule", {}, glang()), `manage_schedule:${e}`)
    .row()
    .text(t("kb.edit", {}, glang()), `current_edit:${e}`)
    .text(t("kb.resetTemplate", {}, glang()), `current_template_reset:${e}`)
    .row()
    .text(t("kb.skillsManage", {}, glang()), "command_menu_skills");
}
function Kd(e, t) {
  let r = new F(),
    n = t.slice(0, Kr);
  for (let s of n) r.text(`\u{1F504} ${s}`, `template_reset_select:${e}:${s}`).row();
  return (r.text(t("kb.cancel", {}, glang()), `template_reset_cancel:${e}`), r);
}
function tr() {
  return new F().text(t("kb.cancelSetup", {}, glang()), "schedule_flow_cancel:current");
}
function Bo() {
  return new F()
    .text("\u23ED\uFE0F \u7565\u904E", "schedule_payload_skip:current")
    .row()
    .text(t("kb.cancelSetup", {}, glang()), "schedule_flow_cancel:current");
}
function ja(e = [], t) {
  let r = new F(),
    n = e.slice(0, Kr);
  for (let s of n) {
    let o = Ld(s.buttonLabel || s.id || t("kb.scheduleFallbackName", {}, glang()));
    r.text(o, `schedule_open:${s.id}`).row();
  }
  return (r.text(t("kb.newSchedule", {}, glang()), `set_schedule:${t}`), r);
}
function Hd(e = []) {
  let t = new F(),
    r = e.slice(0, Kr);
  for (let n of r) {
    let s = Ld(n.buttonLabel || `#${n.issueNumber} ${n.id}`);
    t.text(s, `schedule_chat_open:${n.id}`).row();
  }
  return t;
}
function jo(e, t, r, n = {}) {
  let s = n.editPromptCallbackData || `schedule_edit_prompt:${e}`,
    o = n.editTimeCallbackData || `schedule_edit_time:${e}`,
    i = n.editPayloadCallbackData || `schedule_edit_payload:${e}`,
    a = n.toggleCallbackData || `schedule_toggle:${e}`,
    l = n.deleteCallbackData || `schedule_delete:${e}`,
    c = n.backCallbackData || `manage_schedule:${t}`,
    d = n.backText || t("kb.backToScheduleList", {}, glang());
  return new F()
    .text(t("kb.changeTask", {}, glang()), s)
    .text(t("kb.changeTime", {}, glang()), o)
    .row()
    .text(t("kb.changePayload", {}, glang()), i)
    .text(r ? t("kb.pause", {}, glang()) : t("kb.enable", {}, glang()), a)
    .row()
    .text(t("kb.delete", {}, glang()), l)
    .row()
    .text(d, c);
}
function zd(e, t, r = !0) {
  return jo(e, t, r, {
    editPromptCallbackData: `schedule_edit_prompt:${e}|chat`,
    editTimeCallbackData: `schedule_edit_time:${e}|chat`,
    editPayloadCallbackData: `schedule_edit_payload:${e}|chat`,
    toggleCallbackData: `schedule_toggle:${e}|chat`,
    deleteCallbackData: `schedule_delete:${e}|chat`,
    backCallbackData: "schedule_chat_list:current",
    backText: t("kb.backToAllSchedules", {}, glang()),
  });
}
function Qd(e) {
  return new F()
    .text(t("kb.delete", {}, glang()), `schedule_delete:${e}|chat`)
    .row()
    .text(t("kb.backToAllSchedules", {}, glang()), "schedule_chat_list:current");
}
function as(e, t = 0, r) {
  let n = new F();
  if (!Array.isArray(e) || e.length === 0)
    return (n.text(t("kb.cancel", {}, glang()), "skills_cancel:0"), n);
  let s = t * Fa,
    o = e.slice(s, s + Fa);
  for (let l = 0; l < o.length; l += Nd) {
    let c = o.slice(l, l + Nd);
    for (let { name: d } of c) {
      let m = r?.has(d) ? `\u{1F4E6} ${d} \u2705` : `\u{1F4E6} ${d}`;
      n.text(m, `skills_pick:${d}`);
    }
    n.row();
  }
  let i = t > 0,
    a = s + Fa < e.length;
  return (
    i && n.text(t("kb.prevPage", {}, glang()), `skills_page:${t - 1}`),
    a && n.text(t("kb.nextPage", {}, glang()), `skills_page:${t + 1}`),
    (i || a) && n.row(),
    n.text(t("kb.cancel", {}, glang()), "skills_cancel:0"),
    n
  );
}
function Vd(e) {
  return new F()
    .text(t("kb.confirmInstall", {}, glang()), `skills_preview_confirm:${e}`)
    .row()
    .text(t("kb.backOneStep", {}, glang()), "skills_preview_back:0")
    .row()
    .text(t("kb.cancel", {}, glang()), "skills_cancel:0");
}
function Jd(e) {
  return new F()
    .text(t("kb.overwriteInstall", {}, glang()), `skills_overwrite:${e}`)
    .text(t("kb.cancel", {}, glang()), "skills_cancel:0");
}
function Wo(e) {
  return new F()
    .text(t("kb.install", {}, glang()), `skills_confirm:${e}`)
    .text(t("kb.cancel", {}, glang()), "skills_cancel:0");
}
function Yd() {
  return new F()
    .text(t("kb.reuseExistingValue", {}, glang()), "skills_existing_secret:reuse")
    .row()
    .text(t("kb.reenterValue", {}, glang()), "skills_existing_secret:modify")
    .row()
    .text(t("kb.cancel", {}, glang()), "skills_cancel:0");
}
function ls() {
  return new F().text(t("kb.cancel", {}, glang()), "skills_cancel:0");
}
function Wa(e) {
  return new F()
    .text(t("kb.removeFromList", {}, glang()), `skills_remove_from_list:${e}`)
    .text(t("kb.updateFromList", {}, glang()), `skills_update_from_list:${e}`)
    .row()
    .text("\u{1F519} \u4E0A\u4E00\u6B65", "skills_preview_back:0");
}
function Xd(e) {
  return new F()
    .text(t("kb.confirmRemove", {}, glang()), `skills_remove_confirm_from_list:${e}`)
    .row()
    .text("\u{1F519} \u4E0A\u4E00\u6B65", `skills_remove_back:${e}`);
}
function us(e, t = 0, r) {
  let n = new F();
  if (!Array.isArray(e) || e.length === 0)
    return (n.text(t("kb.cancel", {}, glang()), "templates_cancel:0"), n);
  let s = t * $a,
    o = e.slice(s, s + $a);
  for (let l = 0; l < o.length; l += 2) {
    let c = s + l,
      d = o[l].name,
      m = r?.has(d) ? `\u{1F4E6} ${d} \u2705` : `\u{1F4E6} ${d}`;
    if ((n.text(m, `templates_pick:${c}`), l + 1 < o.length)) {
      let w = s + l + 1,
        y = o[l + 1].name,
        _ = r?.has(y) ? `\u{1F4E6} ${y} \u2705` : `\u{1F4E6} ${y}`;
      n.text(_, `templates_pick:${w}`);
    }
    n.row();
  }
  let i = t > 0,
    a = s + $a < e.length;
  return (
    i && n.text(t("kb.prevPage", {}, glang()), `templates_page:${t - 1}`),
    a && n.text(t("kb.nextPage", {}, glang()), `templates_page:${t + 1}`),
    (i || a) && n.row(),
    n.text(t("kb.cancel", {}, glang()), "templates_cancel:0"),
    n
  );
}
function Zd(e) {
  return new F()
    .text(t("kb.confirmInstall", {}, glang()), "templates_preview_confirm:0")
    .row()
    .text(t("kb.backOneStep", {}, glang()), "templates_preview_back:0")
    .row()
    .text(t("kb.cancel", {}, glang()), "templates_cancel:0");
}
function ep(e) {
  return new F()
    .text(t("kb.overwriteInstall", {}, glang()), "templates_overwrite:0")
    .text(t("kb.cancel", {}, glang()), "templates_cancel:0");
}
function qo(e) {
  return new F()
    .text(t("kb.install", {}, glang()), "templates_confirm:0")
    .text(t("kb.cancel", {}, glang()), "templates_cancel:0");
}
function tp() {
  return new F().text(t("kb.cancel", {}, glang()), "new_flow_cancel:current");
}
function rp() {
  return new F()
    .text(t("kb.setNow", {}, glang()), "templates_env_setup:0")
    .text(t("kb.cancel", {}, glang()), "templates_env_cancel:0");
}
function np() {
  return new F()
    .text(t("kb.resetAll", {}, glang()), "templates_env_resetall:0")
    .text(t("kb.keepAllExisting", {}, glang()), "templates_env_keepall:0");
}
function sp() {
  return new F()
    .text(t("kb.setMissing", {}, glang()), "templates_env_setup:0")
    .row()
    .text("\u{1F504} \u5168\u90E8\u91CD\u65B0\u8A2D\u5B9A", "templates_env_resetall:0")
    .text(t("kb.cancel", {}, glang()), "templates_env_cancel:0");
}
function hr(e = "templates") {
  return new F().text(t("kb.cancelSetup", {}, glang()), `${e}_env_cancel:`);
}
function op() {
  return new F()
    .text("\u{1F916} \u7E7C\u7E8C\u8A2D\u5B9A LINE Bot", "linebot_setup_continue:")
    .text("\u23ED\uFE0F \u4E4B\u5F8C\u518D\u624B\u52D5\u89F8\u767C", "linebot_setup_skip:");
}
function Lt() {
  return new F()
    .text(t("kb.skip", {}, glang()), "linebot_input_skip:")
    .text(t("kb.cancel", {}, glang()), "linebot_deploy_cancel:");
}
function ip() {
  return new F()
    .text("\u{1F680} \u958B\u59CB\u90E8\u7F72", "linebot_deploy_confirm:")
    .text("\u270F\uFE0F \u4FEE\u6539", "linebot_edit_params:")
    .text(t("kb.cancel", {}, glang()), "linebot_deploy_cancel:");
}
function ap() {
  return new F()
    .text("\u{1F916} Bot ID", "linebot_edit:bot_id")
    .text("\u{1F4FA} Channel ID", "linebot_edit:channel_id")
    .row()
    .text("\u{1F4AC} \u9810\u8A2D\u56DE\u61C9", "linebot_edit:reply_msg")
    .text("\u{1F99E} \u5C0F\u9F8D\u8766", "linebot_edit:issue_number")
    .row()
    .text("\u{1F552} \u6642\u5340", "linebot_edit:utc_offset")
    .row()
    .text("\u2B05\uFE0F \u8FD4\u56DE", "linebot_edit_back:");
}
function wr() {
  return new F().text(t("kb.cancel", {}, glang()), "linebot_deploy_cancel:");
}
var Kr,
  Md,
  Od,
  Fa,
  Nd,
  $a,
  Gd,
  Fd,
  Ve = Oe(() => {
    "use strict";
    Ie();
    ((Kr = 20),
      (Md = 40),
      (Od = 2),
      (Fa = 8),
      (Nd = 2),
      ($a = 8),
      (Gd = 36),
      (Fd = Object.freeze({
        awaiting_name: "\u540D\u7A31",
        awaiting_description: "\u63CF\u8FF0",
        awaiting_template: "\u7BC4\u672C",
      })));
  });
async function Ge(e, t) {
  let r = t ? `active-issue:${t}` : "active-issue",
    n = await e.get(r);
  if (n === null) return null;
  let s = Number(n);
  return Number.isFinite(s) && s > 0 ? s : null;
}
async function rr(e, t, r) {
  let n = r ? `active-issue:${r}` : "active-issue";
  await e.put(n, String(t));
}
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE mt] new-flow helpers  —  BUSINESS
// ║ Telegram new Lobster flow helper (new-flow: prefix state)
// ╚══════════════════════════════════════════════════════════════════════════════
var mt = Oe(() => {
  "use strict";
});
function nr(e) {
  return Number.isInteger(e);
}
async function Ke(e, t) {
  if (!nr(t)) return null;
  try {
    let r = await e.get(`${qa}${t}`);
    if (!r) return null;
    let n = JSON.parse(r);
    return (
      console.log("[Telegram new-flow] \u8B80\u53D6\u6D41\u7A0B\u72C0\u614B\u6210\u529F", {
        chatId: t,
        state: n,
      }),
      n
    );
  } catch {
    return (
      console.warn("[Telegram new-flow] \u8B80\u53D6\u6D41\u7A0B\u72C0\u614B\u5931\u6557", {
        chatId: t,
      }),
      null
    );
  }
}
async function Be(e, t, r) {
  nr(t) &&
    (console.log("[Telegram new-flow] \u5BEB\u5165\u6D41\u7A0B\u72C0\u614B", {
      chatId: t,
      state: r,
      ttlSeconds: "infinity",
    }),
    await e.put(`${qa}${t}`, JSON.stringify(r)));
}
async function Dt(e, t) {
  nr(t) &&
    (console.log("[Telegram new-flow] \u6E05\u9664\u6D41\u7A0B\u72C0\u614B", { chatId: t }),
    await e.delete(`${qa}${t}`));
}
async function sr(e, t) {
  if (!nr(t)) return null;
  try {
    let r = await e.get(`${Ka}${t}`);
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}
async function Hr(e, t, r) {
  nr(t) && (await e.put(`${Ka}${t}`, JSON.stringify(r)));
}
async function Ye(e, t) {
  nr(t) && (await e.delete(`${Ka}${t}`));
}
function lp(e) {
  return e === "list" || e === "close";
}
function up(e) {
  return Number.isInteger(e) && e > 0;
}
function Ha(e) {
  return `${py}${e}`;
}
async function cp(e, t) {
  if (!nr(t)) return null;
  try {
    let r = await e.get(Ha(t));
    if (!r) return null;
    let n = JSON.parse(r);
    if (n && lp(n.mode) && up(n.messageId)) return { mode: n.mode, messageId: n.messageId };
  } catch {
    return null;
  }
  return null;
}
async function Sn(e, t, r) {
  !nr(t) || !lp(r.mode) || !up(r.messageId) || (await e.put(Ha(t), JSON.stringify(r)));
}
async function Ut(e, t) {
  nr(t) && (await e.delete(Ha(t)));
}
var qa,
  Ka,
  py,
  ft = Oe(() => {
    "use strict";
    qa = "new-flow:";
    Ka = "schedule-flow:";
    py = "menu-state:";
  });
function O(e) {
  return e.replace(my, "\\$1");
}
function dp(e) {
  return e.replace(/([`\\])/g, "\\$1");
}
function Qa(e) {
  return e.replace(/([)\\])/g, "\\$1");
}
function or(e) {
  if (typeof e != "string" || !e.trim()) return "";
  let t = [],
    r = e.replace(/```(\w*)\n?([\s\S]*?)```/g, (l, c, d) => {
      let m = t.length;
      return (
        t.push(`\`\`\`${c}
${dp(d)}\`\`\``),
        `\0C${m}\0`
      );
    }),
    n = [];
  r = r.replace(/`([^`\n]+)`/g, (l, c) => {
    let d = n.length;
    return (n.push(`\`${dp(c)}\``), `\0I${d}\0`);
  });
  let s = [];
  r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (l, c, d) => {
    let m = s.length;
    return (s.push({ text: c, url: d }), `\0L${m}\0`);
  });
  let o = [];
  r = r.replace(/\*\*(.+?)\*\*/g, (l, c) => {
    let d = o.length;
    return (o.push(c), `\0B${d}\0`);
  });
  let i = [];
  r = r.replace(/~~(.+?)~~/g, (l, c) => {
    let d = i.length;
    return (i.push(c), `\0S${d}\0`);
  });
  let a = [];
  return (
    (r = r
      .split(
        `
`,
      )
      .map((l) => {
        let c = l.match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/);
        if (c) {
          let m = a.length;
          return (a.push(c[1]), `\0H${m}\0`);
        }
        let d = l.match(/^(\s*)[-*+]\s+(.*)$/);
        if (d) {
          let m = d[1] ?? "",
            w = d[2] ?? "";
          return `${m}\u2022 ${w}`;
        }
        return l;
      }).join(`
`)),
    (r = O(r)),
    (r = r.replace(/\x00H(\d+)\x00/g, (l, c) => `*${O(a[Number(c)])}*`)),
    (r = r.replace(/\x00S(\d+)\x00/g, (l, c) => `~${O(i[Number(c)])}~`)),
    (r = r.replace(/\x00B(\d+)\x00/g, (l, c) => `*${O(o[Number(c)])}*`)),
    (r = r.replace(/\x00L(\d+)\x00/g, (l, c) => {
      let d = s[Number(c)];
      return `[${O(d.text)}](${Qa(d.url)})`;
    })),
    (r = r.replace(/\x00I(\d+)\x00/g, (l, c) => n[Number(c)])),
    (r = r.replace(/\x00C(\d+)\x00/g, (l, c) => t[Number(c)])),
    r
  );
}
var my,
  Xe = Oe(() => {
    "use strict";
    my = /([_*\[\]()~`>#+=|{}.!\\-])/g;
  });
function br(e, gLang = glang()) {
  let t = e.rulePayload;
  if (e.ruleType === "cron" && typeof t.expression == "string") return mp(t.expression, gLang).description;
  if (e.ruleType === "interval" && typeof t.minutes == "number")
    return t("schedule.minutely", { minutes: t.minutes }, gLang);
  if (e.ruleType === "once" && typeof t.run_at == "string") {
    let o = new Date(t.run_at);
    if (Number.isNaN(o.getTime()))
      return t("schedule.once", {}, gLang);
    return t("schedule.run_at_once", { run_at: o.toLocaleString(gLang === "zh-CN" ? "zh-CN" : "en", { timeZone: "Asia/Taipei" }) }, gLang);
  }
  let r = typeof t.hour == "number" ? String(t.hour).padStart(2, "0") : "??",
    n = typeof t.minute == "number" ? String(t.minute).padStart(2, "0") : "00",
    s = `${r}:${n}`;
  switch (e.ruleType) {
    case "daily":
      return t("schedule.daily", { time: s }, gLang);
    case "hourly": {
      let o = typeof t.interval_hours == "number" ? t.interval_hours : 1;
      return o === 1
        ? t("schedule.hourly", { minute: n }, gLang)
        : t("schedule.hourlyInterval", { hours: o, minute: n }, gLang);
    }
    case "minutely":
      return t("schedule.minutely", { minutes: typeof t.interval_minutes == "number" ? t.interval_minutes : 1 }, gLang);
    case "weekly":
      let weekdays = Array.isArray(t.weekdays) ? t.weekdays.map((i) => t("schedule.weekday_" + i, {}, gLang)) : (typeof t.weekday == "number" ? [t("schedule.weekday_" + t.weekday, {}, gLang)] : ["?"]);
      return t("schedule.weekly", { weekdays: weekdays.join("、"), time: s }, gLang);
    case "weekday":
      return t("schedule.weekday", { time: s }, gLang);
    case "weekenday":
      return t("schedule.weekenday", { time: s }, gLang);
    default:
      return e.ruleType;
  }
}
function cs(e, gLang = glang()) {
  if (e.ruleType === "interval") return t("schedule.interval", {}, gLang);
  if (e.ruleType === "once") return t("schedule.once", {}, gLang);
  if (e.ruleType === "cron") {
    let r = e.rulePayload.expression;
    if (typeof r == "string") return mp(r, gLang).type;
  }
  return (
    {
      daily: t("schedule.daily", {}, gLang),
      hourly: t("schedule.hourly", {}, gLang),
      minutely: t("schedule.interval", {}, gLang),
      weekly: t("schedule.weekly", {}, gLang),
      weekday: t("schedule.weekday", {}, gLang),
      weekenday: t("schedule.weekenday", {}, gLang),
    }[e.ruleType] ?? e.ruleType
  );
}
function pp(e, gLang = glang()) {
  let weekdayNames = [t("schedule.weekday_0", {}, gLang), t("schedule.weekday_1", {}, gLang), t("schedule.weekday_2", {}, gLang), t("schedule.weekday_3", {}, gLang), t("schedule.weekday_4", {}, gLang), t("schedule.weekday_5", {}, gLang), t("schedule.weekday_6", {}, gLang)];
  let match = e.match(/^(\d)-(\d)$/);
  if (match) {
    let startWeekday = weekdayNames[parseInt(match[1])],
      endWeekday = weekdayNames[parseInt(match[2])];
    return t("schedule.weekly", { weekdays: `${startWeekday}-${endWeekday}`, time: "" }, gLang).replace(/\s*\$/, "");
  }
  if (e.includes(","))
    return t("schedule.weekly", { weekdays: e
      .split(",")
      .map((s) => weekdayNames[parseInt(s)])
      .join("、"), time: "" }, gLang).replace(/\s*\$/, "");
  let r = parseInt(e);
  return !isNaN(r) && weekdayNames[r] ? t("schedule.weekly", { weekdays: weekdayNames[r], time: "" }, gLang).replace(/\s*\$/, "") : t("schedule.weekly", { weekdays: e, time: "" }, gLang).replace(/\s*\$/, "");
}
function Ho(e, t) {
  return `${e.padStart(2, "0")}:${t.padStart(2, "0")}`;
}
function wy(e, t, r) {
  let n = e
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  if (n.length === 0 || n.some((o) => !/^\d+$/.test(o))) return null;
  let s = n.map((o) => Number.parseInt(o, 10));
  return s.some((o) => !Number.isInteger(o) || o < t || o > r)
    ? null
    : [...new Set(s)].sort((o, i) => o - i);
}
function Ja(e, t) {
  return e.map((r) => Ho(String(r), t)).join("\u3001");
}
function mp(e, gLang = glang()) {
  let parts = e.trim().split(/\s+/);
  if (parts.length !== 5) return { type: t("schedule.cron_type", {}, gLang), description: e };
  let minute = parts[0],
    hour = parts[1],
    day = parts[2],
    month = parts[3],
    weekday = parts[4],
    daysOfWeek = wy(hour, 0, 23);
  if (minute.startsWith("*/") && hour === "*" && day === "*" && weekday === "*") {
    let interval = parseInt(minute.slice(2));
    return interval === 1
      ? { type: t("schedule.type_minutely", {}, gLang), description: t("schedule.type_minutely", {}, gLang) }
      : { type: t("schedule.type_interval", {}, gLang), description: t("schedule.minutely", { minutes: interval }, gLang) };
  }
  if (/^\d+$/.test(minute) && hour.startsWith("*/") && day === "*" && weekday === "*") {
    let intervalHours = parseInt(hour.slice(2));
    return {
      type: t("schedule.type_interval", {}, gLang),
      description: t("schedule.hourlyInterval", { hours: intervalHours, minute: minute }, gLang),
    };
  }
  if (/^\d+$/.test(minute) && hour === "*" && day === "*" && weekday === "*")
    return {
      type: t("schedule.type_hourly", {}, gLang),
      description:
        minute === "0" ? t("schedule.type_hourly", {}, gLang) : t("schedule.hourly", { minute: minute }, gLang),
    };
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && /^\d+$/.test(day) && weekday === "*") {
    let time = Ho(hour, minute);
    return { type: t("schedule.type_monthly", {}, gLang), description: t("schedule.daily", { time: time }, gLang) };
  }
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && day === "*" && weekday !== "*") {
    let time = Ho(hour, minute);
    return { type: t("schedule.type_weekly", {}, gLang), description: t("schedule.weekly", { weekdays: pp(weekday, gLang), time: time }, gLang) };
  }
  return /^\d+$/.test(minute) && daysOfWeek && daysOfWeek.length > 1 && day === "*" && weekday !== "*"
    ? { type: t("schedule.type_weekly", {}, gLang), description: t("schedule.weekly", { weekdays: pp(weekday, gLang), time: Ja(daysOfWeek, minute) }, gLang) }
    : /^\d+$/.test(minute) && /^\d+$/.test(hour) && day === "*" && weekday === "*"
      ? { type: t("schedule.type_daily", {}, gLang), description: t("schedule.daily", { time: Ho(hour, minute) }, gLang) }
      : /^\d+$/.test(minute) && daysOfWeek && daysOfWeek.length > 1 && day === "*" && weekday === "*"
        ? { type: t("schedule.type_daily", {}, gLang), description: t("schedule.daily", { time: Ja(daysOfWeek, minute) }, gLang) }
        : /^\d+$/.test(minute) && daysOfWeek && daysOfWeek.length > 1 && /^\d+$/.test(day) && weekday === "*"
          ? { type: t("schedule.type_monthly", {}, gLang), description: t("schedule.monthly", { day: parseInt(day), time: Ja(daysOfWeek, minute) }, gLang) }
          : { type: t("schedule.cron_type", {}, gLang), description: e };
}
function Bt(e, gLang = glang()) {
  let date = new Date(e);
  return Number.isNaN(date.getTime()) ? e : date.toLocaleString(gLang === "zh-CN" ? "zh-CN" : "en", { timeZone: "Asia/Taipei" });
}
var zr,
  xs = Oe(() => {
    "use strict";
    zr = ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"];
  });
function gp(e) {
  let t = ["\u2139\uFE0F \u5C0F\u9F8D\u8766\u8CC7\u8A0A", _y(e)];
  return (
    t.push(
      "",
      "\u{1F916} \u4F7F\u7528\u6A21\u578B",
      ...Ty(e),
      "",
      "\u{1F4C4} \u5DF2\u5957\u7528\u7BC4\u672C",
      O(e.templateName?.trim() || "\u7121"),
      "",
      "\u{1F9E9} \u5DF2\u5B89\u88DD\u6280\u80FD",
      ...ky(e.skills),
      "",
      "\u23F0 \u5DF2\u8A2D\u5B9A\u6392\u7A0B",
      ...Ey(e.schedules.items),
      "",
      "\u2692\uFE0F \u4EFB\u52D9\u57F7\u884C\u72C0\u614B",
      ...Sy(e.workflow),
    ),
    t.join(`
`)
  );
}
function _y(e) {
  let t = e.issue.title?.trim();
  return t ? `\\#${e.issue.number} ${O(t)}` : `\\#${e.issue.number}`;
}
function Ty(e, gLang = glang()) {
  let t = e.models.sources.filter((r) => r.model?.trim());
  return t.length === 0
    ? [ps(e.models.fallbackLabel || t("schedule.workflow_defined_label", {}, gLang))]
    : t.map((r) => zo(O(`${yy[r.source]} (${r.model.trim()})`)));
}
function ky(e, gLang = glang()) {
  return e.length > 0
    ? e.map((t) => ps(t))
    : [ps(t("schedule.no_skills_installed", {}, gLang))];
}
function Ey(e, gLang = glang()) {
  return e.length === 0
    ? [ps(t("schedule.no_schedules_set", {}, gLang))]
    : e.map((t) => {
        let r = [
          `${t.ruleTypeLabel}\uFF1A${t.ruleSummary}`,
          by[t.status] ?? t.status,
          t.shouldNotify ? t("schedule.notify_open", {}, gLang) : t("schedule.notify_close", {}, gLang),
        ];
        return (
          t.nextRunAt && r.push(`\u4E0B\u6B21\u57F7\u884C\uFF1A${Bt(t.nextRunAt, gLang)}`),
          t.prompt && r.push(`\u63D0\u793A\uFF1A${t.prompt}`),
          ps(r.join("\uFF5C"))
        );
      });
}
function Sy(e, gLang = glang()) {
  return e.exists
    ? [zo(`${O("File: ")}${vy(e)}`), zo(`${O("Status: ")}${Cy(e)}`)]
    : [
        O(
          `No workflow configured yet. You can run /edit to reset the template and enable the Lobster workflow.`,
        ),
      ];
}
function Iy(e) {
  let t = e.id !== null ? String(e.id) : "run";
  return e.htmlUrl ? hp(t, e.htmlUrl) : O(t);
}
function vy(e) {
  return e.url ? hp(e.file, e.url) : O(e.file);
}
function Cy(e) {
  return !e.enabled || e.status === "disabled"
    ? O("\u505C\u7528")
    : e.status === "running" && e.activeRun
      ? `\u555F\u7528 \\(\u6B63\u5728\u57F7\u884C\u4EFB\u52D9 ${Iy(e.activeRun)}\\)`
      : "\u555F\u7528 \\(\u9592\u7F6E\u4E2D\\)";
}
function zo(e) {
  return `\\- ${e}`;
}
function ps(e) {
  return zo(O(e));
}
function hp(e, t) {
  return `[${O(e)}](${Qa(t)})`;
}
var by,
  yy,
  fp,
  wp = Oe(() => {
    "use strict";
    Xe();
    ds();
    ((by = Object.freeze({
      active: "\u555F\u7528",
      paused: "\u66AB\u505C",
      cancelled: "\u5DF2\u53D6\u6D88",
    })),
      (yy = Object.freeze({ copilot: "Copilot CLI", codex: "Codex CLI" })),
      (fp = { parse_mode: "MarkdownV2" }));
  });
function bp(e) {
  if (!e || typeof e.prepare != "function") throw new TypeError("Expected a D1 database binding.");
}
function yp(e, t) {
  if (typeof e != "string" || e.trim() === "")
    throw new TypeError(`${t} must be a non-empty string.`);
  return e.trim();
}
function _p(e, t) {
  let r = Number.parseInt(String(e), 10);
  if (!Number.isInteger(r) || r <= 0) throw new TypeError(`${t} must be a positive integer.`);
  return r;
}
function Ry(e) {
  if (typeof e != "string") return null;
  let t = e.trim();
  return t === "" ? null : t;
}
function Ay(e) {
  return e
    ? {
        repo: e.repo,
        issueNumber: e.issue_number,
        template: e.template,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
      }
    : null;
}
async function Qr(e, t, r) {
  bp(e);
  let n = await e
    .prepare(
      `
    SELECT repo, issue_number, template, created_at, updated_at
    FROM issue_metadata
    WHERE repo = ? AND issue_number = ?
    LIMIT 1
  `,
    )
    .bind(yp(t, "repo"), _p(r, "issueNumber"))
    .first();
  return Ay(n);
}
async function Vr(e, t) {
  bp(e);
  let r = yp(t.repo, "repo"),
    n = _p(t.issueNumber, "issueNumber"),
    s = Ry(t.template);
  return (
    await e
      .prepare(
        `
    INSERT INTO issue_metadata (
      repo, issue_number, template, created_at, updated_at
    ) VALUES (?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(repo, issue_number) DO UPDATE SET
      template = excluded.template,
      updated_at = datetime('now')
  `,
      )
      .bind(r, n, s)
      .run(),
    Qr(e, r, n)
  );
}
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE ms] D1 database helpers  —  BUSINESS
// ║ D1 binding access, schedules/kv read/write wrapper
// ╚══════════════════════════════════════════════════════════════════════════════
var ms = Oe(() => {
  "use strict";
});
function ir(e) {
  if (!e || typeof e.prepare != "function") throw new TypeError("Expected a D1 database binding.");
}
function Ze(e, t) {
  if (typeof e != "string" || e.trim() === "")
    throw new TypeError(`Expected ${t} to be a non-empty string.`);
  return e.trim();
}
function Cn(e, t) {
  let r = Number(e);
  if (!Number.isInteger(r) || r <= 0)
    throw new TypeError(`Expected ${t} to be a positive integer.`);
  return r;
}
function vn(e) {
  if (e == null) return null;
  if (typeof e != "string") throw new TypeError("Expected value to be a string or null.");
  let t = e.trim();
  return t === "" ? null : t;
}
function Tp(e, t) {
  return e == null ? null : Cn(e, t);
}
function xt(e, t = "timestamp") {
  if (e instanceof Date) {
    if (Number.isNaN(e.getTime())) throw new TypeError(`Expected ${t} to be a valid timestamp.`);
    return e.toISOString();
  }
  if (typeof e == "number") {
    let r = new Date(e);
    if (Number.isNaN(r.getTime())) throw new TypeError(`Expected ${t} to be a valid timestamp.`);
    return r.toISOString();
  }
  if (typeof e == "string" && e.trim() !== "") {
    let r = new Date(e);
    if (Number.isNaN(r.getTime())) throw new TypeError(`Expected ${t} to be a valid timestamp.`);
    return r.toISOString();
  }
  throw new TypeError(`Expected ${t} to be a valid timestamp.`);
}
function In(e, t) {
  return e == null ? null : xt(e, t);
}
function kp(e, t = "status") {
  let r = Ze(e, t).toLowerCase();
  if (!Py.has(r)) throw new TypeError(`Invalid ${t}: ${r}`);
  return r;
}
function Ep(e) {
  return e ? 1 : 0;
}
function Sp(e) {
  if (e == null) throw new TypeError("Expected rulePayload to be provided.");
  if (typeof e == "string") {
    let t = e.trim();
    if (t === "") throw new TypeError("Expected rulePayload to be a non-empty JSON string.");
    let r = JSON.parse(t);
    if (!r || typeof r != "object" || Array.isArray(r))
      throw new TypeError("Expected rulePayload to decode to an object.");
    return r;
  }
  if (typeof e != "object" || Array.isArray(e))
    throw new TypeError("Expected rulePayload to be an object.");
  return e;
}
function My(e) {
  return JSON.stringify(Sp(e));
}
function Oy(e) {
  try {
    return JSON.parse(e);
  } catch {
    return {};
  }
}
function Vo(e) {
  return !e || typeof e != "object" ? 0 : typeof e.meta?.changes == "number" ? e.meta.changes : 0;
}
function Jo() {
  return [
    "id",
    "repo",
    "issue_number",
    "chat_id",
    "prompt",
    "event_data",
    "rule_type",
    "rule_payload",
    "timezone",
    "next_run_at",
    "should_notify",
    "status",
    "last_run_at",
    "last_error",
    "locked_until",
    "cancelled_at",
    "created_at",
    "updated_at",
  ].join(", ");
}
function fs() {
  return `sch_${crypto.randomUUID().replace(/-/g, "")}`;
}
function Yo(e) {
  return e
    ? {
        id: e.id,
        repo: e.repo,
        issueNumber: Number(e.issue_number),
        chatId: e.chat_id == null ? null : Number(e.chat_id),
        prompt: e.prompt,
        eventData: vn(e.event_data),
        ruleType: e.rule_type,
        rulePayload: Oy(e.rule_payload),
        timezone: e.timezone,
        nextRunAt: e.next_run_at,
        shouldNotify: !!e.should_notify,
        status: e.status,
        lastRunAt: e.last_run_at ?? null,
        lastError: e.last_error ?? null,
        lockedUntil: e.locked_until ?? null,
        cancelledAt: e.cancelled_at ?? null,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
      }
    : null;
}
function Ny(e, t = {}) {
  let r = xt(t.now ?? new Date(), "now"),
    n = e.status ? kp(e.status) : Ya,
    s = e.cancelledAt == null && n === Qo ? r : In(e.cancelledAt, "cancelledAt");
  return {
    id: e.id ? Ze(e.id, "id") : fs(),
    repo: Ze(e.repo, "repo"),
    issueNumber: Cn(e.issueNumber, "issueNumber"),
    chatId: Tp(e.chatId, "chatId"),
    prompt: Ze(e.prompt, "prompt"),
    eventData: vn(e.eventData),
    ruleType: Ze(e.ruleType, "ruleType"),
    rulePayload: Sp(e.rulePayload),
    timezone: e.timezone ? Ze(e.timezone, "timezone") : xy,
    nextRunAt: xt(e.nextRunAt, "nextRunAt"),
    shouldNotify: !!(e.shouldNotify ?? !0),
    status: n,
    lastRunAt: In(e.lastRunAt, "lastRunAt"),
    lastError: vn(e.lastError),
    lockedUntil: In(e.lockedUntil, "lockedUntil"),
    cancelledAt: s,
    createdAt: e.createdAt ? xt(e.createdAt, "createdAt") : r,
    updatedAt: e.updatedAt ? xt(e.updatedAt, "updatedAt") : r,
  };
}
async function Xo(e, t, r = {}) {
  ir(e);
  let n = Ny(t, r);
  return (
    await e
      .prepare(
        `
    INSERT INTO schedules (
      id, repo, issue_number, chat_id, prompt, event_data, rule_type, rule_payload,
      timezone, next_run_at, should_notify, status, last_run_at, last_error,
      locked_until, cancelled_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
      )
      .bind(
        n.id,
        n.repo,
        n.issueNumber,
        n.chatId,
        n.prompt,
        n.eventData,
        n.ruleType,
        JSON.stringify(n.rulePayload),
        n.timezone,
        n.nextRunAt,
        Ep(n.shouldNotify),
        n.status,
        n.lastRunAt,
        n.lastError,
        n.lockedUntil,
        n.cancelledAt,
        n.createdAt,
        n.updatedAt,
      )
      .run(),
    gt(e, n.id)
  );
}
async function gt(e, t) {
  ir(e);
  let r = await e
    .prepare(
      `
    SELECT ${Jo()}
    FROM schedules
    WHERE id = ?
    LIMIT 1
  `,
    )
    .bind(Ze(t, "id"))
    .first();
  return Yo(r);
}
async function gs(e, t, r, n = {}) {
  ir(e);
  let s = n.includeInactive === !0,
    o = [Ze(t, "repo"), Cn(r, "issueNumber")],
    i = ["repo = ?", "issue_number = ?"];
  s || (i.push("status != ?"), o.push(Qo));
  let { results: a } = await e
    .prepare(
      `
    SELECT ${Jo()}
    FROM schedules
    WHERE ${i.join(" AND ")}
    ORDER BY next_run_at ASC, created_at ASC
  `,
    )
    .bind(...o)
    .all();
  return (a ?? []).map((l) => Yo(l));
}
async function Ip(e, t, r, n = {}) {
  ir(e);
  let s = n.includeInactive === !0,
    o = [Ze(t, "repo"), Cn(r, "chatId")],
    i = ["repo = ?", "chat_id = ?"];
  s || (i.push("status != ?"), o.push(Qo));
  let { results: a } = await e
    .prepare(
      `
    SELECT ${Jo()}
    FROM schedules
    WHERE ${i.join(" AND ")}
    ORDER BY next_run_at ASC, created_at ASC
  `,
    )
    .bind(...o)
    .all();
  return (a ?? []).map((l) => Yo(l));
}
async function jt(e, t, r, n = {}) {
  ir(e);
  let s = Ze(t, "id"),
    o = [];
  for (let [d, m] of Object.entries(r)) {
    if (m === void 0) continue;
    let w = Gy[d];
    if (!w) throw new TypeError(`Unknown schedule update field: ${d}`);
    o.push([Fy[d], w(m)]);
  }
  let i = xt(n.now ?? new Date(), "now");
  if ((r.status === Qo && r.cancelledAt === void 0 && o.push(["cancelled_at", i]), o.length === 0))
    return gt(e, s);
  o.push(["updated_at", i]);
  let a = o.map(([d]) => `${d} = ?`).join(", "),
    l = o.map(([, d]) => d),
    c = await e
      .prepare(
        `
    UPDATE schedules
    SET ${a}
    WHERE id = ?
  `,
      )
      .bind(...l, s)
      .run();
  return Vo(c) === 0 ? null : gt(e, s);
}
async function Xa(e, t) {
  ir(e);
  let r = await e
    .prepare(
      `
    DELETE FROM schedules WHERE id = ?
  `,
    )
    .bind(Ze(t, "id"))
    .run();
  return Vo(r) > 0;
}
async function vp(e, t, r) {
  ir(e);
  let n = await e
    .prepare(
      `
    DELETE FROM schedules
    WHERE repo = ? AND issue_number = ?
  `,
    )
    .bind(Ze(t, "repo"), Cn(r, "issueNumber"))
    .run();
  return Vo(n);
}
async function Cp(e, t = {}) {
  ir(e);
  let r = xt(t.now ?? new Date(), "now"),
    n = Number.isInteger(t.limit) && (t.limit ?? 0) > 0 ? t.limit : 100,
    { results: s } = await e
      .prepare(
        `
    SELECT ${Jo()}
    FROM schedules
    WHERE status = ?
      AND next_run_at <= ?
      AND (locked_until IS NULL OR locked_until < ?)
    ORDER BY next_run_at ASC, created_at ASC
    LIMIT ?
  `,
      )
      .bind(Ya, r, r, n)
      .all();
  return (s ?? []).map((o) => Yo(o));
}
async function Rp(e, t, r, n = {}) {
  ir(e);
  let s = xt(n.now ?? new Date(), "now"),
    o = xt(n.lockUntil ?? new Date(Date.parse(s) + 3e5), "lockUntil"),
    i = Ze(t, "id"),
    a = xt(r, "expectedNextRunAt"),
    l = await e
      .prepare(
        `
    UPDATE schedules
    SET locked_until = ?, updated_at = ?
    WHERE id = ?
      AND status = ?
      AND next_run_at = ?
      AND (locked_until IS NULL OR locked_until < ?)
  `,
      )
      .bind(o, s, i, Ya, a, s)
      .run();
  return Vo(l) === 0 ? null : gt(e, i);
}
async function Ap(e, t, r, n = {}) {
  return jt(
    e,
    t,
    {
      ...r,
      lockedUntil: null,
      lastError: r.lastError ?? null,
      lastRunAt: r.lastRunAt ?? n.now ?? new Date(),
    },
    n,
  );
}
async function xp(e, t, r, n = {}) {
  return jt(e, t, { lastError: vn(r) ?? "Unknown scheduler error", lockedUntil: null }, n);
}
var xy,
  Ya,
  Qo,
  Py,
  Gy,
  Fy,
  Jr = Oe(() => {
    "use strict";
    ((xy = "Asia/Taipei"),
      (Ya = "active"),
      (Qo = "cancelled"),
      (Py = new Set(["active", "paused", "cancelled"])));
    ((Gy = {
      repo: (e) => Ze(e, "repo"),
      issueNumber: (e) => Cn(e, "issueNumber"),
      chatId: (e) => Tp(e, "chatId"),
      prompt: (e) => Ze(e, "prompt"),
      eventData: (e) => vn(e),
      ruleType: (e) => Ze(e, "ruleType"),
      rulePayload: (e) => My(e),
      timezone: (e) => Ze(e, "timezone"),
      nextRunAt: (e) => xt(e, "nextRunAt"),
      shouldNotify: (e) => Ep(e),
      status: (e) => kp(e, "status"),
      lastRunAt: (e) => In(e, "lastRunAt"),
      lastError: (e) => vn(e),
      lockedUntil: (e) => In(e, "lockedUntil"),
      cancelledAt: (e) => In(e, "cancelledAt"),
    }),
      (Fy = {
        repo: "repo",
        issueNumber: "issue_number",
        chatId: "chat_id",
        prompt: "prompt",
        eventData: "event_data",
        ruleType: "rule_type",
        rulePayload: "rule_payload",
        timezone: "timezone",
        nextRunAt: "next_run_at",
        shouldNotify: "should_notify",
        status: "status",
        lastRunAt: "last_run_at",
        lastError: "last_error",
        lockedUntil: "locked_until",
        cancelledAt: "cancelled_at",
      }));
  });
function St(e) {
  let t = atob(e.replace(/\n/g, "")),
    r = Uint8Array.from(t, (n) => n.charCodeAt(0));
  return new TextDecoder().decode(r);
}
function hs(e) {
  let t = new TextEncoder().encode(e),
    r = "";
  for (let n of t) r += String.fromCharCode(n);
  return btoa(r);
}
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE Yr] GitHub API helper (small)  —  BUSINESS
// ║ GitHub API small utilities (14 lines)
// ╚══════════════════════════════════════════════════════════════════════════════
var Yr = Oe(() => {
  "use strict";
});
function yr(e) {
  return e instanceof Error ? e.message.includes("Not Found") || e.message.includes("404") : !1;
}
function Rn(e) {
  return Number.isInteger(e) && e > 0 ? `issue-${e}` : "main";
}
async function Zo(e, t, r, n, s) {
  let i = (await e.repos.getContent({ owner: t, repo: r, path: n, ref: s })).data;
  if (Array.isArray(i) || i.type !== "file")
    throw new Error(`${n} \u4E0D\u662F\u4E00\u500B\u6A94\u6848`);
  return i.encoding === "base64" ? St(i.content) : i.content;
}
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE Xr] GitHub REST client wrapper  —  BUSINESS
// ║ GitHub API call wrapper (User-Agent: altShiftClawCore, X-GitHub-Api-Version)
// ╚══════════════════════════════════════════════════════════════════════════════
var Xr = Oe(() => {
  "use strict";
  Yr();
});
function $y(e) {
  let t = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": e.apiVersion || "2022-11-28",
    "User-Agent": e.userAgent || "altShiftClawCore",
  };
  return (e.token?.trim() && (t.Authorization = `Bearer ${e.token.trim()}`), t);
}
function Ly(e) {
  return e.status === 403 && e.headers.get("x-ratelimit-remaining") === "0";
}
function Dy(e) {
  let t = e.headers.get("x-ratelimit-remaining"),
    r = e.headers.get("x-ratelimit-reset");
  if (t !== "0") return "";
  let n = r ? Number(r) : 0;
  if (n > 0) {
    let s = Math.max(0, n - Math.floor(Date.now() / 1e3)),
      o = Math.ceil(s / 60);
    return ` (\u5DF2\u9054 API \u901F\u7387\u4E0A\u9650\uFF0C${o > 0 ? `\u7D04 ${o} \u5206\u9418` : "\u5373\u5C07"}\u5F8C\u91CD\u7F6E)`;
  }
  return " (\u5DF2\u9054 API \u901F\u7387\u4E0A\u9650)";
}
async function An(e, t) {
  let r = $y(t),
    n = Pp.get(e);
  n?.etag && (r["If-None-Match"] = n.etag);
  let s = await fetch(e, { headers: r });
  if (s.status === 304 && n)
    return (
      (n.fetchedAt = Date.now()),
      {
        ok: !0,
        status: 304,
        statusText: "Not Modified",
        data: n.body,
        rateLimited: !1,
        rateLimitHint: "",
      }
    );
  let o = Ly(s),
    i = Dy(s);
  if (!s.ok)
    return {
      ok: !1,
      status: s.status,
      statusText: s.statusText,
      data: null,
      rateLimited: o,
      rateLimitHint: i,
    };
  let a = await s.json(),
    l = s.headers.get("etag");
  return (
    l && Pp.set(e, { etag: l, body: a, fetchedAt: Date.now() }),
    {
      ok: !0,
      status: s.status,
      statusText: s.statusText,
      data: a,
      rateLimited: !1,
      rateLimitHint: "",
    }
  );
}
var Pp,
  Za = Oe(() => {
    "use strict";
    Pp = new Map();
  });
function ws(e) {
  return typeof e == "string" ? e.trim() : "";
}
function Wy(e) {
  return [e.key ?? "", e.label ?? "", e.description ?? ""]
    .join(
      `
`,
    )
    .toLowerCase();
}
function qy(e) {
  return jy.get(ws(e)) ?? null;
}
function Ky(e) {
  let t = ws(e);
  return Uy[t] ?? qy(t)?.label ?? t;
}
function Mp(e, t) {
  return [...new Set(e.map(ws).filter((r) => t.has(r)))];
}
function Hy(e, t) {
  let r = Array.isArray(e) ? e : Op,
    n = Array.isArray(e) ? (t ?? {}) : (e ?? {}),
    s = typeof n.query == "string" ? n.query.trim().toLowerCase() : "",
    o = typeof n.limit == "number" && Number.isInteger(n.limit) && n.limit >= 0 ? n.limit : null,
    i = new Set(r.map((d) => ws(d?.key)).filter(Boolean)),
    a = n.includeKeys ? new Set(Mp(n.includeKeys, i)) : null,
    l = n.excludeKeys ? new Set(Mp(n.excludeKeys, i)) : null,
    c = r.filter((d) => i.has(ws(d?.key)));
  return (
    a && (c = c.filter((d) => a.has(d.key))),
    l && (c = c.filter((d) => !l.has(d.key))),
    s && (c = c.filter((d) => Wy(d).includes(s))),
    o !== null && (c = c.slice(0, o)),
    c
  );
}
async function bs(e) {
  if (Wt && Date.now() - Wt.fetchedAt < zy) return Wt.skills;
  let r = `${e.apiBaseUrl || "https://api.github.com"}/repos/${Np}/${Gp}/contents/skills?ref=${encodeURIComponent(Fp)}`;
  try {
    let n = await An(r, e);
    if (!n.ok) {
      if (Wt)
        return (
          console.warn(
            `[skill-catalog] listRemoteSkills failed (${n.status}), returning stale cache`,
          ),
          (Wt.fetchedAt = Date.now()),
          Wt.skills
        );
      throw new Error(`listRemoteSkills failed: ${n.status} ${n.statusText}${n.rateLimitHint}`);
    }
    let s = n.data;
    if (!Array.isArray(s)) return [];
    let o = s.filter((i) => i && i.type === "dir").map((i) => ({ name: i.name }));
    return ((Wt = { fetchedAt: Date.now(), skills: o }), o);
  } catch (n) {
    if (Wt)
      return (
        console.warn("[skill-catalog] listRemoteSkills failed, using cached skills", n),
        (Wt.fetchedAt = Date.now()),
        Wt.skills
      );
    throw n;
  }
}
async function ys(e, t) {
  try {
    let r = e.apiBaseUrl || "https://api.github.com",
      n = `skills/${encodeURIComponent(t)}/githubclaw.json`,
      s = `${r}/repos/${Np}/${Gp}/contents/${n}?ref=${encodeURIComponent(Fp)}`,
      o = await An(s, e);
    if (!o.ok)
      return (
        console.error(`[skill-catalog] getRemoteSkillMetadata(${t}) failed: ${o.status}`),
        null
      );
    let i = o.data;
    if (typeof i?.content != "string") return null;
    let a = St(i.content),
      l = JSON.parse(a),
      c = typeof l.name == "string" ? l.name : void 0,
      d = typeof l.description == "string" ? l.description : void 0;
    if (!c || !d) return null;
    let m = Array.isArray(l.requireEnv)
      ? [
          ...new Set(
            l.requireEnv
              .filter((w) => typeof w == "string" && w.trim() !== "")
              .map((w) => w.trim()),
          ),
        ]
      : void 0;
    return { name: c, description: d, requireEnv: m };
  } catch (r) {
    return (console.error(`[skill-catalog] getRemoteSkillMetadata(${t}) error:`, r), null);
  }
}
var Op,
  Uy,
  By,
  jy,
  el,
  uv,
  Np,
  Gp,
  Fp,
  zy,
  Wt,
  _s = Oe(() => {
    "use strict";
    Za();
    Yr();
    ((Op = []),
      (Uy = {
        "audio-transcriber": "\u8A9E\u97F3\u8F49\u6587\u5B57",
        "call-agent-via-issue": "Issue \u4EE3\u7406\u59D4\u6D3E",
        "deep-researcher": "\u6DF1\u5EA6\u7814\u7A76",
        "felo-search": "Felo \u5373\u6642\u641C\u5C0B",
        "felo-slides": "Felo \u7C21\u5831\u751F\u6210",
        "felo-web-fetch": "Felo \u7DB2\u9801\u64F7\u53D6",
        "felo-x-search": "Felo X \u641C\u5C0B",
        "find-skills": "\u6280\u80FD\u63A2\u7D22",
        "google-stitch": "Google Stitch \u8A2D\u8A08\u751F\u6210",
        "image-describer": "\u5716\u7247\u63CF\u8FF0\u8207\u8FA8\u8B58",
        "meeting-note-formatter": "\u6703\u8B70\u7B46\u8A18\u6574\u7406",
        "gemini-nanobanana": "Nano Banana \u5716\u50CF\u751F\u6210",
        "playwright-cli": "\u7DB2\u9801\u81EA\u52D5\u5316\u6E2C\u8A66",
        sendgrid: "SendGrid \u90F5\u4EF6\u767C\u9001",
        "skill-creator": "\u6280\u80FD\u5EFA\u7ACB\u8207\u512A\u5316",
        summary: "\u5167\u5BB9\u6458\u8981\uFF08\u7DB2\u9801/PDF/\u5F71\u7247\uFF09",
        "telegram-notify": "Telegram \u901A\u77E5",
        "tools-package-builder": "Tools \u5957\u4EF6\u5EFA\u7ACB\u5668",
      }),
      (By = ["tools-package-builder", "skill-creator"]),
      (jy = new Map(Op.map((e) => [e.key, e]))));
    ((el = Hy({ excludeKeys: By }).map((e) => ({ ...e, label: Ky(e.key) }))),
      (uv = new Set(el.map((e) => e.key))),
      (Np = "jeffsia-blacksmith"),
      (Gp = "altShiftClawToolkit"),
      (Fp = "main"),
      (zy = 5 * 6e4),
      (Wt = null));
  });
async function ei(e, t, r, n) {
  try {
    let s = await e.repos.getContent({ owner: t, repo: r, path: ".agents/skills", ref: n });
    return Array.isArray(s.data) ? s.data.filter((o) => o.type === "dir").map((o) => o.name) : [];
  } catch {
    return [];
  }
}
async function Lp(e, t, r, n, s) {
  try {
    let o = await e.repos.getContent({ owner: t, repo: r, path: s, ref: n });
    return Array.isArray(o.data) ? o.data.length > 0 : !0;
  } catch {
    return !1;
  }
}
async function Dp(e, t = {}) {
  return (await ys(t, e))?.requireEnv ?? [];
}
async function Up(e, t, r, n) {
  let s = { skill_name: n.skillName, issue_number: String(n.issueNumber), request_id: n.requestId };
  await e.actions.createWorkflowDispatch({
    owner: t,
    repo: r,
    workflow_id: Qy,
    ref: $p,
    inputs: s,
  });
}
async function Bp(e, t, r, n) {
  let s = { skill_name: n.skillName, issue_number: String(n.issueNumber), request_id: n.requestId };
  await e.actions.createWorkflowDispatch({
    owner: t,
    repo: r,
    workflow_id: Vy,
    ref: $p,
    inputs: s,
  });
}
var Qy,
  $p,
  Vy,
  ti = Oe(() => {
    "use strict";
    _s();
    ((Qy = "skills.yml"), ($p = "main"));
    Vy = "remove-skill.yml";
  });
async function Ts(e, t, r, n) {
  let s = await tl(e, t, r, n);
  return {
    branchExists: s.branchExists,
    workflowExists: s.workflowExists,
    workflowEnabled: s.workflowEnabled,
    acceptsDispatch: s.branchExists && s.workflowExists && s.workflowEnabled,
  };
}
async function tl(e, t, r, n) {
  let s = Number.parseInt(String(n), 10),
    i = `issue-${Number.isInteger(s) && s > 0 ? s : n}.yml`,
    a = `.github/workflows/${i}`;
  if (!Number.isInteger(s) || s <= 0)
    return {
      branchExists: !0,
      workflowFile: i,
      workflowPath: a,
      workflowExists: !0,
      workflowEnabled: !0,
      workflowId: null,
      workflowState: "active",
      workflowHtmlUrl: "",
    };
  let l = !0;
  try {
    await e.git.getRef({ owner: t, repo: r, ref: `heads/issue-${s}` });
  } catch (_) {
    yr(_)
      ? (l = !1)
      : console.warn("[workspace] \u8B80\u53D6 issue \u5206\u652F\u72C0\u614B\u5931\u6557", {
          issueNumber: s,
          error: _ instanceof Error ? _.message : String(_),
        });
  }
  let c = !0,
    d = !0,
    m = null,
    w = "",
    y = "";
  try {
    let { data: _ } = await e.actions.listRepoWorkflows({ owner: t, repo: r }),
      I = _.workflows.find((P) => P.path === a);
    I
      ? ((m = Number.isInteger(I.id) ? I.id : null),
        (w = typeof I.state == "string" ? I.state.trim().toLowerCase() : ""),
        (y = typeof I.html_url == "string" ? I.html_url.trim() : ""),
        (d = w !== "disabled_manually"))
      : ((c = !1), (d = !1));
  } catch (_) {
    yr(_)
      ? ((c = !1), (d = !1))
      : console.warn("[workspace] \u8B80\u53D6 workflow \u72C0\u614B\u5931\u6557", {
          issueNumber: s,
          error: _ instanceof Error ? _.message : String(_),
        });
  }
  return {
    branchExists: l,
    workflowFile: i,
    workflowPath: a,
    workflowExists: c,
    workflowEnabled: d,
    workflowId: m,
    workflowState: w,
    workflowHtmlUrl: y,
  };
}
async function jp(e, t, r, n) {
  let s = await Ts(e, t, r, n);
  return s.workflowExists && s.workflowEnabled;
}
async function Wp(e, t, r, n, s) {
  try {
    let i = (await e.repos.getContent({ owner: t, repo: r, path: s, ref: n })).data;
    if (Array.isArray(i) || i.type !== "file")
      throw new Error(`${s} \u4E0D\u662F\u4E00\u500B\u6A94\u6848`);
    return { content: i.encoding === "base64" ? St(i.content) : i.content, sha: i.sha };
  } catch (o) {
    if (yr(o)) return { content: "" };
    throw o;
  }
}
async function Jy(e, t, r, n, s, o, i) {
  let a = await Wp(e, t, r, n, s);
  await e.repos.createOrUpdateFileContents({
    owner: t,
    repo: r,
    path: s,
    message: i,
    content: hs(o),
    branch: n,
    ...(a.sha ? { sha: a.sha } : {}),
  });
}
async function Zr(e, t, r, n, s, o) {
  let i = `issue-${n}`,
    a = `artifacts/${s}/user.md`,
    c = `${(typeof o == "string" ? o.trim() : "") || "(empty)"}
`;
  await Jy(e, t, r, i, a, c, `chore: \u66F4\u65B0 issue #${n} comment #${s} user artifact`);
}
async function xn(e, t, r, n, s) {
  let o = `issue-${n}`,
    i = "issue.jsonl",
    a = await Wp(e, t, r, o, i),
    l = `${JSON.stringify(s)}
`,
    c = a.content.replace(/\r?\n*$/g, ""),
    d =
      c === ""
        ? l
        : `${c}
${l}`;
  await e.repos.createOrUpdateFileContents({
    owner: t,
    repo: r,
    path: i,
    message: `chore: \u66F4\u65B0 issue #${n} \u5C0D\u8A71\u7D00\u9304`,
    content: hs(d),
    branch: o,
    ...(a.sha ? { sha: a.sha } : {}),
  });
}
async function qp(e, t, r, n, s) {
  await xn(e, t, r, n, {
    role: "assistant",
    source: "\u5C0F\u9F8D\u8766",
    delivery: "telegram",
    issue_number: n,
    comment_id: s.commentId ?? null,
    github_comment_url: s.githubCommentUrl ?? null,
    telegram: {
      chat_id: s.telegram.chat_id,
      message_id: s.telegram.message_id,
      reply_to_message_id: s.telegram.reply_to_message_id ?? null,
    },
    content: s.content,
    parse_mode: s.parse_mode ?? null,
    relay: {
      action: s.relay_action ?? null,
      mode: s.relay_mode ?? null,
      message_kind: s.message_kind ?? null,
    },
    ...(Array.isArray(s.attachments) && s.attachments.length > 0
      ? { attachments: s.attachments }
      : {}),
    created_at: new Date().toISOString(),
  });
}
function Kp(e) {
  return {
    name: typeof e.name == "string" ? e.name.trim() : "",
    description: typeof e.description == "string" ? e.description.trim() : "",
  };
}
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE ar] workflow run status  —  BUSINESS
// ║ workflow run states (completed/running/disabled)
// ╚══════════════════════════════════════════════════════════════════════════════
var ar = Oe(() => {
  "use strict";
  Xr();
  Yr();
});
async function Hp(e) {
  let t = Number.parseInt(String(e.issueNumber), 10),
    r = Rn(t),
    [n, s, o, i, a, l] = await Promise.all([
      Zy(e.octokit, e.owner, e.repo, t),
      ei(e.octokit, e.owner, e.repo, r),
      e_(e.d1, e.repoFullName, t),
      t_(e.d1, e.repoFullName, t),
      r_(e.octokit, e.owner, e.repo, r),
      s_(e.octokit, e.owner, e.repo, t),
    ]);
  return {
    issue: { number: t, title: n.title, state: n.state, branch: r, exists: n.exists },
    templateName: i,
    skills: s,
    schedules: { count: o.length, items: o.map((c) => i_(c)) },
    models: {
      sources: a,
      hasConfiguredModel: a.some((c) => c.model !== null),
      fallbackLabel: a.some((c) => c.model !== null) ? null : Yy,
    },
    workflow: l,
  };
}
async function Zy(e, t, r, n) {
  try {
    let { data: s } = await e.issues.get({ owner: t, repo: r, issue_number: n });
    return {
      title: typeof s.title == "string" ? s.title : "",
      state: typeof s.state == "string" ? s.state : "",
      exists: !0,
    };
  } catch (s) {
    return (
      console.warn("[issue-status] \u8B80\u53D6 issue \u5931\u6557", {
        issueNumber: n,
        error: s instanceof Error ? s.message : String(s),
      }),
      { title: "", state: "", exists: !1 }
    );
  }
}
async function e_(e, t, r) {
  try {
    return await gs(e, t, r);
  } catch (n) {
    return (
      console.warn("[issue-status] \u8B80\u53D6\u6392\u7A0B\u5931\u6557", {
        issueNumber: r,
        error: n instanceof Error ? n.message : String(n),
      }),
      []
    );
  }
}
async function t_(e, t, r) {
  try {
    return (await Qr(e, t, r))?.template ?? null;
  } catch (n) {
    return (
      console.warn("[issue-status] \u8B80\u53D6\u7BC4\u672C metadata \u5931\u6557", {
        issueNumber: r,
        error: n instanceof Error ? n.message : String(n),
      }),
      null
    );
  }
}
async function r_(e, t, r, n) {
  return Promise.all(
    Xy.map(async (s) => {
      let o = await n_(e, t, r, n, s.path);
      return {
        source: s.source,
        label: s.label,
        path: s.path,
        exists: o !== null,
        model: o === null ? null : s.parse(o),
      };
    }),
  );
}
async function n_(e, t, r, n, s) {
  try {
    return await Zo(e, t, r, s, n);
  } catch (o) {
    return (
      yr(o) ||
        console.warn("[issue-status] \u8B80\u53D6\u5206\u652F\u6A94\u6848\u5931\u6557", {
          branch: n,
          path: s,
          error: o instanceof Error ? o.message : String(o),
        }),
      null
    );
  }
}
async function s_(e, t, r, n) {
  let s = await tl(e, t, r, n),
    o = s.workflowExists && s.workflowId !== null ? await o_(e, t, r, s.workflowId) : [],
    i = o[0] ?? null,
    a = o.find((c) => c.status !== "completed") ?? null,
    l = s.workflowExists ? (s.workflowEnabled ? (a ? "running" : "idle") : "disabled") : "missing";
  return {
    file: s.workflowFile,
    path: s.workflowPath,
    url: s.workflowHtmlUrl,
    id: s.workflowId,
    exists: s.workflowExists,
    enabled: s.workflowEnabled,
    state: s.workflowState,
    branchExists: s.branchExists,
    status: l,
    activeRun: a,
    latestRun: i,
  };
}
async function o_(e, t, r, n) {
  try {
    let { data: s } = await e.actions.listWorkflowRuns({
      owner: t,
      repo: r,
      workflow_id: n,
      per_page: 10,
    });
    return (s.workflow_runs ?? []).map((o) => ({
      id: Number.isInteger(o.id) ? o.id : null,
      htmlUrl: typeof o.html_url == "string" ? o.html_url : "",
      status: typeof o.status == "string" ? o.status : "",
      conclusion: typeof o.conclusion == "string" ? o.conclusion : null,
      title:
        typeof o.display_title == "string" && o.display_title.trim() !== ""
          ? o.display_title.trim()
          : typeof o.name == "string" && o.name.trim() !== ""
            ? o.name.trim()
            : null,
      runNumber: Number.isInteger(o.run_number) ? o.run_number : null,
      runAttempt: Number.isInteger(o.run_attempt ?? null) ? (o.run_attempt ?? null) : null,
    }));
  } catch (s) {
    return (
      console.warn("[issue-status] \u8B80\u53D6 workflow runs \u5931\u6557", {
        workflowId: n,
        error: s instanceof Error ? s.message : String(s),
      }),
      []
    );
  }
}
function i_(e) {
  return {
    id: e.id,
    status: e.status,
    prompt: e.prompt,
    nextRunAt: e.nextRunAt,
    shouldNotify: e.shouldNotify,
    ruleType: e.ruleType,
    rulePayload: e.rulePayload,
    ruleTypeLabel: cs(e),
    ruleSummary: br(e),
  };
}
function a_(e) {
  try {
    let t = JSON.parse(e);
    return typeof t.model == "string" && t.model.trim() !== "" ? t.model.trim() : null;
  } catch {
    return null;
  }
}
function l_(e) {
  let t = e.split(/\r?\n/);
  for (let r of t) {
    let n = r.trim();
    if (!n || n.startsWith("#")) continue;
    let s = n.match(/^model\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))/),
      o = s?.[1] ?? s?.[2] ?? s?.[3] ?? "";
    if (o.trim() !== "") return o.trim();
  }
  return null;
}
var Yy,
  Xy,
  zp = Oe(() => {
    "use strict";
    ms();
    Jr();
    Xr();
    ds();
    ti();
    ar();
    ((Yy = "\u7531 Workflow \u5B9A\u7FA9"),
      (Xy = [
        { source: "copilot", label: "GitHub Copilot", path: ".copilot/config.json", parse: a_ },
        { source: "codex", label: "Codex", path: ".codex/config.toml", parse: l_ },
      ]));
  });
async function ks(e, t) {
  let { octokit: r, d1: n, config: s } = e.services,
    { owner: o, repo: i, repoFullName: a } = s.github,
    l = await Hp({ octokit: r, d1: n, owner: o, repo: i, repoFullName: a, issueNumber: t });
  await e.reply(gp(l), { ...fp, reply_markup: u_(l) ? qd(l.issue.number) : void 0 });
}
async function Es(e, t, r = "issue-status") {
  try {
    await ks(e, t);
  } catch (n) {
    console.error(`[${r}] \u50B3\u9001 issue \u72C0\u614B\u8A0A\u606F\u5931\u6557`, n);
  }
}
function u_(e) {
  return e.issue.exists && (!e.issue.state || e.issue.state === "open");
}
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE Ss] state finalization  —  BUSINESS
// ║ State machine finalized handling
// ╚══════════════════════════════════════════════════════════════════════════════
var Ss = Oe(() => {
  "use strict";
  Ve();
  wp();
  zp();
});
function vs(e, t) {
  if (typeof e != "string") return null;
  let r = e.match(t);
  if (!r) return null;
  try {
    let n = JSON.parse(r[1]);
    return typeof n != "object" || n === null || Array.isArray(n) ? null : n;
  } catch {
    return null;
  }
}
function ii(e) {
  if (typeof e != "object" || e === null || Array.isArray(e)) return null;
  let t = e;
  if (typeof t.chat_id != "number") return null;
  let r = { chat_id: t.chat_id };
  return (
    typeof t.msg_id == "number" && (r.msg_id = t.msg_id),
    typeof t.user_id == "number" && (r.user_id = t.user_id),
    typeof t.username == "string" && (r.username = t.username),
    typeof t.chat_type == "string" && (r.chat_type = t.chat_type),
    typeof t.ts == "string" && (r.ts = t.ts),
    typeof t.media_type == "string" && (r.media_type = t.media_type),
    r
  );
}
function O_(e) {
  if (typeof e != "object" || e === null || Array.isArray(e)) return null;
  let t = e,
    r = {};
  return (
    typeof t.source == "string" && (r.source = t.source),
    typeof t.source_type == "string" && (r.source_type = t.source_type),
    typeof t.source_key == "string" && (r.source_key = t.source_key),
    typeof t.user_id == "string" && (r.user_id = t.user_id),
    typeof t.group_id == "string" && (r.group_id = t.group_id),
    typeof t.room_id == "string" && (r.room_id = t.room_id),
    typeof t.msg_id == "string" && (r.msg_id = t.msg_id),
    typeof t.webhook_event_id == "string" && (r.webhook_event_id = t.webhook_event_id),
    typeof t.ts == "string" && (r.ts = t.ts),
    typeof t.bootstrap == "boolean" && (r.bootstrap = t.bootstrap),
    Object.keys(r).length > 0 ? r : null
  );
}
function tm(e) {
  return Array.isArray(e)
    ? e
        .filter((t) => typeof t == "object" && t !== null)
        .map((t) => ({
          branch: typeof t.branch == "string" ? t.branch.trim() : "",
          path: typeof t.path == "string" ? t.path.trim().replace(/^\/+/, "") : "",
        }))
        .filter((t) => t.branch !== "" && t.path !== "")
    : [];
}
function rm(e) {
  return Array.isArray(e)
    ? e
        .map((t) => (typeof t == "string" ? t.trim().replace(/^\/+/, "") : ""))
        .filter((t) => t !== "")
    : [];
}
function N_(e) {
  if (typeof e != "object" || e === null || Array.isArray(e)) return null;
  let t = e,
    r = t.stage === "finalized" ? "finalized" : t.stage === "pending" ? "pending" : null,
    n = t.kind === "album" ? "album" : t.kind === "single" ? "single" : null;
  return !r || !n
    ? null
    : { stage: r, kind: n, temp_paths: rm(t.temp_paths), final_paths: rm(t.final_paths) };
}
function il(e) {
  return typeof e != "string" ? !1 : e.includes(x_) || e.includes(P_) || e.includes(M_);
}
function Tr(e) {
  return vs(e, E_);
}
function al(e) {
  return Tr(e) !== null;
}
function kr(e) {
  return ii(Tr(e));
}
function G_(e) {
  let t = Tr(e);
  return typeof t?.source == "string" && t.source.trim() ? t.source.trim() : null;
}
function en(e, ...t) {
  let r = G_(e);
  return r !== null && t.includes(r);
}
function lm(e) {
  return O_(vs(e, nm));
}
function Cs(e) {
  let t = vs(e, sm);
  if (typeof t?.source != "string" || t.source.trim() === "") return null;
  let r = ii(t.requestTelegramMeta);
  return { ...t, source: t.source, ...(r ? { requestTelegramMeta: r } : {}) };
}
function ll(e) {
  let t = vs(e, om);
  if (
    typeof t?.requestId != "string" ||
    t.requestId.trim() === "" ||
    typeof t.toolName != "string" ||
    t.toolName.trim() === ""
  )
    return null;
  let r = ii(t.requestTelegramMeta);
  return {
    ...t,
    requestId: t.requestId,
    toolName: t.toolName,
    ...(r ? { requestTelegramMeta: r } : {}),
  };
}
function um(e) {
  if (typeof e != "string") return null;
  let t = e.match(im);
  if (!t) return null;
  try {
    let r = JSON.parse(t[1]);
    if (typeof r != "object" || r === null) return null;
    let n = r,
      s = tm(n.images),
      o = tm(n.html);
    return s.length === 0 && o.length === 0 ? null : { images: s, html: o };
  } catch {
    return null;
  }
}
function ol(e) {
  return N_(vs(e, am));
}
function Rs(e, ...t) {
  let r = ol(e);
  return r !== null && t.includes(r.stage);
}
function As(e, t) {
  let r = ol(e),
    n = ol(t);
  return r?.stage === "finalized" && n?.stage === "pending";
}
function F_(e) {
  return typeof e != "string" ? "" : e.replace(im, "").trim();
}
function ul(e) {
  return typeof e != "string" ? "" : e.replace(am, "").trim();
}
function cl(e) {
  return typeof e != "string"
    ? ""
    : e.replace(/<!--\s*telegram-meta:\s*\{[\s\S]*?\}\s*-->\s*/g, "").trim();
}
function dl(e) {
  return typeof e != "string" ? "" : e.replace(S_, "").trim();
}
function $_(e) {
  return typeof e != "string" ? "" : e.replace(sm, "").trim();
}
function L_(e) {
  return typeof e != "string" ? "" : e.replace(om, "").trim();
}
function D_(e) {
  return typeof e != "string" ? "" : e.replace(I_, "").trim();
}
function U_(e) {
  return typeof e != "string" ? "" : e.replace(v_, "").trim();
}
function lr(e, t = {}) {
  let r = D_(L_($_(F_(ul(dl(cl(typeof e == "string" ? e.replace(nm, "").trim() : e)))))));
  return t.stripToolRunStatusPrefix ? U_(r) : r;
}
function cm(e, t = {}) {
  let r = typeof e == "string" ? e.trim() : "";
  return [`<!-- telegram-meta: ${JSON.stringify(t)} -->`, r].filter(Boolean).join(`
`);
}
function pl(e, t = {}) {
  let r = typeof e == "string" ? e.trim() : "",
    n = ii(t.requestTelegramMeta),
    s = { source: "githubclaw-worker-brain", ...(n ? { requestTelegramMeta: n } : {}) },
    o = `<!-- githubclaw-brain-result: ${JSON.stringify(s)} -->`;
  return [r, o].filter(Boolean).join(`

`);
}
function dm(e) {
  return `<!-- githubclaw-media-meta: ${JSON.stringify(e)} -->`;
}
function pm(e) {
  if (typeof e != "string") return [];
  let t = [],
    r = new Set(),
    n = (s) => {
      let o = String(s ?? "")
        .trim()
        .replace(/^\/+/, "");
      if (!(!o || r.has(o))) {
        if (o.includes("://")) {
          let i = o.match(
            /^https?:\/\/github\.com\/[^/]+\/[^/]+\/(?:blob|raw)\/[^/]+\/(.+?)(?:\?.*)?$/,
          );
          if (i) {
            let a = decodeURIComponent(i[1]);
            r.has(a) || (r.add(a), t.push(a));
          }
          return;
        }
        (r.add(o), t.push(o));
      }
    };
  for (let s of e.matchAll(C_)) n(s[1]);
  for (let s of e.matchAll(A_)) n(s[1]);
  for (let s of e.matchAll(R_)) n(s[2]);
  return t;
}
var E_,
  S_,
  nm,
  sm,
  om,
  im,
  am,
  I_,
  v_,
  C_,
  R_,
  A_,
  x_,
  P_,
  M_,
  Pt = Oe(() => {
    "use strict";
    ((E_ = /<!--\s*telegram-meta:\s*(\{[\s\S]*?\})\s*-->/),
      (S_ = /<!--\s*githubclaw-album-meta:\s*(\{[\s\S]*?\})\s*-->/),
      (nm = /<!--\s*line-meta:\s*(\{[\s\S]*?\})\s*-->/),
      (sm = /<!--\s*githubclaw-brain-result:\s*(\{[\s\S]*?\})\s*-->/),
      (om = /<!--\s*githubclaw-tool-run:\s*(\{[\s\S]*?\})\s*-->/),
      (im = /<!--\s*githubclaw-artifacts:\s*(\{[\s\S]*?\})\s*-->/),
      (am = /<!--\s*githubclaw-media-meta:\s*(\{[\s\S]*?\})\s*-->/),
      (I_ = /<useTool\b[^>]*>[\s\S]*?<\/useTool>\s*/g),
      (v_ = /^工具\s+`[^`]+`\s+(?:已完成|执行失败)。(?:\r?\n\s*)*/),
      (C_ = /`([^`\r\n]+?\.(?:png|jpe?g|webp|gif))`/gi),
      (R_ =
        /(^|[^A-Za-z0-9/_.-])((?:[A-Za-z0-9._-]+\/)+[A-Za-z0-9._-]+\.(?:png|jpe?g|webp|gif))(?=$|[^A-Za-z0-9/_.-])/gim),
      (A_ = /!\[[^\]]*\]\((https?:\/\/[^)\s]+\.(?:png|jpe?g|webp|gif)[^)\s]*)\)/gi),
      (x_ = "githubclaw-brain-result"),
      (P_ = "githubclaw-tool-run"),
      (M_ = "line-meta"));
  });
function B_(e) {
  if (!(e instanceof Error)) return !1;
  let t = e.message.toLowerCase();
  return (
    t.includes("reference already exists") || t.includes("ref already exists") || t.includes("422")
  );
}
function mm(e) {
  return e.map((t) => ({ path: t.path, mode: "100644", type: "blob", content: t.content }));
}
async function Pn(e, t, r, n, s, o) {
  let { data: i } = await e.rest.git.createTree({ owner: t, repo: r, tree: mm(s) }),
    { data: a } = await e.rest.git.createCommit({
      owner: t,
      repo: r,
      message: o,
      tree: i.sha,
      parents: [],
    });
  try {
    await e.rest.git.createRef({ owner: t, repo: r, ref: `refs/heads/${n}`, sha: a.sha });
  } catch (l) {
    if (B_(l))
      return (
        console.log(`\u5206\u652F ${n} \u5DF2\u5B58\u5728\uFF0C\u7565\u904E\u5EFA\u7ACB`),
        { ok: !0, branch: n }
      );
    throw l;
  }
  return (
    console.log(`\u5DF2\u5EFA\u7ACB orphan \u5206\u652F ${n}\uFF08${a.sha}\uFF09`),
    { ok: !0, branch: n, commitSha: a.sha }
  );
}
async function ai(e, t, r, n, s, o) {
  if (s.length === 0) return { ok: !0, branch: n };
  let { data: i } = await e.git.getRef({ owner: t, repo: r, ref: `heads/${n}` }),
    a = i.object.sha,
    { data: l } = await e.git.getCommit({ owner: t, repo: r, commit_sha: a }),
    c = l.tree.sha,
    { data: d } = await e.rest.git.createTree({ owner: t, repo: r, base_tree: c, tree: mm(s) }),
    { data: m } = await e.rest.git.createCommit({
      owner: t,
      repo: r,
      message: o,
      tree: d.sha,
      parents: [a],
    });
  return (
    await e.rest.git.updateRef({ owner: t, repo: r, ref: `heads/${n}`, sha: m.sha }),
    console.log(
      `\u5DF2\u91CD\u8A2D\u5206\u652F ${n} \u7684\u7BC4\u672C\u6A94\u6848\uFF08${m.sha}\uFF09`,
    ),
    { ok: !0, branch: n, commitSha: m.sha }
  );
}
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE xs] GraphQL / templates  —  BUSINESS
// ║ POST /graphql, templates related
// ╚══════════════════════════════════════════════════════════════════════════════
var xs = Oe(() => {
  "use strict";
});
function W_(e, t) {
  return t.personality ? e.replace(/\{\{personality\}\}/g, t.personality) : e;
}
function q_(e) {
  return `\u7BC4\u672C ${e} \u5C1A\u672A\u5B89\u88DD\u5230\u9F8D\u8766\u5821\uFF08templates/${e}/ \u4E0D\u5B58\u5728\uFF09`;
}
function fm(e) {
  return (
    e instanceof Error && e.message.includes("\u5C1A\u672A\u5B89\u88DD\u5230\u9F8D\u8766\u5821")
  );
}
function K_(e, t) {
  return `\u8B80\u53D6\u7BC4\u672C ${e} \u5931\u6557\uFF1A${t}`;
}
function gm(e) {
  return e instanceof Error && e.message.startsWith("\u8B80\u53D6\u7BC4\u672C ");
}
function hm(e, t, r) {
  if (!e?.length) return [];
  let n = [];
  for (let s of e) {
    let o = t ? `${t}/${s.name}` : s.name;
    if (s.type === "blob" && s.object?.__typename === "Blob") {
      if (s.object.isBinary)
        throw new Error(`template \u6A94\u6848 ${o} \u70BA binary\uFF0C\u7121\u6CD5\u8B80\u53D6`);
      if (/^\.github\/workflows\//i.test(o)) continue;
      n.push({ path: o, content: W_(s.object.text ?? "", r) });
      continue;
    }
    if (s.type === "tree" && s.object?.__typename === "Tree") {
      if (!Array.isArray(s.object.entries))
        throw new Error(
          `template \u76EE\u9304 ${o}/ \u5DE2\u72C0\u6DF1\u5EA6\u8D85\u904E\u55AE\u6B21\u67E5\u8A62\u652F\u63F4\u7BC4\u570D`,
        );
      n.push(...hm(s.object.entries, o, r));
    }
  }
  return n;
}
async function H_(e, t, r, n) {
  let s = await e.request("POST /graphql", {
      query: j_,
      variables: { owner: t, repo: r, expression: `main:templates/${n}` },
    }),
    o = Array.isArray(s.data?.errors) ? s.data.errors : [];
  if (o.length > 0) {
    let a = o[0]?.message?.trim() || "\u672A\u77E5 GraphQL \u932F\u8AA4";
    throw new Error(K_(n, a));
  }
  let i = s.data?.data?.repository?.object;
  return !i || i.__typename !== "Tree" ? null : i;
}
async function tn(e, t, r) {
  let n = await e.repos.getContent({ owner: t, repo: r, path: "templates", ref: "main" });
  return Array.isArray(n.data)
    ? n.data
        .filter((s) => s.type === "dir" && typeof s.name == "string" && s.name.trim() !== "")
        .map((s) => s.name.trim())
        .sort()
    : [];
}
async function Er(e, t, r, n, s = {}) {
  let o = await H_(e, t, r, n);
  if (!o) throw new Error(q_(n));
  return hm(o.entries, "", s);
}
var j_,
  li = Oe(() => {
    "use strict";
    j_ = `
  query ReadTemplateTree($owner: String!, $repo: String!, $expression: String!) {
    repository(owner: $owner, name: $repo) {
      object(expression: $expression) {
        __typename
        ... on Tree {
          entries {
            ...TemplateTreeEntryLevel1
          }
        }
      }
    }
  }

  fragment TemplateTreeEntryLevel1 on TreeEntry {
    name
    type
    object {
      __typename
      ... on Blob {
        text
        isBinary
      }
      ... on Tree {
        entries {
          ...TemplateTreeEntryLevel2
        }
      }
    }
  }

  fragment TemplateTreeEntryLevel2 on TreeEntry {
    name
    type
    object {
      __typename
      ... on Blob {
        text
        isBinary
      }
      ... on Tree {
        entries {
          ...TemplateTreeEntryLevel3
        }
      }
    }
  }

  fragment TemplateTreeEntryLevel3 on TreeEntry {
    name
    type
    object {
      __typename
      ... on Blob {
        text
        isBinary
      }
      ... on Tree {
        entries {
          ...TemplateTreeEntryLevel4
        }
      }
    }
  }

  fragment TemplateTreeEntryLevel4 on TreeEntry {
    name
    type
    object {
      __typename
      ... on Blob {
        text
        isBinary
      }
      ... on Tree {
        entries {
          ...TemplateTreeEntryLevel5
        }
      }
    }
  }

  fragment TemplateTreeEntryLevel5 on TreeEntry {
    name
    type
    object {
      __typename
      ... on Blob {
        text
        isBinary
      }
      ... on Tree {
        entries {
          name
          type
        }
      }
    }
  }
`;
  });
function wm(e) {
  return e instanceof Error ? e.message.includes("Not Found") || e.message.includes("404") : !1;
}
function Q_(e, t) {
  let r = `\u{1F99E} \u57F7\u884C\u5C0F\u9F8D\u8766\u4EFB\u52D9 #${t}`;
  return String(e || "").replace(z_, `$1'${r}'$3`);
}
async function bm(e, t, r, n, s) {
  let i = (await e.repos.getContent({ owner: t, repo: r, path: n, ref: s })).data;
  if (Array.isArray(i) || i.type !== "file")
    throw new Error(`${n} \u4E0D\u662F\u4E00\u500B\u6A94\u6848`);
  return { content: i.encoding === "base64" ? St(i.content) : i.content, sha: i.sha };
}
async function V_(e, t, r, n, s, o, i, a) {
  await e.repos.createOrUpdateFileContents({
    owner: t,
    repo: r,
    path: n,
    message: o,
    content: hs(s),
    branch: i,
    ...(a ? { sha: a } : {}),
  });
}
async function Sr(e, t, r, n, s = "default") {
  let o = "main",
    i = `issue-${n}`,
    a = `templates/${s}/.github/workflows/issue-N.yml`,
    l = `.github/workflows/${i}.yml`,
    c;
  try {
    c = await bm(e, t, r, a, o);
  } catch (w) {
    if (wm(w)) {
      console.log(`Template ${s} does not have ${a}, skipping workflow sync`);
      return;
    }
    throw w;
  }
  let d = Q_(c.content, n);
  d !== c.content
    ? console.log(`\u5DF2\u5C07 ${l} \u7684 workflow name \u6539\u70BA issue #${n}`)
    : console.log(
        `${l} \u672A\u627E\u5230 "name: \u57F7\u884C\u5C0F\u9F8D\u8766\u4EFB\u52D9" \u6A23\u5F0F\uFF0Cworkflow name \u7DAD\u6301\u539F\u6A23`,
      );
  let m;
  try {
    m = await bm(e, t, r, l, o);
  } catch (w) {
    if (!wm(w)) throw w;
  }
  if (m?.content === d) {
    console.log(
      `${l} \u5DF2\u5B58\u5728\u65BC ${o} \u4E14\u5167\u5BB9\u76F8\u540C\uFF0C\u7565\u904E\u540C\u6B65`,
    );
    return;
  }
  (await V_(e, t, r, l, d, `chore: \u6E96\u5099 issue #${n} workflow`, o, m?.sha),
    console.log(`\u5DF2\u5728 ${o} \u540C\u6B65 ${l}`));
}
async function ym(e, t, r, n, s, o) {
  let i = await Ge(t, o);
  if (i !== s) return { changed: !1, nextActiveIssueNumber: i };
  let c =
    (
      await e.issues.listForRepo({
        owner: r,
        repo: n,
        state: "open",
        per_page: 100,
        sort: "created",
        direction: "desc",
      })
    ).data
      .filter((d) => !d.pull_request)
      .find((d) => d.number !== s) ?? null;
  if (!c)
    throw new Error(
      "No remaining open issue after close; last-open protection should have prevented this.",
    );
  return (await rr(t, c.number, o), { changed: !0, nextActiveIssueNumber: c.number });
}
var z_,
  Ps = Oe(() => {
    "use strict";
    mt();
    Yr();
    z_ = /^(\s*name:\s*)(['"]?)(?:🦞\s+)?执行小龙虾任务(?:\s+#[\w\d]+)?\2(\s*)$/m;
  });
function ml(e) {
  if (typeof e != "string") return null;
  let t = e.trim().toLowerCase();
  return ["true", "1", "yes", "y", "on", "enable", "enabled", "\u662F", "\u555F\u7528"].includes(t)
    ? !0
    : ["false", "0", "no", "n", "off", "disable", "disabled", "\u5426", "\u505C\u7528"].includes(t)
      ? !1
      : null;
}
function _m(e, t = !1) {
  if (typeof e == "boolean") return e;
  if (typeof e == "string") {
    let r = e.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on", "enable", "enabled", "\u662F"].includes(r)) return !0;
    if (["false", "0", "no", "n", "off", "disable", "disabled", "\u5426"].includes(r)) return !1;
  }
  return t;
}
function It(e) {
  return typeof e == "string" ? e.trim() : "";
}
function Mn(e) {
  return typeof e != "string"
    ? "(\u672A\u586B\u5BEB)"
    : e.replace(/\s+/g, " ").trim() || "(\u672A\u586B\u5BEB)";
}
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE Ms] new-flow state (part 1)  —  BUSINESS
// ║ New flow state machine (awaiting_name…)
// ╚══════════════════════════════════════════════════════════════════════════════
var Ms = Oe(() => {
  "use strict";
});
function ui(e, t = {}) {
  let r = It(t.fallbackName),
    n = r ? { name: r, description: "" } : null;
  if (typeof e != "string") return n;
  let s = e.match(/```json\s*([\s\S]*?)\s*```/i);
  if (!s) return n;
  try {
    let o = JSON.parse(s[1]);
    if (typeof o != "object" || o === null || Array.isArray(o)) return null;
    let i = o;
    return { name: It(i.name ?? i.title) || r, description: It(i.description) };
  } catch {
    return n;
  }
}
function J_(e) {
  return { name: It(e.name), description: It(e.description) };
}
function ci(e) {
  return [
    `<!-- telegram-meta: ${JSON.stringify(e.meta)} -->`,
    "",
    "```json",
    JSON.stringify(J_(e.agentProfile), null, 2),
    "```",
  ].join(`
`);
}
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE di] new-flow state (part 2)  —  BUSINESS
// ║ New flow state machine (awaiting_description…)
// ╚══════════════════════════════════════════════════════════════════════════════
var di = Oe(() => {
  "use strict";
  Ms();
});
var fl,
  Tm,
  rC,
  km = Oe(() => {
    "use strict";
    _s();
    ((fl = Object.freeze([
      "awaiting_name",
      "awaiting_description",
      "awaiting_template_reset",
      "awaiting_workflow_enabled",
    ])),
      (Tm = Object.freeze({
        awaiting_name: "\u540D\u7A31",
        awaiting_description: "\u63CF\u8FF0",
        awaiting_template_reset: "\u7BC4\u672C",
        awaiting_workflow_enabled: "\u6D3E\u5DE5\u8A2D\u5B9A",
      })),
      (rC = el.map((e) => e.key)));
  });
function Em(e) {
  return Object.hasOwn(Tm, e);
}
function Y_(e) {
  let t = fl.indexOf(e);
  return { step: t >= 0 ? t + 1 : 1, total: fl.length };
}
function X_(e, t) {
  return `(${e}/${t})`;
}
function Z_(e) {
  return e !== !1
    ? "\u555F\u7528\uFF08\u6703\u6D3E\u5DE5\u7D66\u5C0F\u9F8D\u8766\u57F7\u884C\uFF09"
    : "\u505C\u7528\uFF08\u50C5\u6536\u96C6\u8CC7\u6599\u5230 Issue\uFF09";
}
function eT(e) {
  let {
      step: t,
      mode: r = "create",
      name: n = "",
      description: s = "",
      workflowEnabled: o = !0,
      noticeText: i = "",
    } = e,
    a = [],
    l = r === "edit",
    c = Y_(t),
    d = l ? `${X_(c.step, c.total)} ` : "";
  return (
    i && a.push(i, ""),
    t === "awaiting_name"
      ? (l
          ? a.push(
              `\u270F\uFE0F ${d}\u8ACB\u8F38\u5165\u65B0\u7684\u5C0F\u9F8D\u8766\u540D\u7A31`,
              `\u76EE\u524D\u540D\u7A31\uFF1A${Mn(n)}`,
              "",
              "\u{1F446} \u60F3\u4FDD\u7559\u539F\u503C\u5C31\u6309\u300C\u4FDD\u7559\u540D\u7A31\u300D\uFF0C\u60F3\u4E2D\u6B62\u5C31\u6309\u300C\u53D6\u6D88\u300D\u3002",
            )
          : a.push(
              "\u{1F99E} \u8ACB\u8F38\u5165\u9019\u96BB\u5C0F\u9F8D\u8766\u7684\u540D\u7A31",
              "",
              "\u4F8B\u5982\uFF1A\u8A18\u5E33\u5C0F\u9F8D\u8766\u3001\u767C\u7968\u6574\u7406\u3001\u5BA2\u670D\u56DE\u8986",
            ),
        a.join(`
`))
      : t === "awaiting_description"
        ? (l
            ? a.push(
                `\u{1F4DD} ${d}\u8ACB\u8F38\u5165\u300C${Mn(n)}\u300D\u7684\u65B0\u63CF\u8FF0`,
                `\u76EE\u524D\u63CF\u8FF0\uFF1A${Mn(s)}`,
                "",
                "\u{1F446} \u60F3\u4FDD\u7559\u539F\u503C\u5C31\u6309\u300C\u4FDD\u7559\u63CF\u8FF0\u300D\uFF0C\u60F3\u4E2D\u6B62\u5C31\u6309\u300C\u53D6\u6D88\u300D\u3002",
              )
            : a.push(
                `\u{1F4DD} \u8ACB\u8F38\u5165\u300C${Mn(n)}\u300D\u7684\u63CF\u8FF0`,
                "",
                "\u4F8B\u5982\uFF1A\u6574\u7406\u65E5\u5E38\u6536\u652F\u3001\u5206\u985E\u767C\u7968\u3001\u8F38\u51FA\u8A18\u5E33\u6458\u8981",
              ),
          a.join(`
`))
        : t === "awaiting_template"
          ? (a.push(
              "\u{1F4E6} \u8ACB\u9078\u64C7\u5C0F\u9F8D\u8766\u7684\u7BC4\u672C",
              "",
              "\u{1F447} \u9EDE\u9078\u4E0B\u65B9\u6309\u9215\u9078\u64C7\u7BC4\u672C\u3002",
            ),
            a.join(`
`))
          : t === "awaiting_workflow_enabled"
            ? (a.push(
                `\u{1F6A6} ${d}\u8ACB\u8A2D\u5B9A\u300C${Mn(n)}\u300D\u662F\u5426\u555F\u7528\uFF1F`,
                "",
                `\u76EE\u524D\u72C0\u614B\uFF1A${Z_(o)}`,
                "",
                "\u{1F447} \u9019\u4E00\u6B65\u7B49\u540C /enable \u8207 /disable\uFF0C\u4E5F\u53EF\u4EE5\u76F4\u63A5\u6309\u6309\u9215\u5B8C\u6210\u3002",
              ),
              a.join(`
`))
            : t === "awaiting_template_reset"
              ? (a.push(
                  `\u{1F504} ${d}\u662F\u5426\u8981\u91CD\u8A2D\u5C0F\u9F8D\u8766\u7BC4\u672C\uFF1F`,
                  "",
                  "\u9078\u4E00\u500B\u7BC4\u672C\uFF0C\u5C31\u6703\u7528\u9078\u64C7\u7684\u7BC4\u672C\u8986\u84CB\u6389\u76EE\u524D\u7684\u7BC4\u672C\u3002",
                  "\u5982\u679C\u4E0D\u9700\u8981\u91CD\u8A2D\uFF0C\u76F4\u63A5\u6309\u300C\u23ED\uFE0F \u8DF3\u904E\u300D\u5C31\u597D\u3002",
                ),
                a.join(`
`))
              : (a.push(
                  "\u26A0\uFE0F \u5EFA\u7ACB\u6D41\u7A0B\u72C0\u614B\u7570\u5E38\uFF0C\u8ACB\u91CD\u65B0\u4F7F\u7528 /new\u3002",
                ),
                a.join(`
`))
  );
}
function gl(e) {
  let { step: t, mode: r = "create" } = e;
  if (t === "awaiting_template") {
    let n = new F();
    return (n.text(t("kb.cancel", {}, glang()), "new_flow_cancel:current"), n);
  }
  return t === "awaiting_template_reset"
    ? La()
    : r !== "edit"
      ? tp()
      : t === "awaiting_workflow_enabled"
        ? Wd()
        : t === "awaiting_template_reset"
          ? La()
          : jd(t);
}
function yt(e) {
  let t = gl({ step: e.step, mode: e.mode });
  return {
    text: eT({
      step: e.step,
      mode: e.mode,
      name: e.name,
      description: e.description,
      workflowEnabled: e.workflowEnabled,
      template: e.template,
      noticeText: e.noticeText,
    }),
    reply_markup: t,
  };
}
function Sm(e, t) {
  return !t?.number || !t?.title
    ? "\u26A0\uFE0F \u5C0F\u9F8D\u8766\u5B8C\u6210\u6D41\u7A0B\u767C\u751F\u554F\u984C\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"
    : e === "edit"
      ? `\u2705 \u5DF2\u66F4\u65B0\u9F8D\u8766\u300C${t.title}\u300D(#${t.number})`
      : `\u2705 \u5DF2\u5EFA\u7ACB\u9F8D\u8766\u300C${t.title}\u300D(#${t.number})`;
}
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE Im] templates/default handling  —  BUSINESS
// ║ Default template handling
// ╚══════════════════════════════════════════════════════════════════════════════
var Im = Oe(() => {
  "use strict";
  Ie();
  Ve();
  km();
  Ms();
});
var Am = {};
Mu(Am, {
  handleNewFlowCancel: () => kl,
  handleNewFlowEnvCancel: () => gi,
  handleNewFlowEnvSetup: () => mi,
  handleNewFlowEnvSkip: () => fi,
  handleNewFlowKeepField: () => bl,
  handleNewFlowTemplateReset: () => Tl,
  handleNewFlowTemplateSelection: () => yl,
  handleNewFlowTextInput: () => wl,
  handleNewFlowWorkflowStateSelection: () => _l,
  initEditFlow: () => Rm,
  newCommand: () => Gs,
});
function vm(e, t, r) {
  return r === "edit" && e === "-" ? (typeof t == "string" ? t : "") : e;
}
function tT(e, t, r) {
  return e === "-" ? (r === "edit" ? _m(t) : null) : ml(e);
}
function rT(e) {
  return {
    chat_id: e.chat?.id ?? null,
    user_id: e.from?.id ?? null,
    username: e.from?.username ?? null,
    chat_type: e.chat?.type ?? null,
    ts: new Date().toISOString(),
  };
}
function Cm(e) {
  return fm(e)
    ? `\u274C ${e instanceof Error ? e.message : "\u7BC4\u672C\u5C1A\u672A\u5B89\u88DD\u5230\u9F8D\u8766\u5821"}`
    : gm(e)
      ? `\u274C ${e instanceof Error ? e.message : "\u8B80\u53D6\u7BC4\u672C\u5931\u6557"}`
      : "\u274C \u5EFA\u7ACB\u5C0F\u9F8D\u8766\u6642\u767C\u751F\u932F\u8AA4\u3002";
}
function hl() {
  return "\u26A0\uFE0F \u76EE\u524D\u9F8D\u8766\u5821\u5C1A\u672A\u5B89\u88DD\u4EFB\u4F55\u7BC4\u672C\uFF0C\u8ACB\u5148\u7528 /templates \u5B89\u88DD\u3002";
}
function pi(e) {
  return typeof e == "string" && e.trim() !== "" ? e.trim() : "default";
}
async function nT(e, t, r, n, s, o) {
  let i = `issue-${n}`;
  try {
    return (await e.git.getRef({ owner: t, repo: r, ref: `heads/${i}` }), pi(s[0]));
  } catch (c) {
    if (!yr(c)) throw c;
  }
  let a = new Set(),
    l = "default";
  for (let c of s) {
    let d = pi(c);
    if (!a.has(d)) {
      a.add(d);
      try {
        let m = await Er(e, t, r, d, { personality: o });
        l = d;
        let w = m.map((y) => ({ path: y.path, content: y.content }));
        return (
          await Pn(
            e,
            t,
            r,
            i,
            w,
            `chore: \u521D\u59CB\u5316 issue #${n} orphan \u5206\u652F\uFF08\u91CD\u5EFA\uFF0C\u7BC4\u672C\uFF1A${l}\uFF09`,
          ),
          l
        );
      } catch (m) {
        console.warn(
          "[/edit] \u91CD\u5EFA issue \u5206\u652F\u6642\u8B80\u53D6\u7BC4\u672C\u5931\u6557",
          { issueNumber: n, templateName: d, error: m instanceof Error ? m.message : String(m) },
        );
      }
    }
  }
  return (
    await Pn(
      e,
      t,
      r,
      i,
      [{ path: ".gitkeep", content: "" }],
      `chore: \u521D\u59CB\u5316 issue #${n} orphan \u5206\u652F\uFF08\u7121\u7BC4\u672C\u56DE\u9000\uFF09`,
    ),
    l
  );
}
async function sT(e, t, r, n, s) {
  let o = new Set(),
    i = null;
  for (let a of s) {
    let l = pi(a);
    if (!o.has(l)) {
      o.add(l);
      try {
        return (await Sr(e, t, r, n, l), l);
      } catch (c) {
        ((i = c),
          console.warn("[/edit] issue workflow \u540C\u6B65\u5931\u6557", {
            issueNumber: n,
            templateName: l,
            error: c instanceof Error ? c.message : String(c),
          }));
      }
    }
  }
  throw i ?? new Error("\u540C\u6B65 issue workflow \u5931\u6557\u3002");
}
async function Os(e, t) {
  let { octokit: r, store: n, d1: s, config: o } = e.services,
    { owner: i, repo: a, repoFullName: l } = o.github,
    c = e.chat?.id ?? null,
    d = t.mode === "edit" ? "edit" : "create",
    m = Number.isInteger(t.issueNumber) ? t.issueNumber : null,
    w = rT(e),
    y = Kp(t),
    _ = ci({ meta: d === "edit" ? (t.originalTelegramMeta ?? w) : w, agentProfile: y }),
    I = { title: t.name ?? "", body: _ };
  console.log("[/new] \u6E96\u5099\u9001\u51FA\u5C0F\u9F8D\u8766\u8CC7\u6599", {
    chatId: c,
    mode: d,
    targetIssueNumber: m,
  });
  let P = null;
  try {
    if (d === "edit" && m && m > 0) {
      let K = (await Qr(s, l, m))?.template ?? null,
        Ce = [t.template, K, "default"],
        Re = await nT(r, i, a, m, Ce, o.personality || "");
      K || (K = Re);
      let Y = pi(t.template || K || "default");
      await sT(r, i, a, m, [Y, K, "default"]);
      let { data: he } = await r.rest.issues.update({
        owner: i,
        repo: a,
        issue_number: m,
        title: I.title,
        body: I.body,
      });
      if (((P = { number: he.number, title: he.title }), typeof t.workflowEnabled == "boolean")) {
        let ve = `issue-${m}.yml`;
        try {
          let { data: ye } = await r.actions.listRepoWorkflows({ owner: i, repo: a }),
            fe = ye.workflows.find((X) => X.path === `.github/workflows/${ve}`);
          fe &&
            (t.workflowEnabled
              ? await r.actions.enableWorkflow({ owner: i, repo: a, workflow_id: fe.id })
              : await r.actions.disableWorkflow({ owner: i, repo: a, workflow_id: fe.id }));
        } catch (ye) {
          console.warn("[/edit] \u8A2D\u5B9A workflow \u72C0\u614B\u5931\u6557", {
            issueNumber: m,
            error: ye instanceof Error ? ye.message : String(ye),
          });
        }
      }
      if (
        (console.log("[/edit] GitHub Issue \u66F4\u65B0\u6210\u529F", {
          chatId: c,
          issueNumber: P.number,
        }),
        t.resetTemplate)
      ) {
        let ve = t.template || "default",
          ye = o.personality || "";
        try {
          let fe = await Er(r, i, a, ve, { personality: ye });
          (await ai(
            r,
            i,
            a,
            `issue-${m}`,
            fe.map((X) => ({ path: X.path, content: X.content })),
            `chore: \u91CD\u8A2D issue #${m} \u7BC4\u672C\uFF08\u7BC4\u672C\uFF1A${ve}\uFF09`,
          ),
            await Sr(r, i, a, m, ve),
            (K = ve),
            console.log("[/edit] \u7BC4\u672C\u91CD\u8A2D\u6210\u529F", {
              issueNumber: m,
              templateName: ve,
            }));
        } catch (fe) {
          console.warn("[/edit] \u7BC4\u672C\u91CD\u8A2D\u5931\u6557", {
            issueNumber: m,
            error: fe instanceof Error ? fe.message : String(fe),
          });
        }
      }
      await Vr(s, { repo: l, issueNumber: m, template: K });
    } else {
      let { data: U } = await r.rest.issues.create({
        owner: i,
        repo: a,
        title: I.title,
        body: I.body,
      });
      P = { number: U.number, title: U.title };
      let K = t.template || "default",
        Ce = o.personality || "",
        Y = (await Er(r, i, a, K, { personality: Ce })).map((ve) => ({
          path: ve.path,
          content: ve.content,
        })),
        he = `issue-${U.number}`;
      (await Pn(
        r,
        i,
        a,
        he,
        Y,
        `chore: \u521D\u59CB\u5316 issue #${U.number} orphan \u5206\u652F\uFF08\u7BC4\u672C\uFF1A${K}\uFF09`,
      ),
        await Sr(r, i, a, U.number, K),
        await Vr(s, { repo: l, issueNumber: U.number, template: K }),
        console.log("[/new] GitHub Issue \u5EFA\u7ACB\u6210\u529F", {
          chatId: c,
          issueNumber: P.number,
          branch: he,
        }));
    }
    let S = P?.number ?? m ?? null;
    S && c && (await rr(n, S, c));
  } catch (S) {
    throw (
      console.error("[/new] GitHub Issue \u5BEB\u5165\u5931\u6557", {
        chatId: c,
        mode: d,
        issueNumber: m,
        error: S instanceof Error ? S.message : String(S),
      }),
      c && (await Dt(n, c)),
      S
    );
  }
  return (c && (await Dt(n, c)), { issue: P, mode: d });
}
async function Ns(e, t, r) {
  let n = Sm(t.mode, t.issue);
  r === "edit" ? await e.editMessageText(n, { reply_markup: new F() }) : await e.reply(n);
  let s = t.issue?.number;
  if (!(typeof s != "number" || s <= 0))
    try {
      await ks(e, s);
    } catch (o) {
      console.error("[/new] \u50B3\u9001\u72C0\u614B\u5361\u7247\u5931\u6557", {
        issueNumber: s,
        error: o instanceof Error ? o.message : String(o),
      });
    }
}
async function wl(e) {
  let { store: t, octokit: r, config: n } = e.services,
    { owner: s, repo: o } = n.github,
    i = e.chat?.id;
  if (!i) return;
  let a = await Ke(t, i);
  if (!a) return;
  let l = (e.message?.text ?? "").trim(),
    c = a.mode === "edit" ? "edit" : "create";
  if (a.step !== "awaiting_env_input") {
    if (a.step === "awaiting_name") {
      let d = vm(l, a.name, c),
        m = { ...a, step: "awaiting_description", mode: c, name: d };
      await Be(t, i, m);
      let w = yt({
        chatId: i,
        step: "awaiting_description",
        mode: c,
        name: d,
        description: a.description,
        workflowEnabled: a.workflowEnabled,
      });
      await e.reply(w.text, { reply_markup: w.reply_markup });
      return;
    }
    if (a.step === "awaiting_description") {
      let d = vm(l, a.description, c);
      if (c === "edit") {
        let I = { ...a, step: "awaiting_template_reset", mode: "edit", description: d };
        await Be(t, i, I);
        let P = [];
        try {
          P = await tn(r, s, o);
        } catch (K) {
          console.warn("[/edit] \u8B80\u53D6\u7BC4\u672C\u6E05\u55AE\u5931\u6557", {
            error: K instanceof Error ? K.message : String(K),
          });
        }
        if (P.length === 0) {
          await e.reply(hl());
          return;
        }
        let S = Uo(P),
          U = yt({
            chatId: i,
            step: "awaiting_template_reset",
            mode: "edit",
            name: I.name,
            description: d,
            workflowEnabled: a.workflowEnabled,
            template: a.template,
          });
        await e.reply(U.text, { reply_markup: S });
        return;
      }
      let m = { ...a, step: "awaiting_template", mode: "create", description: d };
      await Be(t, i, m);
      let w = [];
      try {
        w = await tn(r, s, o);
      } catch (I) {
        console.warn("[/new] \u8B80\u53D6\u7BC4\u672C\u6E05\u55AE\u5931\u6557", {
          error: I instanceof Error ? I.message : String(I),
        });
      }
      if (w.length === 0) {
        await e.reply(hl());
        return;
      }
      let y = Ua(w);
      y.text(t("kb.cancel", {}, glang()), "new_flow_cancel:current");
      let _ = yt({
        chatId: i,
        step: "awaiting_template",
        mode: "create",
        name: m.name,
        description: d,
        workflowEnabled: a.workflowEnabled,
        template: a.template,
      });
      await e.reply(_.text, { reply_markup: y });
      return;
    }
    if (a.step === "awaiting_template") {
      await e.reply(
        "\u26A0\uFE0F \u8ACB\u7528\u4E0B\u65B9\u6309\u9215\u9078\u64C7\u7BC4\u672C\uFF0C\u6216\u6309\u300C\u53D6\u6D88\u300D\u4E2D\u6B62\u6D41\u7A0B\u3002",
      );
      return;
    }
    if (a.step === "awaiting_template_reset") {
      await e.reply(
        "\u26A0\uFE0F \u8ACB\u7528\u4E0B\u65B9\u6309\u9215\u9078\u64C7\u7BC4\u672C\u6216\u6309\u300C\u8DF3\u904E\u300D\u3002",
      );
      return;
    }
    if (a.step === "awaiting_workflow_enabled") {
      if (a.isSubmitting) {
        await e.reply(
          "\u26A0\uFE0F \u5C0F\u9F8D\u8766\u66F4\u65B0\u4E2D\uFF0C\u8ACB\u7A0D\u5019\uFF0C\u907F\u514D\u91CD\u8907\u9001\u51FA\u3002",
        );
        return;
      }
      let d = tT(l, a.workflowEnabled, c);
      if (d == null) {
        await e.reply(
          "\u26A0\uFE0F \u8ACB\u8F38\u5165\u300C\u555F\u7528 / \u505C\u7528\u300D\uFF0C\u6216\u76F4\u63A5\u6309\u4E0B\u65B9\u6309\u9215\u9078\u64C7\u6D3E\u5DE5\u72C0\u614B\u3002",
          { reply_markup: gl({ step: "awaiting_workflow_enabled", mode: c }) },
        );
        return;
      }
      let m = { ...a, mode: "edit", workflowEnabled: d, isSubmitting: !0 };
      await Be(t, i, m);
      try {
        let w = await Os(e, m);
        await Ns(e, w, "reply");
      } catch (w) {
        (console.error("[/edit] finishNewFlow \u5931\u6557", w),
          await e.reply(
            "\u274C \u66F4\u65B0\u5C0F\u9F8D\u8766\u6642\u767C\u751F\u932F\u8AA4\uFF0C\u8ACB\u91CD\u65B0\u4F7F\u7528 /edit\u3002",
          ));
      }
      return;
    }
    (console.warn("[/new] \u672A\u9810\u671F\u7684\u6587\u5B57\u8F38\u5165\u6B65\u9A5F", {
      chatId: i,
      step: a.step,
    }),
      await e.reply(
        "\u26A0\uFE0F \u5EFA\u7ACB\u6D41\u7A0B\u72C0\u614B\u7570\u5E38\uFF0C\u8ACB\u91CD\u65B0\u4F7F\u7528 /new\u3002",
      ));
  }
}
async function bl(e) {
  let { store: t, octokit: r, config: n } = e.services,
    { owner: s, repo: o } = n.github,
    i = e.chat?.id ?? e.callbackQuery?.message?.chat.id;
  if (!i) return;
  let a = e.callbackQuery?.data?.split(":")[1];
  if (!a) return;
  let l = await Ke(t, i);
  if (!l || l.mode !== "edit" || !Em(l.step)) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u8868\u55AE\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u4F7F\u7528 /new \u6216 /edit",
    );
    return;
  }
  if (a !== l.step) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u8868\u55AE\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u4F7F\u7528 /new \u6216 /edit",
    );
    return;
  }
  if (l.step === "awaiting_workflow_enabled" && l.isSubmitting) return;
  let c = {
    chatId: i,
    mode: "edit",
    name: l.name,
    description: l.description,
    workflowEnabled: l.workflowEnabled,
    template: l.template,
  };
  if (l.step === "awaiting_name") {
    await Be(t, i, { ...l, step: "awaiting_description" });
    let d = yt({ ...c, step: "awaiting_description" });
    (await e.answerCallbackQuery("\u2705 \u5DF2\u4FDD\u7559\u540D\u7A31"),
      await e.editMessageText(d.text, { reply_markup: d.reply_markup }));
    return;
  }
  if (l.step === "awaiting_description") {
    (await Be(t, i, { ...l, step: "awaiting_template_reset" }),
      await e.answerCallbackQuery("\u2705 \u5DF2\u4FDD\u7559\u63CF\u8FF0"));
    let d = [];
    try {
      d = await tn(r, s, o);
    } catch (y) {
      console.warn("[/edit] \u8B80\u53D6\u7BC4\u672C\u6E05\u55AE\u5931\u6557", {
        error: y instanceof Error ? y.message : String(y),
      });
    }
    if (d.length === 0) {
      await e.editMessageText(hl());
      return;
    }
    let m = Uo(d),
      w = yt({ ...c, step: "awaiting_template_reset" });
    await e.editMessageText(w.text, { reply_markup: m });
    return;
  }
  if (l.step === "awaiting_template_reset") {
    await Be(t, i, { ...l, step: "awaiting_workflow_enabled" });
    let d = yt({ ...c, step: "awaiting_workflow_enabled" });
    (await e.answerCallbackQuery("\u23ED\uFE0F \u5DF2\u8DF3\u904E\u7BC4\u672C\u91CD\u8A2D"),
      await e.editMessageText(d.text, { reply_markup: d.reply_markup }));
    return;
  }
  if (l.step === "awaiting_workflow_enabled") {
    let d = { ...l, isSubmitting: !0 };
    (await Be(t, i, d),
      await e.answerCallbackQuery("\u2705 \u5DF2\u4FDD\u7559\u6D3E\u5DE5\u8A2D\u5B9A"));
    try {
      let m = await Os(e, d);
      await Ns(e, m, "edit");
    } catch (m) {
      (console.error("[/edit] finishNewFlow \u4FDD\u7559\u6B04\u4F4D\u5931\u6557", m),
        await e.editMessageText(
          "\u274C \u66F4\u65B0\u5C0F\u9F8D\u8766\u6642\u767C\u751F\u932F\u8AA4\u3002",
        ));
    }
  }
}
async function yl(e) {
  let { store: t, octokit: r, config: n } = e.services,
    { owner: s, repo: o } = n.github,
    i = e.chat?.id ?? e.callbackQuery?.message?.chat.id;
  if (!i) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u6309\u9215\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u64CD\u4F5C",
    );
    return;
  }
  let a = e.callbackQuery?.data?.split(":")[1] ?? "",
    l = await Ke(t, i);
  if (!l || (l.step !== "awaiting_template" && l.step !== "awaiting_template_reset")) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u8868\u55AE\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u4F7F\u7528 /new \u6216 /edit",
    );
    return;
  }
  if (l.isSubmitting) return;
  let c = a.trim();
  if (!c) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u7121\u6548\u7684\u7BC4\u672C\u9078\u64C7");
    return;
  }
  let d = l.mode === "edit" ? "edit" : "create",
    m = { ...l, mode: d, template: c },
    w = [];
  try {
    w = await tn(r, s, o);
  } catch (y) {
    (console.warn(`[/${d}] \u91CD\u65B0\u9A57\u8B49\u7BC4\u672C\u6E05\u55AE\u5931\u6557`, {
      error: y instanceof Error ? y.message : String(y),
    }),
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u76EE\u524D\u7121\u6CD5\u8B80\u53D6\u7BC4\u672C\u6E05\u55AE\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66",
      ));
    return;
  }
  if (!w.includes(c)) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u7BC4\u672C\u5DF2\u4E0D\u5B58\u5728\uFF0C\u8ACB\u91CD\u65B0\u9078\u64C7",
    );
    let y = yt({
        chatId: i,
        step: d === "edit" ? "awaiting_template_reset" : "awaiting_template",
        mode: d,
        name: m.name,
        description: m.description,
        workflowEnabled: m.workflowEnabled,
        template: l.template,
      }),
      _ = d === "edit" ? Uo(w) : Ua(w).text(t("kb.cancel", {}, glang()), "new_flow_cancel:current");
    await e.editMessageText(
      `\u26A0\uFE0F \u7BC4\u672C\u300C${c}\u300D\u76EE\u524D\u4E0D\u5728\u9F8D\u8766\u5821\u5167\uFF0C\u8ACB\u91CD\u65B0\u9078\u64C7\u3002

${y.text}`,
      { reply_markup: _ },
    );
    return;
  }
  if (d === "edit") {
    ((m.step = "awaiting_workflow_enabled"),
      (m.resetTemplate = !0),
      await Be(t, i, m),
      await e.answerCallbackQuery("\u2705 \u5C07\u4EE5\u6B64\u7BC4\u672C\u91CD\u8A2D"));
    let y = yt({
      chatId: i,
      step: "awaiting_workflow_enabled",
      mode: "edit",
      name: m.name,
      description: m.description,
      workflowEnabled: m.workflowEnabled,
      template: m.template,
    });
    await e.editMessageText(y.text, { reply_markup: y.reply_markup });
    return;
  }
  ((m.isSubmitting = !0),
    await Be(t, i, m),
    await e.answerCallbackQuery("\u2705 \u5DF2\u9078\u64C7\u7BC4\u672C"),
    await e.editMessageText(
      "\u23F3 \u6B63\u5728\u5EFA\u7ACB\u5C0F\u9F8D\u8766\uFF0C\u8ACB\u7A0D\u5019\u22EF",
    ));
  try {
    let y = await Os(e, m);
    await Ns(e, y, "edit");
  } catch (y) {
    (console.error("[/new] finishNewFlow \u7BC4\u672C\u9078\u64C7\u5931\u6557", y),
      await e.editMessageText(Cm(y)));
  }
}
async function _l(e) {
  let { store: t } = e.services,
    r = e.chat?.id ?? e.callbackQuery?.message?.chat.id;
  if (!r) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u6309\u9215\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u64CD\u4F5C",
    );
    return;
  }
  let n = e.callbackQuery?.data?.split(":")[1] ?? "",
    s = await Ke(t, r);
  if (!s || s.step !== "awaiting_workflow_enabled") {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u8868\u55AE\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u4F7F\u7528 /new \u6216 /edit",
    );
    return;
  }
  if (s.isSubmitting) return;
  let o = ml(n);
  if (o == null) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u7121\u6548\u7684\u6D3E\u5DE5\u8A2D\u5B9A\u503C");
    return;
  }
  let i = { ...s, workflowEnabled: o, isSubmitting: !0 };
  (await Be(t, r, i),
    await e.answerCallbackQuery(
      o
        ? "\u2705 \u5DF2\u8A2D\u5B9A\u70BA\u555F\u7528\u6D3E\u5DE5"
        : "\u2705 \u5DF2\u8A2D\u5B9A\u70BA\u505C\u7528\u6D3E\u5DE5",
    ));
  try {
    let a = await Os(e, i);
    await Ns(e, a, "edit");
  } catch (a) {
    (console.error("[/edit] finishNewFlow workflow \u9078\u64C7\u5931\u6557", a),
      await e.editMessageText(
        "\u274C \u66F4\u65B0\u5C0F\u9F8D\u8766\u6642\u767C\u751F\u932F\u8AA4\u3002",
      ));
  }
}
async function Tl(e) {
  let { store: t } = e.services,
    r = e.chat?.id ?? e.callbackQuery?.message?.chat.id;
  if (!r) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u6309\u9215\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u64CD\u4F5C",
    );
    return;
  }
  let n = await Ke(t, r);
  if (!n || n.step !== "awaiting_template_reset") {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u8868\u55AE\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u4F7F\u7528 /new \u6216 /edit",
    );
    return;
  }
  if (n.isSubmitting) return;
  let s = { ...n, step: "awaiting_workflow_enabled", resetTemplate: !1 };
  (await Be(t, r, s),
    await e.answerCallbackQuery("\u23ED\uFE0F \u8DF3\u904E\u7BC4\u672C\u91CD\u8A2D"));
  let o = yt({
    chatId: r,
    step: "awaiting_workflow_enabled",
    mode: "edit",
    name: s.name,
    description: s.description,
    workflowEnabled: s.workflowEnabled,
    template: s.template,
  });
  await e.editMessageText(o.text, { reply_markup: o.reply_markup });
}
async function kl(e) {
  let { store: t } = e.services,
    r = e.chat?.id ?? e.callbackQuery?.message?.chat.id;
  if (!r) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u6309\u9215\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u64CD\u4F5C",
    );
    return;
  }
  if (!(await Ke(t, r))) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u8868\u55AE\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u4F7F\u7528 /new \u6216 /edit",
    );
    return;
  }
  (await Dt(t, r),
    await e.answerCallbackQuery("\u{1F6D1} \u5DF2\u53D6\u6D88\u8A2D\u5B9A\u6D41\u7A0B"),
    await e.editMessageText(
      "\u{1F6D1} \u5DF2\u53D6\u6D88\u5C0F\u9F8D\u8766\u8A2D\u5B9A\u6D41\u7A0B\u3002",
      { reply_markup: { inline_keyboard: [] } },
    ));
}
async function mi(e) {
  let { store: t } = e.services,
    r = e.chat?.id ?? e.callbackQuery?.message?.chat.id;
  if (!r) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u6309\u9215\u5DF2\u904E\u671F");
    return;
  }
  let n = await Ke(t, r);
  if (!n || n.step !== "awaiting_env_input") {
    await e.answerCallbackQuery("\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F");
    return;
  }
  let s = n.pendingEnvs ?? [];
  if (s.length === 0) {
    await e.answerCallbackQuery(
      "\u6C92\u6709\u9700\u8981\u8A2D\u5B9A\u7684\u74B0\u5883\u8B8A\u6578",
    );
    return;
  }
  (await e.answerCallbackQuery(),
    await Be(t, r, {
      ...n,
      currentEnvIndex: 0,
      collectedEnvs: {},
      promptMessageId: e.callbackQuery?.message?.message_id,
    }),
    await e.editMessageText(
      `\u{1F511} \u8ACB\u8F38\u5165 *${O(s[0])}* \u7684\u503C

\uFF081/${s.length}\uFF09`,
      { parse_mode: "MarkdownV2", reply_markup: hr(n.mode === "edit" ? "edit_flow" : "new_flow") },
    ));
}
async function fi(e) {
  let { store: t } = e.services,
    r = e.chat?.id ?? e.callbackQuery?.message?.chat.id;
  if (!r) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u6309\u9215\u5DF2\u904E\u671F");
    return;
  }
  let n = await Ke(t, r);
  if (!n) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F");
    return;
  }
  await e.answerCallbackQuery(
    "\u23ED\uFE0F \u5DF2\u7565\u904E\u74B0\u5883\u8B8A\u6578\u8A2D\u5B9A",
  );
  let s = {
    ...n,
    pendingEnvs: void 0,
    collectedEnvs: void 0,
    currentEnvIndex: void 0,
    envCheckDone: !0,
  };
  if (n.mode === "edit") {
    ((s.step = "awaiting_workflow_enabled"), (s.resetTemplate = !0), await Be(t, r, s));
    let o = yt({
      chatId: r,
      step: "awaiting_workflow_enabled",
      mode: "edit",
      name: s.name,
      description: s.description,
      workflowEnabled: s.workflowEnabled,
      template: s.template,
    });
    await e.editMessageText(o.text, { reply_markup: o.reply_markup });
  } else {
    ((s.step = "awaiting_template"), (s.isSubmitting = !0), await Be(t, r, s));
    try {
      let o = await Os(e, s);
      await Ns(e, o, "edit");
    } catch (o) {
      (console.error("[/new] finishNewFlow env skip \u5931\u6557", o),
        await e.editMessageText(Cm(o)));
    }
  }
}
async function gi(e) {
  let { store: t } = e.services,
    r = e.chat?.id ?? e.callbackQuery?.message?.chat.id;
  if (!r) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u6309\u9215\u5DF2\u904E\u671F");
    return;
  }
  (await Dt(t, r),
    await e.answerCallbackQuery("\u5DF2\u53D6\u6D88"),
    await e.editMessageText("\u274C \u5DF2\u53D6\u6D88\u6D41\u7A0B", { reply_markup: new F() }));
}
async function Rm(e) {
  let { octokit: t, store: r, config: n } = e.services,
    { owner: s, repo: o } = n.github,
    i = e.chat?.id ?? e.callbackQuery?.message?.chat.id;
  if (!i) return;
  let a = await Ge(r, i);
  if (!a || a <= 0) {
    await e.reply(
      "\u26A0\uFE0F \u76EE\u524D\u6C92\u6709\u6D3B\u8E8D\u7684\u5C0F\u9F8D\u8766\uFF0C\u5148\u7528 /new \u5EFA\u7ACB\u4E00\u96BB\u6216\u7528 /list \u9078\u64C7\u3002",
    );
    return;
  }
  let l = null;
  try {
    let { data: _ } = await t.rest.issues.get({ owner: s, repo: o, issue_number: a });
    l = { number: _.number, title: _.title, body: _.body ?? null };
  } catch (_) {
    (console.error("[/edit] \u8B80\u53D6 issue \u5931\u6557", {
      chatId: i,
      activeIssueNumber: a,
      error: _ instanceof Error ? _.message : String(_),
    }),
      await e.reply(
        "\u274C \u8B80\u53D6 Issue \u8CC7\u6599\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u8A66\u3002",
      ));
    return;
  }
  let c = await jp(t, s, o, l.number),
    d = ui(l.body, { fallbackName: l.title });
  if (!d) {
    await e.reply(
      "\u26A0\uFE0F \u76EE\u524D\u6D3B\u8E8D\u7684 Issue \u4E0D\u662F\u7528 /new \u5EFA\u7ACB\u7684\u5C0F\u9F8D\u8766\uFF0C\u66AB\u6642\u7121\u6CD5\u7528 /edit \u7DE8\u8F2F\u3002",
    );
    return;
  }
  let m = kr(l.body),
    w = {
      step: "awaiting_name",
      mode: "edit",
      issueNumber: l.number,
      originalTelegramMeta: m,
      name: d.name,
      description: d.description,
      workflowEnabled: c,
    };
  (await Ut(r, i),
    await Be(r, i, w),
    console.log("[/edit] \u9032\u5165\u7B49\u5F85\u540D\u7A31\u968E\u6BB5", {
      chatId: i,
      issueNumber: l.number,
    }));
  let y = yt({
    chatId: i,
    step: "awaiting_name",
    mode: "edit",
    name: w.name,
    description: w.description,
    workflowEnabled: w.workflowEnabled,
    template: w.template,
  });
  await e.reply(y.text, { reply_markup: y.reply_markup });
}
var Gs,
  Fs = Oe(() => {
    "use strict";
    Ie();
    ft();
    mt();
    Pt();
    xs();
    xs();
    li();
    Ps();
    Xr();
    Ms();
    di();
    ar();
    Im();
    Ss();
    Ve();
    Xe();
    ms();
    Gs = new se();
    Gs.command("new", async (e) => {
      let { store: t } = e.services,
        r = e.chat?.id;
      if (!r) return;
      (console.log(
        "[/new] \u6536\u5230 /new \u6307\u4EE4\uFF0C\u9032\u5165\u7B49\u5F85\u540D\u7A31\u968E\u6BB5",
        { chatId: r },
      ),
        await Ut(t, r),
        await Be(t, r, { step: "awaiting_name", mode: "create" }));
      let s = yt({ chatId: r, step: "awaiting_name", mode: "create" });
      await e.reply(s.text, { reply_markup: s.reply_markup });
    });
    Gs.command("edit", async (e) => {
      await Rm(e);
    });
  });
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE cf] crypto PRNG (part)  —  VENDOR
// ║ Random number/crypto (tweetnacl related)
// ╚══════════════════════════════════════════════════════════════════════════════
var cf = zi(() => {});
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE df] tweetnacl (crypto)  —  VENDOR
// ║ NaCl crypto: signature/encryption (npm: tweetnacl)
// ╚══════════════════════════════════════════════════════════════════════════════
var df = zi((YR, Si) => {
  (function (e) {
    "use strict";
    var t = function (p) {
        var g,
          f = new Float64Array(16);
        if (p) for (g = 0; g < p.length; g++) f[g] = p[g];
        return f;
      },
      r = function () {
        throw new Error("no PRNG");
      },
      n = new Uint8Array(16),
      s = new Uint8Array(32);
    s[0] = 9;
    var o = t(),
      i = t([1]),
      a = t([56129, 1]),
      l = t([
        30883, 4953, 19914, 30187, 55467, 16705, 2637, 112, 59544, 30585, 16505, 36039, 65139,
        11119, 27886, 20995,
      ]),
      c = t([
        61785, 9906, 39828, 60374, 45398, 33411, 5274, 224, 53552, 61171, 33010, 6542, 64743, 22239,
        55772, 9222,
      ]),
      d = t([
        54554, 36645, 11616, 51542, 42930, 38181, 51040, 26924, 56412, 64982, 57905, 49316, 21502,
        52590, 14035, 8553,
      ]),
      m = t([
        26200, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214,
        26214, 26214, 26214,
      ]),
      w = t([
        41136, 18958, 6951, 50414, 58488, 44335, 6150, 12099, 55207, 15867, 153, 11085, 57099,
        20417, 9344, 11139,
      ]);
    function y(p, g, f, u) {
      ((p[g] = (f >> 24) & 255),
        (p[g + 1] = (f >> 16) & 255),
        (p[g + 2] = (f >> 8) & 255),
        (p[g + 3] = f & 255),
        (p[g + 4] = (u >> 24) & 255),
        (p[g + 5] = (u >> 16) & 255),
        (p[g + 6] = (u >> 8) & 255),
        (p[g + 7] = u & 255));
    }
    function _(p, g, f, u, h) {
      var T,
        E = 0;
      for (T = 0; T < h; T++) E |= p[g + T] ^ f[u + T];
      return (1 & ((E - 1) >>> 8)) - 1;
    }
    function I(p, g, f, u) {
      return _(p, g, f, u, 16);
    }
    function P(p, g, f, u) {
      return _(p, g, f, u, 32);
    }
    function S(p, g, f, u) {
      for (
        var h = (u[0] & 255) | ((u[1] & 255) << 8) | ((u[2] & 255) << 16) | ((u[3] & 255) << 24),
          T = (f[0] & 255) | ((f[1] & 255) << 8) | ((f[2] & 255) << 16) | ((f[3] & 255) << 24),
          E = (f[4] & 255) | ((f[5] & 255) << 8) | ((f[6] & 255) << 16) | ((f[7] & 255) << 24),
          A = (f[8] & 255) | ((f[9] & 255) << 8) | ((f[10] & 255) << 16) | ((f[11] & 255) << 24),
          G = (f[12] & 255) | ((f[13] & 255) << 8) | ((f[14] & 255) << 16) | ((f[15] & 255) << 24),
          z = (u[4] & 255) | ((u[5] & 255) << 8) | ((u[6] & 255) << 16) | ((u[7] & 255) << 24),
          L = (g[0] & 255) | ((g[1] & 255) << 8) | ((g[2] & 255) << 16) | ((g[3] & 255) << 24),
          ke = (g[4] & 255) | ((g[5] & 255) << 8) | ((g[6] & 255) << 16) | ((g[7] & 255) << 24),
          j = (g[8] & 255) | ((g[9] & 255) << 8) | ((g[10] & 255) << 16) | ((g[11] & 255) << 24),
          Z = (g[12] & 255) | ((g[13] & 255) << 8) | ((g[14] & 255) << 16) | ((g[15] & 255) << 24),
          ee = (u[8] & 255) | ((u[9] & 255) << 8) | ((u[10] & 255) << 16) | ((u[11] & 255) << 24),
          ue = (f[16] & 255) | ((f[17] & 255) << 8) | ((f[18] & 255) << 16) | ((f[19] & 255) << 24),
          ie = (f[20] & 255) | ((f[21] & 255) << 8) | ((f[22] & 255) << 16) | ((f[23] & 255) << 24),
          te = (f[24] & 255) | ((f[25] & 255) << 8) | ((f[26] & 255) << 16) | ((f[27] & 255) << 24),
          ne = (f[28] & 255) | ((f[29] & 255) << 8) | ((f[30] & 255) << 16) | ((f[31] & 255) << 24),
          re = (u[12] & 255) | ((u[13] & 255) << 8) | ((u[14] & 255) << 16) | ((u[15] & 255) << 24),
          W = h,
          Q = T,
          D = E,
          q = A,
          H = G,
          $ = z,
          v = L,
          C = ke,
          M = j,
          R = Z,
          x = ee,
          N = ue,
          J = ie,
          ce = te,
          pe = ne,
          de = re,
          b,
          we = 0;
        we < 20;
        we += 2
      )
        ((b = (W + J) | 0),
          (H ^= (b << 7) | (b >>> 25)),
          (b = (H + W) | 0),
          (M ^= (b << 9) | (b >>> 23)),
          (b = (M + H) | 0),
          (J ^= (b << 13) | (b >>> 19)),
          (b = (J + M) | 0),
          (W ^= (b << 18) | (b >>> 14)),
          (b = ($ + Q) | 0),
          (R ^= (b << 7) | (b >>> 25)),
          (b = (R + $) | 0),
          (ce ^= (b << 9) | (b >>> 23)),
          (b = (ce + R) | 0),
          (Q ^= (b << 13) | (b >>> 19)),
          (b = (Q + ce) | 0),
          ($ ^= (b << 18) | (b >>> 14)),
          (b = (x + v) | 0),
          (pe ^= (b << 7) | (b >>> 25)),
          (b = (pe + x) | 0),
          (D ^= (b << 9) | (b >>> 23)),
          (b = (D + pe) | 0),
          (v ^= (b << 13) | (b >>> 19)),
          (b = (v + D) | 0),
          (x ^= (b << 18) | (b >>> 14)),
          (b = (de + N) | 0),
          (q ^= (b << 7) | (b >>> 25)),
          (b = (q + de) | 0),
          (C ^= (b << 9) | (b >>> 23)),
          (b = (C + q) | 0),
          (N ^= (b << 13) | (b >>> 19)),
          (b = (N + C) | 0),
          (de ^= (b << 18) | (b >>> 14)),
          (b = (W + q) | 0),
          (Q ^= (b << 7) | (b >>> 25)),
          (b = (Q + W) | 0),
          (D ^= (b << 9) | (b >>> 23)),
          (b = (D + Q) | 0),
          (q ^= (b << 13) | (b >>> 19)),
          (b = (q + D) | 0),
          (W ^= (b << 18) | (b >>> 14)),
          (b = ($ + H) | 0),
          (v ^= (b << 7) | (b >>> 25)),
          (b = (v + $) | 0),
          (C ^= (b << 9) | (b >>> 23)),
          (b = (C + v) | 0),
          (H ^= (b << 13) | (b >>> 19)),
          (b = (H + C) | 0),
          ($ ^= (b << 18) | (b >>> 14)),
          (b = (x + R) | 0),
          (N ^= (b << 7) | (b >>> 25)),
          (b = (N + x) | 0),
          (M ^= (b << 9) | (b >>> 23)),
          (b = (M + N) | 0),
          (R ^= (b << 13) | (b >>> 19)),
          (b = (R + M) | 0),
          (x ^= (b << 18) | (b >>> 14)),
          (b = (de + pe) | 0),
          (J ^= (b << 7) | (b >>> 25)),
          (b = (J + de) | 0),
          (ce ^= (b << 9) | (b >>> 23)),
          (b = (ce + J) | 0),
          (pe ^= (b << 13) | (b >>> 19)),
          (b = (pe + ce) | 0),
          (de ^= (b << 18) | (b >>> 14)));
      ((W = (W + h) | 0),
        (Q = (Q + T) | 0),
        (D = (D + E) | 0),
        (q = (q + A) | 0),
        (H = (H + G) | 0),
        ($ = ($ + z) | 0),
        (v = (v + L) | 0),
        (C = (C + ke) | 0),
        (M = (M + j) | 0),
        (R = (R + Z) | 0),
        (x = (x + ee) | 0),
        (N = (N + ue) | 0),
        (J = (J + ie) | 0),
        (ce = (ce + te) | 0),
        (pe = (pe + ne) | 0),
        (de = (de + re) | 0),
        (p[0] = (W >>> 0) & 255),
        (p[1] = (W >>> 8) & 255),
        (p[2] = (W >>> 16) & 255),
        (p[3] = (W >>> 24) & 255),
        (p[4] = (Q >>> 0) & 255),
        (p[5] = (Q >>> 8) & 255),
        (p[6] = (Q >>> 16) & 255),
        (p[7] = (Q >>> 24) & 255),
        (p[8] = (D >>> 0) & 255),
        (p[9] = (D >>> 8) & 255),
        (p[10] = (D >>> 16) & 255),
        (p[11] = (D >>> 24) & 255),
        (p[12] = (q >>> 0) & 255),
        (p[13] = (q >>> 8) & 255),
        (p[14] = (q >>> 16) & 255),
        (p[15] = (q >>> 24) & 255),
        (p[16] = (H >>> 0) & 255),
        (p[17] = (H >>> 8) & 255),
        (p[18] = (H >>> 16) & 255),
        (p[19] = (H >>> 24) & 255),
        (p[20] = ($ >>> 0) & 255),
        (p[21] = ($ >>> 8) & 255),
        (p[22] = ($ >>> 16) & 255),
        (p[23] = ($ >>> 24) & 255),
        (p[24] = (v >>> 0) & 255),
        (p[25] = (v >>> 8) & 255),
        (p[26] = (v >>> 16) & 255),
        (p[27] = (v >>> 24) & 255),
        (p[28] = (C >>> 0) & 255),
        (p[29] = (C >>> 8) & 255),
        (p[30] = (C >>> 16) & 255),
        (p[31] = (C >>> 24) & 255),
        (p[32] = (M >>> 0) & 255),
        (p[33] = (M >>> 8) & 255),
        (p[34] = (M >>> 16) & 255),
        (p[35] = (M >>> 24) & 255),
        (p[36] = (R >>> 0) & 255),
        (p[37] = (R >>> 8) & 255),
        (p[38] = (R >>> 16) & 255),
        (p[39] = (R >>> 24) & 255),
        (p[40] = (x >>> 0) & 255),
        (p[41] = (x >>> 8) & 255),
        (p[42] = (x >>> 16) & 255),
        (p[43] = (x >>> 24) & 255),
        (p[44] = (N >>> 0) & 255),
        (p[45] = (N >>> 8) & 255),
        (p[46] = (N >>> 16) & 255),
        (p[47] = (N >>> 24) & 255),
        (p[48] = (J >>> 0) & 255),
        (p[49] = (J >>> 8) & 255),
        (p[50] = (J >>> 16) & 255),
        (p[51] = (J >>> 24) & 255),
        (p[52] = (ce >>> 0) & 255),
        (p[53] = (ce >>> 8) & 255),
        (p[54] = (ce >>> 16) & 255),
        (p[55] = (ce >>> 24) & 255),
        (p[56] = (pe >>> 0) & 255),
        (p[57] = (pe >>> 8) & 255),
        (p[58] = (pe >>> 16) & 255),
        (p[59] = (pe >>> 24) & 255),
        (p[60] = (de >>> 0) & 255),
        (p[61] = (de >>> 8) & 255),
        (p[62] = (de >>> 16) & 255),
        (p[63] = (de >>> 24) & 255));
    }
    function U(p, g, f, u) {
      for (
        var h = (u[0] & 255) | ((u[1] & 255) << 8) | ((u[2] & 255) << 16) | ((u[3] & 255) << 24),
          T = (f[0] & 255) | ((f[1] & 255) << 8) | ((f[2] & 255) << 16) | ((f[3] & 255) << 24),
          E = (f[4] & 255) | ((f[5] & 255) << 8) | ((f[6] & 255) << 16) | ((f[7] & 255) << 24),
          A = (f[8] & 255) | ((f[9] & 255) << 8) | ((f[10] & 255) << 16) | ((f[11] & 255) << 24),
          G = (f[12] & 255) | ((f[13] & 255) << 8) | ((f[14] & 255) << 16) | ((f[15] & 255) << 24),
          z = (u[4] & 255) | ((u[5] & 255) << 8) | ((u[6] & 255) << 16) | ((u[7] & 255) << 24),
          L = (g[0] & 255) | ((g[1] & 255) << 8) | ((g[2] & 255) << 16) | ((g[3] & 255) << 24),
          ke = (g[4] & 255) | ((g[5] & 255) << 8) | ((g[6] & 255) << 16) | ((g[7] & 255) << 24),
          j = (g[8] & 255) | ((g[9] & 255) << 8) | ((g[10] & 255) << 16) | ((g[11] & 255) << 24),
          Z = (g[12] & 255) | ((g[13] & 255) << 8) | ((g[14] & 255) << 16) | ((g[15] & 255) << 24),
          ee = (u[8] & 255) | ((u[9] & 255) << 8) | ((u[10] & 255) << 16) | ((u[11] & 255) << 24),
          ue = (f[16] & 255) | ((f[17] & 255) << 8) | ((f[18] & 255) << 16) | ((f[19] & 255) << 24),
          ie = (f[20] & 255) | ((f[21] & 255) << 8) | ((f[22] & 255) << 16) | ((f[23] & 255) << 24),
          te = (f[24] & 255) | ((f[25] & 255) << 8) | ((f[26] & 255) << 16) | ((f[27] & 255) << 24),
          ne = (f[28] & 255) | ((f[29] & 255) << 8) | ((f[30] & 255) << 16) | ((f[31] & 255) << 24),
          re = (u[12] & 255) | ((u[13] & 255) << 8) | ((u[14] & 255) << 16) | ((u[15] & 255) << 24),
          W = h,
          Q = T,
          D = E,
          q = A,
          H = G,
          $ = z,
          v = L,
          C = ke,
          M = j,
          R = Z,
          x = ee,
          N = ue,
          J = ie,
          ce = te,
          pe = ne,
          de = re,
          b,
          we = 0;
        we < 20;
        we += 2
      )
        ((b = (W + J) | 0),
          (H ^= (b << 7) | (b >>> 25)),
          (b = (H + W) | 0),
          (M ^= (b << 9) | (b >>> 23)),
          (b = (M + H) | 0),
          (J ^= (b << 13) | (b >>> 19)),
          (b = (J + M) | 0),
          (W ^= (b << 18) | (b >>> 14)),
          (b = ($ + Q) | 0),
          (R ^= (b << 7) | (b >>> 25)),
          (b = (R + $) | 0),
          (ce ^= (b << 9) | (b >>> 23)),
          (b = (ce + R) | 0),
          (Q ^= (b << 13) | (b >>> 19)),
          (b = (Q + ce) | 0),
          ($ ^= (b << 18) | (b >>> 14)),
          (b = (x + v) | 0),
          (pe ^= (b << 7) | (b >>> 25)),
          (b = (pe + x) | 0),
          (D ^= (b << 9) | (b >>> 23)),
          (b = (D + pe) | 0),
          (v ^= (b << 13) | (b >>> 19)),
          (b = (v + D) | 0),
          (x ^= (b << 18) | (b >>> 14)),
          (b = (de + N) | 0),
          (q ^= (b << 7) | (b >>> 25)),
          (b = (q + de) | 0),
          (C ^= (b << 9) | (b >>> 23)),
          (b = (C + q) | 0),
          (N ^= (b << 13) | (b >>> 19)),
          (b = (N + C) | 0),
          (de ^= (b << 18) | (b >>> 14)),
          (b = (W + q) | 0),
          (Q ^= (b << 7) | (b >>> 25)),
          (b = (Q + W) | 0),
          (D ^= (b << 9) | (b >>> 23)),
          (b = (D + Q) | 0),
          (q ^= (b << 13) | (b >>> 19)),
          (b = (q + D) | 0),
          (W ^= (b << 18) | (b >>> 14)),
          (b = ($ + H) | 0),
          (v ^= (b << 7) | (b >>> 25)),
          (b = (v + $) | 0),
          (C ^= (b << 9) | (b >>> 23)),
          (b = (C + v) | 0),
          (H ^= (b << 13) | (b >>> 19)),
          (b = (H + C) | 0),
          ($ ^= (b << 18) | (b >>> 14)),
          (b = (x + R) | 0),
          (N ^= (b << 7) | (b >>> 25)),
          (b = (N + x) | 0),
          (M ^= (b << 9) | (b >>> 23)),
          (b = (M + N) | 0),
          (R ^= (b << 13) | (b >>> 19)),
          (b = (R + M) | 0),
          (x ^= (b << 18) | (b >>> 14)),
          (b = (de + pe) | 0),
          (J ^= (b << 7) | (b >>> 25)),
          (b = (J + de) | 0),
          (ce ^= (b << 9) | (b >>> 23)),
          (b = (ce + J) | 0),
          (pe ^= (b << 13) | (b >>> 19)),
          (b = (pe + ce) | 0),
          (de ^= (b << 18) | (b >>> 14)));
      ((p[0] = (W >>> 0) & 255),
        (p[1] = (W >>> 8) & 255),
        (p[2] = (W >>> 16) & 255),
        (p[3] = (W >>> 24) & 255),
        (p[4] = ($ >>> 0) & 255),
        (p[5] = ($ >>> 8) & 255),
        (p[6] = ($ >>> 16) & 255),
        (p[7] = ($ >>> 24) & 255),
        (p[8] = (x >>> 0) & 255),
        (p[9] = (x >>> 8) & 255),
        (p[10] = (x >>> 16) & 255),
        (p[11] = (x >>> 24) & 255),
        (p[12] = (de >>> 0) & 255),
        (p[13] = (de >>> 8) & 255),
        (p[14] = (de >>> 16) & 255),
        (p[15] = (de >>> 24) & 255),
        (p[16] = (v >>> 0) & 255),
        (p[17] = (v >>> 8) & 255),
        (p[18] = (v >>> 16) & 255),
        (p[19] = (v >>> 24) & 255),
        (p[20] = (C >>> 0) & 255),
        (p[21] = (C >>> 8) & 255),
        (p[22] = (C >>> 16) & 255),
        (p[23] = (C >>> 24) & 255),
        (p[24] = (M >>> 0) & 255),
        (p[25] = (M >>> 8) & 255),
        (p[26] = (M >>> 16) & 255),
        (p[27] = (M >>> 24) & 255),
        (p[28] = (R >>> 0) & 255),
        (p[29] = (R >>> 8) & 255),
        (p[30] = (R >>> 16) & 255),
        (p[31] = (R >>> 24) & 255));
    }
    function K(p, g, f, u) {
      S(p, g, f, u);
    }
    function Ce(p, g, f, u) {
      U(p, g, f, u);
    }
    var Re = new Uint8Array([
      101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107,
    ]);
    function Y(p, g, f, u, h, T, E) {
      var A = new Uint8Array(16),
        G = new Uint8Array(64),
        z,
        L;
      for (L = 0; L < 16; L++) A[L] = 0;
      for (L = 0; L < 8; L++) A[L] = T[L];
      for (; h >= 64;) {
        for (K(G, A, E, Re), L = 0; L < 64; L++) p[g + L] = f[u + L] ^ G[L];
        for (z = 1, L = 8; L < 16; L++)
          ((z = (z + (A[L] & 255)) | 0), (A[L] = z & 255), (z >>>= 8));
        ((h -= 64), (g += 64), (u += 64));
      }
      if (h > 0) for (K(G, A, E, Re), L = 0; L < h; L++) p[g + L] = f[u + L] ^ G[L];
      return 0;
    }
    function he(p, g, f, u, h) {
      var T = new Uint8Array(16),
        E = new Uint8Array(64),
        A,
        G;
      for (G = 0; G < 16; G++) T[G] = 0;
      for (G = 0; G < 8; G++) T[G] = u[G];
      for (; f >= 64;) {
        for (K(E, T, h, Re), G = 0; G < 64; G++) p[g + G] = E[G];
        for (A = 1, G = 8; G < 16; G++)
          ((A = (A + (T[G] & 255)) | 0), (T[G] = A & 255), (A >>>= 8));
        ((f -= 64), (g += 64));
      }
      if (f > 0) for (K(E, T, h, Re), G = 0; G < f; G++) p[g + G] = E[G];
      return 0;
    }
    function ve(p, g, f, u, h) {
      var T = new Uint8Array(32);
      Ce(T, u, h, Re);
      for (var E = new Uint8Array(8), A = 0; A < 8; A++) E[A] = u[A + 16];
      return he(p, g, f, E, T);
    }
    function ye(p, g, f, u, h, T, E) {
      var A = new Uint8Array(32);
      Ce(A, T, E, Re);
      for (var G = new Uint8Array(8), z = 0; z < 8; z++) G[z] = T[z + 16];
      return Y(p, g, f, u, h, G, A);
    }
    var fe = function (p) {
      ((this.buffer = new Uint8Array(16)),
        (this.r = new Uint16Array(10)),
        (this.h = new Uint16Array(10)),
        (this.pad = new Uint16Array(8)),
        (this.leftover = 0),
        (this.fin = 0));
      var g, f, u, h, T, E, A, G;
      ((g = (p[0] & 255) | ((p[1] & 255) << 8)),
        (this.r[0] = g & 8191),
        (f = (p[2] & 255) | ((p[3] & 255) << 8)),
        (this.r[1] = ((g >>> 13) | (f << 3)) & 8191),
        (u = (p[4] & 255) | ((p[5] & 255) << 8)),
        (this.r[2] = ((f >>> 10) | (u << 6)) & 7939),
        (h = (p[6] & 255) | ((p[7] & 255) << 8)),
        (this.r[3] = ((u >>> 7) | (h << 9)) & 8191),
        (T = (p[8] & 255) | ((p[9] & 255) << 8)),
        (this.r[4] = ((h >>> 4) | (T << 12)) & 255),
        (this.r[5] = (T >>> 1) & 8190),
        (E = (p[10] & 255) | ((p[11] & 255) << 8)),
        (this.r[6] = ((T >>> 14) | (E << 2)) & 8191),
        (A = (p[12] & 255) | ((p[13] & 255) << 8)),
        (this.r[7] = ((E >>> 11) | (A << 5)) & 8065),
        (G = (p[14] & 255) | ((p[15] & 255) << 8)),
        (this.r[8] = ((A >>> 8) | (G << 8)) & 8191),
        (this.r[9] = (G >>> 5) & 127),
        (this.pad[0] = (p[16] & 255) | ((p[17] & 255) << 8)),
        (this.pad[1] = (p[18] & 255) | ((p[19] & 255) << 8)),
        (this.pad[2] = (p[20] & 255) | ((p[21] & 255) << 8)),
        (this.pad[3] = (p[22] & 255) | ((p[23] & 255) << 8)),
        (this.pad[4] = (p[24] & 255) | ((p[25] & 255) << 8)),
        (this.pad[5] = (p[26] & 255) | ((p[27] & 255) << 8)),
        (this.pad[6] = (p[28] & 255) | ((p[29] & 255) << 8)),
        (this.pad[7] = (p[30] & 255) | ((p[31] & 255) << 8)));
    };
    ((fe.prototype.blocks = function (p, g, f) {
      for (
        var u = this.fin ? 0 : 2048,
          h,
          T,
          E,
          A,
          G,
          z,
          L,
          ke,
          j,
          Z,
          ee,
          ue,
          ie,
          te,
          ne,
          re,
          W,
          Q,
          D,
          q = this.h[0],
          H = this.h[1],
          $ = this.h[2],
          v = this.h[3],
          C = this.h[4],
          M = this.h[5],
          R = this.h[6],
          x = this.h[7],
          N = this.h[8],
          J = this.h[9],
          ce = this.r[0],
          pe = this.r[1],
          de = this.r[2],
          b = this.r[3],
          we = this.r[4],
          Ee = this.r[5],
          Se = this.r[6],
          ge = this.r[7],
          _e = this.r[8],
          Te = this.r[9];
        f >= 16;
      )
        ((h = (p[g + 0] & 255) | ((p[g + 1] & 255) << 8)),
          (q += h & 8191),
          (T = (p[g + 2] & 255) | ((p[g + 3] & 255) << 8)),
          (H += ((h >>> 13) | (T << 3)) & 8191),
          (E = (p[g + 4] & 255) | ((p[g + 5] & 255) << 8)),
          ($ += ((T >>> 10) | (E << 6)) & 8191),
          (A = (p[g + 6] & 255) | ((p[g + 7] & 255) << 8)),
          (v += ((E >>> 7) | (A << 9)) & 8191),
          (G = (p[g + 8] & 255) | ((p[g + 9] & 255) << 8)),
          (C += ((A >>> 4) | (G << 12)) & 8191),
          (M += (G >>> 1) & 8191),
          (z = (p[g + 10] & 255) | ((p[g + 11] & 255) << 8)),
          (R += ((G >>> 14) | (z << 2)) & 8191),
          (L = (p[g + 12] & 255) | ((p[g + 13] & 255) << 8)),
          (x += ((z >>> 11) | (L << 5)) & 8191),
          (ke = (p[g + 14] & 255) | ((p[g + 15] & 255) << 8)),
          (N += ((L >>> 8) | (ke << 8)) & 8191),
          (J += (ke >>> 5) | u),
          (j = 0),
          (Z = j),
          (Z += q * ce),
          (Z += H * (5 * Te)),
          (Z += $ * (5 * _e)),
          (Z += v * (5 * ge)),
          (Z += C * (5 * Se)),
          (j = Z >>> 13),
          (Z &= 8191),
          (Z += M * (5 * Ee)),
          (Z += R * (5 * we)),
          (Z += x * (5 * b)),
          (Z += N * (5 * de)),
          (Z += J * (5 * pe)),
          (j += Z >>> 13),
          (Z &= 8191),
          (ee = j),
          (ee += q * pe),
          (ee += H * ce),
          (ee += $ * (5 * Te)),
          (ee += v * (5 * _e)),
          (ee += C * (5 * ge)),
          (j = ee >>> 13),
          (ee &= 8191),
          (ee += M * (5 * Se)),
          (ee += R * (5 * Ee)),
          (ee += x * (5 * we)),
          (ee += N * (5 * b)),
          (ee += J * (5 * de)),
          (j += ee >>> 13),
          (ee &= 8191),
          (ue = j),
          (ue += q * de),
          (ue += H * pe),
          (ue += $ * ce),
          (ue += v * (5 * Te)),
          (ue += C * (5 * _e)),
          (j = ue >>> 13),
          (ue &= 8191),
          (ue += M * (5 * ge)),
          (ue += R * (5 * Se)),
          (ue += x * (5 * Ee)),
          (ue += N * (5 * we)),
          (ue += J * (5 * b)),
          (j += ue >>> 13),
          (ue &= 8191),
          (ie = j),
          (ie += q * b),
          (ie += H * de),
          (ie += $ * pe),
          (ie += v * ce),
          (ie += C * (5 * Te)),
          (j = ie >>> 13),
          (ie &= 8191),
          (ie += M * (5 * _e)),
          (ie += R * (5 * ge)),
          (ie += x * (5 * Se)),
          (ie += N * (5 * Ee)),
          (ie += J * (5 * we)),
          (j += ie >>> 13),
          (ie &= 8191),
          (te = j),
          (te += q * we),
          (te += H * b),
          (te += $ * de),
          (te += v * pe),
          (te += C * ce),
          (j = te >>> 13),
          (te &= 8191),
          (te += M * (5 * Te)),
          (te += R * (5 * _e)),
          (te += x * (5 * ge)),
          (te += N * (5 * Se)),
          (te += J * (5 * Ee)),
          (j += te >>> 13),
          (te &= 8191),
          (ne = j),
          (ne += q * Ee),
          (ne += H * we),
          (ne += $ * b),
          (ne += v * de),
          (ne += C * pe),
          (j = ne >>> 13),
          (ne &= 8191),
          (ne += M * ce),
          (ne += R * (5 * Te)),
          (ne += x * (5 * _e)),
          (ne += N * (5 * ge)),
          (ne += J * (5 * Se)),
          (j += ne >>> 13),
          (ne &= 8191),
          (re = j),
          (re += q * Se),
          (re += H * Ee),
          (re += $ * we),
          (re += v * b),
          (re += C * de),
          (j = re >>> 13),
          (re &= 8191),
          (re += M * pe),
          (re += R * ce),
          (re += x * (5 * Te)),
          (re += N * (5 * _e)),
          (re += J * (5 * ge)),
          (j += re >>> 13),
          (re &= 8191),
          (W = j),
          (W += q * ge),
          (W += H * Se),
          (W += $ * Ee),
          (W += v * we),
          (W += C * b),
          (j = W >>> 13),
          (W &= 8191),
          (W += M * de),
          (W += R * pe),
          (W += x * ce),
          (W += N * (5 * Te)),
          (W += J * (5 * _e)),
          (j += W >>> 13),
          (W &= 8191),
          (Q = j),
          (Q += q * _e),
          (Q += H * ge),
          (Q += $ * Se),
          (Q += v * Ee),
          (Q += C * we),
          (j = Q >>> 13),
          (Q &= 8191),
          (Q += M * b),
          (Q += R * de),
          (Q += x * pe),
          (Q += N * ce),
          (Q += J * (5 * Te)),
          (j += Q >>> 13),
          (Q &= 8191),
          (D = j),
          (D += q * Te),
          (D += H * _e),
          (D += $ * ge),
          (D += v * Se),
          (D += C * Ee),
          (j = D >>> 13),
          (D &= 8191),
          (D += M * we),
          (D += R * b),
          (D += x * de),
          (D += N * pe),
          (D += J * ce),
          (j += D >>> 13),
          (D &= 8191),
          (j = ((j << 2) + j) | 0),
          (j = (j + Z) | 0),
          (Z = j & 8191),
          (j = j >>> 13),
          (ee += j),
          (q = Z),
          (H = ee),
          ($ = ue),
          (v = ie),
          (C = te),
          (M = ne),
          (R = re),
          (x = W),
          (N = Q),
          (J = D),
          (g += 16),
          (f -= 16));
      ((this.h[0] = q),
        (this.h[1] = H),
        (this.h[2] = $),
        (this.h[3] = v),
        (this.h[4] = C),
        (this.h[5] = M),
        (this.h[6] = R),
        (this.h[7] = x),
        (this.h[8] = N),
        (this.h[9] = J));
    }),
      (fe.prototype.finish = function (p, g) {
        var f = new Uint16Array(10),
          u,
          h,
          T,
          E;
        if (this.leftover) {
          for (E = this.leftover, this.buffer[E++] = 1; E < 16; E++) this.buffer[E] = 0;
          ((this.fin = 1), this.blocks(this.buffer, 0, 16));
        }
        for (u = this.h[1] >>> 13, this.h[1] &= 8191, E = 2; E < 10; E++)
          ((this.h[E] += u), (u = this.h[E] >>> 13), (this.h[E] &= 8191));
        for (
          this.h[0] += u * 5,
            u = this.h[0] >>> 13,
            this.h[0] &= 8191,
            this.h[1] += u,
            u = this.h[1] >>> 13,
            this.h[1] &= 8191,
            this.h[2] += u,
            f[0] = this.h[0] + 5,
            u = f[0] >>> 13,
            f[0] &= 8191,
            E = 1;
          E < 10;
          E++
        )
          ((f[E] = this.h[E] + u), (u = f[E] >>> 13), (f[E] &= 8191));
        for (f[9] -= 8192, h = (u ^ 1) - 1, E = 0; E < 10; E++) f[E] &= h;
        for (h = ~h, E = 0; E < 10; E++) this.h[E] = (this.h[E] & h) | f[E];
        for (
          this.h[0] = (this.h[0] | (this.h[1] << 13)) & 65535,
            this.h[1] = ((this.h[1] >>> 3) | (this.h[2] << 10)) & 65535,
            this.h[2] = ((this.h[2] >>> 6) | (this.h[3] << 7)) & 65535,
            this.h[3] = ((this.h[3] >>> 9) | (this.h[4] << 4)) & 65535,
            this.h[4] = ((this.h[4] >>> 12) | (this.h[5] << 1) | (this.h[6] << 14)) & 65535,
            this.h[5] = ((this.h[6] >>> 2) | (this.h[7] << 11)) & 65535,
            this.h[6] = ((this.h[7] >>> 5) | (this.h[8] << 8)) & 65535,
            this.h[7] = ((this.h[8] >>> 8) | (this.h[9] << 5)) & 65535,
            T = this.h[0] + this.pad[0],
            this.h[0] = T & 65535,
            E = 1;
          E < 8;
          E++
        )
          ((T = (((this.h[E] + this.pad[E]) | 0) + (T >>> 16)) | 0), (this.h[E] = T & 65535));
        ((p[g + 0] = (this.h[0] >>> 0) & 255),
          (p[g + 1] = (this.h[0] >>> 8) & 255),
          (p[g + 2] = (this.h[1] >>> 0) & 255),
          (p[g + 3] = (this.h[1] >>> 8) & 255),
          (p[g + 4] = (this.h[2] >>> 0) & 255),
          (p[g + 5] = (this.h[2] >>> 8) & 255),
          (p[g + 6] = (this.h[3] >>> 0) & 255),
          (p[g + 7] = (this.h[3] >>> 8) & 255),
          (p[g + 8] = (this.h[4] >>> 0) & 255),
          (p[g + 9] = (this.h[4] >>> 8) & 255),
          (p[g + 10] = (this.h[5] >>> 0) & 255),
          (p[g + 11] = (this.h[5] >>> 8) & 255),
          (p[g + 12] = (this.h[6] >>> 0) & 255),
          (p[g + 13] = (this.h[6] >>> 8) & 255),
          (p[g + 14] = (this.h[7] >>> 0) & 255),
          (p[g + 15] = (this.h[7] >>> 8) & 255));
      }),
      (fe.prototype.update = function (p, g, f) {
        var u, h;
        if (this.leftover) {
          for (h = 16 - this.leftover, h > f && (h = f), u = 0; u < h; u++)
            this.buffer[this.leftover + u] = p[g + u];
          if (((f -= h), (g += h), (this.leftover += h), this.leftover < 16)) return;
          (this.blocks(this.buffer, 0, 16), (this.leftover = 0));
        }
        if ((f >= 16 && ((h = f - (f % 16)), this.blocks(p, g, h), (g += h), (f -= h)), f)) {
          for (u = 0; u < f; u++) this.buffer[this.leftover + u] = p[g + u];
          this.leftover += f;
        }
      }));
    function X(p, g, f, u, h, T) {
      var E = new fe(T);
      return (E.update(f, u, h), E.finish(p, g), 0);
    }
    function Pe(p, g, f, u, h, T) {
      var E = new Uint8Array(16);
      return (X(E, 0, f, u, h, T), I(p, g, E, 0));
    }
    function ut(p, g, f, u, h) {
      var T;
      if (f < 32) return -1;
      for (ye(p, 0, g, 0, f, u, h), X(p, 16, p, 32, f - 32, p), T = 0; T < 16; T++) p[T] = 0;
      return 0;
    }
    function Me(p, g, f, u, h) {
      var T,
        E = new Uint8Array(32);
      if (f < 32 || (ve(E, 0, 32, u, h), Pe(g, 16, g, 32, f - 32, E) !== 0)) return -1;
      for (ye(p, 0, g, 0, f, u, h), T = 0; T < 32; T++) p[T] = 0;
      return 0;
    }
    function Qe(p, g) {
      var f;
      for (f = 0; f < 16; f++) p[f] = g[f] | 0;
    }
    function Pr(p) {
      var g,
        f,
        u = 1;
      for (g = 0; g < 16; g++)
        ((f = p[g] + u + 65535), (u = Math.floor(f / 65536)), (p[g] = f - u * 65536));
      p[0] += u - 1 + 37 * (u - 1);
    }
    function Mt(p, g, f) {
      for (var u, h = ~(f - 1), T = 0; T < 16; T++)
        ((u = h & (p[T] ^ g[T])), (p[T] ^= u), (g[T] ^= u));
    }
    function Ot(p, g) {
      var f,
        u,
        h,
        T = t(),
        E = t();
      for (f = 0; f < 16; f++) E[f] = g[f];
      for (Pr(E), Pr(E), Pr(E), u = 0; u < 2; u++) {
        for (T[0] = E[0] - 65517, f = 1; f < 15; f++)
          ((T[f] = E[f] - 65535 - ((T[f - 1] >> 16) & 1)), (T[f - 1] &= 65535));
        ((T[15] = E[15] - 32767 - ((T[14] >> 16) & 1)),
          (h = (T[15] >> 16) & 1),
          (T[14] &= 65535),
          Mt(E, T, 1 - h));
      }
      for (f = 0; f < 16; f++) ((p[2 * f] = E[f] & 255), (p[2 * f + 1] = E[f] >> 8));
    }
    function ro(p, g) {
      var f = new Uint8Array(32),
        u = new Uint8Array(32);
      return (Ot(f, p), Ot(u, g), P(f, 0, u, 0));
    }
    function ae(p) {
      var g = new Uint8Array(32);
      return (Ot(g, p), g[0] & 1);
    }
    function pt(p, g) {
      var f;
      for (f = 0; f < 16; f++) p[f] = g[2 * f] + (g[2 * f + 1] << 8);
      p[15] &= 32767;
    }
    function Fe(p, g, f) {
      for (var u = 0; u < 16; u++) p[u] = g[u] + f[u];
    }
    function qe(p, g, f) {
      for (var u = 0; u < 16; u++) p[u] = g[u] - f[u];
    }
    function le(p, g, f) {
      var u,
        h,
        T = 0,
        E = 0,
        A = 0,
        G = 0,
        z = 0,
        L = 0,
        ke = 0,
        j = 0,
        Z = 0,
        ee = 0,
        ue = 0,
        ie = 0,
        te = 0,
        ne = 0,
        re = 0,
        W = 0,
        Q = 0,
        D = 0,
        q = 0,
        H = 0,
        $ = 0,
        v = 0,
        C = 0,
        M = 0,
        R = 0,
        x = 0,
        N = 0,
        J = 0,
        ce = 0,
        pe = 0,
        de = 0,
        b = f[0],
        we = f[1],
        Ee = f[2],
        Se = f[3],
        ge = f[4],
        _e = f[5],
        Te = f[6],
        je = f[7],
        Ae = f[8],
        Le = f[9],
        De = f[10],
        Ue = f[11],
        ze = f[12],
        rt = f[13],
        nt = f[14],
        st = f[15];
      ((u = g[0]),
        (T += u * b),
        (E += u * we),
        (A += u * Ee),
        (G += u * Se),
        (z += u * ge),
        (L += u * _e),
        (ke += u * Te),
        (j += u * je),
        (Z += u * Ae),
        (ee += u * Le),
        (ue += u * De),
        (ie += u * Ue),
        (te += u * ze),
        (ne += u * rt),
        (re += u * nt),
        (W += u * st),
        (u = g[1]),
        (E += u * b),
        (A += u * we),
        (G += u * Ee),
        (z += u * Se),
        (L += u * ge),
        (ke += u * _e),
        (j += u * Te),
        (Z += u * je),
        (ee += u * Ae),
        (ue += u * Le),
        (ie += u * De),
        (te += u * Ue),
        (ne += u * ze),
        (re += u * rt),
        (W += u * nt),
        (Q += u * st),
        (u = g[2]),
        (A += u * b),
        (G += u * we),
        (z += u * Ee),
        (L += u * Se),
        (ke += u * ge),
        (j += u * _e),
        (Z += u * Te),
        (ee += u * je),
        (ue += u * Ae),
        (ie += u * Le),
        (te += u * De),
        (ne += u * Ue),
        (re += u * ze),
        (W += u * rt),
        (Q += u * nt),
        (D += u * st),
        (u = g[3]),
        (G += u * b),
        (z += u * we),
        (L += u * Ee),
        (ke += u * Se),
        (j += u * ge),
        (Z += u * _e),
        (ee += u * Te),
        (ue += u * je),
        (ie += u * Ae),
        (te += u * Le),
        (ne += u * De),
        (re += u * Ue),
        (W += u * ze),
        (Q += u * rt),
        (D += u * nt),
        (q += u * st),
        (u = g[4]),
        (z += u * b),
        (L += u * we),
        (ke += u * Ee),
        (j += u * Se),
        (Z += u * ge),
        (ee += u * _e),
        (ue += u * Te),
        (ie += u * je),
        (te += u * Ae),
        (ne += u * Le),
        (re += u * De),
        (W += u * Ue),
        (Q += u * ze),
        (D += u * rt),
        (q += u * nt),
        (H += u * st),
        (u = g[5]),
        (L += u * b),
        (ke += u * we),
        (j += u * Ee),
        (Z += u * Se),
        (ee += u * ge),
        (ue += u * _e),
        (ie += u * Te),
        (te += u * je),
        (ne += u * Ae),
        (re += u * Le),
        (W += u * De),
        (Q += u * Ue),
        (D += u * ze),
        (q += u * rt),
        (H += u * nt),
        ($ += u * st),
        (u = g[6]),
        (ke += u * b),
        (j += u * we),
        (Z += u * Ee),
        (ee += u * Se),
        (ue += u * ge),
        (ie += u * _e),
        (te += u * Te),
        (ne += u * je),
        (re += u * Ae),
        (W += u * Le),
        (Q += u * De),
        (D += u * Ue),
        (q += u * ze),
        (H += u * rt),
        ($ += u * nt),
        (v += u * st),
        (u = g[7]),
        (j += u * b),
        (Z += u * we),
        (ee += u * Ee),
        (ue += u * Se),
        (ie += u * ge),
        (te += u * _e),
        (ne += u * Te),
        (re += u * je),
        (W += u * Ae),
        (Q += u * Le),
        (D += u * De),
        (q += u * Ue),
        (H += u * ze),
        ($ += u * rt),
        (v += u * nt),
        (C += u * st),
        (u = g[8]),
        (Z += u * b),
        (ee += u * we),
        (ue += u * Ee),
        (ie += u * Se),
        (te += u * ge),
        (ne += u * _e),
        (re += u * Te),
        (W += u * je),
        (Q += u * Ae),
        (D += u * Le),
        (q += u * De),
        (H += u * Ue),
        ($ += u * ze),
        (v += u * rt),
        (C += u * nt),
        (M += u * st),
        (u = g[9]),
        (ee += u * b),
        (ue += u * we),
        (ie += u * Ee),
        (te += u * Se),
        (ne += u * ge),
        (re += u * _e),
        (W += u * Te),
        (Q += u * je),
        (D += u * Ae),
        (q += u * Le),
        (H += u * De),
        ($ += u * Ue),
        (v += u * ze),
        (C += u * rt),
        (M += u * nt),
        (R += u * st),
        (u = g[10]),
        (ue += u * b),
        (ie += u * we),
        (te += u * Ee),
        (ne += u * Se),
        (re += u * ge),
        (W += u * _e),
        (Q += u * Te),
        (D += u * je),
        (q += u * Ae),
        (H += u * Le),
        ($ += u * De),
        (v += u * Ue),
        (C += u * ze),
        (M += u * rt),
        (R += u * nt),
        (x += u * st),
        (u = g[11]),
        (ie += u * b),
        (te += u * we),
        (ne += u * Ee),
        (re += u * Se),
        (W += u * ge),
        (Q += u * _e),
        (D += u * Te),
        (q += u * je),
        (H += u * Ae),
        ($ += u * Le),
        (v += u * De),
        (C += u * Ue),
        (M += u * ze),
        (R += u * rt),
        (x += u * nt),
        (N += u * st),
        (u = g[12]),
        (te += u * b),
        (ne += u * we),
        (re += u * Ee),
        (W += u * Se),
        (Q += u * ge),
        (D += u * _e),
        (q += u * Te),
        (H += u * je),
        ($ += u * Ae),
        (v += u * Le),
        (C += u * De),
        (M += u * Ue),
        (R += u * ze),
        (x += u * rt),
        (N += u * nt),
        (J += u * st),
        (u = g[13]),
        (ne += u * b),
        (re += u * we),
        (W += u * Ee),
        (Q += u * Se),
        (D += u * ge),
        (q += u * _e),
        (H += u * Te),
        ($ += u * je),
        (v += u * Ae),
        (C += u * Le),
        (M += u * De),
        (R += u * Ue),
        (x += u * ze),
        (N += u * rt),
        (J += u * nt),
        (ce += u * st),
        (u = g[14]),
        (re += u * b),
        (W += u * we),
        (Q += u * Ee),
        (D += u * Se),
        (q += u * ge),
        (H += u * _e),
        ($ += u * Te),
        (v += u * je),
        (C += u * Ae),
        (M += u * Le),
        (R += u * De),
        (x += u * Ue),
        (N += u * ze),
        (J += u * rt),
        (ce += u * nt),
        (pe += u * st),
        (u = g[15]),
        (W += u * b),
        (Q += u * we),
        (D += u * Ee),
        (q += u * Se),
        (H += u * ge),
        ($ += u * _e),
        (v += u * Te),
        (C += u * je),
        (M += u * Ae),
        (R += u * Le),
        (x += u * De),
        (N += u * Ue),
        (J += u * ze),
        (ce += u * rt),
        (pe += u * nt),
        (de += u * st),
        (T += 38 * Q),
        (E += 38 * D),
        (A += 38 * q),
        (G += 38 * H),
        (z += 38 * $),
        (L += 38 * v),
        (ke += 38 * C),
        (j += 38 * M),
        (Z += 38 * R),
        (ee += 38 * x),
        (ue += 38 * N),
        (ie += 38 * J),
        (te += 38 * ce),
        (ne += 38 * pe),
        (re += 38 * de),
        (h = 1),
        (u = T + h + 65535),
        (h = Math.floor(u / 65536)),
        (T = u - h * 65536),
        (u = E + h + 65535),
        (h = Math.floor(u / 65536)),
        (E = u - h * 65536),
        (u = A + h + 65535),
        (h = Math.floor(u / 65536)),
        (A = u - h * 65536),
        (u = G + h + 65535),
        (h = Math.floor(u / 65536)),
        (G = u - h * 65536),
        (u = z + h + 65535),
        (h = Math.floor(u / 65536)),
        (z = u - h * 65536),
        (u = L + h + 65535),
        (h = Math.floor(u / 65536)),
        (L = u - h * 65536),
        (u = ke + h + 65535),
        (h = Math.floor(u / 65536)),
        (ke = u - h * 65536),
        (u = j + h + 65535),
        (h = Math.floor(u / 65536)),
        (j = u - h * 65536),
        (u = Z + h + 65535),
        (h = Math.floor(u / 65536)),
        (Z = u - h * 65536),
        (u = ee + h + 65535),
        (h = Math.floor(u / 65536)),
        (ee = u - h * 65536),
        (u = ue + h + 65535),
        (h = Math.floor(u / 65536)),
        (ue = u - h * 65536),
        (u = ie + h + 65535),
        (h = Math.floor(u / 65536)),
        (ie = u - h * 65536),
        (u = te + h + 65535),
        (h = Math.floor(u / 65536)),
        (te = u - h * 65536),
        (u = ne + h + 65535),
        (h = Math.floor(u / 65536)),
        (ne = u - h * 65536),
        (u = re + h + 65535),
        (h = Math.floor(u / 65536)),
        (re = u - h * 65536),
        (u = W + h + 65535),
        (h = Math.floor(u / 65536)),
        (W = u - h * 65536),
        (T += h - 1 + 37 * (h - 1)),
        (h = 1),
        (u = T + h + 65535),
        (h = Math.floor(u / 65536)),
        (T = u - h * 65536),
        (u = E + h + 65535),
        (h = Math.floor(u / 65536)),
        (E = u - h * 65536),
        (u = A + h + 65535),
        (h = Math.floor(u / 65536)),
        (A = u - h * 65536),
        (u = G + h + 65535),
        (h = Math.floor(u / 65536)),
        (G = u - h * 65536),
        (u = z + h + 65535),
        (h = Math.floor(u / 65536)),
        (z = u - h * 65536),
        (u = L + h + 65535),
        (h = Math.floor(u / 65536)),
        (L = u - h * 65536),
        (u = ke + h + 65535),
        (h = Math.floor(u / 65536)),
        (ke = u - h * 65536),
        (u = j + h + 65535),
        (h = Math.floor(u / 65536)),
        (j = u - h * 65536),
        (u = Z + h + 65535),
        (h = Math.floor(u / 65536)),
        (Z = u - h * 65536),
        (u = ee + h + 65535),
        (h = Math.floor(u / 65536)),
        (ee = u - h * 65536),
        (u = ue + h + 65535),
        (h = Math.floor(u / 65536)),
        (ue = u - h * 65536),
        (u = ie + h + 65535),
        (h = Math.floor(u / 65536)),
        (ie = u - h * 65536),
        (u = te + h + 65535),
        (h = Math.floor(u / 65536)),
        (te = u - h * 65536),
        (u = ne + h + 65535),
        (h = Math.floor(u / 65536)),
        (ne = u - h * 65536),
        (u = re + h + 65535),
        (h = Math.floor(u / 65536)),
        (re = u - h * 65536),
        (u = W + h + 65535),
        (h = Math.floor(u / 65536)),
        (W = u - h * 65536),
        (T += h - 1 + 37 * (h - 1)),
        (p[0] = T),
        (p[1] = E),
        (p[2] = A),
        (p[3] = G),
        (p[4] = z),
        (p[5] = L),
        (p[6] = ke),
        (p[7] = j),
        (p[8] = Z),
        (p[9] = ee),
        (p[10] = ue),
        (p[11] = ie),
        (p[12] = te),
        (p[13] = ne),
        (p[14] = re),
        (p[15] = W));
    }
    function tt(p, g) {
      le(p, g, g);
    }
    function _u(p, g) {
      var f = t(),
        u;
      for (u = 0; u < 16; u++) f[u] = g[u];
      for (u = 253; u >= 0; u--) (tt(f, f), u !== 2 && u !== 4 && le(f, f, g));
      for (u = 0; u < 16; u++) p[u] = f[u];
    }
    function Tu(p, g) {
      var f = t(),
        u;
      for (u = 0; u < 16; u++) f[u] = g[u];
      for (u = 250; u >= 0; u--) (tt(f, f), u !== 1 && le(f, f, g));
      for (u = 0; u < 16; u++) p[u] = f[u];
    }
    function no(p, g, f) {
      var u = new Uint8Array(32),
        h = new Float64Array(80),
        T,
        E,
        A = t(),
        G = t(),
        z = t(),
        L = t(),
        ke = t(),
        j = t();
      for (E = 0; E < 31; E++) u[E] = g[E];
      for (u[31] = (g[31] & 127) | 64, u[0] &= 248, pt(h, f), E = 0; E < 16; E++)
        ((G[E] = h[E]), (L[E] = A[E] = z[E] = 0));
      for (A[0] = L[0] = 1, E = 254; E >= 0; --E)
        ((T = (u[E >>> 3] >>> (E & 7)) & 1),
          Mt(A, G, T),
          Mt(z, L, T),
          Fe(ke, A, z),
          qe(A, A, z),
          Fe(z, G, L),
          qe(G, G, L),
          tt(L, ke),
          tt(j, A),
          le(A, z, A),
          le(z, G, ke),
          Fe(ke, A, z),
          qe(A, A, z),
          tt(G, A),
          qe(z, L, j),
          le(A, z, a),
          Fe(A, A, L),
          le(z, z, A),
          le(A, L, j),
          le(L, G, h),
          tt(G, ke),
          Mt(A, G, T),
          Mt(z, L, T));
      for (E = 0; E < 16; E++)
        ((h[E + 16] = A[E]), (h[E + 32] = z[E]), (h[E + 48] = G[E]), (h[E + 64] = L[E]));
      var Z = h.subarray(32),
        ee = h.subarray(16);
      return (_u(Z, Z), le(ee, ee, Z), Ot(p, ee), 0);
    }
    function so(p, g) {
      return no(p, g, s);
    }
    function ku(p, g) {
      return (r(g, 32), so(p, g));
    }
    function oo(p, g, f) {
      var u = new Uint8Array(32);
      return (no(u, f, g), Ce(p, n, u, Re));
    }
    var Eu = ut,
      Fg = Me;
    function $g(p, g, f, u, h, T) {
      var E = new Uint8Array(32);
      return (oo(E, h, T), Eu(p, g, f, u, E));
    }
    function Lg(p, g, f, u, h, T) {
      var E = new Uint8Array(32);
      return (oo(E, h, T), Fg(p, g, f, u, E));
    }
    var Su = [
      1116352408, 3609767458, 1899447441, 602891725, 3049323471, 3964484399, 3921009573, 2173295548,
      961987163, 4081628472, 1508970993, 3053834265, 2453635748, 2937671579, 2870763221, 3664609560,
      3624381080, 2734883394, 310598401, 1164996542, 607225278, 1323610764, 1426881987, 3590304994,
      1925078388, 4068182383, 2162078206, 991336113, 2614888103, 633803317, 3248222580, 3479774868,
      3835390401, 2666613458, 4022224774, 944711139, 264347078, 2341262773, 604807628, 2007800933,
      770255983, 1495990901, 1249150122, 1856431235, 1555081692, 3175218132, 1996064986, 2198950837,
      2554220882, 3999719339, 2821834349, 766784016, 2952996808, 2566594879, 3210313671, 3203337956,
      3336571891, 1034457026, 3584528711, 2466948901, 113926993, 3758326383, 338241895, 168717936,
      666307205, 1188179964, 773529912, 1546045734, 1294757372, 1522805485, 1396182291, 2643833823,
      1695183700, 2343527390, 1986661051, 1014477480, 2177026350, 1206759142, 2456956037, 344077627,
      2730485921, 1290863460, 2820302411, 3158454273, 3259730800, 3505952657, 3345764771, 106217008,
      3516065817, 3606008344, 3600352804, 1432725776, 4094571909, 1467031594, 275423344, 851169720,
      430227734, 3100823752, 506948616, 1363258195, 659060556, 3750685593, 883997877, 3785050280,
      958139571, 3318307427, 1322822218, 3812723403, 1537002063, 2003034995, 1747873779, 3602036899,
      1955562222, 1575990012, 2024104815, 1125592928, 2227730452, 2716904306, 2361852424, 442776044,
      2428436474, 593698344, 2756734187, 3733110249, 3204031479, 2999351573, 3329325298, 3815920427,
      3391569614, 3928383900, 3515267271, 566280711, 3940187606, 3454069534, 4118630271, 4000239992,
      116418474, 1914138554, 174292421, 2731055270, 289380356, 3203993006, 460393269, 320620315,
      685471733, 587496836, 852142971, 1086792851, 1017036298, 365543100, 1126000580, 2618297676,
      1288033470, 3409855158, 1501505948, 4234509866, 1607167915, 987167468, 1816402316, 1246189591,
    ];
    function Iu(p, g, f, u) {
      for (
        var h = new Int32Array(16),
          T = new Int32Array(16),
          E,
          A,
          G,
          z,
          L,
          ke,
          j,
          Z,
          ee,
          ue,
          ie,
          te,
          ne,
          re,
          W,
          Q,
          D,
          q,
          H,
          $,
          v,
          C,
          M,
          R,
          x,
          N,
          J = p[0],
          ce = p[1],
          pe = p[2],
          de = p[3],
          b = p[4],
          we = p[5],
          Ee = p[6],
          Se = p[7],
          ge = g[0],
          _e = g[1],
          Te = g[2],
          je = g[3],
          Ae = g[4],
          Le = g[5],
          De = g[6],
          Ue = g[7],
          ze = 0;
        u >= 128;
      ) {
        for (H = 0; H < 16; H++)
          (($ = 8 * H + ze),
            (h[H] = (f[$ + 0] << 24) | (f[$ + 1] << 16) | (f[$ + 2] << 8) | f[$ + 3]),
            (T[H] = (f[$ + 4] << 24) | (f[$ + 5] << 16) | (f[$ + 6] << 8) | f[$ + 7]));
        for (H = 0; H < 80; H++)
          if (
            ((E = J),
            (A = ce),
            (G = pe),
            (z = de),
            (L = b),
            (ke = we),
            (j = Ee),
            (Z = Se),
            (ee = ge),
            (ue = _e),
            (ie = Te),
            (te = je),
            (ne = Ae),
            (re = Le),
            (W = De),
            (Q = Ue),
            (v = Se),
            (C = Ue),
            (M = C & 65535),
            (R = C >>> 16),
            (x = v & 65535),
            (N = v >>> 16),
            (v = ((b >>> 14) | (Ae << 18)) ^ ((b >>> 18) | (Ae << 14)) ^ ((Ae >>> 9) | (b << 23))),
            (C = ((Ae >>> 14) | (b << 18)) ^ ((Ae >>> 18) | (b << 14)) ^ ((b >>> 9) | (Ae << 23))),
            (M += C & 65535),
            (R += C >>> 16),
            (x += v & 65535),
            (N += v >>> 16),
            (v = (b & we) ^ (~b & Ee)),
            (C = (Ae & Le) ^ (~Ae & De)),
            (M += C & 65535),
            (R += C >>> 16),
            (x += v & 65535),
            (N += v >>> 16),
            (v = Su[H * 2]),
            (C = Su[H * 2 + 1]),
            (M += C & 65535),
            (R += C >>> 16),
            (x += v & 65535),
            (N += v >>> 16),
            (v = h[H % 16]),
            (C = T[H % 16]),
            (M += C & 65535),
            (R += C >>> 16),
            (x += v & 65535),
            (N += v >>> 16),
            (R += M >>> 16),
            (x += R >>> 16),
            (N += x >>> 16),
            (D = (x & 65535) | (N << 16)),
            (q = (M & 65535) | (R << 16)),
            (v = D),
            (C = q),
            (M = C & 65535),
            (R = C >>> 16),
            (x = v & 65535),
            (N = v >>> 16),
            (v = ((J >>> 28) | (ge << 4)) ^ ((ge >>> 2) | (J << 30)) ^ ((ge >>> 7) | (J << 25))),
            (C = ((ge >>> 28) | (J << 4)) ^ ((J >>> 2) | (ge << 30)) ^ ((J >>> 7) | (ge << 25))),
            (M += C & 65535),
            (R += C >>> 16),
            (x += v & 65535),
            (N += v >>> 16),
            (v = (J & ce) ^ (J & pe) ^ (ce & pe)),
            (C = (ge & _e) ^ (ge & Te) ^ (_e & Te)),
            (M += C & 65535),
            (R += C >>> 16),
            (x += v & 65535),
            (N += v >>> 16),
            (R += M >>> 16),
            (x += R >>> 16),
            (N += x >>> 16),
            (Z = (x & 65535) | (N << 16)),
            (Q = (M & 65535) | (R << 16)),
            (v = z),
            (C = te),
            (M = C & 65535),
            (R = C >>> 16),
            (x = v & 65535),
            (N = v >>> 16),
            (v = D),
            (C = q),
            (M += C & 65535),
            (R += C >>> 16),
            (x += v & 65535),
            (N += v >>> 16),
            (R += M >>> 16),
            (x += R >>> 16),
            (N += x >>> 16),
            (z = (x & 65535) | (N << 16)),
            (te = (M & 65535) | (R << 16)),
            (ce = E),
            (pe = A),
            (de = G),
            (b = z),
            (we = L),
            (Ee = ke),
            (Se = j),
            (J = Z),
            (_e = ee),
            (Te = ue),
            (je = ie),
            (Ae = te),
            (Le = ne),
            (De = re),
            (Ue = W),
            (ge = Q),
            H % 16 === 15)
          )
            for ($ = 0; $ < 16; $++)
              ((v = h[$]),
                (C = T[$]),
                (M = C & 65535),
                (R = C >>> 16),
                (x = v & 65535),
                (N = v >>> 16),
                (v = h[($ + 9) % 16]),
                (C = T[($ + 9) % 16]),
                (M += C & 65535),
                (R += C >>> 16),
                (x += v & 65535),
                (N += v >>> 16),
                (D = h[($ + 1) % 16]),
                (q = T[($ + 1) % 16]),
                (v = ((D >>> 1) | (q << 31)) ^ ((D >>> 8) | (q << 24)) ^ (D >>> 7)),
                (C = ((q >>> 1) | (D << 31)) ^ ((q >>> 8) | (D << 24)) ^ ((q >>> 7) | (D << 25))),
                (M += C & 65535),
                (R += C >>> 16),
                (x += v & 65535),
                (N += v >>> 16),
                (D = h[($ + 14) % 16]),
                (q = T[($ + 14) % 16]),
                (v = ((D >>> 19) | (q << 13)) ^ ((q >>> 29) | (D << 3)) ^ (D >>> 6)),
                (C = ((q >>> 19) | (D << 13)) ^ ((D >>> 29) | (q << 3)) ^ ((q >>> 6) | (D << 26))),
                (M += C & 65535),
                (R += C >>> 16),
                (x += v & 65535),
                (N += v >>> 16),
                (R += M >>> 16),
                (x += R >>> 16),
                (N += x >>> 16),
                (h[$] = (x & 65535) | (N << 16)),
                (T[$] = (M & 65535) | (R << 16)));
        ((v = J),
          (C = ge),
          (M = C & 65535),
          (R = C >>> 16),
          (x = v & 65535),
          (N = v >>> 16),
          (v = p[0]),
          (C = g[0]),
          (M += C & 65535),
          (R += C >>> 16),
          (x += v & 65535),
          (N += v >>> 16),
          (R += M >>> 16),
          (x += R >>> 16),
          (N += x >>> 16),
          (p[0] = J = (x & 65535) | (N << 16)),
          (g[0] = ge = (M & 65535) | (R << 16)),
          (v = ce),
          (C = _e),
          (M = C & 65535),
          (R = C >>> 16),
          (x = v & 65535),
          (N = v >>> 16),
          (v = p[1]),
          (C = g[1]),
          (M += C & 65535),
          (R += C >>> 16),
          (x += v & 65535),
          (N += v >>> 16),
          (R += M >>> 16),
          (x += R >>> 16),
          (N += x >>> 16),
          (p[1] = ce = (x & 65535) | (N << 16)),
          (g[1] = _e = (M & 65535) | (R << 16)),
          (v = pe),
          (C = Te),
          (M = C & 65535),
          (R = C >>> 16),
          (x = v & 65535),
          (N = v >>> 16),
          (v = p[2]),
          (C = g[2]),
          (M += C & 65535),
          (R += C >>> 16),
          (x += v & 65535),
          (N += v >>> 16),
          (R += M >>> 16),
          (x += R >>> 16),
          (N += x >>> 16),
          (p[2] = pe = (x & 65535) | (N << 16)),
          (g[2] = Te = (M & 65535) | (R << 16)),
          (v = de),
          (C = je),
          (M = C & 65535),
          (R = C >>> 16),
          (x = v & 65535),
          (N = v >>> 16),
          (v = p[3]),
          (C = g[3]),
          (M += C & 65535),
          (R += C >>> 16),
          (x += v & 65535),
          (N += v >>> 16),
          (R += M >>> 16),
          (x += R >>> 16),
          (N += x >>> 16),
          (p[3] = de = (x & 65535) | (N << 16)),
          (g[3] = je = (M & 65535) | (R << 16)),
          (v = b),
          (C = Ae),
          (M = C & 65535),
          (R = C >>> 16),
          (x = v & 65535),
          (N = v >>> 16),
          (v = p[4]),
          (C = g[4]),
          (M += C & 65535),
          (R += C >>> 16),
          (x += v & 65535),
          (N += v >>> 16),
          (R += M >>> 16),
          (x += R >>> 16),
          (N += x >>> 16),
          (p[4] = b = (x & 65535) | (N << 16)),
          (g[4] = Ae = (M & 65535) | (R << 16)),
          (v = we),
          (C = Le),
          (M = C & 65535),
          (R = C >>> 16),
          (x = v & 65535),
          (N = v >>> 16),
          (v = p[5]),
          (C = g[5]),
          (M += C & 65535),
          (R += C >>> 16),
          (x += v & 65535),
          (N += v >>> 16),
          (R += M >>> 16),
          (x += R >>> 16),
          (N += x >>> 16),
          (p[5] = we = (x & 65535) | (N << 16)),
          (g[5] = Le = (M & 65535) | (R << 16)),
          (v = Ee),
          (C = De),
          (M = C & 65535),
          (R = C >>> 16),
          (x = v & 65535),
          (N = v >>> 16),
          (v = p[6]),
          (C = g[6]),
          (M += C & 65535),
          (R += C >>> 16),
          (x += v & 65535),
          (N += v >>> 16),
          (R += M >>> 16),
          (x += R >>> 16),
          (N += x >>> 16),
          (p[6] = Ee = (x & 65535) | (N << 16)),
          (g[6] = De = (M & 65535) | (R << 16)),
          (v = Se),
          (C = Ue),
          (M = C & 65535),
          (R = C >>> 16),
          (x = v & 65535),
          (N = v >>> 16),
          (v = p[7]),
          (C = g[7]),
          (M += C & 65535),
          (R += C >>> 16),
          (x += v & 65535),
          (N += v >>> 16),
          (R += M >>> 16),
          (x += R >>> 16),
          (N += x >>> 16),
          (p[7] = Se = (x & 65535) | (N << 16)),
          (g[7] = Ue = (M & 65535) | (R << 16)),
          (ze += 128),
          (u -= 128));
      }
      return u;
    }
    function Mr(p, g, f) {
      var u = new Int32Array(8),
        h = new Int32Array(8),
        T = new Uint8Array(256),
        E,
        A = f;
      for (
        u[0] = 1779033703,
          u[1] = 3144134277,
          u[2] = 1013904242,
          u[3] = 2773480762,
          u[4] = 1359893119,
          u[5] = 2600822924,
          u[6] = 528734635,
          u[7] = 1541459225,
          h[0] = 4089235720,
          h[1] = 2227873595,
          h[2] = 4271175723,
          h[3] = 1595750129,
          h[4] = 2917565137,
          h[5] = 725511199,
          h[6] = 4215389547,
          h[7] = 327033209,
          Iu(u, h, g, f),
          f %= 128,
          E = 0;
        E < f;
        E++
      )
        T[E] = g[A - f + E];
      for (
        T[f] = 128,
          f = 256 - 128 * (f < 112 ? 1 : 0),
          T[f - 9] = 0,
          y(T, f - 8, (A / 536870912) | 0, A << 3),
          Iu(u, h, T, f),
          E = 0;
        E < 8;
        E++
      )
        y(p, 8 * E, u[E], h[E]);
      return 0;
    }
    function io(p, g) {
      var f = t(),
        u = t(),
        h = t(),
        T = t(),
        E = t(),
        A = t(),
        G = t(),
        z = t(),
        L = t();
      (qe(f, p[1], p[0]),
        qe(L, g[1], g[0]),
        le(f, f, L),
        Fe(u, p[0], p[1]),
        Fe(L, g[0], g[1]),
        le(u, u, L),
        le(h, p[3], g[3]),
        le(h, h, c),
        le(T, p[2], g[2]),
        Fe(T, T, T),
        qe(E, u, f),
        qe(A, T, h),
        Fe(G, T, h),
        Fe(z, u, f),
        le(p[0], E, A),
        le(p[1], z, G),
        le(p[2], G, A),
        le(p[3], E, z));
    }
    function vu(p, g, f) {
      var u;
      for (u = 0; u < 4; u++) Mt(p[u], g[u], f);
    }
    function Fi(p, g) {
      var f = t(),
        u = t(),
        h = t();
      (_u(h, g[2]), le(f, g[0], h), le(u, g[1], h), Ot(p, u), (p[31] ^= ae(f) << 7));
    }
    function $i(p, g, f) {
      var u, h;
      for (Qe(p[0], o), Qe(p[1], i), Qe(p[2], i), Qe(p[3], o), h = 255; h >= 0; --h)
        ((u = (f[(h / 8) | 0] >> (h & 7)) & 1), vu(p, g, u), io(g, p), io(p, p), vu(p, g, u));
    }
    function ao(p, g) {
      var f = [t(), t(), t(), t()];
      (Qe(f[0], d), Qe(f[1], m), Qe(f[2], i), le(f[3], d, m), $i(p, f, g));
    }
    function Li(p, g, f) {
      var u = new Uint8Array(64),
        h = [t(), t(), t(), t()],
        T;
      for (
        f || r(g, 32),
          Mr(u, g, 32),
          u[0] &= 248,
          u[31] &= 127,
          u[31] |= 64,
          ao(h, u),
          Fi(p, h),
          T = 0;
        T < 32;
        T++
      )
        g[T + 32] = p[T];
      return 0;
    }
    var lo = new Float64Array([
      237, 211, 245, 92, 26, 99, 18, 88, 214, 156, 247, 162, 222, 249, 222, 20, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 16,
    ]);
    function Di(p, g) {
      var f, u, h, T;
      for (u = 63; u >= 32; --u) {
        for (f = 0, h = u - 32, T = u - 12; h < T; ++h)
          ((g[h] += f - 16 * g[u] * lo[h - (u - 32)]),
            (f = Math.floor((g[h] + 128) / 256)),
            (g[h] -= f * 256));
        ((g[h] += f), (g[u] = 0));
      }
      for (f = 0, h = 0; h < 32; h++)
        ((g[h] += f - (g[31] >> 4) * lo[h]), (f = g[h] >> 8), (g[h] &= 255));
      for (h = 0; h < 32; h++) g[h] -= f * lo[h];
      for (u = 0; u < 32; u++) ((g[u + 1] += g[u] >> 8), (p[u] = g[u] & 255));
    }
    function Ui(p) {
      var g = new Float64Array(64),
        f;
      for (f = 0; f < 64; f++) g[f] = p[f];
      for (f = 0; f < 64; f++) p[f] = 0;
      Di(p, g);
    }
    function Cu(p, g, f, u) {
      var h = new Uint8Array(64),
        T = new Uint8Array(64),
        E = new Uint8Array(64),
        A,
        G,
        z = new Float64Array(64),
        L = [t(), t(), t(), t()];
      (Mr(h, u, 32), (h[0] &= 248), (h[31] &= 127), (h[31] |= 64));
      var ke = f + 64;
      for (A = 0; A < f; A++) p[64 + A] = g[A];
      for (A = 0; A < 32; A++) p[32 + A] = h[32 + A];
      for (Mr(E, p.subarray(32), f + 32), Ui(E), ao(L, E), Fi(p, L), A = 32; A < 64; A++)
        p[A] = u[A];
      for (Mr(T, p, f + 64), Ui(T), A = 0; A < 64; A++) z[A] = 0;
      for (A = 0; A < 32; A++) z[A] = E[A];
      for (A = 0; A < 32; A++) for (G = 0; G < 32; G++) z[A + G] += T[A] * h[G];
      return (Di(p.subarray(32), z), ke);
    }
    function Dg(p, g) {
      var f = t(),
        u = t(),
        h = t(),
        T = t(),
        E = t(),
        A = t(),
        G = t();
      return (
        Qe(p[2], i),
        pt(p[1], g),
        tt(h, p[1]),
        le(T, h, l),
        qe(h, h, p[2]),
        Fe(T, p[2], T),
        tt(E, T),
        tt(A, E),
        le(G, A, E),
        le(f, G, h),
        le(f, f, T),
        Tu(f, f),
        le(f, f, h),
        le(f, f, T),
        le(f, f, T),
        le(p[0], f, T),
        tt(u, p[0]),
        le(u, u, T),
        ro(u, h) && le(p[0], p[0], w),
        tt(u, p[0]),
        le(u, u, T),
        ro(u, h) ? -1 : (ae(p[0]) === g[31] >> 7 && qe(p[0], o, p[0]), le(p[3], p[0], p[1]), 0)
      );
    }
    function Bi(p, g, f, u) {
      var h,
        T = new Uint8Array(32),
        E = new Uint8Array(64),
        A = [t(), t(), t(), t()],
        G = [t(), t(), t(), t()];
      if (f < 64 || Dg(G, u)) return -1;
      for (h = 0; h < f; h++) p[h] = g[h];
      for (h = 0; h < 32; h++) p[h + 32] = u[h];
      if (
        (Mr(E, p, f),
        Ui(E),
        $i(A, G, E),
        ao(G, g.subarray(32)),
        io(A, G),
        Fi(T, A),
        (f -= 64),
        P(g, 0, T, 0))
      ) {
        for (h = 0; h < f; h++) p[h] = 0;
        return -1;
      }
      for (h = 0; h < f; h++) p[h] = g[h + 64];
      return f;
    }
    var ji = 32,
      uo = 24,
      Hn = 32,
      un = 16,
      zn = 32,
      co = 32,
      Qn = 32,
      Vn = 32,
      Wi = 32,
      Ru = uo,
      Ug = Hn,
      Bg = un,
      Yt = 64,
      Or = 32,
      cn = 64,
      qi = 32,
      Ki = 64;
    e.lowlevel = {
      crypto_core_hsalsa20: Ce,
      crypto_stream_xor: ye,
      crypto_stream: ve,
      crypto_stream_salsa20_xor: Y,
      crypto_stream_salsa20: he,
      crypto_onetimeauth: X,
      crypto_onetimeauth_verify: Pe,
      crypto_verify_16: I,
      crypto_verify_32: P,
      crypto_secretbox: ut,
      crypto_secretbox_open: Me,
      crypto_scalarmult: no,
      crypto_scalarmult_base: so,
      crypto_box_beforenm: oo,
      crypto_box_afternm: Eu,
      crypto_box: $g,
      crypto_box_open: Lg,
      crypto_box_keypair: ku,
      crypto_hash: Mr,
      crypto_sign: Cu,
      crypto_sign_keypair: Li,
      crypto_sign_open: Bi,
      crypto_secretbox_KEYBYTES: ji,
      crypto_secretbox_NONCEBYTES: uo,
      crypto_secretbox_ZEROBYTES: Hn,
      crypto_secretbox_BOXZEROBYTES: un,
      crypto_scalarmult_BYTES: zn,
      crypto_scalarmult_SCALARBYTES: co,
      crypto_box_PUBLICKEYBYTES: Qn,
      crypto_box_SECRETKEYBYTES: Vn,
      crypto_box_BEFORENMBYTES: Wi,
      crypto_box_NONCEBYTES: Ru,
      crypto_box_ZEROBYTES: Ug,
      crypto_box_BOXZEROBYTES: Bg,
      crypto_sign_BYTES: Yt,
      crypto_sign_PUBLICKEYBYTES: Or,
      crypto_sign_SECRETKEYBYTES: cn,
      crypto_sign_SEEDBYTES: qi,
      crypto_hash_BYTES: Ki,
      gf: t,
      D: l,
      L: lo,
      pack25519: Ot,
      unpack25519: pt,
      M: le,
      A: Fe,
      S: tt,
      Z: qe,
      pow2523: Tu,
      add: io,
      set25519: Qe,
      modL: Di,
      scalarmult: $i,
      scalarbase: ao,
    };
    function Au(p, g) {
      if (p.length !== ji) throw new Error("bad key size");
      if (g.length !== uo) throw new Error("bad nonce size");
    }
    function jg(p, g) {
      if (p.length !== Qn) throw new Error("bad public key size");
      if (g.length !== Vn) throw new Error("bad secret key size");
    }
    function bt() {
      for (var p = 0; p < arguments.length; p++)
        if (!(arguments[p] instanceof Uint8Array))
          throw new TypeError("unexpected type, use Uint8Array");
    }
    function xu(p) {
      for (var g = 0; g < p.length; g++) p[g] = 0;
    }
    ((e.randomBytes = function (p) {
      var g = new Uint8Array(p);
      return (r(g, p), g);
    }),
      (e.secretbox = function (p, g, f) {
        (bt(p, g, f), Au(f, g));
        for (
          var u = new Uint8Array(Hn + p.length), h = new Uint8Array(u.length), T = 0;
          T < p.length;
          T++
        )
          u[T + Hn] = p[T];
        return (ut(h, u, u.length, g, f), h.subarray(un));
      }),
      (e.secretbox.open = function (p, g, f) {
        (bt(p, g, f), Au(f, g));
        for (
          var u = new Uint8Array(un + p.length), h = new Uint8Array(u.length), T = 0;
          T < p.length;
          T++
        )
          u[T + un] = p[T];
        return u.length < 32 || Me(h, u, u.length, g, f) !== 0 ? null : h.subarray(Hn);
      }),
      (e.secretbox.keyLength = ji),
      (e.secretbox.nonceLength = uo),
      (e.secretbox.overheadLength = un),
      (e.scalarMult = function (p, g) {
        if ((bt(p, g), p.length !== co)) throw new Error("bad n size");
        if (g.length !== zn) throw new Error("bad p size");
        var f = new Uint8Array(zn);
        return (no(f, p, g), f);
      }),
      (e.scalarMult.base = function (p) {
        if ((bt(p), p.length !== co)) throw new Error("bad n size");
        var g = new Uint8Array(zn);
        return (so(g, p), g);
      }),
      (e.scalarMult.scalarLength = co),
      (e.scalarMult.groupElementLength = zn),
      (e.box = function (p, g, f, u) {
        var h = e.box.before(f, u);
        return e.secretbox(p, g, h);
      }),
      (e.box.before = function (p, g) {
        (bt(p, g), jg(p, g));
        var f = new Uint8Array(Wi);
        return (oo(f, p, g), f);
      }),
      (e.box.after = e.secretbox),
      (e.box.open = function (p, g, f, u) {
        var h = e.box.before(f, u);
        return e.secretbox.open(p, g, h);
      }),
      (e.box.open.after = e.secretbox.open),
      (e.box.keyPair = function () {
        var p = new Uint8Array(Qn),
          g = new Uint8Array(Vn);
        return (ku(p, g), { publicKey: p, secretKey: g });
      }),
      (e.box.keyPair.fromSecretKey = function (p) {
        if ((bt(p), p.length !== Vn)) throw new Error("bad secret key size");
        var g = new Uint8Array(Qn);
        return (so(g, p), { publicKey: g, secretKey: new Uint8Array(p) });
      }),
      (e.box.publicKeyLength = Qn),
      (e.box.secretKeyLength = Vn),
      (e.box.sharedKeyLength = Wi),
      (e.box.nonceLength = Ru),
      (e.box.overheadLength = e.secretbox.overheadLength),
      (e.sign = function (p, g) {
        if ((bt(p, g), g.length !== cn)) throw new Error("bad secret key size");
        var f = new Uint8Array(Yt + p.length);
        return (Cu(f, p, p.length, g), f);
      }),
      (e.sign.open = function (p, g) {
        if ((bt(p, g), g.length !== Or)) throw new Error("bad public key size");
        var f = new Uint8Array(p.length),
          u = Bi(f, p, p.length, g);
        if (u < 0) return null;
        for (var h = new Uint8Array(u), T = 0; T < h.length; T++) h[T] = f[T];
        return h;
      }),
      (e.sign.detached = function (p, g) {
        for (var f = e.sign(p, g), u = new Uint8Array(Yt), h = 0; h < u.length; h++) u[h] = f[h];
        return u;
      }),
      (e.sign.detached.verify = function (p, g, f) {
        if ((bt(p, g, f), g.length !== Yt)) throw new Error("bad signature size");
        if (f.length !== Or) throw new Error("bad public key size");
        var u = new Uint8Array(Yt + p.length),
          h = new Uint8Array(Yt + p.length),
          T;
        for (T = 0; T < Yt; T++) u[T] = g[T];
        for (T = 0; T < p.length; T++) u[T + Yt] = p[T];
        return Bi(h, u, u.length, f) >= 0;
      }),
      (e.sign.keyPair = function () {
        var p = new Uint8Array(Or),
          g = new Uint8Array(cn);
        return (Li(p, g), { publicKey: p, secretKey: g });
      }),
      (e.sign.keyPair.fromSecretKey = function (p) {
        if ((bt(p), p.length !== cn)) throw new Error("bad secret key size");
        for (var g = new Uint8Array(Or), f = 0; f < g.length; f++) g[f] = p[32 + f];
        return { publicKey: g, secretKey: new Uint8Array(p) };
      }),
      (e.sign.keyPair.fromSeed = function (p) {
        if ((bt(p), p.length !== qi)) throw new Error("bad seed size");
        for (var g = new Uint8Array(Or), f = new Uint8Array(cn), u = 0; u < 32; u++) f[u] = p[u];
        return (Li(g, f, !0), { publicKey: g, secretKey: f });
      }),
      (e.sign.publicKeyLength = Or),
      (e.sign.secretKeyLength = cn),
      (e.sign.seedLength = qi),
      (e.sign.signatureLength = Yt),
      (e.hash = function (p) {
        bt(p);
        var g = new Uint8Array(Ki);
        return (Mr(g, p, p.length), g);
      }),
      (e.hash.hashLength = Ki),
      (e.verify = function (p, g) {
        return (
          bt(p, g),
          p.length === 0 || g.length === 0 || p.length !== g.length
            ? !1
            : _(p, 0, g, 0, p.length) === 0
        );
      }),
      (e.setPRNG = function (p) {
        r = p;
      }),
      (function () {
        var p = typeof self < "u" ? self.crypto || self.msCrypto : null;
        if (p && p.getRandomValues) {
          var g = 65536;
          e.setPRNG(function (f, u) {
            var h,
              T = new Uint8Array(u);
            for (h = 0; h < u; h += g) p.getRandomValues(T.subarray(h, h + Math.min(u - h, g)));
            for (h = 0; h < u; h++) f[h] = T[h];
            xu(T);
          });
        } else
          typeof Pu < "u" &&
            ((p = cf()),
            p &&
              p.randomBytes &&
              e.setPRNG(function (f, u) {
                var h,
                  T = p.randomBytes(u);
                for (h = 0; h < u; h++) f[h] = T[h];
                xu(T);
              }));
      })());
  })(typeof Si < "u" && Si.exports ? Si.exports : (self.nacl = self.nacl || {}));
});
var Qi = (e, t, r) => (n, s) => {
  let o = -1;
  return i(0);
  async function i(a) {
    if (a <= o) throw new Error("next() called multiple times");
    o = a;
    let l,
      c = !1,
      d;
    if (
      (e[a] ? ((d = e[a][0][0]), (n.req.routeIndex = a)) : (d = (a === e.length && s) || void 0), d)
    )
      try {
        l = await d(n, () => i(a + 1));
      } catch (m) {
        if (m instanceof Error && t) ((n.error = m), (l = await t(m, n)), (c = !0));
        else throw m;
      }
    else n.finalized === !1 && r && (l = await r(n));
    return (l && (n.finalized === !1 || c) && (n.res = l), n);
  }
};
var Nu = Symbol();
var Gu = async (e, t = Object.create(null)) => {
  let { all: r = !1, dot: n = !1 } = t,
    o = (e instanceof po ? e.raw.headers : e.headers).get("Content-Type");
  return o?.startsWith("multipart/form-data") || o?.startsWith("application/x-www-form-urlencoded")
    ? Vg(e, { all: r, dot: n })
    : {};
};
async function Vg(e, t) {
  let r = await e.formData();
  return r ? Jg(r, t) : {};
}
function Jg(e, t) {
  let r = Object.create(null);
  return (
    e.forEach((n, s) => {
      t.all || s.endsWith("[]") ? Yg(r, s, n) : (r[s] = n);
    }),
    t.dot &&
      Object.entries(r).forEach(([n, s]) => {
        n.includes(".") && (Xg(r, n, s), delete r[n]);
      }),
    r
  );
}
var Yg = (e, t, r) => {
    e[t] !== void 0
      ? Array.isArray(e[t])
        ? e[t].push(r)
        : (e[t] = [e[t], r])
      : t.endsWith("[]")
        ? (e[t] = [r])
        : (e[t] = r);
  },
  Xg = (e, t, r) => {
    if (/(?:^|\.)__proto__\./.test(t)) return;
    let n = e,
      s = t.split(".");
    s.forEach((o, i) => {
      i === s.length - 1
        ? (n[o] = r)
        : ((!n[o] || typeof n[o] != "object" || Array.isArray(n[o]) || n[o] instanceof File) &&
            (n[o] = Object.create(null)),
          (n = n[o]));
    });
  };
var Ji = (e) => {
    let t = e.split("/");
    return (t[0] === "" && t.shift(), t);
  },
  Fu = (e) => {
    let { groups: t, path: r } = Zg(e),
      n = Ji(r);
    return eh(n, t);
  },
  Zg = (e) => {
    let t = [];
    return (
      (e = e.replace(/\{[^}]+\}/g, (r, n) => {
        let s = `@${n}`;
        return (t.push([s, r]), s);
      })),
      { groups: t, path: e }
    );
  },
  eh = (e, t) => {
    for (let r = t.length - 1; r >= 0; r--) {
      let [n] = t[r];
      for (let s = e.length - 1; s >= 0; s--)
        if (e[s].includes(n)) {
          e[s] = e[s].replace(n, t[r][1]);
          break;
        }
    }
    return e;
  },
  mo = {},
  $u = (e, t) => {
    if (e === "*") return "*";
    let r = e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    if (r) {
      let n = `${e}#${t}`;
      return (
        mo[n] ||
          (r[2]
            ? (mo[n] =
                t && t[0] !== ":" && t[0] !== "*"
                  ? [n, r[1], new RegExp(`^${r[2]}(?=/${t})`)]
                  : [e, r[1], new RegExp(`^${r[2]}$`)])
            : (mo[n] = [e, r[1], !0])),
        mo[n]
      );
    }
    return null;
  },
  fo = (e, t) => {
    try {
      return t(e);
    } catch {
      return e.replace(/(?:%[0-9A-Fa-f]{2})+/g, (r) => {
        try {
          return t(r);
        } catch {
          return r;
        }
      });
    }
  },
  th = (e) => fo(e, decodeURI),
  Yi = (e) => {
    let t = e.url,
      r = t.indexOf("/", t.indexOf(":") + 4),
      n = r;
    for (; n < t.length; n++) {
      let s = t.charCodeAt(n);
      if (s === 37) {
        let o = t.indexOf("?", n),
          i = t.indexOf("#", n),
          a = o === -1 ? (i === -1 ? void 0 : i) : i === -1 ? o : Math.min(o, i),
          l = t.slice(r, a);
        return th(l.includes("%25") ? l.replace(/%25/g, "%2525") : l);
      } else if (s === 63 || s === 35) break;
    }
    return t.slice(r, n);
  };
var Lu = (e) => {
    let t = Yi(e);
    return t.length > 1 && t.at(-1) === "/" ? t.slice(0, -1) : t;
  },
  Nr = (e, t, ...r) => (
    r.length && (t = Nr(t, ...r)),
    `${e?.[0] === "/" ? "" : "/"}${e}${t === "/" ? "" : `${e?.at(-1) === "/" ? "" : "/"}${t?.[0] === "/" ? t.slice(1) : t}`}`
  ),
  go = (e) => {
    if (e.charCodeAt(e.length - 1) !== 63 || !e.includes(":")) return null;
    let t = e.split("/"),
      r = [],
      n = "";
    return (
      t.forEach((s) => {
        if (s !== "" && !/\:/.test(s)) n += "/" + s;
        else if (/\:/.test(s))
          if (/\?/.test(s)) {
            r.length === 0 && n === "" ? r.push("/") : r.push(n);
            let o = s.replace("?", "");
            ((n += "/" + o), r.push(n));
          } else n += "/" + s;
      }),
      r.filter((s, o, i) => i.indexOf(s) === o)
    );
  },
  Vi = (e) =>
    /[%+]/.test(e)
      ? (e.indexOf("+") !== -1 && (e = e.replace(/\+/g, " ")),
        e.indexOf("%") !== -1 ? fo(e, Xi) : e)
      : e,
  Du = (e, t, r) => {
    let n;
    if (!r && t && !/[%+]/.test(t)) {
      let i = e.indexOf("?", 8);
      if (i === -1) return;
      for (e.startsWith(t, i + 1) || (i = e.indexOf(`&${t}`, i + 1)); i !== -1;) {
        let a = e.charCodeAt(i + t.length + 1);
        if (a === 61) {
          let l = i + t.length + 2,
            c = e.indexOf("&", l);
          return Vi(e.slice(l, c === -1 ? void 0 : c));
        } else if (a == 38 || isNaN(a)) return "";
        i = e.indexOf(`&${t}`, i + 1);
      }
      if (((n = /[%+]/.test(e)), !n)) return;
    }
    let s = {};
    n ??= /[%+]/.test(e);
    let o = e.indexOf("?", 8);
    for (; o !== -1;) {
      let i = e.indexOf("&", o + 1),
        a = e.indexOf("=", o);
      a > i && i !== -1 && (a = -1);
      let l = e.slice(o + 1, a === -1 ? (i === -1 ? void 0 : i) : a);
      if ((n && (l = Vi(l)), (o = i), l === "")) continue;
      let c;
      (a === -1 ? (c = "") : ((c = e.slice(a + 1, i === -1 ? void 0 : i)), n && (c = Vi(c))),
        r ? ((s[l] && Array.isArray(s[l])) || (s[l] = []), s[l].push(c)) : (s[l] ??= c));
    }
    return t ? s[t] : s;
  },
  Uu = Du,
  Bu = (e, t) => Du(e, t, !0),
  Xi = decodeURIComponent;
var ju = (e) => fo(e, Xi),
  po = class {
    raw;
    #t;
    #e;
    routeIndex = 0;
    path;
    bodyCache = {};
    constructor(e, t = "/", r = [[]]) {
      ((this.raw = e), (this.path = t), (this.#e = r), (this.#t = {}));
    }
    param(e) {
      return e ? this.#r(e) : this.#o();
    }
    #r(e) {
      let t = this.#e[0][this.routeIndex][1][e],
        r = this.#s(t);
      return r && /\%/.test(r) ? ju(r) : r;
    }
    #o() {
      let e = {},
        t = Object.keys(this.#e[0][this.routeIndex][1]);
      for (let r of t) {
        let n = this.#s(this.#e[0][this.routeIndex][1][r]);
        n !== void 0 && (e[r] = /\%/.test(n) ? ju(n) : n);
      }
      return e;
    }
    #s(e) {
      return this.#e[1] ? this.#e[1][e] : e;
    }
    query(e) {
      return Uu(this.url, e);
    }
    queries(e) {
      return Bu(this.url, e);
    }
    header(e) {
      if (e) return this.raw.headers.get(e) ?? void 0;
      let t = {};
      return (
        this.raw.headers.forEach((r, n) => {
          t[n] = r;
        }),
        t
      );
    }
    async parseBody(e) {
      return Gu(this, e);
    }
    #n = (e) => {
      let { bodyCache: t, raw: r } = this,
        n = t[e];
      if (n) return n;
      let s = Object.keys(t)[0];
      return s
        ? t[s].then((o) => (s === "json" && (o = JSON.stringify(o)), new Response(o)[e]()))
        : (t[e] = r[e]());
    };
    json() {
      return this.#n("text").then((e) => JSON.parse(e));
    }
    text() {
      return this.#n("text");
    }
    arrayBuffer() {
      return this.#n("arrayBuffer");
    }
    blob() {
      return this.#n("blob");
    }
    formData() {
      return this.#n("formData");
    }
    addValidatedData(e, t) {
      this.#t[e] = t;
    }
    valid(e) {
      return this.#t[e];
    }
    get url() {
      return this.raw.url;
    }
    get method() {
      return this.raw.method;
    }
    get [Nu]() {
      return this.#e;
    }
    get matchedRoutes() {
      return this.#e[0].map(([[, e]]) => e);
    }
    get routePath() {
      return this.#e[0].map(([[, e]]) => e)[this.routeIndex].path;
    }
  };
var Wu = { Stringify: 1, BeforeStream: 2, Stream: 3 },
  rh = (e, t) => {
    let r = new String(e);
    return ((r.isEscaped = !0), (r.callbacks = t), r);
  };
var Zi = async (e, t, r, n, s) => {
  typeof e == "object" &&
    !(e instanceof String) &&
    (e instanceof Promise || (e = e.toString()), e instanceof Promise && (e = await e));
  let o = e.callbacks;
  if (!o?.length) return Promise.resolve(e);
  s ? (s[0] += e) : (s = [e]);
  let i = Promise.all(o.map((a) => a({ phase: t, buffer: s, context: n }))).then((a) =>
    Promise.all(a.filter(Boolean).map((l) => Zi(l, t, !1, n, s))).then(() => s[0]),
  );
  return r ? rh(await i, o) : i;
};
var nh = "text/plain; charset=UTF-8",
  ea = (e, t) => ({ "Content-Type": e, ...t }),
  Jn = (e, t) => new Response(e, t),
  qu = class {
    #t;
    #e;
    env = {};
    #r;
    finalized = !1;
    error;
    #o;
    #s;
    #n;
    #c;
    #l;
    #u;
    #a;
    #d;
    #p;
    constructor(e, t) {
      ((this.#t = e),
        t &&
          ((this.#s = t.executionCtx),
          (this.env = t.env),
          (this.#u = t.notFoundHandler),
          (this.#p = t.path),
          (this.#d = t.matchResult)));
    }
    get req() {
      return ((this.#e ??= new po(this.#t, this.#p, this.#d)), this.#e);
    }
    get event() {
      if (this.#s && "respondWith" in this.#s) return this.#s;
      throw Error("This context has no FetchEvent");
    }
    get executionCtx() {
      if (this.#s) return this.#s;
      throw Error("This context has no ExecutionContext");
    }
    get res() {
      return (this.#n ||= Jn(null, { headers: (this.#a ??= new Headers()) }));
    }
    set res(e) {
      if (this.#n && e) {
        e = Jn(e.body, e);
        for (let [t, r] of this.#n.headers.entries())
          if (t !== "content-type")
            if (t === "set-cookie") {
              let n = this.#n.headers.getSetCookie();
              e.headers.delete("set-cookie");
              for (let s of n) e.headers.append("set-cookie", s);
            } else e.headers.set(t, r);
      }
      ((this.#n = e), (this.finalized = !0));
    }
    render = (...e) => ((this.#l ??= (t) => this.html(t)), this.#l(...e));
    setLayout = (e) => (this.#c = e);
    getLayout = () => this.#c;
    setRenderer = (e) => {
      this.#l = e;
    };
    header = (e, t, r) => {
      this.finalized && (this.#n = Jn(this.#n.body, this.#n));
      let n = this.#n ? this.#n.headers : (this.#a ??= new Headers());
      t === void 0 ? n.delete(e) : r?.append ? n.append(e, t) : n.set(e, t);
    };
    status = (e) => {
      this.#o = e;
    };
    set = (e, t) => {
      ((this.#r ??= new Map()), this.#r.set(e, t));
    };
    get = (e) => (this.#r ? this.#r.get(e) : void 0);
    get var() {
      return this.#r ? Object.fromEntries(this.#r) : {};
    }
    #i(e, t, r) {
      let n = this.#n ? new Headers(this.#n.headers) : (this.#a ?? new Headers());
      if (typeof t == "object" && "headers" in t) {
        let o = t.headers instanceof Headers ? t.headers : new Headers(t.headers);
        for (let [i, a] of o) i.toLowerCase() === "set-cookie" ? n.append(i, a) : n.set(i, a);
      }
      if (r)
        for (let [o, i] of Object.entries(r))
          if (typeof i == "string") n.set(o, i);
          else {
            n.delete(o);
            for (let a of i) n.append(o, a);
          }
      let s = typeof t == "number" ? t : (t?.status ?? this.#o);
      return Jn(e, { status: s, headers: n });
    }
    newResponse = (...e) => this.#i(...e);
    body = (e, t, r) => this.#i(e, t, r);
    text = (e, t, r) =>
      !this.#a && !this.#o && !t && !r && !this.finalized
        ? new Response(e)
        : this.#i(e, t, ea(nh, r));
    json = (e, t, r) => this.#i(JSON.stringify(e), t, ea("application/json", r));
    html = (e, t, r) => {
      let n = (s) => this.#i(s, t, ea("text/html; charset=UTF-8", r));
      return typeof e == "object" ? Zi(e, Wu.Stringify, !1, {}).then(n) : n(e);
    };
    redirect = (e, t) => {
      let r = String(e);
      return (
        this.header("Location", /[^\x00-\xFF]/.test(r) ? encodeURI(r) : r),
        this.newResponse(null, t ?? 302)
      );
    };
    notFound = () => ((this.#u ??= () => Jn()), this.#u(this));
  };
var $e = "ALL",
  Ku = "all",
  Hu = ["get", "post", "put", "delete", "options", "patch"],
  ho = "Can not add a route since the matcher is already built.",
  wo = class extends Error {};
var zu = "__COMPOSED_HANDLER";
var sh = (e) => e.text("404 Not Found", 404),
  Qu = (e, t) => {
    if ("getResponse" in e) {
      let r = e.getResponse();
      return t.newResponse(r.body, r);
    }
    return (console.error(e), t.text("Internal Server Error", 500));
  },
  Vu = class Ju {
    get;
    post;
    put;
    delete;
    options;
    patch;
    all;
    on;
    use;
    router;
    getPath;
    _basePath = "/";
    #t = "/";
    routes = [];
    constructor(t = {}) {
      ([...Hu, Ku].forEach((o) => {
        this[o] = (i, ...a) => (
          typeof i == "string" ? (this.#t = i) : this.#o(o, this.#t, i),
          a.forEach((l) => {
            this.#o(o, this.#t, l);
          }),
          this
        );
      }),
        (this.on = (o, i, ...a) => {
          for (let l of [i].flat()) {
            this.#t = l;
            for (let c of [o].flat())
              a.map((d) => {
                this.#o(c.toUpperCase(), this.#t, d);
              });
          }
          return this;
        }),
        (this.use = (o, ...i) => (
          typeof o == "string" ? (this.#t = o) : ((this.#t = "*"), i.unshift(o)),
          i.forEach((a) => {
            this.#o($e, this.#t, a);
          }),
          this
        )));
      let { strict: n, ...s } = t;
      (Object.assign(this, s), (this.getPath = (n ?? !0) ? (t.getPath ?? Yi) : Lu));
    }
    #e() {
      let t = new Ju({ router: this.router, getPath: this.getPath });
      return ((t.errorHandler = this.errorHandler), (t.#r = this.#r), (t.routes = this.routes), t);
    }
    #r = sh;
    errorHandler = Qu;
    route(t, r) {
      let n = this.basePath(t);
      return (
        r.routes.map((s) => {
          let o;
          (r.errorHandler === Qu
            ? (o = s.handler)
            : ((o = async (i, a) => (await Qi([], r.errorHandler)(i, () => s.handler(i, a))).res),
              (o[zu] = s.handler)),
            n.#o(s.method, s.path, o));
        }),
        this
      );
    }
    basePath(t) {
      let r = this.#e();
      return ((r._basePath = Nr(this._basePath, t)), r);
    }
    onError = (t) => ((this.errorHandler = t), this);
    notFound = (t) => ((this.#r = t), this);
    mount(t, r, n) {
      let s, o;
      n &&
        (typeof n == "function"
          ? (o = n)
          : ((o = n.optionHandler),
            n.replaceRequest === !1 ? (s = (l) => l) : (s = n.replaceRequest)));
      let i = o
        ? (l) => {
            let c = o(l);
            return Array.isArray(c) ? c : [c];
          }
        : (l) => {
            let c;
            try {
              c = l.executionCtx;
            } catch {}
            return [l.env, c];
          };
      s ||= (() => {
        let l = Nr(this._basePath, t),
          c = l === "/" ? 0 : l.length;
        return (d) => {
          let m = new URL(d.url);
          return ((m.pathname = m.pathname.slice(c) || "/"), new Request(m, d));
        };
      })();
      let a = async (l, c) => {
        let d = await r(s(l.req.raw), ...i(l));
        if (d) return d;
        await c();
      };
      return (this.#o($e, Nr(t, "*"), a), this);
    }
    #o(t, r, n) {
      ((t = t.toUpperCase()), (r = Nr(this._basePath, r)));
      let s = { basePath: this._basePath, path: r, method: t, handler: n };
      (this.router.add(t, r, [n, s]), this.routes.push(s));
    }
    #s(t, r) {
      if (t instanceof Error) return this.errorHandler(t, r);
      throw t;
    }
    #n(t, r, n, s) {
      if (s === "HEAD") return (async () => new Response(null, await this.#n(t, r, n, "GET")))();
      let o = this.getPath(t, { env: n }),
        i = this.router.match(s, o),
        a = new qu(t, {
          path: o,
          matchResult: i,
          env: n,
          executionCtx: r,
          notFoundHandler: this.#r,
        });
      if (i[0].length === 1) {
        let c;
        try {
          c = i[0][0][0][0](a, async () => {
            a.res = await this.#r(a);
          });
        } catch (d) {
          return this.#s(d, a);
        }
        return c instanceof Promise
          ? c.then((d) => d || (a.finalized ? a.res : this.#r(a))).catch((d) => this.#s(d, a))
          : (c ?? this.#r(a));
      }
      let l = Qi(i[0], this.errorHandler, this.#r);
      return (async () => {
        try {
          let c = await l(a);
          if (!c.finalized)
            throw new Error(
              "Context is not finalized. Did you forget to return a Response object or `await next()`?",
            );
          return c.res;
        } catch (c) {
          return this.#s(c, a);
        }
      })();
    }
    fetch = (t, ...r) => this.#n(t, r[1], r[0], t.method);
    request = (t, r, n, s) =>
      t instanceof Request
        ? this.fetch(r ? new Request(t, r) : t, n, s)
        : ((t = t.toString()),
          this.fetch(
            new Request(/^https?:\/\//.test(t) ? t : `http://localhost${Nr("/", t)}`, r),
            n,
            s,
          ));
    fire = () => {
      addEventListener("fetch", (t) => {
        t.respondWith(this.#n(t.request, t, void 0, t.request.method));
      });
    };
  };
var bo = [];
function ta(e, t) {
  let r = this.buildAllMatchers(),
    n = (s, o) => {
      let i = r[s] || r[$e],
        a = i[2][o];
      if (a) return a;
      let l = o.match(i[0]);
      if (!l) return [[], bo];
      let c = l.indexOf("", 1);
      return [i[1][c], l];
    };
  return ((this.match = n), n(e, t));
}
var yo = "[^/]+",
  Yn = ".*",
  Xn = "(?:|/.*)",
  Gr = Symbol(),
  oh = new Set(".\\+*[^]$()");
function ih(e, t) {
  return e.length === 1
    ? t.length === 1
      ? e < t
        ? -1
        : 1
      : -1
    : t.length === 1 || e === Yn || e === Xn
      ? 1
      : t === Yn || t === Xn
        ? -1
        : e === yo
          ? 1
          : t === yo
            ? -1
            : e.length === t.length
              ? e < t
                ? -1
                : 1
              : t.length - e.length;
}
var Yu = class ra {
  #t;
  #e;
  #r = Object.create(null);
  insert(t, r, n, s, o) {
    if (t.length === 0) {
      if (this.#t !== void 0) throw Gr;
      if (o) return;
      this.#t = r;
      return;
    }
    let [i, ...a] = t,
      l =
        i === "*"
          ? a.length === 0
            ? ["", "", Yn]
            : ["", "", yo]
          : i === "/*"
            ? ["", "", Xn]
            : i.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/),
      c;
    if (l) {
      let d = l[1],
        m = l[2] || yo;
      if (
        d &&
        l[2] &&
        (m === ".*" || ((m = m.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:")), /\((?!\?:)/.test(m)))
      )
        throw Gr;
      if (((c = this.#r[m]), !c)) {
        if (Object.keys(this.#r).some((w) => w !== Yn && w !== Xn)) throw Gr;
        if (o) return;
        ((c = this.#r[m] = new ra()), d !== "" && (c.#e = s.varIndex++));
      }
      !o && d !== "" && n.push([d, c.#e]);
    } else if (((c = this.#r[i]), !c)) {
      if (Object.keys(this.#r).some((d) => d.length > 1 && d !== Yn && d !== Xn)) throw Gr;
      if (o) return;
      c = this.#r[i] = new ra();
    }
    c.insert(a, r, n, s, o);
  }
  buildRegExpStr() {
    let r = Object.keys(this.#r)
      .sort(ih)
      .map((n) => {
        let s = this.#r[n];
        return (
          (typeof s.#e == "number" ? `(${n})@${s.#e}` : oh.has(n) ? `\\${n}` : n) +
          s.buildRegExpStr()
        );
      });
    return (
      typeof this.#t == "number" && r.unshift(`#${this.#t}`),
      r.length === 0 ? "" : r.length === 1 ? r[0] : "(?:" + r.join("|") + ")"
    );
  }
};
var Xu = class {
  #t = { varIndex: 0 };
  #e = new Yu();
  insert(e, t, r) {
    let n = [],
      s = [];
    for (let i = 0; ;) {
      let a = !1;
      if (
        ((e = e.replace(/\{[^}]+\}/g, (l) => {
          let c = `@\\${i}`;
          return ((s[i] = [c, l]), i++, (a = !0), c);
        })),
        !a)
      )
        break;
    }
    let o = e.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = s.length - 1; i >= 0; i--) {
      let [a] = s[i];
      for (let l = o.length - 1; l >= 0; l--)
        if (o[l].indexOf(a) !== -1) {
          o[l] = o[l].replace(a, s[i][1]);
          break;
        }
    }
    return (this.#e.insert(o, t, n, this.#t, r), n);
  }
  buildRegExp() {
    let e = this.#e.buildRegExpStr();
    if (e === "") return [/^$/, [], []];
    let t = 0,
      r = [],
      n = [];
    return (
      (e = e.replace(/#(\d+)|@(\d+)|\.\*\$/g, (s, o, i) =>
        o !== void 0 ? ((r[++t] = Number(o)), "$()") : (i !== void 0 && (n[Number(i)] = ++t), ""),
      )),
      [new RegExp(`^${e}`), r, n]
    );
  }
};
var ah = [/^$/, [], Object.create(null)],
  Zu = Object.create(null);
function ec(e) {
  return (Zu[e] ??= new RegExp(
    e === "*"
      ? ""
      : `^${e.replace(/\/\*$|([.\\+*[^\]$()])/g, (t, r) => (r ? `\\${r}` : "(?:|/.*)"))}$`,
  ));
}
function lh() {
  Zu = Object.create(null);
}
function uh(e) {
  let t = new Xu(),
    r = [];
  if (e.length === 0) return ah;
  let n = e
      .map((c) => [!/\*|\/:/.test(c[0]), ...c])
      .sort(([c, d], [m, w]) => (c ? 1 : m ? -1 : d.length - w.length)),
    s = Object.create(null);
  for (let c = 0, d = -1, m = n.length; c < m; c++) {
    let [w, y, _] = n[c];
    w ? (s[y] = [_.map(([P]) => [P, Object.create(null)]), bo]) : d++;
    let I;
    try {
      I = t.insert(y, d, w);
    } catch (P) {
      throw P === Gr ? new wo(y) : P;
    }
    w ||
      (r[d] = _.map(([P, S]) => {
        let U = Object.create(null);
        for (S -= 1; S >= 0; S--) {
          let [K, Ce] = I[S];
          U[K] = Ce;
        }
        return [P, U];
      }));
  }
  let [o, i, a] = t.buildRegExp();
  for (let c = 0, d = r.length; c < d; c++)
    for (let m = 0, w = r[c].length; m < w; m++) {
      let y = r[c][m]?.[1];
      if (!y) continue;
      let _ = Object.keys(y);
      for (let I = 0, P = _.length; I < P; I++) y[_[I]] = a[y[_[I]]];
    }
  let l = [];
  for (let c in i) l[c] = r[i[c]];
  return [o, l, s];
}
function dn(e, t) {
  if (e) {
    for (let r of Object.keys(e).sort((n, s) => s.length - n.length))
      if (ec(r).test(t)) return [...e[r]];
  }
}
var _o = class {
  name = "RegExpRouter";
  #t;
  #e;
  constructor() {
    ((this.#t = { [$e]: Object.create(null) }), (this.#e = { [$e]: Object.create(null) }));
  }
  add(e, t, r) {
    let n = this.#t,
      s = this.#e;
    if (!n || !s) throw new Error(ho);
    (n[e] ||
      [n, s].forEach((a) => {
        ((a[e] = Object.create(null)),
          Object.keys(a[$e]).forEach((l) => {
            a[e][l] = [...a[$e][l]];
          }));
      }),
      t === "/*" && (t = "*"));
    let o = (t.match(/\/:/g) || []).length;
    if (/\*$/.test(t)) {
      let a = ec(t);
      (e === $e
        ? Object.keys(n).forEach((l) => {
            n[l][t] ||= dn(n[l], t) || dn(n[$e], t) || [];
          })
        : (n[e][t] ||= dn(n[e], t) || dn(n[$e], t) || []),
        Object.keys(n).forEach((l) => {
          (e === $e || e === l) &&
            Object.keys(n[l]).forEach((c) => {
              a.test(c) && n[l][c].push([r, o]);
            });
        }),
        Object.keys(s).forEach((l) => {
          (e === $e || e === l) &&
            Object.keys(s[l]).forEach((c) => a.test(c) && s[l][c].push([r, o]));
        }));
      return;
    }
    let i = go(t) || [t];
    for (let a = 0, l = i.length; a < l; a++) {
      let c = i[a];
      Object.keys(s).forEach((d) => {
        (e === $e || e === d) &&
          ((s[d][c] ||= [...(dn(n[d], c) || dn(n[$e], c) || [])]),
          s[d][c].push([r, o - l + a + 1]));
      });
    }
  }
  match = ta;
  buildAllMatchers() {
    let e = Object.create(null);
    return (
      Object.keys(this.#e)
        .concat(Object.keys(this.#t))
        .forEach((t) => {
          e[t] ||= this.#r(t);
        }),
      (this.#t = this.#e = void 0),
      lh(),
      e
    );
  }
  #r(e) {
    let t = [],
      r = e === $e;
    return (
      [this.#t, this.#e].forEach((n) => {
        let s = n[e] ? Object.keys(n[e]).map((o) => [o, n[e][o]]) : [];
        s.length !== 0
          ? ((r ||= !0), t.push(...s))
          : e !== $e && t.push(...Object.keys(n[$e]).map((o) => [o, n[$e][o]]));
      }),
      r ? uh(t) : null
    );
  }
};
var na = class {
  name = "SmartRouter";
  #t = [];
  #e = [];
  constructor(e) {
    this.#t = e.routers;
  }
  add(e, t, r) {
    if (!this.#e) throw new Error(ho);
    this.#e.push([e, t, r]);
  }
  match(e, t) {
    if (!this.#e) throw new Error("Fatal error");
    let r = this.#t,
      n = this.#e,
      s = r.length,
      o = 0,
      i;
    for (; o < s; o++) {
      let a = r[o];
      try {
        for (let l = 0, c = n.length; l < c; l++) a.add(...n[l]);
        i = a.match(e, t);
      } catch (l) {
        if (l instanceof wo) continue;
        throw l;
      }
      ((this.match = a.match.bind(a)), (this.#t = [a]), (this.#e = void 0));
      break;
    }
    if (o === s) throw new Error("Fatal error");
    return ((this.name = `SmartRouter + ${this.activeRouter.name}`), i);
  }
  get activeRouter() {
    if (this.#e || this.#t.length !== 1)
      throw new Error("No active router has been determined yet.");
    return this.#t[0];
  }
};
var Zn = Object.create(null),
  ch = (e) => {
    for (let t in e) return !0;
    return !1;
  },
  tc = class rc {
    #t;
    #e;
    #r;
    #o = 0;
    #s = Zn;
    constructor(t, r, n) {
      if (((this.#e = n || Object.create(null)), (this.#t = []), t && r)) {
        let s = Object.create(null);
        ((s[t] = { handler: r, possibleKeys: [], score: 0 }), (this.#t = [s]));
      }
      this.#r = [];
    }
    insert(t, r, n) {
      this.#o = ++this.#o;
      let s = this,
        o = Fu(r),
        i = [];
      for (let a = 0, l = o.length; a < l; a++) {
        let c = o[a],
          d = o[a + 1],
          m = $u(c, d),
          w = Array.isArray(m) ? m[0] : c;
        if (w in s.#e) {
          ((s = s.#e[w]), m && i.push(m[1]));
          continue;
        }
        ((s.#e[w] = new rc()), m && (s.#r.push(m), i.push(m[1])), (s = s.#e[w]));
      }
      return (
        s.#t.push({
          [t]: {
            handler: n,
            possibleKeys: i.filter((a, l, c) => c.indexOf(a) === l),
            score: this.#o,
          },
        }),
        s
      );
    }
    #n(t, r, n, s, o) {
      for (let i = 0, a = r.#t.length; i < a; i++) {
        let l = r.#t[i],
          c = l[n] || l[$e],
          d = {};
        if (
          c !== void 0 &&
          ((c.params = Object.create(null)), t.push(c), s !== Zn || (o && o !== Zn))
        )
          for (let m = 0, w = c.possibleKeys.length; m < w; m++) {
            let y = c.possibleKeys[m],
              _ = d[c.score];
            ((c.params[y] = o?.[y] && !_ ? o[y] : (s[y] ?? o?.[y])), (d[c.score] = !0));
          }
      }
    }
    search(t, r) {
      let n = [];
      this.#s = Zn;
      let o = [this],
        i = Ji(r),
        a = [],
        l = i.length,
        c = null;
      for (let d = 0; d < l; d++) {
        let m = i[d],
          w = d === l - 1,
          y = [];
        for (let I = 0, P = o.length; I < P; I++) {
          let S = o[I],
            U = S.#e[m];
          U &&
            ((U.#s = S.#s),
            w ? (U.#e["*"] && this.#n(n, U.#e["*"], t, S.#s), this.#n(n, U, t, S.#s)) : y.push(U));
          for (let K = 0, Ce = S.#r.length; K < Ce; K++) {
            let Re = S.#r[K],
              Y = S.#s === Zn ? {} : { ...S.#s };
            if (Re === "*") {
              let X = S.#e["*"];
              X && (this.#n(n, X, t, S.#s), (X.#s = Y), y.push(X));
              continue;
            }
            let [he, ve, ye] = Re;
            if (!m && !(ye instanceof RegExp)) continue;
            let fe = S.#e[he];
            if (ye instanceof RegExp) {
              if (c === null) {
                c = new Array(l);
                let ut = r[0] === "/" ? 1 : 0;
                for (let Me = 0; Me < l; Me++) ((c[Me] = ut), (ut += i[Me].length + 1));
              }
              let X = r.substring(c[d]),
                Pe = ye.exec(X);
              if (Pe) {
                if (((Y[ve] = Pe[0]), this.#n(n, fe, t, S.#s, Y), ch(fe.#e))) {
                  fe.#s = Y;
                  let ut = Pe[0].match(/\//)?.length ?? 0;
                  (a[ut] ||= []).push(fe);
                }
                continue;
              }
            }
            (ye === !0 || ye.test(m)) &&
              ((Y[ve] = m),
              w
                ? (this.#n(n, fe, t, Y, S.#s), fe.#e["*"] && this.#n(n, fe.#e["*"], t, Y, S.#s))
                : ((fe.#s = Y), y.push(fe)));
          }
        }
        let _ = a.shift();
        o = _ ? y.concat(_) : y;
      }
      return (
        n.length > 1 && n.sort((d, m) => d.score - m.score),
        [n.map(({ handler: d, params: m }) => [d, m])]
      );
    }
  };
var sa = class {
  name = "TrieRouter";
  #t;
  constructor() {
    this.#t = new tc();
  }
  add(e, t, r) {
    let n = go(t);
    if (n) {
      for (let s = 0, o = n.length; s < o; s++) this.#t.insert(e, n[s], r);
      return;
    }
    this.#t.insert(e, t, r);
  }
  match(e, t) {
    return this.#t.search(e, t);
  }
};
var Rt = class extends Vu {
  constructor(e = {}) {
    (super(e), (this.router = e.router ?? new na({ routers: [new _o(), new sa()] })));
  }
};
var Nt = class extends Error {
  constructor(t) {
    (super(t), (this.name = "ConfigError"));
  }
};
var nc = "@cf/openai/gpt-oss-20b";
function Fr(e, t) {
  let r = e[t];
  if (typeof r != "string" || r.trim() === "")
    throw new Nt(`Missing required environment variable: ${t}`);
  return r.trim();
}
function dh(e, t) {
  for (let r of t) {
    let n = e[r];
    if (typeof n == "string" && n.trim() !== "") return n.trim();
  }
  throw new Nt(`Missing required environment variable: one of ${t.join(", ")}`);
}
function ph(e, t) {
  let r = Fr(e, t);
  return r.startsWith("/") ? r : `/${r}`;
}
function mh(e, t) {
  if (!e) throw new Nt(`Missing required value: ${t}`);
  let r = Number(e);
  if (!Number.isInteger(r) || r <= 0) throw new Nt(`${t} must be a positive integer, got: ${e}`);
  return r;
}
function oa(e, t) {
  let r = e[t];
  if (r == null || r === "") return null;
  let n = Number(r);
  if (!Number.isInteger(n) || n <= 0)
    throw new Nt(`${t} must be a positive integer if provided, got: ${String(r)}`);
  return n;
}
function fh(e, t) {
  let r = e[t];
  return !r || typeof r != "object" ? null : r;
}
function sc(e, t) {
  let r = e[t];
  return !r || typeof r != "object" ? null : r;
}
function To(e) {
  let t = e,
    r = Fr(t, "GITHUB_OWNER"),
    n = Fr(t, "GITHUB_REPO");
  return {
    language:
      typeof e.CLAW_LANGUAGE == "string" && e.CLAW_LANGUAGE.trim() ? e.CLAW_LANGUAGE.trim() : "en",
    profileName:
      typeof e.PROFILE_NAME == "string" && e.PROFILE_NAME.trim() ? e.PROFILE_NAME.trim() : n,
    personality:
      typeof e.PERSONALITY == "string" && e.PERSONALITY.trim() ? e.PERSONALITY.trim() : "",
    initGitHubClaw:
      typeof e.INIT_GITHUB_CLAW == "string" && e.INIT_GITHUB_CLAW.trim().toLowerCase() === "true",
    telegram: {
      botToken: Fr(t, "TELEGRAM_BOT_TOKEN"),
      webhookSecret: Fr(t, "TELEGRAM_WEBHOOK_SECRET"),
      apiBaseUrl: Fr(t, "TELEGRAM_API_BASE_URL"),
      webhookPath: ph(t, "TELEGRAM_WEBHOOK_PATH"),
      defaultChatId: oa(t, "TELEGRAM_CHAT_ID"),
      accessMode: "open",
      maxMessageLength: mh(e.TELEGRAM_MAX_MESSAGE_LENGTH, "TELEGRAM_MAX_MESSAGE_LENGTH"),
      allowedChatId: oa(t, "TELEGRAM_ALLOWED_CHAT_ID"),
      allowedFromId: oa(t, "TELEGRAM_ALLOWED_FROM_ID"),
    },
    github: {
      token: dh(t, ["CLAW_SYS_GITHUB_TOKEN", "GITHUB_TOKEN"]),
      webhookSecret: Fr(t, "GITHUB_WEBHOOK_SECRET"),
      owner: r,
      repo: n,
      repoFullName: `${r}/${n}`,
      apiBaseUrl:
        typeof e.GITHUB_API_BASE_URL == "string" && e.GITHUB_API_BASE_URL.trim()
          ? e.GITHUB_API_BASE_URL.trim()
          : "https://api.github.com",
      apiVersion: "2022-11-28",
      userAgent: "altShiftClawCore/1.0.0",
      webhookPath: "/github/webhook",
    },
    scheduleStorage: { database: fh(t, "SCHEDULES_DB") },
    scheduleTimeUnderstanding: { model: nc, ai: sc(t, "AI") },
    workflowInputInference: { model: nc, ai: sc(t, "AI") },
    version: "0.2.24",
  };
}
var oc = async (e, t) => {
  let r = To(e.env);
  (e.set("config", r), await t());
};
function pr() {
  return typeof navigator == "object" && "userAgent" in navigator
    ? navigator.userAgent
    : typeof process == "object" && process.version !== void 0
      ? `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`
      : "<environment undetectable>";
}
function ko(e, t, r, n) {
  if (typeof r != "function") throw new Error("method for before hook must be a function");
  return (
    n || (n = {}),
    Array.isArray(t)
      ? t.reverse().reduce((s, o) => ko.bind(null, e, o, s, n), r)()
      : Promise.resolve().then(() =>
          e.registry[t] ? e.registry[t].reduce((s, o) => o.hook.bind(null, s, n), r)() : r(n),
        )
  );
}
function ic(e, t, r, n) {
  let s = n;
  (e.registry[r] || (e.registry[r] = []),
    t === "before" && (n = (o, i) => Promise.resolve().then(s.bind(null, i)).then(o.bind(null, i))),
    t === "after" &&
      (n = (o, i) => {
        let a;
        return Promise.resolve()
          .then(o.bind(null, i))
          .then((l) => ((a = l), s(a, i)))
          .then(() => a);
      }),
    t === "error" &&
      (n = (o, i) =>
        Promise.resolve()
          .then(o.bind(null, i))
          .catch((a) => s(a, i))),
    e.registry[r].push({ hook: n, orig: s }));
}
function ac(e, t, r) {
  if (!e.registry[t]) return;
  let n = e.registry[t].map((s) => s.orig).indexOf(r);
  n !== -1 && e.registry[t].splice(n, 1);
}
var lc = Function.bind,
  uc = lc.bind(lc);
function cc(e, t, r) {
  let n = uc(ac, null).apply(null, r ? [t, r] : [t]);
  ((e.api = { remove: n }),
    (e.remove = n),
    ["before", "error", "after", "wrap"].forEach((s) => {
      let o = r ? [t, s, r] : [t, s];
      e[s] = e.api[s] = uc(ic, null).apply(null, o);
    }));
}
function gh() {
  let e = Symbol("Singular"),
    t = { registry: {} },
    r = ko.bind(null, t, e);
  return (cc(r, t, e), r);
}
function hh() {
  let e = { registry: {} },
    t = ko.bind(null, e);
  return (cc(t, e), t);
}
var dc = { Singular: gh, Collection: hh };
var wh = "0.0.0-development",
  bh = `octokit-endpoint.js/${wh} ${pr()}`,
  yh = {
    method: "GET",
    baseUrl: "https://api.github.com",
    headers: { accept: "application/vnd.github.v3+json", "user-agent": bh },
    mediaType: { format: "" },
  };
function _h(e) {
  return e ? Object.keys(e).reduce((t, r) => ((t[r.toLowerCase()] = e[r]), t), {}) : {};
}
function Th(e) {
  if (typeof e != "object" || e === null || Object.prototype.toString.call(e) !== "[object Object]")
    return !1;
  let t = Object.getPrototypeOf(e);
  if (t === null) return !0;
  let r = Object.prototype.hasOwnProperty.call(t, "constructor") && t.constructor;
  return (
    typeof r == "function" &&
    r instanceof r &&
    Function.prototype.call(r) === Function.prototype.call(e)
  );
}
function fc(e, t) {
  let r = Object.assign({}, e);
  return (
    Object.keys(t).forEach((n) => {
      Th(t[n])
        ? n in e
          ? (r[n] = fc(e[n], t[n]))
          : Object.assign(r, { [n]: t[n] })
        : Object.assign(r, { [n]: t[n] });
    }),
    r
  );
}
function pc(e) {
  for (let t in e) e[t] === void 0 && delete e[t];
  return e;
}
function aa(e, t, r) {
  if (typeof t == "string") {
    let [s, o] = t.split(" ");
    r = Object.assign(o ? { method: s, url: o } : { url: s }, r);
  } else r = Object.assign({}, t);
  ((r.headers = _h(r.headers)), pc(r), pc(r.headers));
  let n = fc(e || {}, r);
  return (
    r.url === "/graphql" &&
      (e &&
        e.mediaType.previews?.length &&
        (n.mediaType.previews = e.mediaType.previews
          .filter((s) => !n.mediaType.previews.includes(s))
          .concat(n.mediaType.previews)),
      (n.mediaType.previews = (n.mediaType.previews || []).map((s) => s.replace(/-preview/, "")))),
    n
  );
}
function kh(e, t) {
  let r = /\?/.test(e) ? "&" : "?",
    n = Object.keys(t);
  return n.length === 0
    ? e
    : e +
        r +
        n
          .map((s) =>
            s === "q"
              ? "q=" + t.q.split("+").map(encodeURIComponent).join("+")
              : `${s}=${encodeURIComponent(t[s])}`,
          )
          .join("&");
}
var Eh = /\{[^{}}]+\}/g;
function Sh(e) {
  return e.replace(/(?:^\W+)|(?:(?<!\W)\W+$)/g, "").split(/,/);
}
function Ih(e) {
  let t = e.match(Eh);
  return t ? t.map(Sh).reduce((r, n) => r.concat(n), []) : [];
}
function mc(e, t) {
  let r = { __proto__: null };
  for (let n of Object.keys(e)) t.indexOf(n) === -1 && (r[n] = e[n]);
  return r;
}
function gc(e) {
  return e
    .split(/(%[0-9A-Fa-f]{2})/g)
    .map(function (t) {
      return (
        /%[0-9A-Fa-f]/.test(t) || (t = encodeURI(t).replace(/%5B/g, "[").replace(/%5D/g, "]")),
        t
      );
    })
    .join("");
}
function mn(e) {
  return encodeURIComponent(e).replace(/[!'()*]/g, function (t) {
    return "%" + t.charCodeAt(0).toString(16).toUpperCase();
  });
}
function es(e, t, r) {
  return ((t = e === "+" || e === "#" ? gc(t) : mn(t)), r ? mn(r) + "=" + t : t);
}
function pn(e) {
  return e != null;
}
function ia(e) {
  return e === ";" || e === "&" || e === "?";
}
function vh(e, t, r, n) {
  var s = e[r],
    o = [];
  if (pn(s) && s !== "")
    if (
      typeof s == "string" ||
      typeof s == "number" ||
      typeof s == "bigint" ||
      typeof s == "boolean"
    )
      ((s = s.toString()),
        n && n !== "*" && (s = s.substring(0, parseInt(n, 10))),
        o.push(es(t, s, ia(t) ? r : "")));
    else if (n === "*")
      Array.isArray(s)
        ? s.filter(pn).forEach(function (i) {
            o.push(es(t, i, ia(t) ? r : ""));
          })
        : Object.keys(s).forEach(function (i) {
            pn(s[i]) && o.push(es(t, s[i], i));
          });
    else {
      let i = [];
      (Array.isArray(s)
        ? s.filter(pn).forEach(function (a) {
            i.push(es(t, a));
          })
        : Object.keys(s).forEach(function (a) {
            pn(s[a]) && (i.push(mn(a)), i.push(es(t, s[a].toString())));
          }),
        ia(t) ? o.push(mn(r) + "=" + i.join(",")) : i.length !== 0 && o.push(i.join(",")));
    }
  else
    t === ";"
      ? pn(s) && o.push(mn(r))
      : s === "" && (t === "&" || t === "?")
        ? o.push(mn(r) + "=")
        : s === "" && o.push("");
  return o;
}
function Ch(e) {
  return { expand: Rh.bind(null, e) };
}
function Rh(e, t) {
  var r = ["+", "#", ".", "/", ";", "?", "&"];
  return (
    (e = e.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (n, s, o) {
      if (s) {
        let a = "",
          l = [];
        if (
          (r.indexOf(s.charAt(0)) !== -1 && ((a = s.charAt(0)), (s = s.substr(1))),
          s.split(/,/g).forEach(function (c) {
            var d = /([^:\*]*)(?::(\d+)|(\*))?/.exec(c);
            l.push(vh(t, a, d[1], d[2] || d[3]));
          }),
          a && a !== "+")
        ) {
          var i = ",";
          return (
            a === "?" ? (i = "&") : a !== "#" && (i = a),
            (l.length !== 0 ? a : "") + l.join(i)
          );
        } else return l.join(",");
      } else return gc(o);
    })),
    e === "/" ? e : e.replace(/\/$/, "")
  );
}
function hc(e) {
  let t = e.method.toUpperCase(),
    r = (e.url || "/").replace(/:([a-z]\w+)/g, "{$1}"),
    n = Object.assign({}, e.headers),
    s,
    o = mc(e, ["method", "baseUrl", "url", "headers", "request", "mediaType"]),
    i = Ih(r);
  ((r = Ch(r).expand(o)), /^http/.test(r) || (r = e.baseUrl + r));
  let a = Object.keys(e)
      .filter((d) => i.includes(d))
      .concat("baseUrl"),
    l = mc(o, a);
  if (
    !/application\/octet-stream/i.test(n.accept) &&
    (e.mediaType.format &&
      (n.accept = n.accept
        .split(/,/)
        .map((d) =>
          d.replace(
            /application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/,
            `application/vnd$1$2.${e.mediaType.format}`,
          ),
        )
        .join(",")),
    r.endsWith("/graphql") && e.mediaType.previews?.length)
  ) {
    let d = n.accept.match(/(?<![\w-])[\w-]+(?=-preview)/g) || [];
    n.accept = d
      .concat(e.mediaType.previews)
      .map((m) => {
        let w = e.mediaType.format ? `.${e.mediaType.format}` : "+json";
        return `application/vnd.github.${m}-preview${w}`;
      })
      .join(",");
  }
  return (
    ["GET", "HEAD"].includes(t)
      ? (r = kh(r, l))
      : "data" in l
        ? (s = l.data)
        : Object.keys(l).length && (s = l),
    !n["content-type"] && typeof s < "u" && (n["content-type"] = "application/json; charset=utf-8"),
    ["PATCH", "PUT"].includes(t) && typeof s > "u" && (s = ""),
    Object.assign(
      { method: t, url: r, headers: n },
      typeof s < "u" ? { body: s } : null,
      e.request ? { request: e.request } : null,
    )
  );
}
function Ah(e, t, r) {
  return hc(aa(e, t, r));
}
function wc(e, t) {
  let r = aa(e, t),
    n = Ah.bind(null, r);
  return Object.assign(n, {
    DEFAULTS: r,
    defaults: wc.bind(null, r),
    merge: aa.bind(null, r),
    parse: hc,
  });
}
var bc = wc(null, yh);
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE Pc] @octokit + AI workflow  —  VENDOR+BIZ
// ║ Octokit GitHub SDK (graphql/auth-token/request) + AI workflow param business logic
// ╚══════════════════════════════════════════════════════════════════════════════
var Pc = Ou(kc(), 1);
var xh = /^-?\d+$/,
  Ic = /^-?\d+n+$/,
  la = JSON.stringify,
  Ec = JSON.parse,
  Ph = /^-?\d+n$/,
  Mh = /([\[:])?"(-?\d+)n"($|([\\n]|\s)*(\s|[\\n])*[,\}\]])/g,
  Oh = /([\[:])?("-?\d+n+)n("$|"([\\n]|\s)*(\s|[\\n])*[,\}\]])/g,
  vc = (e, t, r) =>
    "rawJSON" in JSON
      ? la(
          e,
          (i, a) =>
            typeof a == "bigint"
              ? JSON.rawJSON(a.toString())
              : typeof t == "function"
                ? t(i, a)
                : (Array.isArray(t) && t.includes(i), a),
          r,
        )
      : e
        ? la(
            e,
            (i, a) =>
              (typeof a == "string" && Ic.test(a)) || typeof a == "bigint"
                ? a.toString() + "n"
                : typeof t == "function"
                  ? t(i, a)
                  : (Array.isArray(t) && t.includes(i), a),
            r,
          )
            .replace(Mh, "$1$2$3")
            .replace(Oh, "$1$2$3")
        : la(e, t, r),
  vo = new Map(),
  Nh = () => {
    let e = JSON.parse.toString();
    if (vo.has(e)) return vo.get(e);
    try {
      let t = JSON.parse("1", (r, n, s) => !!s?.source && s.source === "1");
      return (vo.set(e, t), t);
    } catch {
      return (vo.set(e, !1), !1);
    }
  },
  Gh = (e, t, r, n) =>
    typeof t == "string" && Ph.test(t)
      ? BigInt(t.slice(0, -1))
      : typeof t == "string" && Ic.test(t)
        ? t.slice(0, -1)
        : typeof n != "function"
          ? t
          : n(e, t, r),
  Fh = (e, t) =>
    JSON.parse(e, (r, n, s) => {
      let o = typeof n == "number" && (n > Number.MAX_SAFE_INTEGER || n < Number.MIN_SAFE_INTEGER),
        i = s && xh.test(s.source);
      return o && i ? BigInt(s.source) : typeof t != "function" ? n : t(r, n, s);
    }),
  Cc = Number.MAX_SAFE_INTEGER.toString(),
  Sc = Cc.length,
  $h = /"(?:\\.|[^"])*"|-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?/g,
  Lh = /^"-?\d+n+"$/,
  Rc = (e, t) => {
    if (!e) return Ec(e, t);
    if (Nh()) return Fh(e, t);
    let r = e.replace($h, (n, s, o, i) => {
      let a = n[0] === '"';
      if (a && Lh.test(n)) return n.substring(0, n.length - 1) + 'n"';
      let c = o || i,
        d = s && (s.length < Sc || (s.length === Sc && s <= Cc));
      return a || c || d ? n : '"' + n + 'n"';
    });
    return Ec(r, (n, s, o) => Gh(n, s, o, t));
  };
var Lr = class extends Error {
  name;
  status;
  request;
  response;
  constructor(t, r, n) {
    (super(t, { cause: n.cause }),
      (this.name = "HttpError"),
      (this.status = Number.parseInt(r)),
      Number.isNaN(this.status) && (this.status = 0));
    "response" in n && (this.response = n.response);
    let s = Object.assign({}, n.request);
    (n.request.headers.authorization &&
      (s.headers = Object.assign({}, n.request.headers, {
        authorization: n.request.headers.authorization.replace(/(?<! ) .*$/, " [REDACTED]"),
      })),
      (s.url = s.url
        .replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]")
        .replace(/\baccess_token=\w+/g, "access_token=[REDACTED]")),
      (this.request = s));
  }
};
var Dh = "10.0.8",
  Uh = { headers: { "user-agent": `octokit-request.js/${Dh} ${pr()}` } };
function Bh(e) {
  if (typeof e != "object" || e === null || Object.prototype.toString.call(e) !== "[object Object]")
    return !1;
  let t = Object.getPrototypeOf(e);
  if (t === null) return !0;
  let r = Object.prototype.hasOwnProperty.call(t, "constructor") && t.constructor;
  return (
    typeof r == "function" &&
    r instanceof r &&
    Function.prototype.call(r) === Function.prototype.call(e)
  );
}
var Ac = () => "";
async function xc(e) {
  let t = e.request?.fetch || globalThis.fetch;
  if (!t)
    throw new Error(
      "fetch is not set. Please pass a fetch implementation as new Octokit({ request: { fetch }}). Learn more at https://github.com/octokit/octokit.js/#fetch-missing",
    );
  let r = e.request?.log || console,
    n = e.request?.parseSuccessResponseBody !== !1,
    s = Bh(e.body) || Array.isArray(e.body) ? vc(e.body) : e.body,
    o = Object.fromEntries(Object.entries(e.headers).map(([m, w]) => [m, String(w)])),
    i;
  try {
    i = await t(e.url, {
      method: e.method,
      body: s,
      redirect: e.request?.redirect,
      headers: o,
      signal: e.request?.signal,
      ...(e.body && { duplex: "half" }),
    });
  } catch (m) {
    let w = "Unknown Error";
    if (m instanceof Error) {
      if (m.name === "AbortError") throw ((m.status = 500), m);
      ((w = m.message),
        m.name === "TypeError" &&
          "cause" in m &&
          (m.cause instanceof Error
            ? (w = m.cause.message)
            : typeof m.cause == "string" && (w = m.cause)));
    }
    let y = new Lr(w, 500, { request: e });
    throw ((y.cause = m), y);
  }
  let a = i.status,
    l = i.url,
    c = {};
  for (let [m, w] of i.headers) c[m] = w;
  let d = { url: l, status: a, headers: c, data: "" };
  if ("deprecation" in c) {
    let m = c.link && c.link.match(/<([^<>]+)>; rel="deprecation"/),
      w = m && m.pop();
    r.warn(
      `[@octokit/request] "${e.method} ${e.url}" is deprecated. It is scheduled to be removed on ${c.sunset}${w ? `. See ${w}` : ""}`,
    );
  }
  if (a === 204 || a === 205) return d;
  if (e.method === "HEAD") {
    if (a < 400) return d;
    throw new Lr(i.statusText, a, { response: d, request: e });
  }
  if (a === 304)
    throw ((d.data = await ua(i)), new Lr("Not modified", a, { response: d, request: e }));
  if (a >= 400) throw ((d.data = await ua(i)), new Lr(Wh(d.data), a, { response: d, request: e }));
  return ((d.data = n ? await ua(i) : i.body), d);
}
async function ua(e) {
  let t = e.headers.get("content-type");
  if (!t) return e.text().catch(Ac);
  let r = (0, Pc.safeParse)(t);
  if (jh(r)) {
    let n = "";
    try {
      return ((n = await e.text()), Rc(n));
    } catch {
      return n;
    }
  } else
    return r.type.startsWith("text/") || r.parameters.charset?.toLowerCase() === "utf-8"
      ? e.text().catch(Ac)
      : e.arrayBuffer().catch(() => new ArrayBuffer(0));
}
function jh(e) {
  return e.type === "application/json" || e.type === "application/scim+json";
}
function Wh(e) {
  if (typeof e == "string") return e;
  if (e instanceof ArrayBuffer) return "Unknown error";
  if ("message" in e) {
    let t = "documentation_url" in e ? ` - ${e.documentation_url}` : "";
    return Array.isArray(e.errors)
      ? `${e.message}: ${e.errors.map((r) => JSON.stringify(r)).join(", ")}${t}`
      : `${e.message}${t}`;
  }
  return `Unknown error: ${JSON.stringify(e)}`;
}
function ca(e, t) {
  let r = e.defaults(t);
  return Object.assign(
    function (s, o) {
      let i = r.merge(s, o);
      if (!i.request || !i.request.hook) return xc(r.parse(i));
      let a = (l, c) => xc(r.parse(r.merge(l, c)));
      return (Object.assign(a, { endpoint: r, defaults: ca.bind(null, r) }), i.request.hook(a, i));
    },
    { endpoint: r, defaults: ca.bind(null, r) },
  );
}
var rs = ca(bc, Uh);
var qh = "0.0.0-development";
function Kh(e) {
  return (
    `Request failed due to following response errors:
` +
    e.errors.map((t) => ` - ${t.message}`).join(`
`)
  );
}
var Hh = class extends Error {
    constructor(e, t, r) {
      (super(Kh(r)),
        (this.request = e),
        (this.headers = t),
        (this.response = r),
        (this.errors = r.errors),
        (this.data = r.data),
        Error.captureStackTrace && Error.captureStackTrace(this, this.constructor));
    }
    name = "GraphqlResponseError";
    errors;
    data;
  },
  zh = ["method", "baseUrl", "url", "headers", "request", "query", "mediaType", "operationName"],
  Qh = ["query", "method", "url"],
  Mc = /\/api\/v3\/?$/;
function Vh(e, t, r) {
  if (r) {
    if (typeof t == "string" && "query" in r)
      return Promise.reject(
        new Error('[@octokit/graphql] "query" cannot be used as variable name'),
      );
    for (let i in r)
      if (Qh.includes(i))
        return Promise.reject(
          new Error(`[@octokit/graphql] "${i}" cannot be used as variable name`),
        );
  }
  let n = typeof t == "string" ? Object.assign({ query: t }, r) : t,
    s = Object.keys(n).reduce(
      (i, a) =>
        zh.includes(a)
          ? ((i[a] = n[a]), i)
          : (i.variables || (i.variables = {}), (i.variables[a] = n[a]), i),
      {},
    ),
    o = n.baseUrl || e.endpoint.DEFAULTS.baseUrl;
  return (
    Mc.test(o) && (s.url = o.replace(Mc, "/api/graphql")),
    e(s).then((i) => {
      if (i.data.errors) {
        let a = {};
        for (let l of Object.keys(i.headers)) a[l] = i.headers[l];
        throw new Hh(s, a, i.data);
      }
      return i.data.data;
    })
  );
}
function da(e, t) {
  let r = e.defaults(t);
  return Object.assign((s, o) => Vh(r, s, o), { defaults: da.bind(null, r), endpoint: r.endpoint });
}
var P0 = da(rs, {
  headers: { "user-agent": `octokit-graphql.js/${qh} ${pr()}` },
  method: "POST",
  url: "/graphql",
});
function Oc(e) {
  return da(e, { method: "POST", url: "/graphql" });
}
var pa = "(?:[a-zA-Z0-9_-]+)",
  Nc = "\\.",
  Gc = new RegExp(`^${pa}${Nc}${pa}${Nc}${pa}$`),
  Jh = Gc.test.bind(Gc);
async function Yh(e) {
  let t = Jh(e),
    r = e.startsWith("v1.") || e.startsWith("ghs_"),
    n = e.startsWith("ghu_");
  return {
    type: "token",
    token: e,
    tokenType: t ? "app" : r ? "installation" : n ? "user-to-server" : "oauth",
  };
}
function Xh(e) {
  return e.split(/\./).length === 3 ? `bearer ${e}` : `token ${e}`;
}
async function Zh(e, t, r, n) {
  let s = t.endpoint.merge(r, n);
  return ((s.headers.authorization = Xh(e)), t(s));
}
var Fc = function (t) {
  if (!t) throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
  if (typeof t != "string")
    throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");
  return (
    (t = t.replace(/^(token|bearer) +/i, "")),
    Object.assign(Yh.bind(null, t), { hook: Zh.bind(null, t) })
  );
};
var ma = "7.0.6";
var $c = () => {},
  ew = console.warn.bind(console),
  tw = console.error.bind(console);
function rw(e = {}) {
  return (
    typeof e.debug != "function" && (e.debug = $c),
    typeof e.info != "function" && (e.info = $c),
    typeof e.warn != "function" && (e.warn = ew),
    typeof e.error != "function" && (e.error = tw),
    e
  );
}
var Lc = `octokit-core.js/${ma} ${pr()}`,
  Co = class {
    static VERSION = ma;
    static defaults(t) {
      return class extends this {
        constructor(...n) {
          let s = n[0] || {};
          if (typeof t == "function") {
            super(t(s));
            return;
          }
          super(
            Object.assign(
              {},
              t,
              s,
              s.userAgent && t.userAgent ? { userAgent: `${s.userAgent} ${t.userAgent}` } : null,
            ),
          );
        }
      };
    }
    static plugins = [];
    static plugin(...t) {
      let r = this.plugins;
      return class extends this {
        static plugins = r.concat(t.filter((s) => !r.includes(s)));
      };
    }
    constructor(t = {}) {
      let r = new dc.Collection(),
        n = {
          baseUrl: rs.endpoint.DEFAULTS.baseUrl,
          headers: {},
          request: Object.assign({}, t.request, { hook: r.bind(null, "request") }),
          mediaType: { previews: [], format: "" },
        };
      if (
        ((n.headers["user-agent"] = t.userAgent ? `${t.userAgent} ${Lc}` : Lc),
        t.baseUrl && (n.baseUrl = t.baseUrl),
        t.previews && (n.mediaType.previews = t.previews),
        t.timeZone && (n.headers["time-zone"] = t.timeZone),
        (this.request = rs.defaults(n)),
        (this.graphql = Oc(this.request).defaults(n)),
        (this.log = rw(t.log)),
        (this.hook = r),
        t.authStrategy)
      ) {
        let { authStrategy: o, ...i } = t,
          a = o(
            Object.assign(
              { request: this.request, log: this.log, octokit: this, octokitOptions: i },
              t.auth,
            ),
          );
        (r.wrap("request", a.hook), (this.auth = a));
      } else if (!t.auth) this.auth = async () => ({ type: "unauthenticated" });
      else {
        let o = Fc(t.auth);
        (r.wrap("request", o.hook), (this.auth = o));
      }
      let s = this.constructor;
      for (let o = 0; o < s.plugins.length; ++o) Object.assign(this, s.plugins[o](this, t));
    }
    request;
    graphql;
    log;
    hook;
    auth;
  };
var Dc = "6.0.0";
function fa(e) {
  e.hook.wrap("request", (t, r) => {
    e.log.debug("request", r);
    let n = Date.now(),
      s = e.request.endpoint.parse(r),
      o = s.url.replace(r.baseUrl, "");
    return t(r)
      .then((i) => {
        let a = i.headers["x-github-request-id"];
        return (
          e.log.info(`${s.method} ${o} - ${i.status} with id ${a} in ${Date.now() - n}ms`),
          i
        );
      })
      .catch((i) => {
        let a = i.response?.headers["x-github-request-id"] || "UNKNOWN";
        throw (
          e.log.error(`${s.method} ${o} - ${i.status} with id ${a} in ${Date.now() - n}ms`),
          i
        );
      });
  });
}
fa.VERSION = Dc;
var nw = "0.0.0-development";
function sw(e) {
  if (!e.data) return { ...e, data: [] };
  if (!(("total_count" in e.data || "total_commits" in e.data) && !("url" in e.data))) return e;
  let r = e.data.incomplete_results,
    n = e.data.repository_selection,
    s = e.data.total_count,
    o = e.data.total_commits;
  (delete e.data.incomplete_results,
    delete e.data.repository_selection,
    delete e.data.total_count,
    delete e.data.total_commits);
  let i = Object.keys(e.data)[0],
    a = e.data[i];
  return (
    (e.data = a),
    typeof r < "u" && (e.data.incomplete_results = r),
    typeof n < "u" && (e.data.repository_selection = n),
    (e.data.total_count = s),
    (e.data.total_commits = o),
    e
  );
}
function ga(e, t, r) {
  let n = typeof t == "function" ? t.endpoint(r) : e.request.endpoint(t, r),
    s = typeof t == "function" ? t : e.request,
    o = n.method,
    i = n.headers,
    a = n.url;
  return {
    [Symbol.asyncIterator]: () => ({
      async next() {
        if (!a) return { done: !0 };
        try {
          let l = await s({ method: o, url: a, headers: i }),
            c = sw(l);
          if (
            ((a = ((c.headers.link || "").match(/<([^<>]+)>;\s*rel="next"/) || [])[1]),
            !a && "total_commits" in c.data)
          ) {
            let d = new URL(c.url),
              m = d.searchParams,
              w = parseInt(m.get("page") || "1", 10),
              y = parseInt(m.get("per_page") || "250", 10);
            w * y < c.data.total_commits && (m.set("page", String(w + 1)), (a = d.toString()));
          }
          return { value: c };
        } catch (l) {
          if (l.status !== 409) throw l;
          return ((a = ""), { value: { status: 200, headers: {}, data: [] } });
        }
      },
    }),
  };
}
function Uc(e, t, r, n) {
  return (
    typeof r == "function" && ((n = r), (r = void 0)),
    Bc(e, [], ga(e, t, r)[Symbol.asyncIterator](), n)
  );
}
function Bc(e, t, r, n) {
  return r.next().then((s) => {
    if (s.done) return t;
    let o = !1;
    function i() {
      o = !0;
    }
    return ((t = t.concat(n ? n(s.value, i) : s.value.data)), o ? t : Bc(e, t, r, n));
  });
}
var Q0 = Object.assign(Uc, { iterator: ga });
function ha(e) {
  return { paginate: Object.assign(Uc.bind(null, e), { iterator: ga.bind(null, e) }) };
}
ha.VERSION = nw;
var wa = "17.0.0";
var ow = {
    actions: {
      addCustomLabelsToSelfHostedRunnerForOrg: [
        "POST /orgs/{org}/actions/runners/{runner_id}/labels",
      ],
      addCustomLabelsToSelfHostedRunnerForRepo: [
        "POST /repos/{owner}/{repo}/actions/runners/{runner_id}/labels",
      ],
      addRepoAccessToSelfHostedRunnerGroupInOrg: [
        "PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id}",
      ],
      addSelectedRepoToOrgSecret: [
        "PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}",
      ],
      addSelectedRepoToOrgVariable: [
        "PUT /orgs/{org}/actions/variables/{name}/repositories/{repository_id}",
      ],
      approveWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve"],
      cancelWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel"],
      createEnvironmentVariable: [
        "POST /repos/{owner}/{repo}/environments/{environment_name}/variables",
      ],
      createHostedRunnerForOrg: ["POST /orgs/{org}/actions/hosted-runners"],
      createOrUpdateEnvironmentSecret: [
        "PUT /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}",
      ],
      createOrUpdateOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}"],
      createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
      createOrgVariable: ["POST /orgs/{org}/actions/variables"],
      createRegistrationTokenForOrg: ["POST /orgs/{org}/actions/runners/registration-token"],
      createRegistrationTokenForRepo: [
        "POST /repos/{owner}/{repo}/actions/runners/registration-token",
      ],
      createRemoveTokenForOrg: ["POST /orgs/{org}/actions/runners/remove-token"],
      createRemoveTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/remove-token"],
      createRepoVariable: ["POST /repos/{owner}/{repo}/actions/variables"],
      createWorkflowDispatch: [
        "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
      ],
      deleteActionsCacheById: ["DELETE /repos/{owner}/{repo}/actions/caches/{cache_id}"],
      deleteActionsCacheByKey: ["DELETE /repos/{owner}/{repo}/actions/caches{?key,ref}"],
      deleteArtifact: ["DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
      deleteCustomImageFromOrg: [
        "DELETE /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}",
      ],
      deleteCustomImageVersionFromOrg: [
        "DELETE /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions/{version}",
      ],
      deleteEnvironmentSecret: [
        "DELETE /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}",
      ],
      deleteEnvironmentVariable: [
        "DELETE /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}",
      ],
      deleteHostedRunnerForOrg: ["DELETE /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"],
      deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
      deleteOrgVariable: ["DELETE /orgs/{org}/actions/variables/{name}"],
      deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
      deleteRepoVariable: ["DELETE /repos/{owner}/{repo}/actions/variables/{name}"],
      deleteSelfHostedRunnerFromOrg: ["DELETE /orgs/{org}/actions/runners/{runner_id}"],
      deleteSelfHostedRunnerFromRepo: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}"],
      deleteWorkflowRun: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}"],
      deleteWorkflowRunLogs: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
      disableSelectedRepositoryGithubActionsOrganization: [
        "DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}",
      ],
      disableWorkflow: ["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable"],
      downloadArtifact: [
        "GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}",
      ],
      downloadJobLogsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs"],
      downloadWorkflowRunAttemptLogs: [
        "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/logs",
      ],
      downloadWorkflowRunLogs: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
      enableSelectedRepositoryGithubActionsOrganization: [
        "PUT /orgs/{org}/actions/permissions/repositories/{repository_id}",
      ],
      enableWorkflow: ["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable"],
      forceCancelWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/force-cancel"],
      generateRunnerJitconfigForOrg: ["POST /orgs/{org}/actions/runners/generate-jitconfig"],
      generateRunnerJitconfigForRepo: [
        "POST /repos/{owner}/{repo}/actions/runners/generate-jitconfig",
      ],
      getActionsCacheList: ["GET /repos/{owner}/{repo}/actions/caches"],
      getActionsCacheUsage: ["GET /repos/{owner}/{repo}/actions/cache/usage"],
      getActionsCacheUsageByRepoForOrg: ["GET /orgs/{org}/actions/cache/usage-by-repository"],
      getActionsCacheUsageForOrg: ["GET /orgs/{org}/actions/cache/usage"],
      getAllowedActionsOrganization: ["GET /orgs/{org}/actions/permissions/selected-actions"],
      getAllowedActionsRepository: [
        "GET /repos/{owner}/{repo}/actions/permissions/selected-actions",
      ],
      getArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
      getCustomImageForOrg: [
        "GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}",
      ],
      getCustomImageVersionForOrg: [
        "GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions/{version}",
      ],
      getCustomOidcSubClaimForRepo: ["GET /repos/{owner}/{repo}/actions/oidc/customization/sub"],
      getEnvironmentPublicKey: [
        "GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/public-key",
      ],
      getEnvironmentSecret: [
        "GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}",
      ],
      getEnvironmentVariable: [
        "GET /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}",
      ],
      getGithubActionsDefaultWorkflowPermissionsOrganization: [
        "GET /orgs/{org}/actions/permissions/workflow",
      ],
      getGithubActionsDefaultWorkflowPermissionsRepository: [
        "GET /repos/{owner}/{repo}/actions/permissions/workflow",
      ],
      getGithubActionsPermissionsOrganization: ["GET /orgs/{org}/actions/permissions"],
      getGithubActionsPermissionsRepository: ["GET /repos/{owner}/{repo}/actions/permissions"],
      getHostedRunnerForOrg: ["GET /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"],
      getHostedRunnersGithubOwnedImagesForOrg: [
        "GET /orgs/{org}/actions/hosted-runners/images/github-owned",
      ],
      getHostedRunnersLimitsForOrg: ["GET /orgs/{org}/actions/hosted-runners/limits"],
      getHostedRunnersMachineSpecsForOrg: ["GET /orgs/{org}/actions/hosted-runners/machine-sizes"],
      getHostedRunnersPartnerImagesForOrg: [
        "GET /orgs/{org}/actions/hosted-runners/images/partner",
      ],
      getHostedRunnersPlatformsForOrg: ["GET /orgs/{org}/actions/hosted-runners/platforms"],
      getJobForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],
      getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
      getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
      getOrgVariable: ["GET /orgs/{org}/actions/variables/{name}"],
      getPendingDeploymentsForRun: [
        "GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments",
      ],
      getRepoPermissions: [
        "GET /repos/{owner}/{repo}/actions/permissions",
        {},
        { renamed: ["actions", "getGithubActionsPermissionsRepository"] },
      ],
      getRepoPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key"],
      getRepoSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
      getRepoVariable: ["GET /repos/{owner}/{repo}/actions/variables/{name}"],
      getReviewsForRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals"],
      getSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}"],
      getSelfHostedRunnerForRepo: ["GET /repos/{owner}/{repo}/actions/runners/{runner_id}"],
      getWorkflow: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],
      getWorkflowAccessToRepository: ["GET /repos/{owner}/{repo}/actions/permissions/access"],
      getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
      getWorkflowRunAttempt: [
        "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}",
      ],
      getWorkflowRunUsage: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing"],
      getWorkflowUsage: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing"],
      listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
      listCustomImageVersionsForOrg: [
        "GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions",
      ],
      listCustomImagesForOrg: ["GET /orgs/{org}/actions/hosted-runners/images/custom"],
      listEnvironmentSecrets: ["GET /repos/{owner}/{repo}/environments/{environment_name}/secrets"],
      listEnvironmentVariables: [
        "GET /repos/{owner}/{repo}/environments/{environment_name}/variables",
      ],
      listGithubHostedRunnersInGroupForOrg: [
        "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/hosted-runners",
      ],
      listHostedRunnersForOrg: ["GET /orgs/{org}/actions/hosted-runners"],
      listJobsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"],
      listJobsForWorkflowRunAttempt: [
        "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs",
      ],
      listLabelsForSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}/labels"],
      listLabelsForSelfHostedRunnerForRepo: [
        "GET /repos/{owner}/{repo}/actions/runners/{runner_id}/labels",
      ],
      listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
      listOrgVariables: ["GET /orgs/{org}/actions/variables"],
      listRepoOrganizationSecrets: ["GET /repos/{owner}/{repo}/actions/organization-secrets"],
      listRepoOrganizationVariables: ["GET /repos/{owner}/{repo}/actions/organization-variables"],
      listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
      listRepoVariables: ["GET /repos/{owner}/{repo}/actions/variables"],
      listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
      listRunnerApplicationsForOrg: ["GET /orgs/{org}/actions/runners/downloads"],
      listRunnerApplicationsForRepo: ["GET /repos/{owner}/{repo}/actions/runners/downloads"],
      listSelectedReposForOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}/repositories"],
      listSelectedReposForOrgVariable: ["GET /orgs/{org}/actions/variables/{name}/repositories"],
      listSelectedRepositoriesEnabledGithubActionsOrganization: [
        "GET /orgs/{org}/actions/permissions/repositories",
      ],
      listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
      listSelfHostedRunnersForRepo: ["GET /repos/{owner}/{repo}/actions/runners"],
      listWorkflowRunArtifacts: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"],
      listWorkflowRuns: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"],
      listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
      reRunJobForWorkflowRun: ["POST /repos/{owner}/{repo}/actions/jobs/{job_id}/rerun"],
      reRunWorkflow: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun"],
      reRunWorkflowFailedJobs: [
        "POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun-failed-jobs",
      ],
      removeAllCustomLabelsFromSelfHostedRunnerForOrg: [
        "DELETE /orgs/{org}/actions/runners/{runner_id}/labels",
      ],
      removeAllCustomLabelsFromSelfHostedRunnerForRepo: [
        "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels",
      ],
      removeCustomLabelFromSelfHostedRunnerForOrg: [
        "DELETE /orgs/{org}/actions/runners/{runner_id}/labels/{name}",
      ],
      removeCustomLabelFromSelfHostedRunnerForRepo: [
        "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels/{name}",
      ],
      removeSelectedRepoFromOrgSecret: [
        "DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}",
      ],
      removeSelectedRepoFromOrgVariable: [
        "DELETE /orgs/{org}/actions/variables/{name}/repositories/{repository_id}",
      ],
      reviewCustomGatesForRun: [
        "POST /repos/{owner}/{repo}/actions/runs/{run_id}/deployment_protection_rule",
      ],
      reviewPendingDeploymentsForRun: [
        "POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments",
      ],
      setAllowedActionsOrganization: ["PUT /orgs/{org}/actions/permissions/selected-actions"],
      setAllowedActionsRepository: [
        "PUT /repos/{owner}/{repo}/actions/permissions/selected-actions",
      ],
      setCustomLabelsForSelfHostedRunnerForOrg: [
        "PUT /orgs/{org}/actions/runners/{runner_id}/labels",
      ],
      setCustomLabelsForSelfHostedRunnerForRepo: [
        "PUT /repos/{owner}/{repo}/actions/runners/{runner_id}/labels",
      ],
      setCustomOidcSubClaimForRepo: ["PUT /repos/{owner}/{repo}/actions/oidc/customization/sub"],
      setGithubActionsDefaultWorkflowPermissionsOrganization: [
        "PUT /orgs/{org}/actions/permissions/workflow",
      ],
      setGithubActionsDefaultWorkflowPermissionsRepository: [
        "PUT /repos/{owner}/{repo}/actions/permissions/workflow",
      ],
      setGithubActionsPermissionsOrganization: ["PUT /orgs/{org}/actions/permissions"],
      setGithubActionsPermissionsRepository: ["PUT /repos/{owner}/{repo}/actions/permissions"],
      setSelectedReposForOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories"],
      setSelectedReposForOrgVariable: ["PUT /orgs/{org}/actions/variables/{name}/repositories"],
      setSelectedRepositoriesEnabledGithubActionsOrganization: [
        "PUT /orgs/{org}/actions/permissions/repositories",
      ],
      setWorkflowAccessToRepository: ["PUT /repos/{owner}/{repo}/actions/permissions/access"],
      updateEnvironmentVariable: [
        "PATCH /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}",
      ],
      updateHostedRunnerForOrg: ["PATCH /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"],
      updateOrgVariable: ["PATCH /orgs/{org}/actions/variables/{name}"],
      updateRepoVariable: ["PATCH /repos/{owner}/{repo}/actions/variables/{name}"],
    },
    activity: {
      checkRepoIsStarredByAuthenticatedUser: ["GET /user/starred/{owner}/{repo}"],
      deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
      deleteThreadSubscription: ["DELETE /notifications/threads/{thread_id}/subscription"],
      getFeeds: ["GET /feeds"],
      getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
      getThread: ["GET /notifications/threads/{thread_id}"],
      getThreadSubscriptionForAuthenticatedUser: [
        "GET /notifications/threads/{thread_id}/subscription",
      ],
      listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
      listNotificationsForAuthenticatedUser: ["GET /notifications"],
      listOrgEventsForAuthenticatedUser: ["GET /users/{username}/events/orgs/{org}"],
      listPublicEvents: ["GET /events"],
      listPublicEventsForRepoNetwork: ["GET /networks/{owner}/{repo}/events"],
      listPublicEventsForUser: ["GET /users/{username}/events/public"],
      listPublicOrgEvents: ["GET /orgs/{org}/events"],
      listReceivedEventsForUser: ["GET /users/{username}/received_events"],
      listReceivedPublicEventsForUser: ["GET /users/{username}/received_events/public"],
      listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
      listRepoNotificationsForAuthenticatedUser: ["GET /repos/{owner}/{repo}/notifications"],
      listReposStarredByAuthenticatedUser: ["GET /user/starred"],
      listReposStarredByUser: ["GET /users/{username}/starred"],
      listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
      listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
      listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
      listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
      markNotificationsAsRead: ["PUT /notifications"],
      markRepoNotificationsAsRead: ["PUT /repos/{owner}/{repo}/notifications"],
      markThreadAsDone: ["DELETE /notifications/threads/{thread_id}"],
      markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
      setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
      setThreadSubscription: ["PUT /notifications/threads/{thread_id}/subscription"],
      starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
      unstarRepoForAuthenticatedUser: ["DELETE /user/starred/{owner}/{repo}"],
    },
    apps: {
      addRepoToInstallation: [
        "PUT /user/installations/{installation_id}/repositories/{repository_id}",
        {},
        { renamed: ["apps", "addRepoToInstallationForAuthenticatedUser"] },
      ],
      addRepoToInstallationForAuthenticatedUser: [
        "PUT /user/installations/{installation_id}/repositories/{repository_id}",
      ],
      checkToken: ["POST /applications/{client_id}/token"],
      createFromManifest: ["POST /app-manifests/{code}/conversions"],
      createInstallationAccessToken: ["POST /app/installations/{installation_id}/access_tokens"],
      deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
      deleteInstallation: ["DELETE /app/installations/{installation_id}"],
      deleteToken: ["DELETE /applications/{client_id}/token"],
      getAuthenticated: ["GET /app"],
      getBySlug: ["GET /apps/{app_slug}"],
      getInstallation: ["GET /app/installations/{installation_id}"],
      getOrgInstallation: ["GET /orgs/{org}/installation"],
      getRepoInstallation: ["GET /repos/{owner}/{repo}/installation"],
      getSubscriptionPlanForAccount: ["GET /marketplace_listing/accounts/{account_id}"],
      getSubscriptionPlanForAccountStubbed: [
        "GET /marketplace_listing/stubbed/accounts/{account_id}",
      ],
      getUserInstallation: ["GET /users/{username}/installation"],
      getWebhookConfigForApp: ["GET /app/hook/config"],
      getWebhookDelivery: ["GET /app/hook/deliveries/{delivery_id}"],
      listAccountsForPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts"],
      listAccountsForPlanStubbed: ["GET /marketplace_listing/stubbed/plans/{plan_id}/accounts"],
      listInstallationReposForAuthenticatedUser: [
        "GET /user/installations/{installation_id}/repositories",
      ],
      listInstallationRequestsForAuthenticatedApp: ["GET /app/installation-requests"],
      listInstallations: ["GET /app/installations"],
      listInstallationsForAuthenticatedUser: ["GET /user/installations"],
      listPlans: ["GET /marketplace_listing/plans"],
      listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
      listReposAccessibleToInstallation: ["GET /installation/repositories"],
      listSubscriptionsForAuthenticatedUser: ["GET /user/marketplace_purchases"],
      listSubscriptionsForAuthenticatedUserStubbed: ["GET /user/marketplace_purchases/stubbed"],
      listWebhookDeliveries: ["GET /app/hook/deliveries"],
      redeliverWebhookDelivery: ["POST /app/hook/deliveries/{delivery_id}/attempts"],
      removeRepoFromInstallation: [
        "DELETE /user/installations/{installation_id}/repositories/{repository_id}",
        {},
        { renamed: ["apps", "removeRepoFromInstallationForAuthenticatedUser"] },
      ],
      removeRepoFromInstallationForAuthenticatedUser: [
        "DELETE /user/installations/{installation_id}/repositories/{repository_id}",
      ],
      resetToken: ["PATCH /applications/{client_id}/token"],
      revokeInstallationAccessToken: ["DELETE /installation/token"],
      scopeToken: ["POST /applications/{client_id}/token/scoped"],
      suspendInstallation: ["PUT /app/installations/{installation_id}/suspended"],
      unsuspendInstallation: ["DELETE /app/installations/{installation_id}/suspended"],
      updateWebhookConfigForApp: ["PATCH /app/hook/config"],
    },
    billing: {
      getGithubActionsBillingOrg: ["GET /orgs/{org}/settings/billing/actions"],
      getGithubActionsBillingUser: ["GET /users/{username}/settings/billing/actions"],
      getGithubBillingPremiumRequestUsageReportOrg: [
        "GET /organizations/{org}/settings/billing/premium_request/usage",
      ],
      getGithubBillingPremiumRequestUsageReportUser: [
        "GET /users/{username}/settings/billing/premium_request/usage",
      ],
      getGithubBillingUsageReportOrg: ["GET /organizations/{org}/settings/billing/usage"],
      getGithubBillingUsageReportUser: ["GET /users/{username}/settings/billing/usage"],
      getGithubPackagesBillingOrg: ["GET /orgs/{org}/settings/billing/packages"],
      getGithubPackagesBillingUser: ["GET /users/{username}/settings/billing/packages"],
      getSharedStorageBillingOrg: ["GET /orgs/{org}/settings/billing/shared-storage"],
      getSharedStorageBillingUser: ["GET /users/{username}/settings/billing/shared-storage"],
    },
    campaigns: {
      createCampaign: ["POST /orgs/{org}/campaigns"],
      deleteCampaign: ["DELETE /orgs/{org}/campaigns/{campaign_number}"],
      getCampaignSummary: ["GET /orgs/{org}/campaigns/{campaign_number}"],
      listOrgCampaigns: ["GET /orgs/{org}/campaigns"],
      updateCampaign: ["PATCH /orgs/{org}/campaigns/{campaign_number}"],
    },
    checks: {
      create: ["POST /repos/{owner}/{repo}/check-runs"],
      createSuite: ["POST /repos/{owner}/{repo}/check-suites"],
      get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}"],
      getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}"],
      listAnnotations: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations"],
      listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs"],
      listForSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs"],
      listSuitesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-suites"],
      rerequestRun: ["POST /repos/{owner}/{repo}/check-runs/{check_run_id}/rerequest"],
      rerequestSuite: ["POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest"],
      setSuitesPreferences: ["PATCH /repos/{owner}/{repo}/check-suites/preferences"],
      update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}"],
    },
    codeScanning: {
      commitAutofix: [
        "POST /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix/commits",
      ],
      createAutofix: ["POST /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix"],
      createVariantAnalysis: ["POST /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses"],
      deleteAnalysis: [
        "DELETE /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}{?confirm_delete}",
      ],
      deleteCodeqlDatabase: [
        "DELETE /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}",
      ],
      getAlert: [
        "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}",
        {},
        { renamedParameters: { alert_id: "alert_number" } },
      ],
      getAnalysis: ["GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}"],
      getAutofix: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix"],
      getCodeqlDatabase: ["GET /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}"],
      getDefaultSetup: ["GET /repos/{owner}/{repo}/code-scanning/default-setup"],
      getSarif: ["GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}"],
      getVariantAnalysis: [
        "GET /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}",
      ],
      getVariantAnalysisRepoTask: [
        "GET /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}/repos/{repo_owner}/{repo_name}",
      ],
      listAlertInstances: [
        "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
      ],
      listAlertsForOrg: ["GET /orgs/{org}/code-scanning/alerts"],
      listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"],
      listAlertsInstances: [
        "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
        {},
        { renamed: ["codeScanning", "listAlertInstances"] },
      ],
      listCodeqlDatabases: ["GET /repos/{owner}/{repo}/code-scanning/codeql/databases"],
      listRecentAnalyses: ["GET /repos/{owner}/{repo}/code-scanning/analyses"],
      updateAlert: ["PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}"],
      updateDefaultSetup: ["PATCH /repos/{owner}/{repo}/code-scanning/default-setup"],
      uploadSarif: ["POST /repos/{owner}/{repo}/code-scanning/sarifs"],
    },
    codeSecurity: {
      attachConfiguration: [
        "POST /orgs/{org}/code-security/configurations/{configuration_id}/attach",
      ],
      attachEnterpriseConfiguration: [
        "POST /enterprises/{enterprise}/code-security/configurations/{configuration_id}/attach",
      ],
      createConfiguration: ["POST /orgs/{org}/code-security/configurations"],
      createConfigurationForEnterprise: [
        "POST /enterprises/{enterprise}/code-security/configurations",
      ],
      deleteConfiguration: ["DELETE /orgs/{org}/code-security/configurations/{configuration_id}"],
      deleteConfigurationForEnterprise: [
        "DELETE /enterprises/{enterprise}/code-security/configurations/{configuration_id}",
      ],
      detachConfiguration: ["DELETE /orgs/{org}/code-security/configurations/detach"],
      getConfiguration: ["GET /orgs/{org}/code-security/configurations/{configuration_id}"],
      getConfigurationForRepository: ["GET /repos/{owner}/{repo}/code-security-configuration"],
      getConfigurationsForEnterprise: [
        "GET /enterprises/{enterprise}/code-security/configurations",
      ],
      getConfigurationsForOrg: ["GET /orgs/{org}/code-security/configurations"],
      getDefaultConfigurations: ["GET /orgs/{org}/code-security/configurations/defaults"],
      getDefaultConfigurationsForEnterprise: [
        "GET /enterprises/{enterprise}/code-security/configurations/defaults",
      ],
      getRepositoriesForConfiguration: [
        "GET /orgs/{org}/code-security/configurations/{configuration_id}/repositories",
      ],
      getRepositoriesForEnterpriseConfiguration: [
        "GET /enterprises/{enterprise}/code-security/configurations/{configuration_id}/repositories",
      ],
      getSingleConfigurationForEnterprise: [
        "GET /enterprises/{enterprise}/code-security/configurations/{configuration_id}",
      ],
      setConfigurationAsDefault: [
        "PUT /orgs/{org}/code-security/configurations/{configuration_id}/defaults",
      ],
      setConfigurationAsDefaultForEnterprise: [
        "PUT /enterprises/{enterprise}/code-security/configurations/{configuration_id}/defaults",
      ],
      updateConfiguration: ["PATCH /orgs/{org}/code-security/configurations/{configuration_id}"],
      updateEnterpriseConfiguration: [
        "PATCH /enterprises/{enterprise}/code-security/configurations/{configuration_id}",
      ],
    },
    codesOfConduct: {
      getAllCodesOfConduct: ["GET /codes_of_conduct"],
      getConductCode: ["GET /codes_of_conduct/{key}"],
    },
    codespaces: {
      addRepositoryForSecretForAuthenticatedUser: [
        "PUT /user/codespaces/secrets/{secret_name}/repositories/{repository_id}",
      ],
      addSelectedRepoToOrgSecret: [
        "PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}",
      ],
      checkPermissionsForDevcontainer: ["GET /repos/{owner}/{repo}/codespaces/permissions_check"],
      codespaceMachinesForAuthenticatedUser: ["GET /user/codespaces/{codespace_name}/machines"],
      createForAuthenticatedUser: ["POST /user/codespaces"],
      createOrUpdateOrgSecret: ["PUT /orgs/{org}/codespaces/secrets/{secret_name}"],
      createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"],
      createOrUpdateSecretForAuthenticatedUser: ["PUT /user/codespaces/secrets/{secret_name}"],
      createWithPrForAuthenticatedUser: [
        "POST /repos/{owner}/{repo}/pulls/{pull_number}/codespaces",
      ],
      createWithRepoForAuthenticatedUser: ["POST /repos/{owner}/{repo}/codespaces"],
      deleteForAuthenticatedUser: ["DELETE /user/codespaces/{codespace_name}"],
      deleteFromOrganization: ["DELETE /orgs/{org}/members/{username}/codespaces/{codespace_name}"],
      deleteOrgSecret: ["DELETE /orgs/{org}/codespaces/secrets/{secret_name}"],
      deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"],
      deleteSecretForAuthenticatedUser: ["DELETE /user/codespaces/secrets/{secret_name}"],
      exportForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/exports"],
      getCodespacesForUserInOrg: ["GET /orgs/{org}/members/{username}/codespaces"],
      getExportDetailsForAuthenticatedUser: [
        "GET /user/codespaces/{codespace_name}/exports/{export_id}",
      ],
      getForAuthenticatedUser: ["GET /user/codespaces/{codespace_name}"],
      getOrgPublicKey: ["GET /orgs/{org}/codespaces/secrets/public-key"],
      getOrgSecret: ["GET /orgs/{org}/codespaces/secrets/{secret_name}"],
      getPublicKeyForAuthenticatedUser: ["GET /user/codespaces/secrets/public-key"],
      getRepoPublicKey: ["GET /repos/{owner}/{repo}/codespaces/secrets/public-key"],
      getRepoSecret: ["GET /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"],
      getSecretForAuthenticatedUser: ["GET /user/codespaces/secrets/{secret_name}"],
      listDevcontainersInRepositoryForAuthenticatedUser: [
        "GET /repos/{owner}/{repo}/codespaces/devcontainers",
      ],
      listForAuthenticatedUser: ["GET /user/codespaces"],
      listInOrganization: [
        "GET /orgs/{org}/codespaces",
        {},
        { renamedParameters: { org_id: "org" } },
      ],
      listInRepositoryForAuthenticatedUser: ["GET /repos/{owner}/{repo}/codespaces"],
      listOrgSecrets: ["GET /orgs/{org}/codespaces/secrets"],
      listRepoSecrets: ["GET /repos/{owner}/{repo}/codespaces/secrets"],
      listRepositoriesForSecretForAuthenticatedUser: [
        "GET /user/codespaces/secrets/{secret_name}/repositories",
      ],
      listSecretsForAuthenticatedUser: ["GET /user/codespaces/secrets"],
      listSelectedReposForOrgSecret: [
        "GET /orgs/{org}/codespaces/secrets/{secret_name}/repositories",
      ],
      preFlightWithRepoForAuthenticatedUser: ["GET /repos/{owner}/{repo}/codespaces/new"],
      publishForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/publish"],
      removeRepositoryForSecretForAuthenticatedUser: [
        "DELETE /user/codespaces/secrets/{secret_name}/repositories/{repository_id}",
      ],
      removeSelectedRepoFromOrgSecret: [
        "DELETE /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}",
      ],
      repoMachinesForAuthenticatedUser: ["GET /repos/{owner}/{repo}/codespaces/machines"],
      setRepositoriesForSecretForAuthenticatedUser: [
        "PUT /user/codespaces/secrets/{secret_name}/repositories",
      ],
      setSelectedReposForOrgSecret: [
        "PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories",
      ],
      startForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/start"],
      stopForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/stop"],
      stopInOrganization: ["POST /orgs/{org}/members/{username}/codespaces/{codespace_name}/stop"],
      updateForAuthenticatedUser: ["PATCH /user/codespaces/{codespace_name}"],
    },
    copilot: {
      addCopilotSeatsForTeams: ["POST /orgs/{org}/copilot/billing/selected_teams"],
      addCopilotSeatsForUsers: ["POST /orgs/{org}/copilot/billing/selected_users"],
      cancelCopilotSeatAssignmentForTeams: ["DELETE /orgs/{org}/copilot/billing/selected_teams"],
      cancelCopilotSeatAssignmentForUsers: ["DELETE /orgs/{org}/copilot/billing/selected_users"],
      copilotMetricsForOrganization: ["GET /orgs/{org}/copilot/metrics"],
      copilotMetricsForTeam: ["GET /orgs/{org}/team/{team_slug}/copilot/metrics"],
      getCopilotOrganizationDetails: ["GET /orgs/{org}/copilot/billing"],
      getCopilotSeatDetailsForUser: ["GET /orgs/{org}/members/{username}/copilot"],
      listCopilotSeats: ["GET /orgs/{org}/copilot/billing/seats"],
    },
    credentials: { revoke: ["POST /credentials/revoke"] },
    dependabot: {
      addSelectedRepoToOrgSecret: [
        "PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}",
      ],
      createOrUpdateOrgSecret: ["PUT /orgs/{org}/dependabot/secrets/{secret_name}"],
      createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"],
      deleteOrgSecret: ["DELETE /orgs/{org}/dependabot/secrets/{secret_name}"],
      deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"],
      getAlert: ["GET /repos/{owner}/{repo}/dependabot/alerts/{alert_number}"],
      getOrgPublicKey: ["GET /orgs/{org}/dependabot/secrets/public-key"],
      getOrgSecret: ["GET /orgs/{org}/dependabot/secrets/{secret_name}"],
      getRepoPublicKey: ["GET /repos/{owner}/{repo}/dependabot/secrets/public-key"],
      getRepoSecret: ["GET /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"],
      listAlertsForEnterprise: ["GET /enterprises/{enterprise}/dependabot/alerts"],
      listAlertsForOrg: ["GET /orgs/{org}/dependabot/alerts"],
      listAlertsForRepo: ["GET /repos/{owner}/{repo}/dependabot/alerts"],
      listOrgSecrets: ["GET /orgs/{org}/dependabot/secrets"],
      listRepoSecrets: ["GET /repos/{owner}/{repo}/dependabot/secrets"],
      listSelectedReposForOrgSecret: [
        "GET /orgs/{org}/dependabot/secrets/{secret_name}/repositories",
      ],
      removeSelectedRepoFromOrgSecret: [
        "DELETE /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}",
      ],
      repositoryAccessForOrg: ["GET /organizations/{org}/dependabot/repository-access"],
      setRepositoryAccessDefaultLevel: [
        "PUT /organizations/{org}/dependabot/repository-access/default-level",
      ],
      setSelectedReposForOrgSecret: [
        "PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories",
      ],
      updateAlert: ["PATCH /repos/{owner}/{repo}/dependabot/alerts/{alert_number}"],
      updateRepositoryAccessForOrg: ["PATCH /organizations/{org}/dependabot/repository-access"],
    },
    dependencyGraph: {
      createRepositorySnapshot: ["POST /repos/{owner}/{repo}/dependency-graph/snapshots"],
      diffRange: ["GET /repos/{owner}/{repo}/dependency-graph/compare/{basehead}"],
      exportSbom: ["GET /repos/{owner}/{repo}/dependency-graph/sbom"],
    },
    emojis: { get: ["GET /emojis"] },
    enterpriseTeamMemberships: {
      add: ["PUT /enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}"],
      bulkAdd: ["POST /enterprises/{enterprise}/teams/{enterprise-team}/memberships/add"],
      bulkRemove: ["POST /enterprises/{enterprise}/teams/{enterprise-team}/memberships/remove"],
      get: ["GET /enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}"],
      list: ["GET /enterprises/{enterprise}/teams/{enterprise-team}/memberships"],
      remove: ["DELETE /enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}"],
    },
    enterpriseTeamOrganizations: {
      add: ["PUT /enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}"],
      bulkAdd: ["POST /enterprises/{enterprise}/teams/{enterprise-team}/organizations/add"],
      bulkRemove: ["POST /enterprises/{enterprise}/teams/{enterprise-team}/organizations/remove"],
      delete: ["DELETE /enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}"],
      getAssignment: ["GET /enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}"],
      getAssignments: ["GET /enterprises/{enterprise}/teams/{enterprise-team}/organizations"],
    },
    enterpriseTeams: {
      create: ["POST /enterprises/{enterprise}/teams"],
      delete: ["DELETE /enterprises/{enterprise}/teams/{team_slug}"],
      get: ["GET /enterprises/{enterprise}/teams/{team_slug}"],
      list: ["GET /enterprises/{enterprise}/teams"],
      update: ["PATCH /enterprises/{enterprise}/teams/{team_slug}"],
    },
    gists: {
      checkIsStarred: ["GET /gists/{gist_id}/star"],
      create: ["POST /gists"],
      createComment: ["POST /gists/{gist_id}/comments"],
      delete: ["DELETE /gists/{gist_id}"],
      deleteComment: ["DELETE /gists/{gist_id}/comments/{comment_id}"],
      fork: ["POST /gists/{gist_id}/forks"],
      get: ["GET /gists/{gist_id}"],
      getComment: ["GET /gists/{gist_id}/comments/{comment_id}"],
      getRevision: ["GET /gists/{gist_id}/{sha}"],
      list: ["GET /gists"],
      listComments: ["GET /gists/{gist_id}/comments"],
      listCommits: ["GET /gists/{gist_id}/commits"],
      listForUser: ["GET /users/{username}/gists"],
      listForks: ["GET /gists/{gist_id}/forks"],
      listPublic: ["GET /gists/public"],
      listStarred: ["GET /gists/starred"],
      star: ["PUT /gists/{gist_id}/star"],
      unstar: ["DELETE /gists/{gist_id}/star"],
      update: ["PATCH /gists/{gist_id}"],
      updateComment: ["PATCH /gists/{gist_id}/comments/{comment_id}"],
    },
    git: {
      createBlob: ["POST /repos/{owner}/{repo}/git/blobs"],
      createCommit: ["POST /repos/{owner}/{repo}/git/commits"],
      createRef: ["POST /repos/{owner}/{repo}/git/refs"],
      createTag: ["POST /repos/{owner}/{repo}/git/tags"],
      createTree: ["POST /repos/{owner}/{repo}/git/trees"],
      deleteRef: ["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],
      getBlob: ["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],
      getCommit: ["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],
      getRef: ["GET /repos/{owner}/{repo}/git/ref/{ref}"],
      getTag: ["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],
      getTree: ["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],
      listMatchingRefs: ["GET /repos/{owner}/{repo}/git/matching-refs/{ref}"],
      updateRef: ["PATCH /repos/{owner}/{repo}/git/refs/{ref}"],
    },
    gitignore: {
      getAllTemplates: ["GET /gitignore/templates"],
      getTemplate: ["GET /gitignore/templates/{name}"],
    },
    hostedCompute: {
      createNetworkConfigurationForOrg: ["POST /orgs/{org}/settings/network-configurations"],
      deleteNetworkConfigurationFromOrg: [
        "DELETE /orgs/{org}/settings/network-configurations/{network_configuration_id}",
      ],
      getNetworkConfigurationForOrg: [
        "GET /orgs/{org}/settings/network-configurations/{network_configuration_id}",
      ],
      getNetworkSettingsForOrg: ["GET /orgs/{org}/settings/network-settings/{network_settings_id}"],
      listNetworkConfigurationsForOrg: ["GET /orgs/{org}/settings/network-configurations"],
      updateNetworkConfigurationForOrg: [
        "PATCH /orgs/{org}/settings/network-configurations/{network_configuration_id}",
      ],
    },
    interactions: {
      getRestrictionsForAuthenticatedUser: ["GET /user/interaction-limits"],
      getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits"],
      getRestrictionsForRepo: ["GET /repos/{owner}/{repo}/interaction-limits"],
      getRestrictionsForYourPublicRepos: [
        "GET /user/interaction-limits",
        {},
        { renamed: ["interactions", "getRestrictionsForAuthenticatedUser"] },
      ],
      removeRestrictionsForAuthenticatedUser: ["DELETE /user/interaction-limits"],
      removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits"],
      removeRestrictionsForRepo: ["DELETE /repos/{owner}/{repo}/interaction-limits"],
      removeRestrictionsForYourPublicRepos: [
        "DELETE /user/interaction-limits",
        {},
        { renamed: ["interactions", "removeRestrictionsForAuthenticatedUser"] },
      ],
      setRestrictionsForAuthenticatedUser: ["PUT /user/interaction-limits"],
      setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits"],
      setRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits"],
      setRestrictionsForYourPublicRepos: [
        "PUT /user/interaction-limits",
        {},
        { renamed: ["interactions", "setRestrictionsForAuthenticatedUser"] },
      ],
    },
    issues: {
      addAssignees: ["POST /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
      addBlockedByDependency: [
        "POST /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by",
      ],
      addLabels: ["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],
      addSubIssue: ["POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues"],
      checkUserCanBeAssigned: ["GET /repos/{owner}/{repo}/assignees/{assignee}"],
      checkUserCanBeAssignedToIssue: [
        "GET /repos/{owner}/{repo}/issues/{issue_number}/assignees/{assignee}",
      ],
      create: ["POST /repos/{owner}/{repo}/issues"],
      createComment: ["POST /repos/{owner}/{repo}/issues/{issue_number}/comments"],
      createLabel: ["POST /repos/{owner}/{repo}/labels"],
      createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
      deleteComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}"],
      deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
      deleteMilestone: ["DELETE /repos/{owner}/{repo}/milestones/{milestone_number}"],
      get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
      getComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],
      getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
      getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
      getMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],
      getParent: ["GET /repos/{owner}/{repo}/issues/{issue_number}/parent"],
      list: ["GET /issues"],
      listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
      listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
      listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
      listDependenciesBlockedBy: [
        "GET /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by",
      ],
      listDependenciesBlocking: [
        "GET /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocking",
      ],
      listEvents: ["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],
      listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
      listEventsForTimeline: ["GET /repos/{owner}/{repo}/issues/{issue_number}/timeline"],
      listForAuthenticatedUser: ["GET /user/issues"],
      listForOrg: ["GET /orgs/{org}/issues"],
      listForRepo: ["GET /repos/{owner}/{repo}/issues"],
      listLabelsForMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels"],
      listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
      listLabelsOnIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/labels"],
      listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
      listSubIssues: ["GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues"],
      lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
      removeAllLabels: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels"],
      removeAssignees: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
      removeDependencyBlockedBy: [
        "DELETE /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by/{issue_id}",
      ],
      removeLabel: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}"],
      removeSubIssue: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/sub_issue"],
      reprioritizeSubIssue: [
        "PATCH /repos/{owner}/{repo}/issues/{issue_number}/sub_issues/priority",
      ],
      setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
      unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
      update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
      updateComment: ["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],
      updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
      updateMilestone: ["PATCH /repos/{owner}/{repo}/milestones/{milestone_number}"],
    },
    licenses: {
      get: ["GET /licenses/{license}"],
      getAllCommonlyUsed: ["GET /licenses"],
      getForRepo: ["GET /repos/{owner}/{repo}/license"],
    },
    markdown: {
      render: ["POST /markdown"],
      renderRaw: [
        "POST /markdown/raw",
        { headers: { "content-type": "text/plain; charset=utf-8" } },
      ],
    },
    meta: {
      get: ["GET /meta"],
      getAllVersions: ["GET /versions"],
      getOctocat: ["GET /octocat"],
      getZen: ["GET /zen"],
      root: ["GET /"],
    },
    migrations: {
      deleteArchiveForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/archive"],
      deleteArchiveForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/archive"],
      downloadArchiveForOrg: ["GET /orgs/{org}/migrations/{migration_id}/archive"],
      getArchiveForAuthenticatedUser: ["GET /user/migrations/{migration_id}/archive"],
      getStatusForAuthenticatedUser: ["GET /user/migrations/{migration_id}"],
      getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}"],
      listForAuthenticatedUser: ["GET /user/migrations"],
      listForOrg: ["GET /orgs/{org}/migrations"],
      listReposForAuthenticatedUser: ["GET /user/migrations/{migration_id}/repositories"],
      listReposForOrg: ["GET /orgs/{org}/migrations/{migration_id}/repositories"],
      listReposForUser: [
        "GET /user/migrations/{migration_id}/repositories",
        {},
        { renamed: ["migrations", "listReposForAuthenticatedUser"] },
      ],
      startForAuthenticatedUser: ["POST /user/migrations"],
      startForOrg: ["POST /orgs/{org}/migrations"],
      unlockRepoForAuthenticatedUser: [
        "DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock",
      ],
      unlockRepoForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock"],
    },
    oidc: {
      getOidcCustomSubTemplateForOrg: ["GET /orgs/{org}/actions/oidc/customization/sub"],
      updateOidcCustomSubTemplateForOrg: ["PUT /orgs/{org}/actions/oidc/customization/sub"],
    },
    orgs: {
      addSecurityManagerTeam: [
        "PUT /orgs/{org}/security-managers/teams/{team_slug}",
        {},
        {
          deprecated:
            "octokit.rest.orgs.addSecurityManagerTeam() is deprecated, see https://docs.github.com/rest/orgs/security-managers#add-a-security-manager-team",
        },
      ],
      assignTeamToOrgRole: ["PUT /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}"],
      assignUserToOrgRole: ["PUT /orgs/{org}/organization-roles/users/{username}/{role_id}"],
      blockUser: ["PUT /orgs/{org}/blocks/{username}"],
      cancelInvitation: ["DELETE /orgs/{org}/invitations/{invitation_id}"],
      checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
      checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
      checkPublicMembershipForUser: ["GET /orgs/{org}/public_members/{username}"],
      convertMemberToOutsideCollaborator: ["PUT /orgs/{org}/outside_collaborators/{username}"],
      createArtifactStorageRecord: ["POST /orgs/{org}/artifacts/metadata/storage-record"],
      createInvitation: ["POST /orgs/{org}/invitations"],
      createIssueType: ["POST /orgs/{org}/issue-types"],
      createWebhook: ["POST /orgs/{org}/hooks"],
      customPropertiesForOrgsCreateOrUpdateOrganizationValues: [
        "PATCH /organizations/{org}/org-properties/values",
      ],
      customPropertiesForOrgsGetOrganizationValues: [
        "GET /organizations/{org}/org-properties/values",
      ],
      customPropertiesForReposCreateOrUpdateOrganizationDefinition: [
        "PUT /orgs/{org}/properties/schema/{custom_property_name}",
      ],
      customPropertiesForReposCreateOrUpdateOrganizationDefinitions: [
        "PATCH /orgs/{org}/properties/schema",
      ],
      customPropertiesForReposCreateOrUpdateOrganizationValues: [
        "PATCH /orgs/{org}/properties/values",
      ],
      customPropertiesForReposDeleteOrganizationDefinition: [
        "DELETE /orgs/{org}/properties/schema/{custom_property_name}",
      ],
      customPropertiesForReposGetOrganizationDefinition: [
        "GET /orgs/{org}/properties/schema/{custom_property_name}",
      ],
      customPropertiesForReposGetOrganizationDefinitions: ["GET /orgs/{org}/properties/schema"],
      customPropertiesForReposGetOrganizationValues: ["GET /orgs/{org}/properties/values"],
      delete: ["DELETE /orgs/{org}"],
      deleteAttestationsBulk: ["POST /orgs/{org}/attestations/delete-request"],
      deleteAttestationsById: ["DELETE /orgs/{org}/attestations/{attestation_id}"],
      deleteAttestationsBySubjectDigest: [
        "DELETE /orgs/{org}/attestations/digest/{subject_digest}",
      ],
      deleteIssueType: ["DELETE /orgs/{org}/issue-types/{issue_type_id}"],
      deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
      disableSelectedRepositoryImmutableReleasesOrganization: [
        "DELETE /orgs/{org}/settings/immutable-releases/repositories/{repository_id}",
      ],
      enableSelectedRepositoryImmutableReleasesOrganization: [
        "PUT /orgs/{org}/settings/immutable-releases/repositories/{repository_id}",
      ],
      get: ["GET /orgs/{org}"],
      getImmutableReleasesSettings: ["GET /orgs/{org}/settings/immutable-releases"],
      getImmutableReleasesSettingsRepositories: [
        "GET /orgs/{org}/settings/immutable-releases/repositories",
      ],
      getMembershipForAuthenticatedUser: ["GET /user/memberships/orgs/{org}"],
      getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
      getOrgRole: ["GET /orgs/{org}/organization-roles/{role_id}"],
      getOrgRulesetHistory: ["GET /orgs/{org}/rulesets/{ruleset_id}/history"],
      getOrgRulesetVersion: ["GET /orgs/{org}/rulesets/{ruleset_id}/history/{version_id}"],
      getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
      getWebhookConfigForOrg: ["GET /orgs/{org}/hooks/{hook_id}/config"],
      getWebhookDelivery: ["GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}"],
      list: ["GET /organizations"],
      listAppInstallations: ["GET /orgs/{org}/installations"],
      listArtifactStorageRecords: [
        "GET /orgs/{org}/artifacts/{subject_digest}/metadata/storage-records",
      ],
      listAttestationRepositories: ["GET /orgs/{org}/attestations/repositories"],
      listAttestations: ["GET /orgs/{org}/attestations/{subject_digest}"],
      listAttestationsBulk: ["POST /orgs/{org}/attestations/bulk-list{?per_page,before,after}"],
      listBlockedUsers: ["GET /orgs/{org}/blocks"],
      listFailedInvitations: ["GET /orgs/{org}/failed_invitations"],
      listForAuthenticatedUser: ["GET /user/orgs"],
      listForUser: ["GET /users/{username}/orgs"],
      listInvitationTeams: ["GET /orgs/{org}/invitations/{invitation_id}/teams"],
      listIssueTypes: ["GET /orgs/{org}/issue-types"],
      listMembers: ["GET /orgs/{org}/members"],
      listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
      listOrgRoleTeams: ["GET /orgs/{org}/organization-roles/{role_id}/teams"],
      listOrgRoleUsers: ["GET /orgs/{org}/organization-roles/{role_id}/users"],
      listOrgRoles: ["GET /orgs/{org}/organization-roles"],
      listOrganizationFineGrainedPermissions: [
        "GET /orgs/{org}/organization-fine-grained-permissions",
      ],
      listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
      listPatGrantRepositories: ["GET /orgs/{org}/personal-access-tokens/{pat_id}/repositories"],
      listPatGrantRequestRepositories: [
        "GET /orgs/{org}/personal-access-token-requests/{pat_request_id}/repositories",
      ],
      listPatGrantRequests: ["GET /orgs/{org}/personal-access-token-requests"],
      listPatGrants: ["GET /orgs/{org}/personal-access-tokens"],
      listPendingInvitations: ["GET /orgs/{org}/invitations"],
      listPublicMembers: ["GET /orgs/{org}/public_members"],
      listSecurityManagerTeams: [
        "GET /orgs/{org}/security-managers",
        {},
        {
          deprecated:
            "octokit.rest.orgs.listSecurityManagerTeams() is deprecated, see https://docs.github.com/rest/orgs/security-managers#list-security-manager-teams",
        },
      ],
      listWebhookDeliveries: ["GET /orgs/{org}/hooks/{hook_id}/deliveries"],
      listWebhooks: ["GET /orgs/{org}/hooks"],
      pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
      redeliverWebhookDelivery: [
        "POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts",
      ],
      removeMember: ["DELETE /orgs/{org}/members/{username}"],
      removeMembershipForUser: ["DELETE /orgs/{org}/memberships/{username}"],
      removeOutsideCollaborator: ["DELETE /orgs/{org}/outside_collaborators/{username}"],
      removePublicMembershipForAuthenticatedUser: ["DELETE /orgs/{org}/public_members/{username}"],
      removeSecurityManagerTeam: [
        "DELETE /orgs/{org}/security-managers/teams/{team_slug}",
        {},
        {
          deprecated:
            "octokit.rest.orgs.removeSecurityManagerTeam() is deprecated, see https://docs.github.com/rest/orgs/security-managers#remove-a-security-manager-team",
        },
      ],
      reviewPatGrantRequest: ["POST /orgs/{org}/personal-access-token-requests/{pat_request_id}"],
      reviewPatGrantRequestsInBulk: ["POST /orgs/{org}/personal-access-token-requests"],
      revokeAllOrgRolesTeam: ["DELETE /orgs/{org}/organization-roles/teams/{team_slug}"],
      revokeAllOrgRolesUser: ["DELETE /orgs/{org}/organization-roles/users/{username}"],
      revokeOrgRoleTeam: ["DELETE /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}"],
      revokeOrgRoleUser: ["DELETE /orgs/{org}/organization-roles/users/{username}/{role_id}"],
      setImmutableReleasesSettings: ["PUT /orgs/{org}/settings/immutable-releases"],
      setImmutableReleasesSettingsRepositories: [
        "PUT /orgs/{org}/settings/immutable-releases/repositories",
      ],
      setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
      setPublicMembershipForAuthenticatedUser: ["PUT /orgs/{org}/public_members/{username}"],
      unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
      update: ["PATCH /orgs/{org}"],
      updateIssueType: ["PUT /orgs/{org}/issue-types/{issue_type_id}"],
      updateMembershipForAuthenticatedUser: ["PATCH /user/memberships/orgs/{org}"],
      updatePatAccess: ["POST /orgs/{org}/personal-access-tokens/{pat_id}"],
      updatePatAccesses: ["POST /orgs/{org}/personal-access-tokens"],
      updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"],
      updateWebhookConfigForOrg: ["PATCH /orgs/{org}/hooks/{hook_id}/config"],
    },
    packages: {
      deletePackageForAuthenticatedUser: ["DELETE /user/packages/{package_type}/{package_name}"],
      deletePackageForOrg: ["DELETE /orgs/{org}/packages/{package_type}/{package_name}"],
      deletePackageForUser: ["DELETE /users/{username}/packages/{package_type}/{package_name}"],
      deletePackageVersionForAuthenticatedUser: [
        "DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}",
      ],
      deletePackageVersionForOrg: [
        "DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}",
      ],
      deletePackageVersionForUser: [
        "DELETE /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}",
      ],
      getAllPackageVersionsForAPackageOwnedByAnOrg: [
        "GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
        {},
        { renamed: ["packages", "getAllPackageVersionsForPackageOwnedByOrg"] },
      ],
      getAllPackageVersionsForAPackageOwnedByTheAuthenticatedUser: [
        "GET /user/packages/{package_type}/{package_name}/versions",
        {},
        { renamed: ["packages", "getAllPackageVersionsForPackageOwnedByAuthenticatedUser"] },
      ],
      getAllPackageVersionsForPackageOwnedByAuthenticatedUser: [
        "GET /user/packages/{package_type}/{package_name}/versions",
      ],
      getAllPackageVersionsForPackageOwnedByOrg: [
        "GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
      ],
      getAllPackageVersionsForPackageOwnedByUser: [
        "GET /users/{username}/packages/{package_type}/{package_name}/versions",
      ],
      getPackageForAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}"],
      getPackageForOrganization: ["GET /orgs/{org}/packages/{package_type}/{package_name}"],
      getPackageForUser: ["GET /users/{username}/packages/{package_type}/{package_name}"],
      getPackageVersionForAuthenticatedUser: [
        "GET /user/packages/{package_type}/{package_name}/versions/{package_version_id}",
      ],
      getPackageVersionForOrganization: [
        "GET /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}",
      ],
      getPackageVersionForUser: [
        "GET /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}",
      ],
      listDockerMigrationConflictingPackagesForAuthenticatedUser: ["GET /user/docker/conflicts"],
      listDockerMigrationConflictingPackagesForOrganization: ["GET /orgs/{org}/docker/conflicts"],
      listDockerMigrationConflictingPackagesForUser: ["GET /users/{username}/docker/conflicts"],
      listPackagesForAuthenticatedUser: ["GET /user/packages"],
      listPackagesForOrganization: ["GET /orgs/{org}/packages"],
      listPackagesForUser: ["GET /users/{username}/packages"],
      restorePackageForAuthenticatedUser: [
        "POST /user/packages/{package_type}/{package_name}/restore{?token}",
      ],
      restorePackageForOrg: [
        "POST /orgs/{org}/packages/{package_type}/{package_name}/restore{?token}",
      ],
      restorePackageForUser: [
        "POST /users/{username}/packages/{package_type}/{package_name}/restore{?token}",
      ],
      restorePackageVersionForAuthenticatedUser: [
        "POST /user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore",
      ],
      restorePackageVersionForOrg: [
        "POST /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore",
      ],
      restorePackageVersionForUser: [
        "POST /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore",
      ],
    },
    privateRegistries: {
      createOrgPrivateRegistry: ["POST /orgs/{org}/private-registries"],
      deleteOrgPrivateRegistry: ["DELETE /orgs/{org}/private-registries/{secret_name}"],
      getOrgPrivateRegistry: ["GET /orgs/{org}/private-registries/{secret_name}"],
      getOrgPublicKey: ["GET /orgs/{org}/private-registries/public-key"],
      listOrgPrivateRegistries: ["GET /orgs/{org}/private-registries"],
      updateOrgPrivateRegistry: ["PATCH /orgs/{org}/private-registries/{secret_name}"],
    },
    projects: {
      addItemForOrg: ["POST /orgs/{org}/projectsV2/{project_number}/items"],
      addItemForUser: ["POST /users/{username}/projectsV2/{project_number}/items"],
      deleteItemForOrg: ["DELETE /orgs/{org}/projectsV2/{project_number}/items/{item_id}"],
      deleteItemForUser: ["DELETE /users/{username}/projectsV2/{project_number}/items/{item_id}"],
      getFieldForOrg: ["GET /orgs/{org}/projectsV2/{project_number}/fields/{field_id}"],
      getFieldForUser: ["GET /users/{username}/projectsV2/{project_number}/fields/{field_id}"],
      getForOrg: ["GET /orgs/{org}/projectsV2/{project_number}"],
      getForUser: ["GET /users/{username}/projectsV2/{project_number}"],
      getOrgItem: ["GET /orgs/{org}/projectsV2/{project_number}/items/{item_id}"],
      getUserItem: ["GET /users/{username}/projectsV2/{project_number}/items/{item_id}"],
      listFieldsForOrg: ["GET /orgs/{org}/projectsV2/{project_number}/fields"],
      listFieldsForUser: ["GET /users/{username}/projectsV2/{project_number}/fields"],
      listForOrg: ["GET /orgs/{org}/projectsV2"],
      listForUser: ["GET /users/{username}/projectsV2"],
      listItemsForOrg: ["GET /orgs/{org}/projectsV2/{project_number}/items"],
      listItemsForUser: ["GET /users/{username}/projectsV2/{project_number}/items"],
      updateItemForOrg: ["PATCH /orgs/{org}/projectsV2/{project_number}/items/{item_id}"],
      updateItemForUser: ["PATCH /users/{username}/projectsV2/{project_number}/items/{item_id}"],
    },
    pulls: {
      checkIfMerged: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
      create: ["POST /repos/{owner}/{repo}/pulls"],
      createReplyForReviewComment: [
        "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies",
      ],
      createReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
      createReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
      deletePendingReview: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
      deleteReviewComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
      dismissReview: [
        "PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals",
      ],
      get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
      getReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
      getReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
      list: ["GET /repos/{owner}/{repo}/pulls"],
      listCommentsForReview: [
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments",
      ],
      listCommits: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],
      listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
      listRequestedReviewers: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
      listReviewComments: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
      listReviewCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments"],
      listReviews: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
      merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
      removeRequestedReviewers: [
        "DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
      ],
      requestReviewers: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
      submitReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events"],
      update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
      updateBranch: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch"],
      updateReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
      updateReviewComment: ["PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
    },
    rateLimit: { get: ["GET /rate_limit"] },
    reactions: {
      createForCommitComment: ["POST /repos/{owner}/{repo}/comments/{comment_id}/reactions"],
      createForIssue: ["POST /repos/{owner}/{repo}/issues/{issue_number}/reactions"],
      createForIssueComment: ["POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"],
      createForPullRequestReviewComment: [
        "POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions",
      ],
      createForRelease: ["POST /repos/{owner}/{repo}/releases/{release_id}/reactions"],
      createForTeamDiscussionCommentInOrg: [
        "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions",
      ],
      createForTeamDiscussionInOrg: [
        "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions",
      ],
      deleteForCommitComment: [
        "DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}",
      ],
      deleteForIssue: [
        "DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}",
      ],
      deleteForIssueComment: [
        "DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}",
      ],
      deleteForPullRequestComment: [
        "DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}",
      ],
      deleteForRelease: [
        "DELETE /repos/{owner}/{repo}/releases/{release_id}/reactions/{reaction_id}",
      ],
      deleteForTeamDiscussion: [
        "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}",
      ],
      deleteForTeamDiscussionComment: [
        "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}",
      ],
      listForCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}/reactions"],
      listForIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions"],
      listForIssueComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"],
      listForPullRequestReviewComment: [
        "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions",
      ],
      listForRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}/reactions"],
      listForTeamDiscussionCommentInOrg: [
        "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions",
      ],
      listForTeamDiscussionInOrg: [
        "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions",
      ],
    },
    repos: {
      acceptInvitation: [
        "PATCH /user/repository_invitations/{invitation_id}",
        {},
        { renamed: ["repos", "acceptInvitationForAuthenticatedUser"] },
      ],
      acceptInvitationForAuthenticatedUser: ["PATCH /user/repository_invitations/{invitation_id}"],
      addAppAccessRestrictions: [
        "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
        {},
        { mapToData: "apps" },
      ],
      addCollaborator: ["PUT /repos/{owner}/{repo}/collaborators/{username}"],
      addStatusCheckContexts: [
        "POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
        {},
        { mapToData: "contexts" },
      ],
      addTeamAccessRestrictions: [
        "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
        {},
        { mapToData: "teams" },
      ],
      addUserAccessRestrictions: [
        "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
        {},
        { mapToData: "users" },
      ],
      cancelPagesDeployment: [
        "POST /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}/cancel",
      ],
      checkAutomatedSecurityFixes: ["GET /repos/{owner}/{repo}/automated-security-fixes"],
      checkCollaborator: ["GET /repos/{owner}/{repo}/collaborators/{username}"],
      checkImmutableReleases: ["GET /repos/{owner}/{repo}/immutable-releases"],
      checkPrivateVulnerabilityReporting: [
        "GET /repos/{owner}/{repo}/private-vulnerability-reporting",
      ],
      checkVulnerabilityAlerts: ["GET /repos/{owner}/{repo}/vulnerability-alerts"],
      codeownersErrors: ["GET /repos/{owner}/{repo}/codeowners/errors"],
      compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
      compareCommitsWithBasehead: ["GET /repos/{owner}/{repo}/compare/{basehead}"],
      createAttestation: ["POST /repos/{owner}/{repo}/attestations"],
      createAutolink: ["POST /repos/{owner}/{repo}/autolinks"],
      createCommitComment: ["POST /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
      createCommitSignatureProtection: [
        "POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures",
      ],
      createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
      createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
      createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
      createDeploymentBranchPolicy: [
        "POST /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies",
      ],
      createDeploymentProtectionRule: [
        "POST /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules",
      ],
      createDeploymentStatus: ["POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
      createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
      createForAuthenticatedUser: ["POST /user/repos"],
      createFork: ["POST /repos/{owner}/{repo}/forks"],
      createInOrg: ["POST /orgs/{org}/repos"],
      createOrUpdateEnvironment: ["PUT /repos/{owner}/{repo}/environments/{environment_name}"],
      createOrUpdateFileContents: ["PUT /repos/{owner}/{repo}/contents/{path}"],
      createOrgRuleset: ["POST /orgs/{org}/rulesets"],
      createPagesDeployment: ["POST /repos/{owner}/{repo}/pages/deployments"],
      createPagesSite: ["POST /repos/{owner}/{repo}/pages"],
      createRelease: ["POST /repos/{owner}/{repo}/releases"],
      createRepoRuleset: ["POST /repos/{owner}/{repo}/rulesets"],
      createUsingTemplate: ["POST /repos/{template_owner}/{template_repo}/generate"],
      createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
      customPropertiesForReposCreateOrUpdateRepositoryValues: [
        "PATCH /repos/{owner}/{repo}/properties/values",
      ],
      customPropertiesForReposGetRepositoryValues: ["GET /repos/{owner}/{repo}/properties/values"],
      declineInvitation: [
        "DELETE /user/repository_invitations/{invitation_id}",
        {},
        { renamed: ["repos", "declineInvitationForAuthenticatedUser"] },
      ],
      declineInvitationForAuthenticatedUser: [
        "DELETE /user/repository_invitations/{invitation_id}",
      ],
      delete: ["DELETE /repos/{owner}/{repo}"],
      deleteAccessRestrictions: [
        "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions",
      ],
      deleteAdminBranchProtection: [
        "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins",
      ],
      deleteAnEnvironment: ["DELETE /repos/{owner}/{repo}/environments/{environment_name}"],
      deleteAutolink: ["DELETE /repos/{owner}/{repo}/autolinks/{autolink_id}"],
      deleteBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"],
      deleteCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],
      deleteCommitSignatureProtection: [
        "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures",
      ],
      deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
      deleteDeployment: ["DELETE /repos/{owner}/{repo}/deployments/{deployment_id}"],
      deleteDeploymentBranchPolicy: [
        "DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}",
      ],
      deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
      deleteInvitation: ["DELETE /repos/{owner}/{repo}/invitations/{invitation_id}"],
      deleteOrgRuleset: ["DELETE /orgs/{org}/rulesets/{ruleset_id}"],
      deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages"],
      deletePullRequestReviewProtection: [
        "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews",
      ],
      deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
      deleteReleaseAsset: ["DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}"],
      deleteRepoRuleset: ["DELETE /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
      deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
      disableAutomatedSecurityFixes: ["DELETE /repos/{owner}/{repo}/automated-security-fixes"],
      disableDeploymentProtectionRule: [
        "DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}",
      ],
      disableImmutableReleases: ["DELETE /repos/{owner}/{repo}/immutable-releases"],
      disablePrivateVulnerabilityReporting: [
        "DELETE /repos/{owner}/{repo}/private-vulnerability-reporting",
      ],
      disableVulnerabilityAlerts: ["DELETE /repos/{owner}/{repo}/vulnerability-alerts"],
      downloadArchive: [
        "GET /repos/{owner}/{repo}/zipball/{ref}",
        {},
        { renamed: ["repos", "downloadZipballArchive"] },
      ],
      downloadTarballArchive: ["GET /repos/{owner}/{repo}/tarball/{ref}"],
      downloadZipballArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}"],
      enableAutomatedSecurityFixes: ["PUT /repos/{owner}/{repo}/automated-security-fixes"],
      enableImmutableReleases: ["PUT /repos/{owner}/{repo}/immutable-releases"],
      enablePrivateVulnerabilityReporting: [
        "PUT /repos/{owner}/{repo}/private-vulnerability-reporting",
      ],
      enableVulnerabilityAlerts: ["PUT /repos/{owner}/{repo}/vulnerability-alerts"],
      generateReleaseNotes: ["POST /repos/{owner}/{repo}/releases/generate-notes"],
      get: ["GET /repos/{owner}/{repo}"],
      getAccessRestrictions: [
        "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions",
      ],
      getAdminBranchProtection: [
        "GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins",
      ],
      getAllDeploymentProtectionRules: [
        "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules",
      ],
      getAllEnvironments: ["GET /repos/{owner}/{repo}/environments"],
      getAllStatusCheckContexts: [
        "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
      ],
      getAllTopics: ["GET /repos/{owner}/{repo}/topics"],
      getAppsWithAccessToProtectedBranch: [
        "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
      ],
      getAutolink: ["GET /repos/{owner}/{repo}/autolinks/{autolink_id}"],
      getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
      getBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection"],
      getBranchRules: ["GET /repos/{owner}/{repo}/rules/branches/{branch}"],
      getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
      getCodeFrequencyStats: ["GET /repos/{owner}/{repo}/stats/code_frequency"],
      getCollaboratorPermissionLevel: [
        "GET /repos/{owner}/{repo}/collaborators/{username}/permission",
      ],
      getCombinedStatusForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/status"],
      getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
      getCommitActivityStats: ["GET /repos/{owner}/{repo}/stats/commit_activity"],
      getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
      getCommitSignatureProtection: [
        "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures",
      ],
      getCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile"],
      getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
      getContributorsStats: ["GET /repos/{owner}/{repo}/stats/contributors"],
      getCustomDeploymentProtectionRule: [
        "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}",
      ],
      getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
      getDeployment: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],
      getDeploymentBranchPolicy: [
        "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}",
      ],
      getDeploymentStatus: [
        "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}",
      ],
      getEnvironment: ["GET /repos/{owner}/{repo}/environments/{environment_name}"],
      getLatestPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/latest"],
      getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
      getOrgRuleSuite: ["GET /orgs/{org}/rulesets/rule-suites/{rule_suite_id}"],
      getOrgRuleSuites: ["GET /orgs/{org}/rulesets/rule-suites"],
      getOrgRuleset: ["GET /orgs/{org}/rulesets/{ruleset_id}"],
      getOrgRulesets: ["GET /orgs/{org}/rulesets"],
      getPages: ["GET /repos/{owner}/{repo}/pages"],
      getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
      getPagesDeployment: ["GET /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}"],
      getPagesHealthCheck: ["GET /repos/{owner}/{repo}/pages/health"],
      getParticipationStats: ["GET /repos/{owner}/{repo}/stats/participation"],
      getPullRequestReviewProtection: [
        "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews",
      ],
      getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
      getReadme: ["GET /repos/{owner}/{repo}/readme"],
      getReadmeInDirectory: ["GET /repos/{owner}/{repo}/readme/{dir}"],
      getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
      getReleaseAsset: ["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],
      getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
      getRepoRuleSuite: ["GET /repos/{owner}/{repo}/rulesets/rule-suites/{rule_suite_id}"],
      getRepoRuleSuites: ["GET /repos/{owner}/{repo}/rulesets/rule-suites"],
      getRepoRuleset: ["GET /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
      getRepoRulesetHistory: ["GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history"],
      getRepoRulesetVersion: [
        "GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history/{version_id}",
      ],
      getRepoRulesets: ["GET /repos/{owner}/{repo}/rulesets"],
      getStatusChecksProtection: [
        "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
      ],
      getTeamsWithAccessToProtectedBranch: [
        "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
      ],
      getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
      getTopReferrers: ["GET /repos/{owner}/{repo}/traffic/popular/referrers"],
      getUsersWithAccessToProtectedBranch: [
        "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
      ],
      getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
      getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
      getWebhookConfigForRepo: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/config"],
      getWebhookDelivery: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}"],
      listActivities: ["GET /repos/{owner}/{repo}/activity"],
      listAttestations: ["GET /repos/{owner}/{repo}/attestations/{subject_digest}"],
      listAutolinks: ["GET /repos/{owner}/{repo}/autolinks"],
      listBranches: ["GET /repos/{owner}/{repo}/branches"],
      listBranchesForHeadCommit: [
        "GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head",
      ],
      listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
      listCommentsForCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
      listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
      listCommitStatusesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/statuses"],
      listCommits: ["GET /repos/{owner}/{repo}/commits"],
      listContributors: ["GET /repos/{owner}/{repo}/contributors"],
      listCustomDeploymentRuleIntegrations: [
        "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/apps",
      ],
      listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
      listDeploymentBranchPolicies: [
        "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies",
      ],
      listDeploymentStatuses: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
      listDeployments: ["GET /repos/{owner}/{repo}/deployments"],
      listForAuthenticatedUser: ["GET /user/repos"],
      listForOrg: ["GET /orgs/{org}/repos"],
      listForUser: ["GET /users/{username}/repos"],
      listForks: ["GET /repos/{owner}/{repo}/forks"],
      listInvitations: ["GET /repos/{owner}/{repo}/invitations"],
      listInvitationsForAuthenticatedUser: ["GET /user/repository_invitations"],
      listLanguages: ["GET /repos/{owner}/{repo}/languages"],
      listPagesBuilds: ["GET /repos/{owner}/{repo}/pages/builds"],
      listPublic: ["GET /repositories"],
      listPullRequestsAssociatedWithCommit: [
        "GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls",
      ],
      listReleaseAssets: ["GET /repos/{owner}/{repo}/releases/{release_id}/assets"],
      listReleases: ["GET /repos/{owner}/{repo}/releases"],
      listTags: ["GET /repos/{owner}/{repo}/tags"],
      listTeams: ["GET /repos/{owner}/{repo}/teams"],
      listWebhookDeliveries: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries"],
      listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
      merge: ["POST /repos/{owner}/{repo}/merges"],
      mergeUpstream: ["POST /repos/{owner}/{repo}/merge-upstream"],
      pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
      redeliverWebhookDelivery: [
        "POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts",
      ],
      removeAppAccessRestrictions: [
        "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
        {},
        { mapToData: "apps" },
      ],
      removeCollaborator: ["DELETE /repos/{owner}/{repo}/collaborators/{username}"],
      removeStatusCheckContexts: [
        "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
        {},
        { mapToData: "contexts" },
      ],
      removeStatusCheckProtection: [
        "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
      ],
      removeTeamAccessRestrictions: [
        "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
        {},
        { mapToData: "teams" },
      ],
      removeUserAccessRestrictions: [
        "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
        {},
        { mapToData: "users" },
      ],
      renameBranch: ["POST /repos/{owner}/{repo}/branches/{branch}/rename"],
      replaceAllTopics: ["PUT /repos/{owner}/{repo}/topics"],
      requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
      setAdminBranchProtection: [
        "POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins",
      ],
      setAppAccessRestrictions: [
        "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
        {},
        { mapToData: "apps" },
      ],
      setStatusCheckContexts: [
        "PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
        {},
        { mapToData: "contexts" },
      ],
      setTeamAccessRestrictions: [
        "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
        {},
        { mapToData: "teams" },
      ],
      setUserAccessRestrictions: [
        "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
        {},
        { mapToData: "users" },
      ],
      testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
      transfer: ["POST /repos/{owner}/{repo}/transfer"],
      update: ["PATCH /repos/{owner}/{repo}"],
      updateBranchProtection: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection"],
      updateCommitComment: ["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],
      updateDeploymentBranchPolicy: [
        "PUT /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}",
      ],
      updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
      updateInvitation: ["PATCH /repos/{owner}/{repo}/invitations/{invitation_id}"],
      updateOrgRuleset: ["PUT /orgs/{org}/rulesets/{ruleset_id}"],
      updatePullRequestReviewProtection: [
        "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews",
      ],
      updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
      updateReleaseAsset: ["PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}"],
      updateRepoRuleset: ["PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
      updateStatusCheckPotection: [
        "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
        {},
        { renamed: ["repos", "updateStatusCheckProtection"] },
      ],
      updateStatusCheckProtection: [
        "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
      ],
      updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
      updateWebhookConfigForRepo: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config"],
      uploadReleaseAsset: [
        "POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}",
        { baseUrl: "https://uploads.github.com" },
      ],
    },
    search: {
      code: ["GET /search/code"],
      commits: ["GET /search/commits"],
      issuesAndPullRequests: ["GET /search/issues"],
      labels: ["GET /search/labels"],
      repos: ["GET /search/repositories"],
      topics: ["GET /search/topics"],
      users: ["GET /search/users"],
    },
    secretScanning: {
      createPushProtectionBypass: [
        "POST /repos/{owner}/{repo}/secret-scanning/push-protection-bypasses",
      ],
      getAlert: ["GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"],
      getScanHistory: ["GET /repos/{owner}/{repo}/secret-scanning/scan-history"],
      listAlertsForOrg: ["GET /orgs/{org}/secret-scanning/alerts"],
      listAlertsForRepo: ["GET /repos/{owner}/{repo}/secret-scanning/alerts"],
      listLocationsForAlert: [
        "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations",
      ],
      listOrgPatternConfigs: ["GET /orgs/{org}/secret-scanning/pattern-configurations"],
      updateAlert: ["PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"],
      updateOrgPatternConfigs: ["PATCH /orgs/{org}/secret-scanning/pattern-configurations"],
    },
    securityAdvisories: {
      createFork: ["POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/forks"],
      createPrivateVulnerabilityReport: ["POST /repos/{owner}/{repo}/security-advisories/reports"],
      createRepositoryAdvisory: ["POST /repos/{owner}/{repo}/security-advisories"],
      createRepositoryAdvisoryCveRequest: [
        "POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/cve",
      ],
      getGlobalAdvisory: ["GET /advisories/{ghsa_id}"],
      getRepositoryAdvisory: ["GET /repos/{owner}/{repo}/security-advisories/{ghsa_id}"],
      listGlobalAdvisories: ["GET /advisories"],
      listOrgRepositoryAdvisories: ["GET /orgs/{org}/security-advisories"],
      listRepositoryAdvisories: ["GET /repos/{owner}/{repo}/security-advisories"],
      updateRepositoryAdvisory: ["PATCH /repos/{owner}/{repo}/security-advisories/{ghsa_id}"],
    },
    teams: {
      addOrUpdateMembershipForUserInOrg: [
        "PUT /orgs/{org}/teams/{team_slug}/memberships/{username}",
      ],
      addOrUpdateRepoPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
      checkPermissionsForRepoInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
      create: ["POST /orgs/{org}/teams"],
      createDiscussionCommentInOrg: [
        "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments",
      ],
      createDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions"],
      deleteDiscussionCommentInOrg: [
        "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}",
      ],
      deleteDiscussionInOrg: [
        "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}",
      ],
      deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
      getByName: ["GET /orgs/{org}/teams/{team_slug}"],
      getDiscussionCommentInOrg: [
        "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}",
      ],
      getDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
      getMembershipForUserInOrg: ["GET /orgs/{org}/teams/{team_slug}/memberships/{username}"],
      list: ["GET /orgs/{org}/teams"],
      listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
      listDiscussionCommentsInOrg: [
        "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments",
      ],
      listDiscussionsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions"],
      listForAuthenticatedUser: ["GET /user/teams"],
      listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
      listPendingInvitationsInOrg: ["GET /orgs/{org}/teams/{team_slug}/invitations"],
      listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
      removeMembershipForUserInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}"],
      removeRepoInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
      updateDiscussionCommentInOrg: [
        "PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}",
      ],
      updateDiscussionInOrg: [
        "PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}",
      ],
      updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"],
    },
    users: {
      addEmailForAuthenticated: [
        "POST /user/emails",
        {},
        { renamed: ["users", "addEmailForAuthenticatedUser"] },
      ],
      addEmailForAuthenticatedUser: ["POST /user/emails"],
      addSocialAccountForAuthenticatedUser: ["POST /user/social_accounts"],
      block: ["PUT /user/blocks/{username}"],
      checkBlocked: ["GET /user/blocks/{username}"],
      checkFollowingForUser: ["GET /users/{username}/following/{target_user}"],
      checkPersonIsFollowedByAuthenticated: ["GET /user/following/{username}"],
      createGpgKeyForAuthenticated: [
        "POST /user/gpg_keys",
        {},
        { renamed: ["users", "createGpgKeyForAuthenticatedUser"] },
      ],
      createGpgKeyForAuthenticatedUser: ["POST /user/gpg_keys"],
      createPublicSshKeyForAuthenticated: [
        "POST /user/keys",
        {},
        { renamed: ["users", "createPublicSshKeyForAuthenticatedUser"] },
      ],
      createPublicSshKeyForAuthenticatedUser: ["POST /user/keys"],
      createSshSigningKeyForAuthenticatedUser: ["POST /user/ssh_signing_keys"],
      deleteAttestationsBulk: ["POST /users/{username}/attestations/delete-request"],
      deleteAttestationsById: ["DELETE /users/{username}/attestations/{attestation_id}"],
      deleteAttestationsBySubjectDigest: [
        "DELETE /users/{username}/attestations/digest/{subject_digest}",
      ],
      deleteEmailForAuthenticated: [
        "DELETE /user/emails",
        {},
        { renamed: ["users", "deleteEmailForAuthenticatedUser"] },
      ],
      deleteEmailForAuthenticatedUser: ["DELETE /user/emails"],
      deleteGpgKeyForAuthenticated: [
        "DELETE /user/gpg_keys/{gpg_key_id}",
        {},
        { renamed: ["users", "deleteGpgKeyForAuthenticatedUser"] },
      ],
      deleteGpgKeyForAuthenticatedUser: ["DELETE /user/gpg_keys/{gpg_key_id}"],
      deletePublicSshKeyForAuthenticated: [
        "DELETE /user/keys/{key_id}",
        {},
        { renamed: ["users", "deletePublicSshKeyForAuthenticatedUser"] },
      ],
      deletePublicSshKeyForAuthenticatedUser: ["DELETE /user/keys/{key_id}"],
      deleteSocialAccountForAuthenticatedUser: ["DELETE /user/social_accounts"],
      deleteSshSigningKeyForAuthenticatedUser: [
        "DELETE /user/ssh_signing_keys/{ssh_signing_key_id}",
      ],
      follow: ["PUT /user/following/{username}"],
      getAuthenticated: ["GET /user"],
      getById: ["GET /user/{account_id}"],
      getByUsername: ["GET /users/{username}"],
      getContextForUser: ["GET /users/{username}/hovercard"],
      getGpgKeyForAuthenticated: [
        "GET /user/gpg_keys/{gpg_key_id}",
        {},
        { renamed: ["users", "getGpgKeyForAuthenticatedUser"] },
      ],
      getGpgKeyForAuthenticatedUser: ["GET /user/gpg_keys/{gpg_key_id}"],
      getPublicSshKeyForAuthenticated: [
        "GET /user/keys/{key_id}",
        {},
        { renamed: ["users", "getPublicSshKeyForAuthenticatedUser"] },
      ],
      getPublicSshKeyForAuthenticatedUser: ["GET /user/keys/{key_id}"],
      getSshSigningKeyForAuthenticatedUser: ["GET /user/ssh_signing_keys/{ssh_signing_key_id}"],
      list: ["GET /users"],
      listAttestations: ["GET /users/{username}/attestations/{subject_digest}"],
      listAttestationsBulk: [
        "POST /users/{username}/attestations/bulk-list{?per_page,before,after}",
      ],
      listBlockedByAuthenticated: [
        "GET /user/blocks",
        {},
        { renamed: ["users", "listBlockedByAuthenticatedUser"] },
      ],
      listBlockedByAuthenticatedUser: ["GET /user/blocks"],
      listEmailsForAuthenticated: [
        "GET /user/emails",
        {},
        { renamed: ["users", "listEmailsForAuthenticatedUser"] },
      ],
      listEmailsForAuthenticatedUser: ["GET /user/emails"],
      listFollowedByAuthenticated: [
        "GET /user/following",
        {},
        { renamed: ["users", "listFollowedByAuthenticatedUser"] },
      ],
      listFollowedByAuthenticatedUser: ["GET /user/following"],
      listFollowersForAuthenticatedUser: ["GET /user/followers"],
      listFollowersForUser: ["GET /users/{username}/followers"],
      listFollowingForUser: ["GET /users/{username}/following"],
      listGpgKeysForAuthenticated: [
        "GET /user/gpg_keys",
        {},
        { renamed: ["users", "listGpgKeysForAuthenticatedUser"] },
      ],
      listGpgKeysForAuthenticatedUser: ["GET /user/gpg_keys"],
      listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
      listPublicEmailsForAuthenticated: [
        "GET /user/public_emails",
        {},
        { renamed: ["users", "listPublicEmailsForAuthenticatedUser"] },
      ],
      listPublicEmailsForAuthenticatedUser: ["GET /user/public_emails"],
      listPublicKeysForUser: ["GET /users/{username}/keys"],
      listPublicSshKeysForAuthenticated: [
        "GET /user/keys",
        {},
        { renamed: ["users", "listPublicSshKeysForAuthenticatedUser"] },
      ],
      listPublicSshKeysForAuthenticatedUser: ["GET /user/keys"],
      listSocialAccountsForAuthenticatedUser: ["GET /user/social_accounts"],
      listSocialAccountsForUser: ["GET /users/{username}/social_accounts"],
      listSshSigningKeysForAuthenticatedUser: ["GET /user/ssh_signing_keys"],
      listSshSigningKeysForUser: ["GET /users/{username}/ssh_signing_keys"],
      setPrimaryEmailVisibilityForAuthenticated: [
        "PATCH /user/email/visibility",
        {},
        { renamed: ["users", "setPrimaryEmailVisibilityForAuthenticatedUser"] },
      ],
      setPrimaryEmailVisibilityForAuthenticatedUser: ["PATCH /user/email/visibility"],
      unblock: ["DELETE /user/blocks/{username}"],
      unfollow: ["DELETE /user/following/{username}"],
      updateAuthenticated: ["PATCH /user"],
    },
  },
  jc = ow;
var Dr = new Map();
for (let [e, t] of Object.entries(jc))
  for (let [r, n] of Object.entries(t)) {
    let [s, o, i] = n,
      [a, l] = s.split(/ /),
      c = Object.assign({ method: a, url: l }, o);
    (Dr.has(e) || Dr.set(e, new Map()),
      Dr.get(e).set(r, { scope: e, methodName: r, endpointDefaults: c, decorations: i }));
  }
var iw = {
  has({ scope: e }, t) {
    return Dr.get(e).has(t);
  },
  getOwnPropertyDescriptor(e, t) {
    return { value: this.get(e, t), configurable: !0, writable: !0, enumerable: !0 };
  },
  defineProperty(e, t, r) {
    return (Object.defineProperty(e.cache, t, r), !0);
  },
  deleteProperty(e, t) {
    return (delete e.cache[t], !0);
  },
  ownKeys({ scope: e }) {
    return [...Dr.get(e).keys()];
  },
  set(e, t, r) {
    return (e.cache[t] = r);
  },
  get({ octokit: e, scope: t, cache: r }, n) {
    if (r[n]) return r[n];
    let s = Dr.get(t).get(n);
    if (!s) return;
    let { endpointDefaults: o, decorations: i } = s;
    return (i ? (r[n] = aw(e, t, n, o, i)) : (r[n] = e.request.defaults(o)), r[n]);
  },
};
function ba(e) {
  let t = {};
  for (let r of Dr.keys()) t[r] = new Proxy({ octokit: e, scope: r, cache: {} }, iw);
  return t;
}
function aw(e, t, r, n, s) {
  let o = e.request.defaults(n);
  function i(...a) {
    let l = o.endpoint.merge(...a);
    if (s.mapToData)
      return ((l = Object.assign({}, l, { data: l[s.mapToData], [s.mapToData]: void 0 })), o(l));
    if (s.renamed) {
      let [c, d] = s.renamed;
      e.log.warn(`octokit.${t}.${r}() has been renamed to octokit.${c}.${d}()`);
    }
    if ((s.deprecated && e.log.warn(s.deprecated), s.renamedParameters)) {
      let c = o.endpoint.merge(...a);
      for (let [d, m] of Object.entries(s.renamedParameters))
        d in c &&
          (e.log.warn(
            `"${d}" parameter is deprecated for "octokit.${t}.${r}()". Use "${m}" instead`,
          ),
          m in c || (c[m] = c[d]),
          delete c[d]);
      return o(c);
    }
    return o(...a);
  }
  return Object.assign(i, o);
}
function lw(e) {
  return { rest: ba(e) };
}
lw.VERSION = wa;
function ya(e) {
  let t = ba(e);
  return { ...t, rest: t };
}
ya.VERSION = wa;
var Wc = "22.0.1";
var qc = Co.plugin(fa, ya, ha).defaults({ userAgent: `octokit-rest.js/${Wc}` });
function Ro(e) {
  return new qc({
    auth: e.github.token,
    baseUrl: e.github.apiBaseUrl,
    userAgent: e.github.userAgent,
  });
}
function Kc(e) {
  return {
    async get(t) {
      return (
        (
          await e
            .prepare(
              "SELECT value FROM kv_state WHERE key = ? AND (expires_at IS NULL OR expires_at > datetime('now'))",
            )
            .bind(t)
            .first()
        )?.value ?? null
      );
    },
    async put(t, r, n) {
      (n?.expirationTtl ? `datetime('now', '+${Math.floor(n.expirationTtl)} seconds')` : null)
        ? await e
            .prepare(
              "INSERT OR REPLACE INTO kv_state (key, value, expires_at, updated_at) VALUES (?, ?, datetime('now', '+' || ? || ' seconds'), datetime('now'))",
            )
            .bind(t, r, Math.floor(n.expirationTtl))
            .run()
        : await e
            .prepare(
              "INSERT OR REPLACE INTO kv_state (key, value, expires_at, updated_at) VALUES (?, ?, NULL, datetime('now'))",
            )
            .bind(t, r)
            .run();
    },
    async delete(t) {
      await e.prepare("DELETE FROM kv_state WHERE key = ?").bind(t).run();
    },
  };
}
async function Hc(e) {
  await e
    .prepare(
      "CREATE TABLE IF NOT EXISTS kv_state (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires_at TEXT, updated_at TEXT NOT NULL DEFAULT (datetime('now')))",
    )
    .run();
}
Et();
async function zc(e) {
  await e
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
var Qc = !1,
  Vc = async (e, t) => {
    let r = e.var.config,
      n = e.env.SCHEDULES_DB;
    (Qc || (await Hc(n), await Ta(n), await zc(n), (Qc = !0)),
      e.set("octokit", Ro(r)),
      e.set("store", Kc(n)),
      e.set("d1", n),
      e.set("ai", e.env.AI ?? null),
      await t());
  };
var Jc = (e, t) =>
  e instanceof Nt
    ? (console.error("[ConfigError]", e.message),
      t.json({ ok: !1, error: "Configuration error" }, 500))
    : (console.error("[UnhandledError]", e.message, e.stack),
      t.json({ ok: !1, error: "Internal server error" }, 500));
var Ao = new Rt();
Ao.get("/", (e) => {
  let t = e.var?.config?.version ?? "1.0.0";
  return e.json({ ok: !0, service: "githubclaw-core", version: t });
});
Ao.get("/health", (e) => {
  let t = e.var?.config?.version ?? "1.0.0";
  return e.json({ ok: !0, service: "githubclaw-core", version: t });
});
Ie();
Ie();
function xd(e) {
  return class extends ot {
    services = e;
  };
}
Ie();
function Pd(e) {
  let t = new se();
  return (
    t.use(async (r, n) => {
      let s = r.from?.id ?? null,
        o = r.chat?.id ?? null,
        i = r.chat?.type ?? null,
        a = typeof r.message?.text == "string" ? r.message.text.trim() : "";
      if (e.allowedFromId == null || e.allowedChatId == null) {
        (console.error(
          "[AccessGuard] TELEGRAM_ALLOWED_FROM_ID \u8207 TELEGRAM_ALLOWED_CHAT_ID \u5FC5\u9808\u540C\u6642\u8A2D\u5B9A\uFF0C\u62D2\u7D55\u6240\u6709\u8ACB\u6C42\u3002",
        ),
          await r.reply(
            "\u26A0\uFE0F \u6A5F\u5668\u4EBA\u5C1A\u672A\u5B8C\u6210\u6388\u6B0A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A TELEGRAM_ALLOWED_FROM_ID \u8207 TELEGRAM_ALLOWED_CHAT_ID\u3002",
          ));
        return;
      }
      if (i !== "private") {
        await r.reply("\u6B64\u6A5F\u5668\u4EBA\u50C5\u63A5\u53D7\u79C1\u4EBA\u804A\u5929\u3002");
        return;
      }
      if (s !== e.allowedFromId) {
        await r.reply("\u672A\u6388\u6B0A\u7684\u4F7F\u7528\u8005\u3002");
        return;
      }
      if (o !== e.allowedChatId) {
        await r.reply("\u672A\u6388\u6B0A\u7684\u804A\u5929\u5BA4\u3002");
        return;
      }
      if (a.length > 0 && a.length > e.maxMessageLength) {
        await r.reply(
          `\u8A0A\u606F\u904E\u9577\uFF0C\u9650\u5236\u70BA ${e.maxMessageLength} \u500B\u5B57\u5143\u3002`,
        );
        return;
      }
      await n();
    }),
    t
  );
}
Ie();
Ve();
mt();
ft();
var za = new se();
za.command("start", async (e) => {
  let { octokit: t, store: r, config: n } = e.services,
    { owner: s, repo: o } = n.github;
  try {
    let { data: i } = await t.rest.issues.listForRepo({
        owner: s,
        repo: o,
        state: "open",
        per_page: 100,
      }),
      a = i
        .filter((I) => !I.pull_request)
        .filter(
          (I) =>
            !(I.labels ?? [])
              .map((S) => (typeof S == "string" ? S : (S.name ?? "")).toLowerCase())
              .includes("config"),
        )
        .map((I) => ({ number: I.number, title: I.title }));
    if (a.length === 0) {
      await e.reply(
        "\u{1F99E} \u76EE\u524D\u6C92\u6709\u4EFB\u4F55\u9F8D\u8766\uFF0C\u8ACB\u4F7F\u7528 /new \u5EFA\u7ACB\u65B0\u7684\u5C0F\u9F8D\u8766\u3002",
      );
      return;
    }
    let l = e.chat?.id,
      c = l ? await Ge(r, l) : null,
      d = c ? a.find((I) => I.number === c) : null,
      w = [
        c
          ? d
            ? `\u{1F99E} \u76EE\u524D\u503C\u73ED\u7684\u662F\uFF1A#${d.number} ${d.title || "\uFF08\u672A\u547D\u540D\u5C0F\u9F8D\u8766\uFF09"}`
            : `\u{1F99E} \u76EE\u524D\u503C\u73ED\u7D00\u9304\u662F #${c}\uFF0C\u4F46\u76EE\u524D\u5217\u8868\u88E1\u627E\u4E0D\u5230\uFF08\u53EF\u80FD\u5DF2\u95DC\u9589\uFF09\u3002`
          : null,
        "\u{1F99E} \u4F60\u7684\u9F8D\u8766\u5011\uFF1A",
      ].filter(Boolean).join(`
`),
      y = Do(a),
      _ = await e.reply(w, { reply_markup: y });
    l && _.message_id && (await Sn(r, l, { mode: "list", messageId: _.message_id }));
  } catch (i) {
    (console.error("[/start] \u57F7\u884C\u5931\u6557", i),
      await e.reply(
        "\u274C \u57F7\u884C /start \u6642\u767C\u751F\u932F\u8AA4\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",
      ));
  }
});
Ie();
Xe();
function fy(e, lang = "en") {
  return [
    t("help.title", { repoFullName: e }, lang),
    "",
    t("help.welcome", {}, lang),
    "",
    t("help.lobster_burger_management", {}, lang),
    t("help.list_desc", {}, lang),
    t("help.new_desc", {}, lang),
    t("help.schedules_desc", {}, lang),
    t("help.version_desc", {}, lang),
    t("help.autoupdate_desc", {}, lang),
    t("help.check_desc", {}, lang),
    "",
    t("help.lobster_management", {}, lang),
    t("help.current_desc", {}, lang),
    t("help.status_desc", {}, lang),
    t("help.edit_desc", {}, lang),
    t("help.close_desc", {}, lang),
    t("help.clear_desc", {}, lang),
    t("help.workflow_desc", {}, lang),
    t("help.enable_desc", {}, lang),
    t("help.disable_desc", {}, lang),
    t("help.skills_desc", {}, lang),
    t("help.templates_desc", {}, lang),
    t("help.llm_desc", {}, lang),
  ].map((r) => O(r)).join("\n");
}
var Ko = new se();
Ko.command("help", async (e) => {
  let { config: t } = e.services,
    r = fy(t.github.repoFullName, e.language);
  await e.reply(r, { parse_mode: "MarkdownV2" });
});
Ko.command("version", async (e) => {
  let { config: t } = e.services;
  await e.reply(`\u{1F99E} altShiftClawCore v${t.version}`);
});
Ie();
Ve();
mt();
ft();
var Va = new se();
function gy(e) {
  let t = e && typeof e == "object" ? e : null;
  return {
    message: t?.message ?? String(e),
    status: typeof t?.status == "number" ? t.status : null,
    requestMethod: t?.request?.method ?? null,
    requestUrl: t?.request?.url ?? null,
    githubRequestId: t?.response?.headers?.["x-github-request-id"] ?? null,
    githubMessage: t?.response?.data?.message ?? null,
    documentationUrl: t?.response?.data?.documentation_url ?? null,
  };
}
function hy(e) {
  switch ((e && typeof e == "object" ? e : null)?.status) {
    case 401:
    case 403:
      return "\u274C /list \u7121\u6CD5\u8B80\u53D6 GitHub issue\uFF0C\u8ACB\u6AA2\u67E5 CLAW_SYS_GITHUB_TOKEN \u6B0A\u9650\u662F\u5426\u53EF\u8B80\u53D6 Issues\u3002";
    case 404:
      return "\u274C /list \u627E\u4E0D\u5230\u76EE\u6A19 GitHub \u5009\u5EAB\uFF0C\u8ACB\u6AA2\u67E5 GITHUB_OWNER \u8207 GITHUB_REPO \u8A2D\u5B9A\u3002";
    default:
      return "\u274C \u57F7\u884C /list \u6642\u767C\u751F\u932F\u8AA4\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002";
  }
}
Va.command("list", async (e) => {
  let { octokit: t, store: r, config: n } = e.services,
    { owner: s, repo: o } = n.github,
    i = e.chat?.id;
  try {
    let { data: a } = await t.rest.issues.listForRepo({
        owner: s,
        repo: o,
        state: "open",
        per_page: 100,
      }),
      l = a
        .filter((I) => !I.pull_request)
        .filter(
          (I) =>
            !(I.labels ?? [])
              .map((S) => (typeof S == "string" ? S : (S.name ?? "")).toLowerCase())
              .includes("config"),
        )
        .map((I) => ({ number: I.number, title: I.title })),
      c = i ? await Ge(r, i) : null,
      d = c ? l.find((I) => I.number === c) : null,
      m = c
        ? d
          ? `\u{1F99E} \u76EE\u524D\u503C\u73ED\u7684\u662F\uFF1A#${d.number} ${d.title || "\uFF08\u672A\u547D\u540D\u5C0F\u9F8D\u8766\uFF09"}`
          : `\u{1F99E} \u76EE\u524D\u503C\u73ED\u7D00\u9304\u662F #${c}\uFF0C\u4F46\u76EE\u524D\u5217\u8868\u88E1\u627E\u4E0D\u5230\uFF08\u53EF\u80FD\u5DF2\u95DC\u9589\uFF09\u3002`
        : null;
    if (l.length === 0) {
      i && (await Ut(r, i));
      let I = m
        ? `${m}
\u{1F99E} \u76EE\u524D\u6C92\u6709\u4EFB\u4F55\u9F8D\u8766\uFF0C\u8ACB\u4F7F\u7528 /new \u5EFA\u7ACB\u65B0\u7684\u5C0F\u9F8D\u8766\u3002`
        : "\u{1F99E} \u76EE\u524D\u6C92\u6709\u4EFB\u4F55\u9F8D\u8766\uFF0C\u8ACB\u4F7F\u7528 /new \u5EFA\u7ACB\u65B0\u7684\u5C0F\u9F8D\u8766\u3002";
      await e.reply(I);
      return;
    }
    let w = [m, "\u{1F99E} \u4F60\u7684\u9F8D\u8766\u5011\uFF1A"].filter(Boolean).join(`
`),
      y = Do(l),
      _ = await e.reply(w, { reply_markup: y });
    i && _.message_id
      ? await Sn(r, i, { mode: "list", messageId: _.message_id })
      : i && (await Ut(r, i));
  } catch (a) {
    (console.error("[/list] \u57F7\u884C\u5931\u6557", { owner: s, repo: o, chatId: i, ...gy(a) }),
      await e.reply(hy(a)));
  }
});
Ie();
Ss();
mt();
var ri = new se();
async function Qp(e) {
  let { store: t } = e.services,
    r = e.chat?.id;
  try {
    let n = r ? await Ge(t, r) : null;
    if (!n || n <= 0) {
      await e.reply(
        "\u{1F99E} \u76EE\u524D\u6C92\u6709\u6B63\u5728\u8FFD\u8E64\u7684\u5C0F\u9F8D\u8766\uFF0C\u5148\u7528 /new \u5EFA\u7ACB\u4E00\u96BB\u5427\u3002",
      );
      return;
    }
    await ks(e, n);
  } catch (n) {
    (console.error("[/current|/status] \u57F7\u884C\u5931\u6557", n),
      await e.reply(
        "\u274C \u67E5\u8A62\u76EE\u524D\u5C0F\u9F8D\u8766\u72C0\u614B\u6642\u767C\u751F\u932F\u8AA4\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",
      ));
  }
}
ri.command("current", Qp);
ri.command("status", Qp);
Ie();
Ve();
ft();
var rl = new se();
rl.command("close", async (e) => {
  let { octokit: t, store: r, config: n } = e.services,
    { owner: s, repo: o } = n.github,
    i = e.chat?.id;
  try {
    let { data: a } = await t.rest.issues.listForRepo({
        owner: s,
        repo: o,
        state: "open",
        per_page: 100,
      }),
      l = a
        .filter((w) => !w.pull_request)
        .filter(
          (w) =>
            !(w.labels ?? [])
              .map((_) => (typeof _ == "string" ? _ : (_.name ?? "")).toLowerCase())
              .includes("config"),
        )
        .map((w) => ({ number: w.number, title: w.title }));
    if (l.length === 0) {
      (i && (await Ut(r, i)),
        await e.reply(
          "\u{1F99E} \u76EE\u524D\u6C92\u6709\u958B\u8457\u7684\u5C0F\u9F8D\u8766\u8036\uFF0C\u5927\u5BB6\u90FD\u5E73\u5B89\u6536\u5DE5\u4E2D\uFF0C\u53EF\u4EE5\u653E\u5FC3\u5598\u53E3\u6C23\u3002",
        ));
      return;
    }
    if (l.length === 1) {
      (i && (await Ut(r, i)),
        await e.reply(
          "\u{1F99E} \u76EE\u524D\u53EA\u5269\u6700\u5F8C\u4E00\u96BB\u5C0F\u9F8D\u8766\u4E86\uFF0C\u6211\u5148\u5E6B\u4F60\u7559\u8457\u7260\uFF0C\u907F\u514D\u6574\u6C60\u90FD\u6536\u5DE5\u5566\u3002",
        ));
      return;
    }
    let c = [
        "\u{1F99E} \u60F3\u8B93\u54EA\u4E00\u96BB\u5C0F\u9F8D\u8766\u5148\u4E0B\u73ED\u5462\uFF1F",
        "",
        "\u9EDE\u4E00\u96BB\u7D66\u6211\uFF0C\u6211\u6703\u518D\u5E6B\u4F60\u78BA\u8A8D\u4E00\u6B21\uFF0C\u4E0D\u6703\u8B93\u7260\u7A81\u7136\u5C31\u6536\u5DE5\u3002",
      ].join(`
`),
      d = Ud(l),
      m = await e.reply(c, { reply_markup: d });
    i && m.message_id
      ? await Sn(r, i, { mode: "close", messageId: m.message_id })
      : i && (await Ut(r, i));
  } catch (a) {
    (console.error("[/close] \u57F7\u884C\u5931\u6557", a),
      await e.reply(
        "\u274C \u57F7\u884C /close \u6642\u767C\u751F\u932F\u8AA4\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",
      ));
  }
});
Ie();
mt();
function ni(e) {
  if (typeof e == "string") return e.trim();
  let t = [e, e?.response, e?.result];
  for (let r of t) {
    if (typeof r == "string" && r.trim()) return r.trim();
    if (r && typeof r == "object") {
      let n = r;
      if (typeof n.response == "string" && n.response.trim()) return n.response.trim();
      if (typeof n.text == "string" && n.text.trim()) return n.text.trim();
      if (typeof n.output_text == "string" && n.output_text.trim()) return n.output_text.trim();
      if (Array.isArray(n.choices)) {
        let o = n.choices[0]?.message;
        if (typeof o?.content == "string" && o.content.trim()) return o.content.trim();
      }
    }
  }
  throw new Error(
    "Workers AI \u672A\u56DE\u50B3\u53EF\u89E3\u6790\u7684 workflow inputs \u7D50\u679C\u3002",
  );
}
function c_(e) {
  let t = e.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return t ? t[1].trim() : e.trim();
}
function d_(e) {
  let t = e.indexOf("{");
  if (t < 0) return "";
  let r = 0,
    n = "",
    s = !1;
  for (let o = t; o < e.length; o += 1) {
    let i = e[o];
    if (n) {
      if (s) {
        s = !1;
        continue;
      }
      if (i === "\\") {
        s = !0;
        continue;
      }
      i === n && (n = "");
      continue;
    }
    if (i === '"' || i === "'") {
      n = i;
      continue;
    }
    if (i === "{") {
      r += 1;
      continue;
    }
    if (i === "}" && ((r -= 1), r === 0)) return e.slice(t, o + 1);
  }
  return "";
}
function Vp(e) {
  return e.replace(/,\s*([}\]])/g, "$1");
}
function si(e) {
  let t = e.trim();
  if (!t) throw new Error("AI \u6C92\u6709\u56DE\u50B3 workflow \u53C3\u6578\u5167\u5BB9\u3002");
  let r = c_(t),
    n = d_(r),
    s = [r, n, Vp(r), Vp(n)].filter((o, i, a) => o && a.indexOf(o) === i);
  if (s.length === 0)
    throw new Error("AI \u56DE\u50B3\u5167\u5BB9\u4E0D\u542B JSON \u7269\u4EF6\u3002");
  for (let o of s)
    try {
      let i = JSON.parse(o);
      if (!i || typeof i != "object" || Array.isArray(i)) continue;
      return i;
    } catch {}
  throw new Error(
    "AI \u56DE\u50B3\u5167\u5BB9\u4E0D\u662F\u6709\u6548\u7684 JSON \u7269\u4EF6\u3002",
  );
}
var p_ =
  /(^|[_-])(secret|token|password|passphrase|api[_-]?key|access[_-]?key|private[_-]?key)([_-]|$)/i;
var Jp = 12e3,
  m_ = 1024,
  f_ = 3,
  Yp = 1e3;
function _r(e) {
  return e == null
    ? ""
    : typeof e == "string"
      ? e.trim()
      : typeof e == "number" || typeof e == "boolean"
        ? String(e)
        : "";
}
function Xp(e) {
  return p_.test(String(e || "").trim());
}
function g_(e) {
  return !Array.isArray(e.inputs) || e.inputs.length === 0
    ? "- \u9019\u500B workflow \u6C92\u6709\u5B9A\u7FA9\u4EFB\u4F55 workflow_dispatch inputs\u3002"
    : e.inputs.map((t) =>
        [
          `- ${t.name}`,
          `  - required: ${t.required ? "true" : "false"}`,
          `  - type: ${t.type || "string"}`,
          `  - default: ${t.defaultValue || "(none)"}`,
          `  - description: ${t.description || "(none)"}`,
        ].join(`
`),
      ).join(`
`);
}
function oi(e) {
  let t = {};
  for (let r of e) {
    let n = _r(r.defaultValue);
    n && (t[r.name] = n);
  }
  return t;
}
function h_() {
  return { maxAttempts: f_, initialBackoffMs: Yp };
}
function w_(e, t = Yp) {
  return !Number.isInteger(e) || e <= 0 ? 0 : t * 2 ** (e - 1);
}
async function b_(e) {
  !Number.isFinite(e) || e <= 0 || (await new Promise((t) => setTimeout(t, e)));
}
function y_() {
  return [
    "\u4F60\u662F GitHub Actions workflow_dispatch \u53C3\u6578\u89E3\u6790\u5668\u3002",
    "\u4EFB\u52D9\u662F\u6839\u64DA workflow input \u5B9A\u7FA9\u8207\u4F7F\u7528\u8005\u81EA\u7136\u8A9E\u8A00\uFF0C\u8F38\u51FA\u53EF\u76F4\u63A5 dispatch \u7684 JSON\u3002",
    "\u53EA\u80FD\u4F7F\u7528 workflow \u5DF2\u5B9A\u7FA9\u7684 inputs \u540D\u7A31\uFF0C\u4E0D\u80FD\u634F\u9020\u4E0D\u5B58\u5728\u7684\u6B04\u4F4D\u3002",
    "\u82E5\u4F7F\u7528\u8005\u8A0A\u606F\u4E2D\u51FA\u73FE key=value \u7247\u6BB5\uFF0C\u4E14 key \u525B\u597D\u662F workflow \u5DF2\u5B9A\u7FA9\u7684 input \u540D\u7A31\uFF0C\u5FC5\u9808\u512A\u5148\u76F4\u63A5\u63A1\u7528\u8A72\u503C\u3002",
    "\u5C0D\u65BC key=value \u8F38\u5165\uFF0C\u4E0D\u8981\u7FFB\u8B6F key\u3001\u4E0D\u8981\u6539\u5BEB value\u3001\u4E0D\u8981\u81EA\u884C\u88DC\u63A8\u8AD6\uFF0C\u9664\u975E\u503C\u662F\u7A7A\u7684\u3002",
    "\u82E5\u540C\u4E00\u500B\u6B04\u4F4D\u540C\u6642\u51FA\u73FE\u5728 key=value \u8207\u81EA\u7136\u8A9E\u8A00\u6558\u8FF0\u4E2D\uFF0C\u512A\u5148\u4EE5 key=value \u70BA\u6E96\u3002",
    "\u82E5\u5FC5\u586B\u6B04\u4F4D\u7121\u6CD5\u5B89\u5168\u63A8\u65B7\uFF0C\u8ACB\u653E\u9032 missingRequired\u3002",
    "\u82E5 workflow \u6709 default\uFF0C\u4E14\u4F7F\u7528\u8005\u6C92\u6709\u660E\u78BA\u8986\u84CB\uFF0C\u53EF\u76F4\u63A5\u6CBF\u7528 default\u3002",
    "\u53EA\u8F38\u51FA\u55AE\u4E00 JSON \u7269\u4EF6\uFF0C\u683C\u5F0F\u5982\u4E0B\uFF1A",
    '{"inputs":{"input_name":"value"},"missingRequired":["required_input"]}',
  ].join(`
`);
}
function __(e, t) {
  let r = String(e.source || "").trim(),
    n = r
      ? r.length > Jp
        ? `${r.slice(0, Jp)}
# ... truncated ...`
        : r
      : "(unavailable)";
  return [
    `workflow name: ${e.workflowName}`,
    `workflow id: ${e.workflowId ?? "(unknown)"}`,
    `workflow file: ${e.workflowFile}`,
    `workflow path: ${e.workflowPath}`,
    `workflow state: ${e.state || "(unknown)"}`,
    "",
    "workflow inputs:",
    g_(e),
    "",
    "workflow yaml:",
    n,
    "",
    "key=value rule:",
    '- \u82E5 user message \u4E2D\u51FA\u73FE line_worker_name=foo \u9019\u985E\u7247\u6BB5\uFF0C\u8ACB\u76F4\u63A5\u653E\u9032 inputs.line_worker_name = "foo"',
    "- \u50C5\u63A5\u53D7 workflow \u5DF2\u5B9A\u7FA9\u7684 input \u540D\u7A31\u4F5C\u70BA key",
    "",
    "user message:",
    t || "(empty)",
  ].join(`
`);
}
function T_(e) {
  let t = {};
  for (let r of e.inputs) {
    let n = r.type === "boolean" ? "boolean" : "string";
    t[r.name] = { type: n, description: r.description || `workflow \u53C3\u6578\uFF1A${r.name}` };
  }
  return {
    type: "object",
    properties: {
      inputs: {
        type: "object",
        description:
          "\u6839\u64DA\u4F7F\u7528\u8005\u8A0A\u606F\u63A8\u5C0E\u51FA\u7684 workflow_dispatch \u53C3\u6578",
        properties: t,
      },
      missingRequired: {
        type: "array",
        description:
          "\u4ECD\u7136\u7121\u6CD5\u5B89\u5168\u63A8\u65B7\u7684\u5FC5\u586B workflow \u53C3\u6578\u540D\u7A31",
        items: { type: "string", enum: e.inputs.map((r) => r.name) },
      },
    },
    required: ["inputs", "missingRequired"],
  };
}
function k_(e, t) {
  let r = oi(e.inputs),
    n = t.inputs && typeof t.inputs == "object" && !Array.isArray(t.inputs) ? t.inputs : {},
    s = Array.isArray(t.missingRequired)
      ? t.missingRequired.map((a) => String(a || "").trim()).filter(Boolean)
      : [],
    o = { ...r },
    i = [];
  for (let a of e.inputs) {
    let l = _r(n[a.name]);
    if (l) {
      o[a.name] = l;
      continue;
    }
    !o[a.name] && a.required && i.push(a.name);
  }
  for (let a of s) i.includes(a) || (e.inputs.find((c) => c.name === a)?.required && i.push(a));
  return { inputs: o, missingRequired: i };
}
async function Zp(e, t, r, n) {
  let s = typeof n == "string" ? n.trim() : "",
    o = r.inputs.filter((l) => l.required && !_r(l.defaultValue)).map((l) => l.name);
  if (!s && o.length > 0) return { inputs: oi(r.inputs), missingRequired: o };
  if (r.inputs.length === 0) return { inputs: {}, missingRequired: [] };
  console.log("[Workflow dispatch] \u4F7F\u7528 Workers AI \u63A8\u5C0E workflow inputs", {
    workflowName: r.workflowName,
    model: t,
  });
  let i = h_(),
    a = null;
  for (let l = 1; l <= i.maxAttempts; l += 1)
    try {
      let c = await e.run(t, {
          messages: [
            { role: "system", content: y_() },
            { role: "user", content: __(r, s) },
          ],
          response_format: { type: "json_schema", json_schema: T_(r) },
          max_tokens: m_,
          temperature: 0,
        }),
        d = ni(c),
        m = si(d);
      return k_(r, m);
    } catch (c) {
      if (((a = c), l >= i.maxAttempts)) break;
      let d = w_(l, i.initialBackoffMs);
      (console.warn(
        "[Workflow dispatch] Workers AI \u63A8\u5C0E workflow inputs \u5931\u6557\uFF0C\u6E96\u5099\u91CD\u8A66",
        {
          workflowName: r.workflowName,
          attempt: l,
          maxAttempts: i.maxAttempts,
          backoffMs: d,
          error: c instanceof Error ? c.message : String(c),
        },
      ),
        await b_(d));
    }
  throw a instanceof Error
    ? a
    : new Error("Workers AI \u63A8\u5C0E workflow inputs \u5931\u6557\u3002");
}
Xe();
async function Is(e, t, r, n, s, o) {
  await e.actions.createWorkflowDispatch({ owner: t, repo: r, workflow_id: n, ref: s, inputs: o });
}
function nl(e, t) {
  let r = Object.entries(t || {}).filter(([, n]) => _r(n));
  return [
    `\u2699\uFE0F \u5DF2\u89F8\u767C workflow \`${O(e.workflowName)}\`\u3002`,
    "",
    ...(r.length > 0
      ? r.map(([n, s]) => `\\- ${O(n)}: ${O(Xp(n) ? "[REDACTED]" : s)}`)
      : ["\\- \u9019\u500B workflow \u6C92\u6709\u984D\u5916\u8F38\u5165\u53C3\u6578\u3002"]),
  ].join(`
`);
}
function em(e, t) {
  let r = Array.isArray(t) ? t.filter(Boolean) : [];
  return [
    `\u26A0\uFE0F \u7121\u6CD5\u89F8\u767C workflow \`${O(e.workflowName)}\`\u3002`,
    "",
    "\u7F3A\u5C11\u5FC5\u586B\u53C3\u6578\uFF1A",
    ...r.map((n) => `\\- ${O(n)}`),
    "",
    "\u8ACB\u76F4\u63A5\u7528\u81EA\u7136\u8A9E\u8A00\u628A\u9019\u4E9B\u503C\u88DC\u9F4A\u5F8C\u518D\u9001\u4E00\u6B21\u3002",
  ].join(`
`);
}
Xe();
var sl = new se();
sl.command("clear", async (e) => {
  let { octokit: t, store: r, config: n } = e.services,
    { owner: s, repo: o } = n.github,
    i = e.chat?.id,
    a = i ? await Ge(r, i) : null;
  if (!a) {
    await e.reply(
      "\u26A0\uFE0F \u5C1A\u672A\u9078\u64C7\u5C0F\u9F8D\u8766\uFF0C\u8ACB\u5148\u7528 /list \u9078\u64C7\u3002",
      { parse_mode: "MarkdownV2" },
    );
    return;
  }
  try {
    let l = await t.repos.get({ owner: s, repo: o });
    (await Is(t, s, o, "clear-memory.yml", l.data.default_branch, { active_issue: String(a) }),
      await e.reply(`\u{1F9F9} \u5DF2\u6E05\u9664\u5C0F\u9F8D\u8766 \\#${a} \u8A18\u61B6`, {
        parse_mode: "MarkdownV2",
      }));
  } catch (l) {
    (console.error("[/clear] dispatchWorkflow \u5931\u6557", {
      issueNumber: a,
      error: l instanceof Error ? l.message : String(l),
    }),
      await e.reply(
        `\u274C \u89F8\u767C workflow \`${O("\u{1F9F9} \u6E05\u9664\u5C0F\u9F8D\u8766\u8A18\u61B6")}\` \u5931\u6557\uFF1A${O(l instanceof Error ? l.message : "\u672A\u77E5\u932F\u8AA4")}`,
        { parse_mode: "MarkdownV2" },
      ));
  }
});
Fs();
Ie();
mt();
var oT = "skill-install";
function El(e) {
  return `${oT}:${e}`;
}
async function at(e, t) {
  let r = await e.get(El(t));
  return r !== null ? JSON.parse(r) : null;
}
async function ht(e, t, r) {
  await e.put(El(t), JSON.stringify(r), { expirationTtl: 900 });
}
async function hi(e, t) {
  await e.delete(El(t));
}
_s();
ti();
Ve();
Xe();
var Sl = new se();
async function Il(e) {
  let { store: t, config: r } = e.services,
    n = e.chat?.id;
  if (!n) return;
  let s = await Ge(t, n);
  if (!s) {
    await e.reply(
      "\u26A0\uFE0F \u5C1A\u672A\u9078\u64C7\u5C0F\u9F8D\u8766\uFF0C\u8ACB\u5148\u7528 /list \u9078\u64C7\u3002",
    );
    return;
  }
  let o, i, a;
  try {
    let [m, w, y] = await Promise.all([
      bs({
        apiBaseUrl: r.github.apiBaseUrl,
        apiVersion: r.github.apiVersion,
        userAgent: r.github.userAgent,
        token: r.github.token,
      }),
      ei(e.services.octokit, r.github.owner, r.github.repo, `issue-${s}`),
      e.services.octokit.rest.issues
        .get({ owner: r.github.owner, repo: r.github.repo, issue_number: s })
        .catch(() => null),
    ]);
    ((o = m), (i = w), (a = y?.data?.title || void 0));
  } catch (m) {
    console.error("[/skills] listRemoteSkills \u5931\u6557", m);
    let w = m instanceof Error ? m.message : String(m);
    await e.reply(`\u274C \u53D6\u5F97\u6280\u80FD\u6E05\u55AE\u5931\u6557\uFF1A${w}`);
    return;
  }
  if (!o || o.length === 0) {
    await e.reply("\u{1F50D} \u76EE\u524D\u6C92\u6709\u53EF\u5B89\u88DD\u7684\u6280\u80FD\u3002");
    return;
  }
  let l = new Set(i);
  await ht(t, n, {
    skillName: "",
    step: "selecting",
    issueNumber: s,
    issueTitle: a,
    installedSkills: i,
  });
  let c = a ? `\u{1F99E} ${a} #${s}` : `\u{1F99E} #${s}`,
    d = as(o, 0, l);
  await e.reply(`\u{1F6E0} \u9078\u64C7\u8981\u5B89\u88DD\u7684\u6280\u80FD\u5230 ${c}`, {
    reply_markup: d,
  });
}
Sl.command("skills", async (e) => {
  await Il(e);
});
async function Pm(e) {
  let { store: t } = e.services,
    r = e.chat?.id;
  if (!r) return;
  let n = await at(t, r);
  if (!n || n.step !== "awaiting_env") return;
  let s = (e.message?.text ?? "").trim(),
    o = n.requiredEnvs ?? [],
    i = n.currentEnvIndex ?? 0,
    a = { ...(n.collectedEnvs ?? {}) },
    l = o[i] ?? "";
  if (!s) {
    await e.reply(`\u26A0\uFE0F \u8ACB\u8F38\u5165 *${O(l)}* \u7684\u503C`, {
      parse_mode: "MarkdownV2",
      reply_markup: ls(),
    });
    return;
  }
  a[l] = s;
  let c = i + 1,
    d = n.promptMessageId;
  if (c < o.length) {
    (await ht(t, r, { ...n, currentEnvIndex: c, collectedEnvs: a }), await xm(e, r));
    let m = `\u{1F511} \u8ACB\u8F38\u5165 *${O(o[c])}* \u7684\u503C

\uFF08${c + 1}/${o.length}\uFF09`,
      w = { parse_mode: "MarkdownV2", reply_markup: ls() };
    d ? await e.api.editMessageText(r, d, m, w) : await e.reply(m, w);
  } else {
    (await ht(t, r, { ...n, step: "confirm_install", collectedEnvs: a }), await xm(e, r));
    let m = n.issueNumber,
      w = n.issueTitle,
      y = w ? `\u{1F99E} ${O(w)} \\#${m}` : `\u{1F99E} \\#${m}`,
      _ = `\u78BA\u8A8D\u5B89\u88DD\u6280\u80FD *${O(n.skillName)}* \u5230 ${y}\uFF1F`,
      I = { parse_mode: "MarkdownV2", reply_markup: Wo(n.skillName) };
    d ? await e.api.editMessageText(r, d, _, I) : await e.reply(_, I);
  }
}
async function xm(e, t) {
  let r = e.message?.message_id;
  if (r)
    try {
      await e.api.deleteMessage(t, r);
    } catch (n) {
      console.warn("[skills] failed to delete sensitive input message", {
        chatId: t,
        messageId: r,
        error: n instanceof Error ? n.message : String(n),
      });
    }
}
Ie();
var iT = "template-install";
function vl(e) {
  return `${iT}:${e}`;
}
async function be(e, t) {
  let r = await e.get(vl(t));
  return r !== null ? JSON.parse(r) : null;
}
async function oe(e, t, r) {
  await e.put(vl(t), JSON.stringify(r), { expirationTtl: 900 });
}
async function Ir(e, t) {
  await e.delete(vl(t));
}
Za();
Yr();
var Gm = "jeffsia-blacksmith",
  Fm = "altShiftClawToolkit",
  $m = "main",
  aT = 5 * 6e4,
  Mm = {
    default: "\u9810\u8A2D\u7BC4\u672C",
    summary: "\u6458\u8981\u7BC4\u672C",
    "image-generation": "\u5716\u50CF\u751F\u6210\u7BC4\u672C",
  },
  Om = {
    default:
      "\u901A\u7528\u4EFB\u52D9\u7528\u7BC4\u672C\uFF0C\u9069\u5408\u5927\u591A\u6578\u958B\u767C\u8207\u81EA\u52D5\u5316\u6D41\u7A0B\u3002",
    summary:
      "\u504F\u91CD\u6458\u8981\u3001\u6574\u7406\u8207\u91CD\u9EDE\u63D0\u7149\u7684\u4EFB\u52D9\u7BC4\u672C\u3002",
    "image-generation":
      "\u504F\u91CD\u5716\u50CF\u751F\u6210\u3001\u7D20\u6750\u7522\u51FA\u8207\u8996\u89BA\u4EFB\u52D9\u7684\u7BC4\u672C\u3002",
  },
  qt = null;
function Nm(e) {
  let t = String(e || "").trim();
  return t
    ? Mm[t]
      ? Mm[t]
      : t
          .split(/[-_]/g)
          .filter(Boolean)
          .map((r) => r.charAt(0).toUpperCase() + r.slice(1))
          .join(" ")
    : "\u7BC4\u672C";
}
async function On(e) {
  if (qt && Date.now() - qt.fetchedAt < aT) return qt.templates;
  let r = `${e.apiBaseUrl || "https://api.github.com"}/repos/${Gm}/${Fm}/contents/templates?ref=${encodeURIComponent($m)}`;
  try {
    let n = await An(r, e);
    if (!n.ok) {
      if (qt) return ((qt.fetchedAt = Date.now()), qt.templates);
      throw new Error(`listRemoteTemplates failed: ${n.status} ${n.statusText}${n.rateLimitHint}`);
    }
    let s = n.data;
    if (!Array.isArray(s)) return [];
    let o = s
      .filter((i) => i && i.type === "dir")
      .map((i) => ({ name: String(i.name || "") }))
      .filter((i) => i.name);
    return ((qt = { fetchedAt: Date.now(), templates: o }), o);
  } catch (n) {
    if (qt) return ((qt.fetchedAt = Date.now()), qt.templates);
    throw n;
  }
}
async function Lm(e, t) {
  let r = String(t || "").trim();
  if (!r) return null;
  let n = await rn(e, r);
  return n
    ? {
        name: n.name?.trim() || Nm(r),
        description:
          n.description ||
          Om[r] ||
          `\u540C\u6B65 templates/${r} \u5230\u76EE\u524D\u5C08\u6848\u3002`,
      }
    : {
        name: Nm(r),
        description: Om[r] ?? `\u540C\u6B65 templates/${r} \u5230\u76EE\u524D\u5C08\u6848\u3002`,
      };
}
function lT(e) {
  if (!Array.isArray(e)) return;
  let t = e
    .map((r) => {
      if (typeof r == "string") {
        let i = r.trim();
        return i ? { value: i, label: i } : null;
      }
      if (!r || typeof r != "object") return null;
      let n = r,
        s = typeof n.value == "string" ? n.value.trim() : "",
        o = typeof n.label == "string" ? n.label.trim() : s;
      return !s || !o ? null : { value: s, label: o };
    })
    .filter((r) => r !== null);
  return t.length > 0 ? t : void 0;
}
async function rn(e, t) {
  let r = e.apiBaseUrl || "https://api.github.com",
    n = `templates/${encodeURIComponent(t)}/githubclaw.json`,
    s = `${r}/repos/${Gm}/${Fm}/contents/${n}?ref=${encodeURIComponent($m)}`;
  try {
    let o = await An(s, e);
    if (!o.ok) return null;
    let i = o.data;
    if (typeof i?.content != "string") return null;
    let a = St(i.content),
      l = JSON.parse(a);
    return {
      name: typeof l.name == "string" ? l.name : void 0,
      tagline: typeof l.tagline == "string" ? l.tagline : void 0,
      description: typeof l.description == "string" ? l.description : void 0,
      category: typeof l.category == "string" ? l.category : void 0,
      tags: Array.isArray(l.tags) ? l.tags.filter((c) => typeof c == "string") : void 0,
      version: typeof l.version == "string" ? l.version : void 0,
      support_url: typeof l.support_url == "string" ? l.support_url : void 0,
      homepage: typeof l.homepage == "string" ? l.homepage : void 0,
      requireEnv: Array.isArray(l.requireEnv)
        ? [
            ...new Set(
              l.requireEnv
                .filter((c) => typeof c == "string" && c.trim() !== "")
                .map((c) => c.trim()),
            ),
          ]
        : void 0,
      needModel:
        typeof l.need_model == "boolean"
          ? l.need_model
          : typeof l.needModel == "boolean"
            ? l.needModel
            : void 0,
      models: lT(l.models),
      modelVar:
        typeof l.modelVar == "string"
          ? l.modelVar.trim() || void 0
          : (typeof l.model_var == "string" && l.model_var.trim()) || void 0,
    };
  } catch (o) {
    return (console.error(`[template-catalog] fetchRemoteTemplateManifest(${t}) error:`, o), null);
  }
}
var uT = "templates.yml",
  cT = "main";
async function Nn(e, t, r, n) {
  try {
    let s = await e.repos.getContent({ owner: t, repo: r, path: `templates/${n}`, ref: "main" });
    return Array.isArray(s.data) ? s.data.length > 0 : !0;
  } catch {
    return !1;
  }
}
async function Dm(e, t, r, n) {
  let s = { template_name: n.templateName, request_id: n.requestId };
  await e.actions.createWorkflowDispatch({
    owner: t,
    repo: r,
    workflow_id: uT,
    ref: cT,
    inputs: s,
  });
}
Ve();
var Cl = new se();
Cl.command("templates", async (e) => {
  let { store: t, config: r } = e.services,
    n = e.chat?.id;
  if (!n) return;
  (await be(t, n)) && (await oe(t, n, { templateName: "", step: "selecting" }));
  let o;
  try {
    o = await On(r.github);
  } catch (c) {
    console.error("[/templates] listRemoteTemplates \u5931\u6557", c);
    let d = c instanceof Error ? c.message : String(c);
    await e.reply(`\u274C \u53D6\u5F97\u7BC4\u672C\u6E05\u55AE\u5931\u6557\uFF1A${d}`);
    return;
  }
  if (!o.length) {
    await e.reply("\u{1F50D} \u76EE\u524D\u6C92\u6709\u53EF\u5B89\u88DD\u7684\u7BC4\u672C\u3002");
    return;
  }
  let { octokit: i } = e.services,
    a = await Promise.all(
      o.map(async (c) => {
        let d = await Nn(i, r.github.owner, r.github.repo, c.name);
        return { name: c.name, installed: d };
      }),
    ),
    l = new Set(a.filter((c) => c.installed).map((c) => c.name));
  (await oe(t, n, { templateName: "", step: "selecting" }),
    await e.reply(
      "\u{1F4DA} \u9078\u64C7\u8981\u5B89\u88DD\u5230\u9F8D\u8766\u5821\u7684\u7BC4\u672C",
      { reply_markup: us(o, 0, l) },
    ));
});
Ie();
mt();
Xr();
function $s(e, t) {
  let r = e.split("/").filter(Boolean).at(-1) ?? "";
  return t && r.endsWith(t) ? r.slice(0, -t.length) : r;
}
var dT = /^[A-Za-z][A-Za-z0-9_-]*$/;
function pT(e) {
  let t = 0;
  for (let r of e) {
    if (r === " ") {
      t += 1;
      continue;
    }
    if (r === "	") {
      t += 2;
      continue;
    }
    break;
  }
  return t;
}
function vr(e) {
  let t = String(e || "").trim();
  if (t.length < 2) return t;
  let r = t[0],
    n = t[t.length - 1];
  return (r === '"' && n === '"') || (r === "'" && n === "'") ? t.slice(1, -1) : t;
}
function mT(e) {
  return vr(e).trim().toLowerCase() === "true";
}
function fT(e) {
  let t = e.match(/^name:\s*(.+)$/i);
  return t ? vr(t[1]).trim() : "";
}
function gT(e) {
  let t = vr(e).trim();
  return t
    ? t === "workflow_dispatch"
      ? !0
      : t.startsWith("[") && t.endsWith("]")
        ? t
            .slice(1, -1)
            .split(",")
            .map((r) => vr(r).trim())
            .includes("workflow_dispatch")
        : !1
    : !1;
}
function wi(e) {
  return String(e || "").replace(/\.ya?ml$/i, "");
}
function Gn(e) {
  let t = vr(String(e ?? "")).trim();
  return dT.test(t) ? t.toLowerCase().replace(/[-_]+/g, "_") : "";
}
function Um(e) {
  let t = String(e || "").split(/\r?\n/),
    r = [],
    n = "",
    s = !1,
    o = null,
    i = null,
    a = null,
    l = null,
    c = null,
    d = (m) => {
      l && c != null && m <= c && (r.push(l), (l = null), (c = null));
    };
  for (let m of t) {
    let w = m.trim();
    if (!w || w.startsWith("#")) continue;
    let y = pT(m);
    (!n && y === 0 && (n = fT(w)),
      d(y),
      a != null && y <= a && (a = null),
      i != null && y <= i && (i = null),
      o != null && y <= o && (o = null));
    let _ = w.match(/^(?:on|'on'|"on"):\s*(.*)$/);
    if (y === 0 && _) {
      ((o = 0), gT(_[1]) && (s = !0));
      continue;
    }
    if (o != null && i == null && /^workflow_dispatch:\s*$/i.test(w)) {
      ((s = !0), (i = y));
      continue;
    }
    if (i != null && a == null && /^inputs:\s*$/i.test(w)) {
      a = y;
      continue;
    }
    if (a == null) continue;
    let I = w.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*$/);
    if (I && y > a) {
      (l && r.push(l),
        (l = { name: I[1], description: "", required: !1, defaultValue: "", type: "string" }),
        (c = y));
      continue;
    }
    if (!l || c == null || y <= c) continue;
    let P = w.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.+)$/);
    if (!P) continue;
    let [, S, U] = P;
    if (S === "description") {
      l.description = vr(U).trim();
      continue;
    }
    if (S === "required") {
      l.required = mT(U);
      continue;
    }
    if (S === "default") {
      l.defaultValue = vr(U);
      continue;
    }
    S === "type" && (l.type = vr(U).trim() || "string");
  }
  return (l && r.push(l), { name: n, hasWorkflowDispatch: s, inputs: r });
}
var hT = ".github/workflows/";
function wT(e, t) {
  let r = new Set(),
    n = Gn(wi($s(e)));
  n && r.add(n);
  let s = Gn(t.name);
  return (s && r.add(s), r);
}
async function Bm(e, t, r, n, s, o) {
  let i = typeof s.path == "string" ? s.path.trim() : "";
  if (!i.startsWith(hT)) return null;
  let a = await Zo(e, t, r, i, n),
    l = Um(a),
    c = wT(i, l),
    d = Gn(s.name);
  return (
    d && c.add(d),
    !c.has(o) || !l.hasWorkflowDispatch
      ? null
      : {
          workflowId: Number.isInteger(s.id) ? s.id : null,
          workflowName: l.name || s.name || wi($s(i)),
          workflowFile: $s(i),
          workflowPath: i,
          ref: n,
          state: typeof s.state == "string" ? s.state : "",
          htmlUrl: typeof s.html_url == "string" ? s.html_url : "",
          updatedAt: typeof s.updated_at == "string" ? s.updated_at : "",
          inputs: l.inputs,
          source: a,
          aliases: Array.from(c),
        }
  );
}
async function jm(e, t, r, n) {
  let s = Gn(n);
  if (!s) return null;
  let { data: o } = await e.actions.listRepoWorkflows({ owner: t, repo: r }),
    i = o.workflows,
    l = (await e.repos.get({ owner: t, repo: r })).data.default_branch,
    c = i.find((d) => Gn(wi($s(d.path))) === s);
  if (c) {
    let d = await Bm(e, t, r, l, c, s);
    if (d) return d;
  }
  for (let d of i) {
    if (d === c) continue;
    let m = await Bm(e, t, r, l, d, s);
    if (m) return m;
  }
  return null;
}
var bT = /^\/([A-Za-z0-9_]+)(?:@([A-Za-z0-9_]+))?(?:\s+([\s\S]*))?$/;
function Wm(e, t) {
  if (typeof e != "string") return null;
  let r = e.trim();
  if (!r.startsWith("/")) return null;
  let n = r.match(bT);
  if (!n) return null;
  let [, s, o, i] = n,
    a = String(s || "")
      .trim()
      .toLowerCase();
  if (!a) return null;
  let l = String(o || "").trim(),
    c = String(t || "")
      .trim()
      .toLowerCase();
  return l && c && l.toLowerCase() !== c
    ? null
    : { commandName: a, argsText: String(i || "").trim() };
}
Xe();
Xe();
var yT = "autoupdate.yml",
  Ls = ".github/workflows/autoupdate.yml",
  _T = /\|\s*req:([A-Za-z0-9-]+)\s*$/i;
function qm(e) {
  let t = typeof e.workflowFile == "string" ? e.workflowFile.trim() : "",
    r = typeof e.workflowPath == "string" ? e.workflowPath.trim() : "";
  return t === yT || r === Ls;
}
function Km(e, t) {
  return { visibleInputs: { ...e }, dispatchInputs: { ...e, request_id: t } };
}
function Hm(e) {
  return `\u23F3 \u6B63\u5728\u89F8\u767C workflow \`${O(e)}\`\u3002`;
}
function Rl(e) {
  return (e && e.match(_T)?.[1]?.trim()) || null;
}
function zm(e, t) {
  switch (e) {
    case "success":
      return "\u2705 \u5DF2\u6210\u529F\u66F4\u65B0\u9F8D\u8766\u5821\u6838\u5FC3\u3002";
    case "cancelled":
      return "\u26A0\uFE0F \u66F4\u65B0\u9F8D\u8766\u5821\u6838\u5FC3\u5DF2\u53D6\u6D88\u3002";
    case "failure":
    case "timed_out":
    case "startup_failure":
    case "action_required":
      return "\u274C \u66F4\u65B0\u9F8D\u8766\u5821\u6838\u5FC3\u5931\u6557\uFF0C\u8ACB\u67E5\u770B workflow run log\u3002";
    default:
      return `\u2139\uFE0F \u66F4\u65B0\u9F8D\u8766\u5821\u6838\u5FC3\u6D41\u7A0B\u5DF2\u7D50\u675F\uFF0C\u7D50\u679C\uFF1A${O(e || t || "unknown")}`;
  }
}
Et();
var Fn = new se(),
  He = { parse_mode: "MarkdownV2" };
function nn(e) {
  return `\`${O(e)}\``;
}
function bi(e) {
  return `\\#${e}`;
}
function Pl() {
  return "\u26A0\uFE0F \u5C1A\u672A\u9078\u64C7\u5C0F\u9F8D\u8766\uFF0C\u8ACB\u5148\u7528 /list \u9078\u64C7\u3002";
}
function Qm(e) {
  return `\u26A0\uFE0F \u627E\u4E0D\u5230 workflow ${nn(e)}\u3002`;
}
function TT(e) {
  return `\u274C \u555F\u7528 workflow ${nn(e)} \u5931\u6557\u3002`;
}
function kT(e) {
  return `\u274C \u505C\u7528 workflow ${nn(e)} \u5931\u6557\u3002`;
}
function ET(e, t) {
  return `\u2139\uFE0F \u5C0F\u9F8D\u8766 ${bi(e)} \u5C1A\u672A\u5EFA\u7ACB workflow\uFF08${nn(t)} \u4E0D\u5B58\u5728\uFF09\u3002`;
}
function ST(e, t, r, n) {
  return [
    `\u{1F527} \u5C0F\u9F8D\u8766 ${bi(e)} \u7684 workflow \u72C0\u614B`,
    "",
    `\u{1F4C4} \u6A94\u6848\uFF1A${nn(t)}`,
    `\u{1F4CD} \u72C0\u614B\uFF1A${O(r)}`,
    `\u{1F194} ID\uFF1A${n}`,
  ].join(`
`);
}
function IT() {
  return "\u274C \u67E5\u8A62 workflow \u72C0\u614B\u6642\u767C\u751F\u932F\u8AA4\u3002";
}
function vT(e) {
  return `\u274C \u63A8\u5C0E workflow \`${O(e)}\` \u53C3\u6578\u6642\u767C\u751F\u932F\u8AA4\u3002`;
}
function Al(e, t) {
  let r = O(t instanceof Error ? t.message : "\u672A\u77E5\u932F\u8AA4");
  return `\u274C \u89F8\u767C workflow \`${O(e)}\` \u5931\u6557\uFF1A${r}`;
}
function xl(e, t) {
  return e.inputs.some((r) => r.name === t);
}
function CT(e, t) {
  let r = { ...t };
  return (
    xl(e, "event_source") && !_r(r.event_source) && (r.event_source = "issue"),
    xl(e, "event_data") &&
      !Object.prototype.hasOwnProperty.call(r, "event_data") &&
      (r.event_data = ""),
    r
  );
}
Fn.command("enable", async (e) => {
  let { octokit: t, store: r, config: n } = e.services,
    { owner: s, repo: o } = n.github,
    i = e.chat?.id,
    a = i ? await Ge(r, i) : null;
  if (!a) {
    await e.reply(Pl(), He);
    return;
  }
  let l = `issue-${a}.yml`;
  try {
    let { data: c } = await t.actions.listRepoWorkflows({ owner: s, repo: o }),
      d = c.workflows.find((m) => m.path === `.github/workflows/${l}`);
    if (!d) {
      await e.reply(Qm(l), He);
      return;
    }
    (await t.actions.enableWorkflow({ owner: s, repo: o, workflow_id: d.id }),
      await e.reply(
        `\u2705 \u5DF2\u555F\u7528 workflow ${nn(l)}\uFF0C\u5C0F\u9F8D\u8766 ${bi(a)} \u5C07\u81EA\u52D5\u63A5\u53D7\u6D3E\u5DE5\u3002`,
        He,
      ));
  } catch (c) {
    (console.error("[/enable] \u555F\u7528 workflow \u5931\u6557", c), await e.reply(TT(l), He));
  }
});
Fn.command("disable", async (e) => {
  let { octokit: t, store: r, config: n } = e.services,
    { owner: s, repo: o } = n.github,
    i = e.chat?.id,
    a = i ? await Ge(r, i) : null;
  if (!a) {
    await e.reply(Pl(), He);
    return;
  }
  let l = `issue-${a}.yml`;
  try {
    let { data: c } = await t.actions.listRepoWorkflows({ owner: s, repo: o }),
      d = c.workflows.find((m) => m.path === `.github/workflows/${l}`);
    if (!d) {
      await e.reply(Qm(l), He);
      return;
    }
    (await t.actions.disableWorkflow({ owner: s, repo: o, workflow_id: d.id }),
      await e.reply(
        `\u2705 \u5DF2\u505C\u7528 workflow ${nn(l)}\uFF0C\u5C0F\u9F8D\u8766 ${bi(a)} \u66AB\u6642\u4E0D\u63A5\u53D7\u6D3E\u5DE5\u3002`,
        He,
      ));
  } catch (c) {
    (console.error("[/disable] \u505C\u7528 workflow \u5931\u6557", c), await e.reply(kT(l), He));
  }
});
Fn.command("workflow", async (e) => {
  let { octokit: t, store: r, config: n } = e.services,
    { owner: s, repo: o } = n.github,
    i = e.chat?.id,
    a = i ? await Ge(r, i) : null;
  if (!a) {
    await e.reply(Pl(), He);
    return;
  }
  let l = `issue-${a}.yml`;
  try {
    let { data: c } = await t.actions.listRepoWorkflows({ owner: s, repo: o }),
      d = c.workflows.find((w) => w.path === `.github/workflows/${l}`);
    if (!d) {
      await e.reply(ET(a, l), He);
      return;
    }
    let m =
      d.state === "active"
        ? "\u555F\u7528\u4E2D"
        : d.state === "disabled_manually"
          ? "\u5DF2\u624B\u52D5\u505C\u7528"
          : d.state;
    await e.reply(ST(a, l, m, d.id), He);
  } catch (c) {
    (console.error("[/workflow] \u67E5\u8A62 workflow \u5931\u6557", c), await e.reply(IT(), He));
  }
});
Fn.on("message:text", async (e, t) => {
  let r = Wm(e.message.text, e.me.username);
  if (!r) {
    await t();
    return;
  }
  (await RT(e, r.commandName, r.argsText)) || (await t());
});
async function RT(e, t, r) {
  let { octokit: n, config: s, d1: o } = e.services,
    { owner: i, repo: a } = s.github,
    l;
  try {
    l = await jm(n, i, a, t);
  } catch (w) {
    return (
      console.warn("[workflow] resolveWorkflowCommand \u5931\u6557", {
        commandName: t,
        error: w instanceof Error ? w.message : String(w),
      }),
      !1
    );
  }
  if (!l) return !1;
  let c = s.workflowInputInference.ai,
    d = s.workflowInputInference.model,
    m;
  try {
    if (c) m = await Zp(c, d, l, r);
    else {
      let w = oi(l.inputs),
        y = l.inputs.filter((_) => _.required && !_r(_.defaultValue)).map((_) => _.name);
      m = { inputs: w, missingRequired: y };
    }
  } catch (w) {
    return (
      console.error("[workflow] inferWorkflowDispatchInputs \u5931\u6557", {
        commandName: t,
        error: w instanceof Error ? w.message : String(w),
      }),
      await e.reply(vT(l.workflowName), He),
      !0
    );
  }
  if (m.missingRequired.length > 0) return (await e.reply(em(l, m.missingRequired), He), !0);
  try {
    let w = CT(l, m.inputs);
    if (qm(l) && xl(l, "request_id") && !!e.chat?.id && e.chat?.id) {
      let _ = crypto.randomUUID(),
        { dispatchInputs: I } = Km(w, _),
        P = await e.reply(Hm(l.workflowName), He),
        S = !1;
      try {
        (await Gt(o, {
          requestId: _,
          repo: s.github.repoFullName,
          workflowName: l.workflowName,
          workflowPath: l.workflowPath,
          title: l.workflowName,
          channel: "telegram",
          chatId: e.chat.id,
          messageId: P.message_id,
          sourceType: "workflow_autoupdate",
          sourceId: t,
          payloadJson: JSON.stringify(w),
        }),
          (S = !0),
          await Is(n, i, a, l.workflowFile, l.ref, I),
          await e.api.editMessageText(e.chat.id, P.message_id, nl(l, w), He));
      } catch (U) {
        (console.error("[workflow] autoupdate notification dispatch \u5931\u6557", {
          commandName: t,
          error: U instanceof Error ? U.message : String(U),
        }),
          S && (await Ea(o, _)));
        try {
          await e.api.editMessageText(e.chat.id, P.message_id, Al(l.workflowName, U), He);
        } catch {
          await e.reply(Al(l.workflowName, U), He);
        }
      }
      return !0;
    }
    (await Is(n, i, a, l.workflowFile, l.ref, w), await e.reply(nl(l, w), He));
  } catch (w) {
    (console.error("[workflow] dispatchWorkflow \u5931\u6557", {
      commandName: t,
      error: w instanceof Error ? w.message : String(w),
    }),
      await e.reply(Al(l.workflowName, w), He));
  }
  return !0;
}
Ie();
Jr();
Ve();
ds();
ds();
function yi(e) {
  let t = typeof e == "string" ? e.trim() : "";
  if (!t) return { scheduleId: "", source: "issue" };
  let [r, n] = t.split("|");
  return { scheduleId: r?.trim() || "", source: n === "chat" ? "chat" : "issue" };
}
function $n(e) {
  let t = e.prompt.length > 20 ? `${e.prompt.slice(0, 20)}\u2026` : e.prompt;
  return `${e.ruleType} | ${t}`;
}
function Vm(e) {
  return e === "paused" ? "\u5DF2\u505C\u7528" : "\u555F\u7528\u4E2D";
}
function Ln(e) {
  return (typeof e == "string" ? e.trim() : "") || "\uFF08\u672A\u8A2D\u5B9A\uFF09";
}
function Ml(e) {
  let t = e.issueTitle.trim();
  return t ? `${t} (#${e.issueNumber})` : `\u5C0F\u9F8D\u8766 #${e.issueNumber}`;
}
function Ol(e, t, r) {
  let n = [`\u{1F5C2}\uFE0F \u{1F99E} ${e} (#${t}) \u7684\u6392\u7A0B\u5217\u8868`, ""];
  return r.length === 0
    ? (n.push("\u76EE\u524D\u9084\u6C92\u6709\u6392\u7A0B\u3002"),
      n.join(`
`))
    : (r.forEach((s, o) => {
        (n.push(`${o + 1}. ${$n(s)}`),
          n.push(`   \u{1F194} ${s.id}`),
          n.push(`   \u23ED\uFE0F ${Bt(s.nextRunAt)}`));
      }),
      n.push("", "\u8ACB\u9EDE\u4E0B\u65B9\u6309\u9215\u7BA1\u7406\u6307\u5B9A\u6392\u7A0B\u3002"),
      n.join(`
`));
}
function Nl(e, t, r) {
  return [
    `\u{1F5C2}\uFE0F \u{1F99E} ${e} (#${t}) \u6392\u7A0B\u8A73\u60C5`,
    "",
    `\u{1F194} ${r.id}`,
    `\u{1F4CD} \u72C0\u614B\uFF1A${Vm(r.status)}`,
    `\u{1F5D3}\uFE0F \u898F\u5247\uFF1A${br(r)}`,
    `\u23ED\uFE0F \u4E0B\u6B21\u57F7\u884C\uFF1A${Bt(r.nextRunAt)}`,
    `\u{1F514} \u901A\u77E5\uFF1A${r.shouldNotify ? "\u958B\u555F" : "\u95DC\u9589"}`,
    "",
    `\u{1F4DD} \u4EFB\u52D9\uFF1A${r.prompt}`,
    `\u{1F4E6} Payload\uFF1A${Ln(r.eventData)}`,
  ].join(`
`);
}
function Jm(e, t) {
  return [
    `\u{1F4DD} (1/4) \u6B63\u5728\u70BA \u{1F99E} ${e} (#${t}) \u8A2D\u5B9A\u6392\u7A0B`,
    "",
    "\u8ACB\u544A\u8A34\u6211\u4F60\u5E0C\u671B\u9019\u96BB\u5C0F\u9F8D\u8766\u5B9A\u671F\u57F7\u884C\u7684\u4EFB\u52D9\u662F\u4EC0\u9EBC\uFF1F\uFF08\u7D66\u5C0F\u9F8D\u8766\u7684\u63D0\u793A\u8A5E\uFF09",
  ].join(`
`);
}
function Ym(e) {
  return `\u270F\uFE0F (1/2) \u8ACB\u8F38\u5165\u6392\u7A0B ${e} \u7684\u65B0\u4EFB\u52D9\u5167\u5BB9\uFF08\u7D66\u5C0F\u9F8D\u8766\u7684\u63D0\u793A\u8A5E\uFF09`;
}
function Xm(e) {
  return [
    `\u{1F552} (1/2) \u8ACB\u8F38\u5165\u6392\u7A0B ${e} \u7684\u65B0\u57F7\u884C\u6642\u9593`,
    "",
    "\u4F8B\u5982\uFF1A\u6BCF 5 \u5206\u9418\u3001\u6BCF\u5C0F\u6642\u6574\u9EDE\u3001\u6BCF\u5929\u4E2D\u534812\u9EDE\u3001\u6BCF\u9031\u4E00\u4E0B\u53482\u9EDE\u3001\u661F\u671F\u4E00\u8DDF\u661F\u671F\u4E09\u7684\u4E0B\u5348\u4E09\u9EDE\u3001\u6BCF\u500B\u5DE5\u4F5C\u65E5\u4E0B\u53482\u9EDE\u3001\u6BCF\u500B\u5047\u65E5\u65E9\u4E0A9\u9EDE\u3001\u6BCF\u59299:00\u300112:00\u300115:00\u300118:00\u300121:00\u300124:00\u57F7\u884C\u4E00\u6B21",
  ].join(`
`);
}
function Zm(e, t) {
  return [
    `\u{1F4E6} (1/2) \u8ACB\u8A2D\u5B9A\u6392\u7A0B ${e} \u7684 Payload \u8CC7\u6599\uFF1F(\u53EF\u9078)`,
    "",
    `\u76EE\u524D\u503C\uFF1A${Ln(t)}`,
    "\u76F4\u63A5\u8F38\u5165\u65B0\u7684 Payload \u5167\u5BB9\uFF0C\u6216\u9EDE\u9078\u300C\u7565\u904E\u300D\u6E05\u7A7A\u3002",
    "\u82E5\u8F38\u5165\u7684\u662F JSON object\uFF0C\u6392\u7A0B\u89F8\u767C\u6642\u6703\u4FDD\u7559\u539F\u59CB event_data\uFF0C\u4E26\u984D\u5916\u5C55\u958B\u6210 workflow inputs\u3002",
  ].join(`
`);
}
function Dn(e) {
  let t = [
    "\u{1F5C2}\uFE0F \u9019\u500B\u804A\u5929\u76EE\u524D\u7684\u6392\u7A0B\u5217\u8868",
    "",
  ];
  return e.length === 0
    ? (t.push("\u76EE\u524D\u6C92\u6709\u6392\u7A0B\u3002"),
      t.join(`
`))
    : (e.forEach((r, n) => {
        (t.push(`${n + 1}. ${Ml(r)}\uFF5C${$n(r)}`),
          t.push(`   \u{1F194} ${r.id}`),
          t.push(`   \u23ED\uFE0F ${Bt(r.nextRunAt)}`));
      }),
      t.push(
        "",
        "\u8ACB\u9EDE\u4E0B\u65B9\u6309\u9215\u67E5\u770B\u7D30\u7BC0\u6216\u522A\u9664\u6392\u7A0B\u3002",
      ),
      t.join(`
`));
}
function Ds(e) {
  return [
    `\u{1F5C2}\uFE0F ${Ml(e)} \u7684\u6392\u7A0B\u8A73\u60C5`,
    "",
    `\u{1F194} ${e.id}`,
    `\u{1F4CD} \u72C0\u614B\uFF1A${Vm(e.status)}`,
    `\u{1F5D3}\uFE0F \u898F\u5247\uFF1A${br(e)}`,
    `\u23ED\uFE0F \u4E0B\u6B21\u57F7\u884C\uFF1A${Bt(e.nextRunAt)}`,
    "",
    `\u{1F4DD} \u4EFB\u52D9\uFF1A${e.prompt}`,
    `\u{1F4E6} Payload\uFF1A${Ln(e.eventData)}`,
    "",
    "\u5982\u679C\u9019\u7B46\u6392\u7A0B\u662F\u4E4B\u524D\u5DF2\u6536\u5DE5\u7684\u5C0F\u9F8D\u8766\u7559\u4E0B\u7684\uFF0C\u4E5F\u53EF\u4EE5\u76F4\u63A5\u5F9E\u9019\u88E1\u522A\u6389\u3002",
  ].join(`
`);
}
function _i(e) {
  return e.issueState === "closed";
}
async function Us(e, t, r, n) {
  let s = "",
    o = "";
  try {
    let i = await e.issues.get({ owner: t, repo: r, issue_number: n.issueNumber });
    ((s = i.data.title || ""), (o = i.data.state || ""));
  } catch {}
  return { ...n, issueTitle: s, issueState: o };
}
async function Un(e, t, r, n, s, o) {
  let i = await Ip(e, s, o),
    a = [...new Set(i.map((c) => c.issueNumber))],
    l = new Map();
  return (
    await Promise.all(
      a.map(async (c) => {
        try {
          let d = await t.issues.get({ owner: r, repo: n, issue_number: c });
          l.set(c, { title: d.data.title || "", state: d.data.state || "" });
        } catch {
          l.set(c, { title: "", state: "" });
        }
      }),
    ),
    i.map((c) => ({
      ...c,
      issueTitle: l.get(c.issueNumber)?.title || "",
      issueState: l.get(c.issueNumber)?.state || "",
    }))
  );
}
function Bn(e) {
  if (e.length !== 0)
    return Hd(
      e.map((t) => ({
        id: t.id,
        issueNumber: t.issueNumber,
        buttonLabel: `${Ml(t)}\uFF5C${$n(t)}`,
      })),
    );
}
function Bs(e) {
  return _i(e) ? Qd(e.id) : zd(e.id, e.issueNumber, e.status !== "paused");
}
ft();
Jr();
Ve();
Ss();
Ms();
var Fl = "Asia/Taipei";
function jn(e = new Date()) {
  let t = new Date(e.getTime() + 288e5);
  return {
    year: t.getUTCFullYear(),
    month: t.getUTCMonth() + 1,
    day: t.getUTCDate(),
    hour: t.getUTCHours(),
    minute: t.getUTCMinutes(),
    second: t.getUTCSeconds(),
    weekday: t.getUTCDay(),
  };
}
function Cr(e) {
  return new Date(
    Date.UTC(e.year, e.month - 1, e.day, e.hour ?? 0, e.minute ?? 0, e.second ?? 0) - 288e5,
  );
}
function ki(e, t) {
  let r = Cr(e);
  return jn(new Date(r.getTime() + t * 864e5));
}
function AT(e, t) {
  return new Date(e.getTime() + t * 60 * 60 * 1e3);
}
function tf(e, t) {
  return new Date(e.getTime() + t * 60 * 1e3);
}
function Ws(e) {
  let t = typeof e == "string" ? e.trim() : String(e ?? "").trim();
  if (!t) throw new Error("\u6392\u7A0B\u683C\u5F0F\u4E0D\u6B63\u78BA");
  if (/^\d{1,3}$/.test(t)) return Number.parseInt(t, 10);
  let r = {
    零: 0,
    "\u3007": 0,
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
  };
  if (t === "\u5341") return 10;
  if (t.startsWith("\u5341")) {
    let s = r[t.slice(1)];
    if (s == null) throw new Error("\u6392\u7A0B\u683C\u5F0F\u4E0D\u6B63\u78BA");
    return 10 + s;
  }
  if (t.includes("\u5341")) {
    let [s, o] = t.split("\u5341"),
      i = r[s];
    if (i == null) throw new Error("\u6392\u7A0B\u683C\u5F0F\u4E0D\u6B63\u78BA");
    if (!o) return i * 10;
    let a = r[o];
    if (a == null) throw new Error("\u6392\u7A0B\u683C\u5F0F\u4E0D\u6B63\u78BA");
    return i * 10 + a;
  }
  let n = r[t];
  if (n == null) throw new Error("\u6392\u7A0B\u683C\u5F0F\u4E0D\u6B63\u78BA");
  return n;
}
function rf(e) {
  let t = Ws(e);
  if (!Number.isInteger(t) || t < 0 || t > 23)
    throw new Error(
      "\u6642\u9593\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF1A\u5C0F\u6642\u8D85\u51FA\u7BC4\u570D",
    );
  return t;
}
function $l(e) {
  if (e == null || e === "") return 0;
  let t = Ws(e);
  if (!Number.isInteger(t) || t < 0 || t > 59)
    throw new Error(
      "\u6642\u9593\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF1A\u5206\u9418\u8D85\u51FA\u7BC4\u570D",
    );
  return t;
}
function xT(e, t) {
  let r = rf(e.hour),
    n = $l(e.minute),
    s = jn(t),
    o = { year: s.year, month: s.month, day: s.day, hour: r, minute: n },
    i = Cr(o);
  if (i.getTime() <= t.getTime()) {
    let a = ki(s, 1);
    i = Cr({ year: a.year, month: a.month, day: a.day, hour: r, minute: n });
  }
  return i;
}
function PT(e, t) {
  let r = Ws(e.interval_minutes || 1);
  if (!Number.isInteger(r) || r <= 0 || r > 59)
    throw new Error("\u6BCF\u5206\u9418\u6392\u7A0B\u683C\u5F0F\u4E0D\u6B63\u78BA");
  let n = jn(t),
    s = n.minute,
    o = Cr({ year: n.year, month: n.month, day: n.day, hour: n.hour, minute: s });
  for (; s % r !== 0 || o.getTime() <= t.getTime();) ((s += 1), (o = tf(o, 1)));
  return o;
}
function MT(e, t) {
  let r = Ws(e.interval_hours || 1),
    n = $l(e.minute);
  if (!Number.isInteger(r) || r <= 0 || r > 24)
    throw new Error("\u6BCF\u5C0F\u6642\u6392\u7A0B\u683C\u5F0F\u4E0D\u6B63\u78BA");
  let s = jn(t),
    o = s.hour,
    i = Cr({ year: s.year, month: s.month, day: s.day, hour: o, minute: n });
  for (; o % r !== 0 || i.getTime() <= t.getTime();) ((o += 1), (i = AT(i, 1)));
  return i;
}
function OT(e) {
  let t = e?.weekdays,
    r = Array.isArray(t)
      ? t
          .map((s) => Number.parseInt(String(s), 10))
          .filter((s) => Number.isInteger(s) && s >= 0 && s <= 6)
      : [];
  if (r.length > 0) return [...new Set(r)].sort((s, o) => s - o);
  let n = Number.parseInt(String(e?.weekday), 10);
  return Number.isInteger(n) && n >= 0 && n <= 6 ? [n] : [];
}
function Gl(e, t, r) {
  let n = new Set(e.filter((l) => Number.isInteger(l) && l >= 0 && l <= 6)),
    s = rf(t.hour),
    o = $l(t.minute);
  if (n.size === 0)
    throw new Error(
      "\u6392\u7A0B\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF1A\u7F3A\u5C11\u6709\u6548\u7684\u661F\u671F\u8A2D\u5B9A",
    );
  let i = jn(r);
  for (let l = 0; l < 7; l += 1) {
    let c = ki(i, l);
    if (!n.has(c.weekday)) continue;
    let d = Cr({ year: c.year, month: c.month, day: c.day, hour: s, minute: o });
    if (d.getTime() > r.getTime()) return d;
  }
  let a = ki(i, 7);
  return Cr({ year: a.year, month: a.month, day: a.day, hour: s, minute: o });
}
function NT(e, t) {
  let r = OT(e);
  if (r.length === 0) throw new Error("\u6BCF\u9031\u6392\u7A0B\u683C\u5F0F\u4E0D\u6B63\u78BA");
  return Gl(r, e, t);
}
function GT(e, t) {
  let r = new Date(e.run_at);
  if (Number.isNaN(r.getTime()))
    throw new Error("\u55AE\u6B21\u6392\u7A0B\u683C\u5F0F\u4E0D\u6B63\u78BA");
  if (r.getTime() <= t.getTime())
    throw new Error("\u55AE\u6B21\u6392\u7A0B\u6642\u9593\u5FC5\u9808\u665A\u65BC\u73FE\u5728");
  return r;
}
function ef(e, t) {
  let r = Ws(e.minutes);
  if (!Number.isInteger(r) || r <= 0 || r > 1440)
    throw new Error("\u56FA\u5B9A\u9593\u9694\u6392\u7A0B\u683C\u5F0F\u4E0D\u6B63\u78BA");
  return tf(t, r);
}
function Ti(e, t, r, n = !1) {
  let s = Number.parseInt(e, 10);
  if (!Number.isInteger(s)) throw new Error(`\u7121\u6548\u7684 cron \u6B04\u4F4D\u503C\uFF1A${e}`);
  if (n && s === 7) return 0;
  if (s < t || s > r) throw new Error(`cron \u6B04\u4F4D\u8D85\u51FA\u7BC4\u570D\uFF1A${e}`);
  return s;
}
function js(e, t, r, n = !1) {
  let s = String(e ?? "").trim();
  if (!s) throw new Error("cron \u6B04\u4F4D\u4E0D\u53EF\u70BA\u7A7A");
  let o = new Set(),
    i = (a, l, c = 1) => {
      if (c <= 0) throw new Error(`\u7121\u6548\u7684 cron step\uFF1A${e}`);
      if (a > l) throw new Error(`\u7121\u6548\u7684 cron \u7BC4\u570D\uFF1A${e}`);
      for (let d = a; d <= l; d += c) o.add(d);
    };
  for (let a of s.split(",")) {
    let l = a.trim();
    if (!l) continue;
    let c = l.split("/")[0],
      d = l.split("/")[1],
      m = d ? Ti(d, 1, r - t + 1) : 1;
    if (c === "*") {
      i(t, r, m);
      continue;
    }
    if (c.includes("-")) {
      let [y, _] = c.split("-"),
        I = Ti(y, t, r, n),
        P = Ti(_, t, r, n);
      i(I, P, m);
      continue;
    }
    let w = Ti(c, t, r, n);
    d ? i(w, r, m) : o.add(w);
  }
  return [...o].sort((a, l) => a - l);
}
function FT(e, t, r) {
  let n = js(e, 1, 31).includes(r.day),
    s = js(t, 0, 6, !0).includes(r.weekday),
    o = e !== "*",
    i = t !== "*";
  return !o && !i ? !0 : o && i ? n || s : o ? n : s;
}
function $T(e, t) {
  let r = typeof e.expression == "string" ? e.expression.trim() : "",
    n = r.split(/\s+/);
  if (n.length !== 5) throw new Error("cron \u6392\u7A0B\u683C\u5F0F\u4E0D\u6B63\u78BA");
  let [s, o, i, a, l] = n,
    c = js(s, 0, 59),
    d = js(o, 0, 23),
    m = js(a, 1, 12),
    w = new Date(t.getTime() + 60 * 1e3);
  w.setUTCSeconds(0, 0);
  let y = jn(w);
  for (let _ = 0; _ < 366 * 5; _ += 1) {
    let I = _ === 0 ? y : ki(y, _);
    if (m.includes(I.month) && FT(i, l, I))
      for (let P of d)
        for (let S of c) {
          let U = Cr({ year: I.year, month: I.month, day: I.day, hour: P, minute: S });
          if (U.getTime() > t.getTime()) return U;
        }
  }
  throw new Error(`\u7121\u6CD5\u8A08\u7B97 cron \u4E0B\u6B21\u57F7\u884C\u6642\u9593\uFF1A${r}`);
}
function LT(e) {
  if (!e) return {};
  if (typeof e == "string")
    try {
      let t = JSON.parse(e);
      return t && typeof t == "object" ? t : {};
    } catch {
      return {};
    }
  return e;
}
function Wn({ ruleType: e, rulePayload: t, now: r = new Date() }) {
  let n = LT(t);
  if (/^every_\d+_minutes$/.test(e)) {
    let s = Number.parseInt(e.match(/^every_(\d+)_minutes$/)?.[1] ?? "", 10);
    return ef({ minutes: s }, r).toISOString();
  }
  switch (e) {
    case "interval":
      return ef(n, r).toISOString();
    case "cron":
      return $T(n, r).toISOString();
    case "minutely":
      return PT(n, r).toISOString();
    case "daily":
      return xT(n, r).toISOString();
    case "hourly":
      return MT(n, r).toISOString();
    case "weekly":
      return NT(n, r).toISOString();
    case "weekday":
      return Gl([1, 2, 3, 4, 5], n, r).toISOString();
    case "weekenday":
      return Gl([0, 6], n, r).toISOString();
    case "once":
      return GT(n, r).toISOString();
    default:
      throw new Error(`\u4E0D\u652F\u63F4\u7684\u6392\u7A0B\u985E\u578B\uFF1A${e}`);
  }
}
var Dl =
    "\u6211\u9019\u6B21\u6C92\u770B\u61C2\u9019\u500B\u6392\u7A0B\u6642\u9593\uFF0C\u8ACB\u63DB\u4E00\u7A2E\u66F4\u6E05\u695A\u7684\u8AAA\u6CD5\u3002",
  nf =
    "\u6211\u73FE\u5728\u66AB\u6642\u6C92\u8FA6\u6CD5\u5224\u65B7\u9019\u500B\u6392\u7A0B\u6642\u9593\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u63DB\u4E00\u7A2E\u66F4\u6E05\u695A\u7684\u8AAA\u6CD5\u3002",
  sf =
    "\u6211\u6709\u9EDE\u4E0D\u78BA\u5B9A\u4F60\u6307\u7684\u662F\u54EA\u4E00\u7A2E\u6392\u7A0B\u6642\u9593\uFF0C\u8ACB\u76F4\u63A5\u7528\u5B8C\u6574\u53E5\u5B50\u518D\u8AAA\u4E00\u6B21\u3002",
  DT = new Set(["once", "interval", "cron"]),
  of =
    /workers ai|workflow inputs|json|response_format|parser|cron|stack|exception|timeout|service/i,
  Ll = 2,
  UT = 1e3;
function sn(e = Dl) {
  return { status: "unknown", message: e };
}
function BT(e) {
  return [
    "You are a schedule parser.",
    "Convert the user's natural-language schedule into exactly one JSON object.",
    "Output JSON only. No prose, no markdown.",
    "",
    "Allowed resolved rule types (rulePayload shape):",
    '- once -> rulePayload: {"run_at":"ISO8601 with timezone, e.g. 2026-04-08T10:00:00+08:00 or 2026-04-08T02:00:00.000Z"}',
    '- interval -> rulePayload: {"minutes":N} for "every N minutes" only',
    '- cron -> rulePayload: {"expression":"M H D Mo W"} for all other recurring schedules',
    "",
    "Rules:",
    "- Prefer cron for recurring schedules.",
    "- Do not invent additional rule types.",
    '- Use timezone "Asia/Taipei" for resolved results.',
    "- Interpret 24:00 as next-day 00:00.",
    "- If a recurring schedule has multiple times and one cron can express it, combine them into one cron.",
    '- If the input is ambiguous, return status "ambiguous" with a short Traditional Chinese message and Traditional Chinese candidate rewrites.',
    '- If the input cannot be represented as one canonical rule, return status "unknown" with a short Traditional Chinese message.',
    "",
    "Examples:",
    '{"status":"resolved","ruleType":"once","rulePayload":{"run_at":"2026-04-08T10:00:00.000Z"},"timezone":"Asia/Taipei"}',
    '{"status":"resolved","ruleType":"interval","rulePayload":{"minutes":5},"timezone":"Asia/Taipei"}',
    '{"status":"resolved","ruleType":"cron","rulePayload":{"expression":"0 12 * * *"},"timezone":"Asia/Taipei"}',
    '{"status":"resolved","ruleType":"cron","rulePayload":{"expression":"0 0,9,12,15,18,21 * * *"},"timezone":"Asia/Taipei"}',
    '{"status":"ambiguous","message":"\u6211\u6709\u9EDE\u4E0D\u78BA\u5B9A\u4F60\u7684\u610F\u601D\uFF0C\u8ACB\u518D\u8AAA\u6E05\u695A\u4E00\u9EDE\u3002","candidates":["\u4ECA\u5929\u665A\u4E0A6\u9EDE\u57F7\u884C\u4E00\u6B21","\u6BCF\u5929\u665A\u4E0A6\u9EDE\u57F7\u884C\u4E00\u6B21"]}',
    '{"status":"unknown","message":"\u8ACB\u63DB\u4E00\u7A2E\u66F4\u6E05\u695A\u7684\u8AAA\u6CD5\u91CD\u65B0\u8F38\u5165\u3002"}',
    "",
    `Current time: ${e.toISOString()}`,
  ].join(`
`);
}
function jT(e) {
  let t = typeof e == "string" ? e.trim() : "";
  return t ? (of.test(t) ? Dl : t) : Dl;
}
function WT(e) {
  let t = typeof e == "string" ? e.trim() : "";
  return t ? (of.test(t) ? sf : t) : sf;
}
function qT(e) {
  return Array.isArray(e) ? e.map((t) => String(t).trim()).filter(Boolean) : [];
}
function KT(e, t) {
  let r = t && typeof t == "object" && !Array.isArray(t) ? t : null;
  if (!r) return null;
  if (e === "once") {
    let n = typeof r.run_at == "string" ? r.run_at.trim() : "";
    if (!n) return null;
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(n) && !/[Zz]|[+-]\d{2}/.test(n) && (n = n + "+08:00");
    let s = new Date(n);
    return Number.isNaN(s.getTime()) ? null : { run_at: s.toISOString() };
  }
  if (e === "interval") {
    let n = Number(r.minutes);
    return Number.isInteger(n) ? { minutes: n } : null;
  }
  if (e === "cron") {
    let n = typeof r.expression == "string" ? r.expression.trim().replace(/\s+/g, " ") : "";
    return n ? { expression: n } : null;
  }
  return null;
}
function HT(e, t) {
  if (e.status !== "resolved")
    return e.status === "ambiguous"
      ? { status: "ambiguous", message: WT(e.message), candidates: qT(e.candidates) }
      : sn(jT(e.message));
  if (!e.ruleType || !DT.has(e.ruleType)) return sn();
  let r = KT(e.ruleType, e.rulePayload);
  if (!r) return sn();
  try {
    let n = Wn({ ruleType: e.ruleType, rulePayload: r, now: t });
    return { status: "resolved", ruleType: e.ruleType, rulePayload: r, timezone: Fl, nextRunAt: n };
  } catch (n) {
    let s = n instanceof Error ? n.message : String(n);
    return /已过|晚于现在/.test(s)
      ? sn(
          "\u9019\u500B\u6642\u9593\u5DF2\u7D93\u904E\u4E86\uFF0C\u8ACB\u6539\u6210\u672A\u4F86\u7684\u6642\u9593\u3002",
        )
      : (console.warn("[\u6392\u7A0B] \u9A57\u8B49 AI \u6392\u7A0B\u7D50\u679C\u5931\u6557", {
          ruleType: e.ruleType,
          rulePayload: r,
          detail: s,
        }),
        sn());
  }
}
function zT(e) {
  return new Promise((t) => setTimeout(t, e));
}
async function Ul(e, t) {
  let r = t.scheduleTimeUnderstanding.ai,
    n = t.scheduleTimeUnderstanding.model;
  if (!r) {
    let i = e.trim().match(/每\s*(\d+)\s*分/);
    if (i) {
      let a = Number.parseInt(i[1], 10);
      if (a > 0 && a <= 1440) {
        let l = new Date(t.now.getTime() + a * 60 * 1e3).toISOString();
        return {
          status: "resolved",
          ruleType: "interval",
          rulePayload: { minutes: a },
          timezone: Fl,
          nextRunAt: l,
        };
      }
    }
    return (
      console.error(
        "[\u6392\u7A0B] \u7F3A\u5C11 AI \u7D81\u5B9A\uFF0C\u7121\u6CD5\u89E3\u6790\u81EA\u7136\u8A9E\u8A00\u6392\u7A0B\u6642\u9593",
      ),
      sn(nf)
    );
  }
  let s;
  for (let i = 1; i <= Ll; i++)
    try {
      let a = await r.run(n, {
          messages: [
            { role: "system", content: BT(t.now) },
            { role: "user", content: e },
          ],
          response_format: { type: "json_object" },
          max_tokens: 512,
          temperature: 0,
        }),
        l = ni(a),
        c = si(l);
      return HT(c, t.now);
    } catch (a) {
      s = a;
      let l = a instanceof Error ? a.message : String(a);
      (console.error(
        `[\u6392\u7A0B] AI \u6642\u9593\u89E3\u6790\u5931\u6557 (attempt ${i}/${Ll})`,
        l,
      ),
        i < Ll && (await zT(UT)));
    }
  let o = s instanceof Error ? s.message : String(s);
  return (
    console.error("[\u6392\u7A0B] AI \u6642\u9593\u89E3\u6790\u6700\u7D42\u5931\u6557", o),
    sn(nf)
  );
}
var qs = 4,
  Ks = 2,
  QT = new Set(["\u7565\u904E", "skip"]),
  Bl = [
    "\u4ECA\u5929\u665A\u4E0A6\u9EDE",
    "\u660E\u5929\u65E9\u4E0A8\u9EDE",
    "\u6BCF 5 \u5206\u9418",
    "\u6BCF\u5C0F\u6642\u6574\u9EDE",
    "\u6BCF\u5929\u4E2D\u534812\u9EDE",
    "\u6BCF\u9031\u4E00\u4E0B\u53482\u9EDE",
    "\u6BCF\u500B\u5DE5\u4F5C\u65E5\u4E0B\u53482\u9EDE",
    "\u6BCF\u500B\u5047\u65E5\u65E9\u4E0A9\u9EDE",
    "\u6BCF\u5929 9:00\u300112:00\u300118:00 \u57F7\u884C",
  ].join("\u3001");
function jl(e, t) {
  return `(${e}/${t})`;
}
function qn(e, t, r, n) {
  return [`${e} ${jl(t, r)} ${n[0]}`, ...n.slice(1)].join(`
`);
}
function af(e) {
  return e === "edit_prompt" ? { step: 1, total: Ks } : { step: 1, total: qs };
}
function Wl(e) {
  return e === "edit_time" ? { step: 1, total: Ks } : { step: 2, total: qs };
}
function VT(e) {
  return e === "edit_payload" ? { step: 1, total: Ks } : { step: 3, total: qs };
}
function JT() {
  let { step: e, total: t } = Wl("create");
  return qn("\u23F0", e, t, [
    "\u6536\u5230\uFF01\u4F60\u5E0C\u671B\u5728\u4EC0\u9EBC\u6642\u5019\u57F7\u884C\uFF1F",
    "",
    `\u4F8B\u5982\uFF1A${Bl}`,
  ]);
}
function YT() {
  let { step: e, total: t } = VT("create");
  return qn("\u{1F4E6}", e, t, [
    "\u8ACB\u8A2D\u5B9A\u6392\u7A0B\u7684 Payload \u8CC7\u6599\uFF1F(\u53EF\u9078)",
    "",
    "\u76F4\u63A5\u8F38\u5165 Payload \u5167\u5BB9\uFF0C\u6216\u9EDE\u9078\u300C\u7565\u904E\u300D\u8DF3\u904E\u6B64\u6B65\u9A5F\u3002",
    "\u82E5\u8F38\u5165\u7684\u662F JSON object\uFF0C\u6392\u7A0B\u89F8\u767C\u6642\u6703\u4FDD\u7559\u539F\u59CB event_data\uFF0C\u4E26\u984D\u5916\u5C55\u958B\u6210 workflow inputs\u3002",
  ]);
}
function XT(e) {
  let t = It(e);
  return t === "" || QT.has(t.toLowerCase());
}
function lf(e) {
  let t = It(e);
  return t === "" || XT(t) ? null : t;
}
function ZT(e, t) {
  let r = t === "\u5EFA\u7ACB" ? jl(qs, qs) : jl(Ks, Ks),
    n = [
      ["\u{1F194}", "\u6392\u7A0BID", e.id],
      ["\u{1F4CB}", "\u6392\u7A0B\u985E\u578B", cs(e)],
      ["\u{1F5D3}\uFE0F", "\u6392\u7A0B\u6642\u9593", br(e)],
      ["\u23ED\uFE0F", "\u4E0B\u6B21\u57F7\u884C\u6642\u9593", Bt(e.nextRunAt)],
      ["\u{1F4DD}", "\u7D66\u5C0F\u9F8D\u8766\u7684\u63D0\u793A\u8A5E", e.prompt],
      ["\u{1F4E6}", "Payload \u8CC7\u6599", Ln(e.eventData)],
    ];
  return [
    `\u2705 ${r} \u5DF2${t}\u6392\u7A0B`,
    "",
    ...n.flatMap(([s, o, i], a) => [`${s} ${o}`, i, ...(a === n.length - 1 ? [] : [""])]),
  ].join(`
`);
}
async function on(e, t, r) {
  let { store: n, octokit: s, config: o } = e.services,
    i = e.chat?.id;
  if (i) {
    await Ye(n, i);
    try {
      await s.rest.issues.createComment({
        owner: o.github.owner,
        repo: o.github.repo,
        issue_number: t.issueNumber,
        body: `<!-- telegram-meta: {"source":"schedule-flow","schedule_id":"${t.id}","action":"${r === "\u5EFA\u7ACB" ? "created" : "updated"}"} -->
\u{1F5D3}\uFE0F \u5DF2${r}\u6392\u7A0B\u8A2D\u5B9A\u7D00\u9304

\u{1F194} ${t.id}
\u{1F4DD} ${t.prompt}
\u{1F4E6} ${Ln(t.eventData)}`,
      });
    } catch (a) {
      console.warn("[\u6392\u7A0B] \u5EFA\u7ACB issue comment \u5931\u6557", a);
    }
    (await e.reply(ZT(t, r)), await Es(e, t.issueNumber, "schedule_configuration"));
  }
}
async function uf(e, t, r, n, s) {
  let { store: o, d1: i, config: a } = e.services,
    l = e.chat?.id;
  if (!l) return;
  if (n.status === "resolved") {
    if (s === "create") {
      (await Hr(o, l, {
        ...t,
        step: "awaiting_payload",
        ruleType: n.ruleType ?? "unknown",
        rulePayload: n.rulePayload ?? {},
        timezone: n.timezone ?? "Asia/Taipei",
        nextRunAt: n.nextRunAt ?? new Date().toISOString(),
      }),
        await e.reply(YT(), { reply_markup: Bo() }));
      return;
    }
    if (t.scheduleId) {
      let m = await gt(i, t.scheduleId);
      if (!m) {
        (await Ye(o, l),
          await e.reply(
            "\u26A0\uFE0F \u627E\u4E0D\u5230\u6307\u5B9A\u6392\u7A0B\uFF0C\u8ACB\u91CD\u65B0\u958B\u555F\u7BA1\u7406\u6392\u7A0B\u3002",
          ));
        return;
      }
      let w = await jt(
        i,
        t.scheduleId,
        {
          ruleType: n.ruleType ?? "unknown",
          rulePayload: n.rulePayload ?? {},
          timezone: n.timezone ?? "Asia/Taipei",
          nextRunAt: n.nextRunAt ?? new Date().toISOString(),
          status: m.status === "paused" ? "paused" : "active",
        },
        { now: new Date() },
      );
      if (!w) {
        (await Ye(o, l),
          await e.reply(
            "\u26A0\uFE0F \u627E\u4E0D\u5230\u6307\u5B9A\u6392\u7A0B\uFF0C\u8ACB\u91CD\u65B0\u958B\u555F\u7BA1\u7406\u6392\u7A0B\u3002",
          ));
        return;
      }
      await on(e, w, "\u66F4\u65B0");
    }
    return;
  }
  if (n.status === "ambiguous") {
    let m = {
      ...t,
      step: s === "edit_time" ? "awaiting_edit_time" : "awaiting_time",
      clarificationFor: s,
      clarificationContext: {
        previousInput: It(r),
        message: n.message ?? "",
        candidates: n.candidates ?? [],
      },
    };
    await Hr(o, l, m);
    let { step: w, total: y } = Wl(s),
      _ =
        n.candidates && n.candidates.length > 0
          ? `\u4F8B\u5982\uFF1A${n.candidates.join("\u3001")}`
          : `\u4F8B\u5982\uFF1A${Bl}`;
    await e.reply(
      qn("\u2753", w, y, [
        n.message ||
          "\u8ACB\u518D\u8AAA\u660E\u4E00\u6B21\u4F60\u8981\u7684\u6392\u7A0B\u6642\u9593\u3002",
        "",
        `\u8ACB\u76F4\u63A5\u56DE\u8986\u5B8C\u6574\u6642\u9593\u6558\u8FF0\uFF0C${_}`,
      ]),
      { reply_markup: tr() },
    );
    return;
  }
  let { step: c, total: d } = Wl(s);
  await e.reply(
    qn("\u26A0\uFE0F", c, d, [
      n.message || "\u6211\u9019\u6B21\u6C92\u770B\u61C2\u9019\u500B\u6392\u7A0B\u6642\u9593\u3002",
      "",
      `\u8ACB\u63DB\u4E00\u7A2E\u66F4\u6E05\u695A\u7684\u8AAA\u6CD5\u91CD\u65B0\u8F38\u5165\uFF0C\u4F8B\u5982\uFF1A${Bl}`,
    ]),
    { reply_markup: tr() },
  );
}
async function ql(e) {
  let { store: t, d1: r, config: n } = e.services,
    s = e.chat?.id;
  if (!s) return !1;
  let o = (e.message?.text ?? "").trim(),
    i = await sr(t, s);
  if (!i) return !1;
  if (
    (console.log("[\u6392\u7A0B flow] handling input", {
      chatId: s,
      step: i.step,
      text: o.substring(0, 50),
    }),
    i.step === "awaiting_prompt")
  ) {
    let a = It(o);
    if (!a) {
      let { step: l, total: c } = af("create");
      return (
        await e.reply(
          qn("\u26A0\uFE0F", l, c, [
            "\u6392\u7A0B\u4EFB\u52D9\u4E0D\u80FD\u7559\u767D\uFF0C\u8ACB\u76F4\u63A5\u8F38\u5165\u60F3\u8B93\u5C0F\u9F8D\u8766\u57F7\u884C\u7684\u4EFB\u52D9\u5167\u5BB9\uFF08\u7D66\u5C0F\u9F8D\u8766\u7684\u63D0\u793A\u8A5E\uFF09\u3002",
          ]),
          { reply_markup: tr() },
        ),
        !0
      );
    }
    return (
      await Hr(t, s, { ...i, step: "awaiting_time", prompt: a }),
      await e.reply(JT(), { reply_markup: tr() }),
      !0
    );
  }
  if (i.step === "awaiting_time") {
    let a = await Ul(o, {
      now: new Date(),
      scheduleTimeUnderstanding: n.scheduleTimeUnderstanding,
    });
    return (await uf(e, i, o, a, "create"), !0);
  }
  if (i.step === "awaiting_payload") {
    if (!i.prompt || !i.ruleType || !i.rulePayload || !i.timezone || !i.nextRunAt)
      return (
        await Ye(t, s),
        await e.reply(
          "\u26A0\uFE0F \u6392\u7A0B\u8A2D\u5B9A\u72C0\u614B\u907A\u5931\uFF0C\u8ACB\u91CD\u65B0\u8A2D\u5B9A\u6392\u7A0B\u3002",
        ),
        !0
      );
    let a = await Xo(r, {
      id: fs(),
      repo: n.github.repoFullName,
      issueNumber: i.issueNumber,
      chatId: s,
      prompt: i.prompt,
      eventData: lf(o),
      ruleType: i.ruleType,
      rulePayload: i.rulePayload,
      timezone: i.timezone,
      nextRunAt: i.nextRunAt,
      shouldNotify: !0,
    });
    return a
      ? (await on(e, a, "\u5EFA\u7ACB"), !0)
      : (await Ye(t, s),
        await e.reply(
          "\u274C \u5EFA\u7ACB\u6392\u7A0B\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",
        ),
        !0);
  }
  if (i.step === "awaiting_edit_prompt") {
    let a = It(o);
    if (!a) {
      let { step: c, total: d } = af("edit_prompt");
      return (
        await e.reply(
          qn("\u26A0\uFE0F", c, d, [
            "\u6392\u7A0B\u4EFB\u52D9\u4E0D\u80FD\u7559\u767D\uFF0C\u8ACB\u91CD\u65B0\u8F38\u5165\u65B0\u7684\u4EFB\u52D9\u5167\u5BB9\uFF08\u7D66\u5C0F\u9F8D\u8766\u7684\u63D0\u793A\u8A5E\uFF09\u3002",
          ]),
          { reply_markup: tr() },
        ),
        !0
      );
    }
    if (!i.scheduleId)
      return (
        await Ye(t, s),
        await e.reply(
          "\u26A0\uFE0F \u627E\u4E0D\u5230\u6307\u5B9A\u6392\u7A0B\uFF0C\u8ACB\u91CD\u65B0\u958B\u555F\u7BA1\u7406\u6392\u7A0B\u3002",
        ),
        !0
      );
    let l = await jt(r, i.scheduleId, { prompt: a }, { now: new Date() });
    return l
      ? (await on(e, l, "\u66F4\u65B0"), !0)
      : (await Ye(t, s),
        await e.reply(
          "\u26A0\uFE0F \u627E\u4E0D\u5230\u6307\u5B9A\u6392\u7A0B\uFF0C\u8ACB\u91CD\u65B0\u958B\u555F\u7BA1\u7406\u6392\u7A0B\u3002",
        ),
        !0);
  }
  if (i.step === "awaiting_edit_time") {
    let a = await Ul(o, {
      now: new Date(),
      scheduleTimeUnderstanding: n.scheduleTimeUnderstanding,
    });
    return (await uf(e, i, o, a, "edit_time"), !0);
  }
  if (i.step === "awaiting_edit_payload") {
    if (!i.scheduleId)
      return (
        await Ye(t, s),
        await e.reply(
          "\u26A0\uFE0F \u627E\u4E0D\u5230\u6307\u5B9A\u6392\u7A0B\uFF0C\u8ACB\u91CD\u65B0\u958B\u555F\u7BA1\u7406\u6392\u7A0B\u3002",
        ),
        !0
      );
    let a = await jt(r, i.scheduleId, { eventData: lf(o) }, { now: new Date() });
    return a
      ? (await on(e, a, "\u66F4\u65B0"), !0)
      : (await Ye(t, s),
        await e.reply(
          "\u26A0\uFE0F \u627E\u4E0D\u5230\u6307\u5B9A\u6392\u7A0B\uFF0C\u8ACB\u91CD\u65B0\u958B\u555F\u7BA1\u7406\u6392\u7A0B\u3002",
        ),
        !0);
  }
  return (console.warn("[\u6392\u7A0B flow] unknown step", { step: i.step }), !1);
}
var Kl = new se();
Kl.command("schedules", async (e) => {
  let { octokit: t, d1: r, config: n } = e.services,
    { owner: s, repo: o, repoFullName: i } = n.github,
    a = e.chat?.id;
  if (a)
    try {
      let l = await Un(r, t, s, o, i, a);
      await e.reply(Dn(l), { reply_markup: Bn(l) });
    } catch (l) {
      (console.error("[/schedules] \u57F7\u884C\u5931\u6557", l),
        await e.reply(
          "\u274C \u53D6\u5F97\u6392\u7A0B\u5217\u8868\u6642\u767C\u751F\u932F\u8AA4\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",
        ));
    }
});
Ie();
mt();
ft();
Ve();
Jr();
Ps();
Ss();
li();
xs();
Ps();
ft();
async function V(e) {
  let t = e.callbackQuery?.message?.chat.id;
  return (
    t ||
    (await e.answerCallbackQuery(
      "\u26A0\uFE0F \u6309\u9215\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u64CD\u4F5C",
    ),
    null)
  );
}
function Kt(e) {
  let t = e.split(":")[1];
  if (!t) return null;
  let r = parseInt(t, 10);
  return Number.isInteger(r) && r > 0 ? r : null;
}
function We(e) {
  return e.split(":").slice(1).join(":");
}
async function Ht(e, t, r) {
  return (
    await e.issues.listForRepo({
      owner: t,
      repo: r,
      state: "open",
      per_page: 100,
      sort: "created",
      direction: "desc",
    })
  ).data
    .filter((s) => !s.pull_request)
    .map((s) => ({ number: s.number, title: s.title, body: s.body }));
}
function Ei(e, t) {
  return t ? `\u5C0F\u9F8D\u8766 #${e}\u300C${t}\u300D` : `\u5C0F\u9F8D\u8766 #${e}`;
}
function ur(e) {
  return e.callbackQuery?.message?.message_id;
}
async function Hs(e, t, r) {
  let n = e.callbackQuery?.message?.message_id;
  if (!n) return !1;
  let s = e.callbackQuery?.message?.chat.id;
  if (!s) return !1;
  let o = await cp(e.services.store, s);
  return o?.mode !== t || o.messageId !== n ? (await e.answerCallbackQuery(r), !1) : !0;
}
ms();
var zt = new se();
zt.callbackQuery(/^switch_issue:/, async (e) => {
  let t = await V(e);
  if (
    !t ||
    !(await Hs(
      e,
      "list",
      "\u26A0\uFE0F \u5217\u8868\u9078\u55AE\u5DF2\u5931\u6548\uFF0C\u8ACB\u91CD\u65B0\u57F7\u884C /list\u3002",
    ))
  )
    return;
  let r = Kt(e.callbackQuery.data);
  if (!r) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u7121\u6548\u7684 Issue \u7DE8\u865F");
    return;
  }
  let { store: n, octokit: s, config: o } = e.services,
    { owner: i, repo: a } = o.github,
    l = (await Ht(s, i, a)).find((c) => c.number === r);
  if (!l) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u9019\u96BB\u5C0F\u9F8D\u8766\u76EE\u524D\u4E0D\u662F\u958B\u555F\u72C0\u614B\uFF0C\u8ACB\u5148 /list \u91CD\u65B0\u78BA\u8A8D\u3002",
    );
    return;
  }
  (await Dt(n, t),
    await rr(n, r, t),
    await e.answerCallbackQuery(),
    await e.reply(`\u{1F99E} \u5DF2\u5207\u63DB\u5230\u300C${l.title}\u300D#${r}`),
    await Es(e, r, "switch_issue"));
});
zt.callbackQuery(/^close_issue_prompt:/, async (e) => {
  if (
    !(await V(e)) ||
    !(await Hs(
      e,
      "close",
      "\u26A0\uFE0F \u95DC\u9589\u9078\u55AE\u5DF2\u5931\u6548\uFF0C\u8ACB\u91CD\u65B0\u57F7\u884C /close\u3002",
    ))
  )
    return;
  let r = Kt(e.callbackQuery.data);
  if (!r) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u9019\u96BB\u5C0F\u9F8D\u8766\u7684\u7DE8\u865F\u602A\u602A\u7684",
    );
    return;
  }
  let { octokit: n, config: s } = e.services,
    o = await Ht(n, s.github.owner, s.github.repo);
  if (o.length <= 1) {
    (await e.answerCallbackQuery(
      "\u{1F99E} \u6700\u5F8C\u4E00\u96BB\u5C0F\u9F8D\u8766\u8981\u5148\u7559\u8457\u5594",
    ),
      await e.editMessageText(
        "\u{1F99E} \u76EE\u524D\u53EA\u5269\u6700\u5F8C\u4E00\u96BB\u5C0F\u9F8D\u8766\u4E86\uFF0C\u6211\u5148\u5E6B\u4F60\u7559\u8457\u7260\uFF0C\u907F\u514D\u6574\u6C60\u90FD\u6536\u5DE5\u5566\u3002",
        { reply_markup: new F() },
      ));
    return;
  }
  let i = o.find((a) => a.number === r);
  if (!i) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u9019\u96BB\u5C0F\u9F8D\u8766\u53EF\u80FD\u5DF2\u7D93\u6536\u5DE5\u4E86\uFF0C\u8ACB\u91CD\u65B0\u4F7F\u7528 /close",
    );
    return;
  }
  (await e.answerCallbackQuery("\u{1F97A} \u6211\u518D\u5E6B\u4F60\u78BA\u8A8D\u4E00\u6B21"),
    await e.editMessageText(
      [
        `\u{1F97A} \u4F60\u771F\u7684\u8981\u95DC\u9589${Ei(i.number, i.title)}\u55CE\uFF1F`,
        "",
        "\u7260\u9019\u4E00\u8DEF\u4E5F\u5F88\u52AA\u529B\uFF0C\u5982\u679C\u53EA\u662F\u60F3\u5148\u653E\u8457\uFF0C\u6211\u5011\u4E5F\u53EF\u4EE5\u665A\u9EDE\u518D\u56DE\u4F86\u7167\u9867\u7260\u3002",
      ].join(`
`),
      { reply_markup: Bd(i.number) },
    ));
});
zt.callbackQuery(/^close_issue_cancel:/, async (e) => {
  if (
    !(await V(e)) ||
    !(await Hs(
      e,
      "close",
      "\u26A0\uFE0F \u95DC\u9589\u9078\u55AE\u5DF2\u5931\u6548\uFF0C\u8ACB\u91CD\u65B0\u57F7\u884C /close\u3002",
    ))
  )
    return;
  let r = Kt(e.callbackQuery.data);
  (await e.answerCallbackQuery("\u{1FAF6} \u597D\uFF0C\u6211\u5148\u8B93\u7260\u7E7C\u7E8C\u6E38"),
    await e.editMessageText(
      r
        ? `\u{1F99E} \u6536\u5230\uFF0C\u5148\u4E0D\u95DC\u5C0F\u9F8D\u8766 #${r}\u3002

\u8B93\u7260\u518D\u6E38\u4E00\u4E0B\uFF0C\u6709\u9700\u8981\u518D\u53EB\u6211\u4F86\u5E6B\u7260\u6536\u5DE5\u3002`
        : "\u{1F99E} \u6536\u5230\uFF0C\u9019\u96BB\u5C0F\u9F8D\u8766\u5148\u4E0D\u95DC\uFF0C\u8B93\u7260\u518D\u6E38\u4E00\u4E0B\u3002",
      { reply_markup: new F() },
    ));
});
zt.callbackQuery(/^close_issue_confirm:/, async (e) => {
  let t = await V(e);
  if (
    !t ||
    !(await Hs(
      e,
      "close",
      "\u26A0\uFE0F \u95DC\u9589\u9078\u55AE\u5DF2\u5931\u6548\uFF0C\u8ACB\u91CD\u65B0\u57F7\u884C /close\u3002",
    ))
  )
    return;
  let r = Kt(e.callbackQuery.data);
  if (!r) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u7121\u6548\u7684 Issue \u7DE8\u865F");
    return;
  }
  let { store: n, octokit: s, d1: o, config: i } = e.services,
    { owner: a, repo: l, repoFullName: c } = i.github,
    d = await Ht(s, a, l);
  if (!d.find((K) => K.number === r)) {
    (await e.answerCallbackQuery(
      "\u26A0\uFE0F \u9019\u96BB\u5C0F\u9F8D\u8766\u53EF\u80FD\u5DF2\u7D93\u6536\u5DE5\u4E86\uFF0C\u8ACB\u91CD\u65B0\u4F7F\u7528 /close",
    ),
      await e.editMessageText(
        "\u{1F99E} \u6211\u525B\u525B\u770B\u4E86\u4E00\u4E0B\uFF0C\u9019\u96BB\u5C0F\u9F8D\u8766\u5DF2\u7D93\u4E0D\u662F\u958B\u555F\u72C0\u614B\u4E86\uFF0C\u91CD\u65B0\u7528 /close \u770B\u770B\u6700\u65B0\u6E05\u55AE\u5427\u3002",
        { reply_markup: new F() },
      ));
    return;
  }
  if (d.length <= 1) {
    (await e.answerCallbackQuery(
      "\u{1F99E} \u6700\u5F8C\u4E00\u96BB\u5C0F\u9F8D\u8766\u8981\u5148\u7559\u8457\u5594",
    ),
      await e.editMessageText(
        "\u{1F99E} \u9019\u662F\u6700\u5F8C\u4E00\u96BB\u9084\u958B\u8457\u7684\u5C0F\u9F8D\u8766\uFF0C\u6211\u5148\u4E0D\u5E6B\u4F60\u95DC\uFF0C\u7559\u4E00\u96BB\u503C\u73ED\u6BD4\u8F03\u5B89\u5FC3\u3002",
        { reply_markup: new F() },
      ));
    return;
  }
  let y = (await s.issues.update({ owner: a, repo: l, issue_number: r, state: "closed" })).data,
    _ = null;
  try {
    _ = await vp(o, c, r);
  } catch {
    _ = null;
  }
  let I = await ym(s, n, a, l, r, t);
  await e.answerCallbackQuery("\u{1FAF6} \u5C0F\u9F8D\u8766\u5B89\u5FC3\u6536\u5DE5\u4E86");
  let P =
      I.changed && I.nextActiveIssueNumber
        ? `\u6211\u5148\u5E6B\u4F60\u628A\u76EE\u524D\u6D3B\u8E8D\u7684\u5C0F\u9F8D\u8766 \u2705 \u5DF2\u5207\u63DB\u5230\u9F8D\u8766 #${I.nextActiveIssueNumber}\uFF0C\u6211\u5011\u7E7C\u7E8C\u7167\u9867\u4E0B\u4E00\u96BB\u3002`
        : I.nextActiveIssueNumber
          ? `\u76EE\u524D\u6D3B\u8E8D\u7684\u5C0F\u9F8D\u8766\u9084\u662F\u9F8D\u8766 #${I.nextActiveIssueNumber}\uFF0C\u6211\u5011\u7E7C\u7E8C\u7167\u9867\u7260\u3002`
          : "\u76EE\u524D\u6C92\u6709\u6D3B\u8E8D\u7684\u5C0F\u9F8D\u8766\u4E86\uFF0C\u5927\u5BB6\u90FD\u53EF\u4EE5\u5148\u5598\u53E3\u6C23\u3002",
    S =
      _ != null && _ > 0
        ? `\u6211\u4E5F\u9806\u624B\u6E05\u6389\u4E86 ${_} \u7B46\u6392\u7A0B\uFF0C\u907F\u514D\u9019\u96BB\u5DF2\u6536\u5DE5\u7684\u5C0F\u9F8D\u8766\u7E7C\u7E8C\u88AB\u53EB\u8D77\u4F86\u4E0A\u73ED\u3002`
        : "\u9019\u96BB\u5C0F\u9F8D\u8766\u6C92\u6709\u7559\u4E0B\u6392\u7A0B\uFF0C\u6240\u4EE5\u4E0D\u7528\u53E6\u5916\u6E05\u7406\u3002",
    U = [`\u{1FAF6} ${Ei(y.number, y.title)}\u5DF2\u7D93\u5B89\u5FC3\u6536\u5DE5\u4E86\u3002`];
  (_ !== null && U.push("", S),
    U.push("", P),
    await e.editMessageText(
      U.join(`
`),
      { reply_markup: new F() },
    ));
});
zt.callbackQuery(/^current_template_reset:/, async (e) => {
  if (!(await V(e))) return;
  let r = Kt(e.callbackQuery.data);
  if (!r) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u7121\u6548\u7684 Issue \u7DE8\u865F");
    return;
  }
  let { octokit: n, config: s } = e.services,
    { owner: o, repo: i } = s.github,
    a = "";
  try {
    a = (await n.issues.get({ owner: o, repo: i, issue_number: r })).data.title || "";
  } catch {}
  let l = [];
  try {
    l = await tn(n, o, i);
  } catch (c) {
    console.warn("[template_reset] \u8B80\u53D6\u7BC4\u672C\u6E05\u55AE\u5931\u6557", {
      error: c instanceof Error ? c.message : String(c),
    });
  }
  (await e.answerCallbackQuery("\u{1F504} \u6E96\u5099\u91CD\u7F6E\u7BC4\u672C"),
    await e.reply(
      [
        `\u{1F504} \u9078\u64C7\u8981\u7528\u4F86\u91CD\u7F6E ${Ei(r, a)} \u7684\u7BC4\u672C\uFF1A`,
        "",
        "\u91CD\u7F6E\u5F8C\u6703\u7528\u9078\u64C7\u7684\u7BC4\u672C\u8986\u84CB\u6389\u76EE\u524D\u7684\u7BC4\u672C\u3002",
      ].join(`
`),
      { reply_markup: Kd(r, l) },
    ));
});
zt.callbackQuery(/^template_reset_select:/, async (e) => {
  if (!(await V(e))) return;
  let r = (e.callbackQuery.data ?? "").split(":"),
    n = parseInt(r[1] ?? "", 10),
    s = r[2] ?? "";
  if (!n || n <= 0 || !s) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u7121\u6548\u7684\u53C3\u6578");
    return;
  }
  let { octokit: o, d1: i, config: a } = e.services,
    { owner: l, repo: c, repoFullName: d } = a.github,
    m = a.personality || "";
  try {
    let w = await Er(o, l, c, s, { personality: m });
    (await ai(
      o,
      l,
      c,
      `issue-${n}`,
      w.map((_) => ({ path: _.path, content: _.content })),
      `chore: \u91CD\u8A2D issue #${n} \u7BC4\u672C\uFF08\u7BC4\u672C\uFF1A${s}\uFF09`,
    ),
      await Sr(o, l, c, n, s));
    let y = await Qr(i, d, n);
    (await Vr(i, { repo: d, issueNumber: n, template: s }),
      await e.answerCallbackQuery("\u2705 \u7BC4\u672C\u91CD\u7F6E\u6210\u529F"),
      await e.editMessageText(
        `\u2705 \u5DF2\u7528\u300C${s}\u300D\u7BC4\u672C\u91CD\u7F6E\u5C0F\u9F8D\u8766 #${n}\u3002`,
        { reply_markup: new F() },
      ),
      await Es(e, n, "template_reset_select"));
  } catch (w) {
    (console.error("[template_reset] \u91CD\u7F6E\u5931\u6557", w),
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u91CD\u7F6E\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66",
      ));
  }
});
zt.callbackQuery(/^template_reset_cancel:/, async (e) => {
  (await e.answerCallbackQuery("\u5DF2\u53D6\u6D88\u91CD\u7F6E\u7BC4\u672C"),
    await e.editMessageText("\u5DF2\u53D6\u6D88\u91CD\u7F6E\u7BC4\u672C\u3002", {
      reply_markup: new F(),
    }));
});
zt.callbackQuery(/^current_edit:/, async (e) => {
  let t = await V(e);
  if (!t) return;
  let r = Kt(e.callbackQuery.data);
  if (!r) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u7121\u6548\u7684 Issue \u7DE8\u865F");
    return;
  }
  let { store: n, octokit: s, config: o } = e.services,
    { owner: i, repo: a } = o.github;
  (await rr(n, r, t), await e.answerCallbackQuery("\u270F\uFE0F \u9032\u5165\u7DE8\u8F2F"));
  let { initEditFlow: l } = await Promise.resolve().then(() => (Fs(), Am));
  await l(e);
});
Ie();
Ve();
Xe();
_s();
ti();
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE Hl] Telegram install/setup flow  —  BUSINESS
// ║ Installer flow UI: awaiting_env, confirm_install, Secret handling, template modelVar validation, MarkdownV2
// ╚══════════════════════════════════════════════════════════════════════════════
var Hl = Ou(df(), 1),
  mf = new Uint32Array([
    4089235720, 1779033703, 2227873595, 3144134277, 4271175723, 1013904242, 1595750129, 2773480762,
    2917565137, 1359893119, 725511199, 2600822924, 4215389547, 528734635, 327033209, 1541459225,
  ]),
  lt = new Uint8Array([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2,
    11, 7, 5, 3, 11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4, 7, 9, 3, 1, 13, 12, 11, 14,
    2, 6, 5, 10, 4, 0, 15, 8, 9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13, 2, 12, 6, 10, 0,
    11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9, 12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11, 13,
    11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10, 6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4,
    10, 5, 10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
  ]),
  B = new Uint32Array(32),
  zs = new Uint32Array(32);
function Rr(e, t, r, n, s, o) {
  let i = e * 2,
    a = t * 2,
    l = r * 2,
    c = n * 2,
    d,
    m,
    w,
    y;
  ((d = B[i] + B[a]),
    (m = B[i + 1] + B[a + 1]),
    d >= 4294967296 && m++,
    (B[i] = d),
    (B[i + 1] = m),
    (d = B[i] + zs[s]),
    (m = B[i + 1] + zs[s + 1]),
    d >= 4294967296 && m++,
    (B[i] = d),
    (B[i + 1] = m),
    (w = B[c] ^ B[i]),
    (y = B[c + 1] ^ B[i + 1]),
    (B[c] = y),
    (B[c + 1] = w),
    (d = B[l] + B[c]),
    (m = B[l + 1] + B[c + 1]),
    d >= 4294967296 && m++,
    (B[l] = d),
    (B[l + 1] = m),
    (w = B[a] ^ B[l]),
    (y = B[a + 1] ^ B[l + 1]),
    (B[a] = (w >>> 24) | (y << 8)),
    (B[a + 1] = (y >>> 24) | (w << 8)),
    (d = B[i] + B[a]),
    (m = B[i + 1] + B[a + 1]),
    d >= 4294967296 && m++,
    (B[i] = d),
    (B[i + 1] = m),
    (d = B[i] + zs[o]),
    (m = B[i + 1] + zs[o + 1]),
    d >= 4294967296 && m++,
    (B[i] = d),
    (B[i + 1] = m),
    (w = B[c] ^ B[i]),
    (y = B[c + 1] ^ B[i + 1]),
    (B[c] = (w >>> 16) | (y << 16)),
    (B[c + 1] = (y >>> 16) | (w << 16)),
    (d = B[l] + B[c]),
    (m = B[l + 1] + B[c + 1]),
    d >= 4294967296 && m++,
    (B[l] = d),
    (B[l + 1] = m),
    (w = B[a] ^ B[l]),
    (y = B[a + 1] ^ B[l + 1]),
    (B[a] = (w << 1) | (y >>> 31)),
    (B[a + 1] = (y << 1) | (w >>> 31)));
}
function pf(e, t) {
  for (let r = 0; r < 16; r++) ((B[r] = e.h[r]), (B[16 + r] = mf[r]));
  ((B[24] = B[24] ^ e.t),
    (B[25] = B[25] ^ ((e.t / 4294967296) | 0)),
    t && ((B[28] = ~B[28]), (B[29] = ~B[29])));
  for (let r = 0; r < 32; r++) {
    let n = r * 4;
    zs[r] = e.b[n] | (e.b[n + 1] << 8) | (e.b[n + 2] << 16) | (e.b[n + 3] << 24);
  }
  for (let r = 0; r < 12; r++) {
    let n = r * 16;
    (Rr(0, 4, 8, 12, lt[n] * 2, lt[n + 1] * 2),
      Rr(1, 5, 9, 13, lt[n + 2] * 2, lt[n + 3] * 2),
      Rr(2, 6, 10, 14, lt[n + 4] * 2, lt[n + 5] * 2),
      Rr(3, 7, 11, 15, lt[n + 6] * 2, lt[n + 7] * 2),
      Rr(0, 5, 10, 15, lt[n + 8] * 2, lt[n + 9] * 2),
      Rr(1, 6, 11, 12, lt[n + 10] * 2, lt[n + 11] * 2),
      Rr(2, 7, 8, 13, lt[n + 12] * 2, lt[n + 13] * 2),
      Rr(3, 4, 9, 14, lt[n + 14] * 2, lt[n + 15] * 2));
  }
  for (let r = 0; r < 16; r++) e.h[r] = e.h[r] ^ B[r] ^ B[16 + r];
}
function ek(e, t) {
  let r = { h: new Uint32Array(mf), b: new Uint8Array(128), c: 0, t: 0, outlen: t };
  r.h[0] = r.h[0] ^ (16842752 ^ t);
  for (let s = 0; s < e.length; s++)
    (r.c === 128 && ((r.t += r.c), pf(r, !1), (r.c = 0)), (r.b[r.c++] = e[s]));
  for (r.t += r.c; r.c < 128;) r.b[r.c++] = 0;
  pf(r, !0);
  let n = new Uint8Array(t);
  for (let s = 0; s < t; s++) n[s] = (r.h[s >> 2] >>> (8 * (s & 3))) & 255;
  return n;
}
function tk(e, t) {
  let r = Hl.default.box.keyPair(),
    n = new Uint8Array(64);
  (n.set(r.publicKey, 0), n.set(t, 32));
  let s = ek(n, 24),
    o = Hl.default.box(e, s, t, r.secretKey),
    i = new Uint8Array(32 + o.length);
  return (i.set(r.publicKey, 0), i.set(o, 32), i);
}
function rk(e) {
  let t = atob(e),
    r = new Uint8Array(t.length);
  for (let n = 0; n < t.length; n++) r[n] = t.charCodeAt(n);
  return r;
}
function nk(e) {
  let t = "";
  for (let r = 0; r < e.length; r++) t += String.fromCharCode(e[r]);
  return btoa(t);
}
async function sk(e, t, r) {
  let n = await e.actions.getRepoPublicKey({ owner: t, repo: r });
  return { key: n.data.key, key_id: n.data.key_id };
}
async function Ii(e, t, r) {
  let n = new Set(),
    s = 1;
  for (;;) {
    let o = await e.actions.listRepoSecrets({ owner: t, repo: r, per_page: 100, page: s });
    for (let i of o.data.secrets)
      typeof i.name == "string" && i.name.trim() !== "" && n.add(i.name.trim().toUpperCase());
    if (o.data.secrets.length < 100) return n;
    s += 1;
  }
}
async function vi(e, t, r, n, s) {
  let { key: o, key_id: i } = await sk(e, t, r),
    a = rk(o),
    l = new TextEncoder().encode(s),
    c = tk(l, a),
    d = nk(c);
  await e.actions.createOrUpdateRepoSecret({
    owner: t,
    repo: r,
    secret_name: n,
    encrypted_value: d,
    key_id: i,
  });
}
Et();
var ff = "telegram-progress:";
function vt(e) {
  return Number.isInteger(e);
}
function zl(e) {
  if (!e || typeof e != "object" || !vt(e.chatId) || !vt(e.progressMessageId)) return null;
  let t = { chatId: e.chatId, progressMessageId: e.progressMessageId };
  return (
    vt(e.requestMessageId) && (t.requestMessageId = e.requestMessageId),
    typeof e.flow == "string" && e.flow.trim() !== "" && (t.flow = e.flow),
    typeof e.status == "string" && e.status.trim() !== "" && (t.status = e.status),
    vt(e.issueNumber) && (t.issueNumber = e.issueNumber),
    vt(e.issueId) && (t.issueId = e.issueId),
    vt(e.commentId) && (t.commentId = e.commentId),
    typeof e.createdAt == "string" && e.createdAt.trim() !== "" && (t.createdAt = e.createdAt),
    typeof e.updatedAt == "string" && e.updatedAt.trim() !== "" && (t.updatedAt = e.updatedAt),
    typeof e.messageKind == "string" &&
      e.messageKind.trim() !== "" &&
      (t.messageKind = e.messageKind),
    typeof e.mediaFileId == "string" &&
      e.mediaFileId.trim() !== "" &&
      (t.mediaFileId = e.mediaFileId),
    t
  );
}
function gf(e, t) {
  return `${ff}request:${e}:${t}`;
}
function hf(e) {
  return `${ff}comment:${e}`;
}
async function wf(e, t) {
  let r = await e.get(t);
  if (typeof r != "string" || r.trim() === "") return null;
  try {
    return zl(JSON.parse(r));
  } catch {
    return null;
  }
}
async function bf(e, t, r) {
  let n = zl(r);
  n && (await e.put(t, JSON.stringify(n)));
}
function Ar(e, t, r = {}) {
  let n = new Date().toISOString();
  return zl({
    chatId: e?.chat?.id,
    progressMessageId: t,
    requestMessageId: e?.message_id,
    flow: r.flow,
    status: r.status || "pending",
    issueNumber: r.issueNumber,
    issueId: r.issueId,
    commentId: r.commentId,
    createdAt: r.createdAt || n,
    updatedAt: r.updatedAt || n,
    messageKind: r.messageKind,
    mediaFileId: r.mediaFileId,
  });
}
async function yf(e, t, r) {
  return !vt(t) || !vt(r) ? null : wf(e, gf(t, r));
}
async function Qt(e, t, r, n) {
  !vt(t) || !vt(r) || (await bf(e, gf(t, r), n));
}
async function _f(e, t) {
  return !vt(t) || t <= 0 ? null : wf(e, hf(t));
}
async function an(e, t, r) {
  !vt(t) || t <= 0 || (await bf(e, hf(t), r));
}
var wt = new se();
function Vt(e) {
  let t = e.issueNumber,
    r = e.issueTitle;
  return r ? `\u{1F99E} ${O(r)} \\#${t}` : `\u{1F99E} \\#${t}`;
}
async function Ct(e, t) {
  try {
    await t();
  } catch (r) {
    (console.error("[skill callback]", r),
      await e.answerCallbackQuery(`\u274C ${r instanceof Error ? r.message : String(r)}`));
  }
}
function ok(e) {
  return e.map((t) => `\\- *${O(t)}*`).join(`
`);
}
async function Ql(e, t, r, n) {
  (await ht(e.services.store, t, {
    ...r,
    step: "awaiting_env",
    requiredEnvs: n,
    currentEnvIndex: 0,
    collectedEnvs: {},
    promptMessageId: ur(e),
  }),
    await e.editMessageText(
      e.t("skills.need_envs", { skillName: r.skillName, envName: n[0], currentIndex: 1, totalLength: n.length }),
      { parse_mode: "MarkdownV2", reply_markup: ls() },
    ));
}
async function Tf(e, t, r) {
  (await ht(e.services.store, t, { ...r, step: "confirm_install" }),
    await e.editMessageText(
      e.t("skills.confirm_install", { skillName: r.skillName, target: Vt(r) }),
      { parse_mode: "MarkdownV2", reply_markup: Wo(r.skillName) },
    ));
}
async function Vl(e, t, r, n) {
  let { store: s, config: o, octokit: i } = e.services,
    a = n.issueNumber,
    l = await Dp(r, o.github),
    c = l.length > 0 ? await Ii(i, o.github.owner, o.github.repo) : new Set(),
    d = l.filter((w) => c.has(w.trim().toUpperCase())),
    m = l.filter((w) => !c.has(w.trim().toUpperCase()));
  d.length > 0
    ? (await ht(s, t, {
        ...n,
        step: "confirm_existing_secret",
        skillName: r,
        requiredEnvs: m,
        existingRequiredEnvs: d,
        currentEnvIndex: 0,
        collectedEnvs: {},
        promptMessageId: ur(e),
      }),
      await e.editMessageText(
        e.t("skills.secret_exists", { skillName: r, existingSecrets: ok(d) }),
        { parse_mode: "MarkdownV2", reply_markup: Yd() },
      ))
    : m.length > 0
      ? await Ql(e, t, { ...n, skillName: r }, m)
      : await Tf(e, t, { ...n, skillName: r, requiredEnvs: [], collectedEnvs: {} });
}
wt.callbackQuery(/^skills_pick:/, async (e) =>
  Ct(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = We(e.callbackQuery.data),
      { store: n, config: s } = e.services,
      o = await at(n, t);
    if (!o) {
      await e.answerCallbackQuery(
        e.t("skills.process_expired"),
      );
      return;
    }
    await e.answerCallbackQuery();
    let i = await ys(s.github, r),
      a = i?.name || r,
      l = i?.description
        ? `\n\n${O(i.description)}`
        : "";
    (Array.isArray(o.installedSkills) ? o.installedSkills : []).includes(r)
      ? (await ht(n, t, { ...o, step: "preview_installed", skillName: r }),
        await e.editMessageText(
          e.t("skills.installed_preview", { skillName: a, description: l, target: Vt(o) }),
          { parse_mode: "MarkdownV2", reply_markup: Wa(r) },
        ))
      : (await ht(n, t, { ...o, step: "preview", skillName: r }),
        await e.editMessageText(
          e.t("skills.preview", { skillName: a, description: l, target: Vt(o) }),
          { parse_mode: "MarkdownV2", reply_markup: Vd(r) },
        ));
  }),
);
wt.callbackQuery(/^skills_preview_confirm:/, async (e) =>
  Ct(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = We(e.callbackQuery.data),
      { store: n, octokit: s, config: o } = e.services,
      { owner: i, repo: a } = o.github,
      l = await at(n, t);
    if (!l) {
      await e.answerCallbackQuery(
        e.t("skills.process_expired"),
      );
      return;
    }
    let d = `issue-${l.issueNumber}`,
      m = `.agents/skills/${r}`;
    if (await Lp(s, i, a, d, m)) {
      (await ht(n, t, { ...l, step: "confirm_overwrite", skillName: r }),
        await e.answerCallbackQuery(),
        await e.editMessageText(
          e.t("skills.confirm_overwrite", { skillName: r, target: Vt(l) }),
          { parse_mode: "MarkdownV2", reply_markup: Jd(r) },
        ));
      return;
    }
    (await e.answerCallbackQuery(), await Vl(e, t, r, l));
  }),
);
wt.callbackQuery(/^skills_preview_back:/, async (e) =>
  Ct(e, async () => {
    let t = await V(e);
    if (!t) return;
    let { store: r, config: n } = e.services,
      s = await at(r, t);
    if (!s) {
      await e.answerCallbackQuery(
        e.t("skills.process_expired"),
      );
      return;
    }
    await ht(r, t, { ...s, step: "selecting", skillName: "" });
    let o = await bs(n.github);
    await e.answerCallbackQuery();
    let i = Array.isArray(s.installedSkills) ? new Set(s.installedSkills) : void 0;
    await e.editMessageText(
      e.t("skills.select_install", { target: Vt(s) }),
      { parse_mode: "MarkdownV2", reply_markup: as(o, 0, i) },
    );
  }),
);
wt.callbackQuery(/^skills_update_from_list:/, async (e) =>
  Ct(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = We(e.callbackQuery.data),
      n = await at(e.services.store, t);
    if (!n) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /skills",
      );
      return;
    }
    (await e.answerCallbackQuery(), await Vl(e, t, r, n));
  }),
);
wt.callbackQuery(/^skills_remove_from_list:/, async (e) =>
  Ct(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = We(e.callbackQuery.data),
      { store: n } = e.services,
      s = await at(n, t);
    if (!s) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /skills",
      );
      return;
    }
    (await ht(n, t, { ...s, step: "remove_confirm_from_list", skillName: r }),
      await e.answerCallbackQuery(),
      await e.editMessageText(
        `\u{1F5D1} \u78BA\u5B9A\u8981\u5F9E ${Vt(s)} \u79FB\u9664\u6280\u80FD\u300C*${O(r)}*\u300D\u55CE\uFF1F

\u79FB\u9664\u5F8C\u8A72\u6280\u80FD\u7684\u6240\u6709\u6A94\u6848\u5C07\u88AB\u522A\u9664\uFF0C\u5982\u9700\u8981\u53EF\u91CD\u65B0\u5B89\u88DD\u3002`,
        { parse_mode: "MarkdownV2", reply_markup: Xd(r) },
      ));
  }),
);
wt.callbackQuery(/^skills_remove_confirm_from_list:/, async (e) =>
  Ct(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = We(e.callbackQuery.data),
      { store: n, octokit: s, config: o } = e.services,
      { owner: i, repo: a } = o.github,
      l = await at(n, t);
    if (!l) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /skills",
      );
      return;
    }
    let c = ur(e);
    if (c) {
      let m = Ar({ chat: { id: t }, message_id: c }, c, {
        flow: "skill-remove",
        status: "running",
        issueNumber: l.issueNumber,
        messageKind: "text",
      });
      m && (await Qt(n, t, c, m));
    }
    let d = crypto.randomUUID();
    (await Gt(e.services.d1, {
      requestId: d,
      repo: o.github.repoFullName,
      workflowName: "remove-skill",
      workflowPath: ".github/workflows/remove-skill.yml",
      title: `\u6280\u80FD\u79FB\u9664: ${r}`,
      channel: "telegram",
      chatId: t,
      messageId: c,
      sourceType: "skill_remove",
      sourceId: r,
      payloadJson: JSON.stringify({ issue_number: l.issueNumber }),
    }),
      await Bp(s, i, a, { skillName: r, issueNumber: l.issueNumber, requestId: d }),
      await hi(n, t),
      await e.answerCallbackQuery("\u23F3 \u79FB\u9664\u4E2D..."),
      await e.editMessageText(
        `\u23F3 \u6280\u80FD *${O(r)}* \u6B63\u5728\u5F9E ${Vt(l)} \u79FB\u9664\uFF0C\u5B8C\u6210\u5F8C\u6703\u901A\u77E5\u4F60`,
        { parse_mode: "MarkdownV2", reply_markup: new F() },
      ));
  }),
);
wt.callbackQuery(/^skills_remove_back:/, async (e) =>
  Ct(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = We(e.callbackQuery.data),
      { store: n, config: s } = e.services,
      o = await at(n, t);
    if (!o) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /skills",
      );
      return;
    }
    (await ht(n, t, { ...o, step: "preview_installed", skillName: r }),
      await e.answerCallbackQuery());
    let i = await ys(s.github, r),
      a = i?.name || r,
      l = i?.description
        ? `

${O(i.description)}`
        : "";
    await e.editMessageText(
      `\u{1F4E6} *${O(a)}* \u2705 \\(\u5DF2\u5B89\u88DD\\)${l}

\u6B64\u6280\u80FD\u5DF2\u5B89\u88DD\u65BC ${Vt(o)}\uFF0C\u8ACB\u9078\u64C7\u64CD\u4F5C\uFF1A`,
      { parse_mode: "MarkdownV2", reply_markup: Wa(r) },
    );
  }),
);
wt.callbackQuery(/^skills_existing_secret:/, async (e) =>
  Ct(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = We(e.callbackQuery.data),
      n = await at(e.services.store, t);
    if (!n || n.step !== "confirm_existing_secret") {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /skills",
      );
      return;
    }
    let s = Array.isArray(n.existingRequiredEnvs)
        ? n.existingRequiredEnvs.filter((i) => typeof i == "string" && i.trim() !== "")
        : [],
      o = Array.isArray(n.requiredEnvs)
        ? n.requiredEnvs.filter((i) => typeof i == "string" && i.trim() !== "")
        : [];
    if ((await e.answerCallbackQuery(), r === "modify")) {
      await Ql(e, t, { ...n, collectedEnvs: {} }, [...s, ...o]);
      return;
    }
    if (r === "reuse") {
      if (o.length > 0) {
        await Ql(e, t, { ...n, collectedEnvs: {} }, o);
        return;
      }
      await Tf(e, t, { ...n, requiredEnvs: [], collectedEnvs: {} });
      return;
    }
    throw new Error(`\u672A\u77E5\u7684 Secret \u8655\u7406\u52D5\u4F5C\uFF1A${r}`);
  }),
);
wt.callbackQuery(/^skills_overwrite:/, async (e) =>
  Ct(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = We(e.callbackQuery.data),
      n = await at(e.services.store, t);
    if (!n) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /skills",
      );
      return;
    }
    (await e.answerCallbackQuery(), await Vl(e, t, r, n));
  }),
);
wt.callbackQuery(/^skills_confirm:/, async (e) =>
  Ct(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = We(e.callbackQuery.data),
      { store: n, octokit: s, config: o } = e.services,
      { owner: i, repo: a } = o.github,
      l = await at(n, t);
    if (!l) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /skills",
      );
      return;
    }
    let c = l.collectedEnvs ?? {};
    for (let [w, y] of Object.entries(c)) {
      let _ = w.trim().toUpperCase(),
        I = y.trim();
      if (!_ || !I) throw new Error(`\u7F3A\u5C11\u6709\u6548\u7684 Secret \u503C\uFF1A${w}`);
      await vi(s, i, a, _, I);
    }
    let d = ur(e);
    if (d) {
      let w = Ar({ chat: { id: t }, message_id: d }, d, {
        flow: "skill-install",
        status: "running",
        issueNumber: l.issueNumber,
        messageKind: "text",
      });
      w && (await Qt(n, t, d, w));
    }
    let m = crypto.randomUUID();
    (await Gt(e.services.d1, {
      requestId: m,
      repo: o.github.repoFullName,
      workflowName: "skills",
      workflowPath: ".github/workflows/skills.yml",
      title: `\u6280\u80FD\u5B89\u88DD: ${r}`,
      channel: "telegram",
      chatId: t,
      messageId: d,
      sourceType: "skill_install",
      sourceId: r,
      payloadJson: JSON.stringify({ issue_number: l.issueNumber }),
    }),
      await Up(s, i, a, { skillName: r, issueNumber: l.issueNumber, requestId: m }),
      await hi(n, t),
      await e.answerCallbackQuery("\u23F3 \u5B89\u88DD\u4E2D..."),
      await e.editMessageText(
        `\u23F3 \u6280\u80FD *${O(r)}* \u6B63\u5728\u5B89\u88DD\u5230 ${Vt(l)}\uFF0C\u5B8C\u6210\u5F8C\u6703\u901A\u77E5\u4F60`,
        { parse_mode: "MarkdownV2", reply_markup: new F() },
      ));
  }),
);
wt.callbackQuery(/^skills_cancel:/, async (e) =>
  Ct(e, async () => {
    let t = await V(e);
    t &&
      (await hi(e.services.store, t),
      await e.answerCallbackQuery("\u5DF2\u53D6\u6D88"),
      await e.editMessageText("\u274C \u5DF2\u53D6\u6D88\u6280\u80FD\u5B89\u88DD", {
        reply_markup: new F(),
      }));
  }),
);
wt.callbackQuery(/^skills_page:/, async (e) =>
  Ct(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = parseInt(We(e.callbackQuery.data), 10) || 0,
      { store: n, config: s } = e.services,
      o = await at(n, t);
    if (!o) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /skills",
      );
      return;
    }
    let i = await bs(s.github);
    await e.answerCallbackQuery();
    let a = Array.isArray(o.installedSkills) ? new Set(o.installedSkills) : void 0;
    await e.editMessageText(
      `\u{1F6E0} \u9078\u64C7\u8981\u5B89\u88DD\u7684\u6280\u80FD\u5230 ${Vt(o)}`,
      { parse_mode: "MarkdownV2", reply_markup: as(i, r, a) },
    );
  }),
);
Ie();
Ve();
Xe();
Yr();
async function ik(e, t, r) {
  if (r) {
    let s = await ak(r.octokit, r.owner, r.repo, t);
    if (s?.requireEnv) return { requiredEnvs: s.requireEnv };
  }
  return { requiredEnvs: (await rn(e, t))?.requireEnv ?? [] };
}
async function ak(e, t, r, n) {
  try {
    let s = await e.repos.getContent({
      owner: t,
      repo: r,
      path: `templates/${n}/githubclaw.json`,
      ref: "main",
    });
    if (!("content" in s.data) || typeof s.data.content != "string") return null;
    let o = St(s.data.content),
      i = JSON.parse(o);
    return {
      requireEnv: Array.isArray(i.requireEnv)
        ? [
            ...new Set(
              i.requireEnv
                .filter((a) => typeof a == "string" && a.trim() !== "")
                .map((a) => a.trim()),
            ),
          ]
        : void 0,
    };
  } catch {
    return null;
  }
}
async function Jl(e, t, r, n, s, o) {
  let i = await ik(n, s, o);
  if (i.requiredEnvs.length === 0) return { missingEnvs: [], existingEnvs: [], requiredEnvs: [] };
  let a = await Ii(e, t, r),
    l = [],
    c = [];
  for (let d of i.requiredEnvs) a.has(d.toUpperCase()) ? c.push(d) : l.push(d);
  return { missingEnvs: l, existingEnvs: c, requiredEnvs: i.requiredEnvs };
}
async function Ci(e, t, r, n, s) {
  try {
    await e.rest.actions.updateRepoVariable({ owner: t, repo: r, name: n, value: s });
  } catch (o) {
    if ((typeof o == "object" && o && "status" in o ? Number(o.status) : null) !== 404) throw o;
    await e.rest.actions.createRepoVariable({ owner: t, repo: r, name: n, value: s });
  }
}
Et();
var dt = new se();
function kf(e) {
  let t = We(e),
    r = Number.parseInt(t, 10);
  return Number.isInteger(r) && r >= 0 ? r : null;
}
async function _t(e, t) {
  try {
    await t();
  } catch (r) {
    console.error("[template callback]", r);
    let n = `\u274C ${r instanceof Error ? r.message : String(r)}`;
    try {
      e.callbackQuery?.message
        ? await e.editMessageText(n, { reply_markup: new F() })
        : await e.reply(n);
    } catch (s) {
      console.error("[template callback] failed to report error", s);
    }
  }
}
async function Qs(e, t, r) {
  await oe(e.services.store, t, { ...r, step: "confirm_install" });
  let n = r.selectedModel
    ? `
\u6A21\u578B\uFF1A\`${O(r.selectedModel)}\``
    : "";
  await e.editMessageText(
    `\u78BA\u8A8D\u5B89\u88DD\u7BC4\u672C *${O(r.templateName)}* \u5230\u9F8D\u8766\u5821\uFF1F${n}`,
    { parse_mode: "MarkdownV2", reply_markup: qo(r.templateName) },
  );
}
async function Yl(e, t, r) {
  let { store: n, octokit: s, config: o } = e.services,
    i = await Jl(s, o.github.owner, o.github.repo, o.github, r.templateName, {
      octokit: s,
      owner: o.github.owner,
      repo: o.github.repo,
    });
  if (i.requiredEnvs.length === 0) {
    await Qs(e, t, r);
    return;
  }
  let a = i.missingEnvs.length === 0,
    l = i.existingEnvs.length === 0;
  if (a) {
    let c = i.existingEnvs.map((d) => `\u2705 \`${O(d)}\``);
    (await oe(n, t, {
      ...(await be(n, t)),
      ...r,
      step: "env_warning",
      pendingEnvs: i.requiredEnvs,
    }),
      await e.editMessageText(
        `\u2705 \u7BC4\u672C *${O(r.templateName)}* \u9700\u8981\u7684 Secrets \u7686\u5DF2\u8A2D\u5B9A\uFF1A

${c.join(`
`)}

\u8981\u66F4\u63DB\u55CE\uFF1F`,
        { parse_mode: "MarkdownV2", reply_markup: np() },
      ));
  } else if (l) {
    let c = i.missingEnvs.map((d) => `\u{1F539} \`${O(d)}\``);
    (await oe(n, t, { ...(await be(n, t)), ...r, step: "env_warning", pendingEnvs: i.missingEnvs }),
      await e.editMessageText(
        `\u26A0\uFE0F \u7BC4\u672C *${O(r.templateName)}* \u9700\u8981\u4EE5\u4E0B Secrets\uFF1A

${c.join(`
`)}`,
        { parse_mode: "MarkdownV2", reply_markup: rp() },
      ));
  } else {
    let c = [
      ...i.existingEnvs.map((d) => `\u2705 \`${O(d)}\`\uFF08\u5DF2\u8A2D\u5B9A\uFF09`),
      ...i.missingEnvs.map((d) => `\u{1F539} \`${O(d)}\`\uFF08\u7F3A\u5C11\uFF09`),
    ];
    (await oe(n, t, { ...(await be(n, t)), ...r, step: "env_warning", pendingEnvs: i.missingEnvs }),
      await e.editMessageText(
        `\u26A0\uFE0F \u7BC4\u672C *${O(r.templateName)}* \u7684 Secrets \u72C0\u614B\uFF1A

${c.join(`
`)}`,
        { parse_mode: "MarkdownV2", reply_markup: sp() },
      ));
  }
}
dt.callbackQuery(/^templates_pick:/, async (e) =>
  _t(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = kf(e.callbackQuery.data),
      { store: n, config: s } = e.services,
      o = await be(n, t);
    if (!o) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /templates",
      );
      return;
    }
    let i = await On(s.github),
      a = r != null ? (i[r]?.name ?? "") : "";
    if (!a) {
      await e.answerCallbackQuery("\u26A0\uFE0F \u627E\u4E0D\u5230\u8A72\u7BC4\u672C");
      return;
    }
    (await oe(n, t, { ...o, step: "preview", templateName: a }), await e.answerCallbackQuery());
    let l = await Lm(s.github, a),
      c = l?.name || a,
      d = l?.description
        ? `

${or(l.description)}`
        : "";
    await e.editMessageText(
      `\u{1F4E6} *${O(c)}*${d}

\u662F\u5426\u8981\u5B89\u88DD\u6B64\u7BC4\u672C\u5230\u9F8D\u8766\u5821\uFF1F`,
      { parse_mode: "MarkdownV2", reply_markup: Zd(a) },
    );
  }),
);
dt.callbackQuery(/^templates_preview_confirm:/, async (e) =>
  _t(e, async () => {
    let t = await V(e);
    if (!t) return;
    let { store: r, octokit: n, config: s } = e.services,
      o = await be(r, t),
      i = typeof o?.templateName == "string" ? o.templateName.trim() : "";
    if (!o || !i) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /templates",
      );
      return;
    }
    if ((await e.answerCallbackQuery(), await Nn(n, s.github.owner, s.github.repo, i))) {
      (await oe(r, t, { ...o, step: "confirm_overwrite", templateName: i }),
        await e.editMessageText(
          `\u26A0\uFE0F \u7BC4\u672C *${O(i)}* \u5DF2\u5B58\u5728\u65BC\u9F8D\u8766\u5821\uFF0C\u662F\u5426\u8986\u84CB\uFF1F`,
          { parse_mode: "MarkdownV2", reply_markup: ep(i) },
        ));
      return;
    }
    let a = await rn(s.github, i);
    if (a?.needModel) {
      if (!a.modelVar || !a.models?.length)
        throw new Error(`\u7BC4\u672C ${i} \u7F3A\u5C11 modelVar \u6216 models \u8A2D\u5B9A`);
      (await oe(r, t, { ...o, templateName: i, step: "select_model", modelVar: a.modelVar }),
        await e.editMessageText(
          `\u{1F916} \u7BC4\u672C *${O(i)}* \u9700\u8981\u5148\u9078\u64C7\u6A21\u578B`,
          { parse_mode: "MarkdownV2", reply_markup: Da(a.models) },
        ));
      return;
    }
    await Yl(e, t, {
      templateName: i,
      selectedModel: typeof o.selectedModel == "string" ? o.selectedModel : void 0,
      modelVar: typeof o.modelVar == "string" ? o.modelVar : void 0,
    });
  }),
);
dt.callbackQuery(/^templates_preview_back:/, async (e) =>
  _t(e, async () => {
    let t = await V(e);
    if (!t) return;
    let { store: r, config: n } = e.services,
      s = await be(r, t);
    if (!s) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /templates",
      );
      return;
    }
    (await e.answerCallbackQuery(), await oe(r, t, { ...s, step: "selecting", templateName: "" }));
    let o = await On(n.github),
      { octokit: i } = e.services,
      a = await Promise.all(
        o.map(async (c) => {
          let d = await Nn(i, n.github.owner, n.github.repo, c.name);
          return { name: c.name, installed: d };
        }),
      ),
      l = new Set(a.filter((c) => c.installed).map((c) => c.name));
    await e.editMessageText(
      "\u{1F4DA} \u9078\u64C7\u8981\u5B89\u88DD\u5230\u9F8D\u8766\u5821\u7684\u7BC4\u672C",
      { reply_markup: us(o, 0, l) },
    );
  }),
);
dt.callbackQuery(/^templates_overwrite:/, async (e) =>
  _t(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = await be(e.services.store, t),
      n = typeof r?.templateName == "string" ? r.templateName.trim() : "";
    if (!n) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /templates",
      );
      return;
    }
    await e.answerCallbackQuery();
    let s = await rn(e.services.config.github, n);
    if (s?.needModel) {
      if (!s.modelVar || !s.models?.length)
        throw new Error(`\u7BC4\u672C ${n} \u7F3A\u5C11 modelVar \u6216 models \u8A2D\u5B9A`);
      (await oe(e.services.store, t, {
        ...r,
        templateName: n,
        step: "select_model",
        modelVar: s.modelVar,
      }),
        await e.editMessageText(
          `\u{1F916} \u7BC4\u672C *${O(n)}* \u9700\u8981\u5148\u9078\u64C7\u6A21\u578B`,
          { parse_mode: "MarkdownV2", reply_markup: Da(s.models) },
        ));
      return;
    }
    await Yl(e, t, { templateName: n });
  }),
);
dt.callbackQuery(/^templates_model_pick:/, async (e) =>
  _t(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = kf(e.callbackQuery.data);
    if (r == null) {
      await e.answerCallbackQuery("\u26A0\uFE0F \u6A21\u578B\u8CC7\u6599\u683C\u5F0F\u932F\u8AA4");
      return;
    }
    let { store: n, octokit: s, config: o } = e.services,
      i = await be(n, t),
      a = typeof i?.templateName == "string" ? i.templateName.trim() : "";
    if (!i || i.step !== "select_model" || !a) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /templates",
      );
      return;
    }
    let l = await rn(o.github, a),
      c = l?.modelVar || (typeof i.modelVar == "string" ? i.modelVar : ""),
      d = l?.models?.[r],
      m = typeof d?.value == "string" ? d.value.trim() : "";
    if (!c) throw new Error(`\u7BC4\u672C ${a} \u7F3A\u5C11 modelVar \u8A2D\u5B9A`);
    if (!m) {
      await e.answerCallbackQuery("\u26A0\uFE0F \u627E\u4E0D\u5230\u8A72\u6A21\u578B\u9078\u9805");
      return;
    }
    (await e.answerCallbackQuery("\u23F3 \u5132\u5B58\u6A21\u578B\u4E2D..."),
      await Ci(s, o.github.owner, o.github.repo, c, m));
    let w = { templateName: a, selectedModel: m, modelVar: c };
    (await oe(n, t, { ...i, ...w }), await Yl(e, t, w));
  }),
);
dt.callbackQuery(/^templates_confirm:/, async (e) =>
  _t(e, async () => {
    let t = await V(e);
    if (!t) return;
    let { store: r, octokit: n, config: s } = e.services,
      o = await be(r, t),
      i = typeof o?.templateName == "string" ? o.templateName.trim() : "";
    if (!o || !i) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /templates",
      );
      return;
    }
    await e.answerCallbackQuery("\u23F3 \u5B89\u88DD\u4E2D...");
    let a = crypto.randomUUID(),
      l = ur(e);
    (await Gt(e.services.d1, {
      requestId: a,
      repo: s.github.repoFullName,
      workflowName: "templates",
      workflowPath: ".github/workflows/templates.yml",
      title: `\u7BC4\u672C\u5B89\u88DD: ${i}`,
      channel: "telegram",
      chatId: t,
      messageId: l,
      sourceType: "template_sync",
      sourceId: i,
      payloadJson: JSON.stringify({ template_name: i }),
    }),
      await Dm(n, s.github.owner, s.github.repo, { templateName: i, requestId: a }),
      await Ir(r, t),
      await e.editMessageText(
        `\u23F3 \u7BC4\u672C *${O(i)}* \u6B63\u5728\u5B89\u88DD\u5230\u9F8D\u8766\u5821\uFF0C\u5B8C\u6210\u5F8C\u6703\u901A\u77E5\u4F60`,
        { parse_mode: "MarkdownV2", reply_markup: new F() },
      ));
  }),
);
dt.callbackQuery(/^templates_cancel:/, async (e) =>
  _t(e, async () => {
    let t = await V(e);
    t &&
      (await Ir(e.services.store, t),
      await e.answerCallbackQuery("\u5DF2\u53D6\u6D88"),
      await e.editMessageText("\u274C \u5DF2\u53D6\u6D88\u7BC4\u672C\u5B89\u88DD", {
        reply_markup: new F(),
      }));
  }),
);
dt.callbackQuery(/^templates_env_setup:/, async (e) =>
  _t(e, async () => {
    let t = await V(e);
    if (!t) return;
    let { store: r } = e.services,
      n = await be(r, t);
    if (!n || n.step !== "env_warning") {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /templates",
      );
      return;
    }
    let s = n.pendingEnvs ?? [];
    if (s.length === 0) {
      await Qs(e, t, n);
      return;
    }
    (await e.answerCallbackQuery(),
      await oe(r, t, {
        ...n,
        step: "awaiting_env",
        currentEnvIndex: 0,
        collectedEnvs: {},
        promptMessageId: ur(e),
      }),
      await e.editMessageText(
        `\u{1F511} \u8ACB\u8F38\u5165 *${O(s[0])}* \u7684\u503C

\uFF081/${s.length}\uFF09`,
        { parse_mode: "MarkdownV2", reply_markup: hr() },
      ));
  }),
);
dt.callbackQuery(/^templates_env_skip:/, async (e) =>
  _t(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = await be(e.services.store, t);
    if (!r) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /templates",
      );
      return;
    }
    (await e.answerCallbackQuery(
      "\u23ED\uFE0F \u5DF2\u7565\u904E\u74B0\u5883\u8B8A\u6578\u8A2D\u5B9A",
    ),
      await Qs(e, t, r));
  }),
);
dt.callbackQuery(/^templates_env_resetall:/, async (e) =>
  _t(e, async () => {
    let t = await V(e);
    if (!t) return;
    let { store: r, octokit: n, config: s } = e.services,
      o = await be(r, t);
    if (!o || o.step !== "env_warning") {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /templates",
      );
      return;
    }
    let a = (
      await Jl(n, s.github.owner, s.github.repo, s.github, o.templateName || "", {
        octokit: n,
        owner: s.github.owner,
        repo: s.github.repo,
      })
    ).requiredEnvs;
    if (a.length === 0) {
      await Qs(e, t, o);
      return;
    }
    (await e.answerCallbackQuery(),
      await oe(r, t, {
        ...o,
        step: "awaiting_env",
        pendingEnvs: a,
        currentEnvIndex: 0,
        collectedEnvs: {},
        promptMessageId: ur(e),
      }),
      await e.editMessageText(
        `\u{1F511} \u8ACB\u8F38\u5165 *${O(a[0])}* \u7684\u503C

\uFF081/${a.length}\uFF09`,
        { parse_mode: "MarkdownV2", reply_markup: hr() },
      ));
  }),
);
dt.callbackQuery(/^templates_env_keepall:/, async (e) =>
  _t(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = await be(e.services.store, t);
    if (!r || r.step !== "env_warning") {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /templates",
      );
      return;
    }
    (await e.answerCallbackQuery("\u23ED\uFE0F \u6CBF\u7528\u73FE\u6709\u8A2D\u5B9A"),
      await Qs(e, t, r));
  }),
);
dt.callbackQuery(/^templates_env_cancel:/, async (e) =>
  _t(e, async () => {
    let t = await V(e);
    t &&
      (await Ir(e.services.store, t),
      await e.answerCallbackQuery("\u5DF2\u53D6\u6D88"),
      await e.editMessageText("\u274C \u5DF2\u53D6\u6D88\u7BC4\u672C\u5B89\u88DD", {
        reply_markup: new F(),
      }));
  }),
);
dt.callbackQuery(/^templates_page:/, async (e) =>
  _t(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = parseInt(We(e.callbackQuery.data), 10) || 0,
      { store: n, config: s } = e.services;
    if (!(await be(n, t))) {
      await e.answerCallbackQuery(
        "\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0 /templates",
      );
      return;
    }
    await e.answerCallbackQuery();
    let i = await On(s.github),
      { octokit: a } = e.services,
      l = await Promise.all(
        i.map(async (d) => {
          let m = await Nn(a, s.github.owner, s.github.repo, d.name);
          return { name: d.name, installed: m };
        }),
      ),
      c = new Set(l.filter((d) => d.installed).map((d) => d.name));
    await e.editMessageText(
      "\u{1F4DA} \u9078\u64C7\u8981\u5B89\u88DD\u5230\u9F8D\u8766\u5821\u7684\u7BC4\u672C",
      { reply_markup: us(i, r, c) },
    );
  }),
);
Ie();
Et();
Xe();
Ve();
var Jt = new se(),
  lk = "install-line-bot.yml",
  uk = ".github/workflows/install-line-bot.yml",
  ck = "+08:00",
  xe = {
    POST_INSTALL_PROMPT: "post_install_prompt",
    AWAITING_LINE_BOT_ID: "awaiting_line_bot_id",
    AWAITING_LINE_CHANNEL_ID: "awaiting_line_channel_id",
    AWAITING_LINE_REPLY_MSG: "awaiting_line_reply_msg",
    AWAITING_LINE_ISSUE_NUMBER: "awaiting_line_issue_number",
    AWAITING_LINE_UTC_OFFSET: "awaiting_line_utc_offset",
    POST_INSTALL_CONFIRM: "post_install_confirm",
  };
async function xr(e, t) {
  try {
    await t();
  } catch (r) {
    console.error("[line-bot-setup callback]", r);
    let n = `\u274C ${r instanceof Error ? r.message : String(r)}`;
    try {
      e.callbackQuery?.message
        ? await e.editMessageText(n, { reply_markup: new F() })
        : await e.reply(n);
    } catch (s) {
      console.error("[line-bot-setup callback] failed to report error", s);
    }
  }
}
function dk(e, t) {
  let r = typeof e?.promptMessageId == "number" ? e.promptMessageId : (t ?? null);
  return typeof r == "number" && Number.isInteger(r) && r > 0 ? r : null;
}
async function pk(e, t, r) {
  let n = dk(r, e.callbackQuery?.message?.message_id);
  if (n)
    try {
      await e.api.editMessageReplyMarkup(t, n, { reply_markup: new F() });
    } catch (s) {
      console.warn("[line-bot-setup] failed to clear prompt keyboard", {
        chatId: t,
        messageId: n,
        reason: s instanceof Error ? s.message : String(s),
      });
    }
}
async function et(e, t, r, n, s) {
  return (await pk(e, t, r), (await e.reply(n, s)).message_id);
}
Jt.callbackQuery(/^linebot_setup_continue:/, async (e) =>
  xr(e, async () => {
    let t = await V(e);
    if (!t) return;
    let { store: r } = e.services,
      n = await be(r, t);
    if (!n || n.step !== xe.POST_INSTALL_PROMPT) {
      await e.answerCallbackQuery("\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F");
      return;
    }
    await e.answerCallbackQuery();
    let s = await et(
      e,
      t,
      n,
      "\u{1F4DD} \u8ACB\u8F38\u5165 *LINE Bot ID*\uFF08\u5FC5\u586B\uFF09",
      { parse_mode: "MarkdownV2", reply_markup: wr() },
    );
    await oe(r, t, { ...n, step: xe.AWAITING_LINE_BOT_ID, promptMessageId: s });
  }),
);
Jt.callbackQuery(/^linebot_setup_skip:/, async (e) =>
  xr(e, async () => {
    let t = await V(e);
    t &&
      (await Ir(e.services.store, t),
      await e.answerCallbackQuery("\u23ED\uFE0F \u5DF2\u7565\u904E"),
      await e.editMessageText(
        "\u2705 \u7BC4\u672C *line\\-bot* \u5DF2\u5B89\u88DD\u5B8C\u6210\uFF01\n\n\u4E4B\u5F8C\u53EF\u4EE5\u624B\u52D5\u89F8\u767C `install\\-line\\-bot` workflow \u4F86\u90E8\u7F72\u3002",
        { parse_mode: "MarkdownV2", reply_markup: new F() },
      ));
  }),
);
Jt.callbackQuery(/^linebot_input_skip:/, async (e) =>
  xr(e, async () => {
    let t = await V(e);
    if (!t) return;
    let { store: r } = e.services,
      n = await be(r, t);
    if (!n) {
      await e.answerCallbackQuery("\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F");
      return;
    }
    if ((await e.answerCallbackQuery(), n.step === xe.AWAITING_LINE_REPLY_MSG)) {
      if (n.editMode) {
        await cr(e, t, n);
        return;
      }
      let s = await et(
        e,
        t,
        n,
        "\u{1F4DD} \u8ACB\u8F38\u5165 *\u5C0F\u9F8D\u8766\u7DE8\u865F\uFF08Issue Number\uFF09*\uFF08\u8DF3\u904E\u5247\u81EA\u52D5\u5EFA\u7ACB\uFF09",
        { parse_mode: "MarkdownV2", reply_markup: Lt() },
      );
      await oe(r, t, { ...n, step: xe.AWAITING_LINE_ISSUE_NUMBER, promptMessageId: s });
      return;
    }
    if (n.step === xe.AWAITING_LINE_ISSUE_NUMBER) {
      if (n.editMode) {
        await cr(e, t, n);
        return;
      }
      let s = await et(
        e,
        t,
        n,
        "\u{1F552} \u8ACB\u8F38\u5165\u6642\u5340\uFF08\u4F8B\u5982 `+08:00`\uFF0C\u8DF3\u904E\u5C31\u7528\u9810\u8A2D\uFF09",
        { parse_mode: "MarkdownV2", reply_markup: Lt() },
      );
      await oe(r, t, { ...n, step: xe.AWAITING_LINE_UTC_OFFSET, promptMessageId: s });
      return;
    }
    if (n.step === xe.AWAITING_LINE_UTC_OFFSET) {
      await cr(e, t, n);
      return;
    }
    await e.answerCallbackQuery("\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F");
  }),
);
Jt.callbackQuery(/^linebot_deploy_confirm:/, async (e) =>
  xr(e, async () => {
    let t = await V(e);
    if (!t) return;
    let { store: r, octokit: n, config: s, d1: o } = e.services,
      i = await be(r, t);
    if (!i || i.step !== xe.POST_INSTALL_CONFIRM) {
      await e.answerCallbackQuery("\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F");
      return;
    }
    let a = String(i.lineBotId ?? ""),
      l = String(i.lineChannelId ?? "");
    if (!a || !l) {
      await e.answerCallbackQuery("\u26A0\uFE0F \u7F3A\u5C11\u5FC5\u586B\u6B04\u4F4D");
      return;
    }
    await e.answerCallbackQuery("\u23F3 \u90E8\u7F72\u4E2D...");
    let c = String(i.lineReplyMsg ?? ""),
      d = String(i.lineIssueNumber ?? ""),
      m = Ef(i),
      w = crypto.randomUUID(),
      y = e.callbackQuery?.message?.message_id;
    await Gt(o, {
      requestId: w,
      repo: s.github.repoFullName,
      workflowName: "install-line-bot",
      workflowPath: uk,
      title: `LINE Bot \u90E8\u7F72: ${a}`,
      channel: "telegram",
      chatId: t,
      messageId: y,
      sourceType: "line_bot_install",
      sourceId: a,
      payloadJson: JSON.stringify({
        line_bot_id: a,
        line_bot_channel_id: l,
        line_default_reply_message: c,
        issue_number: d,
        default_utc_offset: m,
      }),
    });
    let _ = { line_bot_id: a, line_bot_channel_id: l };
    (c && (_.line_default_reply_message = c),
      d && (_.issue_number = d),
      (_.default_utc_offset = m));
    try {
      await n.actions.createWorkflowDispatch({
        owner: s.github.owner,
        repo: s.github.repo,
        workflow_id: lk,
        ref: "main",
        inputs: _,
      });
    } catch (I) {
      let { deleteWorkflowNotificationByRequestId: P } = await Promise.resolve().then(
        () => (Et(), Sa),
      );
      throw (await P(o, w), I);
    }
    (await Ir(r, t),
      await e.editMessageText(
        `\u23F3 LINE Bot Worker \u6B63\u5728\u90E8\u7F72\u4E2D\uFF0C\u5B8C\u6210\u5F8C\u6703\u901A\u77E5\u4F60

\u{1F916} Bot ID: \`${O(a)}\``,
        { parse_mode: "MarkdownV2", reply_markup: new F() },
      ));
  }),
);
Jt.callbackQuery(/^linebot_deploy_cancel:/, async (e) =>
  xr(e, async () => {
    let t = await V(e);
    t &&
      (await Ir(e.services.store, t),
      await e.answerCallbackQuery("\u5DF2\u53D6\u6D88"),
      await e.editMessageText("\u274C \u5DF2\u53D6\u6D88 LINE Bot \u90E8\u7F72", {
        reply_markup: new F(),
      }));
  }),
);
Jt.callbackQuery(/^linebot_edit_params:/, async (e) =>
  xr(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = await be(e.services.store, t);
    if (!r || r.step !== xe.POST_INSTALL_CONFIRM) {
      await e.answerCallbackQuery("\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F");
      return;
    }
    await e.answerCallbackQuery();
    let n = await et(e, t, r, "\u270F\uFE0F \u9078\u64C7\u8981\u4FEE\u6539\u7684\u6B04\u4F4D", {
      reply_markup: ap(),
    });
    await oe(e.services.store, t, { ...r, promptMessageId: n });
  }),
);
Jt.callbackQuery(/^linebot_edit:(.+)$/, async (e) =>
  xr(e, async () => {
    let t = await V(e);
    if (!t) return;
    let { store: r } = e.services,
      n = await be(r, t);
    if (!n || n.step !== xe.POST_INSTALL_CONFIRM) {
      await e.answerCallbackQuery("\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F");
      return;
    }
    let s = e.match?.[1];
    if (!s) return;
    await e.answerCallbackQuery();
    let i = {
      bot_id: {
        step: xe.AWAITING_LINE_BOT_ID,
        prompt: "\u{1F4DD} \u8ACB\u8F38\u5165\u65B0\u7684 *LINE Bot ID*\uFF08\u5FC5\u586B\uFF09",
        required: !0,
      },
      channel_id: {
        step: xe.AWAITING_LINE_CHANNEL_ID,
        prompt:
          "\u{1F4DD} \u8ACB\u8F38\u5165\u65B0\u7684 *LINE Bot Channel ID*\uFF08\u5FC5\u586B\uFF09",
        required: !0,
      },
      reply_msg: {
        step: xe.AWAITING_LINE_REPLY_MSG,
        prompt:
          "\u{1F4DD} \u8ACB\u8F38\u5165\u65B0\u7684\u9810\u8A2D\u56DE\u61C9\u8A0A\u606F\uFF08\u9078\u586B\uFF0C\u6309\u8DF3\u904E\u53EF\u7565\u904E\uFF09",
        required: !1,
      },
      issue_number: {
        step: xe.AWAITING_LINE_ISSUE_NUMBER,
        prompt:
          "\u{1F4DD} \u8ACB\u8F38\u5165\u65B0\u7684 *\u5C0F\u9F8D\u8766\u7DE8\u865F\uFF08Issue Number\uFF09*\uFF08\u8DF3\u904E\u5247\u81EA\u52D5\u5EFA\u7ACB\uFF09",
        required: !1,
      },
      utc_offset: {
        step: xe.AWAITING_LINE_UTC_OFFSET,
        prompt:
          "\u{1F552} \u8ACB\u8F38\u5165\u65B0\u7684\u6642\u5340\uFF08\u4F8B\u5982 `+08:00`\uFF0C\u8DF3\u904E\u5247\u4FDD\u7559\u76EE\u524D\u8A2D\u5B9A\uFF09",
        required: !1,
      },
    }[s];
    if (!i) return;
    let a = i.required ? wr() : Lt(),
      l = await et(e, t, n, i.prompt, { parse_mode: "MarkdownV2", reply_markup: a });
    await oe(r, t, { ...n, step: i.step, editMode: !0, promptMessageId: l });
  }),
);
Jt.callbackQuery(/^linebot_edit_back:/, async (e) =>
  xr(e, async () => {
    let t = await V(e);
    if (!t) return;
    let r = await be(e.services.store, t);
    if (!r) {
      await e.answerCallbackQuery("\u26A0\uFE0F \u6D41\u7A0B\u5DF2\u904E\u671F");
      return;
    }
    (await e.answerCallbackQuery(), await cr(e, t, r));
  }),
);
async function cr(e, t, r) {
  let n = String(r.lineBotId ?? ""),
    s = String(r.lineChannelId ?? ""),
    o = String(r.lineReplyMsg ?? ""),
    i = String(r.lineIssueNumber ?? ""),
    a = Ef(r),
    l = [
      "\u78BA\u8A8D\u90E8\u7F72 LINE Bot\uFF1F",
      "",
      `\\- LINE Bot ID: \`${O(n)}\``,
      `\\- Channel ID: \`${O(s)}\``,
      `\\- \u9810\u8A2D\u56DE\u61C9\uFF1A${o ? O(o) : "\uFF08\u7121\uFF09"}`,
      `\\- \u5C0F\u9F8D\u8766\uFF1A${i ? `\\#${O(i)}` : "\u81EA\u52D5\u5EFA\u7ACB"}`,
      `\\- \u6642\u5340: \`${O(a)}\``,
    ],
    c = await et(
      e,
      t,
      r,
      l.join(`
`),
      { parse_mode: "MarkdownV2", reply_markup: ip() },
    );
  await oe(e.services.store, t, {
    ...r,
    step: xe.POST_INSTALL_CONFIRM,
    editMode: void 0,
    promptMessageId: c,
  });
}
function mk(e) {
  return /^@[\w.-]+$/.test(e);
}
function fk(e) {
  return /^\d+$/.test(e);
}
function gk(e) {
  let t = e.match(/^([+-])(\d{2}):(\d{2})$/);
  if (!t) return !1;
  let r = Number.parseInt(t[2], 10),
    n = Number.parseInt(t[3], 10);
  return r >= 0 && r <= 23 && n >= 0 && n <= 59;
}
function Ef(e) {
  return String(e.lineDefaultUtcOffset ?? "").trim() || ck;
}
async function Sf(e) {
  let t = e.chat?.id;
  if (!t) return !1;
  let { store: r, octokit: n, config: s } = e.services,
    o = await be(r, t);
  if (!o) return !1;
  let i = (e.message?.text ?? "").trim();
  switch (o.step) {
    case xe.AWAITING_LINE_BOT_ID: {
      if (!i) {
        let a = await et(
          e,
          t,
          o,
          "\u26A0\uFE0F LINE Bot ID \u70BA\u5FC5\u586B\u6B04\u4F4D\uFF0C\u8ACB\u8F38\u5165",
          { reply_markup: wr() },
        );
        return (await oe(r, t, { ...o, promptMessageId: a }), !0);
      }
      if (!mk(i)) {
        let a = await et(
          e,
          t,
          o,
          "\u26A0\uFE0F LINE Bot ID \u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u61C9\u70BA `@` \u958B\u982D\uFF08\u4F8B\u5982 `@mybot`\uFF09\uFF0C\u8ACB\u91CD\u65B0\u8F38\u5165",
          { parse_mode: "MarkdownV2", reply_markup: wr() },
        );
        return (await oe(r, t, { ...o, promptMessageId: a }), !0);
      }
      if (o.editMode) {
        await oe(r, t, { ...o, lineBotId: i, step: xe.POST_INSTALL_CONFIRM, editMode: void 0 });
        let a = await be(r, t);
        a && (await cr(e, t, a));
      } else {
        let a = await et(
          e,
          t,
          o,
          "\u{1F4DD} \u8ACB\u8F38\u5165 *LINE Bot Channel ID*\uFF08\u5FC5\u586B\uFF0C\u7D14\u6578\u5B57\uFF09",
          { parse_mode: "MarkdownV2", reply_markup: wr() },
        );
        await oe(r, t, {
          ...o,
          lineBotId: i,
          step: xe.AWAITING_LINE_CHANNEL_ID,
          promptMessageId: a,
        });
      }
      return !0;
    }
    case xe.AWAITING_LINE_CHANNEL_ID: {
      if (!i) {
        let a = await et(
          e,
          t,
          o,
          "\u26A0\uFE0F LINE Bot Channel ID \u70BA\u5FC5\u586B\u6B04\u4F4D\uFF0C\u8ACB\u8F38\u5165",
          { reply_markup: wr() },
        );
        return (await oe(r, t, { ...o, promptMessageId: a }), !0);
      }
      if (!fk(i)) {
        let a = await et(
          e,
          t,
          o,
          "\u26A0\uFE0F Channel ID \u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u61C9\u70BA\u7D14\u6578\u5B57\uFF0C\u8ACB\u91CD\u65B0\u8F38\u5165",
          { reply_markup: wr() },
        );
        return (await oe(r, t, { ...o, promptMessageId: a }), !0);
      }
      if (o.editMode) {
        await oe(r, t, { ...o, lineChannelId: i, step: xe.POST_INSTALL_CONFIRM, editMode: void 0 });
        let a = await be(r, t);
        a && (await cr(e, t, a));
      } else {
        let a = await et(
          e,
          t,
          o,
          "\u{1F4DD} \u8ACB\u8F38\u5165\u9810\u8A2D\u56DE\u61C9\u8A0A\u606F\uFF08\u9078\u586B\uFF0C\u6309\u8DF3\u904E\u53EF\u7565\u904E\uFF09",
          { reply_markup: Lt() },
        );
        await oe(r, t, {
          ...o,
          lineChannelId: i,
          step: xe.AWAITING_LINE_REPLY_MSG,
          promptMessageId: a,
        });
      }
      return !0;
    }
    case xe.AWAITING_LINE_REPLY_MSG: {
      if (o.editMode) {
        await oe(r, t, {
          ...o,
          lineReplyMsg: i || "",
          step: xe.POST_INSTALL_CONFIRM,
          editMode: void 0,
        });
        let a = await be(r, t);
        a && (await cr(e, t, a));
      } else {
        let a = await et(
          e,
          t,
          o,
          "\u{1F4DD} \u8ACB\u8F38\u5165 *\u5C0F\u9F8D\u8766\u7DE8\u865F\uFF08Issue Number\uFF09*\uFF08\u8DF3\u904E\u5247\u81EA\u52D5\u5EFA\u7ACB\uFF09",
          { parse_mode: "MarkdownV2", reply_markup: Lt() },
        );
        await oe(r, t, {
          ...o,
          lineReplyMsg: i || "",
          step: xe.AWAITING_LINE_ISSUE_NUMBER,
          promptMessageId: a,
        });
      }
      return !0;
    }
    case xe.AWAITING_LINE_ISSUE_NUMBER: {
      let a = o;
      if (i) {
        let c = Number.parseInt(i, 10);
        if (!Number.isInteger(c) || c <= 0) {
          let d = await et(
            e,
            t,
            o,
            "\u26A0\uFE0F \u5C0F\u9F8D\u8766\u7DE8\u865F\uFF08Issue Number\uFF09\u5FC5\u9808\u662F\u6B63\u6574\u6578\uFF0C\u8ACB\u91CD\u65B0\u8F38\u5165\u6216\u6309\u8DF3\u904E",
            { reply_markup: Lt() },
          );
          return (await oe(r, t, { ...o, promptMessageId: d }), !0);
        }
        try {
          await n.issues.get({ owner: s.github.owner, repo: s.github.repo, issue_number: c });
        } catch {
          let d = await et(
            e,
            t,
            o,
            `\u26A0\uFE0F \u627E\u4E0D\u5230\u5C0F\u9F8D\u8766 #${c}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u91CD\u65B0\u8F38\u5165\u6216\u6309\u8DF3\u904E`,
            { reply_markup: Lt() },
          );
          return (await oe(r, t, { ...o, promptMessageId: d }), !0);
        }
        ((a = { ...o, lineIssueNumber: String(c) }), await oe(r, t, a));
      }
      if (o.editMode) {
        let c = await be(r, t);
        return (c && (await cr(e, t, c)), !0);
      }
      let l = await et(
        e,
        t,
        a,
        "\u{1F552} \u8ACB\u8F38\u5165\u6642\u5340\uFF08\u4F8B\u5982 `+08:00`\uFF0C\u8DF3\u904E\u5C31\u7528\u9810\u8A2D\uFF09",
        { parse_mode: "MarkdownV2", reply_markup: Lt() },
      );
      return (await oe(r, t, { ...a, step: xe.AWAITING_LINE_UTC_OFFSET, promptMessageId: l }), !0);
    }
    case xe.AWAITING_LINE_UTC_OFFSET: {
      if (i) {
        if (!gk(i)) {
          let l = await et(
            e,
            t,
            o,
            "\u26A0\uFE0F \u6642\u5340\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165\u50CF `+08:00` \u6216 `-05:00`",
            { parse_mode: "MarkdownV2", reply_markup: Lt() },
          );
          return (await oe(r, t, { ...o, promptMessageId: l }), !0);
        }
        await oe(r, t, { ...o, lineDefaultUtcOffset: i });
      }
      let a = await be(r, t);
      return (a && (await cr(e, t, a)), !0);
    }
    default:
      return !1;
  }
}
function If(e) {
  return Object.values(xe).includes(e);
}
Ie();
ft();
Jr();
Ve();
var Tt = new se();
Tt.callbackQuery(/^set_schedule:/, async (e) => {
  let t = await V(e);
  if (!t) return;
  let r = Kt(e.callbackQuery.data);
  if (!r) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u7121\u6548\u7684 Issue \u7DE8\u865F");
    return;
  }
  let { store: n, octokit: s, config: o } = e.services,
    { owner: i, repo: a } = o.github,
    c = (await Ht(s, i, a)).find((d) => d.number === r);
  if (!c) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u627E\u4E0D\u5230\u6B64 Issue \u6216\u5DF2\u95DC\u9589",
    );
    return;
  }
  (await Dt(n, t),
    await Hr(n, t, { step: "awaiting_prompt", issueNumber: r }),
    await e.answerCallbackQuery(),
    await e.reply(Jm(c.title, r), { reply_markup: tr() }));
});
Tt.callbackQuery(/^manage_schedule:/, async (e) => {
  if (!(await V(e))) return;
  let r = Kt(e.callbackQuery.data);
  if (!r) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u7121\u6548\u7684 Issue \u7DE8\u865F");
    return;
  }
  let { d1: n, octokit: s, config: o } = e.services,
    { owner: i, repo: a, repoFullName: l } = o.github,
    d = (await Ht(s, i, a)).find((w) => w.number === r);
  if (!d) {
    await e.answerCallbackQuery(
      "\u26A0\uFE0F \u627E\u4E0D\u5230\u6B64 Issue \u6216\u5DF2\u95DC\u9589",
    );
    return;
  }
  let m = await gs(n, l, r);
  (await e.answerCallbackQuery(),
    await e.reply(Ol(d.title, r, m), {
      reply_markup:
        m.length > 0
          ? ja(
              m.map((w) => ({ ...w, buttonLabel: $n(w) })),
              r,
            )
          : Ba(r),
    }));
});
Tt.callbackQuery(/^schedule_open:/, async (e) => {
  let { d1: t, octokit: r, config: n } = e.services,
    { owner: s, repo: o } = n.github,
    i = We(e.callbackQuery.data),
    a = await gt(t, i);
  if (!a) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u627E\u4E0D\u5230\u9019\u7B46\u6392\u7A0B");
    return;
  }
  let c = (await Ht(r, s, o)).find((d) => d.number === a.issueNumber);
  (await e.answerCallbackQuery(),
    await e.reply(Nl(c?.title || "\u6392\u7A0B\u5C0F\u9F8D\u8766", a.issueNumber, a), {
      reply_markup: jo(a.id, a.issueNumber, a.status !== "paused"),
    }));
});
Tt.callbackQuery(/^(schedule_edit_prompt|schedule_edit_time|schedule_edit_payload):/, async (e) => {
  let t = await V(e);
  if (!t) return;
  let { store: r, d1: n, octokit: s, config: o } = e.services,
    { owner: i, repo: a } = o.github,
    l = e.callbackQuery.data,
    c = l.startsWith("schedule_edit_prompt:"),
    d = l.startsWith("schedule_edit_payload:"),
    { scheduleId: m, source: w } = yi(We(l)),
    y = await gt(n, m);
  if (!y) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u627E\u4E0D\u5230\u9019\u7B46\u6392\u7A0B");
    return;
  }
  if (w === "chat") {
    let _ = await Us(s, i, a, y);
    if (_i(_)) {
      (await e.answerCallbackQuery(
        "\u26A0\uFE0F \u9019\u7B46\u6392\u7A0B\u7684\u5C0F\u9F8D\u8766\u5DF2\u6536\u5DE5\uFF0C\u53EA\u80FD\u522A\u9664",
      ),
        await e.reply(Ds(_), { reply_markup: Bs(_) }));
      return;
    }
  }
  (await Dt(r, t),
    await Ye(r, t),
    await Hr(r, t, {
      step: c ? "awaiting_edit_prompt" : d ? "awaiting_edit_payload" : "awaiting_edit_time",
      scheduleId: y.id,
      issueNumber: y.issueNumber,
      source: w,
    }),
    await e.answerCallbackQuery(),
    await e.reply(c ? Ym(y.id) : d ? Zm(y.id, y.eventData) : Xm(y.id), {
      reply_markup: d ? Bo() : tr(),
    }));
});
Tt.callbackQuery(/^schedule_flow_cancel:/, async (e) => {
  let t = await V(e);
  t &&
    (await Ye(e.services.store, t),
    await e.answerCallbackQuery("\u274C \u5DF2\u53D6\u6D88\u6392\u7A0B\u8A2D\u5B9A"),
    await e.reply("\u53D6\u6D88\u8A2D\u5B9A\u6392\u7A0B\uFF01"));
});
Tt.callbackQuery(/^schedule_payload_skip:/, async (e) => {
  let t = await V(e);
  if (!t) return;
  let { store: r, d1: n, config: s } = e.services,
    o = await sr(r, t);
  if (!o) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u6392\u7A0B\u8A2D\u5B9A\u5DF2\u904E\u671F");
    return;
  }
  if (o.step === "awaiting_payload") {
    if (!o.prompt || !o.ruleType || !o.rulePayload || !o.timezone || !o.nextRunAt) {
      (await Ye(r, t),
        await e.answerCallbackQuery(
          "\u26A0\uFE0F \u6392\u7A0B\u8A2D\u5B9A\u72C0\u614B\u907A\u5931",
        ),
        await e.reply(
          "\u26A0\uFE0F \u6392\u7A0B\u8A2D\u5B9A\u72C0\u614B\u907A\u5931\uFF0C\u8ACB\u91CD\u65B0\u8A2D\u5B9A\u6392\u7A0B\u3002",
        ));
      return;
    }
    let i = await Xo(n, {
      id: fs(),
      repo: s.github.repoFullName,
      issueNumber: o.issueNumber,
      chatId: t,
      prompt: o.prompt,
      eventData: null,
      ruleType: o.ruleType,
      rulePayload: o.rulePayload,
      timezone: o.timezone,
      nextRunAt: o.nextRunAt,
      shouldNotify: !0,
    });
    if (!i) {
      (await Ye(r, t),
        await e.answerCallbackQuery("\u274C \u5EFA\u7ACB\u6392\u7A0B\u5931\u6557"),
        await e.reply(
          "\u274C \u5EFA\u7ACB\u6392\u7A0B\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",
        ));
      return;
    }
    (await e.answerCallbackQuery("\u23ED\uFE0F \u5DF2\u7565\u904E Payload"),
      await on(e, i, "\u5EFA\u7ACB"));
    return;
  }
  if (o.step === "awaiting_edit_payload") {
    if (!o.scheduleId) {
      (await Ye(r, t),
        await e.answerCallbackQuery("\u26A0\uFE0F \u627E\u4E0D\u5230\u6307\u5B9A\u6392\u7A0B"),
        await e.reply(
          "\u26A0\uFE0F \u627E\u4E0D\u5230\u6307\u5B9A\u6392\u7A0B\uFF0C\u8ACB\u91CD\u65B0\u958B\u555F\u7BA1\u7406\u6392\u7A0B\u3002",
        ));
      return;
    }
    let i = await jt(n, o.scheduleId, { eventData: null }, { now: new Date() });
    if (!i) {
      (await Ye(r, t),
        await e.answerCallbackQuery("\u26A0\uFE0F \u627E\u4E0D\u5230\u6307\u5B9A\u6392\u7A0B"),
        await e.reply(
          "\u26A0\uFE0F \u627E\u4E0D\u5230\u6307\u5B9A\u6392\u7A0B\uFF0C\u8ACB\u91CD\u65B0\u958B\u555F\u7BA1\u7406\u6392\u7A0B\u3002",
        ));
      return;
    }
    (await e.answerCallbackQuery("\u23ED\uFE0F \u5DF2\u7565\u904E Payload"),
      await on(e, i, "\u66F4\u65B0"));
    return;
  }
  await e.answerCallbackQuery(
    "\u26A0\uFE0F \u76EE\u524D\u4E0D\u5728 Payload \u8A2D\u5B9A\u6B65\u9A5F",
  );
});
Tt.callbackQuery(/^schedule_toggle:/, async (e) => {
  let { d1: t, octokit: r, config: n } = e.services,
    { owner: s, repo: o } = n.github,
    { scheduleId: i, source: a } = yi(We(e.callbackQuery.data));
  if (a === "chat") {
    let y = await gt(t, i);
    if (!y) {
      await e.answerCallbackQuery("\u26A0\uFE0F \u627E\u4E0D\u5230\u9019\u7B46\u6392\u7A0B");
      return;
    }
    let _ = await Us(r, s, o, y);
    if (_i(_)) {
      (await e.answerCallbackQuery(
        "\u26A0\uFE0F \u9019\u7B46\u6392\u7A0B\u7684\u5C0F\u9F8D\u8766\u5DF2\u6536\u5DE5\uFF0C\u53EA\u80FD\u522A\u9664",
      ),
        await e.reply(Ds(_), { reply_markup: Bs(_) }));
      return;
    }
  }
  let l = await gt(t, i);
  if (!l) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u627E\u4E0D\u5230\u9019\u7B46\u6392\u7A0B");
    return;
  }
  let c = new Date(),
    d =
      l.status === "active"
        ? await jt(t, l.id, { status: "paused" }, { now: c })
        : await jt(
            t,
            l.id,
            {
              status: "active",
              nextRunAt: Wn({ ruleType: l.ruleType, rulePayload: l.rulePayload, now: c }),
              lastError: null,
            },
            { now: c },
          );
  if (!d) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u627E\u4E0D\u5230\u9019\u7B46\u6392\u7A0B");
    return;
  }
  if (
    (await e.answerCallbackQuery(
      d.status === "paused"
        ? "\u23F8\uFE0F \u5DF2\u505C\u7528\u6392\u7A0B"
        : "\u25B6\uFE0F \u5DF2\u555F\u7528\u6392\u7A0B",
    ),
    a === "chat")
  ) {
    let y = await Us(r, s, o, d);
    await e.reply(Ds(y), { reply_markup: Bs(y) });
    return;
  }
  let w = (await Ht(r, s, o)).find((y) => y.number === d.issueNumber);
  await e.reply(Nl(w?.title || "\u6392\u7A0B\u5C0F\u9F8D\u8766", d.issueNumber, d), {
    reply_markup: jo(d.id, d.issueNumber, d.status !== "paused"),
  });
});
Tt.callbackQuery(/^schedule_delete:/, async (e) => {
  let t = await V(e);
  if (!t) return;
  let { d1: r, octokit: n, config: s } = e.services,
    { owner: o, repo: i, repoFullName: a } = s.github,
    { scheduleId: l, source: c } = yi(We(e.callbackQuery.data)),
    d = await gt(r, l);
  if (!d) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u627E\u4E0D\u5230\u9019\u7B46\u6392\u7A0B");
    return;
  }
  if (
    (await Xa(r, l),
    await e.answerCallbackQuery("\u{1F5D1}\uFE0F \u5DF2\u522A\u9664\u6392\u7A0B"),
    c === "chat")
  ) {
    let _ = await Un(r, n, o, i, a, t);
    await e.reply(Dn(_), { reply_markup: Bn(_) });
    return;
  }
  let w = (await Ht(n, o, i)).find((_) => _.number === d.issueNumber),
    y = await gs(r, a, d.issueNumber);
  await e.reply(Ol(w?.title || "\u6392\u7A0B\u5C0F\u9F8D\u8766", d.issueNumber, y), {
    reply_markup:
      y.length > 0
        ? ja(
            y.map((_) => ({ ..._, buttonLabel: $n(_) })),
            d.issueNumber,
          )
        : Ba(d.issueNumber),
  });
});
Tt.callbackQuery(/^schedule_chat_list:/, async (e) => {
  let t = await V(e);
  if (!t) return;
  let { d1: r, octokit: n, config: s } = e.services,
    { owner: o, repo: i, repoFullName: a } = s.github,
    l = await Un(r, n, o, i, a, t);
  (await e.answerCallbackQuery(), await e.reply(Dn(l), { reply_markup: Bn(l) }));
});
Tt.callbackQuery(/^schedule_chat_open:/, async (e) => {
  let { d1: t, octokit: r, config: n } = e.services,
    { owner: s, repo: o } = n.github,
    i = We(e.callbackQuery.data),
    a = await gt(t, i);
  if (!a) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u627E\u4E0D\u5230\u9019\u7B46\u6392\u7A0B");
    return;
  }
  let l = await Us(r, s, o, a);
  (await e.answerCallbackQuery(), await e.reply(Ds(l), { reply_markup: Bs(l) }));
});
Tt.callbackQuery(/^schedule_chat_delete:/, async (e) => {
  let t = await V(e);
  if (!t) return;
  let { d1: r, octokit: n, config: s } = e.services,
    { owner: o, repo: i, repoFullName: a } = s.github,
    l = We(e.callbackQuery.data);
  if (!(await gt(r, l))) {
    await e.answerCallbackQuery("\u26A0\uFE0F \u627E\u4E0D\u5230\u9019\u7B46\u6392\u7A0B");
    return;
  }
  await Xa(r, l);
  let d = await Un(r, n, o, i, a, t);
  (await e.answerCallbackQuery("\u{1F5D1}\uFE0F \u5DF2\u522A\u9664\u6392\u7A0B"),
    await e.reply(Dn(d), { reply_markup: Bn(d) }));
});
Ie();
Fs();
var kt = new se();
kt.callbackQuery(/^edit_keep_field:/, async (e) => {
  await bl(e);
});
kt.callbackQuery(/^new_template_select:/, async (e) => {
  await yl(e);
});
kt.callbackQuery(/^edit_workflow_enabled:/, async (e) => {
  await _l(e);
});
kt.callbackQuery(/^edit_template_reset:/, async (e) => {
  await Tl(e);
});
kt.callbackQuery(/^new_flow_cancel:/, async (e) => {
  await kl(e);
});
kt.callbackQuery(/^new_flow_env_setup:/, async (e) => {
  await mi(e);
});
kt.callbackQuery(/^new_flow_env_skip:/, async (e) => {
  await fi(e);
});
kt.callbackQuery(/^new_flow_env_cancel:/, async (e) => {
  await gi(e);
});
kt.callbackQuery(/^edit_flow_env_setup:/, async (e) => {
  await mi(e);
});
kt.callbackQuery(/^edit_flow_env_skip:/, async (e) => {
  await fi(e);
});
kt.callbackQuery(/^edit_flow_env_cancel:/, async (e) => {
  await gi(e);
});
Ie();
var Ri = new se();
Ri.callbackQuery("command_menu_skills", async (e) => {
  (await e.answerCallbackQuery(t("kb.skillsManage", {}, glang())), await Il(e));
});
var hk = {
  command_menu_list: { command: "/list", label: "\u{1F4CB} Issue \u5217\u8868" },
  command_menu_current: {
    command: "/current",
    label: "\u{1F99E} \u76EE\u524D\u7684\u5C0F\u9F8D\u8766",
  },
  command_menu_new: { command: "/new", label: "\u2795 \u65B0\u589E\u5C0F\u9F8D\u8766" },
  command_menu_close: { command: "/close", label: "\u{1F512} \u95DC\u9589\u5C0F\u9F8D\u8766" },
  command_menu_schedules: { command: "/schedules", label: "\u23F0 \u6392\u7A0B\u7BA1\u7406" },
  command_menu_help: { command: "/help", label: "\u2753 \u5E6B\u52A9" },
  command_menu_workflow: { command: "/workflow", label: "\u2699\uFE0F \u5DE5\u4F5C\u6D41\u7A0B" },
};
for (let [e, { command: t, label: r }] of Object.entries(hk))
  Ri.callbackQuery(e, async (n) => {
    (await n.answerCallbackQuery(`${r}`),
      await n.reply(`\u8ACB\u4F7F\u7528 ${t} \u6307\u4EE4\u3002`));
  });
Ie();
var wk = "telegram-meta",
  bk = "\uFF08\u5EFA\u7ACB\u6642\u672A\u63D0\u4F9B\u5167\u5BB9\uFF09";
function yk(e) {
  let t = e.from;
  if (!t) return "\u672A\u77E5\u767C\u9001\u8005";
  let r = [t.first_name, t.last_name].filter(Boolean),
    n = r.length > 0 ? r.join(" ") : (t.username ?? `user-${t.id}`);
  return t.username ? `${n} (@${t.username})` : n;
}
function _k(e) {
  let t = e.chat;
  return t ? (t.title ?? t.username ?? t.type ?? `chat-${t.id}`) : "unknown";
}
function Tk(e) {
  return typeof e.date != "number"
    ? new Date().toISOString()
    : new Date(e.date * 1e3).toISOString();
}
function Xl(e) {
  let t = {
    chat_id: e.chat?.id ?? null,
    msg_id: e.message_id ?? null,
    user_id: e.from?.id ?? null,
    username: e.from?.username ?? null,
    chat_type: e.chat?.type ?? null,
    ts: Tk(e),
  };
  return `<!-- ${wk}: ${JSON.stringify(t)} -->`;
}
function kk(e) {
  return `**\u4F86\u81EA\uFF1A** ${yk(e)} \xB7 ${_k(e)}`;
}
function Ek(e) {
  return (typeof e?.content == "string" ? e.content.trim() : "") || bk;
}
function Vs(e, t) {
  return [Xl(e), "", kk(e), "", "---", "", Ek(t)].join(`
`);
}
Pt();
mt();
ft();
ft();
di();
ar();
function vf(e) {
  return [
    `\u{1F99E}\u300C${typeof e == "string" && e.trim() !== "" ? e.trim() : "\u5C0F\u9F8D\u8766"}\u300D\u73FE\u5728\u6B63\u5728\u4F11\u606F\u4E2D\uFF0C\u5148\u5225\u64D4\u5FC3\u3002`,
    "",
    "\u4F60\u7684\u8A0A\u606F\u6211\u5DF2\u7D93\u5148\u5E6B\u4F60\u4FDD\u7559\u4E0B\u4F86\u4E86\uFF0C\u4E0D\u6703\u6F0F\u6389\u3002",
    "\u5982\u679C\u4F60\u60F3\u99AC\u4E0A\u53EB\u9192\u7260\uFF0C\u8ACB\u4F7F\u7528 /enable \u555F\u52D5\u3002",
  ].join(`
`);
}
function Sk(e) {
  return [
    "\u76EE\u524D\u5C0F\u9F8D\u8766\u5C1A\u672A\u8A2D\u5B9A\u4EFB\u52D9\uFF0C\u4F46\u6211\u4F9D\u7136\u6703\u8A18\u9304\u4F60\u7684\u8A0A\u606F\u3002",
    "\u4E4B\u5F8C\u82E5\u9700\u8981\u5C0F\u9F8D\u8766\u57F7\u884C\u4EFB\u52D9\uFF0C\u53EA\u8981\u900F\u904E /edit \u5373\u53EF\u66F4\u65B0\u8A2D\u5B9A\u3002",
  ].join(`
`);
}
async function Js(e, t, r, n) {
  let s = await Ts(e, t, r, n);
  if (s.acceptsDispatch)
    return {
      acceptsDispatch: !0,
      clawName: "",
      restingMessage: vf(""),
      reason: "ready",
      branchExists: !0,
      workflowExists: !0,
    };
  let o = "";
  try {
    let { data: a } = await e.issues.get({ owner: t, repo: r, issue_number: n });
    o = ui(a.body, { fallbackName: a.title })?.name ?? a.title ?? "";
  } catch {
    o = "";
  }
  let i = !s.branchExists || !s.workflowExists ? "missing_setup" : "disabled";
  return {
    acceptsDispatch: !1,
    clawName: o,
    restingMessage: i === "missing_setup" ? Sk(o) : vf(o),
    reason: i,
    branchExists: s.branchExists,
    workflowExists: s.workflowExists,
  };
}
ar();
function Zl(e, t) {
  let r = typeof e == "string" ? e.trim() : "",
    n = t.map((o) => String(o.repoPath || "").trim()).filter((o) => o !== "");
  return [
    "\u4F86\u81EA Telegram \u7684\u5A92\u9AD4\u8A0A\u606F",
    "",
    "\u4F7F\u7528\u8005\u6587\u5B57\uFF1A",
    r || "\uFF08\u7121\uFF09",
    "",
    "\u9644\u4EF6\uFF1A",
    ...(n.length > 0 ? n.map((o) => `- ${o}`) : ["- \uFF08\u7121\uFF09"]),
  ].join(`
`);
}
var ln = new se(),
  Ik = 3e3;
function Cf(e) {
  let t = new Uint8Array(e),
    r = "";
  for (let n = 0; n < t.length; n++) r += String.fromCharCode(t[n]);
  return btoa(r);
}
function vk(e) {
  let t = e.from;
  if (!t) return "\u672A\u77E5\u767C\u9001\u8005";
  let r = [t.first_name, t.last_name].filter(Boolean),
    n = r.length > 0 ? r.join(" ") : (t.username ?? `user-${t.id}`);
  return t.username ? `${n} (@${t.username})` : n;
}
function Ck(e) {
  let t = e.chat;
  return t ? (t.title ?? t.username ?? t.type ?? `chat-${t.id}`) : "unknown";
}
function Ai(e, t, r, n) {
  let s = encodeURIComponent(r),
    o = n
      .split("/")
      .map((i) => encodeURIComponent(i))
      .join("/");
  return `https://github.com/${e}/${t}/blob/${s}/${o}?raw=true`;
}
function ru(e) {
  return (
    e
      .trim()
      .replace(/[^A-Za-z0-9._-]/g, "_")
      .replace(/^_+|_+$/g, "") || "file"
  );
}
function Rf(e, t) {
  return `assets/telegram/${e}_${ru(t)}`;
}
function Af(e, t) {
  return `artifacts/${e}/${ru(t)}`;
}
function eu(e, t) {
  let r = String(e || "").trim();
  return r
    ? !t || r.toLowerCase().endsWith(t.toLowerCase()) || r.includes(".")
      ? r
      : `${r}${t}`
    : `file${t}`;
}
async function Rk(e, t, r, n) {
  let { octokit: s, config: o } = e.services;
  try {
    let a = (
      await s.rest.repos.getContent({ owner: o.github.owner, repo: o.github.repo, path: r, ref: t })
    ).data;
    if (Array.isArray(a) || a.type !== "file") return;
    await s.rest.repos.deleteFile({
      owner: o.github.owner,
      repo: o.github.repo,
      path: r,
      message: n,
      sha: a.sha,
      branch: t,
    });
  } catch (i) {
    console.warn(`\u522A\u9664\u66AB\u5B58\u5A92\u9AD4 ${r} \u5931\u6557`, {
      branch: t,
      error: i instanceof Error ? i.message : String(i),
    });
  }
}
async function Kn(e, t, r, n) {
  for (let s of r) await Rk(e, t, s, n);
}
function tu(e, t) {
  if (t && t.includes(".")) return t.substring(t.lastIndexOf("."));
  switch (e) {
    case "photo":
      return ".jpg";
    case "voice":
      return ".ogg";
    case "video":
      return ".mp4";
    default:
      return "";
  }
}
function Ak(e) {
  return e.field === "photo"
    ? `![${e.label}](${e.rawUrl})`
    : `[${e.label}${e.originalName ? ` \u2014 ${e.originalName}` : ""}${e.duration ? ` (${e.duration}s)` : ""}](${e.rawUrl})`;
}
function xk(e, t) {
  let r = e.map((n) => `[${n.label}] ${n.repoPath}`);
  return t.trim() || r.join(", ");
}
function Pk(e) {
  return e.map((t) => ({
    type: t.field,
    label: t.label,
    file_name: t.originalName,
    mime_type: t.mimeType,
    duration: t.duration,
    github_repo_path: t.repoPath,
    github_html_url: t.rawUrl || null,
  }));
}
function xf(e) {
  switch (e) {
    case "photo":
      return "\u{1F4F7} \u7167\u7247";
    case "video":
      return "\u{1F3AC} \u5F71\u7247";
    case "audio":
      return "\u{1F3B5} \u97F3\u8A0A";
    case "document":
      return "\u{1F4C4} \u6587\u4EF6";
    case "voice":
      return "\u{1F399}\uFE0F \u8A9E\u97F3";
    default:
      return "\u{1F4C1} \u5A92\u9AD4";
  }
}
function xi(e, t, r, n) {
  let s = [Xl(e), n].filter(Boolean),
    o = t.map((l) => Ak(l)),
    i = t.map((l) => `\`${l.repoPath}\``).join(", "),
    a = [...s, "", `**\u4F86\u81EA\uFF1A** ${vk(e)} \xB7 ${Ck(e)}`, "", "---", "", ...o];
  return (
    r && a.push("", r),
    i && a.push("", `\u76F8\u5C0D\u4F4D\u7F6E\uFF1A${i}`),
    a.join(`
`)
  );
}
function Mk(e, t) {
  let r = [`[${e.label}]`, e.fileName ? e.fileName : "", e.duration ? `${e.duration}s` : ""]
    .filter(Boolean)
    .join(" ");
  return t.trim() === ""
    ? r
    : `${r}

${t.trim()}`;
}
function Pi(e, t, r, n) {
  return dm({ stage: e, kind: t, temp_paths: r, final_paths: n });
}
function Ok(e, t) {
  let r = e.map((n) => [`[${xf(n.media_field)}]`, n.original_name || ""].filter(Boolean).join(" "));
  return (
    t.trim() !== "" && r.push("", t.trim()),
    r.join(`
`)
  );
}
async function Ys(e, t) {
  let { store: r, octokit: n, config: s } = e.services,
    o = e.chat.id;
  if (await Ke(r, o)) {
    await e.reply(
      "\u{1F99E} \u9019\u500B\u6B04\u4F4D\u8ACB\u76F4\u63A5\u8F38\u5165\u6587\u5B57\uFF0C\u4E0D\u63A5\u53D7\u5A92\u9AD4\u8A0A\u606F\u3002",
    );
    return;
  }
  if (await sr(r, o)) {
    await e.reply(
      "\u26A0\uFE0F \u6392\u7A0B\u8A2D\u5B9A\u4E2D\u8ACB\u4F7F\u7528\u6587\u5B57\u56DE\u8986",
    );
    return;
  }
  let l = await Ge(r, o);
  if (!l) {
    await e.reply(
      "\u26A0\uFE0F \u76EE\u524D\u6C92\u6709\u6D3B\u8E8D\u7684 Issue\uFF0C\u8ACB\u5148\u4F7F\u7528 /new \u5EFA\u7ACB\u65B0 Issue\u3002",
    );
    return;
  }
  let c = await Js(n, s.github.owner, s.github.repo, l),
    d = !c.acceptsDispatch;
  if (!c.branchExists) {
    let Pe = {
        message_id: e.message?.message_id,
        date: e.message?.date,
        from: e.message?.from,
        chat: e.message?.chat,
      },
      ut = e.message?.caption ?? "",
      Me = Vs(Pe, { content: Mk(t, ut) });
    (await n.rest.issues.createComment({
      owner: s.github.owner,
      repo: s.github.repo,
      issue_number: l,
      body: Me,
    }),
      await e.reply(c.restingMessage));
    return;
  }
  let y = (await e.api.getFile(t.fileId)).file_path;
  if (!y) return;
  let _ = `${s.telegram.apiBaseUrl}/file/bot${s.telegram.botToken}/${y}`,
    I = await fetch(_);
  if (!I.ok) return;
  let P = await I.arrayBuffer(),
    S = Cf(P),
    U = t.fileName ?? y.split("/").pop() ?? "file",
    K = eu(U, tu(t.field, U)),
    Ce = Date.now(),
    Re = Rf(String(Ce), K),
    Y = `issue-${l}`;
  await n.rest.repos.createOrUpdateFileContents({
    owner: s.github.owner,
    repo: s.github.repo,
    path: Re,
    message: `chore: upload telegram ${t.field} ${U}`,
    content: S,
    branch: Y,
  });
  let he = {
      message_id: e.message?.message_id,
      date: e.message?.date,
      from: e.message?.from,
      chat: e.message?.chat,
    },
    ve = e.message?.caption ?? "",
    ye = {
      field: t.field,
      label: t.label,
      originalName: K,
      storedFileName: K,
      mimeType: t.mimeType,
      duration: t.duration,
      rawUrl: Ai(s.github.owner, s.github.repo, Y, Re),
      repoPath: Re,
      messageId: e.message?.message_id ?? null,
    },
    fe = xi(he, [ye], ve, Pi("pending", "single", [Re], [])),
    X;
  try {
    X = await n.rest.issues.createComment({
      owner: s.github.owner,
      repo: s.github.repo,
      issue_number: l,
      body: fe,
    });
  } catch (Pe) {
    throw (await Kn(e, Y, [Re], `chore: cleanup failed pending telegram ${t.field} upload`), Pe);
  }
  if (typeof X.data.id == "number") {
    let Pe = Af(X.data.id, K);
    await n.rest.repos.createOrUpdateFileContents({
      owner: s.github.owner,
      repo: s.github.repo,
      path: Pe,
      message: `chore: attach telegram ${t.field} to comment #${X.data.id}`,
      content: S,
      branch: Y,
    });
    let ut = Ai(s.github.owner, s.github.repo, Y, Pe),
      Me = { ...ye, rawUrl: ut, repoPath: Pe },
      Qe = Zl(ve, [Me]);
    await Zr(n, s.github.owner, s.github.repo, l, X.data.id, Qe);
    let Pr = xi(he, [Me], ve, Pi("finalized", "single", [Re], [Pe]));
    await n.rest.issues.updateComment({
      owner: s.github.owner,
      repo: s.github.repo,
      comment_id: X.data.id,
      body: Pr,
    });
    let Mt = ve.trim() || `[${t.label}] ${Pe}`,
      Ot = {
        type: t.field,
        label: t.label,
        file_name: K,
        mime_type: t.mimeType,
        duration: t.duration,
        github_repo_path: Pe,
        github_html_url: ut || null,
      };
    (await xn(n, s.github.owner, s.github.repo, l, {
      role: "user",
      source: "\u5C0F\u9F8D\u8766",
      issue_number: l,
      comment_id: X.data.id,
      github_comment_url: X.data.html_url ?? null,
      telegram: {
        chat_id: e.message?.chat.id ?? null,
        message_id: e.message?.message_id ?? null,
        user_id: e.message?.from?.id ?? null,
        username: e.message?.from?.username ?? null,
        date: e.message?.date ?? null,
      },
      content: Mt,
      attachments: [Ot],
      created_at: new Date().toISOString(),
    }),
      await Kn(
        e,
        Y,
        [Re],
        `chore: cleanup temp telegram ${t.field} upload for comment #${X.data.id}`,
      ));
  } else await Kn(e, Y, [Re], `chore: cleanup temp telegram ${t.field} upload without comment id`);
  if (!d) {
    let Pe = Ar(he, 0, {
      flow: "media",
      status: "done",
      issueNumber: l,
      commentId: X.data.id,
      messageKind: t.field === "photo" ? "photo" : "file",
      mediaFileId: t.fileId,
    });
    Pe && (await Qt(r, o, e.message.message_id, Pe), X.data.id && (await an(r, X.data.id, Pe)));
  }
  d && (await e.reply(c.restingMessage));
}
async function Nk(e, t, r) {
  let { store: n, octokit: s, config: o } = e.services,
    i = e.services.d1,
    a = e.chat.id;
  if (await Ke(n, a)) {
    await e.reply(
      "\u{1F99E} \u9019\u500B\u6B04\u4F4D\u8ACB\u76F4\u63A5\u8F38\u5165\u6587\u5B57\uFF0C\u4E0D\u63A5\u53D7\u5A92\u9AD4\u8A0A\u606F\u3002",
    );
    return;
  }
  if (await sr(n, a)) {
    await e.reply(
      "\u26A0\uFE0F \u6392\u7A0B\u8A2D\u5B9A\u4E2D\u8ACB\u4F7F\u7528\u6587\u5B57\u56DE\u8986",
    );
    return;
  }
  let d = await Ge(n, a);
  if (!d) {
    await e.reply(
      "\u26A0\uFE0F \u76EE\u524D\u6C92\u6709\u6D3B\u8E8D\u7684 Issue\uFF0C\u8ACB\u5148\u4F7F\u7528 /new \u5EFA\u7ACB\u65B0 Issue\u3002",
    );
    return;
  }
  let m = await Js(s, o.github.owner, o.github.repo, d),
    w = !m.acceptsDispatch,
    y = m.branchExists,
    _ = e.message.message_id,
    I = `issue-${d}`,
    P = Date.now(),
    S = {
      message_id: e.message?.message_id,
      date: e.message?.date,
      from: e.message?.from,
      chat: e.message?.chat,
    },
    U = (e.message?.caption ?? "").trim(),
    K = eu(t.fileName ?? t.fileId, tu(t.field, t.fileName)),
    Ce = ru(K);
  (await i
    .prepare(
      `INSERT OR REPLACE INTO album_queue
         (media_group_id, message_id, file_id, original_name, media_field,
          arrival_ts, issue_number, issue_owner, issue_repo, branch, caption, telegram_meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      r,
      _,
      t.fileId,
      Ce,
      t.field,
      P,
      d,
      o.github.owner,
      o.github.repo,
      I,
      U,
      JSON.stringify({ message_id: S.message_id, date: S.date, from: S.from, chat: S.chat }),
    )
    .run(),
    await new Promise((ae) => setTimeout(ae, Ik)));
  let Y =
    (await i.prepare("DELETE FROM album_queue WHERE media_group_id = ? RETURNING *").bind(r).all())
      .results ?? [];
  if (Y.length === 0) return;
  Y.sort((ae, pt) => ae.message_id - pt.message_id);
  let he =
    Y.map((ae) => ae.caption)
      .filter(Boolean)
      .at(-1) ?? "";
  if (!y) {
    let ae = Y[0],
      pt = S;
    try {
      pt = JSON.parse(ae.telegram_meta);
    } catch {}
    let Fe = Vs(pt, { content: Ok(Y, he) });
    (await s.rest.issues.createComment({
      owner: o.github.owner,
      repo: o.github.repo,
      issue_number: d,
      body: Fe,
    }),
      await e.reply(m.restingMessage));
    return;
  }
  let ve = await Promise.all(
      Y.map(async (ae) => {
        let Fe = (await e.api.getFile(ae.file_id)).file_path;
        if (!Fe) throw new Error(`getFile failed for ${ae.file_id}`);
        let qe = `${o.telegram.apiBaseUrl}/file/bot${o.telegram.botToken}/${Fe}`,
          le = await fetch(qe);
        if (!le.ok) throw new Error(`download failed: ${qe}`);
        let tt = await le.arrayBuffer();
        return { row: ae, base64: Cf(tt) };
      }),
    ),
    ye = [];
  for (let { row: ae, base64: pt } of ve) {
    let Fe = eu(ae.original_name || ae.file_id, tu(ae.media_field, ae.original_name || null)),
      qe = Rf(String(ae.message_id), Fe);
    await s.rest.repos.createOrUpdateFileContents({
      owner: o.github.owner,
      repo: o.github.repo,
      path: qe,
      message: `chore: upload telegram album ${ae.media_field} ${ae.original_name}`,
      content: pt,
      branch: I,
    });
    let le = Ai(o.github.owner, o.github.repo, I, qe),
      tt = xf(ae.media_field);
    ye.push({
      field: ae.media_field,
      label: tt,
      originalName: Fe,
      storedFileName: Fe,
      mimeType: null,
      duration: null,
      rawUrl: le,
      repoPath: qe,
      messageId: ae.message_id,
    });
  }
  let fe = Y[0],
    X = S;
  try {
    X = JSON.parse(fe.telegram_meta);
  } catch {}
  let Pe = ye.map((ae) => ae.repoPath),
    ut = xi(X, ye, he, Pi("pending", "album", Pe, [])),
    Me;
  try {
    Me = await s.rest.issues.createComment({
      owner: o.github.owner,
      repo: o.github.repo,
      issue_number: d,
      body: ut,
    });
  } catch (ae) {
    throw (await Kn(e, I, Pe, `chore: cleanup failed pending telegram album upload ${r}`), ae);
  }
  if (!Number.isInteger(Me.data.id) || Me.data.id <= 0) {
    await Kn(e, I, Pe, `chore: cleanup temp telegram album upload without comment id ${r}`);
    return;
  }
  let Qe = [];
  for (let ae of ye) {
    let pt = ve.find(({ row: le }) => le.message_id === ae.messageId);
    if (!pt) continue;
    let Fe = Af(
      Me.data.id,
      ae.messageId != null ? `${ae.messageId}_${ae.storedFileName}` : ae.storedFileName,
    );
    await s.rest.repos.createOrUpdateFileContents({
      owner: o.github.owner,
      repo: o.github.repo,
      path: Fe,
      message: `chore: attach telegram album item to comment #${Me.data.id}`,
      content: pt.base64,
      branch: I,
    });
    let qe = Ai(o.github.owner, o.github.repo, I, Fe);
    Qe.push({ ...ae, rawUrl: qe, repoPath: Fe });
  }
  let Pr = Zl(he, Qe);
  await Zr(s, o.github.owner, o.github.repo, d, Me.data.id, Pr);
  let Mt = xi(
    X,
    Qe,
    he,
    Pi(
      "finalized",
      "album",
      Pe,
      Qe.map((ae) => ae.repoPath),
    ),
  );
  await s.rest.issues.updateComment({
    owner: o.github.owner,
    repo: o.github.repo,
    comment_id: Me.data.id,
    body: Mt,
  });
  let Ot = xk(Qe, he),
    ro = Pk(Qe);
  if (
    (await xn(s, o.github.owner, o.github.repo, d, {
      role: "user",
      source: "\u5C0F\u9F8D\u8766",
      issue_number: d,
      comment_id: Me.data.id,
      github_comment_url: Me.data.html_url ?? null,
      telegram: {
        chat_id: a,
        message_id: fe.message_id,
        user_id: X.from?.id ?? null,
        username: X.from?.username ?? null,
        date: X.date ?? null,
      },
      content: Ot,
      attachments: ro,
      created_at: new Date().toISOString(),
    }),
    await Kn(e, I, Pe, `chore: cleanup temp telegram album upload for comment #${Me.data.id}`),
    !w)
  ) {
    let ae = Ar(X, 0, {
      flow: "media",
      status: "done",
      issueNumber: d,
      commentId: Me.data.id,
      messageKind: "photo",
    });
    ae && (await Qt(n, a, fe.message_id, ae), Me.data.id && (await an(n, Me.data.id, ae)));
  }
  w && (await e.reply(m.restingMessage));
}
ln.on("message:photo", async (e) => {
  let t = e.message.photo,
    n = {
      field: "photo",
      label: "\u{1F4F7} \u7167\u7247",
      ext: ".jpg",
      fileId: t[t.length - 1].file_id,
      fileName: null,
      mimeType: null,
      duration: null,
    },
    s = e.message.media_group_id;
  s ? await Nk(e, n, s) : await Ys(e, n);
});
ln.on("message:voice", async (e) => {
  let t = e.message.voice;
  await Ys(e, {
    field: "voice",
    label: "\u{1F399}\uFE0F \u8A9E\u97F3",
    ext: ".ogg",
    fileId: t.file_id,
    fileName: null,
    mimeType: t.mime_type ?? null,
    duration: t.duration ?? null,
  });
});
ln.on("message:video", async (e) => {
  let t = e.message.video;
  await Ys(e, {
    field: "video",
    label: "\u{1F3AC} \u5F71\u7247",
    ext: ".mp4",
    fileId: t.file_id,
    fileName: t.file_name ?? null,
    mimeType: t.mime_type ?? null,
    duration: t.duration ?? null,
  });
});
ln.on("message:audio", async (e) => {
  let t = e.message.audio;
  await Ys(e, {
    field: "audio",
    label: "\u{1F3B5} \u97F3\u8A0A",
    ext: "",
    fileId: t.file_id,
    fileName: t.file_name ?? null,
    mimeType: t.mime_type ?? null,
    duration: t.duration ?? null,
  });
});
ln.on("message:document", async (e) => {
  let t = e.message.document;
  await Ys(e, {
    field: "document",
    label: "\u{1F4C4} \u6587\u4EF6",
    ext: "",
    fileId: t.file_id,
    fileName: t.file_name ?? null,
    mimeType: t.mime_type ?? null,
    duration: null,
  });
});
Ie();
mt();
ft();
ft();
Fs();
ft();
Xe();
Ve();
async function Pf(e) {
  let { store: t } = e.services,
    r = e.chat?.id;
  if (!r) return null;
  let n = await be(t, r);
  if (n && n.step === "awaiting_env") return "templates";
  let s = await Ke(t, r);
  return s && s.step === "awaiting_env_input" ? (s.mode === "edit" ? "edit" : "new") : null;
}
async function Mf(e, t) {
  let { store: r, octokit: n, config: s } = e.services,
    o = e.chat?.id;
  if (!o) return !1;
  let i = t === "templates" ? "templates" : t === "edit" ? "edit_flow" : "new_flow",
    a = (e.message?.text ?? "").trim(),
    l,
    c,
    d,
    m;
  if (t === "templates") {
    let S = await be(r, o);
    if (!S || S.step !== "awaiting_env") return !1;
    ((l = S.pendingEnvs ?? []),
      (c = { ...(S.collectedEnvs ?? {}) }),
      (d = S.currentEnvIndex ?? 0),
      (m = S.promptMessageId));
  } else {
    let S = await Ke(r, o);
    if (!S || S.step !== "awaiting_env_input") return !1;
    ((l = S.pendingEnvs ?? []),
      (c = { ...(S.collectedEnvs ?? {}) }),
      (d = S.currentEnvIndex ?? 0),
      (m = S.promptMessageId));
  }
  let w = l[d];
  if (!w) return !1;
  if (!a) {
    let S = await nu(
      e,
      o,
      m,
      "\u26A0\uFE0F \u8ACB\u8F38\u5165\u74B0\u5883\u8B8A\u6578\u7684\u503C",
      { reply_markup: hr(i) },
    );
    if (S && S !== m)
      if (t === "templates") {
        let U = await be(r, o);
        U && (await oe(r, o, { ...U, promptMessageId: S }));
      } else {
        let U = await Ke(r, o);
        U && (await Be(r, o, { ...U, promptMessageId: S }));
      }
    return !0;
  }
  ((c[w] = a), await Gk(e, o));
  let y = d + 1;
  if (y < l.length) {
    let S = l[y],
      U = await nu(
        e,
        o,
        m,
        `\u{1F511} \u8ACB\u8F38\u5165 *${O(S)}* \u7684\u503C

\uFF08${y + 1}/${l.length}\uFF09`,
        { parse_mode: "MarkdownV2", reply_markup: hr(i) },
      );
    if (t === "templates") {
      let K = await be(r, o);
      K && (await oe(r, o, { ...K, collectedEnvs: c, currentEnvIndex: y, promptMessageId: U }));
    } else {
      let K = await Ke(r, o);
      K && (await Be(r, o, { ...K, collectedEnvs: c, currentEnvIndex: y, promptMessageId: U }));
    }
    return !0;
  }
  let { owner: _, repo: I } = s.github,
    P = [];
  for (let [S, U] of Object.entries(c))
    try {
      (await vi(n, _, I, S.trim().toUpperCase(), U.trim()), P.push(S));
    } catch (K) {
      (console.error(`[template-env-collector] Failed to set secret ${S}:`, K),
        await e.reply(
          `\u274C \u8A2D\u5B9A ${S} \u5931\u6557\uFF1A${K instanceof Error ? K.message : String(K)}`,
        ));
    }
  if (t === "templates") {
    let S = await be(r, o);
    S &&
      (await oe(r, o, {
        ...S,
        step: "confirm_install",
        envCheckDone: !0,
        collectedEnvs: {},
        pendingEnvs: [],
        currentEnvIndex: 0,
      }));
  } else {
    let S = await Ke(r, o);
    S &&
      (await Be(r, o, {
        ...S,
        envCheckDone: !0,
        collectedEnvs: {},
        pendingEnvs: [],
        currentEnvIndex: 0,
        step: S.mode === "edit" ? "awaiting_workflow_enabled" : "awaiting_template",
      }));
  }
  if (t === "templates") {
    let S = await be(r, o);
    if (S) {
      let U = `${
        P.length > 0
          ? `\u2705 \u5DF2\u8A2D\u5B9A ${P.length} \u500B\u74B0\u5883\u8B8A\u6578

`
          : ""
      }\u78BA\u8A8D\u5B89\u88DD\u7BC4\u672C *${O(S.templateName)}* \u5230\u9F8D\u8766\u5821\uFF1F`;
      await nu(e, o, m, U, { parse_mode: "MarkdownV2", reply_markup: qo(S.templateName) });
    }
  } else
    P.length > 0 &&
      (await e.reply(`\u2705 \u5DF2\u8A2D\u5B9A ${P.length} \u500B\u74B0\u5883\u8B8A\u6578`));
  return !0;
}
async function Gk(e, t) {
  let r = e.message?.message_id;
  if (r)
    try {
      await e.api.deleteMessage(t, r);
    } catch (n) {
      console.warn("[template-env-collector] failed to delete sensitive input message", {
        chatId: t,
        messageId: r,
        error: n instanceof Error ? n.message : String(n),
      });
    }
}
async function nu(e, t, r, n, s) {
  if (r)
    try {
      return (await e.api.editMessageText(t, r, n, s), r);
    } catch (i) {
      console.warn("[template-env-collector] failed to edit prompt message", {
        chatId: t,
        promptMessageId: r,
        error: i instanceof Error ? i.message : String(i),
      });
    }
  return (await e.reply(n, s)).message_id;
}
ar();
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ [MODULE llm] /llm command — AI provider and model setup flow — BUSINESS (self-added)
// ║ Flow: /llm → provider menu → (reuse existing key / enter new key) → model menu (incl. custom input)
// ║ → writes to issue-N branch's .pi/settings.json (the real source read by issue-1.yml at task time)
// ║ Key is delivered via repository_dispatch(update-llm-secret) to GitHub Actions to write to repo secret,
// ║ and the user's key message is deleted immediately. The provider/model catalog is read from templates/default/githubclaw.json.
// ╚══════════════════════════════════════════════════════════════════════════════
var llmStatePrefix = "llm-setup";
function llmStateKey(e) {
  return `${llmStatePrefix}:${e}`;
}
async function llmGetState(e, t) {
  let r = await e.get(llmStateKey(t));
  return r !== null ? JSON.parse(r) : null;
}
async function llmSetState(e, t, r) {
  await e.put(llmStateKey(t), JSON.stringify(r), { expirationTtl: 900 });
}
async function llmClearState(e, t) {
  await e.delete(llmStateKey(t));
}
async function llmLoadCatalog(e, t, r) {
  let n = await Wp(e, t, r, void 0, "templates/default/githubclaw.json");
  if (!n.content) return null;
  try {
    let s = JSON.parse(n.content);
    return Array.isArray(s.providers) && s.providers.length > 0 ? s : null;
  } catch {
    return null;
  }
}
function llmFindProvider(e, t) {
  return e.providers.find((r) => r.id === t) ?? null;
}
async function llmReadSettings(e, t, r, n) {
  let s = await Wp(e, t, r, `issue-${n}`, ".pi/settings.json");
  if (!s.content) return {};
  try {
    let o = JSON.parse(s.content);
    return o && typeof o == "object" ? o : {};
  } catch {
    return {};
  }
}
async function llmWriteSettings(e, t, r, n, s, o) {
  let i = `issue-${n}`,
    a = await llmReadSettings(e, t, r, n),
    l = { ...a, defaultProvider: s, defaultModel: o };
  await Jy(
    e,
    t,
    r,
    i,
    ".pi/settings.json",
    JSON.stringify(l, null, 2) + `
`,
    `chore: set LLM provider ${s} / model ${o} via /llm`,
  );
}
async function llmSecretExists(e, t, r, n) {
  try {
    return (await e.rest.actions.getRepoSecret({ owner: t, repo: r, secret_name: n }), !0);
  } catch (s) {
    if (yr(s)) return !1;
    throw s;
  }
}
function llmValidateKeyFormat(e, t) {
  let r = t.trim();
  switch (e) {
    case "google":
      if (!r.startsWith("AIzaSy")) return { ok: !1, error: "Gemini API Key format is incorrect; it should start with 'AIzaSy'." };
      break;
    case "anthropic":
      if (!r.startsWith("sk-ant-")) return { ok: !1, error: "Anthropic Claude API Key format is incorrect; it should start with 'sk-ant-'." };
      break;
    case "openai":
      if (!r.startsWith("sk-")) return { ok: !1, error: "OpenAI API Key format is incorrect; it should start with 'sk-'." };
      break;
    case "groq":
      if (!r.startsWith("gsk_")) return { ok: !1, error: "Groq API Key format is incorrect; it should start with 'gsk_'." };
      break;
    case "openrouter":
      if (!r.startsWith("sk-or-v1-")) return { ok: !1, error: "OpenRouter API Key format is incorrect; it should start with 'sk-or-v1-'." };
      break;
  }
  return { ok: !0 };
}
async function llmDispatchSecretUpdate(e, t, r, n, s, o) {
  await e.rest.repos.createDispatchEvent({
    owner: t,
    repo: r,
    event_type: "update-llm-secret",
    client_payload: { provider: n, secret_name: s, api_key: o },
  });
}
async function llmValidateModel(e, t, r) {
  try {
    switch (e) {
      case "openai": {
        let n = await fetch(`https://api.openai.com/v1/models/${encodeURIComponent(r)}`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        return { ok: n.ok, skipped: !1 };
      }
      case "anthropic": {
        let n = await fetch(`https://api.anthropic.com/v1/models/${encodeURIComponent(r)}`, {
          headers: { "x-api-key": t, "anthropic-version": "2023-06-01" },
        });
        return { ok: n.ok, skipped: !1 };
      }
      case "groq": {
        let n = await fetch(`https://api.groq.com/openai/v1/models/${encodeURIComponent(r)}`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        return { ok: n.ok, skipped: !1 };
      }
      case "google": {
        let n = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(r)}?key=${encodeURIComponent(t)}`,
        );
        return { ok: n.ok, skipped: !1 };
      }
      case "openrouter": {
        let n = await fetch("https://openrouter.ai/api/v1/models");
        if (!n.ok) return { ok: !0, skipped: !0 };
        let s = await n.json(),
          o = Array.isArray(s?.data) && s.data.some((i) => i?.id === r);
        return { ok: o, skipped: !1 };
      }
      case "ollama-cloud": {
        let n = await fetch("https://ollama.com/v1/models", {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!n.ok) return { ok: !0, skipped: !0 };
        let s = await n.json(),
          o = Array.isArray(s?.data) && s.data.some((i) => i?.id === r);
        return { ok: o, skipped: !1 };
      }
      default:
        return { ok: !0, skipped: !0 };
    }
  } catch {
    return { ok: !0, skipped: !0 };
  }
}
function llmProviderKeyboard(e) {
  let t = new F();
  for (let r of e.providers) (t.text(`\u{1F916} ${r.label}`, `llm_provider:${r.id}`), t.row());
  return (t.text("❌ Cancel", "llm_cancel:0"), t);
}
function llmKeyActionKeyboard() {
  return new F()
    .text("♻️ Reuse existing Key", "llm_key:reuse")
    .row()
    .text("\u{1F511} Enter a new API Key", "llm_key:new")
    .row()
    .text("❌ Cancel", "llm_cancel:0");
}
function llmModelKeyboard(e) {
  let t = new F();
  for (let r = 0; r < e.length; r++) (t.text(e[r].label ?? e[r].value, `llm_model:${r}`), t.row());
  return (
    t.text("✍️ Custom model name input", "llm_model_custom:0"),
    t.row(),
    t.text("❌ Cancel", "llm_cancel:0"),
    t
  );
}
async function llmShowModelMenu(e, t, r) {
  let n = r.provider,
    s = r.models ?? [],
    o = `\u{1F9E0} Provider: ${n}
Choose a model to use, or pick "Custom input":`,
    i = { reply_markup: llmModelKeyboard(s) };
  r.promptMessageId
    ? await e.api
        .editMessageText(t, r.promptMessageId, o, i)
        .catch(async () => {
          let a = await e.reply(o, i);
          await llmSetState(e.services.store, t, { ...r, promptMessageId: a.message_id });
        })
    : await e.reply(o, i).then(async (a) => {
        await llmSetState(e.services.store, t, { ...r, promptMessageId: a.message_id });
      });
}
async function llmFinish(e, t, r, n) {
  let { octokit: s, store: o, config: i } = e.services,
    { owner: a, repo: l } = i.github;
  try {
    await llmWriteSettings(s, a, l, r.issueNumber, r.provider, n);
  } catch (d) {
    let m = d instanceof Error ? d.message : String(d);
    await e.reply(
      `❌ Failed to write .pi/settings.json: ${m}
Please confirm the issue-${r.issueNumber} branch exists, then retry /llm.`,
    );
    return;
  }
  await llmClearState(o, t);
  let c = `✅ Set #${r.issueNumber} AI provider: ${r.provider}
\u{1F9E0} Model: ${n}${r.keyDispatched ? `
\u{1F510} API Key has been sent to GitHub Actions to write to repo secret (${r.secretName}); it takes effect in tens of seconds.` : ""}`;
  r.promptMessageId
    ? await e.api.editMessageText(t, r.promptMessageId, c).catch(() => e.reply(c))
    : await e.reply(c);
}
var llmComposer = new se();
llmComposer.command("llm", async (e) => {
  let { store: t, octokit: r, config: n } = e.services,
    s = e.chat?.id;
  if (!s) return;
  let { owner: o, repo: i } = n.github,
    a = await Ge(t, s);
  if (!a) {
    await e.reply(
      "⚠️ No Lobster selected yet. Please use /list to pick one first. (LLM settings are per-Lobster.)",
    );
    return;
  }
  let l;
  try {
    l = await llmLoadCatalog(r, o, i);
  } catch (m) {
    let w = m instanceof Error ? m.message : String(m);
    await e.reply(`❌ Failed to load provider catalog: ${w}`);
    return;
  }
  if (!l) {
    await e.reply(
      "❌ Provider catalog not found (templates/default/githubclaw.json). Please ensure the template is synced.",
    );
    return;
  }
  let c = await llmReadSettings(r, o, i, a).catch(() => ({})),
    d = [
      `\u{1F9E0} #${a} current LLM settings:`,
      `Provider: ${c.defaultProvider ?? "(not set)"}`,
      `Model: ${c.defaultModel ?? "(not set)"}`,
      "",
      "Choose a new AI provider:",
    ].join(`
`);
  await llmSetState(t, s, { step: "selecting_provider", issueNumber: a });
  await e.reply(d, { reply_markup: llmProviderKeyboard(l) });
});
llmComposer.callbackQuery(/^llm_provider:/, async (e) => {
  let { store: t, octokit: r, config: n } = e.services,
    s = e.chat?.id;
  if (!s) return;
  let o = await llmGetState(t, s);
  if (!o) {
    await e.answerCallbackQuery("⚠️ Menu has expired. Please re-run /llm.");
    return;
  }
  let i = e.callbackQuery.data.slice("llm_provider:".length),
    { owner: a, repo: l } = n.github,
    c = await llmLoadCatalog(r, a, l).catch(() => null),
    d = c ? llmFindProvider(c, i) : null;
  if (!d) {
    await e.answerCallbackQuery("⚠️ Invalid provider.");
    return;
  }
  await e.answerCallbackQuery();
  let m = e.callbackQuery.message?.message_id ?? o.promptMessageId,
    w = {
      ...o,
      provider: d.id,
      secretName: d.secretName,
      models: (d.models ?? []).map((_) => ({ value: _.value, label: _.label })),
      promptMessageId: m,
    },
    y = await llmSecretExists(r, a, l, d.secretName).catch(() => !1);
  if (y) {
    ((w.step = "choosing_key_action"), await llmSetState(t, s, w));
    let _ = `\u{1F511} Detected an existing repo secret: ${d.secretName}
Reuse the existing Key, or enter a new one?`,
      I = { reply_markup: llmKeyActionKeyboard() };
    m
      ? await e.api.editMessageText(s, m, _, I).catch(() => e.reply(_, I))
      : await e.reply(_, I);
  } else {
    ((w.step = "awaiting_llm_key"), await llmSetState(t, s, w));
    let _ = `\u{1F510} Please reply directly with your ${d.label} API Key.
For security, your Key message will be deleted immediately after reading, and sent to GitHub Actions to write to repo secret (${d.secretName}); it will not remain in the chat.`;
    m
      ? await e.api.editMessageText(s, m, _).catch(() => e.reply(_))
      : await e.reply(_);
  }
});
llmComposer.callbackQuery(/^llm_key:/, async (e) => {
  let { store: t } = e.services,
    r = e.chat?.id;
  if (!r) return;
  let n = await llmGetState(t, r);
  if (!n || n.step !== "choosing_key_action") {
    await e.answerCallbackQuery("⚠️ Menu has expired. Please re-run /llm.");
    return;
  }
  await e.answerCallbackQuery();
  let s = e.callbackQuery.data.slice("llm_key:".length),
    o = e.callbackQuery.message?.message_id ?? n.promptMessageId;
  if (s === "reuse") {
    let i = { ...n, step: "selecting_model", promptMessageId: o };
    (await llmSetState(t, r, i), await llmShowModelMenu(e, r, i));
  } else {
    let i = { ...n, step: "awaiting_llm_key", promptMessageId: o };
    await llmSetState(t, r, i);
    let a = `\u{1F510} Please reply directly with your new API Key.
The message will be deleted immediately after reading, and sent to GitHub Actions to write to repo secret (${n.secretName}).`;
    o
      ? await e.api.editMessageText(r, o, a).catch(() => e.reply(a))
      : await e.reply(a);
  }
});
llmComposer.callbackQuery(/^llm_model:/, async (e) => {
  let { store: t } = e.services,
    r = e.chat?.id;
  if (!r) return;
  let n = await llmGetState(t, r);
  if (!n || n.step !== "selecting_model") {
    await e.answerCallbackQuery("⚠️ Menu has expired. Please re-run /llm.");
    return;
  }
  let s = Number(e.callbackQuery.data.slice("llm_model:".length)),
    o = Array.isArray(n.models) ? n.models[s] : null;
  if (!o) {
    await e.answerCallbackQuery("⚠️ Invalid model option.");
    return;
  }
  (await e.answerCallbackQuery(), await llmFinish(e, r, n, o.value));
});
llmComposer.callbackQuery(/^llm_model_custom:/, async (e) => {
  let { store: t } = e.services,
    r = e.chat?.id;
  if (!r) return;
  let n = await llmGetState(t, r);
  if (!n || n.step !== "selecting_model") {
    await e.answerCallbackQuery("⚠️ Menu has expired. Please re-run /llm.");
    return;
  }
  await e.answerCallbackQuery();
  let s = e.callbackQuery.message?.message_id ?? n.promptMessageId,
    o = { ...n, step: "awaiting_llm_model_input", promptMessageId: s };
  await llmSetState(t, r, o);
  let i = `✍️ Please reply directly with the model name (e.g. ${n.models?.[0]?.value ?? "gpt-5-mini"}):`;
  s
    ? await e.api.editMessageText(r, s, i).catch(() => e.reply(i))
    : await e.reply(i);
});
llmComposer.callbackQuery(/^llm_cancel:/, async (e) => {
  let { store: t } = e.services,
    r = e.chat?.id;
  if (!r) return;
  (await llmClearState(t, r), await e.answerCallbackQuery("Cancelled"));
  let n = e.callbackQuery.message?.message_id;
  n &&
    (await e.api
      .editMessageText(r, n, "❌ LLM setup cancelled.")
      .catch(() => {}));
});
llmComposer.on("message:text", async (e, t) => {
  let r = e.message.text;
  if (!r || r.startsWith("/")) {
    await t();
    return;
  }
  let { store: n, octokit: s, config: o } = e.services,
    i = e.chat?.id;
  if (!i) {
    await t();
    return;
  }
  let a = await llmGetState(n, i);
  if (!a || (a.step !== "awaiting_llm_key" && a.step !== "awaiting_llm_model_input")) {
    await t();
    return;
  }
  if (a.step === "awaiting_llm_key") {
    let l = r.trim(),
      c = e.message.message_id;
    try {
      await e.api.deleteMessage(i, c);
    } catch (m) {
      console.warn("[/llm] Failed to delete API Key message", {
        chatId: i,
        error: m instanceof Error ? m.message : String(m),
      });
    }
    if (!l) {
      await e.reply("⚠️ Key cannot be empty. Please enter it again.");
      return;
    }
    let formatCheck = llmValidateKeyFormat(a.provider, l);
    if (!formatCheck.ok) {
      await e.reply(`⚠️ ${formatCheck.error}`);
      return;
    }
    let { owner: d, repo: m } = o.github;
    try {
      await llmDispatchSecretUpdate(s, d, m, a.provider, a.secretName, l);
    } catch (y) {
      let _ = y instanceof Error ? y.message : String(y);
      await e.reply(`❌ Failed to trigger secret update: ${_}`);
      return;
    }
    let w = { ...a, step: "selecting_model", apiKey: l, keyDispatched: !0 };
    (await llmSetState(n, i, w), await llmShowModelMenu(e, i, w));
    return;
  }
  let l = r.trim();
  if (!l) {
    await e.reply("⚠️ Model name cannot be empty. Please enter it again.");
    return;
  }
  if (a.apiKey) {
    let c = await llmValidateModel(a.provider, a.apiKey, l);
    if (!c.ok) {
      await e.reply(
        `❌ Validation failed: provider ${a.provider} cannot find model "${l}". Please confirm the name and try again.`,
      );
      return;
    }
  }
  await llmFinish(e, i, a, l);
});
var su = new se();
su.on("message:text", async (e) => {
  let t = e.message.text;
  if (!t || t.startsWith("/")) return;
  let { store: r, octokit: n, config: s } = e.services,
    o = e.chat.id,
    i = await be(r, o);
  if (i && If(i.step) && (await Sf(e))) return;
  let a = await Pf(e);
  if (a) {
    await Mf(e, a);
    return;
  }
  let l = await at(r, o);
  if (l && l.step === "awaiting_env") {
    await Pm(e);
    return;
  }
  if (await sr(r, o)) {
    await ql(e);
    return;
  }
  if (await Ke(r, o)) {
    await wl(e);
    return;
  }
  let m = await Ge(r, o);
  if (!m) {
    await e.reply(
      "\u76EE\u524D\u6C92\u6709\u4F5C\u7528\u4E2D\u7684 Issue\uFF0C\u8ACB\u5148\u7528 /new \u5EFA\u7ACB\u4E00\u500B\u3002",
    );
    return;
  }
  let w = await Js(n, s.github.owner, s.github.repo, m),
    y = !w.acceptsDispatch,
    _ = y ? null : await e.reply("\u{1F4AC} \u6B63\u5728\u8655\u7406\u8A0A\u606F..."),
    I = Vs(
      {
        message_id: e.message.message_id,
        date: e.message.date,
        from: e.message.from,
        chat: e.message.chat,
      },
      { content: t },
    ),
    P = await n.rest.issues.createComment({
      owner: s.github.owner,
      repo: s.github.repo,
      issue_number: m,
      body: I,
    });
  if (
    (typeof P.data.id == "number" &&
      w.branchExists &&
      (await Zr(n, s.github.owner, s.github.repo, m, P.data.id, t),
      await xn(n, s.github.owner, s.github.repo, m, {
        role: "user",
        source: "\u5C0F\u9F8D\u8766",
        issue_number: m,
        comment_id: P.data.id,
        github_comment_url: P.data.html_url ?? null,
        telegram: {
          chat_id: e.message.chat.id,
          message_id: e.message.message_id,
          user_id: e.message.from?.id ?? null,
          username: e.message.from?.username ?? null,
          date: e.message.date ?? null,
        },
        content: t,
        created_at: new Date().toISOString(),
      })),
    !y && _)
  ) {
    let S = Ar({ chat: { id: o }, message_id: e.message.message_id }, _.message_id, {
      flow: "plain",
      status: "done",
      issueNumber: m,
      commentId: P.data.id,
      messageKind: "text",
    });
    (S && (await Qt(r, o, e.message.message_id, S), P.data.id && (await an(r, P.data.id, S))),
      await e.api.editMessageText(
        o,
        _.message_id,
        "\u{1F4AC} \u5DF2\u6536\u5230\u60A8\u7684\u8A0A\u606F\uFF01",
      ));
    return;
  }
  await e.reply(w.restingMessage);
});
function Of(e, t, r) {
  let n = new $o(e, { ContextConstructor: xd(r) });
  return (
    n.use(Pd(t.telegram)),
    n.use(async (ctx, next) => {
      ctx.language = await getLanguage(ctx.services);
      ctx.t = (key, params) => t(key, params, ctx.language);
      await next();
    }),
    n.use(za),
    n.use(Ko),
    n.use(Va),
    n.use(ri),
    n.use(rl),
    n.use(sl),
    n.use(Gs),
    n.use(Sl),
    n.use(Cl),
    n.use(Fn),
    n.use(Kl),
    n.use(zt),
    n.use(wt),
    n.use(dt),
    n.use(Jt),
    n.use(Tt),
    n.use(kt),
    n.use(Ri),
    n.use(ln),
    n.use(llmComposer),
    n.use(su),
    n.catch((s) => console.error("[Bot Error]", s.error)),
    n
  );
}
var ou = new Rt();
ou.post("*", async (e, t) => {
  let r = e.var.config;
  if (new URL(e.req.url).pathname !== r.telegram.webhookPath) return t();
  if (e.req.header("x-telegram-bot-api-secret-token") !== r.telegram.webhookSecret)
    return e.json({ ok: !1, error: "Invalid secret" }, 401);
  let o = Of(r.telegram.botToken, r, {
    octokit: e.var.octokit,
    store: e.var.store,
    d1: e.var.d1,
    ai: e.var.ai,
    config: r,
  });
  await o.init();
  let i = await e.req.json();
  return (
    e.executionCtx.waitUntil(
      o.handleUpdate(i).catch((a) => {
        console.error("[Bot Error]", a);
      }),
    ),
    e.json({ ok: !0 })
  );
});
var iu = new TextEncoder();
function Fk(e) {
  let r = e.match(/[\dA-F]{2}/gi).map(function (n) {
    return parseInt(n, 16);
  });
  return new Uint8Array(r);
}
function $k(e) {
  return Array.prototype.map
    .call(new Uint8Array(e), (t) => t.toString(16).padStart(2, "0"))
    .join("");
}
async function Nf(e) {
  return crypto.subtle.importKey(
    "raw",
    iu.encode(e),
    { name: "HMAC", hash: { name: "SHA-256" } },
    !1,
    ["sign", "verify"],
  );
}
async function Gf(e, t) {
  if (!e || !t)
    throw new TypeError("[@octokit/webhooks-methods] secret & payload required for sign()");
  if (typeof t != "string")
    throw new TypeError("[@octokit/webhooks-methods] payload must be a string");
  let r = "sha256",
    n = await crypto.subtle.sign("HMAC", await Nf(e), iu.encode(t));
  return `${r}=${$k(n)}`;
}
async function Mi(e, t, r) {
  if (!e || !t || !r)
    throw new TypeError("[@octokit/webhooks-methods] secret, eventPayload & signature required");
  if (typeof t != "string")
    throw new TypeError("[@octokit/webhooks-methods] eventPayload must be a string");
  return await crypto.subtle.verify(
    "HMAC",
    await Nf(e),
    Fk(r.replace("sha256=", "")),
    iu.encode(t),
  );
}
async function Ff(e, t, r, n) {
  if (await Mi(e, t, r)) return !0;
  if (n !== void 0)
    for (let o of n) {
      let i = await Mi(o, t, r);
      if (i) return i;
    }
  return !1;
}
var Df = (e = {}) => (
    typeof e.debug != "function" && (e.debug = () => {}),
    typeof e.info != "function" && (e.info = () => {}),
    typeof e.warn != "function" && (e.warn = console.warn.bind(console)),
    typeof e.error != "function" && (e.error = console.error.bind(console)),
    e
  ),
  Lk = [
    "branch_protection_configuration",
    "branch_protection_configuration.disabled",
    "branch_protection_configuration.enabled",
    "branch_protection_rule",
    "branch_protection_rule.created",
    "branch_protection_rule.deleted",
    "branch_protection_rule.edited",
    "check_run",
    "check_run.completed",
    "check_run.created",
    "check_run.requested_action",
    "check_run.rerequested",
    "check_suite",
    "check_suite.completed",
    "check_suite.requested",
    "check_suite.rerequested",
    "code_scanning_alert",
    "code_scanning_alert.appeared_in_branch",
    "code_scanning_alert.closed_by_user",
    "code_scanning_alert.created",
    "code_scanning_alert.fixed",
    "code_scanning_alert.reopened",
    "code_scanning_alert.reopened_by_user",
    "commit_comment",
    "commit_comment.created",
    "create",
    "custom_property",
    "custom_property.created",
    "custom_property.deleted",
    "custom_property.promote_to_enterprise",
    "custom_property.updated",
    "custom_property_values",
    "custom_property_values.updated",
    "delete",
    "dependabot_alert",
    "dependabot_alert.auto_dismissed",
    "dependabot_alert.auto_reopened",
    "dependabot_alert.created",
    "dependabot_alert.dismissed",
    "dependabot_alert.fixed",
    "dependabot_alert.reintroduced",
    "dependabot_alert.reopened",
    "deploy_key",
    "deploy_key.created",
    "deploy_key.deleted",
    "deployment",
    "deployment.created",
    "deployment_protection_rule",
    "deployment_protection_rule.requested",
    "deployment_review",
    "deployment_review.approved",
    "deployment_review.rejected",
    "deployment_review.requested",
    "deployment_status",
    "deployment_status.created",
    "discussion",
    "discussion.answered",
    "discussion.category_changed",
    "discussion.closed",
    "discussion.created",
    "discussion.deleted",
    "discussion.edited",
    "discussion.labeled",
    "discussion.locked",
    "discussion.pinned",
    "discussion.reopened",
    "discussion.transferred",
    "discussion.unanswered",
    "discussion.unlabeled",
    "discussion.unlocked",
    "discussion.unpinned",
    "discussion_comment",
    "discussion_comment.created",
    "discussion_comment.deleted",
    "discussion_comment.edited",
    "fork",
    "github_app_authorization",
    "github_app_authorization.revoked",
    "gollum",
    "installation",
    "installation.created",
    "installation.deleted",
    "installation.new_permissions_accepted",
    "installation.suspend",
    "installation.unsuspend",
    "installation_repositories",
    "installation_repositories.added",
    "installation_repositories.removed",
    "installation_target",
    "installation_target.renamed",
    "issue_comment",
    "issue_comment.created",
    "issue_comment.deleted",
    "issue_comment.edited",
    "issue_dependencies",
    "issue_dependencies.blocked_by_added",
    "issue_dependencies.blocked_by_removed",
    "issue_dependencies.blocking_added",
    "issue_dependencies.blocking_removed",
    "issues",
    "issues.assigned",
    "issues.closed",
    "issues.deleted",
    "issues.demilestoned",
    "issues.edited",
    "issues.labeled",
    "issues.locked",
    "issues.milestoned",
    "issues.opened",
    "issues.pinned",
    "issues.reopened",
    "issues.transferred",
    "issues.typed",
    "issues.unassigned",
    "issues.unlabeled",
    "issues.unlocked",
    "issues.unpinned",
    "issues.untyped",
    "label",
    "label.created",
    "label.deleted",
    "label.edited",
    "marketplace_purchase",
    "marketplace_purchase.cancelled",
    "marketplace_purchase.changed",
    "marketplace_purchase.pending_change",
    "marketplace_purchase.pending_change_cancelled",
    "marketplace_purchase.purchased",
    "member",
    "member.added",
    "member.edited",
    "member.removed",
    "membership",
    "membership.added",
    "membership.removed",
    "merge_group",
    "merge_group.checks_requested",
    "merge_group.destroyed",
    "meta",
    "meta.deleted",
    "milestone",
    "milestone.closed",
    "milestone.created",
    "milestone.deleted",
    "milestone.edited",
    "milestone.opened",
    "org_block",
    "org_block.blocked",
    "org_block.unblocked",
    "organization",
    "organization.deleted",
    "organization.member_added",
    "organization.member_invited",
    "organization.member_removed",
    "organization.renamed",
    "package",
    "package.published",
    "package.updated",
    "page_build",
    "personal_access_token_request",
    "personal_access_token_request.approved",
    "personal_access_token_request.cancelled",
    "personal_access_token_request.created",
    "personal_access_token_request.denied",
    "ping",
    "project",
    "project.closed",
    "project.created",
    "project.deleted",
    "project.edited",
    "project.reopened",
    "project_card",
    "project_card.converted",
    "project_card.created",
    "project_card.deleted",
    "project_card.edited",
    "project_card.moved",
    "project_column",
    "project_column.created",
    "project_column.deleted",
    "project_column.edited",
    "project_column.moved",
    "projects_v2",
    "projects_v2.closed",
    "projects_v2.created",
    "projects_v2.deleted",
    "projects_v2.edited",
    "projects_v2.reopened",
    "projects_v2_item",
    "projects_v2_item.archived",
    "projects_v2_item.converted",
    "projects_v2_item.created",
    "projects_v2_item.deleted",
    "projects_v2_item.edited",
    "projects_v2_item.reordered",
    "projects_v2_item.restored",
    "projects_v2_status_update",
    "projects_v2_status_update.created",
    "projects_v2_status_update.deleted",
    "projects_v2_status_update.edited",
    "public",
    "pull_request",
    "pull_request.assigned",
    "pull_request.auto_merge_disabled",
    "pull_request.auto_merge_enabled",
    "pull_request.closed",
    "pull_request.converted_to_draft",
    "pull_request.demilestoned",
    "pull_request.dequeued",
    "pull_request.edited",
    "pull_request.enqueued",
    "pull_request.labeled",
    "pull_request.locked",
    "pull_request.milestoned",
    "pull_request.opened",
    "pull_request.ready_for_review",
    "pull_request.reopened",
    "pull_request.review_request_removed",
    "pull_request.review_requested",
    "pull_request.synchronize",
    "pull_request.unassigned",
    "pull_request.unlabeled",
    "pull_request.unlocked",
    "pull_request_review",
    "pull_request_review.dismissed",
    "pull_request_review.edited",
    "pull_request_review.submitted",
    "pull_request_review_comment",
    "pull_request_review_comment.created",
    "pull_request_review_comment.deleted",
    "pull_request_review_comment.edited",
    "pull_request_review_thread",
    "pull_request_review_thread.resolved",
    "pull_request_review_thread.unresolved",
    "push",
    "registry_package",
    "registry_package.published",
    "registry_package.updated",
    "release",
    "release.created",
    "release.deleted",
    "release.edited",
    "release.prereleased",
    "release.published",
    "release.released",
    "release.unpublished",
    "repository",
    "repository.archived",
    "repository.created",
    "repository.deleted",
    "repository.edited",
    "repository.privatized",
    "repository.publicized",
    "repository.renamed",
    "repository.transferred",
    "repository.unarchived",
    "repository_advisory",
    "repository_advisory.published",
    "repository_advisory.reported",
    "repository_dispatch",
    "repository_dispatch.sample.collected",
    "repository_import",
    "repository_ruleset",
    "repository_ruleset.created",
    "repository_ruleset.deleted",
    "repository_ruleset.edited",
    "repository_vulnerability_alert",
    "repository_vulnerability_alert.create",
    "repository_vulnerability_alert.dismiss",
    "repository_vulnerability_alert.reopen",
    "repository_vulnerability_alert.resolve",
    "secret_scanning_alert",
    "secret_scanning_alert.assigned",
    "secret_scanning_alert.created",
    "secret_scanning_alert.publicly_leaked",
    "secret_scanning_alert.reopened",
    "secret_scanning_alert.resolved",
    "secret_scanning_alert.unassigned",
    "secret_scanning_alert.validated",
    "secret_scanning_alert_location",
    "secret_scanning_alert_location.created",
    "secret_scanning_scan",
    "secret_scanning_scan.completed",
    "security_advisory",
    "security_advisory.published",
    "security_advisory.updated",
    "security_advisory.withdrawn",
    "security_and_analysis",
    "sponsorship",
    "sponsorship.cancelled",
    "sponsorship.created",
    "sponsorship.edited",
    "sponsorship.pending_cancellation",
    "sponsorship.pending_tier_change",
    "sponsorship.tier_changed",
    "star",
    "star.created",
    "star.deleted",
    "status",
    "sub_issues",
    "sub_issues.parent_issue_added",
    "sub_issues.parent_issue_removed",
    "sub_issues.sub_issue_added",
    "sub_issues.sub_issue_removed",
    "team",
    "team.added_to_repository",
    "team.created",
    "team.deleted",
    "team.edited",
    "team.removed_from_repository",
    "team_add",
    "watch",
    "watch.started",
    "workflow_dispatch",
    "workflow_job",
    "workflow_job.completed",
    "workflow_job.in_progress",
    "workflow_job.queued",
    "workflow_job.waiting",
    "workflow_run",
    "workflow_run.completed",
    "workflow_run.in_progress",
    "workflow_run.requested",
  ];
function Dk(e, t = {}) {
  if (typeof e != "string") throw new TypeError("eventName must be of type string");
  if (e === "*")
    throw new TypeError(
      'Using the "*" event with the regular Webhooks.on() function is not supported. Please use the Webhooks.onAny() method instead',
    );
  if (e === "error")
    throw new TypeError(
      'Using the "error" event with the regular Webhooks.on() function is not supported. Please use the Webhooks.onError() method instead',
    );
  if (t.onUnknownEventName !== "ignore" && !Lk.includes(e)) {
    if (t.onUnknownEventName !== "warn")
      throw new TypeError(
        `"${e}" is not a known webhook name (https://developer.github.com/v3/activity/events/types/)`,
      );
    (t.log || console).warn(
      `"${e}" is not a known webhook name (https://developer.github.com/v3/activity/events/types/)`,
    );
  }
}
function au(e, t, r) {
  (e.hooks[t] || (e.hooks[t] = []), e.hooks[t].push(r));
}
function Uf(e, t, r) {
  if (Array.isArray(t)) {
    t.forEach((n) => Uf(e, n, r));
    return;
  }
  (Dk(t, { onUnknownEventName: "warn", log: e.log }), au(e, t, r));
}
function Uk(e, t) {
  au(e, "*", t);
}
function Bk(e, t) {
  au(e, "error", t);
}
function $f(e, t) {
  let r;
  try {
    r = e(t);
  } catch (n) {
    (console.log('FATAL: Error occurred in "error" event handler'), console.log(n));
  }
  r &&
    r.catch &&
    r.catch((n) => {
      (console.log('FATAL: Error occurred in "error" event handler'), console.log(n));
    });
}
function jk(e, t, r) {
  let n = [e.hooks[r], e.hooks["*"]];
  return (t && n.unshift(e.hooks[`${r}.${t}`]), [].concat(...n.filter(Boolean)));
}
function Wk(e, t) {
  let r = e.hooks.error || [];
  if (t instanceof Error) {
    let i = Object.assign(new AggregateError([t], t.message), { event: t });
    return (r.forEach((a) => $f(a, i)), Promise.reject(i));
  }
  if (!t || !t.name) {
    let i = new Error("Event name not passed");
    throw new AggregateError([i], i.message);
  }
  if (!t.payload) {
    let i = new Error("Event name not passed");
    throw new AggregateError([i], i.message);
  }
  let n = jk(e, "action" in t.payload ? t.payload.action : null, t.name);
  if (n.length === 0) return Promise.resolve();
  let s = [],
    o = n.map((i) => {
      let a = Promise.resolve(t);
      return (
        e.transform && (a = a.then(e.transform)),
        a.then((l) => i(l)).catch((l) => s.push(Object.assign(l, { event: t })))
      );
    });
  return Promise.all(o).then(() => {
    if (s.length === 0) return;
    let i = new AggregateError(
      s,
      s.map((a) => a.message).join(`
`),
    );
    throw (Object.assign(i, { event: t }), r.forEach((a) => $f(a, i)), i);
  });
}
function Bf(e, t, r) {
  if (Array.isArray(t)) {
    t.forEach((n) => Bf(e, n, r));
    return;
  }
  if (e.hooks[t]) {
    for (let n = e.hooks[t].length - 1; n >= 0; n--)
      if (e.hooks[t][n] === r) {
        e.hooks[t].splice(n, 1);
        return;
      }
  }
}
function qk(e) {
  let t = { hooks: {}, log: Df(e && e.log) };
  return (
    e && e.transform && (t.transform = e.transform),
    {
      on: Uf.bind(null, t),
      onAny: Uk.bind(null, t),
      onError: Bk.bind(null, t),
      removeListener: Bf.bind(null, t),
      receive: Wk.bind(null, t),
    }
  );
}
async function Kk(e, t) {
  if (!(await Ff(e.secret, t.payload, t.signature, e.additionalSecrets).catch(() => !1))) {
    let s = new Error("[@octokit/webhooks] signature does not match event payload and secret");
    return ((s.event = t), (s.status = 400), e.eventHandler.receive(s));
  }
  let n;
  try {
    n = JSON.parse(t.payload);
  } catch (s) {
    throw ((s.message = "Invalid JSON"), (s.status = 400), new AggregateError([s], s.message));
  }
  return e.eventHandler.receive({ id: t.id, name: t.name, payload: n });
}
var Lf = new TextDecoder("utf-8", { fatal: !1 }),
  m1 = Lf.decode.bind(Lf);
var jf = class {
  sign;
  verify;
  on;
  onAny;
  onError;
  removeListener;
  receive;
  verifyAndReceive;
  constructor(e) {
    if (!e || !e.secret) throw new Error("[@octokit/webhooks] options.secret required");
    let t = {
      eventHandler: qk(e),
      secret: e.secret,
      additionalSecrets: e.additionalSecrets,
      hooks: {},
      log: Df(e.log),
    };
    ((this.sign = Gf.bind(null, e.secret)),
      (this.verify = Mi.bind(null, e.secret)),
      (this.on = t.eventHandler.on),
      (this.onAny = t.eventHandler.onAny),
      (this.onError = t.eventHandler.onError),
      (this.removeListener = t.eventHandler.removeListener),
      (this.receive = t.eventHandler.receive),
      (this.verifyAndReceive = Kk.bind(null, t)));
  }
};
Ie();
Pt();
var Hk = "comment-relay:";
function Wf(e) {
  return `${Hk}${e}`;
}
async function qf(e, t) {
  if (!Number.isInteger(t) || t <= 0) return null;
  let r = await e.get(Wf(t));
  if (r === null) return null;
  let n = Number.parseInt(r, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}
async function Xs(e, t, r) {
  !Number.isInteger(t) ||
    t <= 0 ||
    !Number.isInteger(r) ||
    r <= 0 ||
    (await e.put(Wf(t), String(r)));
}
Xe();
Pt();
function uu(e) {
  return typeof e != "string"
    ? ""
    : e.replace(
        /\r\n/g,
        `
`,
      );
}
function cu(e, t, r = {}) {
  console.log(`[altShiftClawCore] Telegram relay decision
${JSON.stringify({ issueNumber: e?.number ?? null, commentId: t?.id ?? null, ...r }, null, 2)}`);
}
function Zs(e, t, r, n = !1) {
  let s = lr(t.body || "", { stripToolRunStatusPrefix: n }).trim() || "\uFF08\u7A7A\u767D\uFF09";
  if (n) return s;
  let o =
      r === "edited"
        ? `Issue #${e.number} \u7559\u8A00\u5DF2\u66F4\u65B0\uFF1A${e.title}`
        : `Issue #${e.number} \u6709\u65B0\u7559\u8A00\uFF1A${e.title}`,
    i = t.html_url || "";
  return [o, "", s, ...(i ? ["", i] : [])]
    .join(
      `
`,
    )
    .trim();
}
function eo(e, t, r, n = !1) {
  let s = Zs(e, t, r, n);
  return { text: or(s), parseMode: "MarkdownV2" };
}
function Hf(e, t, r, n = !1) {
  if (!n) return eo(e, t, r, !1);
  let s = lr(t.body || "", { stripToolRunStatusPrefix: n }).trim() || "\uFF08\u7A7A\u767D\uFF09";
  return { text: or(s), parseMode: "MarkdownV2" };
}
function zf(e, t, r = "") {
  let n = String(e || "").trim();
  if (!Number.isInteger(t) || t <= 0 || n.length <= t) return n;
  let s = ["[\u5167\u5BB9\u904E\u9577\uFF0C\u5DF2\u622A\u65B7]"];
  r && s.push(r);
  let o = `

${s.join(`
`)}`,
    i = Math.max(0, t - o.length);
  return `${n.slice(0, i).trimEnd()}${o}`.slice(0, t);
}
function Ni(e, t, r, n, s, o = !1) {
  let i = n && typeof n.text == "string" ? n : { text: "" };
  if (i.text.length <= s) return i;
  let a = eo(e, t, r, o);
  if (a.text.length <= s)
    return (
      console.warn(
        `Issue #${e.number} \u7684 Telegram \u8A0A\u606F\u904E\u9577\uFF0C\u6539\u7528\u7D14\u6587\u5B57\u8F49\u9001`,
      ),
      a
    );
  console.warn(
    `Issue #${e.number} \u7684 Telegram \u8A0A\u606F\u904E\u9577\uFF0C\u5C07\u622A\u65B7\u539F\u6587\u5F8C\u91CD\u65B0\u8F49\u63DB MarkdownV2`,
  );
  let l = Zs(e, t, r, o),
    c = zf(l, s, t.html_url || ""),
    d = or(c);
  return d.length <= s ? { text: d, parseMode: "MarkdownV2" } : { text: c };
}
function Qf(e, t, r) {
  let n = t && typeof t.text == "string" ? t : { text: "" };
  if (n.text.length <= r) return n;
  console.warn(
    "Telegram progress relay \u8A0A\u606F\u904E\u9577\uFF0C\u5C07\u622A\u65B7\u539F\u6587\u5F8C\u91CD\u65B0\u8F49\u63DB MarkdownV2",
  );
  let s = lr(e.body || "", { stripToolRunStatusPrefix: !0 }).trim() || "\uFF08\u7A7A\u767D\uFF09",
    o = zf(s, r, e.html_url || ""),
    i = or(o);
  return i.length <= r ? { text: i, parseMode: "MarkdownV2" } : { text: o };
}
function Kf(e) {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Oi(e, t) {
  if (typeof e != "string") return "\u5DF2\u9644\u4E0A\u5716\u7247";
  let r = String(t || "")
      .trim()
      .replace(/^\/+/, ""),
    n = r ? new RegExp(`\\\`${Kf(r)}\\\`|${Kf(r)}`, "g") : null,
    s = /^.*!\[[^\]]*]\([^)]+\).*$\n?/gm;
  return (
    e
      .replace(s, "")
      .split(/\r?\n/)
      .map((i) => {
        if (!n) return i;
        if (/(图片|image|photo)\s*[:：]/i.test(i)) return i.replace(n, "\u5DF2\u9644\u4E0A");
        let a = i.trim();
        return a && n.test(a)
          ? ((n.lastIndex = 0), i.replace(n, "\u5DF2\u9644\u4E0A\u5716\u7247"))
          : ((n.lastIndex = 0), i);
      })
      .join(
        `
`,
      )
      .replace(
        /\n{3,}/g,
        `

`,
      )
      .trim() || "\u5DF2\u9644\u4E0A\u5716\u7247"
  );
}
function lu(e, t, r, n = !1) {
  return n
    ? lr(t?.body || "", { stripToolRunStatusPrefix: n }).trim() || "\uFF08\u7A7A\u767D\uFF09"
    : Zs(e, t, r, !1);
}
function Vf(e, t, r, n, s, o = !1) {
  if (!s || typeof n?.text != "string") return n;
  if (n.parseMode === "MarkdownV2") {
    let i = lu(e, t, r, o);
    return { ...n, text: or(Oi(i, s.path)) };
  }
  if (!n.parseMode) {
    let i = lu(e, t, r, o);
    return { ...n, text: Oi(i, s.path) };
  }
  return { ...n, text: Oi(n.text, s.path) };
}
function Jf(e, t, r, n, s, o, i = !1) {
  if (!s || !o) return n;
  let a = lu(e, t, r, i),
    l = Oi(a, s.path),
    c = [
      l,
      "",
      "\u5716\u7247\u8ACB\u9EDE\u64CA\u9023\u7D50\u6253\u958B\uFF1A",
      `[\u958B\u555F\u5716\u7247](${o})`,
    ]
      .join(
        `
`,
      )
      .trim();
  return n.parseMode === "MarkdownV2"
    ? { ...n, text: or(c) }
    : {
        ...n,
        text: `${l}
\u5716\u7247\u8ACB\u9EDE\u64CA\u9023\u7D50\u6253\u958B\uFF1A
${o}`,
      };
}
function Yf(e) {
  return (
    String(e || "")
      .trim()
      .split("/")
      .filter(Boolean)
      .at(-1) || "image"
  );
}
Ie();
Xr();
Pt();
function zk(e, t, r) {
  if (typeof r?.html_url == "string" && r.html_url.trim() !== "") return r.html_url.trim();
  let n = e.github.repoFullName,
    s = t?.number,
    o = r?.id;
  return !n || !Number.isInteger(s) || !Number.isInteger(o)
    ? ""
    : `https://github.com/${n}/issues/${s}#issuecomment-${o}`;
}
function Qk(e, t) {
  let r = e.github.repoFullName,
    n = t?.number;
  if (!r || !Number.isInteger(n)) return "";
  let [s, o] = r.split("/");
  return !s || !o
    ? ""
    : `https://github.com/${encodeURIComponent(s)}/${encodeURIComponent(o)}/issues/${n}`;
}
function Vk(e, t, r) {
  let n = e.github.repoFullName,
    s = t?.number,
    o = Rn(s);
  if (!n || !Number.isInteger(s) || s <= 0 || !Number.isInteger(r)) return "";
  let [i, a] = n.split("/");
  if (!i || !a) return "";
  let l = `artifacts/${r}`;
  return [
    "https://github.com",
    encodeURIComponent(i),
    encodeURIComponent(a),
    "tree",
    encodeURIComponent(o),
    l,
  ].join("/");
}
function Xf(e, t) {
  if (!t?.path || !t.branch) return "";
  let r = e.github.repoFullName,
    [n, s] = r.split("/");
  if (!n || !s) return "";
  let o = t.path
    .split("/")
    .filter(Boolean)
    .map((i) => encodeURIComponent(i))
    .join("/");
  return o
    ? [
        "https://github.com",
        encodeURIComponent(n),
        encodeURIComponent(s),
        "blob",
        encodeURIComponent(t.branch),
        o,
      ].join("/")
    : "";
}
function Jk(e) {
  return e.match(/技能\s+\*\*([^*\r\n]+)\*\*/)?.[1]?.trim() || "";
}
function Yk(e) {
  if (Cs(e?.body || "")?.source !== "skill-installer") return "";
  let r = Jk(e?.body || "");
  return r
    ? `https://github.com/jeffsia-blacksmith/altShiftClawToolkit/blob/main/skills/${encodeURIComponent(r)}/README.md`
    : "";
}
function Zf(e, t, r) {
  let n = zk(e, t, r) || Qk(e, t),
    s = Yk(r),
    o = Vk(e, t, r?.id);
  if (!n) return;
  let i = new F().url("\u958B\u555F GitHub", n);
  return (
    s
      ? i.url("\u6280\u80FD\u8AAA\u660E", s)
      : o && i.url("\u958B\u555F\u5DE5\u4F5C\u76EE\u9304", o),
    i
  );
}
Xr();
Pt();
var Xk = 10 * 1024 * 1024;
function eg(e, t) {
  let n = um(t?.body || "")?.images?.[0];
  if (n) return { kind: "artifact", branch: n.branch, path: n.path };
  let s = lr(t?.body || ""),
    o = pm(s)[0];
  return o ? { kind: "repo-path", branch: Rn(e?.number), path: o } : null;
}
async function tg(e, t, r) {
  let n = `${e.github.apiBaseUrl}/repos/${e.github.owner}/${e.github.repo}/contents/${t}?ref=${encodeURIComponent(r)}`,
    s = await fetch(n, {
      headers: {
        Authorization: `token ${e.github.token}`,
        Accept: "application/vnd.github.v3.raw",
        "User-Agent": e.github.userAgent,
      },
    });
  if (!s.ok) throw new Error(`\u53D6\u5F97 repo \u6A94\u6848 ${t} \u5931\u6557: ${s.status}`);
  let o = s.headers.get("content-type") || "application/octet-stream";
  return { bytes: new Uint8Array(await s.arrayBuffer()), contentType: o };
}
function rg(e) {
  return e > Xk;
}
ar();
async function to(e, t, r, n, s, o, i, a) {
  !Number.isInteger(s) ||
    s <= 0 ||
    (await qp(e.octokit, e.config.github.owner, e.config.github.repo, t.issue.number, {
      commentId: r.commentId,
      githubCommentUrl: t.comment.html_url ?? null,
      telegram: {
        chat_id: r.chatId,
        message_id: s,
        reply_to_message_id: r.replyToMessageId ?? null,
      },
      content: n.text,
      parse_mode: n.parseMode ?? null,
      relay_action: t.action,
      relay_mode: i,
      message_kind: o,
      attachments: a
        ? [
            {
              type: "photo",
              source_kind: a.kind,
              github_repo_path: a.path,
              github_branch: a.branch,
            },
          ]
        : [],
    }));
}
function ng(e) {
  return ll(e)?.requestTelegramMeta ?? Cs(e)?.requestTelegramMeta ?? null;
}
async function du(e, t, r) {
  if (!e || !Number.isInteger(t) || t <= 0 || !r) return;
  let n = [an(e, t, { ...r, commentId: t })];
  (Number.isInteger(r.requestMessageId) && n.push(Qt(e, r.chatId, r.requestMessageId, r)),
    await Promise.all(n));
}
function Zk(e, t) {
  if (!e || !t)
    return (
      console.warn("issue_comment payload \u7F3A\u5C11 issue \u6216 comment \u6B04\u4F4D"),
      !0
    );
  if (kr(t.body)) return !0;
  if (lm(t.body))
    return (
      console.log(
        `\u7565\u904E Issue #${e.number}\uFF1ALine \u4F86\u6E90\u7559\u8A00\u4E0D\u8F49\u9001 Telegram`,
      ),
      !0
    );
  if (en(t.body, "schedule-flow"))
    return (
      console.log(
        `\u7565\u904E Issue #${e.number}\uFF1A\u6392\u7A0B\u8A2D\u5B9A\u6D41\u7A0B\u7559\u8A00\u4E0D\u8F49\u9001 Telegram`,
      ),
      !0
    );
  let r = ng(t.body),
    n = Tr(t.body) !== null,
    s = !!(Cs(t.body) || ll(t.body));
  return !n && !r && !s
    ? (console.log(
        `\u7565\u904E Issue #${e.number}\uFF1Acomment \u7F3A\u5C11 telegram metadata\uFF0C\u4E0D\u8F49\u9001 Telegram`,
      ),
      !0)
    : !1;
}
async function eE(e, t) {
  let { action: r, issue: n, comment: s } = e,
    { config: o, store: i } = t,
    a = ng(s.body),
    l = kr(n.body),
    c = Number.isInteger(s.id) ? s.id : null,
    d =
      (await _f(i, c)) ??
      (a?.chat_id != null && a?.msg_id != null ? await yf(i, a.chat_id, a.msg_id) : null),
    m = d?.chatId ?? a?.chat_id ?? l?.chat_id;
  if (
    (console.log(
      `\u6B63\u5728\u8655\u7406 Issue #${n.number} \u7684\u65B0\u7559\u8A00\uFF0Cissue telegram-meta=${JSON.stringify(l)} request telegram-meta=${JSON.stringify(a)}`,
    ),
    !m)
  )
    return (
      console.log(`\u7565\u904E Issue #${n.number}\uFF1A\u6C92\u6709\u53EF\u7528\u7684 chat_id`),
      null
    );
  let w =
      typeof a?.msg_id == "number"
        ? a.msg_id
        : Number.isInteger(d?.requestMessageId)
          ? d.requestMessageId
          : typeof l?.msg_id == "number"
            ? l.msg_id
            : void 0,
    y = Zf(o, n, s),
    _ = r === "edited" ? await qf(i, c) : null;
  return {
    chatId: m,
    replyToMessageId: w,
    replyMarkup: y,
    relayedMessageId: _,
    progressRelayTarget: d,
    shouldEditProgressMessage: !!d,
    commentId: c,
  };
}
function tE(e, t, r) {
  let { action: n, issue: s, comment: o } = e,
    { progressRelayTarget: i, shouldEditProgressMessage: a } = r,
    l = !0,
    c = eg(s, o),
    d =
      a && (i?.messageKind === "photo" || c)
        ? Math.min(t.telegram.maxMessageLength, 1024)
        : t.telegram.maxMessageLength,
    m = "plain-body-only",
    w;
  a
    ? ((m = l ? "progress-edit-body-only" : "progress-edit"), (w = Qf(o, Hf(s, o, n, l), d)))
    : l
      ? ((m = "plain-body-only"),
        (w = Ni(s, o, n, eo(s, o, n, !0), t.telegram.maxMessageLength, !0)))
      : ((m = "full-relay"), (w = Ni(s, o, n, eo(s, o, n, !1), t.telegram.maxMessageLength, !1)));
  let y = c ? { ...w, text: w.text } : w;
  return (
    c && (w = Vf(s, o, n, w, c, l)),
    { relayMessage: w, textRelayMessage: y, relayPhotoCandidate: c, relayMode: m, relayBodyOnly: l }
  );
}
async function rE(e, t, r, n, s) {
  let { issue: o, comment: i, action: a } = t,
    { config: l, store: c } = r,
    {
      chatId: d,
      replyToMessageId: m,
      replyMarkup: w,
      relayedMessageId: y,
      progressRelayTarget: _,
      shouldEditProgressMessage: I,
      commentId: P,
    } = n,
    { relayMessage: S } = s,
    { textRelayMessage: U, relayPhotoCandidate: K, relayMode: Ce, relayBodyOnly: Re } = s,
    Y = _?.progressMessageId ?? y;
  try {
    let he = !1;
    if (K)
      try {
        let ye = await tg(l, K.path, K.branch);
        if (rg(ye.bytes.byteLength)) {
          let fe = Xf(l, K);
          ((S = Jf(o, i, a, U, K, fe, Re)), (he = !!Y && (!I || _?.messageKind === "photo")));
        } else {
          let fe = new gr(ye.bytes, Yf(K.path)),
            X;
          (Y
            ? (await e.editMessageMedia(
                d,
                Y,
                { type: "photo", media: fe, caption: S.text, parse_mode: S.parseMode },
                { reply_markup: w },
              ),
              (X = Y))
            : (X = (
                await e.sendPhoto(d, fe, {
                  caption: S.text,
                  parse_mode: S.parseMode,
                  reply_parameters: m ? { message_id: m } : void 0,
                  reply_markup: w,
                })
              ).message_id),
            Number.isInteger(X) && P != null && (await Xs(c, P, X)),
            _ &&
              Number.isInteger(X) &&
              (await du(c, P, {
                ..._,
                progressMessageId: X,
                messageKind: "photo",
                updatedAt: new Date().toISOString(),
              })),
            await to(r, t, n, S, X, "photo", Ce, K));
          return;
        }
      } catch (ye) {
        (console.warn(
          `Issue #${o.number} \u7684 Telegram \u5716\u7247\u8F49\u9001\u5931\u6557\uFF0C\u6539\u7528\u7D14\u6587\u5B57\u8F49\u9001\uFF1A${ye instanceof Error ? ye.message : String(ye)}`,
        ),
          (S = U),
          (he = !!Y && !I));
      }
    if (Y && !he) {
      (I && _?.messageKind === "photo"
        ? await e.editMessageCaption(d, Y, {
            caption: S.text,
            parse_mode: S.parseMode,
            reply_markup: w,
          })
        : await e.editMessageText(d, Y, S.text, { parse_mode: S.parseMode, reply_markup: w }),
        I ? await du(c, P, _) : P != null && (await Xs(c, P, Y)),
        await to(r, t, n, S, Y, "text", Ce, null));
      return;
    }
    let ve = await e.sendMessage(d, S.text, {
      parse_mode: S.parseMode,
      reply_parameters: m ? { message_id: m } : void 0,
      reply_markup: w,
    });
    (_ && P != null
      ? await du(c, P, {
          ..._,
          progressMessageId: ve.message_id,
          messageKind: "text",
          updatedAt: new Date().toISOString(),
        })
      : P != null && (await Xs(c, P, ve.message_id)),
      await to(r, t, n, S, ve.message_id, "text", Ce, null));
  } catch (he) {
    if (!(
      (S.parseMode === "HTML" || S.parseMode === "MarkdownV2") &&
      he instanceof Error &&
      he.message.includes("can't parse entities")
    ))
      throw he;
    console.warn(
      `Issue #${o.number} \u7684 Telegram \u683C\u5F0F\u89E3\u6790\u5931\u6557\uFF0C\u6539\u7528\u7D14\u6587\u5B57\u91CD\u9001\uFF1A${he.message}`,
    );
    let ye = Zs(o, i, a, Re);
    ((S = Ni(o, i, a, { text: ye }, l.telegram.maxMessageLength)),
      cu(o, i, {
        action: a,
        relayBodyOnly: Re,
        relayMode: Ce,
        shouldEditProgressMessage: I,
        relayedMessageId: y,
        progressMessageId: _?.progressMessageId ?? null,
        hasPhoto: !!K,
        photoSourceKind: K?.kind ?? null,
        parseMode: S?.parseMode || null,
        messageLength: typeof S?.text == "string" ? S.text.length : 0,
        messageText: uu(S?.text),
      }));
    let fe = _?.progressMessageId ?? y;
    if (fe) {
      (I && _?.messageKind === "photo"
        ? await e.editMessageCaption(d, fe, {
            caption: S.text,
            parse_mode: S.parseMode,
            reply_markup: w,
          })
        : await e.editMessageText(d, fe, S.text, { parse_mode: S.parseMode, reply_markup: w }),
        await to(r, t, n, S, fe, "text", Ce, null));
      return;
    }
    let X = await e.sendMessage(d, S.text, {
      parse_mode: S.parseMode,
      reply_parameters: m ? { message_id: m } : void 0,
      reply_markup: w,
    });
    (P != null && (await Xs(c, P, X.message_id)),
      await to(r, t, n, S, X.message_id, "text", Ce, null));
  }
}
async function pu(e, t) {
  let { issue: r, comment: n } = e;
  if (Zk(r, n)) return;
  let s = await eE(e, t);
  if (!s) return;
  let o = tE(e, t.config, s);
  cu(r, n, {
    action: e.action,
    relayBodyOnly: o.relayBodyOnly,
    relayMode: o.relayMode,
    shouldEditProgressMessage: s.shouldEditProgressMessage,
    relayedMessageId: s.relayedMessageId,
    progressMessageId: s.progressRelayTarget?.progressMessageId ?? null,
    hasPhoto: !!o.relayPhotoCandidate,
    photoSourceKind: o.relayPhotoCandidate?.kind ?? null,
    parseMode: o.relayMessage?.parseMode || null,
    messageLength: typeof o.relayMessage?.text == "string" ? o.relayMessage.text.length : 0,
    messageText: uu(o.relayMessage?.text),
  });
  let i = new it(t.config.telegram.botToken, { apiRoot: t.config.telegram.apiBaseUrl || void 0 });
  await rE(i, e, t, s, o);
}
Pt();
Pt();
var nE = "main";
function sE(e, t = "(empty)") {
  return typeof e != "string" ? t : e.trim() || t;
}
function oE(e) {
  return typeof e != "string" || !e.trim()
    ? ""
    : ul(dl(cl(e)))
        .replace(/<!--\s*line-meta:\s*\{[\s\S]*?\}\s*-->\s*/g, "")
        .replace(/<a\s+href=(?:"([^"]*)"|'([^']*)')\s*>([\s\S]*?)<\/a>/gi, "$3 ($1$2)")
        .replace(/<\/?(?:b|i|u|s|tg-spoiler|code|pre|blockquote)\s*>/gi, "")
        .replace(/^\*\*来自：\*\*.*$/gm, "")
        .replace(/^\s*---\s*$/gm, "")
        .trim();
}
function iE(e, t = "") {
  let r = oE(lr(e));
  return sE(r, t);
}
function aE(e) {
  return `issue-${e}.yml`;
}
function sg(e) {
  if (e instanceof Error)
    return e.status === 404 ? !0 : e.message.includes("Not Found") || e.message.includes("404");
  let t = e && typeof e == "object" && "message" in e ? String(e.message) : "";
  return t.includes("Not Found") || t.includes("404");
}
function lE(e, t) {
  return t ? (kr(t) ?? null) : (kr(e) ?? null);
}
function uE(e) {
  return e === "cron" ? "cron" : "issue";
}
function cE(e, t) {
  let r = (t ? Tr(t) : null) ?? (e ? Tr(e) : null) ?? {},
    n =
      typeof r.event_source == "string" && r.event_source.trim() !== ""
        ? r.event_source.trim()
        : r.source === "scheduled-trigger"
          ? "cron"
          : "issue",
    s = typeof r.event_data == "string" ? r.event_data.trim() : "";
  return { eventSource: uE(n), eventData: s };
}
function dE(e) {
  if (e == null) return "";
  if (typeof e == "string") return e;
  if (typeof e == "number" || typeof e == "boolean" || typeof e == "bigint") return String(e);
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function pE(e) {
  let t = typeof e == "string" ? e.trim() : "";
  if (!t) return {};
  try {
    let r = JSON.parse(t);
    return !r || typeof r != "object" || Array.isArray(r)
      ? {}
      : Object.fromEntries(
          Object.entries(r)
            .map(([n, s]) => [n.trim(), dE(s)])
            .filter(([n]) => n !== ""),
        );
  } catch {
    return {};
  }
}
function mE(e) {
  let t = cE(e.issueBody, e.commentBody);
  return {
    ...{
      issue_number: String(e.issueNumber),
      comment_id: e.progressCommentId == null ? "" : String(e.progressCommentId),
      user_comment_id:
        typeof e.userCommentId == "number" && e.userCommentId > 0 ? String(e.userCommentId) : "",
      event_source: t.eventSource,
      event_data: t.eventData,
    },
    ...pE(t.eventData),
  };
}
function fE(e) {
  let t = String(e instanceof Error ? e.message : "")
    .trim()
    .toLowerCase();
  return (
    t.includes("cannot trigger a 'workflow_dispatch' on a disabled workflow") ||
    (t.includes("workflow_dispatch") && t.includes("disabled workflow"))
  );
}
function og(e) {
  let t = e && typeof e == "object" && "status" in e ? e.status : void 0,
    r = String(e instanceof Error ? e.message : "")
      .trim()
      .toLowerCase(),
    n =
      e &&
      typeof e == "object" &&
      "response" in e &&
      e.response &&
      typeof e.response == "object" &&
      "data" in e.response &&
      e.response.data &&
      typeof e.response.data == "object" &&
      "message" in e.response.data
        ? String(e.response.data.message).trim().toLowerCase()
        : "",
    s = `${r} ${n}`;
  return (t === 404 || (typeof t == "number" && t >= 400 && t < 500)) &&
    s.includes("workflow") &&
    (s.includes("not found") || s.includes("could not be found") || s.includes("does not exist"))
    ? !0
    : s.includes("not found") && s.includes("workflow") && s.includes(".yml");
}
async function gE(e, t, r, n) {
  try {
    let { data: s } = await e.actions.listRepoWorkflows({ owner: t, repo: r });
    return s.workflows.some((o) => o.path === `.github/workflows/issue-${n}.yml`);
  } catch (s) {
    return sg(s)
      ? !1
      : (console.warn(
          "[coding-agent] \u8B80\u53D6 issue workflow \u6E05\u55AE\u5931\u6557\uFF0C\u6539\u7531 dispatch \u6D41\u7A0B\u8655\u7406",
          { issueNumber: n, error: s instanceof Error ? s.message : String(s) },
        ),
        null);
  }
}
async function hE(e, t, r, n) {
  let s = `issue-${n}`;
  try {
    return (await e.git.getRef({ owner: t, repo: r, ref: `heads/${s}` }), !0);
  } catch (o) {
    return sg(o)
      ? !1
      : (console.warn(
          "[coding-agent] \u8B80\u53D6 issue branch \u6E05\u55AE\u5931\u6557\uFF0C\u6539\u7531\u6D3E\u5DE5\u6D41\u7A0B\u8655\u7406",
          { issueNumber: n, error: o instanceof Error ? o.message : String(o) },
        ),
        null);
  }
}
function wE(e) {
  return `\u300C${e || "\u5C0F\u9F8D\u8766"}\u300D\u5DF2\u7D93\u6536\u5230\u65B0\u7684\u6307\u793A\uFF0C\u6B63\u5728\u5E6B\u5FD9\u5B89\u6392\u8655\u7406\u4E2D\uFF0C\u8ACB\u7A0D\u7B49\u4E00\u4E0B\uFF0C\u4E8B\u60C5\u5F88\u5FEB\u5C31\u6703\u6709\u9032\u5C55\u3002`;
}
function bE(e, t) {
  let r = e || "\u5C0F\u9F8D\u8766";
  if (fE(t))
    return [
      `\u{1F99E}\u300C${r}\u300D\u73FE\u5728\u6B63\u5728\u4F11\u606F\u4E2D\uFF0C\u5148\u5225\u64D4\u5FC3\u3002`,
      "",
      "\u4F60\u7684\u8A0A\u606F\u6211\u5DF2\u7D93\u5148\u5E6B\u4F60\u4FDD\u7559\u4E0B\u4F86\u4E86\uFF0C\u4E0D\u6703\u6F0F\u6389\u3002",
      "\u5982\u679C\u4F60\u60F3\u99AC\u4E0A\u53EB\u9192\u7260\uFF0C\u8ACB\u4F7F\u7528 /enable \u555F\u52D5\u3002",
    ].join(`
`);
  if (og(t))
    return [
      "\u76EE\u524D\u5C0F\u9F8D\u8766\u5C1A\u672A\u8A2D\u5B9A\u4EFB\u52D9\uFF0C\u4F46\u6211\u4F9D\u7136\u6703\u8A18\u9304\u4F60\u7684\u8A0A\u606F\u3002",
      "\u4E4B\u5F8C\u82E5\u9700\u8981\u5C0F\u9F8D\u8766\u57F7\u884C\u4EFB\u52D9\uFF0C\u53EA\u8981\u900F\u904E /edit \u5373\u53EF\u66F4\u65B0\u8A2D\u5B9A\u3002",
    ].join(`
`);
  let n = t instanceof Error ? t.message : "\u672A\u77E5\u932F\u8AA4";
  return [`\u{1F99E}\u300C${r}\u300D\u6D3E\u5DE5\u5931\u6557\u3002`, "", `- \u932F\u8AA4\uFF1A${n}`]
    .join(`
`);
}
function mu(e) {
  return iE(e, "");
}
async function ig(e, t, r, n, s = "") {
  let { octokit: o, config: i } = e,
    { owner: a, repo: l } = i.github,
    c = aE(t),
    d = lE(r.issueBody, r.commentBody);
  if ((await hE(o, a, l, t)) === !1)
    return (
      console.log(
        `[coding-agent] \u7565\u904E Issue #${t} \u6D3E\u5DE5\uFF1Aissue \u5206\u652F\u4E0D\u5B58\u5728`,
      ),
      { issueNumber: t, progressCommentId: null }
    );
  if ((await gE(o, a, l, t)) === !1)
    return (
      console.log(
        `[coding-agent] \u7565\u904E Issue #${t} \u6D3E\u5DE5\uFF1Aissue workflow \u4E0D\u5B58\u5728`,
      ),
      { issueNumber: t, progressCommentId: null }
    );
  let y = pl(wE(s), d ? { requestTelegramMeta: d } : {}),
    _ = await o.issues.createComment({ owner: a, repo: l, issue_number: t, body: y }),
    I = typeof _.data.id == "number" ? _.data.id : null;
  try {
    let P = mE({
      issueNumber: t,
      progressCommentId: I,
      userCommentId: r.commentId,
      issueBody: r.issueBody,
      commentBody: r.commentBody,
    });
    return (
      await o.actions.createWorkflowDispatch({
        owner: a,
        repo: l,
        workflow_id: c,
        ref: nE,
        inputs: P,
      }),
      { issueNumber: t, progressCommentId: I }
    );
  } catch (P) {
    if (I != null && og(P)) await o.issues.deleteComment({ owner: a, repo: l, comment_id: I });
    else if (I != null) {
      let S = pl(bE(s, P), d ? { requestTelegramMeta: d } : {});
      await o.issues.updateComment({ owner: a, repo: l, comment_id: I, body: S });
    }
    throw P;
  }
}
ar();
function ag(e) {
  if (!e.issue || !e.comment) return !1;
  let t = e.comment.body;
  return il(t) ||
    en(t, "schedule-flow") ||
    !al(t) ||
    (e.action === "created" && Rs(t, "pending")) ||
    (e.action === "edited" && !As(t, e.changes?.body?.from ?? null))
    ? !1
    : mu(t).trim() !== "";
}
async function fu(e, t) {
  let r = e.issue?.number ?? "\u672A\u77E5";
  if (!e.issue || !e.comment) {
    console.warn(
      `issue_comment.${e.action} payload \u7F3A\u5C11 issue \u6216 comment \u6B04\u4F4D\uFF0C\u7565\u904E\u5C0F\u9F8D\u8766\u6D3E\u5DE5`,
    );
    return;
  }
  let n = e.comment.body;
  if (il(n)) {
    console.log(`\u7565\u904E Issue #${r} \u7684\u7CFB\u7D71\u7559\u8A00\u6D3E\u5DE5`);
    return;
  }
  if (en(n, "schedule-flow")) {
    console.log(
      `\u7565\u904E Issue #${r} \u7684\u6392\u7A0B\u8A2D\u5B9A\u7D00\u9304\u7559\u8A00\u6D3E\u5DE5`,
    );
    return;
  }
  if (!al(n)) {
    console.log(
      `\u7565\u904E Issue #${r} \u7684\u5C0F\u9F8D\u8766\u6D3E\u5DE5\uFF1Acomment \u7F3A\u5C11 telegram metadata`,
    );
    return;
  }
  if (e.action === "created" && Rs(n, "pending")) {
    console.log(
      `\u7565\u904E Issue #${r} \u7684\u5C0F\u9F8D\u8766\u6D3E\u5DE5\uFF1A\u5A92\u9AD4\u7559\u8A00\u5C1A\u672A finalized`,
    );
    return;
  }
  if (e.action === "edited" && !As(n, e.changes?.body?.from ?? null)) {
    console.log(
      `\u7565\u904E Issue #${r} \u7684\u5C0F\u9F8D\u8766\u6D3E\u5DE5\uFF1Aedited \u4E8B\u4EF6\u4E0D\u662F\u5A92\u9AD4 finalized transition`,
    );
    return;
  }
  let s = mu(n);
  if (!s) {
    console.log(
      `\u7565\u904E Issue #${r} \u7684\u5C0F\u9F8D\u8766\u6D3E\u5DE5\uFF1A\u4F7F\u7528\u8005\u8A0A\u606F\u70BA\u7A7A`,
    );
    return;
  }
  let { octokit: o, config: i } = t,
    a = await Ts(o, i.github.owner, i.github.repo, e.issue.number);
  if (!a.acceptsDispatch) {
    let l =
      !a.branchExists || !a.workflowExists
        ? "\u7F3A\u5C11 issue \u5206\u652F\u6216 workflow\uFF0C\u6539\u70BA\u8A18\u4E8B\u672C\u6A21\u5F0F"
        : "workflow disabled\uFF0C\u6539\u70BA\u8A18\u4E8B\u672C\u6A21\u5F0F";
    console.log(`\u7565\u904E Issue #${r} \u7684\u5C0F\u9F8D\u8766\u6D3E\u5DE5\uFF1A${l}`);
    return;
  }
  await ig(
    t,
    e.issue.number,
    { issueBody: e.issue.body, commentBody: e.comment.body, commentId: e.comment.id },
    s,
  );
}
Ie();
xs();
li();
Ps();
mt();
ms();
di();
var lg = "init_github_claw_done";
function yE(e, t) {
  let r = t.config.github.repoFullName.trim().toLowerCase(),
    n = Array.isArray(e.repositories) ? e.repositories : [];
  return n.length === 0
    ? !0
    : n.some((s) => typeof s?.full_name == "string" && s.full_name.trim().toLowerCase() === r);
}
function _E(e) {
  return e.config.telegram.defaultChatId ?? e.config.telegram.allowedChatId ?? null;
}
function TE(e) {
  let t = `https://github.com/${e.config.github.owner}/${e.config.github.repo}`;
  return `\u{1F389} \u592A\u597D\u4E86\uFF01${e.config.profileName} \u5DF2\u7D93\u6E96\u5099\u597D\u56C9\uFF01
\u{1F99E} \u4F60\u7684\u5C0F\u9F8D\u8766\u5728\u9019\u88E1\u7B49\u4F60 \u2192 ${t}`;
}
async function kE(e, t) {
  let { octokit: r, store: n, config: s } = e,
    { owner: o, repo: i } = s.github,
    a = "default",
    l = i,
    c = `${i} \u7684\u9810\u8A2D\u5C0F\u9F8D\u8766`,
    d = ci({
      meta: { source: "auto-init", chat_id: t, ts: new Date().toISOString() },
      agentProfile: { name: l, description: c },
    }),
    { data: m } = await r.rest.issues.create({ owner: o, repo: i, title: l, body: d }),
    w = await Er(r, o, i, a, { personality: s.personality }),
    y = `issue-${m.number}`,
    _ = w.map((I) => ({ path: I.path, content: I.content }));
  return (
    await Pn(
      r,
      o,
      i,
      y,
      _,
      `chore: \u521D\u59CB\u5316 issue #${m.number} orphan \u5206\u652F\uFF08\u7BC4\u672C\uFF1A${a}\uFF09`,
    ),
    await Sr(r, o, i, m.number, a),
    await Vr(e.d1, { repo: s.github.repoFullName, issueNumber: m.number, template: a }),
    await rr(n, m.number, t),
    console.log("[auto-init] \u5DF2\u81EA\u52D5\u5EFA\u7ACB\u7B2C\u4E00\u96BB\u5C0F\u9F8D\u8766", {
      issueNumber: m.number,
      title: l,
    }),
    { number: m.number, title: m.title }
  );
}
async function EE(e) {
  let { octokit: t, store: r, config: n } = e,
    { owner: s, repo: o } = n.github;
  await r.put(lg, "true");
  try {
    (await Ci(t, s, o, "INIT_GITHUB_CLAW", "false"),
      console.log("[auto-init] \u5DF2\u5C07 INIT_GITHUB_CLAW repo variable \u8A2D\u70BA false"));
  } catch (i) {
    console.warn("[auto-init] \u7121\u6CD5\u66F4\u65B0 INIT_GITHUB_CLAW repo variable", i);
  }
}
async function ug(e, t) {
  if (!yE(e, t)) {
    console.log("[installation.created] skip unrelated installation event", {
      configuredRepo: t.config.github.repoFullName,
      installationId: e.installation?.id ?? null,
    });
    return;
  }
  let r = _E(t);
  if (!r) {
    console.warn("[installation.created] telegram chat id is missing, skip welcome message");
    return;
  }
  let n = new it(t.config.telegram.botToken, { apiRoot: t.config.telegram.apiBaseUrl || void 0 });
  if ((await n.sendMessage(r, TE(t)), t.config.initGitHubClaw)) {
    if ((await t.store.get(lg)) === "true") {
      console.log("[auto-init] \u5DF2\u57F7\u884C\u904E\u521D\u59CB\u5316\uFF0C\u8DF3\u904E");
      return;
    }
    try {
      let o = await kE(t, r);
      (await EE(t),
        await n.sendMessage(
          r,
          `\u{1F99E} \u5DF2\u81EA\u52D5\u5EFA\u7ACB\u7B2C\u4E00\u96BB\u5C0F\u9F8D\u8766\u300C${o.title}\u300D(#${o.number})\uFF01`,
        ));
    } catch (o) {
      (console.error("[auto-init] \u81EA\u52D5\u5EFA\u7ACB\u5C0F\u9F8D\u8766\u5931\u6557", o),
        await n.sendMessage(
          r,
          "\u26A0\uFE0F \u81EA\u52D5\u5EFA\u7ACB\u5C0F\u9F8D\u8766\u5931\u6557\uFF0C\u8ACB\u624B\u52D5\u4F7F\u7528 /new \u5EFA\u7ACB\u3002",
        ));
    }
  }
}
Ie();
Et();
async function cg(e, t) {
  return e && (await At(t.d1, e)) ? { requestId: e } : null;
}
async function dg(e, t) {
  let r = await Xt(t.d1, e);
  return r ? { requestId: r.requestId } : null;
}
async function SE(e, t, r) {
  let n = await At(r.d1, t);
  if (!n || n.channel !== "telegram" || !n.chatId) return;
  let s = Number.parseInt(n.chatId, 10);
  if (!Number.isInteger(s) || s <= 0) return;
  let o = n.messageId ? Number.parseInt(n.messageId, 10) : null,
    i = zm(e.workflow_run.conclusion, e.workflow_run.status),
    a = new it(r.config.telegram.botToken, { apiRoot: r.config.telegram.apiBaseUrl || void 0 });
  try {
    if (o && Number.isInteger(o) && o > 0)
      try {
        await a.editMessageText(s, o, i, { parse_mode: "MarkdownV2" });
      } catch {
        await a.sendMessage(s, i, { parse_mode: "MarkdownV2" });
      }
    else await a.sendMessage(s, i, { parse_mode: "MarkdownV2" });
    await Ne(r.d1, t, { status: "notified", notifiedAt: new Date().toISOString() });
  } catch (l) {
    throw (
      await Ne(r.d1, t, {
        status: "failed_to_notify",
        errorMessage: l instanceof Error ? l.message : String(l),
      }),
      l
    );
  }
}
async function pg(e, t) {
  let r = e.workflow_run;
  if (r.path !== Ls) return;
  let n = await cg(Rl(r.display_title), t);
  n &&
    (await Ne(t.d1, n.requestId, {
      status: "requested",
      workflowRunId: r.id,
      workflowRef: r.path,
      headBranch: r.head_branch ?? null,
      headSha: r.head_sha ?? null,
    }));
}
async function mg(e, t) {
  let r = e.workflow_run;
  if (r.path !== Ls) return;
  let n = await dg(r.id, t);
  n &&
    (await Ne(t.d1, n.requestId, {
      status: "in_progress",
      workflowRunId: r.id,
      workflowRef: r.path,
      headBranch: r.head_branch ?? null,
      headSha: r.head_sha ?? null,
    }));
}
async function fg(e, t) {
  let r = e.workflow_run;
  if (r.path !== Ls) return;
  let n = (await dg(r.id, t)) ?? (await cg(Rl(r.display_title), t));
  n &&
    (await Ne(t.d1, n.requestId, {
      status: "completed",
      conclusion: r.conclusion ?? null,
      workflowRunId: r.id,
      workflowRef: r.path,
      headBranch: r.head_branch ?? null,
      headSha: r.head_sha ?? null,
      completedAt: new Date().toISOString(),
    }),
    await SE(e, n.requestId, t));
}
Ie();
Xe();
Et();
var gu = ".github/workflows/skills.yml",
  hu = ".github/workflows/remove-skill.yml",
  gg = /\|\s*req:([A-Za-z0-9-]+)\s*$/i;
function hg(e) {
  return (e && e.match(gg)?.[1]?.trim()) || null;
}
function IE(e, t) {
  return (
    e
      ?.replace(gg, "")
      .replace(/^技能(?:安装|移除):\s*/u, "")
      .trim() ||
    t ||
    "skill"
  );
}
function vE(e) {
  if (!e) return null;
  try {
    let t = JSON.parse(e),
      r = Number.parseInt(String(t.issue_number ?? ""), 10);
    return Number.isInteger(r) && r > 0 ? r : null;
  } catch {
    return null;
  }
}
function CE(e, t, r, n, s, o) {
  let i = O(e),
    a =
      t && r
        ? `\u{1F99E} ${O(r)} \\#${t}`
        : t
          ? `\u{1F99E} \\#${t}`
          : "\u{1F99E} \u76EE\u6A19\u5C0F\u9F8D\u8766",
    l = o === "skill_remove",
    d = l ? "\u79FB\u9664" : o === "skill_update" ? "\u66F4\u65B0" : "\u5B89\u88DD";
  switch (n) {
    case "success":
      return l
        ? `\u2705 \u5DF2\u5F9E ${a} \u79FB\u9664\u6280\u80FD *${i}*`
        : `\u2705 \u6280\u80FD *${i}* \u5DF2${d}\u5230 ${a}`;
    case "cancelled":
      return `\u26A0\uFE0F \u6280\u80FD *${i}* ${d}\u5DF2\u53D6\u6D88`;
    case "failure":
    case "timed_out":
    case "startup_failure":
    case "action_required":
      return `\u274C \u6280\u80FD *${i}* ${d}\u5931\u6557\uFF0C\u8ACB\u67E5\u770B workflow run log`;
    default:
      return `\u2139\uFE0F \u6280\u80FD *${i}* ${d}\u7D50\u675F\uFF0C\u7D50\u679C\uFF1A${O(n || s || "unknown")}`;
  }
}
async function wg(e, t) {
  return e && (await At(t.d1, e)) ? { requestId: e } : null;
}
async function bg(e, t) {
  let r = await Xt(t.d1, e);
  return r ? { requestId: r.requestId } : null;
}
async function RE(e, t, r) {
  let n = e.workflow_run,
    s = await At(r.d1, t);
  if (!s || s.channel !== "telegram" || !s.chatId) return;
  let o = Number.parseInt(s.chatId, 10);
  if (!Number.isInteger(o) || o <= 0) return;
  let i = s.messageId ? Number.parseInt(s.messageId, 10) : null,
    a = IE(n.display_title, s.sourceId),
    l = vE(s.payloadJson),
    c = null;
  if (l)
    try {
      let { data: w } = await r.octokit.rest.issues.get({
        owner: r.config.github.owner,
        repo: r.config.github.repo,
        issue_number: l,
      });
      c = w.title;
    } catch {}
  let d = CE(a, l, c, n.conclusion, n.status, s.sourceType ?? null),
    m = new it(r.config.telegram.botToken, { apiRoot: r.config.telegram.apiBaseUrl || void 0 });
  try {
    if (
      (i && Number.isInteger(i) && i > 0
        ? await m.editMessageText(o, i, d, { parse_mode: "MarkdownV2" })
        : await m.sendMessage(o, d, { parse_mode: "MarkdownV2" }),
      await Ne(r.d1, t, { status: "notified", notifiedAt: new Date().toISOString() }),
      l && n.conclusion === "success")
    ) {
      let w =
          s.sourceType === "skill_update"
            ? "\u66F4\u65B0"
            : s.sourceType === "skill_remove"
              ? "\u79FB\u9664"
              : "\u5B89\u88DD",
        y = `\u{1F6E0} \u6280\u80FD **${a}** \u5DF2${w}\u5B8C\u6210\u3002`;
      try {
        await r.octokit.rest.issues.createComment({
          owner: r.config.github.owner,
          repo: r.config.github.repo,
          issue_number: l,
          body: y,
        });
      } catch (_) {
        console.warn("[skill-install] failed to post issue comment", _);
      }
    }
  } catch (w) {
    throw (
      await Ne(r.d1, t, {
        status: "failed_to_notify",
        errorMessage: w instanceof Error ? w.message : String(w),
      }),
      w
    );
  }
}
async function yg(e, t) {
  let r = e.workflow_run;
  if (r.path !== gu && r.path !== hu) return;
  let n = await wg(hg(r.display_title), t);
  n &&
    (await Ne(t.d1, n.requestId, {
      status: "requested",
      workflowRunId: r.id,
      workflowRef: r.path,
      headBranch: r.head_branch ?? null,
      headSha: r.head_sha ?? null,
    }));
}
async function _g(e, t) {
  let r = e.workflow_run;
  if (r.path !== gu && r.path !== hu) return;
  let n = await bg(r.id, t);
  n &&
    (await Ne(t.d1, n.requestId, {
      status: "in_progress",
      workflowRunId: r.id,
      workflowRef: r.path,
      headBranch: r.head_branch ?? null,
      headSha: r.head_sha ?? null,
    }));
}
async function Tg(e, t) {
  let r = e.workflow_run;
  if (r.path !== gu && r.path !== hu) return;
  let n = (await bg(r.id, t)) ?? (await wg(hg(r.display_title), t));
  n &&
    (await Ne(t.d1, n.requestId, {
      status: "completed",
      conclusion: r.conclusion ?? null,
      workflowRunId: r.id,
      workflowRef: r.path,
      headBranch: r.head_branch ?? null,
      headSha: r.head_sha ?? null,
      completedAt: new Date().toISOString(),
    }),
    await RE(e, n.requestId, t));
}
Ie();
Xe();
Et();
Ve();
var wu = ".github/workflows/templates.yml",
  kg = /\|\s*req:([A-Za-z0-9-]+)\s*$/i;
function Eg(e) {
  return (e && e.match(kg)?.[1]?.trim()) || null;
}
function AE(e, t) {
  return (
    e
      ?.replace(kg, "")
      .replace(/^(?:📚\s*)?(?:范本同步|范本安装):\s*/u, "")
      .trim() ||
    t ||
    "template"
  );
}
function xE(e, t, r) {
  let n = O(e);
  switch (t) {
    case "success":
      return `\u2705 \u7BC4\u672C *${n}* \u5DF2\u5B89\u88DD\u5230\u9F8D\u8766\u5821

\u{1F99E} \u63A5\u4E0B\u4F86\u53EF\u4EE5\u7528 /new \u5EFA\u7ACB\u4E00\u96BB\u65B0\u7684\u5C0F\u9F8D\u8766\u56C9\uFF01`;
    case "cancelled":
      return `\u26A0\uFE0F \u7BC4\u672C *${n}* \u5B89\u88DD\u5DF2\u53D6\u6D88`;
    case "failure":
    case "timed_out":
    case "startup_failure":
    case "action_required":
      return `\u274C \u7BC4\u672C *${n}* \u5B89\u88DD\u5931\u6557\uFF0C\u8ACB\u67E5\u770B workflow run log`;
    default:
      return `\u2139\uFE0F \u7BC4\u672C *${n}* \u5B89\u88DD\u7D50\u675F\uFF0C\u7D50\u679C\uFF1A${O(t || r || "unknown")}`;
  }
}
async function Sg(e, t) {
  return e && (await At(t.d1, e)) ? { requestId: e } : null;
}
async function Ig(e, t) {
  let r = await Xt(t.d1, e);
  return r ? { requestId: r.requestId } : null;
}
async function PE(e, t, r) {
  let n = e.workflow_run,
    s = await At(r.d1, t);
  if (!s || s.channel !== "telegram" || !s.chatId) return;
  let o = Number.parseInt(s.chatId, 10);
  if (!Number.isInteger(o) || o <= 0) return;
  let i = s.messageId ? Number.parseInt(s.messageId, 10) : null,
    a = AE(n.display_title, s.sourceId),
    l = xE(a, n.conclusion, n.status),
    c = new it(r.config.telegram.botToken, { apiRoot: r.config.telegram.apiBaseUrl || void 0 }),
    d = s.sourceId === "line-bot" && n.conclusion === "success";
  try {
    if (d) {
      let m = `\u2705 \u7BC4\u672C *${O(a)}* \u5DF2\u5B89\u88DD\u5B8C\u6210\uFF01

\u{1F916} \u8981\u7E7C\u7E8C\u8A2D\u5B9A LINE Bot \u90E8\u7F72\u55CE\uFF1F`,
        w = op(),
        y = null;
      (i && Number.isInteger(i) && i > 0
        ? (await c.editMessageText(o, i, m, { parse_mode: "MarkdownV2", reply_markup: w }), (y = i))
        : (y = (await c.sendMessage(o, m, { parse_mode: "MarkdownV2", reply_markup: w }))
            .message_id),
        await oe(r.store, o, {
          templateName: "line-bot",
          step: "post_install_prompt",
          ...(y ? { promptMessageId: y } : {}),
        }));
    } else
      i && Number.isInteger(i) && i > 0
        ? await c.editMessageText(o, i, l, { parse_mode: "MarkdownV2" })
        : await c.sendMessage(o, l, { parse_mode: "MarkdownV2" });
    await Ne(r.d1, t, { status: "notified", notifiedAt: new Date().toISOString() });
  } catch (m) {
    throw (
      await Ne(r.d1, t, {
        status: "failed_to_notify",
        errorMessage: m instanceof Error ? m.message : String(m),
      }),
      m
    );
  }
}
async function vg(e, t) {
  let r = e.workflow_run;
  if (r.path !== wu) return;
  let n = await Sg(Eg(r.display_title), t);
  if (!n) {
    console.warn("[template_sync_workflow_run] requested notification record not found", {
      runId: r.id,
      displayTitle: r.display_title ?? null,
    });
    return;
  }
  await Ne(t.d1, n.requestId, {
    status: "requested",
    workflowRunId: r.id,
    workflowRef: r.path,
    headBranch: r.head_branch ?? null,
    headSha: r.head_sha ?? null,
  });
}
async function Cg(e, t) {
  let r = e.workflow_run;
  if (r.path !== wu) return;
  let n = await Ig(r.id, t);
  if (!n) {
    console.warn("[template_sync_workflow_run] in_progress notification record not found", {
      runId: r.id,
    });
    return;
  }
  await Ne(t.d1, n.requestId, {
    status: "in_progress",
    workflowRunId: r.id,
    workflowRef: r.path,
    headBranch: r.head_branch ?? null,
    headSha: r.head_sha ?? null,
  });
}
async function Rg(e, t) {
  let r = e.workflow_run;
  if (r.path !== wu) return;
  let n = (await Ig(r.id, t)) ?? (await Sg(Eg(r.display_title), t));
  if (!n) {
    console.warn("[template_sync_workflow_run] completed notification record not found", {
      runId: r.id,
      displayTitle: r.display_title ?? null,
    });
    return;
  }
  (await Ne(t.d1, n.requestId, {
    status: "completed",
    conclusion: r.conclusion ?? null,
    workflowRunId: r.id,
    workflowRef: r.path,
    headBranch: r.head_branch ?? null,
    headSha: r.head_sha ?? null,
    completedAt: new Date().toISOString(),
  }),
    await PE(e, n.requestId, t));
}
Ie();
Xe();
Et();
var Gi = ".github/workflows/install-line-bot.yml";
function ME(e) {
  if (!e) return null;
  try {
    let t = JSON.parse(e);
    return String(t.line_bot_channel_id ?? "").trim() || null;
  } catch {
    return null;
  }
}
function OE(e, t, r, n) {
  let s = O(n);
  switch (e) {
    case "success": {
      let o = [`\u2705 LINE Bot Worker *${s}* \u90E8\u7F72\u5B8C\u6210\uFF01`];
      if (r) {
        let i = `https://developers.line.biz/console/channel/${r}/messaging-api`;
        o.push(
          "",
          "\u{1F517} \u8ACB\u5230 LINE Developers Console \u958B\u555F\u300CUse webhook\u300D\uFF1A",
          O(i),
        );
      }
      return o.join(`
`);
    }
    case "cancelled":
      return `\u26A0\uFE0F LINE Bot Worker *${s}* \u90E8\u7F72\u5DF2\u53D6\u6D88`;
    case "failure":
    case "timed_out":
    case "startup_failure":
    case "action_required":
      return `\u274C LINE Bot Worker *${s}* \u90E8\u7F72\u5931\u6557\uFF0C\u8ACB\u67E5\u770B workflow run log`;
    default:
      return `\u2139\uFE0F LINE Bot Worker *${s}* \u90E8\u7F72\u7D50\u675F\uFF0C\u7D50\u679C\uFF1A${O(e || t || "unknown")}`;
  }
}
async function Ag(e, t) {
  let r = await Xt(t.d1, e);
  return r ? { requestId: r.requestId } : null;
}
async function NE(e) {
  let t = await ka(e.d1, Gi);
  return t ? { requestId: t.requestId } : null;
}
async function GE(e, t, r) {
  let { getWorkflowNotificationByRequestId: n } = await Promise.resolve().then(() => (Et(), Sa)),
    s = e.workflow_run,
    o = await n(r.d1, t);
  if (!o || o.channel !== "telegram" || !o.chatId) return;
  let i = Number.parseInt(o.chatId, 10);
  if (!Number.isInteger(i) || i <= 0) return;
  let a = o.messageId ? Number.parseInt(o.messageId, 10) : null,
    l = ME(o.payloadJson),
    c = o.sourceId || "LINE Bot",
    d = OE(s.conclusion, s.status, l, c),
    m = new it(r.config.telegram.botToken, { apiRoot: r.config.telegram.apiBaseUrl || void 0 });
  try {
    (a && Number.isInteger(a) && a > 0
      ? await m.editMessageText(i, a, d, { parse_mode: "MarkdownV2", reply_markup: new F() })
      : await m.sendMessage(i, d, { parse_mode: "MarkdownV2" }),
      await Ne(r.d1, t, { status: "notified", notifiedAt: new Date().toISOString() }));
  } catch (w) {
    throw (
      await Ne(r.d1, t, {
        status: "failed_to_notify",
        errorMessage: w instanceof Error ? w.message : String(w),
      }),
      w
    );
  }
}
async function xg(e, t) {
  let r = e.workflow_run;
  if (r.path !== Gi) return;
  let n = await NE(t);
  if (!n) {
    console.warn("[install_line_bot_workflow_run] requested notification record not found", {
      runId: r.id,
    });
    return;
  }
  await Ne(t.d1, n.requestId, {
    status: "requested",
    workflowRunId: r.id,
    workflowRef: r.path,
    headBranch: r.head_branch ?? null,
    headSha: r.head_sha ?? null,
  });
}
async function Pg(e, t) {
  let r = e.workflow_run;
  if (r.path !== Gi) return;
  let n = await Ag(r.id, t);
  n &&
    (await Ne(t.d1, n.requestId, {
      status: "in_progress",
      workflowRunId: r.id,
      workflowRef: r.path,
      headBranch: r.head_branch ?? null,
      headSha: r.head_sha ?? null,
    }));
}
async function Mg(e, t) {
  let r = e.workflow_run;
  if (r.path !== Gi) return;
  let n = await Ag(r.id, t);
  if (!n) {
    console.warn("[install_line_bot_workflow_run] completed notification record not found", {
      runId: r.id,
    });
    return;
  }
  (await Ne(t.d1, n.requestId, {
    status: "completed",
    conclusion: r.conclusion ?? null,
    workflowRunId: r.id,
    workflowRef: r.path,
    headBranch: r.head_branch ?? null,
    headSha: r.head_sha ?? null,
    completedAt: new Date().toISOString(),
  }),
    await GE(e, n.requestId, t));
}
Pt();
function Og(e, t) {
  let r = new jf({ secret: e });
  return (
    r.on("issue_comment.created", async ({ payload: n }) => {
      let s = n.sender.type === "Bot",
        o = s && en(n.comment.body, "scheduled-trigger"),
        i = Rs(n.comment.body, "pending"),
        a = pu(n, t).catch((c) => {
          throw (
            console.error("\u8F49\u9001 Issue \u7559\u8A00\u5230 Telegram \u5931\u6557", c),
            c
          );
        });
      if (i) {
        await a;
        return;
      }
      if (s && !o) {
        await a;
        return;
      }
      let l = fu(n, t).catch((c) => {
        throw (
          console.error("\u6D3E\u9001 Issue \u7559\u8A00\u5230 coding-agent \u5931\u6557", c),
          c
        );
      });
      await Promise.allSettled([a, l]);
    }),
    r.on("issue_comment.edited", async ({ payload: n }) => {
      let s = n.sender.type === "Bot",
        o = As(n.comment.body, n.changes?.body?.from ?? null),
        i = pu(n, t).catch((l) => {
          console.error(
            "\u8F49\u9001\u5DF2\u7DE8\u8F2F Issue \u7559\u8A00\u5230 Telegram \u5931\u6557",
            l,
          );
        });
      if (s && !o) {
        await i;
        return;
      }
      let a = ag(n)
        ? fu(n, t).catch((l) => {
            console.error(
              "\u6D3E\u9001\u5DF2\u7DE8\u8F2F Issue \u7559\u8A00\u5230 coding-agent \u5931\u6557",
              l,
            );
          })
        : Promise.resolve();
      await Promise.allSettled([i, a]);
    }),
    r.on("issues.opened", async ({ payload: n }) => {
      console.log(`Issue #${n.issue.number} opened \u2014 branch creation is handled by /new flow`);
    }),
    r.on("installation.created", async ({ payload: n }) => {
      try {
        await ug(n, t);
      } catch (s) {
        console.error(
          "GitHub App \u5B89\u88DD\u5B8C\u6210\u6B61\u8FCE\u8A0A\u606F\u767C\u9001\u5931\u6557",
          s,
        );
      }
    }),
    r.on("workflow_run.requested", async ({ payload: n }) => {
      try {
        (await pg(n, t), await vg(n, t), await yg(n, t), await xg(n, t));
      } catch (s) {
        console.error("\u8655\u7406 workflow_run.requested \u5931\u6557", s);
      }
    }),
    r.on("workflow_run.in_progress", async ({ payload: n }) => {
      try {
        (await mg(n, t), await Cg(n, t), await _g(n, t), await Pg(n, t));
      } catch (s) {
        console.error("\u8655\u7406 workflow_run.in_progress \u5931\u6557", s);
      }
    }),
    r.on("workflow_run.completed", async ({ payload: n }) => {
      try {
        (await fg(n, t), await Rg(n, t), await Tg(n, t), await Mg(n, t));
      } catch (s) {
        console.error("\u8655\u7406 workflow_run.completed \u5931\u6557", s);
      }
    }),
    r
  );
}
var bu = new Rt();
bu.post("/github/webhook", async (e) => {
  let t = e.var.config,
    r = { octokit: e.var.octokit, store: e.var.store, d1: e.var.d1, ai: e.var.ai, config: t },
    n = Og(t.github.webhookSecret, r),
    s = e.req.header("x-github-delivery") ?? "",
    o = e.req.header("x-github-event") ?? "",
    i = e.req.header("x-hub-signature-256") ?? "",
    a = await e.req.text();
  try {
    await n.verifyAndReceive({ id: s, name: o, signature: i, payload: a });
  } catch (l) {
    let c = l instanceof Error ? l.message : String(l);
    return (
      console.error("GitHub webhook \u8655\u7406\u5931\u6557:", c),
      e.json({ ok: !1, error: c }, 400)
    );
  }
  return e.json({ ok: !0 });
});
mt();
var yu = new Rt();
yu.get("/active-issue", async (e) => {
  let t = e.var.store,
    r = await Ge(t);
  return e.json({ issueNumber: r });
});
var dr = new Rt();
dr.use("*", oc);
dr.use("*", Vc);
dr.onError(Jc);
dr.route("/", Ao);
dr.route("/", ou);
dr.route("/", bu);
dr.route("/api", yu);
Pt();
ar();
Jr();
function FE(e) {
  return cm(e.prompt.trim(), {
    source: "scheduled-trigger",
    schedule_id: e.id,
    event_source: "cron",
    ...(e.eventData ? { event_data: e.eventData } : {}),
  });
}
function $E(e) {
  let t = e.scheduledTime ?? Date.now(),
    r = typeof t == "number" ? new Date(t) : new Date(t);
  if (Number.isNaN(r.getTime()))
    throw new TypeError("Expected scheduled execution time to be a valid timestamp.");
  return r;
}
function Ng(e) {
  return e instanceof Error && typeof e.message == "string" && e.message.trim() !== ""
    ? e.message
    : typeof e == "string" && e.trim() !== ""
      ? e.trim()
      : "Unknown scheduler error";
}
function LE(e, t) {
  if (typeof e == "number" && Number.isInteger(e) && e > 0) return e;
  throw new Error(`Scheduled comment for ${t} did not return a valid GitHub comment id.`);
}
function DE(e, t) {
  return e.ruleType === "once"
    ? { status: "cancelled", nextRunAt: e.nextRunAt, cancelledAt: t.toISOString() }
    : {
        status: e.status,
        nextRunAt: Wn({ ruleType: e.ruleType, rulePayload: e.rulePayload, now: t }),
        cancelledAt: null,
      };
}
async function UE(e, t, r, n) {
  let s = Ng(r);
  try {
    return (await xp(e, t, s, { now: n }), s);
  } catch (o) {
    let i = Ng(o);
    return (
      console.error(`[Scheduled] Failed to persist failure for ${t}:`, i),
      `${s} (also failed to persist scheduler failure: ${i})`
    );
  }
}
async function Gg(e, t) {
  let r = To(t),
    n = r.scheduleStorage.database;
  if (!n)
    return (console.warn("[Scheduled] Missing SCHEDULES_DB binding, skipping scheduled run."), []);
  let s = $E(e),
    o = s.toISOString(),
    i = Ro(r),
    a = await Cp(n, { now: s });
  if (a.length === 0) return (console.log(`[Scheduled] No due schedules at ${o}`), []);
  console.log(`[Scheduled] Found ${a.length} due schedule(s) at ${o}`);
  let l = [];
  for (let c of a) {
    let d = await Rp(n, c.id, c.nextRunAt, { now: s });
    if (!d) {
      console.log(`[Scheduled] Skip schedule ${c.id}: lock already acquired or stale state.`);
      continue;
    }
    try {
      let m = DE(d, s),
        [w, y] = d.repo.split("/"),
        _ = await i.issues.createComment({
          owner: w,
          repo: y,
          issue_number: d.issueNumber,
          body: FE(d),
        }),
        I = LE(_.data.id, d.id);
      await Zr(i, w, y, d.issueNumber, I, d.prompt);
      let P = await Ap(
        n,
        d.id,
        { status: m.status, nextRunAt: m.nextRunAt, cancelledAt: m.cancelledAt },
        { now: s },
      );
      if (!P) throw new Error(`Failed to persist completion for schedule ${d.id}.`);
      l.push({
        id: d.id,
        issueNumber: d.issueNumber,
        success: !0,
        nextRunAt: P.nextRunAt,
        status: P.status,
      });
    } catch (m) {
      let w = await UE(n, d.id, m, s);
      (console.error(`[Scheduled] Failed to process schedule ${d.id}:`, w),
        l.push({ id: d.id, issueNumber: d.issueNumber, success: !1, error: w }));
    }
  }
  return l;
}
var VP = { fetch: dr.fetch, scheduled: Gg };
export { VP as default };
/*! Bundled license information:

@octokit/request-error/dist-src/index.js:
  (* v8 ignore else -- @preserve -- Bug with vitest coverage where it sees an else branch that doesn't exist *)

@octokit/request/dist-bundle/index.js:
  (* v8 ignore next -- @preserve *)
  (* v8 ignore else -- @preserve *)
*/
