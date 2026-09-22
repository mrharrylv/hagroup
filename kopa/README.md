# Kopā

**Buy together. Pay wholesale.**

A concept demo of a Latvian group-buying / bulk-procurement marketplace: buyers in
an area pool demand for pellets, diesel, fertiliser, timber, restaurant supplies
and household bulk goods, and the unit price drops as commitments accumulate.

- development: `https://kopa.hagroup.lv`

There is no production environment. This is a demo built to be shown to partners
and investors, not a product.

## Everything here is invented

Every campaign, price, tier, participant, organiser, testimonial and supplier bid
in this app is mock data. Nothing is ordered, no payment is taken, no message is
sent, and there is no backend. Joins and campaigns a visitor creates are written
to their own browser's `localStorage` under `kopa.demo.v1` and go no further; the
demo dashboard has a button that clears them.

## Structure

- `service/frontend/` — a standalone React 19 + TypeScript + Vite + Tailwind 4
  single-page app. Leaflet with CARTO/OpenStreetMap tiles for the map.
- `infrastructure/terraform/` — an isolated S3 + CloudFront + ACM stack, **dev
  only**, with its own Terraform state key `hagroup/kopa/dev/terraform.tfstate`.
- `../.github/workflows/kopa-ci.yaml` — lint, test, build and `terraform
  validate` on every branch and pull request that touches Kopā.
- `../.github/workflows/kopa-infra.yaml` — manual, dev-only Terraform apply.
- `../.github/workflows/kopa-deploy.yaml` — build and deploy to dev on a push to
  `main` that touches `kopa/service/frontend/`, or on manual dispatch.

Nothing here references the main `hagroup.lv` site, the IEPAKO workload, their
buckets, distributions, state files or workflows. Kopā shares only the AWS
account and the `github-oidc-hagroup-dev` role.

## Running it locally

```bash
cd kopa/service/frontend
npm install
npm run dev
```

Then open the printed URL. `npm run verify` runs the full gate — lint, tests and
a production build — and is what CI runs.

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run lint` | ESLint, zero warnings tolerated |
| `npm run test` | Vitest, the domain and dataset suites |
| `npm run build` | Type-check then production build into `dist/` |
| `npm run verify` | All three, in that order |

## How the app is put together

The interesting logic is pure and lives in `src/domain/`, so it is tested without
a browser:

| Module | Responsibility |
| --- | --- |
| `domain/pricing.ts` | Which tier a campaign is on, what unlocks the next one, what the saving is. A campaign's ladder is measured either by total volume (`tierBasis: 'units'`) or by headcount (`'buyers'`). |
| `domain/status.ts` | Totals and the derived status: new, open, almost full, closing soon, funded, closed. Nothing stores a status. |
| `domain/filters.ts` | The filter state, the free-text search across both languages, and the sort keys. Search **highlights** rather than hides — that is what the map relies on. |
| `domain/geo.ts` | Haversine distance, radius containment, nearest-campaign lookup. |
| `domain/dates.ts` | Campaigns store `endsInDays` relative to the session's start, not an absolute date, so a demo shown in three months still has live countdowns instead of a wall of expired listings. |

`src/data/` holds the mock dataset and the reference data (35 towns, 5 planning
regions, 7 categories, 9 units). `src/state/KopaProvider.tsx` merges the seed
campaigns with whatever this browser has joined or created.

`src/data/campaigns.test.ts` is the guard that matters: it asserts that every pin
sits near its own town and inside Latvia, that every region and category is
covered, that every tier ladder descends and is contiguous, that the Latvian copy
is not the English copy pasted across, and that every badge in the UI is
reachable by at least one campaign.

## Deploying dev

Two workflows, in this order, both from the Actions tab:

1. **KOPA - Terraform Infrastructure** (`dev`) — creates the bucket, the
   distribution and the certificate request. It prints the DNS records needed.
2. **KOPA - Build & Deploy Frontend** — builds and ships to the bucket, then
   invalidates CloudFront.

Until DNS is attached the site is served on the CloudFront hostname that step 1
prints as `website_url`.

### Attaching `kopa.hagroup.lv`

The `hagroup.lv` zone is at the registrar, not in Route 53, so both records are
a manual action by the domain owner.

| # | Purpose | Type | Name | Value |
| --- | --- | --- | --- | --- |
| 1 | ACM certificate validation | CNAME | the `_x.kopa` host from `terraform output dns_records_required` | the `…acm-validations.aws.` target from the same output |
| 2 | Site alias | CNAME | `kopa` | the distribution hostname, `dxxxxxxxx.cloudfront.net.` |

Then set `enable_custom_domain = true` in
`infrastructure/terraform/environments/dev.tfvars` and re-run the infrastructure
workflow. ACM will not validate — and certbot-style tooling will silently skip
the name — until record 1 actually resolves.

## Cost

One S3 bucket, one CloudFront distribution on `PriceClass_100`, one ACM
certificate. Cents per month while idle. Everything carries `CostCenter = kopa`,
so it can be filtered out of Cost Explorer on its own.

## What this demo deliberately does not have

No backend, no database, no authentication, no payments, no email, no analytics
and no consent banner — there is nothing to consent to. Adding any of them is a
separate piece of work, not a tweak.
