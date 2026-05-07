"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className,
}: PaginationProps) {
  // Calculate visible page numbers
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const showStartEllipsis = visiblePages[0] > 2;
  const showEndEllipsis =
    visiblePages[visiblePages.length - 1] < totalPages - 1;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
    >
      <div className="flex flex-row items-center gap-1">
        {/* Previous page button */}
        {showPrevNext && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="h-8 w-8 p-0"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Start ellipsis */}
        {showStartEllipsis && (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="h-8 w-8 p-0"
            aria-label="More pages"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}

        {/* Page numbers */}
        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={cn(
              "h-8 w-8 p-0",
              page === currentPage && "bg-primary hover:bg-primary/90",
            )}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        ))}

        {/* End ellipsis */}
        {showEndEllipsis && (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="h-8 w-8 p-0"
            aria-label="More pages"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}

        {/* Next page button */}
        {showPrevNext && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 p-0"
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </nav>
  );
}

// Pagination info component
export interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  pageSize,
  totalElements,
  className,
}: PaginationInfoProps) {
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalElements);
  const endItem = Math.min(currentPage * pageSize, totalElements);

  return (
    <div className={cn("text-sm text-gray-500", className)}>
      Hiển thị {startItem} - {endItem} trong tổng số {totalElements} kết quả
    </div>
  );
}

// Combined pagination component with info
export interface PaginationWithInfoProps extends PaginationProps {
  pageSize: number;
  totalElements: number;
  showInfo?: boolean;
}

export function PaginationWithInfo({
  currentPage,
  totalPages,
  pageSize,
  totalElements,
  onPageChange,
  showInfo = true,
  className,
  ...paginationProps
}: PaginationWithInfoProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {showInfo && (
        <PaginationInfo
          currentPage={currentPage}
          pageSize={pageSize}
          totalElements={totalElements}
        />
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        {...paginationProps}
      />
    </div>
  );
}
