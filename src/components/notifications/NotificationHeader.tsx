"use client";

import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export function NotificationHeader({
  unreadCount,
  onMarkAllAsRead,
}: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3">
      <h3 className="text-sm font-semibold text-slate-950">Thông báo</h3>
      {unreadCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkAllAsRead}
          className="h-auto px-2 py-1 text-xs"
        >
          <CheckCheck className="mr-1 h-3 w-3" />
          Đánh dấu tất cả đã đọc
        </Button>
      )}
    </div>
  );
}
