import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

interface SystemSettings {
  maintenance_mode: boolean;
  contact_email?: string;
  contact_phone?: string;
  site_name?: string;
}

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  settings: SystemSettings | null;
  isLoading: boolean;
  checkMaintenanceMode: () => Promise<void>;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(
  undefined,
);

export const useMaintenanceMode = () => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error(
      "useMaintenanceMode must be used within a MaintenanceProvider",
    );
  }
  return context;
};

interface MaintenanceProviderProps {
  children: React.ReactNode;
}

export const MaintenanceProvider: React.FC<MaintenanceProviderProps> = ({
  children,
}) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const checkMaintenanceMode = async () => {
    console.log("🔍 Checking maintenance mode...", { user: user?.role_name });

    // Admins are never affected by maintenance mode - skip all checks
    if (user?.role_name === "ADMIN") {
      console.log("✅ User is ADMIN - skipping maintenance check");
      setIsMaintenanceMode(false);
      setIsLoading(false);
      return;
    }

    // Only check for non-admin users
    try {
      console.log("📡 Making health check request...");
      // Make a request to check maintenance mode
      const response = await api.get("/health");

      console.log("✅ Health check passed - maintenance mode OFF");
      // If we get here, maintenance mode is off
      setIsMaintenanceMode(false);
      setIsLoading(false);
    } catch (error: any) {
      console.log(
        "❌ Health check failed:",
        error.response?.status,
        error.response?.data,
      );

      // Check if it's a maintenance mode error
      if (
        error.response?.status === 503 &&
        error.response?.data?.maintenance_mode
      ) {
        console.log("🔧 MAINTENANCE MODE DETECTED - showing maintenance page");
        setIsMaintenanceMode(true);

        // Try to get settings for contact info
        try {
          const settingsResponse = await api.get("/admin/settings");
          if (settingsResponse.data?.success) {
            setSettings(settingsResponse.data.data);
            console.log("📋 Settings loaded for maintenance page");
          }
        } catch (settingsError) {
          console.log("⚠️ Could not fetch settings for maintenance page");
        }
      } else {
        // Other errors, not maintenance mode
        console.log("⚠️ Error is not maintenance mode - continuing normally");
        setIsMaintenanceMode(false);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Don't run any checks for admins
    if (user?.role_name === "ADMIN") {
      setIsMaintenanceMode(false);
      setIsLoading(false);
      return;
    }

    checkMaintenanceMode();

    // Check every 30 seconds (only for non-admins)
    const interval = setInterval(checkMaintenanceMode, 30000);

    // Listen for maintenance mode events from API interceptor
    const handleMaintenanceEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log("🔧 Received maintenance mode event:", customEvent.detail);
      if (customEvent.detail?.enabled) {
        setIsMaintenanceMode(true);
        // Try to fetch settings
        api
          .get("/admin/settings")
          .then((response) => {
            if (response.data?.success) {
              setSettings(response.data.data);
            }
          })
          .catch(() => {
            console.log("Could not fetch settings for maintenance page");
          });
      }
    };

    // Listen for manual check requests from maintenance page
    const handleCheckMaintenance = () => {
      console.log("🔄 Manual maintenance check requested");
      checkMaintenanceMode();
    };

    window.addEventListener("maintenanceMode", handleMaintenanceEvent);
    window.addEventListener("checkMaintenance", handleCheckMaintenance);

    return () => {
      clearInterval(interval);
      window.removeEventListener("maintenanceMode", handleMaintenanceEvent);
      window.removeEventListener("checkMaintenance", handleCheckMaintenance);
    };
  }, [user]);

  const value: MaintenanceContextType = {
    isMaintenanceMode,
    settings,
    isLoading,
    checkMaintenanceMode,
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};
