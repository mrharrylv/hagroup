import productsJson from '../data/products.json';
import partnersJson from '../data/partners.json';
import reviewsJson from '../data/reviews.json';
import type { Language } from '../i18n';

export type LocalizedText = Record<Language, string>;
export type LocalizedList = Record<Language, string[]>;

export interface Product {
  id: string;
  visual: 'sheet' | 'roll' | 'food' | 'compact' | 'shrink';
  sourceUrl?: string;
  name: LocalizedText;
  description: LocalizedText;
  features: LocalizedList;
}

export interface Partner {
  id: string;
  name: string;
  website?: string;
  category: LocalizedText;
  description: LocalizedText;
  published?: boolean;
}

export interface Review {
  id: string;
  author: string | LocalizedText;
  company?: string;
  role?: LocalizedText;
  quote: LocalizedText;
  rating?: number;
  published?: boolean;
}

export const products = productsJson.products as Product[];
export const partners = (partnersJson.partners as Partner[]).filter(
  (partner) => partner.published !== false,
);
export const reviews = (reviewsJson.reviews as Review[]).filter(
  (review) => review.published !== false,
);

export function localized(value: LocalizedText, language: string): string {
  return value[(language.slice(0, 2) as Language)] || value.lv;
}

export function localizedString(value: string | LocalizedText, language: string): string {
  return typeof value === 'string' ? value : localized(value, language);
}

export function localizedList(value: LocalizedList, language: string): string[] {
  return value[(language.slice(0, 2) as Language)] || value.lv;
}
