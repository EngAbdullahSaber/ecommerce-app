import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Layout,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowUp,
  ArrowDown,
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
  const [statusFilter, setStatusFilter] = useState("all");

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
    mutationFn: async ({ id, isVisible, displayOrder }: { id: number; isVisible?: boolean, displayOrder?: number }) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl transform hover:rotate-6 transition-transform">
              <Layout size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {t("homePageSections.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("homePageSections.description")}
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 active:scale-95"
          >
            <RefreshCw size={20} className={`${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            {t("homePageSections.refresh")}
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 rounded-3xl bg-white/50 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-12 text-center border border-red-100 dark:border-red-900/30">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full w-fit mx-auto mb-6">
              <Layout size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("homePageSections.errorTitle")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t("homePageSections.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
            >
              {t("homePageSections.tryAgain")}
            </button>
          </div>
        )}

        {/* Sections Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...sections].sort((a, b) => a.displayOrder - b.displayOrder).map((item) => (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl border border-slate-200/60 dark:border-slate-700/60 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col justify-between"
              >
                {/* Background Decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                      <Layout size={24} className="text-slate-600 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                        item.isVisible 
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
                          : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                      }`}>
                        {item.isVisible ? t("homePageSections.status.visible") : t("homePageSections.status.hidden")}
                      </span>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                        Order #{item.displayOrder}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-words">
                      {item.section.replace(/_/g, " ")}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 uppercase font-bold tracking-tighter">
                      ID: {item.id} • Updated {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="relative mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                    <button
                      onClick={() => updateSectionMutation.mutate({ id: item.id, displayOrder: Math.max(1, item.displayOrder - 1) })}
                      disabled={updateSectionMutation.isPending}
                      className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-blue-500 transition-all active:scale-75 disabled:opacity-50"
                    >
                      <ArrowDown size={18} />
                    </button>
                    <span className="w-8 text-center font-black text-slate-700 dark:text-slate-300 text-sm">
                      {item.displayOrder}
                    </span>
                    <button
                      onClick={() => updateSectionMutation.mutate({ id: item.id, displayOrder: item.displayOrder + 1 })}
                      disabled={updateSectionMutation.isPending}
                      className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-blue-500 transition-all active:scale-75 disabled:opacity-50"
                    >
                      <ArrowUp size={18} />
                    </button>
                  </div>

                  <button
                    onClick={() => updateSectionMutation.mutate({ id: item.id, isVisible: !item.isVisible })}
                    disabled={updateSectionMutation.isPending}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 ${
                      item.isVisible
                        ? "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        : "bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
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
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && sections.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-12 text-center border border-slate-100 dark:border-slate-700/50 uppercase tracking-widest font-black text-slate-400">
            {t("homePageSections.noSections")}
          </div>
        )}
      </div>
    </div>
  );
}

