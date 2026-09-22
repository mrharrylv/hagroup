import { plural } from './plural';
import type { Lang } from '../domain/types';

export type Translate = (key: string, english: string) => string;

/**
 * "5 days" / "1 day" / "21 diena". Every place that prints a number of days
 * goes through here, so neither language ends up saying "1 days".
 */
export function dayCount(days: number, lang: Lang, t: Translate): string {
  const noun = plural(days, lang, {
    one: t('time.day.one', 'day'),
    many: t('time.day.many', 'days'),
  });
  return `${days} ${noun}`;
}

/** The card and sidebar caption: "5 days left" / "1 day left". */
export function daysLeftLabel(days: number, lang: Lang, t: Translate): string {
  const phrase = plural(days, lang, {
    one: t('time.dayLeft.one', 'day left'),
    many: t('time.dayLeft.many', 'days left'),
  });
  return `${days} ${phrase}`;
}
