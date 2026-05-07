import api from "./api";
import type { Review, ApiResponse, PaginatedResponse } from "../types";

export interface ReviewFormData {
  rating: number;
  comment?: string;
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  rating?: number;
  sort_by?: "created_at" | "rating";
  sort_order?: "asc" | "desc";
}

export const reviewService = {
  async getPackageReviews(
    packageId: number,
    filters: ReviewFilters = {},
  ): Promise<PaginatedResponse<Review>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(
      `/reviews/package/${packageId}?${params.toString()}`,
    );
    return response.data;
  },

  async createReview(
    packageId: number,
    bookingId: number,
    data: ReviewFormData,
  ): Promise<ApiResponse<Review>> {
    const response = await api.post("/reviews", {
      ...data,
      package_id: packageId,
      booking_id: bookingId,
    });
    return response.data;
  },

  async updateReview(
    reviewId: number,
    data: ReviewFormData,
  ): Promise<ApiResponse<Review>> {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  async deleteReview(reviewId: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  async getUserReviews(
    filters: ReviewFilters = {},
  ): Promise<PaginatedResponse<Review>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/reviews/my?${params.toString()}`);
    return response.data;
  },

  async getCompanyReviews(
    filters: ReviewFilters = {},
  ): Promise<PaginatedResponse<Review> & { stats: any }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/reviews/company/my?${params.toString()}`);
    return response.data;
  },
};
