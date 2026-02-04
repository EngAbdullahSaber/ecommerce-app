"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { GenericUpdateFormProps, FormField } from "./types";
import { generateUpdateSchema } from "./utils";
import { FieldRenderer } from "./FieldRenderer";
import { useTranslation } from "react-i18next";

export function UpdateForm<T = any>({
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
  fetchOptions,
  preventDefaultSubmit = true,
}: GenericUpdateFormProps<T>) {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [dataError, setDataError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<T | null>(null);
  const { t, i18n } = useTranslation();

  const schema = generateUpdateSchema(fields);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  const formValues = watch();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        setDataError(null);
        const data = await fetchData(entityId);
        setOriginalData(data);

        const defaultValues: any = {};
        fields.forEach((field) => {
          if (data && data[field.name] !== undefined) {
            defaultValues[field.name] = data[field.name];
          }
        });

        reset(defaultValues);
      } catch (error: any) {
        console.error("Failed to fetch data:", error);
        setDataError(error.message || "Failed to load data");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (entityId) {
      loadData();
    }
  }, [entityId, fetchData, reset, fields]);

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setSubmitStatus("idle");
      setErrorMessage("");

      const submitData = beforeSubmit ? beforeSubmit(data) : data;
      const response = await onUpdate(entityId, submitData);

      setSubmitStatus("success");

      if (afterSuccess) {
        afterSuccess();
      }

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
    if (field.type === "custom" && field.render) {
      return field.render(formValues[field.name], formValues);
    }

    if (field.renderCustom) {
      const fieldValue = formValues[field.name];
      return field.renderCustom({
        value: fieldValue,
        onChange: (value: any) => {
          setValue(field.name, value, {
            shouldDirty: true,
            shouldValidate: true,
          });
        },
        disabled: field.disabled || isSubmitting || field.readOnly,
        data: formValues,
        error: errors[field.name],
      });
    }

    if (field.readOnly && field.type === "text") {
      return (
        <div className="relative">
          {field.icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {field.icon}
            </div>
          )}
          <div
            className={`w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 flex items-center`}
          >
            {field.prefix && (
              <span className="text-slate-500 mr-2">{field.prefix}</span>
            )}
            <span className="text-slate-700 dark:text-slate-300">
              {formValues[field.name]}
            </span>
          </div>
        </div>
      );
    }

    return (
      <Controller
        name={field.name}
        control={control}
        render={({ field: controllerField, fieldState }) => (
          <FieldRenderer
            field={field}
            controllerField={controllerField}
            disabled={field.disabled}
            error={fieldState.error}
            readOnly={field.readOnly}
            isSubmitting={isSubmitting}
            fetchOptions={fetchOptions}
            onKeyDown={(e) => {
              if (preventDefaultSubmit && e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          />
        )}
      />
    );
  };

  if (isLoadingData) {
    return <LoadingState className={className} title="Loading Data..." />;
  }

  if (dataError) {
    return (
      <ErrorState
        className={className}
        error={dataError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <FormContainer className={className}>
      <FormHeader
        title={title}
        description={description}
        showBackButton={showBackButton}
        onBack={onBack || onCancel}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
      />

      <form
        onSubmit={(e) => {
          if (preventDefaultSubmit) e.preventDefault();
          handleSubmit(handleFormSubmit)(e);
        }}
        className="p-6"
        onKeyDown={(e) => {
          if (preventDefaultSubmit && e.key === "Enter") {
            e.preventDefault();
          }
        }}
      >
        <div className="grid grid-cols-12 gap-6">
          {fields.map((field) => (
            <FormFieldWrapper
              key={field.name}
              field={field}
              errors={errors}
              renderField={renderField}
            />
          ))}
        </div>

        <StatusMessages
          submitStatus={submitStatus}
          errorMessage={errorMessage}
        />

        <FormActions
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onReset={handleReset}
          onCancel={onCancel}
          cancelLabel={cancelLabel}
          submitLabel={submitLabel}
        />
      </form>
    </FormContainer>
  );
}

// Supporting Components
const LoadingState: React.FC<{ className: string; title: string }> = ({
  className,
  title,
}) => (
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
              {title}
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

const ErrorState: React.FC<{
  className: string;
  error: string;
  onRetry: () => void;
}> = ({ className, error, onRetry }) => (
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
              {error}
            </p>
            <button
              onClick={onRetry}
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

const FormContainer: React.FC<{
  children: React.ReactNode;
  className: string;
}> = ({ children, className }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500" />
    <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
      {children}
    </div>
  </div>
);

const FormHeader: React.FC<{
  title: string;
  description?: string;
  showBackButton: boolean;
  onBack?: () => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  isDirty: boolean;
}> = ({
  title,
  description,
  showBackButton,
  onBack,
  onCancel,
  isSubmitting,
  isDirty,
}) => (
  <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <button
            onClick={onBack}
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

    {isDirty && (
      <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/50">
        <AlertCircle size={14} />
        <span>{t("common.youHaveUnsavedChanges")}</span>
      </div>
    )}
  </div>
);

const FormFieldWrapper: React.FC<{
  field: FormField;
  errors: any;
  renderField: (field: FormField) => React.ReactNode;
}> = ({ field, errors, renderField }) => {
  const colSpan = field.cols ? `md:col-span-${field.cols}` : "md:col-span-6";

  return (
    <div
      key={field.name}
      className={`col-span-12 ${colSpan} ${field.className || ""}`}
    >
      {field.type !== "checkbox" &&
        field.type !== "radio" &&
        field.type !== "custom" && (
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

      {field.type !== "radio" && field.helperText && !errors[field.name] && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {field.helperText}
        </p>
      )}

      {field.type !== "radio" && errors[field.name] && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
          <AlertCircle size={12} />
          {errors[field.name]?.message as string}
        </p>
      )}
    </div>
  );
};

const StatusMessages: React.FC<{
  submitStatus: "idle" | "success" | "error";
  errorMessage: string;
}> = ({ submitStatus, errorMessage }) => (
  <>
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
  </>
);

const FormActions: React.FC<{
  isDirty: boolean;
  isSubmitting: boolean;
  onReset: () => void;
  onCancel?: () => void;
  cancelLabel: string;
  submitLabel: string;
}> = ({
  isDirty,
  isSubmitting,
  onReset,
  onCancel,
  cancelLabel,
  submitLabel,
}) => (
  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
    {isDirty && (
      <button
        type="button"
        onClick={onReset}
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
);
