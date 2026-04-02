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
      { name: "Thêm hợp đồng", href: "/dashboard/contracts", icon: FileText },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-[#f9fafb] border-r border-gray-200">
      {/* Logo */}
      <div className="h-[106px] flex items-center px-6 border-b border-gray-200">
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

      {/* Navigation */}
      <nav className="py-8">
        {navigation.map((section) => (
          <div key={section.title} className="mb-10">
            <h2
              className="text-[14px] font-semibold mb-4 px-[18px] tracking-normal"
              style={{ color: "#8d8d8d" }}
            >
              {section.title}
            </h2>
            <ul
              className="space-y-8"
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
                        "flex items-center py-6 px-[18px] text-[16px] font-semibold transition-colors relative no-underline",
                        isActive
                          ? "bg-[#1a80a2] text-white rounded-tr-[10px]"
                          : "text-black hover:bg-gray-100 hover:text-black",
                      )}
                      style={{
                        color: isActive ? "white" : "black",
                        textDecoration: "none",
                      }}
                    >
                      <IconComponent
                        className="w-5 h-5 flex-shrink-0"
                        style={{ marginRight: "10px" }}
                      />
                      <span>{item.name}</span>
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
