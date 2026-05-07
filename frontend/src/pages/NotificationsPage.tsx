import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import {
  notificationService,
  type Notification,
} from "../services/notifications";
import { CheckIcon, TrashIcon, BellIcon } from "@heroicons/react/24/outline";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/common/Pagination";
import toast from "react-hot-toast";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    is_read: undefined as boolean | undefined,
    type: "",
  });

  const { markNotificationAsRead, markAllNotificationsAsRead, unreadCount } =
    useSocket();

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications({
        page: currentPage,
        limit: 20,
        ...filters,
        sort_by: "created_at",
        sort_order: "desc",
      });
      setNotifications(response.notifications);
      setTotalPages(response.pagination.total_pages);
    } catch (err) {
      setError("Failed to load notifications");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId: number) => {
    markNotificationAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif,
      ),
    );
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, is_read: true })),
    );
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId),
      );
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type: string) => {
    return notificationService.getNotificationIcon(type);
  };

  const getNotificationColor = (type: string) => {
    return notificationService.getNotificationColor(type);
  };

  const formatTime = (dateString: string) => {
    return notificationService.formatNotificationTime(dateString);
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-display">
                Notifications
              </h1>
              <p className="text-slate-600 mt-2">
                Stay updated with your bookings and activities
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn-primary flex items-center space-x-2"
              >
                <CheckIcon className="w-4 h-4" />
                <span>Mark All Read ({unreadCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={
                  filters.is_read === undefined
                    ? ""
                    : filters.is_read.toString()
                }
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    is_read:
                      e.target.value === ""
                        ? undefined
                        : e.target.value === "true",
                  }))
                }
                className="input-field"
              >
                <option value="">All</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, type: e.target.value }))
                }
                className="input-field"
              >
                {notificationService.getNotificationTypes().map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {error ? (
          <div className="card text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchNotifications} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <BellIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No notifications found
            </h3>
            <p className="text-slate-500">
              {Object.values(filters).some((v) => v !== undefined && v !== "")
                ? "Try adjusting your filters"
                : "We'll notify you when something happens"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`card hover:shadow-lg transition-all duration-200 ${
                  !notification.is_read
                    ? "ring-2 ring-primary-200 bg-primary-50/30"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg ${getNotificationColor(
                      notification.type,
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className={`text-lg font-semibold ${
                            !notification.is_read
                              ? "text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p
                          className={`mt-1 ${
                            !notification.is_read
                              ? "text-slate-700"
                              : "text-slate-500"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-sm text-slate-400 mt-2">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete notification"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
