"use client";

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
import { useFormState } from "@/hooks/useFormState";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useFormSubmission } from "@/hooks/useFormSubmission";
import type { ContractFormData, Client } from "@/types/contract";
import { FormService } from "@/lib/services/form.service";
import { ContractService } from "@/lib/services/contract.service";

interface ContractFormProps {
  clients: Client[];
  clientsLoading: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const validationRules = {
  name: [
    FormService.validationRules.required("Contract name is required"),
    FormService.validationRules.minLength(
      3,
      "Contract name must be at least 3 characters",
    ),
  ],
  clientId: [
    FormService.validationRules.required("Client selection is required"),
  ],
  file: [
    FormService.validationRules.fileSize(
      10,
      "File size must be less than 10MB",
    ),
  ],
};

export function ContractForm({
  clients,
  clientsLoading,
  onSuccess,
  onCancel,
}: ContractFormProps) {
  const {
    formData,
    errors,
    handleInputChange,
    handleSelectChange,
    resetForm,
    setFieldValue,
    setFieldError,
    clearAllErrors,
  } = useFormState<ContractFormData>({
    name: "",
    clientId: "",
    file: undefined,
  });

  const { validateForm, validateField } =
    useFormValidation<ContractFormData>(validationRules);

  const { submitWithMutation, isSubmitting } = useFormSubmission({
    mutationFn: ContractService.createContract,
    queryKey: ["contracts"],
    onSuccess,
    successMessage: "Contract created successfully",
    errorMessage: "Failed to create contract",
  });
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFieldValue("file", file);

    // Validate file immediately
    if (file) {
      const error = validateField("file", file);
      if (error) {
        setFieldError("file", error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateForm(formData);

    if (!isValid) {
      Object.entries(validationErrors).forEach(([field, error]) => {
        setFieldError(field, error);
      });
      return;
    }

    clearAllErrors();
    submitWithMutation(formData);
  };

  const handleReset = () => {
    resetForm();
    clearAllErrors();
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
          placeholder="Enter contract name"
          required
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientId">Client *</Label>
        <Select
          value={formData.clientId}
          onValueChange={handleSelectChange("clientId")}
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
        {errors.clientId && (
          <p className="text-sm text-red-600">{errors.clientId}</p>
        )}
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
        submitLabel="Create Contract"
        isLoading={isSubmitting}
      />
    </form>
  );
}
