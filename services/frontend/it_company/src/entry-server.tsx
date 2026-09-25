/* eslint-disable react-refresh/only-export-components -- build-time entry, never hot-reloaded */
import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import AppRoutes from './AppRoutes';
import { ThemeProvider } from './context/ThemeContext';
import { createI18n } from './i18n';
import { LocaleContext } from './i18n/LocaleContext';
import { basenameFor, localeFromPath } from './i18n/locales';
import { seoContentFor } from './seo/content';
import { buildLlmsFullTxt, buildLlmsTxt } from './seo/llms';
import { buildSitemapXml, sitemapEntries } from './seo/sitemap';

/**
 * Build-time entry: `vite build --ssr src/entry-server.tsx` bundles this for
 * scripts/prerender.mjs, which renders every page to static HTML. Nothing here
 * runs in the browser.
 */

export { listPages, NOT_FOUND_FILE, type PrerenderPage } from './seo/pages';
export { injectPage, validatePage } from './seo/prerenderDocument';

function noLanguageSwitch(): void {
  // Static HTML has no language switch to perform; the browser app does it.
}

async function readStream(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * The app's HTML for one URL ('/lv/services/devops'), after every lazy page
 * and Suspense boundary has resolved. Throws if anything failed to render,
 * so the build fails instead of shipping a fallback.
 */
export async function render(url: string): Promise<string> {
  const lang = localeFromPath(url);
  const i18n = createI18n(lang);
  const errors: unknown[] = [];

  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <LocaleContext.Provider value={{ lang, switchLanguage: noLanguageSwitch }}>
            <StaticRouter basename={basenameFor(lang)} location={url}>
              <AppRoutes />
            </StaticRouter>
          </LocaleContext.Provider>
        </I18nextProvider>
      </ThemeProvider>
    </StrictMode>,
    {
      onError: (error) => { errors.push(error); },
      // React moves a finished boundary past this many bytes out of place: a
      // placeholder where it belongs, the content hidden at the end of the
      // body and a script to swap them. Static HTML is read in one go, so
      // keep every boundary inline; validatePage fails the build otherwise.
      progressiveChunkSize: Number.POSITIVE_INFINITY,
    },
  );

  const html = await readStream(prelude);
  if (errors.length > 0) {
    const [first] = errors;
    throw new Error(`${url}: ${errors.length} render error(s): ${first instanceof Error ? first.stack ?? first.message : String(first)}`);
  }
  return html;
}

export function sitemapXml(): string {
  return buildSitemapXml(sitemapEntries());
}

export function llmsTxt(): string {
  return buildLlmsTxt(seoContentFor('en'));
}

export function llmsFullTxt(): string {
  return buildLlmsFullTxt(seoContentFor('en'));
}
