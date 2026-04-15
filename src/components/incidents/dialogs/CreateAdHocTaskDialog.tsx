import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardPlus, Plus } from "lucide-react";
import { AdHocTaskForm } from "../types";

interface CreateAdHocTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: AdHocTaskForm) => void;
}

export function CreateAdHocTaskDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateAdHocTaskDialogProps) {
  const [form, setForm] = useState<AdHocTaskForm>({
    title: "",
    description: "",
    location: "",
    assignee: "",
    priority: "normal",
    deadline: "",
    sopId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    setForm({
      title: "",
      description: "",
      location: "",
      assignee: "",
      priority: "normal",
      deadline: "",
      sopId: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPlus className="w-5 h-5 text-[#1a80a2]" />
            Tạo Ad-hoc Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tên Task</Label>
            <Input
              placeholder="VD: Dọn vệ sinh phòng họp VIP trước 14:00"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Mô tả chi tiết</Label>
            <Textarea
              placeholder="Mô tả yêu cầu công việc..."
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Khu vực</Label>
              <Select
                value={form.location}
                onValueChange={(v) => setForm({ ...form, location: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bv-q1-t3">BV Q1 - Tầng 3</SelectItem>
                  <SelectItem value="vp-abc-t1">VP ABC - Tầng 1</SelectItem>
                  <SelectItem value="vp-xyz-t2">VP XYZ - Tầng 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phân công cho</Label>
              <Select
                value={form.assignee}
                onValueChange={(v) => setForm({ ...form, assignee: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="AI Auto-assign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">🤖 AI Auto-assign</SelectItem>
                  <SelectItem value="Nguyễn Văn A">Nguyễn Văn A</SelectItem>
                  <SelectItem value="Trần Thị B">Trần Thị B</SelectItem>
                  <SelectItem value="Lê Văn C">Lê Văn C</SelectItem>
                  <SelectItem value="Phạm Thị D">Phạm Thị D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Mức độ ưu tiên</Label>
              <Select
                value={form.priority}
                onValueChange={(v: "normal" | "urgent") =>
                  setForm({ ...form, priority: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Bình thường</SelectItem>
                  <SelectItem value="urgent">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>SOP áp dụng (tùy chọn)</Label>
            <Select
              value={form.sopId}
              onValueChange={(v) => setForm({ ...form, sopId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Không áp dụng SOP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không áp dụng SOP</SelectItem>
                <SelectItem value="sop-1">
                  QT-001: Khử trùng phòng mổ
                </SelectItem>
                <SelectItem value="sop-2">QT-002: Vệ sinh văn phòng</SelectItem>
                <SelectItem value="sop-3">QT-003: Vệ sinh sâu sảnh</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
