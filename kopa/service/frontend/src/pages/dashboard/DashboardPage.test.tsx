import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { I18nProvider } from '../../i18n/I18nProvider';
import { KopaProvider } from '../../state/KopaProvider';
import DashboardPage from '../DashboardPage';

/**
 * The page itself is now a composition of six sections, so what is worth
 * pinning is that the composition still holds: every section mounts, no
 * derived number renders as NaN, and the volume column reads as quantities
 * with units rather than one dimensionless sum.
 */

function wrap(node: ReactNode) {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <KopaProvider>{node}</KopaProvider>
      </I18nProvider>
    </MemoryRouter>,
  );
}

const UNIT_FIGURE = /\d\s(pallet|t|m³|L|carton|kg|bag|load|box)\b/;

describe('DashboardPage', () => {
  it('renders every section of the console', () => {
    wrap(<DashboardPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Marketplace dashboard');
    for (const name of [
      'Key numbers',
      'By region',
      'By category',
      'Status breakdown',
      'Closing soon, goal not reached',
      'Your demo activity',
    ]) {
      expect(screen.getByRole('region', { name }), name).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Reset demo data' })).toBeInTheDocument();
  });

  it('never renders a broken number', () => {
    wrap(<DashboardPage />);

    expect(document.body.textContent ?? '').not.toMatch(/NaN|Infinity|undefined/);
  });

  it('reports volume with its unit in both rollup tables', () => {
    wrap(<DashboardPage />);

    for (const name of ['By region', 'By category']) {
      const table = screen.getByRole('region', { name });
      expect(table.textContent ?? '', name).toMatch(UNIT_FIGURE);
    }
  });

  it('says under each table what the volume and saving columns are', () => {
    wrap(<DashboardPage />);

    for (const name of ['By region', 'By category']) {
      const table = within(screen.getByRole('region', { name }));
      expect(table.getByText(/never added together/)).toBeInTheDocument();
      expect(table.getByText(/unweighted mean/)).toBeInTheDocument();
    }
  });
});
