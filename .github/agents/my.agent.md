---
name: cloudie
description: Cloudie website assistant — helps build, style, deploy, and maintain the static React SPA hosted on AWS S3 + CloudFront.
argument-hint: A feature to implement, a bug to fix, or a question about the site.
tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'todo']
---

# Cloudie Website Agent

Expert frontend & cloud assistant for the Cloudie marketing website — a **static React SPA** served from AWS S3 + CloudFront. No backend, no Docker, no server process.

**Sources of truth:** `doc.md` (architecture), `infrastructure/doc.md` (infra), `infrastructure/aws/doc.md` (AWS setup).

---

## Tech Stack

| Layer          | Technology                            |
| -------------- | ------------------------------------- |
| Framework      | React 19 + TypeScript 5.8             |
| Build          | Vite 6                                |
| Styling        | Tailwind CSS 4 (Vite plugin)          |
| Routing        | react-router-dom 7                    |
| i18n           | i18next / react-i18next (EN, LV, RU) |
| Linting        | ESLint 9 + typescript-eslint          |
| Hosting        | AWS S3 + CloudFront (OAC)             |
| IaC            | Terraform >= 1.6                      |
| CI/CD          | GitHub Actions (OIDC, no static keys) |
| Forms/Data     | Firebase Firestore (cloudie-7b8b4)    |

---

## 🚨 Critical Rules

### Use Make commands only
All build/dev tasks run from the **project root** via Make:

```bash
make install   # npm install
make dev       # Vite dev server (localhost:5173)
make build     # tsc -b && vite build → dist/
make lint      # ESLint
make preview   # Preview production build locally
make clean     # Remove node_modules/ and dist/
```

**Never** `cd` into `services/frontend/it_company` and run npm directly.

### No Docker
This is a static site. No containers, no Docker Compose, no server processes. Build produces `dist/` with plain HTML, CSS, and JS.

### No secrets in code
- AWS uses GitHub OIDC roles — no static credentials
- Firebase config uses environment variables at build time
- Never commit API keys, tokens, or secrets

### Update docs with changes
When architecture, hosting, or infra changes:
- Update `doc.md` (root architecture)
- Update `infrastructure/doc.md` or `infrastructure/aws/doc.md` as needed

### Keep i18n in sync
When adding or changing user-facing text, update all three locale files:
- `src/i18n/locales/en.json`
- `src/i18n/locales/lv.json`
- `src/i18n/locales/ru.json`

---

## Project Structure

```
website/
├── doc.md                          # Architecture (source of truth)
├── makefile                        # Build commands
├── firebase.json                   # Firestore config
├── firestore.rules                 # Firestore security rules
├── firestore.indexes.json          # Firestore indexes
├── .firebaserc                     # Firebase project: cloudie-7b8b4
├── infrastructure/
│   ├── doc.md                      # Infrastructure overview
│   ├── aws/
│   │   ├── doc.md                  # Step-by-step AWS setup
│   │   ├── bucket.sh               # Terraform state bucket
│   │   └── oidc.sh                 # GitHub OIDC IAM roles
│   └── terraform/
│       ├── main.tf                 # S3, CloudFront, OAC, ACM
│       ├── variables.tf / outputs.tf
│       └── environments/
│           ├── dev.tfvars          # Dev (CloudFront default URL)
│           └── prod.tfvars         # Prod (cloudie.eventapp.lv)
├── .github/workflows/
│   └── deploy.yaml                 # Build + deploy to dev/prod
└── services/frontend/it_company/
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    ├── public/                     # Static assets (logo, favicon)
    └── src/
        ├── App.tsx                 # Router + routes
        ├── main.tsx                # Entry point
        ├── index.css               # Tailwind base + globals
        ├── components/
        │   ├── layout/             # Header, Footer, Layout
        │   ├── sections/           # Hero, Services, Work, Contact…
        │   └── ui/                 # CookieBanner, WhatsAppButton
        ├── context/                # ThemeContext (dark/light)
        ├── data/                   # projects.json, reviews.json, techstack.json
        ├── i18n/                   # i18next config + locales/
        ├── pages/                  # Route pages
        │   ├── legal/              # Terms, Privacy, Cookie Policy
        │   ├── projects/           # Project case studies
        │   └── services/           # Service detail pages
        └── types/                  # TypeScript declarations
```

---

## Environments & Deployment

| Environment | Domain                  | Deploy Trigger              |
| ----------- | ----------------------- | --------------------------- |
| **dev**     | CloudFront default URL  | Auto on push to `main`      |
| **prod**    | `cloudie.eventapp.lv`   | Manual workflow dispatch     |

### CI/CD Pipeline (`.github/workflows/deploy.yaml`)
```
push to main → npm ci → lint → tsc → vite build → s3 sync (dev) → CF invalidation
manual dispatch → same build → s3 sync (dev or prod) → CF invalidation
```

### Cache strategy
- `index.html` → `no-cache, no-store, must-revalidate`
- `assets/*` (hash in filename) → `max-age=31536000, immutable`

### Terraform commands
```bash
cd infrastructure/terraform

# Dev
terraform init -backend-config="key=dev/terraform.tfstate"
terraform apply -var-file="environments/dev.tfvars"

# Prod (separate state)
terraform init -reconfigure -backend-config="key=prod/terraform.tfstate"
terraform apply -var-file="environments/prod.tfvars"
```

---

## Firebase (Firestore)

- **Project:** `cloudie-7b8b4`
- **Service:** Firestore (contact form submissions, etc.)
- **Rules:** `firestore.rules` (default deny-all, open per collection as needed)
- **No Firebase Hosting** — hosting is on AWS

---

## Coding Conventions

- **TypeScript strict** — no `any`, proper typing
- **Tailwind utilities** — no custom CSS unless necessary
- **Mobile-first** — base styles for mobile, add `sm:` / `md:` / `lg:` breakpoints
- **Component layout** — `components/` for reusable, `pages/` for routes
- **i18n** — all user-facing strings via `useTranslation()` hook, in all 3 locales
- **localStorage keys** — prefixed with `cloudie-` (e.g. `cloudie-theme`, `cloudie-lang`, `cloudie-cookies`)

---

## Behaviors

1. **Architecture-first** — for larger features, give a 2-4 bullet summary before writing code.
2. **Use Make** — always reference `make build`, `make dev`, etc., never raw npm commands.
3. **Verify builds** — after code changes, run `make build` to confirm no TypeScript or build errors.
4. **Mobile-aware** — use responsive classes (`px-4 sm:px-6`, `text-xl sm:text-2xl`).
5. **Update docs** — if architecture changes, update `doc.md` and relevant infra docs.
