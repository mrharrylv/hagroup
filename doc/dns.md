# DNS Setup — `dev.hagroup.lv` / `www.hagroup.lv`

How to wire the hagroup custom domains to the CloudFront distributions created by Terraform.

| Env  | Domain                  | Zone           | Site record type |
| ---- | ----------------------- | -------------- | ---------------- |
| dev  | `dev.hagroup.lv`       | `hagroup.lv`  | `CNAME`          |
| prod | `www.hagroup.lv`       | `hagroup.lv`  | `CNAME`          |
| prod | `hagroup.lv` (apex)    | `hagroup.lv`  | `URL` → www      |

Each environment has its own distribution and its own pair of DNS records.

> **Apex caveat:** zone.eu has no `ALIAS`/`ANAME` record type, so the apex cannot point directly at CloudFront. The canonical prod domain is `www.hagroup.lv`. The apex is handled with a zone.eu `URL` (301 redirect) record pointing to `https://www.hagroup.lv`.

---

## Where the info comes from

All values come from the **Terraform Infrastructure** workflow run for the target environment.

1. GitHub → **Actions** → **Terraform Infrastructure** → **Run workflow** → environment: `dev` (or `prod`).
2. Open the run → expand the step **`Output Infrastructure Info`**.
3. Look for the section **`📌 DNS RECORDS REQUIRED at your DNS provider`**.

It prints a table like (values differ per run):

```
#  PURPOSE                                TYPE   NAME                              VALUE                              TTL
1  ACM certificate validation             CNAME  _abc123def456.dev.hagroup.lv.   _xyz789.acm-validations.aws.       300
2  Site alias → CloudFront distribution   CNAME  dev.hagroup.lv.                 d3xxxxxx.cloudfront.net.           300
```

Two records per environment, both required.

---

## What to do at zone.eu

Both `dev.hagroup.lv` and `www.hagroup.lv` live in the **`hagroup.lv`** zone at zone.eu.

1. Log in to zone.eu → select zone `hagroup.lv` → **DNS records**.
2. Add (or update) the records below.

### Record 1 — ACM certificate validation

| Field | Value |
|---|---|
| **Type** | `CNAME` |
| **Name / host** | the `NAME` from row 1, **without** the zone suffix.<br>Example (dev): `_abc123def456.dev`<br>Example (prod www): `_abc123def456.www` |
| **Value / target** | the `VALUE` from row 1, exactly as shown.<br>Example: `_xyz789.acm-validations.aws.` |
| **TTL** | `300` |

> Without this CNAME the certificate stays `PENDING_VALIDATION` and CloudFront can't go live with the alias.

### Record 2 — Site alias (CNAME to CloudFront)

| Field | Value (dev) | Value (prod) |
|---|---|---|
| **Type** | `CNAME` | `CNAME` |
| **Name / host** | `dev` | `www` |
| **Value / target** | `dXXXXX.cloudfront.net.` | `dXXXXX.cloudfront.net.` |
| **TTL** | `300` | `300` |

### Record 3 — Apex redirect (prod only)

| Field | Value |
|---|---|
| **Type** | `URL` |
| **Name / host** | *(empty — apex `@`)* |
| **Value / target** | `https://www.hagroup.lv` |
| **Redirect type** | `301 Permanent` |

> This redirects `hagroup.lv` → `https://www.hagroup.lv` using zone.eu's built-in URL redirect. No ALIAS/ANAME needed.

### Name-field cheat sheet for zone.eu

zone.eu expects the **subdomain part only** (relative to the zone):

| Zone          | Terraform `NAME` output              | What to enter at zone.eu |
| ------------- | ------------------------------------ | ------------------------ |
| `hagroup.lv` | `dev.hagroup.lv.`                   | `dev`                    |
| `hagroup.lv` | `_abc123.dev.hagroup.lv.`           | `_abc123.dev`            |
| `hagroup.lv` | `www.hagroup.lv.`                   | `www`                    |
| `hagroup.lv` | `_abc123.www.hagroup.lv.`           | `_abc123.www`            |

---

## Verify

```bash
# DNS propagated
dig +short CNAME dev.hagroup.lv        # dev
dig +short CNAME www.hagroup.lv        # prod

# ACM cert issued (must be in us-east-1 for CloudFront)
aws acm list-certificates --region us-east-1 \
  --query "CertificateSummaryList[?DomainName=='dev.hagroup.lv' || DomainName=='www.hagroup.lv'].[DomainName,Status]" \
  --output text
# expected: ISSUED   (may take 5–30 min after adding the CNAME)
```

Once ACM shows `ISSUED`, proceed to phase 2 — see [`doc/deployment.md`](deployment.md).
