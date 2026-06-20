export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 70"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="back-cloud" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="40%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="front-cloud" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="30%" stopColor="#6366F1" />
          <stop offset="60%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#67E8F9" />
        </linearGradient>
      </defs>
      {/* Back cloud */}
      <path
        d="M20 52 C10 52 4 46 4 38 C4 30 10 24 18 23 C20 16 28 10 38 10 C48 10 56 18 56 26 C62 26 68 31 68 38 C68 45 62 52 54 52 Z"
        fill="url(#back-cloud)"
      />
      {/* Front cloud */}
      <path
        d="M30 58 C18 58 10 51 10 42 C10 33 17 27 26 26 C28 18 37 11 48 11 C61 11 70 21 70 32 C77 32 84 37 84 44 C84 51 77 58 68 58 Z"
        fill="url(#front-cloud)"
      />
      {/* Text — uses currentColor so it adapts to light/dark themes */}
      <text
        x="98"
        y="46"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize="34"
        fontWeight="600"
        fill="currentColor"
        letterSpacing="-0.02em"
      >
        Cloudie
      </text>
    </svg>
  );
}
