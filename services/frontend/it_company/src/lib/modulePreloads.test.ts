import { describe, expect, it } from 'vitest';
import { chunkFilesFor, withModulePreloads, type BuildManifest } from './modulePreloads';

/** Shaped like dist/.vite/manifest.json. */
const MANIFEST: BuildManifest = {
  'index.html': { file: 'assets/index-AAAAAAAA.js', isEntry: true, imports: ['_react-vendor-BBBBBBBB.js'] },
  '_react-vendor-BBBBBBBB.js': { file: 'assets/react-vendor-BBBBBBBB.js' },
  '_firebase-CCCCCCCC.js': { file: 'assets/firebase-CCCCCCCC.js', imports: ['_react-vendor-BBBBBBBB.js'] },
  'src/components/sections/Contact.tsx': {
    file: 'assets/Contact-DDDDDDDD.js',
    isDynamicEntry: true,
    imports: ['index.html', '_firebase-CCCCCCCC.js', '_react-vendor-BBBBBBBB.js'],
  },
  'src/pages/ContactPage.tsx': {
    file: 'assets/ContactPage-EEEEEEEE.js',
    isDynamicEntry: true,
    imports: ['index.html', 'src/components/sections/Contact.tsx'],
    dynamicImports: ['src/pages/AboutPage.tsx'],
  },
  'src/pages/AboutPage.tsx': { file: 'assets/AboutPage-FFFFFFFF.js', isDynamicEntry: true, imports: ['index.html'] },
};

const TEMPLATE = [
  '<html><head>',
  '    <script type="module" crossorigin src="/assets/index-AAAAAAAA.js"></script>',
  '    <link rel="modulepreload" crossorigin href="/assets/react-vendor-BBBBBBBB.js">',
  '    <link rel="stylesheet" crossorigin href="/assets/index-GGGGGGGG.css">',
  '  </head><body></body></html>',
].join('\n');

describe('chunkFilesFor', () => {
  it("lists the page's chunk, then every chunk it imports statically, each once", () => {
    expect(chunkFilesFor(MANIFEST, 'src/pages/ContactPage.tsx')).toEqual([
      'assets/ContactPage-EEEEEEEE.js',
      'assets/index-AAAAAAAA.js',
      'assets/react-vendor-BBBBBBBB.js',
      'assets/Contact-DDDDDDDD.js',
      'assets/firebase-CCCCCCCC.js',
    ]);
  });

  it('leaves out chunks the page only imports on demand', () => {
    expect(chunkFilesFor(MANIFEST, 'src/pages/ContactPage.tsx')).not.toContain('assets/AboutPage-FFFFFFFF.js');
  });

  it('fails the build for a module the client build does not have', () => {
    expect(() => chunkFilesFor(MANIFEST, 'src/pages/Missing.tsx')).toThrow('src/pages/Missing.tsx');
  });
});

describe('withModulePreloads', () => {
  it('adds a modulepreload after the ones Vite wrote, for each file the page does not load yet', () => {
    const html = withModulePreloads(TEMPLATE, chunkFilesFor(MANIFEST, 'src/pages/ContactPage.tsx'));
    expect(html).toBe([
      '<html><head>',
      '    <script type="module" crossorigin src="/assets/index-AAAAAAAA.js"></script>',
      '    <link rel="modulepreload" crossorigin href="/assets/react-vendor-BBBBBBBB.js">',
      '    <link rel="modulepreload" crossorigin href="/assets/ContactPage-EEEEEEEE.js">',
      '    <link rel="modulepreload" crossorigin href="/assets/Contact-DDDDDDDD.js">',
      '    <link rel="modulepreload" crossorigin href="/assets/firebase-CCCCCCCC.js">',
      '    <link rel="stylesheet" crossorigin href="/assets/index-GGGGGGGG.css">',
      '  </head><body></body></html>',
    ].join('\n'));
  });

  it('returns the page unchanged when there is nothing to add', () => {
    expect(withModulePreloads(TEMPLATE, [])).toBe(TEMPLATE);
    expect(withModulePreloads(TEMPLATE, ['assets/index-AAAAAAAA.js'])).toBe(TEMPLATE);
  });

  it('puts them before </head> when the page has no modulepreload yet', () => {
    const html = withModulePreloads('<head>\n  <title>x</title>\n</head><body></body>', ['assets/a-12345678.js']);
    expect(html).toBe('<head>\n  <title>x</title>\n<link rel="modulepreload" crossorigin href="/assets/a-12345678.js">\n</head><body></body>');
  });

  it('refuses a file name that would break out of the attribute', () => {
    expect(() => withModulePreloads(TEMPLATE, ['assets/a"b.js'])).toThrow('assets/a"b.js');
  });
});
