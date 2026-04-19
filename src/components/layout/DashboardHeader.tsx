"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Bell, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogoutConfirmation } from "@/components/ui/logout-confirmation";
import { NotificationDropdown } from "./NotificationDropdown";
import { useLogout } from "@/hooks/useLogout";

export function DashboardHeader() {
  const { user } = useAuth();
  const {
    isLoggingOut,
    showLogoutDialog,
    setShowLogoutDialog,
    handleLogoutClick,
    handleLogoutConfirm,
    handleLogoutCancel,
  } = useLogout();

  return (
    <header className="fixed top-0 left-[263px] right-0 h-[106px] bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between h-full px-8">
        {/* Left side - CleanOPS logo and user info */}
        <div className="flex items-center gap-6">
          {/* User Welcome Message */}
          <div className="text-left">
            <p className="text-[14px] text-gray-500 leading-tight">Welcome,</p>
            <p className="text-[18px] font-semibold text-gray-900 leading-tight">
              {user?.fullName || "User"}
            </p>
          </div>
        </div>

        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <NotificationDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#1a80a2] text-white text-sm">
                    {user?.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogoutClick}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmation
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </header>
  );
}
