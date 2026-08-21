# HA Group Iepakojumi frontend

A standalone React/Vite website for `iepakojumi.hagroup.lv`. It does not share a build, bucket, CloudFront distribution, Terraform state, or deployment trigger with `hagroup.lv`.

## Local use

```text
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` and use the same `VITE_FIREBASE_*` web configuration as the main HA Group site to exercise the form locally. The deployment workflow reads the existing Dev/Prod GitHub Environment secrets.

The production checks are:

```text
npm run lint
npm run build
```

No automated test suite is configured.

## Editable content

- `src/data/products.json` — product names, descriptions and features in `lv`, `en`, and `ru`. `sourceUrl` is an internal content reference and is not rendered.
- `src/data/partners.json` — partner logos and optional links.
- `src/data/reviews.json` — customer reviews in all three languages.
- `src/i18n/locales/*.json` — interface, legal and company text.

Partner entry format:

```json
{
  "id": "partner-id",
  "name": "Partner name",
  "logo": "/partners/partner-logo.svg",
  "website": "https://partner.example",
  "published": true
}
```

Place logo files under `public/partners/`. The partners section stays hidden while the array is empty.

Review entry format:

```json
{
  "id": "review-id",
  "author": "Name Surname",
  "company": "Company",
  "role": { "lv": "Amats", "en": "Role", "ru": "Должность" },
  "quote": { "lv": "Atsauksme", "en": "Review", "ru": "Отзыв" },
  "published": true
}
```

The reviews section stays hidden while the array is empty. This avoids publishing invented partners or testimonials.

## Firestore separation

- contact submissions: `iepakojumi_contacts`;
- necessary-storage notice records: `iepakojumi_consents`.

The shared Firebase project's authoritative `services/firebase/firestore.rules` contains create-only rules for both collections and preserves all existing HA Group rules. Deploy those rules once before testing production form submissions:

```text
firebase deploy --only firestore:rules --config services/firebase/firebase.json
```
