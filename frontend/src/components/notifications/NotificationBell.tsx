import React, { useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useSocket } from "../../context/SocketContext";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, isConnected } = useSocket();

  // Debug logging
  console.log("🔔 NotificationBell render:", {
    unreadCount,
    isConnected,
    shouldShowBadge: unreadCount > 0,
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6" />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"
            style={{ minWidth: "20px" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Connection indicator - small dot at bottom */}
        <div
          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white transition-colors ${
            isConnected ? "bg-green-500" : "bg-gray-400"
          }`}
          title={isConnected ? "Connected" : "Disconnected"}
        />
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <NotificationDropdown
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
