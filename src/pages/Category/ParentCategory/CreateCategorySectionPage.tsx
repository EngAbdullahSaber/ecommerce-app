import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { 
  Plus, 
  ArrowLeft, 
  Layout, 
  Settings, 
  Globe, 
  CheckCircle2, 
  Grid,
  Tag,
  Filter
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { CreateForm } from "../../../components/shared/GenericForm/CreateForm";
import { FormField } from "../../../components/shared/GenericForm/types";
import { GetPanigationMethodWithFilter, CreateMethod, GetSpecifiedMethod } from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateCategorySectionPage() {
  const { id } = useParams<{ id: string }>(); // Parent Category ID
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);
  const [sectionType, setSectionType] = useState<string>("SPECIFIC_CATEGORIES");
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<any[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const fetchOptions = useCallback(async (endpoint: string, params: any) => {
    try {
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
  }, [lang]);

  const handleFieldChange = (name: string, value: any) => {
    if (name === "type") {
      setSectionType(value);
    }
    if (name === "filterId") {
      setSelectedFilterId(value);
    }
  };

  useEffect(() => {
    if (sectionType === "SPECIFIC_FILTERS" && selectedFilterId) {
      const fetchOptionsData = async () => {
        try {
          const response = await GetSpecifiedMethod(`/filter-attributes/${selectedFilterId}`, lang);
          const options = response?.data?.options || [];
          setFilterOptions(options.map((opt: any) => ({
            label: lang === 'ar' ? (opt.nameAr || opt.name || opt.valueAr || opt.value) : (opt.name || opt.valueEn || opt.value),
            value: opt.id.toString()
          })));
        } catch (e) {
          console.error("Error fetching filter options:", e);
          setFilterOptions([]);
        }
      };
      fetchOptionsData();
    } else {
      setFilterOptions([]);
    }
  }, [selectedFilterId, sectionType, lang]);

  useEffect(() => {
    const fields: FormField[] = [
      {
        name: "title",
        label: t("categorySections.create.fields.title"),
        type: "text",
        required: true,
        icon: <Globe size={18} />,
        cols: 12,
        validation: z.string().min(2),
      },
      {
        name: "type",
        label: t("categorySections.create.fields.type"),
        type: "custom",
        required: true,
        cols: 12,
        render: ({ value, onChange }) => {
          const tabs = [
            { 
              label: t("categorySections.types.SPECIFIC_CATEGORIES"), 
              value: "SPECIFIC_CATEGORIES", 
              icon: <Grid size={18} /> 
            },
            { 
              label: t("categorySections.types.SPECIFIC_BRANDS"), 
              value: "SPECIFIC_BRANDS", 
              icon: <Tag size={18} /> 
            },
            { 
              label: t("categorySections.types.SPECIFIC_FILTERS"), 
              value: "SPECIFIC_FILTERS", 
              icon: <Filter size={18} /> 
            },
          ];

          return (
            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                {t("categorySections.create.fields.type")}
              </label>
              <div className="flex flex-wrap gap-3">
                {tabs.map((tab) => {
                  const isActive = value === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => onChange(tab.value)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 border-2 ${
                        isActive
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-600/25 scale-[1.02]"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        },
        validation: z.string().min(1),
        initialValue: "SPECIFIC_CATEGORIES",
      },
      {
        name: "key",
        label: t("categorySections.create.fields.key"),
        type: "text",
        required: true,
        icon: <Settings size={18} />,
        cols: 6,
        validation: z.string().min(2),
      },
      {
        name: "keyAr",
        label: t("categorySections.create.fields.keyAr"),
        type: "text",
        required: true,
        icon: <Globe size={18} />,
        cols: 6,
        validation: z.string().min(2),
      },
      {
        name: "isActive",
        label: t("categorySections.create.fields.isActive"),
        type: "checkbox",
        icon: <CheckCircle2 size={18} />,
        cols: 12,
        initialValue: true,
      },
    ];

    if (sectionType === "SPECIFIC_FILTERS") {
      fields.push({
        name: "filterId",
        label: "Primary Filter",
        type: "paginatedSelect",
        required: true,
        icon: <Grid size={18} />,
        cols: 12,
        paginatedSelectConfig: {
          endpoint: "filter-attributes",
          labelKey: "name",
          valueKey: "id",
          transformResponse: (data: any) => {
            // filter-attributes might return the array directly in 'data'
            const items = data || [];
            return items.map((item: any) => ({
              label: lang === 'ar' ? (item.name?.arabic || item.name) : (item.name?.english || item.name),
              value: item.id.toString(),
            }));
          }
        },
        validation: z.coerce.string().min(1),
      });
    }

    // Collections Array Field
    const collectionSubFields: FormField[] = [
      {
        name: "collectionId",
        label: t("categorySections.create.fields.collectionId"),
        type: "paginatedSelect",
        required: true,
        cols: sectionType === "SPECIFIC_FILTERS" ? 6 : 12,
        paginatedSelectConfig: {
          endpoint: 
            sectionType === "SPECIFIC_CATEGORIES" ? "categories" : 
            sectionType === "SPECIFIC_BRANDS" ? "brands" :
            sectionType === "SPECIFIC_FILTERS" ? `filter-attributes/${selectedFilterId}`:"",
          labelKey: "title",
          valueKey: "id",
          pageSize: 10,
          additionalParams: {},
          transformResponse: (data: any) => {
            // Helper to find the actual array in the response
            const findItems = (node: any) => {
              if (Array.isArray(node)) return node;
              if (!node) return [];
              return (
                node.categories ||
                node.brands ||
                node.options ||
                node.data ||
                node.items ||
                []
              );
            };

            let items = findItems(data);
            // If we found an object that has the data in it, go deeper (e.g. res.data.data.categories)
            if (!Array.isArray(items) && typeof items === "object") {
              items = findItems(items);
            }

            if (!Array.isArray(items)) items = [];

            return items.map((item: any) => ({
              label: lang === "ar"
                ? (item.title?.arabic || item.name?.arabic || item.nameAr || item.valueAr || item.title || item.name || item.value)
                : (item.title?.english || item.name?.english || item.nameEn || item.valueEn || item.title || item.name || item.value),
              value: item.id.toString(),
            }));
          },
        },
        validation: z.coerce.string().min(1),
      }
    ];

    if (sectionType === "SPECIFIC_FILTERS") {
      collectionSubFields.push({
        name: "image",
        label: t("categorySections.create.fields.image"),
        type: "imageApi",
        cols: 6,
        imageUploadConfig: {
          uploadEndpoint: "/upload",
        },
        validation: z.string().optional().or(z.literal("")),
      });
    }

    fields.push({
      name: "collections",
      label: t("categorySections.create.fields.collections"),
      type: "array",
      cols: 12,
      arrayConfig: {
        fields: collectionSubFields,
        addButtonLabel: t("categorySections.create.fields.addCollection"),
        minItems: 1,
      },
    });

    setFormFields(fields);
  }, [sectionType, selectedFilterId, filterOptions, t, lang]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("categorySections.create.form.loading"));

    try {
      const payload = {
        title: data.title,
        type: data.type,
        key: data.key,
        keyAr: data.keyAr,
        isActive: !!data.isActive,
        collections: data.collections.map((col: any) => ({
          collectionId: Number(col.collectionId),
          ...(col.image && { image: col.image })
        }))
      };

      const response = await CreateMethod(
        `categories/${id}/sections`,
        payload,
        lang
      );

      if (response && (response.code === 200 || response.code === 201)) {
        toast.dismiss(loadingToast);
        toast.success(t("categorySections.create.form.success"));
        queryClient.invalidateQueries({ queryKey: ["category-sections", id] });
        setTimeout(() => navigate(`/parent-categories/sections/${id}`), 1500);
      } else {
        throw new Error(response?.message?.english || t("categorySections.create.form.error"));
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error?.message || t("categorySections.create.form.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-8 mb-60">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/parent-categories/sections/${id}`)}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                <Layout size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                  {t("categorySections.create.title")}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {t("categorySections.create.description")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CreateForm
            title={t("categorySections.create.form.title")}
            description={t("categorySections.create.form.description")}
            fields={formFields}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/parent-categories/sections/${id}`)}
            submitLabel={t("categorySections.create.form.submit")}
            cancelLabel={t("categorySections.create.form.cancel")}
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
