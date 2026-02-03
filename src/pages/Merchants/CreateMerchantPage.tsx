// pages/create-merchant.tsx - Create Merchant Component
import { useState } from "react";
import { GenericForm, FormField } from "../../components/shared/GenericForm";
import { z } from "zod";
import { User, Mail, Phone, Lock, Globe, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateMethod } from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CreateForm } from "../../components/shared/GenericForm/CreateForm";

export default function CreateMerchantPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const lang = "en";

  const [isLoading, setIsLoading] = useState(false);

  // Define form fields for creating a merchant
  const merchantFields: FormField[] = [
    // Basic Information Section Header
    {
      name: "basicInfoHeader",
      label: t("merchants.create.sections.basicInfo.title"),
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
              <User size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("merchants.create.sections.basicInfo.title")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("merchants.create.sections.basicInfo.description")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // First Name
    {
      name: "firstName",
      label: t("merchants.create.fields.firstName.label"),
      type: "text",
      placeholder: t("merchants.create.fields.firstName.placeholder"),
      required: true,
      icon: <User size={18} />,
      cols: 6,
      validation: z
        .string()
        .min(2, t("merchants.create.fields.firstName.validation")),
      helperText: t("merchants.create.fields.firstName.helper"),
    },

    // Last Name
    {
      name: "lastName",
      label: t("merchants.create.fields.lastName.label"),
      type: "text",
      placeholder: t("merchants.create.fields.lastName.placeholder"),
      required: true,
      cols: 6,
      validation: z
        .string()
        .min(2, t("merchants.create.fields.lastName.validation")),
      helperText: t("merchants.create.fields.lastName.helper"),
    },

    // Contact Information Section Header
    {
      name: "contactInfoHeader",
      label: t("merchants.create.sections.contactInfo.title"),
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-lg">
              <Mail
                size={20}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("merchants.create.sections.contactInfo.title")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("merchants.create.sections.contactInfo.description")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Email
    {
      name: "email",
      label: t("merchants.create.fields.email.label"),
      type: "email",
      placeholder: t("merchants.create.fields.email.placeholder"),
      required: true,
      icon: <Mail size={18} />,
      cols: 6,
      validation: z
        .string()
        .email(t("merchants.create.fields.email.validation")),
      helperText: t("merchants.create.fields.email.helper"),
    },

    // Phone Number
    {
      name: "phone",
      label: t("merchants.create.fields.phone.label"),
      type: "phone",
      placeholder: t("merchants.create.fields.phone.placeholder"),
      required: true,
      icon: <Phone size={18} />,
      cols: 6,
      validation: z
        .string()
        .regex(
          /^\+?[1-9]\d{1,11}$/,
          t("merchants.create.fields.phone.validation"),
        ),
      helperText: t("merchants.create.fields.phone.helper"),
    },

    // Account Security Section Header
    {
      name: "securityInfoHeader",
      label: t("merchants.create.sections.securityInfo.title"),
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10 rounded-lg">
              <Lock size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("merchants.create.sections.securityInfo.title")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("merchants.create.sections.securityInfo.description")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Password
    {
      name: "password",
      label: t("merchants.create.fields.password.label"),
      type: "password",
      placeholder: t("merchants.create.fields.password.placeholder"),
      required: true,
      icon: <Lock size={18} />,
      cols: 6,
      validation: z
        .string()
        .min(6, t("merchants.create.fields.password.validation")),
      helperText: t("merchants.create.fields.password.helper"),
    },

    // Confirm Password
    {
      name: "confirmPassword",
      label: t("merchants.create.fields.confirmPassword.label"),
      type: "password",
      placeholder: t("merchants.create.fields.confirmPassword.placeholder"),
      required: true,
      cols: 6,
      validation: z.string(),
      helperText: t("merchants.create.fields.confirmPassword.helper"),
    },

    // Language Selection
    {
      name: "language",
      label: t("merchants.create.fields.language.label"),
      type: "select",
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      options: [
        {
          label: t("merchants.create.fields.language.options.ar"),
          value: "ar",
        },
        {
          label: t("merchants.create.fields.language.options.en"),
          value: "en",
        },
      ],
      validation: z.enum(["ar", "en"]),
      helperText: t("merchants.create.fields.language.helper"),
    },
  ];

  // Default values for the form
  const defaultValues = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    language: "ar",
  };

  // Handle form submission with correct data structure
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("merchants.create.form.loading"));

    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error(
          t("merchants.create.fields.confirmPassword.validation"),
        );
      }

      // Prepare data in the correct structure for merchants
      const requestData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        language: data.language,
      };

      console.log("Submitting merchant data:", requestData);

      // Use your CreateMethod function for merchants
      const result = await CreateMethod("/merchants", requestData, lang);

      if (!result) {
        throw new Error(t("merchants.create.form.error"));
      }

      toast.dismiss(loadingToast);
      toast.success(t("merchants.create.form.success"), { duration: 2000 });

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["merchants"] });

      // Navigate to merchants list after delay
      setTimeout(() => {
        navigate("/merchants");
      }, 1500);

      return result;
    } catch (error: any) {
      console.error("Failed to create merchant:", error);
      toast.dismiss(loadingToast);

      // Show error toast
      let errorMessage = t("merchants.create.form.error");

      // Extract error message from different error formats
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(errorMessage, { duration: 3000 });

      // Re-throw to show form error
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {t("merchants.create.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("merchants.create.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <CreateForm
          title={t("merchants.create.form.title")}
          description={t("merchants.create.form.description")}
          fields={merchantFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/merchants")}
          submitLabel={t("merchants.create.form.submit")}
          cancelLabel={t("merchants.create.form.cancel")}
          isLoading={isLoading}
          mode="create"
          className="group"
          // Custom validation for password matching
          customValidation={(data: any) => {
            if (data.password !== data.confirmPassword) {
              return {
                confirmPassword: t(
                  "merchants.create.fields.confirmPassword.validation",
                ),
              };
            }
            return {};
          }}
        />
      </div>
    </div>
  );
}
