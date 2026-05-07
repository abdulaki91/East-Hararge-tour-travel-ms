import React from "react";
import {
  CheckCircleIcon,
  CubeIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const RecentActivity: React.FC = () => {
  const recentActivity = [
    {
      type: "booking",
      message: 'New booking received for "Harar Cultural Heritage Tour"',
      time: "2 hours ago",
      icon: CheckCircleIcon,
      color: "text-green-600 bg-green-100",
    },
    {
      type: "package",
      message: 'Package "Babille Elephant Safari" was updated',
      time: "5 hours ago",
      icon: CubeIcon,
      color: "text-blue-600 bg-blue-100",
    },
    {
      type: "review",
      message: "Customer review received (4.5 stars)",
      time: "1 day ago",
      icon: StarIcon,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      type: "booking",
      message: 'Booking confirmed for "Coffee Highlands Experience"',
      time: "2 days ago",
      icon: CheckCircleIcon,
      color: "text-green-600 bg-green-100",
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4 font-display">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {recentActivity.map((activity, index) => (
          <div
            key={index}
            className="flex items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${activity.color}`}
            >
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {activity.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
