import { Stat } from '../../components/ui/Stat';
import { regionById } from '../../data/regions';
import { formatNumber } from '../../domain/dates';
import type { Campaign } from '../../domain/types';
import { useI18n } from '../../i18n/useI18n';
import { summarise } from './stats';

export function SummaryStats({ campaigns }: { campaigns: readonly Campaign[] }) {
  const { lang, t, loc } = useI18n();
  const summary = summarise(campaigns);
  const region = summary.topRegion === null ? undefined : regionById(summary.topRegion.id);

  return (
    <section className="py-12">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<span aria-hidden="true">📣</span>}
          label={t('home.stats.active', 'Active group buys')}
          value={formatNumber(summary.activeCount, lang)}
          hint={t('home.stats.activeHint', 'Open for new buyers right now')}
        />
        <Stat
          icon={<span aria-hidden="true">👥</span>}
          label={t('home.stats.buyers', 'Buyers joined')}
          value={formatNumber(summary.totalBuyers, lang)}
          hint={t('home.stats.buyersHint', 'Households and businesses pooling orders')}
        />
        <Stat
          icon={<span aria-hidden="true">💶</span>}
          label={t('home.stats.saving', 'Average saving')}
          value={`${formatNumber(summary.averageSavingPercent, lang)}%`}
          hint={t('home.stats.savingHint', 'At the best tier, against retail')}
        />
        <Stat
          icon={<span aria-hidden="true">📍</span>}
          label={t('home.stats.region', 'Most active region')}
          value={region === undefined ? '—' : loc(region.name)}
          hint={
            summary.topRegion === null
              ? t('home.stats.regionEmpty', 'No campaigns yet')
              : `${formatNumber(summary.topRegion.count, lang)} ${t('home.stats.regionHint', 'campaigns running')}`
          }
        />
      </div>
    </section>
  );
}
