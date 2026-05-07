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
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  getEmergencyLeaveRequestsPaginated,
  type EmergencyLeaveRequest,
} from "@/lib/emergency-leave-request-api";
import { useEmergencyLeaveActions } from "@/hooks/useEmergencyLeaveActions";
import { EmergencyRequestsListPanel } from "./EmergencyRequestsList";
import { EmergencyRequestDetail } from "./EmergencyRequestDetail";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import { createPortal } from "react-dom";

export function EmergencyLeaveDashboard() {
  const [selectedRequest, setSelectedRequest] =
    useState<EmergencyLeaveRequest | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const pendingCount = requests.filter((r: EmergencyLeaveRequest) => r.status === "Pending").length;

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
    updateTaskDecision,
    reset,
  } = useEmergencyLeaveActions();

  const handleSelectRequest = useCallback(
    async (request: EmergencyLeaveRequest) => {
      setSelectedRequest(request);
      setIsSheetOpen(true);
      reset();
      await fetchAffectedTasks(request);
    },
    [fetchAffectedTasks, reset],
  );

  const handleApprove = useCallback(async () => {
    if (!selectedRequest) return;
    const success = await approveRequest(selectedRequest);
    if (success) {
      setIsSheetOpen(false);
      setSelectedRequest(null);
      reset();
      refetch();
    }
  }, [selectedRequest, approveRequest, reset, refetch]);

  const handleReject = useCallback(async () => {
    if (!selectedRequest) return;
    const success = await rejectRequest(selectedRequest);
    if (success) {
      setIsSheetOpen(false);
      setSelectedRequest(null);
      reset();
      refetch();
    }
  }, [selectedRequest, rejectRequest, reset, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-slate-400">Đang tải yêu cầu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <FileWarning className="h-10 w-10 text-rose-300" />
        <p className="text-sm text-slate-500">Không thể tải dữ liệu</p>
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
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
          <Inbox className="h-6 w-6 text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-400">
          Không có yêu cầu nghỉ phép khẩn cấp
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Main Table ─── */}
      <div className="min-h-[400px]">
        <EmergencyRequestsListPanel
          requests={requests}
          selectedRequestId={selectedRequest?.id || null}
          onSelect={handleSelectRequest}
          processingId={submitting ? selectedRequest?.id : null}
        />
      </div>

      {/* ─── Minimalist Portalled SlideOver ─── */}
      {mounted && createPortal(
        <AnimatePresence>
          {isSheetOpen && (
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 40 }}>
              {/* Backdrop (Dim only) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-slate-900/10 pointer-events-auto"
                style={{ zIndex: 40 }}
                onClick={() => setIsSheetOpen(false)}
              />

              {/* Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
                className="fixed inset-y-0 right-0 w-full sm:max-w-2xl bg-white border-l border-slate-200 flex flex-col shadow-xl pointer-events-auto"
                style={{ zIndex: 45 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chi tiết điều phối</h2>
                    <p className="text-sm text-slate-400 mt-1">Xử lý yêu cầu và thay thế worker</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-slate-100 transition-colors"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-hide">
                  {selectedRequest && (
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
                      onUpdateDecision={updateTaskDecision}
                    />
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


