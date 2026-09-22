import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '../../i18n/I18nProvider';
import { KopaProvider } from '../../state/KopaProvider';
import CampaignsPage from '../CampaignsPage';

/** Nothing here asserts on the seed dataset, which another task owns. */
function renderAt(url: string) {
  return render(
    <I18nProvider>
      <KopaProvider>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path="/campaigns" element={<CampaignsPage />} />
          </Routes>
        </MemoryRouter>
      </KopaProvider>
    </I18nProvider>,
  );
}

describe('CampaignsPage', () => {
  it('reads filters out of the query string so a filtered list is linkable', () => {
    renderAt('/campaigns?category=heating-fuel&audience=business&sort=best-saving');

    expect(screen.getByRole('checkbox', { name: /Heating fuel/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Businesses/i })).toBeChecked();
    expect(screen.getByLabelText('Sort by')).toHaveValue('best-saving');
  });

  it('ignores ids that are not in the taxonomy', () => {
    renderAt('/campaigns?category=not-a-category&city=atlantis&sort=by-vibes');

    expect(screen.getByRole('checkbox', { name: /Heating fuel/i })).not.toBeChecked();
    expect(screen.getByLabelText('City')).toHaveValue('');
    expect(screen.getByLabelText('Sort by')).toHaveValue('ending-soon');
  });

  it('offers a way out when nothing matches', async () => {
    const user = userEvent.setup();
    renderAt('/campaigns?q=zzzz-no-such-campaign');

    expect(screen.getByText(/Nothing matches those filters/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start a group buy/i })).toHaveAttribute(
      'href',
      '/start',
    );

    await user.click(screen.getByRole('button', { name: /Clear all filters/i }));
    expect(screen.getByLabelText('Search group buys')).toHaveValue('');
  });

  it('uses the dictionary key namespace, so the rail really translates', () => {
    window.localStorage.setItem('kopa.lang.v1', 'lv');
    try {
      renderAt('/campaigns');

      // `filters.*` keys were silently absent from src/i18n/dictionary.ts, so
      // the whole rail stayed English under the LV toggle.
      expect(screen.getAllByText('Filtri').length).toBeGreaterThan(0);
      expect(screen.getByText('Kategorija')).toBeInTheDocument();
      expect(screen.getByText('Reģions')).toBeInTheDocument();
      expect(screen.getByText('Statuss')).toBeInTheDocument();
    } finally {
      window.localStorage.removeItem('kopa.lang.v1');
    }
  });

  it('lets more than one status be ticked at once', async () => {
    const user = userEvent.setup();
    renderAt('/campaigns');

    await user.click(screen.getByRole('checkbox', { name: 'Goal reached' }));
    await user.click(screen.getByRole('checkbox', { name: 'Closed' }));

    expect(screen.getByRole('checkbox', { name: 'Goal reached' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Closed' })).toBeChecked();
  });

  it('keeps the drawer addressable when shut and its input ids distinct when open', async () => {
    const user = userEvent.setup();
    const { container } = renderAt('/campaigns');

    const toggle = screen.getByRole('button', { name: /^Filters/ });
    const drawerId = toggle.getAttribute('aria-controls');
    expect(drawerId).toBeTruthy();
    expect(container.querySelector(`#${drawerId}`)).not.toBeNull();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const ids = screen
      .getAllByRole('checkbox', { name: /Heating fuel/i })
      .map((element) => element.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('removes one filter at a time from its chip', async () => {
    const user = userEvent.setup();
    renderAt('/campaigns?category=heating-fuel&region=kurzeme');

    await user.click(screen.getByRole('button', { name: /Kurzeme/i }));

    expect(screen.getByRole('checkbox', { name: /Heating fuel/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Kurzeme/i })).not.toBeChecked();
  });
});
