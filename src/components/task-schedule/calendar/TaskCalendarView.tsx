"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { CalendarFilters } from "./CalendarFilters";
import { CalendarGrid } from "./CalendarGrid";
import { useRouter } from "next/navigation";
import { format, addDays, subDays } from "date-fns";
import { vi } from "date-fns/locale";

export function TaskCalendarView() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const handlePrevious = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleExport = () => {
    console.log("Export calendar data");
  };

  const handleCreateTask = () => {
    router.push("/dashboard/task-schedule/create");
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Lịch công việc
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Theo dõi và quản lý lịch trình công việc
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-gray-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Xuất
            </Button>

            <Button
              className="bg-[#1a80a2] hover:bg-[#308cab] text-white"
              size="sm"
              onClick={handleCreateTask}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo mới
            </Button>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Filters */}
          <div className="flex items-center gap-4">
            <CalendarFilters
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          </div>

          {/* Center: Date Navigation */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              className="border-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white min-w-[200px] justify-center">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                {format(currentDate, "dd 'tháng' MM, yyyy", { locale: vi })}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="border-gray-300"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="border-gray-300 ml-2"
            >
              Hôm nay
            </Button>
          </div>

          {/* Right: Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm nhân viên, địa điểm..."
              className="pl-10 bg-white border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        <CalendarGrid
          currentDate={currentDate}
          searchQuery={searchQuery}
          selectedFilter={selectedFilter}
        />
      </div>
    </div>
  );
}
