import React from "react";

interface CompanyDashboardHeaderProps {
  userName?: string;
  unreadCount: number;
}

const CompanyDashboardHeader: React.FC<CompanyDashboardHeaderProps> = ({
  userName,
  unreadCount,
}) => {
  return (
    <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">
            Company Dashboard
          </h1>
          <p className="text-primary-100 text-lg">
            Welcome back, {userName}! 🏢
          </p>
          <p className="text-primary-200 text-sm mt-2">
            Manage your tour packages and track your business performance
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{unreadCount}</div>
              <div className="text-sm text-primary-200">New Notifications</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboardHeader;
