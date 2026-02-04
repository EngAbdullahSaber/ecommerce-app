// pages/stores/edit/[id].tsx - Update Store Page
"use client";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Store,
  Building,
  Image as ImageIcon,
  Upload,
  ArrowLeft,
  FileText,
  AlertCircle,
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

// Store Interface
interface StoreData {
  id: number;
  arabicName: string;
  englishName: string;
  name: {
    arabic: string;
    english: string;
  };
  description: {
    arabic: string;
    english: string;
  };
  logo: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

// Fetch store by ID
const fetchStoreById = async (id: string, lang: string): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/stores/${id}`, lang);

    if (!response || !response.data) {
      throw new Error(t("stores.messages.storeNotFound"));
    }

    const store = response.data as StoreData;
    console.log("Store data:", store);

    // Transform the data for the form
    const transformedData = {
      id: store.id,
      englishName: store.name.english,
      arabicName: store.name.arabic,
      englishDescription: store.description.english,
      arabicDescription: store.description.arabic,
      logo: import.meta.env.VITE_IMAGE_BASE_URL + store.logo, // URL string for display
      currentLogo: store.logo, // For display purposes
      image: store.image
        ? import.meta.env.VITE_IMAGE_BASE_URL + store.image
        : null,
      currentImage: store.image, // For display purposes
      createdAt: new Date(store.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedAt: new Date(store.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    return transformedData;
  } catch (error) {
    console.error("Error fetching store:", error);
    throw error;
  }
};

export default function UpdateStorePage() {
  const params = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const toast = useToast();
  const storeId = params.id as string;
  const queryClient = useQueryClient();

  // Format image URL
  const formatImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return import.meta.env.VITE_IMAGE_BASE_URL + url;
  };

  // Define form fields for updating store
  const storeFields: FormField[] = [
    // Store Names (Editable)
    {
      name: "englishName",
      label: t("stores.form.englishName"),
      type: "text",
      placeholder: t("stores.form.placeholderEnglishName"),
      required: true,
      icon: <Building size={18} />,
      cols: 6,
      validation: z.string().min(2, t("stores.validations.nameMin")),
      helperText: t("stores.form.englishNameHelper"),
    },
    {
      name: "arabicName",
      label: t("stores.form.arabicName"),
      type: "text",
      placeholder: t("stores.form.placeholderArabicName"),
      required: true,
      cols: 6,
      validation: z.string().min(2, t("stores.validations.nameMin")),
      helperText: t("stores.form.arabicNameHelper"),
    },

    // Store Descriptions (Editable)
    {
      name: "englishDescription",
      label: t("stores.form.englishDescription"),
      type: "textarea",
      placeholder: t("stores.form.placeholderEnglishDescription"),
      required: true,
      icon: <FileText size={18} />,
      cols: 6,
      validation: z.string().min(10, t("stores.validations.descriptionMin")),
      helperText: t("stores.form.englishDescriptionHelper"),
    },
    {
      name: "arabicDescription",
      label: t("stores.form.arabicDescription"),
      type: "textarea",
      placeholder: t("stores.form.placeholderArabicDescription"),
      required: true,
      cols: 6,
      validation: z.string().min(10, t("stores.validations.descriptionMin")),
      helperText: t("stores.form.arabicDescriptionHelper"),
    },

    // Logo Upload Field
    {
      name: "logo",
      label: t("stores.form.newLogoOptional"),
      type: "image",
      required: false,
      cols: 12,
      accept: ".jpg,.jpeg,.png,.svg,.webp",
      helperText: t("stores.form.leaveEmptyKeepCurrent"),
    },

    // Store Image Upload Field
    {
      name: "image",
      label: t("stores.form.newStoreImageOptional"),
      type: "image",
      required: false,
      cols: 12,
      accept: ".jpg,.jpeg,.png,.webp",
      helperText: t("stores.form.imageUploadHelper"),
    },
  ];

  // Handle update
  const handleUpdate = async (id: string, data: any) => {
    try {
      console.log("Update called with data:", data);

      // Prepare FormData
      const formData = new FormData();

      // Add store data
      if (data.englishName) {
        formData.append("englishName", data.englishName);
      }
      if (data.arabicName) {
        formData.append("arabicName", data.arabicName);
      }
      if (data.englishDescription) {
        formData.append("englishDescription", data.englishDescription);
      }
      if (data.arabicDescription) {
        formData.append("arabicDescription", data.arabicDescription);
      }

      // Add logo file if provided and it's a File object
      if (data.logo && data.logo instanceof File) {
        formData.append("logo", data.logo);
        console.log("Adding new logo file to FormData");
      } else {
        console.log("No new logo file provided, keeping current logo");
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
        `/stores`,
        formData,
        id,
        lang,
      );

      console.log("Update response:", response);

      if (!response) {
        throw new Error(t("stores.messages.noResponse"));
      }

      if (response.code !== 200) {
        const errorMessage =
          lang === "ar"
            ? response.message?.arabic
            : response.message?.english ||
              response.message ||
              t("stores.messages.updateFailed");
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleAfterSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["stores"] });
    toast.success(t("stores.messages.updateSuccess"), { duration: 2000 });

    // Redirect after delay
    setTimeout(() => {
      navigate("/Stores");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(error.message || t("stores.messages.updateFailed"));
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only fields
    const { currentLogo, currentImage, createdAt, updatedAt, id, ...rest } =
      data;

    // If logo is not a File object (meaning it's the original URL string), remove it
    if (rest.logo && !(rest.logo instanceof File)) {
      delete rest.logo;
    }

    // If image is not a File object (meaning it's the original URL string or null), remove it
    if (rest.image && !(rest.image instanceof File)) {
      delete rest.image;
    }

    console.log("After transformation:", rest);
    return rest;
  };

  if (!storeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/30 dark:from-slate-950 dark:via-amber-950/30 dark:to-orange-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("stores.messages.storeNotFoundTitle")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {t("stores.messages.storeNotFoundDesc")}
          </p>
          <button
            onClick={() => navigate("/Stores")}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            {t("stores.backToList")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/30 dark:from-slate-950 dark:via-amber-950/30 dark:to-orange-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/Stores")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("stores.backToList")}
        </button>

        <UpdateForm
          title={t("stores.updateTitle")}
          description={t("stores.form.updateDescription")}
          fields={storeFields}
          entityId={storeId}
          fetchData={(id: string) => fetchStoreById(id, lang)}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/Stores")}
          onBack={() => navigate("/Stores")}
          submitLabel={t("common.saveChanges")}
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
