import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { planUpload, CACHE_CONTROL } from './plan.mjs';

const PLAN_CLI = join(dirname(fileURLToPath(import.meta.url)), 'plan.mjs');

const HTML = 'text/html; charset=utf-8';

const entryFor = (plan, file) => {
  const entry = plan.find((candidate) => candidate.file === file);
  assert.ok(entry, `no plan entry for ${file}`);
  return entry;
};

const planOf = (...files) => planUpload(['index.html', ...files]);

describe('planUpload: html pages', () => {
  test('the root index.html keeps its key: it is the default root object and the SPA fallback', () => {
    assert.deepEqual(entryFor(planOf(), 'index.html'), {
      file: 'index.html',
      key: 'index.html',
      contentType: HTML,
      cacheControl: 'public, max-age=60, s-maxage=300',
      phase: 'html',
    });
  });

  test('a nested index.html becomes the extensionless key of its directory', () => {
    const plan = planOf('services/devops/index.html', 'lv/index.html', 'lv/services/devops/index.html');
    assert.equal(entryFor(plan, 'services/devops/index.html').key, 'services/devops');
    assert.equal(entryFor(plan, 'lv/index.html').key, 'lv');
    assert.equal(entryFor(plan, 'lv/services/devops/index.html').key, 'lv/services/devops');
    for (const file of ['services/devops/index.html', 'lv/index.html', 'lv/services/devops/index.html']) {
      const entry = entryFor(plan, file);
      assert.equal(entry.contentType, HTML);
      assert.equal(entry.cacheControl, CACHE_CONTROL.html);
      assert.equal(entry.phase, 'html');
    }
  });

  test('404.html keeps its name', () => {
    const entry = entryFor(planOf('404.html'), '404.html');
    assert.equal(entry.key, '404.html');
    assert.equal(entry.contentType, HTML);
    assert.equal(entry.cacheControl, CACHE_CONTROL.html);
    assert.equal(entry.phase, 'html');
  });

  test('any other html file keeps its path', () => {
    assert.equal(entryFor(planOf('legal/print.html'), 'legal/print.html').key, 'legal/print.html');
  });

  test('the extension match is case-insensitive', () => {
    assert.equal(entryFor(planOf('about/INDEX.HTML'), 'about/INDEX.HTML').contentType, HTML);
  });
});

describe('planUpload: hashed build output under assets/', () => {
  const cases = [
    ['assets/index-Bx1.js', 'application/javascript; charset=utf-8'],
    ['assets/chunk-Q9.mjs', 'application/javascript; charset=utf-8'],
    ['assets/index-C2.css', 'text/css; charset=utf-8'],
    ['assets/inter-latin-400.woff2', 'font/woff2'],
    ['assets/inter-latin-400.woff', 'font/woff'],
    ['assets/logo-D3.svg', 'image/svg+xml'],
    ['assets/hero-E4.png', 'image/png'],
    ['assets/photo-F5.jpg', 'image/jpeg'],
    ['assets/photo-F6.jpeg', 'image/jpeg'],
    ['assets/anim-G7.gif', 'image/gif'],
    ['assets/hero-H8.webp', 'image/webp'],
    ['assets/hero-I9.avif', 'image/avif'],
    ['assets/icon-J1.ico', 'image/x-icon'],
    ['assets/data-K2.json', 'application/json'],
    ['assets/index-Bx1.js.map', 'application/json'],
  ];

  for (const [file, contentType] of cases) {
    test(`${file} is immutable with type ${contentType}`, () => {
      assert.deepEqual(entryFor(planOf(file), file), {
        file,
        key: file,
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
        phase: 'assets',
      });
    });
  }

  test('an index.html inside assets/ is an asset and does NOT become extensionless', () => {
    assert.deepEqual(entryFor(planOf('assets/index.html'), 'assets/index.html'), {
      file: 'assets/index.html',
      key: 'assets/index.html',
      contentType: HTML,
      cacheControl: CACHE_CONTROL.hashed,
      phase: 'assets',
    });
  });

  test('a nested index.html under assets/ keeps its full key too', () => {
    const entry = entryFor(planOf('assets/docs/index.html'), 'assets/docs/index.html');
    assert.equal(entry.key, 'assets/docs/index.html');
    assert.equal(entry.phase, 'assets');
  });
});

describe('planUpload: stable (non-hashed) files', () => {
  const media = [
    ['favicon.ico', 'image/x-icon'],
    ['favicon-96x96.png', 'image/png'],
    ['favicon-192x192.png', 'image/png'],
    ['apple-touch-icon.png', 'image/png'],
    ['icon-512.png', 'image/png'],
    ['icon-maskable-512.png', 'image/png'],
    ['logo-512.png', 'image/png'],
    ['og-image.png', 'image/png'],
    ['og-image-lv.png', 'image/png'],
    ['site.webmanifest', 'application/manifest+json'],
    ['projects/cloud-migration.svg', 'image/svg+xml'],
  ];

  for (const [file, contentType] of media) {
    test(`${file} is cached for a day with type ${contentType}`, () => {
      assert.deepEqual(entryFor(planOf(file), file), {
        file,
        key: file,
        contentType,
        cacheControl: 'public, max-age=86400',
        phase: 'assets',
      });
    });
  }

  const text = [
    ['robots.txt', 'text/plain; charset=utf-8'],
    ['sitemap.xml', 'application/xml; charset=utf-8'],
    ['llms.txt', 'text/plain; charset=utf-8'],
    ['llms-full.txt', 'text/plain; charset=utf-8'],
  ];

  for (const [file, contentType] of text) {
    test(`${file} is cached for an hour with type ${contentType}`, () => {
      assert.deepEqual(entryFor(planOf(file), file), {
        file,
        key: file,
        contentType,
        cacheControl: 'public, max-age=3600',
        phase: 'assets',
      });
    });
  }
});

describe('planUpload: refusals', () => {
  test('an unknown extension throws rather than shipping a guessed type', () => {
    assert.throws(() => planOf('downloads/brochure.docx'), /unknown extension.*brochure\.docx/i);
  });

  test('a file with no extension throws', () => {
    assert.throws(() => planOf('CNAME'), /unknown extension.*CNAME/i);
  });

  test('a dotfile throws', () => {
    assert.throws(() => planOf('.DS_Store'), /unknown extension/i);
  });

  test('a plan without the root index.html throws', () => {
    assert.throws(() => planUpload(['services/devops/index.html']), /root index\.html/);
    assert.throws(() => planUpload([]), /root index\.html/);
  });

  test('a non-array input throws', () => {
    assert.throws(() => planUpload('index.html'), /array/);
  });

  for (const bad of ['', '/index.html', 'a//index.html', '../index.html', 'a/./b.png', 'a\tb.png', 'a\nb.png', 'a\\b.png']) {
    test(`an unsafe path ${JSON.stringify(bad)} throws`, () => {
      assert.throws(() => planOf(bad), /path/i);
    });
  }

  test('two files that would share a key throw', () => {
    assert.throws(() => planOf('index.html'), /duplicate key.*index\.html/i);
  });
});

describe('planUpload: whole-plan invariants', () => {
  const dist = [
    'index.html',
    '404.html',
    'services/index.html',
    'services/devops/index.html',
    'services/cloud/index.html',
    'projects/index.html',
    'projects/cloud-migration.svg',
    'lv/index.html',
    'lv/services/index.html',
    'lv/services/devops/index.html',
    'ru/index.html',
    'assets/index-Bx1.js',
    'assets/index-C2.css',
    'assets/index.html',
    'favicon.ico',
    'og-image.png',
    'site.webmanifest',
    'robots.txt',
    'sitemap.xml',
    'llms.txt',
    'llms-full.txt',
  ];
  const plan = planUpload(dist);

  test('every file gets exactly one entry', () => {
    assert.deepEqual(plan.map((entry) => entry.file).sort(), [...dist].sort());
  });

  test('keys are unique', () => {
    const keys = plan.map((entry) => entry.key);
    assert.equal(new Set(keys).size, keys.length);
  });

  test('no key ends with a slash or starts with one', () => {
    for (const { key } of plan) {
      assert.ok(!key.endsWith('/'), `key ${key} ends with /`);
      assert.ok(!key.startsWith('/'), `key ${key} starts with /`);
      assert.ok(key.length > 0, 'empty key');
    }
  });

  test('only html pages outside assets/ are in the html phase', () => {
    const htmlFiles = plan.filter((entry) => entry.phase === 'html').map((entry) => entry.file);
    assert.ok(htmlFiles.every((file) => file.endsWith('.html') && !file.startsWith('assets/')));
    assert.equal(htmlFiles.length, dist.filter((file) => file.endsWith('.html') && !file.startsWith('assets/')).length);
  });

  test('the plan lists every asset before every page', () => {
    const lastAsset = plan.findLastIndex((entry) => entry.phase === 'assets');
    const firstPage = plan.findIndex((entry) => entry.phase === 'html');
    assert.ok(lastAsset < firstPage);
  });

  test('the plan and its entries are frozen', () => {
    assert.ok(Object.isFrozen(plan));
    assert.ok(plan.every((entry) => Object.isFrozen(entry)));
  });

  test('the input array is not mutated', () => {
    const input = ['robots.txt', 'index.html'];
    planUpload(input);
    assert.deepEqual(input, ['robots.txt', 'index.html']);
  });
});

describe('plan.mjs CLI', () => {
  const makeDist = (files) => {
    const root = mkdtempSync(join(tmpdir(), 'plan-cli-'));
    for (const file of files) {
      mkdirSync(join(root, dirname(file)), { recursive: true });
      writeFileSync(join(root, file), 'x');
    }
    return root;
  };

  const run = (...args) => spawnSync(process.execPath, [PLAN_CLI, ...args], { encoding: 'utf8' });

  test('prints the plan as TSV: file, key, content type, cache control, phase', () => {
    const dist = makeDist(['index.html', 'services/devops/index.html', 'assets/index-Bx1.js']);
    try {
      const result = run(dist);
      assert.equal(result.status, 0, result.stderr);
      const rows = result.stdout.trim().split('\n').map((line) => line.split('\t'));
      assert.deepEqual(rows, [
        ['assets/index-Bx1.js', 'assets/index-Bx1.js', 'application/javascript; charset=utf-8', CACHE_CONTROL.hashed, 'assets'],
        ['index.html', 'index.html', HTML, CACHE_CONTROL.html, 'html'],
        ['services/devops/index.html', 'services/devops', HTML, CACHE_CONTROL.html, 'html'],
      ]);
    } finally {
      rmSync(dist, { recursive: true, force: true });
    }
  });

  test('--keys prints only the keys, sorted, one per line', () => {
    const dist = makeDist(['index.html', 'lv/index.html', 'robots.txt', 'assets/a-1.css', 'services/devops/index.html']);
    try {
      const result = run(dist, '--keys');
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout, 'assets/a-1.css\nindex.html\nlv\nrobots.txt\nservices/devops\n');
    } finally {
      rmSync(dist, { recursive: true, force: true });
    }
  });

  test('an unknown extension in the dist fails with a clear message', () => {
    const dist = makeDist(['index.html', 'brochure.docx']);
    try {
      const result = run(dist);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /brochure\.docx/);
      assert.equal(result.stdout, '');
    } finally {
      rmSync(dist, { recursive: true, force: true });
    }
  });

  test('a missing dist directory fails', () => {
    const result = run(join(tmpdir(), 'plan-cli-does-not-exist'));
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /plan-cli-does-not-exist/);
  });

  test('no arguments prints usage and fails', () => {
    const result = run();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /usage/i);
  });
});
