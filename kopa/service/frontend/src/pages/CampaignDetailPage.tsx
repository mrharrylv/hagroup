import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { JoinModal } from '../components/JoinModal';
import { dateFromOffset, formatNumber } from '../domain/dates';
import { statusOf, totalsFor } from '../domain/status';
import { useI18n } from '../i18n/useI18n';
import { useKopa } from '../state/useKopa';
import type { Campaign } from '../domain/types';
import { DetailHeader } from './detail/DetailHeader';
import { FaqList } from './detail/FaqList';
import { JoinPanel, MobileJoinBar } from './detail/JoinPanel';
import { MiniMap } from './detail/MiniMap';
import { NearbyList } from './detail/NearbyList';
import { NotFoundPanel, UnpricedPanel } from './detail/NotFoundPanel';
import { ParticipantList } from './detail/ParticipantList';
import { PricingBlock } from './detail/PricingBlock';
import { ProgressBlock } from './detail/ProgressBlock';
import { Section } from './detail/Section';
import { SupplierPanel } from './detail/SupplierPanel';
import { unitLong } from './detail/labels';

export default function CampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { bySlug } = useKopa();

  const campaign = slug === undefined ? undefined : bySlug(slug);
  if (campaign === undefined) return <NotFoundPanel slug={slug} />;

  // Every price on this page comes from a tier; with none there is nothing to
  // price and `activeTier` throws rather than guess.
  if (campaign.tiers.length === 0) return <UnpricedPanel />;

  // Keyed by id so navigating between campaigns (the "nearby" cards do exactly
  // that, without unmounting this route) starts the next one clean: no stale
  // success banner, no open join modal, no expanded participant list.
  return <CampaignDetail key={campaign.id} campaign={campaign} />;
}

function CampaignDetail({ campaign }: { campaign: Campaign }) {
  const { now } = useKopa();
  const { lang, t, loc } = useI18n();

  const [modalOpen, setModalOpen] = useState(false);
  const [justJoined, setJustJoined] = useState<number | null>(null);

  const totals = totalsFor(campaign, campaign.participants);
  const status = statusOf(campaign, totals);
  const endsAt = dateFromOffset(campaign.endsInDays, now);
  const startedAt = dateFromOffset(-campaign.startedDaysAgo, now);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      {justJoined !== null && (
        <div
          role="status"
          className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
        >
          <p className="text-sm text-emerald-900">
            <span className="font-semibold">
              {t('detail.joinSuccessTitle', 'You committed')}{' '}
              {formatNumber(justJoined, lang)} {unitLong(campaign, lang)}.
            </span>{' '}
            {t('detail.joinSuccessBody', 'The bar has moved.')}
          </p>
          <button
            type="button"
            onClick={() => setJustJoined(null)}
            className="focus-visible:outline-emerald-700 shrink-0 rounded p-1 text-emerald-700 hover:bg-emerald-100 focus-visible:outline-2"
            aria-label={t('cta.close', 'Dismiss')}
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
        <div className="min-w-0 space-y-6">
          <DetailHeader
            campaign={campaign}
            totals={totals}
            status={status}
            startedAt={startedAt}
          />

          <ProgressBlock campaign={campaign} totals={totals} status={status} endsAt={endsAt} />

          <Section
            title={t('detail.whereTitle', 'Where this order is pooled')}
            subtitle={t(
              'detail.mapSubtitle',
              'The circle is the catchment — buyers inside it share one delivery.',
            )}
          >
            <MiniMap campaign={campaign} />
          </Section>

          <Section
            title={t('campaign.tiers', 'Price ladder')}
            subtitle={t('detail.pricingSubtitle', 'The price everyone pays drops as volume adds up.')}
          >
            <PricingBlock campaign={campaign} totals={totals} />
          </Section>

          <Section title={t('campaign.description', 'About this group buy')}>
            <p className="text-[15px] leading-relaxed whitespace-pre-line text-slate-700">
              {loc(campaign.description)}
            </p>
          </Section>

          <Section
            title={t('campaign.participants', 'Who has joined')}
            subtitle={`${formatNumber(totals.buyerCount, lang)} ${t('detail.participantsSubtitle', 'buyers so far')}`}
          >
            <ParticipantList campaign={campaign} />
          </Section>

          <Section
            title={t('campaign.suppliers', 'Supplier interest')}
            subtitle={t(
              'detail.suppliersSubtitle',
              'Indicative offers. Nothing is awarded until the campaign closes.',
            )}
          >
            <SupplierPanel campaign={campaign} totals={totals} />
          </Section>

          <Section title={t('campaign.faq', 'Questions')}>
            <FaqList campaign={campaign} />
          </Section>

          <Section title={t('detail.nearbyTitle', 'Suggested nearby campaigns')}>
            <NearbyList campaign={campaign} />
          </Section>

          {/* Clearance for the fixed action bar, which only exists below lg.
              The bar is ~69px plus the iOS home-indicator inset. */}
          <div
            className="h-[calc(5.5rem+env(safe-area-inset-bottom))] lg:hidden"
            aria-hidden="true"
          />
        </div>

        <aside className="hidden lg:sticky lg:top-[4.5rem] lg:block">
          <JoinPanel
            campaign={campaign}
            totals={totals}
            status={status}
            endsAt={endsAt}
            onJoinClick={() => setModalOpen(true)}
          />
        </aside>
      </div>

      <MobileJoinBar
        campaign={campaign}
        totals={totals}
        status={status}
        onJoinClick={() => setModalOpen(true)}
      />

      {modalOpen && (
        <JoinModal
          campaign={campaign}
          onClose={() => setModalOpen(false)}
          onJoined={(units) => setJustJoined(units)}
        />
      )}
    </div>
  );
}
