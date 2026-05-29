"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { WorkerSearchInput } from "@/components/workers/WorkerSearchInput";
import { WorkerSearchResultsTable } from "@/components/workers/WorkerSearchResultsTable";
import { ErrorState } from "@/components/ui/error-state";
import { api } from "@/lib/api";
import { AlertCircle, Search } from "lucide-react";
import type { WorkerSearchResult } from "@/types/worker-search";

export default function WorkersSearchPage() {
  const [results, setResults] = useState<WorkerSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setLastQuery(query);
    setHasSearched(true);

    try {
      const response = await api.get<WorkerSearchResult[]>("Workers/search", {
        params: { search: query },
      });
      setResults(response || []);
    } catch (err: any) {
      console.error("Lỗi khi tìm kiếm công nhân:", err);
      setError(
        err.message || "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối và thử lại."
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Tìm kiếm công nhân bằng AI"
        description="Tìm kiếm công nhân phù hợp cho công việc bằng ngôn ngữ tự nhiên thông qua AI."
        icon={<Search className="h-6 w-6 text-teal-600" />}
      />

      <WorkerSearchInput 
        onSearch={handleSearch} 
        isLoading={isLoading} 
        initialValue={lastQuery}
      />

      {error ? (
        <ErrorState
          title="Đã xảy ra lỗi tìm kiếm"
          description={error}
          onAction={() => handleSearch(lastQuery)}
          actionLabel="Tìm lại"
          icon={<AlertCircle className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-2">
          {hasSearched && !isLoading && (
            <div className="text-sm text-slate-500 font-medium px-1">
              Tìm thấy <span className="text-teal-600 font-bold">{results.length}</span> công nhân phù hợp cho từ khóa &ldquo;<span className="italic font-semibold text-slate-700">{lastQuery}</span>&rdquo;
            </div>
          )}
          
          <WorkerSearchResultsTable 
            data={results} 
            isLoading={isLoading} 
          />
        </div>
      )}
    </div>
  );
}
