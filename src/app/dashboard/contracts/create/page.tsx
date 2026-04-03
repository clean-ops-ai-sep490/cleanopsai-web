"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractForm } from "@/components/contracts/ContractForm";
import { LocationForm } from "@/components/contracts/LocationForm";
import { ZoneForm } from "@/components/contracts/ZoneForm";
import { WorkAreaForm } from "@/components/contracts/WorkAreaForm";
import { ArrowLeft } from "lucide-react";

export default function CreateContractPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("contract");

  const handleSuccess = () => {
    // Navigate to next tab or back to contracts list
    switch (activeTab) {
      case "contract":
        setActiveTab("location");
        break;
      case "location":
        setActiveTab("zone");
        break;
      case "zone":
        setActiveTab("workarea");
        break;
      case "workarea":
        router.push("/dashboard/contracts");
        break;
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/contracts");
  };

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
                Create Contract & Setup Locations
              </h1>
              <p className="text-gray-600 mt-1">
                Tạo hợp đồng mới và thiết lập vị trí làm việc
              </p>
            </div>
          </div>
        </div>

        {/* Multi-step Form */}
        <Card>
          <CardContent className="pt-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="contract">1. Contract</TabsTrigger>
                <TabsTrigger value="location">2. Location</TabsTrigger>
                <TabsTrigger value="zone">3. Zone</TabsTrigger>
                <TabsTrigger value="workarea">4. Work Area</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="contract" className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-lg font-medium">
                      Contract Information
                    </h2>
                    <p className="text-sm text-gray-600">
                      Create a new contract with client information and upload
                      contract documents.
                    </p>
                  </div>
                  <ContractForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                  />
                </TabsContent>

                <TabsContent value="location" className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-lg font-medium">Location Setup</h2>
                    <p className="text-sm text-gray-600">
                      Add location details where the cleaning services will be
                      performed.
                    </p>
                  </div>
                  <LocationForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                  />
                </TabsContent>

                <TabsContent value="zone" className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-lg font-medium">Zone Configuration</h2>
                    <p className="text-sm text-gray-600">
                      Define zones within the location for better organization
                      of cleaning areas.
                    </p>
                  </div>
                  <ZoneForm onSuccess={handleSuccess} onCancel={handleCancel} />
                </TabsContent>

                <TabsContent value="workarea" className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-lg font-medium">Work Area Setup</h2>
                    <p className="text-sm text-gray-600">
                      Create specific work areas within zones for detailed
                      cleaning task assignment.
                    </p>
                  </div>
                  <WorkAreaForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
