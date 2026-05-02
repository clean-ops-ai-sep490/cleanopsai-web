"use client";

import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Trash2, ArrowLeft, Plus } from "lucide-react";
import { useSOP, useDeleteSOP } from "@/hooks/useWorkflowBuilder";
import { translateServiceType } from "@/lib/utils/translate";

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sopId = params.id as string;

  const { data: sop, isLoading: sopLoading, error: sopError } = useSOP(sopId);

  const deleteSOPMutation = useDeleteSOP(() => {
    router.push("/dashboard/workflow");
  });

  const handleDelete = () => {
    if (confirm("Bạn có chắc chắn muốn xóa SOP này?")) {
      deleteSOPMutation.mutate(sopId);
    }
  };

  if (sopLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#1a80a2]" />
          <span className="ml-2 text-[#70808f]">Đang tải SOP...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (sopError || !sop) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">
            {sopError?.message?.includes("404") || sopError?.status === 404
              ? "SOP không tồn tại hoặc đã bị xóa"
              : "Không thể tải thông tin SOP"}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/workflow")}
            className="border-[#e5e5e5]"
          >
            Quay lại danh sách
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/workflow")}
            className="border-[#e5e5e5]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-medium text-black">{sop.name}</h1>
          <Badge variant={sop.isActive ? "default" : "secondary"}>
            {sop.isActive ? "Hoạt động" : "Không hoạt động"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-[#70808f]">
            Chi tiết quy trình SOP và các bước thực hiện
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/workflow/${sopId}/edit`)}
              className="bg-[#1a80a2] hover:bg-[#308cab] text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteSOPMutation.isPending}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {deleteSOPMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Xóa
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOP Information */}
        <div className="lg:col-span-1">
          <Card className="bg-white rounded-[8px] p-6">
            <h2 className="text-lg font-semibold text-black mb-4">
              Thông tin SOP
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#70808f] block mb-1">
                  Tên SOP
                </label>
                <p className="text-sm text-black">{sop.name}</p>
              </div>

              {sop.description && (
                <div>
                  <label className="text-sm font-medium text-[#70808f] block mb-1">
                    Mô tả
                  </label>
                  <p className="text-sm text-black">{sop.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-[#70808f] block mb-1">
                  Loại dịch vụ
                </label>
                <p className="text-sm text-black">
                  {translateServiceType(sop.serviceType) || "N/A"}
                </p>
              </div>

              {/* <div>
                <label className="text-sm font-medium text-[#70808f] block mb-1">
                  Environment Type ID
                </label>
                <p className="text-sm text-black font-mono text-xs">
                  {sop.environmentTypeId}
                </p>
              </div> */}

              <div>
                <label className="text-sm font-medium text-[#70808f] block mb-1">
                  Phiên bản
                </label>
                <p className="text-sm text-black">{sop.version}</p>
              </div>

              {/* <div>
                <label className="text-sm font-medium text-[#70808f] block mb-1">
                  Trạng thái
                </label>
                <Badge variant={sop.isActive ? "default" : "secondary"}>
                  {sop.isActive ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </div> */}

              {/* <div>
                <label className="text-sm font-medium text-[#70808f] block mb-1">
                  Ngày tạo
                </label>
                <p className="text-sm text-black">
                  {new Date(sop.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-[#70808f] block mb-1">
                  Cập nhật lần cuối
                </label>
                <p className="text-sm text-black">
                  {new Date(sop.updatedAt).toLocaleDateString("vi-VN")}
                </p>
              </div> */}
            </div>
          </Card>
        </div>

        {/* Steps */}
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-[8px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">
                Các bước thực hiện ({sop.sopSteps?.length || 0})
              </h2>
            </div>

            {!sop.sopSteps || sop.sopSteps.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#70808f] mb-4">Chưa có bước nào</p>
                <Button
                  size="sm"
                  onClick={() => router.push(`/manager/workflow/${sopId}/edit`)}
                  className="bg-[#1a80a2] hover:bg-[#308cab] text-white"
                >
                  Thêm bước đầu tiên
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sop.sopSteps
                  .sort((a: any, b: any) => a.stepOrder - b.stepOrder)
                  .map((sopStep: any, index: number) => (
                    <div
                      key={sopStep.id || index}
                      className="border border-[#e5e5e5] rounded-[8px] p-4 hover:bg-[#f9fafb] transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-[28px] h-[28px] rounded-full bg-[#1a80a2] text-white text-sm font-medium flex-shrink-0">
                          {sopStep.stepOrder}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-base font-semibold text-black">
                                {sopStep.step?.name ||
                                  `Bước ${sopStep.stepOrder}`}
                              </h3>
                              {sopStep.step?.description && (
                                <p className="text-sm text-[#70808f] mt-1">
                                  {sopStep.step.description}
                                </p>
                              )}
                            </div>
                            {sopStep.step?.actionKey && (
                              <Badge variant="outline" className="text-xs ml-2">
                                {sopStep.step.actionKey}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
