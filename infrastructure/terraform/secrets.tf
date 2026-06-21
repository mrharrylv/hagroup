# =============================================================================
# AWS Secrets Manager — server-side application secrets
# =============================================================================
# The secret *container* is managed here as code. Its *value* is injected by the
# "Sync Secrets to AWS" workflow (.github/workflows/secrets-sync.yaml), so the
# plaintext credentials never land in Terraform state.
#
# Order of operations:
#   1. Terraform (this file, via the infra workflow) creates the empty container.
#   2. The "Sync Secrets to AWS" workflow writes GMAIL_ADDRESS / GMAIL_APP_PASSWORD.
#   3. An AWS backend reads it at runtime (see infrastructure/secrets.md).

resource "aws_secretsmanager_secret" "gmail" {
  name        = "${local.name_prefix}-hagroup-gmail"
  description = "Gmail credentials (GMAIL_ADDRESS, GMAIL_APP_PASSWORD) for ${var.environment}. Value injected by CI — never stored in Terraform state."

  # CI-managed secret whose value is reproducible from the GitHub Actions secrets,
  # so allow immediate deletion (no 7–30 day window) to avoid name-reuse collisions
  # when the infra is destroyed and re-applied.
  recovery_window_in_days = 0

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-hagroup-gmail"
  })
}
