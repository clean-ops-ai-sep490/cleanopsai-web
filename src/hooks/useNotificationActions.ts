"use client";

import { useNotifications } from "./useNotifications";
import type { NotificationRecipientDto } from "@/types/notification";
import { notificationToasts } from "@/lib/utils/toast-utils";

export function useNotificationActions() {
  const { markAsRead } = useNotifications();

  // Handle notification click - mark as read
  const handleNotificationClick = async (
    notification: NotificationRecipientDto,
  ) => {
    try {
      // Mark as read if not already read
      if (!notification.isRead) {
        await markAsRead(notification.notificationId);
      }
    } catch (error) {
      console.error("Failed to handle notification click:", error);
      notificationToasts.openNotificationError();
    }
  };

  // Handle mark as read with event stopping
  const handleMarkAsRead = async (
    notificationId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  return {
    handleNotificationClick,
    handleMarkAsRead,
  };
}
