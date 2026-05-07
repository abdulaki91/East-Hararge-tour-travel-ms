import React from "react";
import {
  CubeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

interface CompanyStatsGridProps {
  packages: any[];
  bookings: any[];
  totalRevenue: number;
}

const CompanyStatsGrid: React.FC<CompanyStatsGridProps> = ({
  packages,
  bookings,
  totalRevenue,
}) => {
  const quickStats = [
    {
      title: "Active Packages",
      value: packages.filter((p) => p.is_active).length,
      total: packages.length,
      icon: CubeIcon,
      color: "from-primary-500 to-primary-600",
      bgColor: "bg-primary-50",
      textColor: "text-primary-600",
      change: "+2 this month",
    },
    {
      title: "Total Bookings",
      value: bookings.length,
      total: bookings.length,
      icon: CalendarDaysIcon,
      color: "from-success-500 to-success-600",
      bgColor: "bg-success-50",
      textColor: "text-success-600",
      change: "+8 this month",
    },
    {
      title: "Monthly Revenue",
      value:
        totalRevenue > 0 ? `${totalRevenue.toLocaleString()} ETB` : "0 ETB",
      total: null,
      icon: CurrencyDollarIcon,
      color: "from-accent-500 to-accent-600",
      bgColor: "bg-accent-50",
      textColor: "text-accent-600",
      change: "+15% vs last month",
    },
    {
      title: "Customer Rating",
      value: "4.8",
      total: "5.0",
      icon: StarIcon,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      change: "Based on reviews",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {quickStats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {stat.title}
              </p>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-gray-900 font-display">
                  {stat.value}
                </p>
                {stat.total && (
                  <p className="text-sm text-gray-500">/ {stat.total}</p>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
            </div>
            <div
              className={`flex-shrink-0 p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform`}
            >
              <stat.icon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompanyStatsGrid;
