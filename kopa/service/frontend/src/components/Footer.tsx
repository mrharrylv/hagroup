import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="bg-brand-700 inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm text-white">
              K
            </span>
            Kopā
          </div>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            {t(
              'footer.tagline',
              'Latvia’s group buying platform for fuel, pellets, building materials and more.',
            )}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {t('footer.platform', 'Platform')}
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>
              <Link to="/map" className="hover:text-brand-700">
                {t('nav.map', 'Map')}
              </Link>
            </li>
            <li>
              <Link to="/campaigns" className="hover:text-brand-700">
                {t('nav.campaigns', 'Group buys')}
              </Link>
            </li>
            <li>
              <Link to="/start" className="hover:text-brand-700">
                {t('cta.start', 'Start a group buy')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {t('footer.business', 'Business')}
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>
              <Link to="/suppliers" className="hover:text-brand-700">
                {t('nav.suppliers', 'For suppliers')}
              </Link>
            </li>
            <li>
              <Link to="/demo" className="hover:text-brand-700">
                {t('nav.dashboard', 'Demo dashboard')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">{t('footer.about', 'About')}</h3>
          <p className="mt-2 text-sm text-slate-500">
            {t(
              'footer.disclaimer',
              'Concept demo. Every campaign, price, participant and supplier on this site is invented. No orders are placed and no payments are taken.',
            )}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-4 text-center text-xs text-slate-400">
        Kopā — HA Group concept demo · {t('footer.mock', 'mock data only')}
      </div>
    </footer>
  );
}
