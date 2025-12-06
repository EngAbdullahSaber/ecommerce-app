// components/shared/GenericUpdateForm.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  Calendar,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

// Reuse FieldType and FormField from GenericForm
export type FieldType =
  | "text"
  | "email"
  | "number"
  | "password"
  | "textarea"
  | "select"
  | "multiselect"
  | "date"
  | "datetime"
  | "checkbox"
  | "radio"
  | "file"
  | "image"
  | "custom";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FieldOption[];
  rows?: number;
  accept?: string;
  multiple?: boolean;
  min?: number | string;
  max?: number | string;
  validation?: z.ZodType<any>;
  helperText?: string;
  icon?: React.ReactNode;
  renderCustom?: (props: any) => React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  readOnly?: boolean; // New: for display-only fields in update mode
}

export interface GenericUpdateFormProps<T = any> {
  title: string;
  description?: string;
  fields: FormField[];
  entityId: string | number;
  fetchData: (id: string | number) => Promise<T>;
  onUpdate: (id: string | number, data: any) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
  beforeSubmit?: (data: any) => any; // Transform data before submission
  afterSuccess?: () => void;
  afterError?: (error: any) => void;
}

export function GenericUpdateForm<T = any>({
  title,
  description,
  fields,
  entityId,
  fetchData,
  onUpdate,
  onCancel,
  submitLabel = "Update",
  cancelLabel = "Cancel",
  showBackButton = true,
  onBack,
  className = "",
  beforeSubmit,
  afterSuccess,
  afterError,
}: GenericUpdateFormProps<T>) {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [dataError, setDataError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<T | null>(null);

  // Generate Zod schema from fields
  const generateSchema = () => {
    const schemaFields: Record<string, z.ZodType<any>> = {};

    fields.forEach((field) => {
      if (field.readOnly) return; // Skip validation for read-only fields

      if (field.validation) {
        schemaFields[field.name] = field.validation;
      } else {
        let fieldSchema: z.ZodType<any>;

        switch (field.type) {
          case "email":
            fieldSchema = z.string().email("Invalid email address");
            break;
          case "number":
            fieldSchema = z.number();
            if (field.min !== undefined)
              fieldSchema = (fieldSchema as z.ZodNumber).min(Number(field.min));
            if (field.max !== undefined)
              fieldSchema = (fieldSchema as z.ZodNumber).max(Number(field.max));
            break;
          case "date":
          case "datetime":
            fieldSchema = z.string();
            break;
          case "checkbox":
            fieldSchema = z.boolean();
            break;
          case "multiselect":
            fieldSchema = z.array(z.string());
            break;
          case "file":
          case "image":
            fieldSchema = z.any();
            break;
          default:
            fieldSchema = z.string();
        }

        if (field.required) {
          if (field.type === "checkbox") {
            fieldSchema = (fieldSchema as z.ZodBoolean).refine(
              (val) => val === true,
              "This field is required"
            );
          } else if (field.type !== "number") {
            fieldSchema = (fieldSchema as z.ZodString).min(
              1,
              `${field.label} is required`
            );
          }
        } else {
          fieldSchema = fieldSchema.optional();
        }

        schemaFields[field.name] = fieldSchema;
      }
    });

    return z.object(schemaFields);
  };

  const schema = generateSchema();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        setDataError(null);
        const data = await fetchData(entityId);
        setOriginalData(data);
        reset(data as any);
      } catch (error: any) {
        console.error("Failed to fetch data:", error);
        setDataError(error.message || "Failed to load data");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [entityId, fetchData, reset]);

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setSubmitStatus("idle");
      setErrorMessage("");

      // Transform data if needed
      const submitData = beforeSubmit ? beforeSubmit(data) : data;

      await onUpdate(entityId, submitData);

      setSubmitStatus("success");

      if (afterSuccess) {
        afterSuccess();
      }

      // Reset form with new data after successful update
      setTimeout(() => {
        setSubmitStatus("idle");
        reset(data);
      }, 2000);
    } catch (error: any) {
      console.error("Update failed:", error);
      setSubmitStatus("error");
      setErrorMessage(error.message || "Failed to update");

      if (afterError) {
        afterError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      reset(originalData as any);
      setSubmitStatus("idle");
      setErrorMessage("");
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      disabled: field.disabled || isSubmitting || field.readOnly,
      placeholder: field.placeholder,
    };

    const inputClassName = `w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 
      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
      disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
      ${
        errors[field.name]
          ? "border-red-500"
          : "border-slate-300 dark:border-slate-600"
      }
      ${field.icon ? "pl-11" : ""}
      ${field.readOnly ? "bg-slate-50 dark:bg-slate-800/50" : ""}`;

    switch (field.type) {
      case "textarea":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <textarea
                {...controllerField}
                {...commonProps}
                rows={field.rows || 4}
                className={inputClassName}
              />
            )}
          />
        );

      case "select":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <div className="relative">
                <select
                  {...controllerField}
                  {...commonProps}
                  className={inputClassName}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            )}
          />
        );

      case "checkbox":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...controllerField}
                  checked={controllerField.value}
                  disabled={field.disabled || isSubmitting || field.readOnly}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/50 cursor-pointer disabled:opacity-50"
                />
                <label className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  {field.label}
                </label>
              </div>
            )}
          />
        );

      case "date":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="date"
                  {...controllerField}
                  {...commonProps}
                  min={field.min as string}
                  max={field.max as string}
                  className={inputClassName}
                />
              </div>
            )}
          />
        );

      case "datetime":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="datetime-local"
                  {...controllerField}
                  {...commonProps}
                  className={inputClassName}
                />
              </div>
            )}
          />
        );

      default:
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <div className="relative">
                {field.icon && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {field.icon}
                  </div>
                )}
                <input
                  type={field.type}
                  {...controllerField}
                  {...commonProps}
                  min={field.min}
                  max={field.max}
                  className={inputClassName}
                />
              </div>
            )}
          />
        );
    }
  };

  // Loading State
  if (isLoadingData) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
          <div className="p-8">
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <Loader2 size={40} className="text-blue-600 animate-spin" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Loading Data...
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Please wait while we fetch the information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (dataError) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-600 via-orange-600 to-red-600" />
          <div className="p-8">
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                  <AlertTriangle size={40} className="text-red-600" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-xl animate-pulse" />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                  Failed to Load Data
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                  {dataError}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500" />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        {/* Top Gradient Bar */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button
                  onClick={onBack || onCancel}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group/back"
                >
                  <ArrowLeft
                    size={20}
                    className="text-slate-600 dark:text-slate-400 group-hover/back:-translate-x-1 transition-transform duration-300"
                  />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {title}
                </h2>
                {description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isSubmitting}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group/close disabled:opacity-50"
              >
                <X
                  size={20}
                  className="text-slate-400 group-hover/close:text-slate-600 dark:group-hover/close:text-slate-300 group-hover/close:rotate-90 transition-transform duration-300"
                />
              </button>
            )}
          </div>

          {/* Changed Indicator */}
          {isDirty && (
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/50">
              <AlertCircle size={14} />
              <span>You have unsaved changes</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="grid grid-cols-12 gap-6">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`col-span-12 ${
                  field.cols ? `md:col-span-${field.cols}` : "md:col-span-6"
                } ${field.className || ""}`}
              >
                {field.type !== "checkbox" && (
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {field.label}
                    {field.required && !field.readOnly && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                    {field.readOnly && (
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        (Read-only)
                      </span>
                    )}
                  </label>
                )}

                {renderField(field)}

                {field.helperText && !errors[field.name] && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {field.helperText}
                  </p>
                )}

                {errors[field.name] && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors[field.name]?.message as string}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Status Messages */}
          {submitStatus === "success" && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                  Updated successfully!
                </p>
                <p className="text-xs text-green-600 dark:text-green-500">
                  Your changes have been saved
                </p>
              </div>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-red-700 dark:text-red-400 font-semibold">
                  Update failed
                </p>
                <p className="text-xs text-red-600 dark:text-red-500">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Reset
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {cancelLabel}
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundSize: "200% auto" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{submitLabel}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
