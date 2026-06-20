# Deployment — Custom Domain Rollout (hagroup)

Four-step process to bring a custom domain (`dev.hagroup.lv` for dev, or the apex `hagroup.lv` for prod) online. Each step is idempotent and a failed step never blocks the next.

| Step | What it does | Where |
|---|---|---|
| 1. Deploy infra (phase 1) | Creates S3, CloudFront (default cert), ACM cert | GitHub Actions |
| 2. Deploy app             | Uploads built site to S3, invalidates CloudFront | GitHub Actions |
| 3. Create DNS records     | Points domain at CloudFront + validates ACM cert | zone.eu |
| 4. Deploy infra (phase 2) | Attaches alias + validated cert to CloudFront    | GitHub Actions |

---

## The flag that controls it

Defined in [`infrastructure/terraform/variables.tf`](../infrastructure/terraform/variables.tf):

```hcl
variable "enable_custom_domain" {
  # false (default) → phase 1: cert created, alias NOT attached. Site on *.cloudfront.net.
  # true            → phase 2: alias + validated cert attached to CloudFront.
}
```

**Configuration is tfvars-only** — there is no workflow input override. To switch phases, edit `infrastructure/terraform/environments/<env>.tfvars`, commit, and re-run the workflow.

---

## Step 1 — Deploy infra (phase 1)

Goal: stand up S3 + CloudFront and create the ACM certificate so we can read its DNS validation record.

1. Make sure `infrastructure/terraform/environments/<env>.tfvars` has:
   ```hcl
   # dev.tfvars  →  domain_name = "dev.hagroup.lv"
   # prod.tfvars →  domain_name = "hagroup.lv"
   enable_custom_domain = false
   ```
2. **Actions → Terraform Infrastructure → Run workflow**, environment: `dev` (or `prod`).
3. Wait for green. The **`Output Infrastructure Info`** step prints:
   - `custom_domain_phase = phase_1_cert_only`
   - The CloudFront URL (site is reachable here right now)
   - The **DNS RECORDS REQUIRED** table — keep this open for step 3

---

## Step 2 — Deploy app

Goal: get the built site into S3 so once DNS resolves, content is already served.

1. **Actions → Build & Deploy Website → Run workflow** (`.github/workflows/deploy.yaml`)
   - environment: same as step 1
2. The workflow builds the site, syncs to S3, and invalidates CloudFront.
3. Verify against the CloudFront URL from step 1:
   ```bash
   curl -I https://<cloudfront-domain>.cloudfront.net
   # expected: HTTP/2 200
   ```

---

## Step 3 — Create DNS records

Goal: point the domain at CloudFront and let ACM validate the cert.

Both `dev.hagroup.lv` and `hagroup.lv` live in the **`hagroup.lv`** zone at **zone.eu**. Open the zone → DNS records → add **both** records from the step 1 output table.

Example for **dev** (`dev.hagroup.lv`):

| # | Purpose | Type | Name (zone.eu field) | Value | TTL |
|---|---|---|---|---|---|
| 1 | ACM validation | CNAME | `_xxxx.dev` (strip `.hagroup.lv.`) | `_yyyy.acm-validations.aws.` | 300 |
| 2 | Site alias | CNAME | `dev` | `<cloudfront-domain>.cloudfront.net.` | 300 |

Example for **prod** (apex `hagroup.lv`):

| # | Purpose | Type | Name (zone.eu field) | Value | TTL |
|---|---|---|---|---|---|
| 1 | ACM validation | CNAME | `_xxxx` (strip `.hagroup.lv.`) | `_yyyy.acm-validations.aws.` | 300 |
| 2 | Site alias | **ALIAS** | `@` (apex) | `<cloudfront-domain>.cloudfront.net.` | 300 |

> Apex CNAMEs are not legal per RFC 1034 — use zone.eu's `ALIAS` record type at the apex.

See [`doc/dns.md`](dns.md) for the field-by-field guide at zone.eu.

Verify:

```bash
# DNS propagated (dev subdomain)
dig +short CNAME dev.hagroup.lv

# ACM cert issued (us-east-1 required for CloudFront)
aws acm list-certificates --region us-east-1 \
  --query "CertificateSummaryList[?DomainName=='dev.hagroup.lv' || DomainName=='hagroup.lv'].[DomainName,Status]" \
  --output text
# expected: ISSUED   (may take 5–30 min after the validation CNAME is added)
```

Don't proceed to step 4 until ACM shows `ISSUED`.

---

## Step 4 — Deploy infra (phase 2)

Goal: attach the alias + validated cert to CloudFront so HTTPS on the custom domain works.

1. Edit `infrastructure/terraform/environments/<env>.tfvars`:
   ```hcl
   enable_custom_domain = true
   ```
   Commit and push.
2. **Actions → Terraform Infrastructure → Run workflow**, same environment.
3. Apply takes ~5–15 min while CloudFront redeploys. The `Output Infrastructure Info` step prints `custom_domain_phase = phase_2_alias_attached`.
4. Final verification:
   ```bash
   curl -I https://dev.hagroup.lv    # dev
   curl -I https://hagroup.lv        # prod
   # expected: HTTP/2 200, valid cert for the domain
   ```

To back out, set `enable_custom_domain = false` and re-apply — CloudFront drops the alias and falls back to the default cert.

---

## Rollback / notes

- **Detach domain temporarily:** set `enable_custom_domain = false` in tfvars and re-apply.
- **Don't put the same alias on two distributions:** CloudFront refuses the same alias on two distributions. If moving a domain from dev to prod, set `domain_name = ""` on the source env and apply first.

---

## Quick reference

```
Phase 1: enable_custom_domain = false   # safe before DNS exists
Phase 2: enable_custom_domain = true    # after DNS records in place + ACM ISSUED
```

Related docs:
- [`doc/dns.md`](dns.md) — DNS field-by-field at zone.eu
- [`infrastructure/doc.md`](../infrastructure/doc.md) — overall AWS setup
