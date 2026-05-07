import React from "react";
import {
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

const MaintenanceBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <WrenchScrewdriverIcon className="h-5 w-5 animate-pulse" />
            <ExclamationTriangleIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 text-center">
            <p className="font-semibold text-sm sm:text-base">
              🔧 Maintenance Mode Active
            </p>
            <p className="text-xs sm:text-sm opacity-90 mt-0.5">
              The system is in maintenance mode. Regular users cannot access the
              platform. You can access as an admin.
            </p>
          </div>
          <div className="hidden sm:block">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
              Admin View
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceBanner;
