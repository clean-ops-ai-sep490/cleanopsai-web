"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white/50 p-4 shadow-none md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}
