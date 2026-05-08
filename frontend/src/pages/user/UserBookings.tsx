import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { bookingService } from "../../services/bookings";
import { paymentService } from "../../services/payments";
import type { BookingFilters, BookingStatus } from "../../types";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import BookingFiltersComponent from "../../components/user/BookingFilters";
import BookingCard from "../../components/user/BookingCard";
import Pagination from "../../components/common/Pagination";
import {
  exportToExcel,
  exportToPDF,
  exportToCSV,
  formatDateForExport,
  formatCurrencyForExport,
  formatStatus,
} from "../../utils/exportUtils";
import toast from "react-hot-toast";

const UserBookings: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    limit: 10,
  });
  const [showAll, setShowAll] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user-bookings", filters],
    queryFn: () => bookingService.getUserBookings(filters),
  });

  // Auto-verify pending Chapa payments when returning from Chapa
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const txRef = searchParams.get("ref");

    if (paymentStatus === "success" && txRef) {
      toast.success("Payment completed successfully!");
      // Refetch bookings to get updated status
      setTimeout(() => {
        refetch();
      }, 1500);
    } else if (paymentStatus === "failed") {
      toast.error("Payment failed. Please try again.");
    } else if (paymentStatus === "error") {
      const message = searchParams.get("message") || "An error occurred";
      toast.error(`Payment error: ${message}`);
    }

    // Auto-verify any pending Chapa payments on page load
    if (data?.data?.items) {
      const pendingChapaBookings = data.data.items.filter(
        (booking: any) =>
          booking.payment_status === "pending" &&
          booking.payment_method === "chapa" &&
          booking.payment_id,
      );

      if (pendingChapaBookings.length > 0) {
        console.log(
          "🔄 Found",
          pendingChapaBookings.length,
          "pending Chapa payment(s), auto-verifying...",
        );
        pendingChapaBookings.forEach((booking: any) => {
          paymentService
            .verifyPayment(booking.payment_id)
            .then((response) => {
              if (response.data.status === "completed") {
                console.log("✅ Payment verified:", booking.payment_id);
                toast.success("Payment verified successfully!");
                refetch();
              }
            })
            .catch((error) => {
              console.error("❌ Auto-verification failed:", error);
            });
        });
      }
    }
  }, [searchParams, data, refetch]);

  const getStatusVariant = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      case "completed":
        return "info";
      default:
        return "default";
    }
  };

  const handleViewAll = () => {
    setShowAll(true);
    setFilters((prev) => ({
      ...prev,
      limit: 1000, // Large number to get all bookings
      page: 1,
    }));
  };

  const handleViewPaginated = () => {
    setShowAll(false);
    setFilters((prev) => ({
      ...prev,
      limit: 10,
      page: 1,
    }));
  };

  const handleFilterChange = (key: keyof BookingFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Export functions
  const handleExportToExcel = () => {
    if (!bookings || bookings.length === 0) {
      toast.error("No bookings to export");
      return;
    }

    const exportData = bookings.map((booking: any) => ({
      booking_reference: booking.booking_reference,
      package_title: booking.package?.title || "N/A",
      destination: booking.package?.location || "N/A",
      booking_date: formatDateForExport(booking.booking_date),
      travel_date: formatDateForExport(booking.travel_date),
      number_of_people: booking.number_of_people,
      total_amount: formatCurrencyForExport(booking.total_amount),
      status: formatStatus(booking.status),
      payment_status: booking.payment?.status
        ? formatStatus(booking.payment.status)
        : "Pending",
    }));

    exportToExcel({
      filename: `my-bookings-${new Date().toISOString().split("T")[0]}`,
      columns: [
        { header: "Booking Reference", key: "booking_reference", width: 20 },
        { header: "Package", key: "package_title", width: 30 },
        { header: "Destination", key: "destination", width: 20 },
        { header: "Booking Date", key: "booking_date", width: 15 },
        { header: "Travel Date", key: "travel_date", width: 15 },
        { header: "People", key: "number_of_people", width: 10 },
        { header: "Total Amount", key: "total_amount", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Payment Status", key: "payment_status", width: 15 },
      ],
      data: exportData,
    });

    toast.success("Bookings exported to Excel successfully!");
  };

  const handleExportToPDF = () => {
    if (!bookings || bookings.length === 0) {
      toast.error("No bookings to export");
      return;
    }

    const exportData = bookings.map((booking: any) => ({
      booking_reference: booking.booking_reference,
      package_title: booking.package?.title || "N/A",
      travel_date: formatDateForExport(booking.travel_date),
      number_of_people: booking.number_of_people,
      total_amount: formatCurrencyForExport(booking.total_amount),
      status: formatStatus(booking.status),
    }));

    exportToPDF({
      filename: `my-bookings-${new Date().toISOString().split("T")[0]}`,
      title: "My Bookings Report",
      columns: [
        { header: "Reference", key: "booking_reference", width: 20 },
        { header: "Package", key: "package_title", width: 40 },
        { header: "Travel Date", key: "travel_date", width: 15 },
        { header: "People", key: "number_of_people", width: 10 },
        { header: "Amount", key: "total_amount", width: 15 },
        { header: "Status", key: "status", width: 15 },
      ],
      data: exportData,
    });

    toast.success("Bookings exported to PDF successfully!");
  };

  const handleExportToCSV = () => {
    if (!bookings || bookings.length === 0) {
      toast.error("No bookings to export");
      return;
    }

    const exportData = bookings.map((booking: any) => ({
      booking_reference: booking.booking_reference,
      package_title: booking.package?.title || "N/A",
      destination: booking.package?.location || "N/A",
      booking_date: formatDateForExport(booking.booking_date),
      travel_date: formatDateForExport(booking.travel_date),
      number_of_people: booking.number_of_people,
      total_amount: formatCurrencyForExport(booking.total_amount),
      status: formatStatus(booking.status),
      payment_status: booking.payment?.status
        ? formatStatus(booking.payment.status)
        : "Pending",
    }));

    exportToCSV({
      filename: `my-bookings-${new Date().toISOString().split("T")[0]}`,
      columns: [
        { header: "Booking Reference", key: "booking_reference" },
        { header: "Package", key: "package_title" },
        { header: "Destination", key: "destination" },
        { header: "Booking Date", key: "booking_date" },
        { header: "Travel Date", key: "travel_date" },
        { header: "People", key: "number_of_people" },
        { header: "Total Amount", key: "total_amount" },
        { header: "Status", key: "status" },
        { header: "Payment Status", key: "payment_status" },
      ],
      data: exportData,
    });

    toast.success("Bookings exported to CSV successfully!");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <p className="text-error-600 mb-6 font-medium">
          Failed to load bookings
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const bookings = data?.data.items || [];
  const pagination = data?.data.pagination;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold font-display mb-2">
              My Bookings
            </h1>
            <p className="text-primary-100 text-lg">
              Track your tour reservations and travel plans 🎫
            </p>
          </div>
          <Link to="/packages">
            <Button
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-100 shadow-lg hover:shadow-xl"
            >
              Browse Packages
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <BookingFiltersComponent
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          <div className="flex flex-wrap items-center gap-3">
            {/* Export Dropdown */}
            {bookings.length > 0 && (
              <div className="relative">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  title="Export bookings"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                {showExportMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowExportMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-20">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            handleExportToExcel();
                            setShowExportMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-green-600" />
                          Export to Excel
                        </button>
                        <button
                          onClick={() => {
                            handleExportToPDF();
                            setShowExportMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-red-600" />
                          Export to PDF
                        </button>
                        <button
                          onClick={() => {
                            handleExportToCSV();
                            setShowExportMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                          Export to CSV
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {!showAll && bookings.length > 0 && (
              <Button
                variant="outline"
                onClick={handleViewAll}
                className="whitespace-nowrap"
              >
                View All ({pagination?.totalItems || 0})
              </Button>
            )}
            {showAll && (
              <Button
                variant="outline"
                onClick={handleViewPaginated}
                className="whitespace-nowrap"
              >
                Show Paginated
              </Button>
            )}
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="You haven't made any bookings yet. Start exploring our amazing packages!"
          action={{
            label: "Browse Packages",
            onClick: () => navigate("/packages"),
          }}
        />
      ) : (
        <>
          <div className="space-y-6">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                getStatusVariant={getStatusVariant}
              />
            ))}
          </div>

          {/* Pagination */}
          {!showAll && pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {showAll && bookings.length > 10 && (
            <div className="text-center text-gray-600 mt-6">
              Showing all {bookings.length} bookings
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserBookings;
