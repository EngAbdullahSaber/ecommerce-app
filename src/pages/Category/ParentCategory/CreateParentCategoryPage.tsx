// pages/parent-categories/create.tsx - Create Parent Category Component
"use client";
import { useState } from "react";
import { GenericForm, FormField } from "../../../components/shared/GenericForm";
import { z } from "zod";
import {
  Folder,
  Image as ImageIcon,
  Globe,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateMethodFormData } from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function CreateParentCategoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const lang = "en";

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Define form fields for creating a parent category
  const categoryFields: FormField[] = [
    // English Title
    {
      name: "englishTitle",
      label: t("categories.parent.create.fields.englishTitle.label"),
      type: "text",
      placeholder: t(
        "categories.parent.create.fields.englishTitle.placeholder",
      ),
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z
        .string()
        .min(2, t("categories.parent.create.fields.englishTitle.validation")),
      helperText: t("categories.parent.create.fields.englishTitle.helper"),
    },

    // Arabic Title
    {
      name: "arabicTitle",
      label: t("categories.parent.create.fields.arabicTitle.label"),
      type: "text",
      placeholder: t("categories.parent.create.fields.arabicTitle.placeholder"),
      required: true,
      cols: 6,
      validation: z
        .string()
        .min(2, t("categories.parent.create.fields.arabicTitle.validation")),
      helperText: t("categories.parent.create.fields.arabicTitle.helper"),
    },

    // Image Upload
    {
      name: "image",
      label: t("categories.parent.create.fields.image.label"),
      type: "image",
      cols: 12,
      render: ({ onChange, value, disabled }) => (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-lg">
              <ImageIcon
                size={20}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                {t("categories.parent.create.fields.image.title")}
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("categories.parent.create.fields.image.description")}
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
                        const validTypes = [
                          "image/jpeg",
                          "image/png",
                          "image/webp",
                          "image/svg+xml",
                        ];
                        if (!validTypes.includes(file.type)) {
                          toast.error(
                            t(
                              "categories.parent.create.fields.image.invalidType",
                            ),
                          );
                          return;
                        }

                        const maxSize = 5 * 1024 * 1024;
                        if (file.size > maxSize) {
                          toast.error(
                            t(
                              "categories.parent.create.fields.image.sizeError",
                            ),
                          );
                          return;
                        }

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
                    id="category-image-upload"
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
                      {imageFile
                        ? t("categories.parent.create.fields.image.change")
                        : t("categories.parent.create.fields.image.upload")}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t("categories.parent.create.fields.image.fileTypes")}
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
                {t("categories.parent.create.fields.image.preview")}
              </label>
              <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={t("categories.parent.create.fields.image.preview")}
                    className="w-full h-full object-contain p-4"
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
                      {t(
                        "categories.parent.create.fields.image.previewPlaceholder",
                      )}
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
    englishTitle: "",
    arabicTitle: "",
    image: null,
  };

  // Handle form submission with FormData
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(
      t("categories.parent.create.form.loading"),
    );

    try {
      const formData = new FormData();

      formData.append("arabicTitle", data.arabicTitle);
      formData.append("englishTitle", data.englishTitle);
      formData.append("type", "PARENT");

      if (data.image) {
        formData.append("image", data.image);
      }

      console.log("Submitting FormData:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const result = await CreateMethodFormData("/categories", formData, lang);

      if (!result) {
        throw new Error(t("categories.parent.create.form.error"));
      }

      toast.dismiss(loadingToast);
      toast.success(t("categories.parent.create.form.success"), {
        duration: 2000,
      });

      queryClient.invalidateQueries({ queryKey: ["parent-categories"] });

      setTimeout(() => {
        navigate("/parent-categories");
      }, 1500);

      return result;
    } catch (error: any) {
      console.error("Failed to create category:", error);
      toast.dismiss(loadingToast);

      let errorMessage = t("categories.parent.create.form.error");

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(errorMessage, { duration: 3000 });

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
              <Folder size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {t("categories.parent.create.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("categories.parent.create.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <GenericForm
          title={t("categories.parent.create.form.title")}
          description={t("categories.parent.create.form.description")}
          fields={categoryFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/parent-categories")}
          submitLabel={t("categories.parent.create.form.submit")}
          cancelLabel={t("categories.parent.create.form.cancel")}
          isLoading={isLoading}
          mode="create"
          className="group"
        />
      </div>
    </div>
  );
}
