// i18n/index.js — 翻译 + 语言解析
// 行为对齐旧 bundle 的 t() / getLanguage() / glang()（src/index.js L7-75）。
// 808 leaf 键 × 2 语 = 冻结的 UI 契约（§10.6），原样复用，不改 value。

import zhCNTranslation from "./zh-CN.json" with { type: "json" };
import enTranslation from "./en.json" with { type: "json" };

const translations = {
  "zh-CN": zhCNTranslation,
  en: enTranslation,
};

export function t(key, params = {}, lang = "en") {
  let dict = translations[lang] || translations.en;
  let val = dict;
  for (let part of key.split(".")) {
    if (val && typeof val === "object" && part in val) {
      val = val[part];
    } else {
      val = null;
      break;
    }
  }

  if (val === null || val === undefined) {
    val = translations.en;
    for (let part of key.split(".")) {
      if (val && typeof val === "object" && part in val) {
        val = val[part];
      } else {
        val = null;
        break;
      }
    }
  }

  if (typeof val !== "string") return key;

  let result = val;
  for (let [k, v] of Object.entries(params)) {
    result = result.replace(new RegExp(`{${k}}`, "g"), String(v ?? ""));
  }
  return result;
}

// Module-scope alias — 在遮蔽 `t` 的 scope 内安全调用 i18n（沿用旧 bundle 既有手法）。
export const i18nT = t;

export async function getLanguage(services) {
  let lang = null;
  if (services?.store) {
    try {
      lang = await services.store.get("CLAW_LANGUAGE");
    } catch (err) {
      console.error("Error reading language from D1:", err);
    }
  }
  if (!lang && services?.config) {
    lang = services.config.language;
  }
  const resolvedLang = lang || "en";
  if (typeof globalThis !== "undefined") {
    globalThis.globalLanguage = resolvedLang;
  }
  return resolvedLang;
}

export function glang() {
  return typeof globalThis !== "undefined" && globalThis.globalLanguage === "zh-CN"
    ? "zh-CN"
    : "en";
}