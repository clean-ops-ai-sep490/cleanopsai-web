"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  Users,
  CheckCircle2,
  Activity,
  Building,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSLAWithDetails, useDeleteSLA } from "@/hooks/useSLAQuery";
import { translateServiceType } from "@/lib/utils/translate";

export default function SLADetailPage() {
  const params = useParams();
  const router = useRouter();
  const slaId = params.id as string;
  const [slaDeleted, setSlaDeleted] = useState(false);

  const { sla, shifts, tasks, isLoading, error } = useSLAWithDetails(slaId);

  const deleteSOPMutation = useDeleteSLA(() => {
    setSlaDeleted(true);
    router.push("/manager/sla-trigger");
  });

  const handleDelete = async () => {
    if (!sla || !confirm("Bạn có chắc chắn muốn xóa SLA này?")) return;
    deleteSOPMutation.mutate(sla.id);
  };

  const getTotalWorkers = () => {
    return shifts.reduce((total, shift) => total + shift.requiredWorker, 0);
  };

  const getRecurrenceText = (recurrenceType: string) => {
    switch (recurrenceType) {
      case "Daily":
        return "Hàng ngày";
      case "Weekly":
        return "Hàng tuần";
      case "Monthly":
        return "Hàng tháng";
      case "Yearly":
        return "Hàng năm";
      default:
        return recurrenceType;
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-[#70808f]">Đang tải SLA...</span>
        </div>
      </>
    );
  }

  if (error || !sla) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">
            {error?.message?.includes("404")
              ? "SLA không tồn tại hoặc đã bị xóa"
              : "Không thể tải thông tin SLA"}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/manager/sla-trigger")}
            className="border-[#e5e5e5]"
          >
            Quay lại danh sách
          </Button>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/manager/sla-trigger">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách SLA
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              {/* <Building className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-semibold text-black">
                  {sla.name}
                </h1>
                <p className="text-gray-600">
                  ID: {sla.id} • Tạo:{" "}
                  {sla.createdAt
                    ? new Date(sla.createdAt).toLocaleDateString("vi-VN")
                    : "N/A"}
                </p>
              </div> */}
            </div>
          </div>

          {/* <div className="flex items-center space-x-2">
            <Link href={`/manager/sla-trigger/${sla.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </Button>
          </div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* SLA Details */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin SLA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Tên SLA
                    </label>
                    <p className="text-lg font-semibold text-black">
                      {sla.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Loại dịch vụ
                    </label>
                    <Badge variant="info">
                      {translateServiceType(sla.serviceType)}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Hợp đồng
                    </label>
                    <p className="text-lg font-semibold text-black">
                      {sla.contractName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Khu vực làm việc
                    </label>
                    <p className="text-lg font-semibold text-black">
                      {sla.workAreaName}
                    </p>
                  </div>
                </div>

                {sla.description && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Mô tả:</h4>
                    <p className="text-blue-800">{sla.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Work Shifts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Ca làm việc ({shifts.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shifts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có ca làm việc nào được thiết lập
                  </p>
                ) : (
                  <div className="space-y-3">
                    {shifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-black">{shift.name}</p>
                          <p className="text-sm text-gray-600">
                            {shift.startTime} - {shift.endTime}
                          </p>
                          {shift.breakTime > 0 && (
                            <p className="text-xs text-gray-500">
                              Nghỉ: {shift.breakTime} phút
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-primary">
                            {shift.requiredWorker} người
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Công việc ({tasks.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có công việc nào được thiết lập
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-black">{task.name}</p>
                          <p className="text-sm text-gray-600">
                            Lặp lại: {getRecurrenceText(task.recurrenceType)}
                          </p>
                          {task.recurrenceConfig.interval > 1 && (
                            <p className="text-xs text-gray-500">
                              Mỗi {task.recurrenceConfig.interval}{" "}
                              {task.recurrenceType.toLowerCase()}
                            </p>
                          )}
                        </div>
                        <Badge variant="success">
                          {getRecurrenceText(task.recurrenceType)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {shifts.length}
                  </p>
                  <p className="text-sm text-gray-600">Ca làm việc</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {getTotalWorkers()}
                  </p>
                  <p className="text-sm text-gray-600">Tổng nhân viên</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {tasks.length}
                  </p>
                  <p className="text-sm text-gray-600">Công việc</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <span className="text-green-600 font-semibold">
                      Hoạt động
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Loại môi trường
                  </label>
                  <p className="text-sm font-semibold">
                    {sla.environmentTypeId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Ngày tạo
                  </label>
                  <p className="text-sm font-semibold">
                    {sla.createdAt
                      ? new Date(sla.createdAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Cập nhật lần cuối
                  </label>
                  <p className="text-sm font-semibold">
                    {sla.updatedAt
                      ? new Date(sla.updatedAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </>
  );
}
