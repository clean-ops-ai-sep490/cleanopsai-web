"use client";

import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getSOPs, getSOPById } from "@/lib/sop-api";
import { getSLAsPaginated, getSLAById, getSLAShiftsBySLA, getSLATasksBySLA } from "@/lib/sla-api";
import { useQuery } from "@tanstack/react-query";
import type { SLA, SLAShift, SLATask } from "@/types/sla";
import type { SOP } from "@/types/sop";

interface SOPTaskSectionProps {
  formData: any;
  errors: Record<string, string>;
  updateField: (field: string, value: any) => void;
  onAutoFill?: (data: {
    sop?: SOP;
    sla?: SLA;
    slaShift?: SLAShift;
    slaTask?: SLATask;
  }) => void;
}

export function SOPTaskSection({
  formData,
  errors,
  updateField,
  onAutoFill,
}: SOPTaskSectionProps) {
  const selectedSlaId = formData.slaId;
  const selectedSopId = formData.sopId;
  const selectedSlaShiftId = formData.slaShiftId;
  const selectedSlaTaskId = formData.slaTaskId;

  // Fetch only the selected SOP details
  const { data: selectedSop } = useQuery({
    queryKey: ["sop", selectedSopId],
    queryFn: () => getSOPById(selectedSopId),
    enabled: !!selectedSopId,
  });

  // Fetch only the selected SLA details
  const { data: selectedSlaData } = useQuery({
    queryKey: ["sla", selectedSlaId],
    queryFn: () => getSLAById(selectedSlaId),
    enabled: !!selectedSlaId,
  });
  const selectedSla = Array.isArray(selectedSlaData) ? selectedSlaData[0] : selectedSlaData;

  // Fetch SLA Shifts based on selected SLA
  const { data: slaShifts = [] } = useQuery({
    queryKey: ["slaShifts", selectedSlaId],
    queryFn: () => getSLAShiftsBySLA(selectedSlaId),
    enabled: !!selectedSlaId,
  });

  // Fetch SLA Tasks based on selected SLA
  const { data: slaTasks = [] } = useQuery({
    queryKey: ["slaTasks", selectedSlaId],
    queryFn: () => getSLATasksBySLA(selectedSlaId),
    enabled: !!selectedSlaId,
  });

  // Get other selected objects from the lists we already have
  const selectedSlaShift = slaShifts.find(
    (shift) => shift.id === selectedSlaShiftId,
  );
  const selectedSlaTask = slaTasks.find(
    (task) => task.id === selectedSlaTaskId,
  );

  // Auto-fill form when all required selections are present
  useEffect(() => {
    if (selectedSop && selectedSla && selectedSlaShift && selectedSlaTask) {
      if (onAutoFill) {
        onAutoFill({
          sop: selectedSop,
          sla: selectedSla,
          slaShift: selectedSlaShift,
          slaTask: selectedSlaTask,
        });
      }
    }
  }, [
    selectedSop?.id,
    selectedSla?.id,
    selectedSlaShift?.id,
    selectedSlaTask?.id,
    onAutoFill,
  ]);

  const handleSlaChange = (slaId: string) => {
    updateField("slaId", slaId);
    updateField("slaShiftId", "");
    updateField("slaTaskId", "");
    // Reset location selections when SLA changes
    updateField("locationId", "");
    updateField("zoneId", "");
    updateField("workAreaId", "");
    updateField("workAreaDetailId", "");
    updateField("displayLocation", "");
  };

  const handleSopChange = (sopId: string) => {
    updateField("sopId", sopId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>SOP *</Label>
        <SearchableSelect
          value={selectedSopId || ""}
          onValueChange={handleSopChange}
          placeholder="Chọn SOP"
          searchPlaceholder="Tìm kiếm SOP..."
          emptyMessage="Không tìm thấy SOP"
          useInfiniteLoading={true}
          pageSize={10}
          queryKey={["sops", "infinite"]}
          queryFn={(page, pageSize, search) => getSOPs({ pageNumber: page, pageSize, search })}
          getItemById={getSOPById}
        />
        {errors.sopId && <p className="text-xs text-red-500">{errors.sopId}</p>}
      </div>

      <div className="space-y-2">
        <Label>SLA *</Label>
        <SearchableSelect
          value={selectedSlaId || ""}
          onValueChange={handleSlaChange}
          placeholder="Chọn SLA"
          searchPlaceholder="Tìm kiếm SLA..."
          emptyMessage="Không tìm thấy SLA"
          useInfiniteLoading={true}
          pageSize={10}
          queryKey={["slas", "infinite"]}
          queryFn={(page, pageSize, search) => getSLAsPaginated(page, pageSize, { search })}
          getItemById={async (id) => {
            const res = await getSLAById(id);
            return Array.isArray(res) ? res[0] : res;
          }}
        />
        {errors.slaId && <p className="text-xs text-red-500">{errors.slaId}</p>}
      </div>

      <div className="space-y-2">
        <Label>Ca làm việc *</Label>
        <SearchableSelect
          value={selectedSlaShiftId || ""}
          onValueChange={(id) => updateField("slaShiftId", id)}
          placeholder={!selectedSlaId ? "Chọn SLA trước" : "Chọn ca làm việc"}
          disabled={!selectedSlaId}
          loadItems={async () => ({
            items: slaShifts.map((shift) => ({
              id: shift.id,
              name: `${shift.name} (${shift.startTime?.substring(0, 5) || "--:--"} - ${shift.endTime?.substring(0, 5) || "--:--"})`,
            })),
            totalCount: slaShifts.length,
          })}
        />
        {errors.slaShiftId && (
          <p className="text-xs text-red-500">{errors.slaShiftId}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>SLA Task *</Label>
        <SearchableSelect
          value={selectedSlaTaskId || ""}
          onValueChange={(id) => updateField("slaTaskId", id)}
          placeholder={!selectedSlaId ? "Chọn SLA trước" : "Chọn SLA Task"}
          disabled={!selectedSlaId}
          loadItems={async () => ({
            items: slaTasks.map((task) => ({ id: task.id, name: task.name })),
            totalCount: slaTasks.length,
          })}
        />
        {errors.slaTaskId && (
          <p className="text-xs text-red-500">{errors.slaTaskId}</p>
        )}
      </div>
    </div>
  );
}
