import { describe, expect, it } from 'vitest';
import { headlineProgress, isJoinable, statusOf, totalsFor } from './status';
import { makeCampaign, makeParticipants } from '../test/fixtures';

describe('totalsFor', () => {
  it('sums commitments and counts heads', () => {
    const totals = totalsFor({ targetUnits: 20, targetBuyers: 20 }, makeParticipants(14));
    expect(totals.committedUnits).toBe(14);
    expect(totals.buyerCount).toBe(14);
    expect(totals.unitProgress).toBeCloseTo(0.7);
    expect(totals.buyerProgress).toBeCloseTo(0.7);
  });

  it('returns zero progress for an empty campaign', () => {
    const totals = totalsFor({ targetUnits: 20, targetBuyers: 20 }, []);
    expect(totals).toEqual({
      committedUnits: 0,
      buyerCount: 0,
      unitProgress: 0,
      buyerProgress: 0,
    });
  });

  it('does not divide by a zero target', () => {
    const totals = totalsFor({ targetUnits: 0, targetBuyers: 0 }, makeParticipants(3));
    expect(totals.unitProgress).toBe(0);
    expect(totals.buyerProgress).toBe(0);
  });
});

describe('headlineProgress', () => {
  it('follows whichever goal is further along', () => {
    const totals = totalsFor({ targetUnits: 100, targetBuyers: 10 }, makeParticipants(9, 2));
    expect(totals.unitProgress).toBeCloseTo(0.18);
    expect(totals.buyerProgress).toBeCloseTo(0.9);
    expect(headlineProgress(totals)).toBeCloseTo(0.9);
  });
});

describe('statusOf', () => {
  const campaignWith = (participants: number, overrides = {}) => {
    const campaign = makeCampaign({ participants: makeParticipants(participants), ...overrides });
    return statusOf(campaign, totalsFor(campaign, campaign.participants));
  };

  it('is closed once the end date has passed, whatever the progress', () => {
    expect(campaignWith(25, { endsInDays: -1 })).toBe('closed');
  });

  it('is funded at or above the goal', () => {
    expect(campaignWith(20)).toBe('funded');
    expect(campaignWith(24)).toBe('funded');
  });

  it('is almost full from 80 percent', () => {
    expect(campaignWith(16)).toBe('almost-full');
    expect(campaignWith(15)).not.toBe('almost-full');
  });

  it('flags the last five days ahead of the New badge', () => {
    expect(campaignWith(5, { endsInDays: 3, startedDaysAgo: 1 })).toBe('closing-soon');
  });

  it('is new for the first four days', () => {
    expect(campaignWith(5, { startedDaysAgo: 2 })).toBe('new');
    expect(campaignWith(5, { startedDaysAgo: 5 })).toBe('open');
  });
});

describe('isJoinable', () => {
  it('allows every state except closed', () => {
    expect(isJoinable('open')).toBe(true);
    expect(isJoinable('funded')).toBe(true);
    expect(isJoinable('closed')).toBe(false);
  });
});
