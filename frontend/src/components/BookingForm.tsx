import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Package } from "../types";
import { bookingService } from "../services/bookings";
import type { CreateBookingData } from "../services/bookings";
import Button from "./ui/Button";
import Input from "./ui/Input";
import PaymentForm from "./PaymentForm";
import { getErrorMessage } from "../utils/errorHandler";

const bookingSchema = z.object({
  number_of_people: z
    .number()
    .min(1, "At least 1 person required")
    .max(100, "Maximum 100 people allowed"),
  special_requests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  package: Package;
  onSuccess: () => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  package: pkg,
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState<"booking" | "summary" | "payment">(
    "booking",
  );
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      number_of_people: 1,
    },
  });

  const numberOfPeople = watch("number_of_people");
  const totalAmount = numberOfPeople * pkg.price;

  const createBookingMutation = useMutation({
    mutationFn: (data: CreateBookingData) => bookingService.createBooking(data),
    onSuccess: (response) => {
      if (response.success) {
        setCreatedBooking(response.data);
        setStep("payment");
        toast.success("Booking details saved. Please complete payment.");
      } else {
        toast.error(response.message || "Failed to create booking");
      }
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, "Failed to create booking");
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: BookingFormData) => {
    if (step === "booking") {
      setStep("summary");
      return;
    }

    // Create booking using fixed package start_date
    createBookingMutation.mutate({
      package_id: pkg.id,
      booking_date: pkg.start_date,
      number_of_people: data.number_of_people,
      special_requests: data.special_requests,
    });
  };

  if (step === "payment" && createdBooking) {
    return (
      <div className="space-y-6">
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4">
          <p className="text-primary-800 text-sm font-medium">
            Booking ID:{" "}
            <span className="font-bold">
              {createdBooking.booking_reference}
            </span>
          </p>
          <p className="text-primary-600 text-xs">
            Please complete the payment to confirm your booking.
          </p>
        </div>

        <PaymentForm
          bookingId={createdBooking.id}
          amount={createdBooking.total_amount}
          onSuccess={(payment) => {
            if (payment.status === "completed") {
              onSuccess();
            }
          }}
          onCancel={onCancel}
        />
      </div>
    );
  }

  if (step === "summary") {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Package:</span>
              <span className="font-medium">{pkg.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Tour Dates:</span>
              <span className="text-primary-600 font-medium">
                {new Date(pkg.start_date).toLocaleDateString()} -{" "}
                {new Date(pkg.end_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Number of People:</span>
              <span>{numberOfPeople}</span>
            </div>
            <div className="flex justify-between">
              <span>Price per Person:</span>
              <span>{pkg.price} ETB</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total Amount:</span>
              <span>{totalAmount} ETB</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Confirm & Proceed</h4>
          <p className="text-blue-700 text-sm">
            By clicking confirm, you will create a pending booking. You will
            then be prompted to select your payment method (Chapa Payment).
          </p>
        </div>

        {/* Test Credentials for Demo */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Test Payment Credentials
          </h4>
          <p className="text-amber-700 text-xs mb-3">
            Use these test credentials to complete payment with Chapa:
          </p>

          <div className="space-y-3">
            {/* Telebirr Test Credentials */}
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <p className="font-semibold text-amber-900 text-sm mb-2">
                📱 Telebirr Test
              </p>
              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="font-mono font-medium">0900123456</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-mono font-medium text-green-600">
                    Auto-Success
                  </span>
                </div>
              </div>
            </div>

            {/* Awash Bank Test Credentials */}
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <p className="font-semibold text-amber-900 text-sm mb-2">
                🏦 Awash Bank Test
              </p>
              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="font-mono font-medium">0900112233</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-mono font-medium text-green-600">
                    Auto-Success
                  </span>
                </div>
              </div>
            </div>

            {/* Test Mode Notice */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="font-semibold text-blue-900 text-sm mb-1">
                🧪 Test Mode Active
              </p>
              <p className="text-xs text-blue-700">
                Click "Pay with Chapa" to be redirected to Chapa's payment page.
                Chapa will ask for your phone number and payment details on
                their secure checkout page. All test payments automatically
                succeed.
              </p>
            </div>
          </div>

          <p className="text-amber-600 text-xs mt-3 italic">
            💡 These are test credentials for demonstration purposes only.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setStep("booking")}
            disabled={createBookingMutation.isPending}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            loading={createBookingMutation.isPending}
            className="flex-1"
          >
            Confirm & Select Payment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{pkg.title}</h3>
        <div className="text-sm text-gray-600">
          <p>
            {pkg.location} • {pkg.duration_days} days
          </p>
          <div className="mt-2 p-2 bg-primary-50 rounded border border-primary-100 text-primary-700">
            <p className="font-semibold">Fixed Tour Dates:</p>
            <p>
              {new Date(pkg.start_date).toLocaleDateString()} to{" "}
              {new Date(pkg.end_date).toLocaleDateString()}
            </p>
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {pkg.price} ETB{" "}
            <span className="text-sm font-normal text-gray-500">
              per person
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Number of People"
          type="number"
          {...register("number_of_people", { valueAsNumber: true })}
          error={errors.number_of_people?.message}
          min={1}
          max={Math.min(pkg.max_people, pkg.available_slots)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Special Requests (Optional)
        </label>
        <textarea
          {...register("special_requests")}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="Any special requirements or requests..."
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount:</span>
          <span className="text-xl font-bold text-primary-600">
            {totalAmount} ETB
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          For {numberOfPeople} person{numberOfPeople !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Continue to Payment
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;
