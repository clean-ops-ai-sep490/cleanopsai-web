"use client";

import { MapPin, Clock, Briefcase, User, Calendar, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { IssueReport } from "@/lib/issue-report-api";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface IssueReportDetailPanelProps {
  issue: IssueReport;
}

export function IssueReportDetailPanel({ issue }: IssueReportDetailPanelProps) {
  const isResolved = !!issue.resolvedAt;
  
  return (
    <div className="space-y-8 pb-10">
      {/* ─── 1. Header Info ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Báo cáo sự cố</p>
                <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{issue.description || "Sự cố không tên"}</h3>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <StatusBadge status={issue.status} className="rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-wider" />
            </div>
          </div>

          <div className="h-px bg-slate-50" />

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider italic opacity-70">"Thông tin chi tiết về sự cố được báo cáo từ hiện trường"</p>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-slate-50/50" />
      </div>

      {/* ─── 2. Detailed Context ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Work Context */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-primary">
            <Briefcase className="h-4 w-4" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Bối cảnh công việc</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Tên công việc</p>
              <p className="text-[13px] font-semibold text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                {issue.taskName || "Thông tin công việc không khả dụng"}
              </p>
            </div>
          </div>
        </div>

        {/* Reporter Info */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-500">
            <User className="h-4 w-4" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Nhân viên báo cáo</h4>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-lg font-bold">
              {(issue.reportedByWorkerName || "?").charAt(0).toUpperCase()}
            </div>
            <div className="space-y-0.5">
              <p className="text-[15px] font-bold text-slate-900">{issue.reportedByWorkerName || "Không rõ"}</p>
              <div className="flex items-center gap-2 text-slate-400">
                 <Clock className="h-3 w-3" />
                 <span className="text-xs font-medium italic">{issue.created ? formatDistanceToNow(new Date(issue.created), { addSuffix: true, locale: vi }) : "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Location Detail ─── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-rose-500">
          <MapPin className="h-4 w-4" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Vị trí hiện trường</h4>
        </div>
        
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm text-rose-500">
            <MapPin className="h-4 w-4" />
          </div>
          <p className="text-[14px] font-medium text-slate-600 leading-relaxed italic">
            {issue.displayLocation || "Thông tin vị trí chưa được cập nhật."}
          </p>
        </div>
      </div>

      {/* ─── 4. Resolution Status (If any) ─── */}
      {isResolved && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Kết quả xử lý</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider">Người xử lý</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-[14px] font-bold text-slate-700">
                  {issue.resolvedByUserName || "Hệ thống / Người quản lý"}
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider">Thời gian giải quyết</p>
              <p className="text-[13px] font-semibold text-slate-600 italic">
                {issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleString('vi-VN') : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {!isResolved && issue.status !== "Rejected" && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-5 flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-amber-900">Đang chờ xử lý</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Sự cố này đang trong trạng thái chờ. Bạn có thể sử dụng các nút thao tác bên dưới hoặc trong danh sách để thay đổi trạng thái.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
