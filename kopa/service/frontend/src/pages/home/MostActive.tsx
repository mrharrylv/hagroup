import { Link } from 'react-router-dom';
import { CategoryIcon } from '../../components/CategoryIcon';
import { categoryById } from '../../data/taxonomy';
import { formatNumber } from '../../domain/dates';
import type { Campaign } from '../../domain/types';
import { useI18n } from '../../i18n/useI18n';
import { MoreLink, Section } from './Section';
import { activeCampaigns, topCategories } from './stats';

export function MostActive({ campaigns }: { campaigns: readonly Campaign[] }) {
  const { lang, t, loc } = useI18n();
  // Closed group buys are not "active this week", so they do not rank here.
  const leaders = topCategories(activeCampaigns(campaigns)).slice(0, 3);

  return (
    <Section
      title={t('home.active.title', 'Most active this week')}
      lead={t('home.active.lead', 'The categories people are pooling orders in right now.')}
      action={<MoreLink to="/campaigns">{t('home.active.all', 'All categories')}</MoreLink>}
    >
      {leaders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          {t('home.active.empty', 'Nothing is open right now, so there is no ranking to show.')}
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {leaders.map((entry) => {
            const category = categoryById(entry.id);
            return (
              <li key={entry.id}>
                <Link
                  to={`/campaigns?category=${entry.id}`}
                  className="hover:bg-brand-50 focus-visible:outline-brand-700 flex items-center gap-4 px-4 py-4 transition focus-visible:outline-2 focus-visible:-outline-offset-2"
                >
                  <CategoryIcon category={entry.id} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-semibold text-slate-900">
                      {category === undefined ? entry.id : loc(category.name)}
                    </span>
                    <span className="block text-sm text-slate-500">
                      {formatNumber(entry.count, lang)}{' '}
                      {t('home.active.campaigns', 'group buys')} ·{' '}
                      {formatNumber(entry.buyers, lang)} {t('home.active.buyers', 'buyers joined')}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-brand-700 text-sm font-medium">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
