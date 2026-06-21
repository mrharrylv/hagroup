# Infrastructure Setup — hagroup Website

## Overview

Static website infrastructure on AWS: **S3** (origin) + **CloudFront** (CDN) + **ACM** (SSL) managed by **Terraform** and deployed via **GitHub Actions**.

| Environment | Domain                    | Notes                            |
| ----------- | ------------------------- | -------------------------------- |
| dev         | `dev.hagroup.lv`         | Custom domain with ACM SSL cert  |
| prod        | `hagroup.lv`             | Custom domain with ACM SSL cert  |

---

## Prerequisites

- AWS CLI configured with admin credentials (for one-time bootstrap)
- Terraform >= 1.6.0
- GitHub repo: `mrharrylv/website`

---

## One-Time Bootstrap Steps

Run these **once** from a machine with admin AWS access before the first Terraform run.

### 1. Bootstrap: State Bucket + OIDC Roles

> **Run once.** Idempotent — safe to re-run.

```bash
cd infrastructure/aws
chmod +x setup.sh
./setup.sh
```

Creates:
- S3 bucket `ha-terraform-state-<account-id>` in `eu-north-1` (versioned, encrypted, TLS-only)
- GitHub OIDC identity provider `token.actions.githubusercontent.com` (account singleton)
- IAM roles `github-oidc-hagroup-dev` and `github-oidc-hagroup-prod`
  - Trusted only by `mrharrylv/website`
  - S3 access scoped to `dev-hagroup-website` / `prod-hagroup-website` and own state prefix
  - Permissions: S3, CloudFront, ACM, Route 53, STS

**Verify:**
```bash
aws s3api head-bucket --bucket ha-terraform-state-561341419749 && echo "OK"
aws iam get-role --role-name github-oidc-hagroup-dev  --query 'Role.Arn' --output text
aws iam get-role --role-name github-oidc-hagroup-prod --query 'Role.Arn' --output text
```

### 2. Custom Domain (two-phase rollout)

Custom domain attachment uses a two-phase approach controlled by `enable_custom_domain` in the tfvars:

- **Phase 1** (`false`, default): creates S3, CloudFront (default cert), and ACM certificate. Site reachable on `*.cloudfront.net`. DNS not required yet.
- **Phase 2** (`true`): attaches alias + validated cert to CloudFront. Requires DNS records to be in place and ACM cert to show `ISSUED`.

See [`doc/deployment.md`](../doc/deployment.md) for the step-by-step procedure and [`doc/dns.md`](../doc/dns.md) for the exact DNS records.

---

## GitHub Actions Workflows

### Apply Infrastructure

**Workflow:** `.github/workflows/infra.yaml`

1. Go to **Actions** → **Terraform Infrastructure** → **Run workflow**
2. Select environment (`dev` or `prod`)
3. Runs: `terraform init` → `terraform plan` → `terraform apply`

### Destroy Infrastructure

**Workflow:** `.github/workflows/infra-destroy.yaml`

1. Go to **Actions** → **Terraform Infrastructure Destroy** → **Run workflow**
2. Select environment
3. Type `DESTROY` to confirm
4. Runs: `terraform init` → `terraform destroy`

### Sync Secrets to AWS

**Workflow:** `.github/workflows/secrets-sync.yaml`

Pushes server-side secrets (Gmail credentials) from GitHub Actions secrets into
AWS Secrets Manager over OIDC. See [`secrets.md`](secrets.md) for the full flow,
the required GitHub secrets, and how an AWS backend reads them.

1. Go to **Actions** → **Sync Secrets to AWS** → **Run workflow**
2. Select environment
3. Writes the value of the Terraform-provisioned `<env>-hagroup-gmail` secret (re-run to rotate)

---

## Terraform Structure

```
infrastructure/
├── aws/
│   └── setup.sh               # One-time: state bucket + OIDC roles (idempotent)
└── terraform/
    ├── main.tf                # S3 bucket, CloudFront, ACM, OAC
    ├── variables.tf           # Input variables
    ├── outputs.tf             # S3 bucket name, CF distribution ID, URL
    └── environments/
        ├── dev.tfvars         # DEV config (no custom domain)
        └── prod.tfvars        # PROD (hagroup.lv apex, enable_custom_domain)
```

### What Terraform Creates

| Resource                        | Purpose                                     |
| ------------------------------- | ------------------------------------------- |
| S3 Bucket                       | Private bucket for static website files     |
| S3 Bucket Policy                | Allow CloudFront OAC to read objects        |
| S3 Versioning                   | File version history                        |
| S3 Encryption                   | AES256 server-side encryption               |
| S3 Lifecycle Rules              | Auto-expire noncurrent versions (7d), abort incomplete uploads (1d) |
| S3 Public Access Block          | Block all public access                     |
| CloudFront Distribution         | CDN with HTTPS, SPA error routing           |
| CloudFront OAC                  | Origin Access Control for S3                |
| ACM Certificate                 | SSL cert for the custom domain (us-east-1)  |

---

## Zero-Downtime Deployment Strategy

Deployments use a **4-phase additive strategy** to ensure zero-downtime. At no point during deployment are users served broken references.

### How It Works

```
Phase 1: Upload hashed assets (JS, CSS, images)  — old + new coexist safely
Phase 2: Upload index.html last                  — atomic swap to new references
Phase 3: Invalidate CloudFront cache + wait       — ensures all edges serve new content
Phase 4: Cleanup orphaned files                   — remove old hashed assets
```

**Why this is safe:**
- Vite generates unique hashed filenames (`index-abc123.js`) — no filename collisions
- While Phase 1 runs, `index.html` still references old assets → old assets still in S3 → works
- Phase 2 uploads new `index.html` → now references new assets → already in S3 → works
- Phase 3 waits for CloudFront propagation → all edge caches updated before cleanup
- Phase 4 removes only orphaned files using a build manifest → bucket stays clean

### Cleanup & Size Control

| Layer           | Mechanism                                        | Retention |
| --------------- | ------------------------------------------------ | --------- |
| Deploy workflow | Phase 4 deletes orphaned files after invalidation | Immediate |
| S3 Lifecycle    | Noncurrent versions auto-expire after 7 days     | 7 days    |
| S3 Lifecycle    | Incomplete multipart uploads aborted after 1 day | 1 day     |

The bucket size stays constant (~1MB) after each deploy. No accumulated old versions.

### Manual Deploy (if needed)

```bash
# Build the site
make build

# Upload assets first (no --delete)
aws s3 sync services/frontend/it_company/dist/ s3://<BUCKET_NAME> --exclude "*.html"

# Upload HTML last
aws s3 cp services/frontend/it_company/dist/index.html s3://<BUCKET_NAME>/index.html \
  --content-type "text/html" --cache-control "public, max-age=60, s-maxage=300"

# Invalidate and wait
INV_ID=$(aws cloudfront create-invalidation --distribution-id <CF_DIST_ID> --paths "/*" --query 'Invalidation.Id' --output text)
aws cloudfront wait invalidation-completed --distribution-id <CF_DIST_ID> --id $INV_ID

# Cleanup: sync with --delete to remove orphaned files
aws s3 sync services/frontend/it_company/dist/ s3://<BUCKET_NAME> --delete
```

Get the bucket name and distribution ID from Terraform outputs:

```bash
cd infrastructure/terraform
terraform output s3_bucket_name
terraform output cloudfront_distribution_id
```

---

## Local Terraform Usage

```bash
cd infrastructure/terraform

# DEV
terraform init -backend-config="key=hagroup/dev/terraform.tfstate"
terraform plan -var-file="environments/dev.tfvars"
terraform apply -var-file="environments/dev.tfvars"

# PROD
terraform init -backend-config="key=hagroup/prod/terraform.tfstate"
terraform plan -var-file="environments/prod.tfvars"
terraform apply -var-file="environments/prod.tfvars"
```

---

## Cost Estimate

| Service     | Estimated Monthly Cost       |
| ----------- | ---------------------------- |
| S3          | ~$0.50                       |
| CloudFront  | ~$1–5 (depends on traffic)   |
| Route 53    | $0.50/hosted zone            |
| ACM         | Free                         |
| **Total**   | **~$2–6/month**              |
