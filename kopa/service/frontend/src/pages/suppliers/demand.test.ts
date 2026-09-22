import { describe, expect, it } from 'vitest';
import { SEED_CAMPAIGNS } from '../../data/campaigns';
import { CATEGORIES } from '../../data/taxonomy';
import { isJoinable, statusOf, totalsFor } from '../../domain/status';
import { DIESEL_TIERS, makeCampaign, makeParticipant } from '../../test/fixtures';
import type { Campaign, CategoryId, SupplierBid } from '../../domain/types';
import {
  CROWDED_BID_COUNT,
  MAX_BID_TARGETS,
  bidTargets,
  boardTotals,
  buyersIn,
  committedValueOf,
  demandRows,
  liveCampaigns,
  unitTotals,
} from './demand';

/**
 * The supplier page is a pile of numbers with no second source: if the rollup
 * double-counts a campaign or divides by zero, the page still renders and just
 * lies. These pin it against the shipped dataset and against the awkward
 * shapes the dataset happens not to contain today.
 */

const LIVE = liveCampaigns(SEED_CAMPAIGNS);
const ROWS = demandRows(LIVE);

/** The seed's own answer to "is this campaign still open", derived independently. */
function isOpen(campaign: Campaign): boolean {
  return isJoinable(statusOf(campaign, totalsFor(campaign, campaign.participants)));
}

function makeBid(supplier: string): SupplierBid {
  return { supplier, pricePerUnit: 1, note: { en: 'note', lv: 'piezīme' }, leadTimeDays: 3 };
}

function bids(count: number): readonly SupplierBid[] {
  return Array.from({ length: count }, (_, index) => makeBid(`Supplier ${index}`));
}

describe('demandRows, against the shipped dataset', () => {
  it('counts every open campaign exactly once', () => {
    const open = SEED_CAMPAIGNS.filter(isOpen);
    const counted = ROWS.reduce((sum, row) => sum + row.openCampaigns, 0);

    expect(LIVE).toHaveLength(open.length);
    expect(counted).toBe(open.length);
  });

  it('files each campaign under its own category and nowhere else', () => {
    for (const row of ROWS) {
      const inCategory = LIVE.filter((entry) => entry.campaign.category === row.categoryId);
      expect(row.openCampaigns).toBe(inCategory.length);
    }
  });

  it('closes over every category the open campaigns actually use', () => {
    const used = new Set(LIVE.map((entry) => entry.campaign.category));
    expect(new Set(ROWS.map((row) => row.categoryId))).toEqual(used);
  });

  it('adds the hero stats up from the same rows the board renders', () => {
    const totals = boardTotals(ROWS);

    expect(totals.openCampaigns).toBe(LIVE.length);
    expect(totals.buyers).toBe(buyersIn(LIVE));
    expect(totals.committedValue).toBeCloseTo(committedValueOf(LIVE), 6);
  });

  it('never reports a number the page cannot print', () => {
    for (const row of ROWS) {
      expect(Number.isFinite(row.committedValue)).toBe(true);
      expect(Number.isFinite(row.buyers)).toBe(true);
      expect(row.byUnit.every((entry) => Number.isFinite(entry.units))).toBe(true);
    }
  });
});

describe('a category with nothing running', () => {
  it('is absent from the board rather than a row of zeros', () => {
    const dropped: CategoryId = 'timber';
    const rows = demandRows(LIVE.filter((entry) => entry.campaign.category !== dropped));

    expect(rows.map((row) => row.categoryId)).not.toContain(dropped);
    expect(rows.every((row) => row.openCampaigns > 0)).toBe(true);
  });

  it('leaves the board empty when every category is empty', () => {
    expect(demandRows([])).toEqual([]);
    expect(boardTotals([])).toEqual({ openCampaigns: 0, committedValue: 0, buyers: 0 });
  });

  it('shows one row for one campaign, not one row per known category', () => {
    const rows = demandRows(liveCampaigns([makeCampaign({ category: 'heating-fuel' })]));

    expect(rows).toHaveLength(1);
    expect(CATEGORIES.length).toBeGreaterThan(1);
    expect(rows[0].categoryId).toBe('heating-fuel');
  });
});

describe('the awkward campaigns', () => {
  it('does not divide by zero when nobody has joined', () => {
    const rows = demandRows(liveCampaigns([makeCampaign({ participants: [] })]));

    expect(rows).toHaveLength(1);
    expect(rows[0].buyers).toBe(0);
    expect(rows[0].committedValue).toBe(0);
    expect(rows[0].byUnit).toEqual([{ unitId: 'pallet', units: 0 }]);
    expect(rows[0].best?.savingPercent).toBe(0);
  });

  it('stays finite when the goal and the retail price are zero too', () => {
    const rows = demandRows(
      liveCampaigns([
        makeCampaign({
          participants: [],
          targetUnits: 0,
          targetBuyers: 0,
          retailPricePerUnit: 0,
        }),
      ]),
    );

    expect(rows).toHaveLength(1);
    expect(Number.isNaN(rows[0].committedValue)).toBe(false);
    expect(Number.isNaN(rows[0].best?.savingPercent ?? Number.NaN)).toBe(false);
    expect(rows[0].best?.savingPercent).toBe(0);
  });

  it('does not throw on an empty tier ladder — it has no price, not a broken one', () => {
    const campaign = makeCampaign({ id: 'c-no-tiers', tiers: [] });

    expect(() => liveCampaigns([campaign])).not.toThrow();

    const entries = liveCampaigns([campaign]);
    expect(entries[0].snapshot).toBeNull();

    const rows = demandRows(entries);
    expect(rows[0].openCampaigns).toBe(1);
    expect(rows[0].best).toBeNull();
    expect(rows[0].committedValue).toBe(0);
    expect(rows[0].byUnit).toEqual([{ unitId: 'pallet', units: 14 }]);
  });

  it('keeps an unpriceable campaign out of the bid list', () => {
    const entries = liveCampaigns([makeCampaign({ id: 'c-no-tiers', tiers: [] })]);
    expect(bidTargets(entries)).toEqual([]);
  });
});

describe('the two caveats the page states on screen', () => {
  it('keeps mixed units apart instead of summing litres into tonnes', () => {
    const rows = demandRows(
      liveCampaigns([
        makeCampaign({ id: 'c-litres', unit: 'litre', tiers: DIESEL_TIERS }),
        makeCampaign({ id: 'c-tonnes', unit: 'ton' }),
      ]),
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].byUnit.map((entry) => entry.unitId).sort()).toEqual(['litre', 'ton']);
    expect(rows[0].byUnit.every((entry) => entry.units === 14)).toBe(true);
  });

  it('counts one person twice when they joined two campaigns in a category', () => {
    const person = makeParticipant({ id: 'p-anda', name: 'Anda' });
    const rows = demandRows(
      liveCampaigns([
        makeCampaign({ id: 'c-one', participants: [person] }),
        makeCampaign({ id: 'c-two', participants: [person] }),
      ]),
    );

    expect(rows[0].buyers).toBe(2);
  });
});

describe('the board ordering', () => {
  it('sorts by committed value, richest first', () => {
    const values = ROWS.map((row) => row.committedValue);
    expect([...values].sort((a, b) => b - a)).toEqual(values);
  });

  it('does not mutate the array it was handed', () => {
    const entries = [...LIVE];
    const before = [...entries];

    demandRows(entries);
    bidTargets(entries);
    unitTotals(entries);

    expect(entries).toEqual(before);
    expect(entries.map((entry) => entry.campaign.id)).toEqual(
      before.map((entry) => entry.campaign.id),
    );
  });

  it('gives the same board twice, and the same board whatever order it is fed', () => {
    const shuffled = [...LIVE].reverse();

    expect(demandRows(LIVE).map((row) => row.categoryId)).toEqual(
      ROWS.map((row) => row.categoryId),
    );
    expect(demandRows(shuffled).map((row) => row.categoryId)).toEqual(
      ROWS.map((row) => row.categoryId),
    );
  });

  it('breaks a tie on committed value by the canonical category order', () => {
    // Identical campaigns but for the category, so the values are exactly equal
    // and only the tie-break can decide. `agri-inputs` precedes `timber` in
    // CATEGORIES, and a stable sort has to keep it there either way round.
    const agri = makeCampaign({ id: 'c-agri', category: 'agri-inputs' });
    const timber = makeCampaign({ id: 'c-timber', category: 'timber' });

    const forwards = demandRows(liveCampaigns([agri, timber]));
    const backwards = demandRows(liveCampaigns([timber, agri]));

    expect(forwards[0].committedValue).toBe(forwards[1].committedValue);
    expect(forwards.map((row) => row.categoryId)).toEqual(['agri-inputs', 'timber']);
    expect(backwards.map((row) => row.categoryId)).toEqual(['agri-inputs', 'timber']);
  });

  it('orders unit totals largest first', () => {
    const entries = liveCampaigns([
      makeCampaign({ id: 'c-small', unit: 'ton', participants: [makeParticipant()] }),
      makeCampaign({ id: 'c-big', unit: 'pallet' }),
    ]);

    expect(unitTotals(entries)).toEqual([
      { unitId: 'pallet', units: 14 },
      { unitId: 'ton', units: 1 },
    ]);
  });
});

describe('open for bids', () => {
  it('excludes a campaign that already has enough supplier interest', () => {
    const crowded = makeCampaign({ id: 'c-crowded', supplierBids: bids(CROWDED_BID_COUNT) });
    const quiet = makeCampaign({ id: 'c-quiet', supplierBids: bids(CROWDED_BID_COUNT - 1) });

    const targets = bidTargets(liveCampaigns([crowded, quiet]));

    expect(targets.map((target) => target.campaign.id)).toEqual(['c-quiet']);
    expect(targets[0].openBids).toBe(CROWDED_BID_COUNT - 1);
  });

  it('excludes a closed campaign, however much volume it gathered', () => {
    const closed = makeCampaign({ id: 'c-closed', endsInDays: -1 });
    const open = makeCampaign({ id: 'c-open' });

    expect(bidTargets(liveCampaigns([closed, open])).map((target) => target.campaign.id)).toEqual([
      'c-open',
    ]);
    expect(demandRows(liveCampaigns([closed]))).toEqual([]);
  });

  it('offers only campaigns that qualify, from the shipped dataset', () => {
    const eligible = SEED_CAMPAIGNS.filter(
      (campaign) =>
        isOpen(campaign) &&
        campaign.tiers.length > 0 &&
        campaign.supplierBids.length < CROWDED_BID_COUNT,
    ).map((campaign) => campaign.id);

    const targets = bidTargets(LIVE);

    expect(targets).toHaveLength(Math.min(MAX_BID_TARGETS, eligible.length));
    for (const target of targets) {
      expect(eligible).toContain(target.campaign.id);
      expect(target.openBids).toBeLessThan(CROWDED_BID_COUNT);
    }
  });

  it('puts the biggest committed volume first', () => {
    const volumes = bidTargets(LIVE).map((target) => target.committedUnits);
    expect([...volumes].sort((a, b) => b - a)).toEqual(volumes);
  });
});
