"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getEnvironmentTypes,
  getEnvironmentTypesPaginated,
} from "@/lib/environment-type-api";
import { getSkillCategories, getSkillsByCategoryId } from "@/lib/skill-api";
import {
  getCertificationCategories,
  getCertificationsByCategory,
} from "@/lib/certification-api";
import { translateServiceType } from "@/lib/utils/translate";
import type { EnvironmentType } from "@/types/sop";
import type { Skill, Certification } from "@/types/skill";

interface SOPFormData {
  name: string;
  description: string;
  serviceType: string;
  environmentTypeId: string;
  requiredSkillIds: string[];
  requiredCertificationIds: string[];
}

interface WorkflowFormProps {
  formData: SOPFormData;
  onChange: (formData: SOPFormData) => void;
}

interface Category {
  id: string;
  name: string;
}

export function WorkflowForm({ formData, onChange }: WorkflowFormProps) {
  // Refs to track if data has been loaded to prevent duplicate calls
  const environmentTypesLoaded = useRef(false);
  const skillCategoriesLoaded = useRef(false);
  const certificationCategoriesLoaded = useRef(false);

  // State for dropdown options
  const [environmentTypes, setEnvironmentTypes] = useState<EnvironmentType[]>(
    [],
  );
  const [skillCategories, setSkillCategories] = useState<Category[]>([]);
  const [certificationCategories, setCertificationCategories] = useState<
    Category[]
  >([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [availableCertifications, setAvailableCertifications] = useState<
    Certification[]
  >([]);

  // State for selected categories
  const [selectedSkillCategory, setSelectedSkillCategory] =
    useState<string>("");
  const [selectedCertificationCategory, setSelectedCertificationCategory] =
    useState<string>("");

  // Loading states
  const [loadingEnvironments, setLoadingEnvironments] = useState(false);
  const [loadingSkillCategories, setLoadingSkillCategories] = useState(false);
  const [loadingCertificationCategories, setLoadingCertificationCategories] =
    useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [loadingCertifications, setLoadingCertifications] = useState(false);

  // No longer needed: environmentTypes, skillCategories, certificationCategories state and effects
  // We will let SearchableSelect handle the data fetching

  const handleChange = (field: keyof SOPFormData, value: string | string[]) => {
    onChange({ ...formData, [field]: value });
  };

  // Prepare options for multi-select components
  const skillOptions = availableSkills
    .filter((skill) => skill && skill.id && skill.name)
    .map((skill) => ({
      value: skill.id,
      label: skill.name,
    }));

  const certificationOptions = availableCertifications
    .filter((cert) => cert && cert.id && cert.name)
    .map((cert) => ({
      value: cert.id,
      label: cert.name,
    }));

  return (
    <Card className="bg-[#f9fafb] rounded-[5px] p-6">
      <h2 className="text-[15px] font-medium text-black mb-6">Thông tin SOP</h2>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">
            Tên SOP *
          </Label>
          <Input
            className="bg-[#f5f5f5] border-[#e5e5e5] h-[30px]"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nhập tên SOP"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">
            Loại dịch vụ
          </Label>
          <Select
            value={formData.serviceType}
            onValueChange={(value) => handleChange("serviceType", value)}
          >
            <SelectTrigger className="bg-[#f5f5f5] border-[#e5e5e5] h-[30px] text-sm">
              <SelectValue placeholder="Chọn loại dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cleaning">Vệ sinh</SelectItem>
              <SelectItem value="Maintenance">Bảo trì</SelectItem>
              <SelectItem value="Repair">Sửa chữa</SelectItem>
              <SelectItem value="Inspection">Kiểm tra</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">
            Loại môi trường *
          </Label>
          <SearchableSelect
            value={formData.environmentTypeId}
            onValueChange={(value) => handleChange("environmentTypeId", value)}
            placeholder={
              loadingEnvironments ? "Đang tải..." : "Chọn loại môi trường"
            }
            disabled={loadingEnvironments}
            queryKey={["environment-types", "workflow"]}
            queryFn={async (page, pageSize, searchQuery) => {
              try {
                // Use the new API function that returns PaginatedResponse format
                const response = await getEnvironmentTypes({
                  pageNumber: page,
                  pageSize,
                  search: searchQuery,
                });

                // Ensure content is an array and filter out invalid items
                const validContent = Array.isArray(response.content)
                  ? response.content.filter(
                      (item) => item && item.id && item.name,
                    )
                  : [];

                return {
                  ...response,
                  content: validContent,
                };
              } catch (error) {
                console.error("Failed to load environment types:", error);
                return {
                  content: [],
                  pageNumber: page,
                  pageSize,
                  totalElements: 0,
                  totalPages: 0,
                  hasNextPage: false,
                  hasPreviousPage: false,
                };
              }
            }}
            useInfiniteLoading={true}
            pageSize={10}
            className="bg-[#f5f5f5] border-[#e5e5e5] h-[30px]"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">
            Danh mục kỹ năng
          </Label>
          <SearchableSelect
            value={selectedSkillCategory}
            onValueChange={async (value) => {
              setSelectedSkillCategory(value);
              if (value) {
                setLoadingSkills(true);
                try {
                  const skills = await getSkillsByCategoryId(value);
                  setAvailableSkills(skills);
                } finally {
                  setLoadingSkills(false);
                }
              } else {
                setAvailableSkills([]);
              }
            }}
            placeholder="Chọn danh mục kỹ năng"
            loadItems={async () => {
              const categories = await getSkillCategories();
              return {
                items: categories
                  .filter((cat) => cat && cat.trim() !== "")
                  .map((cat) => ({ id: cat, name: cat })),
                totalCount: categories.length,
              };
            }}
            getItemById={async (id) => ({ id, name: id } as any)}
            className="bg-[#f5f5f5] border-[#e5e5e5] h-[30px]"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">
            Kỹ năng yêu cầu
          </Label>
          <MultiSelect
            options={skillOptions}
            value={formData.requiredSkillIds}
            onValueChange={(value) => handleChange("requiredSkillIds", value)}
            placeholder={
              !selectedSkillCategory
                ? "Chọn danh mục trước"
                : loadingSkills
                  ? "Đang tải..."
                  : "Chọn kỹ năng"
            }
            disabled={!selectedSkillCategory || loadingSkills}
            className="bg-[#f5f5f5] border-[#e5e5e5]"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">
            Danh mục chứng chỉ
          </Label>
          <SearchableSelect
            value={selectedCertificationCategory}
            onValueChange={async (value) => {
              setSelectedCertificationCategory(value);
              if (value) {
                setLoadingCertifications(true);
                try {
                  const certs = await getCertificationsByCategory(value);
                  setAvailableCertifications(certs);
                } finally {
                  setLoadingCertifications(false);
                }
              } else {
                setAvailableCertifications([]);
              }
            }}
            placeholder="Chọn danh mục chứng chỉ"
            loadItems={async () => {
              const categories = await getCertificationCategories();
              return {
                items: categories
                  .filter((cat) => cat && cat.trim() !== "")
                  .map((cat) => ({ id: cat, name: cat })),
                totalCount: categories.length,
              };
            }}
            getItemById={async (id) => ({ id, name: id } as any)}
            className="bg-[#f5f5f5] border-[#e5e5e5] h-[30px]"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">
            Chứng chỉ yêu cầu
          </Label>
          <MultiSelect
            options={certificationOptions}
            value={formData.requiredCertificationIds}
            onValueChange={(value) =>
              handleChange("requiredCertificationIds", value)
            }
            placeholder={
              !selectedCertificationCategory
                ? "Chọn danh mục trước"
                : loadingCertifications
                  ? "Đang tải..."
                  : "Chọn chứng chỉ"
            }
            disabled={!selectedCertificationCategory || loadingCertifications}
            className="bg-[#f5f5f5] border-[#e5e5e5]"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-sm font-medium text-black mb-2 block">
            Mô tả SOP
          </Label>
          <Textarea
            className="bg-[#f5f5f5] border-[#e5e5e5] min-h-[60px]"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Mô tả chi tiết về SOP này"
          />
        </div>
      </div>
    </Card>
  );
}

// Export the interface for reuse
export type { SOPFormData };
