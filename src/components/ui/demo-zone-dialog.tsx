"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StandardDialog } from "@/components/ui/standard-dialog";
import { ZoneForm } from "@/components/contracts/ZoneForm";
import { Plus } from "lucide-react";

export function DemoZoneDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <StandardDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Thêm Zone Mới"
      maxWidth="md"
      trigger={
        <Button className="bg-[#1a80a2] hover:bg-[#1a80a2]/90">
          <Plus className="h-4 w-4 mr-2" />
          Thêm Zone
        </Button>
      }
    >
      <ZoneForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </StandardDialog>
  );
}
