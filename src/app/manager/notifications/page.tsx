"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Eye } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { formatTimeAgo } from "@/lib/utils/date-utils";
import type { NotificationRecipientDto } from "@/types/notification";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";

export default function NotificationsPage() {
  const [selected, setSelected] = useState<NotificationRecipientDto | null>(null);
  const [markAllConfirm, setMarkAllConfirm] = useState(false);

  const { notifications, unreadCount, isLoading, isFetchingNextPage, hasNextPage, loadMore, markAllAsRead } = useNotifications();
  const { handleNotificationClick, handleMarkAsRead } = useNotificationActions();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    if (bottom && hasNextPage && !isFetchingNextPage) loadMore();
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Notifications"
          description="Thông báo cần đọc nhanh, lọc dễ và có hành động rõ ràng."
          action={unreadCount > 0 ? <Button variant="outline" onClick={() => setMarkAllConfirm(true)}><CheckCheck className="h-4 w-4" />Đánh dấu tất cả đã đọc</Button> : null}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SectionCard title="Tổng thông báo"><div className="text-3xl font-semibold">{notifications.length}</div></SectionCard>
          <SectionCard title="Chưa đọc"><div className="text-3xl font-semibold">{unreadCount}</div></SectionCard>
          <SectionCard title="Trạng thái"><div className="text-3xl font-semibold">Inbox</div></SectionCard>
        </div>

        <FilterBar>
          <div className="text-sm text-slate-500">Danh sách thông báo theo dạng cuộn, mở chi tiết từng item.</div>
          <Badge variant="outline">{unreadCount} unread</Badge>
        </FilterBar>

        <div className="max-h-[calc(100vh-250px)] space-y-3 overflow-y-auto" onScroll={handleScroll}>
          {isLoading ? <ListPageSkeleton cards={2} rows={5} /> : notifications.length === 0 ? <EmptyState title="Không có thông báo nào" description="Khi có sự kiện mới, thông báo sẽ xuất hiện tại đây." icon={<Bell className="h-10 w-10" />} /> : notifications.map((n) => (<NotificationCard key={n.id} notification={n} onOpen={() => setSelected(n)} onMarkAsRead={(id, e) => handleMarkAsRead(id, e)} />))}
          {isFetchingNextPage ? <SectionCard><div className="py-4 text-center text-sm text-slate-500">Đang tải thêm...</div></SectionCard> : null}
          {!hasNextPage && notifications.length > 0 ? <SectionCard><div className="py-4 text-center text-sm text-slate-400">Đã hiển thị tất cả thông báo</div></SectionCard> : null}
        </div>
      </div>

      <ConfirmDialog open={markAllConfirm} title="Đánh dấu tất cả đã đọc?" description="Thao tác này áp dụng cho toàn bộ thông báo chưa đọc." confirmLabel="Đồng ý" onConfirm={() => { markAllAsRead(); setMarkAllConfirm(false); }} onOpenChange={setMarkAllConfirm} />

      <ConfirmDialog
        open={!!selected}
        title={selected?.title || "Chi tiết thông báo"}
        description={selected?.body || ""}
        confirmLabel="Đóng"
        onConfirm={() => setSelected(null)}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  );
}

function NotificationCard({ notification, onMarkAsRead, onOpen }: { notification: NotificationRecipientDto; onMarkAsRead: (id: string, e: React.MouseEvent) => void; onOpen: () => void; }) {
  return (
    <SectionCard className={!notification.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className={`font-medium ${!notification.isRead ? "text-slate-950" : "text-slate-700"}`}>{notification.title}</h3>
            {!notification.isRead ? <div className="h-2 w-2 rounded-full bg-blue-500" /> : null}
          </div>
          <p className="mb-3 line-clamp-3 text-sm text-slate-600">{notification.body}</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{formatTimeAgo(notification.created)}</span>
            <StatusBadge status={notification.priority} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!notification.isRead ? <Button variant="outline" size="icon-sm" onClick={(e) => onMarkAsRead(notification.id, e)}><Eye className="h-4 w-4" /></Button> : null}
          <Button variant="ghost" size="sm" onClick={onOpen}>Chi tiết</Button>
        </div>
      </div>
    </SectionCard>
  );
}
