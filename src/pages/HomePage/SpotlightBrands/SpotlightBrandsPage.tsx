import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Image as ImageIcon
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  GetSpecifiedMethod,
  DeleteMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { DataTable } from "../../../components/shared/DataTable";
import { DeleteDialog } from "../../../components/shared/DeleteDialog";

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

  const columns = [
    {
      key: "id",
      label: t("spotlightBrands.columns.id"),
      width: "80px",
      render: (value: number) => (
        <div className="font-bold text-slate-700 dark:text-slate-300">
          #{value}
        </div>
      ),
    },
    {
      key: "brand",
      label: t("spotlightBrands.columns.image"),
      width: "120px",
      render: (brand: any) => (
        <div className="flex items-center justify-center">
          {brand?.image ? (
            <img
              src={import.meta.env.VITE_IMAGE_BASE_URL + "/" + brand.image}
              alt={lang === "ar" ? brand.title?.arabic : brand.title?.english}
              className="w-16 h-16 rounded-xl object-contain border border-slate-200 dark:border-slate-700 bg-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Brand";
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Star className="text-slate-400" size={24} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "brand",
      label: t("spotlightBrands.columns.brandTitle"),
      render: (brand: any) => (
        <div className="font-semibold text-slate-900 dark:text-white">
          {lang === "ar" ? brand.title?.arabic : brand.title?.english}
        </div>
      ),
    },
    {
      key: "displayOrder",
      label: t("spotlightBrands.columns.displayOrder"),
      width: "120px",
      render: (value: number) => (
        <div className="flex items-center justify-center">
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-sm border border-blue-100 dark:border-blue-800/50">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "startDate",
      label: t("spotlightBrands.columns.startDate"),
      render: (value: string | null) => (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Calendar size={14} className="text-slate-400" />
          {value ? new Date(value).toLocaleDateString() : t("common.na")}
        </div>
      ),
    },
    {
      key: "endDate",
      label: t("spotlightBrands.columns.endDate"),
      render: (value: string | null) => (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Calendar size={14} className="text-slate-400" />
          {value ? new Date(value).toLocaleDateString() : t("common.na")}
        </div>
      ),
    },
    {
      key: "id",
      label: t("spotlightBrands.columns.actions"),
      width: "140px",
      render: (id: number) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/home-page/spotlight-brands/edit/${id}`)}
              className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-500/10 dark:to-indigo-500/10 dark:hover:from-blue-500/20 dark:hover:to-indigo-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-all border border-blue-200/50 dark:border-blue-500/20"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => {
              // Find the brand object for the dialog
              const brandToDelete = brands.find(b => b.id === id);
              if (brandToDelete) {
                setDeleteDialog({ isOpen: true, brand: brandToDelete });
              }
            }}
             className="p-2 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 dark:from-red-500/10 dark:to-pink-500/10 dark:hover:from-red-500/20 dark:hover:to-pink-500/20 text-red-600 dark:text-red-400 rounded-lg transition-all border border-red-200/50 dark:border-red-500/20"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl transform hover:rotate-6 transition-transform">
              <Star size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-slate-100 dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("spotlightBrands.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("spotlightBrands.description")}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold shadow-sm hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 active:scale-95"
            >
              <RefreshCw size={20} className={`${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
              {t("spotlightBrands.refresh")}
            </button>

            <button
              onClick={() => navigate("/home-page/spotlight-brands/create")}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 active:scale-95"
            >
              <Plus size={20} />
              {t("common.add")}
            </button>
          </div>
        </div>

        {/* Table/Content */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
          <DataTable
            columns={columns}
            data={brands}
            loading={isLoading}
            showPagination={false}
            currentPage={1}
            rowsPerPage={brands.length || 10}
            totalItems={brands.length}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
          />
        </div>

        {/* Empty State */}
        {!isLoading && !isError && brands.length === 0 && (
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
            <Star size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t("spotlightBrands.noBrands")}</h3>
            <button
               onClick={() => navigate("/home-page/spotlight-brands/create")}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              {t("common.add")}
            </button>
          </div>
        )}

        <DeleteDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, brand: null })}
          onConfirm={handleDelete}
          title={t("spotlightBrands.delete.title")}
          description={t("spotlightBrands.delete.description")}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
