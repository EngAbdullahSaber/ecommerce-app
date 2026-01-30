"use client";
import { useState } from "react";
import { GenericForm, FormField } from "../../components/shared/GenericForm";
import { z } from "zod";
import {
  Store,
  Upload,
  ArrowLeft,
  ImageIcon,
  FileText,
  Globe,
  Building,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CreateMethodFormData } from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateStorePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Define form fields for creating a store
  const storeFields: FormField[] = [
    // Store Names
    {
      name: "englishName",
      label: t("stores.form.englishName"),
      type: "text",
      placeholder: t("stores.form.englishName"),
      required: true,
      icon: <Building size={18} />,
      cols: 6,
      validation: z.string().min(2, t("stores.validations.nameMin")),
    },
    {
      name: "arabicName",
      label: t("stores.form.arabicName"),
      type: "text",
      placeholder: t("stores.form.arabicName"),
      required: true,
      cols: 6,
      validation: z.string().min(2, t("stores.validations.nameMin")),
    },

    // Store Descriptions
    {
      name: "englishDescription",
      label: t("stores.form.englishDescription"),
      type: "textarea",
      placeholder: t("stores.form.englishDescription"),
      required: true,
      icon: <FileText size={18} />,
      cols: 6,
      validation: z.string().min(10, t("stores.validations.descriptionMin")),
    },
    {
      name: "arabicDescription",
      label: t("stores.form.arabicDescription"),
      type: "textarea",
      placeholder: t("stores.form.arabicDescription"),
      required: true,
      cols: 6,
      validation: z.string().min(10, t("stores.validations.descriptionMin")),
    },

    // Logo Upload
    {
      name: "logo",
      label: t("stores.form.storeLogo"),
      type: "image",
      required: true,
      cols: 12,
      renderCustom: ({ onChange, value, disabled }) => (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-lg">
              <Store size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                {t("stores.form.storeLogo")} *
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("stores.form.uploadLogo")}
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
                      if (file) {
                        setLogoFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setLogoPreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                        onChange(file);
                      }
                    }}
                    className="sr-only"
                    id="logo-upload"
                    required={true}
                    disabled={disabled}
                  />
                  <div
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-colors bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50 ${
                      disabled
                        ? "border-slate-200 dark:border-slate-700 opacity-50"
                        : "border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer"
                    }`}
                  >
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full mb-3">
                      <Upload
                        size={24}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      {logoFile
                        ? t("stores.form.changeUploadedFile")
                        : t("stores.form.clickToUploadLogo")}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t("stores.form.JPGPNGSVGUpTo5MB")}
                    </span>
                    {logoFile && (
                      <div className="mt-3 px-3 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 rounded-full">
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          ✓ {logoFile.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </label>
            </div>

            {/* Logo Preview */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("stores.form.logoPreview")}
              </label>
              <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30 flex items-center justify-center">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain p-4"
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
                      {t("stores.form.logoPreviewHere")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Store Image Upload
    {
      name: "image",
      label: t("stores.form.storeImage"),
      type: "image",
      required: false,
      cols: 12,
      renderCustom: ({ onChange, value, disabled }) => (
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
                {t("stores.form.storeImage")}
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("stores.form.uploadImage")}
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
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                        onChange(file);
                      }
                    }}
                    className="sr-only"
                    id="image-upload"
                    disabled={disabled}
                  />
                  <div
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-colors bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50 ${
                      disabled
                        ? "border-slate-200 dark:border-slate-700 opacity-50"
                        : "border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 cursor-pointer"
                    }`}
                  >
                    <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-full mb-3">
                      <Upload
                        size={24}
                        className="text-amber-600 dark:text-amber-400"
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      {imageFile
                        ? t("stores.form.image.change")
                        : t("stores.form.image.click")}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t("stores.form.JPGPNGUpTo10MB")}
                    </span>
                    {imageFile && (
                      <div className="mt-3 px-3 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 rounded-full">
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          ✓ {imageFile.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </label>
            </div>

            {/* Image Preview */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("stores.form.imagePreview")}
              </label>
              <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Store image preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <div className="mx-auto w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-2">
                      <ImageIcon
                        size={20}
                        className="text-slate-400 dark:text-slate-500"
                      />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t("stores.form.imagePreviewHere")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Default values for the form
  const defaultValues = {
    englishName: "",
    arabicName: "",
    englishDescription: "",
    arabicDescription: "",
    logo: null,
    image: null,
  };

  // Handle form submission with FormData
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("stores.messages.creating"));

    try {
      // Prepare FormData
      const formData = new FormData();

      // Add store data
      formData.append("arabicName", data.arabicName);
      formData.append("englishName", data.englishName);
      formData.append("arabicDescription", data.arabicDescription);
      formData.append("englishDescription", data.englishDescription);

      // Add logo file (required)
      if (data.logo) {
        formData.append("logo", data.logo);
      } else {
        throw new Error("Store logo is required");
      }

      // Add image file if exists
      if (data.image) {
        formData.append("image", data.image);
      }

      // Make API call
      const response = await CreateMethodFormData("/stores", formData, lang);

      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("stores.messages.createSuccess"), { duration: 2000 });

        // Invalidate stores query to trigger refetch
        queryClient.invalidateQueries({ queryKey: ["stores"] });

        // Navigate to stores list after delay
        setTimeout(() => {
          navigate("/Stores");
        }, 1500);
      } else {
        throw new Error("Failed to create store");
      }
    } catch (error: any) {
      console.error("Failed to create store:", error);
      toast.dismiss(loadingToast);

      toast.error(
        `${t("stores.messages.createFailed")} ${error.message || ""}`,
        { duration: 3000 }
      );

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/30 dark:from-slate-950 dark:via-amber-950/30 dark:to-orange-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/Stores")}
          disabled={isLoading}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("stores.backToList")}
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl">
              <Store size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 dark:from-slate-100 dark:via-amber-100 dark:to-orange-100 bg-clip-text text-transparent">
                {t("stores.create.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("stores.create.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <GenericForm
          title={t("stores.form.title")}
          description={t("stores.form.description")}
          fields={storeFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/Stores")}
          submitLabel={t("stores.form.actions.create")}
          cancelLabel={t("common.cancel")}
          isLoading={isLoading}
          mode="create"
          className="group"
        />
      </div>
    </div>
  );
}
