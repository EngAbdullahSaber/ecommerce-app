import React, { useEffect } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { X, Plus, Trash2 } from "lucide-react";
import { ArrayFieldConfig, FormField } from "./types";
import { FieldRenderer } from "./FieldRenderer";

interface ArrayFieldProps {
  name: string;
  control: any;
  config: ArrayFieldConfig;
  errors: any;
  disabled?: boolean;
  defaultValues?: any[];
}

export const ArrayFieldComponent: React.FC<ArrayFieldProps> = ({
  name,
  control,
  config,
  errors,
  disabled = false,
  defaultValues = [],
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  useEffect(() => {
    if (defaultValues.length > 0 && fields.length === 0) {
      defaultValues.forEach((value) => {
        append(value);
      });
    }
  }, [defaultValues, append, fields.length]);

  const addItem = () => {
    const newItem: Record<string, any> = {};
    config.fields.forEach((field) => {
      newItem[field.name] = field.type === "checkbox" ? false : "";
    });
    append(newItem);
  };

  const removeItem = (index: number) => {
    if (fields.length > (config.minItems || 0)) {
      remove(index);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {config.addButtonLabel || "Add items"}
        </div>
        <button
          type="button"
          onClick={addItem}
          disabled={
            disabled || (config.maxItems && fields.length >= config.maxItems)
          }
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 text-purple-600 dark:text-purple-400 rounded-lg hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-500/20 dark:hover:to-violet-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          {config.addButtonLabel || "Add Item"}
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-500/20 dark:to-violet-500/20 rounded-lg">
                  <Trash2
                    size={16}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {config.itemLabel
                    ? config.itemLabel(index)
                    : `Item ${index + 1}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={fields.length <= (config.minItems || 1)}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-12 gap-3">
              {config.fields.map((subField) => {
                const fieldName = `${name}.${index}.${subField.name}`;
                const fieldError = errors[name]?.[index]?.[subField.name];

                return (
                  <div
                    key={subField.name}
                    className={`col-span-12 ${
                      subField.cols
                        ? `md:col-span-${subField.cols}`
                        : "md:col-span-6"
                    } ${subField.className || ""} ${
                      subField.fullWidth ? "md:col-span-12" : ""
                    }`}
                  >
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {subField.label}
                      {subField.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>

                    <Controller
                      name={fieldName}
                      control={control}
                      render={({ field: controllerField }) => (
                        <FieldRenderer
                          field={subField}
                          controllerField={controllerField}
                          disabled={subField.disabled || disabled}
                          error={fieldError}
                        />
                      )}
                    />

                    {fieldError && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {fieldError.message}
                      </p>
                    )}
                    {subField.helperText && !fieldError && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {subField.helperText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {errors[name] && typeof errors[name] === "string" && (
        <p className="text-xs text-red-600 dark:text-red-400">{errors[name]}</p>
      )}
    </div>
  );
};
