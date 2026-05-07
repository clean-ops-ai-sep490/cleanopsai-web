"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useInfiniteSelect } from "@/hooks/useInfiniteSelect";
import type { PaginatedResponse } from "@/types/common";

// SearchableSelect interface
export interface SearchableSelectItem {
  id: string;
  name: string;
}

interface SearchableSelectProps<T extends SearchableSelectItem> {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  // Legacy support - will be converted to infinite loading
  loadItems?: (search?: string) => Promise<{ items: T[]; totalCount: number }>;
  // New infinite loading props
  queryKey?: (string | number | null | undefined)[];
  queryFn?: (
    page: number,
    pageSize: number,
    searchQuery?: string,
    filters?: Record<string, any>,
  ) => Promise<PaginatedResponse<T>>;
  getItemById?: (id: string) => Promise<T>;
  displayFormatter?: (item: T) => React.ReactNode;
  filters?: Record<string, any>;
  pageSize?: number;
  useInfiniteLoading?: boolean;
}

export function SearchableSelect<T extends SearchableSelectItem>({
  value,
  onValueChange,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  emptyMessage = "Không tìm thấy dữ liệu nào.",
  className,
  disabled = false,
  loadItems,
  queryKey,
  queryFn,
  getItemById,
  displayFormatter,
  filters = {},
  pageSize = 20,
  useInfiniteLoading = false,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [popoverWidth, setPopoverWidth] = React.useState<number | undefined>();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Legacy state for non-infinite loading
  const [items, setItems] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredItems, setFilteredItems] = React.useState<T[]>([]);
  const [cachedSelectedItem, setCachedSelectedItem] = React.useState<T | null>(
    null,
  );
  const safeQueryKey = React.useMemo(
    () =>
      (queryKey || ["default"]).filter(
        (value): value is string | number =>
          value !== undefined && value !== null && value !== "",
      ),
    [queryKey],
  );

  // Always call useInfiniteSelect hook, but conditionally enable it
  const infiniteSelect = useInfiniteSelect<T>({
    queryKey: safeQueryKey,
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

  // Use infinite loading data if enabled and available, otherwise use legacy data
  const shouldUseInfiniteLoading = useInfiniteLoading && queryKey && queryFn;
  const displayItems = shouldUseInfiniteLoading
    ? infiniteSelect.items
    : filteredItems;
  const isLoading = shouldUseInfiniteLoading
    ? infiniteSelect.isLoading
    : loading;
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

  // Legacy data loading function
  const loadData = React.useCallback(async () => {
    if (!loadItems || useInfiniteLoading) return;

    setLoading(true);
    try {
      const response = await loadItems();
      setItems(response.items);
      setFilteredItems(response.items);
    } catch (error) {
      console.error("Failed to load items:", error);
      setItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  }, [loadItems, useInfiniteLoading]);

  // Cache selected item when items are loaded
  React.useEffect(() => {
    if (value && displayItems.length > 0) {
      const selectedItem = displayItems.find((item) => item.id === value);
      if (selectedItem) {
        setCachedSelectedItem(selectedItem);
      }
    }
  }, [value, displayItems]);

  // Fetch single item by ID if it's not in the current list
  React.useEffect(() => {
    const isItemInList = displayItems.find((item) => item.id === value);
    if (value && !isItemInList && !cachedSelectedItem && getItemById) {
      const fetchItem = async () => {
        try {
          const item = await getItemById(value);
          if (item) {
            setCachedSelectedItem(item);
          }
        } catch (error) {
          console.error("Failed to fetch selected item details:", error);
        }
      };
      fetchItem();
    }
  }, [value, displayItems, cachedSelectedItem, getItemById]);

  // Clear cached item when value is cleared
  React.useEffect(() => {
    if (!value) {
      setCachedSelectedItem(null);
    }
  }, [value]);

  // Reset items when loadItems function changes (legacy mode)
  React.useEffect(() => {
    if (!useInfiniteLoading) {
      setItems([]);
      setFilteredItems([]);
    }
  }, [loadItems, useInfiniteLoading]);

  // Load data when popover opens (legacy mode)
  React.useEffect(() => {
    if (
      !useInfiniteLoading &&
      ((open && items.length === 0) || (value && items.length === 0))
    ) {
      loadData();
    }
  }, [open, loadData, items.length, value, useInfiniteLoading]);

  // Filter items based on search query (legacy mode)
  React.useEffect(() => {
    if (useInfiniteLoading) return;

    if (!searchQuery) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) => {
        const searchContent = item.name || "";
        return searchContent.toLowerCase().includes((searchQuery || "").toLowerCase());
      });
      setFilteredItems(filtered);
    }
    setSelectedIndex(-1);
  }, [items, searchQuery, displayFormatter, useInfiniteLoading]);

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

  // Reset selected index when items change
  React.useEffect(() => {
    setSelectedIndex(-1);
  }, [displayItems]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < displayItems.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : displayItems.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < displayItems.length) {
          const selectedItem = displayItems[selectedIndex];
          onValueChange(selectedItem.id === value ? "" : selectedItem.id);
          setOpen(false);
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

  const handleItemClick = (item: T) => {
    onValueChange(item.id === value ? "" : item.id);
    setOpen(false);
  };

  const handleItemMouseEnter = (index: number) => {
    setSelectedIndex(index);
  };

  // Handle scroll for infinite loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!shouldUseInfiniteLoading) return;
    infiniteSelect.handleScroll(e);
  };

  const selectedItem =
    displayItems.find((item) => item.id === value) || cachedSelectedItem;
  const displayText = selectedItem
    ? displayFormatter
      ? displayFormatter(selectedItem)
      : selectedItem.name
    : placeholder;

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
          className={cn("w-full justify-between h-auto min-h-8 px-3 py-1.5", className)}
          onKeyDown={handleKeyDown}
        >
          <span className="truncate">{displayText}</span>
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
            ) : displayItems.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-600">
                {emptyMessage}
              </div>
            ) : (
              <>
                <div className="p-1" ref={listRef}>
                  {displayItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-[var(--app-radius-sm)] px-2 py-1.5 text-sm outline-none transition-colors duration-200",
                        // Keyboard selection styling
                        selectedIndex === index
                          ? "bg-primary-soft text-primary"
                          : "text-black hover:bg-primary-soft hover:text-primary",
                      )}
                      onClick={() => handleItemClick(item)}
                      onMouseEnter={() => handleItemMouseEnter(index)}
                      onMouseLeave={() => setSelectedIndex(-1)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {displayFormatter ? displayFormatter(item) : item.name}
                    </div>
                  ))}
                </div>
                {/* Loading more indicator */}
                {isFetchingMore && <LoadingMore />}
                {/* End of list indicator */}
                {shouldUseInfiniteLoading &&
                  !hasNextPage &&
                  displayItems.length > 0 && (
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
