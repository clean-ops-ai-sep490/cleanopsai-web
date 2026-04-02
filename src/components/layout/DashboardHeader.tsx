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

export function DashboardHeader() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="fixed top-0 left-[200px] right-0 h-[106px] bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between h-full px-8">
        {/* Left side - CleanOPS logo and user info */}
        <div className="flex items-center gap-6">
          {/* CleanOPS Logo */}
          <div className="flex items-center gap-3">
            <span className="text-[18px] font-semibold text-black">
              leanOPS
            </span>
          </div>

          {/* User Welcome Message */}
          <div className="text-left">
            <p className="text-[11px] text-gray-500 leading-tight">Welcome,</p>
            <p className="text-[15px] font-semibold text-gray-900 leading-tight">
              {user?.fullName || "Nguyen Van A"}
            </p>
          </div>
        </div>

        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-6 w-6 text-black" />
            {/* Notification badge - can be conditionally shown */}
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Avatar with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-12 w-12 rounded-full"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-[#1a80a2] text-white text-lg">
                    {user?.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {user?.fullName || "Nguyen Van A"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "user@example.com"}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
