import { describe, expect, it, vi } from 'vitest';
import { render } from './entry-server';
import { localeFromPath, stripLocale } from './i18n/locales';
import { buildSeo } from './seo/buildSeo';
import { seoContentFor } from './seo/content';

// The prerender renders with the Firebase stand-in (vite.config.ts); so does this.
vi.mock('./lib/firebase', () => import('./lib/firebase.ssr'));

/**
 * The page AppRoutes renders for a URL and the head buildSeo writes for it
 * must agree: a real page under its own canonical, or the not-found view
 * under the not-found head. S3 keys are case-sensitive, so a URL that differs
 * from a page only in case is not that page.
 */

async function viewAndHead(url: string): Promise<{ notFoundView: boolean; notFoundHead: boolean }> {
  const lang = localeFromPath(url);
  const html = await render(url);
  const seo = buildSeo({ path: stripLocale(url), lang, content: seoContentFor(lang) });
  return { notFoundView: html.includes('data-not-found'), notFoundHead: seo.canonical === null };
}

describe('AppRoutes and buildSeo', () => {
  it.each(['/Services/DevOps', '/SERVICES', '/About', '/Legal/terms', '/lv/Services/devops', '/ru/Contact', '/LV/services', '/projects/Rokber', '/BalticGP'])(
    '%s differs from a page only in case: not-found view, not-found head',
    async (url) => {
      expect(await viewAndHead(url)).toEqual({ notFoundView: true, notFoundHead: true });
    },
  );

  it.each(['/', '/services/devops', '/lv/services/devops', '/ru/contact', '/about', '/projects/rokber', '/balticgp', '/lv/legal/terms'])(
    '%s is a page: its own view and its own head',
    async (url) => {
      expect(await viewAndHead(url)).toEqual({ notFoundView: false, notFoundHead: false });
    },
  );
});
