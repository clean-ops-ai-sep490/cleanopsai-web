"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSLA, useUpdateSLA } from "@/hooks/useSLAQuery";

export default function EditSLAPage() {
  const params = useParams();
  const router = useRouter();
  const slaId = params.id as string;

  const { data: sla, isLoading, error } = useSLA(slaId);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const updateSLAMutation = useUpdateSLA((updatedSLA) => {
    router.push(`/dashboard/sla-trigger/${updatedSLA.id}`);
  });

  // Update form data when SLA loads
  useEffect(() => {
    if (sla) {
      setFormData({
        name: sla.name,
        description: sla.description || "",
      });
    }
  }, [sla]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sla) return;
    updateSLAMutation.mutate({ id: sla.id, data: formData });
  };

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

  if (error || !sla) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">
            {error?.message?.includes("404")
              ? "SLA không tồn tại hoặc đã bị xóa"
              : "Không thể tải thông tin SLA"}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/sla-trigger")}
            className="border-[#e5e5e5]"
          >
            Quay lại danh sách
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/sla-trigger/${sla.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa SLA</h1>
            <p className="text-gray-600">Cập nhật thông tin SLA: {sla.name}</p>
          </div>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin SLA</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên SLA *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nhập tên SLA"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Nhập mô tả SLA"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Link href={`/dashboard/sla-trigger/${sla.id}`}>
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </Link>
                <Button type="submit" disabled={updateSLAMutation.isPending}>
                  {updateSLAMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
