import React from "react";
import { Link } from "react-router-dom";
import {
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  StarIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import Button from "../ui/Button";
import { getImageUrl } from "../../utils/imageUrl";
import type { Package } from "../../types";

interface PackageCardProps {
  package: Package;
  index: number;
}

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, index }) => {
  return (
    <div
      className="card hover-lift hover-glow group animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-64 bg-gradient-to-br from-slate-200 to-slate-300 rounded-t-2xl overflow-hidden">
        {pkg.images && pkg.images.length > 0 ? (
          <img
            src={getImageUrl(pkg.images[0])}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement!.innerHTML = `
                <div class="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center">
                  <svg class="h-16 w-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              `;
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center">
            <CameraIcon className="h-16 w-16 text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-bold text-slate-800 shadow-lg">
          {pkg.price} ETB
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center text-white/90 text-sm mb-2">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{pkg.location}</span>
          </div>
        </div>
      </div>

      <div className="card-content">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1 mr-2">
            {pkg.title}
          </h3>
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(pkg.average_rating)
                      ? "text-yellow-400 fill-current"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-slate-600 ml-1">
              {pkg.average_rating.toFixed(1)}
            </span>
          </div>
        </div>

        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {pkg.description}
        </p>

        <div className="flex flex-wrap items-center justify-between text-sm text-slate-500 mb-4 gap-y-2">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{pkg.duration_days} days</span>
          </div>
          <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-100">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {new Date(pkg.start_date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(pkg.end_date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="flex items-center">
            <UserGroupIcon className="h-4 w-4 mr-1" />
            <span>Max {pkg.max_people}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
          <div>
            <p className="text-xs text-slate-500 mb-1">by {pkg.company_name}</p>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900">
                {pkg.price} ETB
              </div>
              <div className="text-xs text-slate-500">per person</div>
            </div>
          </div>
          <Link to={`/packages/${pkg.id}`}>
            <Button size="md" variant="primary">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
