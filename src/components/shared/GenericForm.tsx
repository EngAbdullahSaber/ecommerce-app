// components/shared/GenericForm.tsx - UPDATED WITH REACT-DATE-RANGE
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
  ChevronDown,
  Plus,
  Trash2,
  Check,
  Image as ImageIcon,
  Eye,
  XCircle,
} from "lucide-react";

// Import react-date-range components
import {
  DateRange,
  DateRangePicker,
  Calendar as RangeCalendar,
} from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

// Field Types
export type FieldType =
  | "text"
  | "email"
  | "number"
  | "password"
  | "textarea"
  | "select"
  | "paginatedSelect"
  | "multiselect"
  | "date"
  | "datetime"
  | "daterange" // New: for date range selection
  | "checkbox"
  | "radio"
  | "file"
  | "image"
  | "autocomplete"
  | "custom"
  | "array";

export interface FieldOption {
  label: string;
  value: string | number;
  [key: string]: any;
}

export interface ArrayFieldConfig {
  fields: FormField[];
  minItems?: number;
  maxItems?: number;
  addButtonLabel?: string;
  removeButtonLabel?: string;
  itemLabel?: (index: number) => string;
}

export interface PaginatedSelectConfig {
  endpoint: string;
  searchParam?: string;
  labelKey: string;
  valueKey: string;
  pageSize?: number;
  debounceTime?: number;
  additionalParams?: Record<string, any>;
  transformResponse?: (data: any) => FieldOption[];
}

// Image upload configuration
export interface ImageUploadConfig {
  uploadEndpoint?: string; // API endpoint for image upload
  maxSize?: number; // Max file size in bytes (default: 5MB)
  accept?: string; // Acceptable file types (default: image/*)
  multiple?: boolean; // Allow multiple images
  maxFiles?: number; // Max number of files (only for multiple)
  preview?: boolean; // Show image preview
  onUpload?: (file: File) => Promise<string>; // Custom upload function
  onRemove?: (url: string) => Promise<void>; // Custom remove function
}

// Date Range configuration
export interface DateRangeConfig {
  range?: boolean; // true for date range, false for single date
  minDate?: Date;
  maxDate?: Date;
  showTimePicker?: boolean; // Show time selection
  timeFormat?: string;
  timeIntervals?: number;
}

// Extended FormField to include render prop
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
  // Updated render function signature to receive field props
  render?: (props: {
    field: any;
    value: any;
    onChange: (value: any) => void;
    errors: any;
  }) => React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  arrayConfig?: ArrayFieldConfig;
  paginatedSelectConfig?: PaginatedSelectConfig;
  initialValue?: any;
  readOnly?: boolean;
  // Image specific props
  imageUploadConfig?: ImageUploadConfig;
  // New prop to force full width for specific fields
  fullWidth?: boolean;
  // Date range specific props
  dateRangeConfig?: DateRangeConfig;
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
  fetchOptions?: (endpoint: string, params: any) => Promise<any>;
  onFieldChange?: (fieldName: string, value: any) => void;
  customValidation?: (data: any) => Record<string, string>;
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Date Range Input Component
interface DateRangeInputProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  readOnly?: boolean;
  config?: DateRangeConfig;
  errors?: any;
  placeholder?: string;
}

const DateRangeInputComponent: React.FC<DateRangeInputProps> = ({
  name,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  config = {},
  errors,
  placeholder = "Select date(s)",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const [singleDate, setSingleDate] = useState<Date | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    range = true,
    minDate,
    maxDate,
    showTimePicker = false,
    timeFormat = "hh:mm a",
    timeIntervals = 30,
  } = config;

  // Initialize from value
  useEffect(() => {
    if (value) {
      if (range) {
        if (typeof value === "object" && value.startDate && value.endDate) {
          setDateRange({
            startDate: new Date(value.startDate),
            endDate: new Date(value.endDate),
          });
        } else if (Array.isArray(value) && value.length === 2) {
          setDateRange({
            startDate: new Date(value[0]),
            endDate: new Date(value[1]),
          });
        } else if (value.startDate || value.endDate) {
          setDateRange({
            startDate: value.startDate ? new Date(value.startDate) : null,
            endDate: value.endDate ? new Date(value.endDate) : null,
          });
        }
      } else {
        setSingleDate(value ? new Date(value) : null);
      }
    }
  }, [value, range]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRangeSelect = (ranges: any) => {
    const selection = ranges.selection;
    const newRange = {
      startDate: selection.startDate,
      endDate: selection.endDate,
    };

    setDateRange(newRange);

    if (range) {
      onChange(newRange);
    } else {
      onChange(selection.startDate);
    }
  };

  const handleSingleDateSelect = (date: Date) => {
    setSingleDate(date);
    onChange(date);
  };

  const clearSelection = () => {
    if (range) {
      setDateRange({ startDate: null, endDate: null });
      onChange({ startDate: null, endDate: null });
    } else {
      setSingleDate(null);
      onChange(null);
    }
  };

  const applySelection = () => {
    setIsOpen(false);
  };

  // Format display value
  const getDisplayValue = () => {
    if (readOnly) {
      if (range && dateRange.startDate && dateRange.endDate) {
        return `${format(dateRange.startDate, "MMM dd, yyyy")} - ${format(
          dateRange.endDate,
          "MMM dd, yyyy",
        )}`;
      } else if (!range && singleDate) {
        return format(singleDate, "MMM dd, yyyy");
      }
      return placeholder;
    }

    if (range) {
      if (dateRange.startDate && dateRange.endDate) {
        return `${format(dateRange.startDate, "MMM dd, yyyy")} - ${format(
          dateRange.endDate,
          "MMM dd, yyyy",
        )}`;
      } else if (dateRange.startDate) {
        return `${format(dateRange.startDate, "MMM dd, yyyy")} - Select end date`;
      }
    } else if (singleDate) {
      return format(singleDate, "MMM dd, yyyy");
    }

    return placeholder;
  };

  // For read-only mode
  if (readOnly) {
    return (
      <div className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
        {getDisplayValue()}
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={getDisplayValue()}
          onClick={() => !disabled && !readOnly && setIsOpen(!isOpen)}
          placeholder={placeholder}
          disabled={disabled || readOnly}
          readOnly
          className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
            border-slate-300 dark:border-slate-600 pr-12 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {dateRange.startDate || singleDate
            ? !disabled &&
              !readOnly && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors mr-1"
                  title="Clear selection"
                >
                  <X size={16} />
                </button>
              )
            : null}
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {isOpen && !disabled && !readOnly && (
        <div className="absolute z-50 mt-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/40 overflow-hidden">
          {/* Header with selected range */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-b border-slate-200 dark:border-slate-700">
            <div className="mb-2">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {range ? "Selected Range" : "Selected Date"}
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                {range
                  ? dateRange.startDate && dateRange.endDate
                    ? `${format(dateRange.startDate, "MMM dd, yyyy")} - ${format(
                        dateRange.endDate,
                        "MMM dd, yyyy",
                      )}`
                    : dateRange.startDate
                      ? `${format(dateRange.startDate, "MMM dd, yyyy")} - Select end date`
                      : "Select a date range"
                  : singleDate
                    ? format(singleDate, "MMMM dd, yyyy")
                    : "Select a date"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
                {range ? "Date Range" : "Single Date"}
              </div>
            </div>
          </div>

          {/* Calendar Area */}
          <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {range ? (
              <DateRange
                ranges={[
                  {
                    startDate: dateRange.startDate || new Date(),
                    endDate: dateRange.endDate || new Date(),
                    key: "selection",
                  },
                ]}
                onChange={handleRangeSelect}
                moveRangeOnFirstSelection={false}
                retainEndDateOnFirstSelection={true}
                months={1}
                direction="horizontal"
                minDate={minDate}
                maxDate={maxDate}
                showDateDisplay={false}
                showPreview={true}
                showMonthAndYearPickers={true}
                rangeColors={["#3b82f6"]}
                className="custom-date-range"
                editableDateInputs={true}
                monthDisplayFormat="MMMM yyyy"
                weekdayDisplayFormat="EEEEEE"
              />
            ) : (
              <RangeCalendar
                date={singleDate || new Date()}
                onChange={handleSingleDateSelect}
                minDate={minDate}
                maxDate={maxDate}
                color="#3b82f6"
                className="custom-calendar"
              />
            )}
          </div>

          {/* Footer with action buttons */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={clearSelection}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <X size={16} />
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applySelection}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {errors && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
          <X size={12} />
          {errors.message}
        </p>
      )}

      {/* Custom CSS */}
      <style jsx global>{`
        /* Global styles for react-date-range */
        .custom-date-range,
        .custom-calendar {
          --rdp-background-color: transparent !important;
          --rdp-text-color: #1e293b !important;
          --rdp-accent-color: #3b82f6 !important;
          --rdp-hover-color: #f1f5f9 !important;
          --rdp-range-color: #dbeafe !important;
          font-family: inherit !important;
        }

        .dark .custom-date-range,
        .dark .custom-calendar {
          --rdp-background-color: transparent !important;
          --rdp-text-color: #f1f5f9 !important;
          --rdp-accent-color: #3b82f6 !important;
          --rdp-hover-color: #334155 !important;
          --rdp-range-color: #1e3a8a !important;
        }

        /* Hide default date display */
        .rdrDateDisplayWrapper {
          display: none !important;
        }

        /* Calendar wrapper */
        .rdrCalendarWrapper {
          background: transparent !important;
          border-radius: 12px !important;
          color: inherit !important;
          width: 100% !important;
        }

        /* Month and year picker */
        .rdrMonthAndYearWrapper {
          padding: 0 0 16px 0 !important;
          border: none !important;
          background: transparent !important;
          height: auto !important;
        }

        .rdrMonthAndYearPickers {
          font-weight: 600 !important;
          font-size: 16px !important;
          color: var(--rdp-text-color) !important;
        }

        .rdrMonthPicker select,
        .rdrYearPicker select {
          background: var(--rdp-background-color) !important;
          color: var(--rdp-text-color) !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }

        .dark .rdrMonthPicker select,
        .dark .rdrYearPicker select {
          border-color: #475569 !important;
          background: #1e293b !important;
        }

        .rdrMonthPicker select:hover,
        .rdrYearPicker select:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        /* Week days */
        .rdrWeekDay {
          color: var(--rdp-text-color) !important;
          opacity: 0.6 !important;
          font-weight: 500 !important;
          font-size: 12px !important;
          padding: 8px 0 !important;
        }

        /* Days */
        .rdrDay {
          color: var(--rdp-text-color) !important;
          height: 40px !important;
          width: 40px !important;
        }

        .rdrDayNumber {
          font-size: 14px !important;
          font-weight: 500 !important;
          color: var(--rdp-text-color) !important;
          top: 0 !important;
          bottom: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .rdrDayToday .rdrDayNumber span:after {
          background: var(--rdp-accent-color) !important;
          width: 4px !important;
          height: 4px !important;
          border-radius: 50% !important;
          bottom: 6px !important;
        }

        /* Hover state */
        .rdrDayHovered,
        .rdrDay:hover:not(.rdrDayPassive) {
          background: var(--rdp-hover-color) !important;
          border-radius: 8px !important;
        }

        /* Selected range */
        .rdrInRange,
        .rdrStartEdge,
        .rdrEndEdge,
        .rdrDayStartPreview,
        .rdrDayEndPreview,
        .rdrDayInPreview {
          background: var(--rdp-range-color) !important;
        }

        /* Selected day */
        .rdrSelected {
          background: var(--rdp-accent-color) !important;
          border-radius: 8px !important;
          color: white !important;
        }

        .rdrSelected .rdrDayNumber span {
          color: white !important;
          font-weight: 600 !important;
        }

        /* Start and end edges */
        .rdrDayStartOfMonth .rdrInRange,
        .rdrDayStartOfMonth .rdrEndEdge,
        .rdrDayStartOfWeek .rdrInRange,
        .rdrDayStartOfWeek .rdrEndEdge {
          border-top-left-radius: 8px !important;
          border-bottom-left-radius: 8px !important;
        }

        .rdrDayEndOfMonth .rdrInRange,
        .rdrDayEndOfMonth .rdrStartEdge,
        .rdrDayEndOfWeek .rdrInRange,
        .rdrDayEndOfWeek .rdrStartEdge {
          border-top-right-radius: 8px !important;
          border-bottom-right-radius: 8px !important;
        }

        /* Disabled days */
        .rdrDayDisabled {
          background: transparent !important;
          color: #94a3b8 !important;
          cursor: not-allowed !important;
        }

        .dark .rdrDayDisabled {
          color: #64748b !important;
        }

        .rdrDayDisabled .rdrDayNumber span {
          color: inherit !important;
        }

        /* Passive days (from other months) */
        .rdrDayPassive {
          opacity: 0.3 !important;
        }

        /* Month name */
        .rdrMonthName {
          text-align: center !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #64748b !important;
          padding: 8px 0 !important;
          margin-bottom: 8px !important;
        }

        .dark .rdrMonthName {
          color: #94a3b8 !important;
        }

        /* Navigation buttons */
        .rdrMonthAndYearPickers button {
          background: transparent !important;
          border: none !important;
          color: #64748b !important;
          cursor: pointer !important;
          padding: 8px !important;
          border-radius: 6px !important;
          transition: all 0.2s !important;
        }

        .dark .rdrMonthAndYearPickers button {
          color: #94a3b8 !important;
        }

        .rdrMonthAndYearPickers button:hover {
          background: rgba(59, 130, 246, 0.1) !important;
          color: #3b82f6 !important;
        }

        .dark .rdrMonthAndYearPickers button:hover {
          background: rgba(59, 130, 246, 0.2) !important;
          color: #60a5fa !important;
        }

        /* Custom scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .dark .custom-scrollbar {
          scrollbar-color: #475569 transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* DateRange specific */
        .rdrDateRangeWrapper {
          border-radius: 12px !important;
          overflow: hidden !important;
        }

        /* Make sure the calendar fills its container */
        .rdrMonth {
          padding: 0 !important;
          width: 100% !important;
        }

        .rdrMonths {
          align-items: center !important;
        }

        /* Preview range */
        .rdrDayStartPreview,
        .rdrDayEndPreview,
        .rdrDayInPreview {
          border-radius: 0 !important;
        }

        /* Input fields for editable dates */
        .rdrDateInput {
          background: var(--rdp-background-color) !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          color: var(--rdp-text-color) !important;
        }

        .dark .rdrDateInput {
          border-color: #475569 !important;
        }

        .rdrDateInput input {
          color: var(--rdp-text-color) !important;
          background: transparent !important;
        }
      `}</style>
    </div>
  );
};

// Custom hook for paginated select
function usePaginatedSelect(
  config: PaginatedSelectConfig,
  fetchOptions?: GenericFormProps["fetchOptions"],
) {
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(
    async (
      pageNum: number,
      searchQuery: string = "",
      reset: boolean = false,
    ) => {
      if (loading || (!hasMore && pageNum > 1 && !reset)) return;

      setLoading(true);
      try {
        const params: any = {
          page: pageNum,
          pageSize: config.pageSize || 10,
          ...config.additionalParams,
        };

        if (searchQuery && config.searchParam) {
          params[config.searchParam] = searchQuery;
        }

        let response;
        if (fetchOptions) {
          response = await fetchOptions(config.endpoint, params);
        } else {
          // Default fetch implementation
          const queryString = new URLSearchParams(params).toString();
          const res = await fetch(`${config.endpoint}?${queryString}`);
          response = await res.json();
        }

        const data = response.data || response.items || response;
        const totalItems =
          response.meta?.total || response.total || data.length;

        let newOptions: FieldOption[];
        if (config.transformResponse) {
          newOptions = config.transformResponse(data);
        } else {
          newOptions = data.map((item: any) => ({
            label: item[config.labelKey],
            value: item[config.valueKey],
            ...item,
          }));
        }

        if (reset) {
          setOptions(newOptions);
        } else {
          setOptions((prev) => [...prev, ...newOptions]);
        }

        setTotal(totalItems);
        setHasMore(newOptions.length === (config.pageSize || 10));
        setPage(pageNum);
      } catch (error) {
        console.error("Error fetching paginated select data:", error);
      } finally {
        setLoading(false);
      }
    },
    [config, loading, hasMore, fetchOptions],
  );

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchData(page + 1, search);
    }
  };

  const handleSearch = useCallback(
    debounce((searchQuery: string) => {
      setSearch(searchQuery);
      setPage(1);
      setOptions([]);
      setHasMore(true);
      fetchData(1, searchQuery, true);
    }, config.debounceTime || 500),
    [config, fetchData],
  );

  // Initial load
  useEffect(() => {
    fetchData(1, "", true);
  }, []);

  return {
    options,
    loading,
    hasMore,
    search,
    setSearch: handleSearch,
    loadMore,
    total,
    refresh: () => fetchData(1, search, true),
  };
}

// Image Input Component - UPDATED WITH FULL WIDTH
interface ImageInputProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  readOnly?: boolean;
  config?: ImageUploadConfig;
  errors?: any;
  fullWidth?: boolean;
}

const ImageInputComponent: React.FC<ImageInputProps> = ({
  name,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  config = {},
  errors,
  fullWidth = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadEndpoint,
    maxSize = 5 * 1024 * 1024, // 5MB default
    accept = "image/*",
    multiple = false,
    maxFiles = multiple ? 10 : 1,
    preview = true,
    onUpload,
    onRemove,
  } = config;

  // Initialize preview URLs from value
  useEffect(() => {
    if (value) {
      if (Array.isArray(value)) {
        setPreviewUrls(value);
      } else if (typeof value === "string") {
        setPreviewUrls([value]);
      } else if (value instanceof File) {
        const url = URL.createObjectURL(value);
        setPreviewUrls([url]);
      }
    } else {
      setPreviewUrls([]);
    }
  }, [value]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      return false;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return false;
    }

    setError("");
    return true;
  };

  const handleFileUpload = async (file: File): Promise<File | string> => {
    if (onUpload) {
      return await onUpload(file);
    }

    if (uploadEndpoint) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.url || data.path || data.imageUrl;
    }

    // If no upload endpoint provided, return as base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate number of files
    const currentCount = Array.isArray(value) ? value.length : value ? 1 : 0;
    if (currentCount + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} file(s) allowed`);
      return;
    }

    // Validate each file
    for (const file of files) {
      if (!validateFile(file)) {
        return;
      }
    }

    setUploading(true);
    setError("");

    try {
      // Don't upload immediately, just pass the File objects
      if (multiple) {
        const newValue = Array.isArray(value) ? [...value, ...files] : files;
        onChange(newValue);
      } else {
        onChange(files[0]);
      }

      // Create preview URLs
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    } catch (err) {
      setError("Failed to process image(s)");
      console.error("Error:", err);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (index: number) => {
    if (disabled || readOnly) return;

    const urlToRemove = previewUrls[index];
    const isBlobUrl = urlToRemove.startsWith("blob:");

    // Call custom remove function if provided
    if (onRemove && !isBlobUrl) {
      try {
        await onRemove(urlToRemove);
      } catch (err) {
        console.error("Remove error:", err);
      }
    }

    // Update value
    if (multiple) {
      const newValue = Array.isArray(value)
        ? value.filter((_, i) => i !== index)
        : [];
      onChange(newValue);
    } else {
      onChange("");
    }

    // Update preview URLs
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));

    // Revoke blob URL if it's a temporary preview
    if (isBlobUrl) {
      URL.revokeObjectURL(urlToRemove);
    }
  };

  const handleClearAll = () => {
    if (disabled || readOnly) return;

    // Revoke all blob URLs
    previewUrls.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    // Call remove for each non-blob URL
    if (onRemove) {
      previewUrls.forEach((url) => {
        if (!url.startsWith("blob:")) {
          onRemove(url).catch(console.error);
        }
      });
    }

    onChange(multiple ? [] : "");
    setPreviewUrls([]);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && !disabled && !readOnly) {
      fileInputRef.current.click();
    }
  };

  // For read-only mode
  if (readOnly) {
    return (
      <div className="space-y-3 w-full">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {previewUrls.length === 0
            ? "No images"
            : `${previewUrls.length} image(s)`}
        </div>
        {preview && previewUrls.length > 0 && (
          <div
            className={`grid gap-2 ${fullWidth ? "grid-cols-1" : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5"}`}
          >
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className={`relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 ${
                  fullWidth ? "w-full" : "aspect-square"
                }`}
                style={fullWidth ? { height: "300px" } : {}}
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => window.open(url, "_blank")}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group"
                >
                  <Eye
                    size={20}
                    className="text-white/0 group-hover:text-white/80 transition-colors"
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Upload Area - UPDATED FOR FULL WIDTH */}
      <div
        onClick={triggerFileInput}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer w-full
          transition-all duration-300 hover:shadow-lg
          ${
            disabled || uploading
              ? "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60"
              : errors || error
                ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20 hover:border-red-400 dark:hover:border-red-600"
                : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-600 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80"
          }
        `}
        style={fullWidth ? { width: "100%" } : {}}
      >
        <div className="flex flex-col items-center justify-center space-y-3 w-full">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
            {uploading ? (
              <Loader2
                size={24}
                className="animate-spin text-blue-600 dark:text-blue-400"
              />
            ) : (
              <ImageIcon
                size={24}
                className="text-blue-600 dark:text-blue-400"
              />
            )}
          </div>
          <div className="w-full">
            <div className="font-medium text-slate-800 dark:text-slate-200">
              {uploading ? "Uploading..." : "Click to upload images"}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {multiple
                ? `Drag & drop or click to upload (max ${maxFiles} files)`
                : "Drag & drop or click to upload"}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Supported: {accept || "image/*"} • Max: {maxSize / (1024 * 1024)}
              MB
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {(errors || error) && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 w-full">
          <AlertCircle size={16} />
          <span>{error || (errors?.message as string)}</span>
        </div>
      )}

      {/* Preview Section - UPDATED FOR FULL WIDTH */}
      {preview && previewUrls.length > 0 && (
        <div className="space-y-3 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Uploaded Images ({previewUrls.length}/{maxFiles})
            </div>
            {!disabled && previewUrls.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <XCircle size={14} />
                Clear All
              </button>
            )}
          </div>

          <div
            className={`grid gap-3 ${fullWidth ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}
          >
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className={`relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 ${
                  fullWidth ? "w-full" : ""
                }`}
                style={fullWidth ? { height: "400px" } : { height: "200px" }}
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => window.open(url, "_blank")}
                      className="p-1.5 bg-white/90 dark:bg-slate-900/90 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <Eye
                        size={14}
                        className="text-slate-700 dark:text-slate-300"
                      />
                    </button>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="p-1.5 bg-red-500/90 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={14} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Loading Indicator */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {!errors && !error && previewUrls.length === 0 && (
        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 w-full">
          <Upload size={14} />
          <span>Upload images by clicking above or dragging and dropping</span>
        </div>
      )}
    </div>
  );
};

// Paginated Select Component
interface PaginatedSelectProps {
  config: PaginatedSelectConfig;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  fetchOptions?: GenericFormProps["fetchOptions"];
}

const PaginatedSelectComponent: React.FC<PaginatedSelectProps> = ({
  config,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  readOnly = false,
  fetchOptions,
}) => {
  const { options, loading, hasMore, search, setSearch, loadMore, total } =
    usePaginatedSelect(config, fetchOptions);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find selected option label
  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === value);
    setSelectedLabel(selectedOption?.label || "");
    if (selectedOption) {
      setInputValue(selectedOption.label);
    }
  }, [value, options]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!listRef.current || !hasMore || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSearch(newValue);
    setIsOpen(true);
  };

  const handleSelect = (option: FieldOption) => {
    onChange(option.value);
    setInputValue(option.label);
    setSelectedLabel(option.label);
    setIsOpen(false);
  };

  const clearSelection = () => {
    onChange("");
    setInputValue("");
    setSelectedLabel("");
    setIsOpen(false);
  };

  // For read-only mode
  if (readOnly) {
    return (
      <div className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
        {selectedLabel || placeholder || "Not selected"}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleSearchChange}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4  py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
            border-slate-300 dark:border-slate-600 pr-12"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <Loader2 size={18} className="animate-spin text-slate-400" />
          ) : (
            <ChevronDown size={18} className="text-slate-400" />
          )}
        </div>
        {value && !disabled && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute inset-y-0 right-8 flex items-center pr-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl max-h-96">
          {/* Search header */}
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
                placeholder={`${placeholder}`}
                className="w-full pl-10 text-black dark:text-white pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
            </div>
          </div>

          {/* Options list */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="overflow-y-auto max-h-64"
          >
            {options.length === 0 && !loading ? (
              <div className="py-4 text-center text-slate-500 dark:text-slate-400">
                No options found
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                    value === option.value
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    {value === option.value && (
                      <Check
                        size={16}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="py-3 text-center">
                <Loader2
                  size={20}
                  className="animate-spin text-blue-500 mx-auto"
                />
              </div>
            )}

            {/* Load more indicator */}
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

// Array Field Component
interface ArrayFieldProps {
  name: string;
  control: any;
  config: ArrayFieldConfig;
  errors: any;
  disabled?: boolean;
  defaultValues?: any[];
}

const ArrayFieldComponent: React.FC<ArrayFieldProps> = ({
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

                const inputClassName = `w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                  ${fieldError ? "border-red-500" : "border-slate-300 dark:border-slate-600"}`;

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
                      render={({ field: controllerField }) => {
                        switch (subField.type) {
                          case "text":
                          case "number":
                          case "email":
                            return (
                              <input
                                type={subField.type}
                                {...controllerField}
                                placeholder={subField.placeholder}
                                disabled={subField.disabled || disabled}
                                className={inputClassName}
                              />
                            );
                          case "textarea":
                            return (
                              <textarea
                                {...controllerField}
                                placeholder={subField.placeholder}
                                disabled={subField.disabled || disabled}
                                rows={subField.rows || 3}
                                className={inputClassName}
                              />
                            );
                          case "select":
                            return (
                              <select
                                {...controllerField}
                                disabled={subField.disabled || disabled}
                                className={inputClassName}
                              >
                                <option value="">
                                  Select {subField.label}
                                </option>
                                {subField.options?.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            );
                          case "checkbox":
                            return (
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  {...controllerField}
                                  checked={controllerField.value}
                                  disabled={subField.disabled || disabled}
                                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/50"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                  {subField.label}
                                </span>
                              </label>
                            );
                          case "image":
                            return (
                              <ImageInputComponent
                                name={fieldName}
                                value={controllerField.value}
                                onChange={controllerField.onChange}
                                disabled={subField.disabled || disabled}
                                readOnly={subField.readOnly}
                                config={subField.imageUploadConfig}
                                errors={fieldError}
                                fullWidth={subField.fullWidth}
                              />
                            );
                          case "custom":
                            return subField.render
                              ? subField.render({
                                  field: controllerField,
                                  value: controllerField.value,
                                  onChange: controllerField.onChange,
                                  errors: fieldError,
                                })
                              : null;
                          default:
                            return (
                              <input
                                type="text"
                                {...controllerField}
                                placeholder={subField.placeholder}
                                disabled={subField.disabled || disabled}
                                className={inputClassName}
                              />
                            );
                        }
                      }}
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
  onFieldChange,
  className = "",
  fetchOptions,
  customValidation,
}: GenericFormProps) {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Generate Zod schema from fields
  const generateSchema = () => {
    const schemaFields: Record<string, z.ZodType<any>> = {};

    fields.forEach((field) => {
      // Skip validation for radio buttons
      if (field.type === "radio") {
        // For radio buttons, accept any value (string, boolean, etc.)
        schemaFields[field.name] = z.any().optional();
        return;
      }

      // Don't skip custom fields from validation
      if (field.validation) {
        schemaFields[field.name] = field.validation;
      } else if (field.type === "array" && field.arrayConfig) {
        // Handle array type
        const itemSchema: Record<string, z.ZodType<any>> = {};
        field.arrayConfig.fields.forEach((subField) => {
          if (subField.validation) {
            itemSchema[subField.name] = subField.validation;
          } else {
            let subFieldSchema: z.ZodType<any>;

            switch (subField.type) {
              case "email":
                subFieldSchema = z.string().email("Invalid email address");
                break;
              case "number":
                let numberSchema = z.number();
                if (subField.min !== undefined) {
                  numberSchema = numberSchema.min(Number(subField.min));
                }
                if (subField.max !== undefined) {
                  numberSchema = numberSchema.max(Number(subField.max));
                }
                subFieldSchema = numberSchema;
                break;
              case "checkbox":
                subFieldSchema = z.boolean();
                break;
              case "radio": // Also skip validation for nested radio buttons
                subFieldSchema = z.any().optional();
                break;
              case "image":
                subFieldSchema = z.any().optional();
                break;
              default:
                subFieldSchema = z.string();
            }

            if (
              subField.required &&
              subField.type !== "radio" &&
              subField.type !== "image"
            ) {
              if (subField.type === "checkbox") {
                subFieldSchema = subFieldSchema.refine(
                  (val) => val === true,
                  "This field is required",
                );
              } else if (subField.type === "number") {
                subFieldSchema = subFieldSchema.refine(
                  (val) => val !== undefined && val !== null,
                  `${subField.label} is required`,
                );
              } else {
                subFieldSchema = subFieldSchema.min(
                  1,
                  `${subField.label} is required`,
                );
              }
            } else {
              subFieldSchema = subFieldSchema.optional();
            }

            itemSchema[subField.name] = subFieldSchema;
          }
        });

        const arraySchema = z.array(z.object(itemSchema));

        // Apply min/max constraints
        let constrainedSchema = arraySchema;
        if (field.arrayConfig.minItems) {
          constrainedSchema = constrainedSchema.min(
            field.arrayConfig.minItems,
            `At least ${field.arrayConfig.minItems} item(s) required`,
          );
        }
        if (field.arrayConfig.maxItems) {
          constrainedSchema = constrainedSchema.max(
            field.arrayConfig.maxItems,
            `Maximum ${field.arrayConfig.maxItems} item(s) allowed`,
          );
        }

        if (field.required) {
          constrainedSchema = constrainedSchema.min(
            1,
            `${field.label} is required`,
          );
        }

        schemaFields[field.name] = constrainedSchema;
      } else if (field.type === "custom") {
        // Handle custom fields - use validation if provided, otherwise create default schema
        if (field.validation) {
          schemaFields[field.name] = field.validation;
        } else if (field.required) {
          // Create a basic validation for required custom fields
          schemaFields[field.name] = z.any().refine(
            (val) => {
              // Check if value is not empty based on type
              if (val === undefined || val === null) return false;
              if (typeof val === "string") return val.trim().length > 0;
              if (Array.isArray(val)) return val.length > 0;
              return true;
            },
            { message: `${field.label} is required` },
          );
        } else {
          // Optional custom field
          schemaFields[field.name] = z.any().optional();
        }
      } else if (field.type === "image") {
        // Image field validation
        if (field.required) {
          schemaFields[field.name] = z.any().refine(
            (val) => {
              if (!val) return false;
              if (Array.isArray(val)) return val.length > 0;
              if (typeof val === "string") return val.trim().length > 0;
              return true;
            },
            { message: `${field.label} is required` },
          );
        } else {
          schemaFields[field.name] = z.any().optional();
        }
      } else if (field.type === "daterange") {
        // Date range validation
        if (field.required) {
          if (field.dateRangeConfig?.range) {
            // Date range validation
            schemaFields[field.name] = z
              .object({
                startDate: z.date({ required_error: "Start date is required" }),
                endDate: z.date({ required_error: "End date is required" }),
              })
              .refine(
                (data) => data.endDate >= data.startDate,
                "End date must be after start date",
              );
          } else {
            // Single date validation
            schemaFields[field.name] = z.date({
              required_error: `${field.label} is required`,
            });
          }
        } else {
          if (field.dateRangeConfig?.range) {
            schemaFields[field.name] = z
              .object({
                startDate: z.date().optional(),
                endDate: z.date().optional(),
              })
              .optional();
          } else {
            schemaFields[field.name] = z.date().optional();
          }
        }
      } else {
        let fieldSchema: z.ZodType<any>;

        switch (field.type) {
          case "email":
            fieldSchema = z.string().email("Invalid email address");
            break;
          case "number":
            let numberSchema = z.number();
            if (field.min !== undefined) {
              numberSchema = numberSchema.min(Number(field.min));
            }
            if (field.max !== undefined) {
              numberSchema = numberSchema.max(Number(field.max));
            }
            fieldSchema = numberSchema;
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
            fieldSchema = z.any();
            break;
          case "paginatedSelect":
            fieldSchema = z.any().optional();
            break;
          default:
            fieldSchema = z.string();
        }

        if (field.required) {
          if (field.type === "checkbox") {
            fieldSchema = fieldSchema.refine(
              (val) => val === true,
              "This field is required",
            );
          } else if (field.type === "number") {
            fieldSchema = fieldSchema.refine(
              (val) => val !== undefined && val !== null,
              `${field.label} is required`,
            );
          } else if (
            field.type !== "file" &&
            field.type !== "image" &&
            field.type !== "paginatedSelect"
          ) {
            fieldSchema = fieldSchema.min(1, `${field.label} is required`);
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
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleFormSubmit = async (data: any) => {
    try {
      setSubmitStatus("idle");
      setErrorMessage("");

      // Apply custom validation if provided
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

  // Render field function
  const renderField = (field: FormField) => {
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
      ${field.icon ? "pl-11" : ""}
      ${field.readOnly ? "bg-slate-50 dark:bg-slate-800/50" : ""}`;

    switch (field.type) {
      case "array":
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

      case "paginatedSelect":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <PaginatedSelectComponent
                config={field.paginatedSelectConfig!}
                value={controllerField.value}
                onChange={controllerField.onChange}
                placeholder={field.placeholder || `Select ${field.label}`}
                disabled={field.disabled || isLoading}
                readOnly={field.readOnly}
                fetchOptions={fetchOptions}
              />
            )}
          />
        );

      case "daterange":
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={
              field.initialValue ||
              (field.dateRangeConfig?.range
                ? { startDate: null, endDate: null }
                : null)
            }
            render={({ field: controllerField, fieldState }) => (
              <DateRangeInputComponent
                name={field.name}
                value={controllerField.value}
                onChange={(value) => {
                  controllerField.onChange(value);
                  if (onFieldChange) {
                    onFieldChange(field.name, value);
                  }
                }}
                disabled={field.disabled || isLoading}
                readOnly={field.readOnly}
                config={field.dateRangeConfig}
                errors={fieldState.error}
                placeholder={field.placeholder || `Select ${field.label}`}
              />
            )}
          />
        );

      case "image":
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={
              field.initialValue ||
              (field.imageUploadConfig?.multiple ? [] : "")
            }
            render={({ field: controllerField, fieldState }) => (
              <div style={{ width: field.fullWidth ? "100%" : "auto" }}>
                <ImageInputComponent
                  name={field.name}
                  value={controllerField.value}
                  onChange={(value) => {
                    controllerField.onChange(value);
                    if (onFieldChange) {
                      onFieldChange(field.name, value);
                    }
                  }}
                  disabled={field.disabled || isLoading}
                  readOnly={field.readOnly}
                  config={field.imageUploadConfig}
                  errors={fieldState.error}
                  fullWidth={field.fullWidth}
                />
                {field.imageUploadConfig && (
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#666",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  ></div>
                )}
              </div>
            )}
          />
        );

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
                readOnly={field.readOnly}
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
                  onChange={(e) => {
                    controllerField.onChange(e);
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
            )}
          />
        );

      case "checkbox":
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={field.initialValue || false}
            render={({ field: controllerField }) => (
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
                  disabled={field.disabled || isLoading || field.readOnly}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor={field.name}
                  className="flex flex-col cursor-pointer"
                >
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
            )}
          />
        );

      case "radio":
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={field.initialValue || ""}
            render={({ field: controllerField }) => {
              // Convert boolean values to strings for comparison
              const currentValue = controllerField.value;

              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {field.required && !field.readOnly && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {field.options?.map((option) => {
                      // Compare as strings to handle boolean values properly
                      const optionValue = String(option.value);
                      const currentValueStr = String(currentValue);
                      const isChecked = optionValue === currentValueStr;

                      return (
                        <label
                          key={optionValue}
                          className={`
                      relative group cursor-pointer
                      ${field.disabled || isLoading || field.readOnly ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={isChecked}
                            onChange={(e) => {
                              // Handle both string and boolean values
                              let newValue: any = e.target.value;

                              // If options are strings "true"/"false", convert them to booleans
                              if (
                                field.options?.some(
                                  (opt) =>
                                    opt.value === "true" ||
                                    opt.value === "false",
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
                            disabled={
                              field.disabled || isLoading || field.readOnly
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
                            {/* Icon */}
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

                            {/* Label */}
                            <div className="font-medium text-slate-900 dark:text-white">
                              {option.label}
                            </div>

                            {/* Description */}
                            {option.description && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {option.description}
                              </div>
                            )}

                            {/* Check indicator */}
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
            }}
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
                  readOnly={field.readOnly}
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
                  readOnly={field.readOnly}
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
                  readOnly={field.readOnly}
                />
              </div>
            )}
          />
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500" />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80  ">
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
              // Determine column span for the field
              let colSpan = "md:col-span-6"; // default

              if (field.cols) {
                colSpan = `md:col-span-${field.cols}`;
              }

              // Override for fullWidth fields
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
