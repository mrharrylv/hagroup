import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Campaign } from '../../domain/types';

const CAMPAIGN: Campaign = {
  id: 'c-1',
  slug: 'liepaja-diesel',
  title: { en: 'Liepāja diesel pool', lv: 'Liepājas dīzeļa koppirkums' },
  description: { en: 'Pooled diesel for hauliers.', lv: 'Kopīgs dīzelis pārvadātājiem.' },
  category: 'vehicle-fuel',
  unit: 'litre',
  audience: 'mixed',
  organizer: { name: 'Ilze Bērziņa', type: 'business', org: 'SIA Krava' },
  cityId: 'liepaja',
  regionId: 'kurzeme',
  lat: 56.5047,
  lng: 21.0108,
  radiusKm: 40,
  targetUnits: 20000,
  targetBuyers: 20,
  retailPricePerUnit: 1.62,
  tierBasis: 'units',
  tiers: [
    { min: 0, max: 4999, pricePerUnit: 1.55 },
    { min: 5000, max: 14999, pricePerUnit: 1.47 },
    { min: 15000, max: null, pricePerUnit: 1.39 },
  ],
  endsInDays: 9,
  startedDaysAgo: 6,
  participants: Array.from({ length: 11 }, (_, index) => ({
    id: `p-${index}`,
    name: index === 0 ? 'Jānis Ozols (you)' : `Buyer ${index}`,
    type: index % 2 === 0 ? ('business' as const) : ('individual' as const),
    org: index % 2 === 0 ? `SIA ${index}` : undefined,
    units: 600,
    joinedDaysAgo: index,
  })),
  faq: [
    { q: { en: 'When does it ship?', lv: 'Kad piegādā?' }, a: { en: 'Two weeks.', lv: 'Divas nedēļas.' } },
  ],
  keywords: ['diesel', 'petrol'],
  featured: true,
  supplierBids: [
    {
      supplier: 'Baltic Fuel',
      pricePerUnit: 1.41,
      note: { en: 'Tanker delivery.', lv: 'Cisternas piegāde.' },
      leadTimeDays: 10,
    },
  ],
};

/** Within the 120 km "nearby" radius of CAMPAIGN, so its card is clickable there. */
const NEARBY: Campaign = {
  ...CAMPAIGN,
  id: 'c-2',
  slug: 'kuldiga-pellets',
  title: { en: 'Kuldīga pellet pool', lv: 'Kuldīgas granulu koppirkums' },
  category: 'heating-fuel',
  unit: 'ton',
  cityId: 'kuldiga',
  lat: 56.9677,
  lng: 21.9749,
  participants: [],
  faq: [],
  supplierBids: [],
};

/**
 * A campaign restored from localStorage is only shape-checked, so an empty
 * tier array is reachable — and `activeTier` throws on one. Far enough from
 * the others that it never lands in a nearby list (whose cards would price it).
 */
const UNPRICED: Campaign = {
  ...CAMPAIGN,
  id: 'c-3',
  slug: 'daugavpils-broken',
  title: { en: 'Daugavpils broken pool', lv: 'Daugavpils bojātais koppirkums' },
  cityId: 'daugavpils',
  lat: 55.8747,
  lng: 26.5364,
  tiers: [],
  participants: [],
  faq: [],
  supplierBids: [],
};

vi.mock('../../data/campaigns', () => ({
  SEED_CAMPAIGNS: [CAMPAIGN, NEARBY, UNPRICED] as readonly Campaign[],
}));

// jsdom has neither an SVG nor a 2D canvas renderer, so Leaflet's vector layers
// cannot mount here. The map itself is verified in a real browser.
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Circle: () => null,
  Marker: () => null,
}));

const { I18nProvider } = await import('../../i18n/I18nProvider');
const { KopaProvider } = await import('../../state/KopaProvider');
const CampaignDetailPage = (await import('../CampaignDetailPage')).default;

function renderAt(path: string) {
  return render(
    <I18nProvider>
      <KopaProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/campaigns/:slug" element={<CampaignDetailPage />} />
          </Routes>
        </MemoryRouter>
      </KopaProvider>
    </I18nProvider>,
  );
}

describe('CampaignDetailPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders every block of the expanded view', () => {
    renderAt('/campaigns/liepaja-diesel');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Liepāja diesel pool');
    expect(screen.getByText('Pooled diesel for hauliers.')).toBeInTheDocument();
    expect(screen.getByText('When does it ship?')).toBeInTheDocument();
    expect(screen.getByText('Baltic Fuel')).toBeInTheDocument();
    expect(screen.getByText(/Show all/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /See on the full map/ })).toHaveAttribute(
      'href',
      '/map?c=liepaja-diesel',
    );
  });

  it('joins, banners and flips the sidebar to a joined state', async () => {
    const user = userEvent.setup();
    renderAt('/campaigns/liepaja-diesel');

    await user.click(screen.getByRole('button', { name: 'Join this group buy' }));
    await user.type(screen.getByLabelText('Your name'), 'Anna');
    const quantity = screen.getByLabelText(/Quantity/);
    await user.clear(quantity);
    await user.type(quantity, '250');
    await user.click(screen.getByRole('button', { name: 'Join group buy' }));

    expect(screen.getByRole('status')).toHaveTextContent('You committed 250 litres');
    expect(screen.getByText(/You are in this group buy/)).toBeInTheDocument();
    expect(screen.getByText('250 litres')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Commit more units' })).toBeInTheDocument();
  });

  it('shows a not-found panel for an unknown slug', () => {
    renderAt('/campaigns/nope');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('does not exist');
  });

  // Regression: the route does not unmount when only :slug changes, so the
  // success banner (and the open modal, and the expanded participant list)
  // used to follow the reader onto the next campaign.
  it('drops the join banner when navigating to another campaign', async () => {
    const user = userEvent.setup();
    renderAt('/campaigns/liepaja-diesel');

    await user.click(screen.getByRole('button', { name: 'Join this group buy' }));
    await user.type(screen.getByLabelText('Your name'), 'Anna');
    await user.click(screen.getByRole('button', { name: 'Join group buy' }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Kuldīga pellet pool/ }));

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Kuldīga pellet pool');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  // Regression: pricingSnapshot -> activeTier throws on an empty tier array,
  // which blanked the whole page instead of explaining itself.
  it('explains a campaign with no price tiers instead of throwing', () => {
    renderAt('/campaigns/daugavpils-broken');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('no price ladder');
  });
});
