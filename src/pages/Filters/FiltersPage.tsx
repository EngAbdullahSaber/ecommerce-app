// pages/filters/index.tsx - Filters Management Page
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Tag,
  List,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { DataTable } from "../../components/shared/DataTable";
import { DeleteDialog } from "../../components/shared/DeleteDialog";
import { useNavigate } from "react-router-dom";
import {
  GetPanigationMethod,
  DeleteMethod,
} from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { TableFilters } from "../../components/shared/TableFilters";
import { useTranslation } from "react-i18next";

interface FilterOption {
  id: number;
  attributeId: number;
  value: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface FilterAttribute {
  id: number;
  key: string;
  name: string;
  sourcePath: string | null;
  isActive: boolean;
  options: FilterOption[];
  _count: {
    categories: number;
    values: number;
  };
}

interface FiltersResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: FilterAttribute[];
  totalItems: number;
  totalPages: number;
}

export default function FiltersPage() {
  const { t } = useTranslation();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    filter: FilterAttribute | null;
  }>({
    isOpen: false,
    filter: null,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchFilters = async ({
    page,
    pageSize,
    searchTerm,
  }: {
    page: number;
    pageSize: number;
    searchTerm?: string;
  }): Promise<{
    data: FilterAttribute[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/filter-attributes",
        page,
        pageSize,
        "en",
        searchTerm,
      )) as FiltersResponse;

      const filters = response.data || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      console.log("API Response:", response);
      console.log("Filters data:", filters);

      // Apply additional filters based on UI selections
      let filteredFilters = filters;

      if (statusFilter !== "all") {
        const isActive = statusFilter === "active";
        filteredFilters = filteredFilters.filter(
          (filter) => filter.isActive === isActive,
        );
      }

      return {
        data: filteredFilters,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching filters:", error);
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  const deleteFilter = async (id: number) => {
    try {
      const response = await DeleteMethod(
        "/filter-attributes",
        id.toString(),
        "en",
      );

      if (response?.code === 200 || response?.code === 204) {
        return response;
      } else if (response?.message || response?.data) {
        return response;
      }

      throw new Error("Delete failed with no success indication");
    } catch (error) {
      console.error("Error in deleteFilter:", error);
      throw error;
    }
  };

  const {
    data: filtersResponse = {
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    },
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "filters",
      currentPage,
      rowsPerPage,
      debouncedSearchTerm,
      statusFilter,
    ],
    queryFn: () =>
      fetchFilters({
        page: currentPage,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearchTerm,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFilter,
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      queryClient.invalidateQueries({ queryKey: ["filters"] });
      setDeleteDialog({ isOpen: false, filter: null });
      toast.success(t("filters.page.delete.success"));
    },
    onError: (error) => {
      console.error("Error deleting filter:", error);
      toast.error(t("filters.page.delete.error"));
    },
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "from-emerald-500 to-green-600"
      : "from-amber-500 to-orange-600";
  };

  const getOptionsCountColor = (count: number) => {
    if (count === 0) return "from-slate-400 to-slate-500";
    if (count <= 5) return "from-blue-500 to-indigo-600";
    if (count <= 10) return "from-purple-500 to-violet-600";
    return "from-pink-500 to-rose-600";
  };

  const columns = [
    {
      key: "id",
      label: t("filters.page.columns.id"),
      width: "80px",
      render: (value: number) => (
        <div className="font-bold text-slate-700 dark:text-slate-300">
          #{value}
        </div>
      ),
    },
    {
      key: "name",
      label: t("filters.page.columns.filter"),
      render: (value: string, row: FilterAttribute) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 rounded-lg">
            <Filter
              size={18}
              className="text-purple-600 dark:text-purple-400"
            />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {row.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                Key: {row.key}
              </span>
              {row.sourcePath && (
                <span className="bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded truncate max-w-[200px]">
                  Source: {row.sourcePath}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "isActive",
      label: t("filters.page.columns.status"),
      width: "120px",
      render: (value: boolean) => (
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getStatusColor(
            value,
          )}`}
        >
          {value
            ? t("filters.page.status.active")
            : t("filters.page.status.inactive")}
        </div>
      ),
    },
    {
      key: "options",
      label: t("filters.page.columns.options"),
      width: "150px",
      render: (value: FilterOption[], row: FilterAttribute) => (
        <div className="flex items-center justify-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${getOptionsCountColor(
              value.length,
            )}`}
          >
            {value.length} {t("filters.page.columns.optionsCount")}
          </div>
        </div>
      ),
    },

    {
      key: "id",
      label: t("filters.page.columns.actions"),
      width: "140px",
      render: (value: number, row: FilterAttribute) => {
        if (!row) {
          return <div>Error: No data</div>;
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleAction("edit", row)}
              className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 dark:hover:from-amber-500/20 dark:hover:to-orange-500/20 text-amber-600 dark:text-amber-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-amber-200/50 dark:border-amber-500/20"
              title={t("filters.page.actions.editTitle")}
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleAction("view-options", row)}
              className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-500/10 dark:to-indigo-500/10 dark:hover:from-blue-500/20 dark:hover:to-indigo-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-blue-200/50 dark:border-blue-500/20"
              title={t("filters.page.actions.viewOptionsTitle")}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => handleAction("delete", row)}
              className="p-2 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 dark:from-red-500/10 dark:to-pink-500/10 dark:hover:from-red-500/20 dark:hover:to-pink-500/20 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-red-200/50 dark:border-red-500/20"
              title={t("filters.page.actions.deleteTitle")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const handleAction = (action: string, row: FilterAttribute) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, filter: row });
    } else if (action === "edit") {
      navigate(`/filters/edit/${row.id}`);
    } else if (action === "view-options") {
      navigate(`/filters/view/${row.id}`);
    }
  };

  const handleCreateFilter = () => {
    navigate("/filters/create");
  };

  const handleRefresh = () => {
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  // Log data for debugging
  useEffect(() => {
    if (!isLoading && !isError) {
      console.log("Current filters data:", filtersResponse.data);
    }
  }, [isLoading, isError, filtersResponse.data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-violet-50/30 dark:from-slate-900 dark:via-purple-900/20 dark:to-violet-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl">
              <Filter size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-violet-900 dark:from-slate-100 dark:via-purple-100 dark:to-violet-100 bg-clip-text text-transparent">
                {t("filters.page.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("filters.page.description")}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw
                size={18}
                className={isLoading ? "animate-spin" : ""}
              />
              {t("filters.page.refresh")}
            </button>

            <button
              onClick={handleCreateFilter}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus size={20} />
              {t("filters.page.addFilter")}
            </button>
          </div>
        </div>

        {/* Filters */}
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          showFilters={showFilters}
          show={false}
          onShowFiltersChange={setShowFilters}
          onClearFilters={clearFilters}
          searchPlaceholder={t("filters.page.searchPlaceholder")}
          filterOptions={[]}
          filterLabel={t("filters.page.filters.status.label")}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("filters.page.loading")}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <Filter size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("filters.page.errorTitle")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("filters.page.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              {t("filters.page.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filtersResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-purple-500 mb-4">
              <Filter size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("filters.page.noFilters")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearchTerm
                ? t("filters.page.noMatch")
                : t("filters.page.emptyList")}
            </p>
            {!debouncedSearchTerm && (
              <button
                onClick={handleCreateFilter}
                className="px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
              >
                {t("filters.page.addFirstFilter")}
              </button>
            )}
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && filtersResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={filtersResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={filtersResponse.total}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, filter: null })}
        onConfirm={() => {
          if (deleteDialog.filter) {
            deleteMutation.mutate(deleteDialog.filter.id);
          }
        }}
        title={t("filters.page.delete.title")}
        description={t("filters.page.delete.description")}
        itemName={deleteDialog.filter?.name}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
