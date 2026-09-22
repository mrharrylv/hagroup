import { describe, expect, it } from 'vitest';
import {
  EMPTY_FILTERS,
  activeFilterCount,
  applyFilters,
  isEmptyFilter,
  matchesAudience,
  matchesFilters,
  matchesSearch,
  normalise,
  searchHighlightIds,
  sortCampaigns,
} from './filters';
import { makeCampaign, makeParticipants } from '../test/fixtures';

const pellets = makeCampaign({
  id: 'pellets',
  title: { en: 'Premium wood pellets', lv: 'Premium koksnes granulas' },
  keywords: ['pellets', 'granulas', 'apkure'],
  category: 'heating-fuel',
  cityId: 'marupe',
  regionId: 'riga',
  audience: 'mixed',
});

const diesel = makeCampaign({
  id: 'diesel',
  slug: 'diesel',
  title: { en: 'Diesel for farms', lv: 'Dīzeļdegviela saimniecībām' },
  description: { en: 'Bulk diesel.', lv: 'Dīzelis vairumā.' },
  keywords: ['diesel', 'dizelis', 'petrol', 'degviela'],
  category: 'vehicle-fuel',
  unit: 'litre',
  cityId: 'jelgava',
  regionId: 'zemgale',
  audience: 'business',
  radiusKm: 50,
  targetUnits: 10_000,
  targetBuyers: 20,
  participants: makeParticipants(4, 950),
  endsInDays: 2,
  startedDaysAgo: 40,
  retailPricePerUnit: 1.58,
  tierBasis: 'units',
  tiers: [
    { min: 0, max: 999, pricePerUnit: 1.58 },
    { min: 1000, max: 4999, pricePerUnit: 1.52 },
    { min: 5000, max: null, pricePerUnit: 1.42 },
  ],
});

const all = [pellets, diesel];

describe('normalise', () => {
  it('folds case, diacritics and runs of whitespace', () => {
    expect(normalise('  Dīzeļdegviela   SAIMNIECĪBĀM ')).toBe('dizeldegviela saimniecibam');
  });
});

describe('matchesSearch', () => {
  it('matches an empty query against everything', () => {
    expect(matchesSearch(pellets, '')).toBe(true);
    expect(matchesSearch(pellets, '   ')).toBe(true);
  });

  it('finds a campaign by an English keyword the title never uses', () => {
    expect(matchesSearch(diesel, 'petrol')).toBe(true);
    expect(matchesSearch(pellets, 'petrol')).toBe(false);
  });

  it('finds the same campaign by its Latvian name, with or without diacritics', () => {
    expect(matchesSearch(diesel, 'dīzeļ')).toBe(true);
    expect(matchesSearch(diesel, 'dizel')).toBe(true);
  });

  it('matches on city and on category label', () => {
    expect(matchesSearch(diesel, 'jelgava')).toBe(true);
    expect(matchesSearch(pellets, 'heating')).toBe(true);
  });
});

describe('searchHighlightIds', () => {
  it('is empty when nothing is typed, so the map dims nothing', () => {
    expect(searchHighlightIds(all, '').size).toBe(0);
  });

  it('returns only the matching campaigns', () => {
    expect([...searchHighlightIds(all, 'petrol')]).toEqual(['diesel']);
  });
});

describe('matchesAudience', () => {
  it('lets a mixed campaign answer to either side', () => {
    expect(matchesAudience('mixed', ['business'])).toBe(true);
    expect(matchesAudience('mixed', ['individual'])).toBe(true);
  });

  it('keeps a business-only campaign out of an individuals filter', () => {
    expect(matchesAudience('business', ['individual'])).toBe(false);
  });

  it('passes everything when no audience is selected', () => {
    expect(matchesAudience('business', [])).toBe(true);
  });
});

describe('matchesFilters', () => {
  it('passes everything through empty filters', () => {
    expect(applyFilters(all, EMPTY_FILTERS)).toHaveLength(2);
  });

  it('narrows by category, region and city', () => {
    expect(applyFilters(all, { ...EMPTY_FILTERS, categories: ['vehicle-fuel'] })).toEqual([diesel]);
    expect(applyFilters(all, { ...EMPTY_FILTERS, regions: ['riga'] })).toEqual([pellets]);
    expect(applyFilters(all, { ...EMPTY_FILTERS, cityId: 'jelgava' })).toEqual([diesel]);
  });

  it('narrows by unit, radius and participant count', () => {
    expect(applyFilters(all, { ...EMPTY_FILTERS, units: ['litre'] })).toEqual([diesel]);
    expect(applyFilters(all, { ...EMPTY_FILTERS, maxRadiusKm: 20 })).toEqual([pellets]);
    expect(applyFilters(all, { ...EMPTY_FILTERS, minParticipants: 10 })).toEqual([pellets]);
  });

  it('narrows by derived status', () => {
    expect(applyFilters(all, { ...EMPTY_FILTERS, statuses: ['closing-soon'] })).toEqual([diesel]);
  });

  it('narrows by the best saving a campaign can reach', () => {
    // Pellets can reach 17% off retail; diesel only 10%.
    expect(applyFilters(all, { ...EMPTY_FILTERS, minSavingPercent: 15 })).toEqual([pellets]);
  });

  it('combines search with the other filters', () => {
    expect(
      matchesFilters(diesel, { ...EMPTY_FILTERS, search: 'petrol', regions: ['riga'] }),
    ).toBe(false);
  });
});

describe('filter bookkeeping', () => {
  it('recognises an untouched filter set', () => {
    expect(isEmptyFilter(EMPTY_FILTERS)).toBe(true);
    expect(isEmptyFilter({ ...EMPTY_FILTERS, search: 'x' })).toBe(false);
  });

  it('counts active groups rather than active values', () => {
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0);
    expect(
      activeFilterCount({
        ...EMPTY_FILTERS,
        categories: ['heating-fuel', 'timber'],
        cityId: 'riga',
      }),
    ).toBe(2);
  });
});

describe('sortCampaigns', () => {
  it('orders by each key without mutating the input', () => {
    const order = all.map((campaign) => campaign.id);

    expect(sortCampaigns(all, 'ending-soon').map((c) => c.id)).toEqual(['diesel', 'pellets']);
    expect(sortCampaigns(all, 'most-joined').map((c) => c.id)).toEqual(['pellets', 'diesel']);
    expect(sortCampaigns(all, 'best-saving').map((c) => c.id)).toEqual(['pellets', 'diesel']);
    expect(sortCampaigns(all, 'newest').map((c) => c.id)).toEqual(['pellets', 'diesel']);
    expect(sortCampaigns(all, 'closest-to-goal')).toHaveLength(2);

    expect(all.map((campaign) => campaign.id)).toEqual(order);
  });
});
