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
