# PROD Environment Configuration
# hagroup Website — PROD

# Environment identity
environment = "prod"

# AWS Region
region = "eu-north-1"

# Resource naming prefix
resource_prefix = "prod"

# Domain — PROD serves www.hagroup.lv.
# zone.eu has no ALIAS/ANAME record type, so the apex cannot CNAME to
# CloudFront. www is the canonical domain; the apex is redirected to www via
# a zone.eu URL (301) record.
domain_name = "www.hagroup.lv"

# Two-phase rollout flag — see doc/deployment.md
#   false → phase 1 (no alias, default cert, prints DNS records to add)
#   true  → phase 2 (alias attached, validated cert; requires DNS in place)
enable_custom_domain = false

# CloudFront price class (North America + Europe)
cloudfront_price_class = "PriceClass_100"

# Tags
owner   = "mrharrylv"
project = "hagroup"
