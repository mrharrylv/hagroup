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
      {/* Decorative Aurora glow — radiates up & down and bleeds behind the
          neighbouring sections from the background instead of sitting in a gap */}
      <div className="relative h-64 sm:h-80 md:h-96 -my-16 sm:-my-20 md:-my-24 -z-10 pointer-events-none opacity-60">
        <Aurora
          colorStops={['#6366f1', '#8b5cf6', '#a78bfa']}
          amplitude={1.0}
          blend={0.5}
          speed={1.0}
        />
      </div>
      <div className="max-w-5xl mx-auto px-8">
        <hr className="border-zinc-200 dark:border-zinc-800/60" />
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
