import { useI18n } from '../../i18n/useI18n';
import type { Campaign } from '../../domain/types';

export function FaqList({ campaign }: { campaign: Campaign }) {
  const { t, loc } = useI18n();

  if (campaign.faq.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {t(
          'detail.noFaq',
          'No questions have been answered for this campaign yet. Ask the organiser when you join.',
        )}
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {/* Index keys: the FAQ list is fixed data, and keying on the localised
          question would remount every <details> — losing what the reader has
          open — the moment the language toggle flips. */}
      {campaign.faq.map((entry, index) => (
        <details key={index} className="group py-2">
          <summary className="focus-visible:outline-brand-600 marker:content-none flex cursor-pointer list-none items-center justify-between gap-3 rounded py-1 text-sm font-medium text-slate-800 focus-visible:outline-2">
            {loc(entry.q)}
            <span
              aria-hidden="true"
              className="shrink-0 text-slate-400 transition group-open:rotate-180"
            >
              ▾
            </span>
          </summary>
          <p className="pt-1 pb-2 text-sm leading-relaxed text-slate-600">{loc(entry.a)}</p>
        </details>
      ))}
    </div>
  );
}
