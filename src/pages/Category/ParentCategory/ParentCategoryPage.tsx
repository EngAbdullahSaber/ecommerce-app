// pages/parent-categories/index.tsx - Parent Categories Management Page
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Folder,
  Image as ImageIcon,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { DataTable } from "../../../components/shared/DataTable";
import { DeleteDialog } from "../../../components/shared/DeleteDialog";
import { useNavigate } from "react-router-dom";
import {
  GetPanigationMethod,
  DeleteMethod,
  GetPanigationMethodWithFilter,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { TableFilters } from "../../../components/shared/TableFilters";
import { useTranslation } from "react-i18next";

interface Title {
  arabic: string;
  english: string;
}

interface Category {
  id: number;
  title: Title;
  parentId: number | null;
  image: string;
  active: boolean;
  type: "PARENT" | "CHILD";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

interface CategoriesResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    categories: Category[];
  };
  totalItems: number;
  totalPages: number;
}

export default function ParentCategoriesPage() {
  const { t } = useTranslation();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({
    isOpen: false,
    category: null,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const formatImageUrl = (url: string) => {
    if (!url || url === "undefined/images/" || url.includes("undefined")) {
      return "/placeholder-category.png";
    }
    if (url.startsWith("http")) {
      return url;
    }
    return import.meta.env.VITE_IMAGE_BASE_URL
      ? `${import.meta.env.VITE_IMAGE_BASE_URL}/${url.replace(/^\/+/, "")}`
      : url;
  };

  const fetchCategories = async ({
    page,
    pageSize,
    searchTerm,
  }: {
    page: number;
    pageSize: number;
    searchTerm?: string;
  }): Promise<{
    data: Category[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const additionalParams = {
        type: "PARENT",
      };

      console.log("Fetching categories with params:", {
        page,
        pageSize,
        searchTerm,
        additionalParams,
      });

      const response = (await GetPanigationMethodWithFilter(
        "categories",
        page,
        pageSize,
        "en",
        searchTerm,
        additionalParams
      )) as CategoriesResponse;

      if (!response || response.code !== 200) {
        console.error("API response error:", response);
        throw new Error(
          response?.message?.english || t("categories.parent.page.errorMessage")
        );
      }

      const categories = response.data?.categories || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      return {
        data: categories,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(t("categories.parent.page.errorMessage"));
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      const response = await DeleteMethod("/categories", id.toString(), "en");

      if (response?.code === 200 || response?.code === 204) {
        return response;
      } else if (response?.message || response?.data) {
        return response;
      }

      throw new Error("Delete failed with no success indication");
    } catch (error) {
      console.error("Error in deleteCategory:", error);
      throw error;
    }
  };

  const {
    data: categoriesResponse = {
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
      "parent-categories",
      currentPage,
      rowsPerPage,
      debouncedSearchTerm,
    ],
    queryFn: () =>
      fetchCategories({
        page: currentPage,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearchTerm,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      queryClient.invalidateQueries({ queryKey: ["parent-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteDialog({ isOpen: false, category: null });
      toast.success(t("categories.parent.page.delete.success"));
    },
    onError: (error) => {
      console.error("Error deleting category:", error);
      toast.error(t("categories.parent.page.delete.error"));
    },
  });

  const columns = [
    {
      key: "id",
      label: t("categories.parent.page.columns.id"),
      width: "80px",
      render: (value: number) => (
        <div className="font-bold text-slate-700 dark:text-slate-300">
          #{value}
        </div>
      ),
    },
    {
      key: "title",
      label: t("categories.parent.page.columns.englishTitle"),
      render: (value: Title, row: Category) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
              <img
                src={formatImageUrl(row.image)}
                alt={value.english}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/default/parent-category-default.png";
                }}
              />
            </div>
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {value.english?.trim() || "N/A"}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t("categories.parent.page.columns.id")}: {row.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      label: t("categories.parent.page.columns.arabicTitle"),
      render: (value: Title) => (
        <div
          className="font-semibold text-slate-900 dark:text-white text-right"
          dir="rtl"
        >
          {value.arabic?.trim() || "غير متوفر"}
        </div>
      ),
    },
    {
      key: "active",
      label: t("categories.parent.page.columns.status"),
      width: "120px",
      render: (value: boolean) => (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                <Eye
                  size={14}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {t("categories.parent.page.status.active")}
              </span>
            </>
          ) : (
            <>
              <div className="p-1.5 bg-red-100 dark:bg-red-500/20 rounded-lg">
                <EyeOff size={14} className="text-red-600 dark:text-red-400" />
              </div>
              <span className="text-red-600 dark:text-red-400 font-medium">
                {t("categories.parent.page.status.inactive")}
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "type",
      label: t("categories.parent.page.columns.type"),
      width: "100px",
      render: (value: string) => {
        const typeMap: Record<string, string> = {
          PARENT: t("categories.parent.page.types.PARENT"),
          CHILD: t("categories.parent.page.types.CHILD"),
        };
        return (
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              value === "PARENT"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                : "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
            }`}
          >
            {typeMap[value] || value}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: t("categories.parent.page.columns.created"),
      width: "150px",
      render: (value: string) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 dark:text-white text-sm">
            {new Date(value).toLocaleDateString()}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(value).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "updatedAt",
      label: t("categories.parent.page.columns.lastUpdated"),
      width: "150px",
      render: (value: string) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 dark:text-white text-sm">
            {new Date(value).toLocaleDateString()}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(value).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "id",
      label: t("categories.parent.page.columns.actions"),
      width: "140px",
      render: (value: number, row: Category) => {
        if (!row) {
          return <div>Error: No data</div>;
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleAction("edit", row)}
              className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 dark:hover:from-amber-500/20 dark:hover:to-orange-500/20 text-amber-600 dark:text-amber-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-amber-200/50 dark:border-amber-500/20"
              title={t("categories.parent.page.actions.editTitle")}
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleAction("delete", row)}
              className="p-2 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 dark:from-red-500/10 dark:to-pink-500/10 dark:hover:from-red-500/20 dark:hover:to-pink-500/20 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-red-200/50 dark:border-red-500/20"
              title={t("categories.parent.page.actions.deleteTitle")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const handleAction = (action: string, row: Category) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, category: row });
    } else if (action === "edit") {
      navigate(`/parent-categories/edit/${row.id}`);
    }
  };

  const handleCreateCategory = () => {
    navigate("/parent-categories/create");
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
    setCurrentPage(1);
  };

  const filteredData = categoriesResponse.data.filter((category) => {
    if (statusFilter === "active") return category.active === true;
    if (statusFilter === "inactive") return category.active === false;
    return true;
  });

  useEffect(() => {
    if (!isLoading && !isError) {
      console.log("Current categories data:", categoriesResponse.data);
    }
  }, [isLoading, isError, categoriesResponse.data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
              <Folder size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {t("categories.parent.page.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("categories.parent.page.description")}
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
              {t("categories.parent.page.refresh")}
            </button>

            <button
              onClick={handleCreateCategory}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus size={20} />
              {t("categories.parent.page.addCategory")}
            </button>
          </div>
        </div>

        {/* Filters */}
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          show={true}
          onStatusFilter={setStatusFilter}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
          onClearFilters={clearFilters}
          searchPlaceholder={t("categories.parent.page.searchPlaceholder")}
          filterOptions={[
            { value: "all", label: t("categories.parent.page.filters.all") },
            {
              value: "active",
              label: t("categories.parent.page.filters.status.active"),
            },
            {
              value: "inactive",
              label: t("categories.parent.page.filters.status.inactive"),
            },
          ]}
          filterLabel={t("categories.parent.page.filters.status.label")}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("categories.parent.page.loading")}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <Folder size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("categories.parent.page.errorTitle")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("categories.parent.page.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {t("categories.parent.page.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && categoriesResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-blue-500 mb-4">
              <Folder size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("categories.parent.page.noCategories")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearchTerm
                ? t("categories.parent.page.noMatch")
                : t("categories.parent.page.emptyList")}
            </p>
            {!debouncedSearchTerm && (
              <button
                onClick={handleCreateCategory}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                {t("categories.parent.page.addFirstCategory")}
              </button>
            )}
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && categoriesResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredData}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={categoriesResponse.total}
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
        onClose={() => setDeleteDialog({ isOpen: false, category: null })}
        onConfirm={() => {
          if (deleteDialog.category) {
            deleteMutation.mutate(deleteDialog.category.id);
          }
        }}
        title={t("categories.parent.page.delete.title")}
        description={t("categories.parent.page.delete.description")}
        itemName={
          deleteDialog.category?.title.english?.trim() ||
          t("categories.parent.page.delete.title")
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
