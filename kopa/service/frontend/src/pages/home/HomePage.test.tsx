import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

// Leaflet sniffs `SVGElement.prototype.createSVGRect` to decide it can render
// vectors. jsdom has no such method, so `L.svg()` returns null and the first
// CircleMarker throws inside `map.getRenderer`. Every real browser has it, so
// this stub removes a jsdom-only false negative rather than hiding a bug.
vi.hoisted(() => {
  const proto = globalThis.SVGElement?.prototype as unknown as Record<string, unknown> | undefined;
  if (proto !== undefined && proto.createSVGRect === undefined) {
    proto.createSVGRect = () => ({});
  }
});

import { I18nProvider } from '../../i18n/I18nProvider';
import { KopaProvider } from '../../state/KopaProvider';
import HomePage from '../HomePage';
import { FeaturedCampaigns } from './FeaturedCampaigns';
import { MapPreview } from './MapPreview';
import { MostActive } from './MostActive';
import { PeopleInYourArea } from './PeopleInYourArea';
import { SummaryStats } from './SummaryStats';

function wrap(node: React.ReactNode) {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <KopaProvider>{node}</KopaProvider>
      </I18nProvider>
    </MemoryRouter>,
  );
}

/**
 * Nothing here asserts a campaign by name: the seed list is another module's
 * business and may be re-written. These pin the page's own contract — it
 * mounts, its derived numbers are finite, and every section has an empty state.
 */
describe('HomePage', () => {
  it('mounts with whatever the store holds, Leaflet markers included', () => {
    wrap(<HomePage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Buy together. Pay wholesale.',
    );
    expect(screen.getByRole('link', { name: /Open the full map/i })).toHaveAttribute('href', '/map');
    expect(screen.getAllByRole('link', { name: /Browse group buys/i })[0]).toHaveAttribute(
      'href',
      '/map',
    );
    expect(screen.getAllByRole('link', { name: /Start a group buy/i })[0]).toHaveAttribute(
      'href',
      '/start',
    );
  });

  it('never renders a broken number or an unsubstituted placeholder', () => {
    wrap(<HomePage />);

    // `{region}` is substituted at render time; NaN/Infinity would mean a
    // divide-by-zero or a campaign with no price tiers reached a stat tile.
    expect(document.body.textContent ?? '').not.toMatch(/NaN|Infinity|\{region\}/);
  });

  it('shows an explicit empty state in every derived section', () => {
    wrap(
      <>
        <SummaryStats campaigns={[]} />
        <FeaturedCampaigns campaigns={[]} />
        <MapPreview campaigns={[]} />
        <MostActive campaigns={[]} />
        <PeopleInYourArea campaigns={[]} />
      </>,
    );

    expect(document.body.textContent ?? '').not.toMatch(/NaN|Infinity|\{region\}/);
    expect(screen.getByText(/Nothing is featured/)).toBeInTheDocument();
    expect(screen.getByText(/No open group buys on the map yet/)).toBeInTheDocument();
    expect(screen.getByText(/no ranking to show/)).toBeInTheDocument();
    expect(screen.getByText(/People in your region are interested/)).toBeInTheDocument();
    expect(screen.getByText(/No campaigns to show here yet/)).toBeInTheDocument();
  });
});
