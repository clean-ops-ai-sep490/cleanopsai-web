"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

import {
  useSearchSkills,
  useCreateSkill,
  useUpdateSkill,
  useDeleteSkill,
  useSkillsByCategory,
  useSkillCategories,
} from "@/hooks/useSkills";

import { StandardDialog } from "@/components/ui/standard-dialog";
import SkillForm from "./SkillForm";

export default function SkillsPage() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const queryClient = useQueryClient();

  const isFilterByCategory = category !== "all";

  // ===== API SEARCH =====
  const searchResult = useSearchSkills(keyword, pageNumber, pageSize);

  // ===== API CATEGORY =====
  const categoryResult = useSkillsByCategory(category);

  const data = isFilterByCategory ? categoryResult.data : searchResult.data;
  const isLoading = isFilterByCategory
    ? categoryResult.isLoading
    : searchResult.isLoading;

  // ===== CATEGORY LIST =====
  const { data: categories } = useSkillCategories();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const createMutation = useCreateSkill();
  const updateMutation = useUpdateSkill();
  const deleteMutation = useDeleteSkill();

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCategory("all"); // reset filter
    setPageNumber(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setKeyword("");
    setPageNumber(1);
  };

  const handleSubmit = async (form: any) => {
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: form,
      });
    } else {
      await createMutation.mutateAsync(form);
    }

    setOpen(false);
    setEditing(null);

    queryClient.invalidateQueries(["skills"]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa kỹ năng này?")) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-8 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Quản lý kỹ năng</h1>
          <p className="text-muted-foreground">
            Quản lý các kỹ năng chuyên môn
          </p>
        </div>

        {/* Search + Filter + Add */}
        <div className="flex gap-3 mb-6">
          {/* SEARCH */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 opacity-50 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm kỹ năng..."
              value={keyword}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
              disabled={isFilterByCategory}
            />
          </div>

          {/* CATEGORY FILTER */}
          <select
            className="border rounded px-3 py-2"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories?.map((c: any) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* ADD */}
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm kỹ năng
          </Button>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách ({data?.totalElements ?? data?.length ?? 0})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p>Đang tải...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {(data?.content ?? data ?? []).map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold">
                        {item.name}
                      </TableCell>

                      <TableCell>
                        <Badge>{item.category}</Badge>
                      </TableCell>

                      <TableCell>{item.description}</TableCell>

                      <TableCell className="text-right flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditing(item);
                            setOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          className="text-red-500"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* PAGINATION (chỉ dùng khi search API) */}
            {!isFilterByCategory && !Array.isArray(data) && (
              <div className="flex justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Trang {data?.pageNumber} / {data?.totalPages}
                </p>

                <div className="flex gap-2">
                  <Button
                    disabled={!data?.hasPreviousPage}
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  >
                    Trước
                  </Button>

                  <Button
                    disabled={!data?.hasNextPage}
                    onClick={() => setPageNumber((p) => p + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DIALOG */}
      <StandardDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Cập nhật kỹ năng" : "Thêm kỹ năng"}
      >
        <SkillForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </StandardDialog>
    </div>
  );
}
