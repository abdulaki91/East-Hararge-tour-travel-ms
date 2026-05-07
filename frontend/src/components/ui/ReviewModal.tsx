import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Modal from "./Modal";
import Button from "./Button";
import { reviewService } from "../../services/reviews";
import { getErrorMessage } from "../../utils/errorHandler";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: number;
  bookingId: number;
  packageTitle: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  packageId,
  bookingId,
  packageTitle,
}) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const createReviewMutation = useMutation({
    mutationFn: () =>
      reviewService.createReview(packageId, bookingId, {
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["package-reviews", packageId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["package", packageId.toString()],
      });
      onClose();
      // Reset form
      setRating(0);
      setComment("");
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, "Failed to submit review");
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    createReviewMutation.mutate();
  };

  const handleClose = () => {
    if (!createReviewMutation.isPending) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Write a Review"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Package Title */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-gray-600 mb-1">Reviewing</p>
          <h3 className="text-lg font-bold text-gray-900">{packageTitle}</h3>
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
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                {star <= (hoveredRating || rating) ? (
                  <StarIcon className="h-10 w-10 text-yellow-400" />
                ) : (
                  <StarOutlineIcon className="h-10 w-10 text-gray-300" />
                )}
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-3 text-lg font-semibold text-gray-700">
                {rating} {rating === 1 ? "star" : "stars"}
              </span>
            )}
          </div>
          {rating > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              {rating === 5 && "Excellent! 🌟"}
              {rating === 4 && "Very Good! 👍"}
              {rating === 3 && "Good 👌"}
              {rating === 2 && "Fair 😐"}
              {rating === 1 && "Poor 😞"}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Your Review (Optional)
          </label>
          <textarea
            id="comment"
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this tour package..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Help others by sharing your experience
            </p>
            <p className="text-xs text-gray-500">
              {comment.length}/1000 characters
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createReviewMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={createReviewMutation.isPending}
            disabled={rating === 0}
          >
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;
