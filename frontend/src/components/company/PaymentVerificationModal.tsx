import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  UserIcon,
  PhoneIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { bookingService } from "../../services/bookings";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import { toast } from "react-hot-toast";

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onUpdate?: () => void;
}

interface PaymentEvidence {
  description: string;
  amount: string;
  transactionId: string;
  paymentDate: string;
  paymentMethod: string;
}

const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen,
  onClose,
  booking,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<"verify" | "reject" | "history">(
    "verify",
  );
  const [evidence, setEvidence] = useState<PaymentEvidence>({
    description: "",
    amount: booking?.total_amount?.toString() || "",
    transactionId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "bank_transfer",
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const queryClient = useQueryClient();

  const verifyPaymentMutation = useMutation({
    mutationFn: (data: any) => bookingService.verifyPayment(booking.id, data),
    onSuccess: (response) => {
      toast.success("Payment verified successfully!");
      queryClient.invalidateQueries({ queryKey: ["company-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["company-booking-stats"] });
      onUpdate?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to verify payment");
    },
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: (data: any) => bookingService.rejectPayment(booking.id, data),
    onSuccess: (response) => {
      toast.success("Payment verification rejected");
      queryClient.invalidateQueries({ queryKey: ["company-bookings"] });
      onUpdate?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reject payment");
    },
  });

  const handleVerifyPayment = () => {
    if (!evidence.transactionId.trim()) {
      toast.error("Please enter transaction ID");
      return;
    }

    if (!evidence.amount || parseFloat(evidence.amount) <= 0) {
      toast.error("Please enter valid payment amount");
      return;
    }

    const verificationData = {
      status: "completed",
      verification_data: {
        transaction_id: evidence.transactionId,
        amount: parseFloat(evidence.amount),
        payment_date: evidence.paymentDate,
        payment_method: evidence.paymentMethod,
        description: evidence.description,
        verified_by: "company",
        verified_at: new Date().toISOString(),
      },
    };

    verifyPaymentMutation.mutate(verificationData);
  };

  const handleRejectPayment = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    const rejectionData = {
      status: "failed",
      rejection_reason: rejectionReason,
      rejected_by: "company",
      rejected_at: new Date().toISOString(),
    };

    rejectPaymentMutation.mutate(rejectionData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "refunded":
        return "info";
      default:
        return "gray";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Verification"
      size="xl"
    >
      <div className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Payment Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {booking.customer_name}
                </p>
                <p className="text-xs text-blue-700">Customer</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <BanknotesIcon className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {formatCurrency(booking.total_amount)}
                </p>
                <p className="text-xs text-blue-700">Amount Due</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {new Date(booking.booking_date).toLocaleDateString()}
                </p>
                <p className="text-xs text-blue-700">Travel Date</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <Badge
                  variant={
                    getPaymentStatusColor(
                      booking.payment_status || "pending",
                    ) as any
                  }
                  className="text-xs"
                >
                  {(booking.payment_status || "pending").toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-blue-700">Current Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("verify")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "verify"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <CheckCircleIcon className="h-4 w-4 inline mr-1" />
              Verify Payment
            </button>
            <button
              onClick={() => setActiveTab("reject")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "reject"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <XCircleIcon className="h-4 w-4 inline mr-1" />
              Reject Payment
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ClockIcon className="h-4 w-4 inline mr-1" />
              History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "verify" && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <h5 className="font-medium text-green-900">Verify Payment</h5>
              </div>
              <p className="text-green-700 text-sm">
                Confirm that you have received payment from the customer. This
                will mark the payment as completed and confirm the booking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Transaction ID / Reference"
                value={evidence.transactionId}
                onChange={(e) =>
                  setEvidence((prev) => ({
                    ...prev,
                    transactionId: e.target.value,
                  }))
                }
                placeholder="Enter transaction reference"
                required
              />
              <Input
                label="Payment Amount (ETB)"
                type="number"
                value={evidence.amount}
                onChange={(e) =>
                  setEvidence((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="0.00"
                required
              />
              <Input
                label="Payment Date"
                type="date"
                value={evidence.paymentDate}
                onChange={(e) =>
                  setEvidence((prev) => ({
                    ...prev,
                    paymentDate: e.target.value,
                  }))
                }
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={evidence.paymentMethod}
                  onChange={(e) =>
                    setEvidence((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value,
                    }))
                  }
                  className="block w-full rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 px-4 py-3 text-sm"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="telebirr">Telebirr</option>
                  <option value="chapa">Chapa</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={evidence.description}
                onChange={(e) =>
                  setEvidence((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 px-4 py-3 text-sm"
                placeholder="Any additional notes about the payment verification..."
              />
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleVerifyPayment}
                loading={verifyPaymentMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Verify & Confirm Payment
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {activeTab === "reject" && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <XCircleIcon className="h-5 w-5 text-red-600" />
                <h5 className="font-medium text-red-900">Reject Payment</h5>
              </div>
              <p className="text-red-700 text-sm">
                Mark this payment as failed or invalid. The customer will be
                notified and the booking may be cancelled.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-red-500 focus:ring-4 focus:ring-red-100 px-4 py-3 text-sm"
                placeholder="Please provide a clear reason for rejecting this payment (e.g., incorrect amount, invalid transaction, etc.)"
                required
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800 text-sm font-medium">
                  Warning: This action will notify the customer
                </p>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                The customer will receive a notification about the payment
                rejection and may need to make a new payment.
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleRejectPayment}
                loading={rejectPaymentMutation.isPending}
                variant="outline"
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Reject Payment
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">
                Payment History
              </h5>
              <p className="text-blue-700 text-sm">
                Track all payment-related activities for this booking.
              </p>
            </div>

            {/* Payment Timeline */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Booking Created
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(booking.created_at).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Payment status: Pending
                  </p>
                </div>
              </div>

              {booking.payment_status === "completed" && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Payment Verified
                    </p>
                    <p className="text-xs text-gray-600">
                      {booking.updated_at
                        ? new Date(booking.updated_at).toLocaleString()
                        : "Recently"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Payment confirmed by company
                    </p>
                  </div>
                </div>
              )}

              {booking.payment_status === "failed" && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Payment Rejected
                    </p>
                    <p className="text-xs text-gray-600">
                      {booking.updated_at
                        ? new Date(booking.updated_at).toLocaleString()
                        : "Recently"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Payment verification failed
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Contact Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h6 className="font-medium text-gray-900 mb-2">
                Customer Contact
              </h6>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {booking.customer_email}
                  </span>
                </div>
                {booking.customer_phone && (
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {booking.customer_phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaymentVerificationModal;
