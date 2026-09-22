import { useKopa } from '../state/useKopa';
import { ClosingCta } from './home/ClosingCta';
import { FeaturedCampaigns } from './home/FeaturedCampaigns';
import { ForSuppliers } from './home/ForSuppliers';
import { Hero } from './home/Hero';
import { HowItWorks } from './home/HowItWorks';
import { MapPreview } from './home/MapPreview';
import { MostActive } from './home/MostActive';
import { PeopleInYourArea } from './home/PeopleInYourArea';
import { SummaryStats } from './home/SummaryStats';
import { Testimonials } from './home/Testimonials';

/**
 * The landing page. Every number, pin and ranking on it is derived from the live
 * campaign list, so it stays honest as campaigns are joined or created.
 */
export default function HomePage() {
  const { campaigns } = useKopa();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <Hero />
      <SummaryStats campaigns={campaigns} />
      <HowItWorks />
      <FeaturedCampaigns campaigns={campaigns} />
      <MapPreview campaigns={campaigns} />
      <MostActive campaigns={campaigns} />
      <PeopleInYourArea campaigns={campaigns} />
      <ForSuppliers />
      <Testimonials />
      <ClosingCta />
    </div>
  );
}
