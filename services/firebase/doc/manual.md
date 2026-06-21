# HAGroup Firebase — Setup Manual (from scratch)

A precise, copy‑paste runbook for standing up the HAGroup Firebase backend on a
**brand‑new** Firebase/GCP project and wiring the website to it.

Follow the steps **in order**. Anything in `<ANGLE_BRACKETS>` is a placeholder you
replace with a real value produced by an earlier step.

---

## 0. What you are building

```
Browser (it_company SPA on AWS S3+CloudFront)
   │  writes documents (no auth, create‑only rules)
   ▼
Firestore  ──onCreate──►  Cloud Functions (europe-north1)  ──nodemailer──►  Gmail inbox
   ├─ contacts/{id}              onContactCreated            🟢 New contact
   ├─ career_applications/{id}   onCareerApplicationCreated  🟣 New application
   └─ consents/{id}             (audit only, no function)
Storage
   └─ careers/{file}             CV uploads (≤5 MB, pdf/doc/docx)
```

| Service | Used for | Notes |
| --- | --- | --- |
| Firestore (Native) | Form submissions + cookie consent | create‑only from client |
| Cloud Storage | Career CV uploads | `careers/` path, 5 MB cap |
| Cloud Functions (Gen 2) | Email notifications | region `europe-north1`, **Blaze plan required** |
| Firebase Web App | Frontend SDK config | provides the 7 `VITE_FIREBASE_*` values |

There is **no** Firebase Hosting and **no** Firebase Auth. The site is hosted on AWS.

---

## 1. Prerequisites

| Tool / account | Required | Check |
| --- | --- | --- |
| Node.js 20+ | runtime + build | `node -v` |
| Firebase CLI 15.7+ | all commands here | `firebase --version` |
| Google account | owns the project | — |
| Billing account | Blaze plan (functions) | a credit card in Google Cloud Billing |
| Gmail account + App Password | sending notification email | see Step 8 |

Install / update the CLI if needed:

```bash
npm install -g firebase-tools
firebase login          # opens browser → sign in with the OWNER Google account
```

---

## 2. Create the new Firebase project  ← **first step**

Pick a globally‑unique project id. `hagroup` may be taken; if so use e.g.
`hagroup-app` or accept the auto‑suffixed id Firebase proposes.

> ✅ Already done — the project exists as `hagroup-47ebc` (the bare id `hagroup`
> was taken, so Firebase auto‑suffixed it). The command below is kept only as a
> record of how it was created; re‑running it now fails with exit code 2.

**CLI (recommended):**

```bash
firebase projects:create hagroup --display-name "HAGroup"
```

> If the id is taken you'll get an error — rerun with another id, e.g.
> `firebase projects:create hagroup-app --display-name "HAGroup"`.

Record the values it prints:

```
Project ID:     hagroup-47ebc        # use this everywhere below
Project Number: 162623097205         # from `firebase projects:list`
```

**Console alternative:** https://console.firebase.google.com → **Add project** →
name `HAGroup` → (Analytics optional) → **Create project**.

---

## 3. Upgrade to the Blaze (pay‑as‑you‑go) plan

Cloud Functions Gen 2 **will not deploy** on the free Spark plan.

1. Open `https://console.firebase.google.com/project/hagroup-47ebc/usage/details`
2. **Modify plan → Blaze** → link a Cloud Billing account.

> Free monthly allowance still applies (2M invocations). A contact form costs ~nothing.
> Optionally set a budget alert in Google Cloud Billing.

---

## 4. Firestore database — already created (Native, `eur3`)

> ✅ The `(default)` database already exists in **Native mode** at location
> **`eur3`** (Europe multi‑region). Firestore location is **permanent**, so this
> is final — do **not** try to recreate it.
>
> `eur3` works fine with the `europe-north1` functions (both in Europe — the
> Firestore‑trigger latency note in Google's docs is negligible at that distance).

**Confirm it exists:**

```bash
firebase firestore:databases:get "(default)" --project hagroup-47ebc
# → Type FIRESTORE_NATIVE · Location eur3 (permanent — cannot be changed)
```

---

## 5. Enable Cloud Storage

**Console:** `https://console.firebase.google.com/project/hagroup-47ebc/storage`
→ **Get started** → production mode → same location → **Done**.

Note the default bucket name it shows — typically `hagroup-47ebc.firebasestorage.app`
(newer) or `hagroup-47ebc.appspot.com` (older). You'll confirm the exact value in Step 6.

---

## 6. Register a Web App and capture its config

This produces the 7 `VITE_FIREBASE_*` values the frontend needs.

```bash
# Create a web app  (none exists yet — verified with `firebase apps:list WEB`)
firebase apps:create WEB "HAGroup Website" --project hagroup-47ebc
# → prints App Id like 1:162623097205:web:abcdef...   (this is <WEB_APP_ID>)

# Print its SDK config
firebase apps:sdkconfig WEB 1:162623097205:web:117b4fff935d104ad62b3c --project hagroup-47ebc
```

The output maps directly to the frontend env vars (see `src/lib/firebase.ts`):

| SDK config field | Frontend env var |
| --- | --- |
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |
| `measurementId` | `VITE_FIREBASE_MEASUREMENT_ID` *(empty if Analytics off)* |

> These values are **public client config** (safe to ship in the bundle). They are
> not secrets — security is enforced by Firestore/Storage rules, not by hiding them.

---

## 7. Point this repo at the new project

Edit `services/firebase/.firebaserc` and replace the old `cloudie-7b8b4` id:

```json
{
  "projects": {
    "default": "hagroup-47ebc"
  }
}
```

Verify:

```bash
cd services/firebase
firebase use default          # → Now using alias default (hagroup-47ebc)
firebase projects:list        # → HAGroup project is listed
```

---

## 8. Create the Gmail App Password and set function secrets

The functions send mail through Gmail via an **App Password** (not your login password).

1. Enable 2‑Step Verification: https://myaccount.google.com/signinoptions/two-step-verification
2. Create an App Password: https://myaccount.google.com/apppasswords
   → App "Mail", Device "Other" → name it `HAGroup Website` → **Generate**
   → copy the 16‑char password (e.g. `abcd efgh ijkl mnop`).

Store both values as Firebase secrets (kept in Google Secret Manager, injected at
runtime, never committed):

```bash
cd services/firebase
# The argument is the secret NAME. The VALUE is entered at the interactive prompt,
# so it never lands in this file, your shell history, or `ps` output.
firebase functions:secrets:set GMAIL_ADDRESS       --project hagroup-47ebc
#   → then TYPE the Gmail address at the prompt
firebase functions:secrets:set GMAIL_APP_PASSWORD  --project hagroup-47ebc
#   → then PASTE the 16‑char App Password at the prompt (never put it on the command line)
```

> ⚠️ Never write the actual address/password into this file or any command
> argument — only the secret **names** (`GMAIL_ADDRESS`, `GMAIL_APP_PASSWORD`) belong here.

---

## 9. Install dependencies and build the functions

```bash
cd services/firebase/functions
npm install
npm run build        # tsc → lib/index.js (must finish with no errors)
```

---

## 10. Deploy rules, indexes, storage rules, and functions

Run from `services/firebase` (the folder with `firebase.json`):

```bash
cd services/firebase

# Security rules + (empty) indexes + storage rules
firebase deploy --only firestore:rules,firestore:indexes,storage --project hagroup-47ebc

# Cloud Functions (auto‑runs the predeploy build; first run enables required APIs)
firebase deploy --only functions --project hagroup-47ebc
```

Expected (regions shown should be **europe-north1**):

```
✔  functions[onContactCreated(europe-north1)] Successful create operation.
✔  functions[onCareerApplicationCreated(europe-north1)] Successful create operation.
✔  Deploy complete!
```

> The first functions deploy may pause to enable Cloud Functions, Cloud Build,
> Artifact Registry and Eventarc APIs — accept the prompts.

---

## 11. Wire the frontend to the new project

The website build reads the 7 `VITE_FIREBASE_*` values from **GitHub Actions secrets**
(injected in `.github/workflows/deploy.yaml`).

Add them under **GitHub → repo Settings → Secrets and variables → Actions → New repository secret**
(or per‑environment), using the values from Step 6:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

For local development, also create `.secrets/.env.firebase` (gitignored) with the same
keys so `npm run dev` in `services/frontend/it_company` can reach Firestore.

Then redeploy the site (push to `main`, or run the **Build & Deploy Website** workflow).

---

## 12. Smoke test

1. Open the deployed site, submit the **Contact** form.
   → email arrives with subject `🟢 New contact: <name>`.
2. Submit the **Career** form (attach a small PDF).
   → email arrives with subject `🟣 New application: <name>`, CV link works.
3. In the Firebase console, confirm new docs in `contacts` / `career_applications`
   and a file under Storage `careers/`.
4. If anything is missing, read the logs:

```bash
firebase functions:log --project hagroup-47ebc
```

A failed email shows `onContactCreated: failed to send email …` — usually a wrong
App Password or a Gmail address mismatch; re‑set the secret and redeploy functions.

---

## Optional — rebrand from "Cloudie"

Cosmetic only; not required for it to work. In `functions/src/index.ts` the email
sender label is `Cloudie Website <…>` in both `sendMail()` calls. To rebrand:

```ts
from: `HAGroup Website <${GMAIL_ADDRESS.value()}>`,
```

Then `firebase deploy --only functions`. (The older `doc/notification.md` also shows a
stale `us-central1` region in its sample output — the live region is `europe-north1`.)

---

## Reference

### File map (`services/firebase/`)

| Path | Purpose |
| --- | --- |
| `.firebaserc` | alias → project id (update in Step 7) |
| `firebase.json` | functions + firestore + storage config |
| `firestore.rules` | create‑only rules for `contacts`, `career_applications`, `consents` |
| `firestore.indexes.json` | composite indexes (currently none) |
| `storage.rules` | `careers/` uploads ≤5 MB, pdf/doc/docx |
| `functions/src/index.ts` | `onContactCreated`, `onCareerApplicationCreated` |
| `functions/package.json` | node 20 runtime; firebase‑functions v6, nodemailer |

### Where each secret lives

| Secret | Stored in | Used by |
| --- | --- | --- |
| `GMAIL_ADDRESS`, `GMAIL_APP_PASSWORD` | Google Secret Manager (via `firebase functions:secrets:set`) | Cloud Functions at runtime |
| `VITE_FIREBASE_*` (×7) | GitHub Actions secrets | website build in `deploy.yaml` |

> The same `GMAIL_*` names may also exist as GitHub/AWS secrets for the separate
> AWS `secrets-sync` path — that is unrelated to running these functions.

### One‑shot checklist

- [x] Project exists → `hagroup-47ebc` (number `162623097205`)
- [ ] Upgrade to **Blaze**
- [x] Firestore exists (Native, `eur3`)
- [ ] Enable **Storage**
- [ ] `firebase apps:create WEB` → capture `VITE_FIREBASE_*`
- [ ] Update `.firebaserc` → `firebase use default`
- [ ] Set `GMAIL_ADDRESS` + `GMAIL_APP_PASSWORD` secrets
- [ ] `npm install && npm run build` in `functions/`
- [ ] `firebase deploy --only firestore:rules,firestore:indexes,storage`
- [ ] `firebase deploy --only functions`
- [ ] Add 7 `VITE_FIREBASE_*` GitHub secrets → redeploy site
- [ ] Smoke‑test both forms → emails received
