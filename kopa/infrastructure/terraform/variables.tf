variable "environment" {
  description = "Deployment environment."
  type        = string

  # Only dev is wired for Kopā: it is a concept demo, and there is no prod
  # bucket, distribution or tfvars file. Adding prod means adding
  # environments/prod.tfvars and widening this list — deliberately, not by
  # accident from a workflow dispatch.
  validation {
    condition     = contains(["dev"], var.environment)
    error_message = "environment must be dev; Kopā has no production stack."
  }
}

variable "region" {
  description = "AWS region for regional resources."
  type        = string
  default     = "eu-north-1"
}

variable "resource_prefix" {
  description = "Unique prefix for every Kopā resource."
  type        = string
}

variable "domain_name" {
  description = "Custom hostname for this environment."
  type        = string
}

variable "enable_custom_domain" {
  description = "Attach the validated ACM certificate and custom alias to CloudFront. Leave false until DNS validation is complete."
  type        = bool
  default     = false
}

variable "cloudfront_enabled" {
  description = "Whether the CloudFront distribution serves traffic."
  type        = bool
  default     = true
}

variable "cloudfront_price_class" {
  description = "CloudFront edge-location price class."
  type        = string
  default     = "PriceClass_100"
}

variable "owner" {
  description = "Resource owner tag."
  type        = string
  default     = "mrharrylv"
}

variable "project" {
  description = "Project and cost-allocation tag."
  type        = string
  default     = "hagroup-kopa"
}

variable "cost_center" {
  description = "Budget and cost-allocation tag shared only by this workload."
  type        = string
  default     = "kopa"
}
