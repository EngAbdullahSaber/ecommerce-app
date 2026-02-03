"use client";
import { useState } from "react";
import {
  GenericForm,
  FormField,
  PaginatedSelectConfig,
} from "../../components/shared/GenericForm";
import { z } from "zod";
import {
  Store,
  Upload,
  ArrowLeft,
  ImageIcon,
  FileText,
  Globe,
  Building,
  Users, // Added Users icon for merchants
} from "lucide-react"; // Added Users import
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CreateMethodFormData,
  GetPanigationMethod,
} from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { CreateForm } from "../../components/shared/GenericForm/CreateForm";

export default function CreateStorePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Define the paginated select configuration for merchants using GetPanigationMethod
  const merchantSelectConfig: PaginatedSelectConfig = {
    endpoint: "/merchants", // Changed from /countries to /merchants
    searchParam: "name", // This will be used for search
    labelKey: "name.english",
    valueKey: "id",
    pageSize: 10,
    debounceTime: 300,
    additionalParams: {},
    transformResponse: (data: any) => {
      // Transform API response to FieldOption format
      console.log(data.merchants || data.data); // Updated to merchants
      const merchants = data.merchants || data.data || [];
      return merchants.map((merchant: any) => ({
        label: `${merchant.firstName || merchant.englishName || "N/A"}  ${
          merchant.lastName || merchant.arabicName || "N/A"
        }`,
        value: merchant.id.toString(), // Convert to string for select
        rawData: merchant, // Keep raw data for reference
      }));
    },
  };

  // Custom fetch function for paginated select using GetPanigationMethod
  const fetchMerchantsOptions = async (endpoint: string, params: any) => {
    try {
      // Extract parameters
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const searchTerm = params.name || params.search || ""; // Get search term

      // Use GetPanigationMethod with the correct parameters
      const response = await GetPanigationMethod(
        endpoint, // URL
        page, // Page number
        pageSize, // Page size
        lang, // Language
        searchTerm, // Search term (name parameter)
      );

      if (!response) {
        throw new Error("No response from server");
      }

      // Return data in the format expected by paginated select
      return {
        data: response.data || response.merchants || [], // Handle both response formats
        meta: response.meta || {
          total: response.total || response.meta?.total || 0,
          last_page: response.last_page || response.meta?.last_page || 1,
        },
      };
    } catch (error) {
      console.error("Error fetching merchants:", error);

      // Return empty data on error
      return {
        data: [],
        meta: {
          total: 0,
          last_page: 1,
        },
      };
    }
  };

  // Define form fields for creating a store
  const storeFields: FormField[] = [
    // Store Names
    {
      name: "englishName",
      label: t("stores.form.englishName"),
      type: "text",
      placeholder: t("stores.form.englishName"),
      required: true,
      icon: <Building size={18} />,
      cols: 6,
      validation: z.string().min(2, t("stores.validations.nameMin")),
    },
    {
      name: "arabicName",
      label: t("stores.form.arabicName"),
      type: "text",
      placeholder: t("stores.form.arabicName"),
      required: true,
      cols: 6,
      validation: z.string().min(2, t("stores.validations.nameMin")),
    },

    // Merchants Paginated Select (changed from countryId to merchantId)
    {
      name: "merchantId", // Changed from countryId to merchantId
      label: t("stores.form.selectMerchant"), // Updated translation key
      type: "paginatedSelect",
      required: true,
      placeholder: t("stores.form.searchMerchant"), // Updated translation key
      icon: <Users size={18} />, // Changed from Flag to Users icon
      cols: 12,
      paginatedSelectConfig: merchantSelectConfig, // Changed config
      validation: z.string().min(1, t("stores.validations.selectMerchant")), // Updated validation message
      helperText: t("stores.form.selectMerchantHelper"), // Updated helper text
    },

    // Store Descriptions
    {
      name: "englishDescription",
      label: t("stores.form.englishDescription"),
      type: "textarea",
      placeholder: t("stores.form.englishDescription"),
      required: true,
      icon: <FileText size={18} />,
      cols: 6,
      validation: z.string().min(10, t("stores.validations.descriptionMin")),
    },
    {
      name: "arabicDescription",
      label: t("stores.form.arabicDescription"),
      type: "textarea",
      placeholder: t("stores.form.arabicDescription"),
      required: true,
      cols: 6,
      validation: z.string().min(10, t("stores.validations.descriptionMin")),
    },

    // Logo Upload
    {
      name: "logo",
      label: t("stores.form.storeLogo"),
      type: "image",
      required: true,
      cols: 12,
    },

    // Store Image Upload
    {
      name: "image",
      label: t("stores.form.storeImage"),
      type: "image",
      required: false,
      cols: 12,
    },
  ];

  // Default values for the form
  const defaultValues = {
    englishName: "",
    arabicName: "",
    englishDescription: "",
    arabicDescription: "",
    merchantId: "", // Changed from countryId to merchantId
    logo: null,
    image: null,
  };

  // Handle form submission with FormData
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("stores.messages.creating"));

    try {
      // Prepare FormData
      const formData = new FormData();

      // Add store data
      formData.append("arabicName", data.arabicName);
      formData.append("englishName", data.englishName);
      formData.append("arabicDescription", data.arabicDescription);
      formData.append("englishDescription", data.englishDescription);

      // Add merchantId (changed from countryId)
      if (data.merchantId) {
        formData.append("merchantId", data.merchantId); // Changed parameter name
      }

      // Add logo file (required)
      if (data.logo) {
        formData.append("logo", data.logo);
      } else {
        throw new Error("Store logo is required");
      }

      // Add image file if exists
      if (data.image) {
        formData.append("image", data.image);
      }

      // Make API call
      const response = await CreateMethodFormData("/stores", formData, lang);

      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("stores.messages.createSuccess"), { duration: 2000 });

        // Invalidate stores query to trigger refetch
        queryClient.invalidateQueries({ queryKey: ["stores"] });

        // Navigate to stores list after delay
        setTimeout(() => {
          navigate("/Stores");
        }, 1500);
      } else {
        throw new Error("Failed to create store");
      }
    } catch (error: any) {
      console.error("Failed to create store:", error);
      toast.dismiss(loadingToast);

      toast.error(
        `${t("stores.messages.createFailed")} ${error.message || ""}`,
        { duration: 3000 },
      );

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/30 dark:from-slate-950 dark:via-amber-950/30 dark:to-orange-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl">
              <Store size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 dark:from-slate-100 dark:via-amber-100 dark:to-orange-100 bg-clip-text text-transparent">
                {t("stores.create.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("stores.create.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <CreateForm
          title={t("stores.form.title")}
          description={t("stores.form.description")}
          fields={storeFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/Stores")}
          submitLabel={t("stores.form.actions.create")}
          cancelLabel={t("common.cancel")}
          isLoading={isLoading}
          mode="create"
          className="group"
          fetchOptions={fetchMerchantsOptions} // Pass custom fetch function using GetPanigationMethod
        />
      </div>
    </div>
  );
}
