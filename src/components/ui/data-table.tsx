"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PaginationWithInfo } from "@/components/ui/pagination";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableProps<T> {
  columns: {
    header: string;
    accessorKey?: keyof T | string;
    cell?: (item: T) => React.ReactNode;
    className?: string;
    headerClassName?: string;
  }[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  
  // Selection
  selection?: {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    idKey: keyof T | string;
  };

  // Search
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  
  // Filters & Actions
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  
  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalElements: number;
    onPageChange: (page: number) => void;
  };
  
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = "Không có dữ liệu hiển thị",
  selection,
  search,
  filters,
  actions,
  pagination,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const isAllSelected = selection && data.length > 0 && data.every(item => 
    selection.selectedIds.includes(String(item[selection.idKey as keyof T]))
  );

  const toggleAll = () => {
    if (!selection) return;
    if (isAllSelected) {
      selection.onSelectionChange([]);
    } else {
      selection.onSelectionChange(data.map(item => String(item[selection.idKey as keyof T])));
    }
  };

  const toggleOne = (id: string) => {
    if (!selection) return;
    if (selection.selectedIds.includes(id)) {
      selection.onSelectionChange(selection.selectedIds.filter(i => i !== id));
    } else {
      selection.onSelectionChange([...selection.selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header: Search & Filters ─── */}
      {(search || filters || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            {search && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input
                  placeholder={search.placeholder || "Tìm kiếm..."}
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  className="pl-10 h-11 bg-white border-slate-200/60 shadow-none focus:border-slate-300 rounded-xl"
                />
                {search.value && (
                  <button 
                    onClick={() => search.onChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
            {filters && <div className="flex items-center gap-2">{filters}</div>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* ─── Table Body ─── */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-none transition-all">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/30 border-b border-slate-100">
              {selection && (
                <TableHead className="w-12 pl-6">
                  <Checkbox 
                    checked={isAllSelected} 
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
              )}
              {columns.map((col, i) => (
                <TableHead key={i} className={cn("text-[11px] font-bold uppercase tracking-wider text-slate-400 py-4", col.headerClassName)}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-slate-50 last:border-0">
                  {selection && <TableCell className="pl-6"><div className="h-4 w-4 animate-pulse rounded bg-slate-100" /></TableCell>}
                  {columns.map((_, j) => (
                    <TableCell key={j} className="py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-50" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selection ? 1 : 0)} className="h-32 text-center text-slate-400 italic">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, i) => {
                const id = selection ? String(item[selection.idKey as keyof T]) : "";
                const isSelected = selection && selection.selectedIds.includes(id);

                return (
                  <TableRow
                    key={i}
                    className={cn(
                      "group border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors duration-200",
                      isSelected && "bg-blue-50/30",
                      onRowClick && "cursor-pointer",
                      rowClassName?.(item)
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selection && (
                      <TableCell className="w-12 pl-6" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={isSelected} 
                          onCheckedChange={() => toggleOne(id)}
                        />
                      </TableCell>
                    )}
                    {columns.map((col, j) => (
                      <TableCell key={j} className={cn("py-4 text-slate-600", col.className)}>
                        {col.cell ? col.cell(item) : (col.accessorKey ? (item[col.accessorKey as keyof T] as any) : null)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Footer: Pagination ─── */}
      {pagination && (
        <PaginationWithInfo
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          totalElements={pagination.totalElements}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
