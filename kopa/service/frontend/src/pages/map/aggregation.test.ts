import { describe, expect, it } from 'vitest';
import { AGGREGATE_BELOW_ZOOM, shouldAggregate } from './aggregation';

describe('shouldAggregate', () => {
  it('bubbles up the regions when the country is in view and nothing is typed', () => {
    expect(shouldAggregate(6, false)).toBe(true);
    expect(shouldAggregate(AGGREGATE_BELOW_ZOOM - 1, false)).toBe(true);
  });

  it('shows individual pins once the user has zoomed in', () => {
    expect(shouldAggregate(AGGREGATE_BELOW_ZOOM, false)).toBe(false);
    expect(shouldAggregate(12, false)).toBe(false);
  });

  it('drops to pins at any zoom while a search is running', () => {
    // The regression: typing "petrol" over the whole country used to report
    // "4 of 30 match" beside five region bubbles, so the answer to "where"
    // was nowhere on screen.
    expect(shouldAggregate(6, true)).toBe(false);
    expect(shouldAggregate(7, true)).toBe(false);
    expect(shouldAggregate(12, true)).toBe(false);
  });
});

/**
 * The companion to the rule above. `shouldAggregate` was correct while the
 * zoom it was handed was not: a programmatic `setView` — which is how
 * /map?city=jelgava, every region button and every pin selection move the map
 * — settled without firing anything React was listening for, so the page
 * rendered region bubbles over a map already zoomed in on one town, until the
 * user happened to zoom by hand.
 *
 * Leaflet cannot be driven meaningfully in jsdom, so this guards the wiring at
 * the source level: the events must stay subscribed.
 */
describe('the map zoom bridge', () => {
  const SOURCE = Object.values(
    import.meta.glob('../MapPage.tsx', { query: '?raw', import: 'default', eager: true }),
  )[0] as string;

  it.each(['zoomend', 'moveend', 'viewreset', 'resize', 'load'])(
    'reports the zoom back to React on %s',
    (event) => {
      expect(SOURCE).toContain(`${event}: () => onZoom(map.getZoom())`);
    },
  );

  it('decides aggregation from that reported zoom, not from a literal', () => {
    expect(SOURCE).toContain('shouldAggregate(zoom, searchActive)');
    expect(SOURCE).not.toMatch(/\bzoom\s*<\s*\d/);
  });
});
