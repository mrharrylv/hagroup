/**
 * One basemap definition for every map in the app.
 *
 * CARTO's `basemaps.cartocdn.com` endpoints still answer without a key, but
 * they now return a tile stamped "API KEY REQUIRED" to unregistered callers,
 * which looks broken rather than unstyled. OpenStreetMap's standard tiles need
 * no key and no registration, and this is a low-traffic concept demo — well
 * inside the OSM tile usage policy. If the demo ever gets real traffic, this is
 * the single place to swap in a keyed provider.
 */
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const TILE_MAX_ZOOM = 19;
