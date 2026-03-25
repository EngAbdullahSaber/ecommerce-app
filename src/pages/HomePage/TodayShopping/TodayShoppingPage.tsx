import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  Eye,
  EyeOff,
  RefreshCw,
  Image as ImageIcon,
  Calendar,
  Hash,
  Activity,
  Edit2,
  TrendingUp,
  Clock,
  Tag,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  Filter,
  Search,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  GetSpecifiedMethod,
  UpdateMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { UpdateForm } from "../../../components/shared/GenericUpdateForm/UpdateForm";
import { FormField } from "../../../components/shared/GenericUpdateForm/types";
import { z } from "zod";

interface TodayShoppingItem {
  id: number;
  titleEn: string;
  titleAr: string;
  key: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TodayShoppingResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: TodayShoppingItem[];
}

export default function TodayShoppingPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const queryClient = useQueryClient();
  const toast = useToast();
  const [editingItem, setEditingItem] = useState<TodayShoppingItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const editFields: FormField[] = [
    {
      name: "titleEn",
      label: t("todayShopping.edit.fields.titleEn"),
      type: "text",
      required: true,
      cols: 6,
      validation: z.string().min(1, "English title is required"),
      placeholder: "Enter English title",
    },
    {
      name: "titleAr",
      label: t("todayShopping.edit.fields.titleAr"),
      type: "text",
      required: true,
      cols: 6,
      validation: z.string().min(1, "Arabic title is required"),
      placeholder: "أدخل العنوان بالعربية",
    },
    {
      name: "image",
      label: t("todayShopping.edit.fields.image"),
      type: "imageApi",
      required: true,
      cols: 12,
      imageUploadConfig: {
        uploadEndpoint: "/upload",
        multiple: false,
      },
      validation: z.string().min(1, "Image is required"),
    },
  ];

  const handleUpdateItem = async (id: any, data: any) => {
    return await UpdateMethod(
      "home-page/admin/today-shopping",
      data,
      id.toString(),
      lang
    );
  };

  const fetchItems = async (): Promise<TodayShoppingItem[]> => {
    try {
      const response = (await GetSpecifiedMethod(
        "home-page/admin/today-shopping",
        lang
      )) as TodayShoppingResponse;

      if (!response || response.code !== 200) {
        throw new Error(
          response?.message?.[lang === "ar" ? "arabic" : "english"] || 
          t("todayShopping.errorMessage")
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching today shopping items:", error);
      toast.error(t("todayShopping.errorMessage"));
      return [];
    }
  };

  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["today-shopping-items", lang],
    queryFn: fetchItems,
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await UpdateMethod(
        "home-page/admin/today-shopping",
        { isActive },
        id.toString(),
        lang
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-shopping-items"] });
      toast.success(t("common.success"));
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(t("common.error"));
    },
  });

  const handleRefresh = () => {
    refetch();
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.titleEn.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      item.titleAr.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      item.key.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" ? true :
      statusFilter === "active" ? item.isActive :
      !item.isActive;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = items.filter(i => i.isActive).length;
  const inactiveCount = items.filter(i => !i.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-xl">
                  <ShoppingBag size={32} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-pink-900 to-rose-900 dark:from-white dark:via-pink-100 dark:to-rose-100 bg-clip-text text-transparent">
                  {t("todayShopping.title")}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                  {t("todayShopping.description")}
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="group relative px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:border-pink-300 dark:hover:border-pink-700 disabled:opacity-50"
            >
              <RefreshCw 
                size={18} 
                className={`${isLoading ? "animate-spin" : "group-hover:rotate-180"} transition-all duration-500`} 
              />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Items</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{items.length}</p>
                </div>
                <div className="p-3 bg-pink-50 dark:bg-pink-500/10 rounded-xl">
                  <ShoppingBag size={24} className="text-pink-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
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
                  <p className="text-3xl font-bold text-slate-500 dark:text-slate-400 mt-1">{inactiveCount}</p>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                  <EyeOff size={24} className="text-slate-500" />
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
                placeholder={t("todayShopping.searchPlaceholder") || "Search by title or key..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
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
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  statusFilter === "all"
                    ? "bg-pink-500 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  statusFilter === "active"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  statusFilter === "inactive"
                    ? "bg-slate-600 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                Inactive
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" 
                    ? "bg-white dark:bg-slate-600 shadow-md text-pink-600" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" 
                    ? "bg-white dark:bg-slate-600 shadow-md text-pink-600" 
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
          <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full w-fit mx-auto mb-6">
              <ShoppingBag size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("todayShopping.errorTitle")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t("todayShopping.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-medium hover:shadow-lg transition-all active:scale-95"
            >
              {t("todayShopping.tryAgain")}
            </button>
          </div>
        )}

        {/* Items Display */}
        {!isLoading && !isError && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-[1px] -z-10" />
                    
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <img
                        src={import.meta.env.VITE_IMAGE_BASE_URL + "/" + item.image}
                        alt={lang === "ar" ? item.titleAr : item.titleEn}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2 bg-white/95 dark:bg-slate-800/95 rounded-xl shadow-lg backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 transition-all hover:scale-110"
                          title="Edit item"
                        >
                          <Edit2 size={14} />
                        </button>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${
                          item.isActive 
                            ? "bg-emerald-500 text-white" 
                            : "bg-slate-500 text-white"
                        }`}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-pink-50 dark:bg-pink-500/10 rounded-lg">
                          <Tag size={12} className="text-pink-600 dark:text-pink-400" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                          {item.key.replace(/_/g, " ")}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                        {lang === "ar" ? item.titleAr : item.titleEn}
                      </h3>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Hash size={10} />
                          <span>ID: {item.id}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={10} />
                          <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => updateItemMutation.mutate({ id: item.id, isActive: !item.isActive })}
                        disabled={updateItemMutation.isPending}
                        className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 ${
                          item.isActive
                            ? "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-500 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                            : "bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:shadow-lg"
                        }`}
                      >
                        {item.isActive ? (
                          <>
                            <EyeOff size={14} />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye size={14} />
                            <span>Show</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Key</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Updated</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {paginatedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">#{item.id}</td>
                          <td className="px-6 py-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                              <img
                                src={import.meta.env.VITE_IMAGE_BASE_URL + "/" + item.image}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/48x48/e2e8f0/94a3b8?text=No";
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {lang === "ar" ? item.titleAr : item.titleEn}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                              {item.key}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                              item.isActive
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                            }`}>
                              {item.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingItem(item)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={16} className="text-slate-500" />
                              </button>
                              <button
                                onClick={() => updateItemMutation.mutate({ id: item.id, isActive: !item.isActive })}
                                disabled={updateItemMutation.isPending}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title={item.isActive ? "Hide" : "Show"}
                              >
                                {item.isActive ? (
                                  <EyeOff size={16} className="text-slate-500" />
                                ) : (
                                  <Eye size={16} className="text-slate-500" />
                                )}
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
            {filteredItems.length === 0 && (
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
                <div className="p-6 bg-slate-100 dark:bg-slate-700 rounded-full w-fit mx-auto mb-6">
                  <ShoppingBag size={64} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No items found
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "No items available"}
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredItems.length > 0 && (
              <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={18} />
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
                              ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md"
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
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl animate-in zoom-in-95 duration-300">
              <UpdateForm
                title={t("todayShopping.edit.title")}
                description={t("todayShopping.edit.description")}
                fields={editFields}
                entityId={editingItem.id}
                fetchData={async () => editingItem}
                onUpdate={handleUpdateItem}
                onCancel={() => setEditingItem(null)}
                afterSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["today-shopping-items"] });
                  setTimeout(() => setEditingItem(null), 1500);
                }}
                submitLabel={t("common.save") || "Save Changes"}
                cancelLabel={t("common.cancel") || "Cancel"}
                showBackButton={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}