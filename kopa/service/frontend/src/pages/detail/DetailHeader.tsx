import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { badgesFor } from '../../components/badges';
import { CategoryIcon } from '../../components/CategoryIcon';
import { Badge } from '../../components/ui/Badge';
import { cityById } from '../../data/cities';
import { categoryById } from '../../data/taxonomy';
import { regionById } from '../../data/regions';
import { formatDate } from '../../domain/dates';
import type { CampaignTotals } from '../../domain/status';
import { useI18n } from '../../i18n/useI18n';
import { useKopa } from '../../state/useKopa';
import type { Campaign, CampaignStatus } from '../../domain/types';
import { audienceLabel, buyerTypeLabel, daysAgoLabel } from './labels';

export function DetailHeader({
  campaign,
  totals,
  status,
  startedAt,
}: {
  campaign: Campaign;
  totals: CampaignTotals;
  status: CampaignStatus;
  startedAt: Date;
}) {
  const { lang, t, loc } = useI18n();
  const { hasJoined, isMine } = useKopa();

  const city = cityById(campaign.cityId);
  const region = regionById(campaign.regionId);
  const category = categoryById(campaign.category);
  const badges = badgesFor(campaign, totals, status);
  const organiser = campaign.organizer;

  return (
    <header>
      <nav aria-label={t('a11y.breadcrumb', 'Breadcrumb')} className="text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/campaigns" className="hover:text-brand-700 underline-offset-2 hover:underline">
              {t('nav.campaigns', 'Group buys')}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{city?.name ?? campaign.cityId}</li>
          <li aria-hidden="true">/</li>
          <li className="max-w-full truncate text-slate-700">{loc(campaign.title)}</li>
        </ol>
      </nav>

      <div className="mt-4 flex items-start gap-4">
        <CategoryIcon category={campaign.category} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            {category === undefined ? campaign.category : loc(category.name)}
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold text-slate-900 sm:text-3xl">
            {loc(campaign.title)}
          </h1>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <Badge key={badge.key} tone={badge.tone}>
                {t(badge.key, badge.label)}
              </Badge>
            ))}
            {hasJoined(campaign.id) && <Badge tone="brand">{t('badge.joined', 'You joined')}</Badge>}
            {isMine(campaign.id) && (
              <Badge tone="indigo">{t('badge.yours', 'You started this')}</Badge>
            )}
          </div>
        </div>
      </div>

      <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
        <Meta label={t('campaign.location', 'Location')}>
          📍 {city?.name ?? campaign.cityId}
          {region !== undefined && <span className="text-slate-400"> · {loc(region.name)}</span>}
        </Meta>
        <Meta label={t('campaign.radius', 'Radius')}>
          🎯 {campaign.radiusKm} km {t('campaign.catchment', 'catchment')}
        </Meta>
        <Meta label={t('filter.audience', 'Buyers')}>
          👥 {audienceLabel(campaign.audience, t)}
        </Meta>
        <Meta label={t('campaign.organizer', 'Organiser')}>
          🧭 <span className="font-medium text-slate-800">{organiser.name}</span>
          {organiser.org !== undefined && (
            <span className="text-slate-500"> · {organiser.org}</span>
          )}{' '}
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
            {buyerTypeLabel(organiser.type, t)}
          </span>
        </Meta>
        <Meta label={t('campaign.opened', 'Opened')}>
          🕰️ {t('campaign.openedPrefix', 'Opened')} {daysAgoLabel(campaign.startedDaysAgo, t)}
          <span className="text-slate-400"> · {formatDate(startedAt, lang)}</span>
        </Meta>
      </dl>
    </header>
  );
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd className="flex items-center gap-1.5">{children}</dd>
    </div>
  );
}
