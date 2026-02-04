// pages/countries/edit/[id].tsx - Update Country Page
"use client";
import { useParams, useNavigate } from "react-router-dom";
import {
  Globe,
  Flag,
  Languages,
  MapPin,
  ArrowLeft,
  Image,
  Upload,
} from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";
import {
  GetSpecifiedMethod,
  UpdateMethodFormData,
} from "../../services/apis/ApiMethod";
import { FormField } from "../../components/shared/GenericUpdateForm";
import { useQueryClient } from "@tanstack/react-query";
import { UpdateForm } from "../../components/shared/GenericUpdateForm/UpdateForm";

// Country Interface
interface CountryName {
  arabic: string;
  english: string;
}

interface Country {
  id: number;
  name: CountryName;
  flag: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

export default function UpdateCountryPage() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const countryId = params.id as string;
  const queryClient = useQueryClient();
  const lang = i18n.language || "en";

  // Format image URL
  const formatImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return import.meta.env.VITE_IMAGE_BASE_URL + url;
  };

  const fetchCountryById = async (id: string): Promise<any> => {
    try {
      const response = await GetSpecifiedMethod(`/countries/${id}`, lang);

      if (!response || !response.data) {
        throw new Error(t("countries.loadError"));
      }

      const country = response.data as Country;
      const transformedData = {
        id: country.id,
        nameEnglish: country?.name?.english,
        nameArabic: country?.name?.arabic,
        flag: import.meta.env.VITE_IMAGE_BASE_URL + country.flag,
        currentFlag: country.flag,
        createdAt: new Date(country.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      return transformedData;
    } catch (error) {
      console.error("Error fetching country:", error);
      throw error;
    }
  };

  // Define form fields for updating country with translations
  const countryFields: FormField[] = [
    {
      name: "nameEnglish",
      label: t("countries.form.englishName"),
      type: "text",
      placeholder: t("countries.form.englishNamePlaceholder", "United States"),
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z.string().min(2, t("countries.validations.nameMin")),
    },
    {
      name: "nameArabic",
      label: t("countries.form.arabicName"),
      type: "text",
      placeholder: t(
        "countries.form.arabicNamePlaceholder",
        "الولايات المتحدة",
      ),
      required: true,
      cols: 6,
      validation: z.string().min(2, t("countries.validations.nameMin")),
    },
    {
      name: "flag",
      label: t("countries.form.countryFlag"),
      type: "image",
      required: false,
      cols: 12,
      accept: ".jpg,.jpeg,.png,.svg,.webp",
      helperText: t("countries.form.flagHelperText"),
    },
  ];

  // Handle update
  const handleUpdate = async (id: string, data: any) => {
    try {
      console.log("Update called with data:", data);

      const formData = new FormData();

      if (data.nameEnglish) {
        formData.append("englishName", data.nameEnglish);
      }
      if (data.nameArabic) {
        formData.append("arabicName", data.nameArabic);
      }

      if (data.flag && data.flag instanceof File) {
        formData.append("flag", data.flag);
        console.log("Adding new flag file to FormData");
      } else {
        console.log("No new flag file provided, keeping current flag");
      }

      const response = await UpdateMethodFormData(
        `/countries`,
        formData,
        id,
        lang,
      );

      if (!response) {
        throw new Error(t("countries.messages.updateError"));
      }

      if (response.code !== 200) {
        throw new Error(
          response.message?.english ||
            response.message ||
            t("countries.messages.updateFailed"),
        );
      }

      return response;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleAfterSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["countries"] });
    toast.success(t("countries.messages.updateSuccess"), { duration: 2000 });

    setTimeout(() => {
      navigate("/countries");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(error.message || t("countries.messages.updateError"));
  };

  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);
    const { currentFlag, createdAt, id, ...rest } = data;

    if (rest.flag && !(rest.flag instanceof File)) {
      delete rest.flag;
    }

    return rest;
  };

  if (!countryId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("countries.notFound")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {t("countries.invalidId")}
          </p>
          <button
            onClick={() => navigate("/countries")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("countries.backToList")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <UpdateForm
          title={t("countries.updateTitle")}
          description={t("countries.updateDescription")}
          fields={countryFields}
          entityId={countryId}
          fetchData={fetchCountryById}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/countries")}
          onBack={() => navigate("/countries")}
          submitLabel={t("countries.form.submitUpdate")}
          cancelLabel={t("common.cancel")}
          showBackButton={true}
          className="mb-8"
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={beforeSubmit}
        />
      </div>
    </div>
  );
}
