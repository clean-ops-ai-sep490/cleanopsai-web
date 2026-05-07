"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Inbox,
} from "lucide-react";
import { IssueReport } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IssueReportsTableProps {
  issues: IssueReport[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onUpdateTaskStatus?: (taskAssignmentId: string) => void;
  isLoading?: boolean;
}

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "success" | "warning" | "info" | "destructive" | "secondary";
  }
> = {
  Open: { label: "Mở", variant: "warning" },
  InProgress: { label: "Đang xử lý", variant: "info" },
  Resolved: { label: "Đã giải quyết", variant: "success" },
  Closed: { label: "Đóng", variant: "secondary" },
  Pending: { label: "Chờ xử lý", variant: "warning" },
  Approved: { label: "Đã duyệt", variant: "success" },
  Rejected: { label: "Đã từ chối", variant: "destructive" },
};

export function IssueReportsTable({
  issues,
  onApprove,
  onReject,
  onUpdateTaskStatus,
  isLoading = false,
}: IssueReportsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter & Search Logic
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch = 
        issue.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (issue.reportedByWorkerName || issue.worker || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || issue.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [issues, searchQuery, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredIssues.length / pageSize);
  const paginatedIssues = filteredIssues.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
          <Inbox className="h-6 w-6 text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-400">Chưa có báo cáo sự cố nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Minimalist Header Filters ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo ID, mô tả hoặc worker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white border-slate-200/60 text-sm shadow-none focus:border-slate-300 transition-all"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[140px] border-slate-200/60 bg-white text-xs font-medium shadow-none">
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3 text-slate-400" />
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              {Object.keys(statusConfig).map(status => (
                <SelectItem key={status} value={status}>{statusConfig[status].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-none">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/30">
              <TableHead className="w-[200px] pl-6">Sự cố</TableHead>
              <TableHead className="w-[180px]">Người báo cáo</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead className="w-[120px] text-center">Trạng thái</TableHead>
              <TableHead className="w-[100px] text-center">Ngày</TableHead>
              <TableHead className="w-[120px] pr-6 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedIssues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                  Không tìm thấy sự cố phù hợp
                </TableCell>
              </TableRow>
            ) : (
              paginatedIssues.map((issue) => {
                const st = statusConfig[issue.status] || {
                  label: issue.status,
                  variant: "secondary",
                };

                return (
                  <TableRow key={issue.id} className="group hover:bg-slate-50/30 transition-colors">
                    {/* Issue Info */}
                    <TableCell className="pl-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-slate-900">
                          #{issue.id?.slice(-6) || "N/A"}
                        </span>
                        <span className="text-[11px] text-slate-400 line-clamp-1 italic">
                          {issue.description || "Không có mô tả"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Reporter */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-bold text-slate-400 border border-slate-100">
                          {(issue.reportedByWorkerName || issue.worker || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-sm text-slate-600 font-semibold">
                          {issue.reportedByWorkerName || issue.worker || "Không rõ"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <div className="flex items-start gap-2 text-[13px] text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-300 mt-0.5" />
                        <span className="line-clamp-1">
                          {issue.displayLocation || "Chưa xác định"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <Badge variant={st.variant} className="rounded-md px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                        {st.label}
                      </Badge>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-center">
                      <span className="text-sm font-medium text-slate-500 tabular-nums">
                        {issue.created
                          ? new Date(issue.created).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
                          : issue.createdAt?.split(' ')[0] || "—"}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-6">
                      <div className="flex items-center justify-end gap-1.5">
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
                        ) : issue.taskAssignmentId ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-3 text-[10px] font-bold text-slate-400 hover:text-primary hover:bg-slate-50 uppercase tracking-widest transition-all"
                            onClick={() => onUpdateTaskStatus?.(issue.taskAssignmentId!)}
                            disabled={isLoading}
                          >
                            <RefreshCw className="h-3 w-3 mr-1.5" />
                            Cập nhật
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-300 font-medium">—</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Minimalist Pagination ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1">
          <div className="text-[12px] text-slate-400">
            Hiển thị <span className="text-slate-900 font-bold">{paginatedIssues.length}</span> / {filteredIssues.length} sự cố
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 border-slate-200/60 rounded-xl shadow-none"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "ghost"}
                  size="sm"
                  className={`h-9 w-9 p-0 rounded-xl text-xs font-bold ${
                    currentPage === i + 1 ? "bg-[var(--app-primary)] text-white shadow-none" : "text-slate-400"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 border-slate-200/60 rounded-xl shadow-none"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
