import React from "react";
import {
  UsersIcon,
  ArrowTrendingUpIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

interface PerformanceSummaryProps {
  bookings: any[];
}

const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({
  bookings,
}) => {
  const newCustomersThisMonth = bookings.filter(
    (b) =>
      new Date(b.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  ).length;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4 font-display">
        This Month
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              New Customers
            </span>
          </div>
          <span className="text-lg font-bold text-blue-600">
            {newCustomersThisMonth}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Revenue Growth
            </span>
          </div>
          <span className="text-lg font-bold text-green-600">+15%</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <StarIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Avg. Rating
            </span>
          </div>
          <span className="text-lg font-bold text-purple-600">4.8/5</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceSummary;
