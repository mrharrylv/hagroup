import type { Campaign, Participant } from '../domain/types';

export const STORAGE_KEY = 'kopa.demo.v1';

export interface StoredJoin {
  readonly campaignId: string;
  readonly participant: Participant;
}

export interface PersistedState {
  readonly joins: readonly StoredJoin[];
  readonly created: readonly Campaign[];
}

export const EMPTY_PERSISTED: PersistedState = { joins: [], created: [] };

/**
 * Demo state lives in localStorage and nowhere else. Every read is defensive:
 * a private window, cleared site data or a hand-edited value must degrade to an
 * empty demo rather than a blank screen.
 */
export function loadState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return EMPTY_PERSISTED;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return EMPTY_PERSISTED;

    const candidate = parsed as Partial<PersistedState>;
    return {
      joins: Array.isArray(candidate.joins) ? candidate.joins.filter(isStoredJoin) : [],
      created: Array.isArray(candidate.created) ? candidate.created.filter(isCampaignish) : [],
    };
  } catch {
    return EMPTY_PERSISTED;
  }
}

export function saveState(state: PersistedState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage being unavailable must not break the running demo.
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do; the in-memory reset still happened.
  }
}

function isStoredJoin(value: unknown): value is StoredJoin {
  if (typeof value !== 'object' || value === null) return false;
  const join = value as Partial<StoredJoin>;
  return typeof join.campaignId === 'string' && typeof join.participant?.units === 'number';
}

function isCampaignish(value: unknown): value is Campaign {
  if (typeof value !== 'object' || value === null) return false;
  const campaign = value as Partial<Campaign>;
  return (
    typeof campaign.id === 'string' &&
    typeof campaign.slug === 'string' &&
    Array.isArray(campaign.tiers) &&
    Array.isArray(campaign.participants)
  );
}
