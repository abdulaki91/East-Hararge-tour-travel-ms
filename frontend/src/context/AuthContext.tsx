import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/auth";
import type { AuthUser } from "../types";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        const storedUser = authService.getUser();

        console.log(
          "Auth Init - Token:",
          !!token,
          "Stored User:",
          !!storedUser,
        );

        if (token && storedUser) {
          // Try to get fresh profile data
          try {
            console.log("Fetching fresh profile...");
            const response = await authService.getProfile();
            console.log("Profile response:", response);
            if (response.success) {
              setUser(response.data);
              console.log("Set user from API:", response.data);
            } else {
              // If API fails but we have stored user, use it
              setUser(storedUser);
              console.log("Using stored user:", storedUser);
            }
          } catch (error) {
            // If API fails but we have stored user, use it
            console.warn(
              "Failed to fetch fresh profile, using stored user:",
              error,
            );
            setUser(storedUser);
          }
        } else if (token || storedUser) {
          // Clear inconsistent auth state
          console.log("Clearing inconsistent auth state");
          authService.logout();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth errors from API interceptor
    const handleAuthError = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log("🔐 Received auth error event:", customEvent.detail);
      if (customEvent.detail?.type === "unauthorized") {
        logout();
        // Navigate to login will be handled by the route protection
      }
    };

    window.addEventListener("authError", handleAuthError);

    initAuth();

    return () => {
      window.removeEventListener("authError", handleAuthError);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        const { user, tokens } = response.data;
        authService.setAuth(tokens.accessToken, user);
        setUser(user);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      // Prioritize specific error message over generic message
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.message || "Login failed");
      }
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authService.register(data);
      if (response.success) {
        const { user, tokens } = response.data;
        authService.setAuth(tokens.accessToken, user);
        setUser(user);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      // Prioritize specific error message over generic message
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.message || "Registration failed");
      }
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
