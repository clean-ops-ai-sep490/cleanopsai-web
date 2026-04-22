"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, Eye, Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { formatTimeAgo } from "@/lib/utils/date-utils";
import type { NotificationRecipientDto } from "@/types/notification";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);

  const {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAllAsRead,
  } = useNotifications();

  const { handleNotificationClick, handleMarkAsRead } =
    useNotificationActions();

  // Load notifications on mount and filter change
  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} chưa đọc</Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Tất cả ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Chưa đọc ({unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">Đang tải thông báo...</p>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-6 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {filter === "unread"
                ? "Không có thông báo chưa đọc"
                : "Không có thông báo nào"}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={(id, e) => handleMarkAsRead(id, e)}
              onClick={() => handleNotificationClick(notification)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Notification Card Component
interface NotificationCardProps {
  notification: NotificationRecipientDto;
  onMarkAsRead: (id: string, e: React.MouseEvent) => void;
  onClick: () => void;
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onClick,
}: NotificationCardProps) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
        !notification.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3
              className={`font-medium ${
                !notification.isRead ? "text-gray-900" : "text-gray-700"
              }`}
            >
              {notification.title}
            </h3>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {notification.body}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{formatTimeAgo(notification.created)}</span>
            <Badge variant="outline" className="text-xs">
              {notification.priority}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onMarkAsRead(notification.id, e)}
              className="text-blue-600 hover:text-blue-700"
              title="Đánh dấu đã đọc"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
