"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User, Tag } from "lucide-react";
import { notificationApi } from "@/lib/notification-api";
import { formatTimeAgo } from "@/lib/utils/date-utils";
import type { NotificationRecipientDto } from "@/types/notification";
import { notificationToasts } from "@/lib/utils/toast-utils";

export default function NotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notification, setNotification] =
    useState<NotificationRecipientDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const notificationId = params.id as string;

  useEffect(() => {
    const loadNotificationDetail = async () => {
      try {
        setIsLoading(true);

        // Get notification detail
        const detail =
          await notificationApi.getNotificationDetail(notificationId);
        setNotification(detail);

        // Mark as read if not already read
        if (!detail.isRead) {
          await notificationApi.markAsRead(notificationId);
          setNotification((prev) =>
            prev
              ? {
                  ...prev,
                  isRead: true,
                  isReadAt: new Date().toISOString(),
                }
              : null,
          );
        }
      } catch (error) {
        console.error("Failed to load notification detail:", error);
        notificationToasts.loadNotificationDetailError();
        router.push("/manager/notifications");
      } finally {
        setIsLoading(false);
      }
    };

    if (notificationId) {
      loadNotificationDetail();
    }
  }, [notificationId, router]);

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Đang tải chi tiết thông báo...</p>
        </Card>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Không tìm thấy thông báo</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/manager/notifications")}
          >
            Quay lại danh sách thông báo
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/manager/notifications")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Chi tiết thông báo</h1>
      </div>

      {/* Notification Detail Card */}
      <Card className="p-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge
            variant={notification.isRead ? "secondary" : "default"}
            className="mb-2"
          >
            {notification.isRead ? "Đã đọc" : "Chưa đọc"}
          </Badge>

          {notification.isReadAt && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Đã đọc lúc:{" "}
              {new Date(notification.isReadAt).toLocaleString("vi-VN")}
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {notification.title}
        </h2>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              Tạo lúc: {new Date(notification.created).toLocaleString("vi-VN")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <Badge variant="outline">{notification.priority}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Sender: {notification.senderId}</span>
          </div>
        </div>

        {/* Message Content */}
        <div className="prose max-w-none">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Nội dung thông báo:
            </h3>
            <div className="text-gray-900 whitespace-pre-wrap">
              {notification.body}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">ID thông báo:</span>
              <span className="ml-2 text-gray-600 font-mono">
                {notification.id}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">ID nội dung:</span>
              <span className="ml-2 text-gray-600 font-mono">
                {notification.notificationId}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Thời gian tạo:</span>
              <span className="ml-2 text-gray-600">
                {formatTimeAgo(notification.created)}
              </span>
            </div>
            {notification.isReadAt && (
              <div>
                <span className="font-medium text-gray-700">
                  Thời gian đọc:
                </span>
                <span className="ml-2 text-gray-600">
                  {formatTimeAgo(notification.isReadAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => router.push("/manager/notifications")}
        >
          Quay lại danh sách thông báo
        </Button>
      </div>
    </div>
  );
}
