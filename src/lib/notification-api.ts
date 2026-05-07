import { api } from "./api";
import type {
  NotificationRecipientDto,
  NotificationListResponse,
  NotificationParams,
} from "@/types/notification";

// API functions
export const notificationApi = {
  // Get notifications list with pagination and filter
  getNotifications: async (
    params: NotificationParams,
  ): Promise<NotificationListResponse> => {
    const searchParams = new URLSearchParams();

    // Add params in backend's required order: isRead, workerId, pageNumber, pageSize
    if (params.isRead !== undefined) {
      searchParams.append("isRead", params.isRead.toString());
    }
    if (params.workerId) {
      searchParams.append("workerId", params.workerId);
    }
    if (params.pageNumber) {
      searchParams.append("pageNumber", params.pageNumber.toString());
    }
    if (params.pageSize) {
      searchParams.append("pageSize", params.pageSize.toString());
    }

    const response = await api.get<NotificationListResponse>(
      `/NotificationRecipients?${searchParams.toString()}`,
    );
    return response;
  },

  // Get notification detail by ID
  getNotificationDetail: async (
    id: string,
  ): Promise<NotificationRecipientDto> => {
    const response = await api.get<NotificationRecipientDto>(
      `/NotificationRecipients/${id}`,
    );
    return response;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string, workerId: string): Promise<void> => {
    await api.patch(`/NotificationRecipients/${notificationId}/read?workerId=${workerId}`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.patch("/NotificationRecipients/read-all");
  },

  // Get unread notifications count
  getUnreadCount: async (): Promise<number> => {
    const response = await notificationApi.getNotifications({
      isRead: false,
      pageNumber: 1,
      pageSize: 1,
    });
    return response.unreadCount;
  },
};
