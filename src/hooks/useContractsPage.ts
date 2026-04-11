import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ContractService } from "@/lib/services/contract.service";
import { getClients } from "@/lib/client-api";

/**
 * Contracts Page Hook - Handles data fetching for contracts page
 * Follows SRP by focusing only on page-specific data operations
 */
export function useContractsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch contracts with enriched client data
  const {
    data: contracts = [],
    isLoading: contractsLoading,
    refetch: refetchContracts,
  } = useQuery({
    queryKey: ["contracts-with-clients"],
    queryFn: ContractService.getContractsWithClients,
  });

  // Fetch clients for form
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refetchContracts();
  };

  const handleViewContract = (contractId: string) => {
    // Navigation logic could be added here
    console.log("View contract:", contractId);
  };

  return {
    // Data
    contracts,
    clients,

    // Loading states
    contractsLoading,
    clientsLoading,

    // Dialog state
    isCreateDialogOpen,
    setIsCreateDialogOpen,

    // Actions
    handleCreateSuccess,
    handleViewContract,
    refetchContracts,
  };
}
