/** Domain model for the Kopā group-buying demo. All data is mock data. */

export type Lang = 'en' | 'lv';

/** A string that exists in both demo languages. */
export type Localised = Record<Lang, string>;

export type CategoryId =
  | 'heating-fuel'
  | 'vehicle-fuel'
  | 'agri-inputs'
  | 'building-materials'
  | 'timber'
  | 'restaurant-supplies'
  | 'household-bulk';

export type UnitId =
  | 'pallet'
  | 'ton'
  | 'm3'
  | 'litre'
  | 'carton'
  | 'kg'
  | 'bag'
  | 'truckload'
  | 'box';

export type RegionId = 'kurzeme' | 'zemgale' | 'vidzeme' | 'latgale' | 'riga';

/** Who a campaign is aimed at, and what an individual participant is. */
export type BuyerType = 'business' | 'individual';

/** A campaign can accept one kind of buyer or both. */
export type AudienceId = BuyerType | 'mixed';

/** Derived, never stored: see domain/status.ts. */
export type CampaignStatus = 'new' | 'open' | 'almost-full' | 'closing-soon' | 'funded' | 'closed';

/**
 * Which quantity a price tier is measured against.
 * `units` — total committed volume (litres, tonnes, m³ …).
 * `buyers` — headcount, used where the supplier prices per delivery drop.
 */
export type TierBasis = 'units' | 'buyers';

export interface PriceTier {
  /** Inclusive lower bound, in the campaign's tier basis. */
  readonly min: number;
  /** Inclusive upper bound; `null` means open-ended. */
  readonly max: number | null;
  /** EUR per campaign unit once this tier is reached. */
  readonly pricePerUnit: number;
}

export interface Participant {
  readonly id: string;
  readonly name: string;
  readonly type: BuyerType;
  /** Organisation name, for business participants. */
  readonly org?: string;
  readonly units: number;
  /** Days before "today" that this participant joined; rendered as a relative date. */
  readonly joinedDaysAgo: number;
}

export interface FaqEntry {
  readonly q: Localised;
  readonly a: Localised;
}

export interface Campaign {
  readonly id: string;
  readonly slug: string;
  readonly title: Localised;
  readonly description: Localised;
  readonly category: CategoryId;
  readonly unit: UnitId;
  readonly audience: AudienceId;

  readonly organizer: {
    readonly name: string;
    readonly type: BuyerType;
    readonly org?: string;
  };

  /** Pin location. */
  readonly cityId: string;
  readonly regionId: RegionId;
  readonly lat: number;
  readonly lng: number;
  /** Catchment radius around the pin, in kilometres. */
  readonly radiusKm: number;

  readonly targetUnits: number;
  readonly targetBuyers: number;
  /** Retail price per unit a lone buyer would pay, in EUR. */
  readonly retailPricePerUnit: number;
  readonly tierBasis: TierBasis;
  readonly tiers: readonly PriceTier[];

  /** Days from "today" until the campaign closes. Negative means already closed. */
  readonly endsInDays: number;
  /** Days before "today" the campaign opened, used for the "New" badge. */
  readonly startedDaysAgo: number;

  readonly participants: readonly Participant[];
  readonly faq: readonly FaqEntry[];
  /** Extra free-text search terms, both languages, e.g. "petrol", "dīzelis". */
  readonly keywords: readonly string[];
  readonly featured: boolean;
  /** Mock supplier interest, shown in the supplier panel. */
  readonly supplierBids: readonly SupplierBid[];
}

export interface SupplierBid {
  readonly supplier: string;
  readonly pricePerUnit: number;
  readonly note: Localised;
  readonly leadTimeDays: number;
}

export interface City {
  readonly id: string;
  readonly name: string;
  readonly regionId: RegionId;
  readonly lat: number;
  readonly lng: number;
  /** Rough population, used only to size the map label. */
  readonly population: number;
}

export interface Region {
  readonly id: RegionId;
  readonly name: Localised;
  /** Label anchor for the region chip on the map. */
  readonly lat: number;
  readonly lng: number;
  /** Zoom bounds: [[southLat, westLng], [northLat, eastLng]]. */
  readonly bounds: readonly [readonly [number, number], readonly [number, number]];
}

export interface Category {
  readonly id: CategoryId;
  readonly name: Localised;
  /** Single emoji used as the map/card icon — deliberately cheap, no icon set. */
  readonly icon: string;
  /** Marker + accent colour, a hex string. */
  readonly colour: string;
}

export interface Unit {
  readonly id: UnitId;
  readonly short: Localised;
  readonly long: Localised;
}
