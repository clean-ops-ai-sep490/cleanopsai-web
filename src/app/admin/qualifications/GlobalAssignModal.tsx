import { useState } from "react";
import { StandardDialog } from "@/components/ui/standard-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";

import { useCreateWorkerSkill, SkillLevelType } from "@/hooks/useWorkerSkills";
import { useCreateWorkerCertification } from "@/hooks/useWorkerCertifications";
import { toast } from "sonner";
import { filterWorkers, getWorkerById } from "@/lib/worker-api";
import { searchSkills, getSkillById } from "@/lib/skill-api";
import { getCertifications, getCertificationById } from "@/lib/certification-api";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function GlobalAssignModal({ open, onClose }: Props) {
  // Common States
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [assignType, setAssignType] = useState<"skill" | "cert">("skill");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutations
  const { mutateAsync: assignSkill } = useCreateWorkerSkill();
  const { mutateAsync: assignCert } = useCreateWorkerCertification();

  // States for Skill
  const [skillId, setSkillId] = useState("");
  const [skillLevel, setSkillLevel] = useState<string>("Beginner");

  // States for Certs
  const [certId, setCertId] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [expiredAt, setExpiredAt] = useState("");

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) return toast.error("Vui lòng chọn nhân viên");

    try {
      setIsSubmitting(true);

      if (assignType === "skill") {
        if (!skillId) return toast.error("Vui lòng chọn kỹ năng");

        await assignSkill({ 
          workerId: selectedWorkerId, 
          skillId, 
          skillLevel: skillLevel as SkillLevelType 
        });
        toast.success("Cấp thành công kỹ năng 🎉");
      } else {
        if (!certId || !issuedDate)
          return toast.error("Vui lòng chọn chứng chỉ và ngày cấp");

        await assignCert({
          workerId: selectedWorkerId,
          certificationId: certId,
          issuedDate: new Date(issuedDate).toISOString(),
          expiredAt: expiredAt ? new Date(expiredAt).toISOString() : null,
        });
        toast.success("Cấp thành công chứng chỉ 🎉");
      }

      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra, có thể đã tồn tại từ trước.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StandardDialog open={open} onOpenChange={onClose} title="Cấp Năng Lực Cho Nhân Viên">
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        
        {/* 1. Chọn Nhân Viên */}
        <div className="space-y-1">
          <Label>1. Chọn Nhân viên (Worker) *</Label>
          <SearchableSelect
            value={selectedWorkerId}
            onValueChange={setSelectedWorkerId}
            placeholder="Chọn nhân viên"
            useInfiniteLoading={true}
            pageSize={10}
            queryKey={["workers", "infinite"]}
            queryFn={(page, pageSize, search) =>
              filterWorkers({ pageNumber: page, pageSize, address: search }).then(res => ({
                ...res,
                content: res.content.map(item => ({
                  ...item,
                  id: item.id,
                  name: item.fullName
                }))
              }))
            }
            getItemById={(id) => 
              getWorkerById(id).then(w => ({ id: w.id, name: w.fullName }))
            }
            disabled={isSubmitting}
          />
        </div>

        {/* 2. Chọn Loại Cấp */}
        <div className="space-y-2">
          <Label>2. Bạn muốn cấp gì?</Label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="assignType" 
                value="skill" 
                checked={assignType === "skill"} 
                onChange={() => setAssignType("skill")} 
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm font-medium group-hover:text-primary transition-colors">Kỹ năng</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="assignType" 
                value="cert" 
                checked={assignType === "cert"} 
                onChange={() => setAssignType("cert")} 
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm font-medium group-hover:text-primary transition-colors">Chứng chỉ</span>
            </label>
          </div>
        </div>

        {/* 3. ĐIỀU KIỆN HIỂN THỊ DỰA THEO TYPE */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
          {assignType === "skill" ? (
            <>
              <div className="space-y-1">
                <Label>Chọn Kỹ năng *</Label>
                <SearchableSelect
                  value={skillId}
                  onValueChange={setSkillId}
                  placeholder="Chọn kỹ năng"
                  useInfiniteLoading={true}
                  pageSize={10}
                  queryKey={["skills", "infinite"]}
                  queryFn={(page, pageSize, search) =>
                    searchSkills(search || "", page, pageSize)
                  }
                  getItemById={getSkillById}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1">
                <Label>Cấp độ (Skill Level) *</Label>
                <select
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
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
              <div className="space-y-1">
                <Label>Chọn Chứng chỉ *</Label>
                <SearchableSelect
                  value={certId}
                  onValueChange={setCertId}
                  placeholder="Chọn chứng chỉ"
                  useInfiniteLoading={true}
                  pageSize={10}
                  queryKey={["certifications", "infinite"]}
                  queryFn={(page, pageSize, search) =>
                    getCertifications({ pageNumber: page, pageSize, search })
                  }
                  getItemById={getCertificationById}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Ngày cấp *</Label>
                  <Input 
                    type="date" 
                    value={issuedDate} 
                    onChange={(e) => setIssuedDate(e.target.value)} 
                    disabled={isSubmitting} 
                    required={assignType === "cert"} 
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Ngày hết hạn</Label>
                  <Input 
                    type="date" 
                    value={expiredAt} 
                    onChange={(e) => setExpiredAt(e.target.value)} 
                    disabled={isSubmitting} 
                    className="rounded-lg"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-lg px-6">
            Hủy
          </Button>
          <Button type="submit" className="bg-primary hover:bg-[#156884] rounded-lg px-6" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Xác nhận Cấp
          </Button>
        </div>
      </form>
    </StandardDialog>
  );
}