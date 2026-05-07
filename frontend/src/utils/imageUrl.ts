/**
 * Get the full URL for an image path
 * Handles both relative paths from backend and full URLs
 */
export const getImageUrl = (
  imagePath: string | undefined | null,
): string | undefined => {
  if (!imagePath) {
    return undefined;
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Get the API base URL and remove /api suffix
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const baseUrl = apiUrl.replace("/api", "");

  // Remove leading slash from image path if present
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;

  // Combine base URL with image path
  return `${baseUrl}/${cleanPath}`;
};

/**
 * Get full URLs for an array of image paths
 */
export const getImageUrls = (
  imagePaths: string[] | undefined | null,
): string[] => {
  if (!imagePaths || !Array.isArray(imagePaths)) {
    return [];
  }

  return imagePaths
    .map((path) => getImageUrl(path))
    .filter((url): url is string => url !== undefined);
};
