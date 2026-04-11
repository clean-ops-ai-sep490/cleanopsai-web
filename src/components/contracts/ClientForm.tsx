"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormActions } from "@/components/ui/form-actions";
import { createClient } from "@/lib/client-api";
import { useEntityForm } from "@/hooks/useEntityForm";
import { validators } from "@/lib/validators/form-validators";

interface ClientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ClientFormData {
  name: string;
  email: string;
}

export function ClientForm({ onSuccess, onCancel }: ClientFormProps) {
  const {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleReset,
    handleSubmit,
  } = useEntityForm<ClientFormData>({
    initialData: {
      name: "",
      email: "",
    },
    mutationFn: createClient,
    queryKey: ["clients"],
    onSuccess,
    successMessage: "Client created successfully",
    errorMessage: "Failed to create client",
    validationRules: {
      name: [validators.required("Tên client")],
      email: [validators.required("Email"), validators.email],
    },
    validateOnChange: true,
  });

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
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
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
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
      </div>

      <FormActions
        onReset={handleReset}
        onCancel={onCancel}
        submitLabel="Execute"
        isLoading={isLoading}
      />
    </form>
  );
}
