// pages/create-city.tsx - Create City Component with paginated select for countries using GetPanigationMethod
"use client";
import { useState } from "react";
import {
  GenericForm,
  FormField,
  PaginatedSelectConfig,
} from "../../components/shared/GenericForm";
import { z } from "zod";
import { MapPin, Building2, Flag, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  CreateMethod,
  GetPanigationMethod,
} from "../../services/apis/ApiMethod"; // Import both methods
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function CreateCitiesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);

  // Define the paginated select configuration for countries using GetPanigationMethod
  const countrySelectConfig: PaginatedSelectConfig = {
    endpoint: "/countries",
    searchParam: "name", // This will be used for search
    labelKey: "name.english",
    valueKey: "id",
    pageSize: 10,
    debounceTime: 300,
    additionalParams: {},
    transformResponse: (data: any) => {
      // Transform API response to FieldOption format
      console.log(data.countries);
      return data.countries.map((country: any) => ({
        label: `${country.name?.english || "N/A"} - ${
          country.name?.arabic || "N/A"
        }`,
        value: country.id.toString(), // Convert to string for select
        flag: country.flag,
        rawData: country, // Keep raw data for reference
      }));
    },
  };

  // Custom fetch function for paginated select using GetPanigationMethod
  const fetchCountriesOptions = async (endpoint: string, params: any) => {
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
        data: response.data || [],
        meta: response.meta || {
          total: response.total || 0,
          last_page: response.last_page || 1,
        },
      };
    } catch (error) {
      console.error("Error fetching countries:", error);

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

  // Define form fields for creating a city with paginated select
  const cityFields: FormField[] = [
    // English Name
    {
      name: "nameEnglish",
      label: t("cities.form.englishName"),
      type: "text",
      placeholder: "New York",
      required: true,
      icon: <Building2 size={18} />,
      cols: 6,
      validation: z.string().min(2, t("cities.validations.nameMin")),
    },

    // Arabic Name
    {
      name: "nameArabic",
      label: t("cities.form.arabicName"),
      type: "text",
      placeholder: "نيويورك",
      required: true,
      cols: 6,
      validation: z.string().min(2, t("cities.validations.nameMin")),
    },

    // Country Paginated Select
    {
      name: "countryId",
      label: t("cities.form.selectCountry"),
      type: "paginatedSelect",
      required: true,
      placeholder: t("cities.form.searchCountry"),
      icon: <Flag size={18} />,
      cols: 12,
      paginatedSelectConfig: countrySelectConfig,
      validation: z.string().min(1, t("cities.validations.selectCountry")),
      helperText: t("cities.form.searchCountry"),
    },
  ];

  // Default values for the form
  const defaultValues = {
    nameEnglish: "",
    nameArabic: "",
    countryId: "",
  };

  // Handle form submission with correct data structure
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("cities.form.creating"));

    try {
      // Prepare data in the correct structure
      const requestData = {
        name: {
          english: data.nameEnglish,
          arabic: data.nameArabic,
        },
        countryId: parseInt(data.countryId), // Convert to number
      };

      console.log("Submitting city data:", requestData);

      // Use your CreateMethod function
      const result = await CreateMethod("/cities", requestData, lang);

      if (!result) {
        throw new Error(
          t("cities.form.createError", { message: "No response from server" }),
        );
      }

      toast.dismiss(loadingToast);
      toast.success(t("cities.form.createSuccess"), { duration: 2000 });

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      queryClient.invalidateQueries({
        queryKey: ["cities-by-country", data.countryId],
      });

      // Navigate to cities list after delay
      setTimeout(() => {
        navigate("/cities");
      }, 1500);

      return result;
    } catch (error: any) {
      console.error("Failed to create city:", error);
      toast.dismiss(loadingToast);

      // Show error toast
      let errorMessage = t("common.error");

      // Extract error message from different error formats
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(t("cities.form.createError", { message: errorMessage }), {
        duration: 3000,
      });

      // Re-throw to show form error
      throw new Error(errorMessage);
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
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("cities.createTitle")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("cities.createSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <GenericForm
          title={t("cities.form.title")}
          description={t("cities.form.description")}
          fields={cityFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/cities")}
          submitLabel={t("cities.form.submitCreate")}
          cancelLabel={t("common.cancel")}
          isLoading={isLoading}
          mode="create"
          className="group"
          fetchOptions={fetchCountriesOptions} // Pass custom fetch function using GetPanigationMethod
        />
      </div>
    </div>
  );
}
