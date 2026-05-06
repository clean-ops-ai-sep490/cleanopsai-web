"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationApi } from "@/lib/notification-api";
import { useAuth } from "@/contexts/AuthContext";
import type {
  NotificationRecipientDto,
  NotificationParams,
} from "@/types/notification";
import { notificationToasts } from "@/lib/utils/toast-utils";

// Query keys
const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  list: (params?: any) => [...NOTIFICATION_KEYS.all, "list", params] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, "unreadCount"] as const,
  detail: (id: string) => [...NOTIFICATION_KEYS.all, "detail", id] as const,
};

interface UseNotificationsOptions {
  isRead?: boolean;
  pageSize?: number;
}

export function useNotifications(options?: UseNotificationsOptions) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const baseParams = {
    isRead: options?.isRead,
    pageSize: options?.pageSize || 10,
  };

  // Use infinite query for pagination
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: NOTIFICATION_KEYS.list(baseParams),
    queryFn: async ({ pageParam = 1 }) => {
      if (!user?.userId) {
        return {
          pageNumber: 1,
          pageSize: 10,
          totalElements: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
          content: [],
          unreadCount: 0,
        };
      }

      // Build params in correct order
      const params: NotificationParams = {
        workerId: user.userId,
        isRead: baseParams.isRead,
        pageNumber: pageParam,
        pageSize: baseParams.pageSize,
      };

      const response = await notificationApi.getNotifications(params);
      return response;
    },
    getNextPageParam: (lastPage) => {
      // Return next page number if there are more pages
      if (lastPage.hasNextPage) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!user?.userId,
  });

  // Flatten all pages into single array
  const notifications = data?.pages.flatMap((page) => page.content) || [];
  const unreadCount = data?.pages[0]?.unreadCount || 0;
  const totalElements = data?.pages[0]?.totalElements || 0;

  // Mutation for marking as read
  const markAsReadMutation = useMutation({
    mutationFn: ({
      notificationId,
      workerId,
    }: {
      notificationId: string;
      workerId: string;
    }) => notificationApi.markAsRead(notificationId, workerId),
    onMutate: async ({ notificationId }) => {
      const queryKey = NOTIFICATION_KEYS.list(baseParams);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update all pages
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            content: page.content.map((notif: NotificationRecipientDto) =>
              notif.notificationId === notificationId
                ? {
                    ...notif,
                    isRead: true,
                    isReadAt: new Date().toISOString(),
                  }
                : notif,
            ),
            unreadCount: Math.max(0, (page.unreadCount || 0) - 1),
          })),
        };
      });

      return { previousData, queryKey };
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      console.error("Failed to mark as read:", error);
      notificationToasts.markAsReadError();
    },
    onSuccess: () => {
      notificationToasts.markAsReadSuccess();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });

  // Mutation for marking all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onMutate: async () => {
      const queryKey = NOTIFICATION_KEYS.list(baseParams);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update all pages
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            content: page.content.map((notif: NotificationRecipientDto) => ({
              ...notif,
              isRead: true,
              isReadAt: new Date().toISOString(),
            })),
            unreadCount: 0,
          })),
        };
      });

      return { previousData, queryKey };
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      console.error("Failed to mark all as read:", error);
      notificationToasts.markAllAsReadError();
    },
    onSuccess: () => {
      notificationToasts.markAllAsReadSuccess();
    },
    onSettled: () => {
      // Invalidate all notification queries to refetch
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });

  // Load notifications manually
  const loadNotifications = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Failed to load notifications:", error);
      notificationToasts.loadNotificationsError();
    }
  };

  // Load more notifications (next page)
  const loadMore = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user?.userId) return false;

    try {
      await markAsReadMutation.mutateAsync({
        notificationId,
        workerId: user.userId,
      });
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



  return {
    notifications,
    unreadCount,
    totalElements,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
  };
}
