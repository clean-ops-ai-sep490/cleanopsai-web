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
import { useContractForm } from "@/hooks/useContractForm";

interface ContractFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ContractForm({ onSuccess, onCancel }: ContractFormProps) {
  const {
    formData,
    clients,
    clientsLoading,
    isLoading,
    handleSubmit,
    handleFileChange,
    handleReset,
    updateFormData,
  } = useContractForm(onSuccess);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData("name", e.target.value)}
          placeholder="Enter contract name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientId">Client *</Label>
        <Select
          value={formData.clientId}
          onValueChange={(value) => updateFormData("clientId", value)}
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
        isLoading={isLoading}
      />
    </form>
  );
}
