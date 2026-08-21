# IEPAKO frontend

A standalone React/Vite website for `iepako.hagroup.lv`. It does not share a build, bucket, CloudFront distribution, Terraform state, or deployment trigger with `hagroup.lv`.

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
- `src/data/partners.json` — supplier/brand cards, descriptions and optional links.
- `src/data/reviews.json` — product reviews or verified customer reviews in all three languages.
- `src/i18n/locales/*.json` — interface, legal and company text.

Partner entry format:

```json
{
  "id": "partner-id",
  "name": "Partner name",
  "website": "https://partner.example",
  "category": { "lv": "Ražotājs", "en": "Manufacturer", "ru": "Производитель" },
  "description": { "lv": "Apraksts", "en": "Description", "ru": "Описание" },
  "published": true
}
```

The partners section stays hidden while the array is empty.

Review entry format:

```json
{
  "id": "review-id",
  "author": { "lv": "Vārds", "en": "Name", "ru": "Имя" },
  "company": "Company",
  "role": { "lv": "Amats", "en": "Role", "ru": "Должность" },
  "quote": { "lv": "Atsauksme", "en": "Review", "ru": "Отзыв" },
  "rating": 5,
  "published": true
}
```

Publish a named customer review only after the customer, company and wording have been verified. Anonymous reviews should not expose identifying details. The reviews section stays hidden while the array is empty.

## Firestore separation

- contact submissions: `iepako_contacts`;
- necessary-storage notice records: `iepako_consents`.

The shared Firebase project's authoritative `services/firebase/firestore.rules` contains create-only rules for both collections and preserves all existing HA Group rules. Deploy those rules once before testing production form submissions:

```text
firebase deploy --only firestore:rules --config services/firebase/firebase.json
```
