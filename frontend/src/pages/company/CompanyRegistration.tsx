import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import api from "../../services/api";

const CompanyRegistration: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    company_name: "",
    business_license: "",
    address: "",
    description: "",
    website: "",
    phone: "",
    email: "",
  });

  // Check if user already has a company
  const { data: companyData, isLoading: checkingCompany } = useQuery({
    queryKey: ["my-company"],
    queryFn: async () => {
      const response = await api.get("/company/me");
      return response.data;
    },
    retry: false,
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/company/register", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        "Company registered successfully! Awaiting admin verification.",
      );
      queryClient.invalidateQueries({ queryKey: ["my-company"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      navigate("/company/dashboard");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to register company",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (checkingCompany) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If company exists, show status
  if (companyData?.data) {
    const company = companyData.data;

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-4">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {company.company_name}
              </h1>

              {company.is_verified ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full mb-6">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span className="font-semibold">Verified Company</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full mb-6">
                  <ClockIcon className="h-5 w-5" />
                  <span className="font-semibold">Pending Verification</span>
                </div>
              )}

              {!company.is_verified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <h3 className="font-semibold text-yellow-900 mb-1">
                        Awaiting Admin Verification
                      </h3>
                      <p className="text-sm text-yellow-800">
                        Your company registration is under review. You'll be
                        notified once an admin verifies your company. After
                        verification, you'll be able to create packages and
                        receive bookings.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-left space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Business License
                  </label>
                  <p className="text-gray-900">
                    {company.license_number || "Not provided"}
                  </p>
                </div>

                {company.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Address
                    </label>
                    <p className="text-gray-900">{company.address}</p>
                  </div>
                )}

                {company.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Description
                    </label>
                    <p className="text-gray-900">{company.description}</p>
                  </div>
                )}

                {company.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Website
                    </label>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
              </div>

              <Button onClick={() => navigate("/company/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-4">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Register Your Company
            </h1>
            <p className="text-gray-600">
              Fill in your company details to start offering tour packages
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Verification Process
                </h3>
                <p className="text-sm text-blue-800">
                  After submitting your company details, an admin will review
                  and verify your information. You'll receive a notification
                  once your company is verified.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business License
                </label>
                <input
                  type="text"
                  name="business_license"
                  value={formData.business_license}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about your company and the services you offer..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="flex-1"
              >
                {registerMutation.isPending
                  ? "Registering..."
                  : "Register Company"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistration;
