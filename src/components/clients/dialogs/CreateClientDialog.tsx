"use client";

import { StandardDialog } from "@/components/ui/standard-dialog";
import { ClientForm } from "@/components/contracts/ClientForm";

interface CreateClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function CreateClientDialog({
  isOpen,
  onClose,
  onSuccess,
  trigger,
}: CreateClientDialogProps) {
  return (
    <StandardDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Create New Client"
      maxWidth="sm"
      trigger={trigger}
    >
      <ClientForm onSuccess={onSuccess} onCancel={onClose} />
    </StandardDialog>
  );
}
