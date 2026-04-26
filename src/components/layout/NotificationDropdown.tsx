"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { NotificationHeader } from "@/components/notifications/NotificationHeader";
import { NotificationList } from "@/components/notifications/NotificationList";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAllAsRead,
  } = useNotifications();

  const {
    handleNotificationClick,
    handleMarkAsRead,
    navigateToAllNotifications,
  } = useNotificationActions();

  // Handle dropdown open/close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && notifications.length === 0) {
      loadNotifications();
    }
  };

  // Handle mark all as read
  const handleMarkAllAsReadClick = async () => {
    await markAllAsRead();
  };

  // Handle notification click with dropdown close
  const handleNotificationClickWithClose = async (notification: any) => {
    setIsOpen(false);
    await handleNotificationClick(notification);
  };

  // Handle view all notifications
  const handleViewAllClick = () => {
    setIsOpen(false);
    navigateToAllNotifications();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xl"
          className="relative hover:bg-transparent !border-0 shadow-none rounded-md ring-0 focus-visible:ring-0"
        >
          <Bell className="h-6 w-6 text-gray-600" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <NotificationHeader
          unreadCount={unreadCount}
          onMarkAllAsRead={handleMarkAllAsReadClick}
        />

        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          onMarkAsRead={handleMarkAsRead}
          onNotificationClick={handleNotificationClickWithClose}
        />

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center text-sm text-blue-600 cursor-pointer"
              onClick={handleViewAllClick}
            >
              Xem tất cả thông báo
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
