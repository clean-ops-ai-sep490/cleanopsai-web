"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useInfiniteSelect } from "@/hooks/useInfiniteSelect";
import type { PaginatedResponse } from "@/types/common";

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
  imageUrl?: string;
}

interface MultiSelectProps {
  // Legacy props
  options?: MultiSelectOption[];
  value?: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  maxDisplay?: number;

  // New infinite loading props
  queryKey?: (string | number)[];
  queryFn?: (
    page: number,
    pageSize: number,
    searchQuery?: string,
    filters?: Record<string, any>,
  ) => Promise<PaginatedResponse<MultiSelectOption>>;
  filters?: Record<string, any>;
  pageSize?: number;
  useInfiniteLoading?: boolean;
}

export function MultiSelect({
  options = [],
  value = [],
  onValueChange,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  emptyText = "Không tìm thấy kết quả",
  className,
  disabled = false,
  maxDisplay = 2,
  queryKey,
  queryFn,
  filters = {},
  pageSize = 20,
  useInfiniteLoading = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [popoverWidth, setPopoverWidth] = React.useState<number | undefined>();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];

  // Always call useInfiniteSelect hook, but conditionally enable it
  const infiniteSelect = useInfiniteSelect<MultiSelectOption>({
    queryKey: queryKey || ["default"],
    queryFn:
      queryFn ||
      (() =>
        Promise.resolve({
          content: [],
          pageNumber: 1,
          pageSize: 0,
          totalElements: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        })),
    pageSize,
    filters,
    enabled: open && useInfiniteLoading && !!queryKey && !!queryFn,
  });

  // Use infinite loading data if enabled and available, otherwise use legacy options
  const shouldUseInfiniteLoading = useInfiniteLoading && queryKey && queryFn;
  const displayOptions = shouldUseInfiniteLoading
    ? infiniteSelect.items
    : options;
  const isLoading = shouldUseInfiniteLoading ? infiniteSelect.isLoading : false;
  const isFetchingMore = shouldUseInfiniteLoading
    ? infiniteSelect.isFetchingNextPage
    : false;
  const hasNextPage = shouldUseInfiniteLoading
    ? infiniteSelect.hasNextPage
    : false;
  const isError = shouldUseInfiniteLoading ? infiniteSelect.isError : false;
  const currentSearchQuery = shouldUseInfiniteLoading
    ? infiniteSelect.searchQuery
    : searchQuery;
  const setCurrentSearchQuery = shouldUseInfiniteLoading
    ? infiniteSelect.setSearchQuery
    : setSearchQuery;

  // Filter options based on search (legacy mode)
  const filteredOptions = React.useMemo(() => {
    if (shouldUseInfiniteLoading) return displayOptions;
    if (!searchQuery) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery, shouldUseInfiniteLoading, displayOptions]);

  const finalOptions = shouldUseInfiniteLoading
    ? displayOptions
    : filteredOptions;

  // Reset selected index when filtered options change
  React.useEffect(() => {
    setSelectedIndex(-1);
  }, [finalOptions]);

  // Focus input when popover opens and set width
  React.useEffect(() => {
    if (open) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
      // Set popover width to match trigger button width, with responsive constraints
      if (triggerRef.current) {
        const triggerWidth = triggerRef.current.offsetWidth;
        const viewportWidth = window.innerWidth;
        const maxWidth = Math.min(triggerWidth, viewportWidth - 32); // 16px padding on each side
        setPopoverWidth(Math.max(maxWidth, 200)); // minimum 200px width
      }
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < finalOptions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : finalOptions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < finalOptions.length) {
          const selectedOption = finalOptions[selectedIndex];
          handleSelect(selectedOption.value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  // Scroll selected item into view
  React.useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (optionValue: string) => {
    const newValue = safeValue.includes(optionValue)
      ? safeValue.filter((v) => v !== optionValue)
      : [...safeValue, optionValue];
    onValueChange(newValue);
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newValue = safeValue.filter((v) => v !== optionValue);
    onValueChange(newValue);
  };

  const handleItemClick = (option: MultiSelectOption) => {
    handleSelect(option.value);
  };

  const handleItemMouseEnter = (index: number) => {
    setSelectedIndex(index);
  };

  // Handle scroll for infinite loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!shouldUseInfiniteLoading) return;
    infiniteSelect.handleScroll(e);
  };

  const selectedOptions = (
    shouldUseInfiniteLoading ? displayOptions : options
  ).filter((option) => safeValue.includes(option.value));
  const displaySelectedOptions = selectedOptions.slice(0, maxDisplay);
  const remainingCount = selectedOptions.length - maxDisplay;

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="p-1">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center px-2 py-1.5 rounded-[var(--app-radius-sm)] animate-pulse"
        >
          <div className="w-4 h-4 bg-gray-200 rounded-[var(--app-radius-sm)] mr-2"></div>
          <div className="h-4 bg-gray-200 rounded-[var(--app-radius-sm)] flex-1"></div>
        </div>
      ))}
    </div>
  );

  // Loading more indicator
  const LoadingMore = () => (
    <div className="flex items-center justify-center py-3 text-sm text-gray-500">
      <Loader2 className="w-4 h-4 animate-spin mr-2" />
      Đang tải thêm...
    </div>
  );

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-auto min-h-8 px-3 py-1.5 text-left font-normal whitespace-normal",
            className,
          )}
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-1 flex-1 min-w-0 flex-wrap">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-500 truncate">{placeholder}</span>
            ) : (
              <>
                {displaySelectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="text-xs bg-primary-soft text-primary hover:bg-[#d1ecf1] flex items-center gap-1 flex-shrink-0 max-w-[150px]"
                  >
                    <span className="truncate" title={option.label}>
                      {option.label}
                    </span>
                    <div
                      role="button"
                      tabIndex={0}
                      className="h-3 w-3 cursor-pointer flex-shrink-0 text-primary hover:text-red-500 transition-colors"
                      onClick={(e) => handleRemove(option.value, e)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRemove(option.value, e as any);
                        }
                      }}
                      aria-label={`Remove ${option.label}`}
                    >
                      <X className="h-3 w-3" />
                    </div>
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs flex-shrink-0 bg-primary text-white hover:bg-[#308cab]"
                  >
                    +{remainingCount}
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        avoidCollisions={true}
        collisionPadding={8}
        style={{ width: popoverWidth }}
      >
        <div className="flex flex-col bg-white min-w-0">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 px-3 bg-white">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={currentSearchQuery}
              onChange={(e) => setCurrentSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex h-11 w-full rounded-[var(--app-radius-sm)] bg-white py-3 text-sm text-black outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Items List */}
          <div
            ref={
              shouldUseInfiniteLoading ? infiniteSelect.scrollRef : undefined
            }
            onScroll={handleScroll}
            className="max-h-[300px] overflow-y-auto overflow-x-hidden bg-white scrollbar-primary"
          >
            {isError ? (
              <div className="py-6 text-center text-sm text-red-500">
                Có lỗi xảy ra khi tải dữ liệu
              </div>
            ) : isLoading ? (
              <LoadingSkeleton />
            ) : finalOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-600">
                {emptyText}
              </div>
            ) : (
              <>
                <div className="p-1" ref={listRef}>
                  {finalOptions.map((option, index) => (
                    <div
                      key={option.value}
                      className={cn(
                        "relative flex cursor-pointer select-none items-start rounded-[var(--app-radius-sm)] px-2 py-1.5 text-sm outline-none transition-colors duration-200",
                        // Keyboard selection styling
                        selectedIndex === index
                          ? "bg-primary-soft text-primary"
                          : "text-black hover:bg-primary-soft hover:text-primary",
                      )}
                      onClick={() => handleItemClick(option)}
                      onMouseEnter={() => handleItemMouseEnter(index)}
                      onMouseLeave={() => setSelectedIndex(-1)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 mt-0.5 flex-shrink-0",
                          safeValue.includes(option.value)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {option.imageUrl && (
                          <div className="w-10 h-10 rounded-[var(--app-radius-sm)] overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm bg-gray-50 mt-0.5">
                            <img
                              src={option.imageUrl}
                              alt={option.label}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium text-gray-900">{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {option.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Loading more indicator */}
                {isFetchingMore && <LoadingMore />}
                {/* End of list indicator */}
                {shouldUseInfiniteLoading &&
                  !hasNextPage &&
                  finalOptions.length > 0 && (
                    <div className="py-2 text-center text-xs text-gray-400 border-t border-gray-100">
                      Đã hiển thị tất cả kết quả
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
