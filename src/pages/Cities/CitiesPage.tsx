import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  MapPin,
  Flag,
  Edit,
  Trash2,
  Search,
  Plus,
  RefreshCw,
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

interface CityName {
  arabic: string;
  english: string;
}

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

interface City {
  id: number;
  name: CityName;
  countryId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
  country: Country;
}

interface CitiesResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    cities: City[];
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

const calculateStats = (cities: City[]) => {
  const totalCities = cities.length;

  const newestDate =
    cities.length > 0
      ? new Date(
          Math.max(...cities.map((c) => new Date(c.createdAt).getTime())),
        )
      : null;

  const oldestDate =
    cities.length > 0
      ? new Date(
          Math.min(...cities.map((c) => new Date(c.createdAt).getTime())),
        )
      : null;

  const uniqueCountries = new Set(
    cities.map((city) => city.country?.name?.english),
  ).size;

  return {
    totalCities,
    uniqueCountries,
    newestCity: newestDate ? newestDate.toLocaleDateString() : "N/A",
    oldestCity: oldestDate ? oldestDate.toLocaleDateString() : "N/A",
  };
};

export default function CitiesPage() {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    city: City | null;
  }>({
    isOpen: false,
    city: null,
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
    if (!url || url === "undefined/images/") {
      return "/placeholder-flag.png";
    }
    return import.meta.env.VITE_IMAGE_BASE_URL + url;
  };

  const fetchCities = async ({
    page,
    pageSize,
    searchTerm,
  }: {
    page: number;
    pageSize: number;
    searchTerm?: string;
  }): Promise<{
    data: City[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/cities",
        page,
        pageSize,
        lang,
        searchTerm,
      )) as CitiesResponse;

      const cities = response.data?.cities || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      return {
        data: cities,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching cities:", error);
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  const deleteCity = async (id: number) => {
    try {
      const response = await DeleteMethod("/cities", id.toString(), lang);

      if (response?.code === 200 || response?.code === 204) {
        return response;
      } else if (response?.message || response?.data) {
        return response;
      }

      throw new Error("Delete failed with no success indication");
    } catch (error) {
      console.error("Error in deleteCity:", error);
      throw error;
    }
  };

  const {
    data: citiesResponse = {
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
    queryKey: ["cities", currentPage, rowsPerPage, debouncedSearchTerm],
    queryFn: () =>
      fetchCities({
        page: currentPage,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearchTerm,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCity,
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      setDeleteDialog({ isOpen: false, city: null });
      toast.success(t("CITIES.MESSAGES.DELETE_SUCCESS"));
    },
    onError: (error) => {
      console.error("Error deleting city:", error);
      toast.error(t("CITIES.MESSAGES.DELETE_ERROR"));
    },
  });

  const columns = [
    {
      key: "id",
      label: t("CITIES.COLUMNS.ID"),
      width: "80px",
      render: (value: number) => (
        <div className="font-bold text-slate-700 dark:text-slate-300">
          #{value}
        </div>
      ),
    },
    {
      key: "name",
      label: t("CITIES.COLUMNS.ENGLISH_NAME"),
      render: (value: CityName, row: City) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
            <MapPin size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {value.english?.trim() || t("CITIES.PLACEHOLDERS.ENGLISH_NAME")}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t("CITIES.COLUMNS.ID")}: {row.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "name",
      label: t("CITIES.COLUMNS.ARABIC_NAME"),
      render: (value: CityName) => (
        <div
          className="font-semibold text-slate-900 dark:text-white text-right"
          dir="rtl"
        >
          {value.arabic?.trim() || t("CITIES.PLACEHOLDERS.ARABIC_NAME")}
        </div>
      ),
    },
    {
      key: "country",
      label: t("CITIES.COLUMNS.COUNTRY"),
      width: "200px",
      render: (value: Country, row: City) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-7 rounded overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
            <img
              src={formatImageUrl(value.flag)}
              alt={value.name.english}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/default/country-flag-default.png";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">
              {value.name.english?.trim() || t("CITIES.PLACEHOLDERS.COUNTRY")}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t("CITIES.COLUMNS.ID")}: {row.countryId}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: t("CITIES.COLUMNS.CREATED"),
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
      label: t("CITIES.COLUMNS.LAST_UPDATED"),
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
      label: t("CITIES.COLUMNS.ACTIONS"),
      width: "140px",
      render: (value: number, row: City) => {
        if (!row) {
          return (
            <div>
              {t("GENERAL.ERROR")}: {t("GENERAL.NO_DATA")}
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleAction("edit", row)}
              className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 dark:hover:from-amber-500/20 dark:hover:to-orange-500/20 text-amber-600 dark:text-amber-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-amber-200/50 dark:border-amber-500/20"
              title={t("CITIES.ACTIONS.EDIT")}
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleAction("delete", row)}
              className="p-2 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 dark:from-red-500/10 dark:to-pink-500/10 dark:hover:from-red-500/20 dark:hover:to-pink-500/20 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-red-200/50 dark:border-red-500/20"
              title={t("CITIES.ACTIONS.DELETE")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const handleAction = (action: string, row: City) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, city: row });
    } else if (action === "view") {
      navigate(`/Cities/${row.id}`);
    } else if (action === "edit") {
      navigate(`/Cities/edit/${row.id}`);
    }
  };

  const handleCreateCity = () => {
    navigate("/Cities/create");
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

  const stats = calculateStats(citiesResponse.data);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
              <Building2 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("CITIES.TITLE")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("CITIES.SUBTITLE")}
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
              {t("CITIES.ACTIONS.REFRESH")}
            </button>

            <button
              onClick={handleCreateCity}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus size={20} />
              {t("CITIES.ACTIONS.ADD_CITY")}
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
          searchPlaceholder={t("CITIES.FILTERS.SEARCH_PLACEHOLDER")}
          filterLabel={t("CITIES.FILTERS.STATUS")}
          filterOptions={[
            { value: "all", label: t("CITIES.FILTERS.ALL") },
            { value: "active", label: t("CITIES.FILTERS.ACTIVE") },
            { value: "inactive", label: t("CITIES.FILTERS.INACTIVE") },
          ]}
          additionalFilters={[
            {
              key: "countryId",
              label: t("CITIES.FILTERS.COUNTRY"),
              type: "paginatedSelect",
              placeholder: t("CITIES.FILTERS.SELECT_COUNTRY"),
              paginatedSelectConfig: {
                endpoint: "/api/countries",
                searchParam: "search",
                labelKey: "name",
                valueKey: "id",
                pageSize: 10,
                debounceTime: 500,
                transformResponse: (data) =>
                  data.map((country: any) => ({
                    label: `${
                      country.name?.english ||
                      t("CITIES.PLACEHOLDERS.ENGLISH_NAME")
                    } - ${
                      country.name?.arabic ||
                      t("CITIES.PLACEHOLDERS.ARABIC_NAME")
                    }`,
                    value: country.id,
                    ...country,
                  })),
              },
            },
          ]}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("CITIES.MESSAGES.LOADING")}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <Building2 size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("CITIES.MESSAGES.FAILED_TO_LOAD")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("CITIES.MESSAGES.FAILED_TO_LOAD_DESC")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {t("CITIES.ACTIONS.TRY_AGAIN")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && citiesResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-blue-500 mb-4">
              <Building2 size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("CITIES.MESSAGES.NO_CITIES")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearchTerm
                ? t("CITIES.MESSAGES.NO_SEARCH_RESULTS")
                : t("CITIES.MESSAGES.NO_CITIES_DESC")}
            </p>
            {!debouncedSearchTerm && (
              <button
                onClick={handleCreateCity}
                className="px-6 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                {t("CITIES.ACTIONS.ADD_FIRST_CITY")}
              </button>
            )}
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && citiesResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={citiesResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={citiesResponse.total}
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
        onClose={() => setDeleteDialog({ isOpen: false, city: null })}
        onConfirm={() => {
          if (deleteDialog.city) {
            deleteMutation.mutate(deleteDialog.city.id);
          }
        }}
        title={t("CITIES.MESSAGES.DELETE_CONFIRM_TITLE")}
        description={t("CITIES.MESSAGES.DELETE_CONFIRM_DESC")}
        itemName={
          deleteDialog.city?.name.english?.trim() ||
          t("CITIES.PLACEHOLDERS.UNKNOWN_CITY")
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
