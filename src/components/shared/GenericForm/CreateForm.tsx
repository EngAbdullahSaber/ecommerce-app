"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import { GenericFormProps } from "./types";
import { generateSchema } from "./utils";
import { FieldRenderer } from "./FieldRenderer";
import { ArrayFieldComponent } from "./ArrayField";

export function CreateForm({
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
  onFieldChange,
  className = "",
  fetchOptions,
  customValidation,
}: GenericFormProps) {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const schema = generateSchema(fields);

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

      if (customValidation) {
        const customErrors = customValidation(data);
        if (Object.keys(customErrors).length > 0) {
          throw new Error(customErrors[Object.keys(customErrors)[0]]);
        }
      }

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

  const renderField = (field: GenericFormProps["fields"][0]) => {
    if (field.type === "custom" && field.render) {
      return (
        <Controller
          name={field.name}
          control={control}
          defaultValue={field.initialValue}
          render={({ field: controllerField, fieldState }) => (
            <div>
              {field.render!({
                field: controllerField,
                value: controllerField.value,
                onChange: (value: any) => {
                  controllerField.onChange(value);
                  if (onFieldChange) {
                    onFieldChange(field.name, value);
                  }
                },
                errors: fieldState.error,
              })}
            </div>
          )}
        />
      );
    }

    if (field.type === "array") {
      if (!field.arrayConfig) return null;
      return (
        <ArrayFieldComponent
          name={field.name}
          control={control}
          config={field.arrayConfig}
          errors={errors}
          disabled={field.disabled || isLoading}
          defaultValues={defaultValues[field.name] || []}
        />
      );
    }

    return (
      <Controller
        name={field.name}
        control={control}
        defaultValue={field.initialValue}
        render={({ field: controllerField, fieldState }) => (
          <FieldRenderer
            field={field}
            controllerField={controllerField}
            disabled={field.disabled || isLoading}
            error={fieldState.error}
            onFieldChange={onFieldChange}
            fetchOptions={fetchOptions}
          />
        )}
      />
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500" />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

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

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="grid grid-cols-12 gap-6">
            {fields.map((field) => {
              let colSpan = "md:col-span-6";
              if (field.cols) {
                colSpan = `md:col-span-${field.cols}`;
              }
              if (field.fullWidth || field.type === "image") {
                colSpan = "md:col-span-12";
              }

              return (
                <div
                  key={field.name}
                  className={`col-span-12 ${colSpan} ${field.className || ""} ${
                    field.fullWidth ? "w-full" : ""
                  }`}
                >
                  {field.type !== "checkbox" &&
                    field.type !== "array" &&
                    field.type !== "custom" &&
                    field.type !== "image" && (
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

                  {field.helperText &&
                    !errors[field.name] &&
                    field.type !== "array" &&
                    field.type !== "checkbox" &&
                    field.type !== "image" && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {field.helperText}
                      </p>
                    )}

                  {errors[field.name] &&
                    field.type !== "array" &&
                    field.type !== "image" && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors[field.name]?.message as string}
                      </p>
                    )}
                </div>
              );
            })}
          </div>

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
