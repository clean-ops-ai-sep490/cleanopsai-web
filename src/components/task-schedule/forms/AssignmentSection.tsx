"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { User } from "lucide-react";
import { filterWorkers, getWorkerById } from "@/lib/worker-api";
import { getSLAShiftsBySLA } from "@/lib/sla-api";
import { useQuery } from "@tanstack/react-query";
import { getSOPById } from "@/lib/sop-api";

interface AssignmentSectionProps {
  formData: any;
  errors: Record<string, string>;
  updateField: (field: string, value: any) => void;
}

export function AssignmentSection({
  formData,
  errors,
  updateField,
}: AssignmentSectionProps) {
  const sopId = formData.sopId;
  const slaId = formData.slaId;
  const slaShiftId = formData.slaShiftId;
  const locationAddress = formData.locationAddress;

  // Get SLA Shift details to extract time range
  const { data: slaShifts = [] } = useQuery({
    queryKey: ["slaShifts", slaId],
    queryFn: () => getSLAShiftsBySLA(slaId),
    enabled: !!slaId,
  });

  const selectedShift = useMemo(() => {
    return slaShifts.find((shift) => shift.id === slaShiftId);
  }, [slaShifts, slaShiftId]);

  // Fetch SOP details to get requirements
  const { data: sopData } = useQuery({
    queryKey: ["sop", sopId],
    queryFn: () => getSOPById(sopId),
    enabled: !!sopId,
  });

  // Fetch selected worker details for display
  const { data: selectedWorker } = useQuery({
    queryKey: ["worker", formData.assigneeId],
    queryFn: () => getWorkerById(formData.assigneeId),
    enabled: !!formData.assigneeId,
  });

  // Handle worker selection
  const handleWorkerSelect = (workerId: string) => {
    updateField("assigneeId", workerId);
    // Note: Name will be fetched/synced via selectedWorker query or form update
  };

  // Sync worker name to form when selected
  useEffect(() => {
    if (selectedWorker) {
      updateField("assigneeName", selectedWorker.fullName);
    }
  }, [selectedWorker]);

  return (
    <div className="space-y-6">
      <div>
        {/* <h2 className="text-lg font-semibold text-black mb-4">
          Phân công nhân viên
        </h2> */}

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Người thực hiện *</Label>
              <SearchableSelect
                value={formData.assigneeId || ""}
                onValueChange={handleWorkerSelect}
                placeholder={
                  !sopId || !slaShiftId 
                    ? "Chọn SOP và Ca làm việc trước" 
                    : "Chọn nhân viên"
                }
                disabled={!sopId || !slaShiftId}
                useInfiniteLoading={true}
                pageSize={10}
                queryKey={[
                  "workers", 
                  "infinite", 
                  sopId, 
                  slaShiftId, 
                  locationAddress
                ]}
                queryFn={(page, pageSize, search) => {
                  const params: any = {
                    pageNumber: page,
                    pageSize,
                    search: search,
                    address: locationAddress,
                  };
                  if (selectedShift?.startTime) params.startAt = selectedShift.startTime;
                  if (selectedShift?.endTime) params.endAt = selectedShift.endTime;
                  if (sopData?.requiredSkillIds?.length) params.skillCategories = sopData.requiredSkillIds;
                  if (sopData?.requiredCertificationIds?.length) params.certificateCategories = sopData.requiredCertificationIds;
                  
                  return filterWorkers(params).then(res => ({
                    ...res,
                    content: res.content.map(item => ({
                      ...item,
                      id: item.id,
                      name: item.fullName
                    }))
                  }));
                }}
                getItemById={(id) => 
                  getWorkerById(id).then(item => ({
                    ...item,
                    id: item.id,
                    name: item.fullName
                  }))
                }
                displayFormatter={(item: any) => item.fullName}
              />

              {errors.assigneeId && (
                <p className="text-sm text-red-500">{errors.assigneeId}</p>
              )}
            </div>

            {/* Selection Context Info */}
            {(sopId || slaShiftId) && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border">
                <div className="font-medium mb-1">
                  Đang lọc nhân viên theo:
                </div>
                <ul className="text-xs space-y-1">
                  {sopId && <li>• Kỹ năng & chứng chỉ yêu cầu bởi SOP</li>}
                  {selectedShift && (
                    <li>• Trống lịch trong khung giờ {selectedShift.startTime.substring(0, 5)} - {selectedShift.endTime.substring(0, 5)}</li>
                  )}
                  {locationAddress && <li>• Khu vực gần địa chỉ dự án</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Ensure useEffect is imported
import { useEffect } from "react";
