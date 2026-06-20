# Secrets — GitHub Actions → AWS Secrets Manager

How server-side application secrets get from a developer's machine into AWS,
securely, with no long-lived credentials anywhere in the pipeline.

> Scope: **server-side** secrets only (currently the Gmail credentials used to
> send contact/career notification emails). Firebase **web** config
> (`VITE_FIREBASE_*`) is public client config and is handled separately — it is
> injected into the frontend bundle at build time by
> [`deploy.yaml`](../.github/workflows/deploy.yaml), never stored here.

---

## Flow

```
.secrets/.env.gmail            (local, gitignored — source of truth for a human)
        │  copy values into ▼
GitHub Actions secrets         GMAIL_ADDRESS, GMAIL_APP_PASSWORD
        │  "Sync Secrets to AWS" workflow (OIDC, no static keys) ▼
AWS Secrets Manager            <env>-hagroup-gmail   { GMAIL_ADDRESS, GMAIL_APP_PASSWORD }
        │  GetSecretValue via IAM role ▼
AWS backend (Lambda/ECS/…)     reads at runtime, sends email
```

Each hop is least-privilege and encrypted:

| Hop | Mechanism | Why it's safe |
| --- | --- | --- |
| Developer → GitHub | Repository/Environment **Actions secrets** | Encrypted at rest, masked in logs, never printed |
| GitHub → AWS | **OIDC** federation → `github-oidc-hagroup-<env>` | Short-lived STS credentials; no AWS keys stored in GitHub |
| Pipeline → Secrets Manager | `secretsmanager:PutSecretValue` scoped to `<env>-hagroup-gmail-*` | The role can touch nothing else |
| Secrets Manager → app | `secretsmanager:GetSecretValue` on the app's own role | KMS-encrypted; access is auditable in CloudTrail |

---

## Required GitHub Actions secrets

Create these as **repository** secrets, or as **environment** secrets under the
`dev` / `prod` GitHub Environments (recommended — lets you require approvals for
prod):

| Secret | Value | Mirrors |
| --- | --- | --- |
| `GMAIL_ADDRESS` | `harijs.asenieks@gmail.com` | `.secrets/.env.gmail` |
| `GMAIL_APP_PASSWORD` | 16-char Gmail App Password | `.secrets/.env.gmail` |

Settings → Secrets and variables → Actions → New repository secret.

---

## Run the sync

1. **Actions → Sync Secrets to AWS → Run workflow**
2. Pick the environment (`dev` or `prod`)
3. The workflow validates the secrets exist, assumes the AWS OIDC role, and
   writes them as a single JSON secret `<env>-hagroup-gmail`.

The job is **idempotent**: first run creates the secret, later runs add a new
version. Re-run it whenever you rotate the Gmail App Password.

Verify (with AWS CLI):

```bash
aws secretsmanager describe-secret \
  --secret-id dev-hagroup-gmail --region eu-north-1 \
  --query '{Name:Name,Updated:LastChangedDate}'
```

> Values are never echoed by the workflow. To read a value you must call
> `get-secret-value` yourself with sufficient IAM permission — it is not exposed
> in the Actions logs.

---

## Consuming the secret from an AWS backend

Attach a read-only policy to the backend's execution role (Lambda role, ECS task
role, etc.):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadGmailSecret",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:eu-north-1:561341419749:secret:dev-hagroup-gmail-*"
    }
  ]
}
```

Then read it at runtime (Node.js, AWS SDK v3):

```js
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "eu-north-1" });
const env = process.env.ENVIRONMENT ?? "dev";

const { SecretString } = await client.send(
    new GetSecretValueCommand({ SecretId: `${env}-hagroup-gmail` }),
);
const { GMAIL_ADDRESS, GMAIL_APP_PASSWORD } = JSON.parse(SecretString);
```

Cache the result for the lifetime of the process; don't fetch it per request.

---

## IAM — where the write permission lives

The OIDC role's permission to write this secret is defined alongside the role in
[`infrastructure/aws/setup.sh`](aws/setup.sh) (the `AppSecretsSync` statement).
After editing that script you must re-run it once with admin AWS credentials for
the change to take effect:

```bash
cd infrastructure/aws && ./setup.sh
```

---

## Notes

- **Why Secrets Manager and not SSM Parameter Store?** Secrets Manager gives
  built-in versioning, rotation hooks, and resource policies. SSM SecureString is
  a cheaper alternative (free standard tier) if rotation isn't needed — the same
  OIDC-write pattern applies, swapping `put-secret-value` for `ssm put-parameter`.
- **Encryption:** the secret uses the AWS-managed `aws/secretsmanager` KMS key by
  default. Supply a customer-managed key if you need separate key policies.
- **Rotation:** update the `GMAIL_APP_PASSWORD` GitHub secret, then re-run the
  workflow. Backends pick up the new version on their next fetch.
