"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Eye, Settings } from "lucide-react";
import { SLAStats } from "@/components/sla/SLAStats";
import type { SLATrigger } from "@/types/sla";
import Link from "next/link";

const mockSLATriggers: SLATrigger[] = [
  {
    id: "1",
    name: "Response Time Alert",
    type: "Response Time",
    condition: "Greater than",
    threshold: 30,
    unit: "minutes",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Resolution Time Warning",
    type: "Resolution Time",
    condition: "Greater than",
    threshold: 4,
    unit: "hours",
    status: "active",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    name: "Quality Score Alert",
    type: "Quality Score",
    condition: "Less than",
    threshold: 80,
    unit: "percentage",
    status: "inactive",
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    name: "Cleaning Completion Rate",
    type: "Completion Rate",
    condition: "Less than",
    threshold: 95,
    unit: "percentage",
    status: "active",
    createdAt: "2024-01-12",
  },
  {
    id: "5",
    name: "Equipment Downtime",
    type: "Downtime",
    condition: "Greater than",
    threshold: 2,
    unit: "hours",
    status: "active",
    createdAt: "2024-01-11",
  },
];

export default function SLATriggerPage() {
  const [triggers, setTriggers] = useState<SLATrigger[]>(mockSLATriggers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTriggers = triggers.filter((trigger) => {
    const matchesSearch =
      trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trigger.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || trigger.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteTrigger = (id: string) => {
    setTriggers(triggers.filter((trigger) => trigger.id !== id));
  };

  const toggleTriggerStatus = (id: string) => {
    setTriggers(
      triggers.map((trigger) =>
        trigger.id === id
          ? {
              ...trigger,
              status: trigger.status === "active" ? "inactive" : "active",
            }
          : trigger,
      ),
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Overview */}
        <SLAStats />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              SLA Trigger Management
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý và theo dõi các thỏa thuận mức độ dịch vụ
            </p>
          </div>
          <Link href="/dashboard/sla-trigger/create">
            <Button className="bg-[#1a80a2] hover:bg-[#1a80a2]/90">
              <Plus className="h-4 w-4 mr-2" />
              Tạo SLA Mới
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search triggers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Response Time">Response Time</SelectItem>
                  <SelectItem value="Resolution Time">
                    Resolution Time
                  </SelectItem>
                  <SelectItem value="Quality Score">Quality Score</SelectItem>
                  <SelectItem value="Completion Rate">
                    Completion Rate
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* SLA Triggers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>SLA Triggers ({filteredTriggers.length})</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trigger Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTriggers.map((trigger) => (
                  <TableRow key={trigger.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold text-black">
                          {trigger.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {trigger.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {trigger.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {trigger.condition}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-[#1a80a2]">
                          {trigger.threshold}
                        </span>
                        <span className="text-sm text-gray-500">
                          {trigger.unit}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          trigger.status === "active" ? "default" : "secondary"
                        }
                        className={
                          trigger.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {trigger.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(trigger.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Link href={`/dashboard/sla-trigger/${trigger.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link
                          href={`/dashboard/sla-trigger/${trigger.id}/edit`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTriggerStatus(trigger.id)}
                          className="h-8 px-2 text-xs"
                        >
                          {trigger.status === "active" ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTrigger(trigger.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredTriggers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No SLA triggers found matching your criteria.
                </p>
                <Link href="/dashboard/sla-trigger/create">
                  <Button className="mt-4 bg-[#1a80a2] hover:bg-[#1a80a2]/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Trigger
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
