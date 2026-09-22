import { createContext } from 'react';
import type { BuyerType, Campaign } from '../domain/types';
import type { CampaignDraft } from './draft';

export interface JoinInput {
  readonly name: string;
  readonly type: BuyerType;
  readonly org?: string;
  readonly units: number;
}

export interface KopaValue {
  /** Seed campaigns with demo joins applied, followed by anything created in this browser. */
  readonly campaigns: readonly Campaign[];
  readonly byId: (id: string) => Campaign | undefined;
  readonly bySlug: (slug: string) => Campaign | undefined;
  readonly joinCampaign: (campaignId: string, input: JoinInput) => void;
  readonly createCampaign: (draft: CampaignDraft) => Campaign;
  readonly hasJoined: (campaignId: string) => boolean;
  readonly myUnits: (campaignId: string) => number;
  readonly isMine: (campaignId: string) => boolean;
  readonly resetDemo: () => void;
  /** Wall-clock instant the session started; all countdowns are derived from it. */
  readonly now: Date;
}

export const KopaContext = createContext<KopaValue | null>(null);
