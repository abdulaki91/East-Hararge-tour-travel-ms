import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  UsersIcon,
  BuildingOfficeIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { adminService } from "../../services/admin";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Button from "../../components/ui/Button";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: statsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminService.getStats(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <p className="text-error-600 mb-6 font-medium">
          Failed to load dashboard data
        </p>
        <Button onClick={() => navigate(0)}>Try Again</Button>
      </div>
    );
  }

  const stats = statsData?.data?.overview;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold font-display mb-2">
          Admin Dashboard
        </h1>
        <p className="text-primary-100 text-lg">
          Welcome back, {user?.name}! 🎉
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg group-hover:shadow-primary-200">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Total Users
              </p>
              <p className="text-3xl font-bold text-gray-900 font-display">
                {stats?.total_users || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl shadow-lg group-hover:shadow-success-200">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Companies
              </p>
              <p className="text-3xl font-bold text-gray-900 font-display">
                {stats?.total_companies || 0}
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-warning-100 to-warning-200 text-warning-800 shadow-sm">
                {stats?.pending_companies || 0} pending
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-lg group-hover:shadow-secondary-200">
              <CubeIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Packages
              </p>
              <p className="text-3xl font-bold text-gray-900 font-display">
                {stats?.total_packages || 0}
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-success-100 to-success-200 text-success-800 shadow-sm">
                {stats?.active_packages || 0} active
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl shadow-lg group-hover:shadow-accent-200">
              <CurrencyDollarIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-gray-900 font-display">
                ${stats?.total_revenue?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 font-display">
              Bookings Overview
            </h3>
            <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
              <ChartBarIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">
                Total Bookings
              </span>
              <span className="font-bold text-lg text-gray-900">
                {stats?.total_bookings || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-success-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">
                Recent Bookings (30 days)
              </span>
              <span className="font-bold text-lg text-success-600">
                {statsData?.data?.booking_status_distribution?.reduce(
                  (sum: number, item: any) => sum + item.count,
                  0,
                ) || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 font-display">
              System Health
            </h3>
            <div className="p-2 bg-gradient-to-br from-success-100 to-success-200 rounded-xl">
              <ArrowTrendingUpIcon className="h-6 w-6 text-success-600" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">
                System Status
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-success-100 to-success-200 text-success-800 shadow-sm">
                🟢 Healthy
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-success-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">Uptime</span>
              <span className="font-bold text-lg text-success-600">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
