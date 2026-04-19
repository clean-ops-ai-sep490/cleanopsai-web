"use client";

import { useState, useEffect, useCallback } from "react";
import { notificationApi } from "@/lib/notification-api";
import type { NotificationRecipientDto } from "@/types/notification";
import { notificationToasts } from "@/lib/utils/toast-utils";

export function useNotifications() {
  const [notifications, setNotifications] = useState<
    NotificationRecipientDto[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await notificationApi.getNotifications({
        pageNumber: 1,
        pageSize: 10,
      });

      // Response trực tiếp chứa pagination data, không có nested page object
      const content = response?.content || [];
      const unreadCount = response?.unreadCount || 0;

      setNotifications(content);
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      notificationToasts.loadNotificationsError();
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load unread count only
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);

      // Update local state - sử dụng isReadAt thay vì readAt
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, isRead: true, isReadAt: new Date().toISOString() }
            : notif,
        ),
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      notificationToasts.markAsReadSuccess();
      return true;
    } catch (error) {
      console.error("Failed to mark as read:", error);
      notificationToasts.markAsReadError();
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();

      // Update local state - sử dụng isReadAt thay vì readAt
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          isRead: true,
          isReadAt: new Date().toISOString(),
        })),
      );

      setUnreadCount(0);
      notificationToasts.markAllAsReadSuccess();
      return true;
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      notificationToasts.markAllAsReadError();
      return false;
    }
  }, []);

  // Get notification detail
  const getNotificationDetail = useCallback(async (notificationId: string) => {
    try {
      const detail =
        await notificationApi.getNotificationDetail(notificationId);
      return detail;
    } catch (error) {
      console.error("Failed to get notification detail:", error);
      notificationToasts.loadNotificationDetailError();
      return null;
    }
  }, []);

  // Load unread count on mount
  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    getNotificationDetail,
  };
}
