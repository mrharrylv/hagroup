import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CookieBanner from '../ui/CookieBanner';
import WhatsAppButton from '../ui/WhatsAppButton';
import ScrollToTop from '../ui/ScrollToTop';
import PageTransition from '../ui/PageTransition';
import ClickSpark from '../ui/ClickSpark';

export default function Layout() {
  const { pathname, hash } = useLocation();

  /* Scroll to hash target or top on navigation */
  useEffect(() => {
    if (hash) {
      // Wait for page transition to finish rendering
      const timer = setTimeout(() => {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
      return () => clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);

  return (
    <ClickSpark sparkColor="#6366f1" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
    <div className="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-100 relative min-h-screen flex flex-col">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[40rem] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <Header />

      <main className="flex-grow pt-20 sm:pt-24 pb-16 sm:pb-20">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
      <CookieBanner />
    </div>
    </ClickSpark>
  );
}
