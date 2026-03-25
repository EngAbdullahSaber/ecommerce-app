import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Layers,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  GripVertical,
  TrendingUp,
  Award,
  Calendar,
  Hash,
  Star,
  ChevronRight,
  Search,
  X,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  GetSpecifiedMethod,
  DeleteMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { DeleteDialog } from "../../../components/shared/DeleteDialog";
import { motion, AnimatePresence } from "framer-motion";

interface HomeCategory {
  id: number;
  displayOrder: number;
  type: string;
  withBestSeller: boolean;
  categoryId: number;
  category: {
    id: number;
    title: {
      arabic: string;
      english: string;
    };
    image: string;
  };
}

interface HomeCategoriesResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: HomeCategory[];
}

export default function HomeCategoriesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    item: HomeCategory | null;
  }>({
    isOpen: false,
    item: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
   const [sortBy, setSortBy] = useState<"order" | "name">("order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchHomeCategories = async (): Promise<HomeCategory[]> => {
    try {
      const response = (await GetSpecifiedMethod(
        "home-page/admin/home-categories",
        lang
      )) as HomeCategoriesResponse;

      if (!response || response.code !== 200) {
        throw new Error(
          response?.message?.[lang === "ar" ? "arabic" : "english"] || 
          t("homeCategories.errorMessage")
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching home categories:", error);
      toast.error(t("homeCategories.errorMessage"));
      return [];
    }
  };

  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["home-categories", lang],
    queryFn: fetchHomeCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => DeleteMethod("home-page/admin/home-categories", id.toString(), lang),
    onSuccess: () => {
      toast.success(t("common.success"));
      queryClient.invalidateQueries({ queryKey: ["home-categories"] });
      setDeleteDialog({ isOpen: false, item: null });
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleCreate = () => {
    navigate("/home-page/home-categories/create");
  };

  const handleEdit = (id: number) => {
    navigate(`/home-page/home-categories/edit/${id}`);
  };

  const handleDelete = (item: HomeCategory) => {
    setDeleteDialog({ isOpen: true, item });
  };

  // Filter and sort categories
  const filteredCategories = categories.filter(category => {
    const name = lang === "ar" 
      ? category.category.title.arabic 
      : category.category.title.english;
    const matchesSearch = name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "order") {
      return sortOrder === "asc" 
        ? a.displayOrder - b.displayOrder 
        : b.displayOrder - a.displayOrder;
    } else {
      const nameA = lang === "ar" ? a.category.title.arabic : a.category.title.english;
      const nameB = lang === "ar" ? b.category.title.arabic : b.category.title.english;
      return sortOrder === "asc" 
        ? nameA.localeCompare(nameB) 
        : nameB.localeCompare(nameA);
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categoryCount = categories.filter(c => c.type === "CATEGORY").length;
  const brandCount = categories.filter(c => c.type === "BRAND").length;
  const withBestSellerCount = categories.filter(c => c.withBestSeller).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
                  <Layers size={32} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {t("homeCategories.title")}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                  {t("homeCategories.description")}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="group relative px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700 disabled:opacity-50"
              >
                <RefreshCw 
                  size={18} 
                  className={`${isLoading ? "animate-spin" : "group-hover:rotate-180"} transition-all duration-500`} 
                />
              </button>

              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 active:scale-95"
              >
                <Plus size={18} />
                <span>{t("common.add") || "Add Category"}</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Items</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{categories.length}</p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                  <Layers size={24} className="text-indigo-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Categories</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{categoryCount}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <TrendingUp size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Brands</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{brandCount}</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                  <Award size={24} className="text-purple-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Best Sellers</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{withBestSellerCount}</p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                  <Star size={24} className="text-emerald-500" />
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
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t("homeCategories.searchPlaceholder") || "Search by name..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
            
      

            {/* Sort Controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="order">Sort by Order</option>
                <option value="name">Sort by Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {sortOrder === "asc" ? <SortAsc size={20} /> : <SortDesc size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full w-fit mx-auto mb-6">
              <Layers size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("homeCategories.errorTitle")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t("homeCategories.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all active:scale-95"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && !isError && (
          <>
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {paginatedCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                      {/* Gradient Border Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-[1px] -z-10" />
                      
                      <div className="relative p-6">
                        <div className="flex items-start gap-4">
                          {/* Image */}
                          <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                            <img
                              src={import.meta.env.VITE_IMAGE_BASE_URL + "/" + category.category.image}
                              alt={lang === "ar" ? category.category.title.arabic : category.category.title.english}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/200x200/e2e8f0/94a3b8?text=Category";
                              }}
                            />
                            {/* Order Badge */}
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-xs font-bold text-white">{category.displayOrder}</span>
                            </div>
                          </div>

                          <div className="flex-1">
                            {/* Type Badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                category.type === "CATEGORY"
                                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                                  : "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                              }`}>
                                {category.type === "CATEGORY" ? "Category" : "Brand"}
                              </span>
                              {category.withBestSeller && (
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <Sparkles size={10} />
                                  Best Seller
                                </span>
                              )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                              {lang === "ar" ? category.category.title.arabic : category.category.title.english}
                            </h3>
                            
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                              <Hash size={10} />
                              <span>ID: {category.category.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(category.id)}
                            className="p-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="ml-auto text-slate-300 dark:text-slate-600 cursor-move">
                            <GripVertical size={16} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
                <div className="p-6 bg-slate-100 dark:bg-slate-700 rounded-full w-fit mx-auto mb-6">
                  <Layers size={64} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No categories found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  {searchTerm || typeFilter !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by adding your first category"}
                </p>
                {!searchTerm   && (
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    <Plus size={18} />
                    Add Category
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {filteredCategories.length > 0 && (
              <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} items
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-lg font-medium transition-all ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
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
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Dialog */}
        <DeleteDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, item: null })}
          onConfirm={() => {
            if (deleteDialog.item) {
              deleteMutation.mutate(deleteDialog.item.id);
            }
          }}
          title={t("common.deleteConfirm")}
          description={t("common.deleteWarning")}
          itemName={
            deleteDialog.item
              ? lang === "ar"
                ? deleteDialog.item.category.title.arabic
                : deleteDialog.item.category.title.english
              : ""
          }
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}