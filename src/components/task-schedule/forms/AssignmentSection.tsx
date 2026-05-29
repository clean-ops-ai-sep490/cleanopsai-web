"use client";

import { useMemo, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, MapPin, Briefcase, Award, Eye } from "lucide-react";
import { filterWorkers, getWorkerById } from "@/lib/worker-api";
import { getSLAShiftsBySLA } from "@/lib/sla-api";
import { useQuery } from "@tanstack/react-query";
import { getSOPById } from "@/lib/sop-api";
import { RequirementComparison } from "./RequirementComparison";

interface AssignmentSectionProps {
  formData: any;
  errors: Record<string, string>;
  updateField: (field: string, value: any) => void;
  times?: string[];
}

export function AssignmentSection({
  formData,
  errors,
  updateField,
  times = [],
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

  // Fetch selected worker details for basic info & name syncing
  const { data: basicWorker } = useQuery({
    queryKey: ["worker", formData.assigneeId],
    queryFn: () => getWorkerById(formData.assigneeId),
    enabled: !!formData.assigneeId,
  });

  // Fetch fully-populated worker details from filter API (contains correct skills & certifications names)
  const { data: filterWorkerResult } = useQuery({
    queryKey: ["worker-filter-details", formData.assigneeId, formData.assigneeName],
    queryFn: () => filterWorkers({ search: formData.assigneeName || "" }),
    enabled: !!formData.assigneeId && !!formData.assigneeName,
  });

  // Find the exact worker in the filter result, fallback to basicWorker if not loaded yet
  const selectedWorker = useMemo(() => {
    if (!formData.assigneeId) return null;
    if (filterWorkerResult?.content) {
      const found = filterWorkerResult.content.find((w: any) => w.id === formData.assigneeId);
      if (found) return found;
    }
    return basicWorker || null;
  }, [filterWorkerResult, basicWorker, formData.assigneeId]);

  // Handle worker selection
  const handleWorkerSelect = (workerId: string) => {
    updateField("assigneeId", workerId);
  };

  // Sync worker name to form when selected
  useEffect(() => {
    if (basicWorker) {
      updateField("assigneeName", basicWorker.fullName);
    }
  }, [basicWorker]);

  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const formatCertDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${d.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  const renderWorkerHoverCard = (worker: any) => {
    return (
      <div className="space-y-3 text-xs">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/5 flex items-center justify-center border border-primary/10 flex-shrink-0">
            {worker.avatarUrl ? (
              <img src={worker.avatarUrl} alt={worker.fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{worker.fullName || worker.name}</p>
            <p className="text-[10px] text-gray-500 truncate flex items-center gap-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {worker.displayAddress || "Chưa có địa chỉ"}
            </p>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-1">
          <p className="font-medium text-gray-500 uppercase text-[9px] tracking-wider flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
            Kỹ năng ({worker.skills?.length || 0})
          </p>
          {worker.skills && worker.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {worker.skills.map((skill: any, idx: number) => {
                const sName = skill.name || skill.skill?.name;
                return (
                  <span
                    key={`${skill.id || "skill"}-${idx}`}
                    className="bg-primary/5 text-primary border border-primary/10 text-[9px] px-1.5 py-0.5 rounded-sm font-medium"
                  >
                    {sName}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-[10px] text-gray-400 italic">Không có kỹ năng</p>
          )}
        </div>

        {/* Certifications */}
        <div className="space-y-1">
          <p className="font-medium text-gray-500 uppercase text-[9px] tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-gray-400" />
            Chứng chỉ ({worker.certifications?.length || 0})
          </p>
          {worker.certifications && worker.certifications.length > 0 ? (
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {worker.certifications.map((cert: any, idx: number) => {
                const cName = cert.name || cert.certification?.name;
                return (
                  <div key={`${cert.id || "cert"}-${idx}`} className="flex items-center gap-1 text-[10px] text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="truncate">{cName}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[10px] text-gray-400 italic">Không có chứng chỉ</p>
          )}
        </div>
      </div>
    );
  };

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
              <div className="flex gap-2 items-center">
                <div className="flex-1">
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
                      locationAddress,
                      times,
                      formData.durationMinutes
                    ]}
                    queryFn={(page, pageSize, search) => {
                      const params: any = {
                        pageNumber: page,
                        pageSize,
                        search: search,
                        address: locationAddress,
                      };

                      // Calculate startAt and endAt based on selected time and duration
                      const baseDate = formData.contractStartDate || new Date().toISOString().split("T")[0];
                      const startTime = times[0] || selectedShift?.startTime;
                      
                      if (startTime) {
                        const normalizedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
                        const startAtISO = `${baseDate.split("T")[0]}T${normalizedStartTime}Z`;
                        params.startAt = startAtISO;

                        if (formData.durationMinutes) {
                          const startDate = new Date(startAtISO);
                          const endDate = new Date(startDate.getTime() + formData.durationMinutes * 60000);
                          params.endAt = endDate.toISOString().split(".")[0] + "Z";
                        }
                      }

                      if (sopData?.requiredSkillIds?.length) params.skillIds = sopData.requiredSkillIds;
                      if (sopData?.requiredCertificationIds?.length) params.certificateIds = sopData.requiredCertificationIds;
                      
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
                    renderHoverCard={renderWorkerHoverCard}
                  />
                </div>
                {formData.assigneeId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 border-primary text-primary hover:bg-primary-soft hover:text-primary flex items-center gap-1.5 shrink-0"
                    onClick={() => setQuickViewOpen(true)}
                  >
                    <Eye className="w-4 h-4" />
                    Xem nhanh
                  </Button>
                )}
              </div>

              {errors.assigneeId && (
                <p className="text-sm text-red-500">{errors.assigneeId}</p>
              )}

              <RequirementComparison 
                requiredSkillIds={sopData?.requiredSkillIds || []}
                requiredCertificationIds={sopData?.requiredCertificationIds || []}
                workerId={formData.assigneeId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dialog xem nhanh thông tin nhân viên */}
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Thông tin nhân viên
            </DialogTitle>
          </DialogHeader>

          {selectedWorker ? (
            (() => {
              const workerData = selectedWorker as any;
              return (
                <div className="space-y-4 py-2">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0">
                      {workerData.avatarUrl ? (
                        <img src={workerData.avatarUrl} alt={workerData.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-base">{workerData.fullName}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                        <span className="truncate">{workerData.displayAddress || "Chưa cập nhật địa chỉ"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      Kỹ năng ({workerData.skills?.length || 0})
                    </h5>
                    {workerData.skills && workerData.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-0.5">
                        {workerData.skills.map((skill: any, idx: number) => {
                          const sName = skill.name || skill.skill?.name;
                          const sCategory = skill.category || skill.skill?.category;
                          return (
                            <span
                              key={`${skill.id || "skill"}-${idx}`}
                              className="bg-primary/5 text-primary border border-primary/10 text-xs px-2.5 py-1 rounded-full font-medium"
                            >
                              {sName} {sCategory && <span className="text-[10px] opacity-60">({sCategory})</span>}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-2 rounded text-center">Chưa cập nhật kỹ năng</p>
                    )}
                  </div>

                  {/* Certifications */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-slate-400" />
                      Chứng chỉ ({workerData.certifications?.length || 0})
                    </h5>
                    {workerData.certifications && workerData.certifications.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {workerData.certifications.map((cert: any, idx: number) => {
                          const cName = cert.name || cert.certification?.name;
                          const cCategory = cert.category || cert.certification?.category;
                          return (
                            <div
                              key={`${cert.id || "cert"}-${idx}`}
                              className="flex items-start justify-between p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                <div>
                                  <p className="font-semibold text-slate-800 text-xs">{cName}</p>
                                  {cCategory && <p className="text-[10px] text-slate-500 mt-0.5">Loại: {cCategory}</p>}
                                </div>
                              </div>
                              {cert.expiredAt && (
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                  Hạn: {formatCertDate(cert.expiredAt)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-2 rounded text-center">Chưa cập nhật chứng chỉ</p>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="py-8 text-center text-slate-400 italic">Đang tải thông tin nhân viên...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
