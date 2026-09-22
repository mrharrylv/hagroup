import { describe, expect, it } from 'vitest';
import { mergeJoins } from './KopaProvider';
import { makeCampaign, makeParticipant, makeParticipants } from '../test/fixtures';

const base = makeCampaign({ participants: makeParticipants(3) });
const other = makeCampaign({ id: 'c-other', slug: 'c-other', participants: makeParticipants(2) });

describe('mergeJoins', () => {
  it('returns a copy when there are no joins', () => {
    const result = mergeJoins([base], []);
    expect(result).toEqual([base]);
    expect(result).not.toBe(base.participants);
  });

  it('appends a join to the right campaign only', () => {
    const result = mergeJoins(
      [base, other],
      [{ campaignId: base.id, participant: makeParticipant({ id: 'you', units: 4 }) }],
    );

    expect(result[0].participants).toHaveLength(4);
    expect(result[0].participants.at(-1)?.units).toBe(4);
    expect(result[1].participants).toHaveLength(2);
  });

  it('accumulates several joins on one campaign', () => {
    const result = mergeJoins(
      [base],
      [
        { campaignId: base.id, participant: makeParticipant({ id: 'a', units: 1 }) },
        { campaignId: base.id, participant: makeParticipant({ id: 'b', units: 2 }) },
      ],
    );
    expect(result[0].participants).toHaveLength(5);
  });

  it('ignores a join pointing at a campaign that no longer exists', () => {
    const result = mergeJoins([base], [{ campaignId: 'gone', participant: makeParticipant() }]);
    expect(result[0].participants).toHaveLength(3);
  });

  it('never mutates the seed campaigns', () => {
    const before = base.participants.length;
    mergeJoins([base], [{ campaignId: base.id, participant: makeParticipant({ id: 'you' }) }]);
    expect(base.participants).toHaveLength(before);
  });
});
