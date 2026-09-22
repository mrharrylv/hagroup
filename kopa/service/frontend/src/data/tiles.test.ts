import { describe, expect, it } from 'vitest';
import { TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL } from './tiles';

/**
 * Four separate maps render in this app. They drifted onto CARTO's keyless
 * endpoint once, which quietly serves a tile stamped "API KEY REQUIRED" — the
 * map still loads, so nothing fails, it just looks broken. These tests keep the
 * basemap in one place and keep that provider out.
 *
 * The sources are read through Vite's own glob import rather than node:fs, so
 * the suite needs no Node typings and runs in the same jsdom environment as
 * everything else.
 */
const MODULES = import.meta.glob('../**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const FILES: Array<readonly [string, string]> = Object.entries(MODULES)
  .filter(([path]) => !/\.test\.tsx?$/.test(path))
  .map(([path, source]) => [path.replace(/^\.{1,2}\//, ''), source] as const)
  .sort(([a], [b]) => a.localeCompare(b));

describe('the basemap', () => {
  it('needs no API key', () => {
    expect(TILE_URL).toContain('tile.openstreetmap.org');
    expect(TILE_URL).not.toContain('key=');
    expect(TILE_URL).not.toContain('{s}');
  });

  it('credits OpenStreetMap, which its licence requires', () => {
    expect(TILE_ATTRIBUTION).toContain('OpenStreetMap');
    expect(TILE_ATTRIBUTION).toContain('openstreetmap.org/copyright');
  });

  it('caps zoom where the provider actually has tiles', () => {
    expect(TILE_MAX_ZOOM).toBeGreaterThan(14);
    expect(TILE_MAX_ZOOM).toBeLessThanOrEqual(19);
  });
});

describe('every map in the app', () => {
  const withTileLayer = FILES.filter(([, source]) => source.includes('<TileLayer'));

  it('is accounted for — four of them', () => {
    expect(withTileLayer.map(([path]) => path).sort()).toEqual([
      'pages/MapPage.tsx',
      'pages/create/PinMap.tsx',
      'pages/detail/MiniMap.tsx',
      'pages/home/MapPreview.tsx',
    ]);
  });

  it.each(withTileLayer)('uses the shared basemap constants — %s', (_path, source) => {
    expect(source).toContain('data/tiles');
    expect(source).toMatch(/<TileLayer\s+url=\{TILE_URL\}\s+attribution=\{TILE_ATTRIBUTION\}/);
  });

  // tiles.ts is the one place allowed to name a provider, in the URL and in
  // the comment explaining why it is not CARTO.
  const OTHERS = FILES.filter(([path]) => !path.endsWith('tiles.ts'));

  it.each(OTHERS)('never hardcodes a tile provider — %s', (_path, source) => {
    expect(source).not.toContain('cartocdn');
    expect(source).not.toContain('basemaps.carto');
    expect(source).not.toMatch(/https:\/\/[^'"]*\{z\}\/\{x\}\/\{y\}/);
  });
});
