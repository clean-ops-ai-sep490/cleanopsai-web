"use client";

import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut } from "lucide-react";
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

interface DashboardHeaderProps {}

export function DashboardHeader({}: DashboardHeaderProps = {}) {
  const { user } = useAuth();
  const {
    isLoggingOut,
    showLogoutDialog,
    setShowLogoutDialog,
    handleLogoutClick,
    handleLogoutConfirm,
  } = useLogout();

  return (
    <header
      className="fixed right-0 top-0 z-10 h-[var(--app-header-height)] border-b border-slate-200/70 bg-white/85 backdrop-blur-2xl"
      style={{ left: "var(--app-sidebar-width)" }}
    >
      <div className="flex h-full items-center justify-between px-6">
        <div className="text-left">
          <p className="text-sm leading-tight text-slate-500">Xin chào,</p>
          <p className="text-lg font-semibold leading-tight text-slate-950">
            {user?.fullName || "Người dùng"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <NotificationDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 border-0 bg-transparent p-2 shadow-none hover:bg-slate-50"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-sm text-white">
                    {user?.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Hồ sơ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogoutClick}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <LogoutConfirmation
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </header>
  );
}
