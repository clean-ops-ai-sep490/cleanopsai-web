"use client";

import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";

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
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      activeBg: "bg-gray-600",
    },
    {
      id: "NotStarted",
      label: "Chưa bắt đầu",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      activeBg: "bg-orange-500",
    },
    {
      id: "InProgress",
      label: "Đang làm",
      icon: AlertCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      activeBg: "bg-blue-500",
    },
    {
      id: "Completed",
      label: "Hoàn thành",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
      activeBg: "bg-green-500",
    },
    {
      id: "Cancelled",
      label: "Đã hủy",
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      activeBg: "bg-gray-500",
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isSelected = selectedFilter === filter.id;

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isSelected
                ? `${filter.activeBg} text-white shadow-md`
                : `${filter.bgColor} ${filter.color} hover:shadow-sm border border-transparent hover:border-gray-200`
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}
