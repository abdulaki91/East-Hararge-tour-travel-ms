import React from "react";
import Button from "../ui/Button";
import type { BookingFilters } from "../../types";

interface BookingFiltersProps {
  filters: BookingFilters;
  onFilterChange: (key: keyof BookingFilters, value: any) => void;
  onClearFilters: () => void;
}

const BookingFiltersComponent: React.FC<BookingFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4 font-display">
        Filter Bookings
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Status
          </label>
          <select
            className="block w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 px-4 py-3 text-sm font-medium"
            value={filters.status || ""}
            onChange={(e) =>
              onFilterChange("status", e.target.value || undefined)
            }
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Payment Status
          </label>
          <select
            className="block w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 px-4 py-3 text-sm font-medium"
            value={filters.payment_status || ""}
            onChange={(e) =>
              onFilterChange("payment_status", e.target.value || undefined)
            }
          >
            <option value="">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full shadow-md hover:shadow-lg"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingFiltersComponent;
