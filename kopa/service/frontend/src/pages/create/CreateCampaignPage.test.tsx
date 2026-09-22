/**
 * Renders the whole create page, Leaflet and all, so the form, the live
 * preview and the tier editor are exercised together rather than in isolation.
 */
import { describe, expect, it, vi } from 'vitest';

// Runs BEFORE the imports below: Leaflet reads Browser.svg at module load, and
// jsdom's SVGElement has no createSVGRect, so it would pick a null renderer.
vi.hoisted(() => {
  if (typeof SVGElement !== 'undefined') {
    const proto = SVGElement.prototype as unknown as { createSVGRect?: () => unknown };
    if (typeof proto.createSVGRect !== 'function') proto.createSVGRect = () => ({});
  }
});

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n/I18nProvider';
import { KopaProvider } from '../../state/KopaProvider';
import CreateCampaignPage from '../CreateCampaignPage';

function mount() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <KopaProvider>
          <CreateCampaignPage />
        </KopaProvider>
      </I18nProvider>
    </MemoryRouter>,
  );
}

describe('CreateCampaignPage review', () => {
  it('mounts with the map, the ladder and the preview card', () => {
    mount();
    expect(screen.getByRole('heading', { name: /start a group buy/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByText(/live preview/i)).toBeInTheDocument();
    // seeded ladder: three rows
    expect(screen.getAllByLabelText(/Tier \d+ — Price \/ unit/i)).toHaveLength(3);
  });

  it('mirrors typing into the preview card', () => {
    mount();
    fireEvent.change(screen.getByLabelText(/product name/i), {
      target: { value: 'Wood pellets A1' },
    });
    expect(screen.getAllByText('Wood pellets A1').length).toBeGreaterThan(0);
  });

  it('blocks the FIRST submit, renders the summary and focuses it', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: /publish group buy/i }));
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveFocus();
    expect(screen.queryByText(/your group buy is live/i)).not.toBeInTheDocument();
  });

  it('clearing the retail price does not invent a 1 euro ladder', () => {
    mount();
    fireEvent.change(screen.getByLabelText(/retail price per unit/i), { target: { value: '' } });
    const prices = screen.getAllByLabelText(/Tier \d+ — Price \/ unit/i) as HTMLInputElement[];
    expect(prices.map((input) => input.value)).toEqual(['', '', '']);
  });

  it('reaches the success screen with both links', () => {
    mount();
    fireEvent.change(screen.getByLabelText(/product name/i), {
      target: { value: 'Wood pellets A1' },
    });
    fireEvent.change(screen.getByLabelText(/contact name/i), { target: { value: 'Ilze' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'a@b.lv' } });
    fireEvent.click(screen.getByRole('button', { name: /publish group buy/i }));

    expect(screen.getByText(/your group buy is live/i)).toBeInTheDocument();
    const view = screen.getByRole('link', { name: /view your campaign/i });
    expect(view.getAttribute('href')).toMatch(/^\/campaigns\//);
    const onMap = screen.getByRole('link', { name: /see it on the map/i });
    expect(onMap.getAttribute('href')).toMatch(/^\/map\?c=/);
  });

  it('short unit suffix is used, not the long one', () => {
    mount();
    expect(screen.queryByText('tonnes')).not.toBeInTheDocument();
  });

  it('survives every numeric field being emptied at once', () => {
    mount();
    for (const label of [
      /total quantity wanted/i,
      /buyers wanted/i,
      /your own commitment/i,
      /retail price per unit/i,
    ]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value: '' } });
    }
    // preview still renders, no divide-by-zero, no empty-tier throw
    expect(screen.getByText(/live preview/i)).toBeInTheDocument();
    expect(screen.getByText(/best price on offer/i)).toBeInTheDocument();
  });

  it('cannot delete the last tier, and can add one', () => {
    mount();
    const removeButtons = () => screen.getAllByRole('button', { name: /remove tier/i });
    fireEvent.click(removeButtons()[2]);
    fireEvent.click(removeButtons()[1]);
    expect(removeButtons()).toHaveLength(1);
    expect(removeButtons()[0]).toBeDisabled();
    expect(screen.getByText(/live preview/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /add tier/i }));
    expect(removeButtons()).toHaveLength(2);
  });

  it('city change moves the pin readout and radius chips toggle', () => {
    mount();
    fireEvent.change(screen.getByLabelText(/nearest city or town/i), {
      target: { value: 'liepaja' },
    });
    expect(screen.getByText(/56\.5047, 21\.0108/)).toBeInTheDocument();

    const chip = screen.getByRole('button', { name: '50 km' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '20 km' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('changing the category re-renders the pin without throwing', () => {
    mount();
    fireEvent.change(screen.getByLabelText(/product category/i), {
      target: { value: 'restaurant-supplies' },
    });
    expect(screen.getByText(/live preview/i)).toBeInTheDocument();
  });
});
