"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  loadItems: (search?: string) => Promise<{ items: T[]; totalCount: number }>;
  displayFormatter?: (item: T) => string;
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
  displayFormatter,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredItems, setFilteredItems] = React.useState<T[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [cachedSelectedItem, setCachedSelectedItem] = React.useState<T | null>(
    null,
  );
  const [popoverWidth, setPopoverWidth] = React.useState<number | undefined>();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const loadData = React.useCallback(async () => {
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
  }, [loadItems]);

  // Cache selected item when items are loaded
  React.useEffect(() => {
    if (value && items.length > 0) {
      const selectedItem = items.find((item) => item.id === value);
      if (selectedItem) {
        setCachedSelectedItem(selectedItem);
      }
    }
  }, [value, items]);

  // Clear cached item when value is cleared
  React.useEffect(() => {
    if (!value) {
      setCachedSelectedItem(null);
    }
  }, [value]);

  // Reset items when loadItems function changes (e.g., when locationId changes)
  React.useEffect(() => {
    setItems([]);
    setFilteredItems([]);
  }, [loadItems]);

  React.useEffect(() => {
    if ((open && items.length === 0) || (value && items.length === 0)) {
      loadData();
    }
  }, [open, loadData, items.length, value]);

  // Filter items based on search query
  React.useEffect(() => {
    if (!searchQuery) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) => {
        const displayText = displayFormatter
          ? displayFormatter(item)
          : item.name;
        return displayText.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredItems(filtered);
    }
    // Reset selected index when items change
    setSelectedIndex(-1);
  }, [items, searchQuery, displayFormatter]);

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
          prev < filteredItems.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
          const selectedItem = filteredItems[selectedIndex];
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

  const selectedItem =
    items.find((item) => item.id === value) || cachedSelectedItem;
  const displayText = selectedItem
    ? displayFormatter
      ? displayFormatter(selectedItem)
      : selectedItem.name
    : placeholder;

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between h-8 px-3 py-1", className)}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex h-11 w-full rounded-md bg-white py-3 text-sm text-black outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Items List */}
          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden bg-white scrollbar-primary">
            {loading ? (
              <div className="py-6 text-center text-sm text-gray-600">
                Đang tải...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-600">
                {emptyMessage}
              </div>
            ) : (
              <div className="p-1" ref={listRef}>
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      "relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors duration-200",
                      // Keyboard selection styling
                      selectedIndex === index
                        ? "bg-[#e6f3f7] text-[#1a80a2]"
                        : "text-black hover:bg-[#e6f3f7] hover:text-[#1a80a2]",
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
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
