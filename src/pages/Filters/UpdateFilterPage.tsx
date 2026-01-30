// pages/filters/edit/[id].tsx - Update Filter Page with Options Update
"use client";
import { useParams, useNavigate } from "react-router-dom";
import {
  Filter,
  Tag,
  List,
  Link,
  ArrowLeft,
  Info,
  CheckCircle,
  XCircle,
  Plus,
  X,
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
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

// Filter Interface based on your data structure
interface FilterOption {
  id: number;
  attributeId: number;
  value: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface FilterAttribute {
  id: number;
  key: string;
  name: string;
  sourcePath: string | null;
  isActive: boolean;
  options: FilterOption[];
  _count: {
    categories: number;
    values: number;
  };
}

// Fetch filter by ID
const fetchFilterById = async (id: string): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/filter-attributes/${id}`, "en");

    if (!response || !response.data) {
      throw new Error("Filter not found");
    }

    const filter = response.data as FilterAttribute;
    console.log("Filter data:", filter);

    // Transform the data for the form
    const transformedData = {
      id: filter.id,
      key: filter.key || "",
      name: filter.name || "",
      sourcePath: filter.sourcePath || "",
      isActive: filter.isActive,
      options:
        filter.options.map((option) => ({
          id: option.id,
          value: option.value,
          name: option.name,
          sortOrder: option.sortOrder,
          isActive: option.isActive,
        })) || [],
      categoriesCount: filter._count?.categories || 0,
      valuesCount: filter._count?.values || 0,
    };

    return transformedData;
  } catch (error) {
    console.error("Error fetching filter:", error);
    throw error;
  }
};

// Add this interface for better type safety
interface OptionsSectionRendererProps {
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  data?: any;
  error?: any;
}

// Update the OptionsSection component in your create-filter.tsx file
const OptionsSection = ({
  options,
  onChange,
  disabled = false,
}: OptionsSectionProps) => {
  const [localOptions, setLocalOptions] = useState(options);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const addOption = () => {
    const newOption = {
      value: "",
      name: "",
      sortOrder: localOptions.length,
      isActive: true,
    };
    const updatedOptions = [...localOptions, newOption];
    setLocalOptions(updatedOptions);
    onChange(updatedOptions);
  };

  const removeOption = (index: number) => {
    if (localOptions.length > 1) {
      const updatedOptions = localOptions.filter((_, i) => i !== index);
      // Update sort orders
      const reorderedOptions = updatedOptions.map((opt, i) => ({
        ...opt,
        sortOrder: i,
      }));
      setLocalOptions(reorderedOptions);
      onChange(reorderedOptions);
    }
  };

  const updateOption = (
    index: number,
    field: keyof FilterOption,
    value: any,
  ) => {
    const updatedOptions = [...localOptions];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setLocalOptions(updatedOptions);
    onChange(updatedOptions); // Make sure this is called
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Manage filter options
        </div>
        <button
          type="button"
          onClick={addOption}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 text-purple-600 dark:text-purple-400 rounded-lg hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-500/20 dark:hover:to-violet-500/20 transition-all duration-200 disabled:opacity-50"
        >
          <Plus size={16} />
          Add Option
        </button>
      </div>

      <div className="space-y-3">
        {localOptions.map((option, index) => (
          <div
            key={index}
            className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-500/20 dark:to-violet-500/20 rounded-lg">
                  <Tag
                    size={16}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Option #{index + 1}
                  {option.id && (
                    <span className="text-xs text-slate-400 ml-2">
                      (ID: {option.id})
                    </span>
                  )}
                </span>
              </div>
              {localOptions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={disabled}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-12 gap-3">
              {/* Value Field */}
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Value
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={option.value}
                  onChange={(e) => updateOption(index, "value", e.target.value)}
                  placeholder="e.g., red, blue, green"
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  required
                />
              </div>

              {/* Name Field */}
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Display Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={option.name}
                  onChange={(e) => updateOption(index, "name", e.target.value)}
                  placeholder="e.g., Red, Blue, Green"
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  required
                />
              </div>

              {/* Sort Order Field */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={option.sortOrder}
                  onChange={(e) =>
                    updateOption(
                      index,
                      "sortOrder",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              {/* Active Status */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Active
                </label>
                <div className="flex items-center h-full">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={option.isActive}
                      onChange={(e) =>
                        updateOption(index, "isActive", e.target.checked)
                      }
                      disabled={disabled}
                      className="sr-only peer disabled:opacity-50"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function UpdateFilterPage() {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const filterId = params.id as string;
  const queryClient = useQueryClient();

  // Define form fields for updating filter
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

    // Key (Read-only)
    {
      name: "key",
      label: t("filters.create.fields.key.label"),
      type: "text",
      placeholder: t("filters.create.fields.key.placeholder"),
      readOnly: true,
      cols: 6,
      validation: z
        .string()
        .min(2, t("filters.create.fields.key.validation"))
        .regex(/^[a-z][a-z0-9]*$/, t("filters.create.fields.key.format")),
      helperText: "Filter key cannot be changed",
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
      name: "options",
      label: "Filter Options",
      type: "custom",
      cols: 12,
      renderCustom: ({
        value,
        onChange,
        disabled,
        error,
      }: OptionsSectionRendererProps) => (
        <OptionsSection
          options={value || []}
          onChange={onChange}
          disabled={disabled}
        />
      ),
    },
  ];

  // Handle update
  const handleUpdate = async (id: string, data: any) => {
    try {
      console.log("Update called with data:", data);

      // Prepare update data in the required format
      const updateData: any = {
        name: data.name,
        isActive: data.isActive,
      };

      // Include options if they exist
      if (data.options && Array.isArray(data.options)) {
        updateData.options = data.options.map((option: any) => ({
          value: option.value.trim(),
          name: option.name.trim(),
          sortOrder: option.sortOrder,
          isActive: option.isActive,
        }));
      }

      console.log("Sending update data:", updateData);

      // Make API call - assuming your API accepts the full object with options
      const response = await UpdateMethod(
        `/filter-attributes`,
        updateData,
        id,
        "en",
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
    queryClient.invalidateQueries({ queryKey: ["filters"] });
    queryClient.invalidateQueries({ queryKey: ["filter", filterId] });
    toast.success(t("filters.edit.form.success"), { duration: 2000 });

    // Redirect after delay
    setTimeout(() => {
      navigate("/filters");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(error.message || t("filters.edit.form.error"));
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only and system fields
    const {
      createdAt,
      updatedAt,
      key,
      categoriesCount,
      valuesCount,
      id,
      ...rest
    } = data;

    console.log("After transformation:", rest);
    return rest;
  };

  // Custom validation function
  const customValidation = (data: any) => {
    const errors: Record<string, string> = {};

    // Validate name
    if (data.name && data.name.trim().length < 2) {
      errors.name = t("filters.create.fields.name.validation");
    }

    // Validate options
    if (data.options && Array.isArray(data.options)) {
      // Check for empty options
      const emptyOptions = data.options.filter(
        (opt: any) => !opt.value.trim() || !opt.name.trim(),
      );
      if (emptyOptions.length > 0) {
        errors.options = "All options must have both value and display name";
      }

      // Check for duplicate values
      const values = data.options.map((opt: any) => opt.value.toLowerCase());
      const uniqueValues = new Set(values);
      if (uniqueValues.size !== values.length) {
        errors.options = "Option values must be unique";
      }

      // Check for minimum options
      if (data.options.length === 0) {
        errors.options = "At least one option is required";
      }
    }

    return errors;
  };

  if (!filterId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-violet-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-violet-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("filters.page.errorTitle")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            The filter ID is missing or invalid.
          </p>
          <button
            onClick={() => navigate("/filters")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t("filters.page.back") || "Back to Filters"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-violet-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-violet-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/filters")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("filters.create.back")}
        </button>

        <GenericUpdateForm
          title={t("filters.edit.title")}
          description={t("filters.edit.description")}
          fields={filterFields}
          entityId={filterId}
          fetchData={fetchFilterById}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/filters")}
          onBack={() => navigate("/filters")}
          submitLabel={t("filters.edit.form.submit")}
          cancelLabel={t("filters.edit.form.cancel")}
          showBackButton={true}
          className="mb-8"
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={beforeSubmit}
          customValidation={customValidation}
        />
      </div>
    </div>
  );
}
