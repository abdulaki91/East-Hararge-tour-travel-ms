import api from "./api";

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  fees?: number;
  total_amount?: number;
  payment_method: string;
  transaction_reference: string;
  gateway_transaction_id?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  payment_date?: string;
  created_at: string;
  updated_at: string;
  booking_reference?: string;
  package_title?: string;
  package_location?: string;
  payment_url?: string;
  gateway_response?: any;
}

export interface CreatePaymentData {
  amount: number;
  payment_method: "demo" | "telebirr" | "chapa" | "bank_transfer";
  user_phone?: string;
  return_url?: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: "pending" | "completed" | "failed" | "refunded";
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

export const paymentService = {
  async createPayment(
    bookingId: number,
    data: CreatePaymentData,
  ): Promise<{ success: boolean; data: Payment }> {
    const response = await api.post(`/payments/booking/${bookingId}`, data);
    return response.data;
  },

  async processPayment(
    id: number,
    success: boolean = true,
  ): Promise<{ success: boolean; data: Payment }> {
    const response = await api.post(`/payments/${id}/process`, { success });
    return response.data;
  },

  async verifyPayment(
    id: number,
  ): Promise<{ success: boolean; data: Payment }> {
    const response = await api.get(`/payments/${id}/verify`);
    return response.data;
  },

  async completeDemoPayment(
    id: number,
  ): Promise<{ success: boolean; data: Payment }> {
    const response = await api.post(`/payments/${id}/complete-demo`);
    return response.data;
  },

  async processRefund(
    id: number,
    data: RefundData,
  ): Promise<{ success: boolean; data: any }> {
    const response = await api.post(`/payments/${id}/refund`, data);
    return response.data;
  },

  async getPaymentById(
    id: number,
  ): Promise<{ success: boolean; data: Payment }> {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  async getMyPayments(filters?: PaymentFilters): Promise<PaymentsResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/payments/my?${params.toString()}`);
    return response.data;
  },

  async getBookingPayments(
    bookingId: number,
  ): Promise<{ success: boolean; data: Payment[] }> {
    const response = await api.get(`/payments/booking/${bookingId}`);
    return response.data;
  },

  // Utility functions
  getPaymentMethodName(method: string): string {
    const methods: Record<string, string> = {
      demo: "Demo Payment",
      telebirr: "Telebirr",
      chapa: "Chapa",
      bank_transfer: "Bank Transfer",
      credit_card: "Credit Card",
      debit_card: "Debit Card",
      mobile_money: "Mobile Money",
    };
    return methods[method] || method;
  },

  getStatusColor(status: string): "success" | "warning" | "error" | "gray" {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "refunded":
        return "gray";
      default:
        return "gray";
    }
  },

  formatAmount(amount: number, currency: string = "ETB"): string {
    return `${amount.toLocaleString()} ${currency}`;
  },

  calculateFees(method: string, amount: number): number {
    switch (method) {
      case "demo":
        return 0; // No fees for demo
      case "telebirr":
        return Math.min(Math.max(amount * 0.015 + 5, 5), 100);
      case "chapa":
        return Math.min(Math.max(amount * 0.025, 2), 200);
      case "bank_transfer":
        return 10;
      default:
        return 0;
    }
  },
};

// Keep the old export for backward compatibility
export const paymentsService = paymentService;
