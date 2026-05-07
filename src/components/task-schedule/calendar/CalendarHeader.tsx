"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { vi } from "date-fns/locale";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: "day" | "week" | "month";
  onViewModeChange: (mode: "day" | "week" | "month") => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  const getDateRangeText = () => {
    if (viewMode === "day") {
      return format(currentDate, "dd MMMM yyyy", { locale: vi });
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(weekStart, "dd 'tháng' M", { locale: vi })} - ${format(weekEnd, "dd 'tháng' M yyyy", { locale: vi })}`;
    } else {
      return format(currentDate, "MMMM yyyy", { locale: vi });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Date Navigation */}
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onPrevious}
        className="border-gray-300"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg bg-white min-w-[220px] justify-center">
        <Calendar className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-black">
          {getDateRangeText()}
        </span>
      </div>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={onNext}
        className="border-gray-300"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Today Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToday}
        className="border-gray-300 ml-2"
      >
        Hôm nay
      </Button>

      {/* View Mode Selector */}
      <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 ml-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange("day")}
          className={
            viewMode === "day"
              ? "bg-white shadow-sm text-black"
              : "hover:bg-white/50 text-gray-600"
          }
        >
          Ngày
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange("week")}
          className={
            viewMode === "week"
              ? "bg-white shadow-sm text-black"
              : "hover:bg-white/50 text-gray-600"
          }
        >
          Tuần
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange("month")}
          className={
            viewMode === "month"
              ? "bg-white shadow-sm text-black"
              : "hover:bg-white/50 text-gray-600"
          }
        >
          Tháng
        </Button>
      </div>
    </div>
  );
}
