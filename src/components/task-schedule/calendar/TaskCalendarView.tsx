"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { CalendarFilters } from "./CalendarFilters";
import { CalendarGrid } from "./CalendarGrid";
import { useRouter } from "next/navigation";
import { format, addDays, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import { PageHeader } from "@/components/ui/page-header";

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

  return (
    <div className="flex flex-col space-y-4 w-full h-full animate-in fade-in duration-300">
      <div className="flex-none">
        <PageHeader 
          title="Lịch công việc" 
          description="Theo dõi chi tiết tiến độ công việc theo dòng thời gian thực tế." 
          action={
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/manager/task-schedule")}
                className="rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Button>
            </div>
          } 
        />
      </div>

      <Card className="p-0 border-none shadow-none bg-transparent flex-none space-y-4">
        {/* Row 1: Tabs/Filters */}
        <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-200/60">
          <CalendarFilters
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        </div>

        {/* Row 2: Date Navigation & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/60">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="h-9 w-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 rounded-xl min-w-[240px] justify-center text-slate-900 border border-slate-100">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold tracking-tight">
                {format(currentDate, "EEEE, dd 'tháng' MM, yyyy", { locale: vi })}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-9 w-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden sm:block" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-9 px-4 rounded-xl font-bold text-slate-600 hover:text-primary hover:bg-primary/5"
            >
              Hôm nay
            </Button>
          </div>

          <div className="relative flex-1 lg:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Tìm kiếm nhân viên, địa điểm công tác..."
              className="pl-11 h-12 bg-white border-slate-200/60 rounded-2xl shadow-sm focus:ring-primary/20 focus:border-primary transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Calendar Content */}
      <Card className="flex-1 overflow-hidden flex flex-col bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-slate-200/60">
        <CalendarGrid
          currentDate={currentDate}
          searchQuery={searchQuery}
          selectedFilter={selectedFilter}
        />
      </Card>
    </div>
  );
}
