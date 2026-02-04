import React from "react";
import { Controller } from "react-hook-form";
import { Calendar, ChevronDown, AlertCircle, Check } from "lucide-react";
import { FormField } from "./types";
import { PaginatedSelectComponent } from "./PaginatedSelect";
import DatePickerComponent from "./DateTimePicker";
import { ImageInputComponent } from "./ImageInput";
import { useTranslation } from "react-i18next";

interface FieldRendererProps {
  field: FormField;
  controllerField: any;
  disabled?: boolean;
  error?: any;
  readOnly?: boolean;
  isSubmitting?: boolean;
  fetchOptions?: (endpoint: string, params: any) => Promise<any>;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  controllerField,
  disabled = false,
  error,
  readOnly = false,
  isSubmitting = false,
  fetchOptions,
  onKeyDown,
}) => {
  const inputClassName = `w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 
    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
    ${error ? "border-red-500" : "border-slate-300 dark:border-slate-600"}
    ${field.icon ? "pl-11" : ""}
    ${readOnly ? "bg-slate-50 dark:bg-slate-800/50" : ""}`;

  const commonProps = {
    disabled: field.disabled || disabled || isSubmitting || readOnly,
    placeholder: field.placeholder,
  };
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          {...controllerField}
          {...commonProps}
          rows={field.rows || 4}
          className={inputClassName}
          readOnly={readOnly}
          onKeyDown={onKeyDown}
        />
      );

    case "select":
      return (
        <div className="relative">
          <select
            {...controllerField}
            {...commonProps}
            className={inputClassName}
            disabled={readOnly}
            style={{
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              backgroundImage: "none",
              paddingRight: "1rem",
            }}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
          <div
            className={`absolute inset-y-0 ${lang == "ar" ? "left-3" : "right-3"} flex items-center pointer-events-none`}
          >
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </div>
      );

    case "paginatedSelect":
      return (
        <PaginatedSelectComponent
          config={field.paginatedSelectConfig!}
          value={controllerField.value}
          onChange={controllerField.onChange}
          placeholder={field.placeholder || `Select ${field.label}`}
          disabled={field.disabled || disabled || isSubmitting}
          readOnly={readOnly}
          fetchOptions={fetchOptions}
        />
      );

    case "checkbox":
      return (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            {...controllerField}
            checked={controllerField.value}
            disabled={field.disabled || disabled || isSubmitting || readOnly}
            className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/50 cursor-pointer disabled:opacity-50"
          />
          <label className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            {field.label}
          </label>
        </div>
      );

    case "radio":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {field.options?.map((option) => {
              const currentValue = controllerField.value;
              const optionValue = String(option.value);
              const currentValueStr = String(currentValue);
              const isChecked = optionValue === currentValueStr;

              return (
                <label
                  key={optionValue}
                  className={`
                    relative group cursor-pointer
                    ${field.disabled || disabled || isSubmitting || readOnly ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={isChecked}
                    onChange={(e) => {
                      let newValue: any = e.target.value;
                      if (newValue === "true") newValue = true;
                      if (newValue === "false") newValue = false;
                      controllerField.onChange(newValue);
                    }}
                    disabled={
                      field.disabled || disabled || isSubmitting || readOnly
                    }
                    className="sr-only"
                  />
                  <div
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-300 text-center
                      ${
                        isChecked
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                          : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm"
                      }
                    `}
                  >
                    {option.icon && (
                      <div
                        className={`
                          w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 transition-all duration-300
                          ${
                            isChecked
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }
                        `}
                      >
                        {option.icon}
                      </div>
                    )}
                    <div className="font-medium text-slate-900 dark:text-white">
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {option.description}
                      </div>
                    )}
                    {isChecked && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      );

    case "date":
      return (
        <DatePickerComponent
          field={field}
          controllerField={controllerField}
          inputClassName={inputClassName}
          readOnly={readOnly}
        />
      );

    case "datetime":
      return (
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
            readOnly={readOnly}
          />
        </div>
      );

    case "file":
    case "image":
      return (
        <ImageInputComponent
          name={field.name}
          value={controllerField.value}
          onChange={controllerField.onChange}
          disabled={field.disabled || disabled || isSubmitting}
          readOnly={readOnly}
          config={field.imageUploadConfig}
          errors={error}
          fullWidth={field.fullWidth}
        />
      );

    default:
      return (
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
            step={field.step}
            className={inputClassName}
            readOnly={readOnly}
            onKeyDown={onKeyDown}
          />
          {field.prefix && controllerField.value && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              {field.prefix}
            </span>
          )}
        </div>
      );
  }
};
