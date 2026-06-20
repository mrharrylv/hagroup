# DNS Configuration — zone.eu

DNS records for `eventapp.lv` managed at [zone.eu](https://my.zone.eu).

---

## Overview

| Item                | Value                         |
| ------------------- | ----------------------------- |
| DNS Provider        | zone.eu                       |
| Domain              | `eventapp.lv`                 |
| Subdomain (prod)    | `cloudie.eventapp.lv`         |
| Points to           | AWS CloudFront distribution   |
| SSL                 | ACM certificate (us-east-1)   |

---

## Required DNS Records

### 1. ACM Certificate Validation (one-time)

When Terraform provisions the prod environment, ACM creates a certificate for `cloudie.eventapp.lv` in `PENDING_VALIDATION` state. You must add a CNAME record to prove domain ownership.

**Get the validation record from Terraform:**

```bash
cd infrastructure/terraform
terraform init -reconfigure -backend-config="key=prod/terraform.tfstate"
terraform output acm_dns_validation_records
```

Output will look like:

```
{
  "cloudie.eventapp.lv" = {
    name  = "_abc123.cloudie.eventapp.lv."
    type  = "CNAME"
    value = "_def456.acm-validations.aws."
  }
}
```

**Add to zone.eu:**

| Type  | Name                              | Value                            | TTL  |
| ----- | --------------------------------- | -------------------------------- | ---- |
| CNAME | `_abc123.cloudie.eventapp.lv`     | `_def456.acm-validations.aws.`  | 3600 |

> Replace the example values with the actual output from Terraform.

**Verify validation status:**

```bash
aws acm list-certificates --region us-east-1 \
  --query "CertificateSummaryList[?DomainName=='cloudie.eventapp.lv'].Status" \
  --output text
```

Expected: `ISSUED` (takes 5–30 minutes after adding the DNS record).

> **Do not delete** the ACM validation CNAME record. AWS uses it for automatic certificate renewal.

---

### 2. CloudFront Domain Record (one-time)

After the ACM certificate is validated and the CloudFront distribution is deployed, point the subdomain to CloudFront.

**Get the CloudFront domain:**

```bash
cd infrastructure/terraform
terraform output cloudfront_domain_name
```

Output example: `d1234abcdef.cloudfront.net`

**Add to zone.eu:**

| Type  | Name      | Value                              | TTL  |
| ----- | --------- | ---------------------------------- | ---- |
| CNAME | `cloudie` | `d1234abcdef.cloudfront.net`       | 3600 |

> Replace with the actual CloudFront domain from the Terraform output.

---

## Step-by-Step — zone.eu Panel

1. Log in to [my.zone.eu](https://my.zone.eu)
2. Navigate to **DNS Management** → select `eventapp.lv`
3. Click **Add Record**
4. For _ACM validation_:
   - Type: **CNAME**
   - Name: paste the `name` value from Terraform output (without trailing dot, without the base domain — zone.eu appends it)
   - Value: paste the `value` from Terraform output
   - TTL: **3600**
   - Save
5. For _CloudFront domain_:
   - Type: **CNAME**
   - Name: `cloudie`
   - Value: paste the CloudFront domain name (`d1234abcdef.cloudfront.net`)
   - TTL: **3600**
   - Save
6. Wait for DNS propagation (typically 5–15 minutes)

---

## Verification

```bash
# Check ACM validation record exists
dig _abc123.cloudie.eventapp.lv CNAME +short

# Check domain points to CloudFront
dig cloudie.eventapp.lv CNAME +short
# Expected: d1234abcdef.cloudfront.net

# Check HTTPS works
curl -I https://cloudie.eventapp.lv
# Expected: HTTP/2 200
```

---

## Summary of DNS Records

| #  | Type  | Name                              | Value                           | Purpose               |
| -- | ----- | --------------------------------- | ------------------------------- | --------------------- |
| 1  | CNAME | `_<hash>.cloudie.eventapp.lv`     | `_<hash>.acm-validations.aws.` | ACM SSL validation    |
| 2  | CNAME | `cloudie`                         | `<id>.cloudfront.net`           | Route traffic to CDN  |

---

## Notes

- **Dev environment** uses the default CloudFront domain (`<id>.cloudfront.net`) — no DNS records needed.
- **Do not use A records** — CloudFront IPs change. Always use CNAME.
- **ACM validation CNAME must stay** permanently for automatic certificate renewal.
- **TTL 3600** (1 hour) is a safe default. Lower to 300 temporarily if you need faster propagation during changes.
- If the domain is ever changed, update both `prod.tfvars` (`domain_name`) and the DNS records at zone.eu.
