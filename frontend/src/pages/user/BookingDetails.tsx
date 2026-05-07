import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  CreditCardIcon,
  ArrowLeftIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { bookingService } from "../../services/bookings";
import { paymentService } from "../../services/payments";
import { ReceiptService } from "../../services/receiptService";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import PaymentVerificationModal from "../../components/ui/PaymentVerificationModal";
import CancelBookingModal from "../../components/ui/CancelBookingModal";
import Toast from "../../components/ui/Toast";
import { toast } from "react-hot-toast";
import type { BookingStatus } from "../../types";

const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

  const {
    data: bookingData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingService.getBooking(Number(id)),
    enabled: !!id,
  });

  const { data: paymentsData } = useQuery({
    queryKey: ["booking-payments", id],
    queryFn: () => paymentService.getBookingPayments(Number(id!)),
    enabled: !!id,
  });

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

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      case "refunded":
        return "info";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !bookingData?.success) {
    return (
      <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <p className="text-error-600 mb-6 font-medium">
          Failed to load booking details
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const booking = bookingData.data;
  const payments = paymentsData?.data || [];
  const latestPayment = payments[0]; // Payments are ordered by created_at DESC

  const showVerifyButton =
    latestPayment &&
    latestPayment.status === "pending" &&
    booking.status !== "cancelled" &&
    latestPayment.payment_method === "bank_transfer"; // Only show for bank transfers

  const showReceiptButton =
    latestPayment && latestPayment.status === "completed";

  const handleDownloadReceipt = async () => {
    try {
      setIsDownloadingReceipt(true);
      const receiptData = {
        booking_reference: booking.booking_reference,
        customer_name: booking.customer_name || "Customer",
        customer_email: booking.customer_email || "",
        customer_phone: booking.customer_phone || "",
        package_title: booking.package_title,
        package_location: booking.package_location,
        booking_date: booking.booking_date,
        number_of_people: booking.number_of_people,
        total_amount: booking.total_amount,
        payment_method: latestPayment?.payment_method || "verified",
        payment_date:
          latestPayment?.payment_date ||
          latestPayment?.created_at ||
          booking.created_at,
        company_name: booking.company_name,
        transaction_reference:
          latestPayment?.transaction_reference || booking.booking_reference,
      };

      await ReceiptService.generateAndDownloadReceipt(receiptData);
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Receipt download failed:", error);
      toast.error("Failed to download receipt. Please try again.");
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Link to="/user/bookings">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Bookings
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold font-display mb-2">
              Booking Details
            </h1>
            <p className="text-primary-100 text-lg">
              {booking.package_title} • {booking.package_location}
            </p>
          </div>
          <div className="text-right">
            <p className="text-primary-100 text-sm mb-1">Booking Reference</p>
            <p className="text-2xl font-bold font-mono">
              {booking.booking_reference}
            </p>
          </div>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Booking Status</p>
              <Badge variant={getStatusVariant(booking.status)} size="lg">
                {booking.status.toUpperCase()}
              </Badge>
            </div>
            {latestPayment && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                <Badge
                  variant={getPaymentStatusVariant(latestPayment.status)}
                  size="lg"
                >
                  {latestPayment.status.toUpperCase()}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {showVerifyButton && (
              <Button
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => setIsVerificationModalOpen(true)}
              >
                <CheckBadgeIcon className="h-5 w-5 mr-2" />
                Verify Payment
              </Button>
            )}
            {booking.status === "pending" && (
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => setIsCancelModalOpen(true)}
              >
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Booking Information */}
        <div className="lg:col-span-2 space-y-8">
          {/* Package Details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 font-display mb-6">
              Package Information
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {booking.package_title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center bg-gray-50 rounded-xl p-3">
                    <MapPinIcon className="h-5 w-5 mr-3 text-primary-500" />
                    <span className="font-medium">
                      {booking.package_location}
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-50 rounded-xl p-3">
                    <ClockIcon className="h-5 w-5 mr-3 text-primary-500" />
                    <span className="font-medium">
                      {booking.duration_days} days
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-50 rounded-xl p-3">
                    <CalendarIcon className="h-5 w-5 mr-3 text-primary-500" />
                    <span className="font-medium">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-50 rounded-xl p-3">
                    <UserGroupIcon className="h-5 w-5 mr-3 text-primary-500" />
                    <span className="font-medium">
                      {booking.number_of_people} travelers
                    </span>
                  </div>
                </div>
              </div>

              {booking.special_requests && (
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                  <h4 className="font-semibold text-primary-900 mb-2">
                    Special Requests
                  </h4>
                  <p className="text-primary-700">{booking.special_requests}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Tour Operator
                </h4>
                <p className="text-gray-700 font-medium">
                  {booking.company_name}
                </p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 font-display mb-6">
                Payment History
              </h2>

              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CreditCardIcon className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">
                          {paymentService.getPaymentMethodName(
                            payment.payment_method,
                          )}
                        </span>
                        <Badge
                          variant={getPaymentStatusVariant(payment.status)}
                        >
                          {payment.status.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="font-bold text-lg">
                        {paymentService.formatAmount(
                          payment.total_amount || payment.amount,
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Transaction ID:</span>
                        <p className="font-mono">
                          {payment.transaction_reference}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        <p>{new Date(payment.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    {payment.fees && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span>Amount:</span>
                          <span>
                            {paymentService.formatAmount(payment.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Fees:</span>
                          <span>
                            {paymentService.formatAmount(payment.fees)}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>
                            {paymentService.formatAmount(payment.total_amount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 font-display mb-4">
              Booking Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Package Price:</span>
                <span className="font-medium">
                  {paymentService.formatAmount(
                    booking.total_amount / booking.number_of_people,
                  )}{" "}
                  × {booking.number_of_people}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                <span>Total Amount:</span>
                <span className="text-primary-600">
                  {paymentService.formatAmount(booking.total_amount)}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Booked on:</p>
              <p className="font-medium">
                {new Date(booking.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 font-display mb-4">
              Need Help?
            </h3>

            <div className="space-y-3">
              <Button variant="outline" fullWidth className="justify-start">
                <PhoneIcon className="h-4 w-4 mr-3" />
                Call Support
              </Button>

              <Button variant="outline" fullWidth className="justify-start">
                <EnvelopeIcon className="h-4 w-4 mr-3" />
                Email Support
              </Button>

              {showReceiptButton && (
                <Button
                  variant="outline"
                  fullWidth
                  className="justify-start border-green-300 text-green-700 hover:bg-green-50"
                  onClick={handleDownloadReceipt}
                  loading={isDownloadingReceipt}
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-3" />
                  Download Receipt
                </Button>
              )}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                For urgent matters, please call our 24/7 support line or contact
                the tour operator directly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Verification Modal */}
      {showVerifyButton && latestPayment && (
        <PaymentVerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
          paymentId={latestPayment.id}
          bookingReference={booking.booking_reference}
          amount={latestPayment.total_amount || latestPayment.amount}
          paymentMethod={latestPayment.payment_method}
        />
      )}

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        bookingId={booking.id}
        bookingReference={booking.booking_reference}
        packageTitle={booking.package_title}
        onSuccess={() => setShowSuccessToast(true)}
      />

      {/* Success Toast */}
      <Toast
        type="success"
        title="Booking Cancelled"
        message="Your booking has been successfully cancelled. Refund processing will begin shortly."
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </div>
  );
};

export default BookingDetails;
