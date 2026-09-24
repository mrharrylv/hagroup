import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { makeSandbox, runScript, flagValue } from './harness.mjs';

const BUCKET = 'test-hagroup-website';

const KEYS = ['assets/index-NEW.js', 'index.html', 'lv', 'robots.txt', 'services', 'services/devops'];

/** `aws s3api list-objects-v2 --output text` prints each page's keys tab-separated on one line. */
const listing = (...pages) => `${pages.map((keys) => keys.join('\t')).join('\n')}\n`;

const deletedKeys = (sandbox) =>
  sandbox
    .calls()
    .filter((argv) => argv[0] === 's3api' && argv[1] === 'delete-object')
    .map((argv) => {
      assert.equal(flagValue(argv, '--bucket'), BUCKET);
      return flagValue(argv, '--key');
    })
    .sort();

const withSandbox = (fn) => {
  const sandbox = makeSandbox();
  try {
    fn(sandbox);
  } finally {
    sandbox.remove();
  }
};

const run = (sandbox, { keys = KEYS, pages, env = {} }) => {
  const keysFile = sandbox.file('keys.txt', `${keys.join('\n')}\n`);
  const listingFile = sandbox.file('listing.txt', listing(...pages));
  return runScript('cleanup.sh', [BUCKET, keysFile], sandbox.env({ AWS_STUB_LISTING: listingFile, ...env }));
};

describe('cleanup.sh', () => {
  test('deletes exactly the bucket keys the new build does not have, across listing pages', () => {
    withSandbox((sandbox) => {
      const result = run(sandbox, {
        pages: [
          ['assets/index-NEW.js', 'assets/index-OLD.js', 'index.html', 'lv'],
          ['manifest.txt', 'robots.txt', 'services', 'services/devops', 'services/old-page'],
        ],
      });
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(deletedKeys(sandbox), ['assets/index-OLD.js', 'manifest.txt', 'services/old-page']);
      assert.match(result.stdout, /3 orphaned file\(s\) removed/);
    });
  });

  test('lists the right bucket', () => {
    withSandbox((sandbox) => {
      run(sandbox, { pages: [KEYS] });
      const list = sandbox.calls().find((argv) => argv[1] === 'list-objects-v2');
      assert.equal(flagValue(list, '--bucket'), BUCKET);
    });
  });

  test('never deletes index.html', () => {
    withSandbox((sandbox) => {
      const result = run(sandbox, { pages: [['index.html', 'assets/index-OLD.js']] });
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(deletedKeys(sandbox), ['assets/index-OLD.js']);
    });
  });

  test('keys with spaces are compared and deleted whole', () => {
    withSandbox((sandbox) => {
      const result = run(sandbox, { keys: [...KEYS, 'projects/case study.svg'], pages: [[...KEYS, 'projects/case study.svg', 'old file.png']] });
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(deletedKeys(sandbox), ['old file.png']);
    });
  });

  test('an empty bucket (the CLI prints None) deletes nothing', () => {
    withSandbox((sandbox) => {
      const result = run(sandbox, { pages: [['None']] });
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(deletedKeys(sandbox), []);
      assert.match(result.stdout, /No orphaned files/);
    });
  });

  test('a bucket that matches the build deletes nothing', () => {
    withSandbox((sandbox) => {
      const result = run(sandbox, { pages: [KEYS] });
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(deletedKeys(sandbox), []);
    });
  });

  test('a keys file without index.html is refused and nothing is deleted', () => {
    withSandbox((sandbox) => {
      const result = run(sandbox, { keys: ['assets/index-NEW.js'], pages: [KEYS] });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /index\.html/);
      assert.deepEqual(deletedKeys(sandbox), []);
    });
  });

  test('an empty keys file is refused and nothing is deleted', () => {
    withSandbox((sandbox) => {
      const result = run(sandbox, { keys: [], pages: [KEYS] });
      assert.notEqual(result.status, 0);
      assert.deepEqual(deletedKeys(sandbox), []);
    });
  });

  test('a failing listing fails and deletes nothing', () => {
    withSandbox((sandbox) => {
      const result = run(sandbox, { pages: [KEYS], env: { AWS_STUB_FAIL_MATCH: 'list-objects-v2' } });
      assert.notEqual(result.status, 0);
      assert.deepEqual(deletedKeys(sandbox), []);
    });
  });

  test('a failing delete makes the script exit non-zero after trying the rest', () => {
    withSandbox((sandbox) => {
      const result = run(sandbox, {
        pages: [[...KEYS, 'old-a.png', 'old-b.png']],
        env: { AWS_STUB_FAIL_MATCH: 'old-a.png' },
      });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /old-a\.png/);
      assert.deepEqual(deletedKeys(sandbox), ['old-a.png', 'old-b.png']);
    });
  });

  test('a missing keys file fails before touching the bucket', () => {
    withSandbox((sandbox) => {
      const result = runScript('cleanup.sh', [BUCKET, `${sandbox.root}/nope.txt`], sandbox.env());
      assert.notEqual(result.status, 0);
      assert.deepEqual(sandbox.calls(), []);
    });
  });

  test('bad arguments print usage and fail', () => {
    withSandbox((sandbox) => {
      const result = runScript('cleanup.sh', [BUCKET], sandbox.env());
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /usage/i);
      assert.deepEqual(sandbox.calls(), []);
    });
  });
});
