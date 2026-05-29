"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssignSupervisorDialog } from "@/components/work-areas/AssignSupervisorDialog";
import { TransferSupervisorDialog } from "@/components/work-areas/TransferSupervisorDialog";
import { WorkAreaTasksDrawer } from "@/components/work-areas/WorkAreaTasksDrawer";
import { Plus, User, Mail, Shield, MapPin, Briefcase, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  useAuthSupervisors,
  useSupervisorWorkAreas,
} from "@/hooks/useSupervisors";
import { usePagination } from "@/hooks/usePagination";
import type { Supervisor } from "@/types/supervisor";

// Sub-component to display Supervisor's Work Area
function SupervisorWorkAreaCell({ supervisorId }: { supervisorId: string }) {
  const { data, isLoading } = useSupervisorWorkAreas(supervisorId, {
    pageNumber: 1,
    pageSize: 100,
  });
  const workAreas = data?.content || [];

  if (isLoading) {
    return <span className="text-sm text-slate-400 animate-pulse">Đang tải...</span>;
  }

  if (workAreas.length === 0) {
    return <span className="text-sm text-slate-400 font-medium italic">Chưa phân công</span>;
  }

  const workAreasString = workAreas.map((wa: any) => wa.workAreaName || wa.name).join(", ");

  return (
    <span 
      className="text-sm font-semibold text-slate-700 line-clamp-2" 
      title={workAreasString}
    >
      {workAreasString}
    </span>
  );
}

// Sub-component to display Supervisor's Work Area Display Location
function SupervisorLocationCell({ supervisorId }: { supervisorId: string }) {
  const { data, isLoading } = useSupervisorWorkAreas(supervisorId, {
    pageNumber: 1,
    pageSize: 100,
  });
  const workAreas = data?.content || [];

  if (isLoading) {
    return <span className="text-xs text-slate-400 animate-pulse">...</span>;
  }

  if (workAreas.length === 0) {
    return <span className="text-sm text-slate-400 font-medium">—</span>;
  }

  const locationsString = workAreas
    .map((wa: any) => wa.displayLocation || wa.locationName)
    .filter(Boolean)
    .join(", ");

  return (
    <span 
      className="text-xs text-slate-500 font-medium line-clamp-2" 
      title={locationsString || undefined}
    >
      {locationsString || "—"}
    </span>
  );
}

// Sub-component to display actions for Supervisor
interface SupervisorActionsCellProps {
  supervisor: Supervisor;
  onAssign: () => void;
  onTransfer: (workArea: { id: string; name: string; displayLocation?: string }) => void;
  onViewTasks: (workArea: { id: string; name: string; displayLocation?: string }) => void;
}

function SupervisorActionsCell({
  supervisor,
  onAssign,
  onTransfer,
  onViewTasks,
}: SupervisorActionsCellProps) {
  const { data, isLoading } = useSupervisorWorkAreas(supervisor.id, {
    pageNumber: 1,
    pageSize: 100,
  });
  const workAreas = data?.content || [];

  if (isLoading) {
    return <div className="h-8 w-8 bg-slate-100 rounded-lg animate-pulse ml-auto" />;
  }

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Thao tác</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-100 rounded-xl shadow-lg p-1 animate-in fade-in-80 duration-100">
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 focus:bg-teal-50/50 focus:text-primary rounded-lg py-2"
            onClick={onAssign}
          >
            <Plus className="h-4 w-4" />
            Phân công khu vực
          </DropdownMenuItem>

          {workAreas.length > 0 && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 focus:bg-teal-50/50 focus:text-primary rounded-lg py-2">
                  <Briefcase className="h-4 w-4" />
                  Xem công việc
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56 bg-white border border-slate-100 rounded-xl shadow-lg p-1">
                  {workAreas.map((wa: any) => (
                    <DropdownMenuItem
                      key={wa.workAreaId || wa.id}
                      className="cursor-pointer text-slate-600 hover:text-primary focus:bg-teal-50/50 focus:text-primary rounded-lg py-2"
                      onClick={() =>
                        onViewTasks({
                          id: wa.workAreaId || wa.id,
                          name: wa.workAreaName || wa.name,
                          displayLocation: wa.displayLocation || wa.locationName,
                        })
                      }
                    >
                      {wa.workAreaName || wa.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 focus:bg-teal-50/50 focus:text-primary rounded-lg py-2">
                  <MapPin className="h-4 w-4" />
                  Điều chuyển
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56 bg-white border border-slate-100 rounded-xl shadow-lg p-1">
                  {workAreas.map((wa: any) => (
                    <DropdownMenuItem
                      key={wa.workAreaId || wa.id}
                      className="cursor-pointer text-slate-600 hover:text-primary focus:bg-teal-50/50 focus:text-primary rounded-lg py-2"
                      onClick={() =>
                        onTransfer({
                          id: wa.workAreaId || wa.id,
                          name: wa.workAreaName || wa.name,
                          displayLocation: wa.displayLocation || wa.locationName,
                        })
                      }
                    >
                      {wa.workAreaName || wa.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function WorkAreaSupervisorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showTasksDrawer, setShowTasksDrawer] = useState(false);

  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [selectedWorkArea, setSelectedWorkArea] = useState<{
    id: string;
    name: string;
    displayLocation?: string;
  } | null>(null);

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
      header: "Giám sát viên",
      headerClassName: "pl-6",
      className: "pl-6 font-bold text-slate-900",
      cell: (supervisor: Supervisor) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 text-sm">
              {supervisor.fullName}
            </span>
            <span className="text-xs text-slate-500 font-normal">
              {supervisor.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Khu vực phụ trách",
      headerClassName: "w-[240px]",
      className: "w-[240px]",
      cell: (supervisor: Supervisor) => (
        <SupervisorWorkAreaCell supervisorId={supervisor.id} />
      ),
    },
    {
      header: "Vị trí chi tiết",
      headerClassName: "max-w-[280px]",
      className: "max-w-[280px]",
      cell: (supervisor: Supervisor) => (
        <SupervisorLocationCell supervisorId={supervisor.id} />
      ),
    },
    {
      header: "Vai trò",
      cell: (supervisor: Supervisor) => (
        <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
          {supervisor.role}
        </Badge>
      ),
    },
    {
      header: "Trạng thái",
      headerClassName: "text-center w-[120px]",
      className: "text-center w-[120px]",
      cell: (supervisor: Supervisor) => (
        <StatusBadge
          status={supervisor.status || "Hoạt động"}
          variant={supervisor.status === "Inactive" ? "secondary" : "success"}
          className="rounded-full px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider"
        />
      ),
    },
    {
      header: "Thao tác",
      headerClassName: "text-right pr-6",
      className: "text-right pr-6",
      cell: (supervisor: Supervisor) => (
        <SupervisorActionsCell
          supervisor={supervisor}
          onAssign={() => {
            setSelectedSupervisor(supervisor);
            setShowAssignDialog(true);
          }}
          onTransfer={(workArea) => {
            setSelectedSupervisor(supervisor);
            setSelectedWorkArea(workArea);
            setShowTransferDialog(true);
          }}
          onViewTasks={(workArea) => {
            setSelectedWorkArea(workArea);
            setShowTasksDrawer(true);
          }}
        />
      ),
    },
  ];

  const handleOpenAssignDialog = () => {
    setSelectedSupervisor(null);
    setShowAssignDialog(true);
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Quản lý giám sát viên"
        description="Danh sách giám sát viên trong hệ thống và thực hiện phân công hoặc điều chuyển khu vực làm việc."
        action={
          <Button onClick={handleOpenAssignDialog} className="rounded-xl bg-primary hover:bg-primary/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Phân công mới
          </Button>
        }
      />

      <div className="min-h-[400px]">
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
      </div>

      {/* Assign Supervisor Dialog */}
      <AssignSupervisorDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        initialSupervisorId={selectedSupervisor?.id}
      />

      {/* Transfer Supervisor Dialog */}
      <TransferSupervisorDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
        supervisor={
          selectedSupervisor
            ? {
                id: selectedSupervisor.id,
                fullName: selectedSupervisor.fullName,
                email: selectedSupervisor.email,
                currentWorkAreaId: selectedWorkArea?.id,
                currentWorkAreaName: selectedWorkArea?.name,
              }
            : null
        }
      />

      {/* Tasks and Workers Drawer */}
      <WorkAreaTasksDrawer
        open={showTasksDrawer}
        onOpenChange={setShowTasksDrawer}
        workArea={selectedWorkArea}
      />
    </div>
  );
}
