import React from "react";
import { Controller } from "react-hook-form";
import { Calendar, X } from "lucide-react";
import { FormField } from "./types";
import { DateRangeInputComponent } from "./DateRangeInput";
import { ImageInputComponent } from "./ImageInput";
import { PaginatedSelectComponent } from "./PaginatedSelect";
import DateTimePicker from "./DateTimePicker";

interface FieldRendererProps {
  field: FormField;
  controllerField: any;
  disabled?: boolean;
  error?: any;
  onFieldChange?: (fieldName: string, value: any) => void;
  fetchOptions?: (endpoint: string, params: any) => Promise<any>;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  controllerField,
  disabled = false,
  error,
  onFieldChange,
  fetchOptions,
}) => {
  const inputClassName = `w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 
    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
    ${error ? "border-red-500" : "border-slate-300 dark:border-slate-600"}
    ${field.icon ? "pl-11" : ""}
    ${field.readOnly ? "bg-slate-50 dark:bg-slate-800/50" : ""}`;

  const commonProps = {
    disabled: field.disabled || disabled,
    placeholder: field.placeholder,
  };

  switch (field.type) {
    case "daterange":
      return (
        <DateRangeInputComponent
          name={field.name}
          value={controllerField.value}
          onChange={(value) => {
            controllerField.onChange(value);
            if (onFieldChange) {
              onFieldChange(field.name, value);
            }
          }}
          disabled={field.disabled || disabled}
          readOnly={field.readOnly}
          config={field.dateRangeConfig}
          errors={error}
          placeholder={field.placeholder || `Select ${field.label}`}
        />
      );

    case "paginatedSelect":
      return (
        <PaginatedSelectComponent
          config={field.paginatedSelectConfig!}
          value={controllerField.value}
          onChange={(value) => {
            controllerField.onChange(value);
            if (onFieldChange) {
              onFieldChange(field.name, value);
            }
          }}
          placeholder={field.placeholder || `Select ${field.label}`}
          disabled={field.disabled || disabled}
          readOnly={field.readOnly}
          fetchOptions={fetchOptions}
        />
      );

    case "image":
      return (
        <ImageInputComponent
          name={field.name}
          value={controllerField.value}
          onChange={(value) => {
            controllerField.onChange(value);
            if (onFieldChange) {
              onFieldChange(field.name, value);
            }
          }}
          disabled={field.disabled || disabled}
          readOnly={field.readOnly}
          config={field.imageUploadConfig}
          errors={error}
          fullWidth={field.fullWidth}
        />
      );

    case "textarea":
      return (
        <textarea
          {...controllerField}
          {...commonProps}
          rows={field.rows || 4}
          className={inputClassName}
          readOnly={field.readOnly}
        />
      );

    case "select":
      return (
        <div className="relative">
          <select
            {...controllerField}
            {...commonProps}
            onChange={(e) => {
              controllerField.onChange(e.target.value);
              if (onFieldChange) {
                onFieldChange(field.name, e.target.value);
              }
            }}
            className={inputClassName}
            disabled={field.readOnly}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={field.name}
            checked={!!controllerField.value}
            onChange={(e) => {
              controllerField.onChange(e.target.checked);
              if (onFieldChange) {
                onFieldChange(field.name, e.target.checked);
              }
            }}
            disabled={field.disabled || disabled || field.readOnly}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor={field.name} className="flex flex-col cursor-pointer">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {field.label}
              {field.required && !field.readOnly && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </span>
            {field.helperText && (
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {field.helperText}
              </span>
            )}
          </label>
        </div>
      );

    case "radio":
      const currentValue = controllerField.value;
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {field.options?.map((option) => {
              const optionValue = String(option.value);
              const currentValueStr = String(currentValue);
              const isChecked = optionValue === currentValueStr;

              return (
                <label
                  key={optionValue}
                  className={`
                    relative group cursor-pointer
                    ${field.disabled || disabled || field.readOnly ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={isChecked}
                    onChange={(e) => {
                      let newValue: any = e.target.value;
                      if (
                        field.options?.some(
                          (opt) =>
                            opt.value === "true" || opt.value === "false",
                        )
                      ) {
                        if (newValue === "true") newValue = true;
                        if (newValue === "false") newValue = false;
                      }
                      controllerField.onChange(newValue);
                      if (onFieldChange) {
                        onFieldChange(field.name, newValue);
                      }
                    }}
                    disabled={field.disabled || disabled || field.readOnly}
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
                        <X size={12} className="text-white" />
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
        <DateTimePicker
          field={field}
          controllerField={controllerField}
          inputClassName={inputClassName}
          readOnly={field.readOnly}
        />
      );

    default:
      // For regular inputs (text, number, email, password, etc.)
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
            readOnly={field.readOnly}
          />
        </div>
      );
  }
};
