"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./NotificationItem";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell } from "lucide-react";
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
      <div className="p-3">
        <LoadingState label="Đang tải thông báo..." />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-3">
        <EmptyState
          title="Không có thông báo"
          description="Bạn sẽ thấy các cập nhật mới tại đây khi có thông báo mới."
          icon={<Bell className="h-10 w-10" />}
        />
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
