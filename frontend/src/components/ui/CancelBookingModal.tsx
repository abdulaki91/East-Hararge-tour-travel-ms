import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { bookingService } from "../../services/bookings";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import Modal from "./Modal";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  bookingReference: string;
  packageTitle: string;
  onSuccess?: () => void;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  bookingReference,
  packageTitle,
  onSuccess,
}) => {
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => bookingService.cancelBooking(bookingId, reason),
    onSuccess: () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["booking", bookingId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      onSuccess?.();
      onClose();
      setReason("");
      setConfirmed(false);
    },
    onError: (error: any) => {
      console.error("Failed to cancel booking:", error);
    },
  });

  const handleCancel = () => {
    if (confirmed) {
      cancelMutation.mutate();
    }
  };

  const handleClose = () => {
    if (!cancelMutation.isPending) {
      setReason("");
      setConfirmed(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 font-display">
              Cancel Booking
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={cancelMutation.isPending}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div>
              <span className="font-medium text-gray-600">Package:</span>
              <p className="font-semibold text-gray-900">{packageTitle}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">
                Booking Reference:
              </span>
              <p className="font-semibold text-gray-900">{bookingReference}</p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                Important Notice
              </h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>
                  • Cancellation may be subject to fees depending on timing
                </li>
                <li>
                  • Refunds will be processed according to our cancellation
                  policy
                </li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reason Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Cancellation (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={cancelMutation.isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-gray-100"
            rows={3}
            placeholder="Please let us know why you're cancelling..."
          />
        </div>

        {/* Confirmation Checkbox */}
        <div className="mb-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={cancelMutation.isPending}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
            />
            <span className="text-sm text-gray-700">
              I understand that cancelling this booking may result in
              cancellation fees and that this action cannot be undone.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={cancelMutation.isPending}
            className="flex-1"
          >
            Keep Booking
          </Button>

          <Button
            onClick={handleCancel}
            disabled={!confirmed || cancelMutation.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {cancelMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Cancelling...
              </>
            ) : (
              "Cancel Booking"
            )}
          </Button>
        </div>

        {/* Error Message */}
        {cancelMutation.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              {(cancelMutation.error as any)?.response?.data?.message ||
                "Failed to cancel booking. Please try again."}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CancelBookingModal;
