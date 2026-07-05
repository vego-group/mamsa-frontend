'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapUnit {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
}

/** Keep the map framed inside Saudi Arabia — user cannot pan outside the kingdom. */
const SAUDI_BOUNDS: L.LatLngBoundsLiteral = [
  [16.0, 34.0], // south-west
  [32.5, 56.0], // north-east
];

function priceIcon(price: number, active: boolean, currencyLabel: string) {
  const formatted = price.toLocaleString('en-US');
  return L.divIcon({
    className: 'mamsa-pin-wrap',
    html: `<span class="mamsa-pin${active ? ' mamsa-pin--active' : ''}">${formatted} ${currencyLabel}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/** Auto-zoom to fit all listings on first render. */
function FitToUnits({ units }: { units: MapUnit[] }) {
  const map = useMap();
  useEffect(() => {
    if (units.length === 0) return;
    const bounds = L.latLngBounds(units.map((u) => [u.lat, u.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [70, 70], maxZoom: 13 });
  }, [units, map]);
  return null;
}

/** Glide to the active listing when it changes from the sidebar. */
function PanToActive({ active }: { active?: MapUnit }) {
  const map = useMap();
  useEffect(() => {
    if (active) map.panTo([active.lat, active.lng], { animate: true });
  }, [active, map]);
  return null;
}

export default function LocationMap({
  units,
  activeId,
  onSelect,
  currencyLabel = 'SAR',
}: {
  units: MapUnit[];
  activeId: string | null;
  onSelect: (id: string) => void;
  currencyLabel?: string;
}) {
  const active = units.find((u) => u.id === activeId);

  return (
    <MapContainer
      center={[24.71, 46.67]}
      zoom={11}
      minZoom={5}
      maxBounds={SAUDI_BOUNDS}
      maxBoundsViscosity={1}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToUnits units={units} />
      <PanToActive active={active} />
      {units.map((u) => (
        <Marker
          key={u.id}
          position={[u.lat, u.lng]}
          icon={priceIcon(u.price, u.id === activeId, currencyLabel)}
          zIndexOffset={u.id === activeId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(u.id) }}
        />
      ))}
    </MapContainer>
  );
}
