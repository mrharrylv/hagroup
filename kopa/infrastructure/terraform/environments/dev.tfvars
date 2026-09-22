environment     = "dev"
region          = "eu-north-1"
resource_prefix = "dev-hagroup-kopa"

# Phase one requests the certificate and prints the DNS records to create.
# Flip enable_custom_domain to true and re-apply once the validation CNAME and
# the site CNAME both resolve at the registrar — see kopa/README.md.
domain_name          = "kopa.hagroup.lv"
enable_custom_domain = true

cloudfront_price_class = "PriceClass_100"

owner       = "mrharrylv"
project     = "hagroup-kopa"
cost_center = "kopa"
