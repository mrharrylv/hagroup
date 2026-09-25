# FEATURES.md — what this product does

One row per user-visible capability. A change that adds, alters or removes a capability
updates this file in the same commit that makes the change; a commit that ships a
capability without a row here is unfinished.

| Column | Meaning |
| --- | --- |
| **ID** | Stable, zero-padded `F-001`. Never reused, never renumbered. A removed feature keeps its ID forever. |
| **Feature** | What a user can do. Not what a module is called. |
| **Status** | `shipped` · `deprecated` · `removed` |
| **Since** | Merge date and merge commit. `unknown` only for rows seeded from existing code. |
| **Tests** | The test file or command that proves it. `—` is a coverage gap, not a formatting choice. |

| ID | Feature | Status | Since | Tests |
| --- | --- | --- | --- | --- |
| F-001 | **Kopā** — browse every group buy in Latvia on one full-screen map: region bubbles zoomed out, campaign pins zoomed in, catchment circles, click-through side panel | shipped | unmerged | `kopa/.../map/aggregation.test.ts`, `data/tiles.test.ts` |
| F-002 | **Kopā** — search campaigns by keyword in either language and see every match highlighted country-wide, misses dimmed rather than hidden | shipped | unmerged | `kopa/.../domain/filters.test.ts` |
| F-003 | **Kopā** — filter group buys by category, region, city, buyer type (business / individual), unit, status, minimum saving, radius and participant count, shareable in the URL | shipped | unmerged | `kopa/.../domain/filters.test.ts`, `pages/campaigns/CampaignsPage.test.tsx` |
| F-004 | **Kopā** — open a group buy and see its tier ladder, twin progress bars, live countdown, catchment mini-map, participants, supplier bids, FAQ and nearby campaigns | shipped | unmerged | `kopa/.../domain/pricing.test.ts`, `domain/status.test.ts`, `pages/detail/detail-smoke.test.tsx` |
| F-005 | **Kopā** — join a group buy and watch the committed volume, the progress bar and the unlocked price tier move, persisted per browser | shipped | unmerged | `kopa/.../state/mergeJoins.test.ts`, `state/persistence.test.ts` |
| F-006 | **Kopā** — start a group buy: drop a pin, pick a radius, build a tier ladder, and watch the campaign card assemble itself as you type | shipped | unmerged | `kopa/.../state/draft.test.ts`, `pages/create/CreateCampaignPage.test.tsx` |
| F-007 | **Kopā** — supplier view of aggregated demand by category, with a mock bid flow against live campaigns | shipped | unmerged | — |
| F-008 | **Kopā** — demo dashboard: marketplace totals by region, category and status, and a reset for this browser's demo data | shipped | unmerged | — |
| F-009 | **Kopā** — Latvian / English toggle across the whole app, including the campaign data | shipped | unmerged | `kopa/.../data/campaigns.test.ts` |
| F-010 | **hagroup.lv** — read every page in English, Latvian or Russian at its own address (`/…`, `/lv/…`, `/ru/…`), switch language from any page and land on the same page, with Back and Forward following the address | shipped | unmerged | `it_company/.../i18n/locales.test.ts`, `i18n/useLocaleRouting.test.tsx`, `lib/bootScript.test.ts`, `App.test.tsx`, `components/layout/Header.test.tsx` |
| F-011 | **hagroup.lv** — search engines and AI assistants get every page as finished HTML with its own title, description, canonical and hreflang links, HA Group favicon, per-language share card and structured data, plus a sitemap, robots.txt and llms.txt that list exactly the indexable pages | shipped | unmerged | `it_company/tests/built-site/built-site.test.ts`, `src/seo/*.test.ts`, `src/main.test.tsx`, `src/i18n/seoCopy.test.ts` |
| F-012 | **hagroup.lv** — each service page answers six common questions in the visitor's language, always visible and marked up as an FAQ | shipped | unmerged | `it_company/.../lib/faq.test.ts`, `src/i18n/seoCopy.test.ts`, `tests/built-site/built-site.test.ts` |

<!-- Anything needing more than a row gets a "## F-00N — title" section below:
     what was built, what was deliberately not built, what it depends on. -->

## Scope of this registry

`hagroup` holds three separate workloads. **Kopā** is catalogued in full above.
Of the other two, only what the search-presentation work built and tested is
catalogued (F-010 to F-012); the rest of their rows are still owed:

- `services/frontend/it_company` — the `hagroup.lv` site (its contact and
  careers forms, projects and legal pages have no rows yet).
- `iepako/` — the IEPAKO packaging site at `iepako.hagroup.lv`.

Seeding those means reading their code, not copying their `todo.md` done lists —
see the note in `doc/TODO.md`.

## F-001 … F-009 — Kopā

A concept demo of a Latvian group-buying marketplace, shown to partners and
investors. It has no backend, no database, no payments and no email; every
campaign, price, participant, testimonial and supplier bid is invented, and a
visitor's joins live in their own browser's `localStorage` and nowhere else.

That is deliberate and it is the boundary: turning any one of these rows into a
real transaction is a different product, not a follow-up commit.

Built from the demo dataset in `kopa/service/frontend/src/data/campaigns.ts` —
30 campaigns across all five planning regions, all seven product categories and
28 towns. `src/data/campaigns.test.ts` is what keeps it honest: it asserts every
pin sits near its own town and inside Latvia, every tier ladder descends without
a gap, the Latvian copy is not the English copy pasted across, and every badge
the UI can render is reachable by at least one campaign.

## F-010 … F-012 — hagroup.lv search presentation

Built on `todo/seo-search-presentation`. The site was a client-only SPA: every
URL returned the same empty shell, one English title and one description, so
Google and AI crawlers saw one page, a cropped "GROU" thumbnail and a generic
globe icon.

- **Pages:** `npm run build` prerenders 25 paths in three languages plus
  `404.html` (`scripts/prerender.mjs`, `src/entry-server.tsx`) and fails the
  build naming the URL on any page without one h1, its canonical, or with an
  outlined Suspense segment. The browser hydrates that markup; nothing above the
  Suspense boundary may change during hydration (theme, language).
- **Head:** one pure module, `src/seo/`, builds every tag for both the prerender
  and the runtime `Seo` component. Copy lives in `6_seo.json` per language and
  must state nothing the site did not already say (`seoCopy.test.ts`).
- **Deploy:** pages go to extensionless S3 keys (`services/devops`, not
  `services/devops/index.html`) through `scripts/deploy/`, assets first and
  HTML last, one run per environment at a time.

Deliberately not built: real 404 status codes and 301s at the edge. CloudFront
still answers an unknown URL with the English home and status 200, and the app
then renders a noindex not-found page (a soft 404). A viewer-request CloudFront
Function like WEBSITE_TEMPLATE's would fix it; see `doc/TODO.md`, Later.
Rankings and assistant recommendations also depend on things no code controls;
those owner steps are in `doc/TODO.md`.
