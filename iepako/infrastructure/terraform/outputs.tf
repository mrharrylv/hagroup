output "s3_bucket_name" {
  description = "Private deployment bucket."
  value       = aws_s3_bucket.website.id
}

output "cloudfront_distribution_id" {
  description = "Distribution ID used by the frontend pipeline."
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "CloudFront hostname available before custom DNS is attached."
  value       = aws_cloudfront_distribution.website.domain_name
}

output "domain_name" {
  value = var.domain_name
}

output "website_url" {
  value = var.enable_custom_domain ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "custom_domain_phase" {
  value = var.enable_custom_domain ? "phase_2_alias_attached" : "phase_1_certificate_requested"
}

output "cost_allocation_tags" {
  description = "Tags available for AWS Cost Explorer and budget filters after activation as cost-allocation tags."
  value       = local.tags
}

output "dns_records_required" {
  description = "CNAME records to add at the DNS provider. Add certificate validation first, then enable the custom domain and apply again."
  value = concat(
    [
      for option in aws_acm_certificate.website.domain_validation_options : {
        purpose = "ACM certificate validation"
        type    = option.resource_record_type
        name    = option.resource_record_name
        value   = option.resource_record_value
        ttl     = 300
      }
    ],
    [
      {
        purpose = "Website alias to CloudFront"
        type    = "CNAME"
        name    = "${var.domain_name}."
        value   = "${aws_cloudfront_distribution.website.domain_name}."
        ttl     = 300
      }
    ]
  )
}
