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
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Settings,
  Loader2,
} from "lucide-react";
import { SLAStats } from "@/components/sla/SLAStats";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getSLAs } from "@/lib/sla-api";
import { useDeleteSLA } from "@/hooks/useSLAQuery";
import type { SLA } from "@/types/sla";

export default function SLATriggerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");

  const {
    data: slas = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["slas"],
    queryFn: getSLAs,
  });

  const deleteSOPMutation = useDeleteSLA();

  const handleDeleteSLA = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa SLA này?")) {
      deleteSOPMutation.mutate(id);
    }
  };

  // Filter SLAs based on search and service type
  const filteredSLAs = slas.filter((sla: SLA) => {
    const matchesSearch =
      sla.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sla.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesServiceType =
      serviceTypeFilter === "all" || sla.serviceType === serviceTypeFilter;
    return matchesSearch && matchesServiceType;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#1a80a2]" />
          <span className="ml-2 text-[#70808f]">Đang tải SLA...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Overview */}
        <SLAStats />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">Quản lý SLA</h1>
            <p className="text-gray-600 mt-1">
              Quản lý và theo dõi các thỏa thuận mức độ dịch vụ
            </p>
          </div>
          <Link href="/dashboard/sla-trigger/create">
            <Button className="bg-[#1a80a2] hover:bg-[#1a80a2]/90 h-[35px] w-[140px]">
              Tạo SLA Mới
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm SLA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={serviceTypeFilter}
            onValueChange={setServiceTypeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo loại dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại dịch vụ</SelectItem>
              <SelectItem value="Cleaning">Cleaning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SLA Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách SLA ({filteredSLAs.length})</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <Settings className="h-4 w-4 mr-2" />
                  Làm mới
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên SLA</TableHead>
                  <TableHead>Loại dịch vụ</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSLAs.map((sla) => (
                  <TableRow key={sla.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold text-black">{sla.name}</p>
                        <p className="text-sm text-gray-500">ID: {sla.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {sla.serviceType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {sla.description || "Không có mô tả"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {sla.createdAt
                        ? new Date(sla.createdAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Link href={`/dashboard/sla-trigger/${sla.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/sla-trigger/${sla.id}/edit`}>
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
                          onClick={() => handleDeleteSLA(sla.id)}
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

            {filteredSLAs.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Không tìm thấy SLA nào phù hợp với tiêu chí tìm kiếm.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
