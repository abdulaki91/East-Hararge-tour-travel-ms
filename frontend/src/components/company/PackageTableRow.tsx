import React from "react";
import { Link } from "react-router-dom";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { getImageUrl } from "../../utils/imageUrl";

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

interface PackageTableRowProps {
  pkg: Package;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number, title: string) => void;
  isToggling: boolean;
}

const PackageTableRow: React.FC<PackageTableRowProps> = ({
  pkg,
  onToggleStatus,
  onDelete,
  isToggling,
}) => {
  return (
    <tr className="hover:bg-white/80 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-14 w-14">
            {pkg.images && pkg.images.length > 0 ? (
              <img
                className="h-14 w-14 rounded-xl object-cover shadow-md"
                src={getImageUrl(pkg.images[0])}
                alt={pkg.title}
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-md">
                <span className="text-gray-500 text-xs font-medium">
                  No Image
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-bold text-gray-900">{pkg.title}</div>
            <div className="text-sm text-gray-500 font-medium">
              📍 {pkg.location}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-bold text-gray-900">{pkg.price} ETB</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">
          {pkg.duration_days} days
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {pkg.package_status === "completed" ? (
          <Badge variant="info">Completed</Badge>
        ) : (
          <Badge variant={pkg.is_active ? "success" : "warning"}>
            {pkg.is_active ? "Active" : "Inactive"}
          </Badge>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-bold text-gray-900">
          {pkg.available_slots} / {pkg.max_people}
        </div>
        <div className="text-xs text-gray-500 font-medium">available</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-bold text-gray-900">
          {pkg.average_rating.toFixed(1)} ⭐
        </div>
        <div className="text-xs text-gray-500 font-medium">
          {pkg.review_count} reviews
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-64">
        <div className="flex justify-end items-center gap-2">
          {/* View Button */}
          <Link to={`/packages/${pkg.id}`} title="View Package">
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200">
              <EyeIcon className="h-5 w-5" />
            </button>
          </Link>

          {/* Edit Button */}
          <Link to={`/company/packages/${pkg.id}/edit`} title="Edit Package">
            <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200">
              <PencilIcon className="h-5 w-5" />
            </button>
          </Link>

          {/* Toggle Status Button */}
          <button
            onClick={() => onToggleStatus(pkg.id)}
            disabled={isToggling}
            title={pkg.is_active ? "Deactivate" : "Activate"}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${
              pkg.is_active
                ? "text-orange-700 bg-orange-50 border-orange-200 hover:bg-orange-100"
                : "text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
            } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {pkg.is_active ? "Deactivate" : "Activate"}
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(pkg.id, pkg.title)}
            title="Delete Package"
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default PackageTableRow;
