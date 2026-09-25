/**
 * Build step 4 of 4 (see "build" in package.json): turn the client build in
 * dist/ into one static HTML file per page, so every crawler, including the
 * ones that never run JavaScript, gets the page's own content, title,
 * canonical, hreflang and structured data.
 *
 *   dist/index.html                     English home (also the SPA fallback)
 *   dist/<path>/index.html              every other page, e.g. services/devops,
 *                                       lv/index.html, lv/services/devops
 *   dist/404.html                       the not-found page, English, noindex
 *   dist/sitemap.xml, llms.txt, llms-full.txt
 *
 * Each page's <head> also modulepreloads its lazy chunk and the chunks that
 * imports, read from the client build's manifest (dist/.vite/manifest.json,
 * removed at the end): main.tsx waits for that code before it hydrates.
 *
 * All the logic lives in src/ (src/seo/*, tested with vitest) and reaches
 * this script through the SSR bundle in dist-ssr/, which is removed at the end.
 * Any page that throws, renders an empty #root, lacks exactly one <h1>, has
 * the wrong canonical or has a Suspense boundary streamed out of place fails
 * the build with its URL in the message.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SSR_DIR = join(ROOT, 'dist-ssr');
const SSR_ENTRY = join(SSR_DIR, 'entry-server.js');
const MANIFEST_DIR = join(DIST, '.vite');
const MANIFEST_FILE = join(MANIFEST_DIR, 'manifest.json');

async function writeDistFile(relativePath, contents) {
  const target = join(DIST, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents, 'utf8');
}

async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_FILE, 'utf8'));
  } catch (error) {
    throw new Error(`cannot read the client build manifest ${MANIFEST_FILE} (build.manifest in vite.config.ts)`, { cause: error });
  }
}

/** The chunks to modulepreload for a page: its lazy chunk and what that imports. */
function pagePreloads(server, manifest, page) {
  const source = server.pageSourceFor(page.url);
  return source === null ? [] : server.chunkFilesFor(manifest, source);
}

async function renderPage(server, template, manifest, page) {
  let appHtml;
  try {
    appHtml = await server.render(page.url);
  } catch (error) {
    return { errors: [`${page.url}: render threw: ${error instanceof Error ? error.stack ?? error.message : String(error)}`] };
  }
  let preloads;
  try {
    preloads = pagePreloads(server, manifest, page);
  } catch (error) {
    return { errors: [`${page.url}: cannot list its chunks to modulepreload: ${error instanceof Error ? error.message : String(error)}`] };
  }
  const errors = server.validatePage({
    url: page.url,
    appHtml,
    head: page.head,
    expectedCanonical: page.canonical,
    notFound: page.notFound,
  });
  if (errors.length > 0) return { errors };

  const document = server.injectPage(template, { head: page.head, lang: page.lang, url: page.url, appHtml });
  await writeDistFile(page.outputFile, server.withModulePreloads(document, preloads));
  return { errors: [] };
}

async function main() {
  const template = await readFile(join(DIST, 'index.html'), 'utf8');
  const server = await import(pathToFileURL(SSR_ENTRY).href);
  const manifest = await readManifest();
  const pages = server.listPages();

  const failures = [];
  // One page at a time: each render gets its own i18n instance, and the
  // output is deterministic.
  for (const page of pages) {
    const { errors } = await renderPage(server, template, manifest, page);
    failures.push(...errors);
  }

  if (failures.length > 0) {
    console.error(`\nprerender: ${failures.length} problem(s), build failed:\n`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exitCode = 1;
    return;
  }

  await writeDistFile('sitemap.xml', server.sitemapXml());
  await writeDistFile('llms.txt', server.llmsTxt());
  await writeDistFile('llms-full.txt', server.llmsFullTxt());
  console.log(`prerender: wrote ${pages.length} pages, sitemap.xml, llms.txt and llms-full.txt to dist/`);
}

try {
  await main();
} catch (error) {
  console.error('prerender: build failed:', error);
  process.exitCode = 1;
} finally {
  await rm(SSR_DIR, { recursive: true, force: true });
  await rm(MANIFEST_DIR, { recursive: true, force: true });
}
