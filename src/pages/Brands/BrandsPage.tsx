// pages/brands/index.tsx - Brands Management Page
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tag,
  ShoppingBag,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Star,
  Award,
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

interface Title {
  arabic: string;
  english: string;
}

interface Description {
  arabic: string;
  english: string;
}

interface CreatedBy {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Brand {
  id: number;
  title: Title;
  image: string | null;
  description: Description;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
  createdBy?: CreatedBy;
  _count?: {
    banners: number;
  };
}

interface BrandsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    brands: Brand[];
  };
  totalItems: number;
  totalPages: number;
}

export default function BrandsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    brand: Brand | null;
  }>({
    isOpen: false,
    brand: null,
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

  const formatImageUrl = (url: string | null) => {
    if (!url) {
      return "/placeholder-brand.png";
    }
    if (url === "undefined/images/") {
      return "/placeholder-brand.png";
    }
    if (url.startsWith("http")) {
      return url;
    }
    return import.meta.env.VITE_IMAGE_BASE_URL
      ? import.meta.env.VITE_IMAGE_BASE_URL + url
      : url;
  };

  const fetchBrands = async ({
    page,
    pageSize,
    searchTerm,
  }: {
    page: number;
    pageSize: number;
    searchTerm?: string;
  }): Promise<{
    data: Brand[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/brands",
        page,
        pageSize,
        lang,
        searchTerm,
      )) as BrandsResponse;

      const brands = response.data?.brands || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      return {
        data: brands,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching brands:", error);
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  const deleteBrand = async (id: number) => {
    try {
      const response = await DeleteMethod("/brands", id.toString(), lang);

      if (response?.code === 200 || response?.code === 204) {
        return response;
      } else if (response?.message || response?.data) {
        return response;
      }

      throw new Error("Delete failed with no success indication");
    } catch (error) {
      console.error("Error in deleteBrand:", error);
      throw error;
    }
  };

  const {
    data: brandsResponse = {
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
    queryKey: ["brands", currentPage, rowsPerPage, debouncedSearchTerm, lang],
    queryFn: () =>
      fetchBrands({
        page: currentPage,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearchTerm,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setDeleteDialog({ isOpen: false, brand: null });
      toast.success(t("brands.messages.deleteSuccess"));
    },
    onError: (error) => {
      console.error("Error deleting brand:", error);
      toast.error(t("brands.messages.deleteFailed"));
    },
  });

  const columns = [
    {
      key: "id",
      label: t("common.id"),
      width: "80px",
      render: (value: number) => (
        <div className="font-bold text-slate-700 dark:text-slate-300">
          #{value}
        </div>
      ),
    },
    {
      key: "image",
      label: t("brands.columns.logo"),
      width: "100px",
      render: (value: string | null) => (
        <div className="flex items-center justify-center">
          {value ? (
            <img
              src={formatImageUrl(value)}
              alt={t("brands.columns.logo")}
              className="w-20 h-12 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/default/placeholder-brand.jpg";
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border-2 border-amber-200 dark:border-amber-500/20 flex items-center justify-center shadow-sm">
              <Award size={24} className="text-amber-500 dark:text-amber-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "title",
      label: t("brands.columns.englishTitle"),
      width: "150px",

      render: (value: Title, row: Brand) => (
        <div className="flex items-center gap-3">
          <div className=" bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-lg">
            <Tag size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {value.english?.trim() || t("brands.untitledBrand")}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t("common.id")}: {row.id}
            </div>
            {row._count?.banners !== undefined && (
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                {row._count.banners} {t("brands.columns.banners")}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "title",
      label: t("brands.columns.arabicTitle"),
      width: "100px",

      render: (value: Title) => (
        <div className="font-semibold text-slate-900 dark:text-white text-center">
          {value.arabic?.trim() || t("brands.untitledBrand")}
        </div>
      ),
    },
    {
      key: "description",
      label: t("brands.columns.englishDescription"),
      width: "300px",
      render: (value: Description) => (
        <div className="text-sm text-slate-700 dark:text-slate-300 text-center line-clamp-2">
          {value.english?.trim() || t("brands.noDescription")}
        </div>
      ),
    },
    {
      key: "description",
      label: t("brands.columns.arabicDescription"),
      width: "300px",
      render: (value: Description) => (
        <div
          className="text-sm text-slate-700 dark:text-slate-300 text-center line-clamp-2"
          dir="rtl"
        >
          {value.arabic?.trim() || t("brands.noDescriptionAr")}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: t("common.created"),
      width: "180px",
      render: (value: string, row: Brand) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 dark:text-white text-sm">
            {new Date(value).toLocaleDateString(
              lang === "ar" ? "ar-SA" : "en-US",
            )}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(value).toLocaleTimeString(
              lang === "ar" ? "ar-SA" : "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
          </span>
          {row.createdBy && (
            <span className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {t("common.by")}: {row.createdBy.firstName}{" "}
              {row.createdBy.lastName}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "id",
      label: t("common.actions"),
      width: "140px",
      render: (value: number, row: Brand) => {
        if (!row) {
          return <div>{t("messages.error")}</div>;
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleAction("edit", row)}
              className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-500/10 dark:to-indigo-500/10 dark:hover:from-blue-500/20 dark:hover:to-indigo-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-blue-200/50 dark:border-blue-500/20"
              title={t("common.edit")}
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleAction("delete", row)}
              className="p-2 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 dark:from-red-500/10 dark:to-pink-500/10 dark:hover:from-red-500/20 dark:hover:to-pink-500/20 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-red-200/50 dark:border-red-500/20"
              title={t("common.delete")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const handleAction = (action: string, row: Brand) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, brand: row });
    } else if (action === "edit") {
      navigate(`/brands/edit/${row.id}`);
    }
  };

  const handleCreateBrand = () => {
    navigate("/brands/create");
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

  // Filter options
  const statusOptions = [
    { value: "all", label: t("brands.allStatus") },
    { value: "true", label: t("common.active") },
    { value: "false", label: t("common.inactive") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/30 dark:from-slate-900 dark:via-amber-900/20 dark:to-orange-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl">
              <Award size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 dark:from-slate-100 dark:via-amber-100 dark:to-orange-100 bg-clip-text text-transparent">
                {t("brands.management")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("brands.managementSubtitle")}
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
              {t("common.refresh")}
            </button>

            <button
              onClick={handleCreateBrand}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus size={20} />
              {t("brands.addBrand")}
            </button>
          </div>
        </div>

        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          show={false}
          onStatusFilter={setStatusFilter}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
          onClearFilters={clearFilters}
          searchPlaceholder={t("brands.searchPlaceholder")}
          filterLabel={t("brands.columns.status")}
          filterOptions={statusOptions}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("common.loading")}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <Tag size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("brands.failedToLoad")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("brands.fetchError")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
            >
              {t("brands.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && brandsResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-amber-500 mb-4">
              <Award size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("brands.noBrandsFound")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearchTerm
                ? t("brands.noBrandsMatch")
                : t("brands.noBrandsInDB")}
            </p>
            {!debouncedSearchTerm && (
              <button
                onClick={handleCreateBrand}
                className="px-6 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
              >
                {t("brands.createFirstBrand")}
              </button>
            )}
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && brandsResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={brandsResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={brandsResponse.total}
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
        onClose={() => setDeleteDialog({ isOpen: false, brand: null })}
        onConfirm={() => {
          if (deleteDialog.brand) {
            deleteMutation.mutate(deleteDialog.brand.id);
          }
        }}
        title={t("brands.deleteConfirmTitle")}
        description={t("brands.deleteConfirmDescription")}
        itemName={
          deleteDialog.brand?.title.english?.trim() || t("brands.unknownBrand")
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
