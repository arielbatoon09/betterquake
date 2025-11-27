"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Activity, AlertTriangle, TrendingUp, RefreshCw, Database, Calendar } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          {/* Top Row - Logo and Cache Indicator (Desktop) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
                <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BetterQuake
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Real-time earthquake monitoring powered by PHIVOLCS
              </p>
            </div>
            
            {/* Cache Indicator - Desktop Only */}
            {isFromCache && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>Cached</span>
              </div>
            )}
          </div>

          {/* Bottom Row - Status Info and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            {/* Left Side - Status Info */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {lastUpdated && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                  {isFromCache && " (from cache)"}
                </p>
              )}
              
              {isFromCache && (
                <div className="flex sm:hidden items-center gap-1.5 text-xs text-muted-foreground">
                  <Database className="h-3.5 w-3.5" />
                  <span>Cached</span>
                </div>
              )}
            </div>
            
            {/* Right Side - Month Badge and Refresh Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {dataPeriod && (
                <Badge 
                  variant={dataPeriod.isCurrentMonth ? "default" : "secondary"}
                  className="gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>
                    {dataPeriod.monthYear}
                    {dataPeriod.isCurrentMonth && " (Current)"}
                  </span>
                </Badge>
              )}
              
              <Button
                onClick={() => fetchEarthquakes(true)}
                disabled={loading}
                size="default"
                className="gap-2 w-full sm:w-auto"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">
                Total Earthquakes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{stats.total}</span>
                <span className="text-sm opacity-75">events</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Magnitude ≥ 5.0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{stats.major}</span>
                <span className="text-sm opacity-75">significant</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Last 24 Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{stats.recent24h}</span>
                <span className="text-sm opacity-75">recent</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        {earthquakes.length > 0 && !loading && (
          <EarthquakeFilters
            filters={filters}
            onFiltersApply={setFilters}
            totalCount={earthquakes.length}
            filteredCount={filteredEarthquakes.length}
          />
        )}

        {/* Main Content */}
        <Card className="shadow-xl">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Recent Earthquakes</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Click on any earthquake to view detailed information
                </p>
              </div>
              {filteredEarthquakes.length > 0 && (
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {filteredEarthquakes.length}{" "}
                  {filteredEarthquakes.length === 1 ? "Event" : "Events"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
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

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Data provided by{" "}
            <a
              href="https://earthquake.phivolcs.dost.gov.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              PHIVOLCS
            </a>{" "}
            (Philippine Institute of Volcanology and Seismology)
          </p>
        </div>
      </div>
    </div>
  );
}