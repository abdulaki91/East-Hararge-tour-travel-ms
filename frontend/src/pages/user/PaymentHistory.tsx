import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { paymentService } from "../../services/payments";
import type { PaymentFilters } from "../../services/payments";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/common/Pagination";
import PaymentVerificationModal from "../../components/ui/PaymentVerificationModal";
import {
  exportToExcel,
  exportToPDF,
  exportToCSV,
  formatDateForExport,
  formatCurrencyForExport,
  formatStatus,
} from "../../utils/exportUtils";
import toast from "react-hot-toast";

const PaymentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 10,
  });
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user-payments", filters],
    queryFn: () => paymentService.getMyPayments(filters),
  });

  const handleFilterChange = (key: keyof PaymentFilters, value: any) => {
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
    if (payments.length === 0) {
      toast.error("No payments to export");
      return;
    }

    const exportData = payments.map((payment: any) => ({
      transaction_ref: payment.transaction_reference,
      booking_reference: payment.booking_reference || "N/A",
      package_title: payment.package_title || "N/A",
      amount: formatCurrencyForExport(payment.amount),
      payment_method: payment.payment_method?.toUpperCase() || "N/A",
      status: formatStatus(payment.status),
      payment_date: formatDateForExport(payment.created_at),
    }));

    exportToExcel({
      filename: `payment-history-${new Date().toISOString().split("T")[0]}`,
      columns: [
        { header: "Transaction Ref", key: "transaction_ref", width: 25 },
        { header: "Booking Ref", key: "booking_reference", width: 20 },
        { header: "Package", key: "package_title", width: 30 },
        { header: "Amount", key: "amount", width: 15 },
        { header: "Payment Method", key: "payment_method", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Payment Date", key: "payment_date", width: 15 },
      ],
      data: exportData,
    });

    toast.success("Payment history exported to Excel successfully!");
  };

  const handleExportToPDF = () => {
    if (payments.length === 0) {
      toast.error("No payments to export");
      return;
    }

    const exportData = payments.map((payment: any) => ({
      transaction_ref: payment.transaction_reference,
      package_title: payment.package_title || "N/A",
      amount: formatCurrencyForExport(payment.amount),
      payment_method: payment.payment_method?.toUpperCase() || "N/A",
      status: formatStatus(payment.status),
      payment_date: formatDateForExport(payment.created_at),
    }));

    exportToPDF({
      filename: `payment-history-${new Date().toISOString().split("T")[0]}`,
      title: "Payment History Report",
      columns: [
        { header: "Transaction Ref", key: "transaction_ref", width: 25 },
        { header: "Package", key: "package_title", width: 35 },
        { header: "Amount", key: "amount", width: 15 },
        { header: "Method", key: "payment_method", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Date", key: "payment_date", width: 15 },
      ],
      data: exportData,
    });

    toast.success("Payment history exported to PDF successfully!");
  };

  const handleExportToCSV = () => {
    if (payments.length === 0) {
      toast.error("No payments to export");
      return;
    }

    const exportData = payments.map((payment: any) => ({
      transaction_ref: payment.transaction_reference,
      booking_reference: payment.booking_reference || "N/A",
      package_title: payment.package_title || "N/A",
      amount: formatCurrencyForExport(payment.amount),
      payment_method: payment.payment_method?.toUpperCase() || "N/A",
      status: formatStatus(payment.status),
      payment_date: formatDateForExport(payment.created_at),
    }));

    exportToCSV({
      filename: `payment-history-${new Date().toISOString().split("T")[0]}`,
      columns: [
        { header: "Transaction Ref", key: "transaction_ref" },
        { header: "Booking Ref", key: "booking_reference" },
        { header: "Package", key: "package_title" },
        { header: "Amount", key: "amount" },
        { header: "Payment Method", key: "payment_method" },
        { header: "Status", key: "status" },
        { header: "Payment Date", key: "payment_date" },
      ],
      data: exportData,
    });

    toast.success("Payment history exported to CSV successfully!");
  };

  const handleVerifyPayment = (payment: any) => {
    setSelectedPayment(payment);
    setShowVerificationModal(true);
  };

  const handleDownloadQR = async (paymentId: number) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/qr-code`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payment-${paymentId}-qr.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to download QR code:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-success-600" />;
      case "failed":
        return <XCircleIcon className="h-5 w-5 text-error-600" />;
      case "pending":
        return <ClockIcon className="h-5 w-5 text-warning-600" />;
      case "refunded":
        return <ArrowPathIcon className="h-5 w-5 text-info-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "failed":
        return "error";
      case "pending":
        return "warning";
      case "refunded":
        return "info";
      default:
        return "gray";
    }
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
          Failed to load payment history
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const payments = data?.data.items || [];
  const pagination = data?.data.pagination;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold font-display mb-2">
              Payment History
            </h1>
            <p className="text-primary-100 text-lg">
              Track all your payment transactions 💳
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Export Dropdown */}
            {payments.length > 0 && (
              <div className="relative">
                <Button
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100 shadow-lg hover:shadow-xl flex items-center gap-2"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  <Download className="w-5 h-5" />
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
            <div className="text-right">
              <p className="text-primary-100 text-sm">Total Payments</p>
              <p className="text-3xl font-bold">
                {pagination?.totalItems || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 font-display">
          Filter Payments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Status
            </label>
            <select
              className="block w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 px-4 py-3 text-sm font-medium"
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterChange("status", e.target.value || undefined)
              }
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Sort By
            </label>
            <select
              className="block w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 px-4 py-3 text-sm font-medium"
              value={filters.sort_by || "created_at"}
              onChange={(e) => handleFilterChange("sort_by", e.target.value)}
            >
              <option value="created_at">Date Created</option>
              <option value="amount">Amount</option>
              <option value="payment_date">Payment Date</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Order
            </label>
            <select
              className="block w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 px-4 py-3 text-sm font-medium"
              value={filters.sort_order || "desc"}
              onChange={(e) => handleFilterChange("sort_order", e.target.value)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full shadow-md hover:shadow-lg"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={<CreditCardIcon className="h-16 w-16" />}
          title="No payments found"
          description="You haven't made any payments yet. Start by booking a tour package!"
          action={{
            label: "Browse Packages",
            onClick: () => navigate("/packages"),
          }}
        />
      ) : (
        <>
          <div className="space-y-4">
            {payments.map((payment: any) => (
              <div
                key={payment.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(payment.status)}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 font-display">
                        Payment #{payment.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {payment.package_title} • {payment.package_location}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={getStatusColor(payment.status) as any}
                    className="text-sm font-medium"
                  >
                    {payment.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      {paymentService.formatAmount(payment.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Method</p>
                    <p className="text-sm font-medium text-gray-900">
                      {paymentService.getPaymentMethodName(
                        payment.payment_method,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Reference
                    </p>
                    <p className="text-sm font-mono text-gray-900">
                      {payment.transaction_reference}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Date</p>
                    <p className="text-sm text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    {payment.fees && payment.fees > 0 && (
                      <span className="text-xs text-gray-500">
                        Fees: {paymentService.formatAmount(payment.fees)}
                      </span>
                    )}
                    {payment.total_amount && (
                      <span className="text-sm font-medium text-gray-700">
                        Total:{" "}
                        {paymentService.formatAmount(payment.total_amount)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {payment.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleVerifyPayment(payment)}
                        className="flex items-center space-x-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Verify</span>
                      </Button>
                    )}

                    {payment.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadQR(payment.id)}
                        className="flex items-center space-x-1"
                      >
                        <QrCodeIcon className="h-4 w-4" />
                        <span>QR Code</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Payment Verification Modal */}
      {selectedPayment && (
        <PaymentVerificationModal
          isOpen={showVerificationModal}
          onClose={() => {
            setShowVerificationModal(false);
            setSelectedPayment(null);
            refetch(); // Refresh the list after verification
          }}
          paymentId={selectedPayment.id}
          bookingReference={
            selectedPayment.booking_reference ||
            selectedPayment.transaction_reference
          }
          amount={selectedPayment.amount}
          paymentMethod={selectedPayment.payment_method}
        />
      )}
    </div>
  );
};

export default PaymentHistory;
