/**
 * Extract error message from API error response
 * Handles different error response formats from the backend
 */
export const getErrorMessage = (
  error: any,
  defaultMessage = "An error occurred",
): string => {
  // Check if error response exists
  if (!error?.response?.data) {
    return error?.message || defaultMessage;
  }

  const data = error.response.data;

  // Priority 1: Specific validation error message (from Joi validation)
  if (data.error && typeof data.error === "string") {
    return data.error;
  }

  // Priority 2: General message field
  if (data.message && typeof data.message === "string") {
    return data.message;
  }

  // Priority 3: Errors object (multiple validation errors)
  if (data.errors && typeof data.errors === "object") {
    const firstError = Object.values(data.errors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0];
    }
    if (typeof firstError === "string") {
      return firstError;
    }
  }

  // Priority 4: Error array
  if (Array.isArray(data.error) && data.error.length > 0) {
    return data.error[0];
  }

  // Fallback to default message
  return defaultMessage;
};

/**
 * Extract all error messages from API error response
 * Returns an array of all error messages
 */
export const getAllErrorMessages = (error: any): string[] => {
  if (!error?.response?.data) {
    return [error?.message || "An error occurred"];
  }

  const data = error.response.data;
  const messages: string[] = [];

  // Check for specific error field
  if (data.error) {
    if (typeof data.error === "string") {
      messages.push(data.error);
    } else if (Array.isArray(data.error)) {
      messages.push(...data.error);
    }
  }

  // Check for errors object
  if (data.errors && typeof data.errors === "object") {
    Object.values(data.errors).forEach((value) => {
      if (Array.isArray(value)) {
        messages.push(...value);
      } else if (typeof value === "string") {
        messages.push(value);
      }
    });
  }

  // Check for message field if no other errors found
  if (messages.length === 0 && data.message) {
    messages.push(data.message);
  }

  return messages.length > 0 ? messages : ["An error occurred"];
};
