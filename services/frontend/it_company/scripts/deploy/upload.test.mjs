import { describe, test, after } from 'node:test';
import assert from 'node:assert/strict';
import { symlinkSync } from 'node:fs';
import { join } from 'node:path';

import { DEPLOY_DIR, makeSandbox, runScript, flagValue } from './harness.mjs';
import { planUpload, CACHE_CONTROL } from './plan.mjs';

const BUCKET = 'test-hagroup-website';

const DIST_FILES = Object.freeze([
  'index.html',
  '404.html',
  'services/index.html',
  'services/devops/index.html',
  'lv/index.html',
  'lv/services/devops/index.html',
  'assets/index-Bx1.js',
  'assets/index-C2.css',
  'assets/inter-latin-400.woff2',
  'assets/index.html',
  'favicon.ico',
  'og-image.png',
  'site.webmanifest',
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'projects/cloud-migration.svg',
]);

const isHtmlUpload = (argv) => argv[2].endsWith('.html') && !argv[2].includes('/assets/');

const uploadOf = (calls, key) => {
  const call = calls.find((argv) => argv[3] === `s3://${BUCKET}/${key}`);
  assert.ok(call, `no upload to key ${key}`);
  return call;
};

describe('upload.sh: a successful deploy', () => {
  const sandbox = makeSandbox(DIST_FILES);
  after(() => sandbox.remove());
  const result = runScript('upload.sh', [BUCKET, sandbox.dist], sandbox.env({ AWS_STUB_SLEEP: '0.05' }));
  const calls = sandbox.calls();

  test('exits 0', () => {
    assert.equal(result.status, 0, result.stderr);
  });

  test('uploads every file exactly once, each with aws s3 cp', () => {
    assert.equal(calls.length, DIST_FILES.length);
    assert.ok(calls.every((argv) => argv[0] === 's3' && argv[1] === 'cp'));
    const sources = calls.map((argv) => argv[2]).sort();
    assert.deepEqual(sources, DIST_FILES.map((file) => join(sandbox.dist, file)).sort());
  });

  test('every upload after the first html one is html: pages ship only once all assets are in', () => {
    const firstHtml = calls.findIndex(isHtmlUpload);
    const lastAsset = calls.findLastIndex((argv) => !isHtmlUpload(argv));
    assert.ok(firstHtml > -1 && lastAsset > -1);
    assert.ok(lastAsset < firstHtml, `asset upload #${lastAsset} came after html upload #${firstHtml}`);
  });

  test('keys, content types and cache headers match the plan, and the mime type is never guessed', () => {
    const plan = planUpload([...DIST_FILES]);
    for (const entry of plan) {
      const argv = uploadOf(calls, entry.key);
      assert.equal(argv[2], join(sandbox.dist, entry.file));
      assert.equal(flagValue(argv, '--content-type'), entry.contentType, entry.file);
      assert.equal(flagValue(argv, '--cache-control'), entry.cacheControl, entry.file);
      assert.ok(argv.includes('--no-guess-mime-type'), entry.file);
    }
  });

  test('prerendered pages land on extensionless keys as html', () => {
    for (const key of ['services', 'services/devops', 'lv', 'lv/services/devops']) {
      const argv = uploadOf(calls, key);
      assert.equal(flagValue(argv, '--content-type'), 'text/html; charset=utf-8');
      assert.equal(flagValue(argv, '--cache-control'), CACHE_CONTROL.html);
    }
    assert.equal(flagValue(uploadOf(calls, 'index.html'), '--content-type'), 'text/html; charset=utf-8');
    assert.equal(flagValue(uploadOf(calls, '404.html'), '--content-type'), 'text/html; charset=utf-8');
  });

  test('hashed, stable media and stable text files get their own cache policy', () => {
    assert.equal(flagValue(uploadOf(calls, 'assets/index-Bx1.js'), '--cache-control'), 'public, max-age=31536000, immutable');
    assert.equal(flagValue(uploadOf(calls, 'assets/index.html'), '--cache-control'), 'public, max-age=31536000, immutable');
    assert.equal(flagValue(uploadOf(calls, 'favicon.ico'), '--cache-control'), 'public, max-age=86400');
    assert.equal(flagValue(uploadOf(calls, 'og-image.png'), '--cache-control'), 'public, max-age=86400');
    assert.equal(flagValue(uploadOf(calls, 'robots.txt'), '--cache-control'), 'public, max-age=3600');
    assert.equal(flagValue(uploadOf(calls, 'sitemap.xml'), '--content-type'), 'application/xml; charset=utf-8');
  });

  test('prints a count per phase', () => {
    assert.match(result.stdout, /Phase 1: 11 non-HTML file\(s\) uploaded/);
    assert.match(result.stdout, /Phase 2: 6 HTML page\(s\) uploaded/);
  });
});

describe('upload.sh: run through a symlinked path', () => {
  // A checkout reached through a symlink: SCRIPT_DIR keeps the symlinked path,
  // so plan.mjs runs with a symlinked argv[1].
  const sandbox = makeSandbox(DIST_FILES);
  after(() => sandbox.remove());
  const link = join(sandbox.root, 'deploy-link');
  symlinkSync(DEPLOY_DIR, link);
  const result = runScript('upload.sh', [BUCKET, sandbox.dist], sandbox.env(), link);
  const calls = sandbox.calls();

  test('exits 0', () => {
    assert.equal(result.status, 0, result.stderr);
  });

  test('uploads every file, not an empty plan', () => {
    assert.equal(calls.length, DIST_FILES.length);
    assert.match(result.stdout, /Phase 1: 11 non-HTML file\(s\) uploaded/);
    assert.match(result.stdout, /Phase 2: 6 HTML page\(s\) uploaded/);
  });
});

describe('upload.sh: failures', () => {
  test('a failing asset upload exits non-zero and no html is uploaded', () => {
    const sandbox = makeSandbox(DIST_FILES);
    try {
      const result = runScript('upload.sh', [BUCKET, sandbox.dist], sandbox.env({ AWS_STUB_FAIL_MATCH: 'assets/index-C2.css' }));
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /assets\/index-C2\.css/);
      assert.deepEqual(sandbox.calls().filter(isHtmlUpload), []);
    } finally {
      sandbox.remove();
    }
  });

  test('a failing html upload exits non-zero', () => {
    const sandbox = makeSandbox(DIST_FILES);
    try {
      const result = runScript('upload.sh', [BUCKET, sandbox.dist], sandbox.env({ AWS_STUB_FAIL_MATCH: `s3://${BUCKET}/services/devops` }));
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /services\/devops/);
    } finally {
      sandbox.remove();
    }
  });

  test('a dist the plan rejects fails before any upload', () => {
    const sandbox = makeSandbox(['index.html', 'assets/index-Bx1.js', 'brochure.docx']);
    try {
      const result = runScript('upload.sh', [BUCKET, sandbox.dist], sandbox.env());
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /brochure\.docx/);
      assert.deepEqual(sandbox.calls(), []);
    } finally {
      sandbox.remove();
    }
  });

  test('a missing dist directory fails before any upload', () => {
    const sandbox = makeSandbox();
    try {
      const result = runScript('upload.sh', [BUCKET, join(sandbox.root, 'nope')], sandbox.env());
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /nope/);
      assert.deepEqual(sandbox.calls(), []);
    } finally {
      sandbox.remove();
    }
  });

  for (const args of [[], [BUCKET], ['', 'dist'], [BUCKET, 'dist', 'extra']]) {
    test(`bad arguments ${JSON.stringify(args)} print usage and fail`, () => {
      const sandbox = makeSandbox();
      try {
        const result = runScript('upload.sh', args, sandbox.env());
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /usage/i);
        assert.deepEqual(sandbox.calls(), []);
      } finally {
        sandbox.remove();
      }
    });
  }
});
