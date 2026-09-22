import type { Category, Unit } from '../domain/types';

/** Product categories. The icon is a plain emoji — no icon set, on purpose. */
export const CATEGORIES: readonly Category[] = [
  { id: 'heating-fuel', name: { en: 'Heating fuel', lv: 'Apkures kurināmais' }, icon: '🔥', colour: '#ea580c' },
  { id: 'vehicle-fuel', name: { en: 'Diesel & petrol', lv: 'Dīzelis un benzīns' }, icon: '⛽', colour: '#0891b2' },
  { id: 'agri-inputs', name: { en: 'Agricultural inputs', lv: 'Lauksaimniecības izejvielas' }, icon: '🌾', colour: '#16a34a' },
  { id: 'building-materials', name: { en: 'Building materials', lv: 'Būvmateriāli' }, icon: '🧱', colour: '#b45309' },
  { id: 'timber', name: { en: 'Timber & wood', lv: 'Kokmateriāli' }, icon: '🪵', colour: '#7c6f64' },
  { id: 'restaurant-supplies', name: { en: 'Restaurant supplies', lv: 'Restorānu piegādes' }, icon: '🍽️', colour: '#db2777' },
  { id: 'household-bulk', name: { en: 'Household bulk goods', lv: 'Mājsaimniecības preces' }, icon: '📦', colour: '#7c3aed' },
] as const;

export function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === id);
}

export const UNITS: readonly Unit[] = [
  { id: 'pallet', short: { en: 'pallet', lv: 'palete' }, long: { en: 'pallets', lv: 'paletes' } },
  { id: 'ton', short: { en: 't', lv: 't' }, long: { en: 'tonnes', lv: 'tonnas' } },
  { id: 'm3', short: { en: 'm³', lv: 'm³' }, long: { en: 'cubic metres', lv: 'kubikmetri' } },
  { id: 'litre', short: { en: 'L', lv: 'L' }, long: { en: 'litres', lv: 'litri' } },
  { id: 'carton', short: { en: 'carton', lv: 'kaste' }, long: { en: 'cartons', lv: 'kastes' } },
  { id: 'kg', short: { en: 'kg', lv: 'kg' }, long: { en: 'kilograms', lv: 'kilogrami' } },
  { id: 'bag', short: { en: 'bag', lv: 'maiss' }, long: { en: 'bags', lv: 'maisi' } },
  { id: 'truckload', short: { en: 'load', lv: 'krava' }, long: { en: 'truckloads', lv: 'kravas' } },
  { id: 'box', short: { en: 'box', lv: 'kārba' }, long: { en: 'boxes', lv: 'kārbas' } },
] as const;

export function unitById(id: string): Unit | undefined {
  return UNITS.find((unit) => unit.id === id);
}
