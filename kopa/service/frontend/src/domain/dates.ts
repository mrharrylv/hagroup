const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Demo campaigns store days relative to "now" rather than absolute dates, so a
 * deck shown in three months still has live countdowns instead of a wall of
 * expired listings. Absolute dates are derived at render time.
 */
export function dateFromOffset(daysFromNow: number, now: Date): Date {
  return new Date(now.getTime() + daysFromNow * MS_PER_DAY);
}

export function offsetFromDate(date: Date, now: Date): number {
  return Math.round((date.getTime() - now.getTime()) / MS_PER_DAY);
}

export function formatDate(date: Date, lang: 'en' | 'lv'): string {
  return new Intl.DateTimeFormat(lang === 'lv' ? 'lv-LV' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export interface Countdown {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly expired: boolean;
}

export function countdownTo(target: Date, now: Date): Countdown {
  const remaining = target.getTime() - now.getTime();
  if (remaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(remaining / MS_PER_DAY),
    hours: Math.floor((remaining / (60 * 60 * 1000)) % 24),
    minutes: Math.floor((remaining / (60 * 1000)) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
    expired: false,
  };
}

export function formatMoney(value: number, lang: 'en' | 'lv'): string {
  return new Intl.NumberFormat(lang === 'lv' ? 'lv-LV' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: value < 10 ? 2 : 0,
  }).format(value);
}

export function formatNumber(value: number, lang: 'en' | 'lv'): string {
  return new Intl.NumberFormat(lang === 'lv' ? 'lv-LV' : 'en-GB', {
    maximumFractionDigits: 2,
  }).format(value);
}
