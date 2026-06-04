"use client";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Gift, ArrowLeft, Globe, Palette, DollarSign, Hash } from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import { formatImageUrl } from "../../services/utils";
import { GetSpecifiedMethod, UpdateMethod } from "../../services/apis/ApiMethod";
import { FormField } from "../../components/shared/GenericUpdateForm";
import { useQueryClient } from "@tanstack/react-query";
import { UpdateForm } from "../../components/shared/GenericUpdateForm/UpdateForm";

interface LocalizedName {
  arabic: string;
  english: string;
}

interface StoreGiftColor {
  id: number;
  storeId: number;
  name: LocalizedName;
  hexCode: string | null;
  image: string | null;
  fee: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  store?: { id: number; name: LocalizedName };
}

const fetchStoreGiftColorById = async (
  id: string,
  lang: string,
): Promise<any> => {
  const response = await GetSpecifiedMethod(`/store-gift-colors/${id}`, lang);
  if (!response || !response.data) throw new Error("Gift color not found");

  const color = response.data as StoreGiftColor;

  return {
    id: color.id,
    storeId: color.storeId,
    storeName: color.store
      ? lang === "ar"
        ? color.store.name.arabic
        : color.store.name.english
      : String(color.storeId),
    nameEnglish: color.name?.english || "",
    nameArabic: color.name?.arabic || "",
    hexCode: color.hexCode || "",
    image: color.image ? formatImageUrl(color.image) : "",
    currentImage: color.image || "",
    fee: parseFloat(color.fee || "0"),
    isActive: color.isActive ? "true" : "false",
    sortOrder: color.sortOrder ?? 0,
    createdAt: new Date(color.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
};

export default function UpdateStoreGiftColorPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const toast = useToast();
  const colorId = params.id as string;
  const queryClient = useQueryClient();

  const colorFields: FormField[] = [
    {
      name: "storeName",
      label: t("storeGiftColors.form.store"),
      type: "text",
      required: false,
      disabled: true,
      cols: 12,
      helperText: t("storeGiftColors.form.storeCannotChange"),
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
      helperText: t("storeGiftColors.form.imageHelper"),
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

  const handleUpdate = async (id: string, data: any) => {
    const body: Record<string, any> = {};

    if (data.nameEnglish || data.nameArabic) {
      body.name = {
        arabic: data.nameArabic,
        english: data.nameEnglish,
      };
    }
    if (data.hexCode !== undefined) body.hexCode = data.hexCode || null;
    if (data.fee !== undefined) body.fee = parseFloat(data.fee) || 0;
    if (data.sortOrder !== undefined) body.sortOrder = parseInt(data.sortOrder) || 0;
    if (data.isActive !== undefined) {
      body.isActive = data.isActive === "true" || data.isActive === true;
    }

    if (typeof data.image === "string" && data.image.trim()) {
      body.image = data.image.trim();
    }

    const response = await UpdateMethod("/store-gift-colors", body, id, lang);
    if (response?.code && response.code !== 200)
      throw new Error(
        lang === "ar"
          ? response.message?.arabic
          : response.message?.english || t("storeGiftColors.messages.updateFailed"),
      );
    return response;
  };

  const handleAfterSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["storeGiftColors"] });
    toast.success(t("storeGiftColors.messages.updateSuccess"), {
      duration: 2000,
    });
    setTimeout(() => navigate("/store-gift-colors"), 1500);
  };

  const handleAfterError = (error: any) => {
    toast.error(error.message || t("storeGiftColors.messages.updateFailed"));
  };

  const beforeSubmit = (data: any) => {
    const { id, createdAt, currentImage, storeName, storeId, ...rest } = data;
    if (rest.image && !(rest.image instanceof File)) {
      delete rest.image;
    }
    return rest;
  };

  if (!colorId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/30 to-rose-50/30 dark:from-slate-950 dark:via-pink-950/30 dark:to-rose-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("storeGiftColors.messages.colorNotFound")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {t("storeGiftColors.messages.colorIdMissing")}
          </p>
          <button
            onClick={() => navigate("/store-gift-colors")}
            className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            {t("storeGiftColors.backToList")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/30 to-rose-50/30 dark:from-slate-950 dark:via-pink-950/30 dark:to-rose-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/store-gift-colors")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("storeGiftColors.backToList")}
        </button>

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-xl">
            <Gift size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-pink-900 to-rose-900 dark:from-slate-100 dark:via-pink-100 dark:to-rose-100 bg-clip-text text-transparent">
              {t("storeGiftColors.updateTitle")}
            </h1>
          </div>
        </div>

        <UpdateForm
          title={t("storeGiftColors.form.title")}
          description={t("storeGiftColors.form.description")}
          fields={colorFields}
          entityId={colorId}
          fetchData={(id: string) => fetchStoreGiftColorById(id, lang)}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/store-gift-colors")}
          onBack={() => navigate("/store-gift-colors")}
          submitLabel={t("common.saveChanges")}
          cancelLabel={t("common.cancel")}
          showBackButton={true}
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={beforeSubmit}
        />
      </div>
    </div>
  );
}
