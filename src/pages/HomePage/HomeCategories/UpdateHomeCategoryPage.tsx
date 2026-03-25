import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Layers,
  ArrowLeft,
  Layout,
  ListOrdered,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UpdateMethod,
  GetSpecifiedMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { UpdateForm } from "../../../components/shared/GenericUpdateForm/UpdateForm";
import { FormField } from "../../../components/shared/GenericUpdateForm/types";

export default function UpdateHomeCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);
  const [categoryType, setCategoryType] = useState<string>("");

  // Fetch home category details
  const { data: categoryDetailsResponse, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["home-category-details", id, lang],
    queryFn: () => GetSpecifiedMethod(`home-page/admin/home-categories`, lang), // We can't get single ID usually, so we fetch all and find, OR use standard /id
    // Wait, most APIs use /id for details.
    enabled: !!id,
  });

  // Since the API for home-categories might not have a direct /id GET, 
  // we might need to find it in the list if the /id fails.
  // But let's assume standard REST for now.
  
  const categoryDetails = categoryDetailsResponse?.data;
  
  // If the API returns an array, find the item
  const itemData = Array.isArray(categoryDetails) 
    ? categoryDetails.find((c: any) => c.id.toString() === id)
    : categoryDetails;

  const [formFields, setFormFields] = useState<FormField[]>([]);

  const handleFieldChange = (name: string, value: any) => {
    if (name === "type") {
      setCategoryType(value);
    }
  };

  useEffect(() => {
    if (itemData && !categoryType) {
        setCategoryType(itemData.type);
    }
  }, [itemData]);

  useEffect(() => {
    const fields: FormField[] = [
      {
        name: "categoryName",
        label: t("homeCategories.fields.category"),
        type: "text",
        disabled: true,
        icon: <Layers size={18} />,
        cols: 12,
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
      });
    }

    setFormFields(fields);
  }, [categoryType, t]);

  const handleUpdate = async (id: string | number, data: any) => {
    const payload = {
      type: data.type,
      displayOrder: Number(data.displayOrder),
      withBestSeller: data.type === "SPECIFIC_CATEGORIES_WITH_SUBCATEGORIES_AND_BRANDS" ? !!data.withBestSeller : false,
    };

    return await UpdateMethod(
      "home-page/admin/home-categories",
      payload,
      id.toString(),
      lang
    );
  };

  const fetchData = async () => {
    try {
      // First try to fetch all and find the item (since list response is reliable)
      const response = await GetSpecifiedMethod(`home-page/admin/home-categories`, lang);
      
      const categories = response?.data || [];
      const item = Array.isArray(categories) 
        ? categories.find((c: any) => c.id.toString() === id)
        : categories;

      if (!item) throw new Error("Category configuration not found");

      setCategoryType(item.type);

      return {
        ...item,
        categoryName: lang === 'ar' ? item.category.title.arabic : item.category.title.english,
        displayOrder: item.displayOrder,
        withBestSeller: !!item.withBestSeller
      };
    } catch (error) {
      console.error("Fetch data error:", error);
      throw error;
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
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl">
                <Layers size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 dark:from-slate-100 dark:via-amber-100 dark:to-orange-100 bg-clip-text text-transparent">
                  {t("homeCategories.edit.title")}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {t("homeCategories.edit.description")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <UpdateForm
          title={t("homeCategories.edit.title")}
          description={t("homeCategories.edit.description")}
          fields={formFields}
          entityId={id!}
          fetchData={fetchData}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/home-page/home-categories")}
          submitLabel={t("common.save") || "Update Category"}
          cancelLabel={t("common.cancel") || "Cancel"}
          afterSuccess={() => {
              toast.success(t("homeCategories.edit.success"));
              queryClient.invalidateQueries({ queryKey: ["home-categories"] });
              setTimeout(() => navigate("/home-page/home-categories"), 1500);
          }}
          onFieldChange={handleFieldChange}
          showBackButton={false}
        />
      </div>
    </div>
  );
}
