"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormActions } from "@/components/ui/form-actions";
import { toast } from "sonner";
import { createContract, getClients } from "@/lib/contract-api";
import type { ContractFormData, Client } from "@/types/contract";

interface ContractFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ContractForm({ onSuccess, onCancel }: ContractFormProps) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter contract name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientId">Client *</Label>
        <Select
          value={formData.clientId}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, clientId: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clientsLoading ? (
              <SelectItem value="loading" disabled>
                Loading clients...
              </SelectItem>
            ) : (
              clients.map((client) => (
                <SelectItem key={client.id} value={client.id!}>
                  {client.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input
          id="file"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        {formData.file && (
          <p className="text-sm text-gray-600">
            Selected: {formData.file.name}
          </p>
        )}
      </div>

      <FormActions
        onReset={handleReset}
        onCancel={onCancel}
        submitLabel="Execute"
        isLoading={createContractMutation.isPending}
      />
    </form>
  );
}
