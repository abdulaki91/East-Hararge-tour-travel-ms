import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  X,
  Home,
  Package,
  Calendar,
  Users,
  Building,
  BarChart3,
  User,
  MapPin,
  Settings,
  CreditCard,
  Star,
  Bell,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCompanyCheck } from "../hooks/useCompanyCheck";
import NotificationBell from "./notifications/NotificationBell";
import clsx from "clsx";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { isCompanyVerified } = useCompanyCheck();
  const location = useLocation();

  // Prevent closing on desktop
  const handleClose = () => {
    if (window.innerWidth < 1024) {
      // Only close on mobile
      onClose();
    }
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case "ADMIN":
        return [
          {
            icon: BarChart3,
            label: "Dashboard",
            path: "/admin",
            color: "blue",
          },
          {
            icon: User,
            label: "Profile",
            path: "/admin/profile",
            color: "green",
          },
          {
            icon: Users,
            label: "Users",
            path: "/admin/users",
            color: "purple",
          },
          {
            icon: Building,
            label: "Companies",
            path: "/admin/companies",
            color: "orange",
          },
          {
            icon: Bell,
            label: "Notifications",
            path: "/admin/notifications",
            color: "yellow",
          },
          {
            icon: Settings,
            label: "Settings",
            path: "/admin/settings",
            color: "gray",
          },
        ];
      case "COMPANY":
        // Base menu items for all companies
        const baseCompanyItems = [
          {
            icon: BarChart3,
            label: "Dashboard",
            path: "/company",
            color: "blue",
            allowedForUnverified: true,
          },
          {
            icon: User,
            label: "Profile",
            path: "/company/profile",
            color: "green",
            allowedForUnverified: true,
          },
          {
            icon: Settings,
            label: "Settings",
            path: "/company/settings",
            color: "gray",
            allowedForUnverified: true,
          },
        ];

        // Additional items only for verified companies
        const verifiedCompanyItems = [
          {
            icon: Package,
            label: "My Packages",
            path: "/company/packages",
            color: "purple",
            allowedForUnverified: false,
          },
          {
            icon: Calendar,
            label: "Bookings",
            path: "/company/bookings",
            color: "orange",
            allowedForUnverified: false,
          },
          {
            icon: Star,
            label: "Reviews",
            path: "/company/reviews",
            color: "yellow",
            allowedForUnverified: false,
          },
          {
            icon: Bell,
            label: "Notifications",
            path: "/company/notifications",
            color: "pink",
            allowedForUnverified: false,
          },
        ];

        // Return appropriate items based on verification status
        if (isCompanyVerified) {
          return [...baseCompanyItems, ...verifiedCompanyItems];
        } else {
          return baseCompanyItems;
        }
      case "USER":
      default:
        return [
          { icon: Home, label: "Dashboard", path: "/user", color: "blue" },
          {
            icon: User,
            label: "Profile",
            path: "/user/profile",
            color: "green",
          },
          {
            icon: Calendar,
            label: "My Bookings",
            path: "/user/bookings",
            color: "orange",
          },
          {
            icon: CreditCard,
            label: "Payment History",
            path: "/user/payments",
            color: "purple",
          },
          {
            icon: Star,
            label: "My Reviews",
            path: "/user/reviews",
            color: "yellow",
          },
        ];
    }
  };

  const menuItems = getMenuItems();

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive
        ? "bg-blue-50 text-blue-700 border-blue-500"
        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
      green: isActive
        ? "bg-green-50 text-green-700 border-green-500"
        : "text-slate-600 hover:bg-green-50 hover:text-green-700",
      orange: isActive
        ? "bg-orange-50 text-orange-700 border-orange-500"
        : "text-slate-600 hover:bg-orange-50 hover:text-orange-700",
      purple: isActive
        ? "bg-purple-50 text-purple-700 border-purple-500"
        : "text-slate-600 hover:bg-purple-50 hover:text-purple-700",
      yellow: isActive
        ? "bg-yellow-50 text-yellow-700 border-yellow-500"
        : "text-slate-600 hover:bg-yellow-50 hover:text-yellow-700",
      gray: isActive
        ? "bg-gray-50 text-gray-700 border-gray-500"
        : "text-slate-600 hover:bg-gray-50 hover:text-gray-700",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed top-0 left-0 z-50 w-64 h-screen transition-all duration-300 bg-white/95 backdrop-blur-md border-r border-white/20 shadow-2xl flex flex-col",
          "lg:translate-x-0", // Always visible on desktop
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0", // Slide on mobile, always visible on desktop
        )}
        style={{ paddingTop: "var(--navbar-height)" }}
      >
        {/* Mobile close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-500 rounded-xl lg:hidden hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo - Mobile */}
        <div className="flex items-center space-x-3 px-6 pb-6 border-b border-slate-200/50 lg:hidden flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900">
              East Hararghe Tours
            </span>
            <p className="text-xs text-slate-500">Management System</p>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-slate-200/50 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">
                {user?.name}
              </p>
              <p className="text-sm text-slate-500 truncate">{user?.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="badge-primary text-xs">{user?.role}</span>
                {user?.role === "COMPANY" && (
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      isCompanyVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800",
                    )}
                  >
                    {isCompanyVerified ? (
                      <>
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        Pending
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          <div className="py-4">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Main Menu
            </p>
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={handleClose}
                      className={clsx(
                        "flex items-center px-3 py-3 rounded-xl font-medium transition-all duration-200 group",
                        getColorClasses(item.color, isActive),
                        isActive &&
                          "border-r-4 shadow-lg transform scale-[1.02]",
                      )}
                    >
                      <div
                        className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-all duration-200",
                          isActive
                            ? `bg-${item.color}-100`
                            : "bg-slate-100 group-hover:bg-slate-200",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="flex-1">{item.label}</span>
                      {isActive && (
                        <div className="w-2 h-2 bg-current rounded-full"></div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Back to main site */}
          <div className="py-4 border-t border-slate-200/50">
            <Link
              to="/"
              onClick={handleClose}
              className="flex items-center px-3 py-3 rounded-xl font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group mb-2"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-all duration-200">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <span className="flex-1">Back to Website</span>
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>

            {/* Browse Packages Link */}
            <Link
              to="/packages"
              onClick={handleClose}
              className={clsx(
                "flex items-center px-3 py-3 rounded-xl font-medium transition-all duration-200 group",
                location.pathname === "/packages"
                  ? "bg-indigo-50 text-indigo-700 border-r-4 border-indigo-500 shadow-lg transform scale-[1.02]"
                  : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
              )}
            >
              <div
                className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-all duration-200",
                  location.pathname === "/packages"
                    ? "bg-indigo-100"
                    : "bg-indigo-100 group-hover:bg-indigo-200",
                )}
              >
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="flex-1">Browse Packages</span>
              {location.pathname === "/packages" && (
                <div className="w-2 h-2 bg-current rounded-full"></div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
