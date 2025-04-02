"use client";

import { Button } from "@/components/ui/button";
import { flexRender, type Row, type Table } from "@tanstack/react-table";
import { ArrowLeft, ArrowRight, Search, SortAsc, SortDesc } from "lucide-react";

const pageSizeOptions = [5, 10, 20, 50];

export default function ListTable<T>({
  table,
  onRowClick,
  onFilterChange,
  activeFilter,
  filterOptions,
  onSortChange,
}: {
  table: Table<T>;
  onRowClick?: (row: Row<T>) => void;
  onFilterChange?: (value: string) => void;
  activeFilter?: string;
  filterOptions?: Array<{ value: string; label: string }>;
  onSortChange?: (field: string, direction: "asc" | "desc") => void;
}) {
  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-col w-full">
      {/* Filtering and Sorting Controls */}
      <div className="mb-4 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            placeholder="Search..."
            onChange={(e) => onFilterChange?.(e.target.value)}
          />
        </div>
        
        {/* Filter categories */}
        {filterOptions && (
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <Button
                key={option.value}
                variant={activeFilter === option.value ? "default" : "outline"}
                onClick={() => onFilterChange?.(option.value)}
                className="text-sm"
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}
        
        {/* Sort buttons - example for common fields */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 mr-2">Sort by:</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSortChange?.("name", "asc")}
            className="flex items-center gap-1"
          >
            Name <SortAsc className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSortChange?.("name", "desc")}
            className="flex items-center gap-1"
          >
            Name <SortDesc className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSortChange?.("date", "desc")}
            className="flex items-center gap-1"
          >
            Newest <SortDesc className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* List-style content */}
      <div className="overflow-hidden rounded-md border border-gray-200">
        {table.getRowModel().rows.map((row) => (
          <div
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex flex-col gap-2">
              {row.getVisibleCells().map((cell) => (
                <div key={cell.id} className="min-w-0">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          size="sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm">
          {pageIndex + 1} / {Math.max(1, pageCount)}
        </span>
        
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          size="sm"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="ml-2 px-2 py-1 border rounded-md text-sm"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}