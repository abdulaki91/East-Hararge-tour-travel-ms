import Chapa from "chapa";
import crypto from "crypto";

class ChapaService {
  constructor() {
    this.chapa = new Chapa(
      process.env.CHAPA_SECRET_KEY || "CHASECK_TEST-xxxxxxxxxxxx",
    );
  }

  /**
   * Initialize a payment with Chapa
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} - Chapa initialization response
   */
  async initializePayment(paymentData) {
    const {
      amount,
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      callback_url,
      return_url,
      customization,
    } = paymentData;

    try {
      const response = await this.chapa.initialize({
        amount: amount,
        currency: "ETB",
        email: email,
        first_name: first_name,
        last_name: last_name || "",
        phone_number: phone_number || "",
        tx_ref: tx_ref,
        callback_url: callback_url,
        return_url: return_url,
        customization: customization || {
          title: "East Hararghe Tours Payment",
          description: "Tour package booking payment",
        },
      });

      return {
        success: true,
        data: response,
        checkout_url: response.data.checkout_url,
      };
    } catch (error) {
      console.error("Chapa initialization error:", error);
      throw new Error(error.message || "Failed to initialize payment");
    }
  }

  /**
   * Verify a payment transaction
   * @param {string} tx_ref - Transaction reference
   * @returns {Promise<Object>} - Verification result
   */
  async verifyPayment(tx_ref) {
    try {
      const response = await this.chapa.verify(tx_ref);

      return {
        success: true,
        status: response.status,
        data: response,
      };
    } catch (error) {
      console.error("Chapa verification error:", error);
      throw new Error(error.message || "Failed to verify payment");
    }
  }

  /**
   * Generate a unique transaction reference
   * @param {string} prefix - Prefix for the reference
   * @returns {string} - Unique transaction reference
   */
  generateTxRef(prefix = "TX") {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Verify webhook signature (for security)
   * @param {string} signature - Webhook signature from Chapa
   * @param {Object} payload - Webhook payload
   * @returns {boolean} - Whether signature is valid
   */
  verifyWebhookSignature(signature, payload) {
    const secret = process.env.CHAPA_WEBHOOK_SECRET || "";
    const hash = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    return hash === signature;
  }

  /**
   * Get payment status text
   * @param {string} status - Chapa status
   * @returns {string} - Readable status
   */
  getPaymentStatus(status) {
    const statusMap = {
      success: "completed",
      failed: "failed",
      pending: "pending",
      cancelled: "failed",
    };

    return statusMap[status] || "pending";
  }
}

export default new ChapaService();
