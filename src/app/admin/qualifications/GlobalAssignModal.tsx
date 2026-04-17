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
  const [workersList, setWorkersList] = useState<any[]>([]);
  const { getUsers } = useAuth();
  const { data: skillsData } = useSkills({ pageSize: 100 });
  const { data: certsData } = useCertifications({ pageSize: 100 });

  // Mutations
  const { mutateAsync: assignSkill } = useCreateWorkerSkill();
  const { mutateAsync: assignCert } = useCreateWorkerCertification();

  // States for Skill
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<number>(1);

  // States for Certs
  const [certIds, setCertIds] = useState<string[]>([]);
  const [issuedDate, setIssuedDate] = useState("");
  const [expiredAt, setExpiredAt] = useState("");

  // Load Workers khi mở Modal
  useEffect(() => {
    if (open) {
      getUsers({ role: "Worker", pageSize: 100 }).then((res) => {
        setWorkersList(res?.content || []);
      });
    }
  }, [open]);

  // Options Mapping
  const skillOptions: MultiSelectOption[] = useMemo(() => {
    return (skillsData?.content || []).map((s: any) => ({ value: s.id, label: s.name }));
  }, [skillsData]);

  const certOptions: MultiSelectOption[] = useMemo(() => {
    return (certsData?.content || []).map((c: any) => ({ value: c.id, label: c.name }));
  }, [certsData]);

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedWorkerId) return toast.error("Vui lòng chọn nhân viên");

  try {
    setIsSubmitting(true);

    if (assignType === "skill") {
      if (skillIds.length === 0)
        return toast.error("Vui lòng chọn kỹ năng");

      await Promise.all(
        skillIds.map((id) =>
          assignSkill({
            workerId: selectedWorkerId,
            skillId: id,
            skillLevel,
          })
        )
      );
    } else {
      if (certIds.length === 0 || !issuedDate)
        return toast.error("Vui lòng chọn chứng chỉ và ngày cấp");

      await Promise.all(
        certIds.map((id) =>
          assignCert({
            workerId: selectedWorkerId,
            certificationId: id,
            issuedDate: new Date(issuedDate).toISOString(),
            expiredAt: expiredAt
              ? new Date(expiredAt).toISOString()
              : null,
          })
        )
      );
    }

    toast.success("Cấp thành công 🎉");
    onClose();
  } catch (error) {
    toast.error("Có lỗi xảy ra, có thể dữ liệu đã tồn tại từ trước.");
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
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-[#1a80a2] focus:border-[#1a80a2]"
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            disabled={isSubmitting}
            required
          >
            <option value="">Chọn nhân viên</option>
            {workersList.map((w) => (
              <option key={w.id} value={w.id}>{w.fullName} ({w.email})</option>
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
                <label className="text-sm font-medium mb-1 block">Chọn Kỹ năng (Có thể chọn nhiều)</label>
                <MultiSelect
                  options={skillOptions}
                  value={skillIds}
                  onValueChange={setSkillIds}
                  placeholder="Tìm và chọn kỹ năng..."
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cấp độ (Skill Level)</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(Number(e.target.value))}
                  disabled={isSubmitting}
                >
                  <option value={1}>Cơ bản (1)</option>
                  <option value={2}>Trung cấp (2)</option>
                  <option value={3}>Thành thạo (3)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">Chọn Chứng chỉ (Có thể chọn nhiều)</label>
                <MultiSelect
                  options={certOptions}
                  value={certIds}
                  onValueChange={setCertIds}
                  placeholder="Tìm và chọn chứng chỉ..."
                  disabled={isSubmitting}
                />
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
          <Button type="submit" className="bg-[#1a80a2] hover:bg-[#156884]" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Xác nhận Cấp
          </Button>
        </div>
      </form>
    </StandardDialog>
  );
}