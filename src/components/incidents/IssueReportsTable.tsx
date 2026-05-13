"use client";

import { useState, useMemo } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
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
  AlertTriangle,
  Clock,
  Briefcase,
  Eye,
} from "lucide-react";
import { IssueReport } from "./types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
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
  const pageSize = 8;

  // Filter & Search Logic
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch = 
        issue.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
              <SelectItem value="Open">Mở</SelectItem>
              <SelectItem value="InProgress">Đang xử lý</SelectItem>
              <SelectItem value="Pending">Chờ xử lý</SelectItem>
              <SelectItem value="Approved">Đã duyệt</SelectItem>
              <SelectItem value="Rejected">Đã từ chối</SelectItem>
              <SelectItem value="Resolved">Đã giải quyết</SelectItem>
              <SelectItem value="Closed">Đóng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-none">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/30">
              <TableHead className="w-[200px] pl-6">Nội dung sự cố</TableHead>
              <TableHead className="w-[200px]">Công việc liên quan</TableHead>
              <TableHead className="w-[180px]">Người báo cáo</TableHead>
              <TableHead>Vị trí hiện trường</TableHead>
              <TableHead className="w-[120px] text-center">Trạng thái</TableHead>
              <TableHead className="w-[150px] text-center">Thời gian</TableHead>
              <TableHead className="w-[100px] pr-6 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedIssues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-400 italic">
                  Không tìm thấy sự cố phù hợp
                </TableCell>
              </TableRow>
            ) : (
              paginatedIssues.map((issue) => {


                return (
                  <TableRow key={issue.id} className="group hover:bg-slate-50/30 transition-colors">
                    {/* Issue Info */}
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                        <span className="text-sm font-bold text-slate-900 line-clamp-2">
                          {issue.description || "Không có mô tả"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Task Info */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-[12px] text-slate-600 bg-blue-50/50 px-2 py-1 rounded-md border border-blue-100/50 w-fit max-w-full">
                        <Briefcase className="h-3 w-3 text-blue-400 shrink-0" />
                        <span className="line-clamp-1 font-medium">
                          {issue.taskName || "Công việc không xác định"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Reporter */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 border border-slate-200">
                          {(issue.reportedByWorkerName || issue.worker || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                           <span className="truncate text-sm text-slate-700 font-bold">
                             {issue.reportedByWorkerName || issue.worker || "Không rõ"}
                           </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <div className="flex items-start gap-2 text-[13px] text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">
                          {issue.displayLocation || "Chưa xác định"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                        <StatusBadge status={issue.status} className="rounded-full px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider" />
                    </TableCell>

                    {/* Time */}
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-primary/70" />
                          <span>
                            {issue.created ? formatDistanceToNow(new Date(issue.created), { addSuffix: true, locale: vi }) : "—"}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                           {issue.created ? new Date(issue.created).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " - " + new Date(issue.created).toLocaleDateString("vi-VN") : "—"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-6">
                      <div className="flex items-center justify-end gap-1.5">
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
