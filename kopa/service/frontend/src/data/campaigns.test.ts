import { describe, expect, it } from 'vitest';
import { SEED_CAMPAIGNS } from './campaigns';
import { CITIES, cityById } from './cities';
import { REGIONS } from './regions';
import { CATEGORIES, UNITS, categoryById, unitById } from './taxonomy';
import { sortedTiers } from '../domain/pricing';
import { headlineProgress, statusOf, totalsFor } from '../domain/status';
import type { Campaign } from '../domain/types';

/**
 * The demo dataset is hand-written and long, which is exactly the kind of file
 * where a pin drifts into the sea or a tier ladder stops descending without
 * anyone noticing. These are the invariants the UI silently assumes.
 */

const MIN_CAMPAIGNS = 30;
const ALLOWED_RADII = [5, 10, 15, 20, 30, 50, 75];
const LATVIA = { minLat: 55.6, maxLat: 58.15, minLng: 20.85, maxLng: 28.35 };

const describeCampaign = (campaign: Campaign) => `${campaign.id} (${campaign.title.en})`;

describe('the seed dataset', () => {
  it(`has at least ${MIN_CAMPAIGNS} campaigns so the map looks alive`, () => {
    expect(SEED_CAMPAIGNS.length).toBeGreaterThanOrEqual(MIN_CAMPAIGNS);
  });

  it('has unique ids and unique slugs', () => {
    const ids = SEED_CAMPAIGNS.map((campaign) => campaign.id);
    const slugs = SEED_CAMPAIGNS.map((campaign) => campaign.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('covers every category and every region', () => {
    const categories = new Set(SEED_CAMPAIGNS.map((campaign) => campaign.category));
    const regions = new Set(SEED_CAMPAIGNS.map((campaign) => campaign.regionId));
    expect([...categories].sort()).toEqual(CATEGORIES.map((c) => c.id).sort());
    expect([...regions].sort()).toEqual(REGIONS.map((r) => r.id).sort());
  });

  it('spreads across at least 20 different towns', () => {
    const cities = new Set(SEED_CAMPAIGNS.map((campaign) => campaign.cityId));
    expect(cities.size).toBeGreaterThanOrEqual(20);
  });

  it('features a handful of campaigns on the home page', () => {
    expect(SEED_CAMPAIGNS.filter((campaign) => campaign.featured).length).toBeGreaterThanOrEqual(4);
  });
});

describe('every campaign', () => {
  it.each(SEED_CAMPAIGNS.map((campaign) => [describeCampaign(campaign), campaign] as const))(
    'resolves its city, region, category and unit — %s',
    (_label, campaign) => {
      const city = cityById(campaign.cityId);
      expect(city, `unknown cityId ${campaign.cityId}`).toBeDefined();
      expect(campaign.regionId, 'region disagrees with the city').toBe(city?.regionId);
      expect(categoryById(campaign.category)).toBeDefined();
      expect(unitById(campaign.unit)).toBeDefined();
    },
  );

  it.each(SEED_CAMPAIGNS.map((campaign) => [describeCampaign(campaign), campaign] as const))(
    'pins near its own town, inside Latvia — %s',
    (_label, campaign) => {
      const city = cityById(campaign.cityId);
      expect(campaign.lat).toBeGreaterThan(LATVIA.minLat);
      expect(campaign.lat).toBeLessThan(LATVIA.maxLat);
      expect(campaign.lng).toBeGreaterThan(LATVIA.minLng);
      expect(campaign.lng).toBeLessThan(LATVIA.maxLng);
      expect(Math.abs(campaign.lat - (city?.lat ?? 0))).toBeLessThan(0.3);
      expect(Math.abs(campaign.lng - (city?.lng ?? 0))).toBeLessThan(0.3);
    },
  );

  it.each(SEED_CAMPAIGNS.map((campaign) => [describeCampaign(campaign), campaign] as const))(
    'has a descending, contiguous tier ladder — %s',
    (_label, campaign) => {
      const tiers = sortedTiers(campaign.tiers);
      expect(tiers.length, 'a discount needs at least three rungs to read as a ladder').toBeGreaterThanOrEqual(3);
      expect(tiers[0].pricePerUnit).toBeLessThanOrEqual(campaign.retailPricePerUnit);
      expect(tiers.at(-1)?.max, 'the top rung must be open-ended').toBeNull();

      tiers.forEach((tier, index) => {
        if (index === 0) return;
        const previous = tiers[index - 1];
        expect(tier.min, 'tier floors must ascend').toBeGreaterThan(previous.min);
        expect(tier.pricePerUnit, 'each rung must be cheaper than the one below').toBeLessThan(
          previous.pricePerUnit,
        );
        expect(previous.max, 'tiers must be contiguous, with no gap or overlap').toBe(tier.min - 1);
      });
    },
  );

  it.each(SEED_CAMPAIGNS.map((campaign) => [describeCampaign(campaign), campaign] as const))(
    'has sane targets, dates and participants — %s',
    (_label, campaign) => {
      expect(campaign.targetUnits).toBeGreaterThan(0);
      expect(campaign.targetBuyers).toBeGreaterThan(0);
      expect(campaign.retailPricePerUnit).toBeGreaterThan(0);
      expect(ALLOWED_RADII).toContain(campaign.radiusKm);
      expect(campaign.endsInDays).toBeGreaterThanOrEqual(-10);
      expect(campaign.endsInDays).toBeLessThanOrEqual(120);
      expect(campaign.startedDaysAgo).toBeGreaterThanOrEqual(0);
      expect(campaign.participants.length).toBeGreaterThan(0);

      for (const participant of campaign.participants) {
        expect(participant.units, 'a commitment of zero is not a commitment').toBeGreaterThan(0);
        expect(participant.name.trim()).not.toBe('');
        expect(participant.joinedDaysAgo).toBeGreaterThanOrEqual(0);
        if (participant.type === 'individual') expect(participant.org).toBeUndefined();
      }
    },
  );

  it.each(SEED_CAMPAIGNS.map((campaign) => [describeCampaign(campaign), campaign] as const))(
    'is genuinely bilingual and findable by search — %s',
    (_label, campaign) => {
      expect(campaign.title.en.trim()).not.toBe('');
      expect(campaign.title.lv.trim()).not.toBe('');
      expect(campaign.description.en.trim()).not.toBe('');
      expect(campaign.description.lv.trim()).not.toBe('');
      expect(
        campaign.description.lv,
        'the Latvian description is the English one copied across',
      ).not.toBe(campaign.description.en);
      expect(campaign.keywords.length, 'search needs synonyms in both languages').toBeGreaterThanOrEqual(6);
      expect(campaign.keywords.every((word) => word === word.toLowerCase())).toBe(true);
    },
  );
});

describe('the badge spread', () => {
  const statuses = SEED_CAMPAIGNS.map((campaign) =>
    statusOf(campaign, totalsFor(campaign, campaign.participants)),
  );

  it.each(['new', 'almost-full', 'closing-soon', 'funded', 'closed'] as const)(
    'includes at least one %s campaign, so the badge is reachable in the demo',
    (status) => {
      expect(statuses.filter((value) => value === status).length).toBeGreaterThan(0);
    },
  );

  it('spans a real range of progress rather than clustering', () => {
    const progress = SEED_CAMPAIGNS.map((campaign) =>
      headlineProgress(totalsFor(campaign, campaign.participants)),
    );
    expect(Math.min(...progress)).toBeLessThan(0.35);
    expect(Math.max(...progress)).toBeGreaterThanOrEqual(1);
  });
});

describe('the ladders quoted in the brief', () => {
  const find = (predicate: (campaign: Campaign) => boolean) => {
    const match = SEED_CAMPAIGNS.find(predicate);
    expect(match).toBeDefined();
    return match as Campaign;
  };

  it('prices wood pellets in Mārupe by headcount', () => {
    const pellets = find((c) => c.cityId === 'marupe' && c.category === 'heating-fuel');
    expect(pellets.tierBasis).toBe('buyers');
    expect(pellets.retailPricePerUnit).toBe(390);
    expect(pellets.unit).toBe('pallet');
    expect(sortedTiers(pellets.tiers).map((tier) => tier.pricePerUnit)).toEqual([
      390, 365, 345, 325,
    ]);
    expect(pellets.targetBuyers).toBe(20);
    expect(pellets.participants).toHaveLength(14);
    expect(totalsFor(pellets, pellets.participants).committedUnits).toBe(14);
  });

  it('prices farm diesel by volume', () => {
    const diesel = find((c) => c.category === 'vehicle-fuel' && c.retailPricePerUnit === 1.58);
    expect(diesel.tierBasis).toBe('units');
    expect(diesel.unit).toBe('litre');
    expect(sortedTiers(diesel.tiers).map((tier) => tier.min)).toEqual([0, 1000, 5000, 10000]);
    expect(sortedTiers(diesel.tiers).map((tier) => tier.pricePerUnit)).toEqual([
      1.58, 1.52, 1.47, 1.42,
    ]);
  });

  it('prices NPK fertiliser by tonnage', () => {
    const npk = find((c) => c.category === 'agri-inputs' && c.retailPricePerUnit === 530);
    expect(sortedTiers(npk.tiers).map((tier) => tier.pricePerUnit)).toEqual([530, 495, 470, 445]);
  });

  it('prices timber by cubic metre', () => {
    const timber = find((c) => c.category === 'timber' && c.retailPricePerUnit === 245);
    expect(sortedTiers(timber.tiers).map((tier) => tier.pricePerUnit)).toEqual([245, 225, 210, 195]);
  });

  it('prices restaurant olive oil by carton', () => {
    const oil = find((c) => c.category === 'restaurant-supplies' && c.retailPricePerUnit === 62);
    expect(sortedTiers(oil.tiers).map((tier) => tier.pricePerUnit)).toEqual([62, 57, 53]);
  });
});

describe('supplier bids', () => {
  it('quote a price in the same ballpark as the campaign itself', () => {
    for (const campaign of SEED_CAMPAIGNS) {
      for (const bid of campaign.supplierBids) {
        expect(bid.supplier.trim()).not.toBe('');
        expect(bid.pricePerUnit).toBeGreaterThan(0);
        expect(bid.pricePerUnit).toBeLessThanOrEqual(campaign.retailPricePerUnit * 1.1);
        expect(bid.leadTimeDays).toBeGreaterThan(0);
        expect(bid.note.lv.trim()).not.toBe('');
      }
    }
  });
});

describe('reference data', () => {
  it('gives every city a region that exists', () => {
    const regionIds = new Set(REGIONS.map((region) => region.id));
    for (const city of CITIES) expect(regionIds.has(city.regionId)).toBe(true);
  });

  it('keeps taxonomy ids unique', () => {
    expect(new Set(CATEGORIES.map((c) => c.id)).size).toBe(CATEGORIES.length);
    expect(new Set(UNITS.map((u) => u.id)).size).toBe(UNITS.length);
  });
});
