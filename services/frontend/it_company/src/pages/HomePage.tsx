import Hero from '../components/sections/Hero';
import TechStack from '../components/sections/TechStack';
import Services from '../components/sections/Services';
import Methodology from '../components/sections/Methodology';
import Work from '../components/sections/Work';
import Reviews from '../components/sections/Reviews';
import Contact from '../components/sections/Contact';
import Aurora from '../components/ui/Aurora';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TechStack />
      <Services />
      <div className="max-w-5xl mx-auto px-8">
        <hr className="border-zinc-200 dark:border-zinc-800/60" />
      </div>
      <Methodology />
      {/* Decorative Aurora divider */}
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
        <Aurora
          colorStops={['#6366f1', '#8b5cf6', '#a78bfa']}
          amplitude={1.0}
          blend={0.5}
          speed={1.0}
        />
      </div>
      <Work />
      <Reviews />
      <div className="max-w-5xl mx-auto px-8">
        <hr className="border-zinc-200 dark:border-zinc-800/60" />
      </div>
      <Contact />
    </>
  );
}
