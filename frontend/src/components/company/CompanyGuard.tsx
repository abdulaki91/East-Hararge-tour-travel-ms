import React from "react";
import { Navigate } from "react-router-dom";
import { useCompanyCheck } from "../../hooks/useCompanyCheck";
import LoadingSpinner from "../ui/LoadingSpinner";

interface CompanyGuardProps {
  children: React.ReactNode;
}

const CompanyGuard: React.FC<CompanyGuardProps> = ({ children }) => {
  const { isCompanyRegistered, needsRegistration, isLoading } =
    useCompanyCheck();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (needsRegistration) {
    return <Navigate to="/company/register" replace />;
  }

  return <>{children}</>;
};

export default CompanyGuard;
