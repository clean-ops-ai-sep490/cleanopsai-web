"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  BadgeCheck,
  FileText,
  Layers,
  LayersPlus,
  MapPin,
  User2,
  Users,
  Workflow,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useLoading } from "@/contexts/LoadingContext";

export function AdminSidebar() {
  const pathname = usePathname();

  const items = [
    { name: "Người dùng", href: "/admin/users", icon: Users },
    { name: "Bước", href: "/admin/steps", icon: Workflow },
    { name: "Điểm kiểm tra", href: "/admin/workarea-checkin", icon: MapPin },
    {
      name: "Cấp chứng chỉ và kỹ năng",
      href: "/admin/qualifications",
      icon: BadgeCheck,
    },
    { name: "Vị trí", href: "/admin/locations", icon: MapPin },
    { name: "Khu vực", href: "/admin/zones", icon: Layers },
    { name: "Khu vực làm việc", href: "/admin/workareas", icon: LayersPlus },
    {name: "Chi tiết khu vực làm việc", href: "/admin/workarea-details", icon: LayersPlus },
    { name: "Hợp đồng", href: "/admin/contracts", icon: FileText },
    { name: "Khách hàng", href: "/admin/clients", icon: User2 },
  ];

  const { startLoading } = useLoading();

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-[var(--app-sidebar-width)] flex-col border-r border-slate-200/70 bg-white/85 backdrop-blur-2xl">
      <div className="flex h-[var(--app-header-height)] flex-shrink-0 items-center border-b border-slate-200/70 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
            <span className="text-[18px] font-bold text-white">A</span>
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              CleanOPS AI
            </p>
            <p className="text-[18px] font-semibold text-slate-950">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-5 scrollbar-thin">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
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
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-0 bg-primary-soft"
                      />
                    )}
                  </AnimatePresence>

                  <Icon
                    className={cn(
                      "relative z-10 mr-4 h-5 w-5 transition-colors duration-200",
                      isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600",
                    )}
                  />
                  <span className="relative z-10 flex-1">{item.name}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="admin-active-border"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute right-0 top-0 bottom-0 w-1 bg-primary z-20"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
