"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Earthquake } from "@/lib/types";
import {
  getMagnitudeColorClass,
  getMagnitudeLabel,
  getRelativeTime,
} from "@/lib/earthquake-utils";
import { MapPin, Layers, Clock } from "lucide-react";
import { EarthquakeDetailsDialog } from "./earthquake-details-dialog";

interface EarthquakeListProps {
  earthquakes: Earthquake[];
  isLoading?: boolean;
  showPagination?: boolean;
}

export function EarthquakeList({
  earthquakes,
  isLoading,
  showPagination = false,
}: EarthquakeListProps) {
  const [selectedEarthquake, setSelectedEarthquake] =
    useState<Earthquake | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleCardClick = (earthquake: Earthquake) => {
    if (earthquake.detailsUrl) {
      setSelectedEarthquake(earthquake);
      setDetailsOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  const containerClass = showPagination 
    ? "space-y-3" 
    : "h-[calc(100vh-12rem)]";

  const content = (
    <div className={showPagination ? "space-y-3" : "space-y-3 pr-4"}>
          {earthquakes.map((earthquake, index) => (
            <Card
              key={`${earthquake.date}-${earthquake.latitude}-${index}`}
              className={`p-5 transition-all hover:shadow-lg ${
                earthquake.detailsUrl
                  ? "cursor-pointer hover:border-primary"
                  : ""
              }`}
              onClick={() => handleCardClick(earthquake)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Magnitude Badge */}
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`${getMagnitudeColorClass(
                        earthquake.magnitude
                      )} text-lg font-bold px-3 py-1`}
                    >
                      M {earthquake.magnitude.toFixed(1)}
                    </Badge>
                    <span className="text-sm font-medium text-muted-foreground">
                      {getMagnitudeLabel(earthquake.magnitude)}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium leading-tight">
                      {earthquake.location}
                    </span>
                  </div>

                  <Separator />

                  {/* Details Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{getRelativeTime(earthquake.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />
                      <span>Depth: {earthquake.depth}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono">
                        {earthquake.latitude.toFixed(3)}°,{" "}
                        {earthquake.longitude.toFixed(3)}°
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
  );

  return (
    <>
      {showPagination ? (
        content
      ) : (
        <ScrollArea className={containerClass}>
          {content}
        </ScrollArea>
      )}

      {selectedEarthquake && (
        <EarthquakeDetailsDialog
          earthquake={selectedEarthquake}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </>
  );
}

