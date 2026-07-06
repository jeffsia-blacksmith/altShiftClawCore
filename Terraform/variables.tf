variable "cloudflare_api_token" {
  description = "Cloudflare API token used by the Terraform provider."
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID."
  type        = string
}

variable "workers_dev_subdomain" {
  description = "Cloudflare account workers.dev subdomain."
  type        = string
}

variable "github_owner" {
  description = "GitHub repository owner used by altShiftClawCoreWorker."
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name used by altShiftClawCoreWorker."
  type        = string
}

variable "github_claw_worker_name_override" {
  description = "Optional existing Worker name override used to preserve already deployed Workers."
  type        = string
  default     = ""
}

variable "profile_name" {
  description = "Profile display name used by altShiftClawCoreWorker."
  type        = string
}

variable "personality" {
  description = "Profile personality used by altShiftClawCoreWorker."
  type        = string
}

variable "claw_sys_github_token" {
  description = "System GitHub token used by altShiftClawCoreWorker."
  type        = string
  sensitive   = true
}

variable "github_webhook_secret" {
  description = "GitHub webhook secret used by altShiftClawCoreWorker."
  type        = string
  sensitive   = true
}

variable "telegram_bot_token" {
  description = "Telegram bot token used by altShiftClawCoreWorker."
  type        = string
  sensitive   = true
}

variable "telegram_webhook_secret" {
  description = "Telegram webhook secret used by altShiftClawCoreWorker."
  type        = string
  sensitive   = true
}

variable "telegram_chat_id" {
  description = "Optional Telegram chat ID."
  type        = string
  default     = ""
}

variable "telegram_allowed_chat_id" {
  description = "Telegram allowed chat ID list."
  type        = string
  default     = ""
}

variable "telegram_allowed_from_id" {
  description = "Telegram allowed from ID list."
  type        = string
  default     = ""
}

variable "gemini_api_key" {
  description = "Optional Gemini API key."
  type        = string
  default     = ""
  sensitive   = true
}

variable "felo_api_key" {
  description = "Optional Felo API key."
  type        = string
  default     = ""
  sensitive   = true
}

variable "debug_mode" {
  description = "Whether to enable debug mode."
  type        = bool
  default     = false
}

variable "init_github_claw" {
  description = "Whether to initialize altShiftClaw bootstrap flow."
  type        = bool
  default     = true
}
