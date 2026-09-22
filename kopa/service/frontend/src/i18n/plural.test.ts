import { describe, expect, it } from 'vitest';
import { isSingular, plural } from './plural';

const DAY = { one: 'day', many: 'days' };
const DIENA = { one: 'diena', many: 'dienas' };

describe('English plurals', () => {
  it('uses the singular for one and nothing else', () => {
    expect(plural(1, 'en', DAY)).toBe('day');
    expect(plural(0, 'en', DAY)).toBe('days');
    expect(plural(2, 'en', DAY)).toBe('days');
    expect(plural(21, 'en', DAY)).toBe('days');
  });
});

describe('Latvian plurals', () => {
  it('brings the singular back for every count ending in one', () => {
    expect(plural(1, 'lv', DIENA)).toBe('diena');
    expect(plural(21, 'lv', DIENA)).toBe('diena');
    expect(plural(31, 'lv', DIENA)).toBe('diena');
    expect(plural(101, 'lv', DIENA)).toBe('diena');
  });

  it('keeps the plural for the teens, which is the rule people get wrong', () => {
    expect(plural(11, 'lv', DIENA)).toBe('dienas');
    expect(plural(111, 'lv', DIENA)).toBe('dienas');
  });

  it('uses the plural for everything else', () => {
    expect(plural(0, 'lv', DIENA)).toBe('dienas');
    expect(plural(2, 'lv', DIENA)).toBe('dienas');
    expect(plural(9, 'lv', DIENA)).toBe('dienas');
    expect(plural(30, 'lv', DIENA)).toBe('dienas');
  });
});

describe('isSingular', () => {
  it('ignores a sign and a fractional part rather than throwing', () => {
    expect(isSingular(-1, 'lv')).toBe(true);
    expect(isSingular(1.4, 'en')).toBe(true);
    expect(isSingular(-11, 'lv')).toBe(false);
  });
});
