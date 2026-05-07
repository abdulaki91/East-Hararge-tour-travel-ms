import React from "react";
import { Link } from "react-router-dom";
import {
  HomeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center animate-fade-in">
        {/* 403 Illustration */}
        <div className="relative mb-12">
          <div className="text-9xl md:text-[12rem] font-bold text-gradient bg-gradient-to-r from-red-200 via-orange-200 to-yellow-200 bg-clip-text text-transparent select-none">
            403
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-10 animate-pulse"></div>
          </div>
        </div>

        {/* Lock Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
            <LockClosedIcon className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Access Denied
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
            You don't have permission to access this resource. Please check your
            credentials or contact support if you believe this is an error.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link to="/" className="btn-primary btn-lg group">
            <HomeIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Go Home
          </Link>
          <Link to="/login" className="btn-outline btn-lg group">
            <UserIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Sign In
          </Link>
        </div>

        {/* Help Card */}
        <div className="card-gradient shadow-xl max-w-md mx-auto">
          <div className="card-content">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Need Help?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-slate-900">
                    Sign In Required
                  </h4>
                  <p className="text-sm text-slate-500">
                    This page requires authentication. Please sign in to
                    continue.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-slate-900">
                    Check Permissions
                  </h4>
                  <p className="text-sm text-slate-500">
                    Make sure you have the right role to access this resource.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-slate-900">
                    Contact Support
                  </h4>
                  <p className="text-sm text-slate-500">
                    If you believe this is an error, please contact our support
                    team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            🔐 This area is protected. Please ensure you have the proper access
            credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
