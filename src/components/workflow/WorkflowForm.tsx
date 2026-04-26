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

  // Load environment types on mount
  useEffect(() => {
    if (environmentTypesLoaded.current) return;

    const loadEnvironmentTypes = async () => {
      environmentTypesLoaded.current = true;
      setLoadingEnvironments(true);
      try {
        const response = await getEnvironmentTypes();
        setEnvironmentTypes(response.content);
      } catch (error) {
        console.error("Failed to load environment types:", error);
        environmentTypesLoaded.current = false; // Reset on error
      } finally {
        setLoadingEnvironments(false);
      }
    };

    loadEnvironmentTypes();
  }, []);

  // Load skill categories on mount
  useEffect(() => {
    if (skillCategoriesLoaded.current) return;

    const loadSkillCategories = async () => {
      skillCategoriesLoaded.current = true;
      setLoadingSkillCategories(true);
      try {
        const categories = await getSkillCategories();
        const categoryObjects = categories
          .filter((cat) => cat && cat.trim() !== "")
          .map((cat) => ({ id: cat, name: cat }));
        setSkillCategories(categoryObjects);
      } catch (error) {
        console.error("Failed to load skill categories:", error);
        skillCategoriesLoaded.current = false; // Reset on error
      } finally {
        setLoadingSkillCategories(false);
      }
    };

    loadSkillCategories();
  }, []);

  // Load certification categories on mount
  useEffect(() => {
    if (certificationCategoriesLoaded.current) return;

    const loadCertificationCategories = async () => {
      certificationCategoriesLoaded.current = true;
      setLoadingCertificationCategories(true);
      try {
        const categories = await getCertificationCategories();
        const categoryObjects = categories
          .filter((cat) => cat && cat.trim() !== "")
          .map((cat) => ({ id: cat, name: cat }));
        setCertificationCategories(categoryObjects);
      } catch (error) {
        console.error("Failed to load certification categories:", error);
        certificationCategoriesLoaded.current = false; // Reset on error
      } finally {
        setLoadingCertificationCategories(false);
      }
    };

    loadCertificationCategories();
  }, []);

  // Load skills when skill category changes
  useEffect(() => {
    if (selectedSkillCategory) {
      const loadSkills = async () => {
        setLoadingSkills(true);
        try {
          const skills = await getSkillsByCategoryId(selectedSkillCategory);
          setAvailableSkills(skills);
        } catch (error) {
          console.error("Failed to load skills:", error);
        } finally {
          setLoadingSkills(false);
        }
      };

      loadSkills();
    } else {
      setAvailableSkills([]);
      handleChange("requiredSkillIds", []);
    }
  }, [selectedSkillCategory]);

  // Load certifications when certification category changes
  useEffect(() => {
    if (selectedCertificationCategory) {
      const loadCertifications = async () => {
        setLoadingCertifications(true);
        try {
          const certifications = await getCertificationsByCategory(
            selectedCertificationCategory,
          );
          setAvailableCertifications(certifications);
        } catch (error) {
          console.error("Failed to load certifications:", error);
        } finally {
          setLoadingCertifications(false);
        }
      };

      loadCertifications();
    } else {
      setAvailableCertifications([]);
      handleChange("requiredCertificationIds", []);
    }
  }, [selectedCertificationCategory]);

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
          <Input
            className="bg-[#f5f5f5] border-[#e5e5e5] h-[30px]"
            value={formData.serviceType}
            onChange={(e) => handleChange("serviceType", e.target.value)}
            placeholder="Ví dụ: Vệ sinh"
          />
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
          <Select
            value={selectedSkillCategory}
            onValueChange={setSelectedSkillCategory}
            disabled={loadingSkillCategories}
          >
            <SelectTrigger className="bg-[#f5f5f5] border-[#e5e5e5] h-[30px]">
              <SelectValue
                placeholder={
                  loadingSkillCategories
                    ? "Đang tải..."
                    : "Chọn danh mục kỹ năng"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {skillCategories
                .filter((cat) => cat && cat.id && cat.name)
                .map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
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
          <Select
            value={selectedCertificationCategory}
            onValueChange={setSelectedCertificationCategory}
            disabled={loadingCertificationCategories}
          >
            <SelectTrigger className="bg-[#f5f5f5] border-[#e5e5e5] h-[30px]">
              <SelectValue
                placeholder={
                  loadingCertificationCategories
                    ? "Đang tải..."
                    : "Chọn danh mục chứng chỉ"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {certificationCategories
                .filter((cat) => cat && cat.id && cat.name)
                .map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
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
