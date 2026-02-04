// pages/merchants/index.tsx - Merchants Management Page
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Store,
  Shield,
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

interface Merchant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MerchantsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    merchants: Merchant[];
  };
  totalItems: number;
  totalPages: number;
}

export default function MerchantsPage() {
  const { t } = useTranslation();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    merchant: Merchant | null;
  }>({
    isOpen: false,
    merchant: null,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
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

  const fetchMerchants = async ({
    page,
    pageSize,
    searchTerm,
  }: {
    page: number;
    pageSize: number;
    searchTerm?: string;
  }): Promise<{
    data: Merchant[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/merchants",
        page,
        pageSize,
        "en",
        searchTerm,
      )) as MerchantsResponse;

      const merchants = response.data?.merchants || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      console.log("API Response:", response);
      console.log("Merchants data:", merchants);

      // Apply additional filters based on UI selections
      let filteredMerchants = merchants;

      if (verificationFilter !== "all") {
        const isVerified = verificationFilter === "verified";
        filteredMerchants = filteredMerchants.filter(
          (merchant) => merchant.isVerified === isVerified,
        );
      }

      if (languageFilter !== "all") {
        filteredMerchants = filteredMerchants.filter(
          (merchant) => merchant.language === languageFilter,
        );
      }

      return {
        data: filteredMerchants,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching merchants:", error);
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  const deleteMerchant = async (id: number) => {
    try {
      const response = await DeleteMethod("/merchants", id.toString(), "en");

      if (response?.code === 200 || response?.code === 204) {
        return response;
      } else if (response?.message || response?.data) {
        return response;
      }

      throw new Error("Delete failed with no success indication");
    } catch (error) {
      console.error("Error in deleteMerchant:", error);
      throw error;
    }
  };

  const {
    data: merchantsResponse = {
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
      "merchants",
      currentPage,
      rowsPerPage,
      debouncedSearchTerm,
      verificationFilter,
      languageFilter,
    ],
    queryFn: () =>
      fetchMerchants({
        page: currentPage,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearchTerm,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMerchant,
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      setDeleteDialog({ isOpen: false, merchant: null });
      toast.success(t("merchants.page.delete.success"));
    },
    onError: (error) => {
      console.error("Error deleting merchant:", error);
      toast.error(t("merchants.page.delete.error"));
    },
  });

  const getLanguageLabel = (language: string) => {
    const languageMap: Record<string, string> = {
      ar: t("merchants.page.language.ar"),
      en: t("merchants.page.language.en"),
      fr: t("merchants.page.language.fr"),
    };
    return languageMap[language] || language.toUpperCase();
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case "ar":
        return "from-emerald-500 to-green-600";
      case "en":
        return "from-blue-500 to-indigo-600";
      case "fr":
        return "from-red-500 to-pink-600";
      default:
        return "from-gray-500 to-slate-600";
    }
  };

  const columns = [
    {
      key: "id",
      label: t("merchants.page.columns.id"),
      width: "80px",
      render: (value: number) => (
        <div className="font-bold text-slate-700 dark:text-slate-300">
          #{value}
        </div>
      ),
    },
    {
      key: "firstName",
      label: t("merchants.page.columns.merchant"),
      width: "250px",
      render: (value: string, row: Merchant) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
            <Store size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {row.firstName} {row.lastName}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t("merchants.page.columns.id")}: {row.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: t("merchants.page.columns.email"),
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-slate-400 dark:text-slate-500" />
          <span className="text-slate-700 dark:text-slate-300 truncate">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "phone",
      label: t("merchants.page.columns.phone"),
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-slate-400 dark:text-slate-500" />
          <span className="text-slate-700 dark:text-slate-300">{value}</span>
        </div>
      ),
    },
    {
      key: "language",
      label: t("merchants.page.columns.language"),
      width: "120px",
      render: (value: string) => (
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getLanguageColor(
            value,
          )}`}
        >
          {getLanguageLabel(value)}
        </div>
      ),
    },
    {
      key: "isVerified",
      label: t("merchants.page.columns.verification"),
      width: "130px",
      render: (value: boolean) => (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <CheckCircle size={16} className="text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {t("merchants.page.status.verified")}
              </span>
            </>
          ) : (
            <>
              <XCircle size={16} className="text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {t("merchants.page.status.pending")}
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: t("merchants.page.columns.joined"),
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
      label: t("merchants.page.columns.actions"),
      width: "140px",
      render: (value: number, row: Merchant) => {
        if (!row) {
          return <div>Error: No data</div>;
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleAction("edit", row)}
              className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 dark:hover:from-amber-500/20 dark:hover:to-orange-500/20 text-amber-600 dark:text-amber-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-amber-200/50 dark:border-amber-500/20"
              title={t("merchants.page.actions.editTitle")}
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleAction("delete", row)}
              className="p-2 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 dark:from-red-500/10 dark:to-pink-500/10 dark:hover:from-red-500/20 dark:hover:to-pink-500/20 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-red-200/50 dark:border-red-500/20"
              title={t("merchants.page.actions.deleteTitle")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const handleAction = (action: string, row: Merchant) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, merchant: row });
    } else if (action === "edit") {
      navigate(`/Merchants/edit/${row.id}`);
    }
  };

  const handleCreateMerchant = () => {
    navigate("/Merchants/create");
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
    setVerificationFilter("all");
    setLanguageFilter("all");
    setCurrentPage(1);
  };

  // Log data for debugging
  useEffect(() => {
    if (!isLoading && !isError) {
      console.log("Current merchants data:", merchantsResponse.data);
    }
  }, [isLoading, isError, merchantsResponse.data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
              <Store size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {t("merchants.page.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("merchants.page.description")}
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
              {t("merchants.page.refresh")}
            </button>

            <button
              onClick={handleCreateMerchant}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus size={20} />
              {t("merchants.page.addMerchant")}
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
          onShowFiltersChange={setShowFilters}
          onClearFilters={clearFilters}
          show={false}
          searchPlaceholder={t("merchants.page.searchPlaceholder")}
          filterOptions={[]}
          filterLabel={t("merchants.page.filters.status.label")}
          additionalFilters={[
            {
              label: t("merchants.page.filters.verification.label"),
              value: verificationFilter,
              onChange: setVerificationFilter,
              options: [
                {
                  value: "all",
                  label: t("merchants.page.filters.verification.all"),
                },
                {
                  value: "verified",
                  label: t("merchants.page.filters.verification.verified"),
                },
                {
                  value: "pending",
                  label: t("merchants.page.filters.verification.pending"),
                },
              ],
            },
            {
              label: t("merchants.page.filters.language.label"),
              value: languageFilter,
              onChange: setLanguageFilter,
              options: [
                {
                  value: "all",
                  label: t("merchants.page.filters.language.all"),
                },
                { value: "ar", label: t("merchants.page.filters.language.ar") },
                { value: "en", label: t("merchants.page.filters.language.en") },
              ],
            },
          ]}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("merchants.page.loading")}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <Store size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("merchants.page.errorTitle")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("merchants.page.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {t("merchants.page.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && merchantsResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-blue-500 mb-4">
              <Store size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("merchants.page.noMerchants")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearchTerm
                ? t("merchants.page.noMatch")
                : t("merchants.page.emptyList")}
            </p>
            {!debouncedSearchTerm && (
              <button
                onClick={handleCreateMerchant}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                {t("merchants.page.addFirstMerchant")}
              </button>
            )}
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && merchantsResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={merchantsResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={merchantsResponse.total}
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
        onClose={() => setDeleteDialog({ isOpen: false, merchant: null })}
        onConfirm={() => {
          if (deleteDialog.merchant) {
            deleteMutation.mutate(deleteDialog.merchant.id);
          }
        }}
        title={t("merchants.page.delete.title")}
        description={t("merchants.page.delete.description")}
        itemName={`${deleteDialog.merchant?.firstName} ${deleteDialog.merchant?.lastName}`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
