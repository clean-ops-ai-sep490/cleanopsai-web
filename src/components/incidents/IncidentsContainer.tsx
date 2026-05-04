"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ClipboardPlus, RefreshCw } from "lucide-react";
import { toastUtils } from "@/lib/utils/toast-utils";
import { IssueReportsTable } from "./IssueReportsTable";
import { EmergencyLeaveDashboard } from "./EmergencyLeaveDashboard";
import {
  getIssueReportsPaginated,
  resolveIssueReport,
} from "@/lib/issue-report-api";
import { getEmergencyLeaveRequestsPaginated } from "@/lib/emergency-leave-request-api";
import { useStartTask } from "@/hooks/useTaskActions";

type TabKey = "issues" | "requests";

export function IncidentsContainer() {
  const [activeTab, setActiveTab] = useState<TabKey>("issues");
  const [processingIssueId, setProcessingIssueId] = useState<string | null>(
    null,
  );

  const startTaskMutation = useStartTask(() => {
    refetchIssueReports();
    setProcessingIssueId(null);
  });

  const {
    data: issueReportsResponse,
    isLoading: issueReportsLoading,
    error: issueReportsError,
    refetch: refetchIssueReports,
  } = useQuery({
    queryKey: ["issue-reports"],
    queryFn: () => getIssueReportsPaginated({ pageNumber: 1, pageSize: 50 }),
  });

  const {
    data: emergencyLeaveRequestsResponse,
    isLoading: emergencyLeaveRequestsLoading,
  } = useQuery({
    queryKey: ["emergency-leave-requests"],
    queryFn: () =>
      getEmergencyLeaveRequestsPaginated({ pageNumber: 1, pageSize: 50 }),
  });

  const issueReports = issueReportsResponse?.content || [];
  const emergencyLeaveRequests = emergencyLeaveRequestsResponse?.content || [];

  const openIssues = issueReports.filter(
    (i) =>
      i.status === "Open" ||
      i.status === "InProgress" ||
      i.status === "Pending",
  ).length;

  const pendingRequests = emergencyLeaveRequests.filter(
    (r) => r.status === "Pending",
  ).length;

  const handleApproveIssue = async (id: string) => {
    try {
      setProcessingIssueId(id);
      await resolveIssueReport(id, "Approved");
      toastUtils.success("Issue đã được approve thành công");
      refetchIssueReports();
    } catch (error) {
      toastUtils.error("Không thể approve issue");
      console.error("Error approving issue:", error);
    } finally {
      setProcessingIssueId(null);
    }
  };

  const handleRejectIssue = async (id: string) => {
    try {
      setProcessingIssueId(id);
      await resolveIssueReport(id, "Rejected");
      toastUtils.success("Issue đã được reject thành công");
      refetchIssueReports();
    } catch (error) {
      toastUtils.error("Không thể reject issue");
      console.error("Error rejecting issue:", error);
    } finally {
      setProcessingIssueId(null);
    }
  };

  const handleUpdateTaskStatus = (taskAssignmentId: string) => {
    setProcessingIssueId(taskAssignmentId);
    startTaskMutation.mutate({
      id: taskAssignmentId,
      data: { workerId: "current-user-id" },
    });
  };

  /* ── Loading ── */
  if (issueReportsLoading || emergencyLeaveRequestsLoading) {
    return (
      <div className="space-y-8">
        <PageHeader />
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-[2.5px] border-gray-200 border-t-[#1a80a2]" />
            <p className="text-sm text-gray-400 tracking-wide">
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (issueReportsError) {
    return (
      <div className="space-y-8">
        <PageHeader />
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">
              Không thể tải dữ liệu
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Vui lòng kiểm tra kết nối và thử lại
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchIssueReports()}
            className="mt-1"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  /* ── Tab definitions ── */
  const tabs: {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    count?: number;
    badgeCount?: number;
  }[] = [
    {
      key: "issues",
      label: "Báo cáo sự cố",
      icon: <AlertTriangle className="h-4 w-4" />,
      count: issueReports.length,
      badgeCount: openIssues,
    },
    {
      key: "requests",
      label: "Nghỉ phép khẩn cấp",
      icon: <ClipboardPlus className="h-4 w-4" />,
      count: emergencyLeaveRequests.length,
      badgeCount: pendingRequests,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader />

      {/* ── Custom Tabs ── */}
      <div className="flex items-center gap-1 border-b border-gray-100">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "text-primary"
                    : "text-gray-400 hover:text-gray-600"
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-xs tabular-nums ${isActive ? "text-primary/60" : "text-gray-300"}`}
                >
                  {tab.count}
                </span>
              )}
              {(tab.badgeCount ?? 0) > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white tabular-nums">
                  {tab.badgeCount}
                </span>
              )}
              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div>
        {activeTab === "issues" && (
          <IssueReportsTable
            issues={issueReports}
            onApprove={handleApproveIssue}
            onReject={handleRejectIssue}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            isLoading={processingIssueId !== null}
          />
        )}
        {activeTab === "requests" && <EmergencyLeaveDashboard />}
      </div>
    </div>
  );
}

/* ── Page Header Component ── */
function PageHeader() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-gray-900">
        Sự cố & Yêu cầu
      </h1>
      <p className="mt-1 text-sm text-gray-400">
        Quản lý báo cáo sự cố và yêu cầu nghỉ phép khẩn cấp từ nhân viên
      </p>
    </div>
  );
}
