import { CampaignCard } from '../../components/CampaignCard';
import type { Campaign } from '../../domain/types';
import { useI18n } from '../../i18n/useI18n';
import { MoreLink, Section } from './Section';
import { isActive } from './stats';

export function FeaturedCampaigns({ campaigns }: { campaigns: readonly Campaign[] }) {
  const { t } = useI18n();
  // Still six featured campaigns, but a closed one never takes a live one's slot.
  const flagged = campaigns.filter((campaign) => campaign.featured);
  const featured = [...flagged.filter(isActive), ...flagged.filter((c) => !isActive(c))].slice(0, 6);

  return (
    <Section
      title={t('home.featured.title', 'Featured group buys')}
      lead={t('home.featured.lead', 'A cross-section of what is being pooled across Latvia.')}
      action={<MoreLink to="/campaigns">{t('home.featured.all', 'See all')}</MoreLink>}
    >
      {featured.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          {t(
            'home.featured.empty',
            'Nothing is featured at the moment. Browse every open group buy instead.',
          )}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </Section>
  );
}
