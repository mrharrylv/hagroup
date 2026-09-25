# NEEDS THE OWNER:

## hagroup.lv search presentation — built, waiting to be deployed

`todo/seo-search-presentation` is finished and verified locally (`npm run
verify` green). A push to `main` deploys production (`.github/workflows/deploy.yaml`),
so merging it is the owner's call. After it is live:

- **Google Search Console:** add `hagroup.lv` as a domain property (a TXT record
  at the registrar, where the zone lives), submit
  `https://www.hagroup.lv/sitemap.xml`, and request indexing for `/`, `/lv`,
  `/ru` and the service pages. The new favicon and share image replace the old
  ones in results only after Google recrawls: days to weeks.
- **Bing Webmaster Tools:** import the site from Search Console and submit the
  same sitemap. Some AI search tools draw on Bing's index.
- **Be listed where assistants look:** answers to "best DevOps / cloud provider
  in Latvia" come mostly from third-party listings and reviews, not from the
  site. Create or claim a LinkedIn company page, Clutch, GoodFirms and
  TechBehemoths profiles, and a Google Business Profile if the business is
  eligible, then put their URLs in `services/frontend/it_company/src/data/social.json`
  (`profiles`), which feeds `Organization.sameAs`.
- **Real client reviews:** `7_reviews.json` is empty, so `/reviews` is noindex
  and left out of the sitemap. Adding genuine reviews makes it indexable with no
  code change.
- **Facts the FAQs could not state** because the site never says them: how
  projects are priced (fixed, time and materials, retainer), typical project
  length, support response times or SLA, whether support contracts are monthly
  and their minimum term, whether the first consultation is free (the consulting
  page's "Schedule a free consultation" text is never rendered), and whether
  work is on site in Rīga or remote only, and for which countries. Supply them
  and they can be added to the FAQs and descriptions.

## Kopā (`kopa/`) — live on CloudFront, waiting on DNS

The demo is deployed and reachable. What is left is the custom domain, and that
is two records in a zone no agent can reach.

- ~~Widen the OIDC role and apply the infrastructure.~~ **Done 2026-09-22.**
  `infrastructure/aws/setup.sh` enumerates every workload's state prefix and
  bucket by name, and Kopā was in neither list, so the first apply was refused
  `s3:PutObject` on the state file and `s3:CreateBucket`. Both lists now include
  it, the script has been re-run, and the dev stack is up: bucket
  `dev-hagroup-kopa-website`, CloudFront `d3r9yaiqt5lkqj.cloudfront.net`.
  The three resources the failed apply orphaned were adopted by the workflow's
  import steps rather than duplicated.

- **Add two DNS records for `kopa.hagroup.lv`.** The `hagroup.lv` zone is at the
  registrar, not in Route 53, so both are a manual action:

  | # | Purpose | Type | Name | Value |
  | --- | --- | --- | --- | --- |
  | 1 | ACM validation | CNAME | `_9b04744eb092f2e36e46ac83da9f65e0.kopa` | `_f9f433cb1295d8b5e5c25ab469aeddee.wzccmgtwzk.acm-validations.aws.` |
  | 2 | Site alias | CNAME | `kopa` | `d3r9yaiqt5lkqj.cloudfront.net.` |

  Both values are final — the certificate and the distribution both exist now.
  Until record 1 resolves the certificate stays `PENDING_VALIDATION` and the
  custom domain cannot be attached. The site is live on
  `https://d3r9yaiqt5lkqj.cloudfront.net` in the meantime.
- **Then flip the domain on.** Once both records resolve, set
  `enable_custom_domain = true` in
  `kopa/infrastructure/terraform/environments/dev.tfvars` and re-run the
  infrastructure workflow. Doing it before they resolve fails the apply.

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

- hagroup.lv: real 404 status and 301s at the edge. CloudFront maps 403/404 to
  `/index.html` with 200, so unknown URLs, trailing slashes and old unprefixed
  links are soft 404s or client-side redirects. WEBSITE_TEMPLATE now has a
  tested viewer-request CloudFront Function (`infrastructure/terraform/functions/
  viewer-request.js`) that 301s every non-canonical spelling; port it, with
  `404.html` as the 404 response.


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
