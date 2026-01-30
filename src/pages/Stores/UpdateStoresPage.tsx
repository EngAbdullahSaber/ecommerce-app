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
      throw new Error("Store not found");
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
      placeholder: "Electronics Store",
      required: true,
      icon: <Building size={18} />,
      cols: 6,
      validation: z.string().min(2, t("stores.validations.nameMin")),
    },
    {
      name: "arabicName",
      label: t("stores.form.arabicName"),
      type: "text",
      placeholder: "متجر الإلكترونيات",
      required: true,
      cols: 6,
      validation: z.string().min(2, t("stores.validations.nameMin")),
    },

    // Store Descriptions (Editable)
    {
      name: "englishDescription",
      label: t("stores.form.englishDescription"),
      type: "textarea",
      placeholder: "Specialized store for electronic devices",
      required: true,
      icon: <FileText size={18} />,
      cols: 6,
      validation: z.string().min(10, t("stores.validations.descriptionMin")),
    },
    {
      name: "arabicDescription",
      label: t("stores.form.arabicDescription"),
      type: "textarea",
      placeholder: "متجر متخصص في بيع الأجهزة الإلكترونية",
      required: true,
      cols: 6,
      validation: z.string().min(10, t("stores.validations.descriptionMin")),
    },

    // Current Logo Display (Read-only)
    {
      name: "currentLogo",
      label: t("stores.form.currentLogo"),
      type: "custom",
      cols: 12,
      render: (value, data) => {
        const currentLogoUrl = data?.logo ? formatImageUrl(data.logo) : null;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-lg">
                <Store
                  size={20}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  {t("stores.form.currentLogo")}
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("stores.form.currentLogoMsg")}
                </p>
              </div>
            </div>

            <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30 flex items-center justify-center p-4">
              {currentLogoUrl ? (
                <img
                  src={currentLogoUrl}
                  alt="Current logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-4">
                  <div className="mx-auto w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-2">
                    <Store
                      size={20}
                      className="text-slate-400 dark:text-slate-500"
                    />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t("stores.form.logo.noLogo")}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      },
    },

    // Logo Upload Field
    {
      name: "logo",
      label: t("stores.form.newLogoOptional"),
      type: "file",
      required: false,
      cols: 12,
      accept: ".jpg,.jpeg,.png,.svg,.webp",
      helperText: t("stores.form.leaveEmptyKeepcurrent"),
      renderCustom: ({ onChange, value, disabled, data, error }) => {
        const currentLogoUrl = data?.logo ? formatImageUrl(data.logo) : null;
        const isFile = value instanceof File;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-lg">
                <ImageIcon
                  size={20}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Update Logo (Optional)
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Upload a new logo to replace the current one
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Upload */}
              <div>
                <label className="block mb-2">
                  <div className="relative cursor-pointer">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.svg,.webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        console.log("Logo file selected:", file);
                        if (file) {
                          // Validate file size (5MB max)
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error(
                              t("stores.form.logo.errors.maxSize5MB"),
                            );
                            return;
                          }

                          // Validate file type
                          const validTypes = [
                            "image/jpeg",
                            "image/png",
                            "image/svg+xml",
                            "image/webp",
                          ];
                          if (!validTypes.includes(file.type)) {
                            toast.error(
                              t("stores.form.logo.errors.invalidType"),
                            );
                            return;
                          }

                          onChange(file);
                        }
                      }}
                      className="sr-only"
                      id="logo-upload-update"
                      disabled={disabled}
                    />
                    <div
                      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-colors bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50 ${
                        disabled
                          ? "border-slate-200 dark:border-slate-700 opacity-50"
                          : isFile
                            ? "border-green-500 dark:border-green-400"
                            : "border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!disabled) {
                          document
                            .getElementById("logo-upload-update")
                            ?.click();
                        }
                      }}
                    >
                      <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-full mb-3">
                        <Upload
                          size={24}
                          className="text-amber-600 dark:text-amber-400"
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                        {isFile
                          ? t("stores.form.changeUploadedFile")
                          : t("stores.form.clickToUploadLogo")}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        JPG, PNG, SVG up to 5MB
                      </span>
                      {isFile && (
                        <div className="mt-3 px-3 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 rounded-full">
                          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            ✓ {value.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {error.message as string}
                  </p>
                )}
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Preview
                </label>
                <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30 flex items-center justify-center">
                  {isFile ? (
                    <img
                      src={URL.createObjectURL(value)}
                      alt="Logo preview"
                      className="w-full h-full object-contain p-4"
                    />
                  ) : currentLogoUrl ? (
                    <div className="text-center w-full h-full">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 pt-2">
                        {t("stores.form.noChanges")}
                      </p>
                      <img
                        src={currentLogoUrl}
                        alt="Current logo"
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="mx-auto w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-2">
                        <Store
                          size={20}
                          className="text-slate-400 dark:text-slate-500"
                        />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t("stores.form.logoPreviewHere")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },

    // Current Image Display (Read-only)
    {
      name: "currentImage",
      label: "Current Store Image",
      type: "custom",
      cols: 12,
      render: (value, data) => {
        const currentImageUrl = data?.image ? formatImageUrl(data.image) : null;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-lg">
                <ImageIcon
                  size={20}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Current Store Image
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {currentImageUrl
                    ? "This is the current store image. Upload a new one to change it."
                    : "No store image has been uploaded yet."}
                </p>
              </div>
            </div>

            {currentImageUrl && (
              <div className="w-full h-64 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30">
                <img
                  src={currentImageUrl}
                  alt="Current store image"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        );
      },
    },

    // Store Image Upload Field
    {
      name: "image",
      label: "New Store Image (Optional)",
      type: "file",
      required: false,
      cols: 12,
      accept: ".jpg,.jpeg,.png,.webp",
      helperText: "Upload a new store image. JPG, PNG up to 10MB",
      renderCustom: ({ onChange, value, disabled, data, error }) => {
        const currentImageUrl = data?.image ? formatImageUrl(data.image) : null;
        const isFile = value instanceof File;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-lg">
                <ImageIcon
                  size={20}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Update Store Image (Optional)
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Upload a new store image or banner
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Upload */}
              <div>
                <label className="block mb-2">
                  <div className="relative cursor-pointer">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        console.log("Image file selected:", file);
                        if (file) {
                          // Validate file size (10MB max)
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error(
                              t("stores.form.image.errors.maxSize10MB"),
                            );
                            return;
                          }

                          // Validate file type
                          const validTypes = [
                            "image/jpeg",
                            "image/png",
                            "image/webp",
                          ];
                          if (!validTypes.includes(file.type)) {
                            toast.error(
                              t("stores.form.image.errors.invalidType"),
                            );
                            return;
                          }

                          onChange(file);
                        }
                      }}
                      className="sr-only"
                      id="image-upload-update"
                      disabled={disabled}
                    />
                    <div
                      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-colors bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50 ${
                        disabled
                          ? "border-slate-200 dark:border-slate-700 opacity-50"
                          : isFile
                            ? "border-green-500 dark:border-green-400"
                            : "border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!disabled) {
                          document
                            .getElementById("image-upload-update")
                            ?.click();
                        }
                      }}
                    >
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-full mb-3">
                        <Upload
                          size={24}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                        {isFile
                          ? t("stores.form.changeUploadedFile")
                          : currentImageUrl
                            ? t("stores.form.updateImageMsg")
                            : t("stores.form.clickToUploadImage")}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {t("stores.form.JPGPNGUpTo10MB")}
                      </span>
                      {isFile && (
                        <div className="mt-3 px-3 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 rounded-full">
                          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            ✓ {value.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {error.message as string}
                  </p>
                )}
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Preview
                </label>
                <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30 flex items-center justify-center">
                  {isFile ? (
                    <img
                      src={URL.createObjectURL(value)}
                      alt="Store image preview"
                      className="w-full h-full object-cover"
                    />
                  ) : currentImageUrl ? (
                    <div className="text-center w-full h-full">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 pt-2">
                        Current image (no changes)
                      </p>
                      <img
                        src={currentImageUrl}
                        alt="Current store image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="mx-auto w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-2">
                        <ImageIcon
                          size={20}
                          className="text-slate-400 dark:text-slate-500"
                        />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Upload a new image to see preview
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      },
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
        throw new Error("No response from server");
      }

      if (response.code !== 200) {
        throw new Error(
          response.message?.english || response.message || "Update failed",
        );
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

        <GenericUpdateForm
          title={t("stores.form.updateTitle")}
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
