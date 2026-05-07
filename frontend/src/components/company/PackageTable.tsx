import React from "react";
import PackageTableRow from "./PackageTableRow";

interface Package {
  id: number;
  title: string;
  location: string;
  price: number;
  duration_days: number;
  is_active: boolean;
  available_slots: number;
  max_people: number;
  average_rating: number;
  review_count: number;
  images?: string[];
  package_status?: string;
  booking_count?: number;
  active_booking_count?: number;
  completed_booking_count?: number;
}

interface PackageTableProps {
  packages: Package[];
  onToggleStatus: (id: number) => void;
  onDelete: (id: number, title: string) => void;
  isToggling: boolean;
}

const PackageTable: React.FC<PackageTableProps> = ({
  packages,
  onToggleStatus,
  onDelete,
  isToggling,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-1/3">
                Package
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-24">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-24">
                Duration
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-24">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-28">
                Bookings
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-24">
                Rating
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-64">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
            {packages.map((pkg) => (
              <PackageTableRow
                key={pkg.id}
                pkg={pkg}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
                isToggling={isToggling}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PackageTable;
