import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type RevealVariant = 'rise' | 'fade' | 'slide-left' | 'slide-right' | 'scale';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  variant = 'rise',
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.unobserve(entry.target);
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.08,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal scroll-reveal--${variant} ${className}`}
      data-visible={visible}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
