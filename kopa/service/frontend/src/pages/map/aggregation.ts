/** Below this zoom the map aggregates into one bubble per region. */
export const AGGREGATE_BELOW_ZOOM = 8;

/**
 * A search is a question about *where*, and a region bubble cannot answer it.
 * So a non-empty query drops the map straight to individual pins across the
 * whole country, however far out it is zoomed, with the misses dimmed.
 */
export function shouldAggregate(zoom: number, searchActive: boolean): boolean {
  return zoom < AGGREGATE_BELOW_ZOOM && !searchActive;
}

/** The map never zooms past this; the tile provider has more, the UI does not. */
export const MAX_ZOOM = 14;
export const MIN_ZOOM = 6;

/**
 * Did an initial fit actually work?
 *
 * `fitBounds` asks Leaflet what zoom the bounds need, and Leaflet answers from
 * the container size it last measured. Measure a container that is not laid out
 * yet and the answer is "the whole country fits in zero pixels", which clamps
 * to maxZoom: the centre is right, the zoom is absurd, and every pin is
 * thousands of pixels off-screen. That is what a cold load over a CDN produced.
 *
 * A country-sized fit that lands on maxZoom is therefore never a real fit, and
 * the framing has to be retried once the container reports a size it means.
 */
export function fitLooksMeasured(zoomAfterFit: number): boolean {
  return zoomAfterFit < MAX_ZOOM;
}
