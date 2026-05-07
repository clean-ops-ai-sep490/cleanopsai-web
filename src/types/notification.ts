// Notification types
export interface NotificationDto {
  id: string;
  title: string;
  body: string; // API trả về "body" thay vì "message"
  priority: string;
  senderType: string;
  senderId: string;
  created: string; // API trả về "created" thay vì "createdAt"
}

export interface NotificationRecipientDto {
  id: string;
  notificationId: string;
  title: string;
  body: string;
  priority: string;
  senderType: string;
  senderId: string;
  isRead: boolean;
  isReadAt?: string; // API trả về "isReadAt" thay vì "readAt"
  created: string; // API trả về "created" thay vì "createdAt"
}

export interface NotificationListResponse {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  content: NotificationRecipientDto[];
  unreadCount: number;
}

export interface NotificationParams {
  workerId?: string; // ID của user để lọc notifications
  isRead?: boolean;
  pageNumber?: number;
  pageSize?: number;
}
