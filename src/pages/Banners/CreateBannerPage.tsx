// pages/create-banner.tsx - Create Banner Component with FormData
"use client";
import { useState, useEffect } from "react";
import {
  GenericForm,
  FormField,
  PaginatedSelectConfig,
} from "../../components/shared/GenericForm";
import { z } from "zod";
import {
  Upload,
  ArrowLeft,
  Image as ImageIcon,
  Calendar,
  Link,
  Tag,
  ListOrdered,
  Layout,
  Target,
  Building2,
  ShoppingBag,
  Percent,
  Megaphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  CreateMethodFormData,
  GetPanigationMethod,
} from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Types for placements
interface Placement {
  page: string;
  location: string;
}

// Banner types
type BannerType = "ADS" | "BRAND" | "CATEGORY" | "DISCOUNT";

export default function CreateBannerPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([
    { page: "HOME", location: "START_OF_PAGE" },
  ]);
  const [selectedType, setSelectedType] = useState<BannerType>("ADS");
  const [formFields, setFormFields] = useState<FormField[]>([]);

  // Paginated select configurations
  const brandPaginatedConfig: PaginatedSelectConfig = {
    endpoint: "/brands",
    searchParam: "search",
    labelKey: "name",
    valueKey: "id",
    pageSize: 10,
    debounceTime: 500,
    additionalParams: {
      status: "ACTIVE",
      orderBy: "name",
      orderDirection: "asc",
    },
    transformResponse: (data: any) => {
      const brands = data.brands || data.data || data || [];

      return brands.map((brand: any) => ({
        label: `${brand.title?.english || t("common.na")} - ${
          brand.title?.arabic || t("common.na")
        }`,
        value: brand.id.toString(),
        rawData: brand,
      }));
      return [];
    },
  };

  const categoryPaginatedConfig: PaginatedSelectConfig = {
    endpoint: "/categories",
    searchParam: "search",
    labelKey: "name",
    valueKey: "id",
    pageSize: 10,
    debounceTime: 500,
    additionalParams: {
      status: "ACTIVE",
      orderBy: "name",
      orderDirection: "asc",
    },
    transformResponse: (data: any) => {
      const categories = data.categories || data.data || data || [];

      return categories.map((category: any) => ({
        label: `${category.title?.english || t("common.na")} - ${
          category.title?.arabic || t("common.na")
        }`,
        value: category.id.toString(),
        rawData: category,
      }));
      return [];
    },
  };

  // Custom fetch function for paginated selects
  const fetchOptions = async (endpoint: string, params: any) => {
    try {
      // GetPanigationMethod expects different parameters
      const response = await GetPanigationMethod(
        endpoint,
        params.page,
        params.pageSize,
        lang,
        params.search || ""
      );
      return response;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  // Handle field change (type selection)
  const handleFieldChange = (fieldName: string, value: any) => {
    if (fieldName === "type") {
      setSelectedType(value as BannerType);
    }
  };

  // Define base form fields (without conditional refId)
  const baseFields: FormField[] = [
    // Image Upload
    {
      name: "image",
      label: t("banners.form.bannerImage"),
      type: "image",
      required: true,
      cols: 12,
      accept: ".jpg,.jpeg,.png,.svg,.webp",
      // You can also add a custom validation function
      validate: (value) => {
        if (value instanceof File) {
          // Validate size
          if (value.size > 5 * 1024 * 1024) {
            return t("countries.validations.flagRequired");
          }

          // Validate type
          const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/svg+xml",
            "image/webp",
          ];

          if (!allowedTypes.includes(value.type.toLowerCase())) {
            return t("countries.validations.flagRequired");
          }
        }
        return true;
      },
    },

    // Alt Text
    {
      name: "altText",
      label: t("banners.form.altText"),
      type: "text",
      placeholder: t("banners.form.placeholders.altText"),
      required: true,
      icon: <Tag size={18} />,
      cols: 6,
      validation: z.string().min(2, t("banners.validations.altTextMin")),
    },

    // Type (Dropdown)
    {
      name: "type",
      label: t("banners.form.type"),
      type: "select",
      required: true,
      icon: <Target size={18} />,
      cols: 6,
      options: [
        {
          value: "ADS",
          label: t("banners.types.ads"),
          icon: <Megaphone size={16} />,
        },
        {
          value: "BRAND",
          label: t("banners.types.brand"),
          icon: <Building2 size={16} />,
        },
        {
          value: "CATEGORY",
          label: t("banners.types.category"),
          icon: <ShoppingBag size={16} />,
        },
        {
          value: "DISCOUNT",
          label: t("banners.types.discount"),
          icon: <Percent size={16} />,
        },
      ],
      validation: z.string().min(1, t("banners.validations.typeRequired")),
    },

    // Status (Dropdown)
    {
      name: "status",
      label: t("banners.form.status"),
      type: "select",
      required: true,
      icon: <Target size={18} />,
      cols: 6,
      options: [
        { value: "ACTIVE", label: t("banners.status.active") },
        { value: "INACTIVE", label: t("banners.status.inactive") },
      ],
      validation: z.string().min(1, t("banners.validations.statusRequired")),
    },

    // Start Date
    {
      name: "startDate",
      label: t("banners.form.startDate"),
      type: "datetime-local",
      required: true,
      icon: <Calendar size={18} />,
      cols: 6,
      validation: z.string().min(1, t("banners.validations.startDateRequired")),
    },

    // End Date
    {
      name: "endDate",
      label: t("banners.form.endDate"),
      type: "datetime-local",
      required: true,
      icon: <Calendar size={18} />,
      cols: 6,
      validation: z.string().min(1, t("banners.validations.endDateRequired")),
    },

    // Order
    {
      name: "order",
      label: t("banners.form.order"),
      type: "number",
      placeholder: t("banners.form.placeholders.order"),
      required: true,
      icon: <ListOrdered size={18} />,
      cols: 6,
      validation: z.coerce.number().min(0, t("banners.validations.orderMin")),
    },

    // Placements (Custom component)
    {
      name: "placements",
      label: t("banners.form.placements"),
      type: "custom",
      required: true,
      cols: 12,
      renderCustom: ({ onChange, value, disabled }) => (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-lg">
              <Layout
                size={20}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                {t("banners.form.placements")} *
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("banners.form.placementsDescription")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {placements.map((placement, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("banners.form.page")}
                    </label>
                    <select
                      value={placement.page}
                      onChange={(e) => {
                        const newPlacements = [...placements];
                        newPlacements[index].page = e.target.value;
                        setPlacements(newPlacements);
                        onChange(JSON.stringify(newPlacements));
                      }}
                      disabled={disabled}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="HOME">{t("banners.pages.home")}</option>
                      <option value="BRAND">{t("banners.pages.brand")}</option>
                      <option value="PRODUCT_DETAILS">
                        {t("banners.pages.productDetail")}
                      </option>
                      <option value="SUB_CATEGORY">
                        {t("banners.pages.subcategory")}
                      </option>{" "}
                      <option value="CATEGORY">
                        {t("banners.pages.category")}
                      </option>
                      <option value="STORE">{t("banners.pages.store")}</option>
                      <option value="CHECKOUT">
                        {t("banners.pages.checkout")}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("banners.form.location")}
                    </label>
                    <select
                      value={placement.location}
                      onChange={(e) => {
                        const newPlacements = [...placements];
                        newPlacements[index].location = e.target.value;
                        setPlacements(newPlacements);
                        onChange(JSON.stringify(newPlacements));
                      }}
                      disabled={disabled}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="START_OF_PAGE">
                        {t("banners.locations.startOfPage")}
                      </option>
                      <option value="TOP_SUBCATEGORIES">
                        {t("banners.locations.topSubcategories")}
                      </option>
                      <option value="UNDER_SUB_CATEGORIES">
                        {t("banners.locations.underSubCategories")}
                      </option>
                      <option value="END_OF_PAGE">
                        {t("banners.locations.endOfPage")}
                      </option>
                      <option value="BEFORE_LAST_SECTION">
                        {t("banners.locations.beforeLastSection")}
                      </option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (placements.length > 1) {
                      const newPlacements = placements.filter(
                        (_, i) => i !== index
                      );
                      setPlacements(newPlacements);
                      onChange(JSON.stringify(newPlacements));
                    }
                  }}
                  disabled={disabled || placements.length <= 1}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("common.remove")}
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              const newPlacements = [
                ...placements,
                { page: "HOME", location: "START_OF_PAGE" },
              ];
              setPlacements(newPlacements);
              onChange(JSON.stringify(newPlacements));
            }}
            disabled={disabled}
            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span>
            {t("banners.form.addPlacement")}
          </button>
        </div>
      ),
      validation: z
        .string()
        .min(1, t("banners.validations.placementsRequired")),
    },
  ];

  // Get refId field based on selected type
  const getRefIdField = (): FormField => {
    switch (selectedType) {
      case "BRAND":
        return {
          name: "refId",
          label: t("banners.form.selectBrand"),
          type: "paginatedSelect",
          required: false,
          icon: <Building2 size={18} />,
          cols: 6,
          paginatedSelectConfig: brandPaginatedConfig,
          placeholder: t("banners.form.selectBrandPlaceholder"),
          validation: z.coerce
            .number()
            .min(1, t("banners.validations.refIdMin"))
            .optional(),
        };
      case "CATEGORY":
        return {
          name: "refId",
          label: t("banners.form.selectCategory"),
          type: "paginatedSelect",
          required: false,
          icon: <ShoppingBag size={18} />,
          cols: 6,
          paginatedSelectConfig: categoryPaginatedConfig,
          placeholder: t("banners.form.selectCategoryPlaceholder"),
          validation: z.coerce
            .number()
            .min(1, t("banners.validations.refIdMin"))
            .optional(),
        };
      default:
        return {
          name: "refId",
          label: t("banners.form.refId"),
          type: "number",
          placeholder: t("banners.form.placeholders.refId"),
          required: false,
          icon: <Link size={18} />,
          cols: 6,
          validation: z.coerce
            .number()
            .min(1, t("banners.validations.refIdMin"))
            .optional(),
        };
    }
  };

  // Update form fields when selectedType changes
  useEffect(() => {
    // Insert refId field after type field (index 2)
    const refIdField = getRefIdField();
    const updatedFields = [...baseFields];

    // Find index of type field
    const typeFieldIndex = updatedFields.findIndex(
      (field) => field.name === "type"
    );

    // Remove existing refId field if it exists
    const existingRefIdIndex = updatedFields.findIndex(
      (field) => field.name === "refId"
    );
    if (existingRefIdIndex !== -1) {
      updatedFields.splice(existingRefIdIndex, 1);
    }

    // Insert new refId field after type field
    updatedFields.splice(typeFieldIndex + 1, 0, refIdField);

    setFormFields(updatedFields);
  }, [selectedType, t]);

  // Default values for the form
  const defaultValues = {
    altText: "",
    type: "ADS",
    ref: "",
    refId: "",
    status: "ACTIVE",
    startDate: "",
    endDate: "",
    order: 1,
    placements: JSON.stringify(placements),
    image: null,
  };

  // Handle form submission with FormData
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("banners.messages.creating"));

    try {
      // Prepare FormData
      const formData = new FormData();

      // Add banner data
      formData.append("altText", data.altText);
      formData.append("type", data.type);
      formData.append("ref", data.type); // Use type as ref

      // For BRAND and CATEGORY types, refId comes from the dropdown
      if (data.refId) {
        formData.append("refId", data.refId.toString());
      } else {
        // For other types, you might want to handle this differently
        formData.append("refId", "");
      }

      formData.append("status", data.status);
      formData.append("startDate", new Date(data.startDate).toISOString());
      formData.append("endDate", new Date(data.endDate).toISOString());
      formData.append("order", data.order.toString());
      formData.append("placements", data.placements);

      // Add image file
      if (data.image) {
        formData.append("image", data.image);
      } else {
        throw new Error(
          t("banners.form.bannerImage") + " " + t("common.isRequired")
        );
      }

      // Make API call using CreateMethodFormData
      const response = await CreateMethodFormData("/banners", formData, lang);

      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("banners.messages.createSuccess"), { duration: 2000 });

        // Invalidate banners query to trigger refetch
        queryClient.invalidateQueries({ queryKey: ["banners"] });

        // Navigate to banners list after delay
        setTimeout(() => {
          navigate("/banners");
        }, 1500);
      } else {
        throw new Error(t("banners.messages.createFailed"));
      }
    } catch (error: any) {
      console.error("Failed to create banner:", error);
      toast.dismiss(loadingToast);

      // Show error toast
      toast.error(
        `${t("banners.messages.createFailed")} ${
          error.message || t("messages.error")
        }`,
        { duration: 3000 }
      );

      // Re-throw to show form error
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/banners")}
          disabled={isLoading}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("banners.backToList")}
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
              <ImageIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-slate-100 dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("banners.create.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("banners.create.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <GenericForm
          title={t("banners.form.title")}
          description={t("banners.form.description")}
          fields={formFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/banners")}
          submitLabel={t("banners.form.actions.create")}
          cancelLabel={t("common.cancel")}
          isLoading={isLoading}
          mode="create"
          className="group"
          fetchOptions={fetchOptions}
          onFieldChange={handleFieldChange}
        />

        {/* Help Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/20 dark:to-blue-500/20 rounded-lg">
                <Target
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {t("help.bannerTypes.title")}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("help.bannerTypes.description")}
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/20 dark:to-emerald-500/20 rounded-lg">
                <Calendar
                  size={20}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {t("help.scheduling.title")}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("help.scheduling.description")}
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/20 dark:to-pink-500/20 rounded-lg">
                <Layout
                  size={20}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {t("help.placements.title")}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("help.placements.description")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
