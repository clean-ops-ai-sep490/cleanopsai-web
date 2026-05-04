"use client";

import { StandardDialog } from "@/components/ui/standard-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useUpdateWorkerSkill } from "@/hooks/useWorkerSkills";

type Props = {
  data: any | null;
  onClose: () => void;
};

export default function UpdateSkillDialog({ data, onClose }: Props) {
  const { mutateAsync: updateSkill, isPending } = useUpdateWorkerSkill();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lấy value trực tiếp từ form data để khỏi phải tạo state rườm rà
    const formData = new FormData(e.target as HTMLFormElement);
    const newLevel = Number(formData.get("skillLevel"));

    try {
      await updateSkill({
        keys: { workerId: data.workerId, skillId: data.skillId },
        data: { skillLevel: newLevel },
      });
      onClose();
    } catch {
      alert("Lỗi khi cập nhật kỹ năng");
    }
  };

  return (
    <StandardDialog open={!!data} onOpenChange={onClose} title="Cập nhật cấp độ kỹ năng">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="p-3 bg-gray-50 rounded-md text-sm mb-4 border">
          <p className="text-gray-500">Nhân viên: <strong className="text-black">{data?.workerName}</strong></p>
          <p className="text-gray-500">Kỹ năng: <strong className="text-black">{data?.skillName}</strong></p>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Cấp độ (Level) mới</label>
          <select
            name="skillLevel"
            defaultValue={data?.skillLevel}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            disabled={isPending}
          >
            <option value={1}>Cơ bản (1)</option>
            <option value={2}>Trung cấp (2)</option>
            <option value={4}>Thành thạo (4)</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Hủy</Button>
          <Button type="submit" disabled={isPending} className="bg-primary hover:bg-[#156884]">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} 
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </StandardDialog>
  );
}