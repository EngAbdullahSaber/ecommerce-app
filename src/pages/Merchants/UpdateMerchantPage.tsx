// pages/merchants/edit/[id].tsx - Update Merchant Page
"use client";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  Globe,
  ArrowLeft,
  Info,
  Shield,
} from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import {
  GetSpecifiedMethod,
  UpdateMethod,
} from "../../services/apis/ApiMethod";
import {
  FormField,
  GenericUpdateForm,
} from "../../components/shared/GenericUpdateForm";
import { useQueryClient } from "@tanstack/react-query";
import { UpdateForm } from "../../components/shared/GenericUpdateForm/UpdateForm";

// Merchant Interface based on your data structure
interface Merchant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Fetch merchant by ID
const fetchMerchantById = async (id: string, lang: string): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/merchants/${id}`, lang);

    if (!response || !response.data) {
      throw new Error(t("merchants.messages.merchantNotFound"));
    }

    const merchant = response.data as Merchant;
    console.log("Merchant data:", merchant);

    // Transform the data for the form
    const transformedData = {
      id: merchant.id,
      firstName: merchant.firstName || "",
      lastName: merchant.lastName || "",
      email: merchant.email || "",
      phone: merchant.phone || "",
      language: merchant.language || "ar",
      isVerified: merchant.isVerified,
      createdAt: new Date(merchant.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedAt: merchant.updatedAt
        ? new Date(merchant.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : t("merchants.messages.neverUpdated"),
    };

    return transformedData;
  } catch (error) {
    console.error("Error fetching merchant:", error);
    throw error;
  }
};

export default function UpdateMerchantPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const toast = useToast();
  const merchantId = params.id as string;
  const queryClient = useQueryClient();

  // Define form fields for updating merchant
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
                {t("merchants.form.basicInformation")}
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

    // Account Settings Section Header
    {
      name: "settingsHeader",
      label: t("merchants.form.accountSettings"),
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-lg">
              <Globe size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("merchants.form.accountPreferences")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("merchants.form.updatePreferences")}
              </p>
            </div>
          </div>
        </div>
      ),
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
          label:
            lang === "ar"
              ? t("merchants.page.language.ar") + " (العربية)"
              : "العربية (" + t("merchants.page.language.ar") + ")",
          value: "ar",
        },
        {
          label: t("merchants.page.language.en"),
          value: "en",
        },
      ],
      validation: z.enum(["ar", "en"]),
      helperText: t("merchants.create.fields.language.helper"),
    },
  ];

  // Handle update
  const handleUpdate = async (id: string, data: any) => {
    try {
      console.log("Update called with data:", data);

      const requestData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        language: data.language,
      };

      // Make API call
      const response = await UpdateMethod(`/merchants`, requestData, id, lang);

      console.log("Update response:", response);

      if (!response) {
        throw new Error(t("merchants.messages.noResponse"));
      }

      if (response.code !== 200) {
        const errorMessage =
          lang === "ar"
            ? response.message?.arabic
            : response.message?.english ||
              response.message ||
              t("merchants.messages.updateFailed");
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleAfterSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["merchants"] });
    queryClient.invalidateQueries({ queryKey: ["merchant", merchantId] });
    toast.success(t("merchants.messages.updateSuccess"), { duration: 2000 });

    // Redirect after delay
    setTimeout(() => {
      navigate("/merchants");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(error.message || t("merchants.messages.updateFailed"));
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only fields
    const { createdAt, updatedAt, email, phone, isVerified, id, ...rest } =
      data;

    console.log("After transformation:", rest);
    return rest;
  };

  if (!merchantId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("merchants.messages.merchantNotFoundTitle")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {t("merchants.messages.merchantIdMissing")}
          </p>
          <button
            onClick={() => navigate("/merchants")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("merchants.page.back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/merchants")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("merchants.page.back")}
        </button>

        <UpdateForm
          title={t("merchants.updateTitle")}
          description={t("merchants.form.updateDescription")}
          fields={merchantFields}
          entityId={merchantId}
          fetchData={(id: string) => fetchMerchantById(id, lang)}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/merchants")}
          onBack={() => navigate("/merchants")}
          submitLabel={t("common.saveChanges")}
          cancelLabel={t("common.cancel")}
          showBackButton={true}
          className="mb-8"
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={beforeSubmit}
          // Add custom validation if needed
          customValidation={(data: any) => {
            const errors: Record<string, string> = {};

            // Add any custom validation here
            if (data.firstName && data.firstName.trim().length < 2) {
              errors.firstName = t(
                "merchants.create.fields.firstName.validation",
              );
            }

            if (data.lastName && data.lastName.trim().length < 2) {
              errors.lastName = t(
                "merchants.create.fields.lastName.validation",
              );
            }

            return errors;
          }}
        />
      </div>
    </div>
  );
}
