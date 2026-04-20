"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaginationWithInfo } from "@/components/ui/pagination";
import {
  Search,
  Loader2,
  Clock,
  MapPin,
  User,
  Calendar,
  UserPlus,
} from "lucide-react";
import {
  useTaskSchedules,
  useActivateTaskSchedule,
  useDeactivateTaskSchedule,
} from "@/hooks/useTaskSchedules";
import { usePagination } from "@/hooks/usePagination";
import { Switch } from "@/components/ui/switch";
import { AssignTaskScheduleDialog } from "@/components/task-schedule/dialogs/AssignTaskScheduleDialog";

export default function TaskScheduleListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Initialize pagination
  const pagination = usePagination({
    initialPageSize: 10,
  });

  const {
    data: taskSchedulesData,
    isLoading,
    error,
  } = useTaskSchedules({
    pageNumber: pagination.currentPage,
    pageSize: pagination.pageSize,
    search: searchQuery || undefined,
  });

  const activateMutation = useActivateTaskSchedule();
  const deactivateMutation = useDeactivateTaskSchedule();

  const taskSchedules = taskSchedulesData?.content || [];
  const totalPages = taskSchedulesData?.totalPages || 0;
  const totalElements = taskSchedulesData?.totalElements || 0;
  const isEmpty = taskSchedules.length === 0;

  const handleToggleStatus = (schedule: any) => {
    if (schedule.isActive) {
      deactivateMutation.mutate(schedule.id);
    } else {
      activateMutation.mutate(schedule.id);
    }
  };

  const handleOpenAssignDialog = (schedule: any) => {
    setSelectedSchedule({
      id: schedule.id,
      name: schedule.name,
    });
    setAssignDialogOpen(true);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-black mb-2">
            Task Schedule Management
          </h1>
          <p className="text-sm text-[#70808f]">Quản lý lịch trình công việc</p>
        </div>
        <Link href="/dashboard/task-schedule/create">
          <Button className="bg-[#1a80a2] hover:bg-[#308cab] text-white h-[40px] rounded-[5px] px-6 flex items-center gap-2">
            Tạo task mới
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#70808f]" />
          <Input
            placeholder="Tìm kiếm lịch trình..."
            className="pl-10 bg-white border-[#e5e5e5] h-[40px]"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              pagination.goToFirstPage(); // Reset to first page when searching
            }}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#1a80a2]" />
          <span className="ml-2 text-[#70808f]">Đang tải lịch trình...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">
            Không thể tải danh sách lịch trình
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-[#e5e5e5]"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && isEmpty && (
        <div className="text-center py-12">
          <p className="text-[#70808f] mb-4">
            {searchQuery
              ? "Không tìm thấy lịch trình nào"
              : "Chưa có lịch trình nào"}
          </p>
        </div>
      )}

      {/* Task Schedule List */}
      {!isLoading && !error && !isEmpty && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {taskSchedules.map((schedule) => (
              <Card
                key={schedule.id}
                className="bg-white rounded-[8px] p-6 hover:shadow-lg transition-shadow border"
              >
                <div className="flex items-start justify-between mb-4">
                  <Link
                    href={`/dashboard/task-schedule/${schedule.id}`}
                    className="flex-1"
                  >
                    <h3 className="text-base font-semibold text-black line-clamp-2 hover:text-[#1a80a2] transition-colors">
                      {schedule.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-3 ml-2">
                    <Badge
                      variant={schedule.isActive ? "default" : "secondary"}
                      className={
                        schedule.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {schedule.isActive ? "Hoạt động" : "Tạm dừng"}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(schedule)}
                        disabled={
                          activateMutation.isPending ||
                          deactivateMutation.isPending
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a80a2] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          schedule.isActive ? "bg-[#1a80a2]" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            schedule.isActive
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {schedule.description && (
                  <p className="text-sm text-[#70808f] mb-4 line-clamp-2">
                    {schedule.description}
                  </p>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#70808f]" />
                    <span className="text-[#70808f]">Người thực hiện:</span>
                    <span className="text-black font-medium">
                      {schedule.assigneeName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#70808f]" />
                    <span className="text-[#70808f]">Địa điểm:</span>
                    <span className="text-black font-medium line-clamp-1">
                      {schedule.displayLocation}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#70808f]" />
                    <span className="text-[#70808f]">Thời gian:</span>
                    <span className="text-black font-medium">
                      {schedule.durationMinutes} phút
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#70808f]" />
                    <span className="text-[#70808f]">Lặp lại:</span>
                    <span className="text-black font-medium">
                      {schedule.recurrenceType}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenAssignDialog(schedule)}
                    className="w-full border-[#1a80a2] text-[#1a80a2] hover:bg-[#1a80a2] hover:text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Task
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8">
            <PaginationWithInfo
              currentPage={pagination.currentPage}
              totalPages={totalPages || 1}
              pageSize={pagination.pageSize}
              totalElements={totalElements}
              onPageChange={pagination.setPage}
            />
          </div>
        </>
      )}

      {/* Assign Task Schedule Dialog */}
      {selectedSchedule && (
        <AssignTaskScheduleDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          taskScheduleId={selectedSchedule.id}
          taskScheduleName={selectedSchedule.name}
        />
      )}
    </DashboardLayout>
  );
}
