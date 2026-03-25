import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  RefreshCw,
  Mail,
  Phone,
  Package,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  Award,
  Calendar,
  Star,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Sparkles,
  ShoppingBag,
  Clock,
  Crown
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/axios";
import {
  GetSpecifiedMethod,
  UpdateMethod,
  DeleteMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { motion, AnimatePresence } from "framer-motion";

interface InfluencerProduct {
  id: number;
  product: {
    id: number;
    name: {
      arabic: string;
      english: string;
    };
    basePrice: string;
    offerPrice: string | null;
  };
}

interface Influencer {
  id: number;
  disPlayName: {
    arabic: string;
    english: string;
  };
  image: string;
  isActive: boolean;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  products: InfluencerProduct[];
}

interface InfluencersResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: Influencer[];
}

export default function InfluencersPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    item: Influencer | null;
  }>({
    isOpen: false,
    item: null,
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name" | "products" | "id">("name");
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

  const fetchInfluencers = async (): Promise<Influencer[]> => {
    try {
      const response = (await GetSpecifiedMethod(
        "home-page/admin/influencers",
        lang
      )) as InfluencersResponse;
      return response.data || [];
    } catch (error) {
      console.error("Error fetching influencers:", error);
      return [];
    }
  };

  const {
    data: influencers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["influencers", lang],
    queryFn: fetchInfluencers,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await UpdateMethod("home-page/admin/influencers", { isActive }, id.toString(), lang);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      toast.success(t("common.success"));
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      DeleteMethod("home-page/admin/influencers", id.toString(), lang),
    onSuccess: () => {
      toast.success(t("common.success"));
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      setDeleteDialog({ isOpen: false, item: null });
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: ({ influencerId, productId }: { influencerId: number; productId: number }) =>
      api.delete(`home-page/admin/influencers/${influencerId}/products`, {
        data: { productIds: [productId] },
        headers: { lang },
      }),
    onSuccess: () => {
      toast.success(t("common.success"));
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  const handleRefresh = () => {
    refetch();
  };

  // Filter and sort influencers
  const filteredInfluencers = influencers.filter(influencer => {
    const name = lang === "ar" 
      ? influencer.disPlayName?.arabic 
      : influencer.disPlayName?.english;
    const matchesSearch = name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === "all" 
      ? true 
      : statusFilter === "active" 
        ? influencer.isActive 
        : !influencer.isActive;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "name") {
      const nameA = lang === "ar" ? a.disPlayName?.arabic : a.disPlayName?.english;
      const nameB = lang === "ar" ? b.disPlayName?.arabic : b.disPlayName?.english;
      return sortOrder === "asc" 
        ? nameA.localeCompare(nameB) 
        : nameB.localeCompare(nameA);
    } else if (sortBy === "products") {
      return sortOrder === "asc" 
        ? (a.products?.length || 0) - (b.products?.length || 0)
        : (b.products?.length || 0) - (a.products?.length || 0);
    } else {
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredInfluencers.length / itemsPerPage);
  const paginatedInfluencers = filteredInfluencers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = influencers.filter(i => i.isActive).length;
  const inactiveCount = influencers.filter(i => !i.isActive).length;
  const totalProducts = influencers.reduce((sum, i) => sum + (i.products?.length || 0), 0);

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
                  <Users size={32} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {t("influencers.title")}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                  {t("influencers.description")}
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
                onClick={() => navigate("/home-page/influencers/create")}
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
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Influencers</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{influencers.length}</p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                  <Crown size={24} className="text-indigo-500" />
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
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Products</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{totalProducts}</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                  <ShoppingBag size={24} className="text-purple-500" />
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
                placeholder={t("influencers.searchPlaceholder") || "Search by name..."}
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
            
            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  statusFilter === "all"
                    ? "bg-indigo-500 text-white shadow-md"
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

            {/* Sort Controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="name">Sort by Name</option>
                <option value="products">Sort by Products</option>
                <option value="id">Sort by ID</option>
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
                className="h-[500px] rounded-2xl bg-white dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full w-fit mx-auto mb-6">
              <Users size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("influencers.errorTitle")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t("influencers.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all active:scale-95"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {paginatedInfluencers.map((influencer, index) => (
                  <motion.div
                    key={influencer.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-[1px] -z-10" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => toggleStatusMutation.mutate({ id: influencer.id, isActive: !influencer.isActive })}
                        disabled={toggleStatusMutation.isPending}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                          influencer.isActive
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${influencer.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                        {influencer.isActive ? "Active" : "Inactive"}
                      </button>
                    </div>

                    {/* Profile Section */}
                    <div className="relative p-6 pt-8">
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-lg" />
                          <img
                            src={import.meta.env.VITE_IMAGE_BASE_URL + "/" + influencer.image}
                            alt={lang === "ar" ? influencer.disPlayName?.arabic : influencer.disPlayName?.english}
                            className="w-28 h-28 rounded-2xl object-cover border-4 border-white dark:border-slate-700 shadow-lg relative"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.disPlayName?.[lang === 'ar' ? 'arabic' : 'english'] || 'I')}&background=6366f1&color=fff&size=128`;
                            }}
                          />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                          {lang === "ar" ? influencer.disPlayName?.arabic : influencer.disPlayName?.english}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {influencer.user.firstName} {influencer.user.lastName}
                        </p>
                        
                        {/* Stats Badges */}
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <Star size={12} className="text-amber-500" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              ID: {influencer.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <Package size={12} className="text-indigo-500" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              {influencer.products?.length || 0} Products
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="mt-6 space-y-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                            <Mail size={14} className="text-indigo-500" />
                          </div>
                          <span className="flex-1 text-slate-600 dark:text-slate-300 truncate">
                            {influencer.user.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                            <Phone size={14} className="text-indigo-500" />
                          </div>
                          <span className="text-slate-600 dark:text-slate-300">
                            {influencer.user.phone}
                          </span>
                        </div>
                      </div>

                      {/* Featured Products */}
                      {influencer.products && influencer.products.length > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            <ShoppingBag size={14} />
                            <span>Featured Products</span>
                          </div>
                          <div className="space-y-2">
                            {influencer.products.slice(0, 2).map((prod) => (
                              <div
                                key={prod.id}
                                className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                                    {lang === "ar" ? prod.product.name.arabic : prod.product.name.english}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {prod.product.offerPrice ? (
                                      <>
                                        <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                          {prod.product.offerPrice} SAR
                                        </span>
                                        <span className="text-slate-400 line-through text-[10px]">
                                          {prod.product.basePrice}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                                        {prod.product.basePrice} SAR
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteProductMutation.mutate({ 
                                    influencerId: influencer.id, 
                                    productId: prod.product.id 
                                  })}
                                  disabled={deleteProductMutation.isPending}
                                  className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                            {influencer.products.length > 2 && (
                              <div className="text-center pt-1">
                                <span className="text-[10px] font-medium text-indigo-500 hover:text-indigo-600 cursor-pointer">
                                  + {influencer.products.length - 2} more products
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-2">
                        <button
                          onClick={() => navigate(`/home-page/influencers/edit/${influencer.id}`)}
                          className="flex items-center justify-center gap-1.5 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => navigate(`/home-page/influencers/products/${influencer.id}`)}
                          className="flex items-center justify-center gap-1.5 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all"
                        >
                          <Package size={12} />
                          <span>Products</span>
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, item: influencer })}
                          className="flex items-center justify-center gap-1.5 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredInfluencers.length === 0 && (
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
                <div className="p-6 bg-slate-100 dark:bg-slate-700 rounded-full w-fit mx-auto mb-6">
                  <Users size={64} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No influencers found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by adding your first influencer"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <button
                    onClick={() => navigate("/home-page/influencers/create")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    <Plus size={18} />
                    Add Influencer
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {filteredInfluencers.length > 0 && (
              <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInfluencers.length)} of {filteredInfluencers.length} influencers
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
                  {t("influencers.deleteTitle")}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {t("influencers.deleteDescription")}
                </p>
                {deleteDialog.item && (
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg mb-6">
                    {lang === "ar" 
                      ? deleteDialog.item.disPlayName.arabic 
                      : deleteDialog.item.disPlayName.english}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteDialog({ isOpen: false, item: null })}
                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={() => {
                      if (deleteDialog.item) {
                        deleteMutation.mutate(deleteDialog.item.id);
                      }
                    }}
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