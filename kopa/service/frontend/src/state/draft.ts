import type { AudienceId, CategoryId, PriceTier, TierBasis, UnitId } from '../domain/types';

/** What the "Start a group buy" form collects. Contact details are demo-only. */
export interface CampaignDraft {
  readonly titleEn: string;
  readonly descriptionEn: string;
  readonly category: CategoryId;
  readonly unit: UnitId;
  readonly audience: AudienceId;
  readonly cityId: string;
  readonly lat: number;
  readonly lng: number;
  readonly radiusKm: number;
  readonly targetUnits: number;
  readonly targetBuyers: number;
  readonly retailPricePerUnit: number;
  readonly tierBasis: TierBasis;
  readonly tiers: readonly PriceTier[];
  readonly endsInDays: number;
  readonly organizerName: string;
  readonly organizerType: 'business' | 'individual';
  readonly organizerOrg: string;
  readonly contactEmail: string;
  readonly contactPhone: string;
  /** Units the organiser commits themselves, seeding the campaign. */
  readonly ownUnits: number;
}

export interface DraftIssue {
  readonly field: keyof CampaignDraft;
  readonly message: string;
}

/** Boundary validation for the create form; the UI shows these verbatim. */
export function validateDraft(draft: CampaignDraft): DraftIssue[] {
  const issues: DraftIssue[] = [];

  if (draft.titleEn.trim().length < 3) {
    issues.push({ field: 'titleEn', message: 'Give the group buy a name of at least 3 characters.' });
  }
  if (draft.targetUnits <= 0) {
    issues.push({ field: 'targetUnits', message: 'Target quantity must be greater than zero.' });
  }
  if (draft.targetBuyers <= 0) {
    issues.push({ field: 'targetBuyers', message: 'Target number of buyers must be at least one.' });
  }
  if (draft.retailPricePerUnit <= 0) {
    issues.push({ field: 'retailPricePerUnit', message: 'Retail price must be greater than zero.' });
  }
  if (draft.radiusKm <= 0) {
    issues.push({ field: 'radiusKm', message: 'Pick a catchment radius.' });
  }
  if (draft.endsInDays < 1) {
    issues.push({ field: 'endsInDays', message: 'The campaign must run for at least one day.' });
  }
  if (draft.organizerName.trim() === '') {
    issues.push({ field: 'organizerName', message: 'Add a contact name.' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.contactEmail.trim())) {
    issues.push({ field: 'contactEmail', message: 'Enter an email address — demo only, nothing is sent.' });
  }
  if (draft.tiers.length < 3) {
    issues.push({ field: 'tiers', message: 'Give at least three price tiers so the discount ladder is visible.' });
  }
  if (draft.ownUnits < 0) {
    issues.push({ field: 'ownUnits', message: 'Your own commitment cannot be negative.' });
  }

  return issues;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
