// components/shared/GenericUpdateForm.tsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Search,
  ChevronDown,
  Check,
} from "lucide-react";

// Reuse FieldType and FormField from GenericForm
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
  | "checkbox"
  | "radio"
  | "file"
  | "image"
  | "custom";

export interface FieldOption {
  label: string;
  value: string | number | boolean;
  icon?: React.ReactNode;
  description?: string;
  [key: string]: any; // For additional data
}

export interface PaginatedSelectConfig {
  endpoint: string; // API endpoint to fetch data
  searchParam?: string; // Query parameter for search
  labelKey: string; // Field to use for option label
  valueKey: string; // Field to use for option value
  pageSize?: number; // Items per page
  debounceTime?: number; // Debounce time for search
  additionalParams?: Record<string, any>; // Additional query params
  transformResponse?: (data: any) => FieldOption[]; // Transform API response
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
  validation?: z.ZodType<any>;
  helperText?: string;
  icon?: React.ReactNode;
  render?: (value: any, data: any) => React.ReactNode; // For custom display rendering
  renderCustom?: (props: any) => React.ReactNode; // For custom input rendering
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  readOnly?: boolean;
  prefix?: string;

  // For paginatedSelect
  paginatedSelectConfig?: PaginatedSelectConfig;
  initialValue?: any; // Initial selected value
}

export interface GenericUpdateFormProps<T = any> {
  title: string;
  description?: string;
  fields: FormField[];
  entityId: string | number;
  fetchData: (id: string | number) => Promise<T>;
  onUpdate: (id: string | number, data: any) => Promise<any>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
  beforeSubmit?: (data: any) => any;
  afterSuccess?: () => void;
  afterError?: (error: any) => void;
  fetchOptions?: (endpoint: string, params: any) => Promise<any>; // Custom fetch function for paginated selects
  preventDefaultSubmit?: boolean; // Prevent default form submission
}

// Custom hook for paginated select
function usePaginatedSelect(
  config: PaginatedSelectConfig,
  fetchOptions?: GenericUpdateFormProps["fetchOptions"],
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

  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  const handleSearch = useCallback(
    debounce((searchQuery: string) => {
      setSearch(searchQuery);
      setPage(1);
      setOptions([]);
      setHasMore(true);
      fetchData(1, searchQuery, true);
    }, config.debounceTime || 500),
    [config, fetchData, debounce],
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

// Paginated Select Component
interface PaginatedSelectProps {
  config: PaginatedSelectConfig;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  fetchOptions?: GenericUpdateFormProps["fetchOptions"];
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
          className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 
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
                placeholder={`Search ${total} options...`}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Showing {options.length} of {total} options
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
                      <CheckCircle2
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
const ImageInputComponent: React.FC<ImageInputProps> = ({
  name,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  config = {},
  errors,
  fullWidth = false,
  currentImage,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    maxSize = 5 * 1024 * 1024,
    accept = "image/*",
    multiple = false,
    maxFiles = multiple ? 10 : 1,
    preview = true,
    currentImageLabel = "Current image",
    newImageLabel = "New image",
  } = config;

  // Initialize preview URL
  useEffect(() => {
    if (value instanceof File) {
      // New file uploaded
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
    } else if (typeof value === "string") {
      // URL string (could be current image)
      setPreviewUrl(value);
    } else {
      // No image
      setPreviewUrl(null);
    }

    // Cleanup function
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [value, currentImage]);

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      return false;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return false;
    }

    setError("");
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file
    const file = files[0];
    if (!validateFile(file)) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      onChange(file);
    } catch (err) {
      setError("Failed to process image");
      console.error("Error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    if (disabled || readOnly) return;

    // Clear the file
    onChange(null);

    // Revoke blob URL if it exists
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(currentImage || null);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && !disabled && !readOnly) {
      fileInputRef.current.click();
    }
  };

  const displayImage = previewUrl || currentImage;
  const isNewImage = value instanceof File;

  // For read-only mode
  if (readOnly) {
    return (
      <div className="space-y-3 w-full">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {displayImage ? "Image" : "No image"}
        </div>
        {displayImage && (
          <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            <img
              src={displayImage}
              alt="Preview"
              className="w-full h-64 object-contain"
            />
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

      {/* Main Upload/Preview Box */}
      <div
        onClick={triggerFileInput}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 cursor-pointer w-full
          transition-all duration-300 hover:shadow-lg min-h-[300px]
          ${
            disabled || uploading
              ? "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60"
              : errors || error
                ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20 hover:border-red-400 dark:hover:border-red-600"
                : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-600 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80"
          }
        `}
      >
        {displayImage ? (
          // Show image preview
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <img
                src={displayImage}
                alt={isNewImage ? newImageLabel : currentImageLabel}
                className="w-full h-full object-contain"
              />

              {/* Image label */}
              <div className="absolute top-2 left-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    isNewImage
                      ? "bg-blue-500/90 text-white"
                      : "bg-slate-500/90 text-white"
                  }`}
                >
                  {isNewImage ? "New" : "Current"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Upload size={16} />
                Change Image
              </button>

              {value && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <XCircle size={16} />
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          // Show upload prompt
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
              {uploading ? (
                <Loader2
                  size={32}
                  className="animate-spin text-blue-600 dark:text-blue-400"
                />
              ) : (
                <ImageIcon
                  size={32}
                  className="text-blue-600 dark:text-blue-400"
                />
              )}
            </div>
            <div className="text-center">
              <div className="font-medium text-slate-800 dark:text-slate-200">
                {uploading ? "Uploading..." : "Click to upload image"}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Drag & drop or click to upload
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Supported: JPG, PNG, GIF, WEBP • Max: {maxSize / (1024 * 1024)}
                MB
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {(errors || error) && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 w-full">
          <AlertCircle size={16} />
          <span>{error || (errors?.message as string)}</span>
        </div>
      )}

      {/* Helper Text */}
      {!errors && !error && (
        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 w-full">
          <Upload size={14} />
          <span>
            {currentImage
              ? "Click the box to change the current image. Leave empty to keep current image."
              : "Upload an image by clicking above or dragging and dropping"}
          </span>
        </div>
      )}
    </div>
  );
};
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
            fieldSchema = z.preprocess(
              (val) => (val === "" ? undefined : Number(val)),
              z.number().optional(),
            );
            if (field.min !== undefined)
              fieldSchema = (fieldSchema as z.ZodNumber).min(
                Number(field.min),
                `Minimum value is ${field.min}`,
              );
            if (field.max !== undefined)
              fieldSchema = (fieldSchema as z.ZodNumber).max(
                Number(field.max),
                `Maximum value is ${field.max}`,
              );
            break;
          case "date":
          case "datetime":
            fieldSchema = z.string();
            break;
          case "checkbox":
            fieldSchema = z.boolean();
            break;
          case "radio":
            // For radio buttons, handle both string and boolean values
            fieldSchema = z.union([z.string(), z.boolean(), z.number()]);
            break;
          case "multiselect":
            fieldSchema = z.array(z.string());
            break;
          case "file":
          case "image":
            fieldSchema = z.any().optional();
            break;
          case "custom":
          case "paginatedSelect":
            fieldSchema = z.any().optional();
            break;
          default:
            fieldSchema = z.string();
        }

        if (field.required) {
          if (field.type === "checkbox") {
            fieldSchema = (fieldSchema as z.ZodBoolean).refine(
              (val) => val === true,
              "This field is required",
            );
          } else if (field.type === "number") {
            fieldSchema = (fieldSchema as z.ZodNumber).min(
              1,
              `${field.label} is required`,
            );
          } else if (field.type !== "file" && field.type !== "image") {
            if (field.type === "radio") {
              // For radio, we need to check that a value is selected
              fieldSchema = fieldSchema.refine(
                (val) => val !== undefined && val !== null && val !== "",
                `${field.label} is required`,
              );
            } else {
              fieldSchema = (fieldSchema as z.ZodString).min(
                1,
                `${field.label} is required`,
              );
            }
          }
        } else {
          if (field.type === "number") {
            fieldSchema = fieldSchema.optional();
          }
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
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  // Watch all form values
  const formValues = watch();

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        setDataError(null);
        const data = await fetchData(entityId);
        setOriginalData(data);

        // Reset form with fetched data
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

      // Transform data if needed
      const submitData = beforeSubmit ? beforeSubmit(data) : data;

      const response = await onUpdate(entityId, submitData);

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

    // Handle custom render for display-only fields
    if (field.type === "custom" && field.render) {
      return field.render(formValues[field.name], formValues);
    }

    // Handle custom render for input fields
    if (field.renderCustom) {
      const fieldValue = formValues[field.name];
      return field.renderCustom({
        value: fieldValue,
        onChange: (value: any) => {
          console.log("Setting field", field.name, "to", value);
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

    // For read-only text fields with custom rendering
    if (field.readOnly && field.type === "text") {
      return (
        <div className="relative">
          {field.icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {field.icon}
            </div>
          )}
          <div className={`${inputClassName} flex items-center`}>
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
                readOnly={field.readOnly}
                onKeyDown={(e) => {
                  if (preventDefaultSubmit && e.key === "Enter") {
                    e.stopPropagation();
                  }
                }}
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
                  disabled={field.readOnly}
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
                disabled={field.disabled || isSubmitting}
                readOnly={field.readOnly}
                fetchOptions={fetchOptions}
              />
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
                      ${field.disabled || isSubmitting || field.readOnly ? "opacity-50 cursor-not-allowed" : ""}
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
                            }}
                            disabled={
                              field.disabled || isSubmitting || field.readOnly
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

      case "file":
      case "image":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <div style={{ width: field.fullWidth ? "100%" : "auto" }}>
                <ImageInputComponent
                  name={field.name}
                  value={controllerField.value}
                  onChange={(value) => {
                    controllerField.onChange(value);
                  }}
                  disabled={field.disabled || isSubmitting || field.readOnly}
                  readOnly={field.readOnly}
                  config={field.imageUploadConfig}
                  errors={fieldState.error}
                  fullWidth={field.fullWidth}
                  currentImage={originalData?.[field.name]}
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
                  onKeyDown={(e) => {
                    // Prevent form submission on Enter key press
                    if (preventDefaultSubmit && e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                />
                {field.prefix && controllerField.value && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    {field.prefix}
                  </span>
                )}
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
        <form
          onSubmit={(e) => {
            if (preventDefaultSubmit) {
              e.preventDefault();
            }
            handleSubmit(handleFormSubmit)(e);
          }}
          className="p-6"
          onKeyDown={(e) => {
            // Prevent Enter key from submitting form globally
            if (
              preventDefaultSubmit &&
              e.key === "Enter" &&
              e.target instanceof HTMLInputElement
            ) {
              e.preventDefault();
            }
          }}
        >
          <div className="grid grid-cols-12 gap-6">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`col-span-12 ${
                  field.cols ? `md:col-span-${field.cols}` : "md:col-span-6"
                } ${field.className || ""}`}
              >
                {/* Show label for all field types except checkbox and custom */}
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

                {/* Show helper text and error messages if not already handled in renderField */}
                {field.type !== "radio" &&
                  field.helperText &&
                  !errors[field.name] && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {field.helperText}
                    </p>
                  )}

                {/* Show error message if not already handled in renderField */}
                {field.type !== "radio" && errors[field.name] && (
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
