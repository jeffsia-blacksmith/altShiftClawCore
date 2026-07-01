output "schedules_db_uuid" {
  description = "D1 database UUID."
  value       = local.schedules_db_uuid
}

output "schedules_db_name" {
  description = "D1 database name."
  value       = local.schedules_db_name
}

output "github_claw_worker_script_name" {
  description = "GithubClawWorker script name."
  value       = cloudflare_worker.github_claw.name
}

output "github_claw_workers_dev_enabled" {
  description = "Whether the GithubClawWorker workers.dev subdomain is enabled."
  value       = cloudflare_worker.github_claw.subdomain.enabled
}

output "github_claw_worker_url" {
  description = "GithubClawWorker workers.dev URL."
  value       = "https://${cloudflare_worker.github_claw.name}.${var.workers_dev_subdomain}.workers.dev"
}

output "github_claw_fixed_cron" {
  description = "Cron schedule applied to GithubClawWorker."
  value       = "* * * * *"
}
