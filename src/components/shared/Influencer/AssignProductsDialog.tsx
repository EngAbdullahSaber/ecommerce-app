import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Loader2,
  Filter,
  Check,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../hooks/useToast";
import {
  GetPanigationMethod,
  CreateMethod,
} from "../../../services/apis/ApiMethod";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: number;
  name: {
    arabic: string;
    english: string;
  };
  basePrice: string;
  offerPrice: string | null;
  image: string;
}

interface AssignProductsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  influencerId: number;
  influencerName: string;
  initialProductIds: number[];
}

export function AssignProductsDialog({
  isOpen,
  onClose,
  influencerId,
  influencerName,
  initialProductIds,
}: AssignProductsDialogProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const queryClient = useQueryClient();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize selected ids when dialog opens or initialProductIds change
  useEffect(() => {
    if (isOpen) {
      setSelectedProductIds(initialProductIds);
    }
  }, [isOpen, initialProductIds]);

  // Search products
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["products-search", searchTerm, lang],
    queryFn: async () => {
      const resp = await GetPanigationMethod("products", 1, 10, lang, searchTerm);
      return (resp?.data?.products || resp?.data || []) as Product[];
    },
    enabled: searchTerm.length > 2 && isOpen,
  });

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

    try {
      const response = await CreateMethod(
        `home-page/admin/influencers/${influencerId}/products`,
        { productIds: selectedProductIds },
        lang
      );

      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("common.success") || "Products updated successfully");
        queryClient.invalidateQueries({ queryKey: ["influencers"] });
        setTimeout(onClose, 1000);
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(t("common.error") || "Failed to update assigned products");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Assign Products</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Influencer: <span className="font-bold text-indigo-600 truncate max-w-[200px] inline-block align-bottom">{influencerName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Search Section */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-6">
            <div className="relative group">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Filter size={14} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {searchTerm ? "Search Results" : "Type to search catalog"}
                </span>
              </div>

              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 size={40} className="text-indigo-500 animate-spin" />
                  <p className="text-slate-500 text-sm font-medium">Searching catalog...</p>
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className={`group relative p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        selectedProductIds.includes(product.id)
                          ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 shadow-sm"
                          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-indigo-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={import.meta.env.VITE_IMAGE_BASE_URL + "/" + product.image}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-900 shadow-sm"
                        />
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {lang === "ar" ? product.name.arabic : product.name.english}
                          </p>
                          <p className="text-[10px] text-indigo-600 font-bold mt-0.5 opacity-80">{product.basePrice} SAR</p>
                        </div>
                      </div>
                      <div className={`absolute top-2 right-2 p-1 rounded-full transition-all ${
                        selectedProductIds.includes(product.id)
                          ? "bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/30"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100"
                      }`}>
                        {selectedProductIds.includes(product.id) ? <Check size={10} /> : <Plus size={10} />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm.length > 2 ? (
                <div className="text-center py-20 text-slate-500">
                   <Package size={48} className="mx-auto mb-4 opacity-20" />
                   <p className="font-medium text-sm">No products found for "{searchTerm}"</p>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400">
                  <Search size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-xs font-bold uppercase tracking-widest">Global Catalog Search</p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Section */}
          <div className="w-full md:w-80 bg-slate-50/50 dark:bg-slate-800/30 p-8 flex flex-col overflow-hidden">
             <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Selected ({selectedProductIds.length})
                </h3>
             </div>

             <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {selectedProductIds.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-20 text-center text-slate-400"
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest">Empty Selection</p>
                    </motion.div>
                  ) : (
                    selectedProductIds.map((pid) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        key={pid}
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 group shadow-sm hover:shadow-md transition-all"
                      >
                         <div className="flex items-center gap-3 min-w-0">
                             <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-600">
                               #{pid}
                             </div>
                             <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">Product ID: {pid}</span>
                         </div>
                         <button
                           onClick={() => toggleProduct(pid)}
                           className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                         >
                           <Trash2 size={14} />
                         </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
             </div>

             <div className="mt-8 space-y-3">
                <button
                  onClick={handleSave}
                  disabled={isSubmitting || selectedProductIds.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Save Changes
                </button>
                <button
                  onClick={onClose}
                  className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors py-2"
                >
                  Discard Changes
                </button>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
