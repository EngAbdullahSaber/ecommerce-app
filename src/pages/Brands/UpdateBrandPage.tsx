// pages/brands/edit/[id].tsx - Update Brand Page
"use client";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Upload,
  Image,
  ArrowLeft,
  FileText,
  Globe,
} from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import {
  GetSpecifiedMethod,
  UpdateMethodFormData,
} from "../../services/apis/ApiMethod";
import {
  FormField,
  GenericUpdateForm,
} from "../../components/shared/GenericUpdateForm";
import { useQueryClient } from "@tanstack/react-query";
import { UpdateForm } from "../../components/shared/GenericUpdateForm/UpdateForm";

// Brand Interface
interface Brand {
  id: number;
  title: {
    english: string;
    arabic: string;
  };
  description: {
    english: string;
    arabic: string;
  };
  image: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

// Fetch brand by ID
const fetchBrandById = async (id: string, lang: string): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/brands/${id}`, lang);

    if (!response || !response.data) {
      throw new Error("Brand not found");
    }

    const brand = response.data as Brand;
    console.log("Fetched brand:", brand);

    // Transform the data for the form
    const transformedData = {
      id: brand.id,
      englishTitle: brand.title.english,
      arabicTitle: brand.title.arabic,
      englishDescription: brand.description.english,
      arabicDescription: brand.description.arabic,
      image: import.meta.env.VITE_IMAGE_BASE_URL + brand.image, // URL for display
      currentimage: brand.image, // Original image path
      createdAt: new Date(brand.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    return transformedData;
  } catch (error) {
    console.error("Error fetching brand:", error);
    throw error;
  }
};

export default function UpdateBrandPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const toast = useToast();
  const brandId = params.id as string;
  const queryClient = useQueryClient();

  // Format image URL
  const formatImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return import.meta.env.VITE_IMAGE_BASE_URL + url;
  };

  // Define form fields for updating brand
  const brandFields: FormField[] = [
    // English Title
    {
      name: "englishTitle",
      label: t("brands.form.englishTitle"),
      type: "text",
      placeholder: t("brands.form.placeholderEnglishTitle"),
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z.string().min(2, t("brands.form.titleMinLength")),
      helperText: t("brands.form.englishTitleHelper"),
    },
    {
      name: "arabicTitle",
      label: t("brands.form.arabicTitle"),
      type: "text",
      placeholder: t("brands.form.placeholderArabicTitle"),
      required: true,
      cols: 6,
      validation: z.string().min(2, t("brands.form.titleMinLengthAr")),
      helperText: t("brands.form.arabicTitleHelper"),
    },

    // English Description
    {
      name: "englishDescription",
      label: t("brands.form.englishDescription"),
      type: "textarea",
      placeholder: t("brands.form.placeholderEnglishDescription"),
      required: true,
      icon: <FileText size={18} />,
      cols: 12,
      rows: 4,
      validation: z.string().min(10, t("brands.form.descriptionMinLength")),
      helperText: t("brands.form.englishDescriptionHelper"),
    },

    // Arabic Description
    {
      name: "arabicDescription",
      label: t("brands.form.arabicDescription"),
      type: "textarea",
      placeholder: t("brands.form.placeholderArabicDescription"),
      required: true,
      cols: 12,
      rows: 4,
      validation: z.string().min(10, t("brands.form.descriptionMinLengthAr")),
      helperText: t("brands.form.arabicDescriptionHelper"),
    },

    // Image Upload Field
    {
      name: "image",
      label: t("brands.form.newImageOptional"),
      type: "image",
      required: false,
      cols: 12,
      accept: ".jpg,.jpeg,.png,.svg,.webp",
      helperText: t("brands.form.imageUploadHelper"),
    },
  ];

  // Handle update
  const handleUpdate = async (id: string, data: any) => {
    try {
      console.log("Update called with data:", data);

      // Prepare FormData
      const formData = new FormData();

      // Add brand data
      if (data.englishTitle) {
        formData.append("englishTitle", data.englishTitle);
      }
      if (data.arabicTitle) {
        formData.append("arabicTitle", data.arabicTitle);
      }
      if (data.englishDescription) {
        formData.append("englishDescription", data.englishDescription);
      }
      if (data.arabicDescription) {
        formData.append("arabicDescription", data.arabicDescription);
      }

      // Add image file if provided and it's a File object
      if (data.image && data.image instanceof File) {
        formData.append("image", data.image);
        console.log("Adding new image file to FormData");
      } else {
        console.log("No new image file provided, keeping current image");
      }

      // Log FormData for debugging
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Make API call
      const response = await UpdateMethodFormData(
        `/brands`,
        formData,
        id,
        lang,
      );

      console.log("Update response:", response);

      if (!response) {
        throw new Error(t("brands.messages.noResponse"));
      }

      if (response.code !== 200) {
        const errorMessage =
          lang === "ar"
            ? response.message?.arabic
            : response.message?.english ||
              response.message ||
              t("brands.messages.updateFailed");
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleAfterSuccess = () => {
    // Invalidate brands query to refresh the list
    queryClient.invalidateQueries({ queryKey: ["brands"] });
    toast.success(t("brands.messages.updateSuccess"), { duration: 2000 });

    // Redirect after delay
    setTimeout(() => {
      navigate("/brands");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(error.message || t("brands.messages.updateFailed"));
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only fields
    const { currentimage, createdAt, id, ...rest } = data;

    // If image is not a File object (meaning it's the original URL string), remove it
    if (rest.image && !(rest.image instanceof File)) {
      delete rest.image;
    }

    console.log("After transformation:", rest);
    return rest;
  };

  // AlertCircle icon component
  const AlertCircle = ({ size }: { size: number }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );

  if (!brandId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("brands.messages.brandNotFound")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {t("brands.messages.brandIdMissing")}
          </p>
          <button
            onClick={() => navigate("/brands")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t("brands.backToList")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <UpdateForm
          title={t("brands.updateTitle")}
          description={t("brands.form.updateDescription")}
          fields={brandFields}
          entityId={brandId}
          fetchData={(id: string) => fetchBrandById(id, lang)}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/brands")}
          onBack={() => navigate("/brands")}
          submitLabel={t("common.saveChanges")}
          cancelLabel={t("common.cancel")}
          showBackButton={true}
          className="mb-8"
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={beforeSubmit}
        />

        {/* Additional Information */}
        <div className="mt-8 p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {t("brands.form.aboutBrandUpdates")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("brands.form.titleUpdates")}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("brands.form.titleUpdatesHelper")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("brands.form.imageUpdates")}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("brands.form.imageUpdatesHelper")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
