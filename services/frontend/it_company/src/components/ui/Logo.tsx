export default function Logo({ className = '' }: { className?: string }) {
  // Served at /brand/* from the dedicated S3 assets bucket via CloudFront (see
  // infrastructure/terraform/assets.tf). NOT /assets/* — that's Vite's build
  // output dir. In local dev, /brand is proxied to CloudFront (vite.config.ts);
  // no image files live in this repo (sources: resources/hagroup/logo).
  // Rendered at ~36-48px CSS height; 256w covers up to 3x DPR, 512w is headroom.
  // Artwork is light (made for dark bg) → invert in light mode only.
  return (
    <picture>
      <source
        type="image/webp"
        srcSet="/brand/ha-group-logo-transparent-256w.webp 256w, /brand/ha-group-logo-transparent-512w.webp 512w"
        sizes="60px"
      />
      <img
        src="/brand/ha-group-logo-transparent-256w.png"
        srcSet="/brand/ha-group-logo-transparent-256w.png 256w, /brand/ha-group-logo-transparent-512w.png 512w"
        sizes="60px"
        alt="HA Group"
        className={`${className} w-auto invert dark:invert-0`.trim()}
        decoding="async"
      />
    </picture>
  );
}
