"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-black mb-2">
          Không có quyền truy cập
        </h1>

        <p className="text-gray-600 mb-6">
          Tài khoản của bạn ({user?.email}) không có quyền truy cập vào Web App.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-900 font-medium mb-2">
            Quyền truy cập Web App:
          </p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Admin - Toàn quyền quản trị hệ thống</li>
            <li>✓ Manager - Quản lý SLA, Workflow, Contracts</li>
            <li>✗ Supervisor - Chỉ sử dụng Mobile App</li>
            <li>✗ Worker - Chỉ sử dụng Mobile App</li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Nếu bạn là Supervisor hoặc Worker, vui lòng sử dụng Mobile App.
          </p>

          <div className="flex gap-3">
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full">
                Đăng nhập tài khoản khác
              </Button>
            </Link>
            <Button onClick={() => logout()} className="flex-1">
              Đăng xuất
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
