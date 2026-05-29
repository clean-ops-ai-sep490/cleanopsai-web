"use client";

import { useState, useMemo } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Play,
  Filter,
  Eye,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IssueReport } from "@/lib/issue-report-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";

interface IssueReportsTableProps {
  issues: IssueReport[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onUpdateTaskStatus?: (taskAssignmentId: string) => void;
  onViewDetail?: (issue: IssueReport) => void;
  isLoading?: boolean;
}

export function IssueReportsTable({
  issues,
  onApprove,
  onReject,
  onUpdateTaskStatus,
  onViewDetail,
  isLoading = false,
}: IssueReportsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTaskAssignmentId, setSelectedTaskAssignmentId] = useState<string | null>(null);
  const pageSize = 8;

  // Filter & Search Logic
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch = 
        issue.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (issue.reportedByWorkerName || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || issue.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [issues, searchQuery, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredIssues.length / pageSize);
  const paginatedIssues = filteredIssues.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      header: "Nội dung sự cố",
      className: "pl-6 w-[200px]",
      cell: (issue: IssueReport) => (
        <span className="text-sm font-semibold text-slate-900 line-clamp-2">
          {issue.description || "Không có mô tả"}
        </span>
      )
    },
    {
      header: "Công việc liên quan",
      className: "w-[200px]",
      cell: (issue: IssueReport) => (
        <span className="text-sm text-slate-600 font-semibold line-clamp-1">
          {issue.taskName || "Công việc không xác định"}
        </span>
      )
    },
    {
      header: "Người báo cáo",
      className: "w-[180px]",
      cell: (issue: IssueReport) => (
        <span className="text-sm text-slate-700 font-semibold truncate">
          {issue.reportedByWorkerName || "Không rõ"}
        </span>
      )
    },
    {
      header: "Vị trí hiện trường",
      cell: (issue: IssueReport) => (
        <span className="text-sm text-slate-600 font-medium line-clamp-2">
          {issue.displayLocation || "Chưa xác định"}
        </span>
      )
    },
    {
      header: "Trạng thái",
      className: "text-center w-[120px]",
      headerClassName: "text-center",
      cell: (issue: IssueReport) => (
        <StatusBadge status={issue.status} className="rounded-full px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider" />
      )
    },
    {
      header: "Thời gian",
      className: "text-center w-[150px]",
      headerClassName: "text-center",
      cell: (issue: IssueReport) => (
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-slate-600">
            {issue.created ? new Date(issue.created).toLocaleDateString("vi-VN") : "—"}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {issue.created ? new Date(issue.created).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
          </span>
        </div>
      )
    },
    {
      header: "Thao tác",
      className: "pr-6 w-[100px] text-right",
      headerClassName: "text-right pr-6",
      cell: (issue: IssueReport) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg"
            onClick={() => onViewDetail?.(issue)}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {issue.status === "Pending" || issue.status === "Open" ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-emerald-500 hover:bg-emerald-50 rounded-lg"
                onClick={() => onApprove?.(issue.id)}
                disabled={isLoading}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg"
                onClick={() => onReject?.(issue.id)}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          ) : issue.status === "Approved" && issue.taskAssignmentId ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-[10px] font-bold text-info hover:bg-info/10 rounded-lg uppercase tracking-widest transition-all"
              onClick={() => {
                setSelectedTaskAssignmentId(issue.taskAssignmentId!);
                setConfirmOpen(true);
              }}
              disabled={isLoading}
              title="Xác nhận đã xử lý xong sự cố thực tế và cho phép nhân viên tiếp tục thực hiện công việc này."
            >
              <Play className="h-3 w-3 mr-1.5 fill-current" />
              Tiếp tục
            </Button>
          ) : (
            <span className="text-xs text-slate-300 font-medium">—</span>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={paginatedIssues}
        isLoading={isLoading}
        emptyMessage="Chưa có báo cáo sự cố nào"
        onRowClick={onViewDetail}
        search={{
          value: searchQuery,
          onChange: (val) => { setSearchQuery(val); setCurrentPage(1); },
          placeholder: "Tìm theo ID, mô tả hoặc worker..."
        }}
        filters={
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
            <SelectTrigger className="h-11 w-[140px] border-slate-200/60 bg-white text-xs font-medium shadow-none rounded-xl">
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3 text-slate-400" />
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="Open">Mở</SelectItem>
              <SelectItem value="InProgress">Đang xử lý</SelectItem>
              <SelectItem value="Pending">Chờ xử lý</SelectItem>
              <SelectItem value="Approved">Đã duyệt</SelectItem>
              <SelectItem value="Rejected">Đã từ chối</SelectItem>
              <SelectItem value="Resolved">Đã giải quyết</SelectItem>
              <SelectItem value="Closed">Đóng</SelectItem>
            </SelectContent>
          </Select>
        }
        pagination={{
          currentPage,
          totalPages: totalPages || 1,
          pageSize,
          totalElements: filteredIssues.length,
          onPageChange: setCurrentPage
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Xác nhận giải quyết sự cố và tiếp tục công việc?"
        description="Xác nhận sự cố thực tế đã được khắc phục hoàn toàn? Hành động này sẽ thông báo đến nhân viên công việc có thể tiếp tục."
        confirmLabel="Xác nhận"
        confirmVariant="default"
        cancelLabel="Hủy"
        isLoading={isLoading}
        onConfirm={async () => {
          if (selectedTaskAssignmentId && onUpdateTaskStatus) {
            await onUpdateTaskStatus(selectedTaskAssignmentId);
          }
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
