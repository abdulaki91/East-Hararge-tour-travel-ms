import React from "react";
import { useSocket } from "../context/SocketContext";

const SocketTestComponent: React.FC = () => {
  const { socket, isConnected, unreadCount } = useSocket();

  const testNotification = () => {
    if (socket) {
      // This would typically be done from the backend, but for testing
      console.log("Socket connected:", isConnected);
      console.log("Unread count:", unreadCount);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Socket Connection Test</h3>
      <div className="space-y-2">
        <p>
          Status:
          <span
            className={`ml-2 px-2 py-1 rounded text-sm ${
              isConnected
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </p>
        <p>
          Unread Notifications:{" "}
          <span className="font-semibold">{unreadCount}</span>
        </p>
        <button
          onClick={testNotification}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Connection
        </button>
      </div>
    </div>
  );
};

export default SocketTestComponent;
