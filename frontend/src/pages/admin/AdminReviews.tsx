import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  StarIcon,
  EyeIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { adminService } from "../../services/admin";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { toast } from "react-hot-toast";

interface Review {
  id: number;
  rating: number;
  comment: string;
  user_name: string;
  package_title: string;
  company_name: string;
  created_at: string;
}

const AdminReviews: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["admin-reviews", currentPage, searchTerm, selectedRating],
    queryFn: () =>
      adminService.getAllReviews({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        rating: selectedRating,
      }),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => adminService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      setShowDeleteModal(false);
      setSelectedReview(null);
      toast.success("Review deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete review");
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleDeleteReview = (review: Review) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setShowViewModal(true);
  };

  const confirmDelete = () => {
    if (selectedReview) {
      deleteReviewMutation.mutate(selectedReview.id);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "success";
    if (rating >= 3) return "warning";
    return "error";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const reviews = reviewsData?.data?.items || [];
  const totalPages = reviewsData?.data?.totalPages || 1;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold font-display mb-2">
          Review Management
        </h1>
        <p className="text-primary-100 text-lg">
          Monitor and manage customer reviews across all packages
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1">
            <Input
              placeholder="Search reviews, users, or packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={MagnifyingGlassIcon}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <Button type="submit">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </form>
      </div>

      {/* Reviews List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
        {reviews.length === 0 ? (
          <EmptyState
            icon={StarIcon}
            title="No reviews found"
            description="No reviews match your current filters."
          />
        ) : (
          <>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Reviews ({reviewsData?.data?.total || 0})
              </h2>
              <div className="space-y-4">
                {reviews.map((review: Review) => (
                  <div
                    key={review.id}
                    className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <UserIcon className="h-5 w-5 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {review.user_name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                            <Badge
                              variant={getRatingColor(review.rating)}
                              size="sm"
                            >
                              {review.rating}/5
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <BuildingOfficeIcon className="h-4 w-4" />
                            <span>{review.company_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(review.created_at)}</span>
                          </div>
                        </div>

                        <h4 className="font-medium text-gray-900 mb-2">
                          {review.package_title}
                        </h4>

                        <p className="text-gray-700 line-clamp-2">
                          {review.comment}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReview(review)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteReview(review)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* View Review Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Review Details"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{selectedReview.user_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(selectedReview.rating)}
                <span className="ml-2 font-medium">
                  {selectedReview.rating}/5
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Package: {selectedReview.package_title}
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Company: {selectedReview.company_name}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Date: {formatDate(selectedReview.created_at)}
              </p>
            </div>

            <div className="border-t pt-4">
              <h5 className="font-medium text-gray-900 mb-2">
                Review Comment:
              </h5>
              <p className="text-gray-700 whitespace-pre-wrap">
                {selectedReview.comment}
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  setShowViewModal(false);
                  handleDeleteReview(selectedReview);
                }}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Review
              </Button>
              <Button onClick={() => setShowViewModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Review"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              Are you sure you want to delete this review? This action cannot be
              undone.
            </p>
          </div>

          {selectedReview && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium">{selectedReview.user_name}</span>
                <div className="flex items-center space-x-1">
                  {renderStars(selectedReview.rating)}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Package: {selectedReview.package_title}
              </p>
              <p className="text-sm text-gray-700 line-clamp-2">
                {selectedReview.comment}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={confirmDelete}
              loading={deleteReviewMutation.isPending}
            >
              Delete Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminReviews;
