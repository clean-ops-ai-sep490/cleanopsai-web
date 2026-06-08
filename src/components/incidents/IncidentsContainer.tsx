"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ClipboardPlus } from "lucide-react";
import { toastUtils } from "@/lib/utils/toast-utils";
import { IssueReportsTable } from "./IssueReportsTable";
import { EmergencyLeaveDashboard } from "./EmergencyLeaveDashboard";
import {
  getIssueReportsPaginated,
  resolveIssueReport,
} from "@/lib/issue-report-api";
import { getEmergencyLeaveRequestsPaginated } from "@/lib/emergency-leave-request-api";
import { useStartTask } from "@/hooks/useTaskActions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssueReportDetailPanel } from "./IssueReportDetailPanel";
import { IssueReport, getIssueReportById } from "@/lib/issue-report-api";
import { getTaskAssignmentById } from "@/lib/task-assignment-api";
import { useEffect } from "react";

type TabKey = "issues" | "requests";

export function IncidentsContainer() {
  const [activeTab, setActiveTab] = useState<TabKey>("issues");
  const [processingIssueId, setProcessingIssueId] = useState<string | null>(
    null,
  );
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null);
  const [isIssueSheetOpen, setIsIssueSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const queryClient = useQueryClient();

  const startTaskMutation = useStartTask(() => {
    queryClient.invalidateQueries({ queryKey: ["task-assignment-statuses"] });
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

  const issueReports = issueReportsResponse?.content || [];

  const { data: taskStatuses } = useQuery({
    queryKey: ["task-assignment-statuses", issueReports.map((i) => i.taskAssignmentId).filter(Boolean)],
    queryFn: async () => {
      const approvedIssues = issueReports.filter(
        (i) => i.status === "Approved" && i.taskAssignmentId
      );
      if (approvedIssues.length === 0) return {};

      const results = await Promise.all(
        approvedIssues.map(async (issue) => {
          try {
            const task = await getTaskAssignmentById(issue.taskAssignmentId!);
            return { id: issue.taskAssignmentId!, status: task.status };
          } catch (e) {
            console.error(`Error fetching task assignment ${issue.taskAssignmentId}:`, e);
            return { id: issue.taskAssignmentId!, status: null };
          }
        })
      );

      return results.reduce<Record<string, string>>((acc, curr) => {
        if (curr.status) {
          acc[curr.id] = curr.status;
        }
        return acc;
      }, {});
    },
    enabled: issueReports.length > 0,
  });

  const {
    data: emergencyLeaveRequestsResponse,
    isLoading: emergencyLeaveRequestsLoading,
  } = useQuery({
    queryKey: ["emergency-leave-requests"],
    queryFn: () =>
      getEmergencyLeaveRequestsPaginated({ pageNumber: 1, pageSize: 50 }),
  });

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

  const handleViewIssueDetail = async (issue: IssueReport) => {
    setIsIssueSheetOpen(true);
    setSelectedIssue(issue);
    try {
      const fullIssue = await getIssueReportById(issue.id);
      setSelectedIssue(fullIssue);
    } catch (error) {
      console.error("Error fetching full issue details:", error);
    }
  };

  /* ── Loading ── */
  if (issueReportsLoading || emergencyLeaveRequestsLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Sự cố & Yêu cầu" description="Đang tải dữ liệu..." />
        <div className="flex items-center justify-center py-32 bg-white rounded-2xl border border-slate-100 shadow-none">
          <LoadingSpinner label="Đang tải dữ liệu sự cố..." />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (issueReportsError) {
    return (
      <div className="space-y-8">
        <PageHeader title="Sự cố & Yêu cầu" description="Lỗi kết nối máy chủ" />
        <div className="flex flex-col items-center justify-center gap-4 py-20 bg-white rounded-2xl border border-slate-100 shadow-none">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50/50">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-slate-900">
              Không thể kết nối máy chủ
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Vui lòng kiểm tra lại kết nối mạng của bạn
            </p>
          </div>
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
    <div className="space-y-8 pb-10">
      <PageHeader 
        title="Sự cố & Yêu cầu" 
        description="Quản lý báo cáo sự cố và yêu cầu nghỉ phép khẩn cấp từ nhân viên." 
      />

      {/* ── Tabs System ── */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-px">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  relative flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold transition-all duration-300
                  ${
                    isActive
                      ? "text-primary"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
                  }
                  rounded-t-xl
                `}
              >
                <span className={`transition-transform duration-300 ${isActive ? "scale-110" : "scale-100 opacity-70"}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                
                {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span className={`
                    flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold
                    bg-rose-500 text-white ml-1
                  `}>
                    {tab.badgeCount}
                  </span>
                )}

                {/* Active Underline */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>


      {/* ── Content ── */}
      <div className="pt-2">
        {activeTab === "issues" && (
          <IssueReportsTable
            issues={issueReports}
            taskStatuses={taskStatuses || {}}
            onApprove={handleApproveIssue}
            onReject={handleRejectIssue}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onViewDetail={handleViewIssueDetail}
            isLoading={processingIssueId !== null}
          />
        )}
        {activeTab === "requests" && <EmergencyLeaveDashboard />}
      </div>

      {/* ─── Issue Detail SlideOver ─── */}
      {mounted && createPortal(
        <AnimatePresence>
          {isIssueSheetOpen && (
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/10 pointer-events-auto"
                onClick={() => setIsIssueSheetOpen(false)}
              />

              {/* Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
                className="fixed inset-y-0 right-0 w-full sm:max-w-2xl bg-white border-l border-slate-200 flex flex-col shadow-2xl pointer-events-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chi tiết báo cáo sự cố</h2>
                    <p className="text-sm text-slate-400 mt-1">Xem thông tin chi tiết và lịch sử xử lý</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-slate-100 transition-colors"
                    onClick={() => setIsIssueSheetOpen(false)}
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-hide">
                  {selectedIssue && (
                    <IssueReportDetailPanel issue={selectedIssue} />
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
