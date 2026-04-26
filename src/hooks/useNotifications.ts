"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib/notification-api";
import type { NotificationRecipientDto } from "@/types/notification";
import { notificationToasts } from "@/lib/utils/toast-utils";

// Query keys
const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  list: (params?: any) => [...NOTIFICATION_KEYS.all, "list", params] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, "unreadCount"] as const,
  detail: (id: string) => [...NOTIFICATION_KEYS.all, "detail", id] as const,
};

export function useNotifications() {
  const queryClient = useQueryClient();

  // Query for unread count - auto-fetch on mount with caching
  const {
    data: unreadCount = 0,
    isLoading: isLoadingCount,
    refetch: refetchUnreadCount,
  } = useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: async () => {
      const response = await notificationApi.getNotifications({
        isRead: false,
        pageNumber: 1,
        pageSize: 1,
      });
      return response.unreadCount;
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Query for notifications list - manual fetch
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: NOTIFICATION_KEYS.list({ pageNumber: 1, pageSize: 10 }),
    queryFn: async () => {
      const response = await notificationApi.getNotifications({
        pageNumber: 1,
        pageSize: 10,
      });
      return response;
    },
    enabled: false, // Don't auto-fetch, only when explicitly called
    staleTime: 30000,
  });

  const notifications = notificationsData?.content || [];

  // Mutation for marking as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationApi.markAsRead(notificationId),
    onSuccess: (_, notificationId) => {
      // Update notifications list cache
      queryClient.setQueryData(
        NOTIFICATION_KEYS.list({ pageNumber: 1, pageSize: 10 }),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((notif: NotificationRecipientDto) =>
              notif.id === notificationId
                ? {
                    ...notif,
                    isRead: true,
                    isReadAt: new Date().toISOString(),
                  }
                : notif,
            ),
          };
        },
      );

      // Update unread count cache
      queryClient.setQueryData(
        NOTIFICATION_KEYS.unreadCount(),
        (old: number = 0) => Math.max(0, old - 1),
      );

      notificationToasts.markAsReadSuccess();
    },
    onError: (error) => {
      console.error("Failed to mark as read:", error);
      notificationToasts.markAsReadError();
    },
  });

  // Mutation for marking all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      // Update notifications list cache
      queryClient.setQueryData(
        NOTIFICATION_KEYS.list({ pageNumber: 1, pageSize: 10 }),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((notif: NotificationRecipientDto) => ({
              ...notif,
              isRead: true,
              isReadAt: new Date().toISOString(),
            })),
          };
        },
      );

      // Update unread count cache
      queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount(), 0);

      notificationToasts.markAllAsReadSuccess();
    },
    onError: (error) => {
      console.error("Failed to mark all as read:", error);
      notificationToasts.markAllAsReadError();
    },
  });

  // Load notifications manually
  const loadNotifications = async () => {
    try {
      await refetchNotifications();
    } catch (error) {
      console.error("Failed to load notifications:", error);
      notificationToasts.loadNotificationsError();
    }
  };

  // Load unread count manually
  const loadUnreadCount = async () => {
    try {
      await refetchUnreadCount();
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      return true;
    } catch (error) {
      return false;
    }
  };

  // Get notification detail
  const getNotificationDetail = async (notificationId: string) => {
    try {
      const detail =
        await notificationApi.getNotificationDetail(notificationId);
      return detail;
    } catch (error) {
      console.error("Failed to get notification detail:", error);
      notificationToasts.loadNotificationDetailError();
      return null;
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading: isLoadingNotifications || isLoadingCount,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    getNotificationDetail,
  };
}
