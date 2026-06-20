# AWS Infrastructure — Step-by-Step Setup Guide

## What We're Building

```
User → CloudFront (CDN + HTTPS) → S3 Bucket (static files)
                                    ↑
                              GitHub Actions
                              (build & deploy via OIDC)
```

| Component              | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| S3 State Bucket        | Stores Terraform state files (shared, one-time)      |
| GitHub OIDC Roles      | Let GitHub Actions assume AWS roles (no secrets)     |
| S3 Website Bucket      | Private bucket holding the built React app           |
| CloudFront Distribution| CDN with HTTPS, caching, SPA 404→index.html routing |
| CloudFront OAC         | Grants CloudFront read-only access to S3             |
| ACM Certificate        | SSL cert for custom domain                           |

Two environments: **dev** (`dev.hagroup.lv`) and **prod** (`hagroup.lv`).

---

## Prerequisites

| Tool       | Min Version | Check                    |
| ---------- | ----------- | ------------------------ |
| AWS CLI    | 2.x         | `aws --version`          |
| Terraform  | >= 1.6.0    | `terraform --version`    |
| Admin creds| —           | `aws sts get-caller-identity` |

You must be authenticated with an AWS IAM user/role that has admin permissions for the bootstrap steps (1–2). After that, GitHub Actions handles everything via OIDC.

---

## Step 1 — Bootstrap: State Bucket + OIDC Roles

> **Run once.** Idempotent — safe to re-run after partial failures or to update.

```bash
cd infrastructure/aws
chmod +x setup.sh
./setup.sh
```

**What it creates:**
- Bucket `ha-terraform-state-<account-id>` in `eu-north-1` (versioned, encrypted, lifecycle rules, TLS-only policy)
- OIDC provider `token.actions.githubusercontent.com` (account singleton)
- IAM role `github-oidc-hagroup-dev` — trusted by `mrharrylv/website`, scoped to `dev-hagroup-website` + `dev/*` state
- IAM role `github-oidc-hagroup-prod` — trusted by `mrharrylv/website`, scoped to `prod-hagroup-website` + `prod/*` state

**Verify:**
```bash
aws s3api head-bucket --bucket ha-terraform-state-561341419749 && echo "OK"
aws iam get-role --role-name github-oidc-hagroup-dev  --query 'Role.Arn' --output text
aws iam get-role --role-name github-oidc-hagroup-prod --query 'Role.Arn' --output text
```

---

## Step 2 — Terraform: Provision DEV Infrastructure

> Creates the S3 website bucket + CloudFront distribution for dev.

```bash
cd infrastructure/terraform

# Initialize with dev state key
terraform init -backend-config="key=dev/terraform.tfstate"

# Preview changes
terraform plan -var-file="environments/dev.tfvars"

# Apply
terraform apply -var-file="environments/dev.tfvars"
```

**What gets created:**
- `dev-hagroup-website` S3 bucket (private, versioned, encrypted, lifecycle rules)
- CloudFront distribution (HTTPS, gzip, SPA 403/404 → index.html)
- CloudFront OAC (S3 access)

**Outputs to note:**
```bash
terraform output cloudfront_domain_name   # Your dev URL
terraform output s3_bucket_name           # dev-hagroup-website
terraform output cloudfront_distribution_id
```

Dev site will be at: `https://<random>.cloudfront.net`

---

## Step 3 — Terraform: Provision PROD Infrastructure

> Creates prod S3 bucket + CloudFront + ACM certificate for `hagroup.lv`.

```bash
cd infrastructure/terraform

# Re-init with prod state key (separate state file)
terraform init -reconfigure -backend-config="key=prod/terraform.tfstate"

# Preview
terraform plan -var-file="environments/prod.tfvars"

# Apply
terraform apply -var-file="environments/prod.tfvars"
```

**What gets created:**
- `prod-hagroup-website` S3 bucket (private, versioned, encrypted, lifecycle rules)
- CloudFront distribution with alias `hagroup.lv`
- ACM certificate in `us-east-1` (required for CloudFront)
- CloudFront OAC

**After apply — ACM DNS validation:**

The ACM certificate will be in `PENDING_VALIDATION` state. You need to add DNS records:

```bash
# Get the validation records
aws acm describe-certificate \
  --certificate-arn $(terraform output -raw cloudfront_arn | sed 's/cloudfront/acm/') \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[].ResourceRecord' \
  --output table
```

Add the CNAME records shown to your `hagroup.lv` DNS zone. Validation usually takes 5–30 minutes.

---

## Step 4 — DNS: Point Domain to CloudFront (PROD only)

After the ACM cert is validated and the CloudFront distribution is deployed:

```bash
# Get the CloudFront domain
terraform output cloudfront_domain_name
```

Add a DNS record in your `hagroup.lv` DNS zone:

| Type  | Name    | Value                                |
| ----- | ------- | ------------------------------------ |
| CNAME | `@`     | `<id>.cloudfront.net`                |

If using Route 53, use an **A record (Alias)** pointing to the CloudFront distribution instead.

---

## Step 5 — GitHub Environments Setup

In the GitHub repo settings (`Settings` → `Environments`):

1. Create environment **`dev`**
2. Create environment **`prod`** — optionally add:
   - Required reviewers (approval gate before deploy)
   - Deployment branch rule: `main` only

These environments are referenced by the deploy workflow for OIDC role assumption.

---

## Step 6 — Deploy the Website

### First deploy (manual)

```bash
# Build locally
cd services/frontend/it_company
npm ci && npm run build

# Upload to dev
aws s3 sync dist/ s3://dev-hagroup-website --delete
aws cloudfront create-invalidation \
  --distribution-id $(cd ../../infrastructure/terraform && terraform output -raw cloudfront_distribution_id) \
  --paths "/*"
```

### Ongoing deploys (automated)

Push to `main` → GitHub Actions auto-deploys to **dev**.
Manual dispatch → Select **prod** to deploy to production.

Workflow: `.github/workflows/deploy.yaml`

### Zero-Downtime Deployment

The deploy workflow uses a **4-phase additive strategy**:

| Phase | Action                               | Effect                                     |
| ----- | ------------------------------------ | ------------------------------------------ |
| 1     | Upload hashed assets (JS, CSS, etc.) | Old + new coexist, no user impact          |
| 2     | Upload `index.html` last             | Atomic swap to new asset references        |
| 3     | Invalidate CloudFront + wait         | All edge caches serve new content          |
| 4     | Delete orphaned files                | Old hashed assets removed, bucket stays clean |

**Safety net:** S3 lifecycle rules auto-expire noncurrent object versions after 7 days and abort incomplete multipart uploads after 1 day — even if Phase 4 is skipped, the bucket won't grow indefinitely.

---

## Verification Checklist

```
[ ] aws sts get-caller-identity              — AWS auth works
[ ] aws s3 ls s3://ha-terraform-state-561341419749 — State bucket exists
[ ] aws iam get-role --role-name github-oidc-hagroup-dev  — Dev role exists
[ ] aws iam get-role --role-name github-oidc-hagroup-prod — Prod role exists
[ ] curl -I https://<cloudfront-dev-domain>  — Dev site serves index.html
[ ] curl -I https://hagroup.lv               — Prod site serves (after DNS)
```

---

## Teardown

```bash
# Destroy dev
cd infrastructure/terraform
terraform init -reconfigure -backend-config="key=dev/terraform.tfstate"
terraform destroy -var-file="environments/dev.tfvars"

# Destroy prod
terraform init -reconfigure -backend-config="key=prod/terraform.tfstate"
terraform destroy -var-file="environments/prod.tfvars"

# Delete state bucket (optional, requires removing objects first)
aws s3 rb s3://ha-terraform-state-561341419749 --force
```

Or use the GitHub Actions workflow: **Actions** → **Terraform Infrastructure Destroy** → type `DESTROY`.

---

## Cost Estimate

| Service    | Monthly Cost            |
| ---------- | ----------------------- |
| S3         | ~$0.50                  |
| CloudFront | ~$1–5 (traffic-based)   |
| Route 53   | $0.50/hosted zone       |
| ACM        | Free                    |
| **Total**  | **~$2–6/month per env** |