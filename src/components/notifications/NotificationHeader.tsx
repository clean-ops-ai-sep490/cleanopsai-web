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
    <div className="flex items-center justify-between p-3 border-b">
      <h3 className="font-semibold text-sm">Thông báo</h3>
      {unreadCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkAllAsRead}
          className="text-xs h-auto p-1"
        >
          <CheckCheck className="h-3 w-3 mr-1" />
          Đánh dấu tất cả đã đọc
        </Button>
      )}
    </div>
  );
}
