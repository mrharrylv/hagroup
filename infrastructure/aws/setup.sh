#!/usr/bin/env bash
#
# hagroup AWS Bootstrap
# ────────────────────
# Idempotent one-time setup for the hagroup project.
# Creates:
#   • One S3 Terraform state bucket
#   • One GitHub OIDC identity provider (AWS singleton per account)
#   • Two IAM roles: github-oidc-hagroup-dev + github-oidc-hagroup-prod
#
# Usage:
#   ./setup.sh
#
# Override via env vars:
#   AWS_REGION=eu-west-1 GITHUB_OWNER=my-org REPO=myrepo ./setup.sh
#
# Requires admin AWS credentials. See ../doc.md for full procedure.

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────
REGION="${AWS_REGION:-eu-north-1}"
GITHUB_OWNER="${GITHUB_OWNER:-mrharrylv}"
REPO="${REPO:-hagroup}"
ENVIRONMENTS=("dev" "prod")

# ── Derived ───────────────────────────────────────────────────────────────
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
STATE_BUCKET="ha-terraform-state-${ACCOUNT_ID}"
OIDC_HOST="token.actions.githubusercontent.com"
OIDC_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/${OIDC_HOST}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# ── Output helpers ────────────────────────────────────────────────────────
b=$'\e[1;34m'; g=$'\e[1;32m'; y=$'\e[1;33m'; z=$'\e[0m'
section() { printf '\n%s━━ %s%s\n' "$b" "$*" "$z"; }
ok()      { printf '  %s✓%s %s\n' "$g" "$z" "$*"; }
skip()    { printf '  %s·%s %s (already exists)\n' "$y" "$z" "$*"; }

# ── Banner ────────────────────────────────────────────────────────────────
section "hagroup · account ${ACCOUNT_ID} · region ${REGION}"
echo "  GitHub repo:  ${GITHUB_OWNER}/${REPO}"
echo "  Environments: ${ENVIRONMENTS[*]}"

# ══════════════════════════════════════════════════════════════════════════
# 1. Terraform state bucket
# ══════════════════════════════════════════════════════════════════════════
section "1. Terraform state bucket: s3://${STATE_BUCKET}"

if aws s3api head-bucket --bucket "$STATE_BUCKET" 2>/dev/null; then
  skip "bucket"
else
  aws s3api create-bucket \
    --bucket "$STATE_BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration "LocationConstraint=${REGION}" \
    >/dev/null
  ok "bucket created"
fi

aws s3api put-public-access-block \
  --bucket "$STATE_BUCKET" \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
ok "public access blocked"

aws s3api put-bucket-versioning \
  --bucket "$STATE_BUCKET" \
  --versioning-configuration Status=Enabled
ok "versioning enabled"

aws s3api put-bucket-encryption \
  --bucket "$STATE_BUCKET" \
  --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"},"BucketKeyEnabled":true}]}'
ok "SSE-S3 encryption enabled"

aws s3api put-bucket-lifecycle-configuration \
  --bucket "$STATE_BUCKET" \
  --lifecycle-configuration '{
    "Rules":[
      {"ID":"expire-noncurrent-versions","Status":"Enabled","Filter":{},
       "NoncurrentVersionExpiration":{"NoncurrentDays":90}},
      {"ID":"abort-incomplete-multipart","Status":"Enabled","Filter":{},
       "AbortIncompleteMultipartUpload":{"DaysAfterInitiation":1}}
    ]
  }'
ok "lifecycle rules applied"

cat > "${TMP}/bucket-policy.json" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyInsecureTransport",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::${STATE_BUCKET}",
        "arn:aws:s3:::${STATE_BUCKET}/*"
      ],
      "Condition": { "Bool": { "aws:SecureTransport": "false" } }
    },
    {
      "Sid": "DenyUnencryptedUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::${STATE_BUCKET}/*",
      "Condition": {
        "StringNotEquals": { "s3:x-amz-server-side-encryption": "AES256" }
      }
    }
  ]
}
EOF
aws s3api put-bucket-policy --bucket "$STATE_BUCKET" --policy "file://${TMP}/bucket-policy.json"
ok "bucket policy applied (TLS + SSE required)"

# ══════════════════════════════════════════════════════════════════════════
# 2. GitHub OIDC identity provider
# ══════════════════════════════════════════════════════════════════════════
section "2. GitHub OIDC identity provider"

if aws iam get-open-id-connect-provider \
     --open-id-connect-provider-arn "$OIDC_ARN" >/dev/null 2>&1; then
  skip "$OIDC_HOST"
else
  aws iam create-open-id-connect-provider \
    --url "https://${OIDC_HOST}" \
    --client-id-list "sts.amazonaws.com" \
    >/dev/null
  ok "$OIDC_HOST"
fi

# ══════════════════════════════════════════════════════════════════════════
# 3. Per-environment IAM deploy roles
# ══════════════════════════════════════════════════════════════════════════
section "3. Deploy roles"

for env in "${ENVIRONMENTS[@]}"; do
  role="github-oidc-hagroup-${env}"

  cat > "${TMP}/trust.json" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "${OIDC_ARN}" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "${OIDC_HOST}:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "${OIDC_HOST}:sub": "repo:${GITHUB_OWNER}/${REPO}:*"
      }
    }
  }]
}
EOF

  cat > "${TMP}/perm.json" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "TerraformStateBucketList",
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetBucketVersioning"],
      "Resource": "arn:aws:s3:::${STATE_BUCKET}"
    },
    {
      "Sid": "TerraformStateObjects",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::${STATE_BUCKET}/${env}/*"
    },
    {
      "Sid": "TerraformS3Website",
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::${env}-hagroup-website",
        "arn:aws:s3:::${env}-hagroup-website/*"
      ]
    },
    {
      "Sid": "STSIdentity",
      "Effect": "Allow",
      "Action": ["sts:GetCallerIdentity"],
      "Resource": "*"
    },
    {
      "Sid": "TerraformCloudFront",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateDistribution",
        "cloudfront:DeleteDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:GetDistributionConfig",
        "cloudfront:UpdateDistribution",
        "cloudfront:TagResource",
        "cloudfront:UntagResource",
        "cloudfront:ListTagsForResource",
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations",
        "cloudfront:CreateOriginAccessControl",
        "cloudfront:DeleteOriginAccessControl",
        "cloudfront:GetOriginAccessControl",
        "cloudfront:UpdateOriginAccessControl",
        "cloudfront:ListDistributions",
        "cloudfront:ListOriginAccessControls"
      ],
      "Resource": "*"
    },
    {
      "Sid": "TerraformACM",
      "Effect": "Allow",
      "Action": [
        "acm:RequestCertificate",
        "acm:DeleteCertificate",
        "acm:DescribeCertificate",
        "acm:ListCertificates",
        "acm:GetCertificate",
        "acm:ListTagsForCertificate",
        "acm:AddTagsToCertificate"
      ],
      "Resource": "*"
    },
    {
      "Sid": "TerraformRoute53",
      "Effect": "Allow",
      "Action": [
        "route53:GetHostedZone",
        "route53:ListHostedZones",
        "route53:ChangeResourceRecordSets",
        "route53:GetChange",
        "route53:ListResourceRecordSets"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AppSecretsSync",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:PutSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:TagResource"
      ],
      "Resource": "arn:aws:secretsmanager:${REGION}:${ACCOUNT_ID}:secret:${env}-hagroup-gmail-*"
    }
  ]
}
EOF

  if aws iam get-role --role-name "$role" >/dev/null 2>&1; then
    aws iam update-assume-role-policy \
      --role-name "$role" \
      --policy-document "file://${TMP}/trust.json"
    skip "role ${role} (trust policy refreshed)"
  else
    aws iam create-role \
      --role-name "$role" \
      --assume-role-policy-document "file://${TMP}/trust.json" \
      --description "GitHub Actions OIDC role - hagroup ${env}" \
      >/dev/null
    ok "role ${role}"
  fi

  aws iam put-role-policy \
    --role-name "$role" \
    --policy-name "${role}-policy" \
    --policy-document "file://${TMP}/perm.json"
  ok "  policy ${role}-policy"
done

# ══════════════════════════════════════════════════════════════════════════
# Summary
# ══════════════════════════════════════════════════════════════════════════
section "Done"
echo
printf '  %-20s s3://%s (region %s)\n' "State bucket:" "$STATE_BUCKET" "$REGION"
printf '  %-20s %s\n' "OIDC provider:" "$OIDC_ARN"
echo
echo "  Role ARNs:"
for env in "${ENVIRONMENTS[@]}"; do
  arn="$(aws iam get-role --role-name "github-oidc-hagroup-${env}" \
         --query 'Role.Arn' --output text 2>/dev/null || echo 'n/a')"
  printf '    %-10s %s\n' "${env}" "$arn"
done
echo
echo "  Next: run the Terraform Infrastructure workflow in GitHub Actions."
echo "  See infrastructure/doc.md for the full procedure."
echo
