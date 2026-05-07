import React from "react";
import { useAuth } from "../../context/AuthContext";
import ErrorBoundary from "../common/ErrorBoundary";

interface DashboardContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  children,
  title,
  subtitle,
  actions,
  className = "",
}) => {
  const { user } = useAuth();

  return (
    <ErrorBoundary>
      <div
        className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 ${className}`}
      >
        <div className="container mx-auto px-4 py-8">
          {(title || subtitle || actions) && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  {title && (
                    <h1 className="text-3xl font-bold text-gray-900 font-display">
                      {title}
                    </h1>
                  )}
                  {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
                </div>
                {actions && (
                  <div className="flex items-center space-x-4">{actions}</div>
                )}
              </div>
            </div>
          )}

          <main className="space-y-8">{children}</main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DashboardContainer;
