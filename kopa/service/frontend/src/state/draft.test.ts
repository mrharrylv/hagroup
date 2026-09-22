import { describe, expect, it } from 'vitest';
import { slugify, validateDraft, type CampaignDraft } from './draft';

const VALID: CampaignDraft = {
  titleEn: 'Wood pellets for Mārupe',
  descriptionEn: 'One pallet each, one delivery.',
  category: 'heating-fuel',
  unit: 'pallet',
  audience: 'mixed',
  cityId: 'marupe',
  lat: 56.9,
  lng: 24.05,
  radiusKm: 15,
  targetUnits: 20,
  targetBuyers: 20,
  retailPricePerUnit: 390,
  tierBasis: 'buyers',
  tiers: [
    { min: 1, max: 4, pricePerUnit: 390 },
    { min: 5, max: 9, pricePerUnit: 365 },
    { min: 10, max: null, pricePerUnit: 345 },
  ],
  endsInDays: 30,
  organizerName: 'Ilze',
  organizerType: 'individual',
  organizerOrg: '',
  contactEmail: 'ilze@example.lv',
  contactPhone: '+371 20000000',
  ownUnits: 1,
};

const fieldsOf = (draft: CampaignDraft) => validateDraft(draft).map((issue) => issue.field);

describe('validateDraft', () => {
  it('accepts a complete draft', () => {
    expect(validateDraft(VALID)).toEqual([]);
  });

  it('rejects a title that is too short', () => {
    expect(fieldsOf({ ...VALID, titleEn: 'ab' })).toContain('titleEn');
    expect(fieldsOf({ ...VALID, titleEn: '   ' })).toContain('titleEn');
  });

  it('rejects non-positive quantities, prices and radius', () => {
    expect(fieldsOf({ ...VALID, targetUnits: 0 })).toContain('targetUnits');
    expect(fieldsOf({ ...VALID, targetBuyers: 0 })).toContain('targetBuyers');
    expect(fieldsOf({ ...VALID, retailPricePerUnit: 0 })).toContain('retailPricePerUnit');
    expect(fieldsOf({ ...VALID, radiusKm: 0 })).toContain('radiusKm');
  });

  it('requires the campaign to run for at least a day', () => {
    expect(fieldsOf({ ...VALID, endsInDays: 0 })).toContain('endsInDays');
  });

  it('requires a contact name and a plausible email', () => {
    expect(fieldsOf({ ...VALID, organizerName: ' ' })).toContain('organizerName');
    expect(fieldsOf({ ...VALID, contactEmail: 'not-an-email' })).toContain('contactEmail');
    expect(fieldsOf({ ...VALID, contactEmail: 'a@b' })).toContain('contactEmail');
  });

  it('insists on a visible discount ladder', () => {
    expect(fieldsOf({ ...VALID, tiers: VALID.tiers.slice(0, 2) })).toContain('tiers');
  });

  it('rejects a negative self-commitment but allows zero', () => {
    expect(fieldsOf({ ...VALID, ownUnits: -1 })).toContain('ownUnits');
    expect(validateDraft({ ...VALID, ownUnits: 0 })).toEqual([]);
  });

  it('reports every problem at once rather than stopping at the first', () => {
    expect(validateDraft({ ...VALID, titleEn: '', targetUnits: 0, contactEmail: '' })).toHaveLength(
      3,
    );
  });
});

describe('slugify', () => {
  it('strips Latvian diacritics and punctuation', () => {
    expect(slugify('Dīzeļdegviela saimniecībām — Zemgale')).toBe(
      'dizeldegviela-saimniecibam-zemgale',
    );
  });

  it('never leaves leading or trailing hyphens', () => {
    expect(slugify('  !!! hello !!!  ')).toBe('hello');
  });

  it('returns an empty string for input with nothing usable in it', () => {
    expect(slugify('!!!')).toBe('');
  });
});
