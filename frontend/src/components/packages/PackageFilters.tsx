import React, { useCallback } from "react";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Button from "../ui/Button";
import type { PackageFilters } from "../../types";

interface PackageFiltersProps {
  filters: PackageFilters;
  onFilterChange: (key: keyof PackageFilters, value: any) => void;
  onClearFilters: () => void;
}

const PackageFiltersComponent: React.FC<PackageFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  // Memoized handlers to prevent unnecessary re-renders
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onFilterChange("search", value || undefined);
    },
    [onFilterChange],
  );

  const handleLocationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onFilterChange("location", value || undefined);
    },
    [onFilterChange],
  );

  const handleMinPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onFilterChange("min_price", value ? Number(value) : undefined);
    },
    [onFilterChange],
  );

  const handleMaxPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onFilterChange("max_price", value ? Number(value) : undefined);
    },
    [onFilterChange],
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const [sort_by, sort_order] = e.target.value.split("-");
      onFilterChange("sort_by", sort_by);
      onFilterChange("sort_order", sort_order);
    },
    [onFilterChange],
  );

  const clearSearch = useCallback(() => {
    onFilterChange("search", undefined);
  }, [onFilterChange]);

  const clearLocation = useCallback(() => {
    onFilterChange("location", undefined);
  }, [onFilterChange]);

  const clearPriceRange = useCallback(() => {
    onFilterChange("min_price", undefined);
    onFilterChange("max_price", undefined);
  }, [onFilterChange]);

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.location ||
    filters.min_price ||
    filters.max_price ||
    filters.sort_by !== "created_at" ||
    filters.sort_order !== "desc",
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 mb-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-3">
            <FunnelIcon className="h-5 w-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Find Your Perfect Tour
          </h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Controls - No Form Element */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Search Tours
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="Search destinations, activities..."
              value={filters.search || ""}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            />
            {filters.search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Location Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="Where to go?"
              value={filters.location || ""}
              onChange={handleLocationChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            />
            {filters.location && (
              <button
                onClick={clearLocation}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Price Range (ETB)
            </label>
            {(filters.min_price || filters.max_price) && (
              <button
                onClick={clearPriceRange}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="Min"
              value={filters.min_price || ""}
              onChange={handleMinPriceChange}
              min="0"
            />
            <input
              type="number"
              className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="Max"
              value={filters.max_price || ""}
              onChange={handleMaxPriceChange}
              min="0"
            />
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <select
            className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white"
            value={`${filters.sort_by}-${filters.sort_order}`}
            onChange={handleSortChange}
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="duration-asc">Shortest Duration</option>
            <option value="duration-desc">Longest Duration</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Search: "{filters.search}"
                <button
                  onClick={clearSearch}
                  className="ml-1 text-primary-600 hover:text-primary-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.location && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Location: "{filters.location}"
                <button
                  onClick={clearLocation}
                  className="ml-1 text-primary-600 hover:text-primary-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {(filters.min_price || filters.max_price) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Price: {filters.min_price || 0} - {filters.max_price || "∞"} ETB
                <button
                  onClick={clearPriceRange}
                  className="ml-1 text-primary-600 hover:text-primary-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageFiltersComponent;
