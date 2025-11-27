"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Layers } from "lucide-react";
import { Earthquake } from "@/lib/types";
import { EarthquakeMap } from "./earthquake-map";
import { getMagnitudeColorClass, getMagnitudeLabel } from "@/lib/earthquake-utils";

interface EarthquakeMapMobileProps {
  earthquake: Earthquake;
  onBack: () => void;
}

export function EarthquakeMapMobile({
  earthquake,
  onBack,
}: EarthquakeMapMobileProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b p-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={getMagnitudeColorClass(earthquake.magnitude)}>
                M {earthquake.magnitude.toFixed(1)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getMagnitudeLabel(earthquake.magnitude)}
              </span>
            </div>
            <p className="text-sm font-semibold line-clamp-2">
              {earthquake.location}
            </p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-full w-full pt-24 pb-32">
        <EarthquakeMap
          earthquakes={[earthquake]}
          selectedEarthquake={earthquake}
          onMarkerClick={() => {}}
        />
      </div>

      {/* Bottom Info Card */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-xs">
                {earthquake.latitude.toFixed(3)}°, {earthquake.longitude.toFixed(3)}°
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs">Depth: {earthquake.depth}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{earthquake.date}</p>
        </div>
      </div>
    </div>
  );
}

