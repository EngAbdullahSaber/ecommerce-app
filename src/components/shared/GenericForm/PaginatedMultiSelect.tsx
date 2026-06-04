import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronDown, X, Check, Loader2 } from "lucide-react";
import { PaginatedSelectConfig, FieldOption } from "./types";
import { usePaginatedSelect } from "./hooks/usePaginatedSelect";

interface PaginatedMultiSelectProps {
  config: PaginatedSelectConfig;
  value: any[];
  onChange: (value: any[]) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  fetchOptions?: (endpoint: string, params: any) => Promise<any>;
}

export const PaginatedMultiSelectComponent: React.FC<PaginatedMultiSelectProps> = ({
  config,
  value = [],
  onChange,
  placeholder = "Select options",
  disabled = false,
  readOnly = false,
  fetchOptions,
}) => {
  const { options, loading, hasMore, setSearch, loadMore } = usePaginatedSelect(
    config,
    fetchOptions,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setInputValue("");
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScroll = useCallback(() => {
    if (!listRef.current || !hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) loadMore();
  }, [hasMore, loading, loadMore]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSearch(e.target.value);
  };

  const safeValue = value || [];

  const isSelected = (optionValue: any) =>
    safeValue.some((v) => String(v) === String(optionValue));

  const toggleOption = (option: FieldOption) => {
    if (isSelected(option.value)) {
      onChange(safeValue.filter((v) => String(v) !== String(option.value)));
    } else {
      onChange([...safeValue, option.value]);
    }
  };

  const removeValue = (val: any, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(safeValue.filter((v) => String(v) !== String(val)));
  };

  const getLabel = (val: any) =>
    options.find((opt) => String(opt.value) === String(val))?.label ||
    String(val);

  if (readOnly) {
    return (
      <div className="w-full px-3 py-2 min-h-[48px] border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-2 items-center">
        {safeValue.length === 0 ? (
          <span className="text-slate-400 text-sm">{placeholder}</span>
        ) : (
          safeValue.map((v) => (
            <span
              key={v}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
            >
              {getLabel(v)}
            </span>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(true)}
        className={`min-h-[48px] w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 cursor-pointer flex flex-wrap items-center gap-2 transition-all duration-300
          ${isOpen ? "ring-2 ring-blue-500/50 border-blue-500" : "border-slate-300 dark:border-slate-600"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {safeValue.map((v) => (
          <span
            key={v}
            className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
          >
            {getLabel(v)}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => removeValue(v, e)}
                className="hover:text-red-500 transition-colors ml-0.5"
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}

        <div className="flex-1 flex items-center justify-between min-w-[80px]">
          {safeValue.length === 0 && (
            <span className="text-slate-400 text-sm select-none">
              {placeholder}
            </span>
          )}
          <span className="flex-1" />
          {loading ? (
            <Loader2 size={18} className="animate-spin text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
          )}
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl max-h-96">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={inputValue}
                onChange={handleSearchChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 text-black dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
            </div>
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="overflow-y-auto max-h-64"
          >
            {options.length === 0 && !loading ? (
              <div className="py-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                No options found
              </div>
            ) : (
              options.map((option) => {
                const selected = isSelected(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => toggleOption(option)}
                    className={`px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                      selected
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {selected && (
                        <Check
                          size={16}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {loading && (
              <div className="py-3 text-center">
                <Loader2
                  size={20}
                  className="animate-spin text-blue-500 mx-auto"
                />
              </div>
            )}

            {!loading && hasMore && options.length > 0 && (
              <div className="py-3 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
                Scroll down to load more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
