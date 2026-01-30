// pages/third-categories/create.tsx - Create Third Category Component
"use client";
import { useState, useEffect } from "react";
import { GenericForm, FormField } from "../../../components/shared/GenericForm";
import { z } from "zod";
import {
  Globe,
  Image as ImageIcon,
  Upload,
  ArrowLeft,
  Layers,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreateMethodFormData,
  GetPanigationMethodWithFilter,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { PaginatedSelectConfig } from "../../../components/shared/GenericUpdateForm";
import { useTranslation } from "react-i18next";

export default function CreateThirdCategoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Get parentId from URL params if passed
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const parentIdFromUrl = searchParams.get("parentId");
    if (parentIdFromUrl) {
      console.log("Parent ID from URL:", parentIdFromUrl);
    }
  }, [location]);

  // Define the paginated select configuration for sub categories
  const SubCategorySelectConfig: PaginatedSelectConfig = {
    endpoint: "/categories",
    searchParam: "title",
    labelKey: "title.english",
    valueKey: "id",
    pageSize: 10,
    debounceTime: 300,
    additionalParams: {
      type: "SUB",
    },
    transformResponse: (data: any) => {
      console.log("Sub categories data:", data);

      const categories = data.data || data.categories || data || [];

      return categories.map((category: any) => ({
        label: `${category.title?.english || "N/A"} - ${
          category.title?.arabic || "N/A"
        }`,
        value: category.id.toString(),
        rawData: category,
      }));
    },
  };

  // Custom fetch function for paginated select
  const fetchSubCategoriesOptions = async (endpoint: string, params: any) => {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const searchTerm = params.name || params.search || "";

      console.log("Fetching sub categories with params:", {
        page,
        pageSize,
        searchTerm,
      });

      const additionalParams = {
        type: "SUB",
        ...(searchTerm && { name: searchTerm }),
      };

      const response = await GetPanigationMethodWithFilter(
        "categories",
        page,
        pageSize,
        "en",
        searchTerm,
        additionalParams
      );

      if (!response) {
        throw new Error("No response from server");
      }

      console.log("Sub categories response:", response);

      return {
        data: response.data || [],
        meta: {
          total:
            response.meta?.total || response.total || response.totalItems || 0,
          last_page:
            response.meta?.lastPage ||
            response.meta?.last_page ||
            response.last_page ||
            response.totalPages ||
            1,
          current_page:
            response.meta?.currentPage || response.meta?.current_page || page,
          per_page:
            response.meta?.perPage || response.meta?.per_page || pageSize,
        },
      };
    } catch (error) {
      console.error("Error fetching sub categories:", error);

      return {
        data: [],
        meta: {
          total: 0,
          last_page: 1,
          current_page: 1,
          per_page: 10,
        },
      };
    }
  };

  // Define form fields for creating a third category
  const thirdCategoryFields: FormField[] = [
    // English and Arabic Titles
    {
      name: "englishTitle",
      label: t("categories.third.create.fields.englishTitle.label"),
      type: "text",
      placeholder: t("categories.third.create.fields.englishTitle.placeholder"),
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z
        .string()
        .min(2, t("categories.third.create.fields.englishTitle.validation")),
    },
    {
      name: "arabicTitle",
      label: t("categories.third.create.fields.arabicTitle.label"),
      type: "text",
      placeholder: t("categories.third.create.fields.arabicTitle.placeholder"),
      required: true,
      cols: 6,
      validation: z
        .string()
        .min(2, t("categories.third.create.fields.arabicTitle.validation")),
    },

    // Type - Fixed as THIRD
    {
      name: "type",
      label: t("categories.third.create.fields.type.label"),
      type: "hidden",
      value: "THIRD",
      required: true,
      cols: 12,
      validation: z.string().default("THIRD"),
    },

    // Parent Category Select (should be sub categories for third category)
    {
      name: "parentId",
      label: t("categories.third.create.fields.parentId.label"),
      type: "paginatedSelect",
      required: true,
      placeholder: t("categories.third.create.fields.parentId.placeholder"),
      icon: <Layers size={18} />,
      cols: 12,
      paginatedSelectConfig: SubCategorySelectConfig,
      validation: z
        .string()
        .min(1, t("categories.third.create.fields.parentId.validation")),
      helperText: t("categories.third.create.fields.parentId.helper"),
    },

    // Image Upload
    {
      name: "image",
      label: t("categories.third.create.fields.image.label"),
      type: "image",
      required: true,
      cols: 12,
      renderCustom: ({ onChange, value, disabled }) => (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-lg">
              <ImageIcon
                size={20}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                {t("categories.third.create.fields.image.title")}
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("categories.third.create.fields.image.description")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload */}
            <div>
              <label className="block mb-2">
                <div className="relative cursor-pointer">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                        onChange(file);
                      }
                    }}
                    className="sr-only"
                    id="image-upload"
                    required={true}
                    disabled={disabled}
                  />
                  <div
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-colors bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50 ${
                      disabled
                        ? "border-slate-200 dark:border-slate-700 opacity-50"
                        : "border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer"
                    }`}
                  >
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full mb-3">
                      <Upload
                        size={24}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      {imageFile
                        ? t("categories.third.create.fields.image.change")
                        : t("categories.third.create.fields.image.upload")}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t("categories.third.create.fields.image.fileTypes")}
                    </span>
                    {imageFile && (
                      <div className="mt-3 px-3 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 rounded-full">
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          ✓ {imageFile.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </label>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("categories.third.create.fields.image.preview")}
              </label>
              <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={t("categories.third.create.fields.image.preview")}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center p-4">
                    <div className="mx-auto w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-2">
                      <ImageIcon
                        size={20}
                        className="text-slate-400 dark:text-slate-500"
                      />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t(
                        "categories.third.create.fields.image.previewPlaceholder"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Default values for the form
  const defaultValues = {
    englishTitle: "",
    arabicTitle: "",
    type: "THIRD",
    parentId: "",
    image: null,
  };

  // Handle form submission with FormData
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(
      t("categories.third.create.form.loading")
    );

    try {
      const formData = new FormData();

      formData.append("englishTitle", data.englishTitle);
      formData.append("arabicTitle", data.arabicTitle);
      formData.append("type", "THIRD");
      formData.append("parentId", data.parentId);

      if (data.image) {
        formData.append("image", data.image);
      } else {
        throw new Error(
          t("categories.third.create.fields.image.requiredError")
        );
      }

      console.log("Submitting third category data:", {
        englishTitle: data.englishTitle,
        arabicTitle: data.arabicTitle,
        type: "THIRD",
        parentId: data.parentId,
        hasImage: !!data.image,
      });

      const response = await CreateMethodFormData(
        "/categories",
        formData,
        "en"
      );

      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("categories.third.create.form.success"), {
          duration: 2000,
        });

        queryClient.invalidateQueries({ queryKey: ["categories"] });
        queryClient.invalidateQueries({ queryKey: ["sub-categories"] });
        queryClient.invalidateQueries({ queryKey: ["third-categories"] });

        setTimeout(() => {
          navigate("/third-categories");
        }, 1500);
      } else {
        throw new Error(t("categories.third.create.form.error"));
      }
    } catch (error: any) {
      console.error("Failed to create third category:", error);
      toast.dismiss(loadingToast);

      toast.error(
        `${t("categories.third.create.form.error")}: ${
          error.message || t("categories.third.create.form.error")
        }`,
        { duration: 3000 }
      );

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/third-categories")}
          disabled={isLoading}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("categories.third.create.back")}
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
              <Layers size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("categories.third.create.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("categories.third.create.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <GenericForm
          title={t("categories.third.create.form.title")}
          description={t("categories.third.create.form.description")}
          fields={thirdCategoryFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/third-categories")}
          submitLabel={t("categories.third.create.form.submit")}
          cancelLabel={t("categories.third.create.form.cancel")}
          isLoading={isLoading}
          mode="create"
          className="group"
          fetchOptions={fetchSubCategoriesOptions}
        />
      </div>
    </div>
  );
}
