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
  Settings,
} from "lucide-react";
import { useRole } from "@/hooks/useRole";

const navigation = [
  {
    title: "TỔNG QUAN",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["1"], // Admin, Manager
      },
      {
        name: "Sự cố & Yêu cầu",
        href: "/dashboard/incidents",
        icon: AlertTriangle,
        roles: [ "1"], // Admin, Manager
      },
    ],
  },
  {
    title: "CẤU HÌNH",
    items: [
      {
        name: "SLA Trigger",
        href: "/dashboard/sla-trigger",
        icon: Zap,
        roles: [ "1"], // Admin, Manager
      },
      {
        name: "Workflow Builder",
        href: "/dashboard/workflow",
        icon: Workflow,
        roles: [ "1"], // Admin, Manager
      },
      {
        name: "Task Schedule",
        href: "/dashboard/task-schedule",
        icon: Calendar,
        roles: [ "1"], // Admin, Manager
      },
    ],
  },
  {
    title: "NHÂN SỰ",
    items: [
      {
        name: "Tìm nhân sự",
        href: "/dashboard/staff-search",
        icon: Users,
        roles: [ "1"], // Admin, Manager
      },
    ],
  },
  {
    title: "KHÁC",
    items: [
      {
        name: "Hợp đồng",
        href: "/dashboard/contracts",
        icon: FileText,
        roles: [ "1"], // Admin, Manager
      },
      {
        name: "Khách hàng",
        href: "/dashboard/clients",
        icon: Building2,
        roles: [ "1"], // Admin, Manager
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();

  // Filter navigation items based on user role
  const filteredNavigation = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role || "")),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#f9fafb] border-r border-gray-200 flex flex-col">
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
        {filteredNavigation.map((section) => (
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
                // More precise active check
                const isActive =
                  pathname === item.href ||
                  (pathname.startsWith(item.href + "/") &&
                    item.href !== "/dashboard");
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
