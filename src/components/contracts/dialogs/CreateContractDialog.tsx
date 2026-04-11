"use client";

import { StandardDialog } from "@/components/ui/standard-dialog";
import { ContractForm } from "../ContractForm";
import { useContractFormData } from "@/hooks/useContractFormData";
import type { Client } from "@/types/contract";

interface CreateContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trigger?: React.ReactNode;
  // Optional: pass data directly to avoid re-fetching
  clients?: Client[];
  clientsLoading?: boolean;
}

export function CreateContractDialog({
  isOpen,
  onClose,
  onSuccess,
  trigger,
  clients: providedClients,
  clientsLoading: providedClientsLoading,
}: CreateContractDialogProps) {
  // Use provided data or fetch if not provided
  const { clients: fetchedClients, clientsLoading: fetchedClientsLoading } =
    useContractFormData();

  const clients = providedClients ?? fetchedClients;
  const clientsLoading = providedClientsLoading ?? fetchedClientsLoading;

  return (
    <StandardDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Create New Contract"
      maxWidth="sm"
      trigger={trigger}
    >
      <ContractForm
        clients={clients}
        clientsLoading={clientsLoading}
        onSuccess={onSuccess}
        onCancel={onClose}
      />
    </StandardDialog>
  );
}
