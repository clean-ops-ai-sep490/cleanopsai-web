"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./NotificationItem";
import type { NotificationRecipientDto } from "@/types/notification";

interface NotificationListProps {
  notifications: NotificationRecipientDto[];
  isLoading: boolean;
  onMarkAsRead: (notificationId: string, event: React.MouseEvent) => void;
  onNotificationClick: (notification: NotificationRecipientDto) => void;
}

export function NotificationList({
  notifications,
  isLoading,
  onMarkAsRead,
  onNotificationClick,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">Đang tải...</div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Không có thông báo nào
      </div>
    );
  }

  return (
    <ScrollArea className="h-96">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onClick={onNotificationClick}
        />
      ))}
    </ScrollArea>
  );
}
