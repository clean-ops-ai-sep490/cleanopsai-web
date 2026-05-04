"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  FileWarning,
  Inbox,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getEmergencyLeaveRequestsPaginated,
  type EmergencyLeaveRequest,
} from "@/lib/emergency-leave-request-api";
import { useEmergencyLeaveActions } from "@/hooks/useEmergencyLeaveActions";
import { EmergencyRequestsListPanel } from "./EmergencyRequestsList";
import { EmergencyRequestDetail } from "./EmergencyRequestDetail";

export function EmergencyLeaveDashboard() {
  const [selectedRequest, setSelectedRequest] =
    useState<EmergencyLeaveRequest | null>(null);

  const {
    data: requestsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["emergency-leave-requests"],
    queryFn: () =>
      getEmergencyLeaveRequestsPaginated({ pageNumber: 1, pageSize: 50 }),
  });

  const requests = requestsResponse?.content || [];
  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  const {
    affectedTasks,
    loadingTasks,
    decisions,
    availableWorkers,
    loadingWorkers,
    submitting,
    results,
    fetchAffectedTasks,
    fetchAvailableWorkers,
    setTaskAction,
    setTaskWorker,
    approveRequest,
    rejectRequest,
    retryFailed,
    setBulkAction,
    reset,
  } = useEmergencyLeaveActions();

  const handleSelectRequest = useCallback(
    async (request: EmergencyLeaveRequest) => {
      setSelectedRequest(request);
      reset();
      await fetchAffectedTasks(request);
    },
    [fetchAffectedTasks, reset],
  );

  const handleApprove = useCallback(async () => {
    if (!selectedRequest) return;
    const success = await approveRequest(selectedRequest);
    if (success) {
      setSelectedRequest(null);
      reset();
      refetch();
    }
  }, [selectedRequest, approveRequest, reset, refetch]);

  const handleReject = useCallback(async () => {
    if (!selectedRequest) return;
    const success = await rejectRequest(selectedRequest);
    if (success) {
      setSelectedRequest(null);
      reset();
      refetch();
    }
  }, [selectedRequest, rejectRequest, reset, refetch]);

  // Auto-select first pending - use ref to prevent infinite loop
  const hasAutoSelected = useRef(false);
  useEffect(() => {
    if (hasAutoSelected.current) return;
    if (!selectedRequest && requests.length > 0) {
      const firstPending = requests.find((r) => r.status === "Pending");
      if (firstPending) {
        hasAutoSelected.current = true;
        setSelectedRequest(firstPending);
        reset();
        fetchAffectedTasks(firstPending);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-gray-400">Đang tải yêu cầu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <FileWarning className="h-10 w-10 text-red-300" />
        <p className="text-sm text-gray-500">Không thể tải dữ liệu</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Thử lại
        </Button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
          <Inbox className="h-6 w-6 text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-400">
          Không có yêu cầu nghỉ phép khẩn cấp
        </p>
        <p className="mt-1 text-xs text-gray-300">
          Danh sách sẽ tự động cập nhật khi có yêu cầu mới
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-5 rounded-xl border border-gray-100 bg-white"
      style={{ gridTemplateColumns: "320px 1fr" }}
    >
      {/* ─── LEFT: Request List ─── */}
      <div className="border-r border-gray-100">
        {/* List Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div>
            <p className="text-sm font-semibold text-gray-800">Danh sách</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {requests.length} yêu cầu
              {pendingCount > 0 && (
                <> · <span className="text-amber-500 font-medium">{pendingCount} chờ duyệt</span></>
              )}
            </p>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="max-h-[560px] overflow-y-auto">
          <EmergencyRequestsListPanel
            requests={requests}
            selectedRequestId={selectedRequest?.id || null}
            onSelect={handleSelectRequest}
            processingId={submitting ? selectedRequest?.id : null}
          />
        </div>
      </div>

      {/* ─── RIGHT: Detail ─── */}
      <div className="min-w-0">
        {selectedRequest ? (
          <div className="max-h-[600px] overflow-y-auto p-6">
            <EmergencyRequestDetail
              request={selectedRequest}
              affectedTasks={affectedTasks}
              loadingTasks={loadingTasks}
              decisions={decisions}
              availableWorkers={availableWorkers}
              loadingWorkers={loadingWorkers}
              submitting={submitting}
              results={results}
              onApprove={handleApprove}
              onReject={handleReject}
              onRetryFailed={retryFailed}
              onSetAction={setTaskAction}
              onSetWorker={setTaskWorker}
              onFetchWorkers={fetchAvailableWorkers}
              onBulkAction={setBulkAction}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <Inbox className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">
              Chọn yêu cầu để xem chi tiết
            </p>
            <p className="mt-1 text-xs text-gray-300 max-w-[240px]">
              Click vào một yêu cầu bên trái để xem thông tin và xử lý
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
