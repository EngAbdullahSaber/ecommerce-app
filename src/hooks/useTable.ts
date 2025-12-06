// hooks/useTable.ts
import { useState, useMemo } from "react";

interface UseTableProps {
  initialData: any[];
  initialRowsPerPage?: number;
  initialPage?: number;
}

export function useTable({
  initialData,
  initialRowsPerPage = 5,
  initialPage = 1,
}: UseTableProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      const matchesSearch = Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialData, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return {
    // State
    currentPage,
    rowsPerPage,
    searchTerm,
    statusFilter,
    showFilters,

    // Data
    filteredData: currentData,
    totalItems: filteredData.length,

    // Actions
    setCurrentPage: goToPage,
    setRowsPerPage: handleRowsPerPageChange,
    setSearchTerm: handleSearchChange,
    setStatusFilter: handleStatusFilter,
    setShowFilters,
    clearFilters,

    // Utilities
    hasActiveFilters: searchTerm !== "" || statusFilter !== "all",
    totalPages,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, filteredData.length),
  };
}
