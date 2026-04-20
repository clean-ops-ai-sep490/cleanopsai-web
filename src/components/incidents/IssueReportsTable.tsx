import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { IssueReport } from "./types";

interface IssueReportsTableProps {
  issues: IssueReport[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onUpdateTaskStatus?: (taskAssignmentId: string) => void;
  isLoading?: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  Open: { label: "Mở", className: "bg-yellow-100 text-yellow-800" },
  InProgress: { label: "Đang xử lý", className: "bg-blue-100 text-blue-800" },
  Resolved: {
    label: "Đã giải quyết",
    className: "bg-green-100 text-green-800",
  },
  Closed: { label: "Đóng", className: "bg-gray-100 text-gray-800" },
  Pending: { label: "Chờ xử lý", className: "bg-yellow-100 text-yellow-800" },
  Approved: { label: "Đã duyệt", className: "bg-green-100 text-green-800" },
  Rejected: { label: "Đã từ chối", className: "bg-red-100 text-red-800" },
};

export function IssueReportsTable({
  issues,
  onApprove,
  onReject,
  onUpdateTaskStatus,
  isLoading = false,
}: IssueReportsTableProps) {
  // Helper function to extract last 3 parts from displayLocation
  const getShortLocation = (
    displayLocation: string | null | undefined,
  ): string => {
    if (!displayLocation) return "N/A";

    const parts = displayLocation.split(",").map((p) => p.trim());
    if (parts.length <= 3) return displayLocation;

    // Get last 3 parts
    return parts.slice(-3).join(", ");
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sự cố</TableHead>
          <TableHead>Báo cáo bởi</TableHead>
          <TableHead>Vị trí</TableHead>
          <TableHead className="text-center">Trạng thái</TableHead>
          <TableHead className="text-center">Thời gian</TableHead>
          <TableHead className="text-center w-32">Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {issues.map((issue) => {
          const st = statusConfig[issue.status] || {
            label: issue.status,
            className: "bg-gray-100 text-gray-800",
          };
          return (
            <TableRow key={issue.id}>
              <TableCell>
                <p className="text-sm font-medium text-black">
                  Issue Report #{issue.id?.slice(-6) || issue.id || "N/A"}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[250px]">
                  {issue.description || "No description"}
                </p>
              </TableCell>
              <TableCell className="text-sm">
                {issue.reportedByWorkerName || issue.worker || "Unknown"}
              </TableCell>
              <TableCell className="text-sm text-gray-700">
                {getShortLocation(issue.displayLocation)}
              </TableCell>
              <TableCell className="text-center">
                <Badge className={st.className}>{st.label}</Badge>
              </TableCell>
              <TableCell className="text-center text-xs text-gray-500">
                {issue.created
                  ? new Date(issue.created).toLocaleDateString("vi-VN")
                  : issue.createdAt || "N/A"}
              </TableCell>
              <TableCell className="text-center">
                {issue.status === "Pending" || issue.status === "Open" ? (
                  <div className="flex items-center gap-1 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onApprove?.(issue.id)}
                      disabled={isLoading}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onReject?.(issue.id)}
                      disabled={isLoading}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                    </Button>
                  </div>
                ) : (issue.status === "Approved" ||
                    issue.status === "Rejected") &&
                  issue.taskAssignmentId ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() =>
                      onUpdateTaskStatus?.(issue.taskAssignmentId!)
                    }
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Update Task
                  </Button>
                ) : (
                  <span className="text-xs font-medium text-gray-500">
                    Không khả dụng
                  </span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
