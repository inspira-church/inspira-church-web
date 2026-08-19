"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { dayName, formatTime } from "@/lib/format";
import { getGroupTypeColor } from "@/lib/group-types";

export interface MapGroup {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  sector?: string | null;
  locality?: string | null;
  groupType?: string;
  dayOfWeek?: number;
  timeOfDay?: string;
}

const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.7-6.3-14-14-14Z" fill="#FF7F50"/><circle cx="14" cy="14" r="5.5" fill="#171613"/></svg>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -32],
});

interface GroupsMapProps {
  groups: MapGroup[];
  center: [number, number];
}

/** Se carga con next/dynamic({ ssr: false }) — Leaflet necesita `window`. */
export function GroupsMap({ groups, center }: GroupsMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {groups.map((group) => {
        const place = [group.sector, group.locality].filter(Boolean).join(" · ");
        const color = group.groupType ? getGroupTypeColor(group.groupType) : "#FF7F50";
        return (
          <Marker key={group.slug} position={[group.lat, group.lng]} icon={pinIcon}>
            <Popup minWidth={180}>
              {group.groupType && (
                <p
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color }}
                >
                  {group.groupType}
                </p>
              )}
              <p className="mt-0.5 font-semibold">{group.name}</p>
              {group.dayOfWeek !== undefined && group.timeOfDay && (
                <p className="mt-1 text-sm">
                  {dayName(group.dayOfWeek)} · {formatTime(group.timeOfDay)}
                </p>
              )}
              {place && <p className="text-sm text-neutral-600">{place}</p>}
              <Link href={`/grupos/${group.slug}`} className="mt-1 inline-block font-semibold text-[#c1502e]">
                Ver grupo →
              </Link>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
