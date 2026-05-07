import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ShieldCheckIcon,
  TrashIcon,
  PencilIcon,
  KeyIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { adminService } from "../../services/admin";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/ui/Modal";
import toast from "react-hot-toast";

interface Company {
  id: number;
  user_id: number;
  company_name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  license_number?: string;
  logo?: string;
  is_verified: boolean;
  created_at: string;
  name: string;
  user_email: string;
  package_count: number;
}

const AdminCompanies: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    is_verified: undefined as boolean | undefined,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<Company | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState<Company | null>(
    null,
  );
  const [showCreateOrphanModal, setShowCreateOrphanModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] =
    useState<Company | null>(null);
  const [showEditModal, setShowEditModal] = useState<Company | null>(null);
  const [showResetPasswordModal, setShowResetPasswordModal] =
    useState<Company | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: companiesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-companies", currentPage, filters],
    queryFn: () =>
      adminService.getCompanies({
        page: currentPage,
        limit: 10,
        ...filters,
      }),
  });

  const verifyCompanyMutation = useMutation({
    mutationFn: ({
      companyId,
      status,
    }: {
      companyId: number;
      status: string;
    }) => adminService.updateCompanyStatus(companyId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Company status updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update company status",
      );
    },
  });

  const verifyWithReasonMutation = useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: number;
      data: { is_verified: boolean; rejection_reason?: string };
    }) => {
      return api.post(`/admin/companies/${companyId}/verify-with-reason`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Company verification updated successfully");
      setShowVerificationModal(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to verify company");
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: (companyId: number) => adminService.deleteCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Company deleted successfully");
      setShowDeleteModal(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete company");
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: (companyData: any) => adminService.createCompany(companyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Company created successfully");
      setShowCreateModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create company");
    },
  });

  const assignUserMutation = useMutation({
    mutationFn: ({
      companyId,
      userId,
    }: {
      companyId: number;
      userId: number;
    }) => adminService.reassignCompany(companyId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User assigned to company successfully");
      setShowAssignUserModal(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to assign user to company",
      );
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: ({
      companyId,
      companyData,
    }: {
      companyId: number;
      companyData: any;
    }) => adminService.updateCompany(companyId, companyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Company updated successfully");
      setShowEditModal(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update company");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({
      companyId,
      password,
    }: {
      companyId: number;
      password: string;
    }) => adminService.resetCompanyPassword(companyId, password),
    onSuccess: () => {
      toast.success("Password reset successfully");
      setShowResetPasswordModal(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reset password");
    },
  });

  const reassignCompanyMutation = useMutation({
    mutationFn: ({
      companyId,
      userId,
    }: {
      companyId: number;
      userId: number;
    }) => adminService.reassignCompany(companyId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Company reassigned successfully");
      setShowReassignModal(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to reassign company",
      );
    },
  });

  const createOrphanMutation = useMutation({
    mutationFn: (companyData: any) =>
      adminService.createOrphanCompany(companyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Orphan company created successfully");
      setShowCreateOrphanModal(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create orphan company",
      );
    },
  });

  const handleVerifyCompany = (companyId: number, isVerified: boolean) => {
    verifyCompanyMutation.mutate({
      companyId,
      status: isVerified ? "verified" : "pending",
    });
  };

  const handleDeleteCompany = (companyId: number) => {
    deleteCompanyMutation.mutate(companyId);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      is_verified: undefined,
      sort_by: "created_at",
      sort_order: "desc",
    });
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <p className="text-red-600 mb-6 font-medium">
          Failed to load companies
        </p>
        <Button onClick={() => navigate(0)}>Try Again</Button>
      </div>
    );
  }

  const companies = companiesData?.data?.items || [];
  const pagination = companiesData?.data;

  const verifiedCount = companies.filter((c: Company) => c.is_verified).length;
  const pendingCount = companies.filter((c: Company) => !c.is_verified).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold font-display mb-2">
              Manage Companies
            </h1>
            <p className="text-primary-100 text-lg">
              Oversee tour companies and their registrations 🏢
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAssignUserModal(true)}
              className="bg-white text-primary-600 hover:bg-gray-50 flex items-center gap-2"
            >
              <BuildingOfficeIcon className="h-5 w-5" />
              Assign Existing
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-primary-600 hover:bg-gray-50 flex items-center gap-2"
            >
              <BuildingOfficeIcon className="h-5 w-5" />
              Create New
            </Button>
            <Button
              onClick={() => setShowCreateOrphanModal(true)}
              className="bg-white text-secondary-600 hover:bg-gray-50 flex items-center gap-2"
            >
              <BuildingOfficeIcon className="h-5 w-5" />
              Create Orphan
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Total Companies
              </p>
              <p className="text-3xl font-bold text-gray-900 font-display">
                {pagination?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl shadow-lg">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Verified
              </p>
              <p className="text-3xl font-bold text-gray-900 font-display">
                {verifiedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl shadow-lg">
              <ClockIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Pending
              </p>
              <p className="text-3xl font-bold text-gray-900 font-display">
                {pendingCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl shadow-lg">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Total Packages
              </p>
              <p className="text-3xl font-bold text-gray-900 font-display">
                {companies.reduce(
                  (sum: number, c: Company) => sum + c.package_count,
                  0,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
            {Object.values(filters).some(
              (v) => v !== "" && v !== undefined,
            ) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </label>
                <select
                  value={
                    filters.is_verified === undefined
                      ? ""
                      : filters.is_verified.toString()
                  }
                  onChange={(e) =>
                    handleFilterChange(
                      "is_verified",
                      e.target.value === ""
                        ? undefined
                        : e.target.value === "true",
                    )
                  }
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="true">Verified</option>
                  <option value="false">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={`${filters.sort_by}-${filters.sort_order}`}
                  onChange={(e) => {
                    const [sort_by, sort_order] = e.target.value.split("-");
                    handleFilterChange("sort_by", sort_by);
                    handleFilterChange("sort_order", sort_order);
                  }}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="company_name-asc">Name A-Z</option>
                  <option value="company_name-desc">Name Z-A</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Companies Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full dashboard-table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Packages
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {companies.map((company: Company) => (
                <tr
                  key={company.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <BuildingOfficeIcon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {company.company_name}
                        </div>
                        {company.email && (
                          <div className="text-sm text-gray-500">
                            {company.email}
                          </div>
                        )}
                        {company.phone && (
                          <div className="text-xs text-gray-400">
                            {company.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">
                      {company.user_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.is_verified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {company.is_verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.package_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(company.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowDetailsModal(company)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowEditModal(company)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit company"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowReassignModal(company)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Reassign owner"
                      >
                        <BuildingOfficeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowResetPasswordModal(company)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Reset password"
                      >
                        <KeyIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowVerificationModal(company)}
                        className={`p-2 rounded-lg transition-colors ${
                          company.is_verified
                            ? "text-yellow-600 hover:bg-yellow-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={
                          company.is_verified
                            ? "Review verification"
                            : "Verify company"
                        }
                      >
                        {company.is_verified ? (
                          <ClockIcon className="h-4 w-4" />
                        ) : (
                          <ShieldCheckIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(company.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete company"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {companies.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No companies found
            </h3>
            <p className="text-gray-500">
              {Object.values(filters).some((v) => v !== "" && v !== undefined)
                ? "Try adjusting your filters"
                : "No companies have been registered yet"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Company Details Modal */}
      <Modal
        isOpen={showDetailsModal !== null}
        onClose={() => setShowDetailsModal(null)}
        title="Company Details"
      >
        {showDetailsModal && (
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <BuildingOfficeIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {showDetailsModal.company_name}
                  </h3>
                  <p className="text-gray-500">
                    {showDetailsModal.is_verified
                      ? "Verified Company"
                      : "Pending Verification"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Owner
                  </label>
                  <p className="text-sm text-gray-900">
                    {showDetailsModal.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="text-sm text-gray-900">
                    {showDetailsModal.email || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <p className="text-sm text-gray-900">
                    {showDetailsModal.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <p className="text-sm text-gray-900">
                    {showDetailsModal.website || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    License Number
                  </label>
                  <p className="text-sm text-gray-900">
                    {showDetailsModal.license_number || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Packages
                  </label>
                  <p className="text-sm text-gray-900">
                    {showDetailsModal.package_count}
                  </p>
                </div>
              </div>

              {showDetailsModal.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <p className="text-sm text-gray-900">
                    {showDetailsModal.address}
                  </p>
                </div>
              )}

              {showDetailsModal.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <p className="text-sm text-gray-900">
                    {showDetailsModal.description}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleVerifyCompany(
                      showDetailsModal.id,
                      !showDetailsModal.is_verified,
                    );
                    setShowDetailsModal(null);
                  }}
                >
                  {showDetailsModal.is_verified
                    ? "Mark as Pending"
                    : "Verify Company"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal !== null}
        onClose={() => setShowDeleteModal(null)}
        title="Delete Company"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this company? This action cannot be
            undone and will also delete all associated packages and bookings.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                showDeleteModal && handleDeleteCompany(showDeleteModal)
              }
              disabled={deleteCompanyMutation.isPending}
            >
              {deleteCompanyMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Company Modal */}
      <CreateCompanyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(companyData) => createCompanyMutation.mutate(companyData)}
        isLoading={createCompanyMutation.isPending}
      />

      {/* Assign User to Company Modal */}
      <AssignUserModal
        isOpen={showAssignUserModal}
        onClose={() => setShowAssignUserModal(false)}
        onSubmit={(companyId, userId) =>
          assignUserMutation.mutate({ companyId, userId })
        }
        isLoading={assignUserMutation.isPending}
      />

      {/* Edit Company Modal */}
      {showEditModal && (
        <EditCompanyModal
          isOpen={true}
          company={showEditModal}
          onClose={() => setShowEditModal(null)}
          onSubmit={(companyData) =>
            updateCompanyMutation.mutate({
              companyId: showEditModal.id,
              companyData,
            })
          }
          isLoading={updateCompanyMutation.isPending}
        />
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <ResetPasswordModal
          isOpen={true}
          company={showResetPasswordModal}
          onClose={() => setShowResetPasswordModal(null)}
          onSubmit={(password) =>
            resetPasswordMutation.mutate({
              companyId: showResetPasswordModal.id,
              password,
            })
          }
          isLoading={resetPasswordMutation.isPending}
        />
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <VerificationModal
          isOpen={true}
          company={showVerificationModal}
          onClose={() => setShowVerificationModal(null)}
          onSubmit={(data) =>
            verifyWithReasonMutation.mutate({
              companyId: showVerificationModal.id,
              data,
            })
          }
          isLoading={verifyWithReasonMutation.isPending}
        />
      )}

      {/* Reassign Company Modal */}
      {showReassignModal && (
        <ReassignCompanyModal
          isOpen={true}
          company={showReassignModal}
          onClose={() => setShowReassignModal(null)}
          onSubmit={(userId) =>
            reassignCompanyMutation.mutate({
              companyId: showReassignModal.id,
              userId,
            })
          }
          isLoading={reassignCompanyMutation.isPending}
        />
      )}

      {/* Create Orphan Company Modal */}
      <CreateOrphanModal
        isOpen={showCreateOrphanModal}
        onClose={() => setShowCreateOrphanModal(false)}
        onSubmit={(companyData) => createOrphanMutation.mutate(companyData)}
        isLoading={createOrphanMutation.isPending}
      />
    </div>
  );
};

// Verification Modal Component
interface VerificationModalProps {
  isOpen: boolean;
  company: Company;
  onClose: () => void;
  onSubmit: (data: { is_verified: boolean; rejection_reason?: string }) => void;
  isLoading: boolean;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  company,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [action, setAction] = useState<"verify" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (action === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    onSubmit({
      is_verified: action === "verify",
      rejection_reason: action === "reject" ? rejectionReason : undefined,
    });
  };

  const handleClose = () => {
    setAction(null);
    setRejectionReason("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Verify Company">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Company:</strong> {company.company_name}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Owner: {company.name} ({company.email})
          </p>
          <p className="text-xs text-blue-700">
            Current Status:{" "}
            <span
              className={
                company.is_verified ? "text-green-700" : "text-yellow-700"
              }
            >
              {company.is_verified ? "Verified" : "Pending"}
            </span>
          </p>
        </div>

        {!action && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Choose an action for this company:
            </p>

            <button
              type="button"
              onClick={() => setAction("verify")}
              className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">
                    Verify Company
                  </h3>
                  <p className="text-sm text-green-700">
                    Approve this company to create packages and receive bookings
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAction("reject")}
              className="w-full p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <XCircleIcon className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">
                    Reject Verification
                  </h3>
                  <p className="text-sm text-red-700">
                    Reject this company with a reason
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {action === "verify" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Verify Company
                </h3>
                <p className="text-sm text-green-800">
                  This company will be able to create packages and receive
                  bookings. The owner will receive a notification.
                </p>
              </div>
            </div>
          </div>
        )}

        {action === "reject" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
              required
              placeholder="Explain why this company is being rejected..."
            />
            <p className="text-xs text-gray-500 mt-1">
              The owner will receive this message in a notification
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          {action ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAction(null)}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className={
                  action === "verify"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {isLoading
                  ? "Processing..."
                  : action === "verify"
                    ? "Verify Company"
                    : "Reject Company"}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

// Assign User to Company Modal Component
interface AssignUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (companyId: number, userId: number) => void;
  isLoading: boolean;
}

const AssignUserModal: React.FC<AssignUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null,
  );

  // Fetch users without company
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["users-without-company"],
    queryFn: () => adminService.getUsersWithoutCompany(),
    enabled: isOpen,
  });

  // Fetch all companies for assignment
  const { data: companiesData, isLoading: loadingCompanies } = useQuery({
    queryKey: ["companies-for-assignment"],
    queryFn: () => adminService.getAllCompaniesForAssignment(),
    enabled: isOpen,
  });

  const users = usersData?.data || [];
  const companies = companiesData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }
    if (!selectedCompanyId) {
      toast.error("Please select a company");
      return;
    }
    onSubmit(selectedCompanyId, selectedUserId);
  };

  const handleClose = () => {
    setSelectedUserId(null);
    setSelectedCompanyId(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Assign User to Company
          </h2>
          <p className="text-gray-600">
            Connect an existing user with an existing company
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-900">
                <p className="font-semibold mb-1">Ownership Transfer</p>
                <p className="text-indigo-700">
                  The selected user will become the company owner. If the
                  company has a current owner, their role will be changed back
                  to USER.
                </p>
              </div>
            </div>
          </div>

          {/* Company Selection */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-indigo-300 transition-all">
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              Select Company *
            </label>
            {loadingCompanies ? (
              <div className="text-center py-8">
                <LoadingSpinner size="sm" />
                <p className="text-sm text-gray-500 mt-2">
                  Loading companies...
                </p>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No companies available</p>
              </div>
            ) : (
              <select
                value={selectedCompanyId || ""}
                onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 font-medium"
                required
              >
                <option value="">-- Choose a company --</option>
                {companies.map((company: any) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                    {company.current_owner
                      ? ` (Owner: ${company.current_owner})`
                      : " (No owner)"}
                    {company.is_verified ? " ✓" : " ⏳"}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* User Selection */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-purple-300 transition-all">
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              Select User *
            </label>
            {loadingUsers ? (
              <div className="text-center py-8">
                <LoadingSpinner size="sm" />
                <p className="text-sm text-gray-500 mt-2">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  No users available. All users are already assigned to
                  companies.
                </p>
              </div>
            ) : (
              <select
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 font-medium"
                required
              >
                <option value="">-- Choose a user --</option>
                {users.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email}) - {user.role_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedUserId || !selectedCompanyId}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Assigning...
                </span>
              ) : (
                "Assign to Company"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// Create Company Modal Component
interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (companyData: any) => void;
  isLoading: boolean;
}

const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    // User data
    name: "",
    email: "",
    password: "",
    phone: "",
    // Company data
    company_name: "",
    business_license: "",
    address: "",
    description: "",
    website: "",
    is_verified: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      company_name: "",
      business_license: "",
      address: "",
      description: "",
      website: "",
      is_verified: false,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create New Company
          </h2>
          <p className="text-gray-600">
            Create a new company with owner account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-h-[60vh] overflow-y-auto pr-2"
        >
          {/* Owner Information Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              Owner Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Owner Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              Company Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      company_name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Acme Travel Agency"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business License
                  </label>
                  <input
                    type="text"
                    value={formData.business_license}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        business_license: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="BL-123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  rows={2}
                  placeholder="123 Main St, City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                  placeholder="Brief description of the company and services..."
                />
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_verified: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">
                      Verify company immediately
                    </span>
                    <span className="text-xs text-gray-600">
                      Company can start creating packages right away
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Creating...
                </span>
              ) : (
                "Create Company"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// Edit Company Modal Component
interface EditCompanyModalProps {
  isOpen: boolean;
  company: Company;
  onClose: () => void;
  onSubmit: (companyData: any) => void;
  isLoading: boolean;
}

const EditCompanyModal: React.FC<EditCompanyModalProps> = ({
  isOpen,
  company,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    // User data
    name: company.name || "",
    email: company.email || "",
    phone: company.phone || "",
    // Company data
    company_name: company.company_name || "",
    business_license: company.license_number || "",
    address: company.address || "",
    description: company.description || "",
    website: company.website || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Company">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-96 overflow-y-auto"
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Editing:</strong> {company.company_name}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Owner Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Company Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  company_name: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business License
              </label>
              <input
                type="text"
                value={formData.business_license}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    business_license: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Brief description of the company..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Company"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Reset Password Modal Component
interface ResetPasswordModalProps {
  isOpen: boolean;
  company: Company;
  onClose: () => void;
  onSubmit: (password: string) => void;
  isLoading: boolean;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  company,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    onSubmit(password);
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Company Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-800">
            <strong>Resetting password for:</strong> {company.company_name}
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Owner: {company.name} ({company.email})
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            minLength={6}
            required
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            minLength={6}
            required
            placeholder="Confirm new password"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Reassign Company Modal Component
interface ReassignCompanyModalProps {
  isOpen: boolean;
  company: Company;
  onClose: () => void;
  onSubmit: (userId: number) => void;
  isLoading: boolean;
}

const ReassignCompanyModal: React.FC<ReassignCompanyModalProps> = ({
  isOpen,
  company,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Fetch users without company
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["users-without-company"],
    queryFn: () => adminService.getUsersWithoutCompany(),
    enabled: isOpen,
  });

  const users = usersData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }
    onSubmit(selectedUserId);
  };

  const handleClose = () => {
    setSelectedUserId(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reassign Company Owner">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-purple-800">
            <strong>Company:</strong> {company.company_name}
          </p>
          <p className="text-xs text-purple-700 mt-1">
            Current Owner: {company.name} ({company.user_email})
          </p>
          <p className="text-xs text-purple-600 mt-2">
            <strong>Note:</strong> The current owner's role will be changed back
            to USER, and the new owner's role will be changed to COMPANY.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select New Owner *
          </label>
          {loadingUsers ? (
            <div className="text-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No users available. All users are already assigned to companies.
            </div>
          ) : (
            <select
              value={selectedUserId || ""}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">-- Select a user --</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email}) - {user.role_name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !selectedUserId}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? "Reassigning..." : "Reassign Company"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Create Orphan Company Modal Component
interface CreateOrphanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (companyData: any) => void;
  isLoading: boolean;
}

const CreateOrphanModal: React.FC<CreateOrphanModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    company_name: "",
    business_license: "",
    address: "",
    description: "",
    website: "",
    is_verified: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      company_name: "",
      business_license: "",
      address: "",
      description: "",
      website: "",
      is_verified: false,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create Orphan Company
          </h2>
          <p className="text-gray-600">
            Create a company without an owner (can be assigned later)
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 max-h-[60vh] overflow-y-auto pr-2"
        >
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">No Owner Assignment</p>
                <p className="text-amber-700">
                  This company will be created without an owner. You can assign
                  an owner later using the "Reassign Owner" feature.
                </p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-amber-300 transition-all">
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    company_name: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-gray-900 font-medium"
                placeholder="Acme Travel Agency"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-amber-300 transition-all">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Business License
                </label>
                <input
                  type="text"
                  value={formData.business_license}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      business_license: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  placeholder="BL-123456"
                />
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-amber-300 transition-all">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-amber-300 transition-all">
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                rows={2}
                placeholder="123 Main St, City, Country"
              />
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-amber-300 transition-all">
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                rows={3}
                placeholder="Brief description of the company and services..."
              />
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_verified}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_verified: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                />
                <div>
                  <span className="text-sm font-bold text-gray-900 block">
                    Verify company immediately
                  </span>
                  <span className="text-xs text-gray-600">
                    Company will be ready for operations once an owner is
                    assigned
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Creating...
                </span>
              ) : (
                "Create Orphan Company"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AdminCompanies;
