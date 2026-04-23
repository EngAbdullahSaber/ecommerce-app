import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Layout,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Calendar,
  Hash,
  MoveVertical,
  Sparkles,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  GetSpecifiedMethod,
  UpdateMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { useTranslation } from "react-i18next";

interface Section {
  id: number;
  section: string;
  isVisible: boolean;
  displayOrder: number;
  updatedAt: string;
}

interface SectionsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: Section[];
}

export default function HomePageSectionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "visible" | "hidden">("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState<"order" | "name" | "updated">("order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSections = async (): Promise<Section[]> => {
    try {
      const response = (await GetSpecifiedMethod(
        "home-page/sections",
        "en"
      )) as SectionsResponse;

      if (!response || response.code !== 200) {
        throw new Error(
          response?.message?.english || t("homePageSections.errorMessage")
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error(t("homePageSections.errorMessage"));
      return [];
    }
  };

  const {
    data: sections = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["home-page-sections"],
    queryFn: fetchSections,
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, isVisible, displayOrder }: { id: number; isVisible?: boolean; displayOrder?: number }) => {
      const data: any = {};
      if (isVisible !== undefined) data.isVisible = isVisible;
      if (displayOrder !== undefined) data.displayOrder = displayOrder;
      return await UpdateMethod("home-page/sections", data, id.toString(), "en");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-page-sections"] });
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

  // Filter and sort sections
  const filteredSections = sections
    .filter((item) => {
      const matchesSearch = item.section.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" 
        ? true 
        : statusFilter === "visible" 
          ? item.isVisible 
          : !item.isVisible;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "order") {
        return sortOrder === "asc" ? a.displayOrder - b.displayOrder : b.displayOrder - a.displayOrder;
      } else if (sortBy === "name") {
        return sortOrder === "asc" 
          ? a.section.localeCompare(b.section) 
          : b.section.localeCompare(a.section);
      } else {
        return sortOrder === "asc" 
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredSections.length / rowsPerPage);
  const paginatedSections = filteredSections.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const visibleCount = sections.filter(s => s.isVisible).length;
  const hiddenCount = sections.filter(s => !s.isVisible).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                  <Layout size={32} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                  {t("homePageSections.title")}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                  {t("homePageSections.description")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="group relative px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700 disabled:opacity-50"
              >
                <RefreshCw 
                  size={18} 
                  className={`${isLoading ? "animate-spin" : "group-hover:rotate-180"} transition-all duration-500`} 
                />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Sections</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{sections.length}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <Layers size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Visible</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{visibleCount}</p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                  <Eye size={24} className="text-emerald-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Hidden</p>
                  <p className="text-3xl font-bold text-slate-500 dark:text-slate-400 mt-1">{hiddenCount}</p>
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
            <div className="flex-1">
              <input
                type="text"
                placeholder={t("homePageSections.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  statusFilter === "all"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("visible")}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  statusFilter === "visible"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                Visible
              </button>
              <button
                onClick={() => setStatusFilter("hidden")}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  statusFilter === "hidden"
                    ? "bg-slate-600 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                Hidden
              </button>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="order">Sort by Order</option>
                <option value="name">Sort by Name</option>
                <option value="updated">Sort by Updated</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {sortOrder === "asc" ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full w-fit mx-auto mb-6">
              <Layout size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("homePageSections.errorTitle")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t("homePageSections.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all active:scale-95"
            >
              {t("homePageSections.tryAgain")}
            </button>
          </div>
        )}

        {/* Sections Grid */}
        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedSections.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-[1px] -z-10" />
                  
                  <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2.5 rounded-xl transition-all ${
                        item.isVisible 
                          ? "bg-emerald-50 dark:bg-emerald-500/10" 
                          : "bg-slate-50 dark:bg-slate-700/50"
                      }`}>
                        <Layout size={20} className={item.isVisible ? "text-emerald-500" : "text-slate-400"} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                          item.isVisible 
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                            : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                        }`}>
                          {item.isVisible ? "Visible" : "Hidden"}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Hash size={12} />
                          <span>Order {item.displayOrder}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                        {item.section.replace(/_/g, " ")}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={12} />
                        <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 rounded-xl p-1">
                          <button
                            onClick={() => updateSectionMutation.mutate({ 
                              id: item.id, 
                              displayOrder: Math.max(1, item.displayOrder - 1) 
                            })}
                            disabled={updateSectionMutation.isPending}
                            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-500 transition-all disabled:opacity-50"
                            title="Move up"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">
                            {item.displayOrder}
                          </span>
                          <button
                            onClick={() => updateSectionMutation.mutate({ 
                              id: item.id, 
                              displayOrder: item.displayOrder + 1 
                            })}
                            disabled={updateSectionMutation.isPending}
                            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-500 transition-all disabled:opacity-50"
                            title="Move down"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => updateSectionMutation.mutate({ 
                            id: item.id, 
                            isVisible: !item.isVisible 
                          })}
                          disabled={updateSectionMutation.isPending}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 ${
                            item.isVisible
                              ? "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
                          }`}
                        >
                          {item.isVisible ? (
                            <>
                              <EyeOff size={16} />
                            </>
                          ) : (
                            <>
                              <Eye size={16} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredSections.length === 0 && (
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full w-fit mx-auto mb-6">
                  <Layout size={48} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No sections found
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredSections.length > 0 && (
              <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  >
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                    <option value={16}>16</option>
                    <option value={24}>24</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {((currentPage - 1) * rowsPerPage) + 1} - {Math.min(currentPage * rowsPerPage, filteredSections.length)} of {filteredSections.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronUp size={16} className="rotate-180" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronDown size={16} className="rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}