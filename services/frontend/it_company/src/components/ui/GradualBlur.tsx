import { useMemo } from 'react';

interface GradualBlurProps {
  /** Which edge to attach the blur overlay */
  position?: 'top' | 'bottom';
  /** Base blur strength multiplier */
  strength?: number;
  /** Height of the blur overlay */
  height?: string;
  /** Number of stacked blur layers (more = smoother) */
  divCount?: number;
  /** Use exponential blur progression */
  exponential?: boolean;
  /** Opacity of each blur layer */
  opacity?: number;
  /** z-index */
  zIndex?: number;
  /** Additional className */
  className?: string;
}

export default function GradualBlur({
  position = 'bottom',
  strength = 2,
  height = '6rem',
  divCount = 5,
  exponential = false,
  opacity = 1,
  zIndex = 10,
  className = '',
}: GradualBlurProps) {
  const blurDivs = useMemo(() => {
    const divs: React.CSSProperties[] = [];
    const increment = 100 / divCount;
    const direction = position === 'top' ? 'to top' : 'to bottom';

    for (let i = 1; i <= divCount; i++) {
      const progress = i / divCount;

      let blurValue: number;
      if (exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * strength;
      } else {
        blurValue = 0.0625 * (progress * divCount + 1) * strength;
      }

      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      divs.push({
        position: 'absolute' as const,
        inset: '0',
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity,
      });
    }

    return divs;
  }, [position, strength, divCount, exponential, opacity]);

  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{
        position: 'absolute',
        [position]: 0,
        left: 0,
        right: 0,
        height,
        zIndex,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {blurDivs.map((style, i) => (
          <div key={i} style={style} />
        ))}
      </div>
    </div>
  );
}
