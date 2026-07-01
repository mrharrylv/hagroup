export default function Logo({ className = '' }: { className?: string }) {
  // Served at /brand/* from the dedicated assets bucket via CloudFront (see
  // infrastructure/terraform/assets.tf). NOT /assets/* — that's Vite's build
  // output dir. For local dev, drop a copy at public/brand/logo.png.
  return (
    <img
      src="/brand/logo.png"
      alt="HA Group"
      className={`${className} w-auto`.trim()}
      decoding="async"
    />
  );
}
