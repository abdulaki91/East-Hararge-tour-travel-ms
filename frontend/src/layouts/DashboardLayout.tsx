import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import Sidebar from "../components/Sidebar";

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen for window resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <DashboardNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex w-full min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main
          className="flex-1 lg:ml-64 w-full min-w-0 max-w-full transition-all duration-300"
          style={{ paddingTop: "var(--navbar-height)" }}
        >
          <div className="p-4 sm:p-6 w-full max-w-full dashboard-content">
            <div className="w-full max-w-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
