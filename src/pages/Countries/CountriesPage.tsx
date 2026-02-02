import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Globe,
  Eye,
  Edit,
  Trash2,
  Search,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
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

interface CountryName {
  arabic: string;
  english: string;
}

interface Country {
  id: number;
  name: CountryName;
  flag: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

interface CountriesResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    countries: Country[];
  };
  totalItems: number;
  totalPages: number;
}

function StatsCard({
  icon: Icon,
  title,
  value,
  gradient,
  badge,
}: {
  icon: any;
  title: string;
  value: string | number;
  gradient: string;
  badge?: string;
}) {
  return (
    <div
      className={`relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${gradient}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
            <Icon size={24} strokeWidth={2.5} />
          </div>
          {badge && (
            <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm text-xs font-bold">
              {badge}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-white/80 text-sm font-semibold">{title}</p>
          <p className="text-3xl font-black">{value}</p>
        </div>
      </div>
    </div>
  );
}

const calculateStats = (countries: Country[]) => {
  const totalCountries = countries.length;

  const newestDate =
    countries.length > 0
      ? new Date(
          Math.max(...countries.map((c) => new Date(c.createdAt).getTime())),
        )
      : null;

  const oldestDate =
    countries.length > 0
      ? new Date(
          Math.min(...countries.map((c) => new Date(c.createdAt).getTime())),
        )
      : null;

  return {
    totalCountries,
    activeCountries: totalCountries,
    newestCountry: newestDate ? newestDate.toLocaleDateString() : "N/A",
    oldestCountry: oldestDate ? oldestDate.toLocaleDateString() : "N/A",
  };
};

export default function CountriesPage() {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    country: Country | null;
  }>({
    isOpen: false,
    country: null,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

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
    return import.meta.env.VITE_IMAGE_BASE_URL + url;
  };

  const fetchCountries = async ({
    page,
    pageSize,
    searchTerm,
  }: {
    page: number;
    pageSize: number;
    searchTerm?: string;
  }): Promise<{
    data: Country[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/countries",
        page,
        pageSize,
        lang,
        searchTerm,
      )) as CountriesResponse;

      const countries = response.data?.countries || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      return {
        data: countries,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching countries:", error);
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  const deleteCountry = async (id: number) => {
    try {
      const response = await DeleteMethod("/countries", id.toString(), lang);

      if (response?.code === 200 || response?.code === 204) {
        return response;
      } else {
        console.log("Delete response:", response);

        if (response?.message || response?.data) {
          return response;
        }

        throw new Error("Delete failed with no success indication");
      }
    } catch (error) {
      console.error("Error in deleteCountry:", error);
      throw error;
    }
  };

  const {
    data: countriesResponse = {
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
    queryKey: ["countries", currentPage, rowsPerPage, debouncedSearchTerm],
    queryFn: () =>
      fetchCountries({
        page: currentPage,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearchTerm,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCountry,
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      setDeleteDialog({ isOpen: false, country: null });
      toast.success(t("countries.messages.deleteSuccess"));
    },
    onError: (error) => {
      console.error("Error deleting country:", error);
      toast.error(t("countries.messages.deleteFailed"));
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
      key: "flag",
      label: t("countries.table.flag"),
      width: "100px",
      render: (value: string, row: Country) => (
        <div className="flex justify-center">
          <div className="relative w-16 h-12 rounded-lg overflow-hidden shadow-md border-2 border-slate-200 dark:border-slate-700">
            <img
              src={formatImageUrl(value)}
              alt="Flag"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/default/country-flag-default.png";
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "name",
      label: t("countries.table.englishName"),
      render: (value: CountryName) => (
        <div className="font-semibold text-center text-slate-900 dark:text-white">
          {value.english?.trim() || "N/A"}
        </div>
      ),
    },
    {
      key: "name",
      label: t("countries.table.arabicName"),
      render: (value: CountryName) => (
        <div className="font-semibold text-center text-slate-900 dark:text-white  ">
          {value.arabic?.trim() || "غير متوفر"}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: t("common.createdAt"),
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
      label: t("common.updatedAt"),
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
      render: (value: number, row: Country) => {
        if (!row) {
          console.error("Row is undefined in actions render!");
          return <div>Error: No data</div>;
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

  const handleAction = (action: string, row: Country) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, country: row });
    } else if (action === "view") {
      navigate(`/countries/${row.id}`);
    } else if (action === "edit") {
      navigate(`/Countries/edit/${row.id}`);
    }
  };

  const handleCreateCountry = () => {
    navigate("/countries/create");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
              <Globe size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("countries.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("countries.subtitle")}
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
              onClick={handleCreateCountry}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus size={20} />
              {t("countries.addCountry")}
            </button>
          </div>
        </div>

        <TableFilters
          searchTerm={searchTerm}
          show={false}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
          onClearFilters={clearFilters}
          searchPlaceholder={t("countries.searchPlaceholder")}
          filterOptions={[]}
          filterLabel={t("common.status")}
        />
        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("countries.loading")}
            </p>
          </div>
        )}
        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <Globe size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("countries.loadError")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("countries.loadErrorDesc")}
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
        {!isLoading && !isError && countriesResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-blue-500 mb-4">
              <Globe size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("countries.noCountriesFound")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearchTerm
                ? t("countries.noSearchResults")
                : t("countries.noCountriesYet")}
            </p>
            {!debouncedSearchTerm && (
              <button
                onClick={handleCreateCountry}
                className="px-6 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                {t("countries.addFirstCountry")}
              </button>
            )}
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && countriesResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={countriesResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={countriesResponse.total}
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
        onClose={() => setDeleteDialog({ isOpen: false, country: null })}
        onConfirm={() => {
          if (deleteDialog.country) {
            deleteMutation.mutate(deleteDialog.country.id);
          }
        }}
        title={t("countries.deleteTitle")}
        description={t("countries.deleteDescription")}
        itemName={
          deleteDialog.country?.name.english?.trim() || t("common.unknown")
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
