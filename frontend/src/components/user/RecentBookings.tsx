import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarIcon,
  MapPinIcon,
  EyeIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

interface Booking {
  id: number;
  booking_reference: string;
  status: string;
  total_amount: number;
  booking_date: string;
  package_title: string;
  location: string;
}

interface RecentBookingsProps {
  bookings: Booking[];
  isLoading?: boolean;
}

const RecentBookings: React.FC<RecentBookingsProps> = ({
  bookings,
  isLoading,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      case "completed":
        return "primary";
      default:
        return "gray";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-display">
            Recent Bookings
          </h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 animate-pulse"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-6 bg-gray-200 rounded mb-1 w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 font-display">
          Recent Bookings
        </h2>
        <Link to="/user/bookings">
          <Button variant="outline" size="sm">
            <EyeIcon className="h-4 w-4 mr-2" />
            View All
          </Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            No bookings yet
          </h3>
          <p className="text-gray-400 mb-6">
            Start exploring our amazing tour packages!
          </p>
          <Link to="/packages">
            <Button>
              <GlobeAltIcon className="h-5 w-5 mr-2" />
              Browse Packages
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <MapPinIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {booking.package_title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {booking.location} • {formatDate(booking.booking_date)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ref: {booking.booking_reference}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={getStatusColor(booking.status)} size="sm">
                  {booking.status}
                </Badge>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {booking.total_amount.toLocaleString()} ETB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentBookings;
