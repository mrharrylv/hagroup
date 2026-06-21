# DEV Environment Configuration
# hagroup Website — DEV

# Environment identity
environment = "dev"

# AWS Region
region = "eu-north-1"

# Resource naming prefix
resource_prefix = "dev"

# Domain — DEV serves dev.hagroup.lv
domain_name = "dev.hagroup.lv"

# Two-phase rollout flag — see doc/deployment.md
#   false → phase 1 (no alias, default cert, prints DNS records to add)
#   true  → phase 2 (alias attached, validated cert; requires DNS in place)
enable_custom_domain = false

# CloudFront price class (North America + Europe)
cloudfront_price_class = "PriceClass_100"

# Tags
owner   = "mrharrylv"
project = "hagroup"
