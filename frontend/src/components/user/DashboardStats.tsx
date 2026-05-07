import React from "react";
import {
  CalendarIcon,
  TrophyIcon,
  ClockIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import type { UserStats } from "../../types/user";

interface DashboardStatsProps {
  stats: UserStats;
  isLoading?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  isLoading,
}) => {
  const dashboardStats = [
    {
      title: "Total Bookings",
      value: stats.bookings.total_bookings,
      icon: CalendarIcon,
      color: "blue",
      change: "+12%",
      description: "All time bookings",
    },
    {
      title: "Completed Tours",
      value: stats.bookings.completed_bookings,
      icon: TrophyIcon,
      color: "green",
      change: "+8%",
      description: "Successfully completed",
    },
    {
      title: "Upcoming Tours",
      value: stats.bookings.confirmed_bookings,
      icon: ClockIcon,
      color: "orange",
      change: "+3",
      description: "Confirmed bookings",
    },
    {
      title: "Total Spent",
      value: `${stats.bookings.total_spent.toLocaleString()} ETB`,
      icon: CreditCardIcon,
      color: "purple",
      change: "+15%",
      description: "Lifetime spending",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-gray-200 rounded-xl w-14 h-14"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {dashboardStats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105"
        >
          <div className="flex items-center">
            <div
              className={`flex-shrink-0 p-3 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-xl shadow-lg group-hover:shadow-${stat.color}-200`}
            >
              <stat.icon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-gray-900 font-display">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
