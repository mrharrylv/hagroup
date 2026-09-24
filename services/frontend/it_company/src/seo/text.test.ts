import { describe, expect, it } from 'vitest';
import { crumbName, summarize } from './text';

const SENTENCE_A = 'We design and run cloud platforms for growing companies in Latvia and across Europe.';
const SENTENCE_B = 'Our engineers automate delivery with CI/CD pipelines and infrastructure as code.';
const SENTENCE_C = 'Every engagement starts with an honest review of what you already run today.';

describe('summarize', () => {
  it('returns short text unchanged apart from collapsed whitespace', () => {
    expect(summarize('  A short   line.\n', 160)).toBe('A short line.');
  });

  it('keeps whole sentences while they fit', () => {
    const text = [SENTENCE_A, SENTENCE_B, SENTENCE_C].join(' ');
    const result = summarize(text, 170);
    expect(result).toBe(`${SENTENCE_A} ${SENTENCE_B}`);
    expect(result.length).toBeLessThanOrEqual(170);
  });

  it('cuts at a word boundary with an ellipsis when the first sentence is too long', () => {
    const long = `${'Infrastructure modernization '.repeat(12)}done.`;
    const result = summarize(long, 160);
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result.endsWith('…')).toBe(true);
    expect(result).not.toMatch(/\s…$/);
    expect(long.startsWith(result.slice(0, -1))).toBe(true);
  });

  it('prefers a word cut over a sentence that is too short to describe the page', () => {
    const text = `Short intro. ${'A much longer second sentence that keeps going '.repeat(5)}end.`;
    const result = summarize(text, 160, 70);
    expect(result.length).toBeGreaterThanOrEqual(70);
    expect(result.length).toBeLessThanOrEqual(160);
  });

  it('does not end on a dangling comma before the ellipsis', () => {
    const text = `${'word '.repeat(30)}alpha, ${'beta '.repeat(40)}`;
    const result = summarize(text, 156);
    expect(result).not.toMatch(/[,;:]…$/);
  });
});

describe('crumbName', () => {
  it('takes the part of a title before the site suffix', () => {
    expect(crumbName('DevOps & CI/CD | HA Group')).toBe('DevOps & CI/CD');
    expect(crumbName('Contact HA Group | Discuss Your IT Project')).toBe('Contact HA Group');
  });

  it('returns a title without a separator whole', () => {
    expect(crumbName('SIA HA Group Company Details')).toBe('SIA HA Group Company Details');
  });
});
