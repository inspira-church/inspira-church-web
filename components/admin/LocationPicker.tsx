"use client";

import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(
  () => import("@/components/admin/LocationPickerMap").then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-ink-faint">
        Cargando mapa…
      </div>
    ),
  }
);

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

/** Haz clic en el mapa para fijar el punto — evita que el admin tenga que conocer latitud/longitud. */
export function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  return (
    <div>
      <p className="text-sm font-medium text-ink">Ubicación en el mapa</p>
      <p className="mt-1 text-xs text-ink-faint">
        Haz clic para fijar el punto — usa el centro del sector o barrio, nunca la puerta exacta
        de una vivienda.
      </p>
      <div className="mt-2 h-64 overflow-hidden rounded-md border border-border-strong">
        <LocationPickerMap lat={lat} lng={lng} onChange={onChange} />
      </div>
    </div>
  );
}
