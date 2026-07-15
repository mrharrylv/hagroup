# Firebase Integration

Project **cloudie-7b8b4** · Firestore only (no Auth, no Hosting)

---

## Setup

Firebase is initialised once in `src/lib/firebase.ts`.  
All config values come from Vite env vars (`VITE_FIREBASE_*`) so nothing secret is committed.

```ts
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp({ /* env vars */ });
export const db = getFirestore(app);
```

Components import `db` and use the modular Firestore SDK (`addDoc`, `collection`, `serverTimestamp`).

---

## 1. Necessary-Storage Notice Acknowledgement (`consents` collection)

**Component:** `src/components/ui/CookieBanner.tsx`

### Flow

1. On first visit, or after the current record expires, the notice is shown.
2. The user clicks **Understood**. This acknowledges information about necessary storage; it is not consent to optional cookies.
3. An awaited `addDoc` writes a privacy-minimized record to the `consents` collection.
4. After the write succeeds, `cloudie-cookies` stores the choice, policy version, timestamps, and Firestore document ID so the notice does not reappear for up to 12 months.

### Firestore document shape

| Field           | Type          | Description                                      |
| --------------- | ------------- | ------------------------------------------------ |
| `recordType`    | `string`      | Always `necessary_storage_notice`                |
| `choice`        | `string`      | Always `necessary`                               |
| `noticeVersion` | `string`      | Version of the notice that was acknowledged      |
| `language`      | `string`      | Active interface language                        |
| `createdAt`     | `Timestamp`   | Firestore server timestamp                       |
| `expiresAt`     | `Timestamp`   | Maximum 12-month retention; Firestore TTL field  |

### Design decisions

- **Write-only:** The app never reads acknowledgement records from Firestore.
- **Verified write:** The notice closes only after Firestore confirms the record. A localized retry message is shown if the write fails.
- **Data minimization:** No name, email, user agent, page URL, or persistent visitor identifier is written. The legacy `cloudie-visitor-id` value is removed if present.
- **Retention:** `expiresAt` is configured as a Firestore TTL field in `firestore.indexes.json` and is limited to no more than 366 days by security rules.

---

## 2. Contact Form (`contacts` collection)

**Component:** `src/components/sections/Contact.tsx`

### Flow

1. User fills in the contact form (name, company, email, budget, message) and accepts the privacy checkbox.
2. The **Submit** button is disabled until required fields (name, email, message, privacy consent) are filled.
3. On submit, the button shows a spinner + "Submitting…" text and the form is disabled.
4. An `addDoc` writes a document to the `contacts` collection.
5. **Success:** A green banner appears, the form resets.
6. **Error:** A red banner appears, the user can retry. The error is also logged to `console.error`.

### Firestore document shape

| Field            | Type               | Description                                          |
| ---------------- | ------------------ | ---------------------------------------------------- |
| `fullName`       | `string`           | Trimmed full name                                    |
| `company`        | `string`           | Trimmed company name (can be empty)                  |
| `workEmail`      | `string`           | Trimmed email address                                |
| `projectBudget`  | `string \| null`   | Selected range (`10k-50k`, `50k-100k`, `100k+`) or `null` |
| `projectDetails` | `string`           | Trimmed message                                      |
| `privacyConsent` | `boolean`          | Always `true` (button is disabled otherwise)         |
| `language`       | `string`           | `navigator.language`                                 |
| `url`            | `string`           | Page URL at the time of submission                   |
| `createdAt`      | `Timestamp`        | `serverTimestamp()`                                  |

### Design decisions

- **Same pattern as consents** — write-only, no client reads.
- **Awaited write:** The contact form awaits the write so it can show success or error feedback to the user.
- **Client-side validation:** Required fields are enforced via `required` HTML attributes and the `isValid` computed boolean.
- **No reads:** Submissions are consumed via the Firebase console or a future back-office tool.

---

## Firestore Security Rules

Located at `services/firebase/firestore.rules`:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /consents/{consentId} {
      allow create: if request.resource.data.keys().hasOnly([
                      'recordType', 'choice', 'noticeVersion',
                      'language', 'createdAt', 'expiresAt'
                    ])
                    && request.resource.data.recordType == 'necessary_storage_notice'
                    && request.resource.data.choice == 'necessary'
                    && request.resource.data.createdAt == request.time;
      allow read, update, delete: if false;
    }

    match /contacts/{contactId} {
      allow create: if true;
      allow read, update, delete: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

All public collections are **create-only** from the client and validate their allowed fields. No reads, updates, or deletes are permitted. A default deny-all rule catches everything else.

---

## Cloud Functions — Email Notifications

Located at `services/firebase/functions/src/index.ts`.

Two Firestore `onCreate` triggers send an email via Gmail whenever a new document is created:

| Function                      | Trigger collection       | Subject prefix |
| ----------------------------- | ------------------------ | -------------- |
| `onContactCreated`            | `contacts`               | 🟢 New contact |
| `onCareerApplicationCreated`  | `career_applications`    | 🟣 New application |

### Secrets

Secrets are stored via Firebase and injected at runtime — nothing is committed to source.

| Secret               | Description                                      |
| -------------------- | ------------------------------------------------ |
| `GMAIL_ADDRESS`      | Gmail address used as both sender and recipient   |
| `GMAIL_APP_PASSWORD` | 16-char App Password from https://myaccount.google.com/apppasswords |

### First-time setup

```bash
cd services/firebase/functions
npm install

# Set secrets (interactive prompt)
firebase functions:secrets:set GMAIL_ADDRESS
firebase functions:secrets:set GMAIL_APP_PASSWORD
```

### Deploy

```bash
firebase deploy --only functions --project cloudie-7b8b4
```

### Logs

```bash
firebase functions:log --project cloudie-7b8b4
```

---

## Deploying Rules

```bash
firebase deploy --only firestore:rules --project cloudie-7b8b4
```
