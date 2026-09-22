import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

/** The map is full-bleed, so it owns the whole viewport below the header. */
const FULL_BLEED = ['/map'];

export function Layout() {
  const { pathname } = useLocation();
  const fullBleed = FULL_BLEED.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={fullBleed ? 'min-h-0 flex-1' : 'flex-1'}>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      {!fullBleed && <Footer />}
    </div>
  );
}

function PageFallback() {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center text-sm text-slate-400">
      Loading…
    </div>
  );
}
