import type { ComponentType } from 'react';
import { matchRoutes } from 'react-router-dom';
import { basenameFor, localeFromPath } from './i18n/locales';
import { lazyWithPreload, type PageModule } from './lib/lazyWithPreload';
import HomePage from './pages/HomePage';

/**
 * Every page module that loads on demand, each in its own chunk. The home
 * and not-found pages are part of the entry bundle.
 */
const LAZY_PAGE_MODULES = import.meta.glob<PageModule>([
  './pages/**/*.tsx',
  '!./pages/HomePage.tsx',
  '!./pages/NotFoundPage.tsx',
]);

/** One page of AppRoutes (the not-found route aside). */
export interface PageRoute {
  /** Unprefixed, case-sensitive path; the router's basename carries /lv or /ru. */
  path: string;
  Page: ComponentType;
  /** The lazy page's module as Vite's build manifest names it ('src/pages/CareersPage.tsx'). */
  source: string | null;
  /** Fetches a lazy page's code, so that React renders it without suspending. */
  preload: (() => Promise<void>) | null;
}

function eagerPage(path: string, Page: ComponentType): PageRoute {
  return { path, Page, source: null, preload: null };
}

function lazyPage(path: string, module: string): PageRoute {
  const load = LAZY_PAGE_MODULES[`./${module}`];
  if (!load) throw new Error(`src/${module} is not one of the lazy page modules`);
  const Page = lazyWithPreload(load);
  return { path, Page, source: `src/${module}`, preload: Page.preload };
}

/** The page tree. Keep in step with src/seo/routes.ts. */
export const PAGE_ROUTES: readonly PageRoute[] = [
  eagerPage('/', HomePage),
  lazyPage('/services', 'pages/ServicesPage.tsx'),
  lazyPage('/services/website-development', 'pages/services/WebsiteDevelopment.tsx'),
  lazyPage('/services/system-development', 'pages/services/SystemDevelopment.tsx'),
  lazyPage('/services/it-infrastructure', 'pages/services/ITInfrastructure.tsx'),
  lazyPage('/services/full-cycle', 'pages/services/FullCycle.tsx'),
  lazyPage('/services/devops', 'pages/services/DevOps.tsx'),
  lazyPage('/services/cloud-migration', 'pages/services/CloudMigration.tsx'),
  lazyPage('/services/ai-integration', 'pages/services/AIIntegration.tsx'),
  lazyPage('/services/consulting', 'pages/services/Consulting.tsx'),
  lazyPage('/reviews', 'pages/ReviewsPage.tsx'),
  lazyPage('/projects', 'pages/ProjectsPage.tsx'),
  lazyPage('/projects/:slug', 'pages/projects/ProjectPage.tsx'),
  lazyPage('/balticgp', 'pages/projects/BalticGPPage.tsx'),
  lazyPage('/careers', 'pages/CareersPage.tsx'),
  lazyPage('/contact', 'pages/ContactPage.tsx'),
  lazyPage('/about', 'pages/AboutPage.tsx'),
  lazyPage('/company-details', 'pages/CompanyDetailsPage.tsx'),
  lazyPage('/legal/terms', 'pages/legal/TermsPage.tsx'),
  lazyPage('/legal/privacy', 'pages/legal/PrivacyPage.tsx'),
  lazyPage('/legal/cookies', 'pages/legal/CookiePolicyPage.tsx'),
];

const MATCHABLE_ROUTES = PAGE_ROUTES.map((page) => ({ path: page.path, caseSensitive: true, page }));

/**
 * The page the router renders for a URL path with its language prefix
 * ('/lv/careers'), matched the way the router matches it; null when it
 * renders the not-found page.
 */
export function pageRouteFor(pathname: string): PageRoute | null {
  const matches = matchRoutes(MATCHABLE_ROUTES, pathname, basenameFor(localeFromPath(pathname)));
  return matches?.[matches.length - 1]?.route.page ?? null;
}

/** Fetches the code of the page for a URL path, if it loads on demand. */
export async function preloadPage(pathname: string): Promise<void> {
  await pageRouteFor(pathname)?.preload?.();
}
