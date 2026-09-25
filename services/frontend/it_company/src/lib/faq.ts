import type { FaqEntry } from './contentTypes';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * The questions a service page shows, read defensively from its optional
 * `faq` field. The service page, its FAQPage markup and llms-full.txt all go
 * through this one function, so the markup can only ever describe questions
 * that are actually on the page.
 */
export function faqEntries(page: { faq?: unknown }): FaqEntry[] {
  if (!Array.isArray(page.faq)) return [];
  return page.faq.flatMap((entry: unknown) => {
    if (!entry || typeof entry !== 'object') return [];
    const { question, answer } = entry as Record<string, unknown>;
    if (!isNonEmptyString(question) || !isNonEmptyString(answer)) return [];
    return [{ question: question.trim(), answer: answer.trim() }];
  });
}
