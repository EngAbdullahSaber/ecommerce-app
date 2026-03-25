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
} from "lucide-react";
import { useState } from "react";
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
      // Optional: navigate away if the current view should no longer exist
      // navigate("/dashboard");
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
      validation: z.string().min(1),
    },
  ];

  const editFields: FormField[] = [
    {
      name: "titleEn",
      label: t("homeFilter.edit.fields.titleEn"),
      type: "text",
      required: true,
      cols: 6,
      validation: z.string().min(1),
    },
    {
      name: "titleAr",
      label: t("homeFilter.edit.fields.titleAr"),
      type: "text",
      required: true,
      cols: 6,
      validation: z.string().min(1),
    },
    {
        name: "filterAttributeId",
        label: t("homeFilter.edit.fields.filterAttribute"),
        type: "paginatedSelect",
        required: true,
        cols: 12,
        paginatedSelectConfig: {
            endpoint: "filter-attributes",
            labelKey: "name",
            valueKey: "id",
        },
        validation: z.number(),
    }
  ];

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-xl transform hover:rotate-6 transition-transform">
              <Filter size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {t("homeFilter.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("homeFilter.description")}
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold shadow-sm hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 active:scale-95"
          >
            <RefreshCw size={20} className={`${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            {t("homeFilter.refresh")}
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="h-64 rounded-[2.5rem] bg-white/50 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-48 rounded-3xl bg-white/50 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-12 text-center border border-red-100 dark:border-red-900/30">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full w-fit mx-auto mb-6">
              <Filter size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("homeFilter.errorTitle")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t("homeFilter.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
            >
              {t("homeFilter.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !homeFilter && (
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl p-16 text-center border border-slate-200/60 dark:border-slate-700/60 animate-in fade-in zoom-in duration-700">
            <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-full w-fit mx-auto mb-8">
              <Filter size={64} className="text-indigo-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
              {t("common.noData") || "No Home Filter Configured"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-10 max-w-md mx-auto text-lg">
              {t("homeFilter.emptyDescription") || "You haven't set up a main filter for your home page yet. Create one now to help users find products easily."}
            </p>
            <button
              onClick={() => navigate("/home-page/home-filter/create")}
              className="group flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-[2rem] font-black text-xl shadow-xl hover:shadow-indigo-500/40 hover:scale-105 transition-all active:scale-95 mx-auto"
            >
              <Plus size={28} className="group-hover:rotate-90 transition-transform duration-500" />
              {t("homeFilter.create.title").toUpperCase()}
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && homeFilter && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Main Info Card */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 dark:border-slate-700/60 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Filter size={120} className="text-slate-900 dark:text-white" />
              </div>
              
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black tracking-widest uppercase">
                      ID: {homeFilter.id}
                    </div>
                    <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black tracking-widest uppercase">
                      {t("homeFilter.attribute")}: {homeFilter.filterAttribute.name}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        {lang === "ar" ? homeFilter.titleAr : homeFilter.titleEn}
                    </h2>
                    <p className="text-xl font-medium text-slate-400 dark:text-slate-500">
                        {lang === "ar" ? homeFilter.titleEn : homeFilter.titleAr}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-slate-600 dark:text-slate-400">
                      <Tag size={16} />
                      <span className="font-bold text-sm">{homeFilter.filterAttribute.name}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-slate-600 dark:text-slate-400">
                      <Hash size={16} />
                      <span className="font-bold text-sm">Attr ID: {homeFilter.filterAttributeId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsDeleteOpen(true)}
                    className="flex items-center justify-center gap-3 px-6 py-5 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-[2rem] font-black text-lg shadow-sm hover:shadow-xl hover:bg-rose-100 transition-all active:scale-95 group"
                  >
                    <Trash2 size={24} className="group-hover:rotate-12 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate(`/home-page/home-filter/edit/${homeFilter.id}`)}
                    className="flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all active:scale-95 group"
                  >
                    <Edit2 size={24} className="group-hover:rotate-12 transition-transform" />
                    {t("common.edit").toUpperCase()}
                  </button>
                </div>
              </div>
            </div>

            {/* Options Title */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
              <h3 className="text-2xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">
                {t("homeFilter.options")}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {homeFilter.options.map((option) => (
                <div
                  key={option.id}
                  className="group bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm hover:shadow-xl border border-slate-200/60 dark:border-slate-700/60 transition-all duration-500 flex flex-col items-center"
                >
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50 dark:bg-slate-900">
                    <img
                      src={import.meta.env.VITE_IMAGE_BASE_URL + "/" + option.image}
                      alt={lang === "ar" ? option.filterOption.nameAr : option.filterOption.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Option";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                        <button
                          onClick={() => setEditingOption(option)}
                          className="w-full py-2.5 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/40 transition-all active:scale-95"
                        >
                          <ImagePlus size={18} />
                          {t("common.edit")}
                        </button>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">
                      {option.filterOption.value}
                    </p>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      {lang === "ar" ? option.filterOption.nameAr : option.filterOption.name}
                    </h4>
                    <p className="text-xs font-bold text-slate-400">
                        {lang === "ar" ? option.filterOption.name : option.filterOption.nameAr}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 w-full flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-400 uppercase">ID: {option.filterOption.id}</span>
                     <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400">
                        <ChevronRight size={14} />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Delete Confirmation */}
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
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] animate-in zoom-in-95 duration-300">
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
