"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GitBranch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SupervisorSidebar() {
  const pathname = usePathname();

  const items = [
    { name: "AI Retrain Flow", href: "/supervisor/ai-retrain", icon: GitBranch },
  ];

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-[var(--app-sidebar-width)] flex-col border-r border-slate-200/70 bg-white/85 backdrop-blur-2xl">
      <div className="flex h-[var(--app-header-height)] flex-shrink-0 items-center border-b border-slate-200/70 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20">
            <span className="text-[18px] font-bold text-white">S</span>
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              CleanOPS AI
            </p>
            <p className="text-[18px] font-semibold text-slate-950">Supervisor</p>
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
                      layoutId="supervisor-active-border"
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
