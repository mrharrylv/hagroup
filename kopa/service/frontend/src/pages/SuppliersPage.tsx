import { useMemo } from 'react';
import { useKopa } from '../state/useKopa';
import { bidTargets, demandRows, liveCampaigns } from './suppliers/demand';
import { DemandBoard } from './suppliers/DemandBoard';
import { HowABidWorks } from './suppliers/HowABidWorks';
import { ListingForm } from './suppliers/ListingForm';
import { OpenForBids } from './suppliers/OpenForBids';
import { SupplierHero } from './suppliers/SupplierHero';
import { WhySuppliersWin } from './suppliers/WhySuppliersWin';

/**
 * The supplier-facing view: what is being pooled right now, and how to bid on
 * it. Every number comes from the live campaign list via the pure helpers in
 * `suppliers/demand.ts`, derived once here and handed down, so the hero, the
 * board and the bid list can never disagree with each other.
 */
export default function SuppliersPage() {
  const { campaigns } = useKopa();

  const live = useMemo(() => liveCampaigns(campaigns), [campaigns]);
  const rows = useMemo(() => demandRows(live), [live]);
  const targets = useMemo(() => bidTargets(live), [live]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <SupplierHero rows={rows} />
      <WhySuppliersWin />
      <DemandBoard rows={rows} />
      <OpenForBids targets={targets} />
      <HowABidWorks />
      <ListingForm />
    </div>
  );
}
