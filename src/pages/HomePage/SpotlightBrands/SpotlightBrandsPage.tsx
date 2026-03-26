import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Image as ImageIcon,
  TrendingUp,
  Award,
  Clock,
  ChevronLeft,
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
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  GetSpecifiedMethod,
  DeleteMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";

interface SpotlightBrand {
  id: number;
  displayOrder: number;
  startDate: string | null;
  endDate: string | null;
  brand: {
    id: number;
    title: {
      arabic: string;
      english: string;
    };
    image: string;
  };
}

interface SpotlightBrandsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: SpotlightBrand[];
  totalItems?: number;
  totalPages?: number;
}

export default function SpotlightBrandsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    brand: SpotlightBrand | null;
  }>({
    isOpen: false,
    brand: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"order" | "name" | "date">("order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSpotlightBrands = async (): Promise<SpotlightBrand[]> => {
    try {
      const response = (await GetSpecifiedMethod(
        "home-page/admin/spotlight-brands",
        lang
      )) as SpotlightBrandsResponse;

      return response.data || [];
    } catch (error) {
      console.error("Error fetching spotlight brands:", error);
      return [];
    }
  };

  const {
    data: brands = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<SpotlightBrand[], Error>({
    queryKey: ["spotlight-brands", lang],
    queryFn: fetchSpotlightBrands,
  });

  const handleRefresh = () => {
    refetch();
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      DeleteMethod("home-page/admin/spotlight-brands", id.toString(), lang),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spotlight-brands"] });
      toast.success(t("spotlightBrands.delete.messages.deleteSuccess"));
      setDeleteDialog({ isOpen: false, brand: null });
    },
    onError: () => {
      toast.error(t("spotlightBrands.delete.messages.deleteFailed"));
    },
  });

  const handleDelete = () => {
    if (deleteDialog.brand) {
      deleteMutation.mutate(deleteDialog.brand.id);
    }
  };

  // Filter and sort brands
  const filteredBrands = brands.filter(brand => {
    const brandTitle = lang === "ar" 
      ? brand.brand.title?.arabic 
      : brand.brand.title?.english;
    return brandTitle?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || false;
  }).sort((a, b) => {
    if (sortBy === "order") {
      return sortOrder === "asc" 
        ? a.displayOrder - b.displayOrder 
        : b.displayOrder - a.displayOrder;
    } else if (sortBy === "name") {
      const nameA = lang === "ar" ? a.brand.title?.arabic : a.brand.title?.english;
      const nameB = lang === "ar" ? b.brand.title?.arabic : b.brand.title?.english;
      return sortOrder === "asc" 
        ? nameA.localeCompare(nameB) 
        : nameB.localeCompare(nameA);
    } else {
      const dateA = new Date(a.startDate || a.endDate || 0).getTime();
      const dateB = new Date(b.startDate || b.endDate || 0).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getActiveStatus = (brand: SpotlightBrand) => {
    const now = new Date();
    const start = brand.startDate ? new Date(brand.startDate) : null;
    const end = brand.endDate ? new Date(brand.endDate) : null;
    
    if (start && now < start) return "upcoming";
    if (end && now > end) return "expired";
    return "active";
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "upcoming": return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
      case "expired": return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "active": return <Sparkles size={12} />;
      case "upcoming": return <Clock size={12} />;
      case "expired": return <EyeOff size={12} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
                  <Star size={32} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {t("spotlightBrands.title")}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                  {t("spotlightBrands.description")}
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
                onClick={() => navigate("/home-page/spotlight-brands/create")}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 active:scale-95"
              >
                <Plus size={18} />
                <span>{t("common.add")}</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Brands</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{brands.length}</p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                  <Star size={24} className="text-indigo-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {brands.filter(b => getActiveStatus(b) === "active").length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                  <Sparkles size={24} className="text-emerald-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Upcoming</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {brands.filter(b => getActiveStatus(b) === "upcoming").length}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <Clock size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Expired</p>
                  <p className="text-3xl font-bold text-slate-500 dark:text-slate-400 mt-1">
                    {brands.filter(b => getActiveStatus(b) === "expired").length}
                  </p>
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
                placeholder={t("spotlightBrands.searchPlaceholder") || "Search by brand name..."}
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
                <option value="date">Sort by Date</option>
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
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 animate-pulse border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/4 mb-2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full w-fit mx-auto mb-6">
              <Star size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("spotlightBrands.errorTitle")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t("spotlightBrands.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all active:scale-95"
            >
              {t("spotlightBrands.tryAgain")}
            </button>
          </div>
        )}

        {/* Brands Grid */}
        {!isLoading && !isError && (
          <>
            <div className="space-y-4">
              {paginatedBrands.map((item, index) => {
                const status = getActiveStatus(item);
                const brandTitle = lang === "ar" 
                  ? item.brand.title?.arabic 
                  : item.brand.title?.english;
                
                return (
                  <div
                    key={item.id}
                    className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-[1px] -z-10" />
                    
                    <div className="relative p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Image */}
                        <div className="flex-shrink-0">
                          {item.brand.image ? (
                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white border-2 border-slate-100 dark:border-slate-700 shadow-md">
                              <img
                                src={import.meta.env.VITE_IMAGE_BASE_URL + "/" + item.brand.image}
                                alt={brandTitle}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/200x200/e2e8f0/94a3b8?text=Brand";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-500/30">
                              <Star size={32} className="text-indigo-400" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                  {brandTitle}
                                </h3>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(status)}`}>
                                  {getStatusIcon(status)}
                                  <span className="uppercase">{status}</span>
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                  <Award size={14} />
                                  <span>Order #{item.displayOrder}</span>
                                </div>
                                {item.startDate && (
                                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                    <Calendar size={14} />
                                    <span>Start: {new Date(item.startDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {item.endDate && (
                                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                    <Calendar size={14} />
                                    <span>End: {new Date(item.endDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate(`/home-page/spotlight-brands/edit/${item.id}`)}
                                className="group/btn p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-500/10 dark:to-indigo-500/10 dark:hover:from-blue-500/20 dark:hover:to-indigo-500/20 text-blue-600 dark:text-blue-400 rounded-xl transition-all border border-blue-200/50 dark:border-blue-500/20 hover:scale-110"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  const brandToDelete = brands.find(b => b.id === item.id);
                                  if (brandToDelete) {
                                    setDeleteDialog({ isOpen: true, brand: brandToDelete });
                                  }
                                }}
                                className="group/btn p-2.5 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 dark:from-red-500/10 dark:to-pink-500/10 dark:hover:from-red-500/20 dark:hover:to-pink-500/20 text-red-600 dark:text-red-400 rounded-xl transition-all border border-red-200/50 dark:border-red-500/20 hover:scale-110"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredBrands.length === 0 && (
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
                <div className="p-6 bg-slate-100 dark:bg-slate-700 rounded-full w-fit mx-auto mb-6">
                  <Star size={64} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No spotlight brands found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  {searchTerm 
                    ? "Try adjusting your search criteria"
                    : "Get started by adding your first spotlight brand"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate("/home-page/spotlight-brands/create")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    <Plus size={18} />
                    Add Spotlight Brand
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {filteredBrands.length > 0 && (
              <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBrands.length)} of {filteredBrands.length} items
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
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Dialog */}
        {deleteDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-300">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t("spotlightBrands.delete.title")}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  {t("spotlightBrands.delete.description")}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteDialog({ isOpen: false, brand: null })}
                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? "Deleting..." : t("common.delete")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}