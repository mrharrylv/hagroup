import type { Project } from '../lib/contentTypes';

/**
 * The site's pages, by unprefixed path. src/AppRoutes.tsx renders them;
 * routes.test.ts keeps this list, 6_seo.json and the service data in step,
 * and the prerender fails a page that renders the not-found view.
 */

export const SERVICE_ROUTES = [
  { path: '/services/website-development', key: 'websiteDevelopment' },
  { path: '/services/system-development', key: 'systemDevelopment' },
  { path: '/services/cloud-migration', key: 'cloudMigration' },
  { path: '/services/devops', key: 'devops' },
  { path: '/services/it-infrastructure', key: 'itInfrastructure' },
  { path: '/services/full-cycle', key: 'fullCycle' },
  { path: '/services/ai-integration', key: 'aiIntegration' },
  { path: '/services/consulting', key: 'consulting' },
] as const;

export const STATIC_PATHS: readonly string[] = [
  '/',
  '/services',
  ...SERVICE_ROUTES.map((route) => route.path),
  '/projects',
  '/balticgp',
  '/careers',
  '/reviews',
  '/contact',
  '/about',
  '/company-details',
  '/legal/terms',
  '/legal/privacy',
  '/legal/cookies',
];

/** Key of the not-found copy in 6_seo.json, and the URL 404.html is rendered at. */
export const NOT_FOUND_PATH = '/404';

/** Kept out of the index, as before: they are reachable, but not search results. */
const NOINDEX_PATHS: ReadonlySet<string> = new Set(['/legal/terms', '/legal/privacy', '/legal/cookies']);

/** Duplicate URLs and the page they duplicate. Not prerendered, not in the sitemap. */
const CANONICAL_ALIASES: Readonly<Record<string, string>> = {
  '/projects/balticgp': '/balticgp',
};

export type RouteKind =
  | 'home'
  | 'services'
  | 'service'
  | 'projects'
  | 'project'
  | 'about'
  | 'contact'
  | 'static'
  | 'notFound';

export interface ResolvedRoute {
  /** Normalised unprefixed path that was asked for. */
  path: string;
  /** Unprefixed path of the page this one is a copy of (usually itself). */
  canonicalPath: string;
  kind: RouteKind;
  indexable: boolean;
  serviceKey?: string;
  project?: Project;
}

interface RouteData {
  projects: readonly Project[];
  reviewCount: number;
}

const FIXED_KINDS: Readonly<Record<string, RouteKind>> = {
  '/': 'home',
  '/services': 'services',
  '/projects': 'projects',
  '/about': 'about',
  '/contact': 'contact',
};

/** Case-study URLs from 5_projects.json, without the aliased duplicates. */
export function caseStudyPaths(projects: readonly Project[]): string[] {
  return projects
    .map((project) => project.caseStudyPath ?? '')
    .filter((path) => path.startsWith('/projects/') && !(path in CANONICAL_ALIASES));
}

function isIndexable(path: string, data: RouteData): boolean {
  if (NOINDEX_PATHS.has(path)) return false;
  if (path === '/reviews') return data.reviewCount > 0;
  return true;
}

function resolveCanonical(path: string, data: RouteData): ResolvedRoute {
  const indexable = isIndexable(path, data);
  const service = SERVICE_ROUTES.find((route) => route.path === path);
  if (service) return { path, canonicalPath: path, kind: 'service', indexable, serviceKey: service.key };

  if (STATIC_PATHS.includes(path)) {
    return { path, canonicalPath: path, kind: FIXED_KINDS[path] ?? 'static', indexable };
  }

  const project = data.projects.find((candidate) => candidate.caseStudyPath === path);
  if (project && path.startsWith('/projects/')) {
    return { path, canonicalPath: path, kind: 'project', indexable, project };
  }

  return { path, canonicalPath: path, kind: 'notFound', indexable: false };
}

/** Each segment percent-decoded as react-router decodes it: an encoded '/' stays encoded. */
function decodeSegments(path: string): string {
  try {
    return path
      .split('/')
      .map((segment) => decodeURIComponent(segment).replace(/\//g, '%2F'))
      .join('/');
  } catch {
    // A malformed escape: the router matches the path as it is.
    return path;
  }
}

/**
 * The path as the router matches it against AppRoutes: decoded, with
 * trailing slashes ignored, and nothing else tidied. A URL the router cannot
 * match (//services, which is what the /lv router gets for /lv//services, or
 * /services//devops) is not found here either, so the head never describes a
 * page the view does not show.
 */
function routerPath(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const trimmed = decodeSegments(path).replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/**
 * What a URL shows: which kind of page, which canonical URL, whether
 * indexable. Takes the unprefixed path the router has (its pathname under
 * the language basename).
 */
export function resolveRoute(pathname: string, data: RouteData): ResolvedRoute {
  const path = routerPath(pathname);
  if (path === NOT_FOUND_PATH) return { path, canonicalPath: path, kind: 'notFound', indexable: false };
  const alias = CANONICAL_ALIASES[path];
  if (alias) return { ...resolveCanonical(alias, data), path };
  return resolveCanonical(path, data);
}

/** Every unprefixed path the build renders to HTML. */
export function prerenderPaths(projects: readonly Project[]): string[] {
  return [...new Set([...STATIC_PATHS, ...caseStudyPaths(projects)])];
}

/** Unprefixed paths that belong in the sitemap and in llms.txt. */
export function sitemapPaths(data: RouteData): string[] {
  return prerenderPaths(data.projects).filter((path) => resolveRoute(path, data).indexable);
}
