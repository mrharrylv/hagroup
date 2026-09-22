/** Great-circle distance in kilometres between two WGS84 points. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const EARTH_RADIUS_KM = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function isWithinRadius(
  centre: { lat: number; lng: number; radiusKm: number },
  point: { lat: number; lng: number },
): boolean {
  return distanceKm(centre, point) <= centre.radiusKm;
}

/** Campaigns near a point, nearest first, excluding the campaign itself. */
export function nearest<T extends { id: string; lat: number; lng: number }>(
  items: readonly T[],
  point: { lat: number; lng: number },
  options: { excludeId?: string; limit?: number; maxKm?: number } = {},
): Array<T & { distanceKm: number }> {
  const { excludeId, limit = 4, maxKm = Number.POSITIVE_INFINITY } = options;

  return items
    .filter((item) => item.id !== excludeId)
    .map((item) => ({ ...item, distanceKm: distanceKm(point, item) }))
    .filter((item) => item.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
