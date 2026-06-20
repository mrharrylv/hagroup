# =============================================================================
# S3 Outputs
# =============================================================================

output "s3_bucket_name" {
  description = "S3 bucket name for website files"
  value       = aws_s3_bucket.website.id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.website.arn
}

output "s3_bucket_regional_domain" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.website.bucket_regional_domain_name
}

# =============================================================================
# CloudFront Outputs
# =============================================================================

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (use for cache invalidation)"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "cloudfront_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.website.arn
}

# =============================================================================
# ACM Certificate Outputs (prod only — when domain_name is set)
# =============================================================================

output "acm_certificate_arn" {
  description = "ACM certificate ARN"
  value       = var.domain_name != "" ? aws_acm_certificate.website[0].arn : null
}

output "acm_dns_validation_records" {
  description = "DNS records to create for ACM certificate validation (add these to your DNS provider)"
  value = var.domain_name != "" ? {
    for dvo in aws_acm_certificate.website[0].domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  } : {}
}

# =============================================================================
# Environment Information
# =============================================================================

output "environment" {
  description = "Current environment"
  value       = var.environment
}

output "domain_name" {
  description = "Configured domain name (empty if using CloudFront default)"
  value       = var.domain_name
}

output "website_url" {
  description = "Website URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.website.domain_name}"
}

# =============================================================================
# Rollout phase status
# =============================================================================

output "custom_domain_phase" {
  description = "Where this apply is in the two-phase custom-domain rollout"
  value = (
    var.domain_name == "" ? "no_custom_domain" :
    var.enable_custom_domain ? "phase_2_alias_attached" :
    "phase_1_cert_only"
  )
}

# =============================================================================
# Consolidated DNS Records Required
# =============================================================================
# Single, copy-pasteable list of every DNS record that must exist at the DNS
# provider for the configured domain to work. Empty when no custom domain.

output "dns_records_required" {
  description = "All CNAME records that must be created at the DNS provider for the custom domain to work"
  value = var.domain_name != "" ? concat(
    [
      for dvo in aws_acm_certificate.website[0].domain_validation_options : {
        purpose = "ACM certificate validation (add BEFORE re-applying with enable_custom_domain=true)"
        type    = dvo.resource_record_type
        name    = dvo.resource_record_name
        value   = dvo.resource_record_value
        ttl     = 300
      }
    ],
    [
      {
        purpose = "Site alias → CloudFront distribution"
        type    = "CNAME"
        name    = "${var.domain_name}."
        value   = "${aws_cloudfront_distribution.website.domain_name}."
        ttl     = 300
      }
    ]
  ) : []
}
