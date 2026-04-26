import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarRange,
  CheckCircle2,
  CircleAlert,
  Headphones,
  Link2,
  XCircle,
} from "lucide-react";
import { requestStatusConfig } from "./constants";
import type { EmergencyLeaveRequest } from "@/lib/emergency-leave-request-api";

interface RequestsListProps {
  requests: EmergencyLeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  processingId?: string | null;
}

const EMPTY_DATE_PREFIX = "0001-01-01";

function isValidApiDate(value: string | null | undefined) {
  return Boolean(value && !value.startsWith(EMPTY_DATE_PREFIX));
}

function formatDateRange(from: string, to: string) {
  if (!isValidApiDate(from) || !isValidApiDate(to)) {
    return "Chưa có thời gian nghỉ hợp lệ";
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  return `${fromDate.toLocaleString("vi-VN")} - ${toDate.toLocaleString("vi-VN")}`;
}

function getStatusConfig(status: string) {
  return (
    requestStatusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    }
  );
}

export function RequestsList({
  requests,
  onApprove,
  onReject,
  processingId,
}: RequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        Không có emergency leave request nào.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const statusConfig = getStatusConfig(req.status);
        const isPending = req.status === "Pending";

        return (
          <Card key={req.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a80a2]/10">
                  <CircleAlert className="h-5 w-5 text-[#1a80a2]" />
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-black">
                      Emergency leave request: {req.workerName}
                    </p>
                    <Badge className={statusConfig.className}>
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    <p className="flex items-center gap-2">
                      <CalendarRange className="h-3.5 w-3.5" />
                      <span>{formatDateRange(req.leaveDateFrom, req.leaveDateTo)}</span>
                    </p>
                    <p>Tạo lúc: {new Date(req.created).toLocaleString("vi-VN")}</p>
                    <p>
                      Task Assignment: {req.taskAssignmentId || "Không gắn task"}
                    </p>
                    {req.transcription && <p>Lý do: {req.transcription}</p>}
                    {req.reviewedByUserName && (
                      <p>Đã review bởi: {req.reviewedByUserName}</p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {req.audioUrl && (
                    <Button asChild size="sm" variant="outline">
                      <a href={req.audioUrl} target="_blank" rel="noreferrer">
                        <Headphones className="mr-1 h-4 w-4" />
                        Audio
                      </a>
                    </Button>
                  )}

                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => onApprove(req.id)}
                        disabled={processingId === req.id}
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onReject(req.id)}
                        disabled={processingId === req.id}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Từ chối
                      </Button>
                    </div>
                  ) : req.audioUrl ? (
                    <Button asChild size="sm" variant="ghost">
                      <a href={req.audioUrl} target="_blank" rel="noreferrer">
                        <Link2 className="mr-1 h-4 w-4" />
                        Mở file
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
