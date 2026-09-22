import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/useI18n';

function Panel({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-3xl" aria-hidden="true">
          {icon}
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{children}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            to="/campaigns"
            className="bg-brand-600 hover:bg-brand-700 focus-visible:outline-brand-700 rounded-lg px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t('detail.backToList', 'Browse all group buys')}
          </Link>
          <Link
            to="/map"
            className="focus-visible:outline-brand-600 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2"
          >
            {t('nav.map', 'Open the map')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPanel({ slug }: { slug: string | undefined }) {
  const { t } = useI18n();

  return (
    <Panel icon="🔍" title={t('detail.notFoundTitle', 'That group buy does not exist')}>
      {t(
        'detail.notFoundBody',
        'It may have been removed, or the demo data was reset in this browser.',
      )}
      {slug !== undefined && slug !== '' && (
        <>
          {' '}
          <span className="text-slate-400">({slug})</span>
        </>
      )}
    </Panel>
  );
}

/**
 * A campaign with no price tiers has no price at all — `activeTier` throws
 * rather than invent one. Demo campaigns restored from localStorage are only
 * shape-checked, so this is reachable; say so instead of blanking the page.
 */
export function UnpricedPanel() {
  const { t } = useI18n();

  return (
    <Panel icon="⚠️" title={t('detail.unpricedTitle', 'This group buy has no price ladder')}>
      {t(
        'detail.unpricedBody',
        'Its stored data is incomplete, so there is no price to show. Reset the demo from the dashboard to restore it.',
      )}
    </Panel>
  );
}
