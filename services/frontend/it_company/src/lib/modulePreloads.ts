/**
 * <link rel="modulepreload"> for a prerendered page's own code. main.tsx
 * waits for the page's lazy chunk before it hydrates; the links start that
 * download while the HTML is still parsing, next to the entry's, instead of
 * after the entry has run. Build time only (scripts/prerender.mjs).
 */

/** One entry of Vite's build manifest (dist/.vite/manifest.json). */
export interface ManifestChunk {
  file: string;
  isEntry?: boolean;
  isDynamicEntry?: boolean;
  /** Manifest keys of the chunks this one imports statically. */
  imports?: string[];
  /** Manifest keys of the chunks this one imports on demand. */
  dynamicImports?: string[];
}

/** Vite's build manifest, keyed by source path ('src/pages/CareersPage.tsx') or chunk name. */
export type BuildManifest = Record<string, ManifestChunk>;

/**
 * The files a module needs before it can run: its own chunk, then every chunk
 * it imports statically, depth first, each once. On-demand imports are left
 * out. Throws for a module the client build does not have.
 */
export function chunkFilesFor(manifest: BuildManifest, source: string): string[] {
  const files: string[] = [];
  const seen = new Set<string>();
  const visit = (key: string): void => {
    if (seen.has(key)) return;
    seen.add(key);
    const chunk = manifest[key];
    if (!chunk) throw new Error(`the build manifest has no chunk for ${key}`);
    files.push(chunk.file);
    for (const imported of chunk.imports ?? []) visit(imported);
  };
  visit(source);
  return files;
}

/** Chunk file names Vite writes: assets/Name-hash.js. Nothing to escape in them. */
const SAFE_FILE = /^[\w./-]+$/;

const MODULEPRELOAD = /^([ \t]*)<link rel="modulepreload"[^>]*>[ \t]*$/gm;

/** The URLs the page already loads from its <head>: script src and link href. */
function loadedUrls(head: string): Set<string> {
  return new Set([...head.matchAll(/<(?:script|link)\b[^>]*\s(?:src|href)="([^"]+)"/g)].map((match) => match[1]));
}

/**
 * The page's HTML with a modulepreload link for each file it does not load
 * yet, after the ones Vite wrote (or before </head> when there are none).
 */
export function withModulePreloads(html: string, files: readonly string[]): string {
  const headEnd = html.indexOf('</head>');
  if (headEnd < 0) throw new Error('the page has no </head> to put modulepreload links in');
  const head = html.slice(0, headEnd);
  const loaded = loadedUrls(head);

  const urls: string[] = [];
  for (const file of files) {
    if (!SAFE_FILE.test(file)) throw new Error(`refusing to modulepreload an unexpected file name: ${file}`);
    const url = `/${file}`;
    if (!loaded.has(url) && !urls.includes(url)) urls.push(url);
  }
  if (urls.length === 0) return html;

  const existing = [...head.matchAll(MODULEPRELOAD)];
  const last = existing[existing.length - 1];
  const indent = last?.[1] ?? '';
  const links = urls.map((url) => `${indent}<link rel="modulepreload" crossorigin href="${url}">`).join('\n');
  if (last?.index === undefined) return `${html.slice(0, headEnd)}${links}\n${html.slice(headEnd)}`;
  const after = last.index + last[0].length;
  return `${html.slice(0, after)}\n${links}${html.slice(after)}`;
}
