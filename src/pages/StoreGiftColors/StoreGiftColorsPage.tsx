import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gift, Edit, Trash2, Plus, RefreshCw, Palette } from "lucide-react";
import { DataTable } from "../../components/shared/DataTable";
import { DeleteDialog } from "../../components/shared/DeleteDialog";
import { useNavigate } from "react-router-dom";
import {
  GetPanigationMethodWithFilter,
  GetPanigationMethod,
  DeleteMethod,
  UpdateMethod,
} from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { formatImageUrl } from "../../services/utils";
import { TableFilters } from "../../components/shared/TableFilters";
import { useTranslation } from "react-i18next";

interface LocalizedName {
  arabic: string;
  english: string;
}

interface StoreRef {
  id: number;
  name: LocalizedName;
}

interface StoreGiftColor {
  id: number;
  storeId: number;
  name: LocalizedName;
  hexCode: string | null;
  image: string | null;
  fee: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  store?: StoreRef;
}

interface StoreGiftColorsResponse {
  code: number;
  message: LocalizedName;
  data: {
    colors: StoreGiftColor[];
  };
  totalItems: number;
  totalPages: number;
}

export default function StoreGiftColorsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    color: StoreGiftColor | null;
  }>({ isOpen: false, color: null });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: storesData } = useQuery({
    queryKey: ["stores-for-gift-filter", lang],
    queryFn: () => GetPanigationMethod("/stores", 1, 200, lang, ""),
    staleTime: 10 * 60 * 1000,
  });

  const fetchStoreGiftColors = async ({
    page,
    pageSize,
    search,
    storeId,
    isActive,
  }: {
    page: number;
    pageSize: number;
    search?: string;
    storeId?: string;
    isActive?: string;
  }) => {
    const additionalParams: Record<string, string> = {};
    if (search?.trim()) additionalParams.search = search.trim();
    if (storeId) additionalParams.storeId = storeId;
    if (isActive && isActive !== "all") additionalParams.isActive = isActive;

    const response = (await GetPanigationMethodWithFilter(
      "store-gift-colors",
      page,
      pageSize,
      lang,
      undefined,
      additionalParams,
    )) as StoreGiftColorsResponse;

    return {
      data: response.data?.colors || [],
      total: response.totalItems || 0,
      totalPages: response.totalPages || 0,
      page,
      pageSize,
    };
  };

  const {
    data: colorsResponse = {
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
      "storeGiftColors",
      currentPage,
      rowsPerPage,
      debouncedSearchTerm,
      storeFilter,
      statusFilter,
      lang,
    ],
    queryFn: () =>
      fetchStoreGiftColors({
        page: currentPage,
        pageSize: rowsPerPage,
        search: debouncedSearchTerm,
        storeId: storeFilter || undefined,
        isActive: statusFilter,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const deleteColorMutation = useMutation({
    mutationFn: (id: number) =>
      DeleteMethod("/store-gift-colors", id.toString(), lang),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storeGiftColors"] });
      setDeleteDialog({ isOpen: false, color: null });
      toast.success(t("storeGiftColors.messages.deleteSuccess"));
    },
    onError: () => {
      toast.error(t("storeGiftColors.messages.deleteFailed"));
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      UpdateMethod("/store-gift-colors", { isActive }, id.toString(), lang),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storeGiftColors"] });
    },
    onError: () => {
      toast.error(t("storeGiftColors.messages.updateFailed"));
    },
  });

  const handleAction = (action: string, row: StoreGiftColor) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, color: row });
    } else if (action === "edit") {
      navigate(`/store-gift-colors/edit/${row.id}`);
    }
  };

  const getColorName = (color: StoreGiftColor) =>
    lang === "ar" ? color.name?.arabic?.trim() : color.name?.english?.trim();

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
      key: "store",
      label: t("storeGiftColors.columns.store"),
      render: (value: StoreRef | undefined) => (
        <div className="font-medium text-slate-800 dark:text-slate-200">
          {value?.name
            ? (lang === "ar" ? value.name.arabic : value.name.english) ||
              t("common.na")
            : t("common.na")}
        </div>
      ),
    },
    {
      key: "hexCode",
      label: t("storeGiftColors.columns.colorSwatch"),
      width: "110px",
      render: (value: string | null, row: StoreGiftColor) => (
        <div className="flex items-center gap-2 justify-center">
          {value ? (
            <div
              className="w-9 h-9 rounded-lg border-2 border-white dark:border-slate-600 shadow-md flex-shrink-0"
              style={{ backgroundColor: value }}
              title={value}
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-slate-300 dark:border-slate-600">
              <Palette size={14} className="text-slate-400" />
            </div>
          )}
          {row.image && (
            <img
              src={formatImageUrl(row.image)}
              alt={getColorName(row) || "color"}
              className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: t("storeGiftColors.columns.nameEnglish"),
      render: (value: LocalizedName) => (
        <div className="font-semibold text-slate-900 dark:text-white">
          {value?.english?.trim() || t("storeGiftColors.untitledColor")}
        </div>
      ),
    },
    {
      key: "name",
      label: t("storeGiftColors.columns.nameArabic"),
      render: (value: LocalizedName) => (
        <div
          className="font-semibold text-slate-900 dark:text-white text-center"
          dir="rtl"
        >
          {value?.arabic?.trim() || t("storeGiftColors.untitledColor")}
        </div>
      ),
    },
    {
      key: "fee",
      label: t("storeGiftColors.columns.fee"),
      width: "110px",
      render: (value: string) => (
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {parseFloat(value || "0").toFixed(2)} {t("common.currency")}
        </div>
      ),
    },

    {
      key: "sortOrder",
      label: t("storeGiftColors.columns.sortOrder"),
      width: "100px",
      render: (value: number) => (
        <div className="text-center text-sm font-medium text-slate-700 dark:text-slate-300">
          {value}
        </div>
      ),
    },
    {
      key: "id",
      label: t("common.actions"),
      width: "140px",
      render: (value: number, row: StoreGiftColor) => {
        if (!row) return <div>{t("messages.error")}</div>;
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

  const statusOptions = [
    { value: "all", label: t("storeGiftColors.allStatus") },
    { value: "true", label: t("common.active") },
    { value: "false", label: t("common.inactive") },
  ];

  const stores: StoreRef[] = storesData?.data?.stores || [];

  const clearFilters = () => {
    setSearchTerm("");
    setStoreFilter("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    debouncedSearchTerm || storeFilter || statusFilter !== "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/30 to-rose-50/30 dark:from-slate-900 dark:via-pink-900/20 dark:to-rose-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-xl">
              <Gift size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-pink-900 to-rose-900 dark:from-slate-100 dark:via-pink-100 dark:to-rose-100 bg-clip-text text-transparent">
                {t("storeGiftColors.management")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("storeGiftColors.managementSubtitle")}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
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
              onClick={() => navigate("/store-gift-colors/create")}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus size={20} />
              {t("storeGiftColors.addColor")}
            </button>
          </div>
        </div>

        {/* Filters */}
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={(v) => {
            setSearchTerm(v);
            setCurrentPage(1);
          }}
          statusFilter={statusFilter}
          show={true}
          onStatusFilter={(v) => {
            setStatusFilter(v);
            setCurrentPage(1);
          }}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
          onClearFilters={clearFilters}
          searchPlaceholder={t("storeGiftColors.searchPlaceholder")}
          filterLabel={t("storeGiftColors.columns.isActive")}
          filterOptions={statusOptions}
        />

        {/* Loading */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("common.loading")}
            </p>
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <Gift size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("storeGiftColors.failedToLoad")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("storeGiftColors.fetchError")}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && colorsResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-pink-500 mb-4">
              <Palette size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("storeGiftColors.noColorsFound")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {hasActiveFilters
                ? t("storeGiftColors.noColorsMatch")
                : t("storeGiftColors.noColorsInDB")}
            </p>
            {!hasActiveFilters && (
              <button
                onClick={() => navigate("/store-gift-colors/create")}
                className="px-6 py-2 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors"
              >
                {t("storeGiftColors.createFirstColor")}
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && colorsResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={colorsResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={colorsResponse.total}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(n) => {
                setRowsPerPage(n);
                setCurrentPage(1);
              }}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, color: null })}
        onConfirm={() => {
          if (deleteDialog.color) {
            deleteColorMutation.mutate(deleteDialog.color.id);
          }
        }}
        title={t("storeGiftColors.deleteConfirmTitle")}
        description={t("storeGiftColors.deleteConfirmDescription")}
        itemName={
          deleteDialog.color
            ? getColorName(deleteDialog.color) ||
              t("storeGiftColors.unknownColor")
            : t("storeGiftColors.unknownColor")
        }
        isLoading={deleteColorMutation.isPending}
      />
    </div>
  );
}
