"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Earthquake, EarthquakeDetails } from "@/lib/types";
import {
  getMagnitudeColorClass,
  getMagnitudeLabel,
  formatDate,
} from "@/lib/earthquake-utils";
import {
  MapPin,
  Layers,
  Clock,
  AlertTriangle,
  Activity,
  User,
  Map,
} from "lucide-react";

interface EarthquakeDetailsDialogProps {
  earthquake: Earthquake;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EarthquakeDetailsDialog({
  earthquake,
  open,
  onOpenChange,
}: EarthquakeDetailsDialogProps) {
  const [details, setDetails] = useState<EarthquakeDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && earthquake.detailsUrl) {
      fetchDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, earthquake.detailsUrl]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/phivolcs/details?url=${encodeURIComponent(
          earthquake.detailsUrl!
        )}`
      );
      
      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Rate limit exceeded. Please try again later.");
        }
        throw new Error("Failed to fetch details");
      }
      
      const data = await response.json();
      setDetails(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load earthquake details";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Badge
              className={`${getMagnitudeColorClass(
                earthquake.magnitude
              )} text-lg font-bold px-3 py-1`}
            >
              M {earthquake.magnitude.toFixed(1)}
            </Badge>
            <span>{getMagnitudeLabel(earthquake.magnitude)} Earthquake</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            {earthquake.location}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {details && !loading && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Date & Time
                  </p>
                  <p className="text-base font-semibold">
                    {details.dateTime || formatDate(earthquake.date)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Epicenter
                  </p>
                  {details.epicenter ? (
                    <div className="space-y-1">
                      <p className="text-base font-semibold">
                        {details.epicenter.place}
                      </p>
                      {details.epicenter.distance &&
                        details.epicenter.direction && (
                          <p className="text-sm text-muted-foreground">
                            {details.epicenter.distance}{" "}
                            {details.epicenter.direction}
                          </p>
                        )}
                    </div>
                  ) : (
                    <p className="text-base font-semibold">
                      {earthquake.location}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    {details.latitude || earthquake.latitude.toFixed(3)}°N,{" "}
                    {details.longitude || earthquake.longitude.toFixed(3)}°E
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Magnitude
                    </p>
                    <p className="text-base font-semibold">
                      {details.magnitude || earthquake.magnitude}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Layers className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Depth
                    </p>
                    <p className="text-base font-semibold">
                      {details.depth || earthquake.depth}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Damage & Aftershocks Alerts */}
            {(details.expectingDamage || details.expectingAftershocks) && (
              <>
                <Separator />
                <div className="space-y-3">
                  {details.expectingDamage && (
                    <Alert
                      variant={
                        details.expectingDamage.toLowerCase().includes("yes")
                          ? "destructive"
                          : "default"
                      }
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <span className="font-semibold">
                          Expecting Damage:
                        </span>{" "}
                        {details.expectingDamage}
                      </AlertDescription>
                    </Alert>
                  )}
                  {details.expectingAftershocks && (
                    <Alert>
                      <Activity className="h-4 w-4" />
                      <AlertDescription>
                        <span className="font-semibold">
                          Expecting Aftershocks:
                        </span>{" "}
                        {details.expectingAftershocks}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}

            {/* Map Image */}
            {details.mapImage && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Map className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Epicenter Map</h3>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={details.mapImage}
                    alt="Earthquake epicenter map"
                    className="w-full rounded-lg border"
                  />
                </div>
              </>
            )}

            {/* Report Information */}
            {(details.issuedOn || details.preparedBy) && (
              <>
                <Separator />
                <div className="space-y-2 text-sm text-muted-foreground">
                  {details.issuedOn && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        <span className="font-medium">Issued On:</span>{" "}
                        {details.issuedOn}
                      </span>
                    </div>
                  )}
                  {details.preparedBy && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        <span className="font-medium">Prepared By:</span>{" "}
                        {details.preparedBy}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}