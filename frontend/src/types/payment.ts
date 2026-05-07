export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  fees?: number;
  total_amount?: number;
  payment_method: PaymentMethod;
  transaction_reference: string;
  gateway_transaction_id?: string;
  status: PaymentStatus;
  payment_date?: string;
  created_at: string;
  updated_at: string;
  booking_reference?: string;
  package_title?: string;
  package_location?: string;
  payment_url?: string;
  gateway_response?: any;
}

export type PaymentMethod = "telebirr" | "chapa" | "bank_transfer";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface CreatePaymentData {
  amount: number;
  payment_method: PaymentMethod;
  user_phone?: string;
  return_url?: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  sort_by?: "created_at" | "amount" | "payment_date";
  sort_order?: "asc" | "desc";
}

export interface PaymentsResponse {
  success: boolean;
  data: {
    payments: Payment[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  };
}

export interface RefundData {
  amount: number;
  reason: string;
}
