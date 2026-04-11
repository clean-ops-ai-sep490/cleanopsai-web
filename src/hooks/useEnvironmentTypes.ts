import { getEnvironmentTypesPaginated } from "@/lib/environment-type-api";

export function useEnvironmentTypes() {
  const loadEnvironmentTypes = async (search?: string) => {
    try {
      return await getEnvironmentTypesPaginated({
        pageNumber: 1,
        pageSize: 50,
        search,
      });
    } catch (error) {
      console.error("Failed to load environment types:", error);
      return {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 50,
      };
    }
  };

  return {
    loadEnvironmentTypes,
  };
}
