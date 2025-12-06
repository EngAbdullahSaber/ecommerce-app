// components/shared/GenericForm.tsx
"use client";
import React, { useState } from "react";
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
  Search,
} from "lucide-react";

// Field Types
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
  | "autocomplete"
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
  options?: FieldOption[]; // For select, radio, multiselect
  rows?: number; // For textarea
  accept?: string; // For file/image
  multiple?: boolean; // For file/multiselect
  min?: number | string; // For number/date
  max?: number | string; // For number/date
  validation?: z.ZodType<any>; // Custom Zod validation
  helperText?: string;
  icon?: React.ReactNode;
  renderCustom?: (props: any) => React.ReactNode; // For custom fields
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12; // Grid columns (out of 12)
}

export interface GenericFormProps {
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  defaultValues?: Record<string, any>;
  isLoading?: boolean;
  mode?: "create" | "edit";
  className?: string;
}

export function GenericForm({
  title,
  description,
  fields,
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  defaultValues = {},
  isLoading = false,
  mode = "create",
  className = "",
}: GenericFormProps) {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Generate Zod schema from fields
  const generateSchema = () => {
    const schemaFields: Record<string, z.ZodType<any>> = {};

    fields.forEach((field) => {
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
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleFormSubmit = async (data: any) => {
    try {
      setSubmitStatus("idle");
      setErrorMessage("");
      await onSubmit(data);
      setSubmitStatus("success");
      setTimeout(() => {
        setSubmitStatus("idle");
        reset();
      }, 2000);
    } catch (error: any) {
      setSubmitStatus("error");
      setErrorMessage(error.message || "An error occurred");
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      disabled: field.disabled || isLoading,
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
      ${field.icon ? "pl-11" : ""}`;

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

      case "multiselect":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <select
                {...controllerField}
                {...commonProps}
                multiple
                className={inputClassName + " min-h-[120px]"}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
                  disabled={field.disabled || isLoading}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/50 cursor-pointer disabled:opacity-50"
                />
                <label className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  {field.label}
                </label>
              </div>
            )}
          />
        );

      case "radio":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <div className="space-y-2">
                {field.options?.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      {...controllerField}
                      value={option.value}
                      checked={controllerField.value === option.value}
                      disabled={field.disabled || isLoading}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-2 focus:ring-blue-500/50"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          />
        );

      case "file":
      case "image":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <div className="relative">
                <input
                  type="file"
                  accept={field.accept}
                  multiple={field.multiple}
                  onChange={(e) =>
                    controllerField.onChange(
                      field.multiple ? e.target.files : e.target.files?.[0]
                    )
                  }
                  disabled={field.disabled || isLoading}
                  className="hidden"
                  id={field.name}
                />
                <label
                  htmlFor={field.name}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-300 group"
                >
                  <Upload
                    size={20}
                    className="text-slate-400 group-hover:text-blue-500 transition-colors"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {field.placeholder || "Choose file"}
                  </span>
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
                  min={field.min as string}
                  max={field.max as string}
                  className={inputClassName}
                />
              </div>
            )}
          />
        );

      case "custom":
        return field.renderCustom ? (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) =>
              field.renderCustom!(controllerField)
            }
          />
        ) : null;

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

  return (
    <div className={`relative ${className}`}>
      {/* Background Elements */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500" />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        {/* Top Gradient Bar */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
          <div className="flex items-center justify-between">
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
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group disabled:opacity-50"
              >
                <X
                  size={20}
                  className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:rotate-90 transition-transform duration-300"
                />
              </button>
            )}
          </div>
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
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
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
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
              <CheckCircle2
                size={20}
                className="text-green-600 dark:text-green-400"
              />
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                {mode === "create" ? "Created" : "Updated"} successfully!
              </p>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
              <AlertCircle
                size={20}
                className="text-red-600 dark:text-red-400"
              />
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {cancelLabel}
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundSize: "200% auto" }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing...</span>
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
