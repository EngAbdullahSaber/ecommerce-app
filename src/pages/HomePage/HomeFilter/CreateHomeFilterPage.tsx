import { useState } from "react";
import { z } from "zod";
import {
  Filter,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  CreateMethod,
  GetPanigationMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CreateForm } from "../../../components/shared/GenericForm/CreateForm";
import { FormField } from "../../../components/shared/GenericForm/types";

export default function CreateHomeFilterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);

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

  const formFields: FormField[] = [
    {
      name: "titleEn",
      label: t("homeFilter.edit.fields.titleEn"),
      type: "text",
      required: true,
      cols: 6,
      validation: z.string().min(1),
    },
    {
      name: "titleAr",
      label: t("homeFilter.edit.fields.titleAr"),
      type: "text",
      required: true,
      cols: 6,
      validation: z.string().min(1),
    },
    {
      name: "filterAttributeId",
      label: t("homeFilter.edit.fields.filterAttribute"),
      type: "paginatedSelect",
      required: true,
      cols: 12,
      paginatedSelectConfig: {
        endpoint: "filter-attributes",
        labelKey: "name",
        valueKey: "id",
      },
      validation: z.coerce.number().min(1),
    },
  ];

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("homeFilter.loading"));

    try {
      const response = await CreateMethod(
        "home-page/admin/home-filter",
        data,
        lang
      );

      if (response && response.code === 200 || response.code === 201) {
        toast.dismiss(loadingToast);
        toast.success(t("homeFilter.create.success"));
        queryClient.invalidateQueries({ queryKey: ["home-filter"] });
        setTimeout(() => navigate("/home-page/home-filter"), 1500);
      } else {
          throw new Error();
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(t("homeFilter.create.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/home-page/home-filter")}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-xl">
                <Filter size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                  {t("homeFilter.create.title")}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {t("homeFilter.create.description")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CreateForm
                title={t("homeFilter.create.title")}
                description={t("homeFilter.create.description")}
                fields={formFields}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/home-page/home-filter")}
                submitLabel={t("common.save") || "Create Filter"}
                cancelLabel={t("common.cancel") || "Cancel"}
                isLoading={isLoading}
                mode="create"
                fetchOptions={fetchOptions}
            />
        </div>
      </div>
    </div>
  );
}
