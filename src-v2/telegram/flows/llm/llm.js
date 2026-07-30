// telegram/flows/llm/llm.js — /llm 命令 + 5 回调 + message:text key/model 输入
// 行为对齐旧 bundle llmComposer（L17590-17808）。
// 注意：整个流程硬编码英文，零 i18n key。键交付走 repos.createDispatchEvent(update-llm-secret)。

import { InlineKeyboard } from "grammy";
import { getLlmState, setLlmState, clearLlmState } from "./state.js";
import { getActiveIssue } from "../../../db/kv-state.js";
import { logWarn } from "../../../i18n/log.js";

// octokit getContent helper
async function getContent(octokit, owner, repo, path, ref) {
  const { data } = await octokit.rest.repos.getContent({ owner, repo, path, ref });
  if (data.content) {
    return JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
  }
  return null;
}

// llmLoadCatalog — templates/default/githubclaw.json
async function loadCatalog(octokit, owner, repo) {
  return await getContent(octokit, owner, repo, "templates/default/githubclaw.json", "main");
}

// llmReadSettings — issue-<n> 分支 .pi/settings.json
async function readSettings(octokit, owner, repo, issueNumber) {
  try {
    return await getContent(octokit, owner, repo, ".pi/settings.json", `issue-${issueNumber}`);
  } catch {
    return {};
  }
}

// llmSecretExists — actions.getRepoSecret
async function secretExists(octokit, owner, repo, secretName) {
  try {
    await octokit.rest.actions.getRepoSecret({ owner, repo, secret_name: secretName });
    return true;
  } catch {
    return false;
  }
}

// llmValidateKeyFormat
function validateKeyFormat(provider, key) {
  const checks = {
    google: { prefix: ["AIza", "AQ."], msg: "Gemini API Key format is incorrect; it should start with 'AIza' or 'AQ.'." },
    anthropic: { prefix: ["sk-ant-"], msg: "Anthropic Claude API Key format is incorrect; it should start with 'sk-ant-'." },
    openai: { prefix: ["sk-"], msg: "OpenAI API Key format is incorrect; it should start with 'sk-'." },
    groq: { prefix: ["gsk_"], msg: "Groq API Key format is incorrect; it should start with 'gsk_'." },
    openrouter: { prefix: ["sk-or-v1-"], msg: "OpenRouter API Key format is incorrect; it should start with 'sk-or-v1-'." },
  };
  const c = checks[provider];
  if (!c) return null;
  if (!c.prefix.some((p) => key.startsWith(p))) return c.msg;
  return null;
}

// 键盘 builders
function providerKeyboard(catalog) {
  const kb = new InlineKeyboard();
  for (const p of catalog.providers ?? []) {
    kb.text(`🤖 ${p.label}`, `llm_provider:${p.id}`).row();
  }
  kb.text("❌ Cancel", "llm_cancel:0");
  return kb;
}

function keyActionKeyboard() {
  return new InlineKeyboard()
    .text("♻️ Reuse existing Key", "llm_key:reuse")
    .text("🔑 Enter a new API Key", "llm_key:new")
    .row()
    .text("❌ Cancel", "llm_cancel:0");
}

function modelKeyboard(models) {
  const kb = new InlineKeyboard();
  models.forEach((m, i) => {
    kb.text(m.label ?? m.value, `llm_model:${i}`).row();
  });
  kb.text("✍️ Custom model name input", "llm_model_custom:0").row();
  kb.text("❌ Cancel", "llm_cancel:0");
  return kb;
}

// llmShowModelMenu
async function showModelMenu(ctx, chatId, state) {
  const text = `🧠 Provider: ${state.provider}\nChoose a model to use, or pick "Custom input":`;
  const kb = modelKeyboard(state.models ?? []);
  if (state.promptMessageId) {
    try {
      await ctx.api.editMessageText(chatId, state.promptMessageId, text, { reply_markup: kb });
    } catch {
      const sent = await ctx.reply(text, { reply_markup: kb });
      state.promptMessageId = sent.message_id;
      await setLlmState(ctx.services.store, chatId, state);
    }
  } else {
    const sent = await ctx.reply(text, { reply_markup: kb });
    state.promptMessageId = sent.message_id;
    await setLlmState(ctx.services.store, chatId, state);
  }
}

// llmFinish
async function finishLlm(ctx, chatId, state, modelValue) {
  const { octokit, config } = ctx.services;
  const { owner, repo } = config.github;
  try {
    const existing = await readSettings(octokit, owner, repo, state.issueNumber);
    const merged = { ...existing, defaultProvider: state.provider, defaultModel: modelValue };
    const content = JSON.stringify(merged, null, 2) + "\n";
    // octokit: 写 .pi/settings.json 到 issue-<n> 分支
    let sha;
    try {
      const cur = await octokit.rest.repos.getContent({
        owner, repo, path: ".pi/settings.json", ref: `issue-${state.issueNumber}`,
      });
      sha = cur.data.sha;
    } catch {}
    await octokit.rest.repos.createOrUpdateFileContents({
      owner, repo, path: ".pi/settings.json", message: `chore: set LLM provider ${state.provider} / model ${modelValue} via /llm`,
      content: Buffer.from(content).toString("base64"), branch: `issue-${state.issueNumber}`, sha,
    });
  } catch (e) {
    await ctx.reply(`❌ Failed to write .pi/settings.json: ${e.message}\nPlease confirm the issue-${state.issueNumber} branch exists, then retry /llm.`);
    return;
  }
  await clearLlmState(ctx.services.store, chatId);
  let text = `✅ Set #${state.issueNumber} AI provider: ${state.provider}\n🧠 Model: ${modelValue}`;
  if (state.keyDispatched) {
    text += `\n🔐 API Key has been sent to GitHub Actions to write to repo secret (${state.secretName}); it takes effect in tens of seconds.`;
  }
  if (state.promptMessageId) {
    try {
      await ctx.api.editMessageText(chatId, state.promptMessageId, text);
    } catch {
      await ctx.reply(text);
    }
  } else {
    await ctx.reply(text);
  }
}

export function registerLlm(composer) {
  // /llm 命令
  composer.command("llm", async (ctx) => {
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const active = await getActiveIssue(store, chatId);
    if (!active) {
      await ctx.reply("⚠️ No Lobster selected yet. Please use /list to pick one first. (LLM settings are per-Lobster.)");
      return;
    }
    let catalog;
    try {
      catalog = await loadCatalog(octokit, owner, repo);
    } catch (e) {
      await ctx.reply(`❌ Failed to load provider catalog: ${e.message}`);
      return;
    }
    if (!catalog) {
      await ctx.reply("❌ Provider catalog not found (templates/default/githubclaw.json). Please ensure the template is synced.");
      return;
    }
    const settings = await readSettings(octokit, owner, repo, active).catch(() => ({}));
    const text = [
      `🧠 #${active} current LLM settings:`,
      `Provider: ${settings.defaultProvider ?? "(not set)"}`,
      `Model: ${settings.defaultModel ?? "(not set)"}`,
      "",
      "Choose a new AI provider:",
    ].join("\n");
    await setLlmState(store, chatId, { step: "selecting_provider", issueNumber: active });
    await ctx.reply(text, { reply_markup: providerKeyboard(catalog) });
  });

  // llm_provider:<id>
  composer.callbackQuery(/^llm_provider:/, async (ctx) => {
    const { octokit, store, config } = ctx.services;
    const { owner, repo } = config.github;
    const chatId = ctx.chat?.id;
    const state = await getLlmState(store, chatId);
    if (!state) return;
    const providerId = ctx.callbackQuery.data.slice("llm_provider:".length);
    let catalog;
    try {
      catalog = await loadCatalog(octokit, owner, repo);
    } catch {
      catalog = null;
    }
    const provider = catalog?.providers?.find((p) => p.id === providerId);
    if (!provider) {
      await ctx.answerCallbackQuery("⚠️ Invalid provider.");
      return;
    }
    await ctx.answerCallbackQuery();
    const msgId = ctx.callbackQuery.message?.message_id ?? state.promptMessageId;
    const newState = {
      ...state,
      step: "choosing_key_action",
      provider: provider.id,
      secretName: provider.secretName,
      models: (provider.models ?? []).map((m) => ({ value: m.value, label: m.label })),
      promptMessageId: msgId,
    };
    const exists = await secretExists(octokit, owner, repo, provider.secretName).catch(() => false);
    if (exists) {
      newState.step = "choosing_key_action";
      const text = `🔑 Detected an existing repo secret: ${provider.secretName}\nReuse the existing Key, or enter a new one?`;
      await setLlmState(store, chatId, newState);
      try {
        await ctx.api.editMessageText(chatId, msgId, text, { reply_markup: keyActionKeyboard() });
      } catch {
        await ctx.reply(text, { reply_markup: keyActionKeyboard() });
      }
    } else {
      newState.step = "awaiting_llm_key";
      const text = `🔐 Please reply directly with your ${provider.label} API Key.\nFor security, your Key message will be deleted immediately after reading, and sent to GitHub Actions to write to repo secret (${provider.secretName}); it will not remain in the chat.`;
      await setLlmState(store, chatId, newState);
      try {
        await ctx.api.editMessageText(chatId, msgId, text);
      } catch {
        await ctx.reply(text);
      }
    }
  });

  // llm_key:reuse / llm_key:new
  composer.callbackQuery(/^llm_key:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const state = await getLlmState(store, chatId);
    if (!state || state.step !== "choosing_key_action") {
      await ctx.answerCallbackQuery("⚠️ Menu has expired. Please re-run /llm.");
      return;
    }
    const action = ctx.callbackQuery.data.slice("llm_key:".length);
    const msgId = ctx.callbackQuery.message?.message_id;
    if (action === "reuse") {
      const newState = { ...state, step: "selecting_model", promptMessageId: msgId };
      await setLlmState(store, chatId, newState);
      await showModelMenu(ctx, chatId, newState);
    } else {
      const newState = { ...state, step: "awaiting_llm_key", promptMessageId: msgId };
      await setLlmState(store, chatId, newState);
      const text = `🔐 Please reply directly with your new API Key.\nThe message will be deleted immediately after reading, and sent to GitHub Actions to write to repo secret (${state.secretName}).`;
      try {
        await ctx.api.editMessageText(chatId, msgId, text);
      } catch {
        await ctx.reply(text);
      }
    }
  });

  // llm_model:<n>
  composer.callbackQuery(/^llm_model:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const state = await getLlmState(store, chatId);
    if (!state || state.step !== "selecting_model") {
      await ctx.answerCallbackQuery("⚠️ Menu has expired. Please re-run /llm.");
      return;
    }
    const idx = Number(ctx.callbackQuery.data.slice("llm_model:".length));
    const model = state.models?.[idx];
    if (!model) {
      await ctx.answerCallbackQuery("⚠️ Invalid model option.");
      return;
    }
    await ctx.answerCallbackQuery();
    await finishLlm(ctx, chatId, state, model.value);
  });

  // llm_model_custom:0
  composer.callbackQuery(/^llm_model_custom:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    const state = await getLlmState(store, chatId);
    if (!state || state.step !== "selecting_model") {
      await ctx.answerCallbackQuery("⚠️ Menu has expired. Please re-run /llm.");
      return;
    }
    await ctx.answerCallbackQuery();
    const msgId = ctx.callbackQuery.message?.message_id;
    const newState = { ...state, step: "awaiting_llm_model_input", promptMessageId: msgId };
    await setLlmState(store, chatId, newState);
    const example = state.models?.[0]?.value ?? "gpt-5-mini";
    const text = `✍️ Please reply directly with the model name (e.g. ${example}):`;
    try {
      await ctx.api.editMessageText(chatId, msgId, text);
    } catch {
      await ctx.reply(text);
    }
  });

  // llm_cancel:0
  composer.callbackQuery(/^llm_cancel:/, async (ctx) => {
    const { store } = ctx.services;
    const chatId = ctx.chat?.id;
    await clearLlmState(store, chatId);
    await ctx.answerCallbackQuery("Cancelled");
    const msgId = ctx.callbackQuery.message?.message_id;
    if (msgId) {
      try {
        await ctx.api.editMessageText(chatId, msgId, "❌ LLM setup cancelled.");
      } catch {}
    }
  });
}

// message:text handler for llm key/model input — 返回 true 表示已消费
export async function handleLlmText(ctx) {
  const { store, octokit, config } = ctx.services;
  const { owner, repo } = config.github;
  const chatId = ctx.chat?.id;
  if (!chatId) return false;
  const text = ctx.message?.text;
  if (!text || text.startsWith("/")) return false;
  const state = await getLlmState(store, chatId);
  if (!state) return false;
  if (state.step !== "awaiting_llm_key" && state.step !== "awaiting_llm_model_input") return false;

  if (state.step === "awaiting_llm_key") {
    // 删除用户消息
    try {
      await ctx.api.deleteMessage(chatId, ctx.message.message_id);
    } catch {}
    const key = text.trim();
    if (!key) {
      await ctx.reply("⚠️ Key cannot be empty. Please enter it again.");
      return true;
    }
    const formatErr = validateKeyFormat(state.provider, key);
    if (formatErr) {
      await ctx.reply(`⚠️ ${formatErr}`);
      return true;
    }
    try {
      await octokit.rest.repos.createDispatchEvent({
        owner, repo, event_type: "update-llm-secret",
        client_payload: { provider: state.provider, secret_name: state.secretName, api_key: key },
      });
    } catch (e) {
      await ctx.reply(`❌ Failed to trigger secret update: ${e.message}`);
      return true;
    }
    const newState = { ...state, step: "selecting_model", apiKey: key, keyDispatched: true };
    await setLlmState(store, chatId, newState);
    await showModelMenu(ctx, chatId, newState);
    return true;
  }

  // awaiting_llm_model_input
  const model = text.trim();
  if (!model) {
    await ctx.reply("⚠️ Model name cannot be empty. Please enter it again.");
    return true;
  }
  // Validate model against provider API（对齐旧 bundle llmValidateModel）
  if (state.apiKey) {
    try {
      const valid = await validateModel(state.provider, state.apiKey, model);
      if (!valid) {
        await ctx.reply(`❌ Validation failed: provider ${state.provider} cannot find model "${model}". Please check the model name and try again.`);
        return true;
      }
    } catch (e) {
      logWarn("log.workflow.inferInputsFailed", { error: e?.message ?? String(e) });
      // 如果验证 API 不可用，继续接受模型（graceful fallback）
    }
  }
  await finishLlm(ctx, chatId, state, model);
  return true;
}

// validateModel — 查询 provider API 验证模型是否存在
async function validateModel(provider, apiKey, model) {
  const headers = { "Content-Type": "application/json" };
  if (provider === "openai" || provider === "openrouter") {
    headers["Authorization"] = `Bearer ${apiKey}`;
    const url = provider === "openrouter" ? "https://openrouter.ai/api/v1/models" : "https://api.openai.com/v1/models";
    const resp = await fetch(url, { headers });
    if (!resp.ok) throw new Error(`API returned ${resp.status}`);
    const data = await resp.json();
    const models = (data.data ?? []).map((m) => m.id);
    return models.includes(model);
  }
  if (provider === "anthropic") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
    const resp = await fetch(`https://api.anthropic.com/v1/models`, { headers });
    if (!resp.ok) throw new Error(`API returned ${resp.status}`);
    const data = await resp.json();
    const models = (data.data ?? []).map((m) => m.id);
    return models.includes(model);
  }
  if (provider === "groq") {
    headers["Authorization"] = `Bearer ${apiKey}`;
    const resp = await fetch("https://api.groq.com/openai/v1/models", { headers });
    if (!resp.ok) throw new Error(`API returned ${resp.status}`);
    const data = await resp.json();
    const models = (data.data ?? []).map((m) => m.id);
    return models.includes(model);
  }
  if (provider === "google") {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!resp.ok) throw new Error(`API returned ${resp.status}`);
    const data = await resp.json();
    const models = (data.models ?? []).map((m) => m.name?.replace("models/", "") ?? m.name);
    return models.includes(model);
  }
  // Unknown provider → skip validation
  return true;
}