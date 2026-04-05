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
import { Plus, Users, Mail, Building2 } from "lucide-react";
import { getClients } from "@/lib/client-api";
import { ClientForm } from "@/components/contracts/ClientForm";

export default function ClientsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch clients
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  if (clientsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-black">Clients</h1>
              <p className="text-gray-600 mt-1">Quản lý thông tin khách hàng</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">Loading clients...</div>
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
              Client Management
            </h1>
            <p className="text-gray-600 mt-1">Quản lý thông tin khách hàng</p>
          </div>
          <StandardDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            title="Create New Client"
            maxWidth="sm"
            trigger={
              <Button className="bg-[#1a80a2] hover:bg-[#1a80a2]/90">
                <Plus className="h-4 w-4 mr-2" />
                Thêm Khách Hàng
              </Button>
            }
          >
            <ClientForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </StandardDialog>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Clients ({clients.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No clients found</h3>
                <p className="text-gray-600 mb-6">
                  Get started by adding your first client to create contracts.
                </p>
                <StandardDialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                  title="Create New Client"
                  maxWidth="sm"
                  trigger={
                    <Button className="bg-[#1a80a2] hover:bg-[#1a80a2]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Client
                    </Button>
                  }
                >
                  <ClientForm
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </StandardDialog>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-semibold text-black">
                              {client.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {client.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {client.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date().toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          View Details
                        </Button>
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
