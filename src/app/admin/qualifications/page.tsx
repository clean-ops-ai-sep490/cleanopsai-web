"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Plus, Trash2, Edit2, Loader2, Award, Wrench } from "lucide-react";
import { useState as useStateBase } from "react";

// Hooks
import {
  useWorkerSkills,
  useDeleteWorkerSkill,
} from "@/hooks/useWorkerSkills";

import {
  useWorkerCertifications,
  useDeleteWorkerCertification,
} from "@/hooks/useWorkerCertifications";

// Pagination hook
import { usePagination } from "@/hooks/usePagination";

// Components
import GlobalAssignModal from "./GlobalAssignModal";
import UpdateSkillDialog from "./UpdateSkillDialog";
import UpdateCertDialog from "./UpdateCertDialog";

export default function QualificationsPage() {
  // ================= PAGINATION =================
  const skillPagination = usePagination({ initialPageSize: 10 });
  const certPagination = usePagination({ initialPageSize: 10 });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any | null>(null);
  const [editingCert, setEditingCert] = useState<any | null>(null);
  const [activeSection, setActiveSection] = useState<"skills" | "certs">("skills");

  // ================= FETCH =================
  const { data: skillsData, isLoading: loadingSkills } =
    useWorkerSkills(skillPagination.paginationParams);

  const { data: certsData, isLoading: loadingCerts } =
    useWorkerCertifications(certPagination.paginationParams);

  const { mutateAsync: deleteSkill } = useDeleteWorkerSkill();
  const { mutateAsync: deleteCert } = useDeleteWorkerCertification();

  // ================= HANDLERS =================
  const handleDeleteSkill = async (workerId: string, skillId: string) => {
    if (!confirm("Bạn có chắc chắn muốn thu hồi kỹ năng này?")) return;
    await deleteSkill({ workerId, skillId });
  };

  const handleDeleteCert = async (workerId: string, certificationId: string) => {
    if (!confirm("Bạn có chắc chắn muốn thu hồi chứng chỉ này?")) return;
    await deleteCert({ workerId, certificationId });
  };

  // ================= DATA =================
  const skillItems = skillsData?.content ?? [];
  const certItems = certsData?.content ?? [];

  const skillTotalPages = skillsData?.totalPages ?? 1;
  const certTotalPages = certsData?.totalPages ?? 1;

  // ================= RENDER SKILLS =================
  const renderSkillsList = () => {
    if (loadingSkills) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      );
    }

    return (
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Kỹ năng</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {skillItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Chưa có dữ liệu
                  </TableCell>
                </TableRow>
              )}

              {skillItems.map((item: any) => (
                <TableRow key={`${item.workerId}-${item.skillId}`}>
                  <TableCell>{item.workerName}</TableCell>
                  <TableCell>{item.skillName}</TableCell>
                  <TableCell>Level {item.skillLevel}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => setEditingSkill(item)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      className="text-red-500"
                      onClick={() =>
                        handleDeleteSkill(item.workerId, item.skillId)
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* PAGINATION SKILLS */}
          <div className="flex justify-between items-center p-4 border-t">
            <Button
              disabled={skillPagination.currentPage === 1}
              onClick={skillPagination.prevPage}
            >
              Trước
            </Button>

            <span>
              Trang {skillPagination.currentPage} / {skillTotalPages}
            </span>

            <Button
              disabled={skillPagination.currentPage >= skillTotalPages}
              onClick={skillPagination.nextPage}
            >
              Sau
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ================= RENDER CERTS =================
  const renderCertsList = () => {
    if (loadingCerts) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      );
    }

    return (
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Chứng chỉ</TableHead>
                <TableHead>Ngày cấp</TableHead>
                <TableHead>Hết hạn</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {certItems.map((item: any) => (
                <TableRow key={`${item.workerId}-${item.certificationId}`}>
                  <TableCell>{item.workerName}</TableCell>
                  <TableCell>{item.certificationName}</TableCell>
                  <TableCell>
                    {new Date(item.issuedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {item.expiredAt
                      ? new Date(item.expiredAt).toLocaleDateString()
                      : "Vô thời hạn"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => setEditingCert(item)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      className="text-red-500"
                      onClick={() =>
                        handleDeleteCert(
                          item.workerId,
                          item.certificationId
                        )
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* PAGINATION CERTS */}
          <div className="flex justify-between items-center p-4 border-t">
            <Button
              disabled={certPagination.currentPage === 1}
              onClick={certPagination.prevPage}
            >
              Trước
            </Button>

            <span>
              Trang {certPagination.currentPage} / {certTotalPages}
            </span>

            <Button
              disabled={certPagination.currentPage >= certTotalPages}
              onClick={certPagination.nextPage}
            >
              Sau
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ================= UI =================
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="space-y-6">
<h1 className="text-2xl font-bold">
            Quản lý Năng lực & Chứng chỉ
          </h1>
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <Button
              variant={activeSection === "skills" ? "default" : "outline"}
              className="justify-start"
              onClick={() => setActiveSection("skills")}
            >
              <Wrench className="w-4 h-4 mr-2" />
              Danh sách Kỹ năng
            </Button>

            <Button
              variant={activeSection === "certs" ? "default" : "outline"}
              className="justify-start"
              onClick={() => setActiveSection("certs")}
            >
              <Award className="w-4 h-4 mr-2" />
              Danh sách Chứng chỉ
            </Button>
          <Button onClick={() => setIsAssignModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Cấp mới
          </Button>
        </div>

        {/* SIDEBAR + CONTENT */}
        <div className="flex gap-6">

          {/* CONTENT AREA */}
          <div className="flex-1">
            {activeSection === "skills" && renderSkillsList()}
            {activeSection === "certs" && renderCertsList()}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {isAssignModalOpen && (
        <GlobalAssignModal
          open={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
        />
      )}

      {editingSkill && (
        <UpdateSkillDialog
          data={editingSkill}
          onClose={() => setEditingSkill(null)}
        />
      )}

      {editingCert && (
        <UpdateCertDialog
          data={editingCert}
          onClose={() => setEditingCert(null)}
        />
      )}
    </div>
  );
}
