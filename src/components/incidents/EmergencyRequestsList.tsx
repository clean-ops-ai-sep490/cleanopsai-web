"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Headphones,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import type { EmergencyLeaveRequest } from "@/lib/emergency-leave-request-api";

interface EmergencyRequestsListProps {
  requests: EmergencyLeaveRequest[];
  selectedRequestId: string | null;
  onSelect: (request: EmergencyLeaveRequest) => void;
  processingId?: string | null;
}

const EMPTY_DATE_PREFIX = "0001-01-01";

function isValidApiDate(value: string | null | undefined) {
  return Boolean(value && !value.startsWith(EMPTY_DATE_PREFIX));
}

function formatFullDateTime(dateStr: string) {
  if (!isValidApiDate(dateStr)) return "—";
  const [datePart, timePart] = dateStr.split("T");
  const dParts = datePart.split("-");
  const tParts = (timePart || "00:00").split(":");
  return `${dParts[2]}/${dParts[1]} ${tParts[0]}:${tParts[1]}`;
}

function getStatusConfig(status: string) {
  switch (status) {
    case "Pending":
      return { variant: "warning" as const, label: "Chờ duyệt" };
    case "Approved":
      return { variant: "success" as const, label: "Đã duyệt" };
    case "Rejected":
      return { variant: "destructive" as const, label: "Từ chối" };
    default:
      return { variant: "secondary" as const, label: status };
  }
}

export function EmergencyRequestsListPanel({
  requests,
  selectedRequestId,
  onSelect,
  processingId,
}: EmergencyRequestsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter & Search Logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch = req.workerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.transcription?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  // Sort Logic: Pending first, then date desc
  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      if (a.status === "Pending" && b.status !== "Pending") return -1;
      if (b.status === "Pending" && a.status !== "Pending") return 1;
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });
  }, [filteredRequests]);

  // Pagination Logic
  const paginatedRequests = sortedRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      header: "Worker",
      className: "pl-6",
      cell: (req: EmergencyLeaveRequest) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[11px] font-bold text-slate-400 border border-slate-100">
            {req.workerName?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <span className="text-sm font-semibold text-slate-700">{req.workerName}</span>
        </div>
      )
    },
    {
      header: "Mô tả (Lý do)",
      cell: (req: EmergencyLeaveRequest) => (
        <div className="flex flex-col gap-1 max-w-[320px]">
          {req.transcription ? (
            <p className="text-xs text-slate-500 line-clamp-1 italic">
              &quot;{req.transcription}&quot;
            </p>
          ) : (
            <span className="text-[11px] text-slate-300 italic">Không có bản dịch</span>
          )}
          {req.audioUrl && (
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              <Headphones className="h-2.5 w-2.5" />
              Voice Record
            </div>
          )}
        </div>
      )
    },
    {
      header: "Khung giờ nghỉ",
      headerClassName: "text-center",
      className: "text-center",
      cell: (req: EmergencyLeaveRequest) => (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[11px] font-bold text-slate-700 tabular-nums">
            {formatFullDateTime(req.leaveDateFrom).split(' ')[1]} - {formatFullDateTime(req.leaveDateTo).split(' ')[1]}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {formatFullDateTime(req.leaveDateFrom).split(' ')[0]}
          </span>
        </div>
      )
    },
    {
      header: "Ngày gửi",
      headerClassName: "text-center",
      className: "text-center",
      cell: (req: EmergencyLeaveRequest) => (
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-slate-600 tabular-nums">
            {formatFullDateTime(req.created).split(' ')[0]}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {formatFullDateTime(req.created).split(' ')[1]}
          </span>
        </div>
      )
    },
    {
      header: "Trạng thái",
      headerClassName: "text-center",
      className: "text-center",
      cell: (req: EmergencyLeaveRequest) => {
        const st = getStatusConfig(req.status);
        return (
          <Badge variant={st.variant} className="rounded-md px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
            {st.label}
          </Badge>
        );
      }
    },
    {
      header: "Xem",
      headerClassName: "text-right pr-6",
      className: "text-right pr-6",
      cell: (req: EmergencyLeaveRequest) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-300 group-hover:text-primary transition-all"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={paginatedRequests}
      search={{
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: "Tìm kiếm worker hoặc lý do..."
      }}
      filters={
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 w-[140px] border-slate-200/60 bg-white text-xs font-medium shadow-none rounded-xl">
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3 text-slate-400" />
              <SelectValue placeholder="Trạng thái" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="Pending">Chờ duyệt</SelectItem>
            <SelectItem value="Approved">Đã duyệt</SelectItem>
            <SelectItem value="Rejected">Từ chối</SelectItem>
          </SelectContent>
        </Select>
      }
      pagination={{
        currentPage,
        totalPages: Math.ceil(sortedRequests.length / pageSize),
        pageSize,
        totalElements: sortedRequests.length,
        onPageChange: setCurrentPage
      }}
      onRowClick={(req) => !processingId && onSelect(req)}
      rowClassName={(req) => selectedRequestId === req.id ? "bg-slate-50" : "group"}
    />
  );
}
