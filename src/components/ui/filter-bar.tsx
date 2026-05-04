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
        "flex flex-col gap-3 rounded-[20px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:flex-row md:flex-wrap md:items-center md:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}
