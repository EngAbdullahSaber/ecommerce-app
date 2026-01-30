// pages/create-filter.tsx - Updated to use GenericForm array field
import { useState } from "react";
import { GenericForm, FormField } from "../../components/shared/GenericForm";
import { z } from "zod";
import { Filter, Tag, List, Link, Plus, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateMethod } from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function CreateFilterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const lang = "en";

  const [isLoading, setIsLoading] = useState(false);

  // Define form fields for creating a filter using array field
  const filterFields: FormField[] = [
    // Basic Information Section Header
    {
      name: "basicInfoHeader",
      label: t("filters.create.sections.basicInfo.title"),
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 rounded-lg">
              <Filter
                size={20}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("filters.create.sections.basicInfo.title")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("filters.create.sections.basicInfo.description")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Key
    {
      name: "key",
      label: t("filters.create.fields.key.label"),
      type: "text",
      placeholder: t("filters.create.fields.key.placeholder"),
      required: true,
      cols: 6,
      validation: z
        .string()
        .min(2, t("filters.create.fields.key.validation"))
        .regex(/^[a-z][a-z0-9]*$/, t("filters.create.fields.key.format")),
      helperText: t("filters.create.fields.key.helper"),
    },

    // Name
    {
      name: "name",
      label: t("filters.create.fields.name.label"),
      type: "text",
      placeholder: t("filters.create.fields.name.placeholder"),
      required: true,
      icon: <Tag size={18} />,
      cols: 6,
      validation: z.string().min(2, t("filters.create.fields.name.validation")),
      helperText: t("filters.create.fields.name.helper"),
    },

    // Options Section Header
    {
      name: "optionsHeader",
      label: t("filters.create.sections.options.title"),
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
              <List size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("filters.create.sections.options.title")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("filters.create.sections.options.description")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Options as array field
    {
      name: "options",
      label: t("filters.create.fields.options.label"),
      type: "array",
      required: true,
      cols: 12,
      arrayConfig: {
        fields: [
          {
            name: "value",
            label: t("filters.create.fields.options.value"),
            type: "text",
            placeholder: t("filters.create.fields.options.valuePlaceholder"),
            required: true,
            cols: 4,
            validation: z.string().min(1, "Value is required"),
          },
          {
            name: "name",
            label: t("filters.create.fields.options.name"),
            type: "text",
            placeholder: t("filters.create.fields.options.namePlaceholder"),
            required: true,
            cols: 4,
            validation: z.string().min(1, "Display name is required"),
          },
          {
            name: "sortOrder",
            label: t("filters.create.fields.options.sortOrder"),
            type: "number",
            defaultValue: 0,
            cols: 2,
            validation: z.string().default(0),
          },
          {
            name: "isActive",
            label: t("filters.create.fields.options.status"),
            type: "checkbox",
            defaultValue: true,
            cols: 2,
            validation: z.boolean().default(true),
          },
        ],
        minItems: 1,
        addButtonLabel: t("filters.create.fields.options.add"),
        removeButtonLabel: t("filters.create.fields.options.remove"),
        itemLabel: (index) =>
          `${t("filters.create.fields.options.option")} #${index + 1}`,
      },
      helperText: t("filters.create.fields.options.helper"),
    },
  ];

  // Default values for the form
  const defaultValues = {
    key: "",
    name: "",
    sourcePath: "",
    isActive: true,
    options: [{ value: "", name: "", sortOrder: 0, isActive: true }],
  };

  // Handle form submission with correct data structure
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("filters.create.form.loading"));

    try {
      // Validate options
      const validOptions = data.options.filter(
        (opt: any) => opt.value.trim() !== "" && opt.name.trim() !== "",
      );

      if (validOptions.length === 0) {
        throw new Error(t("filters.create.fields.options.validation.minimum"));
      }

      // Check for duplicate values
      const values = validOptions.map((opt: any) => opt.value.toLowerCase());
      const uniqueValues = new Set(values);
      if (uniqueValues.size !== values.length) {
        throw new Error(
          t("filters.create.fields.options.validation.duplicate"),
        );
      }

      // Prepare data in the correct structure for filters
      const requestData = {
        key: data.key,
        name: data.name,
        sourcePath: data.sourcePath || null,
        isActive: data.isActive,
        options: validOptions.map((opt: any) => ({
          value: opt.value.trim(),
          name: opt.name.trim(),
          sortOrder: opt.sortOrder,
          isActive: opt.isActive,
        })),
      };

      console.log("Submitting filter data:", requestData);

      // Use your CreateMethod function for filters
      const result = await CreateMethod(
        "/filter-attributes",
        requestData,
        lang,
      );

      if (!result) {
        throw new Error(t("filters.create.form.error"));
      }

      toast.dismiss(loadingToast);
      toast.success(t("filters.create.form.success"), { duration: 2000 });

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["filters"] });

      // Navigate to filters list after delay
      setTimeout(() => {
        navigate("/filters");
      }, 1500);

      return result;
    } catch (error: any) {
      console.error("Failed to create filter:", error);
      toast.dismiss(loadingToast);

      // Show error toast
      let errorMessage = t("filters.create.form.error");

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-violet-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-violet-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/filters")}
          disabled={isLoading}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("filters.create.back")}
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl">
              <Filter size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-violet-900 dark:from-slate-100 dark:via-purple-100 dark:to-violet-100 bg-clip-text text-transparent">
                {t("filters.create.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("filters.create.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <GenericForm
          title={t("filters.create.form.title")}
          description={t("filters.create.form.description")}
          fields={filterFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/filters")}
          submitLabel={t("filters.create.form.submit")}
          cancelLabel={t("filters.create.form.cancel")}
          isLoading={isLoading}
          mode="create"
          className="group"
          customValidation={(data: any) => {
            const errors: Record<string, string> = {};

            // Check for duplicate values in options
            const values =
              data.options?.map((opt: any) => opt.value.toLowerCase()) || [];
            const uniqueValues = new Set(values);
            if (uniqueValues.size !== values.length) {
              errors.options = t(
                "filters.create.fields.options.validation.duplicate",
              );
            }

            return errors;
          }}
        />
      </div>
    </div>
  );
}
