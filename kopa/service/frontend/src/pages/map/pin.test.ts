import { describe, expect, it } from 'vitest';
import { campaignPinIcon, escapeHtml, regionBubbleIcon, type CampaignPinInput } from './pin';
import type { DivIcon } from 'leaflet';

const BASE: CampaignPinInput = {
  emoji: '⛽',
  colour: '#0891b2',
  title: 'Diesel for the co-op',
  participants: 7,
  state: 'normal',
  showLabel: true,
  selected: false,
};

function html(input: Partial<CampaignPinInput> = {}): string {
  const icon = campaignPinIcon({ ...BASE, ...input });
  return typeof icon.options.html === 'string' ? icon.options.html : '';
}

describe('campaignPinIcon', () => {
  it('carries the category colour, the emoji and the participant count', () => {
    const markup = html();

    expect(markup).toContain('#0891b2');
    expect(markup).toContain('⛽');
    expect(markup).toContain('>7<');
    expect(markup).toContain('Diesel for the co-op');
  });

  it('leaves the count bubble off a campaign nobody has joined', () => {
    // A pin reading "0" says the map is broken; an empty one says it is new.
    expect(html({ participants: 0 })).not.toContain('>0<');
  });

  it('dims a search miss and takes its label away', () => {
    const markup = html({ state: 'dim' });

    expect(markup).toContain('opacity:0.3');
    expect(markup).not.toContain('Diesel for the co-op');
  });

  it('gives a search hit the pulse class and a bigger circle', () => {
    const match = html({ state: 'match' });

    expect(match).toContain('kopa-pin-highlight');
    expect(match).toContain('width:44px');
    expect(html()).toContain('width:32px');
  });

  it('escapes a title rather than letting it reach innerHTML as markup', () => {
    const markup = html({ title: '<img src=x onerror="alert(1)">' });

    expect(markup).not.toContain('<img');
    expect(markup).toContain('&lt;img');
  });

  it('keeps the zero-size root so a long label never drags the circle off its point', () => {
    expect(campaignPinIcon(BASE).options.iconSize).toEqual([0, 0]);
  });
});

describe('regionBubbleIcon', () => {
  it('shows the count and the region name', () => {
    const icon = regionBubbleIcon({ name: 'Kurzeme', count: 5, active: false });
    const markup = typeof icon.options.html === 'string' ? icon.options.html : '';

    expect(markup).toContain('>5<');
    expect(markup).toContain('Kurzeme');
  });

  it('grows with the number of campaigns inside it', () => {
    const small = regionBubbleIcon({ name: 'Zemgale', count: 2, active: false });
    const large = regionBubbleIcon({ name: 'Zemgale', count: 12, active: false });

    expect(diameterOf(small)).toBeLessThan(diameterOf(large));
  });
});

describe('escapeHtml', () => {
  it('escapes every character that could close an attribute or open a tag', () => {
    expect(escapeHtml(`<a href="x" title='y'>&`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;',
    );
  });

  it('leaves ordinary Latvian text alone', () => {
    expect(escapeHtml('Rīga un Pierīga')).toBe('Rīga un Pierīga');
  });
});

function diameterOf(icon: DivIcon): number {
  const markup = typeof icon.options.html === 'string' ? icon.options.html : '';
  const match = /width:(\d+)px/.exec(markup);
  return match === null ? 0 : Number(match[1]);
}
