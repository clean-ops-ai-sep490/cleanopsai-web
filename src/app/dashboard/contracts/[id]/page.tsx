"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, MapPin, Building2 } from "lucide-react";
import {
  getContracts,
  getClients,
  getLocationsByClient,
} from "@/lib/contract-api";

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  // Fetch contracts and find the specific one
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: getContracts,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const contract = contracts.find((c) => c.id === contractId);
  const client = clients.find((c) => c.id === contract?.clientId);

  // Fetch locations for this client
  const { data: locations = [] } = useQuery({
    queryKey: ["locations", contract?.clientId],
    queryFn: () => getLocationsByClient(contract!.clientId),
    enabled: !!contract?.clientId,
  });

  if (contractsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center">Loading contract details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Contract not found</h3>
              <p className="text-gray-600 mb-6">
                The contract you're looking for doesn't exist or has been
                removed.
              </p>
              <Button onClick={() => router.push("/dashboard/contracts")}>
                Back to Contracts
              </Button>
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-black">
                Contract Details
              </h1>
              <p className="text-gray-600 mt-1">
                Chi tiết hợp đồng và thông tin vị trí
              </p>
            </div>
          </div>
        </div>

        {/* Contract Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold">{contract.name}</h2>
                  <p className="text-gray-600">Contract ID: {contract.id}</p>
                </div>
              </div>
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Client Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {client?.name || "Unknown Client"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 ml-6">
                    Email: {client?.email || "N/A"}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Contract Details</h3>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Created:</span>{" "}
                    {new Date().toLocaleDateString()}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Status:</span> Active
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>Locations ({locations.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {locations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No locations configured for this contract
                </p>
                <Button
                  onClick={() => router.push("/dashboard/contracts/create")}
                  variant="outline"
                >
                  Add Location
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{location.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {location.address}, {location.street}
                        </p>
                        <p className="text-sm text-gray-600">
                          {location.commune}, {location.province}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>Lat: {location.latitude}</div>
                        <div>Lng: {location.longitude}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
