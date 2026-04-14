"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationWithInfo } from "@/components/ui/pagination";
import { CreateContractDialog } from "@/components/contracts/dialogs/CreateContractDialog";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, MapPin } from "lucide-react";
import { getContractsPaginatedNew } from "@/lib/contract-api";
import { getClientsPaginated } from "@/lib/client-api";
import { usePaginatedData } from "@/hooks/usePagination";

export default function ContractsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Initialize pagination for contracts
  const contractsPagination = usePaginatedData({
    initialPageSize: 10,
  });

  // Fetch contracts with pagination
  const {
    data: contractsResponse,
    isLoading: contractsLoading,
    refetch: refetchContracts,
  } = useQuery({
    queryKey: [
      "contracts",
      contractsPagination.currentPage,
      contractsPagination.pageSize,
    ],
    queryFn: () =>
      getContractsPaginatedNew(
        contractsPagination.currentPage,
        contractsPagination.pageSize,
      ),
  });

  // Update pagination data when response changes
  const paginatedContracts = usePaginatedData({
    data: contractsResponse,
    initialPageSize: 10,
  });

  // Fetch clients for the create dialog (use normal pagination)
  const { data: clientsResponse, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients-for-selection"],
    queryFn: () => getClientsPaginated({ pageSize: 50 }),
  });
  const clients = clientsResponse?.items || [];

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refetchContracts();
  };

  const handleViewContract = (contractId: string) => {
    // Navigation logic could be added here
    console.log("View contract:", contractId);
  };

  if (contractsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-black">Contracts</h1>
              <p className="text-gray-600 mt-1">
                Quản lý hợp đồng và thông tin khách hàng
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">Loading contracts...</div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Contract Management
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý hợp đồng và thông tin khách hàng
            </p>
          </div>
          {/* <CreateContractDialog
            isOpen={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            onSuccess={handleCreateSuccess}
            clients={clients}
            clientsLoading={clientsLoading}
            trigger={
              <Button className="bg-[#1a80a2] hover:bg-[#1a80a2]/90">
                <Plus className="h-4 w-4 mr-2" />
                Tạo Hợp Đồng
              </Button>
            }
          /> */}
        </div>

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Contracts ({paginatedContracts.totalElements})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paginatedContracts.isEmpty ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No contracts found</h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first contract and setting up
                  locations.
                </p>
                <CreateContractDialog
                  isOpen={isCreateDialogOpen}
                  onClose={() => setIsCreateDialogOpen(false)}
                  onSuccess={handleCreateSuccess}
                  clients={clients}
                  clientsLoading={clientsLoading}
                  trigger={
                    <Button className="bg-[#1a80a2] hover:bg-[#1a80a2]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Contract
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract Name</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedContracts.items.map((contract) => (
                      <TableRow key={contract.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-semibold text-black">
                                {contract.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {contract.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{contract.clientName || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800 hover:bg-green-100"
                          >
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {contract.createdAt
                            ? new Date(contract.createdAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewContract(contract.id!)}
                              className="h-8 w-8 p-0"
                            >
                              <MapPin className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {paginatedContracts.totalPages > 1 && (
                  <div className="mt-6">
                    <PaginationWithInfo
                      currentPage={paginatedContracts.currentPage}
                      totalPages={paginatedContracts.totalPages}
                      pageSize={paginatedContracts.pageSize}
                      totalElements={paginatedContracts.totalElements}
                      onPageChange={paginatedContracts.setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
