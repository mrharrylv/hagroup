import type { City } from '../domain/types';

/** Cities and towns used for pins, filters and the region drill-down. */
export const CITIES: readonly City[] = [
  { id: 'riga', name: 'Rīga', regionId: 'riga', lat: 56.9496, lng: 24.1052, population: 605_000 },
  { id: 'daugavpils', name: 'Daugavpils', regionId: 'latgale', lat: 55.8714, lng: 26.5161, population: 82_000 },
  { id: 'liepaja', name: 'Liepāja', regionId: 'kurzeme', lat: 56.5047, lng: 21.0108, population: 68_000 },
  { id: 'jelgava', name: 'Jelgava', regionId: 'zemgale', lat: 56.6511, lng: 23.7214, population: 55_000 },
  { id: 'jurmala', name: 'Jūrmala', regionId: 'riga', lat: 56.968, lng: 23.7703, population: 49_000 },
  { id: 'ventspils', name: 'Ventspils', regionId: 'kurzeme', lat: 57.3894, lng: 21.5606, population: 33_000 },
  { id: 'rezekne', name: 'Rēzekne', regionId: 'latgale', lat: 56.51, lng: 27.3313, population: 27_000 },
  { id: 'valmiera', name: 'Valmiera', regionId: 'vidzeme', lat: 57.5411, lng: 25.4275, population: 23_000 },
  { id: 'ogre', name: 'Ogre', regionId: 'riga', lat: 56.8156, lng: 24.6047, population: 23_000 },
  { id: 'jekabpils', name: 'Jēkabpils', regionId: 'zemgale', lat: 56.4989, lng: 25.8578, population: 22_000 },
  { id: 'marupe', name: 'Mārupe', regionId: 'riga', lat: 56.9019, lng: 24.05, population: 22_000 },
  { id: 'tukums', name: 'Tukums', regionId: 'zemgale', lat: 56.9675, lng: 23.1547, population: 17_000 },
  { id: 'salaspils', name: 'Salaspils', regionId: 'riga', lat: 56.8608, lng: 24.3597, population: 16_000 },
  { id: 'cesis', name: 'Cēsis', regionId: 'vidzeme', lat: 57.3119, lng: 25.2749, population: 15_000 },
  { id: 'olaine', name: 'Olaine', regionId: 'riga', lat: 56.7936, lng: 23.9375, population: 11_000 },
  { id: 'kuldiga', name: 'Kuldīga', regionId: 'kurzeme', lat: 56.9677, lng: 21.9614, population: 11_000 },
  { id: 'sigulda', name: 'Sigulda', regionId: 'riga', lat: 57.1539, lng: 24.8598, population: 11_000 },
  { id: 'saldus', name: 'Saldus', regionId: 'kurzeme', lat: 56.6642, lng: 22.49, population: 10_000 },
  { id: 'talsi', name: 'Talsi', regionId: 'kurzeme', lat: 57.2447, lng: 22.5869, population: 9_000 },
  { id: 'dobele', name: 'Dobele', regionId: 'zemgale', lat: 56.6244, lng: 23.28, population: 9_000 },
  { id: 'bauska', name: 'Bauska', regionId: 'zemgale', lat: 56.4075, lng: 24.1917, population: 8_000 },
  { id: 'limbazi', name: 'Limbaži', regionId: 'vidzeme', lat: 57.5136, lng: 24.7156, population: 7_000 },
  { id: 'gulbene', name: 'Gulbene', regionId: 'vidzeme', lat: 57.1775, lng: 26.7561, population: 7_000 },
  { id: 'madona', name: 'Madona', regionId: 'vidzeme', lat: 56.8517, lng: 26.2172, population: 7_000 },
  { id: 'aluksne', name: 'Alūksne', regionId: 'vidzeme', lat: 57.4211, lng: 27.0483, population: 7_000 },
  { id: 'ludza', name: 'Ludza', regionId: 'latgale', lat: 56.545, lng: 27.7192, population: 7_000 },
  { id: 'kraslava', name: 'Krāslava', regionId: 'latgale', lat: 55.8953, lng: 27.1683, population: 7_000 },
  { id: 'aizkraukle', name: 'Aizkraukle', regionId: 'zemgale', lat: 56.6047, lng: 25.2533, population: 7_000 },
  { id: 'adazi', name: 'Ādaži', regionId: 'riga', lat: 57.0728, lng: 24.3236, population: 6_000 },
  { id: 'kekava', name: 'Ķekava', regionId: 'riga', lat: 56.8283, lng: 24.2333, population: 6_000 },
  { id: 'preili', name: 'Preiļi', regionId: 'latgale', lat: 56.2936, lng: 26.725, population: 6_000 },
  { id: 'balvi', name: 'Balvi', regionId: 'latgale', lat: 57.1311, lng: 27.265, population: 6_000 },
  { id: 'smiltene', name: 'Smiltene', regionId: 'vidzeme', lat: 57.4256, lng: 25.9003, population: 5_000 },
  { id: 'saulkrasti', name: 'Saulkrasti', regionId: 'riga', lat: 57.2611, lng: 24.4158, population: 5_000 },
  { id: 'grobina', name: 'Grobiņa', regionId: 'kurzeme', lat: 56.5378, lng: 21.1656, population: 4_000 },
] as const;

export function cityById(id: string): City | undefined {
  return CITIES.find((city) => city.id === id);
}

export function citiesInRegion(regionId: string): City[] {
  return CITIES.filter((city) => city.regionId === regionId);
}
