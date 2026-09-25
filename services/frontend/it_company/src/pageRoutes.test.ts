import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { PAGE_ROUTES, pageRouteFor, preloadPage } from './pageRoutes';

// Loading the pages must not initialise Firebase; the prerender's stand-in.
vi.mock('./lib/firebase', () => import('./lib/firebase.ssr'));

const ROOT = resolve(import.meta.dirname, '..');

/** Every page module under src/pages, as 'src/pages/...'. */
function pageModules(): string[] {
  return (readdirSync(join(ROOT, 'src/pages'), { recursive: true }) as string[])
    .map((file) => `src/pages/${file.split('\\').join('/')}`)
    .filter((file) => file.endsWith('.tsx'))
    .sort();
}

describe('PAGE_ROUTES', () => {
  it('routes every lazy page module exactly once, and nothing else', () => {
    // The eager pages are in the entry bundle: home here, not-found in AppRoutes.
    const lazy = pageModules().filter((file) => !/\/(HomePage|NotFoundPage)\.tsx$/.test(file));
    const sources = PAGE_ROUTES.flatMap((page) => (page.source === null ? [] : [page.source]));
    expect([...sources].sort()).toEqual(lazy);
    for (const source of sources) expect(existsSync(join(ROOT, source)), source).toBe(true);
  });

  it('has one route per path, each with a preload exactly when it is lazy', () => {
    expect(new Set(PAGE_ROUTES.map((page) => page.path)).size).toBe(PAGE_ROUTES.length);
    for (const page of PAGE_ROUTES) expect(page.preload === null, page.path).toBe(page.source === null);
  });
});

describe('pageRouteFor', () => {
  it.each([
    ['/careers', 'src/pages/CareersPage.tsx'],
    ['/lv/careers', 'src/pages/CareersPage.tsx'],
    ['/ru/services/devops', 'src/pages/services/DevOps.tsx'],
    ['/services', 'src/pages/ServicesPage.tsx'],
    ['/lv/projects/iepako', 'src/pages/projects/ProjectPage.tsx'],
    ['/projects', 'src/pages/ProjectsPage.tsx'],
    ['/ru/legal/cookies', 'src/pages/legal/CookiePolicyPage.tsx'],
  ])('%s is the lazy page %s', (url, source) => {
    expect(pageRouteFor(url)?.source).toBe(source);
  });

  it.each(['/', '/lv', '/ru'])('%s is the home page, which is not lazy', (url) => {
    const page = pageRouteFor(url);
    expect(page?.path).toBe('/');
    expect(page?.source).toBeNull();
  });

  it.each(['/nope', '/lv/nope', '/Careers', '/LV/careers', '/services/devops/extra'])(
    '%s renders the not-found page, like the router',
    (url) => {
      expect(pageRouteFor(url)).toBeNull();
    },
  );
});

describe('preloadPage', () => {
  it('resolves once the page code is loaded, and for pages with nothing to load', async () => {
    await expect(preloadPage('/lv/careers')).resolves.toBeUndefined();
    await expect(preloadPage('/')).resolves.toBeUndefined();
    await expect(preloadPage('/nope')).resolves.toBeUndefined();
  });
});
