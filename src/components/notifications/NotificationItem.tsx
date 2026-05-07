"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { NotificationRecipientDto } from "@/types/notification";
import { formatTimeAgo } from "@/lib/utils/date-utils";

interface NotificationItemProps {
  notification: NotificationRecipientDto;
  onMarkAsRead: (notificationId: string, event: React.MouseEvent) => void;
  onClick: (notification: NotificationRecipientDto) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  return (
    <DropdownMenuItem
      className="p-0 cursor-pointer"
      onClick={() => onClick(notification)}
    >
      <div
        className={`w-full p-3 border-b last:border-b-0 ${
          !notification.isRead ? "bg-blue-50" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4
                className={`text-sm font-medium truncate ${
                  !notification.isRead ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {notification.title}
              </h4>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-600 line-clamp-2 mb-1">
              {notification.body}
            </p>
            <p className="text-xs text-gray-400">
              {formatTimeAgo(notification.created)}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onMarkAsRead(notification.notificationId, e)}
                className="h-6 w-6 p-0"
                title="Đánh dấu đã đọc"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </DropdownMenuItem>
  );
}
