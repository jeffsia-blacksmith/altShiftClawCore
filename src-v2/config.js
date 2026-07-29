// config.js — env / binding 解析
// 行为对齐旧 bundle 的 To(e)（src/index.js L9253-9296）+ ConfigError 语义。
// R0 阶段：/ + /health 仅读取 .version；其余字段为后续阶段预留，结构已就位。
// 严格必填校验（telegram.botToken / github.owner / github.repo）在 R1+ 启用；
// R0 暂不抛 ConfigError，避免空 env 的 guardrail 启动即崩。

const DEFAULT_VERSION = "0.2.24";
const DEFAULT_API_BASE = "https://api.github.com";

export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigError";
  }
}

function requireString(env, key) {
  const v = env[key];
  if (typeof v !== "string" || !v.trim()) {
    throw new ConfigError(`${key} is required`);
  }
  return v.trim();
}

function optString(env, key) {
  const v = env[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function optInt(env, key) {
  const v = env[key];
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ConfigError(`${key} must be a positive integer if provided, got: ${String(v)}`);
  }
  return n;
}

function optBinding(env, key) {
  const v = env[key];
  return v && typeof v === "object" ? v : null;
}

function optBool(env, key) {
  const v = env[key];
  return typeof v === "string" && v.trim().toLowerCase() === "true";
}

export function buildConfig(env) {
  const e = env ?? {};
  const githubOwner = optString(e, "GITHUB_OWNER");
  const githubRepo = optString(e, "GITHUB_REPO");
  const botToken = optString(e, "TELEGRAM_BOT_TOKEN");
  // Strict validation for critical config when bot token is provided
  // (allows / + /health to boot on empty env, but fails clearly when bot is needed)
  if (botToken && (!githubOwner || !githubRepo)) {
    throw new ConfigError("GITHUB_OWNER and GITHUB_REPO are required when TELEGRAM_BOT_TOKEN is set");
  }
  return {
    language:
      typeof e.CLAW_LANGUAGE === "string" && e.CLAW_LANGUAGE.trim() ? e.CLAW_LANGUAGE.trim() : "en",
    profileName: optString(e, "PROFILE_NAME") ?? githubRepo,
    personality: optString(e, "PERSONALITY") ?? "",
    initGitHubClaw: optBool(e, "INIT_GITHUB_CLAW"),
    telegram: {
      botToken: optString(e, "TELEGRAM_BOT_TOKEN"),
      webhookSecret: optString(e, "TELEGRAM_WEBHOOK_SECRET"),
      apiBaseUrl: optString(e, "TELEGRAM_API_BASE_URL"),
      webhookPath: (() => { const p = optString(e, "TELEGRAM_WEBHOOK_PATH"); return p ? (p.startsWith("/") ? p : `/${p}`) : null; })(),
      defaultChatId: optInt(e, "TELEGRAM_CHAT_ID"),
      accessMode: "open",
      maxMessageLength: optInt(e, "TELEGRAM_MAX_MESSAGE_LENGTH") ?? 4096,
      allowedChatId: optInt(e, "TELEGRAM_ALLOWED_CHAT_ID"),
      allowedFromId: optInt(e, "TELEGRAM_ALLOWED_FROM_ID"),
    },
    github: {
      token: optString(e, "CLAW_SYS_GITHUB_TOKEN") ?? optString(e, "GITHUB_TOKEN"),
      webhookSecret: optString(e, "GITHUB_WEBHOOK_SECRET"),
      owner: githubOwner,
      repo: githubRepo,
      repoFullName: githubOwner && githubRepo ? `${githubOwner}/${githubRepo}` : null,
      apiBaseUrl:
        typeof e.GITHUB_API_BASE_URL === "string" && e.GITHUB_API_BASE_URL.trim()
          ? e.GITHUB_API_BASE_URL.trim()
          : DEFAULT_API_BASE,
      apiVersion: "2022-11-28",
      userAgent: "altShiftClawCore/1.0.0",
      webhookPath: "/github/webhook",
    },
    scheduleStorage: { database: optBinding(e, "SCHEDULES_DB") },
    scheduleTimeUnderstanding: { model: optString(e, "SCHEDULE_TIME_UNDERSTANDING_MODEL") ?? "@cf/openai/gpt-oss-20b", ai: optBinding(e, "AI") },
    workflowInputInference: { model: optString(e, "WORKFLOW_INPUT_INFERENCE_MODEL") ?? "@cf/openai/gpt-oss-20b", ai: optBinding(e, "AI") },
    version: DEFAULT_VERSION,
  };
}