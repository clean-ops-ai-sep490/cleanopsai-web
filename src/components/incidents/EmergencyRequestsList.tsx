"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
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
        <span className="text-sm font-semibold text-slate-700">{req.workerName}</span>
      )
    },
    {
      header: "Mô tả (Lý do)",
      cell: (req: EmergencyLeaveRequest) => (
        <span className="text-xs text-slate-500 font-medium italic truncate max-w-[320px] block" title={req.transcription || undefined}>
          {req.transcription ? `"${req.transcription}"` : "Không có lý do"}
        </span>
      )
    },
    {
      header: "Khung giờ nghỉ",
      headerClassName: "text-center",
      className: "text-center",
      cell: (req: EmergencyLeaveRequest) => {
        const fromDateStr = formatFullDateTime(req.leaveDateFrom);
        const toDateStr = formatFullDateTime(req.leaveDateTo);
        if (fromDateStr === "—" || toDateStr === "—") {
          return <span className="text-sm text-slate-400 font-medium">—</span>;
        }
        const fromParts = fromDateStr.split(" ");
        const toParts = toDateStr.split(" ");
        return (
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-slate-700 tabular-nums">
              {(fromParts[1] || "") + " - " + (toParts[1] || "")}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {fromParts[0] || ""}
            </span>
          </div>
        );
      }
    },
    {
      header: "Ngày gửi",
      headerClassName: "text-center",
      className: "text-center",
      cell: (req: EmergencyLeaveRequest) => {
        const dateStr = formatFullDateTime(req.created);
        if (dateStr === "—") return <span className="text-sm text-slate-400 font-medium">—</span>;
        const parts = dateStr.split(" ");
        return (
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-slate-600 tabular-nums">
              {parts[0]}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {parts[1]}
            </span>
          </div>
        );
      }
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
