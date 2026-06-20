
# Aura.build — Architecture Document

## Overview

Aura.build is a premium, modern website for a full-service IT company. It is a **single-page application (SPA)** built with React, served as static files from AWS infrastructure. No server-side rendering or backend API is required for the website itself.

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Framework    | React 19 + TypeScript               |
| Build Tool   | Vite 6                              |
| Styling      | Tailwind CSS 4 (Vite plugin)        |
| i18n         | i18next / react-i18next (EN, LV, RU)|
| Linting      | ESLint 9 + typescript-eslint        |
| Task Runner  | GNU Make (root `makefile`)          |

---

## Build & Compilation

### How it compiles

```
npm run build
# which runs: tsc -b && vite build
```

1. **TypeScript compilation** (`tsc -b`) — type-checks all `.ts` / `.tsx` files against `tsconfig.app.json`. No emit; types only.
2. **Vite build** (`vite build`) — bundles the app via Rollup under the hood, tree-shakes, code-splits, and outputs optimised static assets to `services/frontend/it_company/dist/`.

The output in `dist/` is a self-contained set of static files:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # bundled JS
│   ├── index-[hash].css     # bundled CSS
│   └── ...                  # images, fonts, etc.
```

### Does it need Docker?

**No.** Docker is not required for building or hosting this project.

- The site is a **static SPA** — the build produces plain HTML, CSS, and JS files.
- These files are uploaded directly to an S3 bucket and served via CloudFront.
- There is no server process, no Node.js runtime, and no container to run.
- CI/CD pipelines (GitHub Actions) can run `npm ci && npm run build` natively without Docker.

Docker would only be useful if you wanted a reproducible build environment in CI, but it adds unnecessary complexity for a static site. A simple Node.js step in the pipeline is sufficient.

---

## Hosting Architecture

```
┌──────────┐     ┌─────────────────┐     ┌────────────┐
│  Browser │────▶│  CloudFront CDN │────▶│  S3 Bucket │
│          │◀────│  (Edge Cache)   │◀────│  (Origin)  │
└──────────┘     └─────────────────┘     └────────────┘
                         │
                  ┌──────┴──────┐
                  │ ACM (SSL)   │
                  │ Route 53    │
                  │ (DNS)       │
                  └─────────────┘
```

### AWS Services Used

| Service           | Purpose                                                  |
| ----------------- | -------------------------------------------------------- |
| **S3**            | Origin bucket storing the built static files (`dist/`)   |
| **CloudFront**    | CDN — global edge caching, HTTPS termination, SPA routing|
| **Route 53**      | DNS management for `aura.build` domain                   |
| **ACM**           | SSL/TLS certificate (free, auto-renewing)                |

### CloudFront Configuration Notes

- **Default root object:** `index.html`
- **Custom error responses:** 403 & 404 → `/index.html` with 200 status (enables client-side routing)
- **Cache policy:** Cache static assets with long TTLs; `index.html` with short TTL or `no-cache` to pick up new deploys
- **Origin Access Control (OAC):** S3 bucket is private; only CloudFront can read from it
- **Price class:** Use `PriceClass_100` (North America + Europe) to reduce costs, expand later if needed

---

## Infrastructure as Code (IaC)

All AWS resources are defined in the `infrastructure/` directory using **Terraform** (~> 5.0 AWS provider).

### What Terraform Manages

| Resource | Purpose |
|----------|---------|
| S3 bucket | Private, versioned, encrypted origin for static files |
| S3 bucket policy | CloudFront OAC access only |
| S3 lifecycle rules | Auto-expire noncurrent versions (7d), abort incomplete uploads (1d) |
| CloudFront distribution | CDN — global edge caching, HTTPS, SPA error routing |
| CloudFront OAC | Origin Access Control (S3 is not publicly accessible) |
| ACM certificate (prod) | SSL cert for `cloudie.eventapp.lv` (us-east-1) |

State is stored in S3 (`ha-terraform-state-561341419749`). See `infrastructure/doc.md` for full details.

---

## Third-Party Services

| Service              | Purpose                                      |
| -------------------- | -------------------------------------------- |
| **Google Firebase**  | Contact form submissions (Firestore), calendar booking backend, potentially auth |
| **Google Analytics** | Traffic analytics, user behaviour tracking    |

### Firebase Integration

- **Firestore** — stores contact form submissions (name, company, email, message, budget)
- **Firebase Hosting** is NOT used — hosting is on AWS
- Firebase SDK is loaded client-side; no backend server needed
- Firebase project config is set via environment variables at build time

### Google Analytics

- GA4 tag embedded in `index.html` or loaded via `react-ga4`
- Respects cookie consent (GDPR banner must gate analytics loading)

---

## Pages

| #  | Page                    | Route                |
| -- | ----------------------- | -------------------- |
| 1  | Home                    | `/`                  |
| 2  | Services                | `/services`          |
| 3  | Projects / Case Studies | `/projects`          |
| 4  | About                   | `/about`             |
| 5  | Contact                 | `/contact`           |
| 6  | Terms & Conditions      | `/terms`             |
| 7  | Privacy Policy          | `/privacy`           |
| 8  | Cookie Policy           | `/cookies`           |

All routes are handled client-side by React Router. CloudFront returns `index.html` for all paths (see error response config above).

---

## Features

- **Dark / Light mode** — toggle in header, persisted via `ThemeContext` + localStorage
- **Multi-language** — i18next with EN (primary), LV, RU; language switcher in nav
- **Cookie consent banner** — GDPR-compliant; gates analytics & non-essential cookies
- **Responsive design** — mobile-first via Tailwind breakpoints
- **Smooth scrolling & animations** — subtle transitions, hover microinteractions
- **SEO** — meta tags, Open Graph, structured data; prerendering can be added later if needed

---

## CI/CD Pipeline (GitHub Actions)

**Workflow:** `.github/workflows/deploy.yaml`

| Trigger | Target | Notes |
|---------|--------|-------|
| Push to `main` (paths: `services/frontend/it_company/**`) | dev | Automatic |
| Manual dispatch | dev or prod | `workflow_dispatch` with environment selector |

### Zero-Downtime Deployment

Deployments use a **4-phase additive strategy** — at no point are users served broken references:

1. **Upload hashed assets** — JS, CSS, images synced to S3 (old + new coexist safely)
2. **Upload `index.html` last** — atomic swap; now references the new hashed filenames
3. **Invalidate CloudFront + wait** — blocks until all edge caches are updated
4. **Cleanup orphaned files** — removes old hashed assets no longer in the build manifest

Vite produces unique hashed filenames (`index-abc123.js`), so old and new assets never collide. The bucket stays the same size after every deploy — no accumulated old versions.

**Auth:** GitHub OIDC → AWS IAM (no static credentials). See `infrastructure/doc.md` for details.

No Docker. No containers. Just: **build → additive upload → atomic HTML swap → invalidate → cleanup**.

---

## Makefile Commands

| Command        | Description                                |
| -------------- | ------------------------------------------ |
| `make install` | Install npm dependencies                   |
| `make dev`     | Start Vite dev server (localhost:5173)      |
| `make build`   | TypeScript check + production build         |
| `make lint`    | Run ESLint                                  |
| `make preview` | Preview production build locally            |
| `make clean`   | Remove `node_modules/` and `dist/`          |

---

## Directory Structure

```
website/
├── doc.md                          # This document
├── makefile                        # Build commands
├── design-aura.html                # Design reference
├── prompts/
│   └── design.md                   # Original design prompt
├── infrastructure/                 # IaC (Terraform / CloudFormation) — TBD
└── services/
    └── frontend/
        └── website/
            ├── package.json
            ├── vite.config.ts
            ├── tsconfig.json
            ├── tsconfig.app.json
            ├── tsconfig.node.json
            ├── eslint.config.js
            ├── index.html
            ├── public/             # Static assets (favicon, robots.txt, etc.)
            └── src/
                ├── index.css       # Tailwind base + global styles
                ├── vite-env.d.ts   # Vite type declarations
                ├── components/
                │   └── layout/
                │       ├── Header.tsx
                │       └── Footer.tsx
                ├── context/
                │   └── ThemeContext.tsx
                └── i18n/
                    ├── index.ts
                    └── locales/
                        ├── en.json
                        ├── lv.json
                        └── ru.json
```

---

## Cost Estimate (AWS)

For a low-traffic static site:

| Service     | Estimated Monthly Cost |
| ----------- | ---------------------- |
| S3          | ~$0.50                 |
| CloudFront  | ~$1–5 (depends on traffic) |
| Route 53    | $0.50/hosted zone      |
| ACM         | Free                   |
| **Total**   | **~$2–6/month**        |