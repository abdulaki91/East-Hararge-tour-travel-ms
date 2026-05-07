import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { packageService } from "../../services/packages";
import { bookingService } from "../../services/bookings";
import { useSocket } from "../../context/SocketContext";
import { useCompanyCheck } from "../../hooks/useCompanyCheck";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import CompanyGuard from "../../components/company/CompanyGuard";
import CompanyDashboardHeader from "../../components/company/CompanyDashboardHeader";
import CompanyStatsGrid from "../../components/company/CompanyStatsGrid";
import RecentActivity from "../../components/company/RecentActivity";
import PerformanceSummary from "../../components/company/PerformanceSummary";
import RecentBookingsTable from "../../components/company/RecentBookingsTable";
import CompanyCallToAction from "../../components/company/CompanyCallToAction";
import QRScanner from "../../components/receipt/QRScanner";
import Button from "../../components/ui/Button";
import { QrCodeIcon } from "@heroicons/react/24/outline";

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount } = useSocket();
  const { isCompanyRegistered, isLoading: companyLoading } = useCompanyCheck();
  const [showQRScanner, setShowQRScanner] = useState(false);

  const { data: packagesData, isLoading: packagesLoading } = useQuery({
    queryKey: ["company-packages"],
    queryFn: () => packageService.getMyPackages({ limit: 10 }),
    enabled: Boolean(isCompanyRegistered),
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["company-bookings"],
    queryFn: () => bookingService.getCompanyBookings({ limit: 10 }),
    enabled: Boolean(isCompanyRegistered),
  });

  const packages = packagesData?.data?.items || [];
  const bookings = bookingsData?.data?.items || [];

  // Calculate total revenue
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (parseFloat(String(b.total_amount)) || 0),
    0,
  );

  if (companyLoading || packagesLoading || bookingsLoading) {
    return (
      <CompanyGuard>
        <div className="flex justify-center items-center min-h-64">
          <LoadingSpinner size="lg" />
        </div>
      </CompanyGuard>
    );
  }

  return (
    <CompanyGuard>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-start">
          <CompanyDashboardHeader
            userName={user?.name}
            unreadCount={unreadCount}
          />

          {/* QR Scanner Button */}
          <Button
            onClick={() => setShowQRScanner(true)}
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700"
          >
            <QrCodeIcon className="w-5 h-5 mr-2" />
            Verify Receipt
          </Button>
        </div>

        {/* Quick Stats */}
        <CompanyStatsGrid
          packages={packages}
          bookings={bookings}
          totalRevenue={totalRevenue}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-1 space-y-6">
            <RecentActivity />
            <PerformanceSummary bookings={bookings} />
          </div>
        </div>

        {/* Recent Bookings */}
        <RecentBookingsTable bookings={bookings} />

        {/* Call to Action */}
        <CompanyCallToAction />

        {/* QR Scanner Modal */}
        <QRScanner
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
        />
      </div>
    </CompanyGuard>
  );
};

export default CompanyDashboard;
