"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { Earthquake } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { getMagnitudeColorClass } from "@/lib/earthquake-utils";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface EarthquakeMapProps {
  earthquakes: Earthquake[];
  selectedEarthquake?: Earthquake | null;
  onMarkerClick?: (earthquake: Earthquake) => void;
  requestUserLocation?: boolean;
}

const getMarkerColor = (magnitude: number): string => {
  if (magnitude >= 7) return "#dc2626"; // red-600
  if (magnitude >= 6) return "#ef4444"; // red-500
  if (magnitude >= 5) return "#f97316"; // orange-500
  if (magnitude >= 4) return "#eab308"; // yellow-500
  if (magnitude >= 3) return "#3b82f6"; // blue-500
  return "#6b7280"; // gray-500
};

// Component to handle map centering, popup opening, and geolocation
function MapController({ 
  selectedEarthquake, 
  markerRefs,
  requestUserLocation 
}: { 
  selectedEarthquake?: Earthquake | null;
  markerRefs: React.MutableRefObject<Map<string, L.CircleMarker>>;
  requestUserLocation?: boolean;
}) {
  const map = useMap();

  // Handle user geolocation
  useEffect(() => {
    if (requestUserLocation && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 8, {
            animate: true,
            duration: 1.5,
          });

          // Add a marker for user's location
          L.marker([latitude, longitude], {
            icon: L.divIcon({
              className: 'user-location-marker',
              html: `<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            }),
          })
            .addTo(map)
            .bindPopup("📍 Your Location")
            .openPopup();
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback to Philippines center if denied
        }
      );
    }
  }, [requestUserLocation, map]);

  // Handle selected earthquake
  useEffect(() => {
    if (selectedEarthquake) {
      // Center map on selected earthquake
      map.setView(
        [selectedEarthquake.latitude, selectedEarthquake.longitude],
        10,
        { animate: true, duration: 1 }
      );

      // Open popup for the selected marker
      const markerKey = `${selectedEarthquake.date}-${selectedEarthquake.latitude}-${selectedEarthquake.longitude}`;
      const marker = markerRefs.current.get(markerKey);
      
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 500); // Wait for zoom animation to complete
      }
    }
  }, [selectedEarthquake, map, markerRefs]);

  return null;
}

export function EarthquakeMap({
  earthquakes,
  selectedEarthquake,
  onMarkerClick,
  requestUserLocation = false,
}: EarthquakeMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<Map<string, L.CircleMarker>>(new Map());

  // Center on Philippines (adjusted for better coverage)
  const center: [number, number] = [12.5, 122.5];
  const defaultZoom = 6;

  return (
    <MapContainer
      center={center}
      zoom={defaultZoom}
      className="h-full w-full rounded-lg"
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {earthquakes.map((eq, index) => {
        const isSelected = selectedEarthquake?.date === eq.date && 
                          selectedEarthquake?.latitude === eq.latitude &&
                          selectedEarthquake?.longitude === eq.longitude;
        
        const markerKey = `${eq.date}-${eq.latitude}-${eq.longitude}`;

        return (
          <CircleMarker
            key={`${markerKey}-${index}`}
            center={[eq.latitude, eq.longitude]}
            radius={isSelected ? eq.magnitude * 3 : eq.magnitude * 2}
            pathOptions={{
              fillColor: getMarkerColor(eq.magnitude),
              color: isSelected ? "#000" : "#fff",
              weight: isSelected ? 3 : 2,
              opacity: 1,
              fillOpacity: isSelected ? 0.9 : 0.7,
            }}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(eq);
                }
              },
              add: (e) => {
                // Store marker reference
                markerRefs.current.set(markerKey, e.target as L.CircleMarker);
              },
              remove: () => {
                // Clean up marker reference
                markerRefs.current.delete(markerKey);
              },
            }}
          >
            <Popup maxWidth={250}>
              <div className="min-w-[200px] p-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getMagnitudeColorClass(eq.magnitude)}>
                    M {eq.magnitude.toFixed(1)}
                  </Badge>
                </div>
                <p className="font-semibold text-sm mb-1">{eq.location}</p>
                <p className="text-xs text-gray-600 mb-1">{eq.date}</p>
                <p className="text-xs text-gray-500">
                  Depth: {eq.depth} | {eq.latitude.toFixed(3)}°, {eq.longitude.toFixed(3)}°
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      <MapController 
        selectedEarthquake={selectedEarthquake} 
        markerRefs={markerRefs}
        requestUserLocation={requestUserLocation}
      />
    </MapContainer>
  );
}

