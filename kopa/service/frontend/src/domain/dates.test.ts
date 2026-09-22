import { describe, expect, it } from 'vitest';
import { countdownTo, dateFromOffset, formatMoney, formatNumber, offsetFromDate } from './dates';

const NOW = new Date('2026-09-22T12:00:00.000Z');

describe('dateFromOffset', () => {
  it('turns a relative day count into an absolute date', () => {
    expect(dateFromOffset(9, NOW).toISOString()).toBe('2026-10-01T12:00:00.000Z');
  });

  it('handles a campaign that has already ended', () => {
    expect(dateFromOffset(-3, NOW).toISOString()).toBe('2026-09-19T12:00:00.000Z');
  });

  it('round-trips through offsetFromDate', () => {
    expect(offsetFromDate(dateFromOffset(14, NOW), NOW)).toBe(14);
  });
});

describe('countdownTo', () => {
  it('breaks the remaining time down', () => {
    const target = new Date('2026-09-24T15:30:45.000Z');
    expect(countdownTo(target, NOW)).toEqual({
      days: 2,
      hours: 3,
      minutes: 30,
      seconds: 45,
      expired: false,
    });
  });

  it('reports expiry rather than negative numbers', () => {
    const target = new Date('2026-09-21T12:00:00.000Z');
    expect(countdownTo(target, NOW)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true,
    });
  });

  it('treats the exact deadline as expired', () => {
    expect(countdownTo(NOW, NOW).expired).toBe(true);
  });
});

describe('formatting', () => {
  it('shows cents on fuel prices and whole euros on bulk prices', () => {
    expect(formatMoney(1.52, 'en')).toContain('1.52');
    expect(formatMoney(345, 'en')).not.toContain('.00');
  });

  it('formats numbers per locale without throwing', () => {
    expect(formatNumber(10_000, 'en')).toBe('10,000');
    expect(typeof formatNumber(10_000, 'lv')).toBe('string');
  });
});
