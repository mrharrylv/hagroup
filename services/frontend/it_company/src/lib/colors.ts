/**
 * Cloudie Design Tokens — Color Reference
 *
 * This file documents all colors used across the website.
 * Colors are applied via Tailwind CSS utility classes.
 * Change values here as a reference guide; update corresponding
 * Tailwind classes across components to match.
 *
 * Naming convention: <semantic-role>.<variant>
 */

const colors = {
  /* ─── Brand / Accent ──────────────────────────────────── */
  accent: {
    primary: '#6366F1',      // indigo-500  — main brand accent (buttons, links, hover states)
    dark: '#4F46E5',         // indigo-600  — darker accent (text links in light mode, CTA bg)
    light: '#818CF8',        // indigo-400  — lighter accent (text links in dark mode, hover)
    subtle: '#EEF2FF',       // indigo-50   — accent bg tint (icon containers, badges in light mode)
    subtleDark: 'rgba(99, 102, 241, 0.1)', // indigo-500/10 — accent bg tint (dark mode)
    glow: 'rgba(99, 102, 241, 0.5)',       // indigo drop-shadow on hover
    ring: 'rgba(99, 102, 241, 0.5)',       // focus ring color
    border: '#C7D2FE',       // indigo-200  — accent border (light mode badges)
    borderDark: 'rgba(99, 102, 241, 0.2)', // indigo-500/20 — accent border (dark mode)
  },

  /* ─── Text ────────────────────────────────────────────── */
  text: {
    heading: '#18181B',      // zinc-900    — headings in light mode
    headingDark: '#FFFFFF',  // white       — headings in dark mode
    body: '#52525B',         // zinc-600    — body text in light mode
    bodyDark: '#A1A1AA',     // zinc-400    — body text in dark mode
    muted: '#71717A',        // zinc-500    — secondary/muted text
    mutedDark: '#A1A1AA',    // zinc-400    — secondary text in dark mode
    placeholder: '#A1A1AA',  // zinc-400    — input placeholder
  },

  /* ─── Backgrounds ─────────────────────────────────────── */
  bg: {
    page: '#FAFAFA',         // zinc-50     — page background (light mode)
    pageDark: '#09090B',     // zinc-950    — page background (dark mode)
    card: '#FFFFFF',         // white       — card/surface (light mode)
    cardDark: 'rgba(24, 24, 27, 0.3)',     // zinc-900/30 — card/surface (dark mode)
    elevated: '#F4F4F5',     // zinc-100    — slightly elevated bg (TechStack section)
    elevatedDark: 'rgba(24, 24, 27, 0.2)', // zinc-900/20 — elevated bg (dark mode)
    footer: '#FFFFFF',       // white       — footer background
    footerDark: '#09090B',   // zinc-950    — footer background (dark mode)
    input: '#FAFAFA',        // zinc-50     — form input bg
    inputDark: 'rgba(24, 24, 27, 0.5)',    // zinc-900/50 — input bg (dark mode)
  },

  /* ─── Borders ─────────────────────────────────────────── */
  border: {
    default: '#E4E4E7',      // zinc-200    — default borders
    defaultDark: '#27272A',  // zinc-800    — default borders (dark mode)
    subtle: 'rgba(228, 228, 231, 0.7)',    // zinc-200/70 — subtle dividers
    subtleDark: 'rgba(39, 39, 42, 0.5)',   // zinc-800/50 — subtle dividers (dark)
    footer: '#E4E4E7',       // zinc-200    — footer top border
    footerDark: 'rgba(39, 39, 42, 0.8)',   // zinc-800/80 — footer border (dark)
  },

  /* ─── Status / Feedback ───────────────────────────────── */
  success: {
    bg: '#ECFDF5',           // emerald-50  — success banner bg
    bgDark: 'rgba(6, 78, 59, 0.3)',        // emerald-950/30
    text: '#15803D',         // emerald-700
    textDark: '#6EE7B7',     // emerald-300
    border: '#BBF7D0',       // emerald-200
    borderDark: '#065F46',   // emerald-800
  },
  error: {
    bg: '#FEF2F2',           // red-50
    bgDark: 'rgba(69, 10, 10, 0.3)',       // red-950/30
    text: '#B91C1C',         // red-700
    textDark: '#FCA5A5',     // red-300
    border: '#FECACA',       // red-200
    borderDark: '#991B1B',   // red-800
  },

  /* ─── Special ─────────────────────────────────────────── */
  whatsapp: '#25D366',       // WhatsApp brand green
  whatsappHover: '#20BD5A',

  /* ─── Logo SVG Colors ─────────────────────────────────── */
  logo: {
    text: '#1E1B6E',         // deep navy — SVG text fill
    cloudBack: ['#6366F1', '#8B5CF6', '#A78BFA'], // back cloud gradient
    cloudFront: ['#4F46E5', '#6366F1', '#38BDF8', '#67E8F9'], // front cloud gradient
  },

  /* ─── Gradient Text Animation ─────────────────────────── */
  gradient: ['#6366F1', '#8B5CF6', '#A78BFA', '#818CF8', '#6366F1'],

  /* ─── Threads Background (WebGL) ──────────────────────── */
  threads: [0.39, 0.4, 0.95] as [number, number, number], // indigo-ish RGB (0-1 range)

  /* ─── Antigravity Particles ───────────────────────────── */
  particles: ['99, 102, 241', '139, 92, 246', '167, 139, 250', '129, 140, 248'],
} as const;

export default colors;
