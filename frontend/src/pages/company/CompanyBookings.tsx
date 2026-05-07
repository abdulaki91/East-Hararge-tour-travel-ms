import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { bookingService } from "../../services/bookings";
import type { BookingFilters } from "../../types";
import BookingManagement from "../../components/company/BookingManagement";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/common/Pagination";

// Extended filters for the UI (includes search and date range)
interface ExtendedBookingFilters extends BookingFilters {
  search?: string;
  booking_date_from?: string;
  booking_date_to?: string;
}

const CompanyBookings: React.FC = () => {
  const [filters, setFilters] = useState<ExtendedBookingFilters>({
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: bookingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["company-bookings", filters],
    queryFn: () => bookingService.getCompanyBookings(filters),
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["company-booking-stats"],
    queryFn: () => bookingService.getCompanyBookingStats(),
  });

  const handleFilterChange = (
    key: keyof ExtendedBookingFilters,
    value: any,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load bookings
        </h3>
        <p className="text-gray-600 mb-4">
          There was an error loading your bookings. Please try again.
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const bookings = bookingsData?.data?.items || [];
  const pagination = bookingsData?.data?.pagination;
  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Booking Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all your package bookings and payments
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_bookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending_bookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.confirmed_bookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCardIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_revenue?.toLocaleString()} ETB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Search"
              placeholder="Search by customer name, email, or booking reference"
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Status
              </label>
              <select
                className="block w-full rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 px-4 py-3 text-sm"
                value={filters.status || ""}
                onChange={(e) =>
                  handleFilterChange("status", e.target.value || undefined)
                }
              >
                <option value="">All Booking Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                className="block w-full rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 px-4 py-3 text-sm"
                value={filters.payment_status || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "payment_status",
                    e.target.value || undefined,
                  )
                }
              >
                <option value="">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="From Date"
              type="date"
              value={filters.booking_date_from || ""}
              onChange={(e) =>
                handleFilterChange(
                  "booking_date_from",
                  e.target.value || undefined,
                )
              }
            />
            <Input
              label="To Date"
              type="date"
              value={filters.booking_date_to || ""}
              onChange={(e) =>
                handleFilterChange(
                  "booking_date_to",
                  e.target.value || undefined,
                )
              }
            />
          </div>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarDaysIcon className="h-16 w-16" />}
          title="No bookings found"
          description="No bookings match your current filters. Try adjusting your search criteria."
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <BookingManagement
              key={booking.id}
              booking={booking}
              onUpdate={refetch}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default CompanyBookings;
