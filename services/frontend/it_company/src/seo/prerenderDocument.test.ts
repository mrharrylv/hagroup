import { describe, expect, it } from 'vitest';
import { injectPage, validatePage } from './prerenderDocument';

const TEMPLATE = [
  '<!doctype html>',
  '<html lang="en" class="scroll-smooth">',
  '  <head>',
  '    <meta charset="UTF-8" />',
  '    <!--seo-head-->',
  '    <title>placeholder</title>',
  '    <!--/seo-head-->',
  '    <link rel="icon" href="/favicon.ico" />',
  '  </head>',
  '  <body>',
  '    <div id="root"></div>',
  '  </body>',
  '</html>',
].join('\n');

const HEAD = '<title data-seo="title">DevOps</title>\n<link rel="canonical" href="https://www.hagroup.lv/lv/services/devops" data-seo="canonical">';
const APP = '<main><h1>DevOps</h1><p>Text</p></main>';

describe('injectPage', () => {
  const html = injectPage(TEMPLATE, { head: HEAD, lang: 'lv', url: '/lv/services/devops', appHtml: APP });

  it('replaces the managed head region and keeps the markers and everything outside', () => {
    expect(html).toContain(`<!--seo-head-->\n    ${HEAD}\n    <!--/seo-head-->`);
    expect(html).not.toContain('placeholder');
    expect(html).toContain('<link rel="icon" href="/favicon.ico" />');
    expect(html).toContain('<meta charset="UTF-8" />');
  });

  it('sets the document language and keeps the other html attributes', () => {
    expect(html).toContain('<html lang="lv" class="scroll-smooth">');
  });

  it('puts the app inside #root with the prerendered URL', () => {
    expect(html).toContain(`<div id="root" data-prerendered="/lv/services/devops">${APP}</div>`);
  });

  it('does not treat $ in the app markup as a replacement pattern', () => {
    const withDollar = injectPage(TEMPLATE, { head: 'price $& $1', lang: 'en', url: '/', appHtml: '<h1>$\'</h1>' });
    expect(withDollar).toContain('price $& $1');
    expect(withDollar).toContain('<h1>$\'</h1>');
  });

  it('refuses a template without the head markers or the root element', () => {
    expect(() => injectPage('<html lang="en"><head></head><body><div id="root"></div></body></html>', { head: HEAD, lang: 'en', url: '/', appHtml: APP })).toThrow(/seo-head/);
    expect(() => injectPage(TEMPLATE.replace('<div id="root"></div>', ''), { head: HEAD, lang: 'en', url: '/', appHtml: APP })).toThrow(/root/);
  });
});

describe('validatePage', () => {
  const good = {
    url: '/lv/services/devops',
    appHtml: APP,
    head: HEAD,
    expectedCanonical: 'https://www.hagroup.lv/lv/services/devops',
    notFound: false,
  };

  it('accepts a page with content, one h1 and its own canonical', () => {
    expect(validatePage(good)).toEqual([]);
  });

  it('rejects an empty root', () => {
    expect(validatePage({ ...good, appHtml: '<div>  </div><!--$--><!--/$-->' })).toEqual([
      expect.stringMatching(/empty #root/),
      expect.stringMatching(/h1/),
    ]);
  });

  it('rejects a page with no h1 or with two', () => {
    expect(validatePage({ ...good, appHtml: '<p>text</p>' })[0]).toMatch(/0 <h1>/);
    expect(validatePage({ ...good, appHtml: '<h1 class="a">a</h1><h1>b</h1>' })[0]).toMatch(/2 <h1>/);
  });

  it('rejects a canonical that is not the page URL', () => {
    const errors = validatePage({ ...good, head: HEAD.replace('/lv/services/devops', '/services/devops') });
    expect(errors[0]).toMatch(/canonical/);
  });

  it('rejects a normal page that rendered the not-found page', () => {
    const errors = validatePage({ ...good, appHtml: '<section data-not-found="true"><h1>Missing</h1></section>' });
    expect(errors[0]).toMatch(/not-found/);
  });

  it.each(['<template id="B:0"></template>', '<div hidden id="S:0"><p>Later</p></div>', '<script>$RC("B:0","S:0")</script>'])(
    'rejects a page with a Suspense boundary streamed out of place: %s',
    (marker) => {
      const errors = validatePage({ ...good, appHtml: `${APP}${marker}` });
      expect(errors).toEqual([expect.stringMatching(/^\/lv\/services\/devops: .*Suspense boundary/)]);
    },
  );

  it('accepts the not-found page without a canonical', () => {
    const errors = validatePage({
      url: '/404',
      appHtml: '<section data-not-found="true"><h1>Missing</h1></section>',
      head: '<title data-seo="title">Missing</title>',
      expectedCanonical: null,
      notFound: true,
    });
    expect(errors).toEqual([]);
  });
});
