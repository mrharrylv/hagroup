import { Link } from 'react-router-dom';
import type { Campaign } from '../../domain/types';
import { useI18n } from '../../i18n/useI18n';

/** The two scraps every dashboard table needs: a title link and an empty note. */

export function CampaignLink({ campaign }: { campaign: Campaign }) {
  const { loc } = useI18n();

  return (
    <Link
      to={`/campaigns/${campaign.slug}`}
      className="focus-visible:ring-brand-500 rounded font-medium text-slate-900 underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
    >
      {loc(campaign.title)}
    </Link>
  );
}

export function Empty({ children }: { children: string }) {
  return <p className="px-4 pb-4 text-sm text-slate-500">{children}</p>;
}
