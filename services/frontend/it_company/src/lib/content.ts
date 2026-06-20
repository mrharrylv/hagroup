import { useTranslation } from 'react-i18next';

/* ── locale-split data imports ── */
import enCareers from '../i18n/locales/en/2_careers.json';
import lvCareers from '../i18n/locales/lv/2_careers.json';
import ruCareers from '../i18n/locales/ru/2_careers.json';

import enLegal from '../i18n/locales/en/3_legal.json';
import lvLegal from '../i18n/locales/lv/3_legal.json';
import ruLegal from '../i18n/locales/ru/3_legal.json';

import enMethodology from '../i18n/locales/en/4_methodology.json';
import lvMethodology from '../i18n/locales/lv/4_methodology.json';
import ruMethodology from '../i18n/locales/ru/4_methodology.json';

import enProjects from '../i18n/locales/en/5_projects.json';
import lvProjects from '../i18n/locales/lv/5_projects.json';
import ruProjects from '../i18n/locales/ru/5_projects.json';

import enReviews from '../i18n/locales/en/7_reviews.json';
import lvReviews from '../i18n/locales/lv/7_reviews.json';
import ruReviews from '../i18n/locales/ru/7_reviews.json';

import enServices from '../i18n/locales/en/8_services.json';
import lvServices from '../i18n/locales/lv/8_services.json';
import ruServices from '../i18n/locales/ru/8_services.json';

import enBudgets from '../i18n/locales/en/9_budgets.json';
import lvBudgets from '../i18n/locales/lv/9_budgets.json';
import ruBudgets from '../i18n/locales/ru/9_budgets.json';

export type Lang = 'en' | 'lv' | 'ru';

/** Shape of a review entry (language already resolved) */
export interface Review {
  id: string;
  name: string;
  title: string;
  company: string;
  description: string;
  rating: number;
  date: string;
  image: string;
  projectId: string | null;
  featured: boolean;
}

/** Shape of a project entry (language already resolved) */
export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  website: string;
  slug: string;
  tags: string[];
  year: number;
  featured: boolean;
  client: string;
  role: string;
  duration: string;
  technologies: string[];
  highlights: string[];
}

/* ── helpers ── */
function useLang(): Lang {
  const { i18n } = useTranslation();
  return (i18n.language || 'en') as Lang;
}

function pick<T>(map: Record<Lang, T>, lang: Lang): T {
  return map[lang] ?? map.en;
}

/* ── per-data hooks (language already resolved) ── */
export function useCareersData() {
  return pick({ en: enCareers, lv: lvCareers, ru: ruCareers }, useLang());
}

export function useLegalData() {
  return pick({ en: enLegal, lv: lvLegal, ru: ruLegal }, useLang());
}

export function useMethodologyData() {
  return pick({ en: enMethodology, lv: lvMethodology, ru: ruMethodology }, useLang());
}

export function useProjectsData(): Project[] {
  return pick({ en: enProjects, lv: lvProjects, ru: ruProjects }, useLang()) as Project[];
}

export function useReviewsData(): Review[] {
  return pick({ en: enReviews, lv: lvReviews, ru: ruReviews }, useLang()) as Review[];
}

export function useServicesData() {
  return pick({ en: enServices, lv: lvServices, ru: ruServices }, useLang());
}

export function useBudgetsData() {
  return pick({ en: enBudgets, lv: lvBudgets, ru: ruBudgets }, useLang());
}
