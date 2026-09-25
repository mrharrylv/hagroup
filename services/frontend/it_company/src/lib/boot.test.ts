import { describe, expect, it } from 'vitest';
import { shouldHydrate } from './boot';

describe('shouldHydrate', () => {
  it('hydrates when the prerendered page is the page being shown', () => {
    expect(shouldHydrate('/', '/')).toBe(true);
    expect(shouldHydrate('/services/devops', '/services/devops')).toBe(true);
    expect(shouldHydrate('/lv/services/devops', '/lv/services/devops')).toBe(true);
  });

  it('ignores a trailing slash on either side', () => {
    expect(shouldHydrate('/services/devops', '/services/devops/')).toBe(true);
    expect(shouldHydrate('/lv', '/lv/')).toBe(true);
  });

  it('renders fresh when there is no prerendered markup', () => {
    expect(shouldHydrate(undefined, '/')).toBe(false);
    expect(shouldHydrate('', '/')).toBe(false);
  });

  it('renders fresh when the markup belongs to another page', () => {
    // The SPA fallback serves the English home for an unknown URL, and the
    // returning-visitor redirect moves / to /lv before boot.
    expect(shouldHydrate('/', '/services/devops')).toBe(false);
    expect(shouldHydrate('/', '/lv')).toBe(false);
    expect(shouldHydrate('/services', '/lv/services')).toBe(false);
    expect(shouldHydrate('/404', '/no-such-page')).toBe(false);
  });
});
