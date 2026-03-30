"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="mb-6">
          <p className="text-[13px] text-gray-600">Welcome,</p>
          <h1 className="text-[20px] font-semibold text-gray-900">
            {user?.fullName || "Nguyen Van A"}
          </h1>
        </div>

        {/* Top 4 cards with gradients */}
        <div className="grid grid-cols-4 gap-5">
          {/* Card 1 - Pink gradient */}
          <div className="h-[120px] bg-white border border-gray-400 rounded-lg relative overflow-hidden shadow-sm">
            <div className="absolute bottom-0 right-0 w-40 h-20 bg-gradient-to-tl from-pink-300 via-pink-200 to-transparent opacity-70" />
          </div>

          {/* Card 2 - Green gradient */}
          <div className="h-[120px] bg-white border border-gray-400 rounded-lg relative overflow-hidden shadow-sm">
            <div className="absolute bottom-0 right-0 w-40 h-20 bg-gradient-to-tl from-green-300 via-green-200 to-transparent opacity-70" />
          </div>

          {/* Card 3 - Blue gradient */}
          <div className="h-[120px] bg-white border border-gray-400 rounded-lg relative overflow-hidden shadow-sm">
            <div className="absolute bottom-0 right-0 w-40 h-20 bg-gradient-to-tl from-blue-300 via-blue-200 to-transparent opacity-70" />
          </div>

          {/* Card 4 - Light green gradient */}
          <div className="h-[120px] bg-white border border-gray-400 rounded-lg relative overflow-hidden shadow-sm">
            <div className="absolute bottom-0 right-0 w-40 h-20 bg-gradient-to-tl from-lime-300 via-lime-200 to-transparent opacity-70" />
          </div>
        </div>

        {/* Middle 2 cards */}
        <div className="grid grid-cols-2 gap-5">
          <div className="h-[280px] bg-white border border-gray-400 rounded-lg shadow-sm" />
          <div className="h-[280px] bg-white border border-gray-400 rounded-lg shadow-sm" />
        </div>

        {/* Bottom large card */}
        <div className="h-[250px] bg-white border border-gray-400 rounded-lg shadow-sm" />
      </div>
    </DashboardLayout>
  );
}
