// pages/areas/edit/[id].tsx - Update Area Page
"use client";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
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
import {
  FormField,
  GenericUpdateForm,
} from "../../components/shared/GenericUpdateForm";
import { useQueryClient } from "@tanstack/react-query";

// Area Interface based on your data structure
interface Name {
  english: string;
  arabic: string;
}

interface Area {
  id: number;
  name: Name;
  cityId: number;
  city?: {
    id: number;
    name: Name;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

// City Interface for paginated select
interface City {
  id: number;
  name: Name;
}

// Fetch area by ID
const fetchAreaById = async (id: string, lang: string): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/areas/${id}`, lang);

    if (!response || !response.data) {
      throw new Error("Area not found");
    }

    const area = response.data as Area;
    console.log("Area data:", area);

    // Transform the data for the form
    const transformedData = {
      id: area.id,
      nameEnglish: area?.name?.english || "",
      nameArabic: area?.name?.arabic || "",
      cityId: area.cityId || null,
      currentCityName: area.city?.name?.english || "Select city",
      createdAt: new Date(area.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedAt: area.updatedAt
        ? new Date(area.updatedAt).toLocaleDateString("en-US", {
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
    console.error("Error fetching area:", error);
    throw error;
  }
};

// Fetch countries for paginated select
const fetchCountries = async (
  endpoint: string,
  params: any,
  lang: string
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
      searchTerm // search term
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

export default function UpdateAreaPage() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const areaId = params.id as string;
  const queryClient = useQueryClient();

  // Define form fields for updating area
  const areaFields: FormField[] = [
    // Basic Information Section Header
    {
      name: "basicInfoHeader",
      label: "Basic Information",
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 rounded-lg">
              <MapPin
                size={20}
                className="text-green-600 dark:text-green-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("areas.form.areaInformation")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("areas.form.updateAreaDetails")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Area Names (Editable)
    {
      name: "nameEnglish",
      label: t("areas.form.englishName"),
      type: "text",
      placeholder: "Manhattan",
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z.string().min(2, t("areas.form.nameMinLength")),
      helperText: t("areas.form.englishNameHelper"),
    },
    {
      name: "nameArabic",
      label: t("areas.form.arabicName"),
      type: "text",
      placeholder: "مانهاتن",
      required: true,
      cols: 6,
      validation: z.string().min(2, t("areas.form.nameMinLength")),
      helperText: t("areas.form.arabicNameHelper"),
    },

    // City Selection (Paginated Select)
    {
      name: "cityId",
      label: t("areas.form.city"),
      type: "paginatedSelect",
      placeholder: t("areas.form.selectCity"),
      required: true,
      cols: 12,
      icon: <Flag size={18} />,
      paginatedSelectConfig: {
        endpoint: "/cities",
        searchParam: "name", // Using "name" as search parameter
        labelKey: "name.english",
        valueKey: "id",
        pageSize: 10,
        debounceTime: 500,
        transformResponse: (data: any) => {
          // Handle different response structures
          const cities = data.cities || data.data || data || [];
          return cities.map((city: any) => ({
            label: city.name?.english || `City ${city.id}`,
            value: city.id,
            ...city,
          }));
        },
      },
      validation: z.number().min(1, t("areas.form.selectCityRequired")),
      helperText: t("areas.form.selectCityHelper"),
    },

    // Metadata Section Header
    {
      name: "metadataHeader",
      label: "Metadata",
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6 mt-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-500/10 dark:to-gray-500/10 rounded-lg">
              <Info size={20} className="text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("common.metadata")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("areas.form.systemInformation")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Read-only Fields
    {
      name: "createdAt",
      label: t("common.createdAt"),
      type: "text",
      readOnly: true,
      cols: 6,
      prefix: "📅",
      helperText: t("areas.form.createdAtHelper"),
    },
    {
      name: "updatedAt",
      label: t("common.lastUpdated"),
      type: "text",
      readOnly: true,
      cols: 6,
      prefix: "🔄",
      helperText: t("areas.form.updatedAtHelper"),
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

      // Add cityId if provided
      if (data.cityId) {
        formData.append("cityId", data.cityId.toString());
      }

      // Log FormData for debugging
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Make API call
      const response = await UpdateMethodFormData(`/areas`, formData, id, lang);

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
    queryClient.invalidateQueries({ queryKey: ["areas"] });
    toast.success(t("areas.messages.updateSuccess"), { duration: 2000 });

    // Redirect after delay
    setTimeout(() => {
      navigate("/areas");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(error.message || t("areas.messages.updateFailed"));
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only fields
    const { createdAt, updatedAt, currentCityName, id, ...rest } = data;

    // Ensure cityId is a number
    if (rest.cityId) {
      rest.cityId = parseInt(rest.cityId);
    }

    console.log("After transformation:", rest);
    return rest;
  };

  if (!areaId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-green-950/30 dark:to-emerald-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("areas.messages.areaNotFound")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {t("areas.messages.areaIdMissing")}
          </p>
          <button
            onClick={() => navigate("/areas")}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {t("areas.messages.backToAreas")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-green-950/30 dark:to-emerald-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/areas")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("areas.messages.backToAreas")}
        </button>

        <GenericUpdateForm
          title={t("areas.form.updateArea")}
          description={t("areas.form.editAreaDetails")}
          fields={areaFields}
          entityId={areaId}
          fetchData={(id) => fetchAreaById(id, lang)}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/areas")}
          onBack={() => navigate("/areas")}
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
