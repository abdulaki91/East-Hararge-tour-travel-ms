import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface SystemSettings {
  maintenance_mode: boolean;
  contact_email?: string;
  contact_phone?: string;
  site_name?: string;
}

export const useMaintenanceMode = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      // Admins are never affected by maintenance mode
      if (user?.role_name === "ADMIN") {
        setIsMaintenanceMode(false);
        setIsLoading(false);
        return;
      }

      try {
        // Make a request to check maintenance mode
        // We'll use the health endpoint which should always be accessible
        const response = await api.get("/health");

        // If we get here, maintenance mode is off
        setIsMaintenanceMode(false);
        setIsLoading(false);
      } catch (error: any) {
        // Check if it's a maintenance mode error
        if (
          error.response?.status === 503 &&
          error.response?.data?.maintenance_mode
        ) {
          setIsMaintenanceMode(true);

          // Try to get settings for contact info
          try {
            const settingsResponse = await api.get("/admin/settings");
            if (settingsResponse.data?.success) {
              setSettings(settingsResponse.data.data);
            }
          } catch (settingsError) {
            // If we can't get settings, use defaults
            console.log("Could not fetch settings for maintenance page");
          }
        } else {
          // Other errors, not maintenance mode
          setIsMaintenanceMode(false);
        }
        setIsLoading(false);
      }
    };

    checkMaintenanceMode();

    // Check every 30 seconds
    const interval = setInterval(checkMaintenanceMode, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return { isMaintenanceMode, settings, isLoading };
};
