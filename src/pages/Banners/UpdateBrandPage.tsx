// pages/banners/edit/[id].tsx - Update Banner Page
"use client";
import { useParams, useNavigate } from "react-router-dom";
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
  AlertCircle,
} from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import {
  GetSpecifiedMethod,
  UpdateMethodFormData,
  GetPanigationMethod,
} from "../../services/apis/ApiMethod";
import {
  FormField,
  GenericUpdateForm,
} from "../../components/shared/GenericUpdateForm";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";

// Types for placements
interface Placement {
  page: string;
  location: string;
}

// Banner types
type BannerType = "ADS" | "BRAND" | "CATEGORY" | "DISCOUNT";

// Banner Interface
interface Banner {
  id: number;
  altText: string;
  type: BannerType;
  ref: string;
  refId: number | string;
  status: "ACTIVE" | "INACTIVE";
  startDate: string;
  endDate: string;
  order: number;
  placements: string; // JSON string
  image: string;
  createdAt: string;
  updatedAt: string;
}

// Fetch banner by ID
const fetchBannerById = async (id: string): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/banners/${id}`, "en");

    if (!response || !response.data) {
      throw new Error("Banner not found");
    }

    const banner = response.data as Banner;
    console.log("Fetched banner:", banner);

    // Parse placements JSON
    let placements = [];
    try {
      placements = JSON.parse(banner.placements || "[]");
    } catch (error) {
      console.error("Error parsing placements:", error);
      placements = [{ page: "HOME", location: "START_OF_PAGE" }];
    }

    // Transform the data for the form
    const transformedData = {
      id: banner.id,
      altText: banner.altText,
      type: banner.type,
      ref: banner.ref,
      refId: banner.refId ? banner.refId.toString() : "",
      status: banner.status,
      startDate: new Date(banner.startDate).toISOString().slice(0, 16), // Format for datetime-local
      endDate: new Date(banner.endDate).toISOString().slice(0, 16),
      order: banner.order,
      placements: JSON.stringify(placements),
      image: import.meta.env.VITE_IMAGE_BASE_URL  + banner.image, // URL for display
      currentImage: banner.image, // Original image path
      parsedPlacements: placements, // For internal use
      createdAt: new Date(banner.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      originalType: banner.type, // Store original type for comparison
    };

    return transformedData;
  } catch (error) {
    console.error("Error fetching banner:", error);
    throw error;
  }
};

// Paginated Select Component for use in custom render
const PaginatedSelectField = ({
  config,
  value,
  onChange,
  placeholder,
  disabled,
  fetchOptions,
}: any) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");

  // Fetch initial options
  useEffect(() => {
    const fetchInitialOptions = async () => {
      try {
        setLoading(true);
        const params = {
          page: 1,
          pageSize: config.pageSize || 10,
          ...config.additionalParams,
        };

        const response = await fetchOptions(config.endpoint, params);
        const data = config.transformResponse
          ? config.transformResponse(response)
          : response;
        setOptions(data);

        // Find and set selected label if value exists
        if (value) {
          const selected = data.find((opt: any) => opt.value === value);
          if (selected) {
            setSelectedLabel(selected.label);
          }
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialOptions();
  }, [config.endpoint]);

  // Handle search
  const handleSearch = async (searchTerm: string) => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        pageSize: config.pageSize || 10,
        [config.searchParam || "search"]: searchTerm,
        ...config.additionalParams,
      };

      const response = await fetchOptions(config.endpoint, params);
      const data = config.transformResponse
        ? config.transformResponse(response)
        : response;
      setOptions(data);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div
        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
          border-slate-300 dark:border-slate-600 cursor-pointer ${
            disabled ? "opacity-50" : ""
          }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedLabel || placeholder}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl max-h-96">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-2 border rounded-lg"
              onChange={(e) => {
                setSearch(e.target.value);
                handleSearch(e.target.value);
              }}
              value={search}
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className="px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => {
                  onChange(option.value);
                  setSelectedLabel(option.label);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function UpdateBannerPage() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const bannerId = params.id as string;
  const [selectedType, setSelectedType] = useState<BannerType>("ADS");
  const [placements, setPlacements] = useState<Placement[]>([
    { page: "HOME", location: "START_OF_PAGE" },
  ]);

  // Paginated select configurations
  const brandPaginatedConfig = {
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
      return brands.brands.map((brand: any) => ({
        label: `${brand.title?.english || brand.name || t("common.na")} - ${
          brand.title?.arabic || t("common.na")
        }`,
        value: brand.id.toString(),
        rawData: brand,
      }));
    },
  };

  const categoryPaginatedConfig = {
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
      return categories.categories.map((category: any) => ({
        label: `${
          category.title?.english || category.name || t("common.na")
        } - ${category.title?.arabic || t("common.na")}`,
        value: category.id.toString(),
        rawData: category,
      }));
    },
  };

  // Custom fetch function for paginated selects
  const fetchOptions = async (endpoint: string, params: any) => {
    try {
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

  // Format image URL
  const formatImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return import.meta.env.VITE_IMAGE_BASE_URL  + url;
  };

  // Define form fields for updating banner
  const bannerFields: FormField[] = [
    // Current Image Display (Read-only)
    {
      name: "currentImage",
      label: t("banners.form.currentBannerImage"),
      type: "custom",
      cols: 12,
      render: (value, data) => {
        const currentImageUrl = data?.image ? formatImageUrl(data.image) : null;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-lg">
                <ImageIcon
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  {t("banners.form.currentBannerImage")}
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("banners.form.currentImageDescription")}
                </p>
              </div>
            </div>

            <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30 flex items-center justify-center p-4">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={t("banners.form.currentBannerImage")}
                  className="max-w-full max-h-full object-contain"
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
                    {t("banners.form.noImageAvailable")}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      },
    },

    // Image Upload Field
    {
      name: "image",
      label: t("banners.form.newBannerImage"),
      type: "image",
      required: false,
      cols: 12,
      accept: ".jpg,.jpeg,.png,.webp,.gif",
      helperText: t("banners.form.newImageHelperText"),
      renderCustom: ({ onChange, value, disabled, data, error }) => {
        const currentImageUrl = data?.image ? formatImageUrl(data.image) : null;
        const isFile = value instanceof File;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-lg">
                <ImageIcon
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  {t("banners.form.newBannerImage")}
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("banners.form.updateImageDescription")}
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
                      accept=".jpg,.jpeg,.png,.webp,.gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        console.log("File selected:", file);
                        if (file) {
                          // Validate file size (5MB max)
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error(t("banners.form.fileSizeError"));
                            return;
                          }

                          // Validate file type
                          const validTypes = [
                            "image/jpeg",
                            "image/jpg",
                            "image/png",
                            "image/webp",
                            "image/gif",
                          ];
                          if (!validTypes.includes(file.type.toLowerCase())) {
                            toast.error(t("banners.form.fileTypeError"));
                            return;
                          }

                          onChange(file);
                        }
                      }}
                      className="sr-only"
                      id="image-upload-update"
                      disabled={disabled}
                    />
                    <div
                      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-colors bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50 ${
                        disabled
                          ? "border-slate-200 dark:border-slate-700 opacity-50"
                          : isFile
                          ? "border-green-500 dark:border-green-400"
                          : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!disabled) {
                          document
                            .getElementById("image-upload-update")
                            ?.click();
                        }
                      }}
                    >
                      <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full mb-3">
                        <Upload
                          size={24}
                          className="text-indigo-600 dark:text-indigo-400"
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                        {isFile
                          ? t("banners.form.changeUploadedFile")
                          : t("banners.form.clickToUploadNewImage")}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {t("banners.form.JPGPNGWEBPUpTo5MB")}
                      </span>
                      {isFile && (
                        <div className="mt-3 px-3 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 rounded-full">
                          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            ✓ {value.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {error.message as string}
                  </p>
                )}
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t("banners.form.preview")}
                </label>
                <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30 flex items-center justify-center">
                  {isFile ? (
                    <div className="w-full h-full p-4 flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(value)}
                        alt={t("banners.form.newImagePreview")}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : currentImageUrl ? (
                    <div className="text-center w-full h-full">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 pt-2">
                        {t("banners.form.currentImage")}
                      </p>
                      <div className="w-full h-full p-4 flex items-center justify-center">
                        <img
                          src={currentImageUrl}
                          alt={t("banners.form.currentBannerImage")}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="mx-auto w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-2">
                        <ImageIcon
                          size={20}
                          className="text-slate-400 dark:text-slate-500"
                        />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t("banners.form.uploadNewImagePreview")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Banner Requirements */}
            <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("banners.form.bannerRequirements.title")}
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                {t("banners.form.bannerRequirements.items", {
                  returnObjects: true,
                }).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        );
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
        { value: "ADS", label: t("banners.types.ads") },
        { value: "BRAND", label: t("banners.types.brand") },
        { value: "CATEGORY", label: t("banners.types.category") },
        { value: "DISCOUNT", label: t("banners.types.discount") },
      ],
      validation: z.string().min(1, t("banners.validations.typeRequired")),
    },

    // Conditional Reference ID field based on selected type
    {
      name: "refId",
      label: t("banners.form.refId"),
      type: "custom",
      required: false,
      cols: 6,
      validation: z
        .union([
          z.string().min(1, t("banners.validations.refIdMin")),
          z.number().min(1, t("banners.validations.refIdMin")),
        ])
        .optional(),
      renderCustom: ({ value, onChange, disabled, data }) => {
        const currentType = data?.type || selectedType;

        if (currentType === "BRAND") {
          return (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("banners.form.selectBrand")}
              </label>
              <PaginatedSelectField
                config={brandPaginatedConfig}
                value={value}
                onChange={onChange}
                placeholder={t("banners.form.selectBrandPlaceholder")}
                disabled={disabled}
                fetchOptions={fetchOptions}
              />
            </div>
          );
        } else if (currentType === "CATEGORY") {
          return (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("banners.form.selectCategory")}
              </label>
              <PaginatedSelectField
                config={categoryPaginatedConfig}
                value={value}
                onChange={onChange}
                placeholder={t("banners.form.selectCategoryPlaceholder")}
                disabled={disabled}
                fetchOptions={fetchOptions}
              />
            </div>
          );
        } else {
          return (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("banners.form.refId")}
              </label>
              <div className="relative">
                <Link
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="number"
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={t("banners.form.placeholders.refId")}
                  disabled={disabled}
                  className="w-full px-4 py-3 pl-11 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  min="1"
                />
              </div>
            </div>
          );
        }
      },
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
      validation: z
        .string()
        .min(1, t("banners.validations.placementsRequired")),
      renderCustom: ({ value, onChange, disabled, data }) => {
        const currentPlacements = data?.parsedPlacements || placements;

        return (
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
              {currentPlacements.map((placement: Placement, index: number) => (
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
                          const newPlacements = [...currentPlacements];
                          newPlacements[index].page = e.target.value;
                          setPlacements(newPlacements);
                          onChange(JSON.stringify(newPlacements));
                        }}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="HOME">{t("banners.pages.home")}</option>
                        <option value="BRAND">
                          {t("banners.pages.brand")}
                        </option>
                        <option value="PRODUCT_DETAILS">
                          {t("banners.pages.productDetail")}
                        </option>
                        <option value="SUB_CATEGORY">
                          {t("banners.pages.subcategory")}
                        </option>
                        <option value="CATEGORY">
                          {t("banners.pages.category")}
                        </option>
                        <option value="STORE">
                          {t("banners.pages.store")}
                        </option>
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
                          const newPlacements = [...currentPlacements];
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
                      if (currentPlacements.length > 1) {
                        const newPlacements = currentPlacements.filter(
                          (_, i) => i !== index
                        );
                        setPlacements(newPlacements);
                        onChange(JSON.stringify(newPlacements));
                      }
                    }}
                    disabled={disabled || currentPlacements.length <= 1}
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
                  ...currentPlacements,
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
        );
      },
    },
  ];

  // Handle update
  const handleUpdate = async (id: string, data: any) => {
    try {
      console.log("Update called with data:", data);

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
        formData.append("refId", "");
      }

      formData.append("status", data.status);
      formData.append("startDate", new Date(data.startDate).toISOString());
      formData.append("endDate", new Date(data.endDate).toISOString());
      formData.append("order", data.order.toString());
      formData.append("placements", data.placements);

      // Add image file if provided and it's a File object
      if (data.image && data.image instanceof File) {
        formData.append("image", data.image);
        console.log("Adding new image file to FormData");
      } else {
        console.log("No new image file provided, keeping current image");
      }

      // Log FormData for debugging
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Make API call
      const response = await UpdateMethodFormData(
        `/banners`,
        formData,
        id,
        lang
      );

      console.log("Update response:", response);

      if (!response) {
        throw new Error("No response from server");
      }

      if (response.code !== 200) {
        throw new Error(
          response.message?.english || response.message || "Update failed"
        );
      }

      return response;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleAfterSuccess = () => {
    // Invalidate banners query to refresh the list
    queryClient.invalidateQueries({ queryKey: ["banners"] });
    toast.success(t("banners.messages.updateSuccess"), { duration: 2000 });

    // Redirect after delay
    setTimeout(() => {
      navigate("/banners");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(error.message || t("banners.messages.updateFailed"));
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only fields
    const {
      currentImage,
      createdAt,
      id,
      parsedPlacements,
      originalType,
      ...rest
    } = data;

    // If image is not a File object (meaning it's the original URL string), remove it
    if (rest.image && !(rest.image instanceof File)) {
      delete rest.image;
    }

    console.log("After transformation:", rest);
    return rest;
  };

  // Update selected type when form data changes
  const handleDataLoaded = (data: any) => {
    if (data?.type) {
      setSelectedType(data.type);
    }
    if (data?.parsedPlacements) {
      setPlacements(data.parsedPlacements);
    }
  };

  if (!bannerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("banners.update.notFound")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {t("banners.update.invalidId")}
          </p>
          <button
            onClick={() => navigate("/banners")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t("banners.backToList")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/banners")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("banners.backToList")}
        </button>

        <GenericUpdateForm
          title={t("banners.update.title")}
          description={t("banners.update.description")}
          fields={bannerFields}
          entityId={bannerId}
          fetchData={fetchBannerById}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/banners")}
          onBack={() => navigate("/banners")}
          submitLabel={t("banners.update.submitLabel")}
          cancelLabel={t("common.cancel")}
          showBackButton={true}
          className="mb-8"
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={beforeSubmit}
          fetchOptions={fetchOptions}
        />

        {/* Additional Information */}
        <div className="mt-8 p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {t("help.aboutBannerUpdates.title")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("help.aboutBannerUpdates.scheduling")}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("help.aboutBannerUpdates.schedulingDescription")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("help.aboutBannerUpdates.placements")}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("help.aboutBannerUpdates.placementsDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
