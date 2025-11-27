"use client";

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export interface FilterOptions {
  search: string;
  minMagnitude: string;
  sortBy: "date" | "magnitude";
  sortOrder: "desc" | "asc";
}

export interface TempFilterState {
  tempSearch: string;
  tempMinMagnitude: string;
  tempSortBy: "date" | "magnitude";
  tempSortOrder: "desc" | "asc";
}

interface EarthquakeFiltersProps {
  filters: FilterOptions;
  onFiltersApply: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
}

export function EarthquakeFilters({
  filters,
  onFiltersApply,
  totalCount,
  filteredCount,
}: EarthquakeFiltersProps) {
  // Temporary state for all filters (not applied until Search is clicked)
  const [tempSearch, setTempSearch] = useState(filters.search);
  const [tempMinMagnitude, setTempMinMagnitude] = useState(filters.minMagnitude);
  const [tempSortBy, setTempSortBy] = useState(filters.sortBy);
  const [tempSortOrder, setTempSortOrder] = useState(filters.sortOrder);
  
  const hasActiveFilters =
    filters.search !== "" || filters.minMagnitude !== "0";

  const hasUnappliedChanges =
    tempSearch !== filters.search ||
    tempMinMagnitude !== filters.minMagnitude ||
    tempSortBy !== filters.sortBy ||
    tempSortOrder !== filters.sortOrder;

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Apply all filters at once
    onFiltersApply({
      search: tempSearch,
      minMagnitude: tempMinMagnitude,
      sortBy: tempSortBy,
      sortOrder: tempSortOrder,
    });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      minMagnitude: "0",
      sortBy: "date" as const,
      sortOrder: "desc" as const,
    };
    
    setTempSearch(defaultFilters.search);
    setTempMinMagnitude(defaultFilters.minMagnitude);
    setTempSortBy(defaultFilters.sortBy);
    setTempSortOrder(defaultFilters.sortOrder);
    
    onFiltersApply(defaultFilters);
  };

  return (
    <div>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {filteredCount !== totalCount && (
                <Badge variant="secondary">
                  {filteredCount} of {totalCount} results
                </Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 gap-2"
              >
                <X className="h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-6 p-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-semibold">
                Search Location
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by location..."
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Filter earthquakes by location name
              </p>
            </div>

            {/* Min Magnitude */}
            <div className="space-y-2">
              <Label htmlFor="magnitude" className="text-sm font-semibold">
                Minimum Magnitude
              </Label>
              <Select
                value={tempMinMagnitude}
                onValueChange={setTempMinMagnitude}
              >
                <SelectTrigger id="magnitude" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Magnitudes (0+)</SelectItem>
                  <SelectItem value="2">2.0+</SelectItem>
                  <SelectItem value="3">3.0+ (Minor)</SelectItem>
                  <SelectItem value="4">4.0+ (Light)</SelectItem>
                  <SelectItem value="5">5.0+ (Moderate)</SelectItem>
                  <SelectItem value="6">6.0+ (Strong)</SelectItem>
                  <SelectItem value="7">7.0+ (Major)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Show only earthquakes above this magnitude
              </p>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label htmlFor="sort" className="text-sm font-semibold">
                Sort By
              </Label>
              <Select
                value={`${tempSortBy}-${tempSortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split("-") as [
                    "date" | "magnitude",
                    "desc" | "asc"
                  ];
                  setTempSortBy(sortBy);
                  setTempSortOrder(sortOrder);
                }}
              >
                <SelectTrigger id="sort" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="magnitude-desc">
                    Highest Magnitude
                  </SelectItem>
                  <SelectItem value="magnitude-asc">
                    Lowest Magnitude
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose how to order the earthquake list
              </p>
            </div>

            {/* Apply Button */}
            <div className="pt-4 space-y-2">
              <Button 
                onClick={() => handleSearchSubmit()} 
                className="w-full gap-2"
                size="lg"
                disabled={!hasUnappliedChanges}
              >
                <Search className="h-4 w-4" />
                {hasUnappliedChanges ? "Apply Filters" : "No Changes to Apply"}
              </Button>
              {hasUnappliedChanges && (
                <p className="text-xs text-center text-muted-foreground">
                  Click to apply your filter changes
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

