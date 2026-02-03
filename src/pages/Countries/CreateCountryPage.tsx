// pages/create-country.tsx - Create Country Component with FormData
"use client";
import { useState } from "react";
import { GenericForm, FormField } from "../../components/shared/GenericForm";
import { z } from "zod";
import { Globe, MapPin, Flag, Upload, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateMethodFormData } from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast"; // Import useToast hook
import { useQueryClient } from "@tanstack/react-query"; // Import query client
import { useTranslation } from "react-i18next";
import { CreateForm } from "../../components/shared/GenericForm/CreateForm";

export default function CreateCountryPage() {
  const navigate = useNavigate();
  const toast = useToast(); // Initialize toast
  const queryClient = useQueryClient(); // Initialize query client
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);
  const [flagFile, setFlagFile] = useState<File | null>(null);
  const [flagPreview, setFlagPreview] = useState<string | null>(null);

  // Define form fields for creating a country
  const countryFields: FormField[] = [
    // English and Arabic Names
    {
      name: "nameEnglish",
      label: t("countries.form.englishName"),
      type: "text",
      placeholder: "United States",
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z.string().min(2, t("countries.validations.nameMin")),
    },
    {
      name: "nameArabic",
      label: t("countries.form.arabicName"),
      type: "text",
      placeholder: "الولايات المتحدة",
      required: true,
      cols: 6,
      validation: z.string().min(2, t("countries.validations.nameMin")),
    },

    {
      name: "flag",
      label: t("countries.form.countryFlag"),
      type: "image",
      required: true,
      helperText: t("countries.form.countryFlag"),
      imageUploadConfig: {
        maxSize: 5 * 1024 * 1024,
        accept: "image/jpeg,image/png,image",
      },
    },
  ];

  // Default values for the form
  const defaultValues = {
    nameEnglish: "",
    nameArabic: "",
    flag: null,
  };

  // Handle form submission with FormData
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("countries.form.creating")); // Show loading toast

    try {
      // Prepare FormData
      const formData = new FormData();

      // Add name as JSON object
      formData.append("englishName", data.nameEnglish);
      formData.append("arabicName", data.nameArabic);

      // Add flag file
      if (data.flag) {
        formData.append("flag", data.flag);
      } else {
        throw new Error(t("countries.validations.flagRequired"));
      }

      // Make API call using CreateMethodFormData
      const response = await CreateMethodFormData("/countries", formData, lang);

      if (response) {
        toast.dismiss(loadingToast); // Dismiss loading toast
        toast.success(t("countries.form.createSuccess"), { duration: 2000 }); // Show success toast

        // Invalidate countries query to trigger refetch
        queryClient.invalidateQueries({ queryKey: ["countries"] });

        // Navigate to countries list after delay
        setTimeout(() => {
          navigate("/countries");
        }, 1500);
      } else {
        throw new Error(
          t("countries.form.createError", { message: "No response" }),
        );
      }
    } catch (error: any) {
      console.error("Failed to create country:", error);
      toast.dismiss(loadingToast); // Dismiss loading toast

      // Show error toast
      toast.error(
        t("countries.form.createError", {
          message: error.message || t("common.error"),
        }),
        { duration: 3000 },
      );

      // Re-throw to show form error
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
              <Globe size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("countries.createTitle")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("countries.createSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <CreateForm
          title={t("countries.form.title")}
          description={t("countries.form.description")}
          fields={countryFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/countries")}
          submitLabel={t("countries.form.submitCreate")}
          cancelLabel={t("common.cancel")}
          isLoading={isLoading}
          mode="create"
          className="group"
        />
      </div>
    </div>
  );
}
