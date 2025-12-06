// components/DataTable.tsx - With Scrollable Table
import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  Download,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  currentPage: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  onAction?: (action: string, row: any) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  emptyState?: React.ReactNode;
  showPagination?: boolean;
  loading?: boolean;
  title?: string;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  maxHeight?: string; // Optional: control max height
}

export function DataTable({
  columns,
  data,
  currentPage,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onAdd,
  onRefresh,
  onExport,
  emptyState,
  showPagination = true,
  loading = false,
  title,
  searchable = false,
  onSearch,
}: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

  const handleSort = (key: string) => {
    if (!onSort) return;

    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
    onSort(key, direction);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const defaultEmptyState = (
    <tr>
      <td colSpan={columns.length} className="px-6 py-20">
        <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30 shadow-xl">
              <Search
                className="text-blue-500 dark:text-blue-400"
                size={48}
                strokeWidth={1.5}
              />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Sparkles size={16} className="text-white" />
            </div>
          </div>

          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              No data found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              {searchQuery
                ? "No results match your search. Try different keywords."
                : "Get started by adding your first item."}
            </p>
          </div>

          {onAdd && (
            <button
              onClick={onAdd}
              className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white font-semibold rounded-xl transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ backgroundSize: "200% auto" }}
            >
              <Plus
                size={18}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
              Add New Item
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  const renderCell = (column: Column, row: any) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return row[column.key];
  };

  const goToPage = (page: number) => {
    onPageChange(Math.max(1, Math.min(page, totalPages)));
  };

  const getAlignmentClass = (align?: string) => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500" />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

        {/* Header Section */}
        {(title || searchable || onAdd || onRefresh || onExport) && (
          <div className="relative px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {title && (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                      {title}
                    </h2>
                    <div className="absolute -bottom-1 left-0 w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                  </div>
                  {loading && (
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <RefreshCw
                        size={16}
                        className="text-blue-600 dark:text-blue-400 animate-spin"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {searchable && (
                  <div className="relative group/search">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover/search:opacity-20 blur transition-all duration-300" />
                    <div className="relative flex items-center">
                      <Search
                        size={18}
                        className="absolute left-4 text-slate-400 group-hover/search:text-blue-600 transition-colors duration-300"
                      />
                      <input
                        type="text"
                        placeholder="Search anything..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full sm:w-80 pl-12 pr-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {onExport && (
                    <button
                      onClick={onExport}
                      className="group/btn inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <Download
                        size={16}
                        className="group-hover/btn:scale-110 transition-transform duration-300"
                      />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  )}
                  {onRefresh && (
                    <button
                      onClick={onRefresh}
                      disabled={loading}
                      className="p-3 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-purple-500/50 disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md disabled:cursor-not-allowed group"
                    >
                      <RefreshCw
                        size={16}
                        className={
                          loading
                            ? "animate-spin"
                            : "group-hover:rotate-180 transition-transform duration-500"
                        }
                      />
                    </button>
                  )}
                  {onAdd && (
                    <button
                      onClick={onAdd}
                      className="group/add inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105"
                      style={{ backgroundSize: "200% auto" }}
                    >
                      <Plus
                        size={16}
                        className="group-hover/add:rotate-90 transition-transform duration-300"
                      />
                      <span className="hidden sm:inline">Add New</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Table Container */}
        <div className="overflow-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-slate-100/95 via-blue-50/95 to-purple-50/95 dark:from-slate-800/95 dark:via-blue-900/30 dark:to-purple-900/30 backdrop-blur-sm border-b-2 border-slate-200/80 dark:border-slate-700/80 shadow-sm">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ${getAlignmentClass(
                      column.align
                    )}`}
                    style={{ width: column.width }}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        column.align === "right"
                          ? "justify-end"
                          : column.align === "center"
                          ? "justify-center"
                          : "justify-start"
                      }`}
                    >
                      {column.label}
                      {column.sortable && onSort && (
                        <button
                          onClick={() => handleSort(column.key)}
                          className={`group/sort p-2 hover:bg-white/80 dark:hover:bg-slate-700/60 rounded-lg transition-all duration-300 ${
                            sortConfig?.key === column.key
                              ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 shadow-sm"
                              : ""
                          }`}
                        >
                          <ArrowUpDown
                            size={14}
                            className={`transition-all duration-300 ${
                              sortConfig?.key === column.key
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-slate-400 group-hover/sort:text-slate-600 dark:group-hover/sort:text-slate-300"
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      {columns.map((column, colIndex) => (
                        <td key={column.key} className="px-6 py-5">
                          <div
                            className={`h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg animate-pulse ${
                              colIndex === 0 ? "w-32" : "w-24"
                            }`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                : data.length > 0
                ? data.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className="group/row relative hover:bg-gradient-to-r hover:from-blue-50/30 hover:via-purple-50/20 hover:to-transparent dark:hover:from-blue-900/10 dark:hover:via-purple-900/10 dark:hover:to-transparent transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500"
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={column.key}
                          className={`px-6 py-5 text-sm text-slate-700 dark:text-slate-300 ${
                            colIndex === 0
                              ? "font-semibold text-slate-900 dark:text-white"
                              : ""
                          } ${getAlignmentClass(
                            column.align
                          )} transition-all duration-300 group-hover/row:translate-x-1`}
                        >
                          {renderCell(column, row)}
                        </td>
                      ))}
                    </tr>
                  ))
                : emptyState || defaultEmptyState}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && data.length > 0 && (
          <div className="px-6 py-5 border-t border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/30 dark:to-slate-900/30 backdrop-blur-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {startIndex + 1}-{endIndex}
                  </p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  of{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {totalItems.toLocaleString()}
                  </span>{" "}
                  results
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                    Rows per page
                  </span>
                  <div className="relative group/select">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover/select:opacity-20 blur transition-all duration-300" />
                    <select
                      value={rowsPerPage}
                      onChange={(e) =>
                        onRowsPerPageChange(Number(e.target.value))
                      }
                      className="relative appearance-none pl-4 pr-10 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
                      disabled={loading}
                    >
                      {[5, 10, 15, 20, 50, 100].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-slate-500 dark:text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1 || loading}
                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md disabled:hover:bg-transparent disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300"
                  >
                    <ChevronsLeft size={16} />
                  </button>

                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md disabled:hover:bg-transparent disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (page >= currentPage - 1 && page <= currentPage + 1)
                          return true;
                        return false;
                      })
                      .map((page, index, array) => {
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-2 text-slate-400 dark:text-slate-500 text-sm font-medium">
                                ···
                              </span>
                            )}
                            <button
                              onClick={() => goToPage(page)}
                              disabled={loading}
                              className={`min-w-[44px] h-[44px] px-4 text-sm font-semibold rounded-xl transition-all duration-300 shadow-sm ${
                                currentPage === page
                                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white shadow-lg scale-110"
                                  : "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-blue-500/50 hover:scale-105"
                              }`}
                              style={
                                currentPage === page
                                  ? { backgroundSize: "200% auto" }
                                  : {}
                              }
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md disabled:hover:bg-transparent disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages || loading}
                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md disabled:hover:bg-transparent disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgb(203 213 225);
          border-radius: 9999px;
        }
        
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgb(71 85 105);
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: rgb(148 163 184);
        }
        
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: rgb(100 116 139);
        }
      `}</style>
    </div>
  );
}
