import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tag,
  Percent,
  Hash,
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Search,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Gift,
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
import Badge from "../../components/ui/badge/Badge";

interface PromoRule {
  id: number;
  name: string;
  type: "COUPON" | "RULE";
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  coupon: {
    id: number;
    code: string;
    promoId: number;
    usageLimitTotal: number | null;
    usageLimitPerCustomer: number | null;
    createdAt: string;
  } | null;
  rules: Array<{
    id: number;
    promoId: number;
    ruleType: string;
    operator: string;
    value: any;
  }>;
  actions: Array<{
    id: number;
    promoId: number;
    actionType: string;
    payload: Record<string, any>;
  }>;
  _count: {
    usages: number;
  };
}

interface PromosResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    promos: PromoRule[];
  };
  totalItems: number;
  totalPages: number;
}

export default function PromoRulesPage() {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    promo: PromoRule | null;
  }>({
    isOpen: false,
    promo: null,
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

  const fetchPromos = async ({
    page,
    pageSize,
    searchTerm,
    statusFilter,
    typeFilter,
  }: {
    page: number;
    pageSize: number;
    searchTerm?: string;
    statusFilter?: string;
    typeFilter?: string;
  }): Promise<{
    data: PromoRule[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/promos",
        page,
        pageSize,
        lang,
        searchTerm,
      )) as PromosResponse;

      const promos = response.data?.promos || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;
      console.log(totalItems);
      // Apply filters
      let filteredPromos = promos;

      if (statusFilter !== "all") {
        filteredPromos = filteredPromos.filter(
          (promo) => promo.status === statusFilter.toUpperCase(),
        );
      }

      if (typeFilter !== "all") {
        filteredPromos = filteredPromos.filter(
          (promo) => promo.type === typeFilter.toUpperCase(),
        );
      }

      return {
        data: filteredPromos,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching promos:", error);
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  const deletePromo = async (id: number) => {
    try {
      const response = await DeleteMethod("/promos", id.toString(), lang);

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
      console.error("Error in deletePromo:", error);
      throw error;
    }
  };

  const {
    data: promosResponse = {
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
      "promos",
      currentPage,
      rowsPerPage,
      debouncedSearchTerm,
      statusFilter,
      typeFilter,
    ],
    queryFn: () =>
      fetchPromos({
        page: currentPage,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearchTerm,
        statusFilter: statusFilter,
        typeFilter: typeFilter,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
  console.log(promosResponse);
  const deleteMutation = useMutation({
    mutationFn: deletePromo,
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      queryClient.invalidateQueries({ queryKey: ["promos"] });
      setDeleteDialog({ isOpen: false, promo: null });
      toast.success(t("promos.messages.deleteSuccess"));
    },
    onError: (error) => {
      console.error("Error deleting promo:", error);
      toast.error(t("promos.messages.deleteFailed"));
    },
  });

  // Helper function to format action description
  const getActionDescription = (action: PromoRule["actions"][0]) => {
    switch (action.actionType) {
      case "DISCOUNT_PERCENT":
        return `${action.payload.percentage}% off${action.payload.maxDiscount ? ` (max $${action.payload.maxDiscount})` : ""}`;
      case "DISCOUNT_FIXED":
        return `$${action.payload.amount} off`;
      case "FREE_SHIPPING":
        return "Free shipping";
      case "BUY_X_GET_DISCOUNT_ON_Y":
        return `Buy ${action.payload.buyQuantity}, get ${action.payload.discountPercent}% off on ${action.payload.discountQuantity}`;
      default:
        return action.actionType;
    }
  };

  // Helper function to format rule description
  const getRuleDescription = (rule: PromoRule["rules"][0]) => {
    switch (rule.ruleType) {
      case "MIN_SUBTOTAL":
        return `Min order: $${rule.value}`;
      case "SPECIFIC_PRODUCTS":
        return `${rule.value.length} specific products`;
      case "FIRST_ORDER_ONLY":
        return "First order only";
      default:
        return rule.ruleType;
    }
  };

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
      key: "coupon",
      label: t("promos.table.code"),
      width: "140px",
      render: (value: PromoRule["coupon"]) => {
        if (!value) {
          return (
            <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400">
              {t("promos.noCoupon")}
            </div>
          );
        }
        return (
          <div className="flex flex-col">
            <div className="font-mono bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-3 py-1 rounded-lg text-sm font-bold text-purple-700 dark:text-purple-300">
              {value.code}
            </div>
            {value.usageLimitTotal && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t("promos.limit")}: {value.usageLimitTotal}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "name",
      label: t("promos.table.name"),
      width: "200px",
      render: (value: string, row: PromoRule) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">
            {value}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="light"
              color={row.type === "COUPON" ? "success" : "warning"}
              size="sm"
            >
              {row.type}
            </Badge>
            <Badge
              variant="light"
              color={
                row.status === "ACTIVE"
                  ? "success"
                  : row.status === "EXPIRED"
                    ? "error"
                    : "default"
              }
              size="sm"
            >
              {row.status}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: "rules",
      label: t("promos.table.rules"),
      width: "180px",
      render: (value: PromoRule["rules"], row: PromoRule) => (
        <div className="space-y-1">
          {value.length > 0 ? (
            value.map((rule, index) => (
              <div
                key={index}
                className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
              >
                {getRuleDescription(rule)}
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400 italic">
              {t("promos.noRules")}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: t("promos.table.actions"),
      width: "180px",
      render: (value: PromoRule["actions"]) => (
        <div className="space-y-1">
          {value.map((action, index) => (
            <div
              key={index}
              className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-2 py-1 rounded font-semibold text-green-700 dark:text-green-300"
            >
              {getActionDescription(action)}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "dates",
      label: t("promos.table.dates"),
      width: "200px",
      render: (_value: any, row: PromoRule) => (
        <div className="space-y-1">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <Calendar size={12} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">
                {new Date(row.startDate).toLocaleDateString("en-GB")}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Calendar size={12} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">
                {new Date(row.endDate).toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "_count",
      label: t("promos.table.usage"),
      width: "120px",
      render: (value: PromoRule["_count"]) => (
        <div className="text-center">
          <div className="font-bold text-2xl text-slate-900 dark:text-white">
            {value.usages}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t("promos.timesUsed")}
          </div>
        </div>
      ),
    },
    {
      key: "id",
      label: t("common.actions"),
      width: "140px",
      render: (value: number, row: PromoRule) => {
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

  const handleAction = (action: string, row: PromoRule) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, promo: row });
    } else if (action === "view") {
      navigate(`/promo-rules/view/${row.id}`);
    } else if (action === "edit") {
      navigate(`/promo-rules/edit/${row.id}`);
    }
  };

  const handleCreatePromo = () => {
    navigate("/promo-rules/create");
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

  // Since TableFilters only supports one filter dropdown, let's combine status and type filters
  // or we can use statusFilter for both status and type if needed
  const filterOptions = [
    { value: "all", label: t("promos.filters.allStatus") },
    { value: "active", label: t("promos.filters.active") },
    { value: "inactive", label: t("promos.filters.inactive") },
    { value: "expired", label: t("promos.filters.expired") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-purple-900/20 dark:to-pink-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
              <Tag size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 dark:from-slate-100 dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent">
                {t("promos.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("promos.subtitle")}
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
              onClick={handleCreatePromo}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus size={20} />
              {t("promos.addPromo")}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("promos.loading")}
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
              {t("promos.loadError")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("promos.loadErrorDesc")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {/* Filters - Using TableFilters component */}
        {!isLoading && !isError && promosResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6">
            <TableFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilter={setStatusFilter}
              showFilters={showFilters}
              show={false}
              onShowFiltersChange={setShowFilters}
              onClearFilters={clearFilters}
              searchPlaceholder={t("promos.searchPlaceholder")}
              filterOptions={filterOptions}
              filterLabel={t("promos.filters.status")}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && promosResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-purple-500 mb-4">
              <Tag size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("promos.noPromosFound")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearchTerm ||
              statusFilter !== "all" ||
              typeFilter !== "all"
                ? t("promos.noSearchResults")
                : t("promos.noPromosYet")}
            </p>
            {!debouncedSearchTerm &&
              statusFilter === "all" &&
              typeFilter === "all" && (
                <button
                  onClick={handleCreatePromo}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors"
                >
                  {t("promos.addFirstPromo")}
                </button>
              )}
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && promosResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={promosResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={promosResponse.total}
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
        onClose={() => setDeleteDialog({ isOpen: false, promo: null })}
        onConfirm={() => {
          if (deleteDialog.promo) {
            deleteMutation.mutate(deleteDialog.promo.id);
          }
        }}
        title={t("promos.deleteTitle")}
        description={t("promos.deleteDescription")}
        itemName={deleteDialog.promo?.name || t("common.unknown")}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
