// components/shared/MultiSelect.tsx
"use client";
import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

interface MultiSelectProps<T = any> {
  options: T[];
  value: any[];
  onChange: (values: any[]) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => any;
  placeholder?: string;
}

export function MultiSelect<T>({
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  placeholder = "Select options",
}: MultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue: any) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeOption = (optionValue: any, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedOptions = options.filter((option) =>
    value.includes(getOptionValue(option)),
  );

  return (
    <div className="relative">
      <div
        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <span
                key={getOptionValue(option)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm"
              >
                {getOptionLabel(option)}
                <button
                  type="button"
                  onClick={(e) => removeOption(getOptionValue(option), e)}
                  className="hover:text-blue-900 dark:hover:text-blue-100"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => {
            const optionValue = getOptionValue(option);
            const isSelected = value.includes(optionValue);

            return (
              <div
                key={optionValue}
                className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                onClick={() => toggleOption(optionValue)}
              >
                <span className="text-slate-900 dark:text-white">
                  {getOptionLabel(option)}
                </span>
                {isSelected && (
                  <Check
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
