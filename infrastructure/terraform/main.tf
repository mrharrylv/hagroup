terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Backend configuration is partial - state key is set dynamically via -backend-config
  # Example: terraform init -backend-config="key=dev/terraform.tfstate"
  # or: terraform init -backend-config="key=prod/terraform.tfstate"
  backend "s3" {
    bucket  = "ha-terraform-state-561341419749"
    region  = "eu-north-1"
    encrypt = true
  }
}

provider "aws" {
  region = var.region
}

# ACM certificates for CloudFront must be in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}

# =============================================================================
# Local Values
# =============================================================================

locals {
  name_prefix = var.resource_prefix

  tags = {
    Environment = var.environment
    Owner       = var.owner
    ManagedBy   = "Terraform"
    Project     = var.project
  }

  # S3 bucket name
  bucket_name = "${local.name_prefix}-hagroup-website"
}

# =============================================================================
# S3 Bucket (Static Website Origin)
# =============================================================================

resource "aws_s3_bucket" "website" {
  bucket = local.bucket_name

  # Allow Terraform to delete the bucket even when it still contains objects.
  # Versioning is enabled below, so a plain destroy fails with BucketNotEmpty
  # because object versions and delete markers remain. force_destroy purges
  # all versions before deleting the bucket.
  force_destroy = true

  tags = merge(local.tags, {
    Name = local.bucket_name
  })
}

resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Lifecycle rule — auto-expire noncurrent object versions after 7 days.
# During zero-downtime deploys, old hashed assets coexist briefly with new ones.
# This rule cleans up orphaned noncurrent versions automatically as a safety net.
resource "aws_s3_bucket_lifecycle_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    id     = "expire-noncurrent-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 7
    }

    # Clean up incomplete multipart uploads after 1 day
    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

# S3 bucket policy — only allow CloudFront OAC to read
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontOAC"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.website.arn
          }
        }
      }
    ]
  })
}

# =============================================================================
# ACM Certificate (must be in us-east-1 for CloudFront)
# =============================================================================

resource "aws_acm_certificate" "website" {
  count    = var.domain_name != "" ? 1 : 0
  provider = aws.us_east_1

  domain_name       = var.domain_name
  validation_method = "DNS"

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-acm-cert"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Wait for the ACM certificate to reach ISSUED status before CloudFront
# attempts to use it. DNS validation records are added externally (zone.eu),
# so this resource simply polls until the cert is valid.
resource "aws_acm_certificate_validation" "website" {
  count    = var.domain_name != "" && var.enable_custom_domain ? 1 : 0
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.website[0].arn
  validation_record_fqdns = [for dvo in aws_acm_certificate.website[0].domain_validation_options : dvo.resource_record_name]
}

# =============================================================================
# CloudFront Origin Access Control
# =============================================================================

resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "${local.name_prefix}-${var.project}-oac"
  description                       = "OAC for ${var.environment} ${var.project} S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# =============================================================================
# CloudFront Distribution
# =============================================================================

resource "aws_cloudfront_distribution" "website" {
  enabled             = var.cloudfront_enabled
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "${var.environment} - hagroup website"
  price_class         = var.cloudfront_price_class
  aliases             = var.domain_name != "" && var.enable_custom_domain ? [var.domain_name] : []

  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = "S3-${local.bucket_name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${local.bucket_name}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  # SPA routing — return index.html for 403/404 errors
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    # Use validated ACM cert only when both domain is set AND enable_custom_domain=true (phase 2)
    # References aws_acm_certificate_validation to ensure cert is ISSUED before CloudFront uses it
    acm_certificate_arn            = var.domain_name != "" && var.enable_custom_domain ? aws_acm_certificate_validation.website[0].certificate_arn : null
    cloudfront_default_certificate = !(var.domain_name != "" && var.enable_custom_domain)
    ssl_support_method             = var.domain_name != "" && var.enable_custom_domain ? "sni-only" : null
    minimum_protocol_version       = var.domain_name != "" && var.enable_custom_domain ? "TLSv1.2_2021" : null
  }

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-cloudfront"
  })
}
