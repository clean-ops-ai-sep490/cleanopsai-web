"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Trash2, ArrowLeft, Workflow as WorkflowIcon } from "lucide-react";
import { useDeleteSOP, useSOP } from "@/hooks/useSOPs";
import { translateServiceType } from "@/lib/utils/translate";
import { useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { startLoading } = useLoading();
  const sopId = params.id as string;
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  const handleBack = () => {
    startLoading("Đang quay lại danh sách...");
    router.push("/manager/workflow");
  };

  const handleEdit = () => {
    startLoading("Đang chuẩn bị trình chỉnh sửa...");
    router.push(`/manager/workflow/${sopId}/edit`);
  };

  const { data: sop, isLoading, error } = useSOP(sopId);
  const deleteSOPMutation = useDeleteSOP(() => {
    startLoading("Đang cập nhật danh sách...");
    router.push("/manager/workflow");
  });

  const handleDelete = async () => {
    await deleteSOPMutation.mutateAsync(sopId);
    setDeleteOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={sop?.name || "Chi tiết SOP"}
          description="Xem chi tiết quy trình và các bước thực hiện."
          breadcrumbs={<Button variant="ghost" size="sm" onClick={handleBack}><ArrowLeft className="h-4 w-4" />Quay lại</Button>}
          action={sop ? <div className="flex gap-2"><Button variant="outline" onClick={handleEdit}><Edit className="h-4 w-4" />Chỉnh sửa</Button><Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={deleteSOPMutation.isPending}><Trash2 className="h-4 w-4" />Xóa</Button></div> : undefined}
        />

        {isLoading ? (
          <SectionCard><div className="py-12 text-center text-slate-500"><Loader2 className="mr-2 inline h-5 w-5 animate-spin" />Đang tải SOP...</div></SectionCard>
        ) : error || !sop ? (
          <ErrorState title="Không thể tải thông tin SOP" description="SOP có thể đã bị xóa hoặc bạn chưa có quyền truy cập." onAction={() => router.push("/manager/workflow")} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard title="Thông tin SOP" className="lg:col-span-1">
              <div className="space-y-4 text-sm">
                <div><p className="text-slate-500">Tên SOP</p><p className="font-medium text-slate-950">{sop.name}</p></div>
                <div><p className="text-slate-500">Mô tả</p><p className="text-slate-700">{sop.description || "-"}</p></div>
                <div><p className="text-slate-500">Loại dịch vụ</p><Badge>{translateServiceType(sop.serviceType) || "N/A"}</Badge></div>
                <div><p className="text-slate-500">Phiên bản</p><p className="font-medium text-slate-950">{sop.version}</p></div>
              </div>
            </SectionCard>

            <SectionCard title={`Các bước thực hiện (${sop.sopSteps?.length || 0})`} className="lg:col-span-2">
              {!sop.sopSteps || sop.sopSteps.length === 0 ? (
                <EmptyState title="Chưa có bước nào" description="Thêm bước đầu tiên để bắt đầu xây dựng SOP." actionLabel="Thêm bước đầu tiên" onAction={() => router.push(`/manager/workflow/${sopId}/edit`)} icon={<WorkflowIcon className="h-10 w-10" />} />
              ) : (
                <div className="space-y-3">
                  {sop.sopSteps.sort((a: any, b: any) => a.stepOrder - b.stepOrder).map((sopStep: any, index: number) => (
                    <div key={sopStep.id || index} className="rounded-[var(--radius-lg)] border border-slate-200 p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary)] text-sm font-medium text-white">{sopStep.stepOrder}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-semibold text-slate-950">{sopStep.step?.name || `Bước ${sopStep.stepOrder}`}</h3>
                              {sopStep.step?.description ? <p className="mt-1 text-sm text-slate-500">{sopStep.step.description}</p> : null}
                            </div>
                            {sopStep.step?.actionKey ? <Badge variant="outline">{sopStep.step.actionKey}</Badge> : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        )}
      </div>

      <ConfirmDialog open={deleteOpen} title="Xóa SOP này?" description="Thao tác này không thể hoàn tác." confirmLabel="Xóa" onConfirm={handleDelete} onOpenChange={setDeleteOpen} isLoading={deleteSOPMutation.isPending} />
    </>
  );
}
