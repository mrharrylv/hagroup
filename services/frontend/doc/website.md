# Cloudie — Website Structure & Design Reference

> Single source of truth for page layout, navigation, components, and design rules.
> Domain: **cloudie.eventapp.lv**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Routing | react-router-dom v7 |
| i18n | i18next (EN / LV / RU) |
| Icons | Iconify — Solar icon set |
| Analytics | Firebase (cookie consent → Firestore) |
| Backend | Firebase Firestore + Storage (career applications, CV uploads) |
| Hosting | AWS S3 + CloudFront |

---

## Navigation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER (fixed, all pages)                                          │
│  ┌──────┐  ┌──────────────┐  ┌──────────┐  ┌────────────┐  [EN▾] [◑]│
│  │ Logo │  │ Services ▾   │  │ Our Work │  │ Contact Us │          │
│  └──┬───┘  └──────┬───────┘  └─────┬────┘  └─────┬──────┘          │
│     │             │                │              │                 │
│     ▼             ▼                ▼              ▼                 │
│   / (home)   Dropdown panel    /projects      /contact             │
│              ┌─────────────────────────┐                           │
│              │ 2-col grid, 8 services  │                           │
│              │ icon + title + desc     │                           │
│              │ each links to its page  │                           │
│              │ "View all" → /services  │                           │
│              └─────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
```

**Header behaviour:**
- Logo click → `/` (home page)
- Services → click-to-toggle dropdown panel (ZenIS-style, 2-column grid with all 8 service icons + titles + short descriptions). Each item links to its dedicated service page. Outside-click or route-change closes it.
- Our Work → `/projects` page (project portfolio / case studies)
- Contact Us → `/contact` page
- Language switcher (EN / LV / RU) — desktop: dropdown; mobile: pill buttons
- Dark / Light mode toggle
- Mobile: hamburger → sheet with services accordion + direct links

---

## Page Inventory

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Main landing — see section layout below |
| `/services` | Services | All 8 services in card grid + CTA |
| `/services/website-development` | Website Development | Service detail page |
| `/services/system-development` | System Development | Service detail page |
| `/services/cloud-migration` | Cloud & Migration | Service detail page |
| `/services/devops` | DevOps & CI/CD | Service detail page |
| `/services/it-infrastructure` | IT Infrastructure | Service detail page |
| `/services/full-cycle` | Full-Cycle Development | Service detail page |
| `/services/ai-integration` | AI Integration | Service detail page |
| `/services/consulting` | IT Consulting | Service detail page |
| `/projects` | Our Work / Portfolio | Project listing (no individual pages) |
| `/reviews` | Reviews | Client testimonials listing (no individual pages) |
| `/contact` | Contact Us | Contact form + info |
| `/about` | About Us | Mission, vision, values, CTA |
| `/company-details` | Company Details | Legal/registration details (name, reg#, VAT, address, bank) |
| `/careers` | Careers | Open positions + application form (Firebase Firestore + Storage for CV) |
| `/legal/terms` | Terms & Conditions | Legal |
| `/legal/privacy` | Privacy Policy | Legal |
| `/legal/cookies` | Cookie Policy | Legal |

---

## Home Page — Section Order

```
┌──────────────────────────────────────┐
│  1. Hero (slogan / CTA)             │  ← big headline + subtitle + buttons + Antigravity particle bg
├──────────────────────────────────────┤
│  2. TechStack ("Powered by …")      │  ← logo ticker strip
├──────────────────────────────────────┤
│  3. Services (8 boxes, 4-col grid)  │  ← keep as-is, each links to service page
├──────────────────────────────────────┤
│  4. Our Methodology (5 phases)      │  ← dark card, phased steps, hover glow effect
├──────────────────────────────────────┤
│  ── hr divider ──                    │  ← subtle boundary line
├──────────────────────────────────────┤
│  5. Our Work (carousel)             │  ← project portfolio cards, drag/swipe
│     Uses shared HorizontalCards     │     border-y boundary, gradient bg
│     Links to /projects for full list│     click background card → rotate to front
├──────────────────────────────────────┤
│  6. Reviews (carousel)              │  ← client testimonials, same carousel pattern
│     Hidden if no featured reviews   │     star ratings, quotes, author info
├──────────────────────────────────────┤
│  ── hr divider ──                    │  ← subtle boundary line
├──────────────────────────────────────┤
│  7. Contact Us                      │  ← form + company info
├──────────────────────────────────────┤
│  8. Footer                          │  ← see footer section below
└──────────────────────────────────────┘
```

### Section Component Map

| # | Section | Component | File |
|---|---------|-----------|------|
| 1 | Hero | `<Hero />` | `sections/Hero.tsx` |
| 2 | TechStack | `<TechStack />` | `sections/TechStack.tsx` |
| 3 | Services | `<Services />` | `sections/Services.tsx` |
| 4 | Methodology | `<Methodology />` | `sections/Methodology.tsx` |
| 5 | Our Work | `<Work />` | `sections/Work.tsx` |
| 6 | Reviews | `<Reviews />` | `sections/Reviews.tsx` |
| 7 | Contact Us | `<Contact />` | `sections/Contact.tsx` |
| 8 | Footer | `<Footer />` | `layout/Footer.tsx` |

---

## Footer

```
┌────────────────────────────────────────────────────────────────────┐
│  Brand / Logo          │ Services        │ Company     │ Legal    │
│  Description text      │ Website Dev     │ About Us    │ Terms    │
│  [LinkedIn] [Insta]    │ System Dev      │ Careers     │ Privacy  │
│                        │ Cloud & Migr.   │ Contact     │ Cookies  │
│                        │ DevOps & CI/CD  │ Company Det.│          │
│                        │ IT Infra        │             │          │
│                        │ Full-Cycle      │             │          │
│                        │ AI Integration  │             │          │
│                        │ IT Consulting   │             │          │
├────────────────────────┴─────────────────┴─────────────┴──────────┤
│  © 2026 Cloudie. All rights reserved.          [LinkedIn] [Insta] │
└────────────────────────────────────────────────────────────────────┘
```

**Footer columns:**
1. **Brand** — Logo, description, social icons (LinkedIn, Instagram)
2. **Services** — All 8 service pages linked
3. **Company** — About Us, Careers, Contact, Company Details
4. **Legal** — Terms & Conditions, Privacy Policy, Cookie Policy

---

## Carousel Design (Work & Reviews)

**Work = project portfolio / case studies** (not reviews).
**Reviews = client testimonials / ratings** (separate concept).

Inspired by ZenIS "Industries We Work With" section — **not a copy**, adapted for Cloudie.

**Shared `<HorizontalCards />` component** (`components/ui/HorizontalCards.tsx`):
- Reusable 3D carousel used by both Work and Reviews sections
- Accepts generic items, `keyExtractor`, and `renderCard` render prop
- Mouse drag / touch swipe to change slides
- Keyboard arrow-key support
- Dot indicators showing current position
- Auto-play with configurable interval (default 5s)
- **Click background card → rotates it to front** (no page navigation)
- Cards use `brightness()` filter instead of opacity for non-transparent background cards (brightness 0.55 / 0.35)
- Solid gradient backgrounds with `shadow-xl` and `border-white/10` for opaque, non-transparent cards
- No individual project or review detail pages — only the listing pages `/projects` and `/reviews`

**Work carousel card layout:**
```
┌─────────────────────────────────────────────────┐
│  [gradient or image background]                  │
│                                                  │
│  ┌ tags ─────────────────────────┐              │
│  │ Events │ Ticketing │ Full-Stack│              │
│  └───────────────────────────────┘              │
│  01.  Project Title                              │
│  Short description text (2 lines max)            │
│  [React] [TypeScript] [Node.js] [+2]            │
└─────────────────────────────────────────────────┘
```

**Reviews carousel card layout:**
```
┌─────────────────────────────────────────────────┐
│  ★★★★★                                          │
│  "Quote text from the client review,             │
│   limited to 4 lines…"                           │
│                                                  │
│  ──────────────────────                          │
│  [Avatar] Name Surname                           │
│           Title, Company                         │
└─────────────────────────────────────────────────┘
```

---

## Service Pages

All 8 service pages share the same template component (`<ServicePage />`):

| Section | Content |
|---------|---------|
| Hero | Title, subtitle, back-to-services link |
| Overview | Title, paragraph, 4 stat cards |
| Features | 6-item grid with icon + title + description |
| Process | 4-step timeline |
| Technologies | Tag list of relevant tech |
| CTA | Title + text + "Get Started" button → `/contact` |

**Services list:**
1. Website Development — `/services/website-development`
2. System Development — `/services/system-development`
3. Cloud & Migration — `/services/cloud-migration`
4. DevOps & CI/CD — `/services/devops`
5. IT Infrastructure — `/services/it-infrastructure`
6. Full-Cycle Development — `/services/full-cycle`
7. AI Integration — `/services/ai-integration`
8. IT Consulting — `/services/consulting`

---

## Internationalization (i18n) & Content Architecture

### JSON Data Files

All non-static, translatable content lives in `src/data/*.json` as per-field localized objects:

```json
{ "en": "English text", "lv": "Latvian text", "ru": "Russian text" }
```

Resolved at render time via the `useLocalizedData()` hook from `src/lib/content.ts`.

| File | Purpose |
|------|---------|
| `data/services.json` | Service list (8 items) + 8 full service page contents |
| `data/methodology.json` | 5-phase methodology steps |
| `data/careers.json` | Benefits, positions, form metadata |
| `data/legal.json` | Terms, Privacy, Cookie policy sections |
| `data/reviews.json` | Client reviews with localized title/description |
| `data/projects.json` | Project portfolio with localized fields |
| `data/techstack.json` | Tech logos for ticker (not localized) |

### i18n Locale Files

| Language | File | Status |
|----------|------|--------|
| English | `locales/en.json` | ✅ Complete |
| Latvian | `locales/lv.json` | ✅ Complete |
| Russian | `locales/ru.json` | ✅ Complete |

Locale files contain **static UI labels only** (navigation, button text, form labels, section headings). All domain content is in JSON data files.

**Key namespaces:** `nav`, `hero`, `techStack`, `services` (UI labels), `methodology` (title only), `work` (UI labels), `contact`, `footer`, `cookie`, `whatsapp`, `servicePages` (backToServices, getStarted), `careers` (UI labels + form fields + submission status), `reviews` (UI labels), `projects` (UI labels), `legal` (backHome), `industries`, `about` (mission/vision/values/CTA), `companyDetails`

Language preference saved to `localStorage` key `cloudie-lang`.

---

## Design Rules

### Theme
- **Light:** white/zinc-50 backgrounds, zinc-900 text
- **Dark:** zinc-950 backgrounds, white/zinc-100 text
- **Accent:** Indigo-600 (light) / Indigo-400 (dark) for interactive elements
- Theme toggle persisted via `ThemeContext` + `localStorage`

### Typography
- Font: system sans-serif stack via Tailwind
- Headings: `font-semibold tracking-tight`
- Body: `text-sm` / `text-base`, zinc-600 (light) / zinc-400 (dark)

### Spacing
- Max content width: `max-w-7xl` (1280px)
- Section padding: `py-16 sm:py-24` (vertical), `px-4 sm:px-6` (horizontal)
- Header height: `h-16` (64px), fixed with backdrop blur

### Components
- Buttons: rounded-lg or rounded-xl, `transition-colors`, hover scale on CTAs
- Cards: `rounded-2xl` or `rounded-3xl`, border, hover border-color change
- Icons: Iconify Solar set, consistent sizing (16–24px)
- Dropdowns: `rounded-lg`, border + shadow-lg, outside-click dismiss

### Responsive Breakpoints
- Mobile-first approach
- `md:` (768px) — desktop nav shown, mobile menu hidden
- `lg:` (1024px) — wider grid layouts (5 columns in footer)
- `sm:` (640px) — minor spacing/sizing adjustments

---

## Project Structure

```
src/
├── App.tsx                    # Router + all routes
├── main.tsx                   # Entry point
├── index.css                  # Tailwind base styles
├── vite-env.d.ts              # Vite + Firebase env types
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Fixed header + nav + dropdowns
│   │   ├── Footer.tsx         # Footer with 4 columns + social
│   │   └── Layout.tsx         # Outlet wrapper (Header + Footer)
│   ├── sections/
│   │   ├── Hero.tsx           # Hero slogan + CTAs
│   │   ├── TechStack.tsx      # Logo ticker
│   │   ├── Services.tsx       # 8-card grid
│   │   ├── Methodology.tsx    # 5-phase dark card
│   │   ├── Work.tsx           # Project carousel
│   │   ├── Reviews.tsx        # Review cards (homepage)
│   │   ├── Contact.tsx        # Contact form + info
│   │   ├── ServicePage.tsx    # Shared service page template
│   │   └── CareerContact.tsx  # Careers application section
│   └── ui/
│       ├── Antigravity.tsx    # Canvas particle animation (Hero bg)
│       ├── CookieBanner.tsx   # GDPR cookie consent → Firestore
│       ├── HorizontalCards.tsx # Shared 3D carousel (Work + Reviews)
│       ├── Logo.tsx           # Brand logo SVG
│       ├── ScrollToTop.tsx    # Auto-scroll on route change
│       ├── SpotlightCard.tsx  # Hover spotlight card effect
│       └── WhatsAppButton.tsx # Floating WhatsApp CTA
├── context/
│   └── ThemeContext.tsx        # Dark/light mode provider
├── data/
│   ├── careers.json           # Career benefits, positions, form data (i18n)
│   ├── legal.json             # Terms, Privacy, Cookie policy (i18n)
│   ├── methodology.json       # 5-phase methodology steps (i18n)
│   ├── projects.json          # Project data (2 featured, i18n)
│   ├── reviews.json           # Reviews (5 total, 3 featured, i18n)
│   ├── services.json          # 8 services + full page content (i18n)
│   └── techstack.json         # Tech logos for ticker
├── i18n/
│   ├── index.ts               # i18next setup
│   └── locales/
│       ├── en.json            # English (complete)
│       ├── lv.json            # Latvian (complete)
│       └── ru.json            # Russian (complete)
├── lib/
│   ├── content.ts             # useLocalizedData() hook + localize() utility
│   └── firebase.ts            # Firebase init + Firestore + Storage exports
├── pages/
│   ├── HomePage.tsx
│   ├── AboutPage.tsx          # Mission, vision, values, CTA
│   ├── CareersPage.tsx        # Positions + CareerContact form
│   ├── CompanyDetailsPage.tsx  # Legal/registration company info
│   ├── ContactPage.tsx
│   ├── ProjectsPage.tsx
│   ├── ReviewsPage.tsx
│   ├── ServicesPage.tsx
│   ├── legal/
│   │   ├── TermsPage.tsx
│   │   ├── PrivacyPage.tsx
│   │   └── CookiePolicyPage.tsx
│   ├── projects/               # (no individual project pages)
│   └── services/
│       ├── WebsiteDevelopment.tsx
│       ├── SystemDevelopment.tsx
│       ├── CloudMigration.tsx
│       ├── DevOps.tsx
│       ├── ITInfrastructure.tsx
│       ├── FullCycle.tsx
│       ├── AIIntegration.tsx
│       └── Consulting.tsx
└── types/
    └── iconify.d.ts           # Iconify JSX type declarations
```

---

## TODO / Pending Work

- [x] Header: implement services dropdown (ZenIS-style 2-col panel)
- [x] Header: change nav links to Services ▾ / Our Work / Contact Us
- [x] Work section: convert from grid to horizontal carousel with arrows + drag
- [x] Reviews section: convert to horizontal carousel (same pattern as Work)
- [x] Russian translations: complete `servicePages.*` keys in `ru.json`
- [x] Move all non-static content to JSON data files with i18n (en/lv/ru)
- [x] Create `/services` page listing all services (header "View all" links here)
- [x] Add Company Details page or section on About page
- [x] Create `/projects` page (portfolio listing all projects with links to case studies)
- [x] Add `/projects` route in App.tsx (no individual `/projects/:slug` routes)
- [x] Extract shared HorizontalCards component for Work + Reviews carousels
- [x] Split About page — `/about` (mission/vision/values) + `/company-details` (legal info)
- [x] Careers form with Firebase Firestore + Storage for CV uploads
- [x] Hero background: intensified Antigravity effect (more particles, higher opacity, larger connections)
- [x] Methodology: hover effect on phase cards (glow, scale, brightness transitions)
- [x] HorizontalCards: increased brightness on background cards, solid non-transparent cards
- [x] Reviews: hidden when no featured reviews in JSON
- [x] Reduced section padding (py-12 sm:py-16) for tighter layout
- [x] Clearer section boundaries (hr dividers, Work section border-y)
- [ ] Social links: confirm final LinkedIn and Instagram URLs
- [ ] Update company details placeholders (reg number, VAT, address, bank)
