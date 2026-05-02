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
  Filter,
  LayoutDashboard,
  ShoppingBag
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { CreateForm } from "../../../components/shared/GenericForm/CreateForm";
import { FormField } from "../../../components/shared/GenericForm/types";
import { GetSpecifiedMethod, UpdateMethod, GetPanigationMethodWithFilter } from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";

export default function UpdateCategorySectionPage() {
  const { id, sectionId } = useParams<{ id: string; sectionId: string }>(); // Parent Category ID and Section ID
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchSectionData = async () => {
      setIsLoading(true);
      try {
        // While we may not need to fetch, it's better to show current values
        // Assuming the endpoint works: categories/${id}/sections/${sectionId}
        const response: any = await GetSpecifiedMethod(`categories/${id}/sections`, lang);
        const sections = response?.data?.sections || [];
        const currentSection = sections.find((s: any) => s.id.toString() === sectionId);
        
        if (currentSection) {
          const data = {
            key: currentSection.key,
            keyAr: currentSection.keyAr,
            isActive: currentSection.isActive,
            type: currentSection.type,
            title: currentSection.title,
            filterId: currentSection.refId?.toString(),
            collections: (currentSection.collections || currentSection.collectionItems || []).map((c: any) => ({
              collectionId: (c.collectionId || c.id)?.toString(),
              image: c.image
            })) || []
          };
          setInitialData(data);
          setSelectedFilterId(data.filterId || null);
        }
      } catch (error) {
        console.error("Error fetching section data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id && sectionId) {
      fetchSectionData();
    }
  }, [id, sectionId, lang]);

  useEffect(() => {
    const fields: FormField[] = [];
    const sectionType = initialData?.type;
    const isSpecialType = [].includes(sectionType as never);

    if (!isSpecialType && sectionType) {
      fields.push({
        name: "title",
        label: t("categorySections.create.fields.title"),
        type: "text",
        required: true,
        icon: <Layout size={18} />,
        cols: 12,
        validation: z.string().min(2),
      });
    }

    fields.push(
      {
        name: "key",
        label: t("categorySections.create.fields.key"),
        type: "text",
        required: true,
        icon: <Settings size={18} />,
        cols: 12,
        validation: z.string().min(2),
      },
      {
        name: "keyAr",
        label: t("categorySections.create.fields.keyAr"),
        type: "text",
        required: true,
        icon: <Globe size={18} />,
        cols: 12,
        validation: z.string().min(2),
      },
      {
        name: "isActive",
        label: t("categorySections.create.fields.isActive"),
        type: "checkbox",
        icon: <CheckCircle2 size={18} />,
        cols: 12,
        initialValue: true,
      }
    );

    if (sectionType === "SPECIFIC_FILTERS" && !isSpecialType) {
      fields.push({
        name: "filterId",
        label: t("categorySections.create.fields.filterId"),
        type: "paginatedSelect",
        cols: 12,
        required: true,
        paginatedSelectConfig: {
          endpoint: "filter-attributes",
          pageSize: 10,
          labelKey: "label",
          valueKey: "value",
          searchParam: "title",
          transformResponse: (data: any) => data.map((item: any) => ({
            label: lang === "ar" ? item.name?.arabic || item.title?.arabic || item.name : item.name?.english || item.title?.english || item.name,
            value: item.id.toString()
          })),
        }
      });
    }

    if (!isSpecialType && sectionType) {
      const collectionSubFields: FormField[] = [
        {
          name: "collectionId",
          label: t("categorySections.create.fields.collectionId"),
          type: "paginatedSelect",
          required: true,
          cols: sectionType === "SPECIFIC_FILTERS" ? 6 : 12,
          paginatedSelectConfig: {
            endpoint: (sectionType === "SPECIFIC_CATEGORIES" || sectionType === "CATEGORIES" || sectionType === "BILL_CATEGORIES") ? "categories" : 
                      (sectionType === "SPECIFIC_BRANDS" || sectionType === "BRANDS") ? "brands" : 
                      sectionType === "SPECIFIC_FILTERS" ? `filter-attributes/${selectedFilterId}` : "",
            pageSize: 10,
            labelKey: "label",
            valueKey: "value",
            searchParam: "title",
            transformResponse: (data: any) => {
              const findItems = (node: any) => {
                if (Array.isArray(node)) return node;
                if (!node) return [];
                return (node.categories || node.brands || node.options || node.data || node.items || []);
              };
              const items = findItems(data);
              return items.map((item: any) => ({
                label: lang === "ar" 
                  ? (item.title?.arabic || item.name?.arabic || item.nameAr || item.title || item.name)
                  : (item.title?.english || item.name?.english || item.nameEn || item.title || item.name),
                value: item.id.toString()
              }));
            }
          }
        }
      ];

      if (sectionType === "SPECIFIC_FILTERS") {
        collectionSubFields.push({
          name: "image",
          label: t("categorySections.create.fields.image"),
          type: "imageApi",
          cols: 6
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
          itemLabel: (idx: number) => `${t("categorySections.create.fields.collections")} #${idx + 1}`
        }
      });
    }

    setFormFields(fields);
  }, [t, initialData, lang, selectedFilterId]);

  const handleSubmit = async (data: any) => {
    const loadingToast = toast.loading(t("categorySections.create.form.loading"));

    try {
      const sectionType = initialData?.type;
      const isSpecialType = [].includes(sectionType as never);

      let payload: any;
      if (isSpecialType) {
        payload = {
          key: data.key,
          keyAr: data.keyAr,
          isActive: !!data.isActive,
        };
      } else {
        payload = {
          title: data.title,
          type: sectionType,
          key: data.key,
          keyAr: data.keyAr,
          isActive: !!data.isActive,
          collections: data.collections?.map((col: any) => ({
            collectionId: Number(col.collectionId),
            ...(sectionType === "SPECIFIC_FILTERS" && col.image && { image: col.image })
          })) || []
        };

        if (sectionType === "SPECIFIC_FILTERS" && data.filterId) {
          payload.refId = Number(data.filterId);
        }
      }

      const response = await UpdateMethod(
        `categories/${id}/sections`,
        payload,
        sectionId,
        lang
      );

      if (response && (response.code === 200 || response.code === 201)) {
        toast.dismiss(loadingToast);
        toast.success(t("categorySections.update.form.success"));
        queryClient.invalidateQueries({ queryKey: ["category-sections", id] });
        setTimeout(() => navigate(`/parent-categories/sections/${id}`), 1500);
      } else {
        throw new Error(response?.message?.english || t("categorySections.update.form.error"));
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error?.message || t("categorySections.update.form.error"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-6 mb-10 group">
          <button
            onClick={() => navigate(`/parent-categories/sections/${id}`)}
            className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:scale-110 active:scale-95"
          >
            <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Settings size={20} className="text-blue-500" />
              </div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {t("categorySections.update.title")}
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              {t("categorySections.update.description")}
            </p>
          </div>
        </div>

        {/* Content */}
        {!isLoading && initialData && (
          <CreateForm
            title={t("categorySections.update.form.title")}
            description={t("categorySections.update.form.description")}
            fields={formFields}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/parent-categories/sections/${id}`)}
            submitLabel={t("common.saveChanges")}
            defaultValues={initialData}
            fetchOptions={fetchOptions}
            onFieldChange={(name, value) => {
              if (name === "filterId") {
                setSelectedFilterId(value);
              }
            }}
          />
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-bold">{t("common.loading")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
