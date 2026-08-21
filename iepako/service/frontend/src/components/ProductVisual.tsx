interface ProductVisualProps {
  variant: 'sheet' | 'roll' | 'food' | 'compact' | 'shrink';
}

export default function ProductVisual({ variant }: ProductVisualProps) {
  if (variant === 'sheet') {
    return (
      <svg viewBox="0 0 520 320" aria-hidden="true" className="product-illustration">
        <path d="M76 230 215 76h178L250 230Z" fill="#e8f2ee" stroke="#285f52" strokeWidth="3" />
        <path d="M250 230 393 76v101L317 255H145L76 230Z" fill="#c9ddd6" stroke="#285f52" strokeWidth="3" />
        <path d="M145 255 250 230h67l-70 29H145Z" fill="#fff" opacity=".8" />
        <circle cx="395" cy="102" r="40" fill="#f5b95f" />
        <path d="M215 76h178" stroke="#fff" strokeWidth="8" opacity=".7" />
      </svg>
    );
  }

  const compact = variant === 'compact';
  const shrink = variant === 'shrink';

  return (
    <svg viewBox="0 0 520 320" aria-hidden="true" className="product-illustration">
      <ellipse cx="260" cy="246" rx={compact ? 112 : 156} ry="28" fill="#0d342c" opacity=".12" />
      <path
        d={compact ? 'M163 115h193v105H163z' : 'M107 100h306v130H107z'}
        fill={shrink ? '#d7ece5' : '#eef6f3'}
        stroke="#285f52"
        strokeWidth="3"
      />
      <ellipse
        cx={compact ? 163 : 107}
        cy={compact ? 167.5 : 165}
        rx="36"
        ry={compact ? 52.5 : 65}
        fill="#f7fbf9"
        stroke="#285f52"
        strokeWidth="3"
      />
      <ellipse
        cx={compact ? 163 : 107}
        cy={compact ? 167.5 : 165}
        rx="14"
        ry={compact ? 27 : 34}
        fill="#143d35"
      />
      <ellipse
        cx={compact ? 356 : 413}
        cy={compact ? 167.5 : 165}
        rx="36"
        ry={compact ? 52.5 : 65}
        fill={shrink ? '#b9d9cf' : '#dbeae5'}
        stroke="#285f52"
        strokeWidth="3"
      />
      <path d="M183 125h145" stroke="#fff" strokeLinecap="round" strokeWidth="10" opacity=".85" />
      {variant === 'food' && (
        <g>
          <path d="M241 157c18-31 49-30 63 0-9 23-51 29-63 0Z" fill="#f5b95f" />
          <path d="M273 142c1-12 8-22 19-27" stroke="#285f52" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {shrink && (
        <g fill="none" stroke="#f2a849" strokeWidth="4" strokeLinecap="round">
          <path d="M215 72c-14-15 12-24-2-39" />
          <path d="M260 72c-14-15 12-24-2-39" />
          <path d="M305 72c-14-15 12-24-2-39" />
        </g>
      )}
    </svg>
  );
}
