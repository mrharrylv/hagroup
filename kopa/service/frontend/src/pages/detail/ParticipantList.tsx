import { useState } from 'react';
import { formatNumber } from '../../domain/dates';
import { useI18n } from '../../i18n/useI18n';
import type { Campaign, Participant } from '../../domain/types';
import { buyerTypeLabel, daysAgoLabel, firstName, initialOf, isYou, unitShort } from './labels';

const PREVIEW_COUNT = 8;

export function ParticipantList({ campaign }: { campaign: Campaign }) {
  const { lang, t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const participants = campaign.participants;

  if (participants.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        {t(
          'detail.noParticipants',
          'Nobody has committed yet. The first buyer sets the ladder going.',
        )}
      </p>
    );
  }

  const shown = expanded ? participants : participants.slice(0, PREVIEW_COUNT);
  const hidden = participants.length - shown.length;

  return (
    <div>
      <ul className="divide-y divide-slate-100">
        {shown.map((participant) => (
          <ParticipantRow
            key={participant.id}
            participant={participant}
            unit={unitShort(campaign, lang)}
          />
        ))}
      </ul>

      {participants.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="focus-visible:outline-brand-600 mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2"
          aria-expanded={expanded}
        >
          {expanded
            ? t('detail.showFewer', 'Show fewer')
            : `${t('detail.showAll', 'Show all')} ${formatNumber(participants.length, lang)} (+${formatNumber(hidden, lang)})`}
        </button>
      )}
    </div>
  );
}

function ParticipantRow({ participant, unit }: { participant: Participant; unit: string }) {
  const { lang, t } = useI18n();
  const you = isYou(participant.name);

  return (
    <li className={`flex items-center gap-3 py-2.5 ${you ? 'bg-brand-50/60 -mx-2 px-2' : ''}`}>
      <span
        aria-hidden="true"
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          you ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
        }`}
      >
        {initialOf(participant.name)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {firstName(participant.name)}
          {you && (
            <span className="text-brand-700 ml-1.5 text-xs font-semibold">
              {t('detail.you', '(you)')}
            </span>
          )}
          {participant.org !== undefined && (
            <span className="ml-1.5 text-xs font-normal text-slate-500">{participant.org}</span>
          )}
        </p>
        <p className="text-xs text-slate-500">
          <span className="rounded bg-slate-100 px-1.5 py-0.5">
            {buyerTypeLabel(participant.type, t)}
          </span>{' '}
          · {t('detail.joinedPrefix', 'joined')} {daysAgoLabel(participant.joinedDaysAgo, t)}
        </p>
      </div>

      <div className="shrink-0 text-right text-sm font-semibold text-slate-800 tabular-nums">
        {formatNumber(participant.units, lang)}
        <span className="ml-1 text-xs font-normal text-slate-500">{unit}</span>
      </div>
    </li>
  );
}
