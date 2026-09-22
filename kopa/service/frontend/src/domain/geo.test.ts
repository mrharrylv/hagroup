import { describe, expect, it } from 'vitest';
import { distanceKm, isWithinRadius, nearest } from './geo';

const RIGA = { lat: 56.9496, lng: 24.1052 };
const JELGAVA = { lat: 56.6511, lng: 23.7214 };
const DAUGAVPILS = { lat: 55.8714, lng: 26.5161 };

describe('distanceKm', () => {
  it('measures a known Latvian hop', () => {
    // Rīga to Jelgava is about 39 km as the crow flies.
    expect(distanceKm(RIGA, JELGAVA)).toBeGreaterThan(35);
    expect(distanceKm(RIGA, JELGAVA)).toBeLessThan(43);
  });

  it('is zero for the same point and symmetric between two', () => {
    expect(distanceKm(RIGA, RIGA)).toBe(0);
    expect(distanceKm(RIGA, DAUGAVPILS)).toBeCloseTo(distanceKm(DAUGAVPILS, RIGA), 6);
  });
});

describe('isWithinRadius', () => {
  it('includes a point inside the catchment and excludes one outside', () => {
    expect(isWithinRadius({ ...RIGA, radiusKm: 50 }, JELGAVA)).toBe(true);
    expect(isWithinRadius({ ...RIGA, radiusKm: 20 }, JELGAVA)).toBe(false);
  });
});

describe('nearest', () => {
  const items = [
    { id: 'a', ...RIGA },
    { id: 'b', ...JELGAVA },
    { id: 'c', ...DAUGAVPILS },
  ];

  it('orders by distance and attaches it', () => {
    const result = nearest(items, RIGA, { excludeId: 'a' });
    expect(result.map((item) => item.id)).toEqual(['b', 'c']);
    expect(result[0].distanceKm).toBeLessThan(result[1].distanceKm);
  });

  it('honours the exclusion, the limit and the maximum range', () => {
    expect(nearest(items, RIGA, { excludeId: 'a', limit: 1 })).toHaveLength(1);
    expect(nearest(items, RIGA, { excludeId: 'a', maxKm: 50 }).map((i) => i.id)).toEqual(['b']);
  });

  it('returns an empty list rather than throwing when nothing is in range', () => {
    expect(nearest(items, RIGA, { excludeId: 'a', maxKm: 1 })).toEqual([]);
  });

  it('does not reorder the caller’s array', () => {
    const order = items.map((item) => item.id);
    nearest(items, DAUGAVPILS);
    expect(items.map((item) => item.id)).toEqual(order);
  });
});
