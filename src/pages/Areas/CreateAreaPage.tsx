// pages/create-area.tsx - Create Area Component with paginated select for countries using GetPanigationMethod
"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GenericForm,
  FormField,
  PaginatedSelectConfig,
} from "../../components/shared/GenericForm";
import { z } from "zod";
import { MapPin, Flag, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  CreateMethod,
  GetPanigationMethod,
} from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateAreaPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);

  const CitySelectConfig: PaginatedSelectConfig = {
    endpoint: "/cities",
    searchParam: "name",
    labelKey: "name.english",
    valueKey: "id",
    pageSize: 10,
    debounceTime: 300,
    additionalParams: {},
    transformResponse: (data: any) => {
      const cities = data.cities || data.data || data || [];

      return cities.map((city: any) => ({
        label: `${city.name?.english || t("common.na")} - ${
          city.name?.arabic || t("common.na")
        }`,
        value: city.id.toString(),
        rawData: city,
      }));
    },
  };

  const fetchCitiesOptions = async (endpoint: string, params: any) => {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const searchTerm = params.name || params.search || "";

      const response = await GetPanigationMethod(
        endpoint,
        page,
        pageSize,
        lang,
        searchTerm,
      );

      if (!response) {
        throw new Error(t("areas.messages.noResponse"));
      }

      return {
        data: response.data || [],
        meta: {
          total: response.total || response.totalItems || 0,
          last_page: response.last_page || response.totalPages || 1,
        },
      };
    } catch (error) {
      console.error("Error fetching cities:", error);
      return {
        data: [],
        meta: {
          total: 0,
          last_page: 1,
        },
      };
    }
  };

  const areaFields: FormField[] = [
    {
      name: "basicInfoHeader",
      label: t("areas.form.basicInformation"),
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
                {t("areas.form.enterAreaDetails")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    {
      name: "nameEnglish",
      label: t("areas.form.areaNameEnglish"),
      type: "text",
      placeholder: t("areas.form.areaNameEnglishPlaceholder"),
      required: true,
      icon: <MapPin size={18} />,
      cols: 6,
      validation: z.string().min(2, t("areas.form.nameMinLength")),
      helperText: t("areas.form.areaNameEnglishHelper"),
    },

    {
      name: "nameArabic",
      label: t("areas.form.areaNameArabic"),
      type: "text",
      placeholder: t("areas.form.areaNameArabicPlaceholder"),
      required: true,
      cols: 6,
      validation: z.string().min(2, t("areas.form.nameMinLength")),
      helperText: t("areas.form.areaNameArabicHelper"),
    },

    {
      name: "cityId",
      label: t("areas.form.city"),
      type: "paginatedSelect",
      required: true,
      placeholder: t("areas.form.searchCity"),
      icon: <Flag size={18} />,
      cols: 12,
      paginatedSelectConfig: CitySelectConfig,
      validation: z.string().min(1, t("areas.form.selectCityRequired")),
      helperText: t("areas.form.selectCityHelper"),
    },
  ];

  const defaultValues = {
    nameEnglish: "",
    nameArabic: "",
    cityId: "",
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("areas.messages.creating"));

    try {
      const requestData = {
        name: {
          english: data.nameEnglish,
          arabic: data.nameArabic,
        },
        cityId: parseInt(data.cityId),
      };

      const result = await CreateMethod("/areas", requestData, lang);

      if (!result) {
        throw new Error(t("areas.messages.noResponse"));
      }

      toast.dismiss(loadingToast);
      toast.success(t("areas.messages.createSuccess"), { duration: 2000 });

      queryClient.invalidateQueries({ queryKey: ["areas"] });
      queryClient.invalidateQueries({
        queryKey: ["areas-by-city", data.cityId],
      });

      setTimeout(() => {
        navigate("/areas");
      }, 1500);

      return result;
    } catch (error: any) {
      console.error("Failed to create area:", error);
      toast.dismiss(loadingToast);

      let errorMessage = t("areas.messages.createFailed");

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(errorMessage, { duration: 3000 });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-green-950/30 dark:to-emerald-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl">
              <MapPin size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-green-900 to-emerald-900 dark:from-slate-100 dark:via-green-100 dark:to-emerald-100 bg-clip-text text-transparent">
                {t("areas.form.addNewArea")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("areas.form.enterAreaDetailsWithCity")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <GenericForm
          title={t("areas.form.areaInformation")}
          description={t("areas.form.fillAreaDetails")}
          fields={areaFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/areas")}
          submitLabel={t("areas.form.createArea")}
          cancelLabel={t("common.cancel")}
          isLoading={isLoading}
          mode="create"
          className="group"
          fetchOptions={fetchCitiesOptions}
        />
      </div>
    </div>
  );
}
