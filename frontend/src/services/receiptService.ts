import jsPDF from "jspdf";
import { receiptService } from "./receipt";

export interface ReceiptData {
  booking_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  package_title: string;
  package_location: string;
  booking_date: string;
  number_of_people: number;
  total_amount: number;
  payment_method: string;
  payment_date: string;
  company_name: string;
  transaction_reference?: string;
  booking_id?: number; // Add booking_id for QR token generation
}

export class ReceiptService {
  static async generateReceipt(receiptData: ReceiptData): Promise<void> {
    // Create mobile-first PDF (A4 portrait)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // Mobile-friendly margins
    const contentWidth = pageWidth - margin * 2;

    // Modern color palette (RGB values)
    const colors = {
      primary: [37, 99, 235] as [number, number, number], // Blue
      accent: [139, 92, 246] as [number, number, number], // Purple
      success: [16, 185, 129] as [number, number, number], // Green
      dark: [31, 41, 55] as [number, number, number], // Dark gray
      light: [243, 244, 246] as [number, number, number], // Light gray
      text: [107, 114, 128] as [number, number, number], // Text gray
      white: [255, 255, 255] as [number, number, number],
    };

    try {
      let yPos = margin;

      // ===== HEADER SECTION =====
      // Header background with gradient effect
      pdf.setFillColor(...colors.primary);
      pdf.rect(0, 0, pageWidth, 45, "F");

      // Company logo circle
      pdf.setFillColor(...colors.white);
      pdf.circle(20, 22, 8, "F");
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("EHT", 20, 25, { align: "center" });

      // Company name and tagline
      pdf.setTextColor(...colors.white);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("EAST HARARGHE TOURS", 35, 20);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Your Gateway to Ethiopian Adventures", 35, 28);

      // Accent stripe
      pdf.setFillColor(255, 215, 0); // Gold
      pdf.rect(0, 45, pageWidth, 1.5, "F");
      pdf.setFillColor(...colors.accent);
      pdf.rect(0, 46.5, pageWidth, 1.5, "F");

      yPos = 55;

      // ===== RECEIPT TITLE =====
      pdf.setFillColor(...colors.white);
      pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, "F");
      pdf.setDrawColor(...colors.primary);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, "S");

      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("PAYMENT RECEIPT", pageWidth / 2, yPos + 10, {
        align: "center",
      });

      // Date and status
      const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colors.text);
      pdf.text(`Issued: ${currentDate}`, margin + 5, yPos + 18);

      // PAID status badge
      pdf.setFillColor(...colors.success);
      pdf.roundedRect(pageWidth - 35, yPos + 5, 25, 12, 2, 2, "F");
      pdf.setTextColor(...colors.white);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("PAID", pageWidth - 22.5, yPos + 12, { align: "center" });

      yPos += 35;

      // ===== BOOKING REFERENCE =====
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(margin, yPos, contentWidth, 20, 2, 2, "F");
      pdf.setDrawColor(...colors.primary);
      pdf.setLineWidth(1);
      pdf.roundedRect(margin, yPos, contentWidth, 20, 2, 2, "S");

      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("BOOKING REFERENCE:", margin + 5, yPos + 8);

      pdf.setFontSize(14);
      pdf.text(receiptData.booking_reference, margin + 5, yPos + 15);

      yPos += 30;

      // ===== CUSTOMER DETAILS SECTION =====
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Customer Details", margin, yPos);

      yPos += 8;

      // Customer card
      pdf.setFillColor(...colors.white);
      pdf.roundedRect(margin, yPos, contentWidth, 45, 2, 2, "F");
      pdf.setDrawColor(...colors.light);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin, yPos, contentWidth, 45, 2, 2, "S");

      yPos += 8;

      // Customer info
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("Name:", margin + 5, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colors.dark);
      pdf.text(receiptData.customer_name, margin + 20, yPos);

      yPos += 8;
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      pdf.text("Email:", margin + 5, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colors.dark);
      pdf.setFontSize(8);
      pdf.text(receiptData.customer_email, margin + 20, yPos);

      if (receiptData.customer_phone) {
        yPos += 8;
        pdf.setFontSize(9);
        pdf.setTextColor(...colors.text);
        pdf.setFont("helvetica", "bold");
        pdf.text("Phone:", margin + 5, yPos);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...colors.dark);
        pdf.text(receiptData.customer_phone, margin + 20, yPos);
      }

      yPos += 20;

      // ===== QR CODE SECTION =====
      pdf.setTextColor(...colors.accent);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Verification QR Code", margin, yPos);

      yPos += 8;

      let qrCodeDataURL: string;
      let qrToken: string | null = null;

      try {
        // Generate JWT token from backend (same as ReceiptQR component)
        if (receiptData.booking_id) {
          console.log(
            "🔍 Attempting to generate QR token for booking:",
            receiptData.booking_id,
          );
          const qrResponse = await receiptService.generateReceiptQR(
            receiptData.booking_id,
          );
          console.log("🔍 QR generation response:", qrResponse);

          if (qrResponse.success) {
            // Use the same QR code image from backend (JWT-based)
            qrCodeDataURL = qrResponse.data.qr_code;
            qrToken = qrResponse.data.qr_token;
            console.log("✅ Successfully generated JWT-based QR code for PDF");
          } else {
            console.error("❌ QR generation failed:", qrResponse.message);
            throw new Error(
              `Backend QR generation failed: ${qrResponse.message}`,
            );
          }
        } else {
          throw new Error("No booking ID provided for QR generation");
        }
      } catch (error) {
        console.error(
          "❌ Failed to generate JWT-based QR code for PDF:",
          error,
        );
        console.error(
          "❌ Error details:",
          error.response?.data || error.message,
        );

        // Don't use fallback - throw error to inform user
        throw new Error(
          `Unable to generate receipt with QR code: ${error.response?.data?.message || error.message}. Please try again or contact support if the issue persists.`,
        );
      }

      // QR code container
      const qrSize = 60; // Increased size for better scanning
      const qrX = (pageWidth - qrSize) / 2;

      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(qrX - 5, yPos, qrSize + 10, qrSize + 20, 2, 2, "F");
      pdf.setDrawColor(...colors.accent);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(qrX - 5, yPos, qrSize + 10, qrSize + 20, 2, 2, "S");

      // Add QR code
      pdf.addImage(qrCodeDataURL, "PNG", qrX, yPos + 5, qrSize, qrSize);

      // QR instructions with better formatting
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colors.accent);
      pdf.text("Scan to Verify Receipt", pageWidth / 2, yPos + qrSize + 12, {
        align: "center",
      });

      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colors.text);
      pdf.text(
        "Hold camera steady, ensure good lighting",
        pageWidth / 2,
        yPos + qrSize + 17,
        {
          align: "center",
        },
      );

      yPos += qrSize + 30;

      // ===== MANUAL VERIFICATION TOKEN =====
      if (qrToken) {
        pdf.setTextColor(...colors.primary);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Manual Verification Token", margin, yPos);

        yPos += 8;

        // Token container
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "F");
        pdf.setDrawColor(...colors.primary);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "S");

        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...colors.text);
        pdf.text(
          "Companies can use this token to verify your receipt manually:",
          margin + 5,
          yPos + 6,
        );

        // Token text (split into multiple lines if too long)
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...colors.dark);

        // Split token into manageable chunks for display
        const tokenChunks = qrToken.match(/.{1,60}/g) || [qrToken];
        let tokenY = yPos + 12;

        tokenChunks.forEach((chunk, index) => {
          if (index < 2) {
            // Only show first 2 lines to fit in space
            pdf.text(chunk, margin + 5, tokenY);
            tokenY += 4;
          }
        });

        if (tokenChunks.length > 2) {
          pdf.text("...", margin + 5, tokenY);
        }

        yPos += 35;
      }

      // ===== PACKAGE INFORMATION =====
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Package Information", margin, yPos);

      yPos += 8;

      // Package card
      pdf.setFillColor(...colors.white);
      pdf.roundedRect(margin, yPos, contentWidth, 50, 2, 2, "F");
      pdf.setDrawColor(...colors.light);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin, yPos, contentWidth, 50, 2, 2, "S");

      yPos += 8;

      // Package title
      pdf.setTextColor(...colors.dark);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(receiptData.package_title, margin + 5, yPos);

      yPos += 10;

      // Package details in mobile-friendly layout
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");

      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      pdf.text("Location:", margin + 5, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colors.dark);
      pdf.text(receiptData.package_location, margin + 25, yPos);

      yPos += 7;
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      pdf.text("Travelers:", margin + 5, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colors.dark);
      pdf.text(`${receiptData.number_of_people} people`, margin + 25, yPos);

      yPos += 7;
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      pdf.text("Travel Date:", margin + 5, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colors.dark);
      pdf.text(
        new Date(receiptData.booking_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        margin + 30,
        yPos,
      );

      yPos += 7;
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      pdf.text("Company:", margin + 5, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colors.dark);
      pdf.text(receiptData.company_name, margin + 25, yPos);

      yPos += 20;

      // ===== PAYMENT INFORMATION =====
      pdf.setTextColor(...colors.accent);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Payment Information", margin, yPos);

      yPos += 8;

      // Payment card
      pdf.setFillColor(...colors.white);
      pdf.roundedRect(margin, yPos, contentWidth, 35, 2, 2, "F");
      pdf.setDrawColor(...colors.light);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin, yPos, contentWidth, 35, 2, 2, "S");

      yPos += 8;

      pdf.setFontSize(9);
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      pdf.text("Method:", margin + 5, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colors.dark);
      pdf.text(
        receiptData.payment_method.replace("_", " ").toUpperCase(),
        margin + 25,
        yPos,
      );

      yPos += 7;
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      pdf.text("Date:", margin + 5, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colors.dark);
      pdf.text(
        new Date(receiptData.payment_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        margin + 25,
        yPos,
      );

      if (receiptData.transaction_reference) {
        yPos += 7;
        pdf.setTextColor(...colors.text);
        pdf.setFont("helvetica", "bold");
        pdf.text("Transaction ID:", margin + 5, yPos);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...colors.dark);
        pdf.setFontSize(8);
        pdf.text(receiptData.transaction_reference, margin + 35, yPos);
      }

      yPos += 20;

      // ===== TOTAL AMOUNT =====
      pdf.setFillColor(...colors.success);
      pdf.roundedRect(margin, yPos, contentWidth, 20, 2, 2, "F");

      pdf.setTextColor(...colors.white);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("TOTAL AMOUNT PAID", margin + 5, yPos + 8);

      pdf.setFontSize(16);
      const amountText = `${receiptData.total_amount.toLocaleString()} ETB`;
      pdf.text(amountText, pageWidth - margin - 5, yPos + 12, {
        align: "right",
      });

      yPos += 30;

      // ===== FOOTER =====
      const footerY = pageHeight - 25;

      // Footer background
      pdf.setFillColor(249, 250, 251);
      pdf.rect(0, footerY - 5, pageWidth, 30, "F");

      // Divider line
      pdf.setDrawColor(...colors.light);
      pdf.setLineWidth(0.5);
      pdf.line(margin, footerY, pageWidth - margin, footerY);

      // Footer text
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Thank you for choosing East Hararghe Tours!",
        pageWidth / 2,
        footerY + 5,
        { align: "center" },
      );

      pdf.setFontSize(7);
      pdf.text(
        "Email: support@easthararghetours.com | Phone: +251-91-123-4567",
        pageWidth / 2,
        footerY + 10,
        { align: "center" },
      );
      pdf.text(
        "Website: www.easthararghetours.com",
        pageWidth / 2,
        footerY + 15,
        { align: "center" },
      );

      pdf.setFontSize(6);
      pdf.setTextColor(156, 163, 175);
      pdf.text(
        "This is a computer-generated receipt and does not require a signature.",
        pageWidth / 2,
        footerY + 20,
        { align: "center" },
      );

      // ===== WATERMARK =====
      pdf.setTextColor(248, 250, 252);
      pdf.setFontSize(50);
      pdf.setFont("helvetica", "bold");
      pdf.text("PAID", pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: 45,
      });

      // Save the PDF
      const fileName = `Receipt_${receiptData.booking_reference}_${Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating receipt:", error);
      throw new Error("Failed to generate receipt");
    }
  }

  static async generateAndDownloadReceipt(
    receiptData: ReceiptData,
  ): Promise<void> {
    try {
      await this.generateReceipt(receiptData);
    } catch (error) {
      console.error("Receipt generation failed:", error);
      throw error;
    }
  }
}
