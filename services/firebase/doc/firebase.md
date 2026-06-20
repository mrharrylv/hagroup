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

## 1. Cookie Consent (`consents` collection)

**Component:** `src/components/ui/CookieBanner.tsx`

### Flow

1. On first visit the banner is shown (localStorage key `cloudie-cookies` is absent).
2. User clicks **Accept All** or **Necessary Only**.
3. The choice is saved to `localStorage` so the banner won't reappear.
4. A **fire-and-forget** `addDoc` writes a document to the `consents` collection.

### Firestore document shape

| Field        | Type               | Description                                      |
| ------------ | ------------------ | ------------------------------------------------ |
| `visitorId`  | `string`           | `crypto.randomUUID()`, persisted in localStorage |
| `choice`     | `'all' \| 'necessary'` | Which button was clicked                     |
| `userAgent`  | `string`           | `navigator.userAgent`                            |
| `language`   | `string`           | `navigator.language`                             |
| `url`        | `string`           | Page URL at the time of consent                  |
| `createdAt`  | `Timestamp`        | `serverTimestamp()`                              |

### Design decisions

- **Write-only:** The app never reads back consents; they exist purely for GDPR audit trail.
- **Fire-and-forget:** The `addDoc` call is wrapped in `try/catch` with a `console.warn`. If Firestore is unreachable the user experience is unaffected.
- **Visitor ID:** A random UUID stored in `cloudie-visitor-id` localStorage key links multiple consent events from the same browser without requiring authentication.

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
- **Awaited write:** Unlike consent (fire-and-forget), the contact form awaits the write so it can show success/error feedback to the user.
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
      allow create: if true;
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

Both collections are **create-only** from the client. No reads, updates, or deletes are permitted. A default deny-all rule catches everything else.

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

