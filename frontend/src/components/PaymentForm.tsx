import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { paymentService } from "../services/payments";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "../utils/errorHandler";

interface PaymentFormProps {
  bookingId: number;
  amount: number;
  onSuccess?: (payment: any) => void;
  onCancel?: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  fees: string;
  processingTime: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  bookingId,
  amount,
  onCancel,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("chapa");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "chapa",
      name: "Chapa Payment",
      description:
        "Pay with Telebirr, CBE Birr, M-Pesa, or Card - Instant verification",
      icon: CheckCircleIcon,
      fees: "2.5%",
      processingTime: "Instant",
    },
  ];

  const createPaymentMutation = useMutation({
    mutationFn: (paymentData: any) =>
      paymentService.createPayment(bookingId, paymentData),
    onSuccess: (response) => {
      setPaymentResult(response.data);

      // If Chapa payment, redirect to payment URL
      if (
        selectedMethod === "chapa" &&
        response.data.gateway_response?.payment_url
      ) {
        window.open(response.data.gateway_response.payment_url, "_self");
        return;
      }

      // For bank transfer, show instructions
      setShowConfirmation(true);
      toast.success("Payment instructions generated!");
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, "Failed to initiate payment");
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    const paymentData = {
      amount,
      payment_method: selectedMethod,
      return_url: `${window.location.origin}/user/bookings`,
    };

    createPaymentMutation.mutate(paymentData);
  };

  const fees =
    selectedMethod === "chapa" ? Math.round(Number(amount) * 0.025) : 0;
  const totalAmount = Number(amount) + Number(fees);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Payment Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Booking Amount:</span>
            <span className="font-medium">
              {Number(amount).toLocaleString()} ETB
            </span>
          </div>
          {fees > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fees:</span>
              <span className="font-medium">{fees.toLocaleString()} ETB</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold text-gray-900">Total Amount:</span>
            <span className="font-bold text-primary-600">
              {totalAmount.toLocaleString()} ETB
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Payment Method
          </label>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    readOnly
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center">
                      <method.icon className="h-6 w-6 text-gray-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {method.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-4">
          <Button
            type="submit"
            loading={createPaymentMutation.isPending}
            disabled={!selectedMethod}
            className="flex-1"
          >
            <ArrowRightIcon className="h-4 w-4 mr-2" />
            {selectedMethod === "chapa"
              ? "Pay with Chapa"
              : "Proceed to Payment"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Payment Instructions Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Bank Transfer Instructions"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">
              Bank Transfer Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Bank:</span>
                <span className="font-medium text-blue-900">
                  Commercial Bank of Ethiopia (CBE)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Account Name:</span>
                <span className="font-medium text-blue-900">
                  East Hararghe Tour & Travel
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Account Number:</span>
                <span className="font-bold text-blue-900 font-mono">
                  1000123456789
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Amount to Transfer:</span>
                <span className="font-bold text-blue-900 text-lg">
                  {totalAmount.toLocaleString()} ETB
                </span>
              </div>
              {paymentResult?.booking_reference && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Reference Number:</span>
                  <span className="font-medium text-blue-900 font-mono">
                    {paymentResult.booking_reference}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">
              Important Instructions
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Transfer the exact amount shown above to the account</li>
              <li>Include the reference number in your transfer description</li>
              <li>Keep your transfer receipt for verification</li>
              <li>
                The company will manually verify your payment within 24 hours
              </li>
              <li>You will receive a notification once verified</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              After completing your bank transfer, your booking will be in
              "Pending Payment" status. The company will manually verify your
              payment and update your booking status accordingly.
            </p>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={() => setShowConfirmation(false)}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentForm;
