"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useSOPs } from "@/hooks/useWorkflowBuilder";

export default function WorkflowListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 12;

  const {
    data: sopsData,
    isLoading,
    error,
  } = useSOPs({
    pageNumber,
    pageSize,
    search: searchQuery || undefined,
  });

  const sops = sopsData?.content || [];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-black mb-2">
            SOP Workflow Builder
          </h1>
          <p className="text-sm text-[#70808f]">Quản lý các quy trình SOP</p>
        </div>
        <Link href="/dashboard/workflow/create">
          <Button className="bg-[#1a80a2] hover:bg-[#308cab] text-white h-[40px] rounded-[5px] px-6">
            Tạo SOP mới
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#70808f]" />
          <Input
            placeholder="Tìm kiếm SOP..."
            className="pl-10 bg-white border-[#e5e5e5] h-[40px]"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPageNumber(1); // Reset to first page when searching
            }}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#1a80a2]" />
          <span className="ml-2 text-[#70808f]">Đang tải SOPs...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Không thể tải danh sách SOPs</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-[#e5e5e5]"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && sops.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#70808f] mb-4">
            {searchQuery ? "Không tìm thấy SOP nào" : "Chưa có SOP nào"}
          </p>
        </div>
      )}

      {/* SOP List */}
      {!isLoading && !error && sops.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sops.map((sop) => (
              <Link key={sop.id} href={`/dashboard/workflow/${sop.id}`}>
                <Card className="bg-white rounded-[8px] p-6 hover:shadow-lg transition-shadow cursor-pointer border">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-base font-semibold text-black line-clamp-2">
                      {sop.name}
                    </h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded whitespace-nowrap ml-2">
                      {sop.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </div>

                  {sop.description && (
                    <p className="text-sm text-[#70808f] mb-4 line-clamp-2">
                      {sop.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#70808f]">Loại môi trường:</span>
                      <span className="text-black font-medium">
                        {sop.environmentTypeId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#70808f]">Phiên bản:</span>
                      <span className="text-black font-medium">
                        {sop.version}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#70808f]">Số bước:</span>
                      <span className="text-black font-medium">
                        {sop.steps?.length || 0}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {sopsData && sopsData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={!sopsData.hasPreviousPage}
                onClick={() => setPageNumber(pageNumber - 1)}
                className="border-[#e5e5e5]"
              >
                Trước
              </Button>

              <span className="text-sm text-[#70808f] px-4">
                Trang {sopsData.pageNumber} / {sopsData.totalPages}
              </span>

              <Button
                variant="outline"
                disabled={!sopsData.hasNextPage}
                onClick={() => setPageNumber(pageNumber + 1)}
                className="border-[#e5e5e5]"
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
