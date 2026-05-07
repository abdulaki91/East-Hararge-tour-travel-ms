import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CreditCardIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold font-display mb-2">Payment</h1>
        <p className="text-primary-100 text-lg">
          Secure payment processing for your booking 💳
        </p>
      </div>

      {/* Booking Reference */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-display">
              Booking Reference
            </h3>
            <p className="text-2xl font-bold text-primary-600 font-mono">
              #{bookingId}
            </p>
          </div>
          <div className="flex items-center text-warning-600">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">Payment Pending</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
        <EmptyState
          icon={<CreditCardIcon className="h-16 w-16" />}
          title="Payment Processing System"
          description="The secure payment processing system is currently under development. This will include multiple payment methods, secure transactions, and instant confirmation."
          action={{
            label: "Back to Bookings",
            onClick: () => navigate("/user/bookings"),
          }}
        />
      </div>

      {/* Payment Methods Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200">
          <div className="flex items-center mb-3">
            <CreditCardIcon className="h-8 w-8 text-primary-600 mr-3" />
            <h3 className="text-lg font-bold text-primary-900 font-display">
              Credit Cards
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-primary-700">
            <li>• Visa, MasterCard, American Express</li>
            <li>• Secure 3D authentication</li>
            <li>• Instant payment confirmation</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-2xl p-6 border border-success-200">
          <div className="flex items-center mb-3">
            <BanknotesIcon className="h-8 w-8 text-success-600 mr-3" />
            <h3 className="text-lg font-bold text-success-900 font-display">
              Bank Transfer
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-success-700">
            <li>• Direct bank transfers</li>
            <li>• Ethiopian banking integration</li>
            <li>• Secure transaction processing</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl p-6 border border-accent-200">
          <div className="flex items-center mb-3">
            <ShieldCheckIcon className="h-8 w-8 text-accent-600 mr-3" />
            <h3 className="text-lg font-bold text-accent-900 font-display">
              Security
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-accent-700">
            <li>• SSL encryption</li>
            <li>• PCI DSS compliance</li>
            <li>• Fraud protection</li>
          </ul>
        </div>
      </div>

      {/* Payment Summary Preview */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 font-display">
          Payment Summary
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <span className="font-medium text-gray-700">Package Price</span>
            <span className="font-bold text-gray-900">XXX.XX ETB</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <span className="font-medium text-gray-700">Service Fee</span>
            <span className="font-bold text-gray-900">XX.XX ETB</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-primary-50 rounded-xl border-2 border-primary-200">
            <span className="font-bold text-primary-900">Total Amount</span>
            <span className="font-bold text-2xl text-primary-600">
              XXX.XX ETB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
