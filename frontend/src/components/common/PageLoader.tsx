import React from "react";
import LoadingSpinner from "../ui/LoadingSpinner";

interface PageLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

const PageLoader: React.FC<PageLoaderProps> = ({
  message = "Loading...",
  size = "lg",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size={size} />
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default PageLoader;
