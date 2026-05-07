import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { paymentService } from "../../services/payments";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import Modal from "./Modal";

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: number;
  bookingReference: string;
  amount: number;
  paymentMethod: string;
}

const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen,
  onClose,
  paymentId,
  bookingReference,
  amount,
  paymentMethod,
}) => {
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    status: string;
    message: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: () => paymentService.verifyPayment(paymentId),
    onSuccess: (response) => {
      const payment = response.data;
      setVerificationResult({
        success: payment.status === "completed",
        status: payment.status,
        message:
          payment.status === "completed"
            ? "Payment automatically verified! Your booking is now confirmed."
            : payment.status === "failed"
              ? "Payment verification failed. Please try again or contact support."
              : "Payment is still pending. Please wait a moment and try again.",
      });

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-payments"] });
    },
    onError: (error: any) => {
      setVerificationResult({
        success: false,
        status: "error",
        message:
          error.response?.data?.message ||
          "Failed to verify payment. Please try again.",
      });
    },
  });

  const handleVerify = () => {
    setVerificationResult(null);
    verifyMutation.mutate();
  };

  const handleClose = () => {
    setVerificationResult(null);
    onClose();
  };

  const getStatusIcon = () => {
    if (verifyMutation.isPending) {
      return <LoadingSpinner size="lg" />;
    }

    if (verificationResult) {
      return verificationResult.success ? (
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
      ) : (
        <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto" />
      );
    }

    return null;
  };

  const getStatusColor = () => {
    if (!verificationResult) return "";
    return verificationResult.success ? "text-green-600" : "text-red-600";
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-display">
            Verify Payment
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">
                Booking Reference:
              </span>
              <p className="font-semibold text-gray-900">{bookingReference}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Amount:</span>
              <p className="font-semibold text-gray-900">
                {paymentService.formatAmount(amount)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Payment Method:</span>
              <p className="font-semibold text-gray-900">
                {paymentService.getPaymentMethodName(paymentMethod)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Payment ID:</span>
              <p className="font-semibold text-gray-900">#{paymentId}</p>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        {(verifyMutation.isPending || verificationResult) && (
          <div className="text-center mb-6">
            {getStatusIcon()}
            {verificationResult && (
              <div className="mt-4">
                <p className={`text-lg font-semibold ${getStatusColor()}`}>
                  {verificationResult.status.toUpperCase()}
                </p>
                <p className="text-gray-600 mt-2">
                  {verificationResult.message}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!verificationResult && !verifyMutation.isPending && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Auto-Verification Ready:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Click "Verify Payment" to automatically confirm your payment
              </li>
              <li>• The system will instantly verify your transaction</li>
              <li>• Your booking will be confirmed immediately</li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!verificationResult && (
            <Button
              onClick={handleVerify}
              disabled={verifyMutation.isPending}
              className="flex-1"
              size="lg"
            >
              {verifyMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify Payment"
              )}
            </Button>
          )}

          <Button
            onClick={handleClose}
            variant={verificationResult ? "primary" : "outline"}
            className={verificationResult ? "flex-1" : ""}
            size="lg"
          >
            {verificationResult ? "Close" : "Cancel"}
          </Button>
        </div>

        {/* Help Text */}
        {!verificationResult && (
          <p className="text-xs text-gray-500 text-center mt-4">
            The system automatically verifies all payments for instant
            confirmation.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default PaymentVerificationModal;
