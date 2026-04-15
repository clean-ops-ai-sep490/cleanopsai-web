"use client";

import { useState } from "react";
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

import { Plus, Edit2, Trash2, Search } from "lucide-react";

import {
  useSearchSteps,
  useCreateStep,
  useUpdateStep,
  useDeleteStep,
} from "@/hooks/useSteps";

import { StandardDialog } from "@/components/ui/standard-dialog";
import StepForm from "./StepForm";

export default function StepsPage() {
  const [keyword, setKeyword] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const { data, isLoading } = useSearchSteps(keyword, pageNumber, 10);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const createMutation = useCreateStep();
  const updateMutation = useUpdateStep();
  const deleteMutation = useDeleteStep();

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
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa bước này không?")) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold ">Quản lý các bước</h1>
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm bước
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách bước ({data?.totalElements ?? 0})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p>Đang tải dữ liệu...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action Key</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-right">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data?.content?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.actionKey}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.description}</TableCell>

                      <TableCell className="text-right">
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
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <StandardDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Cập nhật bước" : "Tạo bước mới"}
      >
        <StepForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </StandardDialog>
    </div>
  );
}