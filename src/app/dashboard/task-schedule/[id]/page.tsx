"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Clock,
  MapPin,
  User,
  Calendar,
  FileText,
  Settings,
  Loader2,
} from "lucide-react";
import {
  useTaskSchedule,
  useActivateTaskSchedule,
  useDeactivateTaskSchedule,
} from "@/hooks/useTaskSchedules";

export default function TaskScheduleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: schedule, isLoading, error } = useTaskSchedule(id);
  const activateMutation = useActivateTaskSchedule();
  const deactivateMutation = useDeactivateTaskSchedule();

  const handleToggleStatus = () => {
    if (!schedule) return;

    if (schedule.isActive) {
      deactivateMutation.mutate(schedule.id);
    } else {
      activateMutation.mutate(schedule.id);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#1a80a2]" />
          <span className="ml-2 text-[#70808f]">
            Đang tải thông tin lịch trình...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !schedule) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">
            Không thể tải thông tin lịch trình
          </p>
          <Link href="/dashboard/task-schedule">
            <Button variant="outline" className="border-[#e5e5e5]">
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/task-schedule">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-[22px] font-medium text-black mb-1">
              {schedule.name}
            </h1>
            <p className="text-sm text-[#70808f]">
              Chi tiết lịch trình công việc
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={
              activateMutation.isPending || deactivateMutation.isPending
            }
            className="border-[#e5e5e5]"
          >
            {schedule.isActive ? "Tạm dừng" : "Kích hoạt"}
          </Button>

          <Link href={`/dashboard/task-schedule/${id}/edit`}>
            <Button className="bg-[#1a80a2] hover:bg-[#308cab] text-white h-[40px] rounded-[5px] px-4 flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="bg-white rounded-[8px] p-6 border">
            <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Thông tin cơ bản
            </h2>

            <div className="space-y-4">
              {schedule.description && (
                <div>
                  <label className="text-sm font-medium text-[#70808f]">
                    Mô tả
                  </label>
                  <p className="text-black mt-1">{schedule.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#70808f]">
                    Thời gian thực hiện
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-[#70808f]" />
                    <span className="text-black">
                      {schedule.durationMinutes} phút
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#70808f]">
                    Loại lặp lại
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-[#70808f]" />
                    <span className="text-black">
                      {schedule.recurrenceType}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Assignment Info */}
          <Card className="bg-white rounded-[8px] p-6 border">
            <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin phân công
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#70808f]">
                  Người thực hiện
                </label>
                <p className="text-black mt-1">{schedule.assigneeName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-[#70808f]">
                  Địa điểm
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-[#70808f]" />
                  <span className="text-black">{schedule.displayLocation}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Recurrence Configuration */}
          {schedule.recurrenceConfig && (
            <Card className="bg-white rounded-[8px] p-6 border">
              <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Cấu hình lặp lại
              </h2>

              <div className="space-y-4">
                {schedule.recurrenceConfig.times &&
                  schedule.recurrenceConfig.times.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-[#70808f]">
                        Thời gian trong ngày
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {schedule.recurrenceConfig.times.map((time, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {schedule.recurrenceConfig.daysOfWeek &&
                  schedule.recurrenceConfig.daysOfWeek.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-[#70808f]">
                        Ngày trong tuần
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {schedule.recurrenceConfig.daysOfWeek.map(
                          (day, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {day}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {schedule.recurrenceConfig.daysOfMonth &&
                  schedule.recurrenceConfig.daysOfMonth.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-[#70808f]">
                        Ngày trong tháng
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {schedule.recurrenceConfig.daysOfMonth.map(
                          (day, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              Ngày {day}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contract Period */}
          <Card className="bg-white rounded-[8px] p-6 border">
            <h3 className="text-base font-semibold text-black mb-4">
              Thời gian hợp đồng
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-[#70808f]">
                  Ngày bắt đầu
                </label>
                <p className="text-black mt-1">
                  {new Date(schedule.contractStartDate).toLocaleDateString(
                    "vi-VN",
                  )}
                </p>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-[#70808f]">
                  Ngày kết thúc
                </label>
                <p className="text-black mt-1">
                  {new Date(schedule.contractEndDate).toLocaleDateString(
                    "vi-VN",
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* System Info */}
          <Card className="bg-white rounded-[8px] p-6 border">
            <h3 className="text-base font-semibold text-black mb-4">
              Thông tin hệ thống
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-[#70808f]">SOP ID</label>
                <p className="text-black font-mono text-xs break-all">
                  {schedule.sopId}
                </p>
              </div>

              <Separator />

              <div>
                <label className="text-[#70808f]">Work Area ID</label>
                <p className="text-black font-mono text-xs break-all">
                  {schedule.workAreaId}
                </p>
              </div>

              <Separator />

              <div>
                <label className="text-[#70808f]">Assignee ID</label>
                <p className="text-black font-mono text-xs break-all">
                  {schedule.assigneeId}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
