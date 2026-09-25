import { DEFAULT_LOCALE, LOCALES, localizePath, normalizePath, type Lang } from '../i18n/locales';
import { buildSeo } from './buildSeo';
import { seoContentFor } from './content';
import { headHtml } from './headHtml';
import { NOT_FOUND_PATH, prerenderPaths } from './routes';

/** One HTML file the build writes. */
export interface PrerenderPage {
  /** URL path of the page, with its language prefix. */
  url: string;
  lang: Lang;
  /** Unprefixed path. */
  path: string;
  /** Path of the file under dist/. */
  outputFile: string;
  /** Managed <head> fragment. */
  head: string;
  canonical: string | null;
  notFound: boolean;
}

export const NOT_FOUND_FILE = '404.html';

/** dist file for a URL: '/' -> index.html, '/lv/services' -> lv/services/index.html. */
export function outputFileFor(url: string): string {
  const path = normalizePath(url);
  return path === '/' ? 'index.html' : `${path.slice(1)}/index.html`;
}

function pageFor(path: string, lang: Lang): PrerenderPage {
  const seo = buildSeo({ path, lang, content: seoContentFor(lang) });
  const url = localizePath(path, lang);
  return {
    url,
    lang,
    path,
    outputFile: outputFileFor(url),
    head: headHtml(seo),
    canonical: seo.canonical,
    notFound: seo.canonical === null,
  };
}

/** Every page in every language, then the English not-found page as 404.html. */
export function listPages(): PrerenderPage[] {
  const paths = prerenderPaths(seoContentFor(DEFAULT_LOCALE).projects);
  const pages = LOCALES.flatMap((lang) => paths.map((path) => pageFor(path, lang)));
  const notFound: PrerenderPage = { ...pageFor(NOT_FOUND_PATH, DEFAULT_LOCALE), outputFile: NOT_FOUND_FILE, notFound: true };
  return [...pages, notFound];
}
