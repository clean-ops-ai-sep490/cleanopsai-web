"use client";

import { useRouter } from "next/navigation";
import { useNotifications } from "./useNotifications";
import type { NotificationRecipientDto } from "@/types/notification";
import { notificationToasts } from "@/lib/utils/toast-utils";

export function useNotificationActions() {
  const router = useRouter();
  const { markAsRead, getNotificationDetail } = useNotifications();

  // Handle notification click - navigate to detail page
  const handleNotificationClick = async (
    notification: NotificationRecipientDto,
  ) => {
    try {
      // Mark as read if not already read
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      // Navigate to notification detail page
      router.push(`/manager/notifications/${notification.id}`);
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

  // Navigate to all notifications page
  const navigateToAllNotifications = () => {
    router.push("/manager/notifications");
  };

  return {
    handleNotificationClick,
    handleMarkAsRead,
    navigateToAllNotifications,
  };
}
