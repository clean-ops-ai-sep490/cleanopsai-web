"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, ClipboardPlus } from "lucide-react";
import { toastUtils } from "@/lib/utils/toast-utils";
import { IssueReportsTable } from "./IssueReportsTable";
import { RequestsList } from "./RequestsList";
import {
  getIssueReportsPaginated,
  resolveIssueReport,
} from "@/lib/issue-report-api";
import {
  getEmergencyLeaveRequestsPaginated,
  reviewEmergencyLeaveRequest,
} from "@/lib/emergency-leave-request-api";
import { updateTaskAssignmentStatus } from "@/lib/task-assignment-api";
import { TaskAssignmentStatus } from "@/types/task";

export function IncidentsContainer() {
  const [activeTab, setActiveTab] = useState("issues");
  const [processingIssueId, setProcessingIssueId] = useState<string | null>(
    null,
  );
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null,
  );

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
    error: emergencyLeaveRequestsError,
    refetch: refetchEmergencyLeaveRequests,
  } = useQuery({
    queryKey: ["emergency-leave-requests"],
    queryFn: () =>
      getEmergencyLeaveRequestsPaginated({ pageNumber: 1, pageSize: 10 }),
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
    (request) => request.status === "Pending",
  ).length;

  const handleApproveRequest = async (id: string) => {
    try {
      setProcessingRequestId(id);
      await reviewEmergencyLeaveRequest(id, { status: "Approved" });
      toastUtils.success("Đã duyệt emergency leave request");
      refetchEmergencyLeaveRequests();
    } catch (error) {
      toastUtils.error("Không thể duyệt emergency leave request");
      console.error("Error approving emergency leave request:", error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      setProcessingRequestId(id);
      await reviewEmergencyLeaveRequest(id, { status: "Rejected" });
      toastUtils.success("Đã từ chối emergency leave request");
      refetchEmergencyLeaveRequests();
    } catch (error) {
      toastUtils.error("Không thể từ chối emergency leave request");
      console.error("Error rejecting emergency leave request:", error);
    } finally {
      setProcessingRequestId(null);
    }
  };

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

  const handleUpdateTaskStatus = async (taskAssignmentId: string) => {
    try {
      setProcessingIssueId(taskAssignmentId);
      await updateTaskAssignmentStatus(
        taskAssignmentId,
        TaskAssignmentStatus.InProgress,
      );
      toastUtils.success("Trạng thái task đã được cập nhật thành InProgress");
      refetchIssueReports();
    } catch (error) {
      toastUtils.error("Không thể cập nhật trạng thái task");
      console.error("Error updating task status:", error);
    } finally {
      setProcessingIssueId(null);
    }
  };

  if (issueReportsLoading || emergencyLeaveRequestsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Giám Sát Sự Cố & Yêu Cầu
            </h1>
            <p className="mt-1 text-gray-600">
              Issue report và emergency leave request
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (issueReportsError || emergencyLeaveRequestsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Giám Sát Sự Cố & Yêu Cầu
            </h1>
            <p className="mt-1 text-gray-600">
              Issue report và emergency leave request
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="mb-4 text-red-600">Không thể tải dữ liệu incidents</p>
            <Button
              onClick={() => {
                refetchIssueReports();
                refetchEmergencyLeaveRequests();
              }}
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">
            Giám Sát Sự Cố & Yêu Cầu
          </h1>
          <p className="mt-1 text-gray-600">
            Issue report và emergency leave request
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="issues" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Issue Reports ({issueReports.length})
                {openIssues > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {openIssues}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <ClipboardPlus className="h-4 w-4" />
                Emergency Leave
                {pendingRequests > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {pendingRequests}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="issues">
              <IssueReportsTable
                issues={issueReports}
                onApprove={handleApproveIssue}
                onReject={handleRejectIssue}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                isLoading={processingIssueId !== null}
              />
            </TabsContent>
            <TabsContent value="requests">
              <RequestsList
                requests={emergencyLeaveRequests}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
                processingId={processingRequestId}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
