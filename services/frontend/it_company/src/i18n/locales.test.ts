import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  LOCALES,
  basenameFor,
  isLang,
  localeFromPath,
  localizePath,
  normalizePath,
  stripLocale,
} from './locales';

describe('LOCALES', () => {
  it('lists English first and defaults to it', () => {
    expect(LOCALES).toEqual(['en', 'lv', 'ru']);
    expect(DEFAULT_LOCALE).toBe('en');
  });
});

describe('isLang', () => {
  it('accepts the three site languages only', () => {
    expect(isLang('en')).toBe(true);
    expect(isLang('lv')).toBe(true);
    expect(isLang('ru')).toBe(true);
    expect(isLang('de')).toBe(false);
    expect(isLang('LV')).toBe(false);
    expect(isLang('')).toBe(false);
    expect(isLang(null)).toBe(false);
    expect(isLang(undefined)).toBe(false);
    expect(isLang(42)).toBe(false);
  });
});

describe('localeFromPath', () => {
  it.each([
    ['/', 'en'],
    ['', 'en'],
    ['/services/devops', 'en'],
    ['/lv', 'lv'],
    ['/lv/', 'lv'],
    ['/lv/services/devops', 'lv'],
    ['/ru/contact', 'ru'],
    ['/ru/', 'ru'],
    ['/lvx', 'en'],
    ['/ruble/prices', 'en'],
    ['/en/services', 'en'],
    ['/services/lv', 'en'],
  ])('%s -> %s', (path, lang) => {
    expect(localeFromPath(path)).toBe(lang);
  });
});

describe('stripLocale', () => {
  it.each([
    ['/', '/'],
    ['', '/'],
    ['/lv', '/'],
    ['/lv/', '/'],
    ['/ru', '/'],
    ['/lv/services/devops', '/services/devops'],
    ['/ru/services/devops/', '/services/devops/'],
    ['/lvx', '/lvx'],
    ['/lvx/services', '/lvx/services'],
    ['/services/devops', '/services/devops'],
    ['/services/lv', '/services/lv'],
    ['services', '/services'],
  ])('%s -> %s', (path, stripped) => {
    expect(stripLocale(path)).toBe(stripped);
  });

  it('always returns a path that starts with a slash', () => {
    for (const path of ['', 'lv', '/lv', 'x', '/x/y']) {
      expect(stripLocale(path).startsWith('/')).toBe(true);
    }
  });
});

describe('localizePath', () => {
  it.each([
    ['/', 'en', '/'],
    ['/', 'lv', '/lv'],
    ['/', 'ru', '/ru'],
    ['/services/devops', 'en', '/services/devops'],
    ['/services/devops', 'lv', '/lv/services/devops'],
    ['/services/devops/', 'ru', '/ru/services/devops/'],
    ['/lv/services', 'ru', '/ru/services'],
    ['/lv/services', 'en', '/services'],
    ['/ru', 'en', '/'],
    ['/lvx', 'lv', '/lv/lvx'],
    ['contact', 'lv', '/lv/contact'],
  ] as const)('%s in %s -> %s', (path, lang, expected) => {
    expect(localizePath(path, lang)).toBe(expected);
  });

  it('round-trips with stripLocale and localeFromPath', () => {
    for (const lang of LOCALES) {
      const localized = localizePath('/services/devops', lang);
      expect(localeFromPath(localized)).toBe(lang);
      expect(stripLocale(localized)).toBe('/services/devops');
    }
  });
});

describe('basenameFor', () => {
  it('is empty for English and the prefix otherwise', () => {
    expect(basenameFor('en')).toBe('');
    expect(basenameFor('lv')).toBe('/lv');
    expect(basenameFor('ru')).toBe('/ru');
  });
});

describe('normalizePath', () => {
  it.each([
    ['/', '/'],
    ['', '/'],
    ['//', '/'],
    ['/services/', '/services'],
    ['/services//', '/services'],
    ['/services', '/services'],
    ['services', '/services'],
    ['/lv/', '/lv'],
  ])('%s -> %s', (path, normalized) => {
    expect(normalizePath(path)).toBe(normalized);
  });
});
