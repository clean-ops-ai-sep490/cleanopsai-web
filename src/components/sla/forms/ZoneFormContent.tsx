"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormActions } from "@/components/ui/form-actions";

interface ZoneFormContentProps {
  newZone: { name: string; description: string };
  setNewZone: (zone: { name: string; description: string }) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ZoneFormContent({
  newZone,
  setNewZone,
  onSave,
  onCancel,
}: ZoneFormContentProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newZone.name.trim()) {
      onSave();
    }
  };

  const handleReset = () => {
    setNewZone({ name: "", description: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="zoneName">Tên zone *</Label>
        <Input
          id="zoneName"
          placeholder="VD: Khu vực ngoài cảnh, Khu vực trong nhà..."
          value={newZone.name}
          onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="zoneDescription">Mô tả</Label>
        <Input
          id="zoneDescription"
          placeholder="Mô tả chi tiết về zone"
          value={newZone.description}
          onChange={(e) =>
            setNewZone({ ...newZone, description: e.target.value })
          }
        />
      </div>

      <FormActions
        onReset={handleReset}
        onCancel={onCancel}
        submitLabel="Thêm Zone"
        cancelLabel="Hủy"
        isLoading={false}
      />
    </form>
  );
}
