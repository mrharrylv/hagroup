import type { Campaign, Participant, PriceTier } from '../domain/types';

export function makeParticipant(overrides: Partial<Participant> = {}): Participant {
  return {
    id: 'p-1',
    name: 'Jānis',
    type: 'individual',
    units: 1,
    joinedDaysAgo: 3,
    ...overrides,
  };
}

export function makeParticipants(count: number, unitsEach = 1): Participant[] {
  return Array.from({ length: count }, (_, index) =>
    makeParticipant({ id: `p-${index}`, name: `Buyer ${index}`, units: unitsEach }),
  );
}

export const PELLET_TIERS: readonly PriceTier[] = [
  { min: 1, max: 4, pricePerUnit: 390 },
  { min: 5, max: 9, pricePerUnit: 365 },
  { min: 10, max: 19, pricePerUnit: 345 },
  { min: 20, max: null, pricePerUnit: 325 },
];

export const DIESEL_TIERS: readonly PriceTier[] = [
  { min: 0, max: 999, pricePerUnit: 1.58 },
  { min: 1000, max: 4999, pricePerUnit: 1.52 },
  { min: 5000, max: 9999, pricePerUnit: 1.47 },
  { min: 10000, max: null, pricePerUnit: 1.42 },
];

export function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'c-test',
    slug: 'c-test',
    title: { en: 'Test group buy', lv: 'Testa koppirkums' },
    description: { en: 'A test campaign.', lv: 'Testa kampaņa.' },
    category: 'heating-fuel',
    unit: 'pallet',
    audience: 'mixed',
    organizer: { name: 'Ilze', type: 'individual' },
    cityId: 'marupe',
    regionId: 'riga',
    lat: 56.9019,
    lng: 24.05,
    radiusKm: 15,
    targetUnits: 20,
    targetBuyers: 20,
    retailPricePerUnit: 390,
    tierBasis: 'buyers',
    tiers: PELLET_TIERS,
    endsInDays: 9,
    startedDaysAgo: 12,
    participants: makeParticipants(14),
    faq: [],
    keywords: ['pellets', 'granulas'],
    featured: false,
    supplierBids: [],
    ...overrides,
  };
}
