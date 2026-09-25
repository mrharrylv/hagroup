import { DEFAULT_LOCALE, LOCALES, localizePath, type Lang } from '../i18n/locales';
import type { SeoContent } from './content';
import { buildGraph } from './jsonLd';
import { NOT_FOUND_PATH, resolveRoute, type ResolvedRoute } from './routes';
import {
  INDEX_ROBOTS,
  NOINDEX_ROBOTS,
  OG_IMAGE_PATH,
  OG_IMAGE_SIZE,
  OG_LOCALE,
  absoluteUrl,
} from './site';
import { crumbName, summarize } from './text';
import type { AlternateLink, Crumb, PageSeo, SeoImage } from './types';

export type { PageSeo } from './types';

export interface BuildSeoInput {
  /** Unprefixed path, as the router sees it under its basename. */
  path: string;
  lang: Lang;
  content: SeoContent;
}

const DESCRIPTION_MAX = 160;
const DESCRIPTION_MIN = 70;
/** Social crawlers do not render SVG, so only these may stand in for the share card. */
const RASTER_IMAGE = /\.(png|jpe?g|webp)$/i;

function pageCopy(route: ResolvedRoute, content: SeoContent): { title: string; description: string } {
  if (route.kind === 'project' && route.project) {
    return {
      title: `${route.project.title} | ${content.seo.projectTitleSuffix}`,
      description: route.project.seoDescription ?? summarize(route.project.description, DESCRIPTION_MAX, DESCRIPTION_MIN),
    };
  }
  const key = route.kind === 'notFound' ? NOT_FOUND_PATH : route.canonicalPath;
  const copy = content.seo.pages[key];
  if (!copy) throw new Error(`6_seo.json (${content.lang}) has no entry for "${key}"`);
  return { title: copy.title, description: copy.description };
}

function isSameSiteRaster(image: string | undefined): image is string {
  return Boolean(image && image.startsWith('/') && !image.startsWith('//') && RASTER_IMAGE.test(image));
}

function pageImage(route: ResolvedRoute, content: SeoContent): SeoImage {
  const own = route.kind === 'project' ? route.project?.image : undefined;
  if (route.project && isSameSiteRaster(own)) {
    return { url: absoluteUrl(own), alt: route.project.title };
  }
  return { url: absoluteUrl(OG_IMAGE_PATH[content.lang]), ...OG_IMAGE_SIZE, alt: content.seo.ogImageAlt };
}

/**
 * A page's name as the page itself shows it (6_seo.json names), for its
 * breadcrumb and its llms.txt link. The <title> is written for search
 * results and appears nowhere on the page, so it does not name a crumb.
 */
export function pageName(content: SeoContent, path: string): string {
  const name = content.seo.names[path];
  if (!name) throw new Error(`6_seo.json (${content.lang}) has no name for "${path}"`);
  return name;
}

function crumbsFor(route: ResolvedRoute, content: SeoContent, title: string): Crumb[] {
  const { seo, lang } = content;
  const at = (path: string, name: string): Crumb => ({ name, url: absoluteUrl(localizePath(path, lang)) });
  const home = at('/', seo.breadcrumbs.home);
  const self = (name: string) => at(route.canonicalPath, name);

  switch (route.kind) {
    case 'home':
    case 'notFound':
      return [];
    case 'services':
      return [home, self(seo.breadcrumbs.services)];
    case 'projects':
      return [home, self(seo.breadcrumbs.projects)];
    case 'service': {
      const page = route.serviceKey ? content.services.pages[route.serviceKey] : undefined;
      return [home, at('/services', seo.breadcrumbs.services), self(page?.title ?? crumbName(title))];
    }
    case 'project':
      return [home, at('/projects', seo.breadcrumbs.projects), self(route.project?.title ?? crumbName(title))];
    default:
      return [home, self(pageName(content, route.canonicalPath))];
  }
}

function alternatesFor(canonicalPath: string): AlternateLink[] {
  const links = LOCALES.map((lang) => ({ hreflang: lang, href: absoluteUrl(localizePath(canonicalPath, lang)) }));
  const fallback = absoluteUrl(localizePath(canonicalPath, DEFAULT_LOCALE));
  return [...links, { hreflang: 'x-default', href: fallback }];
}

/**
 * Title, description, canonical, hreflang, Open Graph and JSON-LD for one
 * page in one language. Pure: the build-time prerender and the runtime Seo
 * component call it with the same arguments and get the same answer.
 */
export function buildSeo({ path, lang, content }: BuildSeoInput): PageSeo {
  if (content.lang !== lang) {
    throw new Error(`buildSeo: content is for "${content.lang}" but the page is "${lang}"`);
  }
  // Already unprefixed: stripping again would turn the router's /lv/services
  // (the URL /lv/lv/services, a not-found view) into the real /services page.
  const route = resolveRoute(path, content);
  const notFound = route.kind === 'notFound';
  const { title, description } = pageCopy(route, content);
  const canonical = notFound ? null : absoluteUrl(localizePath(route.canonicalPath, lang));
  const image = pageImage(route, content);
  const crumbs = crumbsFor(route, content, title);

  return {
    lang,
    path: route.path,
    url: absoluteUrl(localizePath(route.path, lang)),
    title,
    description,
    canonical,
    alternates: notFound ? [] : alternatesFor(route.canonicalPath),
    robots: route.indexable ? INDEX_ROBOTS : NOINDEX_ROBOTS,
    ogType: route.kind === 'project' ? 'article' : 'website',
    ogLocale: OG_LOCALE[lang],
    ogLocaleAlternates: LOCALES.filter((other) => other !== lang).map((other) => OG_LOCALE[other]),
    siteName: content.seo.siteName,
    image,
    jsonLd: buildGraph({ content, route, canonical, title, description, image, crumbs }),
  };
}
