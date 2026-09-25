/**
 * Upload plan for the website bucket: which S3 key, Content-Type and
 * Cache-Control every file in dist/ gets, and in which phase it ships.
 *
 * The S3 origin is a REST endpoint behind CloudFront with OAC, so a request
 * for /services/devops asks S3 for the key 'services/devops' and never looks
 * for 'services/devops/index.html'. Each prerendered page is therefore stored
 * under the extensionless key of its directory, with an explicit HTML type.
 * See infrastructure/doc.md, "Key mapping".
 *
 * Usage: node plan.mjs <distDir> [--keys]
 *   default  TSV, one row per file: file, key, contentType, cacheControl, phase
 *   --keys   the S3 keys only, sorted, one per line
 */

import { readdirSync, realpathSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CACHE_CONTROL = Object.freeze({
  html: 'public, max-age=60, s-maxage=300',
  hashed: 'public, max-age=31536000, immutable',
  stableMedia: 'public, max-age=86400',
  stableText: 'public, max-age=3600',
});

const ROOT_INDEX = 'index.html';
const INDEX_FILE = 'index.html';
const HASHED_DIR = 'assets/';
const PHASE_ORDER = Object.freeze({ assets: 0, html: 1 });

/** kind decides the cache policy of a non-hashed file: media changes rarely, text with content. */
const TYPES = Object.freeze({
  html: { contentType: 'text/html; charset=utf-8', kind: 'html' },
  js: { contentType: 'application/javascript; charset=utf-8', kind: 'text' },
  mjs: { contentType: 'application/javascript; charset=utf-8', kind: 'text' },
  css: { contentType: 'text/css; charset=utf-8', kind: 'text' },
  json: { contentType: 'application/json', kind: 'text' },
  map: { contentType: 'application/json', kind: 'text' },
  txt: { contentType: 'text/plain; charset=utf-8', kind: 'text' },
  xml: { contentType: 'application/xml; charset=utf-8', kind: 'text' },
  webmanifest: { contentType: 'application/manifest+json', kind: 'media' },
  svg: { contentType: 'image/svg+xml', kind: 'media' },
  png: { contentType: 'image/png', kind: 'media' },
  jpg: { contentType: 'image/jpeg', kind: 'media' },
  jpeg: { contentType: 'image/jpeg', kind: 'media' },
  gif: { contentType: 'image/gif', kind: 'media' },
  webp: { contentType: 'image/webp', kind: 'media' },
  avif: { contentType: 'image/avif', kind: 'media' },
  ico: { contentType: 'image/x-icon', kind: 'media' },
  woff: { contentType: 'font/woff', kind: 'media' },
  woff2: { contentType: 'font/woff2', kind: 'media' },
  ttf: { contentType: 'font/ttf', kind: 'media' },
  otf: { contentType: 'font/otf', kind: 'media' },
  pdf: { contentType: 'application/pdf', kind: 'media' },
});

const compareStrings = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function assertSafePath(file) {
  const unsafe =
    typeof file !== 'string' ||
    file.length === 0 ||
    file.startsWith('/') ||
    /[\t\n\r\\]/.test(file) ||
    file.split('/').some((segment) => segment === '' || segment === '.' || segment === '..');
  if (unsafe) throw new Error(`planUpload: unsafe path ${JSON.stringify(file)}`);
}

function typeOf(file) {
  const name = file.slice(file.lastIndexOf('/') + 1);
  const dot = name.lastIndexOf('.');
  const extension = dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
  const type = Object.hasOwn(TYPES, extension) ? TYPES[extension] : undefined;
  if (!type) {
    throw new Error(`planUpload: unknown extension for ${file}; add it to TYPES in plan.mjs rather than ship a guessed type`);
  }
  return type;
}

/** 'index.html' stays; 'services/devops/index.html' becomes 'services/devops'; anything else keeps its path. */
function pageKey(file) {
  if (file === ROOT_INDEX) return file;
  const suffix = `/${INDEX_FILE}`;
  return file.endsWith(suffix) ? file.slice(0, -suffix.length) : file;
}

function planFile(file) {
  assertSafePath(file);
  const { contentType, kind } = typeOf(file);

  if (file.startsWith(HASHED_DIR)) {
    return { file, key: file, contentType, cacheControl: CACHE_CONTROL.hashed, phase: 'assets' };
  }
  if (kind === 'html') {
    return { file, key: pageKey(file), contentType, cacheControl: CACHE_CONTROL.html, phase: 'html' };
  }
  const cacheControl = kind === 'media' ? CACHE_CONTROL.stableMedia : CACHE_CONTROL.stableText;
  return { file, key: file, contentType, cacheControl, phase: 'assets' };
}

function assertUniqueKeys(plan) {
  const keys = plan.map(({ key }) => key);
  const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
  if (duplicates.length > 0) {
    throw new Error(`planUpload: duplicate key(s) ${[...new Set(duplicates)].join(', ')}`);
  }
}

/**
 * @param {readonly string[]} relativeFilePaths paths inside dist/, '/'-separated
 * @returns {readonly Readonly<{ file: string, key: string, contentType: string, cacheControl: string, phase: 'assets' | 'html' }>[]}
 *   assets first, then pages; each group sorted by key
 */
export function planUpload(relativeFilePaths) {
  if (!Array.isArray(relativeFilePaths)) {
    throw new Error('planUpload: expected an array of paths relative to dist/');
  }
  if (!relativeFilePaths.includes(ROOT_INDEX)) {
    throw new Error('planUpload: the root index.html is missing; it is the default root object and the SPA fallback');
  }

  const plan = relativeFilePaths
    .map(planFile)
    .toSorted((a, b) => PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase] || compareStrings(a.key, b.key));
  assertUniqueKeys(plan);
  return Object.freeze(plan.map((entry) => Object.freeze(entry)));
}

function listFiles(root, dir = root) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const path = join(dir, dirent.name);
    if (dirent.isDirectory()) return listFiles(root, path);
    if (dirent.isFile()) return [relative(root, path).split(sep).join('/')];
    throw new Error(`plan: ${path} is neither a file nor a directory`);
  });
}

function main(args) {
  const keysOnly = args.includes('--keys');
  const positional = args.filter((arg) => arg !== '--keys');
  if (positional.length !== 1) {
    throw new Error('usage: node plan.mjs <distDir> [--keys]');
  }
  const [distDir] = positional;
  if (!statSync(distDir, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`plan: dist directory not found: ${distDir}`);
  }

  const plan = planUpload(listFiles(distDir));
  const lines = keysOnly
    ? plan.map(({ key }) => key).toSorted(compareStrings)
    : plan.map(({ file, key, contentType, cacheControl, phase }) => [file, key, contentType, cacheControl, phase].join('\t'));
  process.stdout.write(`${lines.join('\n')}\n`);
}

/**
 * True when node runs this file as its entry point. Compares real paths:
 * node gives the entry module its real path as import.meta.url but keeps a
 * symlinked argv[1] as typed, so a plain comparison skips main() and prints
 * nothing when the checkout is reached through a symlink.
 */
function isEntryPoint() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    // An argv[1] that does not resolve on disk cannot be this module.
    return false;
  }
}

if (isEntryPoint()) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
