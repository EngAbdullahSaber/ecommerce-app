// pages/areas/index.tsx - Areas Management Page
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Flag,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Map,
  Building,
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

interface Name {
  arabic: string;
  english: string;
}

interface City {
  id: number;
  name: Name;
}

interface Area {
  id: number;
  name: Name;
  cityId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
  city: City;
}

interface AreasResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    areas: Area[];
  };
  totalItems: number;
  totalPages: number;
}

export default function AreasPage() {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    area: Area | null;
  }>({
    isOpen: false,
    area: null,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const formatImageUrl = (url: string) => {
    if (!url || url === "undefined/images/") {
      return "/placeholder-flag.png";
    }
    if (url.startsWith("http")) {
      return url;
    }
    return import.meta.env.VITE_IMAGE_BASE_URL
      ? import.meta.env.VITE_IMAGE_BASE_URL + url
      : url;
  };

  const fetchAreas = async ({
    page,
    pageSize,
    searchTerm,
  }: {
    page: number;
    pageSize: number;
    searchTerm?: string;
  }): Promise<{
    data: Area[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/areas",
        page,
        pageSize,
        lang,
        searchTerm,
      )) as AreasResponse;

      const areas = response.data?.areas || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      return {
        data: areas,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching areas:", error);
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  const deleteArea = async (id: number) => {
    try {
      const response = await DeleteMethod("/areas", id.toString(), lang);

      if (response?.code === 200 || response?.code === 204) {
        return response;
      } else if (response?.message || response?.data) {
        return response;
      }

      throw new Error("Delete failed with no success indication");
    } catch (error) {
      console.error("Error in deleteArea:", error);
      throw error;
    }
  };

  const {
    data: areasResponse = {
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
    queryKey: ["areas", currentPage, rowsPerPage, debouncedSearchTerm],
    queryFn: () =>
      fetchAreas({
        page: currentPage,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearchTerm,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArea,
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      setDeleteDialog({ isOpen: false, area: null });
      toast.success(t("areas.messages.deleteSuccess"));
    },
    onError: (error) => {
      console.error("Error deleting area:", error);
      toast.error(t("areas.messages.deleteFailed"));
    },
  });

  const columns = [
    {
      key: "id",
      label: "ID",
      width: "80px",
      render: (value: number) => (
        <div className="font-bold text-slate-700 dark:text-slate-300">
          #{value}
        </div>
      ),
    },
    {
      key: "name",
      label: t("areas.table.englishName"),
      render: (value: Name, row: Area) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
            <MapPin size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {value.english?.trim() || t("common.na")}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ID: {row.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "name",
      label: t("areas.table.arabicName"),
      render: (value: Name) => (
        <div
          className="font-semibold text-slate-900 dark:text-white text-right"
          dir="rtl"
        >
          {value.arabic?.trim() || t("common.notAvailable")}
        </div>
      ),
    },
    {
      key: "city",
      label: t("areas.table.city"),
      width: "250px",
      render: (value: City) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-lg">
            <Building
              size={18}
              className="text-purple-600 dark:text-purple-400"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">
              {value.name?.english?.trim() || t("areas.unknownCity")}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              ID: {value.id}
            </div>
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
      label: t("common.lastUpdated"),
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
      label: t("common.actions"),
      width: "140px",
      render: (value: number, row: Area) => {
        if (!row) {
          return <div>{t("common.error")}</div>;
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

  const handleAction = (action: string, row: Area) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, area: row });
    } else if (action === "edit") {
      navigate(`/Areas/edit/${row.id}`);
    }
  };

  const handleCreateArea = () => {
    navigate("/Areas/create");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
              <Map size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {t("areas.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("areas.subtitle")}
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
              onClick={handleCreateArea}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus size={20} />
              {t("areas.addArea")}
            </button>
          </div>
        </div>

        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          show={true}
          onStatusFilter={setStatusFilter}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
          onClearFilters={clearFilters}
          searchPlaceholder={t("areas.searchPlaceholder")}
          filterOptions={[
            { value: "all", label: t("common.all") },
            { value: "active", label: t("common.active") },
            { value: "inactive", label: t("common.inactive") },
          ]}
          filterLabel={t("common.status")}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("areas.loading")}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <Map size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("areas.loadError")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("areas.loadErrorDesc")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && areasResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-blue-500 mb-4">
              <Map size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("areas.noAreasFound")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearchTerm
                ? t("areas.noSearchResults")
                : t("areas.noAreasYet")}
            </p>
            {!debouncedSearchTerm && (
              <button
                onClick={handleCreateArea}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                {t("areas.addFirstArea")}
              </button>
            )}
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && areasResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={areasResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={areasResponse.total}
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
        onClose={() => setDeleteDialog({ isOpen: false, area: null })}
        onConfirm={() => {
          if (deleteDialog.area) {
            deleteMutation.mutate(deleteDialog.area.id);
          }
        }}
        title={t("areas.deleteTitle")}
        description={t("areas.deleteDescription")}
        itemName={
          deleteDialog.area?.name.english?.trim() || t("areas.unknownArea")
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
