# =============================================================================
# Environment Configuration
# =============================================================================

variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be 'dev' or 'prod'."
  }
}

variable "region" {
  type        = string
  description = "AWS region"
  default     = "eu-north-1"
}

variable "resource_prefix" {
  type        = string
  description = "Prefix for resource naming to prevent collisions"
}

# =============================================================================
# Domain Configuration
# =============================================================================

variable "domain_name" {
  type        = string
  description = "Domain name for the website (e.g. hagroup.lv). Leave empty for CloudFront default domain."
  default     = ""
}

variable "enable_custom_domain" {
  type        = bool
  description = <<-EOT
    Two-phase rollout flag.
      false (phase 1): create the ACM cert so validation CNAME can be read from outputs,
                       but do NOT attach the alias or cert to CloudFront. Site stays on
                       the default *.cloudfront.net URL. Safe to apply before DNS exists.
      true  (phase 2): attach domain_name as a CloudFront alias and use the (now ISSUED)
                       ACM cert. Requires both DNS CNAMEs to be in place first.
    Has no effect when domain_name is empty.
  EOT
  default     = false
}

# =============================================================================
# CloudFront Configuration
# =============================================================================

variable "cloudfront_price_class" {
  type        = string
  description = "CloudFront price class"
  default     = "PriceClass_100"
}

variable "cloudfront_enabled" {
  type        = bool
  description = <<-EOT
    On/off switch for the CloudFront distribution.
      true  → distribution serves traffic normally.
      false → distribution is disabled ("stopped"): it stops serving and incurs
              no request/data-transfer charges, while the distribution, its
              CloudFront domain name, aliases and ACM certificate are preserved.
              No DNS records need to change; set back to true to resume serving.
  EOT
  default     = true
}

# =============================================================================
# Tags and Metadata
# =============================================================================

variable "owner" {
  type        = string
  description = "Owner of the resources"
  default     = "mrharrylv"
}

variable "project" {
  type        = string
  description = "Project name used in resource names and tags"
  default     = "hagroup"
}
