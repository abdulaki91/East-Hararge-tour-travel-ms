import api from "./api";
import type { ApiResponse, PaginatedResponse } from "../types";

export interface ReceiptQRData {
  qr_code: string; // Base64 data URL
  qr_token: string;
  receipt_data: {
    booking_id: number;
    payment_id: number;
    booking_reference: string;
    transaction_reference: string;
    customer_name: string;
    customer_email: string;
    package_title: string;
    package_location: string;
    company_name: string;
    amount: number;
    booking_date: string;
    payment_date: string;
    number_of_people: number;
    issued_at: string;
    expires_at: string;
  };
  expires_at: string;
}

export interface VerificationResult {
  verification_status: "VALID" | "INVALID";
  booking_reference: string;
  transaction_reference: string;
  customer_name: string;
  package_title: string;
  package_location: string;
  company_name: string;
  amount: number;
  booking_date: string;
  payment_date: string;
  number_of_people: number;
  verified_by: string;
  verified_at: string;
  is_already_verified: boolean;
  last_verification?: {
    verified_at: string;
    verified_by_id: number;
  };
}

export interface VerificationHistory {
  id: number;
  booking_id: number;
  payment_id: number;
  action_type: "qr_generated" | "verified" | "verification_failed";
  performed_by: number;
  performed_by_name: string;
  performed_by_email: string;
  performed_by_role: string;
  details: any;
  created_at: string;
}

export const receiptService = {
  // Generate QR code for a booking receipt (USER only)
  async generateReceiptQR(
    bookingId: number,
  ): Promise<ApiResponse<ReceiptQRData>> {
    const response = await api.post(`/receipts/${bookingId}/qr`);
    return response.data;
  },

  // Verify QR code (COMPANY and ADMIN only)
  async verifyReceiptQR(
    qrToken: string,
  ): Promise<ApiResponse<VerificationResult>> {
    const response = await api.post("/receipts/verify", { qrToken });
    return response.data;
  },

  // Get verification history for a booking (ADMIN only)
  async getVerificationHistory(
    bookingId: number,
    filters: { page?: number; limit?: number } = {},
  ): Promise<PaginatedResponse<VerificationHistory>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(
      `/receipts/${bookingId}/verifications?${params.toString()}`,
    );
    return response.data;
  },
};
