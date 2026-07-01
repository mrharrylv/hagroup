export default function Logo({ className = '' }: { className?: string }) {
  // Served at /assets/* from the dedicated assets bucket via CloudFront (see
  // infrastructure/terraform/assets.tf). For local dev, drop a copy at
  // public/assets/logo.png.
  return (
    <img
      src="/assets/logo.png"
      alt="HA Group"
      className={`${className} w-auto`.trim()}
      decoding="async"
    />
  );
}
