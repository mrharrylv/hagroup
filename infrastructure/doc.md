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

The build prerenders every page (`dist/index.html`, `dist/<path>/index.html`, `dist/404.html`). The upload logic lives in `services/frontend/it_company/scripts/deploy/`, tested by `npm run test:deploy`, and both deploy jobs run the copy shipped in the build artifact:

| Script | Does |
| ------ | ---- |
| `plan.mjs` | Decides every file's S3 key, Content-Type, Cache-Control and phase. `node plan.mjs dist` prints the plan as TSV, `--keys` only the keys. An unknown file extension fails the build, so nothing ships with a guessed type. |
| `upload.sh <bucket> <distDir>` | Phases 1 and 2: every non-HTML file, 8 uploads at a time; then the HTML pages, only if phase 1 fully succeeded. |
| `cleanup.sh <bucket> <keysFile>` | Phase 4: deletes bucket keys missing from the build's `keys.txt`. Never deletes `index.html`, and refuses a key list without it. |

### How It Works

```
Phase 1: Upload every non-HTML file          (old + new coexist safely)
Phase 2: Upload the HTML pages last          (they now reference the new hashes)
Phase 3: Invalidate CloudFront cache + wait  (all edges serve new content)
Phase 4: Cleanup orphaned files              (delete keys not in the build's keys.txt)
```

**Why this is safe:**
- Vite generates unique hashed filenames (`index-abc123.js`) — no filename collisions
- While Phase 1 runs, the live pages still reference old assets → old assets still in S3 → works
- Phase 2 uploads the new pages → they reference new assets → already in S3 → works
- Phase 3 waits for CloudFront propagation → all edge caches updated before cleanup
- Phase 4 removes only keys missing from `keys.txt` (`node scripts/deploy/plan.mjs dist --keys`, generated in the build job) → bucket stays clean

### Key mapping

The S3 origin is the bucket's REST endpoint with OAC. A request for `/services/devops` asks S3 for the key `services/devops`; S3 has no index-document lookup on that endpoint, so it never tries `services/devops/index.html`. Each prerendered page is therefore stored under the extensionless key of its directory, with an explicit `Content-Type: text/html; charset=utf-8`:

| Built file | S3 key | Served at |
| ---------- | ------ | --------- |
| `dist/index.html` | `index.html` | `/` (default root object) and every error fallback |
| `dist/services/devops/index.html` | `services/devops` | `/services/devops` |
| `dist/lv/index.html` | `lv` | `/lv` |
| `dist/lv/services/devops/index.html` | `lv/services/devops` | `/lv/services/devops` |
| `dist/404.html` | `404.html` | not served yet (see below) |
| `dist/assets/**`, root files | same path | same path |

A key such as `services` (a page) and keys under `services/` coexist without conflict, because S3 keys are flat strings. An `index.html` inside `dist/assets/` is an ordinary asset and keeps its full key.

Known limits of this design, all unchanged from before:
- **Trailing slash.** `/services/devops/` asks for the key `services/devops/`, which does not exist, so CloudFront's 403/404 mapping returns `index.html` (the English home page HTML) with status 200; the client router then renders the right page and its canonical. Crawlers that do not run JavaScript see the home page there, so internal links, the sitemap and canonicals must always use the URL without the trailing slash.
- **Unknown URLs return 200.** The same mapping serves `index.html` for any missing key, so a mistyped URL is a soft 404. `404.html` is uploaded so the mapping can later point at it with a real 404 status.

**Why extensionless keys and not a CloudFront Function:** a viewer-request function that rewrites `/x` and `/x/` to `/x/index.html` is the usual fix, but the deploy role has no `cloudfront:*Function` permissions and changing that needs admin credentials to re-run the bootstrap. Extensionless keys need no infrastructure change: only the upload changes.

**If a CloudFront Function is added later:** change `pageKey()` in `plan.mjs` to keep the full `…/index.html` path (and update its tests). Upload the new keys before the function is attached, for example by having the plan emit both forms for one deploy, so no request is rewritten to a key that does not exist yet. The deploy after that drops the extensionless keys automatically, since they are no longer in `keys.txt`. The function also fixes the trailing-slash case, and the error mapping can then serve `/404.html` with a 404 status.

### Cache policy

Set per object by `plan.mjs`. The distribution's TTLs (`min_ttl = 0`, `max_ttl = 1 year`) let these headers decide, and Phase 3 invalidates `/*` on every deploy, so they mostly govern browser caches.

| Objects | Cache-Control | Why |
| ------- | ------------- | --- |
| HTML pages (`index.html`, `404.html`, extensionless page keys) | `public, max-age=60, s-maxage=300` | Must pick up a new deploy quickly |
| `assets/**` (Vite output, content hash in the name) | `public, max-age=31536000, immutable` | A changed file gets a new name |
| Stable media: `favicon.ico`, `favicon-*.png`, `apple-touch-icon.png`, `icon-*.png`, `logo-512.png`, `og-image*.png`, `site.webmanifest`, `projects/*.svg` | `public, max-age=86400` | Stable URL whose content can change, so never `immutable` |
| Stable text: `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt` (and any other non-hashed txt, xml, json, js, css) | `public, max-age=3600` | Crawlers should see a change within the hour |

### Cleanup & Size Control

| Layer           | Mechanism                                        | Retention |
| --------------- | ------------------------------------------------ | --------- |
| Deploy workflow | Phase 4 deletes orphaned files after invalidation | Immediate |
| S3 Lifecycle    | Noncurrent versions auto-expire after 7 days     | 7 days    |
| S3 Lifecycle    | Incomplete multipart uploads aborted after 1 day | 1 day     |

The bucket size stays constant (~1MB) after each deploy. No accumulated old versions.

### Manual Deploy (if needed)

Never use `aws s3 sync --delete` against the bucket: `dist/` has no files named like the extensionless page keys, so it would delete every page.

Do not run a manual deploy while the Build & Deploy Website workflow is deploying to the same bucket. Its concurrency group orders workflow runs only, and Phase 4 of either deploy deletes every key missing from its own `keys.txt`, including the other's new assets.

Do not look the bucket or the distribution ID up with `terraform output`: it answers for whichever state key `terraform init` used last (dev or prod), so a deploy meant for dev can invalidate the prod distribution. The block below sets the environment once and derives both from it, finding the distribution by the comment Terraform gives it (`<env> - hagroup website`) the way `.github/workflows/deploy.yaml` does. It stops before any upload when no distribution matches.

Run it in bash from the repository root. The parentheses make a subshell, so the first failing command stops the whole procedure without closing your terminal.

```bash
(
  set -euo pipefail
  DEPLOY_ENV=dev   # dev or prod
  BUCKET="$DEPLOY_ENV-hagroup-website"

  # The CloudFront distribution of this environment, or stop
  DIST_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='$DEPLOY_ENV - hagroup website'].Id | [0]" \
    --output text)
  if [ -z "$DIST_ID" ] || [ "$DIST_ID" = "None" ] || [ "$DIST_ID" = "null" ]; then
    echo "No CloudFront distribution for $DEPLOY_ENV; stopping, nothing was uploaded." >&2
    exit 1
  fi
  echo "Deploying to s3://$BUCKET, CloudFront $DIST_ID"

  # Build the site
  make build
  cd services/frontend/it_company

  # Review the plan: file, key, content type, cache control, phase.
  # Nothing has been uploaded yet; anything but "y" stops here.
  node scripts/deploy/plan.mjs dist
  read -r -p "Upload this plan to s3://$BUCKET? [y/N] " answer
  [ "$answer" = y ]
  KEYS_FILE=$(mktemp)
  node scripts/deploy/plan.mjs dist --keys > "$KEYS_FILE"

  # Phases 1 and 2: assets first, HTML pages last
  bash scripts/deploy/upload.sh "$BUCKET" dist

  # Phase 3: invalidate and wait
  INV_ID=$(aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" --query 'Invalidation.Id' --output text)
  aws cloudfront wait invalidation-completed --distribution-id "$DIST_ID" --id "$INV_ID"

  # Phase 4: delete keys that are not in this build
  bash scripts/deploy/cleanup.sh "$BUCKET" "$KEYS_FILE"
)
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
