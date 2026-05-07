import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { packageService } from "../services/packages";
import type { PackageFilters, PaginatedResponse, Package } from "../types";
import Button from "../components/ui/Button";
import PackageHero from "../components/packages/PackageHero";
import PackageFiltersComponent from "../components/packages/PackageFilters";
import PackageGrid from "../components/packages/PackageGrid";

const PackagesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search");

  const [filters, setFilters] = useState<PackageFilters>({
    page: 1,
    limit: 12,
    sort_by: "created_at",
    sort_order: "desc",
    search: urlSearch || undefined,
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Update filters when URL search parameter changes
  useEffect(() => {
    if (urlSearch) {
      setFilters((prev) => ({
        ...prev,
        search: urlSearch,
        page: 1,
      }));
    }
  }, [urlSearch]);

  // Debounce filters to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const { data, isLoading, error, refetch } = useQuery<
    PaginatedResponse<Package>
  >({
    queryKey: ["packages", debouncedFilters],
    queryFn: () => packageService.getPackages(debouncedFilters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Handle errors in useEffect instead of onError
  useEffect(() => {
    if (error) {
      console.error("Package query error:", error);
    }
  }, [error]);

  const handleFilterChange = (key: keyof PackageFilters, value: any) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [key]: value,
        page: 1, // Reset to first page when filters change
      };
      return newFilters;
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sort_by: "created_at",
      sort_order: "desc",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading amazing packages...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Failed to load packages
            </h3>
            <p className="text-slate-600 mb-6">
              Something went wrong while fetching the tour packages.
            </p>
            <Button type="button" onClick={() => refetch()} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const packages = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <PackageHero totalPackages={packages.length} />

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <PackageFiltersComponent
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />

        {/* Results */}
        <PackageGrid
          packages={packages}
          pagination={pagination}
          onPageChange={handlePageChange}
          onClearFilters={clearFilters}
        />
      </div>
    </div>
  );
};

export default PackagesPage;
