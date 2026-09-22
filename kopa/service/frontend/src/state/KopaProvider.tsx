import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { SEED_CAMPAIGNS } from '../data/campaigns';
import { cityById } from '../data/cities';
import { KopaContext, type JoinInput, type KopaValue } from './context';
import { slugify, type CampaignDraft } from './draft';
import {
  clearState,
  loadState,
  saveState,
  type PersistedState,
  type StoredJoin,
} from './persistence';
import type { Campaign, Participant } from '../domain/types';

/** Visible marker on demo rows the visitor created or joined in this browser. */
export const YOU_SUFFIX = ' (you)';

export function KopaProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<PersistedState>(loadState);
  // One instant for the whole session keeps every countdown consistent.
  const now = useRef(new Date()).current;
  const idCounter = useRef(0);

  const commit = useCallback((next: PersistedState) => {
    setPersisted(next);
    saveState(next);
  }, []);

  const nextId = useCallback((prefix: string) => {
    idCounter.current += 1;
    return `${prefix}-${now.getTime().toString(36)}-${idCounter.current}`;
  }, [now]);

  const campaigns = useMemo(
    () => mergeJoins([...SEED_CAMPAIGNS, ...persisted.created], persisted.joins),
    [persisted],
  );

  const joinCampaign = useCallback(
    (campaignId: string, input: JoinInput) => {
      const participant: Participant = {
        id: nextId('you'),
        name: `${input.name.trim()}${YOU_SUFFIX}`,
        type: input.type,
        org: input.org?.trim() === '' ? undefined : input.org,
        units: input.units,
        joinedDaysAgo: 0,
      };

      commit({
        ...persisted,
        joins: [...persisted.joins, { campaignId, participant }],
      });
    },
    [commit, nextId, persisted],
  );

  const createCampaign = useCallback(
    (draft: CampaignDraft): Campaign => {
      const city = cityById(draft.cityId);
      const id = nextId('own');
      const organiser: Participant | null =
        draft.ownUnits > 0
          ? {
              id: `${id}-organizer`,
              name: `${draft.organizerName.trim()}${YOU_SUFFIX}`,
              type: draft.organizerType,
              org: draft.organizerOrg.trim() === '' ? undefined : draft.organizerOrg.trim(),
              units: draft.ownUnits,
              joinedDaysAgo: 0,
            }
          : null;

      const campaign: Campaign = {
        id,
        slug: `${slugify(draft.titleEn) || 'group-buy'}-${id}`,
        title: { en: draft.titleEn.trim(), lv: draft.titleEn.trim() },
        description: { en: draft.descriptionEn.trim(), lv: draft.descriptionEn.trim() },
        category: draft.category,
        unit: draft.unit,
        audience: draft.audience,
        organizer: {
          name: draft.organizerName.trim(),
          type: draft.organizerType,
          org: draft.organizerOrg.trim() === '' ? undefined : draft.organizerOrg.trim(),
        },
        cityId: draft.cityId,
        regionId: city?.regionId ?? 'riga',
        lat: draft.lat,
        lng: draft.lng,
        radiusKm: draft.radiusKm,
        targetUnits: draft.targetUnits,
        targetBuyers: draft.targetBuyers,
        retailPricePerUnit: draft.retailPricePerUnit,
        tierBasis: draft.tierBasis,
        tiers: draft.tiers,
        endsInDays: draft.endsInDays,
        startedDaysAgo: 0,
        participants: organiser === null ? [] : [organiser],
        faq: [],
        keywords: [draft.titleEn, draft.category, city?.name ?? ''],
        featured: false,
        supplierBids: [],
      };

      commit({ ...persisted, created: [...persisted.created, campaign] });
      return campaign;
    },
    [commit, nextId, persisted],
  );

  const value = useMemo<KopaValue>(
    () => ({
      campaigns,
      now,
      byId: (id) => campaigns.find((campaign) => campaign.id === id),
      bySlug: (slug) => campaigns.find((campaign) => campaign.slug === slug),
      joinCampaign,
      createCampaign,
      hasJoined: (campaignId) => persisted.joins.some((join) => join.campaignId === campaignId),
      myUnits: (campaignId) =>
        persisted.joins
          .filter((join) => join.campaignId === campaignId)
          .reduce((sum, join) => sum + join.participant.units, 0),
      isMine: (campaignId) => persisted.created.some((campaign) => campaign.id === campaignId),
      resetDemo: () => {
        clearState();
        setPersisted({ joins: [], created: [] });
      },
    }),
    [campaigns, createCampaign, joinCampaign, now, persisted],
  );

  return <KopaContext.Provider value={value}>{children}</KopaContext.Provider>;
}

/** Fold stored joins into their campaigns without mutating the seed data. */
export function mergeJoins(
  campaigns: readonly Campaign[],
  joins: readonly StoredJoin[],
): Campaign[] {
  if (joins.length === 0) return [...campaigns];

  const byCampaign = new Map<string, Participant[]>();
  for (const join of joins) {
    const existing = byCampaign.get(join.campaignId) ?? [];
    byCampaign.set(join.campaignId, [...existing, join.participant]);
  }

  return campaigns.map((campaign) => {
    const extra = byCampaign.get(campaign.id);
    if (extra === undefined) return campaign;
    return { ...campaign, participants: [...campaign.participants, ...extra] };
  });
}
