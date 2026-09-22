import { afterEach, describe, expect, it, vi } from 'vitest';
import { EMPTY_PERSISTED, STORAGE_KEY, clearState, loadState, saveState } from './persistence';
import { makeCampaign, makeParticipant } from '../test/fixtures';

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('loadState', () => {
  it('returns an empty demo when nothing has been stored', () => {
    expect(loadState()).toEqual(EMPTY_PERSISTED);
  });

  it('round-trips joins and created campaigns', () => {
    const state = {
      joins: [{ campaignId: 'c-test', participant: makeParticipant({ units: 3 }) }],
      created: [makeCampaign({ id: 'own-1', slug: 'own-1' })],
    };
    saveState(state);
    expect(loadState()).toEqual(state);
  });

  it('survives a value that is not JSON at all', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json {');
    expect(loadState()).toEqual(EMPTY_PERSISTED);
  });

  it('survives JSON of the wrong shape', () => {
    window.localStorage.setItem(STORAGE_KEY, '"a string"');
    expect(loadState()).toEqual(EMPTY_PERSISTED);
    window.localStorage.setItem(STORAGE_KEY, 'null');
    expect(loadState()).toEqual(EMPTY_PERSISTED);
  });

  it('drops individual entries that fail their shape check', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        joins: [{ campaignId: 'ok', participant: { units: 2 } }, { nonsense: true }, 42],
        created: [{ id: 'x' }, makeCampaign({ id: 'own-2', slug: 'own-2' })],
      }),
    );

    const loaded = loadState();
    expect(loaded.joins).toHaveLength(1);
    expect(loaded.created).toHaveLength(1);
    expect(loaded.created[0].id).toBe('own-2');
  });

  it('degrades to an empty demo when storage itself throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    expect(loadState()).toEqual(EMPTY_PERSISTED);
  });
});

describe('saveState', () => {
  it('swallows a quota error rather than breaking the running demo', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveState(EMPTY_PERSISTED)).not.toThrow();
  });
});

describe('clearState', () => {
  it('removes the key and survives storage being unavailable', () => {
    saveState({ joins: [], created: [makeCampaign()] });
    clearState();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    expect(() => clearState()).not.toThrow();
  });
});
