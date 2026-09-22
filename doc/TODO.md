# NEEDS THE OWNER:

## Kopā (`kopa/`) — nothing is deployed yet

The demo builds, tests and runs locally. Three things need a human, and none of
them is something an agent can do on its own.

- **Widen the OIDC role, then re-run the infrastructure workflow.** This is now
  the blocker, and it is an IAM change, so it is yours. The first apply
  (run 35746128080, 2026-09-22) was refused `s3:PutObject` on
  `hagroup/kopa/dev/terraform.tfstate` and `s3:CreateBucket` on
  `dev-hagroup-kopa-website`: `infrastructure/aws/setup.sh` enumerates every
  workload's state prefix and bucket by name, and Kopā was in neither list.
  Both lists now include it, but the policy in AWS does not change until the
  script is re-run:

      ./infrastructure/aws/setup.sh            # updates github-oidc-hagroup-dev

  Then re-run `KOPA - Terraform Infrastructure` (dev). It creates a private S3
  bucket, a CloudFront distribution on `PriceClass_100` and an ACM certificate.
  Cents per month while idle, all tagged `CostCenter = kopa` so they filter out
  of Cost Explorer on their own.

- **Three orphaned resources are already in AWS**, created by that failed apply
  before it was denied. Terraform has no record of them, because the run could
  not write state. None of them costs anything:

  | Resource | Id | Note |
  | --- | --- | --- |
  | CloudFront origin access control | `E20EPWOSY8FJGT` | `dev-hagroup-kopa-oac` |
  | CloudFront response headers policy | `57583a2f-2c7d-41e6-b979-e5aed4886257` | `dev-hagroup-kopa-security-headers` |
  | ACM certificate | `…c37c5240-0897-4947-ab0f-ae1be46f4fd2` | `kopa.hagroup.lv`, `PENDING_VALIDATION` |

  The infrastructure workflow now imports the first two by name before planning,
  so the next apply adopts them rather than colliding. The certificate is
  adopted the same way Terraform always handles it: a second one would be
  created and the first left to expire unused, which is untidy but harmless.

- **Add two DNS records for `kopa.hagroup.lv`.** The `hagroup.lv` zone is at the
  registrar, not in Route 53, so both records are a manual action. The first one
  is already known — it belongs to the certificate that exists now, and adding
  it starts validation immediately, before any of the above:

  | Type | Name | Value |
  | --- | --- | --- |
  | CNAME | `_9b04744eb092f2e36e46ac83da9f65e0.kopa` | `_f9f433cb1295d8b5e5c25ab469aeddee.wzccmgtwzk.acm-validations.aws.` |

  The second is the site alias, `kopa` → the CloudFront hostname, which does not
  exist until the distribution does. Until the validation record resolves, the
  certificate stays `PENDING_VALIDATION` and the custom domain cannot be
  attached — the site is reachable on the CloudFront hostname in the meantime.
- **Then flip the domain on.** Set `enable_custom_domain = true` in
  `kopa/infrastructure/terraform/environments/dev.tfvars` and re-run the
  infrastructure workflow. Doing it before the records resolve fails the apply.

Deliberately absent, and each one is a separate piece of work rather than a
tweak: backend, database, authentication, payments, email, analytics, consent
banner. There is nothing to consent to while every byte of data is invented.

## This repo has two backlogs and an uncatalogued history

`doc/TODO.md` (this file) and `todo.md` both exist and both describe work. They
have to be merged by hand — by someone who knows which is current — not folded
together by a tool. Until that happens, queue-driven work in this repo is
guessing which file is live.

Related: `doc/FEATURES.md` now catalogues Kopā only. The `hagroup.lv` site and
IEPAKO still owe their rows, and those must be seeded by reading the code —
their `todo.md` done lists are byte-for-byte duplicates of another repo's, so
converting them wholesale would record capabilities that may not exist here.

# Later:


# TODO:
- create hagroup.lv
- move folders under hagroup

# NOTE
This file is a byte-for-byte duplicate of alwaysup/doc/TODO.md, and the two
repos' `todo.md` files are duplicates of each other too. They describe two
different sites backed by two different Firebase projects (hagroup-47ebc and
cloudie-7b8b4), so keeping them identical guarantees at least one of them is
describing the wrong system. Worth splitting.

The "improve design" line is done — see the design entries under Done.


# Verify:
- ensure email form works
  Code path hardened end to end (see Done). Still needs a human in the console,
  because nothing in .github deploys rules or functions — they only ship by hand:
    1. `gcloud firestore databases list --project cloudie-7b8b4` — the function
       is pinned to europe-north1 and a v2 Firestore trigger must sit in a region
       compatible with the database. If they disagree the deploy is accepted,
       documents are written, and no function ever runs. This is the most likely
       cause of "no email arrives".
    2. `firebase deploy --only firestore:rules,storage,functions --project cloudie-7b8b4`
    3. `firebase functions:secrets:set NOTIFY_EMAIL` → info@hagroup.lv (new;
       without it notifications go to the sending Gmail account itself).
    4. Re-check GMAIL_APP_PASSWORD: the local copy is 19 characters, i.e. a
       16-char password with Google's three display spaces still in it. The
       function now strips whitespace, so this is belt and braces.


# Done:
- [x] contact email is info@hagroup.lv, and Privacy §15 renders it (the live site
      still showed hello@alwaysup.lv; source had dropped the address entirely)
- [x] contact form: distinct failure states instead of one generic red banner —
      invalid email, rate-limited, Firebase unconfigured and generic error each
      have their own copy in LV/EN/RU
- [x] contact form: 15s timeout on the Firestore write. A write promise does not
      reject when the backend is unreachable, so the button sat on "Sending…"
      forever showing neither banner
- [x] contact form: 60s client cooldown (lib/rateLimit.ts, ported from the archive
      site, where it already existed)
- [x] contact form: real email validation and maxLength on every field, mirroring
      the Firestore rules so the UI and the rules cannot disagree
- [x] contact form: the typed message survives a failed send instead of being
      cleared
- [x] firebase.ts: fails loudly and offers the phone fallback when the build had
      no VITE_FIREBASE_* config, instead of shipping `undefined` and hanging
- [x] SECURITY: notification emails escape every submitted value. They were
      interpolated raw, so a submitter could put arbitrary HTML — a phishing
      anchor wearing our own From address — straight into the owner's inbox
- [x] SECURITY: uploaded CVs are no longer world-readable. storage.rules had
      `allow read: if true` on /careers/{fileName}; the emailed download URL
      still works, because its token is honoured independently of the rules
- [x] SECURITY: stopped logging the Gmail app password's length on every submit
- [x] SECURITY: consents is create-only and append-only. It allowed unauthenticated
      update on a client-chosen document id, so anyone could overwrite anyone
      else's consent record by guessing an id
- [x] rules: field-count caps and size limits on every optional field that reaches
      the notification email
- [x] cookie banner: was hardcoded English on a Latvian-first site; now LV/EN/RU
- [x] doc/firebase.md no longer pastes a stale, more permissive copy of the rules
- remove social icons from bottom
- remove phone number from bottom footer under SIA HA Group
- small businesses -> businesses
- remove section: Simple, transparent pricing (Packages)
- replace Easy to update → Analytics Ready in Everything your website needs
- remove: 100+ Websites built
- remove the email address: hello@alwaysup.lv (from Contact + all legal pages)
- introduce lang support (LV, ENG, RU)
