import { describe, expect, it } from 'vitest';
import {
  activeTier,
  amountToNextTier,
  bestPossiblePrice,
  bestPossibleSavingPercent,
  nextTier,
  pricingSnapshot,
  sortedTiers,
  tierMetric,
} from './pricing';
import { DIESEL_TIERS, PELLET_TIERS, makeCampaign } from '../test/fixtures';

describe('tierMetric', () => {
  it('reads headcount for a buyer-based ladder', () => {
    const campaign = makeCampaign({ tierBasis: 'buyers' });
    expect(tierMetric(campaign, { committedUnits: 4200, buyerCount: 14 })).toBe(14);
  });

  it('reads volume for a unit-based ladder', () => {
    const campaign = makeCampaign({ tierBasis: 'units' });
    expect(tierMetric(campaign, { committedUnits: 4200, buyerCount: 14 })).toBe(4200);
  });
});

describe('activeTier', () => {
  it('picks the rung the quantity falls inside', () => {
    expect(activeTier(PELLET_TIERS, 14).pricePerUnit).toBe(345);
    expect(activeTier(PELLET_TIERS, 5).pricePerUnit).toBe(365);
    expect(activeTier(PELLET_TIERS, 19).pricePerUnit).toBe(345);
  });

  it('applies the open-ended top rung above its floor', () => {
    expect(activeTier(PELLET_TIERS, 20).pricePerUnit).toBe(325);
    expect(activeTier(PELLET_TIERS, 500).pricePerUnit).toBe(325);
  });

  it('falls back to the first rung below the ladder, rather than failing', () => {
    expect(activeTier(PELLET_TIERS, 0).pricePerUnit).toBe(390);
  });

  it('tolerates tiers declared out of order', () => {
    const shuffled = [...PELLET_TIERS].reverse();
    expect(activeTier(shuffled, 14).pricePerUnit).toBe(345);
  });

  it('refuses a campaign with no tiers at all', () => {
    expect(() => activeTier([], 5)).toThrow(/at least one price tier/);
  });
});

describe('nextTier and amountToNextTier', () => {
  it('names the next rung up and what it costs to get there', () => {
    expect(nextTier(PELLET_TIERS, 14)?.pricePerUnit).toBe(325);
    expect(amountToNextTier(PELLET_TIERS, 14)).toBe(6);
  });

  it('reports the litres still needed on a volume ladder', () => {
    expect(amountToNextTier(DIESEL_TIERS, 3800)).toBe(1200);
  });

  it('returns null once the best rung is reached', () => {
    expect(nextTier(PELLET_TIERS, 20)).toBeNull();
    expect(amountToNextTier(PELLET_TIERS, 25)).toBeNull();
  });
});

describe('pricingSnapshot', () => {
  it('describes the pellet campaign from the brief', () => {
    const campaign = makeCampaign();
    const snapshot = pricingSnapshot(campaign, { committedUnits: 14, buyerCount: 14 });

    expect(snapshot.metric).toBe(14);
    expect(snapshot.current.pricePerUnit).toBe(345);
    expect(snapshot.next?.pricePerUnit).toBe(325);
    expect(snapshot.toNext).toBe(6);
    expect(snapshot.savingPerUnit).toBe(45);
    expect(snapshot.savingPercent).toBe(12);
    expect(snapshot.totalSaving).toBe(630);
    expect(snapshot.nextSavingPerUnit).toBe(65);
  });

  it('keeps fractional fuel prices to the cent', () => {
    const campaign = makeCampaign({
      tierBasis: 'units',
      tiers: DIESEL_TIERS,
      retailPricePerUnit: 1.58,
      unit: 'litre',
    });
    const snapshot = pricingSnapshot(campaign, { committedUnits: 3800, buyerCount: 9 });

    expect(snapshot.current.pricePerUnit).toBe(1.52);
    expect(snapshot.savingPerUnit).toBe(0.06);
    expect(snapshot.totalSaving).toBe(228);
  });

  it('does not divide by zero when retail is unknown', () => {
    const campaign = makeCampaign({ retailPricePerUnit: 0 });
    expect(pricingSnapshot(campaign, { committedUnits: 4, buyerCount: 4 }).savingPercent).toBe(0);
  });
});

describe('best possible price', () => {
  it('finds the cheapest rung regardless of declaration order', () => {
    expect(bestPossiblePrice([...PELLET_TIERS].reverse())).toBe(325);
  });

  it('expresses the headline saving as a percentage of retail', () => {
    expect(bestPossibleSavingPercent(makeCampaign())).toBe(17);
  });
});

describe('sortedTiers', () => {
  it('returns a new array and leaves the input untouched', () => {
    const input = [...PELLET_TIERS].reverse();
    const snapshot = [...input];
    sortedTiers(input);
    expect(input).toEqual(snapshot);
  });
});
