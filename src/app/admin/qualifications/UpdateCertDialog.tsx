"use client";

import { StandardDialog } from "@/components/ui/standard-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";
import { useUpdateWorkerCertification } from "@/hooks/useWorkerCertifications";

type Props = {
  data: any | null;
  onClose: () => void;
};

export default function UpdateCertDialog({ data, onClose }: Props) {
  const { mutateAsync: updateCert, isPending } = useUpdateWorkerCertification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const issuedDate = formData.get("issuedDate") as string;
    const expiredAt = formData.get("expiredAt") as string;

    try {
      await updateCert({
        keys: { workerId: data.workerId, certificationId: data.certificationId },
        data: {
          issuedDate: new Date(issuedDate).toISOString(),
          expiredAt: expiredAt ? new Date(expiredAt).toISOString() : null,
        },
      });
      onClose();
    } catch {
      alert("Lỗi khi cập nhật chứng chỉ");
    }
  };

  // Helper để lấy đúng định dạng YYYY-MM-DD cho thẻ input type="date"
  const formatDateForInput = (isoString?: string) => isoString ? isoString.split("T")[0] : "";

  return (
    <StandardDialog open={!!data} onOpenChange={onClose} title="Cập nhật thời hạn chứng chỉ">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="p-3 bg-gray-50 rounded-md text-sm mb-4 border">
          <p className="text-gray-500">Nhân viên: <strong className="text-black">{data?.workerName}</strong></p>
          <p className="text-gray-500">Chứng chỉ: <strong className="text-black">{data?.certificationName}</strong></p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Ngày cấp *</label>
            <Input
              type="date"
              name="issuedDate"
              defaultValue={formatDateForInput(data?.issuedDate)}
              disabled={isPending}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Ngày hết hạn</label>
            <Input
              type="date"
              name="expiredAt"
              defaultValue={formatDateForInput(data?.expiredAt)}
              disabled={isPending}
            />
          </div>
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