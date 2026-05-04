"use client";

import { useState, useEffect, useMemo } from "react";
import { StandardDialog } from "@/components/ui/standard-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";

import { useAuth } from "@/hooks/useAuth"; // Để lấy list workers
import { useSkills } from "@/hooks/useSkills";
import { useCreateWorkerSkill } from "@/hooks/useWorkerSkills";
import { useCreateWorkerCertification } from "@/hooks/useWorkerCertifications";
import useCertifications from "@/hooks/useCertifications";
import { toast } from "sonner";
import { useWorkers } from "@/hooks/useWorkers";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function GlobalAssignModal({ open, onClose }: Props) {
  // Common States
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [assignType, setAssignType] = useState<"skill" | "cert">("skill");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lists Data
  const { data: workersData } = useWorkers();
// Sửa lại
  const workersList = workersData?.content ?? workersData ?? [];
  console.log("workersData:", workersData);
  const { data: skillsData } = useSkills({ pageSize: 100 });
  const { data: certsData } = useCertifications({ pageSize: 100 });

  // Mutations
  const { mutateAsync: assignSkill } = useCreateWorkerSkill();
  const { mutateAsync: assignCert } = useCreateWorkerCertification();

  // States for Skill
  const [skillId, setSkillId] = useState("");
  // GlobalAssignModal - state khởi tạo
const [skillLevel, setSkillLevel] = useState<string>("Beginner");

  // States for Certs
  const [certId, setCertId] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [expiredAt, setExpiredAt] = useState("");

  // Options Mapping
  const skillOptions = useMemo(() => {
  return (skillsData?.content || []).map((s: any) => ({ value: s.id, label: s.name }));
}, [skillsData]);

const certOptions = useMemo(() => {
  return (certsData?.content || []).map((c: any) => ({ value: c.id, label: c.name }));
}, [certsData]);

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedWorkerId) return toast.error("Vui lòng chọn nhân viên");

  try {
    setIsSubmitting(true);

    if (assignType === "skill") {
      if (!skillId) return toast.error("Vui lòng chọn kỹ năng");

      const results = await Promise.allSettled(
        [skillId].map((id) =>
          assignSkill({ workerId: selectedWorkerId, skillId: id, skillLevel })
        )
      );

      const failed = results.filter((r) => r.status === "rejected");
      const succeeded = results.filter((r) => r.status === "fulfilled");

      if (succeeded.length > 0 && failed.length === 0) {
        toast.success(`Cấp thành công ${succeeded.length} kỹ năng 🎉`);
      } else if (succeeded.length > 0 && failed.length > 0) {
        toast.warning(`Cấp được ${succeeded.length} kỹ năng, ${failed.length} kỹ năng đã tồn tại hoặc lỗi.`);
      } else {
        toast.error("Tất cả kỹ năng đều thất bại, có thể đã tồn tại từ trước.");
        return; // Không đóng modal
      }

    } else {
      if (!certId || !issuedDate)
        return toast.error("Vui lòng chọn chứng chỉ và ngày cấp");

      const results = await Promise.allSettled(
        [certId].map((id) =>
          assignCert({
            workerId: selectedWorkerId,
            certificationId: id,
            issuedDate: new Date(issuedDate).toISOString(),
            expiredAt: expiredAt ? new Date(expiredAt).toISOString() : null,
          })
        )
      );

      const failed = results.filter((r) => r.status === "rejected");
      const succeeded = results.filter((r) => r.status === "fulfilled");

      if (succeeded.length > 0 && failed.length === 0) {
        toast.success(`Cấp thành công ${succeeded.length} chứng chỉ 🎉`);
      } else if (succeeded.length > 0 && failed.length > 0) {
        toast.warning(`Cấp được ${succeeded.length} chứng chỉ, ${failed.length} chứng chỉ đã tồn tại hoặc lỗi.`);
      } else {
        toast.error("Tất cả chứng chỉ đều thất bại, có thể đã tồn tại từ trước.");
        return;
      }
    }

    onClose();
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <StandardDialog open={open} onOpenChange={onClose} title="Cấp Năng Lực Cho Nhân Viên">
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        
        {/* 1. Chọn Nhân Viên */}
        <div>
          <label className="text-sm font-medium mb-1 block">1. Chọn Nhân viên (Worker)</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            disabled={isSubmitting}
            required
          >
            <option value="">Chọn nhân viên</option>
            {workersList.map((w) => (
              <option key={w.id} value={w.id}>{w.fullName}</option>
            ))}
          </select>
        </div>

        {/* 2. Chọn Loại Cấp */}
        <div>
          <label className="text-sm font-medium mb-2 block">2. Bạn muốn cấp gì?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="assignType" value="skill" checked={assignType === "skill"} onChange={() => setAssignType("skill")} />
              <span className="text-sm">Kỹ năng</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="assignType" value="cert" checked={assignType === "cert"} onChange={() => setAssignType("cert")} />
              <span className="text-sm">Chứng chỉ</span>
            </label>
          </div>
        </div>

        {/* 3. ĐIỀU KIỆN HIỂN THỊ DỰA THEO TYPE */}
        <div className="p-4 bg-gray-50 border rounded-lg space-y-4">
          {assignType === "skill" ? (
            <>
              <div>
      <label className="text-sm font-medium mb-1 block">Chọn Kỹ năng</label>
      <select
        className="w-full border rounded-md px-3 py-2 text-sm"
        value={skillId}
        onChange={(e) => setSkillId(e.target.value)}
        disabled={isSubmitting}
        required
      >
        <option value="">Chọn kỹ năng</option>
        {skillOptions.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cấp độ (Skill Level)</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="Beginner">Cơ bản</option>
                  <option value="Intermediate">Trung cấp</option>
                  <option value="Expert">Thành thạo</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">Chọn Chứng chỉ</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  disabled={isSubmitting}
                  required
                >
                <option value="">Chọn chứng chỉ</option>
                  {certOptions.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Ngày cấp *</label>
                  <Input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} disabled={isSubmitting} required={assignType === "cert"} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Ngày hết hạn</label>
                  <Input type="date" value={expiredAt} onChange={(e) => setExpiredAt(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
          <Button type="submit" className="bg-primary hover:bg-[#156884]" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Xác nhận Cấp
          </Button>
        </div>
      </form>
    </StandardDialog>
  );
}