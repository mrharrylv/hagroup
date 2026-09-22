import { divIcon, type DivIcon } from 'leaflet';

/**
 * Map markers are hand-built HTML strings rather than React nodes, because
 * Leaflet's `divIcon` takes a string. Everything is inline-styled on purpose:
 * a marker is rendered outside React's tree and outside Tailwind's reach, so a
 * self-contained style attribute is the only thing guaranteed to survive.
 * The one class used, `kopa-pin-highlight`, is the pulse defined in index.css.
 */

/** How a pin reacts to the search box: nothing typed, a hit, or a miss. */
export type PinState = 'normal' | 'match' | 'dim';

export interface CampaignPinInput {
  readonly emoji: string;
  readonly colour: string;
  readonly title: string;
  readonly participants: number;
  readonly state: PinState;
  readonly showLabel: boolean;
  readonly selected: boolean;
}

const FONT = "var(--font-sans, system-ui, sans-serif)";

export function campaignPinIcon(input: CampaignPinInput): DivIcon {
  const { colour, emoji, title, participants, state, showLabel, selected } = input;
  const dim = state === 'dim';
  const match = state === 'match';

  const diameter = match ? 44 : selected ? 40 : 32;
  const half = diameter / 2;
  const border = match
    ? '3px solid #ffffff'
    : selected
      ? '3px solid #0f172a'
      : '2px solid #ffffff';

  // A matching pin's shadow belongs to the pulse keyframes, so it is left off
  // here — a CSS animation outranks an inline style and would win anyway.
  const shadow = match ? '' : 'box-shadow:0 2px 6px rgba(15,23,42,0.35);';

  const circle = [
    `<div class="${match ? 'kopa-pin-highlight' : ''}"`,
    ` style="position:absolute;left:${-half}px;top:${-half}px;width:${diameter}px;`,
    `height:${diameter}px;border-radius:9999px;background:${colour};border:${border};`,
    `${shadow}display:flex;align-items:center;justify-content:center;`,
    `font-size:${Math.round(diameter * 0.46)}px;line-height:1;`,
    `opacity:${dim ? 0.3 : 1};transition:opacity 150ms ease;cursor:pointer"`,
    `>${escapeHtml(emoji)}</div>`,
  ].join('');

  const badge =
    dim || participants <= 0
      ? ''
      : [
          `<span style="position:absolute;left:${half - 6}px;top:${-half - 8}px;`,
          'min-width:12px;height:16px;padding:0 5px;border-radius:9999px;',
          'background:#0f172a;color:#ffffff;border:2px solid #ffffff;',
          `font:700 10px/16px ${FONT};text-align:center;pointer-events:none"`,
          `>${escapeHtml(String(participants))}</span>`,
        ].join('');

  const label =
    showLabel && !dim
      ? [
          `<span style="position:absolute;left:0;top:${half + 5}px;`,
          'transform:translateX(-50%);max-width:160px;overflow:hidden;',
          'text-overflow:ellipsis;white-space:nowrap;background:rgba(255,255,255,0.95);',
          'color:#0f172a;padding:2px 6px;border-radius:6px;',
          'box-shadow:0 1px 3px rgba(15,23,42,0.25);pointer-events:none;',
          `font:600 11px/1.3 ${FONT}"`,
          `>${escapeHtml(title)}</span>`,
        ].join('')
      : '';

  return divIcon({
    className: 'kopa-pin',
    // A zero-sized root keeps every child positioned against the exact
    // coordinate, so a long label never drags the circle off its point.
    iconSize: [0, 0],
    html: `${circle}${badge}${label}`,
  });
}

export interface RegionBubbleInput {
  readonly name: string;
  readonly count: number;
  readonly active: boolean;
}

/** The low-zoom aggregate: one bubble per region, sized by how much is in it. */
export function regionBubbleIcon(input: RegionBubbleInput): DivIcon {
  const { name, count, active } = input;
  const empty = count === 0;
  const diameter = empty ? 40 : Math.round(44 + Math.min(count, 14) * 2.4);
  const half = diameter / 2;

  const background = empty ? 'rgba(148,163,184,0.75)' : active ? '#0f766e' : '#0d9488';
  const border = active ? '4px solid #ffffff' : '3px solid #ffffff';

  const bubble = [
    `<div style="position:absolute;left:${-half}px;top:${-half}px;width:${diameter}px;`,
    `height:${diameter}px;border-radius:9999px;background:${background};border:${border};`,
    'box-shadow:0 3px 10px rgba(15,23,42,0.3);display:flex;align-items:center;',
    `justify-content:center;color:#ffffff;cursor:pointer;`,
    `font:700 ${Math.round(diameter * 0.34)}px/1 ${FONT}"`,
    `>${escapeHtml(String(count))}</div>`,
  ].join('');

  const label = [
    `<span style="position:absolute;left:0;top:${half + 6}px;transform:translateX(-50%);`,
    'white-space:nowrap;background:rgba(255,255,255,0.95);color:#0f172a;',
    'padding:2px 8px;border-radius:9999px;box-shadow:0 1px 3px rgba(15,23,42,0.25);',
    `pointer-events:none;font:600 12px/1.4 ${FONT}"`,
    `>${escapeHtml(name)}</span>`,
  ].join('');

  return divIcon({ className: 'kopa-pin', iconSize: [0, 0], html: `${bubble}${label}` });
}

/** Mock data is still data: nothing reaches innerHTML unescaped. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
