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
  Edit2
} from "lucide-react";
import { useState } from "react";
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

  const editFields: FormField[] = [
    {
      name: "titleEn",
      label: t("todayShopping.edit.fields.titleEn"),
      type: "text",
      required: true,
      cols: 6,
      validation: z.string().min(1),
    },
    {
      name: "titleAr",
      label: t("todayShopping.edit.fields.titleAr"),
      type: "text",
      required: true,
      cols: 6,
      validation: z.string().min(1),
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
      validation: z.string().min(1),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-xl transform hover:rotate-6 transition-transform">
              <ShoppingBag size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {t("todayShopping.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("todayShopping.description")}
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold shadow-sm hover:shadow-xl hover:border-pink-500/50 transition-all duration-300 active:scale-95"
          >
            <RefreshCw size={20} className={`${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            {t("todayShopping.refresh")}
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-white/50 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-12 text-center border border-red-100 dark:border-red-900/30">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full w-fit mx-auto mb-6">
              <ShoppingBag size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("todayShopping.errorTitle")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t("todayShopping.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-pink-500/30 transition-all active:scale-95"
            >
              {t("todayShopping.tryAgain")}
            </button>
          </div>
        )}

        {/* Items Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl border border-slate-200/60 dark:border-slate-700/60 transition-all duration-500 hover:-translate-y-2 flex flex-col"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={import.meta.env.VITE_IMAGE_BASE_URL + "/" + item.image}
                    alt={lang === "ar" ? item.titleAr : item.titleEn}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Badge & Edit */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-xl shadow-lg backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase shadow-lg backdrop-blur-md ${
                      item.isActive 
                        ? "bg-emerald-500/90 text-white" 
                        : "bg-slate-500/90 text-white"
                    }`}>
                      {item.isActive ? t("todayShopping.status.active") : t("todayShopping.status.inactive")}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                        <Activity size={16} className="text-pink-600 dark:text-pink-400" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {item.key.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors leading-tight">
                        {lang === "ar" ? item.titleAr : item.titleEn}
                      </h3>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Hash size={12} />
                          <span className="text-xs font-bold">ID: {item.id}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar size={12} />
                          <span className="text-xs font-bold">
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                    <button
                      onClick={() => updateItemMutation.mutate({ id: item.id, isActive: !item.isActive })}
                      disabled={updateItemMutation.isPending}
                      className={`w-full flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 ${
                        item.isActive
                          ? "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-500 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                          : "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40"
                      }`}
                    >
                      {item.isActive ? (
                        <>
                          <EyeOff size={18} />
                          {t("todayShopping.status.inactive").toUpperCase()}
                        </>
                      ) : (
                        <>
                          <Eye size={18} />
                          {t("todayShopping.status.active").toUpperCase()}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

         {/* Empty State */}
        {!isLoading && !isError && items.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-xl p-20 text-center border border-slate-100 dark:border-slate-700/50">
             <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-full w-fit mx-auto mb-6">
              <ShoppingBag size={64} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="uppercase tracking-[0.2em] font-black text-slate-400 dark:text-slate-500">
              {t("todayShopping.noItems")}
            </p>
          </div>
        )}

        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl max-h-[80vh] overflow-x-hidden overflow-y-auto rounded-[2.5rem] animate-in zoom-in-95 duration-300 scrollbar-thin scrollbar-thumb-pink-500/20 dark:scrollbar-thumb-pink-900/20 scrollbar-track-transparent">
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
