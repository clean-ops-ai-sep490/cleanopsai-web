// Environment types data for searchable select
export interface EnvironmentType {
  id: string;
  name: string;
  description?: string;
}

export const ENVIRONMENT_TYPES: EnvironmentType[] = [
  {
    id: "indoor",
    name: "Trong nhà",
    description: "Môi trường trong nhà, có mái che",
  },
  {
    id: "outdoor",
    name: "Ngoài trời",
    description: "Môi trường ngoài trời, không có mái che",
  },
  {
    id: "mixed",
    name: "Hỗn hợp",
    description: "Kết hợp cả trong nhà và ngoài trời",
  },
  {
    id: "specialized",
    name: "Chuyên biệt",
    description: "Môi trường đặc biệt, yêu cầu kỹ thuật riêng",
  },
];

export async function getEnvironmentTypesPaginated(params: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}): Promise<{ items: EnvironmentType[]; totalCount: number }> {
  const { search } = params;

  let filteredTypes = ENVIRONMENT_TYPES;

  if (search && search.trim()) {
    const searchTerm = search.trim().toLowerCase();
    filteredTypes = ENVIRONMENT_TYPES.filter(
      (type) =>
        type.name.toLowerCase().includes(searchTerm) ||
        (type.description &&
          type.description.toLowerCase().includes(searchTerm)),
    );
  }

  return {
    items: filteredTypes,
    totalCount: filteredTypes.length,
  };
}
