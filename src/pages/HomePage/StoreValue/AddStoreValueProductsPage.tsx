import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  ArrowLeft,
  Search,
  RefreshCw,
  Plus,
  CheckCircle2,
  Trash2,
  Filter,
  PackagePlus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  ShoppingBag
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  GetPanigationMethod,
  CreateMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";

interface Product {
  id: number;
  title: {
    arabic: string;
    english: string;
  };
  sku: string;
  price: number;
  offerPrice: number | null;
  stockQuantity: number;
  image: string;
  avgRating: number;
}

interface ProductsResponse {
  code: number;
  data: {
    products: Product[];
  };
  totalItems: number;
  totalPages: number;
}

export default function AddStoreValueProductsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const queryClient = useQueryClient();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAllProducts = async (): Promise<ProductsResponse> => {
    const response = (await GetPanigationMethod(
      "products/all",
      currentPage,
      pageSize,
      lang,
      debouncedSearchTerm
    )) as ProductsResponse;

    if (!response || response.code !== 200) {
      throw new Error("Failed to fetch products");
    }

    return response;
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["all-products-for-store-value", currentPage, pageSize, debouncedSearchTerm, lang],
    queryFn: fetchAllProducts,
  });

  const addProductsMutation = useMutation({
    mutationFn: async (productIds: number[]) => {
      return await CreateMethod("home-page/admin/store-value", { productIds }, lang);
    },
    onSuccess: (res: any) => {
      if (res?.code === 200 || res?.code === 201) {
        toast.success(t("common.success"));
        queryClient.invalidateQueries({ queryKey: ["store-value-products"] });
        navigate("/home-page/store-value");
      } else {
        toast.error(res?.message?.[lang === 'ar' ? 'arabic' : 'english'] || t("common.error"));
      }
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  const products = data?.data?.products || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleAddProducts = () => {
    if (selectedIds.length === 0) return;
    addProductsMutation.mutate(selectedIds);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-[1600px] mx-auto p-6 md:p-10">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/home-page/store-value")}
              className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all active:scale-95 group"
            >
              <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl shadow-blue-500/20">
                <PackagePlus size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent italic">
                  {t("storeValue.add.title")}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {t("storeValue.add.subtitle")}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddProducts}
            disabled={selectedIds.length === 0 || addProductsMutation.isPending}
            className={`px-8 py-3.5 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 shadow-xl ${
              selectedIds.length > 0
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 active:scale-95"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
            }`}
          >
            {addProductsMutation.isPending ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <CheckCircle2 size={20} />
            )}
            <span>
              {selectedIds.length > 0 
                ? t("storeValue.add.submitButton", { count: selectedIds.length }) 
                : t("common.add")}
            </span>
          </button>
        </div>

        {/* Global Toolbar */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-[2rem] p-4 mb-8 border border-white/20 dark:border-slate-700 shadow-xl flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder={t("storeValue.add.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-100/50 dark:bg-slate-900/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none font-medium text-slate-700 dark:text-slate-200"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="px-6 py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all border border-slate-200/50 dark:border-slate-600/50"
            >
              {selectedIds.length === products.length && products.length > 0 
                ? t("storeValue.add.deselectAll") 
                : t("storeValue.add.selectAll")}
            </button>
            <button
              onClick={() => refetch()}
              className="p-3.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              <RefreshCw size={20} className={isFetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 italic">
            {[...Array(pageSize)].map((_, i) => (
              <div key={i} className="h-[420px] bg-white dark:bg-slate-800/50 rounded-3xl animate-pulse border border-slate-200 dark:border-slate-700" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-20 text-center bg-white dark:bg-slate-800/50 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
            <div className="p-6 bg-red-100 dark:bg-red-900/20 rounded-full w-fit mx-auto mb-6">
              <Package size={64} className="text-red-500 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 italic underline decoration-red-500 decoration-4 underline-offset-8">
              Oops! Failed to load products
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto font-medium leading-relaxed">
              We couldn't retrieve the product list. Please check your connection and try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-10 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-black shadow-xl shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-1 transition-all active:scale-95"
            >
              Retry Connection
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center italic bg-white dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
            <ShoppingBag size={80} className="mx-auto text-slate-300 mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Products Found</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Try searching for something else or check your catalog.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => toggleSelect(product.id)}
                  className={`group relative bg-white dark:bg-slate-800 rounded-3xl p-4 border transition-all duration-500 cursor-pointer flex flex-col hover:shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 ${
                    selectedIds.includes(product.id)
                      ? "border-blue-500 ring-4 ring-blue-500/10 shadow-blue-500/10 translate-y-[-8px]"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Holder */}
                  <div className="relative aspect-square rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden mb-6">
                    <img
                      src={product.image}
                      alt={lang === 'ar' ? product.title.arabic : product.title.english}
                      className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                        selectedIds.includes(product.id) ? "scale-105 saturate-[1.2]" : ""
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x600/e2e8f0/94a3b8?text=Product";
                      }}
                    />
                    
                    {/* Selection Checkbox Overlay */}
                    <div className={`absolute top-3 left-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                      selectedIds.includes(product.id)
                        ? "bg-blue-600 text-white scale-110 rotate-0"
                        : "bg-white/90 dark:bg-slate-800/90 text-slate-400 opacity-50 group-hover:opacity-100 scale-100 -rotate-12"
                    }`}>
                      {selectedIds.includes(product.id) ? (
                        <CheckSquare size={18} strokeWidth={3} />
                      ) : (
                        <Square size={18} strokeWidth={3} />
                      )}
                    </div>

                    {/* Badge */}
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase tracking-widest">
                       SKU: {product.sku}
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 px-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-2 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                      {lang === 'ar' ? product.title.arabic : product.title.english}
                    </h3>
                    
                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Price</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            {product.offerPrice ? product.offerPrice : product.price}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">EGP</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                         <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">In Stock</span>
                         <span className={`text-lg font-black ${product.stockQuantity < 10 ? "text-rose-500" : "text-emerald-500"}`}>
                           {product.stockQuantity}
                         </span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Ripple effect */}
                  {selectedIds.includes(product.id) && (
                    <div className="absolute inset-0 border-2 border-blue-500/50 rounded-3xl pointer-events-none animate-pulse" />
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Container */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-xl italic border border-slate-100 dark:border-slate-800">
               <div className="text-sm font-black text-slate-500 dark:text-slate-400 tracking-tight">
                 Showing <span className="text-blue-600 underline">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-blue-600 underline">{Math.min(currentPage * pageSize, totalItems)}</span> of {totalItems} Catalog Products
               </div>
               
               <div className="flex items-center gap-2">
                 <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 transition-all font-black"
                 >
                   <ChevronLeft size={20} />
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
                         className={`w-12 h-12 rounded-2xl font-black transition-all shadow-lg ${
                           currentPage === pageNum
                             ? "bg-blue-600 text-white shadow-blue-500/30 scale-110"
                             : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
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
                    className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 transition-all font-black"
                 >
                   <ChevronRight size={20} />
                 </button>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
