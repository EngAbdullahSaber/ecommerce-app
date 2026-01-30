import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Eye,
  Edit,
  Trash2,
  Search,
  Plus,
  RefreshCw,
  DollarSign,
  Tag,
  Percent,
  Hash,
  BarChart3,
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

interface ProductName {
  ar: string;
  en: string;
}

interface ProductDescription {
  ar: string;
  en: string;
}

interface Product {
  id: number;
  name: ProductName;
  description: ProductDescription;
  sku: string;
  basePrice: string;
  offerPrice: string | null;
  stockQuantity: number;
}

interface ProductsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: Product[];
  totalItems: number;
  totalPages: number;
}

export default function ProductsPage() {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null,
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
  const [stockFilter, setStockFilter] = useState("all");

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

  const fetchProducts = async ({
    page,
    pageSize,
    searchTerm,
    stockFilter,
  }: {
    page: number;
    pageSize: number;
    searchTerm?: string;
    stockFilter?: string;
  }): Promise<{
    data: Product[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/products/all",
        page,
        pageSize,
        lang,
        searchTerm,
      )) as ProductsResponse;

      const products = response.data || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      // Apply stock filter
      let filteredProducts = products;
      if (stockFilter === "low") {
        filteredProducts = products.filter(
          (product) => product.stockQuantity <= 20,
        );
      } else if (stockFilter === "out") {
        filteredProducts = products.filter(
          (product) => product.stockQuantity === 0,
        );
      } else if (stockFilter === "high") {
        filteredProducts = products.filter(
          (product) => product.stockQuantity > 50,
        );
      }

      return {
        data: filteredProducts,
        total: filteredProducts.length,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const response = await DeleteMethod("/products", id.toString(), lang);

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
      console.error("Error in deleteProduct:", error);
      throw error;
    }
  };

  const {
    data: productsResponse = {
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
      "products",
      currentPage,
      rowsPerPage,
      debouncedSearchTerm,
      stockFilter,
    ],
    queryFn: () =>
      fetchProducts({
        page: currentPage,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearchTerm,
        stockFilter: stockFilter,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteDialog({ isOpen: false, product: null });
      toast.success(t("products.messages.deleteSuccess"));
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast.error(t("products.messages.deleteFailed"));
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
      key: "sku",
      label: t("products.table.sku"),
      width: "120px",
      render: (value: string) => (
        <div className="font-mono bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg text-sm font-bold">
          {value}
        </div>
      ),
    },
    {
      key: "name",
      label: t("products.table.englishName"),
      render: (value: ProductName) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">
            {value.en?.trim() || "N/A"}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {value.en
              ? value.en.substring(0, 60) + (value.en.length > 60 ? "..." : "")
              : ""}
          </div>
        </div>
      ),
    },
    {
      key: "name",
      label: t("products.table.arabicName"),
      render: (value: ProductName) => (
        <div dir="rtl">
          <div className="font-semibold text-slate-900 dark:text-white">
            {value.ar?.trim() || "غير متوفر"}
          </div>
          <div
            className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2"
            dir="rtl"
          >
            {value.ar
              ? value.ar.substring(0, 60) + (value.ar.length > 60 ? "..." : "")
              : ""}
          </div>
        </div>
      ),
    },
    {
      key: "basePrice",
      label: t("products.table.basePrice"),
      width: "120px",
      render: (value: string, row: Product) => (
        <div className="text-right">
          <div className="font-bold text-slate-900 dark:text-white">
            ${parseFloat(value).toFixed(2)}
          </div>
          {row.offerPrice && (
            <div className="text-xs text-green-600 dark:text-green-400 font-semibold">
              {t("products.table.offerPrice")}: $
              {parseFloat(row.offerPrice).toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "stockQuantity",
      label: t("products.table.stock"),
      width: "120px",
      render: (value: number) => {
        let bgColor =
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
        if (value <= 20) {
          bgColor =
            "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
        }
        if (value === 0) {
          bgColor =
            "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
        }

        return (
          <div className="flex flex-col items-center">
            <span
              className={`px-3 py-1 rounded-full font-bold text-sm ${bgColor}`}
            >
              {value}
            </span>
            {value <= 20 && value > 0 && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                {t("products.lowStock")}
              </span>
            )}
            {value === 0 && (
              <span className="text-xs text-red-600 dark:text-red-400 mt-1">
                {t("products.outOfStock")}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "id",
      label: t("common.actions"),
      width: "140px",
      render: (value: number, row: Product) => {
        if (!row) {
          console.error("Row is undefined in actions render!");
          return <div>Error: No data</div>;
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleAction("view", row)}
              className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 dark:from-blue-500/10 dark:to-cyan-500/10 dark:hover:from-blue-500/20 dark:hover:to-cyan-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-blue-200/50 dark:border-blue-500/20"
              title={t("common.view")}
            >
              <Eye size={16} />
            </button>
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

  const handleAction = (action: string, row: Product) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, product: row });
    } else if (action === "view") {
      navigate(`/products/view/${row.id}`);
    } else if (action === "edit") {
      navigate(`/products/edit/${row.id}`);
    }
  };

  const handleCreateProduct = () => {
    navigate("/products/create");
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
    setStockFilter("all");
    setCurrentPage(1);
  };

  const filterOptions = [
    { value: "all", label: t("products.filters.all") },
    { value: "low", label: t("products.filters.lowStock") },
    { value: "out", label: t("products.filters.outOfStock") },
    { value: "high", label: t("products.filters.highStock") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-emerald-50/30 dark:from-slate-900 dark:via-amber-900/20 dark:to-emerald-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl">
              <Package size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 dark:from-slate-100 dark:via-amber-100 dark:to-orange-100 bg-clip-text text-transparent">
                {t("products.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("products.subtitle")}
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
              onClick={handleCreateProduct}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus size={20} />
              {t("products.addProduct")}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("products.loading")}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <Package size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("products.loadError")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("products.loadErrorDesc")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {/* Filters */}
        {!isLoading && !isError && productsResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6">
            <TableFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={stockFilter}
              onStatusFilter={setStockFilter}
              showFilters={showFilters}
              onShowFiltersChange={setShowFilters}
              onClearFilters={clearFilters}
              searchPlaceholder={t("products.searchPlaceholder")}
              filterOptions={filterOptions}
              filterLabel={t("products.filters.stockStatus")}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && productsResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-amber-500 mb-4">
              <Package size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("products.noProductsFound")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearchTerm || stockFilter !== "all"
                ? t("products.noSearchResults")
                : t("products.noProductsYet")}
            </p>
            {!debouncedSearchTerm && stockFilter === "all" && (
              <button
                onClick={handleCreateProduct}
                className="px-6 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                {t("products.addFirstProduct")}
              </button>
            )}
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && productsResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={productsResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={productsResponse.total}
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
        onClose={() => setDeleteDialog({ isOpen: false, product: null })}
        onConfirm={() => {
          if (deleteDialog.product) {
            deleteMutation.mutate(deleteDialog.product.id);
          }
        }}
        title={t("products.deleteTitle")}
        description={t("products.deleteDescription")}
        itemName={
          deleteDialog.product?.name[lang === "ar" ? "ar" : "en"]?.trim() ||
          t("common.unknown")
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
