import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import {
  MaintenanceProvider,
  useMaintenanceMode,
} from "./context/MaintenanceContext";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import MaintenancePage from "./pages/MaintenancePage";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppContent() {
  const { isMaintenanceMode, settings, isLoading } = useMaintenanceMode();

  console.log("🎨 AppContent render:", { isMaintenanceMode, isLoading });

  // Show loading state while checking maintenance mode
  if (isLoading) {
    console.log("⏳ Showing loading state...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show maintenance page if maintenance mode is enabled (admins are excluded)
  if (isMaintenanceMode) {
    console.log("🔧 Showing maintenance page");
    return (
      <MaintenancePage
        contactEmail={settings?.contact_email}
        contactPhone={settings?.contact_phone}
        siteName={settings?.site_name}
      />
    );
  }

  // Normal app (admins always see this, even during maintenance)
  console.log("✅ Showing normal app");
  return (
    <div className="App">
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: "toast-custom",
          style: {
            borderRadius: "1rem",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
          success: {
            duration: 3000,
            style: {
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%)",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#22c55e",
            },
          },
          error: {
            duration: 5000,
            style: {
              background:
                "linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#ef4444",
            },
          },
          loading: {
            style: {
              background:
                "linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#3b82f6",
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <MaintenanceProvider>
              <SocketProvider>
                <AppContent />
              </SocketProvider>
            </MaintenanceProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
