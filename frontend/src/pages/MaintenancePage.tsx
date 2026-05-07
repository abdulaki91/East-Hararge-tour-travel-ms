import React from "react";
import {
  WrenchScrewdriverIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

interface MaintenancePageProps {
  contactEmail?: string;
  contactPhone?: string;
  siteName?: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({
  contactEmail = "info@easthararghetours.com",
  contactPhone = "+251-911-123456",
  siteName = "East Hararghe Tours",
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 rounded-full p-6">
                <WrenchScrewdriverIcon className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            We'll Be Back Soon!
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {siteName} is currently undergoing scheduled maintenance to improve
            your experience. We apologize for any inconvenience and appreciate
            your patience.
          </p>

          {/* Status Info */}
          <div className="bg-primary-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 text-primary-700">
              <ClockIcon className="h-6 w-6" />
              <p className="font-medium">Maintenance in Progress</p>
            </div>
            <p className="text-sm text-primary-600 mt-2">
              Our team is working hard to get everything back online as quickly
              as possible.
            </p>
          </div>

          {/* What You Can Do */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What You Can Do
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-3xl mb-2">☕</div>
                <p className="text-sm text-gray-600">
                  Take a short break and check back soon
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-3xl mb-2">🔄</div>
                <p className="text-sm text-gray-600">
                  Refresh this page in a few minutes
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-3xl mb-2">📧</div>
                <p className="text-sm text-gray-600">
                  Contact us if you need urgent assistance
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Need Immediate Assistance?
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <EnvelopeIcon className="h-5 w-5" />
                <span className="font-medium">{contactEmail}</span>
              </a>
              <span className="hidden sm:block text-gray-300">|</span>
              <a
                href={`tel:${contactPhone}`}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <PhoneIcon className="h-5 w-5" />
                <span className="font-medium">{contactPhone}</span>
              </a>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mt-8">
            <button
              onClick={() => {
                // Trigger a maintenance check instead of reloading
                window.dispatchEvent(new CustomEvent("checkMaintenance"));
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Check Status
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Thank you for your understanding and continued support!
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
