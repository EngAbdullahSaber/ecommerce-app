// pages/Third-categories/edit/[id].tsx - Update Third Category Page
"use client";
import { useParams, useNavigate } from "react-router-dom";
import {
  Folder,
  Globe,
  ArrowLeft,
  AlertCircle,
  Filter,
} from "lucide-react";
import { z } from "zod";
import { useToast } from "../../../hooks/useToast";
import {
  GetSpecifiedMethod,
  UpdateMethodFormData,
  GetPanigationMethodWithFilter,
} from "../../../services/apis/ApiMethod";
import {
  FormField,
  GenericUpdateForm,
} from "../../../components/shared/GenericUpdateForm";
import { useQueryClient } from "@tanstack/react-query";
import { UpdateForm } from "../../../components/shared/GenericUpdateForm/UpdateForm";
import { useTranslation } from "react-i18next";

// Third Category Interface
interface Name {
  english: string;
  arabic: string;
}

interface ThirdCategory {
  id: number;
  title: { arabic: string; english: string };
  image: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
  filterAttributes: any[];
}

// Fetch third category by ID
const fetchThirdCategoryById = async (id: string, t: any): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/categories/${id}`, "en");

    if (!response || !response.data) {
      throw new Error("Third category not found");
    }

    const category = response.data as ThirdCategory;
    console.log("Third category data:", category);
    // Transform the data for the form
    const transformedData = {
      id: category.id,
      englishTitle: category?.title?.english || "",
      arabicTitle: category?.title?.arabic || "",
      image: category.image
        ? `${import.meta.env.VITE_IMAGE_BASE_URL}${category.image}`
        : null,
      filterAttributes: category.filterAttributes?.map((item: any) => ({
        attributeId: item.attributeId,
        isVisible: item.isVisible,
        sortOrder: item.sortOrder
      })) || [],
      createdAt: new Date(category.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedAt: category.updatedAt
        ? new Date(category.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Never updated",
    };

    return transformedData;
  } catch (error) {
    console.error("Error fetching third category:", error);
    throw error;
  }
};

// Generic fetch function for paginated select to handle different endpoints
const fetchGlobalOptions = async (endpoint: string, params: any, lang: string = 'en') => {
  try {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const searchTerm = params.name || params.search || "";

    console.log(`Fetching ${endpoint} with params:`, {
      page,
      pageSize,
      searchTerm,
      additionalParams: params,
    });

    let normalizedEndpoint = endpoint.startsWith("/") ? endpoint.substring(1) : endpoint;

    const response = await GetPanigationMethodWithFilter(
      normalizedEndpoint,
      page,
      pageSize,
      lang,
      searchTerm,
      params
    );

    if (!response) {
      throw new Error("No response from server");
    }

    return {
      data: response.data || response.items || [],
      meta: {
        total: response.meta?.total || response.total || response.totalItems || 0,
        last_page: response.meta?.lastPage || response.meta?.last_page || response.last_page || response.totalPages || 1,
        current_page: response.meta?.currentPage || response.meta?.current_page || page,
        per_page: response.meta?.perPage || response.meta?.per_page || pageSize,
      },
    };
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return { data: [], meta: { total: 0, last_page: 1, current_page: 1, per_page: 10 } };
  }
};

export default function UpdateThirdCategoryPage() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const categoryId = params.id as string;
  const queryClient = useQueryClient();

  // Define form fields for updating third category
  const thirdCategoryFields: FormField[] = [
    // Basic Information Section Header
    {
      name: "basicInfoHeader",
      label: "Basic Information",
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
              <Folder size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Third Category Information
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Update third category details and information
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Category Names (Editable)
    {
      name: "englishTitle",
      label: "English Title",
      type: "text",
      placeholder: "Updated Electronics",
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z.string().min(2, "Title must be at least 2 characters"),
      helperText: "The name of the third category in English",
    },
    {
      name: "arabicTitle",
      label: "العنوان العربي (Arabic)",
      type: "text",
      placeholder: "إلكترونيات محدثة",
      required: true,
      cols: 6,
      validation: z.string().min(2, "العنوان يجب أن يكون على الأقل حرفين"),
      helperText: "اسم الفئة الرئيسية بالعربية",
    },

    // Read-only Fields
    {
      name: "createdAt",
      label: "Created At",
      type: "text",
      readOnly: true,
      cols: 6,
      prefix: "📅",
      helperText: "Date and time when this category was created",
    },
    {
      name: "updatedAt",
      label: "Last Updated",
      type: "text",
      readOnly: true,
      cols: 6,
      prefix: "🔄",
      helperText: "Date and time when this category was last updated",
    },
    {
      name: "filterAttributesHeader",
      label: t("categories.fields.filterAttributes.title") || "Filter Attributes",
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6 mt-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-lg">
              <Filter size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("categories.fields.filterAttributes.title") || "Filter Attributes"}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("categories.fields.filterAttributes.description") || "Specify which filters should be active for this third-category."}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "filterAttributes",
      label: t("categories.fields.filterAttributes.title") || "Filter Attributes",
      type: "array",
      cols: 12,
      arrayConfig: {
        fields: [
          {
            name: "attributeId",
            label: t("categories.fields.filterAttributes.id") || "Filter Attribute",
            type: "paginatedSelect",
            required: true,
            cols: 6,
            paginatedSelectConfig: {
              endpoint: "filter-attributes",
              labelKey: "name",
              valueKey: "id",
              transformResponse: (data: any) => {
                const findItems = (node: any) => {
                  if (Array.isArray(node)) return node;
                  if (!node) return [];
                  return node.data || node.items || node.filterAttributes || [];
                };
                const items = findItems(data);
                const finalItems = Array.isArray(items) ? items : (findItems(items) || []);
                return finalItems.map((item: any) => ({
                  label: t("lang") === 'ar' ? (item.nameAr || item.name) : (item.name || item.nameEn),
                  value: item.id.toString(),
                }));
              }
            },
            validation: z.preprocess((val) => (val === "" || val === undefined ? 0 : Number(val)), z.number().min(1)),
          },
          {
            name: "isVisible",
            label: t("categories.fields.filterAttributes.isVisible") || "Visible",
            type: "checkbox",
            cols: 3,
            initialValue: true,
          },
          {
            name: "sortOrder",
            label: t("categories.fields.filterAttributes.sortOrder") || "Sort Order",
            type: "number",
            cols: 3,
            initialValue: 0,
            validation: z.preprocess((val) => (val === "" || val === undefined ? 0 : Number(val)), z.number().min(0)),
          }
        ],
        addButtonLabel: t("categories.fields.filterAttributes.add") || "Add Filter",
      },
    },
  ];

  // Handle update
  const handleUpdate = async (id: string | number, data: any) => {
    try {
      console.log("Update called with data:", data);

      // Prepare FormData
      const formData = new FormData();

      // Add name data in the required format
      if (data.englishTitle) {
        formData.append("englishTitle", data.englishTitle);
      }
      if (data.arabicTitle) {
        formData.append("arabicTitle", data.arabicTitle);
      }

      // Add image file if provided
      if (data.image && data.image instanceof File) {
        formData.append("image", data.image);
      } else if (data.image === null) {
        // Handle case where we want to remove existing image
        formData.append("image", "");
      }

      if (data.filterAttributes && data.filterAttributes.length >= 0) {
        formData.append("filterAttributes", JSON.stringify(data.filterAttributes));
      }

      // Log FormData for debugging
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Make API call
      const response = await UpdateMethodFormData(
        `/categories`,
        formData,
        id,
        "en",
      );

      console.log("Update response:", response);

      if (!response) {
        throw new Error("No response from server");
      }

      if (response.code !== 200) {
        throw new Error(
          response.message?.english || response.message || "Update failed",
        );
      }

      return response;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleAfterSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["third-categories"] });
    toast.success("Third category updated successfully!", { duration: 2000 });

    // Redirect after delay
    setTimeout(() => {
      navigate("/third-categories");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(
      error.message || "Failed to update third category. Please try again.",
    );
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only fields
    const { createdAt, updatedAt, imageUrl, id, ...rest } = data;

    // If no new image is selected but we have an existing imageUrl,
    // we don't send image field to avoid removing existing image
    if (!data.image && data.imageUrl) {
      delete rest.image;
    }

    console.log("After transformation:", rest);
    return rest;
  };

  if (!categoryId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Third Category Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            The third category ID is missing or invalid.
          </p>
          <button
            onClick={() => navigate("/third-categories")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Third Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <UpdateForm
          title={`Update Third Category`}
          description="Edit third category details and save changes"
          fields={thirdCategoryFields}
          entityId={categoryId}
          fetchOptions={(endpoint: string, params: any) => fetchGlobalOptions(endpoint, params, t('lang'))}
          fetchData={(id: string | number) => fetchThirdCategoryById(id.toString(), t)}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/third-categories")}
          onBack={() => navigate("/third-categories")}
          submitLabel="Save Changes"
          cancelLabel="Cancel"
          showBackButton={true}
          className="mb-8"
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={beforeSubmit}
        />
      </div>
    </div>
  );
}
