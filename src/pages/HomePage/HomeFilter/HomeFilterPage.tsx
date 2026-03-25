import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Filter,
  RefreshCw,
  Edit2,
  Tag,
  Hash,
  Activity,
  ChevronRight,
  Trash2,
  Plus,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Settings,
  Eye,
  EyeOff,
  Clock,
  TrendingUp,
  Award,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  GetSpecifiedMethod,
  UpdateMethod,
  DeleteMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { UpdateForm } from "../../../components/shared/GenericUpdateForm/UpdateForm";
import { DeleteDialog } from "../../../components/shared/DeleteDialog";
import { FormField } from "../../../components/shared/GenericUpdateForm/types";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterOption {
  id: number;
  value: string;
  name: string;
  nameAr: string;
}

interface Option {
  id: number;
  image: string;
  filterOption: FilterOption;
}

interface FilterAttribute {
  id: number;
  name: string;
}

interface HomeFilterData {
  id: number;
  titleEn: string;
  titleAr: string;
  filterAttributeId: number;
  filterAttribute: FilterAttribute;
  options: Option[];
}

interface HomeFilterResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: HomeFilterData;
}

export default function HomeFilterPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchHomeFilter = async (): Promise<HomeFilterData | null> => {
    try {
      const response = (await GetSpecifiedMethod(
        "home-page/admin/home-filter",
        lang
      )) as HomeFilterResponse;

      if (!response || response.code !== 200) {
        throw new Error(
          response?.message?.[lang === "ar" ? "arabic" : "english"] || 
          t("homeFilter.errorMessage")
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching home filter:", error);
      toast.error(t("homeFilter.errorMessage"));
      return null;
    }
  };

  const {
    data: homeFilter,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["home-filter", lang],
    queryFn: fetchHomeFilter,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await DeleteMethod("home-page/admin/home-filter", id.toString(), lang);
    },
    onSuccess: () => {
      toast.success(t("common.success"));
      queryClient.invalidateQueries({ queryKey: ["home-filter"] });
      setIsDeleteOpen(false);
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(t("common.error"));
    },
  });

  const handleUpdateOption = async (id: any, data: any) => {
    return await UpdateMethod(
      "home-page/admin/home-filter/options",
      data,
      id.toString(),
      lang
    );
  };

  const optionFields: FormField[] = [
    {
      name: "image",
      label: t("banners.image") || "Option Image",
      type: "imageApi",
      required: true,
      cols: 12,
      imageUploadConfig: {
        uploadEndpoint: "/upload",
      },
      validation: z.string().min(1, "Image is required"),
    },
  ];

  const handleRefresh = () => {
    refetch();
  };

  // Filter options based on search
  const filteredOptions = homeFilter?.options.filter(option => {
    const name = lang === "ar" ? option.filterOption.nameAr : option.filterOption.name;
    const value = option.filterOption.value;
    return name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
           value.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-xl">
                  <Filter size={32} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 dark:from-white dark:via-indigo-100 dark:to-blue-100 bg-clip-text text-transparent">
                  {t("homeFilter.title")}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                  {t("homeFilter.description")}
                </p>
              </div>
            </div>

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
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="h-80 rounded-2xl bg-white dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-white dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full w-fit mx-auto mb-6">
              <Filter size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("homeFilter.errorTitle")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t("homeFilter.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all active:scale-95"
            >
              {t("homeFilter.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !homeFilter && (
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-700">
            <div className="p-6 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-500/20 dark:to-blue-500/20 rounded-full w-fit mx-auto mb-8">
              <Filter size={64} className="text-indigo-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {t("common.noData") || "No Home Filter Configured"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto">
              {t("homeFilter.emptyDescription") || "You haven't set up a main filter for your home page yet. Create one now to help users find products easily."}
            </p>
            <button
              onClick={() => navigate("/home-page/home-filter/create")}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 hover:scale-105 transition-all active:scale-95"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              {t("homeFilter.create.title").toUpperCase()}
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && homeFilter && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Main Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 overflow-hidden group"
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-[1px] -z-10" />
              
              <div className="relative p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="space-y-6">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                        <Hash size={14} className="text-indigo-500" />
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          ID: {homeFilter.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                        <Tag size={14} className="text-emerald-500" />
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {t("homeFilter.attribute")}: {homeFilter.filterAttribute.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                        <Layers size={14} className="text-blue-500" />
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {homeFilter.options.length} Options
                        </span>
                      </div>
                    </div>

                    {/* Titles */}
                    <div>
                      <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                        {lang === "ar" ? homeFilter.titleAr : homeFilter.titleEn}
                      </h2>
                      <p className="text-lg text-slate-500 dark:text-slate-400">
                        {lang === "ar" ? homeFilter.titleEn : homeFilter.titleAr}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                        <Settings size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Attribute ID: {homeFilter.filterAttributeId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsDeleteOpen(true)}
                      className="group/btn flex items-center justify-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-semibold transition-all active:scale-95"
                    >
                      <Trash2 size={18} className="group-hover/btn:rotate-12 transition-transform" />
                      <span>{t("common.delete")}</span>
                    </button>
                    <button
                      onClick={() => navigate(`/home-page/home-filter/edit/${homeFilter.id}`)}
                      className="group/btn flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95"
                    >
                      <Edit2 size={18} className="group-hover/btn:rotate-12 transition-transform" />
                      <span>{t("common.edit")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Options Section Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl">
                  <Sparkles size={20} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t("homeFilter.options")}
                </h3>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {homeFilter.options.length} Total
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Options Grid */}
            <AnimatePresence mode="popLayout">
              {filteredOptions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredOptions.map((option, index) => (
                    <motion.div
                      key={option.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                      {/* Gradient Border Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-[1px] -z-10" />
                      
                      {/* Image Container */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                        <img
                          src={import.meta.env.VITE_IMAGE_BASE_URL + "/" + option.image}
                          alt={lang === "ar" ? option.filterOption.nameAr : option.filterOption.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image";
                          }}
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            onClick={() => setEditingOption(option)}
                            className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-white/40 transition-all"
                          >
                            <ImagePlus size={16} />
                            Change Image
                          </button>
                        </div>
                        
                        {/* Value Badge */}
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
                          <span className="text-[10px] font-bold text-white uppercase">
                            {option.filterOption.value}
                          </span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4 text-center">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                          {lang === "ar" ? option.filterOption.nameAr : option.filterOption.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {lang === "ar" ? option.filterOption.name : option.filterOption.nameAr}
                        </p>
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-mono">ID: {option.filterOption.id}</span>
                            <ChevronRight size={12} className="text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
                  <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full w-fit mx-auto mb-4">
                    <Filter size={32} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    No options found matching your search
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {homeFilter && (
          <DeleteDialog
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={() => deleteMutation.mutate(homeFilter.id)}
            title={t("homeFilter.deleteTitle") || "Remove Filter"}
            description={t("homeFilter.deleteDescription") || "Are you sure you want to remove this home filter? This action cannot be undone."}
            itemName={lang === "ar" ? homeFilter.titleAr : homeFilter.titleEn}
            isLoading={deleteMutation.isPending}
          />
        )}

        {/* Edit Option Image Modal */}
        {editingOption && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl animate-in zoom-in-95 duration-300">
              <UpdateForm
                title={lang === "ar" ? editingOption.filterOption.nameAr : editingOption.filterOption.name}
                description={t("homeFilter.editOptionDescription") || "Update the image for this filter option"}
                fields={optionFields}
                entityId={editingOption.id}
                fetchData={async () => editingOption}
                onUpdate={handleUpdateOption}
                onCancel={() => setEditingOption(null)}
                afterSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["home-filter"] });
                  setTimeout(() => setEditingOption(null), 1500);
                }}
                submitLabel={t("common.save") || "Update Image"}
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