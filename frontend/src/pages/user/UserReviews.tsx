import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StarIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import { MapPinIcon, FunnelIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { reviewService } from "../../services/reviews";
import type { ReviewFilters } from "../../services/reviews";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/ui/Modal";
import { getErrorMessage } from "../../utils/errorHandler";

const UserReviews: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ReviewFilters>({
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-reviews", filters],
    queryFn: () => reviewService.getUserReviews(filters),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      toast.success("Review deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, "Failed to delete review");
      toast.error(errorMessage);
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: number; data: any }) =>
      reviewService.updateReview(reviewId, data),
    onSuccess: () => {
      toast.success("Review updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      setIsEditModalOpen(false);
      setEditingReview(null);
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, "Failed to update review");
      toast.error(errorMessage);
    },
  });

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDelete = (reviewId: number, packageTitle: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete your review for "${packageTitle}"?`,
      )
    ) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const handleEdit = (review: any) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    updateReviewMutation.mutate({
      reviewId: editingReview.id,
      data: {
        rating: editRating,
        comment: editComment.trim() || undefined,
      },
    });
  };

  const handleFilterChange = (key: keyof ReviewFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
    });
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
          Failed to load reviews
        </p>
        <Button onClick={() => navigate(0)}>Try Again</Button>
      </div>
    );
  }

  const reviews = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold font-display mb-2">My Reviews</h1>
            <p className="text-yellow-100 text-lg">
              Your feedback and ratings for tour packages ⭐
            </p>
            {pagination && (
              <p className="text-yellow-100 text-sm mt-2">
                {pagination.total} total review
                {pagination.total !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Link to="/user/bookings">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 shadow-lg hover:shadow-xl"
              >
                View Bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                className="block w-full rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 px-4 py-3 text-sm"
                value={filters.rating || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "rating",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                className="block w-full rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 px-4 py-3 text-sm"
                value={filters.sort_by || "created_at"}
                onChange={(e) => handleFilterChange("sort_by", e.target.value)}
              >
                <option value="created_at">Date (Newest)</option>
                <option value="rating">Rating (Highest)</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="You haven't written any reviews yet. Complete a booking to leave a review!"
          action={{
            label: "View My Bookings",
            onClick: () => navigate("/user/bookings"),
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((review: any) => (
              <div
                key={review.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      {/* Package Info */}
                      <div className="mb-4">
                        <Link
                          to={`/packages/${review.package_id}`}
                          className="text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {review.package_title}
                        </Link>
                        <div className="flex items-center text-gray-600 mt-2">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {review.package_location}
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-semibold text-gray-700">
                          {review.rating} out of 5
                        </span>
                      </div>

                      {/* Comment */}
                      {review.comment && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-3">
                          <p className="text-gray-700 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      )}

                      {/* Date */}
                      <div className="text-sm text-gray-500">
                        Reviewed on{" "}
                        {new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(review)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDelete(review.id, review.package_title)
                        }
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        loading={deleteReviewMutation.isPending}
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

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

      {/* Edit Review Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          if (!updateReviewMutation.isPending) {
            setIsEditModalOpen(false);
            setEditingReview(null);
          }
        }}
        title="Edit Review"
        size="md"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-6">
          {/* Package Title */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-gray-600 mb-1">Editing review for</p>
            <h3 className="text-lg font-bold text-gray-900">
              {editingReview?.package_title}
            </h3>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEditRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <StarIcon
                    className={`h-10 w-10 ${
                      star <= (hoveredRating || editRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {editRating > 0 && (
                <span className="ml-3 text-lg font-semibold text-gray-700">
                  {editRating} {editRating === 1 ? "star" : "stars"}
                </span>
              )}
            </div>
            {editRating > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                {editRating === 5 && "Excellent! 🌟"}
                {editRating === 4 && "Very Good! 👍"}
                {editRating === 3 && "Good 👌"}
                {editRating === 2 && "Fair 😐"}
                {editRating === 1 && "Poor 😞"}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label
              htmlFor="edit-comment"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Your Review (Optional)
            </label>
            <textarea
              id="edit-comment"
              rows={5}
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="Share your experience with this tour package..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Help others by sharing your experience
              </p>
              <p className="text-xs text-gray-500">
                {editComment.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingReview(null);
              }}
              disabled={updateReviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={updateReviewMutation.isPending}
              disabled={editRating === 0}
            >
              Update Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserReviews;
