import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createContract } from "@/lib/contract-api";
import { getClients } from "@/lib/client-api";
import type { ContractFormData } from "@/types/contract";

export function useContractForm(onSuccess?: () => void) {
  const [formData, setFormData] = useState<ContractFormData>({
    name: "",
    clientId: "",
    file: undefined,
  });

  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      toast.success("Contract created successfully");
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to create contract");
      console.error("Contract creation error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.clientId) {
      toast.error("Please fill in all required fields");
      return;
    }

    createContractMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleReset = () => {
    setFormData({
      name: "",
      clientId: "",
      file: undefined,
    });
  };

  const updateFormData = (field: keyof ContractFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    clients,
    clientsLoading,
    isLoading: createContractMutation.isPending,
    handleSubmit,
    handleFileChange,
    handleReset,
    updateFormData,
  };
}
