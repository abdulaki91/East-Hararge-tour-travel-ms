import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  CheckBadgeIcon,
  DocumentArrowDownIcon,
  StarIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import PaymentVerificationModal from "../ui/PaymentVerificationModal";
import ReviewModal from "../ui/ReviewModal";
import ReceiptQR from "../receipt/ReceiptQR";
import { ReceiptService } from "../../services/receiptService";
import { toast } from "react-hot-toast";
import type { BookingStatus } from "../../types";

interface Booking {
  id: number;
  status: BookingStatus;
  payment_status: string;
  booking_date: string;
  number_of_people: number;
  total_amount: number;
  special_requests?: string;
  created_at: string;
  booking_reference: string;
  // Flat fields from backend
  package_id: number;
  package_title: string;
  package_location: string;
  duration_days: number;
  company_name: string;
  // Add payment information for verification
  payment_id?: number;
  payment_method?: string;
  transaction_reference?: string;
  payment_date?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  // Review information
  has_review?: boolean;
}

interface BookingCardProps {
  booking: Booking;
  getStatusVariant: (
    status: BookingStatus,
  ) => "default" | "success" | "warning" | "danger" | "info";
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  getStatusVariant,
}) => {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
  const [showReceiptQR, setShowReceiptQR] = useState(false);

  const showVerifyButton =
    booking.payment_status === "pending" &&
    booking.payment_id &&
    booking.status !== "cancelled" &&
    booking.payment_method === "bank_transfer"; // Only show for bank transfers

  const showReceiptButton = booking.payment_status === "completed";

  const showReviewButton =
    booking.status === "completed" &&
    booking.payment_status === "completed" &&
    !booking.has_review;

  const handleDownloadReceipt = async () => {
    try {
      setIsDownloadingReceipt(true);
      const receiptData = {
        booking_id: booking.id, // Add booking_id for QR token generation
        booking_reference: booking.booking_reference,
        customer_name: booking.customer_name || "Customer",
        customer_email: booking.customer_email || "",
        customer_phone: booking.customer_phone || "",
        package_title: booking.package_title,
        package_location: booking.package_location,
        booking_date: booking.booking_date,
        number_of_people: booking.number_of_people,
        total_amount: booking.total_amount,
        payment_method: booking.payment_method || "verified",
        payment_date: booking.payment_date || booking.created_at,
        company_name: booking.company_name,
        transaction_reference:
          booking.transaction_reference || booking.booking_reference,
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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:scale-[1.02]">
      <div className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-2xl font-bold text-gray-900 font-display">
                {booking.package_title}
              </h3>
              <Badge variant={getStatusVariant(booking.status)}>
                {booking.status}
              </Badge>
              <Badge
                variant={
                  booking.payment_status === "completed" ? "success" : "warning"
                }
              >
                {booking.payment_status?.toUpperCase() || "UNKNOWN"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center bg-gray-50 rounded-xl p-3">
                <MapPinIcon className="h-5 w-5 mr-3 text-primary-500" />
                <span className="font-medium">{booking.package_location}</span>
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
                  {booking.number_of_people} people
                </span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-xl p-3">
                <ClockIcon className="h-5 w-5 mr-3 text-primary-500" />
                <span className="font-medium">
                  {booking.duration_days} days
                </span>
              </div>
            </div>

            {booking.special_requests && (
              <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                <span className="text-sm font-bold text-primary-900">
                  Special Requests:{" "}
                </span>
                <span className="text-sm text-primary-700">
                  {booking.special_requests}
                </span>
              </div>
            )}
          </div>

          <div className="text-center lg:text-right">
            <div className="text-3xl font-bold text-primary-600 mb-4 font-display">
              {booking.total_amount} ETB
            </div>
            <div className="space-y-3">
              <Link to={`/user/bookings/${booking.id}`}>
                <Button
                  size="lg"
                  fullWidth
                  className="shadow-lg hover:shadow-xl"
                >
                  View Details
                </Button>
              </Link>

              {showReceiptButton && (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    fullWidth
                    className="shadow-md hover:shadow-lg border-green-300 text-green-700 hover:bg-green-50"
                    onClick={handleDownloadReceipt}
                    loading={isDownloadingReceipt}
                  >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Download Receipt
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    fullWidth
                    className="shadow-md hover:shadow-lg border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    onClick={() => setShowReceiptQR(true)}
                  >
                    <QrCodeIcon className="h-5 w-5 mr-2" />
                    Receipt QR Code
                  </Button>
                </>
              )}

              {showReviewButton && (
                <Button
                  size="lg"
                  variant="outline"
                  fullWidth
                  className="shadow-md hover:shadow-lg border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  <StarIcon className="h-5 w-5 mr-2" />
                  Write Review
                </Button>
              )}

              {showVerifyButton && (
                <Button
                  size="lg"
                  variant="outline"
                  fullWidth
                  className="shadow-md hover:shadow-lg border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => setIsVerificationModalOpen(true)}
                >
                  <CheckBadgeIcon className="h-5 w-5 mr-2" />
                  Verify Payment
                </Button>
              )}

              {booking.status === "pending" && !showVerifyButton && (
                <Button
                  size="lg"
                  variant="outline"
                  fullWidth
                  className="shadow-md hover:shadow-lg"
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span className="font-medium">
            Booked on{" "}
            <span className="text-gray-900 font-semibold">
              {new Date(booking.created_at).toLocaleDateString()}
            </span>
          </span>
          <span className="font-medium">
            by{" "}
            <span className="text-primary-600 font-semibold">
              {booking.company_name}
            </span>
          </span>
        </div>
      </div>

      {/* Payment Verification Modal */}
      {showVerifyButton && (
        <PaymentVerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
          paymentId={booking.payment_id!}
          bookingReference={booking.booking_reference}
          amount={booking.total_amount}
          paymentMethod={booking.payment_method || "unknown"}
        />
      )}

      {/* Review Modal */}
      {showReviewButton && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          packageId={booking.package_id}
          bookingId={booking.id}
          packageTitle={booking.package_title}
        />
      )}

      {/* Receipt QR Modal */}
      {showReceiptButton && (
        <ReceiptQR
          bookingId={booking.id}
          bookingReference={booking.booking_reference}
          isOpen={showReceiptQR}
          onClose={() => setShowReceiptQR(false)}
        />
      )}
    </div>
  );
};

export default BookingCard;
