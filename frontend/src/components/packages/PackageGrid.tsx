import React from "react";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import PackageCard from "./PackageCard";
import Button from "../ui/Button";
import type { Package, PaginatedResponse } from "../../types";

interface PackageGridProps {
  packages: Package[];
  pagination?: PaginatedResponse<Package>["pagination"];
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

const PackageGrid: React.FC<PackageGridProps> = ({
  packages,
  pagination,
  onPageChange,
  onClearFilters,
}) => {
  if (packages.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <MagnifyingGlassIcon className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-900 mb-4">
          No packages found
        </h3>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          We couldn't find any tours matching your criteria. Try adjusting your
          search filters or browse all available packages.
        </p>
        <Button type="button" onClick={onClearFilters} variant="primary">
          View All Packages
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Available Tours
          </h2>
          <p className="text-slate-600">
            Showing {packages.length} of {pagination?.total || 0} amazing
            experiences
          </p>
        </div>
        <div className="hidden md:flex items-center space-x-4 text-sm text-slate-500">
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
            <span>Highly Rated</span>
          </div>
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1 text-blue-400" />
            <span>Local Guides</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {packages.map((pkg, index) => (
          <PackageCard key={pkg.id} package={pkg} index={index} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <Button
            type="button"
            variant="outline"
            disabled={!pagination.hasPrev}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const page = i + 1;
                const isActive = page === pagination.page;
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              },
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={!pagination.hasNext}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
};

export default PackageGrid;
