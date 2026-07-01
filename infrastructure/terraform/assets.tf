# =============================================================================
# Brand Assets Bucket (logo, favicon, etc.)
#
# A dedicated origin for static brand assets that must PERSIST across website
# deploys. The website deploy pipeline (.github/workflows/deploy.yaml) runs an
# orphan-cleanup (Phase 4) that deletes any object in the website bucket which
# is not part of the latest build — that would wipe manually-uploaded files.
#
# This bucket is never written to by that pipeline, so anything uploaded here is
# permanent. It is served through the SAME CloudFront distribution under the
# /brand/* path (see the ordered_cache_behavior + second origin in main.tf).
#
# NOTE: the path is /brand/* — NOT /assets/*, which is Vite's default build
# output dir (dist/assets/*.js|css) served from the website bucket.
#
# Upload target (objects live under the brand/ key prefix):
#   aws s3 cp logo.png s3://<prefix>-hagroup-assets/brand/logo.png ...
# =============================================================================

locals {
  assets_bucket_name = "${local.name_prefix}-hagroup-assets"
}

resource "aws_s3_bucket" "assets" {
  bucket = local.assets_bucket_name

  # Allow Terraform to delete the bucket even when it still contains objects
  # (versioning is enabled below, so a plain destroy would fail on BucketNotEmpty).
  force_destroy = true

  tags = merge(local.tags, {
    Name = local.assets_bucket_name
  })
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Keep overwritten (noncurrent) versions for 30 days as an accidental-overwrite
# safety net, then expire them.
resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    id     = "expire-noncurrent-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

# Dedicated Origin Access Control for the assets origin.
resource "aws_cloudfront_origin_access_control" "assets" {
  name                              = "${local.name_prefix}-${var.project}-assets-oac"
  description                       = "OAC for ${var.environment} ${var.project} brand assets bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Only allow CloudFront (this distribution) to read the assets bucket.
resource "aws_s3_bucket_policy" "assets" {
  bucket = aws_s3_bucket.assets.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontOAC"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.assets.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.website.arn
          }
        }
      }
    ]
  })
}
