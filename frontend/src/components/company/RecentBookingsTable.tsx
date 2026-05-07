import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

interface RecentBookingsTableProps {
  bookings: any[];
}

const RecentBookingsTable: React.FC<RecentBookingsTableProps> = ({
  bookings,
}) => {
  const navigate = useNavigate();
  if (bookings.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 font-display">
          Recent Bookings
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/company/bookings")}
        >
          View All
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Customer
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Package
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Date
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0, 5).map((booking, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {booking.first_name?.[0]}
                        {booking.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {booking.first_name} {booking.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.user_email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">
                    {booking.package_title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.number_of_people} people
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(booking.booking_date).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {booking.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-gray-900">
                  {booking.total_amount} ETB
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentBookingsTable;
