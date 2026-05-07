import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserDashboard } from "../../hooks/useUserDashboard";
import DashboardContainer from "../../components/layout/DashboardContainer";
import PageLoader from "../../components/common/PageLoader";

// Import modular components
import WelcomeHeader from "../../components/user/WelcomeHeader";
import DashboardStats from "../../components/user/DashboardStats";
import RecentBookings from "../../components/user/RecentBookings";
import TravelTips from "../../components/user/TravelTips";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  const {
    recentBookings,
    stats,
    isBookingsLoading,
    isStatsLoading,
    isLoading,
    hasError,
    refetchAll,
  } = useUserDashboard();

  // Show loading spinner while initial data is loading
  if (isLoading && !recentBookings.length && !stats.bookings.total_bookings) {
    return <PageLoader message="Loading your dashboard..." />;
  }

  // Show error state if both queries failed
  if (hasError) {
    return (
      <DashboardContainer>
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <p className="text-error-600 mb-6 font-medium">
            Failed to load dashboard data
          </p>
          <button
            onClick={refetchAll}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <WelcomeHeader userName={user?.name} />

        {/* Stats Grid */}
        <DashboardStats stats={stats} isLoading={isStatsLoading} />

        {/* Recent Bookings */}
        <RecentBookings
          bookings={recentBookings}
          isLoading={isBookingsLoading}
        />

        {/* Travel Tips */}
        <TravelTips />
      </div>
    </DashboardContainer>
  );
};

export default UserDashboard;
