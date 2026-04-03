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
import { StandardDialog } from "@/components/ui/standard-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, MapPin } from "lucide-react";
import { getContracts, getClients } from "@/lib/contract-api";
import { ContractForm } from "@/components/contracts/ContractForm";

export default function ContractsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch contracts and clients
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: getContracts,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  // Helper function to get client name
  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  const handleViewContract = (contractId: string) => {
    // This could also be a modal in the future
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
          <StandardDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            title="Create New Contract"
            trigger={
              <Button className="bg-[#1a80a2] hover:bg-[#1a80a2]/90">
                <Plus className="h-4 w-4 mr-2" />
                Tạo Hợp Đồng
              </Button>
            }
          >
            <ContractForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </StandardDialog>
        </div>

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Contracts ({contracts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contracts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No contracts found</h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first contract and setting up
                  locations.
                </p>
                <StandardDialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                  title="Create New Contract"
                  trigger={
                    <Button className="bg-[#1a80a2] hover:bg-[#1a80a2]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Contract
                    </Button>
                  }
                >
                  <ContractForm
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </StandardDialog>
              </div>
            ) : (
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
                  {contracts.map((contract) => (
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
                      <TableCell>{getClientName(contract.clientId)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800 hover:bg-green-100"
                        >
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date().toLocaleDateString()}
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
