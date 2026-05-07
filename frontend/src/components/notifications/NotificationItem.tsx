import React from "react";
import { useSocket } from "../../context/SocketContext";
import {
  notificationService,
  type Notification,
} from "../../services/notifications";

interface NotificationItemProps {
  notification: Notification;
  onRead?: (notificationId: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
}) => {
  const { markNotificationAsRead } = useSocket();

  const handleClick = () => {
    if (!notification.is_read) {
      markNotificationAsRead(notification.id);
      onRead?.(notification.id);
    }
  };

  const icon = notificationService.getNotificationIcon(notification.type);
  const colorClasses = notificationService.getNotificationColor(
    notification.type,
  );
  const timeAgo = notificationService.formatNotificationTime(
    notification.created_at,
  );

  return (
    <div
      onClick={handleClick}
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.is_read ? "bg-primary-50/30" : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${colorClasses}`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  !notification.is_read ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {notification.title}
              </p>
              <p
                className={`text-sm mt-1 ${
                  !notification.is_read ? "text-gray-700" : "text-gray-500"
                }`}
              >
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-2">{timeAgo}</p>
            </div>

            {/* Unread indicator */}
            {!notification.is_read && (
              <div className="flex-shrink-0 ml-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
