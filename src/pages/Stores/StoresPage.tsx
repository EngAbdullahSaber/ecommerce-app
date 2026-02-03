import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Store,
  ShoppingBag,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Image as ImageIcon,
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

interface Name {
  arabic: string;
  english: string;
}

interface Description {
  arabic: string;
  english: string;
}

interface Store {
  id: number;
  image: string | null;
  logo: string | null;
  name: Name;
  description: Description;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

interface StoresResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    stores: Store[];
  };
  totalItems: number;
  totalPages: number;
}

export default function StoresPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    store: Store | null;
  }>({
    isOpen: false,
    store: null,
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
      return "/placeholder-store.png";
    }
    if (url === "undefined/images/") {
      return "/placeholder-store.png";
    }
    if (url.startsWith("http")) {
      return url;
    }
    return import.meta.env.VITE_IMAGE_BASE_URL
      ? import.meta.env.VITE_IMAGE_BASE_URL + url
      : url;
  };

  const fetchStores = async ({
    page,
    pageSize,
    searchTerm,
  }: {
    page: number;
    pageSize: number;
    searchTerm?: string;
  }): Promise<{
    data: Store[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/stores",
        page,
        pageSize,
        lang,
        searchTerm,
      )) as StoresResponse;

      const stores = response.data?.stores || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      return {
        data: stores,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching stores:", error);
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  const deleteStore = async (id: number) => {
    try {
      const response = await DeleteMethod("/stores", id.toString(), lang);

      if (response?.code === 200 || response?.code === 204) {
        return response;
      } else if (response?.message || response?.data) {
        return response;
      }

      throw new Error("Delete failed with no success indication");
    } catch (error) {
      console.error("Error in deleteStore:", error);
      throw error;
    }
  };

  const {
    data: storesResponse = {
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
    queryKey: ["stores", currentPage, rowsPerPage, debouncedSearchTerm, lang],
    queryFn: () =>
      fetchStores({
        page: currentPage,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearchTerm,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStore,
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      setDeleteDialog({ isOpen: false, store: null });
      toast.success(t("stores.messages.deleteSuccess"));
    },
    onError: (error) => {
      console.error("Error deleting store:", error);
      toast.error(t("stores.messages.deleteFailed"));
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
      key: "logo",
      label: t("stores.columns.logo"),
      width: "100px",
      render: (value: string | null) => (
        <div className="flex items-center justify-center">
          {value ? (
            <img
              src={formatImageUrl(value)}
              alt="Store Logo"
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/default/store-default.png";
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <Store size={20} className="text-slate-400 dark:text-slate-500" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: t("stores.columns.englishName"),
      render: (value: Name, row: Store) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
            <ShoppingBag
              size={18}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {value.english?.trim() || t("stores.untitledStore")}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t("common.id")}: {row.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "name",
      label: t("stores.columns.arabicName"),
      width: "150px",
      render: (value: Name) => (
        <div className="font-semibold text-slate-900 dark:text-white text-center">
          {value.arabic?.trim() || t("stores.untitledStore")}
        </div>
      ),
    },
    {
      key: "description",
      label: t("stores.columns.englishDescription"),
      width: "300px",
      render: (value: Description) => (
        <div className="text-sm text-slate-700 text-center dark:text-slate-300 line-clamp-2">
          {value.english?.trim() || t("stores.noDescription")}
        </div>
      ),
    },
    {
      key: "description",
      label: t("stores.columns.arabicDescription"),
      width: "300px",
      render: (value: Description) => (
        <div
          className="text-sm text-slate-700 dark:text-slate-300 text-center line-clamp-2"
          dir="rtl"
        >
          {value.arabic?.trim() || t("stores.noDescriptionAr")}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: t("common.created"),
      width: "150px",
      render: (value: string) => (
        <div className="flex flex-col justify-center items-center">
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
        </div>
      ),
    },
    {
      key: "id",
      label: t("common.actions"),
      width: "140px",
      render: (value: number, row: Store) => {
        if (!row) {
          return <div>{t("messages.error")}</div>;
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleAction("edit", row)}
              className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 dark:hover:from-amber-500/20 dark:hover:to-orange-500/20 text-amber-600 dark:text-amber-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-amber-200/50 dark:border-amber-500/20"
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

  const handleAction = (action: string, row: Store) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, store: row });
    } else if (action === "edit") {
      navigate(`/Stores/edit/${row.id}`);
    }
  };

  const handleCreateStore = () => {
    navigate("/Stores/create");
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
    { value: "all", label: t("stores.allStatus") },
    { value: "true", label: t("common.active") },
    { value: "false", label: t("common.inactive") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
              <ShoppingBag size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {t("stores.management")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("stores.managementSubtitle")}
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
              onClick={handleCreateStore}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus size={20} />
              {t("stores.addStore")}
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
          searchPlaceholder={t("stores.searchPlaceholder")}
          filterLabel={t("stores.columns.status")}
          filterOptions={statusOptions}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("common.loading")}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <ShoppingBag size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("stores.failedToLoad")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("stores.fetchError")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {t("stores.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && storesResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-blue-500 mb-4">
              <ShoppingBag size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("stores.noStoresFound")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearchTerm
                ? t("stores.noStoresMatch")
                : t("stores.noStoresInDB")}
            </p>
            {!debouncedSearchTerm && (
              <button
                onClick={handleCreateStore}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                {t("stores.createFirstStore")}
              </button>
            )}
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && storesResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={storesResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={storesResponse.total}
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
        onClose={() => setDeleteDialog({ isOpen: false, store: null })}
        onConfirm={() => {
          if (deleteDialog.store) {
            deleteMutation.mutate(deleteDialog.store.id);
          }
        }}
        title={t("stores.deleteConfirmTitle")}
        description={t("stores.deleteConfirmDescription")}
        itemName={
          deleteDialog.store?.name.english?.trim() || t("stores.unknownStore")
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
