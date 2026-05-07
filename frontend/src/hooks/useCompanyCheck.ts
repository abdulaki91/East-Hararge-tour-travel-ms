import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { companyService } from "../services/company";

export const useCompanyCheck = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["company-profile"],
    queryFn: () => companyService.getCompanyProfile(),
    enabled: user?.role_name === "COMPANY",
    retry: false,
  });

  const company = data?.data;
  const isCompanyRegistered = Boolean(data?.success && company);
  const isCompanyVerified = company?.is_verified || false;

  // User needs to see registration page only if:
  // 1. They have COMPANY role AND
  // 2. No company exists (need to register)
  // Note: If company exists but is not verified, they can still access dashboard
  // but will see limited features
  const needsRegistration =
    user?.role_name === "COMPANY" && !isLoading && !isCompanyRegistered;

  return {
    company,
    isCompanyRegistered,
    isCompanyVerified,
    needsRegistration,
    isLoading,
    error,
  };
};
