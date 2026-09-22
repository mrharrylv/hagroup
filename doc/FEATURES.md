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

<!-- Anything needing more than a row gets a "## F-00N — title" section below:
     what was built, what was deliberately not built, what it depends on. -->

## Scope of this registry

`hagroup` holds three separate workloads. Only **Kopā** is catalogued above,
because it is the only one whose capabilities have been read out of the working
tree and confirmed. The other two are real and running, and their rows are still
owed:

- `services/frontend/it_company` — the `hagroup.lv` site.
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
