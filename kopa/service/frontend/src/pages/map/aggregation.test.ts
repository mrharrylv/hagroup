import { describe, expect, it } from 'vitest';
import { AGGREGATE_BELOW_ZOOM, MAX_ZOOM, MIN_ZOOM, fitLooksMeasured, shouldAggregate } from './aggregation';

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

  // These three replaced an earlier set that pinned a `containerReady` boolean
  // and a `clientWidth > 0` check. That shape passed its own tests and still
  // shipped the bug below: a non-zero clientWidth is not the same as Leaflet
  // having measured it, the boolean latched on the first paint, and the framing
  // never ran again. The measurement is now a size, not a flag, so a later
  // measurement is a new value and re-runs the effect.
  it('records the measured size rather than a one-way ready flag', () => {
    expect(SOURCE).toContain('setContainerSize(');
    expect(SOURCE, 'a boolean cannot carry a second, better measurement').not.toContain(
      'setContainerReady',
    );
  });

  it('refuses to frame the map before any measurement', () => {
    expect(SOURCE).toContain('if (map === null || containerSize === null || focusedRef.current) return;');
  });

  it('re-runs on every new measurement, rather than latching on first paint', () => {
    const effect = SOURCE.slice(SOURCE.indexOf('const focusedRef'));
    const deps = effect.slice(effect.indexOf('}, ['), effect.indexOf(');', effect.indexOf('}, [')));
    expect(deps).toContain('containerSize');
  });

  it('only stops retrying once the fit itself looks trustworthy', () => {
    expect(SOURCE).toContain('focusedRef.current = fitLooksMeasured(map.getZoom())');
  });

  it('keeps observing the container so a later resize still invalidates', () => {
    expect(SOURCE).toContain('new ResizeObserver(measure)');
    expect(SOURCE).toContain('observer.disconnect()');
  });
});

/**
 * The bug this guards against shipped, and only showed on a cold load over the
 * CDN: /map opened at zoom 14 over a field near Ogre with all thirty pins
 * thousands of pixels off-screen. The centre was right and the zoom was
 * absurd, which is the signature of `fitBounds` measuring a container that was
 * not laid out yet — it fits the country into zero pixels and clamps to
 * maxZoom. The framing effect had a one-shot guard, so it never retried.
 */
describe('fitLooksMeasured', () => {
  it('rejects a fit that clamped to maxZoom', () => {
    expect(fitLooksMeasured(MAX_ZOOM)).toBe(false);
  });

  it('accepts the zoom a real container produces for the whole country', () => {
    // Latvia lands around 7 on a desktop and 6 on a phone.
    expect(fitLooksMeasured(MIN_ZOOM)).toBe(true);
    expect(fitLooksMeasured(7)).toBe(true);
    expect(fitLooksMeasured(MAX_ZOOM - 1)).toBe(true);
  });

  it('rejects anything past the ceiling too, rather than only the ceiling itself', () => {
    expect(fitLooksMeasured(MAX_ZOOM + 1)).toBe(false);
  });
});

describe('the zoom ceiling', () => {
  it('leaves room for the aggregation threshold and the pin zoom', () => {
    expect(MIN_ZOOM).toBeLessThan(AGGREGATE_BELOW_ZOOM);
    expect(AGGREGATE_BELOW_ZOOM).toBeLessThan(MAX_ZOOM);
  });

  it('is the value the map is actually constructed with', () => {
    const SOURCE = Object.values(
      import.meta.glob('../MapPage.tsx', { query: '?raw', import: 'default', eager: true }),
    )[0] as string;

    expect(SOURCE).toContain('minZoom={MIN_ZOOM}');
    expect(SOURCE).toContain('maxZoom={MAX_ZOOM}');
    expect(SOURCE, 'a literal here drifts from the constant the check uses').not.toMatch(
      /(?:min|max)Zoom=\{\d+\}/,
    );
  });

  it('retries the framing until the fit is trustworthy', () => {
    const SOURCE = Object.values(
      import.meta.glob('../MapPage.tsx', { query: '?raw', import: 'default', eager: true }),
    )[0] as string;

    // The one-shot guard is what made the bad fit permanent.
    expect(SOURCE).toContain('focusedRef.current = fitLooksMeasured(map.getZoom())');
    // And the effect has to re-run when the container reports a new size.
    expect(SOURCE).toContain('containerSize');
  });
});
