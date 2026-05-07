import React, { useState, useRef, useEffect } from "react";
import {
  QrCodeIcon,
  CameraIcon,
  XMarkIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import {
  receiptService,
  type VerificationResult,
} from "../../services/receipt";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import QrScanner from "qr-scanner";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanMode, setScanMode] = useState<"manual" | "camera" | "file">(
    "manual",
  );
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  // Check if user has permission to verify receipts
  const canVerifyReceipts =
    user?.role_name === "COMPANY" || user?.role_name === "ADMIN";

  // Show permission error if user doesn't have the right role
  useEffect(() => {
    if (isOpen && !canVerifyReceipts) {
      setError(
        "Only company and admin users can verify receipts. Please ensure you are logged in with the correct account.",
      );
    } else if (isOpen && canVerifyReceipts) {
      setError(null);
    }
  }, [isOpen, canVerifyReceipts]);

  const handleVerifyToken = async (token: string) => {
    if (!canVerifyReceipts) {
      setError(
        "You don't have permission to verify receipts. Only company and admin users can perform this action.",
      );
      return;
    }

    if (!token.trim()) {
      setError("Please enter a QR token");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      console.log("🔍 Verifying token for user:", user?.role_name, user?.email);
      console.log("🔍 Token preview:", token.substring(0, 50) + "...");

      // Check if the token is JSON (fallback QR) or JWT
      let isJWT = true;
      try {
        JSON.parse(token);
        isJWT = false;
        console.log("📄 Detected JSON fallback QR code");
      } catch {
        console.log("🔐 Detected JWT token");
      }

      if (!isJWT) {
        // Handle fallback JSON QR codes
        const qrData = JSON.parse(token);
        if (qrData.type === "receipt_fallback") {
          setError(
            "This receipt uses a fallback QR code format. Please ask the customer to regenerate their receipt with a proper QR token, or verify the receipt manually using the booking reference: " +
              qrData.ref,
          );
          return;
        } else {
          setError(
            "Invalid QR code format. Please scan a valid receipt QR code.",
          );
          return;
        }
      }

      const response = await receiptService.verifyReceiptQR(token.trim());

      if (response.success) {
        setVerificationResult(response.data);
      } else {
        setError(response.message || "Verification failed");
      }
    } catch (err: any) {
      console.error("Verification error:", err);

      // Handle specific error types
      if (err.response?.status === 403) {
        setError(
          "Access denied. Please ensure you are logged in as a company or admin user.",
        );
      } else if (err.response?.status === 401) {
        setError("Authentication required. Please log in and try again.");
      } else if (err.response?.data?.error) {
        switch (err.response.data.error) {
          case "INVALID_TOKEN":
            setError(
              "Invalid or expired QR code. Please ask the customer to regenerate their receipt.",
            );
            break;
          case "EXPIRED":
            setError("QR code has expired");
            break;
          case "NOT_FOUND":
            setError("Booking or payment not found");
            break;
          case "PAYMENT_INVALID":
            setError("Payment is no longer valid");
            break;
          case "UNAUTHORIZED_COMPANY":
            setError("You can only verify receipts for your own company");
            break;
          case "NO_COMPANY":
            setError("Company not found for your account");
            break;
          default:
            setError(err.response.data.message || "Verification failed");
        }
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = () => {
    handleVerifyToken(manualToken);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    // Use QrScanner to scan from image file
    QrScanner.scanImage(file, { returnDetailedScanResult: true })
      .then((result) => {
        handleVerifyToken(result.data);
      })
      .catch((err) => {
        console.error("QR scan from image failed:", err);
        setError(
          "Could not read QR code from image. Please try a clearer image or enter the token manually.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Camera scanning functions
  const startCameraScanning = async () => {
    console.log("🎥 Starting camera scanning...");

    if (!videoRef.current) {
      console.error("❌ Video ref not available");
      setCameraError("Video element not ready");
      return;
    }

    try {
      setIsScanning(true);
      setCameraError(null);
      setError(null);
      setScanMode("camera");

      console.log("🔍 Checking camera availability...");

      // Check if camera is supported
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error("No camera found on this device");
      }

      console.log("✅ Camera available, creating QR scanner...");

      // Create QR scanner instance with enhanced settings
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log("🎯 QR Code detected:", result.data);
          console.log("🎯 QR Code format:", result.format);
          console.log("🎯 QR Code corner points:", result.cornerPoints);
          stopCameraScanning();
          handleVerifyToken(result.data);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment", // Use back camera on mobile
          maxScansPerSecond: 10, // Increased scan rate for better detection
          calculateScanRegion: (video) => {
            // Create a larger scan region for better detection
            const smallerDimension = Math.min(
              video.videoWidth,
              video.videoHeight,
            );
            const scanRegionSize = Math.round(0.7 * smallerDimension);
            return {
              x: Math.round((video.videoWidth - scanRegionSize) / 2),
              y: Math.round((video.videoHeight - scanRegionSize) / 2),
              width: scanRegionSize,
              height: scanRegionSize,
            };
          },
        },
      );

      console.log("🚀 Starting QR scanner...");
      await qrScannerRef.current.start();
      console.log("✅ Camera scanning started successfully");

      // Add periodic scan status logging for debugging
      const scanStatusInterval = setInterval(() => {
        if (qrScannerRef.current && isScanning) {
          console.log("🔍 Scanner status: Active, looking for QR codes...");
        } else {
          clearInterval(scanStatusInterval);
        }
      }, 5000);

      // Force video to be visible
      if (videoRef.current) {
        videoRef.current.style.display = "block";
      }
    } catch (err: any) {
      console.error("❌ Camera scanning failed:", err);
      setCameraError(err.message || "Failed to start camera");
      setIsScanning(false);
      setScanMode("manual");

      // Provide more specific error messages
      if (err.name === "NotAllowedError") {
        setCameraError(
          "Camera access denied. Please allow camera permissions and try again.",
        );
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else if (err.name === "NotSupportedError") {
        setCameraError("Camera not supported in this browser.");
      } else if (err.name === "NotReadableError") {
        setCameraError("Camera is already in use by another application.");
      }
    }
  };

  const stopCameraScanning = () => {
    console.log("🛑 Stopping camera scanning...");

    if (qrScannerRef.current) {
      try {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
        console.log("✅ Camera stopped successfully");
      } catch (err) {
        console.error("❌ Error stopping camera:", err);
      }
    }

    // Hide video element
    if (videoRef.current) {
      videoRef.current.style.display = "none";
    }

    setIsScanning(false);
    setCameraError(null);
  };

  // Cleanup camera when modal closes or component unmounts
  useEffect(() => {
    if (!isOpen && qrScannerRef.current) {
      stopCameraScanning();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        stopCameraScanning();
      }
    };
  }, []);

  const resetScanner = () => {
    setManualToken("");
    setVerificationResult(null);
    setError(null);
    setCameraError(null);
    setIsLoading(false);
    setScanMode("manual");
    stopCameraScanning();
  };

  const handleClose = () => {
    resetScanner();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Verify Receipt QR Code">
      <div className="space-y-6">
        {/* User Info for Debugging */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>User: {user?.email || "Not logged in"}</p>
            <p>Role: {user?.role_name || "No role"}</p>
            <p>Can Verify: {canVerifyReceipts ? "Yes" : "No"}</p>
            <p>
              Token: {localStorage.getItem("token") ? "Present" : "Missing"}
            </p>
          </div>
        )}
        {/* Scanner Options */}
        {!verificationResult && canVerifyReceipts && (
          <div className="space-y-6">
            {/* Scanning Mode Selector */}
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setScanMode("manual")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  scanMode === "manual"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setScanMode("camera")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  scanMode === "camera"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Live Camera
              </button>
              <button
                onClick={() => setScanMode("file")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  scanMode === "file"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Upload Image
              </button>
            </div>

            {/* Manual Token Input */}
            {scanMode === "manual" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter QR Token Manually
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Paste QR token here..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleManualVerify}
                    disabled={
                      isLoading || !manualToken.trim() || !canVerifyReceipts
                    }
                    className="px-4 py-2"
                  >
                    {isLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>
            )}

            {/* Live Camera Scanner */}
            {scanMode === "camera" && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Live Camera Scanner
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Position the QR code within the camera view. For best
                    results:
                  </p>
                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    <p>• Hold the device steady</p>
                    <p>• Ensure good lighting</p>
                    <p>• Keep QR code flat and unfolded</p>
                    <p>• Try different distances (6-12 inches)</p>
                  </div>
                </div>

                {/* Camera Error */}
                {cameraError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{cameraError}</p>
                  </div>
                )}

                {/* Camera Video */}
                <div className="relative bg-black rounded-lg overflow-hidden min-h-64">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover"
                    autoPlay
                    playsInline
                    muted
                    style={{
                      display: scanMode === "camera" ? "block" : "none",
                      transform: "scaleX(-1)", // Mirror the video for better UX
                    }}
                  />

                  {/* Loading overlay */}
                  {scanMode === "camera" &&
                    isScanning &&
                    !qrScannerRef.current && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-center text-white">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                          <p>Starting camera...</p>
                        </div>
                      </div>
                    )}

                  {scanMode === "camera" && !isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <VideoCameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Camera not active</p>
                        <Button
                          onClick={startCameraScanning}
                          disabled={isLoading}
                          className="inline-flex items-center"
                        >
                          <VideoCameraIcon className="w-4 h-4 mr-2" />
                          Start Camera
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Controls */}
                {isScanning && (
                  <div className="flex justify-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={stopCameraScanning}
                      className="inline-flex items-center"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Stop Camera
                    </Button>

                    {/* Debug info */}
                    <div className="text-xs text-gray-500 flex items-center">
                      {qrScannerRef.current ? "📹 Active" : "⏸️ Inactive"}
                    </div>
                  </div>
                )}

                {/* Debug Information */}
                {scanMode === "camera" && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>🔧 Debug Info:</p>
                    <p>• Scan Mode: {scanMode}</p>
                    <p>• Is Scanning: {isScanning ? "Yes" : "No"}</p>
                    <p>
                      • Scanner Instance:{" "}
                      {qrScannerRef.current ? "Created" : "None"}
                    </p>
                    <p>
                      • Video Element:{" "}
                      {videoRef.current ? "Ready" : "Not Ready"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* File Upload Option */}
            {scanMode === "file" && (
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload QR Code Image
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Select an image file containing the QR code
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="inline-flex items-center"
                >
                  <CameraIcon className="w-4 h-4 mr-2" />
                  {isLoading ? "Processing..." : "Choose Image"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Verification Failed
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-green-800 mb-4">
                  ✅ Receipt Verified Successfully
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">
                      Booking Reference:
                    </p>
                    <p className="text-gray-900">
                      {verificationResult.booking_reference}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">
                      Transaction Reference:
                    </p>
                    <p className="text-gray-900">
                      {verificationResult.transaction_reference}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">Customer:</p>
                    <p className="text-gray-900">
                      {verificationResult.customer_name}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">Package:</p>
                    <p className="text-gray-900">
                      {verificationResult.package_title}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">Location:</p>
                    <p className="text-gray-900">
                      {verificationResult.package_location}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">Company:</p>
                    <p className="text-gray-900">
                      {verificationResult.company_name}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">Amount:</p>
                    <p className="text-gray-900 font-semibold">
                      {verificationResult.amount} ETB
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">People:</p>
                    <p className="text-gray-900">
                      {verificationResult.number_of_people}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">Booking Date:</p>
                    <p className="text-gray-900">
                      {new Date(
                        verificationResult.booking_date,
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">Payment Date:</p>
                    <p className="text-gray-900">
                      {new Date(
                        verificationResult.payment_date,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {verificationResult.is_already_verified && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This receipt was previously verified on{" "}
                      {verificationResult.last_verification &&
                        new Date(
                          verificationResult.last_verification.verified_at,
                        ).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  Verified by: {verificationResult.verified_by} at{" "}
                  {new Date(verificationResult.verified_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {verificationResult && (
            <Button variant="outline" onClick={resetScanner}>
              Scan Another
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QRScanner;
