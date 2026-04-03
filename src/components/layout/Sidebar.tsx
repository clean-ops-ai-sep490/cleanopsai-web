"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  AlertTriangle,
  Zap,
  Workflow,
  Calendar,
  Users,
  FileText,
  Building2,
} from "lucide-react";

const navigation = [
  {
    title: "TỔNG QUAN",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        name: "Sự cố & Yêu cầu",
        href: "/dashboard/incidents",
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: "CẤU HÌNH",
    items: [
      { name: "SLA Trigger", href: "/dashboard/sla-trigger", icon: Zap },
      {
        name: "Workflow Builder",
        href: "/dashboard/workflow-builder",
        icon: Workflow,
      },
      {
        name: "Task Schedule",
        href: "/dashboard/task-schedule",
        icon: Calendar,
      },
    ],
  },
  {
    title: "NHÂN SỰ",
    items: [
      { name: "Tìm nhân sự", href: "/dashboard/staff-search", icon: Users },
    ],
  },
  {
    title: "KHÁC",
    items: [
      { name: "Hợp đồng", href: "/dashboard/contracts", icon: FileText },
      { name: "Khách hàng", href: "/dashboard/clients", icon: Building2 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-[#f9fafb] border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-[106px] flex items-center px-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-[58px] h-[58px] bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[20px]">C</span>
          </div>
          <span
            className="text-[18px] font-semibold whitespace-nowrap"
            style={{ color: "black" }}
          >
            leanOPS
          </span>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 py-5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navigation.map((section) => (
          <div key={section.title} className="mb-2">
            <h2
              className="text-[14px] font-semibold mb-4 px-[18px] tracking-normal"
              style={{ color: "#8d8d8d" }}
            >
              {section.title}
            </h2>
            <ul
              className="space-y-2"
              style={{ listStyle: "none", paddingLeft: 0 }}
            >
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;

                return (
                  <li key={item.name} style={{ listStyle: "none" }}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center py-3 px-[18px] text-[16px] font-medium transition-colors relative no-underline",
                        isActive
                          ? "bg-[#1a80a2] text-white rounded-tr-[10px]"
                          : "text-black hover:text-[#1a80a2]",
                      )}
                      style={{
                        textDecoration: "none",
                      }}
                    >
                      <IconComponent
                        className={cn(
                          "w-5 h-5 flex-shrink-0 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-black group-hover:text-[#1a80a2]",
                        )}
                        style={{ marginRight: "10px" }}
                      />
                      <span
                        className={cn(
                          "transition-colors",
                          isActive
                            ? "text-white"
                            : "text-black group-hover:text-[#1a80a2]",
                        )}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
