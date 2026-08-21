# HA Group Iepakojumi

Independent packaging-materials website for:

- production: `https://iepakojumi.hagroup.lv`;
- development: `https://dev.iepakojumi.hagroup.lv`.

## Structure

- `infrastructure/` — isolated AWS S3, CloudFront and ACM Terraform stack for Dev and Prod;
- `service/frontend/` — standalone React/Vite service with Latvian, English and Russian content;
- `.github/workflows/iepakojumi-infra.yaml` — manual, environment-specific infrastructure deployment;
- `.github/workflows/iepakojumi-deploy.yaml` — isolated frontend build and Dev/Prod deployment.

The main `hagroup.lv` frontend, buckets, distributions, state files and workflows are not referenced by this workload. The only shared application dependency is the existing Firebase project configuration. Data is separated into the `iepakojumi_contacts` and `iepakojumi_consents` Firestore collections.
