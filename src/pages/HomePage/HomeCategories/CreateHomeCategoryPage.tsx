import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Layers,
  ArrowLeft,
  Layout,
  ListOrdered,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  CreateMethod,
  GetPanigationMethodWithFilter,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CreateForm } from "../../../components/shared/GenericForm/CreateForm";
import { FormField } from "../../../components/shared/GenericForm/types";

export default function CreateHomeCategoryPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);
  const [categoryType, setCategoryType] = useState<string>("SPECIFIC_CATEGORIES");
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const fetchOptions = async (endpoint: string, params: any) => {
    try {
      // Destructure params to match GetPanigationMethodWithFilter's signature
      const { page, pageSize, search, ...additionalParams } = params;
      
      const response = await GetPanigationMethodWithFilter(
        endpoint,
        page,
        pageSize,
        lang,
        search || "",
        additionalParams
      );
      return response;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    if (name === "type") {
      setCategoryType(value);
    }
  };

  useEffect(() => {
    const fields: FormField[] = [
      {
        name: "categoryId",
        label: t("homeCategories.fields.category"),
        type: "paginatedSelect",
        required: true,
        icon: <Layers size={18} />,
        cols: 12,
        paginatedSelectConfig: {
          endpoint: "categories",
          labelKey: "title", // API usually returns title object for categories
          valueKey: "id",
          additionalParams: {
            type: "PARENT",
          },
          transformResponse: (data: any) => {
              const items = data?.categories || data.data || [];
              console.log(items);
              return items.map((item: any) => ({
                  label: lang === 'ar' ? item.title.arabic : item.title.english,
                  value: item.id.toString(),
                  rawData: item
              }));
          }
        },
        validation: z.coerce.number().min(1),
      },
      {
        name: "type",
        label: t("homeCategories.fields.type"),
        type: "select",
        required: true,
        icon: <Layout size={18} />,
        cols: 6,
        options: [
          { label: t("homeCategories.types.SPECIFIC_CATEGORIES"), value: "SPECIFIC_CATEGORIES" },
          { label: t("homeCategories.types.SPECIFIC_CATEGORIES_WITH_SUBCATEGORIES_AND_BRANDS"), value: "SPECIFIC_CATEGORIES_WITH_SUBCATEGORIES_AND_BRANDS" },
        ],
        validation: z.string().min(1),
      },
      {
        name: "displayOrder",
        label: t("homeCategories.fields.displayOrder"),
        type: "number",
        required: true,
        icon: <ListOrdered size={18} />,
        cols: 6,
        validation: z.coerce.number().min(1),
      },
    ];

    if (categoryType === "SPECIFIC_CATEGORIES_WITH_SUBCATEGORIES_AND_BRANDS") {
      fields.push({
        name: "withBestSeller",
        label: t("homeCategories.fields.withBestSeller"),
        type: "checkbox",
        icon: <CheckCircle2 size={18} />,
        cols: 12,
        validation: z.boolean().optional(),
        initialValue: false
      });
    }

    setFormFields(fields);
  }, [categoryType, t, lang]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("homeCategories.loading"));

    try {
      const payload = {
        categoryId: Number(data.categoryId),
        type: data.type,
        displayOrder: Number(data.displayOrder),
        ...(data.type === "SPECIFIC_CATEGORIES_WITH_SUBCATEGORIES_AND_BRANDS" && {
          withBestSeller: !!data.withBestSeller,
        }),
      };

      const response = await CreateMethod(
        "home-page/admin/home-categories",
        payload,
        lang
      );

      if (response && (response.code === 200 || response.code === 201)) {
        toast.dismiss(loadingToast);
        toast.success(t("homeCategories.create.success"));
        queryClient.invalidateQueries({ queryKey: ["home-categories"] });
        setTimeout(() => navigate("/home-page/home-categories"), 1500);
      } else {
        throw new Error();
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(t("homeCategories.create.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 md:p-8 mb-60">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/home-page/home-categories")}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
                <Layers size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-slate-100 dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {t("homeCategories.create.title")}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {t("homeCategories.create.description")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CreateForm
            title={t("homeCategories.create.title")}
            description={t("homeCategories.create.description")}
            fields={formFields}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/home-page/home-categories")}
            submitLabel={t("common.add") || "Add Category"}
            cancelLabel={t("common.cancel") || "Cancel"}
            isLoading={isLoading}
            mode="create"
            fetchOptions={fetchOptions}
            onFieldChange={handleFieldChange}
          />
        </div>
      </div>
    </div>
  );
}
