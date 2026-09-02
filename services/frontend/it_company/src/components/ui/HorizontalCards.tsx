import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';

const GRADIENTS = [
  'from-indigo-600 via-indigo-800 to-zinc-900',
  'from-purple-600 via-purple-800 to-zinc-900',
  'from-cyan-600 via-teal-800 to-zinc-900',
  'from-rose-600 via-rose-800 to-zinc-900',
  'from-amber-600 via-orange-800 to-zinc-900',
];

export { GRADIENTS };

export interface HorizontalCardsProps<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  renderCard: (item: T, index: number, gradient: string) => ReactNode;
  autoPlayInterval?: number;
  /**
   * Names this carousel for assistive tech. Two are mounted on the home page,
   * so "carousel" alone does not say which one has focus.
   */
  ariaLabel?: string;
}

/** Direction of the last navigation: 1 = forward, -1 = backward */
type SwapDir = -1 | 0 | 1;

export default function HorizontalCards<T>({
  items,
  keyExtractor,
  renderCard,
  autoPlayInterval = 5000,
  ariaLabel,
}: HorizontalCardsProps<T>) {
  const count = items.length;
  const [active, setActive] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swapDir, setSwapDir] = useState<SwapDir>(0);
  /** Autoplay stops while the carousel is hovered or holds keyboard focus. */
  const [isPaused, setPaused] = useState(false);
  const dragStart = useRef(0);
  const dragOffset = useRef(0);
  const didDrag = useRef(false);

  const goTo = useCallback(
    (idx: number, dir?: SwapDir) => {
      const next = ((idx % count) + count) % count;
      if (dir !== undefined) setSwapDir(dir);
      else setSwapDir(next > active ? 1 : next < active ? -1 : 0);
      setActive(next);
    },
    [count, active],
  );

  const prev = useCallback(() => goTo(active - 1, -1), [active, goTo]);
  const next = useCallback(() => goTo(active + 1, 1), [active, goTo]);

  /*
   * Auto-play, pausing while the visitor is reading.
   *
   * WCAG 2.2.2 (Pause, Stop, Hide) is a Level A requirement for anything that
   * moves on its own for more than five seconds, and there are two of these
   * mounted on the home page at once. Hovering or tab-focusing a carousel now
   * stops it — you can no longer have a card slide out from under the link you
   * were about to click.
   *
   * `prefers-reduced-motion` stops it outright. The stylesheet already removed
   * the transition, which only made the change instant; the movement itself is
   * what that setting is asking us not to do.
   */
  useEffect(() => {
    if (autoPlayInterval <= 0 || isPaused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const id = setInterval(next, autoPlayInterval);
    return () => clearInterval(id);
  }, [next, autoPlayInterval, isPaused]);

  /*
   * Arrow keys, scoped to this carousel.
   *
   * The listener used to be on `window`, so one arrow press advanced BOTH
   * carousels on the home page, and arrow-key page scrolling was hijacked
   * site-wide — including while a form field had focus.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      }
    },
    [prev, next],
  );

  /* pointer drag / swipe */
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = e.clientX;
    dragOffset.current = 0;
    didDrag.current = false;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    dragOffset.current = e.clientX - dragStart.current;
    if (Math.abs(dragOffset.current) > 5) didDrag.current = true;
  };
  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset.current < -50) next();
    else if (dragOffset.current > 50) prev();
  };

  /* click on background card → rotate to front */
  const handleCardClick = (idx: number) => {
    if (didDrag.current) return; // ignore drag-end clicks
    if (idx !== active) {
      let diff = idx - active;
      if (diff > count / 2) diff -= count;
      if (diff < -count / 2) diff += count;
      goTo(idx, diff > 0 ? 1 : -1);
    }
  };

  const getCardStyle = (idx: number): React.CSSProperties => {
    let diff = idx - active;
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
    const absDiff = Math.abs(diff);

    /* Active card — sits at center, full size */
    if (absDiff === 0) {
      // Slight lift when swapping in
      const lift = swapDir !== 0 ? 'translateY(-4px)' : 'translateY(0)';
      return { opacity: 1, transform: `scale(1) rotateY(0deg) ${lift}`, zIndex: 10, visibility: 'visible' as const };
    }
    /* First neighbours */
    if (absDiff === 1) {
      const rotateDir = diff > 0 ? -10 : 10;
      const originX = diff > 0 ? '0%' : '100%';
      return { opacity: 1, transform: `scale(0.78) rotateY(${rotateDir}deg)`, transformOrigin: `${originX} 50%`, zIndex: 5, filter: 'brightness(0.55)', visibility: 'visible' as const };
    }
    /* Second neighbours */
    if (absDiff === 2) {
      const rotateDir = diff > 0 ? -15 : 15;
      const originX = diff > 0 ? '0%' : '100%';
      return { opacity: 1, transform: `scale(0.6) rotateY(${rotateDir}deg)`, transformOrigin: `${originX} 50%`, zIndex: 1, filter: 'brightness(0.35)', visibility: 'visible' as const };
    }
    return { opacity: 0, transform: 'scale(0.5)', zIndex: 0, visibility: 'hidden' as const };
  };

  /* CSS transition with cubic-bezier for a smooth "spring swap" feel */
  const CARD_TRANSITION = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <>
      {/* 3D Carousel */}
      {/*
        `tabIndex`/`role`/`aria-label` make this a real, reachable control so
        the arrow keys have somewhere to be scoped to — they were bound to
        `window`, which meant one press moved both home-page carousels and
        stole arrow-key scrolling from the whole document.
      */}
      <div
        className="relative select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500"
        style={{ perspective: '1200px' }}
        role="group"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="relative mx-auto" style={{ maxWidth: '620px', height: '400px' }}>
          {items.map((item, idx) => {
            const style = getCardStyle(idx);
            let diff = idx - active;
            if (diff > count / 2) diff -= count;
            if (diff < -count / 2) diff += count;

            return (
              <div
                key={keyExtractor(item, idx)}
                className={`absolute inset-0 ${idx === active ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                style={{
                  ...style,
                  transform: `translateX(${diff * 40}%) ${style.transform}`,
                  transformStyle: 'preserve-3d',
                  transition: CARD_TRANSITION,
                }}
                onClick={() => handleCardClick(idx)}
                /*
                 * Only the front card is reachable. The others sit behind it at
                 * 55% and 35% brightness, but their links — case study, App
                 * Store, Google Play, the project website — stayed in the tab
                 * order and the accessibility tree. Tabbing through the home
                 * page walked into four hidden cards' worth of controls that a
                 * sighted keyboard user could barely see and a screen-reader
                 * user had no context for.
                 *
                 * `inert` removes the subtree from focus, hit-testing and the
                 * a11y tree in one attribute, and it is what `aria-hidden`
                 * alone cannot do.
                 */
                inert={idx !== active}
                aria-hidden={idx !== active}
              >
                <div className={`relative w-full h-full rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br shadow-xl ${GRADIENTS[idx % GRADIENTS.length]}`}>
                  {renderCard(item, idx, GRADIENTS[idx % GRADIENTS.length])}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Go to card ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === active
                ? 'w-8 bg-indigo-600 dark:bg-indigo-400'
                : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600'
            }`}
          />
        ))}
      </div>
    </>
  );
}
