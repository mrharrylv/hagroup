import { describe, expect, it } from 'vitest';
import { createI18n } from './index';
import lvStatic from './locales/lv/1_static.json';
import ruStatic from './locales/ru/1_static.json';

describe('createI18n', () => {
  it('is ready in the requested language as soon as it returns', () => {
    const lv = createI18n('lv');
    expect(lv.isInitialized).toBe(true);
    expect(lv.language).toBe('lv');
    expect(lv.t('nav.services')).toBe(lvStatic.nav.services);
  });

  it('returns independent instances, so parallel pages cannot change each other', () => {
    const ru = createI18n('ru');
    const en = createI18n('en');
    expect(ru.t('notFound.title')).toBe(ruStatic.notFound.title);
    expect(en.language).toBe('en');
    expect(ru.language).toBe('ru');
  });
});
