import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Layouts
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Public Pages
import HomePage from "../pages/HomePage";
import PackagesPage from "../pages/PackagesPage";
import PackageDetailsPage from "../pages/PackageDetailsPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

// User Pages
import UserDashboard from "../pages/user/UserDashboard";
import UserProfile from "../pages/user/UserProfile";
import UserBookings from "../pages/user/UserBookings";
import BookingDetails from "../pages/user/BookingDetails";
import PaymentPage from "../pages/user/PaymentPage";
import PaymentHistory from "../pages/user/PaymentHistory";
import UserReviews from "../pages/user/UserReviews";

// Company Pages
import CompanyDashboard from "../pages/company/CompanyDashboard";
import CompanyPackages from "../pages/company/CompanyPackages";
import CreatePackage from "../pages/company/CreatePackage";
import EditPackage from "../pages/company/EditPackage";
import CompanyBookings from "../pages/company/CompanyBookings";
import CompanyRegister from "../pages/company/CompanyRegister";
import CompanyReviews from "../pages/company/CompanyReviews";
import CompanyNotifications from "../pages/company/CompanyNotifications";
import CompanySettings from "../pages/company/CompanySettings";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminCompanies from "../pages/admin/AdminCompanies";
import AdminNotifications from "../pages/admin/AdminNotifications";
import AdminSettings from "../pages/admin/AdminSettings";

// Other Pages
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";
import NotificationsPage from "../pages/NotificationsPage";

// Protected Route Component
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="packages" element={<PackagesPage />} />
        <Route path="packages/:id" element={<PackageDetailsPage />} />
        <Route
          path="login"
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardRoute(user?.role)} replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="register"
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardRoute(user?.role)} replace />
            ) : (
              <RegisterPage />
            )
          }
        />
      </Route>

      {/* User Dashboard Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute roles={["USER"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="bookings" element={<UserBookings />} />
        <Route path="bookings/:id" element={<BookingDetails />} />
        <Route path="payment/:bookingId" element={<PaymentPage />} />
        <Route path="payments" element={<PaymentHistory />} />
        <Route path="reviews" element={<UserReviews />} />
      </Route>

      {/* Company Dashboard Routes */}
      <Route
        path="/company"
        element={
          <ProtectedRoute roles={["COMPANY"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CompanyDashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="packages" element={<CompanyPackages />} />
        <Route path="packages/create" element={<CreatePackage />} />
        <Route path="packages/:id/edit" element={<EditPackage />} />
        <Route path="bookings" element={<CompanyBookings />} />
        <Route path="reviews" element={<CompanyReviews />} />
        <Route path="notifications" element={<CompanyNotifications />} />
        <Route path="settings" element={<CompanySettings />} />
        <Route path="register" element={<CompanyRegister />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Error Pages */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute roles={["USER", "COMPANY", "ADMIN"]}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const getDashboardRoute = (role?: string) => {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "COMPANY":
      return "/company";
    case "USER":
    default:
      return "/user";
  }
};

export default AppRoutes;
