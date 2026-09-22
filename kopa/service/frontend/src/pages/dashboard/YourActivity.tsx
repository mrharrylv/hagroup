import { statusBadge } from '../../components/badges';
import { Badge } from '../../components/ui/Badge';
import { unitById } from '../../data/taxonomy';
import { formatNumber } from '../../domain/dates';
import { useI18n } from '../../i18n/useI18n';
import { useKopa } from '../../state/useKopa';
import { involvedIn, toPercent, yourUnits, type Facts } from './metrics';
import { CampaignLink, Empty } from './parts';

/** The campaigns you joined or started in this browser, plus the reset button. */
export function YourActivity({ facts }: { facts: readonly Facts[] }) {
  const { hasJoined, isMine, myUnits, resetDemo } = useKopa();
  const { lang, t } = useI18n();

  const rows = involvedIn(facts, (id) => hasJoined(id) || isMine(id));

  function handleReset() {
    const confirmed = window.confirm(
      t(
        'dash.resetConfirm',
        'Reset the demo? This clears the joins and campaigns saved in this browser.',
      ),
    );
    if (confirmed) resetDemo();
  }

  return (
    <section
      aria-labelledby="dash-mine"
      className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <h2 id="dash-mine" className="text-sm font-semibold text-slate-900">
            {t('dash.mine', 'Your demo activity')}
          </h2>
          <p className="text-xs text-slate-500">
            {t(
              'dash.mineHint',
              'Joins and campaigns stored in this browser only — nothing is sent anywhere.',
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="focus-visible:ring-brand-500 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:outline-none"
        >
          {t('dash.reset', 'Reset demo data')}
        </button>
      </div>

      {rows.length === 0 ? (
        <Empty>
          {t(
            'dash.mineEmpty',
            'You have not joined or started anything yet. Join a campaign and it shows up here.',
          )}
        </Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">
                  {t('dash.campaign', 'Campaign')}
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  {t('dash.role', 'Your role')}
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  {t('dash.yourUnits', 'Your units')}
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  {t('dash.statusCol', 'Status')}
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  {t('dash.progress', 'Progress')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => {
                const spec = statusBadge(f.status);
                const organiser = isMine(f.campaign.id);
                const units = yourUnits(f.campaign, myUnits(f.campaign.id), organiser);
                const short = unitById(f.campaign.unit)?.short[lang] ?? f.campaign.unit;
                const roles = [
                  organiser ? t('dash.roleOrganiser', 'Organiser') : null,
                  hasJoined(f.campaign.id) ? t('dash.roleBuyer', 'Buyer') : null,
                ].filter((role): role is string => role !== null);

                return (
                  <tr key={f.campaign.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">
                      <CampaignLink campaign={f.campaign} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-slate-600">
                      {roles.join(' · ')}
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap tabular-nums">
                      {units > 0 ? `${formatNumber(units, lang)} ${short}` : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <Badge tone={spec.tone}>{t(spec.key, spec.label)}</Badge>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{toPercent(f.progress)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
