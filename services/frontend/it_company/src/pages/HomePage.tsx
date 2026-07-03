import Hero from '../components/sections/Hero';
import TechStack from '../components/sections/TechStack';
import Services from '../components/sections/Services';
import Methodology from '../components/sections/Methodology';
import Work from '../components/sections/Work';
import Reviews from '../components/sections/Reviews';
import Contact from '../components/sections/Contact';
import Aurora from '../components/ui/Aurora';
import { useTheme } from '../context/useTheme';

export default function HomePage() {
  const { theme } = useTheme();

  return (
    <>
      <Hero />
      <TechStack />
      <Services />
      <div className="max-w-5xl mx-auto px-8">
        <hr className="border-zinc-200 dark:border-zinc-800/60" />
      </div>
      <Methodology />
      {/* Decorative separator between sections. The additive WebGL aurora
          reads as a grey smudge over white, so light mode renders it with
          multiply blending + lighter color stops → saturated ink-like waves. */}
      <div className="relative h-40 sm:h-48 md:h-56 -my-10 sm:-my-12 md:-my-14 -z-10 pointer-events-none">
        {theme === 'dark' ? (
          <div className="absolute inset-0 opacity-40">
            <Aurora
              colorStops={['#6366f1', '#8b5cf6', '#a78bfa']}
              amplitude={1.0}
              blend={0.5}
              speed={1.0}
            />
          </div>
        ) : (
          <div className="absolute inset-0 opacity-50 mix-blend-multiply [filter:saturate(3)]">
            <Aurora
              colorStops={['#6366f1', '#8b5cf6', '#a78bfa']}
              amplitude={1.0}
              blend={0.5}
              speed={1.0}
            />
          </div>
        )}
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
