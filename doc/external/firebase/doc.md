# Firebase — Cloudie Project

## Overview

| Key              | Value                    |
| ---------------- | ------------------------ |
| Project Name     | Cloudie                  |
| Project ID       | `cloudie-7b8b4`          |
| Project Number   | `674386103300`           |
| Console URL      | https://console.firebase.google.com/project/cloudie-7b8b4 |
| Authenticated as | `harijs.asenieks@gmail.com` |

---

## Services Enabled

| Service          | Status   | Notes                                  |
| ---------------- | -------- | -------------------------------------- |
| Firestore        | ✅ Active | Default database `(default)`           |
| Cloud Functions  | ✅ Active | Email notifications on form submissions |
| Firebase Apps    | ❌ None  | No web/iOS/Android apps registered yet |

---

## Local Setup

### Prerequisites

| Tool           | Version | Install                          |
| -------------- | ------- | -------------------------------- |
| Firebase CLI   | 15.7.0+ | `sudo npm install -g firebase-tools` |
| Node.js        | 20+     | Already installed                |

### First-Time Authentication

```bash
firebase login
```

Opens a browser for Google OAuth. Authenticate with the account that has access to the Cloudie project.

### Verify Connection

```bash
firebase use default          # Should output: Now using alias default (cloudie-7b8b4)
firebase projects:list        # Should show Cloudie project
firebase firestore:databases:list  # Should show (default) database
```

---

## Project Configuration Files

| File                    | Purpose                              |
| ----------------------- | ------------------------------------ |
| `.firebaserc`           | Maps project aliases → Firebase project IDs |
| `firebase.json`         | Firebase service configuration       |
| `firestore.rules`       | Firestore security rules             |
| `firestore.indexes.json`| Firestore composite index definitions |

### `.firebaserc`

```json
{
  "projects": {
    "default": "cloudie-7b8b4"
  }
}
```

### `firebase.json`

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

---

## Firestore Security Rules

Current rules deny all access by default (locked mode). Update `firestore.rules` as needed and deploy with:

```bash
firebase deploy --only firestore:rules
```

---

## Common CLI Commands

```bash
# Switch project
firebase use cloudie-7b8b4

# List Firestore databases
firebase firestore:databases:list

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy everything
firebase deploy

# Open Firebase console in browser
firebase open

# Run local emulators
firebase emulators:start
```

---

## Next Steps

- [ ] Register a Firebase Web App for the frontend (`firebase apps:create WEB "Cloudie Website"`)
- [ ] Add Firebase SDK to the React frontend (for Firestore client access if needed)
- [ ] Define Firestore collections and security rules
- [ ] Set up Firebase Cloud Functions if backend logic is needed
- [ ] Configure CI/CD for Firestore rules deployment
