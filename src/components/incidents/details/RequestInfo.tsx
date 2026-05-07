"use client";

import { CalendarRange, ArrowRight, Headphones, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { EmergencyLeaveRequest } from "@/lib/emergency-leave-request-api";

const EMPTY_DATE_PREFIX = "0001-01-01";

function isValidApiDate(value: string | null | undefined) {
  return Boolean(value && !value.startsWith(EMPTY_DATE_PREFIX));
}

function formatDateTime(dateStr: string) {
  if (!isValidApiDate(dateStr)) return "—";
  const [datePart, timePart] = dateStr.split("T");
  const dParts = datePart.split("-");
  if (dParts.length < 3) return dateStr;
  const date = `${dParts[2]}/${dParts[1]}/${dParts[0]}`;
  const time = timePart ? timePart.substring(0, 5) : "";
  return time ? `${date} ${time}` : date;
}

interface RequestInfoProps {
  request: EmergencyLeaveRequest;
}

export function RequestInfo({ request }: RequestInfoProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Avatar size="lg" className="h-16 w-16 rounded-2xl ring-0 border border-slate-100">
            <AvatarFallback className="bg-slate-50 text-slate-400 text-xl font-bold">
              {request.workerName?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {request.workerName}
            </h3>
            <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
              <CalendarRange className="h-4 w-4 text-slate-300" />
              <span>{formatDateTime(request.leaveDateFrom)}</span>
              <ArrowRight className="h-3 w-3 text-slate-300" />
              <span>{formatDateTime(request.leaveDateTo)}</span>
            </div>
          </div>
        </div>

        {request.audioUrl && (
          <Button variant="outline" className="border-slate-200 text-slate-600 rounded-xl px-5 h-11 shadow-none" asChild>
            <a href={request.audioUrl} target="_blank" rel="noreferrer">
              <Headphones className="h-4 w-4 mr-2" />
              Audio đính kèm
            </a>
          </Button>
        )}
      </div>

      {/* Reason */}
      {request.transcription && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lý do xin nghỉ</p>
          <p className="text-lg text-slate-600 leading-relaxed italic">
            &quot;{request.transcription}&quot;
          </p>
        </div>
      )}

      {request.reviewedByUserName && (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
          <UserCheck className="h-4 w-4" />
          Đã duyệt bởi: {request.reviewedByUserName}
        </div>
      )}
    </div>
  );
}
