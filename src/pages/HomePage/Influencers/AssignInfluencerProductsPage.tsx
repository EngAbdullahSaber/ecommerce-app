import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Package,
  Search,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Filter,
  Check,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../hooks/useToast";
import {
  GetPanigationMethod,
  GetSpecifiedMethod,
  CreateMethod,
} from "../../../services/apis/ApiMethod";
import { api } from "../../../services/axios";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: number;
  name: {
    arabic: string;
    english: string;
  };
  basePrice: string;
  offerPrice: string | null;
  image?: string;
  images?: {
    imageUrl: string;
    isPrimary: boolean;
  }[];
}

interface InfluencerProduct {
    id: number;
    product: Product;
}

interface Influencer {
  id: number;
  disPlayName: {
    arabic: string;
    english: string;
  };
  products: InfluencerProduct[];
}

export default function AssignInfluencerProductsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const queryClient = useQueryClient();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [initialProductIds, setInitialProductIds] = useState<number[]>([]);

  // Fetch influencer and their products
  const { data: influencer, isLoading: isInfluencerLoading } = useQuery({
    queryKey: ["influencer-products", id, lang],
    queryFn: async () => {
      const resp = await GetSpecifiedMethod(`home-page/admin/influencers`, lang);
      // Find the specific influencer in the list
      const item = Array.isArray(resp?.data)
        ? resp.data.find((inf: any) => inf.id.toString() === id)
        : resp?.data;
      return item as Influencer;
    },
    enabled: !!id,
  });

  // Fetch products with pagination and search
  const { data: productsResponse, isLoading: isSearching, isFetching } = useQuery({
    queryKey: ["products-catalog", page, searchTerm, lang],
    queryFn: async () => {
      const resp = await GetPanigationMethod("products/all", page, 12, lang, searchTerm);
      return resp?.data;
    },
  });

  useEffect(() => {
    if (productsResponse) {
      if (page === 1) {
        setAllProducts(productsResponse);
      } else {
        setAllProducts((prev) => [...prev, ...productsResponse]);
      }
    }
  }, [productsResponse, page]);
console.log(allProducts);
  // Reset pagination on search
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleLoadMore = () => {
    if (productsResponse?.totalPages > page) {
      setPage((prev) => prev + 1);
    }
  };

  // Initialize selected ids from influencer's current products
  useEffect(() => {
    if (influencer?.products) {
      const ids = influencer.products.map((p) => p.product.id);
      setSelectedProductIds(ids);
      setInitialProductIds(ids);
    }
  }, [influencer]);

  const toggleProduct = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(t("common.loading") || "Saving assigned products...");

    const addedIds = selectedProductIds.filter(id => !initialProductIds.includes(id));
    const removedIds = initialProductIds.filter(id => !selectedProductIds.includes(id));

    try {
      // 1. ADD NEW PRODUCTS
      if (addedIds.length > 0) {
        await CreateMethod(
          `home-page/admin/influencers/${id}/products`,
          { productIds: addedIds },
          lang
        );
      }

      // 2. REMOVE PRODUCTS
      if (removedIds.length > 0) {
        await api.delete(`home-page/admin/influencers/${id}/products`, {
            data: { productIds: removedIds },
            headers: { lang }
        });
      }

      toast.dismiss(loadingToast);
      toast.success(t("common.success") || "Products updated successfully");
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      queryClient.invalidateQueries({ queryKey: ["influencer-products", id] });
      setTimeout(() => navigate("/home-page/influencers"), 1500);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || t("common.error") || "Failed to update assigned products";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInfluencerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t("influencers.assign.loadingData")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/home-page/influencers")}
              className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all hover:shadow-lg active:scale-95"
            >
              <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
                <Package size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {t("influencers.assign.title")}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {t("influencers.assign.influencerLabel")}: <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {lang === 'ar' ? influencer?.disPlayName.arabic : influencer?.disPlayName.english}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {t("influencers.assign.saveSelection", { count: selectedProductIds.length })}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Search & Add */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("influencers.assign.searchPlaceholder")}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
              />
              <AnimatePresence>
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-rose-500"
                  >
                    <XCircle size={20} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700/60 p-6 min-h-[400px]">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={16} className="text-indigo-500" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("influencers.assign.searchResults")}</h3>
              </div>

              {isSearching && page === 1 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 size={40} className="text-indigo-500 animate-spin" />
                  <p className="text-slate-500 text-sm font-medium animate-pulse">
                    {t("influencers.assign.searching")}
                  </p>
                </div>
              ) : allProducts && allProducts.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {allProducts.map((product: Product) => (
                      <motion.div
                        layout
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`group relative p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                          selectedProductIds.includes(product.id)
                            ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 shadow-md"
                            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-300 hover:shadow-lg"
                        }`}
                      >
                        <div className="flex gap-3">
                          
                          <div className="flex-1 min-w-0 pr-6">
                            <p
                              className={`text-sm font-bold truncate ${
                                selectedProductIds.includes(product.id)
                                  ? "text-indigo-700 dark:text-indigo-400"
                                  : "text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              {lang === "ar"
                                ? product.name.arabic
                                : product.name.english}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-indigo-600 font-black">
                                {product.offerPrice || product.basePrice} SAR
                              </p>
                              {product.offerPrice && (
                                <p className="text-[10px] text-slate-400 line-through font-medium">
                                  {product.basePrice} SAR
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`absolute top-2 right-2 p-1 rounded-full transition-all ${
                            selectedProductIds.includes(product.id)
                              ? "bg-indigo-500 text-white scale-110"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {selectedProductIds.includes(product.id) ? (
                            <Check size={12} />
                          ) : (
                            <Plus size={12} />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {productsResponse?.totalPages > page && (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={handleLoadMore}
                        disabled={isFetching}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isFetching ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <RefreshCw size={18} />
                        )}
                        {t("influencers.assign.loadMore")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <Package size={48} className="text-slate-300 dark:text-slate-700" />
                  <p className="text-slate-500 text-sm">
                    {t("influencers.assign.noProducts")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Selected Summary */}
          <div className="lg:col-span-5">
             <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 dark:border-slate-700/60 shadow-2xl p-8 sticky top-8 max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/30">
                      <Check size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">{t("influencers.assign.selectedTitle")}</h2>
                      <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">
                        {t("influencers.assign.productsAdded", { count: selectedProductIds.length })}
                      </p>
                    </div>
                  </div>
                  {selectedProductIds.length > 0 && (
                    <button
                      onClick={() => setSelectedProductIds([])}
                      className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline transition-all"
                    >
                      {t("influencers.assign.clearAll")}
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {selectedProductIds.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-slate-400"
                      >
                        <Package size={40} className="mb-3 opacity-20" />
                        <p className="text-sm font-bold">{t("influencers.assign.emptySelection")}</p>
                        <p className="text-xs opacity-60">{t("influencers.assign.emptySelectionDesc")}</p>
                      </motion.div>
                    ) : (
                      selectedProductIds.map((pid) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={pid}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 rounded-2xl group shadow-sm hover:shadow-md transition-all"
                        >
                           <div className="flex items-center gap-3 min-w-0">
                               <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-500 shadow-inner">
                                 #{pid}
                               </div>
                               <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate pr-4">
                                 {initialProductIds.includes(pid) ? t("influencers.assign.assignedProduct") : t("influencers.assign.newAssignment")}
                               </span>
                           </div>
                           <button
                             onClick={() => toggleProduct(pid)}
                             className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                           >
                             <Trash2 size={16} />
                           </button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/50">
                   <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{t("influencers.assign.totalSelection")}</div>
                      <div className="text-lg font-black text-indigo-900 dark:text-indigo-100">{selectedProductIds.length}</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
