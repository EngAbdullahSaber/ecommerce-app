import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  Eye,
  EyeOff,
  RefreshCw,
  Hash,
  Activity,
  Edit2,
  Tag,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  Search,
  X,
  Plus,
  Package,
  DollarSign,
  Info,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import {
  GetPanigationMethod,
  UpdateMethod,
  DeleteMethodWithBody
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";

interface StoreValueProduct {
  id: number;
  title: {
    arabic: string;
    english: string;
  };
  sku: string;
  image: string;
  altText: string;
  price: number;
  offerPrice: number | null;
  stockQuantity: number;
  isActive: boolean;
}

interface StoreValueResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    products: StoreValueProduct[];
  };
  totalItems: number;
  totalPages: number;
}

export default function StoreValueProductsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productToRemove, setProductToRemove] = useState<number[] | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProducts = async (): Promise<StoreValueResponse> => {
    const response = (await GetPanigationMethod(
      "home-page/admin/store-value",
      currentPage,
      pageSize,
      lang,
      debouncedSearchTerm
    )) as StoreValueResponse;

    if (!response || response.code !== 200) {
      throw new Error(
        response?.message?.[lang === "ar" ? "arabic" : "english"] || 
        t("storeValue.errorMessage")
      );
    }

    return response;
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["store-value-products", lang, currentPage, pageSize, debouncedSearchTerm],
    queryFn: fetchProducts,
  });

  const products = data?.data?.products || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalItems || 0;

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await UpdateMethod(
        "home-page/admin/store-value",
        { isActive },
        id.toString(),
        lang
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-value-products"] });
      toast.success(t("common.success"));
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(t("common.error"));
    },
  });

  const removeProductsMutation = useMutation({
    mutationFn: async (productIds: number[]) => {
      return await DeleteMethodWithBody(
        "home-page/admin/store-value",
        { productIds },
        lang
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-value-products"] });
      toast.success(t("common.success"));
      setSelectedIds([]);
      setProductToRemove(null);
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(t("common.error"));
    },
  });

  const handleRefresh = () => {
    refetch();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectItem = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkRemove = () => {
    if (selectedIds.length > 0) {
      setProductToRemove(selectedIds);
    }
  };

  const handleSingleRemove = (id: number) => {
    setProductToRemove([id]);
  };

  const confirmRemove = () => {
    if (productToRemove) {
      removeProductsMutation.mutate(productToRemove);
    }
  };

  // Local filtering for status (since the API doesn't seem to have a status filter in GetPanigationMethod)
  const filteredProducts = products.filter(product => {
    if (statusFilter === "all") return true;
    return statusFilter === "active" ? product.isActive : !product.isActive;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                  <Package size={32} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                  {t("storeValue.title")}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                  {t("storeValue.description")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading || isFetching}
                className="group relative px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700 disabled:opacity-50"
              >
                <RefreshCw 
                  size={18} 
                  className={`${isLoading || isFetching ? "animate-spin" : "group-hover:rotate-180"} transition-all duration-500`} 
                />
              </button>

              <button
                onClick={() => navigate("/home-page/store-value/add")}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all duration-300 active:scale-95"
              >
                <Plus size={20} />
                <span>{t("common.add")}</span>
              </button>

              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkRemove}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 animate-in zoom-in duration-200"
                >
                  <Trash2 size={18} />
                  <span>
                    {t("storeValue.remove.button")} ({selectedIds.length})
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Products</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalItems}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <Package size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {products.filter(p => p.isActive).length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                  <Eye size={24} className="text-emerald-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Inactive</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {products.filter(p => !p.isActive).length}
                  </p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                  <EyeOff size={24} className="text-amber-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pages</p>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{totalPages}</p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                  <Grid3x3 size={24} className="text-indigo-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t("storeValue.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2">
              {(["all", "active", "inactive"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                    statusFilter === status
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {status === 'all' ? t('common.all') : status === 'active' ? t('common.active') : t('common.inactive')}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" 
                    ? "bg-white dark:bg-slate-600 shadow-md text-blue-600" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" 
                    ? "bg-white dark:bg-slate-600 shadow-md text-blue-600" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"} gap-6`}>
            {[...Array(pageSize)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-white dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full w-fit mx-auto mb-6">
              <Package size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("storeValue.errorTitle")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t("storeValue.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all active:scale-95"
            >
              {t("storeValue.tryAgain")}
            </button>
          </div>
        )}

        {/* Items Display */}
        {!isLoading && !isError && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Image Section */}
                    <div className="relative pt-[100%] overflow-hidden bg-slate-100 dark:bg-slate-700">
                      {/* Selection Overlay */}
                      <button
                        onClick={() => toggleSelectItem(product.id)}
                        className={`absolute top-3 left-3 z-10 p-1.5 rounded-lg transition-all ${
                          selectedIds.includes(product.id)
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-white/80 dark:bg-slate-800/80 text-slate-400 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                        }`}
                      >
                        {selectedIds.includes(product.id) ? (
                          <CheckSquare size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>

                      <img
                        src={product.image}
                        alt={lang === "ar" ? product.title.arabic : product.title.english}
                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/600x600/e2e8f0/94a3b8?text=Product";
                        }}
                      />
                      
                      {/* Floating Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${
                          product.isActive 
                            ? "bg-emerald-500 text-white" 
                            : "bg-slate-500 text-white"
                        }`}>
                          {product.isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                          {product.sku}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">
                        {lang === "ar" ? product.title.arabic : product.title.english}
                      </h3>
                      
                      <div className="mt-auto">
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className="flex flex-col">
                            {product.offerPrice ? (
                              <>
                                <span className="text-sm text-slate-400 line-through">
                                  {product.price} {t("common.currency")}
                                </span>
                                <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                                  {product.offerPrice} {t("common.currency")}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-black text-slate-900 dark:text-white">
                                {product.price} {t("common.currency")}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                              Stock
                            </span>
                            <span className={`text-sm font-bold ${
                              product.stockQuantity < 10 ? "text-rose-500" : "text-slate-600 dark:text-slate-300"
                            }`}>
                              {product.stockQuantity}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                      
                          
                          <button
                            onClick={() => handleSingleRemove(product.id)}
                            className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all rounded-xl"
                            title={t('storeValue.remove.button')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          <button
                            onClick={toggleSelectAll}
                            className={`p-1.5 rounded-lg transition-all ${
                              selectedIds.length === filteredProducts.length && filteredProducts.length > 0
                                ? "bg-blue-600 text-white"
                                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                              <CheckSquare size={16} />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t("storeValue.columns.id")}</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t("storeValue.columns.image")}</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t("storeValue.columns.title")}</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t("storeValue.columns.sku")}</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t("storeValue.columns.price")}</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t("storeValue.columns.stock")}</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t("storeValue.columns.status")}</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t("storeValue.columns.actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group ${selectedIds.includes(product.id) ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleSelectItem(product.id)}
                              className={`p-1.5 rounded-lg transition-all ${
                                selectedIds.includes(product.id)
                                  ? "bg-blue-600 text-white"
                                  : "text-slate-300 group-hover:text-slate-400"
                              }`}
                            >
                              {selectedIds.includes(product.id) ? (
                                <CheckSquare size={16} />
                              ) : (
                                <Square size={16} />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">#{product.id}</td>
                          <td className="px-6 py-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                              <img
                                src={product.image}
                                alt=""
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/48x48/e2e8f0/94a3b8?text=No";
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <div className="font-medium text-slate-900 dark:text-white truncate">
                              {lang === "ar" ? product.title.arabic : product.title.english}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                              {product.sku}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className={`font-bold ${product.offerPrice ? "text-xs text-slate-400 line-through" : "text-sm text-slate-900 dark:text-white"}`}>
                                {product.price}
                              </span>
                              {product.offerPrice && (
                                <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                                  {product.offerPrice}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-bold ${product.stockQuantity < 10 ? "text-rose-500" : "text-slate-600 dark:text-slate-400"}`}>
                              {product.stockQuantity}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                              product.isActive
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                            }`}>
                              {product.isActive ? t('common.active') : t('common.inactive')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => toggleStatusMutation.mutate({ id: product.id, isActive: !product.isActive })}
                                disabled={toggleStatusMutation.isPending}
                                className={`p-2 rounded-lg transition-colors ${
                                  product.isActive 
                                    ? "text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" 
                                    : "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                }`}
                                title={product.isActive ? "Hide" : "Show"}
                              >
                                {product.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                              <button
                                onClick={() => handleSingleRemove(product.id)}
                                className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                                title={t('storeValue.remove.button')}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
                <div className="p-6 bg-slate-100 dark:bg-slate-700 rounded-full w-fit mx-auto mb-6">
                  <Package size={64} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {t("common.noResults")}
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "No products available in this section"}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} products
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl font-bold transition-all ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {productToRemove && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-700">
            <div className="p-8">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle size={32} className="text-rose-500" />
              </div>
              
              <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
                {productToRemove.length > 1 ? t('storeValue.remove.title') : t('storeValue.remove.subtitle')}
              </h3>
              
              <p className="text-center text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                {productToRemove.length > 1 
                  ? t('storeValue.remove.confirmBulk', { count: productToRemove.length })
                  : t('storeValue.remove.confirmSingle')
                }
                <br />
                <span className="text-sm font-semibold text-rose-500 mt-2 block">
                  {t('storeValue.remove.undoWarning')}
                </span>
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setProductToRemove(null)}
                  disabled={removeProductsMutation.isPending}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={confirmRemove}
                  disabled={removeProductsMutation.isPending}
                  className="flex-1 px-6 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {removeProductsMutation.isPending ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={18} />
                      <span>{t('storeValue.remove.button')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
