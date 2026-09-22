import { point, type Point } from 'leaflet';
import type { FitBoundsOptions, LatLngBoundsLiteral, LatLngTuple } from 'leaflet';

/**
 * The shape the data files use: a readonly pair of readonly [lat, lng] pairs.
 * Leaflet wants a mutable tuple, so every bounds value crossing into the map
 * goes through {@link toBoundsLiteral} rather than a cast at the call site.
 */
export type ReadonlyBounds = readonly [readonly [number, number], readonly [number, number]];

export function toBoundsLiteral(bounds: ReadonlyBounds): LatLngBoundsLiteral {
  const [south, north] = bounds;
  return [
    [south[0], south[1]] as LatLngTuple,
    [north[0], north[1]] as LatLngTuple,
  ];
}

/**
 * Every fit and fly-to leaves room at the top for the floating bar and the
 * category chips, and a little at the bottom for the region bar. Symmetric
 * padding would cost a whole zoom level on a country this wide.
 */
export const FIT_OPTIONS: FitBoundsOptions = {
  paddingTopLeft: [16, 72],
  paddingBottomRight: [16, 24],
};

/**
 * The same padding as one total, because `getBoundsZoom` takes a single Point
 * rather than the two corners {@link FIT_OPTIONS} uses. Used to ask what zoom a
 * fit *would* land on before committing to it.
 */
export const FIT_PADDING: Point = point(32, 96);
