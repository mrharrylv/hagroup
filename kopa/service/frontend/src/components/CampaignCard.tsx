import { Link } from 'react-router-dom';
import { cityById } from '../data/cities';
import { unitById } from '../data/taxonomy';
import { dateFromOffset, formatMoney, formatNumber } from '../domain/dates';
import { pricingSnapshot } from '../domain/pricing';
import { headlineProgress, statusOf, totalsFor } from '../domain/status';
import { useI18n } from '../i18n/useI18n';
import { useKopa } from '../state/useKopa';
import { daysLeftLabel } from '../i18n/dayCount';
import { badgesFor, progressTone } from './badges';
import { CategoryIcon } from './CategoryIcon';
import { NextTierHint } from './TierLadder';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import type { Campaign } from '../domain/types';

export function CampaignCard({
  campaign,
  dimmed = false,
  highlighted = false,
  compact = false,
}: {
  campaign: Campaign;
  /** Search is active and this campaign does not match. */
  dimmed?: boolean;
  highlighted?: boolean;
  compact?: boolean;
}) {
  const { lang, t, loc } = useI18n();
  const { now, hasJoined } = useKopa();

  const totals = totalsFor(campaign, campaign.participants);
  const status = statusOf(campaign, totals);
  const snapshot = pricingSnapshot(campaign, totals);
  const badges = badgesFor(campaign, totals, status);
  const city = cityById(campaign.cityId);
  const unit = unitById(campaign.unit);
  const endsAt = dateFromOffset(campaign.endsInDays, now);
  const joined = hasJoined(campaign.id);

  return (
    <Link
      to={`/campaigns/${campaign.slug}`}
      className={[
        'group flex flex-col rounded-xl border bg-white p-4 transition',
        'hover:border-brand-400 hover:shadow-md focus-visible:outline-brand-600 focus-visible:outline-2',
        highlighted ? 'border-brand-500 ring-brand-200 ring-2' : 'border-slate-200',
        dimmed ? 'opacity-40' : 'opacity-100',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <CategoryIcon category={campaign.category} size={compact ? 'sm' : 'md'} />
        <div className="min-w-0 flex-1">
          <h3 className="group-hover:text-brand-800 truncate text-base font-semibold text-slate-900">
            {loc(campaign.title)}
          </h3>
          <p className="truncate text-sm text-slate-500">
            {city?.name ?? campaign.cityId} · {campaign.radiusKm} km ·{' '}
            {campaign.audience === 'business'
              ? t('audience.business', 'Businesses')
              : campaign.audience === 'individual'
                ? t('audience.individual', 'Individuals')
                : t('audience.mixed', 'Everyone')}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {badges.map((badge) => (
          <Badge key={badge.key} tone={badge.tone}>
            {t(badge.key, badge.label)}
          </Badge>
        ))}
        {joined && <Badge tone="brand">{t('badge.joined', 'You joined')}</Badge>}
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-baseline justify-between text-sm">
          <span className="font-medium text-slate-700">
            {formatNumber(totals.buyerCount, lang)} / {formatNumber(campaign.targetBuyers, lang)}{' '}
            {t('campaign.buyers', 'buyers')}
          </span>
          <span className="text-xs text-slate-500 tabular-nums">
            {formatNumber(totals.committedUnits, lang)} / {formatNumber(campaign.targetUnits, lang)}{' '}
            {unit?.long[lang] ?? campaign.unit}
          </span>
        </div>
        <Progress
          value={headlineProgress(totals)}
          tone={progressTone(totals, status)}
          label={loc(campaign.title)}
        />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-slate-900 tabular-nums">
            {formatMoney(snapshot.current.pricePerUnit, lang)}
            <span className="text-sm font-normal text-slate-500">
              {' '}
              / {unit?.short[lang] ?? campaign.unit}
            </span>
          </div>
          {snapshot.savingPerUnit > 0 && (
            <div className="text-xs text-slate-500">
              <s>{formatMoney(campaign.retailPricePerUnit, lang)}</s>{' '}
              <span className="font-medium text-emerald-700">
                −{snapshot.savingPercent}% {t('campaign.vsRetail', 'vs retail')}
              </span>
            </div>
          )}
        </div>
        <div className="text-right text-xs text-slate-500">
          {campaign.endsInDays < 0
            ? t('time.ended', 'Ended')
            : campaign.endsInDays === 0
              ? t('time.today', 'Ends today')
              : daysLeftLabel(campaign.endsInDays, lang, t)}
          <div className="text-slate-400">
            {endsAt.toLocaleDateString(lang === 'lv' ? 'lv-LV' : 'en-GB', {
              day: 'numeric',
              month: 'short',
            })}
          </div>
        </div>
      </div>

      {!compact && <NextTierHint campaign={campaign} totals={totals} className="mt-3" />}
    </Link>
  );
}
