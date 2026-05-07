export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role_name: string;
  company_name?: string;
  company_description?: string;
  company_address?: string;
  company_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateCompanyProfileData {
  company_name?: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
}

export interface UserStats {
  bookings: {
    total_bookings: number;
    confirmed_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    total_spent: number;
  };
  reviews: {
    total_reviews: number;
    average_rating: number;
  };
  recent_bookings: Array<{
    id: number;
    booking_reference: string;
    status: string;
    total_amount: number;
    booking_date: string;
    package_title: string;
    location: string;
  }>;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  booking_updates: boolean;
  payment_updates: boolean;
  promotional_offers: boolean;
}

export interface DeleteAccountData {
  password: string;
}
