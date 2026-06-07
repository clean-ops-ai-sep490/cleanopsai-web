"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface WorkerSearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

const SUGGESTIONS = [
  "công nhân có khả năng dọn dẹp cơ bản",
  "tìm công nhân có chứng chỉ an toàn lao động",
  "công nhân dọn dẹp có kỹ năng làm việc trên cao",
  "công nhân có kỹ năng dọn dẹp y tế tại TP. Hồ Chí Minh",
];

export function WorkerSearchInput({
  onSearch,
  isLoading,
  initialValue = "",
}: WorkerSearchInputProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  return (
    <Card className="border-slate-100 bg-gradient-to-br from-teal-500/5 via-cyan-500/5 to-transparent shadow-sm">
      <CardContent className="pt-6 space-y-4">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-600 animate-pulse" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập yêu cầu tìm kiếm bằng ngôn ngữ tự nhiên (ví dụ: công nhân dọn dẹp y tế có chứng chỉ...)"
              className="pl-12 pr-4 h-12 bg-white/80 border-slate-200 focus:border-teal-500 rounded-xl shadow-inner text-[15px]"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="h-12 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-md shadow-teal-600/10 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span>Tìm kiếm</span>
          </Button>
        </form>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-teal-600" />
            Gợi ý tìm kiếm
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200/60 bg-white hover:bg-teal-50/30 hover:border-teal-300 text-slate-600 hover:text-teal-700 transition-all font-medium duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
