import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { packageService } from "../../services/packages";
import type { PackageFilters } from "../../types";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import PackageStatsGrid from "../../components/company/PackageStatsGrid";
import PackageTable from "../../components/company/PackageTable";
import DeletePackageModal from "../../components/company/DeletePackageModal";
import Pagination from "../../components/common/Pagination";
import { getErrorMessage } from "../../utils/errorHandler";

const CompanyPackages: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PackageFilters>({
    page: 1,
    limit: 10,
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    packageId?: number;
    packageTitle?: string;
  }>({
    isOpen: false,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["company-packages", filters],
    queryFn: () => packageService.getMyPackages(filters),
  });

  const deletePackageMutation = useMutation({
    mutationFn: (id: number) => packageService.deletePackage(id),
    onSuccess: () => {
      toast.success("Package deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["company-packages"] });
      setDeleteModal({ isOpen: false });
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, "Failed to delete package");
      toast.error(errorMessage);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => packageService.togglePackageStatus(id),
    onSuccess: () => {
      toast.success("Package status updated");
      queryClient.invalidateQueries({ queryKey: ["company-packages"] });
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(
        error,
        "Failed to update package status",
      );
      toast.error(errorMessage);
    },
  });

  const handleDelete = (id: number, title: string) => {
    setDeleteModal({ isOpen: true, packageId: id, packageTitle: title });
  };

  const confirmDelete = () => {
    if (deleteModal.packageId) {
      deletePackageMutation.mutate(deleteModal.packageId);
    }
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
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
        <p className="text-error-600 mb-6 font-medium">
          Failed to load packages
        </p>
        <Button onClick={() => navigate(0)}>Try Again</Button>
      </div>
    );
  }

  const packages = data?.data.items || [];
  const pagination = data?.data.pagination;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold font-display mb-2">
              My Packages
            </h1>
            <p className="text-primary-100 text-lg">
              Manage your tour packages and offerings 📦
            </p>
          </div>
          <Link to="/company/packages/create">
            <Button
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-100 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Package
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <PackageStatsGrid packages={packages} />

      {packages.length === 0 ? (
        <EmptyState
          title="No packages found"
          description="Create your first package to start attracting customers!"
          action={{
            label: "Create Package",
            onClick: () => navigate("/company/packages/create"),
          }}
        />
      ) : (
        <>
          <PackageTable
            packages={packages}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            isToggling={toggleStatusMutation.isPending}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeletePackageModal
        isOpen={deleteModal.isOpen}
        packageTitle={deleteModal.packageTitle}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        isDeleting={deletePackageMutation.isPending}
      />
    </div>
  );
};

export default CompanyPackages;
