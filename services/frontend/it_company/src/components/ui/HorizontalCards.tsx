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
}

/** Direction of the last navigation: 1 = forward, -1 = backward */
type SwapDir = -1 | 0 | 1;

export default function HorizontalCards<T>({
  items,
  keyExtractor,
  renderCard,
  autoPlayInterval = 5000,
}: HorizontalCardsProps<T>) {
  const count = items.length;
  const [active, setActive] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swapDir, setSwapDir] = useState<SwapDir>(0);
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

  /* auto-play */
  useEffect(() => {
    if (autoPlayInterval <= 0) return;
    const id = setInterval(next, autoPlayInterval);
    return () => clearInterval(id);
  }, [next, autoPlayInterval]);

  /* keyboard */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

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
      <div
        className="relative select-none"
        style={{ perspective: '1200px' }}
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
