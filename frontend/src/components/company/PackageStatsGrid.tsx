import React from "react";

interface Package {
  id: number;
  is_active: boolean;
  review_count: number;
}

interface PackageStatsGridProps {
  packages: Package[];
}

const PackageStatsGrid: React.FC<PackageStatsGridProps> = ({ packages }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 font-display mb-1">
            {packages.length}
          </div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Total Packages
          </div>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105">
        <div className="text-center">
          <div className="text-3xl font-bold text-success-600 font-display mb-1">
            {packages.filter((p) => p.is_active).length}
          </div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Active Packages
          </div>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105">
        <div className="text-center">
          <div className="text-3xl font-bold text-warning-600 font-display mb-1">
            {packages.filter((p) => !p.is_active).length}
          </div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Inactive Packages
          </div>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600 font-display mb-1">
            {packages.reduce((sum, p) => sum + p.review_count, 0)}
          </div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Total Reviews
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageStatsGrid;
