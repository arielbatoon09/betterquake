"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EarthquakeList } from "@/components/earthquake-list";
import { EarthquakeFilters, FilterOptions } from "@/components/earthquake-filters";
import { Pagination } from "@/components/pagination";
import { Earthquake, EarthquakeListResponse } from "@/lib/types";
import { parsePhivolcsDate, getDataPeriodInfo } from "@/lib/earthquake-utils";
import {
  CACHE_KEY,
  getCachedData,
  setCachedData,
  getCacheAge,
  CACHE_DURATION,
} from "@/lib/cache-utils";
import { Activity, AlertTriangle, TrendingUp, RefreshCw, Database, Calendar, MapPin, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

// Dynamically import map components (client-side only)
const EarthquakeMap = dynamic(
  () => import("@/components/earthquake-map").then((mod) => mod.EarthquakeMap),
  { ssr: false }
);

const EarthquakeMapMobile = dynamic(
  () => import("@/components/earthquake-map-mobile").then((mod) => mod.EarthquakeMapMobile),
  { ssr: false }
);

export default function Home() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  
  // Filter and Pagination states
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    minMagnitude: "0",
    sortBy: "date",
    sortOrder: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Map state
  const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [useUserLocation, setUseUserLocation] = useState(false);
  
  // UI state
  const [showStats, setShowStats] = useState(true);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);

  const fetchEarthquakes = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      // Try to get from cache first
      if (!forceRefresh) {
        const cachedData = getCachedData<Earthquake[]>(CACHE_KEY);
        if (cachedData) {
          setEarthquakes(cachedData);
          const cacheAge = getCacheAge(CACHE_KEY);
          if (cacheAge !== null) {
            setLastUpdated(new Date(Date.now() - cacheAge));
          }
          setIsFromCache(true);
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      const response = await fetch("/api/phivolcs/latest");
      
      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Rate limit exceeded. Please try again later.");
        }
        throw new Error("Failed to fetch earthquakes");
      }
      
      const data: EarthquakeListResponse = await response.json();
      
      setEarthquakes(data.data);
      setLastUpdated(new Date());
      
      // Cache the data
      setCachedData(CACHE_KEY, data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load earthquake data. Please try again.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarthquakes();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchEarthquakes(true);
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

  // Filter and sort earthquakes
  const filteredEarthquakes = useMemo(() => {
    let filtered = [...earthquakes];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((eq) =>
        eq.location.toLowerCase().includes(searchLower)
      );
    }

    // Apply magnitude filter
    const minMag = parseFloat(filters.minMagnitude);
    if (minMag > 0) {
      filtered = filtered.filter((eq) => eq.magnitude >= minMag);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (filters.sortBy === "date") {
        const dateA = parsePhivolcsDate(a.date);
        const dateB = parsePhivolcsDate(b.date);
        if (!dateA || !dateB) return 0;
        const comparison = dateB.getTime() - dateA.getTime();
        return filters.sortOrder === "desc" ? comparison : -comparison;
      } else {
        const comparison = b.magnitude - a.magnitude;
        return filters.sortOrder === "desc" ? comparison : -comparison;
      }
    });

    return filtered;
  }, [earthquakes, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredEarthquakes.length / pageSize);
  const paginatedEarthquakes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredEarthquakes.slice(startIndex, endIndex);
  }, [filteredEarthquakes, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize]);

  // Get data period information
  const dataPeriod = useMemo(() => {
    const dates = earthquakes.map((eq) => eq.date);
    return getDataPeriodInfo(dates);
  }, [earthquakes]);

  const stats = {
    total: earthquakes.length,
    major: earthquakes.filter((eq) => eq.magnitude >= 5).length,
    recent24h: earthquakes.filter((eq) => {
      const date = parsePhivolcsDate(eq.date);
      if (!date) return false;
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return date >= dayAgo;
    }).length,
  };

  // Handle earthquake selection
  const handleEarthquakeSelect = (earthquake: Earthquake) => {
    setSelectedEarthquake(earthquake);
    setUseUserLocation(false); // Reset user location when selecting earthquake
    
    // On mobile, show full-screen map
    if (window.innerWidth < 1024) {
      setShowMobileMap(true);
    }
  };

  // Handle use my location
  const handleUseMyLocation = () => {
    setUseUserLocation(true);
    setSelectedEarthquake(null);
  };

  return (
    <>
      {/* Mobile Full-Screen Map */}
      {showMobileMap && selectedEarthquake && (
        <EarthquakeMapMobile
          earthquake={selectedEarthquake}
          onBack={() => setShowMobileMap(false)}
        />
      )}

      <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-4 max-w-[1920px] h-full flex flex-col">
        {/* Compact Header */}
        <div className="mb-2 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Logo and Title */}
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BetterQuake
                </h1>
                {lastUpdated && (
                  <p className="text-[10px] text-muted-foreground">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {dataPeriod && (
                <Badge 
                  variant={dataPeriod.isCurrentMonth ? "default" : "secondary"}
                  className="gap-1 px-2 py-0.5 text-xs hidden sm:flex"
                >
                  <Calendar className="h-3 w-3" />
                  {dataPeriod.monthYear.split(' ')[0]}
                </Badge>
              )}
              
              {isFromCache && (
                <Badge variant="outline" className="gap-1 px-2 py-0.5 text-xs hidden sm:flex">
                  <Database className="h-3 w-3" />
                  Cached
                </Badge>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="gap-1 h-7 px-2"
              >
                {showStats ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                <span className="text-xs hidden sm:inline">Stats</span>
              </Button>

              <Button
                onClick={() => fetchEarthquakes(true)}
                disabled={loading}
                size="sm"
                className="gap-1 h-7 px-2"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                <span className="text-xs hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards - Collapsible */}
        {showStats && (
          <div className="grid grid-cols-3 gap-2 mb-2 flex-shrink-0">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white p-3">
              <div className="text-center">
                <p className="text-base font-medium opacity-90 mb-1">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 text-white p-3">
              <div className="text-center">
                <p className="text-base font-medium opacity-90 mb-1 flex items-center justify-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  M ≥ 5.0
                </p>
                <p className="text-2xl font-bold">{stats.major}</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white p-3">
              <div className="text-center">
                <p className="text-base font-medium opacity-90 mb-1 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  24h
                </p>
                <p className="text-2xl font-bold">{stats.recent24h}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Left Side - Earthquake List */}
          <Card className="shadow-xl lg:col-span-2 flex flex-col overflow-hidden">
            <CardHeader className="border-b flex-shrink-0 py-3 px-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">Recent Earthquakes</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click to view on map
                  </p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {filteredEarthquakes.length > 0 && (
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {filteredEarthquakes.length}
                      {filteredEarthquakes.length !== earthquakes.length && (
                        <span className="text-[10px] ml-1 opacity-70">
                          /{earthquakes.length}
                        </span>
                      )}
                    </Badge>
                  )}
                  
                  {/* Filters Sheet */}
                  {earthquakes.length > 0 && !loading && (
                    <Sheet open={showFiltersSheet} onOpenChange={setShowFiltersSheet}>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8 px-3"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          <span className="text-xs hidden sm:inline">Filters</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>Filter Earthquakes</SheetTitle>
                          <SheetDescription>
                            Refine the list by location, magnitude, or sort order
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6">
                          <EarthquakeFilters
                            filters={filters}
                            onFiltersApply={(newFilters) => {
                              setFilters(newFilters);
                              setShowFiltersSheet(false);
                            }}
                            totalCount={earthquakes.length}
                            filteredCount={filteredEarthquakes.length}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-4 pb-4 flex-1 overflow-y-auto">
              {earthquakes.length === 0 && !loading && !error && (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No earthquake data available</p>
                </div>
              )}
              {filteredEarthquakes.length === 0 && earthquakes.length > 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No earthquakes match your filters</p>
                </div>
              )}
              {(filteredEarthquakes.length > 0 || loading) && (
                <>
                  <EarthquakeList
                    earthquakes={paginatedEarthquakes}
                    isLoading={loading}
                    showPagination={true}
                    onEarthquakeSelect={handleEarthquakeSelect}
                    selectedEarthquake={selectedEarthquake}
                  />
                  {!loading && filteredEarthquakes.length > pageSize && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalItems={filteredEarthquakes.length}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={setPageSize}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Right Side - Map (Desktop only) */}
          <div className="hidden lg:block lg:col-span-3 overflow-hidden">
            <Card className="shadow-xl h-full flex flex-col">
              <CardHeader className="border-b flex-shrink-0 py-3 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Earthquake Map</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {selectedEarthquake
                        ? "Selected location"
                        : useUserLocation
                        ? "Your location"
                        : "Current page"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUseMyLocation}
                    className="gap-1.5 h-8 px-3"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="text-xs">My Location</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className=" flex-1 overflow-hidden">
                {(filteredEarthquakes.length > 0 || loading) && !error && (
                  <div className="h-full w-full">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-muted-foreground">
                          <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                          <p>Loading map...</p>
                        </div>
                      </div>
                    ) : (
                      <EarthquakeMap
                        earthquakes={paginatedEarthquakes}
                        selectedEarthquake={selectedEarthquake}
                        onMarkerClick={setSelectedEarthquake}
                        requestUserLocation={useUserLocation}
                      />
                    )}
                  </div>
                )}
                {earthquakes.length === 0 && !loading && !error && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No earthquake data to display</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}