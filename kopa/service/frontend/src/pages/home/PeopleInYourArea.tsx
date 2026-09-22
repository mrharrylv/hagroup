import { CampaignCard } from '../../components/CampaignCard';
import { regionById } from '../../data/regions';
import { formatNumber } from '../../domain/dates';
import type { Campaign } from '../../domain/types';
import { useI18n } from '../../i18n/useI18n';
import { MoreLink, Section } from './Section';
import { activeCampaigns, mostJoined, topRegions } from './stats';

export function PeopleInYourArea({ campaigns }: { campaigns: readonly Campaign[] }) {
  const { lang, t, loc } = useI18n();

  // "Are interested in" is present tense: only open group buys count, and the
  // same live subset ranks the region so this agrees with the stat tile above.
  const live = activeCampaigns(campaigns);
  const busiest = topRegions(live)[0] ?? null;
  const region = busiest === null ? undefined : regionById(busiest.id);
  const inRegion = busiest === null ? [] : live.filter((c) => c.regionId === busiest.id);
  const picks = mostJoined(inRegion).slice(0, 3);

  const regionName =
    region === undefined ? t('home.area.yourRegion', 'your region') : loc(region.name);
  const heading = t('home.area.title', 'People in {region} are interested in…').replace(
    '{region}',
    regionName,
  );

  return (
    <Section>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{heading}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {busiest === null
                ? t('home.area.leadEmpty', 'Nothing is open anywhere yet.')
                : `${formatNumber(busiest.count, lang)} ${t('home.area.lead', 'group buys, most joined first.')}`}
            </p>
          </div>
          {region !== undefined && (
            <MoreLink to={`/map?region=${region.id}`}>
              {t('home.area.onMap', 'See the region on the map')}
            </MoreLink>
          )}
        </div>

        {picks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            {t('home.area.empty', 'No campaigns to show here yet.')}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} compact />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
