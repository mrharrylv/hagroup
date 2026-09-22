import type { Region } from '../domain/types';

/** The five planning regions the demo groups campaigns by. */
export const REGIONS: readonly Region[] = [
  {
    id: 'riga',
    name: { en: 'Rīga & Pierīga', lv: 'Rīga un Pierīga' },
    lat: 56.95,
    lng: 24.15,
    bounds: [
      [56.62, 23.4],
      [57.32, 25.05],
    ],
  },
  {
    id: 'kurzeme',
    name: { en: 'Kurzeme', lv: 'Kurzeme' },
    lat: 56.95,
    lng: 21.9,
    bounds: [
      [55.95, 20.85],
      [57.78, 23.25],
    ],
  },
  {
    id: 'zemgale',
    name: { en: 'Zemgale', lv: 'Zemgale' },
    lat: 56.55,
    lng: 23.9,
    bounds: [
      [56.15, 22.4],
      [56.95, 26.1],
    ],
  },
  {
    id: 'vidzeme',
    name: { en: 'Vidzeme', lv: 'Vidzeme' },
    lat: 57.35,
    lng: 25.7,
    bounds: [
      [56.6, 24.3],
      [58.1, 27.2],
    ],
  },
  {
    id: 'latgale',
    name: { en: 'Latgale', lv: 'Latgale' },
    lat: 56.3,
    lng: 27.1,
    bounds: [
      [55.62, 25.85],
      [56.95, 28.3],
    ],
  },
] as const;

/** Whole-country view used as the map's home position. */
export const LATVIA_BOUNDS: readonly [readonly [number, number], readonly [number, number]] = [
  [55.62, 20.85],
  [58.1, 28.3],
];

export const LATVIA_CENTRE = { lat: 56.88, lng: 24.6 } as const;

export function regionById(id: string): Region | undefined {
  return REGIONS.find((region) => region.id === id);
}
