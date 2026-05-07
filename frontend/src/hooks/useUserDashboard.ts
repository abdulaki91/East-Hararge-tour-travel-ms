import { useQuery } from "@tanstack/react-query";
import { bookingService } from "../services/bookings";
import { userService } from "../services/users";
import type { UserStats } from "../types/user";

export const useUserDashboard = () => {
  const bookingsQuery = useQuery({
    queryKey: ["user-bookings"],
    queryFn: () => bookingService.getUserBookings({ limit: 5 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const statsQuery = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => userService.getUserStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const recentBookings = bookingsQuery.data?.data.items || [];
  const stats: UserStats = statsQuery.data || {
    bookings: {
      total_bookings: 0,
      confirmed_bookings: 0,
      completed_bookings: 0,
      cancelled_bookings: 0,
      total_spent: 0,
    },
    reviews: {
      total_reviews: 0,
      average_rating: 0,
    },
    recent_bookings: [],
  };

  return {
    // Data
    recentBookings,
    stats,

    // Loading states
    isBookingsLoading: bookingsQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    isLoading: bookingsQuery.isLoading || statsQuery.isLoading,

    // Error states
    bookingsError: bookingsQuery.error,
    statsError: statsQuery.error,
    hasError: bookingsQuery.isError || statsQuery.isError,

    // Refetch functions
    refetchBookings: bookingsQuery.refetch,
    refetchStats: statsQuery.refetch,
    refetchAll: () => {
      bookingsQuery.refetch();
      statsQuery.refetch();
    },
  };
};
