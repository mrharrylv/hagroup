import { describe, expect, it } from 'vitest';
import { seoContentFor } from './content';
import { buildLlmsFullTxt, buildLlmsTxt } from './llms';

const en = seoContentFor('en');

function withDevopsFaq() {
  const faq = [{ question: 'Do you run Kubernetes clusters?', answer: 'Yes, managed and self-hosted.' }];
  return {
    ...en,
    services: {
      ...en.services,
      pages: { ...en.services.pages, devops: { ...en.services.pages.devops, faq } },
    },
  };
}

describe('buildLlmsTxt', () => {
  const text = buildLlmsTxt(en);
  const lines = text.split('\n');

  it('follows the llms.txt layout: H1, blockquote, prose, then H2 link lists', () => {
    expect(lines[0]).toBe('# HA Group');
    expect(lines[1]).toBe('');
    expect(lines[2].startsWith('> ')).toBe(true);
    const headings = lines.filter((line) => line.startsWith('## '));
    expect(headings).toEqual(['## Services', '## Case studies', '## Company', '## Optional']);
  });

  it('states the registered facts', () => {
    expect(text).toContain('SIA HA Group');
    expect(text).toContain('40203724866');
    expect(text).toContain('Valdeķu iela 1, Rīga, LV-1058, Latvia');
    expect(text).toContain('info@hagroup.lv');
    expect(text).toContain('+37126259293');
  });

  it('links each service to its absolute English URL with a one-line description', () => {
    for (const item of en.services.items) {
      expect(text).toContain(`- [${item.title}](https://www.hagroup.lv${item.path}): ${en.seo.pages[item.path].description}`);
    }
    expect(text).toContain('https://www.hagroup.lv/lv/services/devops');
  });

  it('lists the case studies, the company pages and the optional pages', () => {
    expect(text).toContain('(https://www.hagroup.lv/projects/rokber)');
    expect(text).toContain('(https://www.hagroup.lv/about)');
    expect(text).toContain('(https://www.hagroup.lv/contact)');
    expect(text).toContain('(https://www.hagroup.lv/company-details)');
    expect(text).toContain('(https://www.hagroup.lv/careers)');
    expect(text).toContain('(https://www.hagroup.lv/legal/privacy)');
    expect(text).toContain('(https://www.hagroup.lv/lv)');
    expect(text).toContain('(https://www.hagroup.lv/ru)');
  });

  it('uses no em dashes and no relative links', () => {
    expect(text).not.toContain('—');
    expect(text).not.toMatch(/\]\(\//);
    expect(text.endsWith('\n')).toBe(true);
  });
});

describe('buildLlmsFullTxt', () => {
  it('contains the full English text of every service page', () => {
    const text = buildLlmsFullTxt(en);
    for (const key of Object.keys(en.services.pages)) {
      const page = en.services.pages[key];
      expect(text).toContain(`## ${page.title}`);
      expect(text).toContain(page.subtitle);
      expect(text).toContain(page.overviewText);
      for (const feature of page.features) expect(text).toContain(feature.description);
      for (const step of page.process) expect(text).toContain(step.description);
      for (const tech of page.technologies) expect(text).toContain(tech.name);
    }
  });

  it('includes a service FAQ when the page has one', () => {
    const text = buildLlmsFullTxt(withDevopsFaq());
    expect(text).toContain('Do you run Kubernetes clusters?');
    expect(text).toContain('Yes, managed and self-hosted.');
  });
});
