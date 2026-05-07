import React, { useState } from "react";
import { Menu, User, LogOut, Search, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./notifications/NotificationBell";

interface DashboardNavbarProps {
  onMenuClick: () => void;
  title?: string;
  onSearch?: (query: string) => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  onMenuClick,
  title = "Dashboard",
  onSearch,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <nav
      className="bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20 fixed w-full z-30 top-0"
      style={{ height: "var(--navbar-height)" }}
    >
      <div className="px-4 py-4 lg:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center justify-start">
            <button
              onClick={onMenuClick}
              className="inline-flex items-center p-2 text-slate-500 rounded-xl lg:hidden hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center ml-2 lg:ml-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{title}</h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  East Hararghe Tours
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="hidden md:flex items-center">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 w-48 lg:w-64"
                />
              </form>
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* Settings */}
            <button className="p-2 text-slate-500 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition-all duration-200">
              <Settings className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 text-sm text-slate-500 rounded-xl hover:bg-slate-100 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-slate-900 font-medium">{user?.name}</div>
                  <div className="text-xs text-slate-500 capitalize">
                    {user?.role?.toLowerCase()}
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 card shadow-2xl border border-white/20 z-50 animate-slide-up">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-slate-200/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {user?.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {user?.email}
                          </p>
                          <div className="mt-1">
                            <span className="badge-primary text-xs">
                              {user?.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          const profileRoute =
                            user?.role === "ADMIN"
                              ? "/admin/profile"
                              : user?.role === "COMPANY"
                                ? "/company/profile"
                                : "/user/profile";
                          navigate(profileRoute);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        View Profile
                      </button>
                    </div>

                    <div className="border-t border-slate-200/50 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                          <LogOut className="w-4 h-4 text-red-600" />
                        </div>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
