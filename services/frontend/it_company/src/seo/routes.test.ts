import { describe, expect, it } from 'vitest';
import { LOCALES } from '../i18n/locales';
import { seoContentFor } from './content';
import {
  NOT_FOUND_PATH,
  SERVICE_ROUTES,
  STATIC_PATHS,
  prerenderPaths,
  resolveRoute,
  sitemapPaths,
} from './routes';

const en = seoContentFor('en');

describe('route table', () => {
  it('has search copy for every static route and no copy for routes that do not exist', () => {
    for (const lang of LOCALES) {
      const keys = Object.keys(seoContentFor(lang).seo.pages).sort();
      expect(keys).toEqual([...STATIC_PATHS, NOT_FOUND_PATH].sort());
    }
  });

  it('matches the service cards and the service pages in every language', () => {
    for (const lang of LOCALES) {
      const { services } = seoContentFor(lang);
      expect(services.items.map((item) => item.path)).toEqual(SERVICE_ROUTES.map((route) => route.path));
      for (const route of SERVICE_ROUTES) {
        expect(services.pages[route.key], `${lang} ${route.key}`).toBeDefined();
      }
    }
  });

  it('uses the same case-study URLs in every language', () => {
    const paths = LOCALES.map((lang) => prerenderPaths(seoContentFor(lang).projects));
    expect(paths[1]).toEqual(paths[0]);
    expect(paths[2]).toEqual(paths[0]);
  });
});

describe('prerenderPaths', () => {
  const paths = prerenderPaths(en.projects);

  it('includes every static route and every case study', () => {
    expect(paths).toEqual(expect.arrayContaining([...STATIC_PATHS]));
    expect(paths).toContain('/projects/rokber');
    expect(paths).toContain('/projects/confidential-infrastructure-modernization');
  });

  it('leaves out the duplicate /projects/balticgp and has no duplicates', () => {
    expect(paths).not.toContain('/projects/balticgp');
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe('sitemapPaths', () => {
  const paths = sitemapPaths(en);

  it('leaves out the noindex legal pages', () => {
    expect(paths).not.toContain('/legal/terms');
    expect(paths).not.toContain('/legal/privacy');
    expect(paths).not.toContain('/legal/cookies');
  });

  it('keeps the pages people search for', () => {
    expect(paths).toEqual(expect.arrayContaining(['/', '/services', '/services/devops', '/contact', '/projects/rokber']));
  });
});

describe('resolveRoute', () => {
  it('recognises each kind of page', () => {
    expect(resolveRoute('/', en).kind).toBe('home');
    expect(resolveRoute('/services', en).kind).toBe('services');
    expect(resolveRoute('/projects', en).kind).toBe('projects');
    expect(resolveRoute('/about', en).kind).toBe('about');
    expect(resolveRoute('/contact', en).kind).toBe('contact');
    expect(resolveRoute('/legal/terms', en).kind).toBe('static');
  });

  it('maps a service URL to its page key', () => {
    const route = resolveRoute('/services/website-development', en);
    expect(route.kind).toBe('service');
    expect(route.serviceKey).toBe('websiteDevelopment');
  });

  it('finds the project behind a case-study URL', () => {
    const route = resolveRoute('/projects/rokber', en);
    expect(route.kind).toBe('project');
    expect(route.project?.slug).toBe('rokber');
  });

  it('points /projects/balticgp at /balticgp', () => {
    const route = resolveRoute('/projects/balticgp', en);
    expect(route.canonicalPath).toBe('/balticgp');
    expect(route.kind).toBe('static');
  });

  it('normalises a trailing slash', () => {
    expect(resolveRoute('/services/devops/', en).path).toBe('/services/devops');
  });

  it('treats unknown URLs and unknown projects as not found', () => {
    expect(resolveRoute('/nope', en).kind).toBe('notFound');
    expect(resolveRoute('/projects/nope', en).kind).toBe('notFound');
    expect(resolveRoute(NOT_FOUND_PATH, en).kind).toBe('notFound');
    expect(resolveRoute('/nope', en).indexable).toBe(false);
  });

  it('keeps the legal pages out of the index', () => {
    expect(resolveRoute('/legal/privacy', en).indexable).toBe(false);
    expect(resolveRoute('/services/devops', en).indexable).toBe(true);
  });

  it('keeps /reviews out of the index while there are no reviews to show', () => {
    expect(resolveRoute('/reviews', { ...en, reviewCount: 0 }).indexable).toBe(false);
    expect(resolveRoute('/reviews', { ...en, reviewCount: 3 }).indexable).toBe(true);
  });
});
