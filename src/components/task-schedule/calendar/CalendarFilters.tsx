"use client";

import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export function CalendarFilters({
  selectedFilter,
  onFilterChange,
}: CalendarFiltersProps) {
  const filters = [
    {
      id: "all",
      label: "Tất cả",
      icon: null,
      color: "text-slate-900",
      activeColor: "border-primary text-primary",
    },
    {
      id: "NotStarted",
      label: "Chưa bắt đầu",
      icon: Clock,
      color: "text-amber-600",
      activeColor: "border-amber-500 text-amber-600",
    },
    {
      id: "InProgress",
      label: "Đang làm",
      icon: AlertCircle,
      color: "text-blue-600",
      activeColor: "border-blue-500 text-blue-600",
    },
    {
      id: "Completed",
      label: "Hoàn thành",
      icon: CheckCircle2,
      color: "text-emerald-600",
      activeColor: "border-emerald-500 text-emerald-600",
    },
    {
      id: "Cancelled",
      label: "Đã hủy",
      icon: XCircle,
      color: "text-slate-500",
      activeColor: "border-slate-500 text-slate-600",
    },
  ];

  return (
    <div className="flex items-center gap-6 border-b border-slate-200 w-full overflow-x-auto px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isSelected = selectedFilter === filter.id;

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "flex items-center gap-2 py-3 px-1 border-b-2 transition-all duration-200 relative whitespace-nowrap",
              isSelected
                ? filter.activeColor
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            {Icon && <Icon className={cn("w-4 h-4", isSelected ? "" : "opacity-60")} />}
            <span className="text-sm font-bold tracking-tight">
              {filter.label}
            </span>
            {isSelected && (
              <span className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-current rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

