import { createContract, getContracts } from "@/lib/contract-api";
import { getClients } from "@/lib/client-api";
import type { ContractFormData, Contract, Client } from "@/types/contract";

/**
 * Contract Service - Handles all contract-related business operations
 * Follows SRP by focusing only on contract domain logic
 */
export class ContractService {
  /**
   * Create a new contract with validation and business rules
   */
  static async createContract(data: ContractFormData): Promise<Contract> {
    // Business validation
    if (!data.name?.trim()) {
      throw new Error("Tên hợp đồng là bắt buộc");
    }

    if (!data.clientId) {
      throw new Error("Vui lòng chọn khách hàng");
    }

    // Business logic for contract creation
    const contractData = {
      ...data,
      name: data.name.trim(),
      status: "Active" as const,
      createdAt: new Date().toISOString(),
    };

    return await createContract(contractData);
  }

  /**
   * Get contracts with client information enriched
   */
  static async getContractsWithClients(): Promise<
    Array<Contract & { clientName: string }>
  > {
    const [contracts, clients] = await Promise.all([
      getContracts(),
      getClients(),
    ]);

    return contracts.map((contract) => ({
      ...contract,
      clientName: ContractService.getClientName(contract.clientId, clients),
    }));
  }

  /**
   * Get client name by ID - pure business logic
   */
  static getClientName(clientId: string, clients: Client[]): string {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Khách hàng không xác định";
  }

  /**
   * Validate contract form data
   */
  static validateContractData(
    data: Partial<ContractFormData>,
  ): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.name?.trim()) {
      errors.name = "Tên hợp đồng là bắt buộc";
    }

    if (!data.clientId) {
      errors.clientId = "Vui lòng chọn khách hàng";
    }

    if (data.file && data.file.size > 10 * 1024 * 1024) {
      errors.file = "Dung lượng file phải nhỏ hơn 10MB";
    }

    return errors;
  }
}
