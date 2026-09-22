import { describe, expect, it } from 'vitest';
import { SEED_CAMPAIGNS } from '../../data/campaigns';
import { bestPossiblePrice, pricingSnapshot } from '../../domain/pricing';
import { totalsFor } from '../../domain/status';
import type { Campaign } from '../../domain/types';
import { DIESEL_TIERS, makeCampaign, makeParticipants } from '../../test/fixtures';
import {
  CLOSING_SOON_WITHIN_DAYS,
  categoryRollup,
  closingSoon,
  factsFor,
  factsForAll,
  groupOf,
  regionRollup,
  statusRollup,
  summarise,
  unitTotalsOf,
  yourUnits,
  type Facts,
  type Localise,
} from './metrics';

/**
 * The dashboard is the one page whose whole job is numbers, and an investor
 * reading it cannot check them. These pin the arithmetic: what "committed
 * value" is priced at, what the rollups are allowed to add together, and which
 * campaigns count as still needing help.
 */

const en: Localise = (value) => value.en;

const SEED_FACTS = factsForAll(SEED_CAMPAIGNS);

/** A campaign sitting in the middle of its ladder: not retail, not the best tier. */
function midLadderCampaign(): Campaign {
  // 6 buyers × 2 units. tierBasis 'buyers', so the metric is 6 → the 5–9 rung.
  return makeCampaign({ participants: makeParticipants(6, 2) });
}

describe('committed value', () => {
  it('prices the committed volume at the tier unlocked so far', () => {
    const facts = factsFor(midLadderCampaign());

    expect(facts?.totals.committedUnits).toBe(12);
    expect(facts?.pricing.current.pricePerUnit).toBe(365);
    expect(facts?.value).toBe(12 * 365);
  });

  it('is neither the retail bill nor the best price the ladder could reach', () => {
    const campaign = midLadderCampaign();
    const value = summarise(factsForAll([campaign])).totalValue;

    expect(value).not.toBe(12 * campaign.retailPricePerUnit);
    expect(value).not.toBe(12 * bestPossiblePrice(campaign.tiers));
    expect(value).toBeLessThan(12 * campaign.retailPricePerUnit);
    expect(value).toBeGreaterThan(12 * bestPossiblePrice(campaign.tiers));
  });
});

describe('total savings', () => {
  it('is the sum of every campaign snapshot saving, over the real seed data', () => {
    const expected = SEED_CAMPAIGNS.filter((campaign) => campaign.tiers.length > 0).reduce(
      (sum, campaign) =>
        sum + pricingSnapshot(campaign, totalsFor(campaign, campaign.participants)).totalSaving,
      0,
    );

    expect(expected).toBeGreaterThan(0);
    expect(summarise(SEED_FACTS).totalSaving).toBeCloseTo(expected, 6);
  });
});

describe('average progress', () => {
  it('is the mean of each campaign progress, not a ratio of the totals', () => {
    const facts = factsForAll([
      makeCampaign({ id: 'a', participants: makeParticipants(10) }),
      makeCampaign({ id: 'b', participants: makeParticipants(5) }),
    ]);

    // 10/20 and 5/20 against the fixture's 20-buyer, 20-unit goals.
    expect(facts.map((f) => f.progress)).toEqual([0.5, 0.25]);
    expect(summarise(facts).averageProgress).toBeCloseTo(0.375, 10);
  });

  it('is 0 for an empty campaign list rather than NaN', () => {
    const summary = summarise([]);

    expect(summary.averageProgress).toBe(0);
    expect(Number.isNaN(summary.averageProgress)).toBe(false);
    expect(summary).toEqual({
      campaignCount: 0,
      openCount: 0,
      totalBuyers: 0,
      totalValue: 0,
      totalSaving: 0,
      averageProgress: 0,
    });
  });
});

describe('a campaign with no price tiers', () => {
  const tierless = makeCampaign({ id: 'c-tierless', tiers: [] });

  it('would throw if it reached the pricing helper', () => {
    // The guard in factsFor is load-bearing, not defensive decoration: a
    // hand-edited localStorage row used to blank the whole route.
    expect(() => pricingSnapshot(tierless, totalsFor(tierless, tierless.participants))).toThrow();
  });

  it('is skipped instead of crashing the console', () => {
    expect(() => factsFor(tierless)).not.toThrow();
    expect(factsFor(tierless)).toBeNull();
  });

  it('is left out of the facts, and out of every number derived from them', () => {
    const facts = factsForAll([makeCampaign({ id: 'priced' }), tierless]);

    expect(facts).toHaveLength(1);
    expect(facts[0].campaign.id).toBe('priced');
    expect(summarise(facts).campaignCount).toBe(1);
  });
});

describe('the region and category rollups', () => {
  it('put every seeded campaign in exactly one region row', () => {
    const rows = regionRollup(SEED_FACTS, en);
    const keys = rows.map((row) => row.key);

    expect(new Set(keys).size).toBe(keys.length);
    for (const facts of SEED_FACTS) {
      const matches = rows.filter((row) => row.key === facts.campaign.regionId);
      expect(matches, `${facts.campaign.id} lands in ${matches.length} region rows`).toHaveLength(1);
    }
  });

  it('put every seeded campaign in exactly one category row', () => {
    const rows = categoryRollup(SEED_FACTS, en);
    const keys = rows.map((row) => row.key);

    expect(new Set(keys).size).toBe(keys.length);
    for (const facts of SEED_FACTS) {
      const matches = rows.filter((row) => row.key === facts.campaign.category);
      expect(matches, `${facts.campaign.id} lands in ${matches.length} category rows`).toHaveLength(
        1,
      );
    }
  });

  it('account for the whole campaign list in their row counts', () => {
    const total = SEED_FACTS.length;
    const count = (rows: readonly { campaigns: number }[]) =>
      rows.reduce((sum, row) => sum + row.campaigns, 0);

    expect(total).toBeGreaterThan(0);
    expect(count(regionRollup(SEED_FACTS, en))).toBe(total);
    expect(count(categoryRollup(SEED_FACTS, en))).toBe(total);
  });

  it('count the same buyers once, whichever way the campaigns are cut', () => {
    const buyers = (rows: readonly { buyers: number }[]) =>
      rows.reduce((sum, row) => sum + row.buyers, 0);

    expect(buyers(regionRollup(SEED_FACTS, en))).toBe(summarise(SEED_FACTS).totalBuyers);
    expect(buyers(categoryRollup(SEED_FACTS, en))).toBe(summarise(SEED_FACTS).totalBuyers);
  });
});

describe('committed volume in a rollup row', () => {
  const mixed = factsForAll([
    makeCampaign({
      id: 'diesel',
      regionId: 'riga',
      unit: 'litre',
      tiers: DIESEL_TIERS,
      retailPricePerUnit: 1.58,
      tierBasis: 'units',
      targetUnits: 5000,
      participants: makeParticipants(4, 250),
    }),
    makeCampaign({
      id: 'pellets',
      regionId: 'riga',
      unit: 'ton',
      participants: makeParticipants(4, 1),
    }),
  ]);

  it('keeps litres and tonnes apart instead of adding them into one figure', () => {
    // 1 000 L + 4 t is not 1 004 of anything. The column used to print that sum.
    expect(unitTotalsOf(mixed)).toEqual([
      { unitId: 'ton', units: 4 },
      { unitId: 'litre', units: 1000 },
    ]);
  });

  it('exposes no cross-unit total for the table to print', () => {
    const row = regionRollup(mixed, en)[0];

    expect(row.unitTotals).toHaveLength(2);
    expect('units' in row).toBe(false);
    expect(Object.values(row)).not.toContain(1004);
  });

  it('drops units nothing was committed in', () => {
    const empty = factsForAll([makeCampaign({ id: 'quiet', participants: [] })]);

    expect(unitTotalsOf(empty)).toEqual([]);
  });

  it('averages the saving per campaign, unweighted by size', () => {
    // The caveat the note under each table now states: the big campaign and
    // the small one each contribute exactly one share of this mean.
    const row = groupOf(mixed, 'riga', 'Rīga & Pierīga');
    const mean =
      mixed.reduce((sum, facts) => sum + facts.pricing.savingPercent, 0) / mixed.length;

    expect(row.savingPercent).toBe(Math.round(mean));
  });
});

describe('closing soon', () => {
  const rows = () =>
    closingSoon(
      factsForAll([
        makeCampaign({ id: 'late', endsInDays: 3, participants: makeParticipants(5) }),
        makeCampaign({ id: 'closed', endsInDays: -1, participants: makeParticipants(5) }),
        makeCampaign({ id: 'funded', endsInDays: 2, participants: makeParticipants(20) }),
        makeCampaign({ id: 'overfunded', endsInDays: 1, participants: makeParticipants(25) }),
        makeCampaign({
          id: 'far-off',
          endsInDays: CLOSING_SOON_WITHIN_DAYS + 1,
          participants: makeParticipants(5),
        }),
        makeCampaign({ id: 'last-day', endsInDays: 0, participants: makeParticipants(5) }),
        makeCampaign({
          id: 'edge',
          endsInDays: CLOSING_SOON_WITHIN_DAYS,
          participants: makeParticipants(5),
        }),
      ]),
    );

  it('excludes campaigns that have already closed', () => {
    expect(rows().map((f) => f.campaign.id)).not.toContain('closed');
  });

  it('excludes campaigns at or past their goal', () => {
    const ids = rows().map((f) => f.campaign.id);

    expect(ids).not.toContain('funded');
    expect(ids).not.toContain('overfunded');
  });

  it('keeps the ones still short of the goal inside the window, soonest first', () => {
    expect(rows().map((f) => f.campaign.id)).toEqual(['last-day', 'late', 'edge']);
  });
});

describe('the status rollup', () => {
  it('lists every status in a fixed order and sums to the campaign count', () => {
    const rows = statusRollup(SEED_FACTS);
    const counted = rows.reduce((sum, row) => sum + row.count, 0);

    expect(rows.map((row) => row.status)).toEqual([
      'new',
      'open',
      'almost-full',
      'closing-soon',
      'funded',
      'closed',
    ]);
    expect(counted).toBe(SEED_FACTS.length);
  });
});

describe('your own units', () => {
  it('adds the organiser seed row to what you joined on your own campaign', () => {
    const campaign = makeCampaign({
      id: 'c-mine',
      participants: [
        { id: 'c-mine-organizer', name: 'You', type: 'individual', units: 4, joinedDaysAgo: 9 },
      ],
    });

    expect(yourUnits(campaign, 3, true)).toBe(7);
    expect(yourUnits(campaign, 3, false)).toBe(3);
  });
});

describe('none of the helpers mutates what it was handed', () => {
  it('leaves the seed campaign list in its original order', () => {
    const before = [...SEED_CAMPAIGNS];

    factsForAll(SEED_CAMPAIGNS);

    expect(SEED_CAMPAIGNS).toEqual(before);
    expect(SEED_CAMPAIGNS.map((campaign) => campaign.id)).toEqual(
      before.map((campaign) => campaign.id),
    );
  });

  it('leaves the facts array alone, sorts and rollups included', () => {
    const facts: readonly Facts[] = factsForAll(SEED_CAMPAIGNS);
    const before = [...facts];

    summarise(facts);
    unitTotalsOf(facts);
    regionRollup(facts, en);
    categoryRollup(facts, en);
    statusRollup(facts);
    closingSoon(facts);
    groupOf(facts, 'all', 'All');

    expect(facts).toEqual(before);
    expect(facts.map((f) => f.campaign.id)).toEqual(before.map((f) => f.campaign.id));
  });

  it('sorts a copy when it orders closing-soon by days left', () => {
    const facts = factsForAll([
      makeCampaign({ id: 'later', endsInDays: 6, participants: makeParticipants(5) }),
      makeCampaign({ id: 'sooner', endsInDays: 1, participants: makeParticipants(5) }),
    ]);
    const before = facts.map((f) => f.campaign.id);

    expect(closingSoon(facts).map((f) => f.campaign.id)).toEqual(['sooner', 'later']);
    expect(facts.map((f) => f.campaign.id)).toEqual(before);
  });
});

/**
 * The two columns an investor could most easily misread. The note under each
 * table is the only thing standing between "Units" and a number that adds
 * litres to tonnes, so it is pinned here rather than left to a code review.
 */
describe('the caveat under each rollup table', () => {
  const SOURCE = Object.values(
    import.meta.glob('../DashboardPage.tsx', { query: '?raw', import: 'default', eager: true }),
  )[0] as string;

  it('says volume is listed per unit', () => {
    expect(SOURCE).toMatch(/per unit/);
    expect(SOURCE).toMatch(/never added together/);
  });

  it('says the average saving is unweighted', () => {
    expect(SOURCE).toMatch(/unweighted mean/);
  });

  it('still carries the caveat under the key the translators are working on', () => {
    expect(SOURCE).toContain("t(\n    'dash.groupNote',");
  });
});
