/**
 * Test harness for the deploy shell scripts: a fake dist tree, and a stub
 * `aws` placed first on PATH that records every call instead of reaching AWS.
 *
 * Stub environment:
 *   AWS_STUB_LOG          file the stub appends one line per call to (argv joined by \x1f)
 *   AWS_STUB_LISTING      file whose contents `aws s3api list-objects-v2` prints
 *   AWS_STUB_FAIL_MATCH   a call whose argv contains this text exits 1
 *   AWS_STUB_SLEEP        seconds to sleep before answering an `s3 cp` of a non-html file
 */

import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const DEPLOY_DIR = dirname(fileURLToPath(import.meta.url));

const ARG_SEPARATOR = '\x1f';

const STUB_AWS = `#!/usr/bin/env bash
set -u
line=""
for arg in "$@"; do line="\${line}\${arg}"$'\\x1f'; done
if [ "\${1:-}" = "s3" ] && [ -n "\${AWS_STUB_SLEEP:-}" ]; then
  case "\${3:-}" in *.html) ;; *) sleep "$AWS_STUB_SLEEP" ;; esac
fi
printf '%s\\n' "$line" >> "$AWS_STUB_LOG"
if [ -n "\${AWS_STUB_FAIL_MATCH:-}" ]; then
  case "$line" in *"$AWS_STUB_FAIL_MATCH"*) echo "stub aws: simulated failure" >&2; exit 1 ;; esac
fi
if [ "\${1:-}" = "s3api" ] && [ "\${2:-}" = "list-objects-v2" ]; then
  cat "$AWS_STUB_LISTING"
fi
exit 0
`;

/** A scratch directory holding dist/, bin/aws and the call log; remove() deletes all of it. */
export function makeSandbox(distFiles = []) {
  const root = mkdtempSync(join(tmpdir(), 'deploy-test-'));
  const dist = join(root, 'dist');
  const bin = join(root, 'bin');
  const log = join(root, 'aws.log');
  mkdirSync(dist);
  mkdirSync(bin);
  writeFileSync(log, '');
  writeFileSync(join(bin, 'aws'), STUB_AWS);
  chmodSync(join(bin, 'aws'), 0o755);
  for (const file of distFiles) {
    mkdirSync(join(dist, dirname(file)), { recursive: true });
    writeFileSync(join(dist, file), `<!-- ${file} -->`);
  }
  return Object.freeze({
    root,
    dist,
    log,
    file: (name, contents) => {
      const path = join(root, name);
      writeFileSync(path, contents);
      return path;
    },
    env: (extra = {}) => ({ ...process.env, PATH: `${bin}:${process.env.PATH}`, AWS_STUB_LOG: log, ...extra }),
    calls: () =>
      readFileSync(log, 'utf8')
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => line.split(ARG_SEPARATOR).slice(0, -1)),
    remove: () => rmSync(root, { recursive: true, force: true }),
  });
}

/** Runs a deploy script with bash; dir lets a test run a copy, or the scripts through a symlink. */
export function runScript(script, args, env, dir = DEPLOY_DIR) {
  return spawnSync('bash', [join(dir, script), ...args], { encoding: 'utf8', env, timeout: 60_000 });
}

/** The value that follows a flag in an argv array, or undefined. */
export function flagValue(argv, flag) {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}
