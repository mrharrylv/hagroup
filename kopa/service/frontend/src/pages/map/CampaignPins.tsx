import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import { categoryColour } from '../../components/CategoryIcon';
import { categoryById } from '../../data/taxonomy';
import { useI18n } from '../../i18n/useI18n';
import { campaignPinIcon, type PinState } from './pin';
import type { Campaign } from '../../domain/types';

/** Titles only appear once the map is close enough for them not to collide. */
const LABEL_FROM_ZOOM = 10;

export function CampaignPins({
  campaigns,
  highlightIds,
  searchActive,
  selectedId,
  zoom,
  onSelect,
}: {
  campaigns: readonly Campaign[];
  /** Ids the search box matched; everything else dims instead of disappearing. */
  highlightIds: ReadonlySet<string>;
  searchActive: boolean;
  selectedId: string | null;
  zoom: number;
  onSelect: (campaign: Campaign) => void;
}) {
  const showLabel = zoom >= LABEL_FROM_ZOOM;

  return (
    <>
      {campaigns.map((campaign) => {
        const state: PinState = !searchActive
          ? 'normal'
          : highlightIds.has(campaign.id)
            ? 'match'
            : 'dim';

        return (
          <CampaignPin
            key={campaign.id}
            campaign={campaign}
            state={state}
            selected={campaign.id === selectedId}
            showLabel={showLabel}
            onSelect={onSelect}
          />
        );
      })}
    </>
  );
}

function CampaignPin({
  campaign,
  state,
  selected,
  showLabel,
  onSelect,
}: {
  campaign: Campaign;
  state: PinState;
  selected: boolean;
  showLabel: boolean;
  onSelect: (campaign: Campaign) => void;
}) {
  const { loc } = useI18n();
  const title = loc(campaign.title);
  const participants = campaign.participants.length;

  const icon = useMemo(
    () =>
      campaignPinIcon({
        emoji: categoryById(campaign.category)?.icon ?? '📦',
        colour: categoryColour(campaign.category),
        title,
        participants,
        state,
        showLabel,
        selected,
      }),
    [campaign.category, title, participants, state, showLabel, selected],
  );

  return (
    <Marker
      position={[campaign.lat, campaign.lng]}
      icon={icon}
      title={title}
      alt={title}
      riseOnHover
      zIndexOffset={selected ? 1200 : state === 'match' ? 600 : 0}
      eventHandlers={{ click: () => onSelect(campaign) }}
    />
  );
}
