"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "TỔNG QUAN",
    items: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Sự cố & Yêu cầu", href: "/dashboard/incidents" },
    ],
  },
  {
    title: "CẤU HÌNH",
    items: [
      { name: "SLA Trigger", href: "/dashboard/sla-trigger" },
      { name: "Workflow Builder", href: "/dashboard/workflow-builder" },
      { name: "Task Schedule", href: "/dashboard/task-schedule" },
    ],
  },
  {
    title: "NHÂN SỰ",
    items: [{ name: "Tìm nhân sự", href: "/dashboard/staff-search" }],
  },
  {
    title: "KHÁC",
    items: [{ name: "Thêm hợp đồng", href: "/dashboard/contracts" }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[180px] bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="h-[75px] flex items-center px-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-[32px] h-[32px] bg-[#1a9cb8] rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[16px]">C</span>
          </div>
          <span className="text-[15px] font-semibold text-gray-900 whitespace-nowrap">
            CleanOPS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-5">
        {navigation.map((section) => (
          <div key={section.title} className="mb-7">
            <h2 className="text-[10px] font-semibold text-[#999] mb-3 px-5 tracking-wider">
              {section.title}
            </h2>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block py-2.5 px-5 text-[13px] font-normal transition-colors",
                        isActive
                          ? "bg-[#1a9cb8] text-white"
                          : "text-gray-800 hover:bg-gray-50",
                      )}
                    >
                      {item.name}
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
