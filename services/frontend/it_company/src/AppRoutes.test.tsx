import { renderToString } from 'react-dom/server';
import { StaticRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { render } from './entry-server';
import { basenameFor, localeFromPath, type Lang } from './i18n/locales';
import { buildSeo } from './seo/buildSeo';
import { seoContentFor } from './seo/content';

// The prerender renders with the Firebase stand-in (vite.config.ts); so does this.
vi.mock('./lib/firebase', () => import('./lib/firebase.ssr'));

/**
 * The page AppRoutes renders for a URL and the head buildSeo writes for it
 * must agree: a real page under its own canonical, or the not-found view
 * under the not-found head. The head is built from what Layout's Seo gets:
 * the router's own pathname, under the basename main.tsx picks for the URL.
 * S3 keys are case-sensitive, so a URL that differs from a page only in case
 * is not that page.
 */

/** The pathname the router gives its routes and Seo for a URL, or null if it matches nothing. */
function routerPathname(url: string, lang: Lang): string | null {
  let seen: string | null = null;
  function Probe() {
    seen = useLocation().pathname;
    return null;
  }
  renderToString(
    <StaticRouter basename={basenameFor(lang)} location={url}>
      <Probe />
    </StaticRouter>,
  );
  return seen;
}

function firstH1(html: string): string | null {
  const match = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
  return match ? match[1].replace(/<[^>]+>/g, '') : null;
}

interface ViewAndHead {
  notFoundView: boolean;
  notFoundHead: boolean;
  html: string;
  canonical: string | null;
}

async function viewAndHeadOf(url: string): Promise<ViewAndHead> {
  const lang = localeFromPath(url);
  const pathname = routerPathname(url, lang);
  if (pathname === null) throw new Error(`${url}: the ${lang} router matches nothing, the page would be blank`);
  const html = await render(url);
  const seo = buildSeo({ path: pathname, lang, content: seoContentFor(lang) });
  return { notFoundView: html.includes('data-not-found'), notFoundHead: seo.canonical === null, html, canonical: seo.canonical };
}

async function viewAndHead(url: string): Promise<{ notFoundView: boolean; notFoundHead: boolean }> {
  const { notFoundView, notFoundHead } = await viewAndHeadOf(url);
  return { notFoundView, notFoundHead };
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

  // Shapes the inline script in index.html tidies before boot, and shapes it
  // leaves alone. Whatever reaches the app, the view and the head agree.
  it.each([
    '/lv//services', '/ru//about', '/lv//services/devops', '//services', '//lv/services', '///',
    '/lv//', '/services//devops', '/lv/services//devops', '/lv/services//', '/services/devops/',
    '/%73ervices', '/lv/services/%64evops', '/services%2Fdevops', '/projects/rok%62er', '/%E0%A4%A',
  ])('%s: the view and the head agree on which page it is', async (url) => {
    const { notFoundView, notFoundHead, html, canonical } = await viewAndHeadOf(url);
    expect(notFoundHead, 'head says not found').toBe(notFoundView);
    if (canonical !== null) {
      // The head's canonical is the page on screen.
      const canonicalHtml = await render(new URL(canonical).pathname);
      expect(firstH1(html)).toBe(firstH1(canonicalHtml));
    }
  });
});
