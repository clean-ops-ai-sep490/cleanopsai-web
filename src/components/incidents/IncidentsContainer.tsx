"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, AlertOctagon, ClipboardPlus, Plus } from "lucide-react";
import { toastUtils } from "@/lib/utils/toast-utils";
import { IncidentStats } from "./IncidentStats";
import { EmergencyBanner } from "./EmergencyBanner";
import { IssueReportsTable } from "./IssueReportsTable";
import { EmergencyAlertsList } from "./EmergencyAlertsList";
import { RequestsList } from "./RequestsList";
import { CreateAdHocTaskDialog } from "./dialogs/CreateAdHocTaskDialog";
import { mockEmergencies, mockRequests } from "./mockData";
import { AdHocTaskForm } from "./types";
import {
  getIssueReportsPaginated,
  resolveIssueReport,
} from "@/lib/issue-report-api";

export function IncidentsContainer() {
  const [activeTab, setActiveTab] = useState("issues");
  const [adHocDialogOpen, setAdHocDialogOpen] = useState(false);
  const [processingIssueId, setProcessingIssueId] = useState<string | null>(
    null,
  );

  // Fetch issue reports from API
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

  // Calculate stats from real data
  const openIssues = issueReports.filter(
    (i) =>
      i.status === "Open" ||
      i.status === "InProgress" ||
      i.status === "Pending",
  ).length;

  const activeEmergencies = mockEmergencies.filter(
    (e) => e.status === "active",
  ).length;

  const pendingRequests = mockRequests.filter(
    (r) => r.status === "pending",
  ).length;

  const activeEmergency = mockEmergencies.find((e) => e.status === "active");

  const handleApproveRequest = (id: string) =>
    toastUtils.success(`Yêu cầu ${id} đã được phê duyệt`);

  const handleRejectRequest = (id: string) =>
    toastUtils.error(`Yêu cầu ${id} đã bị từ chối`);

  const handleResolveEmergency = (id: string) =>
    toastUtils.success(`Cảnh báo ${id} đã được xử lý`);

  const handleCreateAdHocTask = (form: AdHocTaskForm) => {
    if (!form.title.trim()) {
      toastUtils.error("Vui lòng nhập tên task");
      return;
    }
    toastUtils.success(
      `Ad-hoc Task "${form.title}" đã được tạo và giao cho ${
        form.assignee || "AI Auto-assign"
      }`,
    );
    setAdHocDialogOpen(false);
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

  // Show loading state
  if (issueReportsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Giám Sát Sự Cố & Yêu Cầu
            </h1>
            <p className="text-gray-600 mt-1">
              Issue Report, Emergency Alert, Ad-hoc Request và Equipment Request
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (issueReportsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Giám Sát Sự Cố & Yêu Cầu
            </h1>
            <p className="text-gray-600 mt-1">
              Issue Report, Emergency Alert, Ad-hoc Request và Equipment Request
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">
              Không thể tải dữ liệu issue reports
            </p>
            <Button onClick={() => refetchIssueReports()}>Thử lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">
            Giám Sát Sự Cố & Yêu Cầu
          </h1>
          <p className="text-gray-600 mt-1">
            Issue Report, Emergency Alert, Ad-hoc Request và Equipment Request
          </p>
        </div>
        <Button
          className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
          onClick={() => setAdHocDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Ad-hoc Task
        </Button>
      </div>

      {/* Stats */}
      <IncidentStats
        openIssues={openIssues}
        activeEmergencies={activeEmergencies}
        pendingRequests={pendingRequests}
        resolvedThisMonth={24}
      />

      {/* Emergency Banner */}
      {activeEmergency && (
        <EmergencyBanner
          emergency={activeEmergency}
          onResolve={handleResolveEmergency}
        />
      )}

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="issues" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Issue Reports ({issueReports.length})
                {openIssues > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {openIssues}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="emergencies"
                className="flex items-center gap-2"
              >
                <AlertOctagon className="w-4 h-4" />
                Emergency
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <ClipboardPlus className="w-4 h-4" />
                Yêu cầu
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
                isLoading={processingIssueId !== null}
              />
            </TabsContent>
            <TabsContent value="emergencies">
              <EmergencyAlertsList
                emergencies={mockEmergencies}
                onResolve={handleResolveEmergency}
              />
            </TabsContent>
            <TabsContent value="requests">
              <RequestsList
                requests={mockRequests}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Ad-hoc Task Dialog */}
      <CreateAdHocTaskDialog
        open={adHocDialogOpen}
        onOpenChange={setAdHocDialogOpen}
        onSubmit={handleCreateAdHocTask}
      />
    </div>
  );
}
