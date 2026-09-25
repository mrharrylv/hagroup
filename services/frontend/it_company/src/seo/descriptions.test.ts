import { describe, expect, it } from 'vitest';
import { LOCALES } from '../i18n/locales';
import { buildSeo } from './buildSeo';
import { seoContentFor } from './content';
import { buildLlmsTxt } from './llms';
import { NOT_FOUND_PATH, prerenderPaths } from './routes';

/**
 * Every description a page ships (meta, og:description and the WebPage
 * JSON-LD all carry the same text) is a whole piece of copy, never a
 * machine cut. Hand-written copy lives in 6_seo.json, and for a case study
 * whose own description is too long, in its seoDescription.
 */

const PATHS = [...prerenderPaths(seoContentFor('en').projects), NOT_FOUND_PATH];
const CUT = /[…—–-]$/;
const EM_DASH = '—';

describe.each(LOCALES)('descriptions in %s', (lang) => {
  const content = seoContentFor(lang);

  it('never end in an ellipsis or a dash', () => {
    for (const path of PATHS) {
      const { description } = buildSeo({ path, lang, content });
      expect(description, path).not.toMatch(CUT);
    }
  });

  it('keep every case-study seoDescription within 120 to 160 characters and free of em dashes', () => {
    for (const project of content.projects.filter((p) => p.seoDescription !== undefined)) {
      const text = project.seoDescription ?? '';
      expect(text.length, `${project.slug}: ${text}`).toBeGreaterThanOrEqual(120);
      expect(text.length, `${project.slug}: ${text}`).toBeLessThanOrEqual(160);
      expect(text, project.slug).not.toContain(EM_DASH);
    }
  });
});

describe('case-study seoDescription', () => {
  it('is written in every language or in none', () => {
    const withCopy = (lang: (typeof LOCALES)[number]) =>
      seoContentFor(lang).projects.filter((p) => p.seoDescription !== undefined).map((p) => p.slug);
    expect(withCopy('lv')).toEqual(withCopy('en'));
    expect(withCopy('ru')).toEqual(withCopy('en'));
  });
});

describe('llms.txt case studies', () => {
  it('describe every case study without a cut', () => {
    const text = buildLlmsTxt(seoContentFor('en'));
    const section = text.slice(text.indexOf('## Case studies'), text.indexOf('## Company'));
    const lines = section.split('\n').filter((line) => line.startsWith('- ['));
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) expect(line).not.toMatch(CUT);
  });
});
