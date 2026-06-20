import Hero from '../components/sections/Hero';
import TechStack from '../components/sections/TechStack';
import Services from '../components/sections/Services';
import Methodology from '../components/sections/Methodology';
import Work from '../components/sections/Work';
import Reviews from '../components/sections/Reviews';
import Contact from '../components/sections/Contact';
import Threads from '../components/ui/Threads';

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
      {/* Decorative Threads divider */}
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
        <Threads
          color={[0.39, 0.4, 0.95]}
          amplitude={2.1}
          distance={0.35}
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
