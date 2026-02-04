// pages/cities/edit/[id].tsx - Update City Page
"use client";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building,
  MapPin,
  Globe,
  ArrowLeft,
  AlertCircle,
  Info,
  Flag,
} from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import {
  GetSpecifiedMethod,
  UpdateMethodFormData,
  GetPanigationMethod,
} from "../../services/apis/ApiMethod";
import { FormField } from "../../components/shared/GenericUpdateForm";
import { useQueryClient } from "@tanstack/react-query";
import { UpdateForm } from "../../components/shared/GenericUpdateForm/UpdateForm";

// City Interface based on your data structure
interface CityName {
  english: string;
  arabic: string;
}

interface City {
  id: number;
  name: CityName;
  countryId: number;
  country?: {
    id: number;
    name: CityName;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

// Country Interface for paginated select
interface Country {
  id: number;
  name: {
    english: string;
    arabic: string;
  };
}

// Fetch city by ID
const fetchCityById = async (id: string, lang: string): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/cities/${id}`, lang);

    if (!response || !response.data) {
      throw new Error("City not found");
    }

    const city = response.data as City;
    console.log("City data:", city);

    // Transform the data for the form
    const transformedData = {
      id: city.id,
      nameEnglish: city?.name?.english || "",
      nameArabic: city?.name?.arabic || "",
      countryId: city.countryId || null,
      currentCountryName: city.country?.name?.english || "Select country",
      createdAt: new Date(city.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedAt: city.updatedAt
        ? new Date(city.updatedAt).toLocaleDateString("en-US", {
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
    console.error("Error fetching city:", error);
    throw error;
  }
};

// Fetch countries for paginated select - Fixed to match GetPanigationMethod signature
const fetchCountries = async (
  endpoint: string,
  params: any,
  lang: string,
): Promise<any> => {
  try {
    console.log("Fetching countries with params:", params);

    const { page, pageSize, search } = params;

    // Extract search term from params
    let searchTerm = "";
    if (search) {
      searchTerm = search;
    } else if (params.name) {
      searchTerm = params.name;
    } else if (params.searchParam) {
      searchTerm = params.searchParam;
    }

    // Call GetPanigationMethod with correct signature
    const response = await GetPanigationMethod(
      endpoint,
      page || 1,
      pageSize || 10,
      lang, // language
      searchTerm, // search term
    );

    console.log("Countries response:", response);

    if (!response) {
      throw new Error("Failed to fetch countries");
    }

    const data = response.data || [];
    const total = response.meta?.total || data.length || 0;

    return {
      data,
      meta: response.meta || {},
      total,
    };
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }
};

export default function UpdateCityPage() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const cityId = params.id as string;
  const queryClient = useQueryClient();

  // Define form fields for updating city
  const cityFields: FormField[] = [
    // Basic Information Section Header
    {
      name: "basicInfoHeader",
      label: t("cities.form.cityInformation"),
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-lg">
              <Building
                size={20}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("cities.form.cityInformation")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("cities.form.updateCityDetails")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // City Names (Editable)
    {
      name: "nameEnglish",
      label: t("cities.form.englishName"),
      type: "text",
      placeholder: t("cities.form.englishNamePlaceholder", "New York"),
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z.string().min(2, t("cities.validations.nameMin")),
      helperText: t(
        "cities.form.englishNameHelper",
        "Enter city name in English",
      ),
    },
    {
      name: "nameArabic",
      label: t("cities.form.arabicName"),
      type: "text",
      placeholder: t("cities.form.arabicNamePlaceholder", "نيويورك"),
      required: true,
      cols: 6,
      validation: z.string().min(2, t("cities.validations.nameMin")),
      helperText: t(
        "cities.form.arabicNameHelper",
        "Enter city name in Arabic",
      ),
    },

    // Country Selection (Paginated Select)
    {
      name: "countryId",
      label: t("cities.form.country"),
      type: "paginatedSelect",
      placeholder: t("cities.form.selectCountry"),
      required: true,
      cols: 12,
      icon: <Flag size={18} />,
      paginatedSelectConfig: {
        endpoint: "/countries",
        searchParam: "name",
        labelKey: "name.english",
        valueKey: "id",
        pageSize: 10,
        debounceTime: 500,
        transformResponse: (data: any) => {
          return (
            data.countries?.map((country: any) => ({
              label:
                country.name?.english ||
                t("cities.form.countryId", { id: country.id }),
              value: country.id,
              ...country,
            })) || []
          );
        },
      },
      validation: z.number().min(1, t("cities.validations.selectCountry")),
      helperText: t("cities.form.selectCountryHelper"),
    },
  ];

  // Handle update
  const handleUpdate = async (id: string, data: any) => {
    try {
      console.log("Update called with data:", data);

      // Prepare FormData
      const formData = new FormData();

      // Add name data in the required format
      if (data.nameEnglish) {
        formData.append("englishName", data.nameEnglish);
      }
      if (data.nameArabic) {
        formData.append("arabicName", data.nameArabic);
      }

      // Add countryId if provided
      if (data.countryId) {
        formData.append("countryId", data.countryId.toString());
      }

      // Log FormData for debugging
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Make API call
      const response = await UpdateMethodFormData(
        `/cities`,
        formData,
        id,
        lang,
      );

      console.log("Update response:", response);

      if (!response) {
        throw new Error(t("common.noResponse"));
      }

      if (response.code !== 200) {
        throw new Error(
          response.message?.english ||
            response.message ||
            t("cities.messages.updateFailed"),
        );
      }

      return response;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleAfterSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["cities"] });
    toast.success(t("cities.messages.updateSuccess"), { duration: 2000 });

    // Redirect after delay
    setTimeout(() => {
      navigate("/cities");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(error.message || t("cities.messages.updateError"));
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only fields
    const { createdAt, updatedAt, currentCountryName, id, ...rest } = data;

    // Ensure countryId is a number
    if (rest.countryId) {
      rest.countryId = parseInt(rest.countryId);
    }

    console.log("After transformation:", rest);
    return rest;
  };

  if (!cityId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("cities.messages.cityNotFound")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {t("cities.messages.cityIdMissing")}
          </p>
          <button
            onClick={() => navigate("/cities")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("cities.messages.backToCities")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <UpdateForm
          title={t("cities.updateCity")}
          description={t("cities.form.editCityDetails")}
          fields={cityFields}
          entityId={cityId}
          fetchData={(id) => fetchCityById(id, lang)}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/cities")}
          onBack={() => navigate("/cities")}
          submitLabel={t("common.saveChanges")}
          cancelLabel={t("common.cancel")}
          showBackButton={true}
          className="mb-8"
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={beforeSubmit}
          fetchOptions={(endpoint, params) =>
            fetchCountries(endpoint, params, lang)
          }
        />
      </div>
    </div>
  );
}
