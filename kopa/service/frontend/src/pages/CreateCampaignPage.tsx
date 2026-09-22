import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useI18n } from '../i18n/useI18n';
import { useKopa } from '../state/useKopa';
import { validateDraft, type CampaignDraft } from '../state/draft';
import { LivePreview } from './create/LivePreview';
import { PricingSection } from './create/PricingSection';
import { SuccessScreen } from './create/SuccessScreen';
import { WhatSection } from './create/WhatSection';
import { WhereSection } from './create/WhereSection';
import { INITIAL_DRAFT, issuesByField, previewCampaign, seedTiers } from './create/model';
import { PRIMARY_BUTTON } from './create/styles';
import type { Campaign, PriceTier } from '../domain/types';

/** Changing any of these re-seeds the ladder — until the organiser edits it. */
const RESEED_ON: readonly (keyof CampaignDraft)[] = [
  'retailPricePerUnit',
  'tierBasis',
  'targetUnits',
  'targetBuyers',
];

/** Only worth doing when the page is actually scrolled; keeps jsdom quiet too. */
function scrollToTop() {
  if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function CreateCampaignPage() {
  const { t } = useI18n();
  const { createCampaign } = useKopa();

  const [draft, setDraft] = useState<CampaignDraft>(INITIAL_DRAFT);
  const [tiersTouched, setTiersTouched] = useState(false);
  /** Counts publish attempts; errors stay hidden until the first one. */
  const [attempts, setAttempts] = useState(0);
  const [created, setCreated] = useState<Campaign | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const attempted = attempts > 0;

  /**
   * The summary only exists once an attempt has been rendered, so focus has to
   * wait for that render — focusing inside the submit handler would find
   * nothing on the very first blocked attempt.
   */
  useEffect(() => {
    if (attempts === 0) return;
    summaryRef.current?.focus();
  }, [attempts]);

  /**
   * The single immutable draft update. While the organiser has not touched the
   * ladder it follows the retail price and the goal, so the preview always
   * shows a believable discount rather than a stale one.
   */
  const update = useCallback(
    (partial: Partial<CampaignDraft>) => {
      setDraft((previous) => {
        const next = { ...previous, ...partial };
        if (tiersTouched || 'tiers' in partial) return next;
        if (!RESEED_ON.some((key) => key in partial)) return next;
        return { ...next, tiers: seedTiers(next) };
      });
    },
    [tiersTouched],
  );

  const handleTiersChange = useCallback(
    (tiers: readonly PriceTier[]) => {
      setTiersTouched(true);
      update({ tiers });
    },
    [update],
  );

  const handleReseedTiers = useCallback(() => {
    setTiersTouched(false);
    setDraft((previous) => ({ ...previous, tiers: seedTiers(previous) }));
  }, []);

  const issues = useMemo(() => validateDraft(draft), [draft]);
  const byField = useMemo(() => issuesByField(issues), [issues]);

  const errorFor = useCallback(
    (field: keyof CampaignDraft) => (attempted ? byField[field] : undefined),
    [attempted, byField],
  );

  const preview = useMemo(
    () =>
      previewCampaign(
        draft,
        t('create.preview.untitled', 'Your group buy'),
        t('create.preview.you', 'You'),
      ),
    [draft, t],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempts((previous) => previous + 1);

    if (issues.length > 0) return;

    setCreated(createCampaign(draft));
    scrollToTop();
  }

  function handleCreateAnother() {
    setCreated(null);
    setDraft(INITIAL_DRAFT);
    setTiersTouched(false);
    setAttempts(0);
    scrollToTop();
  }

  if (created !== null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <SuccessScreen campaign={created} onCreateAnother={handleCreateAnother} />
      </div>
    );
  }

  const showIssues = attempted && issues.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold text-slate-900">
          {t('create.title', 'Start a group buy')}
        </h1>
        <p className="mt-2 text-slate-600">
          {t(
            'create.subtitle',
            'Describe what you need, drop a pin, set the price ladder. Neighbours and nearby businesses join, and the unit price falls for everyone.',
          )}
        </p>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <form className="grid gap-6" onSubmit={handleSubmit} noValidate>
          <WhatSection draft={draft} update={update} errorFor={errorFor} />
          <WhereSection draft={draft} update={update} errorFor={errorFor} />
          <PricingSection
            draft={draft}
            update={update}
            errorFor={errorFor}
            onTiersChange={handleTiersChange}
            onReseedTiers={handleReseedTiers}
          />

          {showIssues && (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              id="create-issues"
              className="rounded-xl border border-rose-200 bg-rose-50 p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            >
              <p className="text-sm font-semibold text-rose-900">
                {`${issues.length} ${
                  issues.length === 1
                    ? t('create.issue.one', 'thing to fix before publishing')
                    : t('create.issue.many', 'things to fix before publishing')
                }`}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-700">
                {issues.map((issue) => (
                  <li key={`${issue.field}-${issue.message}`}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className={PRIMARY_BUTTON}
              aria-describedby={showIssues ? 'create-issues' : undefined}
            >
              {t('create.submit', 'Publish group buy')}
            </button>
            <p className="text-xs text-slate-500">
              {t(
                'create.submitNote',
                'Demo build — publishing stores the campaign in this browser only.',
              )}
            </p>
          </div>
        </form>

        <LivePreview campaign={preview} />
      </div>
    </div>
  );
}
