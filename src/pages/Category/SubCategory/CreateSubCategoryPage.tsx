// pages/sub-categories/create.tsx - Create SubCategory Component with FormData
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
import { CreateForm } from "../../../components/shared/GenericForm/CreateForm";

export default function CreateSubCategoryPage() {
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

  // Define the paginated select configuration for parent categories
  const ParentCategorySelectConfig: PaginatedSelectConfig = {
    endpoint: "/categories",
    searchParam: "title",
    labelKey: "title.english",
    valueKey: "id",
    pageSize: 10,
    debounceTime: 300,
    additionalParams: {
      type: "PARENT",
    },
    transformResponse: (data: any) => {
      console.log("Parent categories data:", data);

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
  const fetchParentCategoriesOptions = async (
    endpoint: string,
    params: any,
  ) => {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const searchTerm = params.name || params.search || "";

      console.log("Fetching parent categories with params:", {
        page,
        pageSize,
        searchTerm,
      });

      const additionalParams = {
        type: "PARENT",
        ...(searchTerm && { name: searchTerm }),
      };

      const response = await GetPanigationMethodWithFilter(
        "categories",
        page,
        pageSize,
        "en",
        searchTerm,
        additionalParams,
      );

      if (!response) {
        throw new Error("No response from server");
      }

      console.log("Parent categories response:", response);

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
      console.error("Error fetching parent categories:", error);

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

  // Define form fields for creating a subcategory
  const subCategoryFields: FormField[] = [
    // English and Arabic Titles
    {
      name: "englishTitle",
      label: t("categories.sub.create.fields.englishTitle.label"),
      type: "text",
      placeholder: t("categories.sub.create.fields.englishTitle.placeholder"),
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z
        .string()
        .min(2, t("categories.sub.create.fields.englishTitle.validation")),
    },
    {
      name: "arabicTitle",
      label: t("categories.sub.create.fields.arabicTitle.label"),
      type: "text",
      placeholder: t("categories.sub.create.fields.arabicTitle.placeholder"),
      required: true,
      cols: 6,
      validation: z
        .string()
        .min(2, t("categories.sub.create.fields.arabicTitle.validation")),
    },

    // Parent Category Select
    {
      name: "parentId",
      label: t("categories.sub.create.fields.parentId.label"),
      type: "paginatedSelect",
      required: true,
      placeholder: t("categories.sub.create.fields.parentId.placeholder"),
      icon: <Layers size={18} />,
      cols: 12,
      paginatedSelectConfig: ParentCategorySelectConfig,
      validation: z
        .string()
        .min(1, t("categories.sub.create.fields.parentId.validation")),
      helperText: t("categories.sub.create.fields.parentId.helper"),
    },

    // Image Upload
    {
      name: "image",
      label: t("categories.sub.create.fields.image.label"),
      type: "image",
      required: true,
      cols: 12,
    },
  ];

  // Default values for the form
  const defaultValues = {
    englishTitle: "",
    arabicTitle: "",
    type: "SUB",
    parentId: "",
    image: null,
  };

  // Handle form submission with FormData
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("categories.sub.create.form.loading"));

    try {
      const formData = new FormData();

      formData.append("englishTitle", data.englishTitle);
      formData.append("arabicTitle", data.arabicTitle);
      formData.append("type", "SUB");
      formData.append("parentId", data.parentId);

      if (data.image) {
        formData.append("image", data.image);
      } else {
        throw new Error(t("categories.sub.create.fields.image.requiredError"));
      }

      console.log("Submitting sub category data:", {
        englishTitle: data.englishTitle,
        arabicTitle: data.arabicTitle,
        type: "SUB",
        parentId: data.parentId,
        hasImage: !!data.image,
      });

      const response = await CreateMethodFormData(
        "/categories",
        formData,
        "en",
      );

      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("categories.sub.create.form.success"), {
          duration: 2000,
        });

        queryClient.invalidateQueries({ queryKey: ["categories"] });
        queryClient.invalidateQueries({ queryKey: ["parent-categories"] });
        queryClient.invalidateQueries({ queryKey: ["sub-categories"] });

        setTimeout(() => {
          navigate("/sub-categories");
        }, 1500);
      } else {
        throw new Error(t("categories.sub.create.form.error"));
      }
    } catch (error: any) {
      console.error("Failed to create sub category:", error);
      toast.dismiss(loadingToast);

      toast.error(
        `${t("categories.sub.create.form.error")}: ${
          error.message || t("categories.sub.create.form.error")
        }`,
        { duration: 3000 },
      );

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
              <Layers size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("categories.sub.create.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("categories.sub.create.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <CreateForm
          title={t("categories.sub.create.form.title")}
          description={t("categories.sub.create.form.description")}
          fields={subCategoryFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/sub-categories")}
          submitLabel={t("categories.sub.create.form.submit")}
          cancelLabel={t("categories.sub.create.form.cancel")}
          isLoading={isLoading}
          mode="create"
          className="group"
          fetchOptions={fetchParentCategoriesOptions}
        />
      </div>
    </div>
  );
}
