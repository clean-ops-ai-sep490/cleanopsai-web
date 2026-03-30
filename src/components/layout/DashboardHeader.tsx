"use client";

import { useAuth } from "@/contexts/AuthContext";

export function DashboardHeader() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-[155px] right-0 h-[70px] bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-end h-full px-8">
        <div className="text-left">
          <p className="text-[11px] text-gray-500 leading-tight">Welcome,</p>
          <p className="text-[15px] font-semibold text-gray-900 leading-tight">
            {user?.fullName || "Nguyen Van A"}
          </p>
        </div>
      </div>
    </header>
  );
}
