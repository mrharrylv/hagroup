import Hero from '../components/sections/Hero';
import TechStack from '../components/sections/TechStack';
import Services from '../components/sections/Services';
import Methodology from '../components/sections/Methodology';
import Work from '../components/sections/Work';
import Reviews from '../components/sections/Reviews';
import Contact from '../components/sections/Contact';
import ScrollReveal from '../components/ui/ScrollReveal';
import SectionTransition from '../components/ui/SectionTransition';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ScrollReveal variant="fade" delay={40}>
        <TechStack />
      </ScrollReveal>
      <ScrollReveal variant="rise">
        <Services />
      </ScrollReveal>
      <ScrollReveal variant="scale">
        <div className="max-w-5xl mx-auto px-8">
          <hr className="border-zinc-200 dark:border-zinc-800/60" />
        </div>
      </ScrollReveal>
      <ScrollReveal variant="slide-left">
        <Methodology />
      </ScrollReveal>
      <SectionTransition />
      <ScrollReveal variant="slide-right">
        <Work />
      </ScrollReveal>
      <ScrollReveal variant="rise">
        <Reviews />
      </ScrollReveal>
      <ScrollReveal variant="scale">
        <div className="max-w-5xl mx-auto px-8">
          <hr className="border-zinc-200 dark:border-zinc-800/60" />
        </div>
      </ScrollReveal>
      <ScrollReveal variant="rise">
        <Contact />
      </ScrollReveal>
    </>
  );
}
