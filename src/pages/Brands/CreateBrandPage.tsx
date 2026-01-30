// pages/create-brand.tsx - Create Brand Component with FormData
"use client";
import { useState } from "react";
import { GenericForm, FormField } from "../../components/shared/GenericForm";
import { z } from "zod";
import { Upload, ArrowLeft, Building2, Globe, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateMethodFormData } from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function CreateBrandPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Define form fields for creating a brand
  const brandFields: FormField[] = [
    // English and Arabic Titles
    {
      name: "englishTitle",
      label: t("brands.form.englishTitle"),
      type: "text",
      placeholder: "Samsung",
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z.string().min(2, t("brands.validations.titleMin")),
    },
    {
      name: "arabicTitle",
      label: t("brands.form.arabicTitle"),
      type: "text",
      placeholder: "سامسونج",
      required: true,
      cols: 6,
      validation: z.string().min(2, t("brands.validations.titleMinAr")),
    },

    // English Description
    {
      name: "englishDescription",
      label: t("brands.form.englishDescription"),
      type: "textarea",
      placeholder: "Leading Korean electronics company...",
      required: true,
      icon: <FileText size={18} />,
      cols: 12,
      rows: 4,
      validation: z.string().min(10, t("brands.validations.descriptionMin")),
    },

    // Arabic Description
    {
      name: "arabicDescription",
      label: t("brands.form.arabicDescription"),
      type: "textarea",
      placeholder: "شركة إلكترونيات كورية رائدة...",
      required: true,
      cols: 12,
      rows: 4,
      validation: z.string().min(10, t("brands.validations.descriptionMinAr")),
    },

    // Logo Upload
    {
      name: "image",
      label: t("brands.form.brandLogo"),
      type: "image",
      required: true,
      cols: 12,
      renderCustom: ({ onChange, value, disabled }) => (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-lg">
              <Building2
                size={20}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                {t("brands.form.brandLogo")} *
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("brands.form.uploadLogo")}
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
                        setImageFile(file);
                        // Create preview
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                        // Pass file to form
                        onChange(file);
                      }
                    }}
                    className="sr-only"
                    id="image-upload"
                    required={true}
                    disabled={disabled}
                  />
                  <div
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-colors bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50 ${
                      disabled
                        ? "border-slate-200 dark:border-slate-700 opacity-50"
                        : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer"
                    }`}
                  >
                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full mb-3">
                      <Upload
                        size={24}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      {imageFile
                        ? t("brands.form.changeUploadedFile")
                        : t("brands.form.clickToUploadLogo")}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t("brands.form.JPGPNGSVGUpTo5MB")}
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

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("brands.form.logoPreview")}
              </label>
              <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30 flex items-center justify-center">
                {imagePreview ? (
                  <div className="w-full h-full p-4 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt={t("brands.form.logoPreview")}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <div className="mx-auto w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-2">
                      <Building2
                        size={20}
                        className="text-slate-400 dark:text-slate-500"
                      />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t("brands.form.logoPreviewHere")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Logo Requirements */}
          <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("brands.form.logoRequirements.title")}
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
              {t("brands.form.logoRequirements.items", {
                returnObjects: true,
              }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
  ];

  // Default values for the form
  const defaultValues = {
    englishTitle: "",
    arabicTitle: "",
    englishDescription: "",
    arabicDescription: "",
    image: null,
  };

  // Handle form submission with FormData
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("brands.messages.creating"));

    try {
      // Prepare FormData
      const formData = new FormData();

      // Add brand data
      formData.append("englishTitle", data.englishTitle);
      formData.append("arabicTitle", data.arabicTitle);
      formData.append("englishDescription", data.englishDescription);
      formData.append("arabicDescription", data.arabicDescription);

      // Add image file
      if (data.image) {
        formData.append("image", data.image);
      } else {
        throw new Error(
          t("brands.form.brandLogo") + " " + t("common.isRequired")
        );
      }

      // Make API call using CreateMethodFormData
      const response = await CreateMethodFormData("/brands", formData, lang);

      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("brands.messages.createSuccess"), { duration: 2000 });

        // Invalidate brands query to trigger refetch
        queryClient.invalidateQueries({ queryKey: ["brands"] });

        // Navigate to brands list after delay
        setTimeout(() => {
          navigate("/brands");
        }, 1500);
      } else {
        throw new Error(t("brands.messages.createFailed"));
      }
    } catch (error: any) {
      console.error("Failed to create brand:", error);
      toast.dismiss(loadingToast);

      // Show error toast
      toast.error(
        `${t("brands.messages.createFailed")} ${
          error.message || t("messages.error")
        }`,
        { duration: 3000 }
      );

      // Re-throw to show form error
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/brands")}
          disabled={isLoading}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("brands.backToList")}
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-slate-100 dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("brands.create.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("brands.create.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <GenericForm
          title={t("brands.form.title")}
          description={t("brands.form.description")}
          fields={brandFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/brands")}
          submitLabel={t("brands.form.actions.create")}
          cancelLabel={t("common.cancel")}
          isLoading={isLoading}
          mode="create"
          className="group"
        />

        {/* Help Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/20 dark:to-blue-500/20 rounded-lg">
                <Globe
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {t("help.brandTitles.title")}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("help.brandTitles.description")}
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/20 dark:to-emerald-500/20 rounded-lg">
                <FileText
                  size={20}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {t("help.descriptions.title")}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("help.descriptions.description")}
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/20 dark:to-pink-500/20 rounded-lg">
                <Upload
                  size={20}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {t("help.logoQuality.title")}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("help.logoQuality.description")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
