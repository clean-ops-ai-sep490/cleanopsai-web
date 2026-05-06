"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <div 
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--app-radius-sm)] border border-slate-100 bg-white shadow-none",
        className
      )}
    >
      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-50/50">
          <div className="space-y-1">
            {title && (
              <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-[12px] text-slate-400 font-medium">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="px-6 py-6 flex-1 flex flex-col">{children}</div>
    </div>
  );
}
