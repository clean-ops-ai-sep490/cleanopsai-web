"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormActions } from "@/components/ui/form-actions";
import { toast } from "sonner";
import { createClient } from "@/lib/contract-api";

interface ClientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClientForm({ onSuccess, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const queryClient = useQueryClient();

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("Client created successfully");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to create client");
      console.error("Client creation error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    createClientMutation.mutate(formData);
  };

  const handleInputChange =
    (field: "name" | "email") => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
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
          onChange={handleInputChange("name")}
          placeholder="Enter client name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange("email")}
          placeholder="Enter client email"
          required
        />
      </div>

      <FormActions
        onReset={handleReset}
        onCancel={onCancel}
        submitLabel="Execute"
        isLoading={createClientMutation.isPending}
      />
    </form>
  );
}
