# Email Notifications — Firebase Cloud Functions

Firestore `onCreate` triggers send an email to `harijs.asenieks@gmail.com` whenever a visitor submits the **Contact** or **Career** form.

---

## Architecture

```
Browser  →  addDoc('contacts')            →  Firestore  →  onContactCreated()              →  Gmail
Browser  →  addDoc('career_applications') →  Firestore  →  onCareerApplicationCreated()  →  Gmail
```

| Function                     | Trigger collection     | Email subject              |
| ---------------------------- | ---------------------- | -------------------------- |
| `onContactCreated`           | `contacts`             | 🟢 New contact: {name}     |
| `onCareerApplicationCreated` | `career_applications`  | 🟣 New application: {name} |

Source: `services/firebase/functions/src/index.ts`

---

## Prerequisites

| Requirement         | Details                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| Firebase CLI         | `npm install -g firebase-tools` (v15.7+)                               |
| Blaze plan           | Cloud Functions require pay-as-you-go (free tier: 2M invocations/month) |
| Gmail account        | `harijs.asenieks@gmail.com`                                            |
| Gmail App Password   | 16-character password (not your login password)                        |
| Node.js              | 20+ (runtime target for Cloud Functions)                               |

---

## Step-by-Step Setup

### 1. Upgrade to Blaze Plan (if not already)

1. Go to https://console.firebase.google.com/project/cloudie-7b8b4/usage/details
2. Click **Upgrade** → select **Blaze (pay as you go)**
3. Link a billing account

> The free tier covers 2M function invocations/month. Contact form submissions will cost essentially nothing.

### 2. Generate a Gmail App Password

Google blocks "less secure app" logins, so you need an **App Password**.

1. Go to https://myaccount.google.com/apppasswords
   - If you don't see this page, enable 2-Step Verification first at https://myaccount.google.com/signinoptions/two-step-verification
2. Select **App** → "Mail" and **Device** → "Other (Custom name)" → enter `Cloudie Website`
3. Click **Generate**
4. Copy the 16-character password (e.g. `abcd efgh ijkl mnop`) — you'll paste it in the next step

### 3. Install Function Dependencies

```bash
cd services/firebase/functions
npm install
```

### 4. Set Firebase Secrets

Secrets are stored securely by Google Cloud Secret Manager and injected at function runtime. They are **not** committed to source.

The same variable names are also stored as **GitHub Actions repository secrets** for CI/CD deployments:

| Secret name          | Where it's stored                                  |
| -------------------- | -------------------------------------------------- |
| `GMAIL_ADDRESS`      | Google Cloud Secret Manager + GitHub Actions secret |
| `GMAIL_APP_PASSWORD` | Google Cloud Secret Manager + GitHub Actions secret |

```bash
cd services/firebase

# Set your Gmail address
firebase functions:secrets:set GMAIL_ADDRESS --project cloudie-7b8b4
# Prompt: Enter a value for GMAIL_ADDRESS → harijs.asenieks@gmail.com

# Set the App Password from step 2
firebase functions:secrets:set GMAIL_APP_PASSWORD --project cloudie-7b8b4
# Prompt: Enter a value for GMAIL_APP_PASSWORD → (paste the 16-char password)
```

### 5. Deploy Functions

```bash
cd services/firebase
firebase deploy --only functions --project cloudie-7b8b4
```

Expected output:
```
✔  functions: functions folder uploaded successfully
✔  functions[onContactCreated(us-central1)] Successful create operation.
✔  functions[onCareerApplicationCreated(us-central1)] Successful create operation.
✔  Deploy complete!
```

### 6. Test

1. Submit the **Contact** form on the website
2. Check your Gmail inbox for an email with subject `🟢 New contact: {name}`
3. Submit the **Career** form on the website
4. Check your Gmail inbox for an email with subject `🟣 New application: {name}`

If emails don't arrive:
```bash
# Check function logs for errors
firebase functions:log --project cloudie-7b8b4
```

---

## Managing Secrets

```bash
# List all secrets
firebase functions:secrets:get GMAIL_ADDRESS --project cloudie-7b8b4

# Update a secret (re-deploy needed after)
firebase functions:secrets:set GMAIL_ADDRESS --project cloudie-7b8b4
firebase deploy --only functions --project cloudie-7b8b4

# Destroy a secret version
firebase functions:secrets:destroy GMAIL_ADDRESS --project cloudie-7b8b4
```

---

## Changing the Recipient

To send notifications to a different email, update the `GMAIL_ADDRESS` secret. Both sender and recipient use the same address by default.

To send to a **different** recipient, edit `functions/src/index.ts` and change the `to:` field in both `sendMail()` calls, then redeploy.

---

## Local Development

```bash
cd services/firebase/functions

# Build
npm run build

# Run with emulators (functions + Firestore)
cd ..
firebase emulators:start --only functions,firestore

# Or use the functions shell
npm run shell
```

> Note: Secrets are not available in the emulator. For local testing, you can temporarily hardcode values in the transporter config (do not commit).

---

## File Structure

```
services/firebase/
├── firebase.json              # Functions + Firestore + Storage config
├── firestore.rules            # Security rules (create-only for contacts + career_applications)
├── functions/
│   ├── package.json           # Dependencies: firebase-functions, firebase-admin, nodemailer
│   ├── tsconfig.json          # TypeScript config (target: es2022, outDir: lib)
│   ├── src/
│   │   └── index.ts           # Cloud Functions (onContactCreated, onCareerApplicationCreated)
│   └── lib/                   # Compiled JS output (gitignored)
└── doc/
    ├── firebase.md            # Firebase integration overview
    └── notification.md        # This file
```
