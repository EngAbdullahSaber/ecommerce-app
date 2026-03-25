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
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  GetSpecifiedMethod,
  DeleteMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { DeleteDialog } from "../../../components/shared/DeleteDialog";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl transform hover:rotate-6 transition-transform">
              <Layers size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-slate-100 dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent tracking-tight">
                {t("homeCategories.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium">
                {t("homeCategories.description")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="group p-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
              title={t("homeCategories.refresh")}
            >
              <RefreshCw size={24} className={`${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all active:scale-95 uppercase tracking-wider text-sm"
            >
              <Plus size={20} />
              {t("common.add") || "Add Category"}
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-white/50 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700" />
            ))}
          </div>
        ) : isError || (categories && categories.length === 0) ? (
            <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Layers size={48} className="text-indigo-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    {t("homeCategories.errorMessage") || "No categories found"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                    Configure your home page categories to display them in the storefront.
                </p>
                <button
                    onClick={handleCreate}
                    className="px-8 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all"
                >
                    {t("common.add") || "Add First Category"}
                </button>
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl border border-slate-100 dark:border-slate-700/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
                
                <div className="relative flex items-start gap-4">
                  {/* Image/IconContainer */}
                  <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-700 flex-shrink-0">
                    <img
                      src={import.meta.env.VITE_IMAGE_BASE_URL + "/" + cat.category.image}
                      alt={lang === "ar" ? cat.category.title.arabic : cat.category.title.english}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Category";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">
                        Order #{cat.displayOrder}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white truncate pr-6">
                      {lang === "ar" ? cat.category.title.arabic : cat.category.title.english}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                       {t(`homeCategories.types.${cat.type}`)}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-50 dark:border-slate-700/50 pt-5">
                  <div className="flex items-center gap-2">
                    {cat.withBestSeller ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold">
                        <CheckCircle2 size={14} />
                        {t("homeCategories.status.withBestSeller")}
                      </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700/30 text-slate-400 dark:text-slate-500 rounded-xl text-xs font-bold">
                            <XCircle size={14} />
                            {t("homeCategories.status.withoutBestSeller")}
                        </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                    <button
                      onClick={() => handleEdit(cat.id)}
                      className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl hover:scale-110 transition-transform shadow-sm"
                      title={t("common.edit")}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl hover:scale-110 transition-transform shadow-sm"
                      title={t("common.delete")}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="absolute top-4 right-4 p-2 bg-slate-50/50 dark:bg-slate-700/30 rounded-full text-slate-300 dark:text-slate-600">
                  <GripVertical size={20} />
                </div>
              </div>
            ))}
          </div>
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
