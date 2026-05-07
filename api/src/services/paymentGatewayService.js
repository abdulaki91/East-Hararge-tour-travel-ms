import axios from "axios";
import crypto from "crypto";
import chapaService from "./chapaService.js";

export class PaymentGatewayService {
  // Telebirr Payment Integration
  static async initiateTelebirrPayment(paymentData) {
    const { amount, booking_reference, user_phone, return_url } = paymentData;

    try {
      // Mock Telebirr API integration
      // In production, replace with actual Telebirr API endpoints
      const telebirrPayload = {
        amount: amount,
        currency: "ETB",
        reference: booking_reference,
        phone: user_phone,
        return_url: return_url,
        callback_url: `${process.env.API_BASE_URL}/api/payments/telebirr/callback`,
        merchant_id: process.env.TELEBIRR_MERCHANT_ID,
        timestamp: Date.now(),
      };

      // Generate signature for security
      const signature = this.generateTelebirrSignature(telebirrPayload);
      telebirrPayload.signature = signature;

      // For now, return mock response
      // const response = await axios.post(process.env.TELEBIRR_API_URL, telebirrPayload);

      // Mock successful response
      return {
        success: true,
        payment_url: `https://mock-telebirr.com/pay?ref=${booking_reference}`,
        transaction_id: `TB_${Date.now()}`,
        status: "pending",
        instructions: {
          account_name: "East Hararghe Tour & Travel (Official)",
          account_number: "+251 91 123 4567",
          amount: amount,
          reference: booking_reference,
        },
      };
    } catch (error) {
      console.error("Telebirr payment initiation failed:", error);
      throw new Error("Failed to initiate Telebirr payment");
    }
  }

  // Chapa Payment Integration
  static async initiateChapaPayment(paymentData) {
    const {
      amount,
      booking_reference,
      user_email,
      user_phone,
      return_url,
      user_name,
    } = paymentData;

    try {
      const tx_ref = chapaService.generateTxRef("TOUR");
      const callback_url = `${process.env.API_BASE_URL || "http://localhost:5003"}/api/payments/chapa/callback`;
      const final_return_url =
        return_url ||
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/user/bookings`;

      // Split name into first and last
      const nameParts = (user_name || "Customer").split(" ");
      const first_name = nameParts[0] || "Customer";
      const last_name = nameParts.slice(1).join(" ") || "";

      // Format phone number for Chapa (optional - Chapa will ask on their page)
      // Use a default valid number if not provided
      const formatted_phone = user_phone
        ? this.formatPhoneNumberForChapa(user_phone)
        : "+251911000000"; // Default test number

      const chapaPayload = {
        amount: amount,
        email: user_email,
        first_name: first_name,
        last_name: last_name,
        phone_number: formatted_phone,
        tx_ref: tx_ref,
        callback_url: callback_url,
        return_url: final_return_url,
        customization: {
          title: "East Hararghe Tours",
          description: `Payment for booking ${booking_reference}`,
        },
      };

      console.log(
        "📞 Phone for Chapa:",
        formatted_phone,
        "(Chapa will collect phone on their page)",
      );

      const response = await chapaService.initializePayment(chapaPayload);

      return {
        success: true,
        payment_url: response.checkout_url,
        transaction_id: tx_ref,
        status: "pending",
        chapa_reference: response.data?.reference,
      };
    } catch (error) {
      console.error("Chapa payment initiation failed:", error);
      throw new Error(error.message || "Failed to initiate Chapa payment");
    }
  }

  // Bank Transfer Instructions
  static generateBankTransferInstructions(paymentData) {
    const { amount, booking_reference } = paymentData;

    return {
      success: true,
      transaction_id: `BT_${Date.now()}`,
      instructions: {
        bank_name: "Commercial Bank of Ethiopia",
        account_number: "1000123456789",
        account_name: "East Hararghe Tour & Travel",
        amount: amount,
        reference: booking_reference,
        swift_code: "CBETETAA",
        branch: "Harar Branch",
        note: `Please include booking reference ${booking_reference} in the transfer description`,
      },
      status: "pending_bank_transfer",
    };
  }

  // Verify Telebirr Payment - Always succeeds for demo purposes
  static async verifyTelebirrPayment(transactionId) {
    try {
      // Simulate a small delay for realism
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Always return success for demo purposes
      return {
        success: true,
        status: "completed",
        transaction_id: transactionId,
        amount: null, // Will use stored payment amount
        verified_at: new Date().toISOString(),
        verification_note: "Auto-verified for demo purposes",
      };
    } catch (error) {
      console.error("Telebirr verification failed:", error);
      // Even if there's an error, return success for demo
      return {
        success: true,
        status: "completed",
        transaction_id: transactionId,
        amount: null,
        verified_at: new Date().toISOString(),
        verification_note: "Auto-verified (fallback)",
      };
    }
  }

  // Verify Chapa Payment
  static async verifyChapaPayment(transactionId) {
    try {
      console.log("🔄 Verifying Chapa payment, tx_ref:", transactionId);
      const response = await chapaService.verifyPayment(transactionId);
      console.log(
        "📊 Chapa verification response:",
        JSON.stringify(response, null, 2),
      );

      if (response.success && response.status === "success") {
        console.log("✅ Chapa payment verified successfully");
        return {
          success: true,
          status: "completed",
          transaction_id: transactionId,
          amount: response.data.amount,
          verified_at: new Date().toISOString(),
          chapa_data: response.data,
        };
      } else {
        console.log("❌ Chapa payment verification failed:", response.status);
        return {
          success: false,
          status: "failed",
          transaction_id: transactionId,
          error: "Payment verification failed",
        };
      }
    } catch (error) {
      console.error("❌ Chapa verification error:", error);
      return {
        success: false,
        status: "failed",
        transaction_id: transactionId,
        error: error.message,
      };
    }
  }

  // Process Refund
  static async processRefund(paymentData) {
    const { transaction_id, amount, reason, payment_method } = paymentData;

    try {
      let refundResult;

      switch (payment_method) {
        case "telebirr":
          refundResult = await this.processTelebirrRefund(
            transaction_id,
            amount,
            reason,
          );
          break;
        case "chapa":
          refundResult = await this.processChapaRefund(
            transaction_id,
            amount,
            reason,
          );
          break;
        case "demo":
          refundResult = await this.processDemoRefund(
            transaction_id,
            amount,
            reason,
          );
          break;
        case "bank_transfer":
          refundResult = await this.processBankRefund(
            transaction_id,
            amount,
            reason,
          );
          break;
        default:
          throw new Error("Unsupported payment method for refund");
      }

      return refundResult;
    } catch (error) {
      console.error("Refund processing failed:", error);
      throw new Error("Failed to process refund");
    }
  }

  static async processTelebirrRefund(transactionId, amount, reason) {
    // Mock Telebirr refund
    return {
      success: true,
      refund_id: `TB_REF_${Date.now()}`,
      status: "refund_pending",
      amount: amount,
      estimated_completion: "3-5 business days",
    };
  }

  static async processChapaRefund(transactionId, amount, reason) {
    // Chapa doesn't have an automated refund API
    // Refunds must be processed manually through Chapa dashboard
    // This creates a refund request that the company must process manually
    return {
      success: true,
      refund_id: `CH_REF_${Date.now()}`,
      status: "refund_requested",
      amount: amount,
      estimated_completion: "Manual processing required",
      note: "Please process this refund through your Chapa dashboard at https://dashboard.chapa.co",
      instructions: [
        "1. Login to your Chapa dashboard",
        "2. Navigate to Transactions",
        "3. Find transaction: " + transactionId,
        "4. Click 'Refund' and enter amount: " + amount + " ETB",
        "5. Confirm the refund",
      ],
    };
  }

  static async processBankRefund(transactionId, amount, reason) {
    // Mock bank refund
    return {
      success: true,
      refund_id: `BK_REF_${Date.now()}`,
      status: "refund_pending",
      amount: amount,
      estimated_completion: "5-7 business days",
      note: "Refund will be processed to the original bank account",
    };
  }

  // Generate signature for Telebirr
  static generateTelebirrSignature(payload) {
    const secretKey = process.env.TELEBIRR_SECRET_KEY || "mock_secret_key";
    const sortedKeys = Object.keys(payload).sort();
    const signatureString = sortedKeys
      .map((key) => `${key}=${payload[key]}`)
      .join("&");

    return crypto
      .createHmac("sha256", secretKey)
      .update(signatureString)
      .digest("hex");
  }

  // Webhook signature verification
  static verifyWebhookSignature(payload, signature, secret) {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex"),
    );
  }

  // Get payment method fees
  static getPaymentFees(method, amount) {
    const fees = {
      demo: {
        fixed: 0, // No fees for demo
        percentage: 0,
        min: 0,
        max: 0,
      },
      telebirr: {
        fixed: 5, // 5 ETB fixed fee
        percentage: 0.015, // 1.5%
        min: 5,
        max: 100,
      },
      chapa: {
        fixed: 0,
        percentage: 0.025, // 2.5%
        min: 2,
        max: 200,
      },
      bank_transfer: {
        fixed: 10, // 10 ETB bank fee
        percentage: 0,
        min: 10,
        max: 10,
      },
    };

    const feeConfig = fees[method];
    if (!feeConfig) return 0;

    const percentageFee = amount * feeConfig.percentage;
    const totalFee = feeConfig.fixed + percentageFee;

    return Math.min(Math.max(totalFee, feeConfig.min), feeConfig.max);
  }

  // Demo Payment Integration - Simple and instant
  static async initiateDemoPayment(paymentData) {
    const { amount, booking_reference } = paymentData;

    try {
      // Generate a simple demo transaction ID
      const transactionId = `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        payment_url: null, // No external URL needed
        transaction_id: transactionId,
        status: "pending",
        demo_instructions: {
          message:
            "This is a demo payment. Click 'Complete Payment' to simulate successful payment.",
          amount: amount,
          reference: booking_reference,
          transaction_id: transactionId,
        },
      };
    } catch (error) {
      console.error("Demo payment initiation failed:", error);
      throw new Error("Failed to initiate demo payment");
    }
  }

  // Verify Demo Payment - Always succeeds for demo purposes
  static async verifyDemoPayment(transactionId) {
    try {
      // Simulate a small delay for realism
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Demo payments always succeed
      return {
        success: true,
        status: "completed",
        transaction_id: transactionId,
        amount: null, // Will use stored payment amount
        verified_at: new Date().toISOString(),
        demo_note: "Demo payment completed successfully",
      };
    } catch (error) {
      console.error("Demo verification failed:", error);
      return {
        success: false,
        status: "failed",
        error: error.message,
      };
    }
  }

  // Process Demo Refund
  static async processDemoRefund(transactionId, amount, reason) {
    // Demo refund - always succeeds instantly
    return {
      success: true,
      refund_id: `DEMO_REF_${Date.now()}`,
      status: "refund_completed",
      amount: amount,
      estimated_completion: "Instant (Demo)",
      note: "Demo refund processed instantly",
    };
  }

  // Currency conversion (if needed)
  static async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    // Mock conversion rates
    const rates = {
      USD_ETB: 55.0,
      EUR_ETB: 60.0,
      ETB_USD: 0.018,
      ETB_EUR: 0.017,
    };

    const rateKey = `${fromCurrency}_${toCurrency}`;
    const rate = rates[rateKey];

    if (!rate) {
      throw new Error(
        `Conversion rate not available for ${fromCurrency} to ${toCurrency}`,
      );
    }

    return Math.round(amount * rate * 100) / 100;
  }

  // Format phone number for Chapa (requires international format)
  static formatPhoneNumberForChapa(phone) {
    if (!phone) {
      return "+251911000000"; // Default test number
    }

    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, "");

    // If already starts with 251, add +
    if (cleaned.startsWith("251")) {
      const number = "+" + cleaned;
      // Validate length: +251 (3) + 9 digits = 12 total
      if (number.length === 13) {
        return number;
      }
      console.warn(`⚠️ Invalid phone length after 251 prefix: ${number}`);
      return "+251911000000"; // Fallback
    }

    // If starts with 0, replace with +251
    if (cleaned.startsWith("0")) {
      const withoutZero = cleaned.substring(1);
      // Should have 9 digits after removing 0
      if (withoutZero.length === 9) {
        return "+251" + withoutZero;
      }
      console.warn(`⚠️ Invalid phone length after removing 0: ${withoutZero}`);
      return "+251911000000"; // Fallback
    }

    // If starts with 9 and has exactly 9 digits
    if (cleaned.startsWith("9") && cleaned.length === 9) {
      return "+251" + cleaned;
    }

    // If it's exactly 9 digits
    if (cleaned.length === 9) {
      return "+251" + cleaned;
    }

    // If it's 10 digits starting with 0
    if (cleaned.length === 10 && cleaned.startsWith("0")) {
      return "+251" + cleaned.substring(1);
    }

    // Invalid format - log warning and use fallback
    console.warn(
      `⚠️ Invalid phone number format: ${phone} (cleaned: ${cleaned})`,
    );
    console.warn(
      `⚠️ Phone must be 9 digits (e.g., 911234567) or 10 digits starting with 0 (e.g., 0911234567)`,
    );
    return "+251911000000"; // Fallback test number
  }
}
