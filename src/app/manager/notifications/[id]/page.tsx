"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User, Tag, Bell } from "lucide-react";
import { notificationApi } from "@/lib/notification-api";
import { formatTimeAgo } from "@/lib/utils/date-utils";
import type { NotificationRecipientDto } from "@/types/notification";
import { notificationToasts } from "@/lib/utils/toast-utils";

export default function NotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notification, setNotification] = useState<NotificationRecipientDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const notificationId = params.id as string;

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const detail = await notificationApi.getNotificationDetail(notificationId);
        setNotification(detail);
        if (!detail.isRead) {
          await notificationApi.markAsRead(notificationId);
          setNotification((prev) => (prev ? { ...prev, isRead: true, isReadAt: new Date().toISOString() } : null));
        }
      } catch (err) {
        console.error("Failed to load notification detail:", err);
        notificationToasts.loadNotificationDetailError();
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    if (notificationId) load();
  }, [notificationId]);

  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Chi tiết thông báo" description="Xem nội dung, trạng thái và thời điểm đọc thông báo." breadcrumbs={<Button variant="ghost" size="sm" onClick={() => router.push("/manager/notifications")}><ArrowLeft className="h-4 w-4" />Quay lại</Button>} />

        {isLoading ? (
          <SectionCard><div className="py-12 text-center text-slate-500">Đang tải chi tiết thông báo...</div></SectionCard>
        ) : error || !notification ? (
          <ErrorState title="Không thể tải thông báo" description="Thông báo có thể không tồn tại hoặc bạn không có quyền truy cập." onAction={() => router.push("/manager/notifications")} />
        ) : (
          <div className="space-y-6">
            <SectionCard>
              <div className="flex items-center justify-between gap-4">
                <Badge variant={notification.isRead ? "secondary" : "default"}>{notification.isRead ? "Đã đọc" : "Chưa đọc"}</Badge>
                {notification.isReadAt ? <div className="flex items-center gap-2 text-sm text-slate-500"><Clock className="h-4 w-4" />Đã đọc lúc: {new Date(notification.isReadAt).toLocaleString("vi-VN")}</div> : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-950">{notification.title}</h2>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" />Tạo lúc: {new Date(notification.created).toLocaleString("vi-VN")}</span>
                <span className="flex items-center gap-2"><Tag className="h-4 w-4" /><Badge variant="outline">{notification.priority}</Badge></span>
                <span className="flex items-center gap-2"><User className="h-4 w-4" />Sender: {notification.senderId}</span>
              </div>
            </SectionCard>

            <SectionCard title="Nội dung thông báo">
              <div className="whitespace-pre-wrap rounded-[var(--radius-md)] border border-slate-200 bg-slate-50 p-4 text-slate-700">{notification.body}</div>
            </SectionCard>

            <SectionCard title="Thông tin hệ thống">
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div><p className="text-slate-500">ID thông báo</p><p className="font-mono text-xs text-slate-700">{notification.id}</p></div>
                <div><p className="text-slate-500">ID nội dung</p><p className="font-mono text-xs text-slate-700">{notification.notificationId}</p></div>
                <div><p className="text-slate-500">Thời gian tạo</p><p className="text-slate-700">{formatTimeAgo(notification.created)}</p></div>
                {notification.isReadAt ? <div><p className="text-slate-500">Thời gian đọc</p><p className="text-slate-700">{formatTimeAgo(notification.isReadAt)}</p></div> : null}
              </div>
            </SectionCard>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => router.push("/manager/notifications")}>Quay lại danh sách thông báo</Button>
        </div>
      </div>
    </>
  );
}
