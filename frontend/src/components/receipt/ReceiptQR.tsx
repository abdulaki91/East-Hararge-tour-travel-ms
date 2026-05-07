import React, { useState } from "react";
import {
  QrCodeIcon,
  DocumentArrowDownIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { receiptService, type ReceiptQRData } from "../../services/receipt";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface ReceiptQRProps {
  bookingId: number;
  bookingReference: string;
  isOpen: boolean;
  onClose: () => void;
}

const ReceiptQR: React.FC<ReceiptQRProps> = ({
  bookingId,
  bookingReference,
  isOpen,
  onClose,
}) => {
  const [qrData, setQrData] = useState<ReceiptQRData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQR = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await receiptService.generateReceiptQR(bookingId);

      if (response.success) {
        setQrData(response.data);
      } else {
        setError(response.message || "Failed to generate QR code");
      }
    } catch (err: any) {
      console.error("QR generation error:", err);
      setError(err.response?.data?.message || "Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrData) return;

    // Create download link
    const link = document.createElement("a");
    link.href = qrData.qr_code;
    link.download = `receipt-qr-${bookingReference}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToken = () => {
    if (!qrData) return;

    navigator.clipboard.writeText(qrData.qr_token).then(() => {
      // You could add a toast notification here
      alert("QR token copied to clipboard!");
    });
  };

  const handleClose = () => {
    setQrData(null);
    setError(null);
    onClose();
  };

  React.useEffect(() => {
    if (isOpen && !qrData) {
      generateQR();
    }
  }, [isOpen]);

  const isExpired = qrData && new Date() > new Date(qrData.expires_at);
  const expiresIn = qrData
    ? new Date(qrData.expires_at).getTime() - new Date().getTime()
    : 0;
  const hoursUntilExpiry = Math.max(
    0,
    Math.floor(expiresIn / (1000 * 60 * 60)),
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Receipt QR Code">
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating QR code...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <Button
              variant="outline"
              onClick={generateQR}
              className="mt-3"
              disabled={isLoading}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* QR Code Display */}
        {qrData && (
          <div className="space-y-4">
            {/* Expiry Warning */}
            {isExpired ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-red-800 font-medium">
                    This QR code has expired
                  </p>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  Please generate a new QR code if needed.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-yellow-400 mr-2" />
                  <p className="text-yellow-800 font-medium">
                    Expires in {hoursUntilExpiry} hours
                  </p>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  QR code expires on{" "}
                  {new Date(qrData.expires_at).toLocaleString()}
                </p>
              </div>
            )}

            {/* QR Code Image */}
            <div className="text-center">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                <img
                  src={qrData.qr_code}
                  alt="Receipt QR Code"
                  className="w-64 h-64 mx-auto"
                />
              </div>
            </div>

            {/* Receipt Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Receipt Details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Booking:</p>
                  <p className="font-medium">
                    {qrData.receipt_data.booking_reference}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Transaction:</p>
                  <p className="font-medium">
                    {qrData.receipt_data.transaction_reference}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Package:</p>
                  <p className="font-medium">
                    {qrData.receipt_data.package_title}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Amount:</p>
                  <p className="font-medium">
                    {qrData.receipt_data.amount} ETB
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Date:</p>
                  <p className="font-medium">
                    {new Date(
                      qrData.receipt_data.booking_date,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">People:</p>
                  <p className="font-medium">
                    {qrData.receipt_data.number_of_people}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Token (for manual verification) */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                Manual Verification Token
              </h4>
              <p className="text-xs text-blue-700 mb-2">
                Companies can use this token to verify your receipt manually:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={qrData.qr_token}
                  readOnly
                  className="flex-1 px-3 py-2 text-xs bg-white border border-blue-200 rounded font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToken}
                  className="text-blue-600 border-blue-200 hover:bg-blue-100"
                >
                  Copy
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={downloadQR}
                className="inline-flex items-center"
                disabled={isExpired}
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Download QR
              </Button>

              {isExpired && (
                <Button
                  onClick={generateQR}
                  disabled={isLoading}
                  className="inline-flex items-center"
                >
                  <QrCodeIcon className="w-4 h-4 mr-2" />
                  Generate New QR
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptQR;
