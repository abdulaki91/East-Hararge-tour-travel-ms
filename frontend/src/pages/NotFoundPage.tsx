import React from "react";
import { Link } from "react-router-dom";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center animate-fade-in">
        {/* 404 Illustration */}
        <div className="relative mb-12">
          <div className="text-9xl md:text-[12rem] font-bold text-gradient bg-gradient-to-r from-blue-200 via-purple-200 to-orange-200 bg-clip-text text-transparent select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-10 animate-pulse"></div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
            The page you're looking for seems to have wandered off on its own
            adventure. Let's get you back on track!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link to="/" className="btn-primary btn-lg group">
            <HomeIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Go Home
          </Link>
          <Link to="/packages" className="btn-outline btn-lg group">
            <MapPinIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Browse Tours
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="card-gradient shadow-xl max-w-md mx-auto">
          <div className="card-content">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Popular Destinations
            </h3>
            <div className="space-y-3">
              <Link
                to="/packages"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <MagnifyingGlassIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-slate-700 group-hover:text-blue-600 transition-colors">
                    All Tour Packages
                  </span>
                </div>
                <svg
                  className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              <Link
                to="/login"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700 group-hover:text-green-600 transition-colors">
                    Sign In
                  </span>
                </div>
                <svg
                  className="h-4 w-4 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              <Link
                to="/register"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="h-4 w-4 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700 group-hover:text-purple-600 transition-colors">
                    Create Account
                  </span>
                </div>
                <svg
                  className="h-4 w-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            🧭 Lost? Don't worry, even the best explorers take wrong turns
            sometimes!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
