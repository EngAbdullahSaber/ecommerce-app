"use client";
import { useState } from "react";
import { FormField, PaginatedSelectConfig } from "../../components/shared/GenericForm";
import { z } from "zod";
import {
  Gift,
  ArrowLeft,
  Globe,
  Store,
  Palette,
  DollarSign,
  Hash,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  CreateMethod,
  GetPanigationMethod,
} from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CreateForm } from "../../components/shared/GenericForm/CreateForm";

export default function CreateStoreGiftColorPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const [isLoading, setIsLoading] = useState(false);

  const storeSelectConfig: PaginatedSelectConfig = {
    endpoint: "/stores",
    searchParam: "name",
    labelKey: "name.english",
    valueKey: "id",
    pageSize: 10,
    debounceTime: 300,
    additionalParams: {},
    // transformResponse receives the already-extracted data array from fetchStoreOptions
    transformResponse: (data: any) => {
      const stores = Array.isArray(data) ? data : (data.stores || data.data || []);
      return stores.map((store: any) => ({
        label:
          lang === "ar"
            ? `${store.name?.arabic || ""} (${store.name?.english || ""})`
            : `${store.name?.english || ""} (${store.name?.arabic || ""})`,
        value: store.id.toString(),
        rawData: store,
      }));
    },
  };

  // fetchOptions is passed to CreateForm so paginatedSelect uses authenticated axios calls
  const fetchStoreOptions = async (endpoint: string, params: any) => {
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
      // usePaginatedSelect extracts response.data, so return the stores array there
      return {
        data: response?.data?.stores || [],
        meta: {
          total: response?.totalItems || 0,
          last_page: response?.totalPages || 1,
        },
      };
    } catch {
      return { data: [], meta: { total: 0, last_page: 1 } };
    }
  };

  const colorFields: FormField[] = [
    {
      name: "storeId",
      label: t("storeGiftColors.form.store"),
      type: "paginatedSelect",
      required: true,
      placeholder: t("storeGiftColors.form.storePlaceholder"),
      icon: <Store size={18} />,
      cols: 12,
      paginatedSelectConfig: storeSelectConfig,
      validation: z.string().min(1, t("storeGiftColors.validations.storeRequired")),
    },
    {
      name: "nameEnglish",
      label: t("storeGiftColors.form.nameEnglish"),
      type: "text",
      placeholder: t("storeGiftColors.form.nameEnglishPlaceholder"),
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z.string().min(1, t("storeGiftColors.validations.nameRequired")),
    },
    {
      name: "nameArabic",
      label: t("storeGiftColors.form.nameArabic"),
      type: "text",
      placeholder: t("storeGiftColors.form.nameArabicPlaceholder"),
      required: true,
      cols: 6,
      validation: z.string().min(1, t("storeGiftColors.validations.nameRequired")),
    },
    {
      name: "hexCode",
      label: t("storeGiftColors.form.hexCode"),
      type: "custom",
      required: false,
      cols: 6,
      render: ({ onChange, value, disabled }: any) => (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("storeGiftColors.form.hexCode")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="h-10 w-12 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 p-1"
            />
            <div className="relative flex-1">
              <Palette
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#FF0000"
                disabled={disabled}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "image",
      label: t("storeGiftColors.form.image"),
      type: "image",
      required: false,
      cols: 6,
      accept: ".jpg,.jpeg,.png,.webp,.svg",
    },
    {
      name: "fee",
      label: t("storeGiftColors.form.fee"),
      type: "number",
      placeholder: t("storeGiftColors.form.feePlaceholder"),
      required: false,
      icon: <DollarSign size={18} />,
      cols: 4,
      validation: z.coerce.number().min(0, t("storeGiftColors.validations.feeMin")).optional(),
    },
    {
      name: "sortOrder",
      label: t("storeGiftColors.form.sortOrder"),
      type: "number",
      placeholder: t("storeGiftColors.form.sortOrderPlaceholder"),
      required: false,
      icon: <Hash size={18} />,
      cols: 4,
      validation: z.coerce.number().int().min(0, t("storeGiftColors.validations.sortOrderMin")).optional(),
    },
    {
      name: "isActive",
      label: t("storeGiftColors.form.isActive"),
      type: "select",
      required: false,
      cols: 4,
      options: [
        { value: "true", label: t("common.active") },
        { value: "false", label: t("common.inactive") },
      ],
    },
  ];

  const defaultValues = {
    storeId: "",
    nameEnglish: "",
    nameArabic: "",
    hexCode: "",
    image: null,
    fee: 0,
    sortOrder: 0,
    isActive: "true",
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("storeGiftColors.messages.creating"));

    try {
      const body: Record<string, any> = {
        storeId: parseInt(data.storeId, 10),
        name: {
          arabic: data.nameArabic,
          english: data.nameEnglish,
        },
        fee: parseFloat(data.fee) || 0,
        isActive: data.isActive === "true" || data.isActive === true,
        sortOrder: parseInt(data.sortOrder) || 0,
      };

      if (data.hexCode?.trim()) body.hexCode = data.hexCode.trim();
      if (typeof data.image === "string" && data.image.trim()) {
        body.image = data.image.trim();
      }

      await CreateMethod("/store-gift-colors", body, lang);

      toast.dismiss(loadingToast);
      toast.success(t("storeGiftColors.messages.createSuccess"), {
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["storeGiftColors"] });

      setTimeout(() => {
        navigate("/store-gift-colors");
      }, 1500);
    } catch (error: any) {
      console.error("Failed to create gift color:", error);
      toast.dismiss(loadingToast);
      toast.error(
        `${t("storeGiftColors.messages.createFailed")} ${error.message || ""}`,
        { duration: 3000 },
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/30 to-rose-50/30 dark:from-slate-950 dark:via-pink-950/30 dark:to-rose-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/store-gift-colors")}
          disabled={isLoading}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("storeGiftColors.backToList")}
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-xl">
              <Gift size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-pink-900 to-rose-900 dark:from-slate-100 dark:via-pink-100 dark:to-rose-100 bg-clip-text text-transparent">
                {t("storeGiftColors.create.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("storeGiftColors.create.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <CreateForm
          title={t("storeGiftColors.form.title")}
          description={t("storeGiftColors.form.description")}
          fields={colorFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/store-gift-colors")}
          submitLabel={t("storeGiftColors.form.actions.create")}
          cancelLabel={t("common.cancel")}
          isLoading={isLoading}
          mode="create"
          fetchOptions={fetchStoreOptions}
        />
      </div>
    </div>
  );
}
