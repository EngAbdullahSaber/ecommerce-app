// pages/banners/index.tsx - Banners Management Page
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Image,
  Calendar,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  FileImage,
  Target,
  Globe,
  Home,
  ShoppingBag,
  Layout,
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

interface Placement {
  id: number;
  bannerId: number;
  page: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Banner {
  id: number;
  image: string;
  altText: string;
  type: "ADS" | "PROMOTION" | "BRAND" | "CATEGORY" | "PRODUCT";
  ref: string;
  refId: number;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "EXPIRED";
  startDate: string;
  endDate: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
  placements: Placement[];
}

interface BannersResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    banners: Banner[];
  };
  totalItems: number;
  totalPages: number;
}

export default function BannersPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    banner: Banner | null;
  }>({
    isOpen: false,
    banner: null,
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

  const formatImageUrl = (url: string) => {
    console.log(url);
    if (!url) {
      return "/default/placeholder-banner.png";
    }
    if (url === "undefined/images/") {
      return "/default/placeholder-banner.png";
    }
    if (url.startsWith("http")) {
      return url;
    }
    return import.meta.env.VITE_IMAGE_BASE_URL
      ? import.meta.env.VITE_IMAGE_BASE_URL + url
      : url;
  };

  const fetchBanners = async ({
    page,
    pageSize,
    searchTerm,
  }: {
    page: number;
    pageSize: number;
    searchTerm?: string;
  }): Promise<{
    data: Banner[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/banners",
        page,
        pageSize,
        lang,
        searchTerm,
      )) as BannersResponse;

      const banners = response.data?.banners || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      return {
        data: banners,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching banners:", error);
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  const deleteBanner = async (id: number) => {
    try {
      const response = await DeleteMethod("/banners", id.toString(), lang);

      if (response?.code === 200 || response?.code === 204) {
        return response;
      } else if (response?.message || response?.data) {
        return response;
      }

      throw new Error("Delete failed with no success indication");
    } catch (error) {
      console.error("Error in deleteBanner:", error);
      throw error;
    }
  };

  const {
    data: bannersResponse = {
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
    queryKey: ["banners", currentPage, rowsPerPage, debouncedSearchTerm, lang],
    queryFn: () =>
      fetchBanners({
        page: currentPage,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearchTerm,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setDeleteDialog({ isOpen: false, banner: null });
      toast.success(t("banners.messages.deleteSuccess"));
    },
    onError: (error) => {
      console.error("Error deleting banner:", error);
      toast.error(t("banners.messages.deleteFailed"));
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "INACTIVE":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ADS":
        return <Target size={14} />;
      case "PROMOTION":
        return <ShoppingBag size={14} />;
      case "BRAND":
        return <Globe size={14} />;
      case "CATEGORY":
        return <Layout size={14} />;
      case "PRODUCT":
        return <ShoppingBag size={14} />;
      default:
        return <FileImage size={14} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ADS":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "PROMOTION":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "BRAND":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "CATEGORY":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "PRODUCT":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getPageIcon = (page: string) => {
    switch (page) {
      case "HOME":
        return <Home size={12} />;
      case "PRODUCT":
        return <ShoppingBag size={12} />;
      case "CATEGORY":
        return <Layout size={12} />;
      default:
        return <Globe size={12} />;
    }
  };

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
      label: t("banners.columns.image"),
      width: "120px",
      render: (value: string, row: Banner) => (
        <div className="flex items-center justify-center">
          {value ? (
            <img
              src={formatImageUrl(value)}
              alt={row.altText || t("banners.columns.bannerImage")}
              className="w-20 h-16 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:scale-105 transition-transform cursor-pointer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/default/placeholder-brand.jpg";
              }}
              onClick={() =>
                window.open(
                  formatImageUrl(value),
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            />
          ) : (
            <div className="w-20 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border-2 border-blue-200 dark:border-blue-500/20 flex items-center justify-center shadow-sm">
              <Image size={24} className="text-blue-500 dark:text-blue-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "altText",
      label: t("banners.columns.altText"),
      render: (value: string, row: Banner) => (
        <div className="flex flex-col">
          <div className="font-semibold text-slate-900 dark:text-white">
            {value || t("banners.noAltText")}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                row.type,
              )}`}
            >
              <div className="flex items-center gap-1">
                {getTypeIcon(row.type)}
                {t(`banners.types.${row.type.toLowerCase()}`)}
              </div>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Ref: {row.ref} (#{row.refId})
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: t("banners.columns.status"),
      width: "120px",
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            value,
          )}`}
        >
          {t(`banners.status.${value.toLowerCase()}`)}
        </span>
      ),
    },
    {
      key: "order",
      label: t("banners.columns.order"),
      width: "100px",
      render: (value: number) => (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
            {value}
          </div>
        </div>
      ),
    },
    {
      key: "placements",
      label: t("banners.columns.placements"),
      width: "200px",
      render: (value: Placement[]) => (
        <div className="flex flex-wrap gap-1">
          {value && value.length > 0 ? (
            value.map((placement) => (
              <span
                key={placement.id}
                className="px-2 py-1 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-500/30 rounded-lg text-xs flex items-center gap-1"
              >
                {getPageIcon(placement.page)}
                <span className="font-medium">{placement.page}</span>
                <span className="text-slate-500 dark:text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-300">
                  {placement.location}
                </span>
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-500 dark:text-slate-400 italic">
              {t("banners.noPlacements")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "startDate",
      label: t("banners.columns.dateRange"),
      width: "250px",
      render: (value: string, row: Banner) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300">
            <Calendar
              size={12}
              className="text-green-600 dark:text-green-400"
            />
            <span className="font-normal text-xs">
              {new Date(value).toLocaleDateString(
                lang === "ar" ? "ar-SA" : "en-US",
              )}
            </span>
            <span className="text-slate-400 dark:text-slate-500 mx-1">→</span>
            <Calendar size={12} className="text-red-600 dark:text-red-400" />
            <span className="font-normal text-xs">
              {new Date(row.endDate).toLocaleDateString(
                lang === "ar" ? "ar-SA" : "en-US",
              )}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {new Date(value).toLocaleTimeString(
              lang === "ar" ? "ar-SA" : "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}{" "}
            -{" "}
            {new Date(row.endDate).toLocaleTimeString(
              lang === "ar" ? "ar-SA" : "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: t("common.created"),
      width: "150px",
      render: (value: string) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-900 dark:text-white">
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
      render: (value: number, row: Banner) => {
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

  const handleAction = (action: string, row: Banner) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, banner: row });
    } else if (action === "edit") {
      navigate(`/banners/edit/${row.id}`);
    } else if (action === "view") {
      navigate(`/banners/view/${row.id}`);
    }
  };

  const handleCreateBanner = () => {
    navigate("/banners/create");
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

  // Filter options
  const statusOptions = [
    { value: "all", label: t("banners.allStatus") },
    { value: "ACTIVE", label: t("banners.status.active") },
    { value: "INACTIVE", label: t("banners.status.inactive") },
    { value: "PENDING", label: t("banners.status.pending") },
    { value: "EXPIRED", label: t("banners.status.expired") },
  ];

  const typeOptions = [
    { value: "all", label: t("banners.allTypes") },
    { value: "ADS", label: t("banners.types.ads") },
    { value: "PROMOTION", label: t("banners.types.promotion") },
    { value: "BRAND", label: t("banners.types.brand") },
    { value: "CATEGORY", label: t("banners.types.category") },
    { value: "PRODUCT", label: t("banners.types.product") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
              <Image size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {t("banners.management")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("banners.managementSubtitle")}
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
              onClick={handleCreateBanner}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus size={20} />
              {t("banners.addBanner")}
            </button>
          </div>
        </div>

        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          showFilters={showFilters}
          show={false}
          onShowFiltersChange={setShowFilters}
          onClearFilters={clearFilters}
          searchPlaceholder={t("banners.searchPlaceholder")}
          filterLabel={t("banners.columns.status")}
          filterOptions={statusOptions}
          additionalFilters={[]}
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
              <Image size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("banners.failedToLoad")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("banners.fetchError")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              {t("banners.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && bannersResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-blue-500 mb-4">
              <Image size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("banners.noBannersFound")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearchTerm
                ? t("banners.noBannersMatch")
                : t("banners.noBannersInDB")}
            </p>
            {!debouncedSearchTerm && (
              <button
                onClick={handleCreateBanner}
                className="px-6 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
              >
                {t("banners.createFirstBanner")}
              </button>
            )}
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && bannersResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={bannersResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={bannersResponse.total}
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
        onClose={() => setDeleteDialog({ isOpen: false, banner: null })}
        onConfirm={() => {
          if (deleteDialog.banner) {
            deleteMutation.mutate(deleteDialog.banner.id);
          }
        }}
        title={t("banners.deleteConfirmTitle")}
        description={t("banners.deleteConfirmDescription")}
        itemName={deleteDialog.banner?.altText || t("banners.unknownBanner")}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
