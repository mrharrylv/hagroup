# Iepakojumi infrastructure

This Terraform stack is isolated from the main `hagroup.lv` stack:

- separate state keys: `hagroup/iepakojumi/dev/terraform.tfstate` and `hagroup/iepakojumi/prod/terraform.tfstate`;
- separate S3 buckets, CloudFront distributions, ACM certificates, and DNS aliases;
- separate `Application`, `CostCenter`, `Project`, `Service`, and `Workload` tags for AWS Cost Explorer and budget filters;
- production at `iepakojumi.hagroup.lv` and development at `dev.iepakojumi.hagroup.lv`.

## First deployment

1. Run the **Iepakojumi - Terraform Infrastructure** workflow for `dev` or `prod` with `enable_custom_domain = false`.
2. Copy the ACM validation CNAME from the workflow output to the `hagroup.lv` DNS zone.
3. Wait until the ACM certificate in `us-east-1` is issued.
4. Add the website CNAME shown by the workflow.
5. Change that environment's `enable_custom_domain` to `true` and run the infrastructure workflow again.
6. Run the separate frontend deployment workflow.

The existing GitHub OIDC roles are reused, but the Terraform state and every workload resource are separate. Confirm those roles permit the new `*-hagroup-iepakojumi-*` resources before the first apply.

For budget reporting, activate the `CostCenter`, `Project`, `Application`, and `Environment` user-defined tags in AWS Billing, then filter a budget on `CostCenter = iepakojumi`.
