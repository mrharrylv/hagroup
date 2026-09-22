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

/**
 * A cold load over the network can paint the map container before its
 * stylesheet arrives, so Leaflet measures it as 0x0. `fitBounds` against zero
 * pixels clamps to maxZoom and offsets the map pane by half the container: the
 * deployed page rendered as a single tile floating in an empty canvas with all
 * thirty pins off-screen, while every overlay control said "30 on the map".
 * It only reproduced over CloudFront — locally the CSS was always already there.
 *
 * The framing effect must therefore wait for a real measurement instead of
 * trusting the first one, and must stay retryable until it gets one.
 */
describe('the map framing effect', () => {
  const SOURCE = Object.values(
    import.meta.glob('../MapPage.tsx', { query: '?raw', import: 'default', eager: true }),
  )[0] as string;

  it('only claims a container once it has been measured non-zero', () => {
    expect(SOURCE).toContain('element.clientWidth > 0 && element.clientHeight > 0');
    expect(SOURCE).toContain('setContainerReady(true)');
  });

  it('refuses to frame the map before that measurement', () => {
    expect(SOURCE).toContain('if (map === null || !containerReady || focusedRef.current) return;');
  });

  it('re-runs when the measurement arrives, rather than latching on first paint', () => {
    const effect = SOURCE.slice(SOURCE.indexOf('const focusedRef'));
    const deps = effect.slice(effect.indexOf('}, ['), effect.indexOf(');', effect.indexOf('}, [')));
    expect(deps).toContain('containerReady');
  });

  it('keeps observing the container so a later resize still invalidates', () => {
    expect(SOURCE).toContain('new ResizeObserver(measure)');
    expect(SOURCE).toContain('observer.disconnect()');
  });
});
