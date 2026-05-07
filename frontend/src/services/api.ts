import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor to handle auth errors and maintenance mode
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(
      "API Response Error:",
      error.response?.status,
      error.response?.data,
      error.config?.url,
    );

    // Handle maintenance mode (503) - ADMINS ARE NEVER AFFECTED
    if (
      error.response?.status === 503 &&
      error.response?.data?.maintenance_mode === true
    ) {
      // Check if user is admin
      const user = localStorage.getItem("user");
      let isAdmin = false;

      if (user) {
        try {
          const userData = JSON.parse(user);
          isAdmin = userData.role_name === "ADMIN";
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }

      // CRITICAL: Only handle for non-admin users
      // Admins should NEVER see maintenance mode
      if (!isAdmin) {
        console.log("🔧 Maintenance mode detected (non-admin user)");

        // Dispatch a custom event that the MaintenanceContext can listen to
        // This is better than reloading the page
        window.dispatchEvent(
          new CustomEvent("maintenanceMode", {
            detail: { enabled: true },
          }),
        );
      } else {
        console.log(
          "🔧 Maintenance mode detected but user is ADMIN - continuing normally",
        );
      }
    }

    // Handle unauthorized (401)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Dispatch a custom event that the AuthContext can listen to
      window.dispatchEvent(
        new CustomEvent("authError", {
          detail: { type: "unauthorized" },
        }),
      );
    }

    return Promise.reject(error);
  },
);

// Export both default and named exports for compatibility
export { api };
export default api;
