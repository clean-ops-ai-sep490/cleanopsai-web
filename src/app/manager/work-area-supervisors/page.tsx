"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { AssignSupervisorDialog } from "@/components/work-areas/AssignSupervisorDialog";
import { Plus, User, Mail, Shield } from "lucide-react";
import {
  useAuthSupervisors,
} from "@/hooks/useSupervisors";
import { usePagination } from "@/hooks/usePagination";
import type { Supervisor } from "@/types/supervisor";

export default function WorkAreaSupervisorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);

  // Pagination state
  const { currentPage, pageSize, setPage, goToFirstPage } = usePagination({
    initialPageSize: 10,
  });

  const { data, isLoading } = useAuthSupervisors({
    pageNumber: currentPage,
    pageSize,
    search: searchTerm || undefined,
  });

  const columns = [
    {
      header: "Họ và tên",
      className: "pl-6 font-bold text-slate-900",
      cell: (supervisor: Supervisor) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <User className="h-5 w-5" />
          </div>
          <span className="font-semibold">{supervisor.fullName}</span>
        </div>
      ),
    },
    {
      header: "Email",
      cell: (supervisor: Supervisor) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Mail className="h-4 w-4 text-slate-400" />
          <span>{supervisor.email}</span>
        </div>
      ),
    },
    {
      header: "Vai trò",
      cell: (supervisor: Supervisor) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-500" />
          <span className="text-slate-600 font-medium">{supervisor.role}</span>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      cell: (supervisor: Supervisor) => (
        <StatusBadge
          status={supervisor.status || "Hoạt động"}
          variant={supervisor.status === "Inactive" ? "secondary" : "success"}
        />
      ),
    },
    {
      header: "Thao tác",
      headerClassName: "text-right pr-6",
      className: "text-right pr-6",
      cell: (supervisor: Supervisor) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg text-xs"
            onClick={() => {
              setSelectedSupervisor(supervisor);
              setShowAssignDialog(true);
            }}
          >
            Phân công khu vực
          </Button>
        </div>
      ),
    },
  ];

  const handleOpenAssignDialog = () => {
    setSelectedSupervisor(null);
    setShowAssignDialog(true);
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Quản lý giám sát viên"
        description="Danh sách giám sát viên trong hệ thống và thực hiện phân công khu vực làm việc."
        action={
          <Button
            onClick={handleOpenAssignDialog}
            className="rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Phân công mới
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.content || []}
        isLoading={isLoading}
        emptyMessage="Chưa có giám sát viên nào"
        search={{
          value: searchTerm,
          onChange: (val) => {
            setSearchTerm(val);
            goToFirstPage();
          },
          placeholder: "Tìm kiếm theo tên hoặc email...",
        }}
        pagination={{
          currentPage,
          totalPages: data?.totalPages || 1,
          pageSize,
          totalElements: data?.totalElements || 0,
          onPageChange: setPage,
        }}
      />

      {/* Assign Supervisor Dialog */}
      <AssignSupervisorDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        initialSupervisorId={selectedSupervisor?.id}
      />
    </div>
  );
}
