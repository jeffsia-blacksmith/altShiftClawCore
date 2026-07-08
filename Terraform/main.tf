provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

data "cloudflare_d1_databases" "existing_schedules" {
  account_id = var.cloudflare_account_id
  name       = local.schedules_db_name
}

locals {
  github_owner_slug      = trim(replace(replace(lower(trimspace(var.github_owner)), "/[^a-z0-9-]+/", "-"), "/-+/", "-"), "-")
  github_repo_slug       = trim(replace(replace(lower(trimspace(var.github_repo)), "/[^a-z0-9-]+/", "-"), "/-+/", "-"), "-")
  github_claw_name_parts = compact([local.github_owner_slug, local.github_repo_slug])
  github_claw_name_base  = length(local.github_claw_name_parts) > 0 ? join("-", local.github_claw_name_parts) : "githubclaw"
  github_claw_name_hash  = substr(sha256("${trimspace(var.github_owner)}\n${trimspace(var.github_repo)}"), 0, 8)
  github_claw_name_short = trim(substr(local.github_claw_name_base, 0, 42), "-")
  github_claw_short_base = length(local.github_claw_name_short) > 0 ? local.github_claw_name_short : "githubclaw"
  github_claw_canonical_worker_name = (
    length("${local.github_claw_name_base}-claw-worker") <= 63
    ? "${local.github_claw_name_base}-claw-worker"
    : "${local.github_claw_short_base}-claw-worker-${local.github_claw_name_hash}"
  )
  github_claw_worker_name = (
    trimspace(var.github_claw_worker_name_override) != ""
    ? trimspace(var.github_claw_worker_name_override)
    : local.github_claw_canonical_worker_name
  )
  github_claw_script_path = "../index.js"
  schedules_db_name       = "${local.github_claw_name_base}-claw-schedules"
  schedules_db_result     = try(data.cloudflare_d1_databases.existing_schedules.result, [])
  schedules_db_uuid       = length(local.schedules_db_result) > 0 ? local.schedules_db_result[0].uuid : cloudflare_d1_database.schedules[0].uuid

  github_claw_bindings = [
    {
      name = "SCHEDULES_DB"
      type = "d1"
      id   = local.schedules_db_uuid
    },
    {
      name = "AI"
      type = "ai"
    },
    {
      name = "GITHUB_OWNER"
      type = "plain_text"
      text = var.github_owner
    },
    {
      name = "GITHUB_REPO"
      type = "plain_text"
      text = var.github_repo
    },
    {
      name = "PROFILE_NAME"
      type = "plain_text"
      text = var.profile_name
    },
    {
      name = "PERSONALITY"
      type = "plain_text"
      text = var.personality
    },
    {
      name = "CLAW_LANGUAGE"
      type = "plain_text"
      text = var.claw_language
    },
    {
      name = "GITHUB_WEBHOOK_SECRET"
      type = "secret_text"
      text = var.github_webhook_secret
    },
    {
      name = "CLAW_SYS_GITHUB_TOKEN"
      type = "secret_text"
      text = var.claw_sys_github_token
    },
    {
      name = "TELEGRAM_BOT_TOKEN"
      type = "secret_text"
      text = var.telegram_bot_token
    },
    {
      name = "TELEGRAM_WEBHOOK_SECRET"
      type = "secret_text"
      text = var.telegram_webhook_secret
    },
    {
      name = "TELEGRAM_CHAT_ID"
      type = "plain_text"
      text = var.telegram_chat_id
    },
    {
      name = "TELEGRAM_ALLOWED_CHAT_ID"
      type = "plain_text"
      text = var.telegram_allowed_chat_id
    },
    {
      name = "TELEGRAM_ALLOWED_FROM_ID"
      type = "plain_text"
      text = var.telegram_allowed_from_id
    },
    {
      name = "GEMINI_API_KEY"
      type = "secret_text"
      text = var.gemini_api_key
    },
    {
      name = "FELO_API_KEY"
      type = "secret_text"
      text = var.felo_api_key
    },
    {
      name = "DEBUG_MODE"
      type = "plain_text"
      text = var.debug_mode ? "true" : "false"
    },
    {
      name = "INIT_GITHUB_CLAW"
      type = "plain_text"
      text = var.init_github_claw ? "true" : "false"
    },
    {
      name = "TELEGRAM_API_BASE_URL"
      type = "plain_text"
      text = "https://api.telegram.org"
    },
    {
      name = "TELEGRAM_WEBHOOK_PATH"
      type = "plain_text"
      text = "/telegram/webhook"
    },
    {
      name = "TELEGRAM_MAX_MESSAGE_LENGTH"
      type = "plain_text"
      text = "2000"
    },
  ]
}

resource "cloudflare_d1_database" "schedules" {
  count = length(local.schedules_db_result) > 0 ? 0 : 1

  account_id = var.cloudflare_account_id
  name       = local.schedules_db_name

  primary_location_hint = "wnam"
  read_replication = {
    mode = "disabled"
  }
}

resource "cloudflare_worker" "github_claw" {
  account_id = var.cloudflare_account_id
  name       = local.github_claw_worker_name

  observability = {
    enabled            = true
    head_sampling_rate = 1
    logs = {
      enabled            = true
      head_sampling_rate = 1
      invocation_logs    = true
    }
  }

  subdomain = {
    enabled          = true
    previews_enabled = false
  }
}

resource "cloudflare_worker_version" "github_claw" {
  account_id         = var.cloudflare_account_id
  worker_id          = cloudflare_worker.github_claw.id
  compatibility_date = "2026-03-09"
  main_module        = "index.js"
  bindings           = local.github_claw_bindings

  modules = [{
    name           = "index.js"
    content_type   = "application/javascript+module"
    content_base64 = filebase64(local.github_claw_script_path)
  }]
}

resource "cloudflare_workers_deployment" "github_claw" {
  account_id  = var.cloudflare_account_id
  script_name = cloudflare_worker.github_claw.name
  strategy    = "percentage"

  versions = [{
    percentage = 100
    version_id = cloudflare_worker_version.github_claw.id
  }]
}

resource "cloudflare_workers_cron_trigger" "github_claw" {
  account_id  = var.cloudflare_account_id
  script_name = cloudflare_worker.github_claw.name
  depends_on  = [cloudflare_workers_deployment.github_claw]

  schedules = [{
    cron = "* * * * *"
  }]
}
