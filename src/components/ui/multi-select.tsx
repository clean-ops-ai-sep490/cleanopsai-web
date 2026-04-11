"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  maxDisplay?: number;
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

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery]);

  // Reset selected index when filtered options change
  React.useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredOptions]);

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
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
          const selectedOption = filteredOptions[selectedIndex];
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

  const selectedOptions = options.filter((option) =>
    safeValue.includes(option.value),
  );
  const displayOptions = selectedOptions.slice(0, maxDisplay);
  const remainingCount = selectedOptions.length - maxDisplay;

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
            "w-full justify-between h-8 px-3 py-1 text-left font-normal",
            className,
          )}
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-500 truncate">{placeholder}</span>
            ) : (
              <>
                {displayOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="text-xs bg-[#e6f3f7] text-[#1a80a2] hover:bg-[#d1ecf1] flex items-center gap-1 flex-shrink-0 max-w-[150px]"
                  >
                    <span className="truncate" title={option.label}>
                      {option.label}
                    </span>
                    <div
                      role="button"
                      tabIndex={0}
                      className="h-3 w-3 cursor-pointer flex-shrink-0 text-[#1a80a2] hover:text-red-500 transition-colors"
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
                    className="text-xs flex-shrink-0 bg-[#1a80a2] text-white hover:bg-[#308cab]"
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex h-11 w-full rounded-md bg-white py-3 text-sm text-black outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Items List */}
          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden bg-white scrollbar-primary">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-600">
                {emptyText}
              </div>
            ) : (
              <div className="p-1" ref={listRef}>
                {filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex cursor-default select-none items-start rounded-md px-2 py-1.5 text-sm outline-none transition-colors duration-200",
                      // Keyboard selection styling
                      selectedIndex === index
                        ? "bg-[#e6f3f7] text-[#1a80a2]"
                        : "text-black hover:bg-[#e6f3f7] hover:text-[#1a80a2]",
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
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium">{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-gray-500 mt-0.5">
                          {option.description}
                        </span>
                      )}
                    </div>
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
