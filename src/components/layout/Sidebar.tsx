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
  MapPin,
} from "lucide-react";
import { useRole, UserRole } from "@/hooks/useRole";
import { motion, AnimatePresence } from "framer-motion";
import { useLoading } from "@/contexts/LoadingContext";

const navigation = [
  {
    title: "TỔNG QUAN",
    items: [
      {
        name: "Bảng điều khiển",
        href: "/manager",
        icon: LayoutDashboard,
        roles: [UserRole.Manager],
      },
      {
        name: "Sự cố & Yêu cầu",
        href: "/manager/incidents",
        icon: AlertTriangle,
        roles: [UserRole.Manager],
      },
    ],
  },
  {
    title: "CẤU HÌNH",
    items: [
      {
        name: "Bộ kích hoạt SLA",
        href: "/manager/sla-trigger",
        icon: Zap,
        roles: [UserRole.Manager],
      },
      {
        name: "Quy trình làm việc",
        href: "/manager/workflow",
        icon: Workflow,
        roles: [UserRole.Manager],
      },
      {
        name: "Lịch trình công việc",
        href: "/manager/task-schedule",
        icon: Calendar,
        roles: [UserRole.Manager],
      },
      {
        name: "Quản lý giám sát khu vực",
        href: "/manager/work-area-supervisors",
        icon: MapPin,
        roles: [UserRole.Manager],
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();

  const { startLoading } = useLoading();
  const filteredNavigation = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => role && item.roles.includes(role as UserRole),
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-[var(--app-sidebar-width)] flex-col border-r border-slate-200/70 bg-white/85 shadow-[8px_0_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
      <div className="flex h-[var(--app-header-height)] flex-shrink-0 items-center border-b border-slate-200/70 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 shadow-lg shadow-teal-500/20">
            <span className="text-[18px] font-extrabold tracking-tight text-white">
              C
            </span>
          </div>
          <div className="leading-tight">
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              CleanOPS AI
            </p>
            <p className="text-[18px] font-semibold text-slate-950">
              Operations
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-5 scrollbar-thin">
        {filteredNavigation.map((section) => (
          <div key={section.title} className="mb-6">
            <h2 className="px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400/80">
              {section.title}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (pathname.startsWith(item.href + "/") &&
                    item.href !== "/manager");
                const IconComponent = item.icon;

                return (
                  <li key={item.name} className="list-none">
                    <Link
                      href={item.href}
                      onClick={() => !isActive && startLoading(`Đang chuyển tới ${item.name}...`)}
                      className={cn(
                        "group relative flex items-center px-6 py-3.5 text-[15px] font-medium transition-colors duration-200 no-underline cursor-pointer",
                        isActive
                          ? "text-primary"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                      )}
                    >
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ scaleX: 0, originX: 1, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            exit={{ scaleX: 0, originX: 1, opacity: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                            className="absolute inset-0 bg-primary-soft"
                          />
                        )}
                      </AnimatePresence>

                      <IconComponent
                        className={cn(
                          "relative z-10 mr-4 h-5 w-5 transition-colors duration-200",
                          isActive
                            ? "text-primary"
                            : "text-slate-400 group-hover:text-slate-600",
                        )}
                      />
                      <span className="relative z-10 flex-1">{item.name}</span>

                      {isActive && (
                        <motion.div
                          layoutId="manager-active-border"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                          className="absolute right-0 top-0 bottom-0 w-1 bg-primary z-20"
                        />
                      )}
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
