"use client";

import { useEffect, useRef } from "react";

// Simple Leaflet map wrapper (no SSR)
export function NearbyMap({ lat, lng, pins, onPinHover, onPinSelect }: {
  lat: number;
  lng: number;
  pins: { id: string; name: string; lat: number; lng: number; photoUrl?: string; distance?: number }[];
  onPinHover?: (id: string | null) => void;
  onPinSelect?: (id: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then(L => {
      if (!mapRef.current) return;
      mapRef.current.innerHTML = "";

      // Ensure marker icons render in Next.js (avoid bundling Leaflet image assets)
      const DefaultIcon = L.icon({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (L.Marker as any).prototype.options.icon = DefaultIcon;

      const map = L.map(mapRef.current).setView([lat, lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      pins.forEach(pin => {
        const marker = L.marker([pin.lat, pin.lng]).addTo(map);
        marker.bindPopup(`<b>${pin.name}</b>`);
        marker.on("mouseover", () => onPinHover?.(pin.id));
        marker.on("mouseout", () => onPinHover?.(null));
        marker.on("click", () => onPinSelect?.(pin.id));
      });
    });
  }, [lat, lng, pins, onPinHover, onPinSelect]);
  return <div ref={mapRef} style={{ width: "100%", height: 320, borderRadius: 16, margin: "18px 0" }} />;
}
