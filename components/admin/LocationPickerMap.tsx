"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.7-6.3-14-14-14Z" fill="#FF7F50"/><circle cx="14" cy="14" r="5.5" fill="#171613"/></svg>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
});

const BOGOTA_CENTER: [number, number] = [4.65, -74.09];

function ClickCapture({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LocationPickerMapProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

/** Mapa clicable para fijar lat/lng sin que el admin tenga que conocer las coordenadas — se carga con next/dynamic({ ssr:false }) vía LocationPicker.tsx. */
export function LocationPickerMap({ lat, lng, onChange }: LocationPickerMapProps) {
  const hasPoint = lat !== null && lng !== null;
  const center: [number, number] = hasPoint ? [lat, lng] : BOGOTA_CENTER;

  return (
    <MapContainer center={center} zoom={hasPoint ? 15 : 11} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickCapture onPick={onChange} />
      {hasPoint && <Marker position={[lat, lng]} icon={pinIcon} />}
    </MapContainer>
  );
}
