# IEPAKO

Independent packaging-materials website for:

- production: `https://iepako.hagroup.lv`;
- development: `https://dev.iepako.hagroup.lv`.

## Structure

- `infrastructure/` — isolated AWS S3, CloudFront and ACM Terraform stack for Dev and Prod;
- `service/frontend/` — standalone React/Vite service with Latvian, English and Russian content;
- `.github/workflows/iepako-infra.yaml` — manual, environment-specific infrastructure deployment;
- `.github/workflows/iepako-deploy.yaml` — isolated frontend build and Dev/Prod deployment.

The main `hagroup.lv` frontend, buckets, distributions, state files and workflows are not referenced by this workload. The only shared application dependency is the existing Firebase project configuration. Data is separated into the `iepako_contacts` and `iepako_consents` Firestore collections.
