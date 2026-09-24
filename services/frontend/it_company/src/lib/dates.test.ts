import { describe, expect, it } from 'vitest';
import { formatCalendarDate } from './dates';

describe('formatCalendarDate', () => {
  it('formats a calendar date in the page language', () => {
    expect(formatCalendarDate('2026-07-15', 'en')).toBe('July 15, 2026');
    expect(formatCalendarDate('2026-07-15', 'lv')).toMatch(/2026/);
    expect(formatCalendarDate('2026-07-15', 'ru')).toMatch(/2026/);
  });

  it('never shifts the day, whatever the time zone', () => {
    // A date-only string parsed as UTC and printed in local time is a day
    // early west of Greenwich; the build and the browser would then disagree.
    expect(formatCalendarDate('2026-01-01', 'en')).toBe('January 1, 2026');
    expect(formatCalendarDate('2026-12-31T00:00:00', 'en')).toBe('December 31, 2026');
  });

  it('accepts month-only output options', () => {
    expect(formatCalendarDate('2026-03-01', 'en', { year: 'numeric', month: 'long' })).toBe('March 2026');
  });

  it('returns the input unchanged when it is not a date', () => {
    expect(formatCalendarDate('not a date', 'en')).toBe('not a date');
  });
});
