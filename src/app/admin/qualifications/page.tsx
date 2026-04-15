"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, Loader2, Award, Wrench } from "lucide-react";

// Hooks
import { useWorkerSkills, useDeleteWorkerSkill } from "@/hooks/useWorkerSkills";
import { useWorkerCertifications, useDeleteWorkerCertification } from "@/hooks/useWorkerCertifications";

// Components
import GlobalAssignModal from "./GlobalAssignModal";
import UpdateSkillDialog from "./UpdateSkillDialog";
import UpdateCertDialog from "./UpdateCertDialog";

export default function QualificationsPage() {
  // ================= STATES =================
  const [skillPage, setSkillPage] = useState(1);
  const [certPage, setCertPage] = useState(1);
  const pageSize = 10;

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any | null>(null);
  const [editingCert, setEditingCert] = useState<any | null>(null);

  // ================= FETCH DATA & MUTATIONS =================
  const { data: skillsData, isLoading: loadingSkills } = useWorkerSkills({ pageNumber: skillPage, pageSize });
  const { data: certsData, isLoading: loadingCerts } = useWorkerCertifications({ pageNumber: certPage, pageSize });

  const { mutateAsync: deleteSkill } = useDeleteWorkerSkill();
  const { mutateAsync: deleteCert } = useDeleteWorkerCertification();

  // ================= HANDLERS =================
  const handleDeleteSkill = async (workerId: string, skillId: string) => {
    if (!confirm("Bạn có chắc chắn muốn thu hồi kỹ năng này của nhân viên?")) return;
    try { await deleteSkill({ workerId, skillId }); } 
    catch { alert("Lỗi khi xóa kỹ năng"); }
  };

  const handleDeleteCert = async (workerId: string, certificationId: string) => {
    if (!confirm("Bạn có chắc chắn muốn thu hồi chứng chỉ này của nhân viên?")) return;
    try { await deleteCert({ workerId, certificationId }); } 
    catch { alert("Lỗi khi xóa chứng chỉ"); }
  };

  // ================= RENDER BLOCKS =================

  const renderSkillsList = () => {
    if (loadingSkills) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400"/></div>;

    return (
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="px-6 py-4">Nhân viên</TableHead>
                  <TableHead className="px-6 py-4">Kỹ năng</TableHead>
                  <TableHead className="px-6 py-4">Cấp độ (Level)</TableHead>
                  <TableHead className="px-6 py-4 text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skillsData?.content?.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Chưa có dữ liệu kỹ năng</TableCell></TableRow>
                )}
                {skillsData?.content?.map((item: any) => (
                  <TableRow key={`${item.workerId}-${item.skillId}`}>
                    <TableCell className="font-medium px-6 py-4">{item.workerName}</TableCell>
                    <TableCell className="px-6 py-4">{item.skillName}</TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100 font-medium">
                        Level {item.skillLevel}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Cập nhật cấp độ" className="text-blue-600 hover:bg-blue-50" onClick={() => setEditingSkill(item)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Thu hồi kỹ năng" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteSkill(item.workerId, item.skillId)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Phân trang */}
          <div className="flex justify-between items-center py-4 px-6 border-t border-gray-100 bg-gray-50/30 rounded-b-xl">
            <Button variant="outline" size="sm" disabled={!skillsData?.hasPreviousPage} onClick={() => setSkillPage(p => p - 1)}>Trước</Button>
            <span className="text-sm font-medium text-gray-600">Trang {skillsData?.pageNumber || 1} / {skillsData?.totalPages || 1}</span>
            <Button variant="outline" size="sm" disabled={!skillsData?.hasNextPage} onClick={() => setSkillPage(p => p + 1)}>Sau</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCertsList = () => {
    if (loadingCerts) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400"/></div>;

    return (
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="px-6 py-4">Nhân viên</TableHead>
                  <TableHead className="px-6 py-4">Tên chứng chỉ</TableHead>
                  <TableHead className="px-6 py-4">Ngày cấp</TableHead>
                  <TableHead className="px-6 py-4">Ngày hết hạn</TableHead>
                  <TableHead className="px-6 py-4 text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certsData?.content?.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Chưa có dữ liệu chứng chỉ</TableCell></TableRow>
                )}
                {certsData?.content?.map((item: any) => (
                  <TableRow key={`${item.workerId}-${item.certificationId}`}>
                    <TableCell className="font-medium px-6 py-4">{item.workerName}</TableCell>
                    <TableCell className="px-6 py-4">{item.certificationName}</TableCell>
                    <TableCell className="px-6 py-4">{new Date(item.issuedDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="px-6 py-4">
                      {item.expiredAt ? (
                        <span className={new Date(item.expiredAt) < new Date() ? "text-red-600 font-semibold" : "text-gray-600"}>
                          {new Date(item.expiredAt).toLocaleDateString('vi-VN')}
                        </span>
                      ) : "Vô thời hạn"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Cập nhật thời hạn" className="text-blue-600 hover:bg-blue-50" onClick={() => setEditingCert(item)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Thu hồi chứng chỉ" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteCert(item.workerId, item.certificationId)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Phân trang */}
          <div className="flex justify-between items-center py-4 px-6 border-t border-gray-100 bg-gray-50/30 rounded-b-xl">
            <Button variant="outline" size="sm" disabled={!certsData?.hasPreviousPage} onClick={() => setCertPage(p => p - 1)}>Trước</Button>
            <span className="text-sm font-medium text-gray-600">Trang {certsData?.pageNumber || 1} / {certsData?.totalPages || 1}</span>
            <Button variant="outline" size="sm" disabled={!certsData?.hasNextPage} onClick={() => setCertPage(p => p + 1)}>Sau</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ================= MAIN UI =================
  return (
    <div className="min-h-screen p-6 bg-gray-50 w-full flex justify-center">
      <div className="w-full space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Năng lực & Chứng chỉ</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý toàn bộ kỹ năng và bằng cấp của đội ngũ nhân viên</p>
          </div>
          <Button onClick={() => setIsAssignModalOpen(true)} className="bg-[#1a80a2] hover:bg-[#156884] shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Cấp năng lực mới
          </Button>
        </div>

        {/* Cấu trúc Tabs mới: Thanh Tab nằm ngoài, mỗi Bảng có Card riêng */}
        <Tabs defaultValue="skills" className="w-full flex flex-col gap-4">
          <TabsList className="grid w-[400px] grid-cols-2 shadow-sm border border-gray-200/60 bg-white">
            <TabsTrigger value="skills" className="flex items-center gap-2 data-[state=active]:bg-gray-100">
              <Wrench className="w-4 h-4" /> Danh sách Kỹ năng
            </TabsTrigger>
            <TabsTrigger value="certs" className="flex items-center gap-2 data-[state=active]:bg-gray-100">
              <Award className="w-4 h-4" /> Danh sách Chứng chỉ
            </TabsTrigger>
          </TabsList>

          {/* Các khung bảng dữ liệu */}
          <TabsContent value="skills" className="mt-0 focus-visible:outline-none">
            {renderSkillsList()}
          </TabsContent>

          <TabsContent value="certs" className="mt-0 focus-visible:outline-none">
            {renderCertsList()}
          </TabsContent>
        </Tabs>
      </div>

      {/* ================= DIALOGS ================= */}
      {isAssignModalOpen && <GlobalAssignModal open={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} />}
      {editingSkill && <UpdateSkillDialog data={editingSkill} onClose={() => setEditingSkill(null)} />}
      {editingCert && <UpdateCertDialog data={editingCert} onClose={() => setEditingCert(null)} />}
    </div>
  );
}