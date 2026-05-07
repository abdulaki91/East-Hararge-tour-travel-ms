// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Common Types
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// Package Types
export interface Package extends BaseEntity {
  company_id: number;
  title: string;
  description: string;
  location: string;
  duration_days: number;
  price: number;
  max_people: number;
  available_slots: number;
  start_date: string;
  end_date: string;
  includes?: string;
  excludes?: string;
  itinerary?: ItineraryItem[];
  images?: string[];
  is_active: boolean;
  company_name: string;
  company_logo?: string;
  average_rating: number;
  review_count: number;
  reviews?: Review[];
}

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  activities?: string[];
}

// Booking Types (using the detailed booking type from booking.ts)
export interface Booking extends BaseEntity {
  user_id: number;
  package_id: number;
  booking_reference: string;
  booking_date: string;
  number_of_people: number;
  total_amount: number;
  status: BookingStatus;
  special_requests?: string;
  payment_status?: PaymentStatus;
  // Flat fields from backend JOIN
  package_title: string;
  package_location: string;
  duration_days: number;
  company_name: string;
  // Payment information for verification
  payment_id?: number;
  payment_method?: string;
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

// Review Types
export interface Review extends BaseEntity {
  user_id: number;
  package_id: number;
  booking_id: number;
  rating: number;
  comment?: string;
  user_name: string;
  user_avatar?: string;
}

// User Types
export interface User extends BaseEntity {
  email: string;
  name: string;
  phone?: string;
  profile_image?: string;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
}

// Auth User type (for authentication context - doesn't require BaseEntity fields)
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  phone?: string;
  profile_image?: string;
  role: UserRole;
  role_name: UserRole; // Backend sends role_name
  is_active: boolean;
  email_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = "USER" | "COMPANY" | "ADMIN";

// Company Types
export interface Company extends BaseEntity {
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
  status: CompanyStatus;
}

export type CompanyStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface PackageFormData {
  title: string;
  description: string;
  location: string;
  duration_days: number;
  price: number;
  max_people: number;
  available_slots: number;
  start_date: string;
  end_date: string;
  includes?: string;
  excludes?: string;
  itinerary: ItineraryItem[];
  images?: File[];
}

export interface BookingFormData {
  booking_date: string;
  number_of_people: number;
  special_requests?: string;
}

export interface PaymentFormData {
  payment_method: "CARD" | "PAYPAL" | "BANK_TRANSFER";
  card_number?: string;
  card_expiry?: string;
  card_cvv?: string;
  card_name?: string;
}

// Pagination Types
export interface PaginationInfo {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Filter Types
export interface PackageFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  min_duration?: number;
  max_duration?: number;
  start_date?: string;
  end_date?: string;
  sort_by?: "price" | "rating" | "duration" | "created_at";
  sort_order?: "asc" | "desc";
}

export interface BookingFilters {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  sort_by?: "created_at" | "booking_date" | "total_amount";
  sort_order?: "asc" | "desc";
  start_date?: string;
  end_date?: string;
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Notification Types
export interface Notification extends BaseEntity {
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  data?: Record<string, any>;
}

export type NotificationType =
  | "BOOKING"
  | "PAYMENT"
  | "REVIEW"
  | "SYSTEM"
  | "PROMOTION";

// Re-export all types
export * from "./user";
export * from "./booking";
export * from "./payment";
